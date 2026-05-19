<?php

/**
 * app/models/User.php
 *
 * Data-access layer for the `users` table.
 *
 * Responsibilities
 * ----------------
 * - Find a user by email for login authentication.
 * - Fetch all staff users for the admin list view.
 * - Insert a new staff user account.
 * - Toggle a user's active/inactive status (soft delete).
 *
 * Every method uses PDO prepared statements with bound parameters.
 * The `password` column is never returned in list queries.
 *
 * Constructor
 * -----------
 *   $userModel = new User($pdo);
 */

class User
{
    private \PDO $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // ---------------------------------------------------------------
    // Authentication
    // ---------------------------------------------------------------

    /**
     * Find a single active or inactive user by their email address.
     *
     * Returns the full row including the hashed password so the
     * AuthController can run password_verify() against it.
     * Returns null when no matching record exists.
     *
     * @param  string $email
     * @return array<string, mixed>|null
     */
    public function findByEmail(string $email): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id,
                    full_name,
                    email,
                    password,
                    phone,
                    role,
                    is_active,
                    created_at
             FROM   users
             WHERE  email = :email
             LIMIT  1'
        );
        $stmt->bindValue(':email', $email, PDO::PARAM_STR);
        $stmt->execute();

        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }

    // ---------------------------------------------------------------
    // Admin — list
    // ---------------------------------------------------------------

    /**
     * Return all staff user records ordered by id ascending.
     *
     * The `password` column is intentionally excluded from the SELECT
     * list so it is never serialised into an API response.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getAll(): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id,
                    full_name,
                    email,
                    phone,
                    role,
                    is_active,
                    created_at
             FROM   users
             ORDER  BY id ASC'
        );
        $stmt->execute();

        return $stmt->fetchAll();
    }

    // ---------------------------------------------------------------
    // Admin — create
    // ---------------------------------------------------------------

    /**
     * Check whether an email address is already registered.
     *
     * Used before INSERT to return a clean 400 error instead of
     * letting the UNIQUE constraint throw a PDOException.
     *
     * @param  string $email
     * @return bool
     */
    public function emailExists(string $email): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) AS cnt
             FROM   users
             WHERE  email = :email'
        );
        $stmt->bindValue(':email', $email, PDO::PARAM_STR);
        $stmt->execute();

        $row = $stmt->fetch();

        return (int) $row['cnt'] > 0;
    }

    /**
     * Insert a new staff user and return the auto-generated id.
     *
     * The password must already be bcrypt-hashed by the controller
     * before being passed here.
     *
     * @param  string      $fullName  Staff member's full name.
     * @param  string      $email     Unique login email.
     * @param  string      $password  Bcrypt hash of the plain-text password.
     * @param  string      $role      One of: Admin, Receptionist, Doctor.
     * @param  string|null $phone     Optional phone number.
     * @return int                    The new user's id.
     */
    public function create(
        string  $fullName,
        string  $email,
        string  $password,
        string  $role,
        ?string $phone = null
    ): int {
        $stmt = $this->pdo->prepare(
            'INSERT INTO users (full_name, email, password, phone, role, is_active)
             VALUES            (:full_name, :email, :password, :phone, :role, 1)'
        );
        $stmt->bindValue(':full_name', $fullName,  PDO::PARAM_STR);
        $stmt->bindValue(':email',     $email,     PDO::PARAM_STR);
        $stmt->bindValue(':password',  $password,  PDO::PARAM_STR);
        $stmt->bindValue(':phone',     $phone,     $phone !== null ? PDO::PARAM_STR : PDO::PARAM_NULL);
        $stmt->bindValue(':role',      $role,      PDO::PARAM_STR);
        $stmt->execute();

        return (int) $this->pdo->lastInsertId();
    }

    // ---------------------------------------------------------------
    // Admin — toggle status
    // ---------------------------------------------------------------

    /**
     * Find a user by their numeric id.
     *
     * Used by the toggle-status endpoint to confirm the user exists
     * before attempting an UPDATE.  Returns null when not found.
     *
     * @param  int $userId
     * @return array<string, mixed>|null
     */
    public function findById(int $userId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id,
                    full_name,
                    email,
                    phone,
                    role,
                    is_active,
                    created_at
             FROM   users
             WHERE  id = :id
             LIMIT  1'
        );
        $stmt->bindValue(':id', $userId, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }

    /**
     * Set the is_active flag for a user to 0 (inactive) or 1 (active).
     *
     * This is the system's soft-delete mechanism.  Records are never
     * physically removed so that historical appointment and consultation
     * data remains intact.
     *
     * @param  int $userId    The user to update.
     * @param  int $isActive  1 to activate, 0 to deactivate.
     * @return bool           True when exactly one row was updated.
     */
    public function setActiveStatus(int $userId, int $isActive): bool
    {
        $stmt = $this->pdo->prepare(
            'UPDATE users
             SET    is_active = :is_active
             WHERE  id        = :id'
        );
        $stmt->bindValue(':is_active', $isActive, PDO::PARAM_INT);
        $stmt->bindValue(':id',        $userId,   PDO::PARAM_INT);
        $stmt->execute();

        return $stmt->rowCount() === 1;
    }

    // ---------------------------------------------------------------
    // Appointment booking — doctor validation
    // ---------------------------------------------------------------

    /**
     * Confirm that a given user id belongs to an active Doctor.
     *
     * Called by the Appointment model before booking to ensure the
     * doctor_id in the request is valid.
     *
     * @param  int $doctorId
     * @return bool
     */
    public function isActiveDoctor(int $doctorId): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) AS cnt
             FROM   users
             WHERE  id        = :id
             AND    role      = \'Doctor\'
             AND    is_active = 1'
        );
        $stmt->bindValue(':id', $doctorId, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();

        return (int) $row['cnt'] > 0;
    }
}
