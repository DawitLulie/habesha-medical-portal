<?php

/**
 * app/middleware/Cors.php
 *
 * CORS Middleware — must be the very first thing called in every
 * endpoint file, before any other output or logic.
 *
 * What it does
 * ------------
 * 1. Emits the four CORS headers required by the React dev server.
 * 2. Emits the Content-Type header so every response is treated as JSON.
 * 3. Handles the browser's pre-flight OPTIONS request by responding
 *    immediately with HTTP 200 and an empty body, then halting execution
 *    so no further PHP logic runs for that request.
 *
 * Usage
 * -----
 *   require_once __DIR__ . '/../../app/middleware/Cors.php';
 *   Cors::handle();
 *
 * The call to Cors::handle() must appear before any echo, header(), or
 * require that might produce output.
 */

class Cors
{
    /**
     * Emit CORS + Content-Type headers and handle OPTIONS pre-flight.
     *
     * This method always returns (or exits for OPTIONS).  Callers do not
     * need to check a return value.
     */
    public static function handle(): void
    {
        // Allow requests from any origin.
        // For a production deployment you would replace * with the exact
        // frontend origin, e.g. "http://localhost:5173".
        header('Access-Control-Allow-Origin: *');

        // All responses from this API are JSON.
        header('Content-Type: application/json; charset=UTF-8');

        // Declare which HTTP methods the API accepts.
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');

        // Declare which request headers the API accepts.
        // Authorization is required for Bearer token auth.
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

        // Respond to the browser's pre-flight OPTIONS request immediately.
        // The browser sends OPTIONS before the real request to check CORS
        // policy; we confirm it is allowed and stop here.
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}
