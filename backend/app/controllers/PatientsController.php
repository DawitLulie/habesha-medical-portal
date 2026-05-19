<?php

/**
 * app/controllers/PatientsController.php
 *
 * Handles all three patient management endpoints:
 *
 *   GET  /patients/list.php     — list or search patient records
 *   GET  /patients/detail.php   — fetch one patient + their medical history
 *   POST /patients/register.php — register a new patient
 *
 * Access is restricted to Receptionist and Doctor roles.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../app/middleware/Cors.php';
require_once __DIR__ . '/../../app/middleware/Auth.php';
require_once __DIR__ . '/../../app/models/Patient.php';
require_once __DIR__ . '/../../app/models/Consultation.php';

class PatientsController
{
    private Patient      $patientModel;
    private Consultation $consultationModel;

    public function __construct(\PDO $pdo)
    {
        $this->patientModel      = new Patient($pdo);
        $this->consultationModel = new Consultation($pdo);
    }

    // ---------------------------------------------------------------
    // Allowed gender values — used for input validation
    // ---------------------------------------------------------------

    private const ALLOWED_GENDERS = ['Male', 'Female', 'Other'];

    // ---------------------------------------------------------------
    // GET /patients/list.php
    // ---------------------------------------------------------------

    /**
     * Return a list of patients, optionally filtered by a search term.
     *
     * Query parameter (optional):
     *   ?search=Sara
     *
     * Without ?search  → returns the 20 most recently registered patients.
     * With    ?search  → returns up to 100 patients matching the term
     *                    against first_name, last_name, or phone.
     *
     * Success response (200):
     *   {
     *     "status": "success",
     *     "data": [ { "id": 1, "first_name": "Sara", ... }, ... ]
     *   }
     */
    public function list(): void
    {
        // --- Method guard ---------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- Authentication + RBAC ------------------------------------
        Auth::require(['Receptionist', 'Doctor']);

        // --- Fetch patients -------------------------------------------
        try {
            $searchTerm = isset($_GET['search']) ? trim($_GET['search']) : '';

            if ($searchTerm === '') {
                $patients = $this->patientModel->getRecent();
            } else {
                $patients = $this->patientModel->search($searchTerm);
            }
        } catch (\Exception $e) {
            error_log('[HMS] PatientsController::list error: ' . $e->getMessage());
            Response::serverError();
        }

        Response::success(['data' => $patients]);
    }

    // ---------------------------------------------------------------
    // GET /patients/detail.php?id=1
    // ---------------------------------------------------------------

    /**
     * Return a single patient record plus their full consultation history.
     *
     * Query parameter (required):
     *   ?id=1
     *
     * Success response (200):
     *   {
     *     "status": "success",
     *     "data": { "id": 1, "first_name": "Sara", ... },
     *     "medical_history": [
     *       {
     *         "consultation_id": 5,
     *         "symptoms":        "Fever",
     *         "diagnosis":       "Flu",
     *         "prescription":    "Paracetamol",
     *         "doctor_name":     "Dr. Abebe",
     *         "consultation_date": "2026-05-10 09:30:00"
     *       },
     *       ...
     *     ]
     *   }
     */
    public function detail(): void
    {
        // --- Method guard ---------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- Authentication + RBAC ------------------------------------
        Auth::require(['Receptionist', 'Doctor']);

        // --- Validate the id query parameter --------------------------
        $patientId = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        if ($patientId <= 0) {
            Response::badRequest('Invalid or missing patient id');
        }

        // --- Fetch patient and history --------------------------------
        try {
            $patient = $this->patientModel->findById($patientId);

            if ($patient === null) {
                Response::notFound('Patient not found');
            }

            $history = $this->consultationModel->getHistoryByPatient($patientId);
        } catch (\Exception $e) {
            error_log('[HMS] PatientsController::detail error: ' . $e->getMessage());
            Response::serverError();
        }

        Response::success([
            'data'           => $patient,
            'medical_history' => $history,
        ]);
    }

    // ---------------------------------------------------------------
    // POST /patients/register.php
    // ---------------------------------------------------------------

    /**
     * Register a new patient and return the generated patient_id.
     *
     * Expected JSON body:
     *   {
     *     "first_name": "Sara",
     *     "last_name":  "Tadesse",
     *     "age":        28,
     *     "gender":     "Female",
     *     "phone":      "0911223344",
     *     "address":    "Addis Ababa"
     *   }
     *
     * Success response (201):
     *   { "status": "success", "patient_id": 45 }
     */
    public function register(): void
    {
        // --- Method guard ---------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- Authentication + RBAC ------------------------------------
        // Only Receptionists register patients; Doctors are read-only.
        Auth::require(['Receptionist']);

        // --- Parse JSON body ------------------------------------------
        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true);

        if (!is_array($body)) {
            Response::badRequest('Invalid JSON payload');
        }

        // --- Extract and sanitise fields ------------------------------
        $firstName = isset($body['first_name']) ? trim(strip_tags($body['first_name'])) : '';
        $lastName  = isset($body['last_name'])  ? trim(strip_tags($body['last_name']))  : '';
        $age       = isset($body['age'])        ? (int) $body['age']                    : 0;
        $gender    = isset($body['gender'])     ? trim($body['gender'])                 : '';
        $phone     = isset($body['phone'])      ? trim(strip_tags($body['phone']))      : '';
        $address   = isset($body['address'])    ? trim(strip_tags($body['address']))    : '';

        // --- Required-field presence check ----------------------------
        if ($firstName === '' || $lastName === '' || $gender === '' || $phone === '' || $address === '') {
            Response::badRequest('Missing or invalid required fields');
        }

        // --- Age validation -------------------------------------------
        if ($age <= 0) {
            Response::badRequest('Missing or invalid required fields');
        }

        // --- Field-length validation (matches DB schema) --------------
        if (mb_strlen($firstName) > 50) {
            Response::badRequest('first_name must not exceed 50 characters');
        }

        if (mb_strlen($lastName) > 50) {
            Response::badRequest('last_name must not exceed 50 characters');
        }

        if (mb_strlen($phone) > 20) {
            Response::badRequest('phone must not exceed 20 characters');
        }

        // --- Gender allowlist validation ------------------------------
        if (!in_array($gender, self::ALLOWED_GENDERS, true)) {
            Response::badRequest('Invalid gender. Allowed values: Male, Female, Other');
        }

        // --- Insert the patient ---------------------------------------
        try {
            $patientId = $this->patientModel->create(
                $firstName,
                $lastName,
                $age,
                $gender,
                $phone,
                $address
            );
        } catch (\Exception $e) {
            error_log('[HMS] PatientsController::register error: ' . $e->getMessage());
            Response::serverError();
        }

        Response::created(['patient_id' => $patientId]);
    }
}
