<?php

/**
 * database/seeds/UsersSeeder.php
 *
 * CLI seeder — inserts one test account for each of the three staff roles.
 *
 * Run from the backend/ directory:
 *   php database/seeds/UsersSeeder.php
 *
 * The seeder is idempotent: if a user with the given email already exists
 * it skips that row and reports it, so re-running never causes duplicate-key
 * errors or overwrites existing data.
 *
 * Test credentials
 * ----------------
 * Admin        dawitlulie2@gmail.com   / 12345678
 * Receptionist sara.reception@hms.com  / 12345678
 * Doctor       dr.abebe@hms.com        / 12345678
 */

// ---------------------------------------------------------------------------
// Bootstrap — load the Database singleton from config/
// ---------------------------------------------------------------------------

require_once __DIR__ . '/../../config/database.php';

// ---------------------------------------------------------------------------
// Seed data
// All passwords are hashed here at runtime with PASSWORD_BCRYPT so the
// plain-text values never touch the database.
// ---------------------------------------------------------------------------

$users = [
    [
        'full_name' => 'Dawit Lulie',
        'email'     => 'dawitlulie2@gmail.com',
        'password'  => password_hash('12345678', PASSWORD_BCRYPT),
        'phone'     => '0965849518',
        'role'      => 'Admin',
        'is_active' => 1,
    ],
    [
        'full_name' => 'Sara Tadesse',
        'email'     => 'sara.reception@hms.com',
        'password'  => password_hash('12345678', PASSWORD_BCRYPT),
        'phone'     => '0911000001',
        'role'      => 'Receptionist',
        'is_active' => 1,
    ],
    [
        'full_name' => 'Dr. Abebe Kebede',
        'email'     => 'dr.abebe@hms.com',
        'password'  => password_hash('12345678', PASSWORD_BCRYPT),
        'phone'     => '0911000002',
        'role'      => 'Doctor',
        'is_active' => 1,
    ],
];

// ---------------------------------------------------------------------------
// Connect and insert
// ---------------------------------------------------------------------------

try {
    $pdo = Database::getConnection();

    $checkStmt = $pdo->prepare(
        'SELECT COUNT(*) AS cnt FROM users WHERE email = :email'
    );

    $insertStmt = $pdo->prepare(
        'INSERT INTO users (full_name, email, password, phone, role, is_active)
         VALUES            (:full_name, :email, :password, :phone, :role, :is_active)'
    );

    echo "\n=== HMS Users Seeder ===\n\n";

    foreach ($users as $user) {
        // Check whether this email is already registered.
        $checkStmt->bindValue(':email', $user['email'], PDO::PARAM_STR);
        $checkStmt->execute();
        $row = $checkStmt->fetch();

        if ((int) $row['cnt'] > 0) {
            echo "[SKIP]    {$user['role']} — {$user['email']} already exists.\n";
            continue;
        }

        // Insert the new user.
        $insertStmt->bindValue(':full_name', $user['full_name'], PDO::PARAM_STR);
        $insertStmt->bindValue(':email',     $user['email'],     PDO::PARAM_STR);
        $insertStmt->bindValue(':password',  $user['password'],  PDO::PARAM_STR);
        $insertStmt->bindValue(':phone',     $user['phone'],     PDO::PARAM_STR);
        $insertStmt->bindValue(':role',      $user['role'],      PDO::PARAM_STR);
        $insertStmt->bindValue(':is_active', $user['is_active'], PDO::PARAM_INT);
        $insertStmt->execute();

        $newId = (int) $pdo->lastInsertId();
        echo "[SEEDED]  {$user['role']} — {$user['email']} (id: {$newId})\n";
    }

    echo "\n=== Seeding complete. ===\n\n";

} catch (\Exception $e) {
    echo "\n[ERROR] Seeder failed: " . $e->getMessage() . "\n\n";
    exit(1);
}
