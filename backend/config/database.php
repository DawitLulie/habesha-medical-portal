<?php

/**
 * config/database.php
 *
 * PDO Singleton — one shared connection per request lifecycle.
 *
 * Usage:
 *   $pdo = Database::getConnection();
 *
 * Reads credentials from the .env file located one level above this
 * directory (backend/.env).  Falls back to the values below if the
 * file is absent or a key is missing.
 */

class Database
{
    /** @var Database|null Holds the single class instance. */
    private static ?Database $instance = null;

    /** @var \PDO The underlying PDO connection. */
    private \PDO $pdo;

    // ---------------------------------------------------------------
    // Constructor — private so callers must use getConnection()
    // ---------------------------------------------------------------

    private function __construct()
    {
        $env = self::parseEnvFile();

        $host    = $env['DB_HOST'] ?? 'localhost';
        $dbName  = $env['DB_NAME'] ?? 'hms_clinic_db';
        $user    = $env['DB_USER'] ?? 'root';
        $pass    = $env['DB_PASS'] ?? '';
        $charset = 'utf8mb4';

        $dsn = "mysql:host={$host};dbname={$dbName};charset={$charset}";

        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];

        try {
            $this->pdo = new PDO($dsn, $user, $pass, $options);
        } catch (PDOException $e) {
            // Log the real message server-side; never expose it to clients.
            error_log('[HMS] Database connection failed: ' . $e->getMessage());
            throw new RuntimeException('Database connection failed.');
        }
    }

    // ---------------------------------------------------------------
    // Public API
    // ---------------------------------------------------------------

    /**
     * Returns the shared PDO instance, creating it on first call.
     *
     * @return \PDO
     * @throws RuntimeException when the connection cannot be established.
     */
    public static function getConnection(): \PDO
    {
        if (self::$instance === null) {
            self::$instance = new self();
        }

        return self::$instance->pdo;
    }

    // ---------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------

    /**
     * Parses the backend/.env file into a key => value array.
     * Lines starting with # and lines without = are silently skipped.
     *
     * @return array<string, string>
     */
    private static function parseEnvFile(): array
    {
        $defaults = [
            'DB_HOST' => 'localhost',
            'DB_NAME' => 'hms_clinic_db',
            'DB_USER' => 'root',
            'DB_PASS' => '',
        ];

        $envPath = __DIR__ . '/../.env';

        if (!is_readable($envPath)) {
            return $defaults;
        }

        $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

        if ($lines === false) {
            return $defaults;
        }

        $config = $defaults;

        foreach ($lines as $line) {
            $line = trim($line);

            // Skip comments and lines without an equals sign.
            if ($line === '' || $line[0] === '#' || strpos($line, '=') === false) {
                continue;
            }

            [$key, $value] = array_pad(explode('=', $line, 2), 2, '');
            $key   = trim($key);
            $value = trim($value);

            if ($key !== '') {
                $config[$key] = $value;
            }
        }

        return $config;
    }

    // ---------------------------------------------------------------
    // Prevent cloning / unserialization of the singleton
    // ---------------------------------------------------------------

    public function __clone() {}
    public function __wakeup() {}
}
