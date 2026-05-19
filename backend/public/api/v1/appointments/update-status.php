<?php

/**
 * PUT /api/v1/appointments/update-status.php
 *
 * Entry point — Update the status of an appointment
 * Restricted to: Doctor, Receptionist
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
    $controller->updateStatus();
} catch (\Exception $e) {
    error_log('[HMS] appointments/update-status.php unhandled exception: ' . $e->getMessage());
    Response::serverError();
}
