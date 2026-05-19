<?php

/**
 * POST /api/v1/auth/login.php
 *
 * Entry point — Authentication
 * No Auth::require() here; this endpoint issues tokens.
 */

require_once __DIR__ . '/../../../../app/middleware/Cors.php';
require_once __DIR__ . '/../../../../config/database.php';
require_once __DIR__ . '/../../../../helpers/Response.php';
require_once __DIR__ . '/../../../../app/middleware/Auth.php';
require_once __DIR__ . '/../../../../app/models/User.php';
require_once __DIR__ . '/../../../../app/controllers/AuthController.php';

Cors::handle();

try {
    $pdo        = Database::getConnection();
    $controller = new AuthController($pdo);
    $controller->login();
} catch (\Exception $e) {
    error_log('[HMS] login.php unhandled exception: ' . $e->getMessage());
    Response::serverError();
}
