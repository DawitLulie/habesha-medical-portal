<?php

/**
 * PUT /api/v1/users/toggle-status.php
 *
 * Entry point — Activate or deactivate a staff user (soft delete)
 * Restricted to: Admin
 */

require_once __DIR__ . '/../../../../app/middleware/Cors.php';
require_once __DIR__ . '/../../../../config/database.php';
require_once __DIR__ . '/../../../../helpers/Response.php';
require_once __DIR__ . '/../../../../app/middleware/Auth.php';
require_once __DIR__ . '/../../../../app/models/User.php';
require_once __DIR__ . '/../../../../app/controllers/UsersController.php';

Cors::handle();

try {
    $pdo        = Database::getConnection();
    $controller = new UsersController($pdo);
    $controller->toggleStatus();
} catch (\Exception $e) {
    error_log('[HMS] users/toggle-status.php unhandled exception: ' . $e->getMessage());
    Response::serverError();
}
