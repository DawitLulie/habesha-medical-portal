<?php

/**
 * POST /api/v1/appointments/book.php
 *
 * Entry point — Book an appointment and generate a queue number
 * Restricted to: Receptionist
 */

require_once __DIR__ . '/../../../../app/middleware/Cors.php';
require_once __DIR__ . '/../../../../config/database.php';
require_once __DIR__ . '/../../../../helpers/Response.php';
require_once __DIR__ . '/../../../../app/middleware/Auth.php';
require_once __DIR__ . '/../../../../app/models/Appointment.php';
require_once __DIR__ . '/../../../../app/models/Patient.php';
require_once __DIR__ . '/../../../../app/models/User.php';
require_once __DIR__ . '/../../../../app/controllers/AppointmentsController.php';

Cors::handle();

try {
    $pdo        = Database::getConnection();
    $controller = new AppointmentsController($pdo);
    $controller->book();
} catch (\Exception $e) {
    error_log('[HMS] appointments/book.php unhandled exception: ' . $e->getMessage());
    Response::serverError();
}
