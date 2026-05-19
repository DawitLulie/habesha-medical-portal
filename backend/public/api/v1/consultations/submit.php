<?php

/**
 * POST /api/v1/consultations/submit.php
 *
 * Entry point — Submit a consultation record and complete the appointment
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
    $controller->submit();
} catch (\Exception $e) {
    error_log('[HMS] consultations/submit.php unhandled exception: ' . $e->getMessage());
    Response::serverError();
}
