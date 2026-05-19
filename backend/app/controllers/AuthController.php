<?php

/**
 * app/controllers/AuthController.php
 *
 * Handles POST /auth/login.php
 *
 * Flow
 * ----
 * 1. Reject any non-POST request immediately.
 * 2. Parse and validate the JSON request body.
 * 3. Look up the user by email via the User model.
 * 4. Verify the plain-text password against the stored bcrypt hash.
 * 5. Confirm the account is active.
 * 6. Mint a Base64-encoded token via Auth::generateToken().
 * 7. Return the token and a safe user object to the client.
 *
 * This is the only endpoint that does NOT call Auth::require() because
 * it is the endpoint that issues tokens in the first place.
 */

require_once __DIR__ . '/../../config/database.php';
require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../app/middleware/Cors.php';
require_once __DIR__ . '/../../app/middleware/Auth.php';
require_once __DIR__ . '/../../app/models/User.php';

class AuthController
{
    private User $userModel;

    public function __construct(\PDO $pdo)
    {
        $this->userModel = new User($pdo);
    }

    // ---------------------------------------------------------------
    // POST /auth/login.php
    // ---------------------------------------------------------------

    /**
     * Authenticate a staff member and return a Bearer token.
     *
     * Expected JSON body:
     *   { "email": "doctor@hms.com", "password": "secret" }
     *
     * Success response (200):
     *   {
     *     "status": "success",
     *     "token":  "<base64-token>",
     *     "user":   { "id": 1, "name": "Dr. John", "role": "Doctor" }
     *   }
     */
    public function login(): void
    {
        // --- 1. Method guard -------------------------------------------
        if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
            Response::methodNotAllowed('Method Not Allowed');
        }

        // --- 2. Parse JSON body ----------------------------------------
        $raw  = file_get_contents('php://input');
        $body = json_decode($raw, true);

        if (!is_array($body)) {
            Response::badRequest('Invalid JSON payload');
        }

        // --- 3. Validate required fields --------------------------------
        $email    = isset($body['email'])    ? trim($body['email'])    : '';
        $password = isset($body['password']) ? trim($body['password']) : '';

        if ($email === '' || $password === '') {
            Response::badRequest('Missing email or password');
        }

        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            Response::badRequest('Invalid email format');
        }

        // --- 4. Look up the user by email --------------------------------
        try {
            $user = $this->userModel->findByEmail($email);
        } catch (\Exception $e) {
            error_log('[HMS] AuthController::login DB error: ' . $e->getMessage());
            Response::serverError();
        }

        // Deliberately vague — do not reveal whether the email exists.
        if ($user === null) {
            Response::unauthorized('Invalid credentials');
        }

        // --- 5. Check account status BEFORE verifying the password ------
        // We check is_active first so an inactive account with a correct
        // password gets 403, not 401.  This matches the Auth middleware
        // behaviour for token-protected routes.
        if ((int) $user['is_active'] !== 1) {
            Response::forbidden('Account is inactive');
        }

        // --- 6. Verify the password against the stored bcrypt hash ------
        if (!password_verify($password, $user['password'])) {
            Response::unauthorized('Invalid credentials');
        }

        // --- 7. Mint the token ------------------------------------------
        $token = Auth::generateToken($user);

        // --- 8. Return success ------------------------------------------
        Response::success([
            'token' => $token,
            'user'  => [
                'id'   => (int) $user['id'],
                'name' => $user['full_name'],
                'role' => $user['role'],
            ],
        ]);
    }
}
