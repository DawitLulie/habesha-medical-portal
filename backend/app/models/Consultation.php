<?php

/**
 * app/models/Consultation.php
 *
 * Data-access layer for the `consultations` table.
 *
 * Responsibilities
 * ----------------
 * - Submit a new consultation record and atomically mark the linked
 *   appointment as Completed, all within a single transaction.
 * - Retrieve the full consultation history for a patient, joined with
 *   the attending doctor's name.
 * - Check whether a consultation already exists for an appointment
 *   (enforces the one-to-one constraint at the application layer
 *   before the database UNIQUE constraint fires).
 *
 * Transaction design
 * ------------------
 * submit() opens a transaction, inserts the consultation row, then
 * updates the appointment status to 'Completed'.  If either statement
 * fails the entire transaction is rolled back, leaving both tables in
 * their original state.  This guarantees that a consultation record
 * can never exist without its appointment being marked Completed, and
 * vice-versa.
 *
 * Constructor
 * -----------
 *   $consultationModel = new Consultation($pdo);
 */

class Consultation
{
    private \PDO $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // ---------------------------------------------------------------
    // Existence check
    // ---------------------------------------------------------------

    /**
     * Return true when a consultation record already exists for the
     * given appointment id.
     *
     * Called before submit() so the controller can return a clean 400
     * error instead of letting the UNIQUE constraint on
     * consultations.appointment_id throw a PDOException.
     *
     * @param  int $appointmentId
     * @return bool
     */
    public function existsForAppointment(int $appointmentId): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) AS cnt
             FROM   consultations
             WHERE  appointment_id = :appointment_id'
        );
        $stmt->bindValue(':appointment_id', $appointmentId, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();

        return (int) $row['cnt'] > 0;
    }

    // ---------------------------------------------------------------
    // Submit consultation (transactional)
    // ---------------------------------------------------------------

    /**
     * Insert a consultation record and mark the appointment Completed.
     *
     * Both operations are wrapped in a single InnoDB transaction.
     * If the INSERT succeeds but the UPDATE fails (or vice-versa) the
     * transaction is rolled back so neither change persists.
     *
     * @param  int         $appointmentId  The appointment being concluded.
     * @param  int         $patientId      The patient being treated.
     * @param  string      $symptoms       Doctor-recorded symptoms.
     * @param  string      $diagnosis      Doctor's diagnosis.
     * @param  string      $prescription   Prescribed medication / treatment.
     * @param  string|null $notes          Optional additional notes.
     * @return int                         The new consultation's id.
     * @throws RuntimeException            On transaction failure.
     */
    public function submit(
        int     $appointmentId,
        int     $patientId,
        string  $symptoms,
        string  $diagnosis,
        string  $prescription,
        ?string $notes = null
    ): int {
        $this->pdo->beginTransaction();

        try {
            // --- Step 1: Insert the consultation record -----------------
            $insertStmt = $this->pdo->prepare(
                'INSERT INTO consultations
                             (appointment_id, patient_id, symptoms, diagnosis, prescription, notes)
                 VALUES      (:appointment_id, :patient_id, :symptoms, :diagnosis, :prescription, :notes)'
            );
            $insertStmt->bindValue(':appointment_id', $appointmentId, PDO::PARAM_INT);
            $insertStmt->bindValue(':patient_id',     $patientId,     PDO::PARAM_INT);
            $insertStmt->bindValue(':symptoms',       $symptoms,      PDO::PARAM_STR);
            $insertStmt->bindValue(':diagnosis',      $diagnosis,     PDO::PARAM_STR);
            $insertStmt->bindValue(':prescription',   $prescription,  PDO::PARAM_STR);
            $insertStmt->bindValue(
                ':notes',
                $notes,
                $notes !== null ? PDO::PARAM_STR : PDO::PARAM_NULL
            );
            $insertStmt->execute();

            $consultationId = (int) $this->pdo->lastInsertId();

            // --- Step 2: Mark the appointment as Completed --------------
            // This is the final step in the appointment lifecycle:
            // Scheduled → In-Consultation → Completed.
            $updateStmt = $this->pdo->prepare(
                'UPDATE appointments
                 SET    status = \'Completed\'
                 WHERE  id     = :appointment_id'
            );
            $updateStmt->bindValue(':appointment_id', $appointmentId, PDO::PARAM_INT);
            $updateStmt->execute();

            // --- Step 3: Commit both changes ----------------------------
            $this->pdo->commit();

            return $consultationId;
        } catch (\Exception $e) {
            // Roll back so neither the consultation row nor the status
            // change persists if anything goes wrong.
            $this->pdo->rollBack();
            error_log('[HMS] Consultation::submit transaction failed: ' . $e->getMessage());
            throw new \RuntimeException('Failed to submit consultation.');
        }
    }

    // ---------------------------------------------------------------
    // Patient medical history
    // ---------------------------------------------------------------

    /**
     * Return all consultation records for a patient, most recent first.
     *
     * The query joins appointments and users so each history entry
     * includes the attending doctor's id and full name — the frontend
     * can display "Seen by Dr. Abebe Kebede" without a second request.
     *
     * Returns an empty array when the patient has no consultation
     * history (not a 404 — the patient exists, they just have no
     * records yet).
     *
     * @param  int $patientId
     * @return array<int, array<string, mixed>>
     */
    public function getHistoryByPatient(int $patientId): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT c.id            AS consultation_id,
                    c.appointment_id,
                    c.patient_id,
                    c.symptoms,
                    c.diagnosis,
                    c.prescription,
                    c.notes,
                    c.consultation_date,
                    u.id            AS doctor_id,
                    u.full_name     AS doctor_name
             FROM   consultations c
             JOIN   appointments  a ON c.appointment_id = a.id
             JOIN   users         u ON a.doctor_id      = u.id
             WHERE  c.patient_id = :patient_id
             ORDER  BY c.consultation_date DESC'
        );
        $stmt->bindValue(':patient_id', $patientId, PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->fetchAll();
    }
}
