<?php

/**
 * GET /api/v1/users/list.php
 *
 * Entry point — List all staff users
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
    $controller->list();
} catch (\Exception $e) {
    error_log('[HMS] users/list.php unhandled exception: ' . $e->getMessage());
    Response::serverError();
}
