<?php

/**
 * app/controllers/UsersController.php
 *
 * Handles all three Admin-only user management endpoints:
 *
 *   GET  /users/list.php          — fetch all staff users
 *   POST /users/create.php        — register a new staff account
 *   PUT  /users/toggle-status.php — activate or deactivate a user
 *
 * Every method calls Auth::require(['Admin']) so only authenticated
 * Admins can reach the logic.  Any other role receives HTTP 403.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../app/middleware/Cors.php';
require_once __DIR__ . '/../../app/middleware/Auth.php';
require_once __DIR__ . '/../../app/models/User.php';

class UsersController
{
    private User $userModel;

    public function __construct(\PDO $pdo)
    {
        $this->userModel = new User($pdo);
    }

    // ---------------------------------------------------------------
    // Allowed role values — used for input validation
    // ---------------------------------------------------------------

    private const ALLOWED_ROLES = ['Admin', 'Receptionist', 'Doctor'];

    // ---------------------------------------------------------------
    // GET /users/list.php
    // ---------------------------------------------------------------

    /**
     * Return all staff user records (password field excluded).
     *
     * Success response (200):
     *   {
     *     "status": "success",
     *     "data": [
     *       { "id": 1, "full_name": "...", "email": "...", "role": "Admin", ... },
     *       ...
     *     ]
     *   }
     */
    public function list(): void
    {
        // --- Method guard ---------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- Authentication + RBAC ------------------------------------
        Auth::require(['Admin']);

        // --- Fetch all users ------------------------------------------
        try {
            $users = $this->userModel->getAll();
        } catch (\Exception $e) {
            error_log('[HMS] UsersController::list error: ' . $e->getMessage());
            Response::serverError();
        }

        Response::success(['data' => $users]);
    }

    // ---------------------------------------------------------------
    // POST /users/create.php
    // ---------------------------------------------------------------

    /**
     * Create a new staff user account.
     *
     * Expected JSON body:
     *   {
     *     "full_name": "Abebe Kebede",
     *     "email":     "abebe@hms.com",
     *     "password":  "secret",
     *     "role":      "Doctor",
     *     "phone":     "0911223344"   (optional)
     *   }
     *
     * Success response (201):
     *   { "status": "success", "message": "User created successfully" }
     */
    public function create(): void
    {
        // --- Method guard ---------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- Authentication + RBAC ------------------------------------
        Auth::require(['Admin']);

        // --- Parse JSON body ------------------------------------------
        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true);

        if (!is_array($body)) {
            Response::badRequest('Invalid JSON payload');
        }

        // --- Extract and sanitise fields ------------------------------
        $fullName = isset($body['full_name']) ? trim(strip_tags($body['full_name'])) : '';
        $email    = isset($body['email'])     ? trim($body['email'])                 : '';
        $password = isset($body['password'])  ? trim($body['password'])              : '';
        $role     = isset($body['role'])      ? trim($body['role'])                  : '';
        $phone    = isset($body['phone'])     ? trim(strip_tags($body['phone']))     : null;

        // Treat an empty phone string as null (column is nullable).
        if ($phone === '') {
            $phone = null;
        }

        // --- Required-field validation --------------------------------
        if ($fullName === '' || $email === '' || $password === '' || $role === '') {
            Response::badRequest('Missing required fields: full_name, email, password, role');
        }

        // --- Field-length validation (matches DB schema) --------------
        if (mb_strlen($fullName) > 100) {
            Response::badRequest('full_name must not exceed 100 characters');
        }

        if (mb_strlen($email) > 100) {
            Response::badRequest('email must not exceed 100 characters');
        }

        // --- Email format validation ----------------------------------
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::badRequest('Invalid email format');
        }

        // --- Role allowlist validation --------------------------------
        if (!in_array($role, self::ALLOWED_ROLES, true)) {
            Response::badRequest('Invalid role. Allowed values: Admin, Receptionist, Doctor');
        }

        // --- Duplicate email check ------------------------------------
        try {
            if ($this->userModel->emailExists($email)) {
                Response::badRequest('Email already exists');
            }

            // --- Hash the password before storing ---------------------
            $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

            // --- Insert the new user ----------------------------------
            $this->userModel->create($fullName, $email, $hashedPassword, $role, $phone);
        } catch (\Exception $e) {
            error_log('[HMS] UsersController::create error: ' . $e->getMessage());
            Response::serverError();
        }

        Response::created(['message' => 'User created successfully']);
    }

    // ---------------------------------------------------------------
    // PUT /users/toggle-status.php
    // ---------------------------------------------------------------

    /**
     * Activate or deactivate a staff user account (soft delete).
     *
     * Expected JSON body:
     *   { "user_id": 2, "is_active": 0 }
     *
     * Success response (200):
     *   { "status": "success", "message": "User status updated" }
     */
    public function toggleStatus(): void
    {
        // --- Method guard ---------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- Authentication + RBAC ------------------------------------
        Auth::require(['Admin']);

        // --- Parse JSON body ------------------------------------------
        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true);

        if (!is_array($body)) {
            Response::badRequest('Invalid JSON payload');
        }

        // --- Extract and validate fields ------------------------------
        $userId   = isset($body['user_id'])   ? (int) $body['user_id']   : 0;
        $isActive = isset($body['is_active']) ? (int) $body['is_active'] : -1;

        if ($userId <= 0) {
            Response::badRequest('Invalid input: user_id must be a positive integer');
        }

        if ($isActive !== 0 && $isActive !== 1) {
            Response::badRequest('Invalid input: is_active must be 0 or 1');
        }

        // --- Confirm the user exists ----------------------------------
        try {
            $user = $this->userModel->findById($userId);

            if ($user === null) {
                Response::notFound('User not found');
            }

            // --- Apply the status change ------------------------------
            $this->userModel->setActiveStatus($userId, $isActive);
        } catch (\Exception $e) {
            error_log('[HMS] UsersController::toggleStatus error: ' . $e->getMessage());
            Response::serverError();
        }

        Response::success(['message' => 'User status updated']);
    }
}
