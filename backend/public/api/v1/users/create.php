<?php

/**
 * POST /api/v1/users/create.php
 *
 * Entry point — Create a new staff user account
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
    $controller->create();
} catch (\Exception $e) {
    error_log('[HMS] users/create.php unhandled exception: ' . $e->getMessage());
    Response::serverError();
}
