<?php

/**
 * POST /api/v1/patients/register.php
 *
 * Entry point — Register a new patient
 * Restricted to: Receptionist
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
    $controller->register();
} catch (\Exception $e) {
    error_log('[HMS] patients/register.php unhandled exception: ' . $e->getMessage());
    Response::serverError();
}
