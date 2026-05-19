<?php

/**
 * database/migrate.php
 *
 * CLI migration runner.
 * Executes schema.sql against the configured database.
 *
 * Usage (from backend/ directory):
 *   php database/migrate.php
 */

require_once __DIR__ . '/../config/database.php';

echo "\n=== HMS Database Migration ===\n\n";

try {
    $pdo = Database::getConnection();

    $sql        = file_get_contents(__DIR__ . '/migrations/schema.sql');
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    $executed   = 0;

    foreach ($statements as $statement) {
        if ($statement !== '') {
            $pdo->exec($statement);
            $executed++;
        }
    }

    echo "[OK] Migration complete. Statements executed: {$executed}\n\n";

} catch (\Exception $e) {
    echo "[ERROR] Migration failed: " . $e->getMessage() . "\n\n";
    exit(1);
}
