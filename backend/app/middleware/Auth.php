<?php

/**
 * app/middleware/Auth.php
 *
 * Authentication & RBAC Middleware.
 *
 * Responsibilities
 * ----------------
 * 1. Extract the Bearer token from the Authorization header.
 * 2. Decode and validate the token payload.
 * 3. Verify the referenced user exists and is active in the database.
 * 4. Optionally enforce that the authenticated user holds one of the
 *    roles required by the calling endpoint.
 *
 * Token format
 * ------------
 * Tokens are Base64-encoded JSON objects with the following shape:
 *
 *   {
 *     "id":   <int>,    // users.id
 *     "name": <string>, // users.full_name
 *     "role": <string>, // Admin | Receptionist | Doctor
 *     "iat":  <int>     // Unix timestamp of issue time
 *   }
 *
 * This is intentionally simple — no external JWT library is needed for
 * a university assignment.  The token is not cryptographically signed,
 * so it must only be used over HTTPS in a real deployment.
 *
 * Usage
 * -----
 * Authenticate only (any active user):
 *   $authUser = Auth::require();
 *
 * Authenticate + restrict to one or more roles:
 *   $authUser = Auth::require(['Admin']);
 *   $authUser = Auth::require(['Receptionist', 'Doctor']);
 *
 * Both calls return an associative array on success:
 *   ['id' => 1, 'full_name' => 'Dr. John', 'role' => 'Doctor']
 *
 * On any failure the method sends the appropriate JSON error response
 * and terminates execution — the caller never needs to check a return
 * value for null.
 */

require_once __DIR__ . '/../../helpers/Response.php';
require_once __DIR__ . '/../../config/database.php';

class Auth
{
    /**
     * Validate the Bearer token and, optionally, enforce role access.
     *
     * @param  string[] $allowedRoles  If non-empty, the authenticated user's
     *                                 role must be in this list.
     * @return array<string, mixed>    Authenticated user record on success.
     */
    public static function require(array $allowedRoles = []): array
    {
        $token = self::extractToken();

        if ($token === null) {
            Response::unauthorized('Missing Authorization header');
        }

        $payload = self::decodeToken($token);

        if ($payload === null) {
            Response::unauthorized('Invalid token');
        }

        $user = self::fetchUser((int) $payload['id']);

        if ($user === null) {
            Response::unauthorized('Invalid token');
        }

        if ((int) $user['is_active'] !== 1) {
            Response::forbidden('Account is inactive');
        }

        if (!empty($allowedRoles) && !in_array($user['role'], $allowedRoles, true)) {
            Response::forbidden('Forbidden: insufficient privileges');
        }

        return $user;
    }

    // ---------------------------------------------------------------
    // Token helpers
    // ---------------------------------------------------------------

    /**
     * Pull the raw token string out of the Authorization header.
     *
     * Apache sometimes strips the Authorization header from $_SERVER,
     * so we fall back to apache_request_headers() when available.
     *
     * @return string|null  The raw token string, or null if not present.
     */
    private static function extractToken(): ?string
    {
        $header = null;

        if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
            $header = trim($_SERVER['HTTP_AUTHORIZATION']);
        } elseif (function_exists('apache_request_headers')) {
            $headers = apache_request_headers();
            // Header names are case-insensitive; check both casings.
            if (isset($headers['Authorization'])) {
                $header = trim($headers['Authorization']);
            } elseif (isset($headers['authorization'])) {
                $header = trim($headers['authorization']);
            }
        }

        if ($header === null || $header === '') {
            return null;
        }

        // The header must start with "Bearer " (case-insensitive).
        if (stripos($header, 'Bearer ') !== 0) {
            return null;
        }

        $token = trim(substr($header, 7));

        return $token !== '' ? $token : null;
    }

    /**
     * Decode a Base64-encoded JSON token into an associative array.
     *
     * Returns null if the string is not valid Base64, not valid JSON,
     * or does not contain the required 'id' field.
     *
     * @param  string $token  Raw token string from the Authorization header.
     * @return array<string, mixed>|null
     */
    private static function decodeToken(string $token): ?array
    {
        // base64_decode returns false on failure.
        $json = base64_decode($token, true);

        if ($json === false) {
            return null;
        }

        $payload = json_decode($json, true);

        if (!is_array($payload) || !isset($payload['id']) || !is_numeric($payload['id'])) {
            return null;
        }

        return $payload;
    }

    /**
     * Look up the user by ID and return their record, or null if not found.
     *
     * @param  int $userId
     * @return array<string, mixed>|null
     */
    private static function fetchUser(int $userId): ?array
    {
        try {
            $pdo = Database::getConnection();

            $stmt = $pdo->prepare(
                'SELECT id, full_name, email, role, is_active
                 FROM   users
                 WHERE  id = :id
                 LIMIT  1'
            );
            $stmt->bindValue(':id', $userId, PDO::PARAM_INT);
            $stmt->execute();

            $user = $stmt->fetch();

            return $user !== false ? $user : null;
        } catch (Exception $e) {
            error_log('[HMS] Auth::fetchUser error: ' . $e->getMessage());
            Response::serverError();
        }
    }

    // ---------------------------------------------------------------
    // Token generation (used by AuthController on login)
    // ---------------------------------------------------------------

    /**
     * Generate a Base64-encoded token for the given user record.
     *
     * @param  array<string, mixed> $user  A row from the users table.
     * @return string
     */
    public static function generateToken(array $user): string
    {
        $payload = [
            'id'   => (int) $user['id'],
            'name' => $user['full_name'],
            'role' => $user['role'],
            'iat'  => time(),
        ];

        return base64_encode(json_encode($payload));
    }
}
