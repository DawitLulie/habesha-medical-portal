<?php

/**
 * app/controllers/ConsultationsController.php
 *
 * Handles both consultation endpoints:
 *
 *   POST /consultations/submit.php  — record a consultation, complete appointment
 *   GET  /consultations/history.php — retrieve a patient's full clinical history
 *
 * Both endpoints are restricted to the Doctor role.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../app/middleware/Cors.php';
require_once __DIR__ . '/../../app/middleware/Auth.php';
require_once __DIR__ . '/../../app/models/Consultation.php';
require_once __DIR__ . '/../../app/models/Appointment.php';

class ConsultationsController
{
    private Consultation $consultationModel;
    private Appointment  $appointmentModel;

    public function __construct(\PDO $pdo)
    {
        $this->consultationModel = new Consultation($pdo);
        $this->appointmentModel  = new Appointment($pdo);
    }

    // ---------------------------------------------------------------
    // POST /consultations/submit.php
    // ---------------------------------------------------------------

    /**
     * Submit a consultation record and atomically mark the appointment
     * as Completed.
     *
     * Expected JSON body:
     *   {
     *     "appointment_id": 10,
     *     "patient_id":     1,
     *     "symptoms":       "Fever, cough",
     *     "diagnosis":      "Flu",
     *     "prescription":   "Paracetamol 500mg",
     *     "notes":          "Rest for 3 days"   (optional)
     *   }
     *
     * Success response (201):
     *   { "status": "success", "consultation_id": 25 }
     *
     * Business rules enforced here:
     *   - The appointment must exist.
     *   - The appointment must not already be Completed or Cancelled.
     *   - The patient_id in the body must match the appointment's patient_id.
     *   - The authenticated Doctor must be the doctor assigned to the appointment.
     *   - A consultation must not already exist for this appointment.
     */
    public function submit(): void
    {
        // --- Method guard ---------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- Authentication + RBAC ------------------------------------
        $authUser = Auth::require(['Doctor']);

        // --- Parse JSON body ------------------------------------------
        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true);

        if (!is_array($body)) {
            Response::badRequest('Invalid JSON payload');
        }

        // --- Extract and sanitise fields ------------------------------
        $appointmentId = isset($body['appointment_id']) ? (int) $body['appointment_id']              : 0;
        $patientId     = isset($body['patient_id'])     ? (int) $body['patient_id']                  : 0;
        $symptoms      = isset($body['symptoms'])       ? trim(strip_tags($body['symptoms']))         : '';
        $diagnosis     = isset($body['diagnosis'])      ? trim(strip_tags($body['diagnosis']))        : '';
        $prescription  = isset($body['prescription'])   ? trim(strip_tags($body['prescription']))     : '';
        $notes         = isset($body['notes'])          ? trim(strip_tags($body['notes']))            : null;

        // Treat an empty notes string as null (column is nullable).
        if ($notes === '') {
            $notes = null;
        }

        // --- Required-field presence and whitespace check -------------
        if ($appointmentId <= 0 || $patientId <= 0) {
            Response::badRequest('Missing or invalid required fields');
        }

        if ($symptoms === '' || $diagnosis === '' || $prescription === '') {
            Response::badRequest('Missing or invalid required fields');
        }

        // --- Business rule validations --------------------------------
        try {
            // 1. Appointment must exist.
            $appointment = $this->appointmentModel->findById($appointmentId);

            if ($appointment === null) {
                Response::notFound('Appointment not found');
            }

            // 2. Appointment must not already be closed.
            if ($appointment['status'] === 'Completed' || $appointment['status'] === 'Cancelled') {
                Response::badRequest(
                    'Cannot submit consultation for a ' . $appointment['status'] . ' appointment'
                );
            }

            // 3. Patient id in the request must match the appointment.
            if ((int) $appointment['patient_id'] !== $patientId) {
                Response::badRequest('Patient ID does not match appointment');
            }

            // 4. The authenticated doctor must own this appointment.
            if ((int) $appointment['doctor_id'] !== (int) $authUser['id']) {
                Response::forbidden('Forbidden: appointment not assigned to you');
            }

            // 5. A consultation must not already exist for this appointment.
            if ($this->consultationModel->existsForAppointment($appointmentId)) {
                Response::badRequest('Consultation already exists for this appointment');
            }

            // --- Delegate to the model (transactional) ----------------
            $consultationId = $this->consultationModel->submit(
                $appointmentId,
                $patientId,
                $symptoms,
                $diagnosis,
                $prescription,
                $notes
            );
        } catch (\RuntimeException $e) {
            // RuntimeException is thrown by Consultation::submit() when
            // the transaction fails — map it to a 500 response.
            error_log('[HMS] ConsultationsController::submit error: ' . $e->getMessage());
            Response::serverError();
        } catch (\Exception $e) {
            error_log('[HMS] ConsultationsController::submit unexpected error: ' . $e->getMessage());
            Response::serverError();
        }

        Response::created(['consultation_id' => $consultationId]);
    }

    // ---------------------------------------------------------------
    // GET /consultations/history.php?patient_id=1
    // ---------------------------------------------------------------

    /**
     * Return the full consultation history for a patient.
     *
     * Each entry includes the attending doctor's name so the frontend
     * can display "Seen by Dr. Abebe Kebede" without a second request.
     *
     * Query parameter (required):
     *   ?patient_id=1
     *
     * Success response (200):
     *   {
     *     "status": "success",
     *     "data": [
     *       {
     *         "consultation_id":   5,
     *         "appointment_id":    10,
     *         "patient_id":        1,
     *         "symptoms":          "Fever, cough",
     *         "diagnosis":         "Flu",
     *         "prescription":      "Paracetamol 500mg",
     *         "notes":             "Rest for 3 days",
     *         "consultation_date": "2026-05-10 09:30:00",
     *         "doctor_id":         2,
     *         "doctor_name":       "Dr. Abebe Kebede"
     *       },
     *       ...
     *     ]
     *   }
     *
     * An empty data array is returned (not 404) when the patient has
     * no consultation history yet.
     */
    public function history(): void
    {
        // --- Method guard ---------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- Authentication + RBAC ------------------------------------
        Auth::require(['Doctor']);

        // --- Validate query parameter ---------------------------------
        $patientId = isset($_GET['patient_id']) ? (int) $_GET['patient_id'] : 0;

        if ($patientId <= 0) {
            Response::badRequest('Missing or invalid patient_id');
        }

        // --- Fetch history --------------------------------------------
        try {
            $history = $this->consultationModel->getHistoryByPatient($patientId);
        } catch (\Exception $e) {
            error_log('[HMS] ConsultationsController::history error: ' . $e->getMessage());
            Response::serverError();
        }

        Response::success(['data' => $history]);
    }
}
