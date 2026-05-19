<?php

/**
 * GET /api/v1/patients/detail.php?id=1
 *
 * Entry point — Fetch a single patient record and their medical history
 * Restricted to: Receptionist, Doctor
 */

require_once __DIR__ . '/../../../../app/middleware/Cors.php';
require_once __DIR__ . '/../../../../config/database.php';
require_once __DIR__ . '/../../../../helpers/Response.php';
require_once __DIR__ . '/../../../../app/middleware/Auth.php';
require_once __DIR__ . '/../../../../app/models/Patient.php';
require_once __DIR__ . '/../../../../app/models/Consultation.php';
require_once __DIR__ . '/../../../../app/controllers/PatientsController.php';

Cors::handle();

try {
    $pdo        = Database::getConnection();
    $controller = new PatientsController($pdo);
    $controller->detail();
} catch (\Exception $e) {
    error_log('[HMS] patients/detail.php unhandled exception: ' . $e->getMessage());
    Response::serverError();
}
