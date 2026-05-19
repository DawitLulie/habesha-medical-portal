<?php

/**
 * app/models/Appointment.php
 *
 * Data-access layer for the `appointments` table.
 *
 * Responsibilities
 * ----------------
 * - Book a new appointment with an atomically generated queue number.
 * - Return the active daily queue for a given doctor.
 * - Fetch a single appointment by id.
 * - Update an appointment's status.
 *
 * Atomic queue generation
 * -----------------------
 * Two concurrent receptionists booking the same doctor on the same day
 * must never receive the same queue number.  To prevent this, the
 * book() method wraps the SELECT MAX + INSERT sequence inside a
 * database transaction and locks the relevant rows with SELECT ... FOR
 * UPDATE.  MySQL holds the lock until the transaction commits, so any
 * concurrent booking for the same doctor/date blocks until the first
 * transaction completes and then reads the updated MAX.
 *
 * Constructor
 * -----------
 *   $appointmentModel = new Appointment($pdo);
 */

class Appointment
{
    private \PDO $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // ---------------------------------------------------------------
    // Booking — atomic queue number generation
    // ---------------------------------------------------------------

    /**
     * Book a new appointment and return its id, queue number, and status.
     *
     * The queue number is the next sequential integer for the given
     * doctor on the given date.  The computation and the INSERT are
     * wrapped in a single InnoDB transaction with a FOR UPDATE lock so
     * concurrent bookings cannot produce duplicate queue numbers.
     *
     * @param  int    $patientId        Validated patient id.
     * @param  int    $doctorId         Validated active-doctor user id.
     * @param  string $appointmentDate  Date string in YYYY-MM-DD format.
     * @return array{
     *           appointment_id:     int,
     *           queue_number:       int,
     *           appointment_status: string
     *         }
     * @throws RuntimeException on transaction failure.
     */
    public function book(int $patientId, int $doctorId, string $appointmentDate): array
    {
        $this->pdo->beginTransaction();

        try {
            // --- Step 1: Lock existing rows for this doctor/date --------
            // FOR UPDATE acquires a row-level lock on all matching rows.
            // If no rows exist yet, InnoDB uses a gap lock on the index
            // range, which still blocks concurrent inserts for the same
            // doctor/date until this transaction commits.
            $lockStmt = $this->pdo->prepare(
                'SELECT id
                 FROM   appointments
                 WHERE  doctor_id        = :doctor_id
                 AND    appointment_date = :appointment_date
                 FOR    UPDATE'
            );
            $lockStmt->bindValue(':doctor_id',        $doctorId,        PDO::PARAM_INT);
            $lockStmt->bindValue(':appointment_date', $appointmentDate, PDO::PARAM_STR);
            $lockStmt->execute();

            // --- Step 2: Compute the next queue number ------------------
            // COALESCE(MAX(queue_number), 0) + 1 returns 1 when no
            // appointments exist yet for this doctor/date, and increments
            // from the current maximum otherwise.
            $queueStmt = $this->pdo->prepare(
                'SELECT COALESCE(MAX(queue_number), 0) + 1 AS next_queue
                 FROM   appointments
                 WHERE  doctor_id        = :doctor_id
                 AND    appointment_date = :appointment_date'
            );
            $queueStmt->bindValue(':doctor_id',        $doctorId,        PDO::PARAM_INT);
            $queueStmt->bindValue(':appointment_date', $appointmentDate, PDO::PARAM_STR);
            $queueStmt->execute();

            $queueRow   = $queueStmt->fetch();
            $queueNumber = (int) $queueRow['next_queue'];

            // --- Step 3: Insert the new appointment ---------------------
            $insertStmt = $this->pdo->prepare(
                'INSERT INTO appointments
                             (patient_id, doctor_id, appointment_date, queue_number, status)
                 VALUES      (:patient_id, :doctor_id, :appointment_date, :queue_number, \'Scheduled\')'
            );
            $insertStmt->bindValue(':patient_id',       $patientId,       PDO::PARAM_INT);
            $insertStmt->bindValue(':doctor_id',        $doctorId,        PDO::PARAM_INT);
            $insertStmt->bindValue(':appointment_date', $appointmentDate, PDO::PARAM_STR);
            $insertStmt->bindValue(':queue_number',     $queueNumber,     PDO::PARAM_INT);
            $insertStmt->execute();

            $appointmentId = (int) $this->pdo->lastInsertId();

            // --- Step 4: Commit -----------------------------------------
            $this->pdo->commit();

            return [
                'appointment_id'     => $appointmentId,
                'queue_number'       => $queueNumber,
                'appointment_status' => 'Scheduled',
            ];
        } catch (\Exception $e) {
            // Roll back the transaction so no partial data is written.
            $this->pdo->rollBack();
            error_log('[HMS] Appointment::book transaction failed: ' . $e->getMessage());
            throw new \RuntimeException('Failed to book appointment.');
        }
    }

    // ---------------------------------------------------------------
    // Queue view
    // ---------------------------------------------------------------

    /**
     * Return the active queue for a doctor on today's date.
     *
     * Only appointments with status 'Scheduled' or 'In-Consultation'
     * are included — completed and cancelled appointments are excluded
     * so the queue only shows patients still waiting or being seen.
     *
     * The result set joins the patients table so the frontend receives
     * patient demographic data alongside the queue position in a single
     * request.
     *
     * @param  int $doctorId
     * @return array<int, array<string, mixed>>
     */
    public function getDailyQueue(int $doctorId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT a.id           AS appointment_id,
                    a.patient_id,
                    a.doctor_id,
                    a.appointment_date,
                    a.queue_number,
                    a.status       AS appointment_status,
                    p.first_name,
                    p.last_name,
                    p.age,
                    p.gender,
                    p.phone
             FROM   appointments a
             JOIN   patients     p ON a.patient_id = p.id
             WHERE  a.doctor_id        = :doctor_id
             AND    a.appointment_date = CURDATE()
             AND    a.status           IN (\'Scheduled\', \'In-Consultation\')
             ORDER  BY a.queue_number ASC'
        );
        $stmt->bindValue(':doctor_id', $doctorId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    // ---------------------------------------------------------------
    // Single record
    // ---------------------------------------------------------------

    /**
     * Fetch a single appointment row by primary key.
     *
     * Returns null when no record with that id exists.
     * Used by the status-update and consultation-submit endpoints to
     * verify the appointment exists before acting on it.
     *
     * @param  int $appointmentId
     * @return array<string, mixed>|null
     */
    public function findById(int $appointmentId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id,
                    patient_id,
                    doctor_id,
                    appointment_date,
                    queue_number,
                    status,
                    created_at
             FROM   appointments
             WHERE  id = :id
             LIMIT  1'
        );
        $stmt->bindValue(':id', $appointmentId, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }

    // ---------------------------------------------------------------
    // Status update
    // ---------------------------------------------------------------

    /**
     * Update the status of an appointment.
     *
     * The controller is responsible for validating that $status is one
     * of the four allowed ENUM values before calling this method.
     *
     * @param  int    $appointmentId
     * @param  string $status  One of: Scheduled, In-Consultation, Completed, Cancelled.
     * @return bool            True when exactly one row was updated.
     */
    public function updateStatus(int $appointmentId, string $status): bool
    {
        $stmt = $this->pdo->prepare(
            'UPDATE appointments
             SET    status = :status
             WHERE  id     = :id'
        );
        $stmt->bindValue(':status', $status,        PDO::PARAM_STR);
        $stmt->bindValue(':id',     $appointmentId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() === 1;
    }
}
