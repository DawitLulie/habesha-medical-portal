<?php

/**
 * app/models/Patient.php
 *
 * Data-access layer for the `patients` table.
 *
 * Responsibilities
 * ----------------
 * - Return a paginated/searched list of patients.
 * - Fetch a single patient record by id.
 * - Register a new patient and return the generated id.
 *
 * Every method uses PDO prepared statements with bound parameters.
 * LIKE search terms are manually escaped so that literal % and _
 * characters in phone numbers or names are treated as plain text,
 * not SQL wildcards.
 *
 * Constructor
 * -----------
 *   $patientModel = new Patient($pdo);
 */

class Patient
{
    private \PDO $pdo;

    public function __construct(\PDO $pdo)
    {
        $this->pdo = $pdo;
    }

    // ---------------------------------------------------------------
    // List / search
    // ---------------------------------------------------------------

    /**
     * Return the 20 most recently registered patients.
     *
     * Used when the receptionist opens the patient list without typing
     * a search term.
     *
     * @return array<int, array<string, mixed>>
     */
    public function getRecent(): array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id,
                    first_name,
                    last_name,
                    age,
                    gender,
                    phone,
                    address,
                    created_at
             FROM   patients
             ORDER  BY created_at DESC
             LIMIT  20'
        );
        $stmt->execute();

        return $stmt->fetchAll();
    }

    /**
     * Search patients by first name, last name, or phone number.
     *
     * The search term is wrapped in % wildcards so a partial match on
     * any of the three columns returns a result.  Literal % and _
     * characters inside the search term are escaped so they are not
     * interpreted as SQL wildcards.
     *
     * Results are capped at 100 rows and ordered by most recently
     * registered first.
     *
     * @param  string $term  Raw search string from the query parameter.
     * @return array<int, array<string, mixed>>
     */
    public function search(string $term): array
    {
        // Escape SQL LIKE metacharacters so user input is treated literally.
        $escaped = str_replace(['\\', '%', '_'], ['\\\\', '\\%', '\\_'], $term);
        $pattern = '%' . $escaped . '%';

        $stmt = $this->pdo->prepare(
            'SELECT id,
                    first_name,
                    last_name,
                    age,
                    gender,
                    phone,
                    address,
                    created_at
             FROM   patients
             WHERE  first_name LIKE :pattern
             OR     last_name  LIKE :pattern
             OR     phone      LIKE :pattern
             ORDER  BY created_at DESC
             LIMIT  100'
        );
        $stmt->bindValue(':pattern', $pattern, PDO::PARAM_STR);
        $stmt->execute();

        return $stmt->fetchAll();
    }

    // ---------------------------------------------------------------
    // Single record
    // ---------------------------------------------------------------

    /**
     * Fetch a single patient row by primary key.
     *
     * Returns null when no record with that id exists.
     *
     * @param  int $patientId
     * @return array<string, mixed>|null
     */
    public function findById(int $patientId): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT id,
                    first_name,
                    last_name,
                    age,
                    gender,
                    phone,
                    address,
                    created_at
             FROM   patients
             WHERE  id = :id
             LIMIT  1'
        );
        $stmt->bindValue(':id', $patientId, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();

        return $row !== false ? $row : null;
    }

    // ---------------------------------------------------------------
    // Registration
    // ---------------------------------------------------------------

    /**
     * Insert a new patient record and return the auto-generated id.
     *
     * All string fields are expected to have been trimmed and
     * strip_tags()-sanitised by the controller before reaching here.
     *
     * @param  string $firstName  Patient's first name.
     * @param  string $lastName   Patient's last name.
     * @param  int    $age        Patient's age (must be > 0).
     * @param  string $gender     One of: Male, Female, Other.
     * @param  string $phone      Contact phone number.
     * @param  string $address    Residential address.
     * @return int                The new patient's id.
     */
    public function create(
        string $firstName,
        string $lastName,
        int    $age,
        string $gender,
        string $phone,
        string $address
    ): int {
        $stmt = $this->pdo->prepare(
            'INSERT INTO patients (first_name, last_name, age, gender, phone, address)
             VALUES               (:first_name, :last_name, :age, :gender, :phone, :address)'
        );
        $stmt->bindValue(':first_name', $firstName, PDO::PARAM_STR);
        $stmt->bindValue(':last_name',  $lastName,  PDO::PARAM_STR);
        $stmt->bindValue(':age',        $age,       PDO::PARAM_INT);
        $stmt->bindValue(':gender',     $gender,    PDO::PARAM_STR);
        $stmt->bindValue(':phone',      $phone,     PDO::PARAM_STR);
        $stmt->bindValue(':address',    $address,   PDO::PARAM_STR);
        $stmt->execute();

        return (int) $this->pdo->lastInsertId();
    }

    // ---------------------------------------------------------------
    // Existence check (used by appointment booking)
    // ---------------------------------------------------------------

    /**
     * Confirm that a patient with the given id exists in the table.
     *
     * Called by the Appointment model before booking to validate the
     * patient_id supplied in the request body.
     *
     * @param  int $patientId
     * @return bool
     */
    public function exists(int $patientId): bool
    {
        $stmt = $this->pdo->prepare(
            'SELECT COUNT(*) AS cnt
             FROM   patients
             WHERE  id = :id'
        );
        $stmt->bindValue(':id', $patientId, PDO::PARAM_INT);
        $stmt->execute();

        $row = $stmt->fetch();

        return (int) $row['cnt'] > 0;
    }
}
