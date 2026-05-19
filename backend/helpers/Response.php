<?php

/**
 * helpers/Response.php
 *
 * Centralised JSON response helper.
 *
 * Every endpoint in the API calls one of these static methods to send
 * its final response.  This guarantees that every response — success
 * or error — shares the same JSON envelope shape, making the frontend
 * integration completely predictable.
 *
 * Envelope shapes
 * ---------------
 * Success (with data):
 *   { "status": "success", "data": <mixed> }
 *
 * Success (with message only, e.g. after a create/update):
 *   { "status": "success", "message": "<string>", ...extra fields }
 *
 * Error:
 *   { "status": "error", "message": "<string>" }
 *
 * Usage examples
 * --------------
 *   Response::success(['id' => 1, 'name' => 'Sara']);
 *   Response::created(['patient_id' => 45]);
 *   Response::created(['message' => 'User created successfully']);
 *   Response::error(400, 'Missing required fields');
 *   Response::error(404, 'Patient not found');
 *   Response::unauthorized('Invalid token');
 *   Response::forbidden('Insufficient privileges');
 *   Response::serverError();
 */

class Response
{
    // ---------------------------------------------------------------
    // Success helpers
    // ---------------------------------------------------------------

    /**
     * HTTP 200 — successful read or update.
     *
     * @param array<string, mixed> $payload  Key/value pairs merged into the envelope.
     */
    public static function success(array $payload = []): void
    {
        self::send(200, array_merge(['status' => 'success'], $payload));
    }

    /**
     * HTTP 201 — resource created successfully.
     *
     * @param array<string, mixed> $payload  Key/value pairs merged into the envelope.
     */
    public static function created(array $payload = []): void
    {
        self::send(201, array_merge(['status' => 'success'], $payload));
    }

    // ---------------------------------------------------------------
    // Client-error helpers
    // ---------------------------------------------------------------

    /**
     * HTTP 400 — bad request / validation failure.
     *
     * @param string $message  Human-readable description of the problem.
     */
    public static function badRequest(string $message = 'Bad request'): void
    {
        self::error(400, $message);
    }

    /**
     * HTTP 401 — missing or invalid authentication token.
     *
     * @param string $message
     */
    public static function unauthorized(string $message = 'Unauthorized'): void
    {
        self::error(401, $message);
    }

    /**
     * HTTP 403 — authenticated but not permitted.
     *
     * @param string $message
     */
    public static function forbidden(string $message = 'Forbidden'): void
    {
        self::error(403, $message);
    }

    /**
     * HTTP 404 — resource not found.
     *
     * @param string $message
     */
    public static function notFound(string $message = 'Not found'): void
    {
        self::error(404, $message);
    }

    /**
     * HTTP 405 — HTTP method not allowed on this endpoint.
     *
     * @param string $message
     */
    public static function methodNotAllowed(string $message = 'Method Not Allowed'): void
    {
        self::error(405, $message);
    }

    // ---------------------------------------------------------------
    // Server-error helper
    // ---------------------------------------------------------------

    /**
     * HTTP 500 — unhandled server error.
     * The real error detail must be logged before calling this; it is
     * never forwarded to the client.
     *
     * @param string $message  Safe, generic message shown to the client.
     */
    public static function serverError(string $message = 'An internal server error occurred'): void
    {
        self::error(500, $message);
    }

    // ---------------------------------------------------------------
    // Generic error dispatcher
    // ---------------------------------------------------------------

    /**
     * Send an error response with any HTTP status code.
     *
     * @param int    $code     HTTP status code.
     * @param string $message  Error description.
     */
    public static function error(int $code, string $message): void
    {
        self::send($code, [
            'status'  => 'error',
            'message' => $message,
        ]);
    }

    // ---------------------------------------------------------------
    // Core dispatcher — all paths end here
    // ---------------------------------------------------------------

    /**
     * Set the HTTP status code, encode the payload as JSON, print it,
     * and terminate the script.
     *
     * @param int                  $code     HTTP status code.
     * @param array<string, mixed> $payload  Data to encode.
     */
    private static function send(int $code, array $payload): void
    {
        http_response_code($code);
        echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
}
