<?php

/**
 * GET /api/v1/consultations/history.php?patient_id=1
 *
 * Entry point — Retrieve a patient's full consultation history
 * Restricted to: Doctor
 */

require_once __DIR__ . '/../../../../app/middleware/Cors.php';
require_once __DIR__ . '/../../../../config/database.php';
require_once __DIR__ . '/../../../../helpers/Response.php';
require_once __DIR__ . '/../../../../app/middleware/Auth.php';
require_once __DIR__ . '/../../../../app/models/Consultation.php';
require_once __DIR__ . '/../../../../app/models/Appointment.php';
require_once __DIR__ . '/../../../../app/controllers/ConsultationsController.php';

Cors::handle();

try {
    $pdo        = Database::getConnection();
    $controller = new ConsultationsController($pdo);
    $controller->history();
} catch (\Exception $e) {
    error_log('[HMS] consultations/history.php unhandled exception: ' . $e->getMessage());
    Response::serverError();
}
