<?php

/**
 * app/controllers/AppointmentsController.php
 *
 * Handles all three appointment endpoints:
 *
 *   POST /appointments/book.php          — book an appointment (atomic queue)
 *   GET  /appointments/queue.php         — fetch a doctor's live daily queue
 *   PUT  /appointments/update-status.php — advance or cancel an appointment
 *
 * Role access:
 *   book()         → Receptionist only
 *   queue()        → Doctor, Receptionist
 *   updateStatus() → Doctor, Receptionist
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../app/middleware/Cors.php';
require_once __DIR__ . '/../../app/middleware/Auth.php';
require_once __DIR__ . '/../../app/models/Appointment.php';
require_once __DIR__ . '/../../app/models/Patient.php';
require_once __DIR__ . '/../../app/models/User.php';

class AppointmentsController
{
    private Appointment $appointmentModel;
    private Patient     $patientModel;
    private User        $userModel;

    public function __construct(\PDO $pdo)
    {
        $this->appointmentModel = new Appointment($pdo);
        $this->patientModel     = new Patient($pdo);
        $this->userModel        = new User($pdo);
    }

    // ---------------------------------------------------------------
    // Allowed status values — used for input validation
    // ---------------------------------------------------------------

    private const ALLOWED_STATUSES = ['Scheduled', 'In-Consultation', 'Completed', 'Cancelled'];

    // ---------------------------------------------------------------
    // POST /appointments/book.php
    // ---------------------------------------------------------------

    /**
     * Book a new appointment and return the generated queue number.
     *
     * Expected JSON body:
     *   {
     *     "patient_id":       1,
     *     "doctor_id":        2,
     *     "appointment_date": "2026-05-20"
     *   }
     *
     * Success response (201):
     *   {
     *     "status":             "success",
     *     "appointment_id":     10,
     *     "queue_number":       5,
     *     "appointment_status": "Scheduled"
     *   }
     */
    public function book(): void
    {
        // --- Method guard ---------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- Authentication + RBAC ------------------------------------
        Auth::require(['Receptionist']);

        // --- Parse JSON body ------------------------------------------
        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true);

        if (!is_array($body)) {
            Response::badRequest('Invalid JSON payload');
        }

        // --- Extract and cast fields ----------------------------------
        $patientId       = isset($body['patient_id'])       ? (int) $body['patient_id']             : 0;
        $doctorId        = isset($body['doctor_id'])        ? (int) $body['doctor_id']              : 0;
        $appointmentDate = isset($body['appointment_date']) ? trim($body['appointment_date'])        : '';

        // --- Presence and type validation -----------------------------
        if ($patientId <= 0 || $doctorId <= 0 || $appointmentDate === '') {
            Response::badRequest('Missing or invalid required fields');
        }

        // --- Date format validation (must be YYYY-MM-DD) --------------
        $dateObj = \DateTime::createFromFormat('Y-m-d', $appointmentDate);

        if ($dateObj === false || $dateObj->format('Y-m-d') !== $appointmentDate) {
            Response::badRequest('Invalid appointment_date format, expected YYYY-MM-DD');
        }

        // --- Business rule: patient must exist ------------------------
        try {
            if (!$this->patientModel->exists($patientId)) {
                Response::notFound('Patient not found');
            }

            // --- Business rule: doctor must be active -----------------
            if (!$this->userModel->isActiveDoctor($doctorId)) {
                Response::notFound('Doctor not found or inactive');
            }

            // --- Delegate booking to the model (atomic transaction) ---
            $result = $this->appointmentModel->book($patientId, $doctorId, $appointmentDate);
        } catch (\RuntimeException $e) {
            // RuntimeException is thrown by Appointment::book() when the
            // transaction fails — map it to a 500 response.
            error_log('[HMS] AppointmentsController::book error: ' . $e->getMessage());
            Response::serverError();
        } catch (\Exception $e) {
            error_log('[HMS] AppointmentsController::book unexpected error: ' . $e->getMessage());
            Response::serverError();
        }

        Response::created([
            'appointment_id'     => $result['appointment_id'],
            'queue_number'       => $result['queue_number'],
            'appointment_status' => $result['appointment_status'],
        ]);
    }

    // ---------------------------------------------------------------
    // GET /appointments/queue.php?doctor_id=2
    // ---------------------------------------------------------------

    /**
     * Return the active queue for a doctor on today's date.
     *
     * Only appointments with status 'Scheduled' or 'In-Consultation'
     * are included.  Results are ordered by queue_number ascending.
     *
     * Query parameter (required):
     *   ?doctor_id=2
     *
     * Success response (200):
     *   {
     *     "status": "success",
     *     "data": [
     *       {
     *         "appointment_id":     3,
     *         "patient_id":         1,
     *         "doctor_id":          2,
     *         "appointment_date":   "2026-05-20",
     *         "queue_number":       1,
     *         "appointment_status": "Scheduled",
     *         "first_name":         "Sara",
     *         "last_name":          "Tadesse",
     *         "age":                28,
     *         "gender":             "Female",
     *         "phone":              "0911223344"
     *       },
     *       ...
     *     ]
     *   }
     */
    public function queue(): void
    {
        // --- Method guard ---------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- Authentication + RBAC ------------------------------------
        Auth::require(['Doctor', 'Receptionist']);

        // --- Validate query parameter ---------------------------------
        $doctorId = isset($_GET['doctor_id']) ? (int) $_GET['doctor_id'] : 0;

        if ($doctorId <= 0) {
            Response::badRequest('Missing or invalid doctor_id');
        }

        // --- Fetch the queue ------------------------------------------
        try {
            $queue = $this->appointmentModel->getDailyQueue($doctorId);
        } catch (\Exception $e) {
            error_log('[HMS] AppointmentsController::queue error: ' . $e->getMessage());
            Response::serverError();
        }

        // An empty queue is a valid state — return 200 with an empty array.
        Response::success(['data' => $queue]);
    }

    // ---------------------------------------------------------------
    // PUT /appointments/update-status.php
    // ---------------------------------------------------------------

    /**
     * Update the status of an existing appointment.
     *
     * Expected JSON body:
     *   { "appointment_id": 10, "status": "In-Consultation" }
     *
     * Allowed status values: Scheduled, In-Consultation, Completed, Cancelled
     *
     * Success response (200):
     *   { "status": "success", "message": "Appointment updated" }
     */
    public function updateStatus(): void
    {
        // --- Method guard ---------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- Authentication + RBAC ------------------------------------
        Auth::require(['Doctor', 'Receptionist']);

        // --- Parse JSON body ------------------------------------------
        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true);

        if (!is_array($body)) {
            Response::badRequest('Invalid JSON payload');
        }

        // --- Extract and validate fields ------------------------------
        $appointmentId = isset($body['appointment_id']) ? (int) $body['appointment_id'] : 0;
        $status        = isset($body['status'])         ? trim($body['status'])          : '';

        if ($appointmentId <= 0) {
            Response::badRequest('Missing required fields');
        }

        if ($status === '') {
            Response::badRequest('Missing required fields');
        }

        // --- Status allowlist validation ------------------------------
        if (!in_array($status, self::ALLOWED_STATUSES, true)) {
            Response::badRequest(
                'Invalid status value. Allowed: Scheduled, In-Consultation, Completed, Cancelled'
            );
        }

        // --- Confirm the appointment exists ---------------------------
        try {
            $appointment = $this->appointmentModel->findById($appointmentId);

            if ($appointment === null) {
                Response::notFound('Appointment not found');
            }

            // --- Apply the status update ------------------------------
            $this->appointmentModel->updateStatus($appointmentId, $status);
        } catch (\Exception $e) {
            error_log('[HMS] AppointmentsController::updateStatus error: ' . $e->getMessage());
            Response::serverError();
        }

        Response::success(['message' => 'Appointment updated']);
    }
}
