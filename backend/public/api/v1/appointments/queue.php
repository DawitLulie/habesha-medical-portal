<?php

/**
 * GET /api/v1/appointments/queue.php?doctor_id=2
 *
 * Entry point — Fetch a doctor's active queue for today
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
    $controller->queue();
} catch (\Exception $e) {
    error_log('[HMS] appointments/queue.php unhandled exception: ' . $e->getMessage());
    Response::serverError();
}
