# Requirements Document

## Introduction

This document defines the requirements for the **HMS Core PHP REST API** — the backend of a Hospital Management System (HMS) built as a university class assignment. The system is a decoupled architecture: a Core PHP REST API backend served by XAMPP/Apache, consumed by a React.js frontend.

The API exposes 11 endpoints across 5 modules (Auth, Users, Patients, Appointments, Consultations) under the base URL `http://localhost/hms-api/v1`. All protected endpoints require Bearer Token authentication. Role-Based Access Control (RBAC) restricts each endpoint to the appropriate staff role (Admin, Receptionist, Doctor). The database is MySQL (`hms_clinic_db`) with 4 tables, accessed exclusively via PDO prepared statements.

---

## Glossary

- **API**: The Core PHP REST API backend of the HMS.
- **AuthMiddleware**: The component responsible for extracting and validating Bearer Tokens on protected endpoints.
- **CorsMiddleware**: The component responsible for setting CORS response headers on every request.
- **Token**: A Base64-encoded JSON payload containing `id`, `name`, `role`, and `iat` fields, issued on successful login and used as a Bearer Token for subsequent requests.
- **Admin**: A staff role with exclusive access to user management endpoints (`/users/*`).
- **Receptionist**: A staff role with access to patient management (`/patients/*`) and appointment booking/status endpoints (`/appointments/book`, `/appointments/update-status`).
- **Doctor**: A staff role with access to the appointment queue (`/appointments/queue`) and consultation endpoints (`/consultations/*`).
- **Soft Delete**: The practice of deactivating a user record by setting `is_active = 0` rather than removing the row from the database.
- **Queue Number**: An auto-incremented integer assigned to each appointment for a given doctor on a given date, representing the patient's position in the doctor's daily queue.
- **PDO**: PHP Data Objects — the database abstraction layer used for all MySQL queries.
- **RBAC**: Role-Based Access Control — the mechanism that restricts endpoint access based on the authenticated user's role.
- **hms_clinic_db**: The MySQL database name used by the system.
- **Bcrypt**: The password hashing algorithm used to store user passwords securely.
- **CORS**: Cross-Origin Resource Sharing — HTTP headers that allow the React frontend (running on a different origin) to call the API.

---

## Requirements

### Requirement 1: CORS and Content-Type Headers

**User Story:** As a React frontend developer, I want every API response to include the correct CORS and Content-Type headers, so that browser requests from the frontend origin are not blocked.

#### Acceptance Criteria

1. THE CorsMiddleware SHALL set the `Access-Control-Allow-Origin: *` header on every HTTP response.
2. THE CorsMiddleware SHALL set the `Content-Type: application/json; charset=UTF-8` header on every HTTP response.
3. THE CorsMiddleware SHALL set `Access-Control-Allow-Methods: GET, POST, PUT, DELETE` on every HTTP response.
4. THE CorsMiddleware SHALL set `Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With` on every HTTP response.
5. WHEN the HTTP request method is `OPTIONS`, THE API SHALL respond with HTTP 200 and an empty body, then terminate execution.

---

### Requirement 2: Uniform JSON Response Format

**User Story:** As a frontend developer, I want all API responses to follow a consistent JSON structure, so that I can write predictable response-handling code.

#### Acceptance Criteria

1. THE API SHALL return all responses as JSON objects containing at minimum a `status` field with value `"success"` or `"error"`.
2. WHEN a request succeeds, THE API SHALL include a `"status": "success"` field in the response body.
3. WHEN a request fails, THE API SHALL include a `"status": "error"` field and a `"message"` field describing the failure.
4. THE API SHALL use HTTP status code 200 for successful read/update operations.
5. THE API SHALL use HTTP status code 201 for successful resource creation operations.
6. THE API SHALL use HTTP status code 400 for invalid or missing input.
7. THE API SHALL use HTTP status code 401 when the Authorization header is missing or the token is invalid.
8. THE API SHALL use HTTP status code 403 when the authenticated user's role does not permit the requested operation.
9. THE API SHALL use HTTP status code 404 when a requested resource does not exist.
10. THE API SHALL use HTTP status code 500 for unhandled server-side errors.

---

### Requirement 3: Bearer Token Authentication

**User Story:** As a system administrator, I want all non-login endpoints to require a valid Bearer Token, so that unauthenticated users cannot access patient or staff data.

#### Acceptance Criteria

1. THE AuthMiddleware SHALL extract the Bearer Token from the `Authorization` HTTP header using the format `Authorization: Bearer <TOKEN>`.
2. WHEN the `Authorization` header is absent, THE AuthMiddleware SHALL return HTTP 401 with `"message": "Missing Authorization header"`.
3. WHEN the token cannot be decoded or does not contain a valid `id` field, THE AuthMiddleware SHALL return HTTP 401 with `"message": "Invalid token"`.
4. WHEN the token references a user whose `is_active` value is `0`, THE AuthMiddleware SHALL return HTTP 403 with `"message": "Account inactive"`.
5. WHEN the token is valid and the user is active, THE AuthMiddleware SHALL make the authenticated user's `id`, `role`, and `full_name` available to the endpoint handler.
6. THE AuthMiddleware SHALL support token extraction via both `$_SERVER['HTTP_AUTHORIZATION']` and `apache_request_headers()` to ensure compatibility with all Apache configurations.

---

### Requirement 4: Role-Based Access Control (RBAC)

**User Story:** As a system administrator, I want each endpoint to be accessible only by the appropriate staff role, so that Doctors cannot manage users and Receptionists cannot submit consultations.

#### Acceptance Criteria

1. THE API SHALL restrict the `/users/list`, `/users/create`, and `/users/toggle-status` endpoints to users with role `Admin`.
2. THE API SHALL restrict the `/patients/list`, `/patients/detail`, and `/patients/register` endpoints to users with role `Receptionist` or `Doctor`.
3. THE API SHALL restrict the `/appointments/book` and `/appointments/update-status` endpoints to users with role `Receptionist` or `Doctor`.
4. THE API SHALL restrict the `/appointments/queue` endpoint to users with role `Doctor` or `Receptionist`.
5. THE API SHALL restrict the `/consultations/submit` and `/consultations/history` endpoints to users with role `Doctor`.
6. WHEN an authenticated user attempts to access an endpoint outside their permitted role, THE API SHALL return HTTP 403 with `"message": "Forbidden: insufficient privileges"` or a role-specific equivalent.

---

### Requirement 5: User Login (Authentication)

**User Story:** As a staff member, I want to log in with my email and password, so that I receive a token I can use to access protected endpoints.

#### Acceptance Criteria

1. WHEN a `POST` request is made to `/auth/login.php` with a valid JSON body containing `email` and `password`, THE API SHALL authenticate the user and return HTTP 200 with a `token` and a `user` object containing `id`, `name`, and `role`.
2. WHEN the `email` field is missing or empty, THE API SHALL return HTTP 400 with `"message": "Missing email or password"`.
3. WHEN the `password` field is missing or empty, THE API SHALL return HTTP 400 with `"message": "Missing email or password"`.
4. WHEN the provided email does not match any user record, THE API SHALL return HTTP 401 with `"message": "Invalid credentials"`.
5. WHEN the provided password does not match the stored Bcrypt hash, THE API SHALL return HTTP 401 with `"message": "Invalid credentials"`.
6. WHEN the matching user has `is_active = 0`, THE API SHALL return HTTP 403 with `"message": "Account is inactive"`.
7. THE API SHALL verify passwords using `password_verify()` against the Bcrypt-hashed value stored in the `users` table.
8. WHEN a non-`POST` HTTP method is used on `/auth/login.php`, THE API SHALL return HTTP 405 with `"message": "Method Not Allowed"`.

---

### Requirement 6: User Management (Admin Only)

**User Story:** As an Admin, I want to list all staff users, create new user accounts, and activate or deactivate existing accounts, so that I can manage who has access to the system.

#### Acceptance Criteria

1. WHEN a `GET` request is made to `/users/list.php` by an authenticated Admin, THE API SHALL return HTTP 200 with a `data` array containing all user records (excluding the `password` field), ordered by `id` ascending.
2. WHEN a `POST` request is made to `/users/create.php` with valid fields (`full_name`, `email`, `password`, `role`, and optionally `phone`), THE API SHALL insert the new user with `is_active = 1`, hash the password using Bcrypt, and return HTTP 201 with `"message": "User created successfully"`.
3. WHEN the `email` provided to `/users/create.php` already exists in the `users` table, THE API SHALL return HTTP 400 with `"message": "Email already exists"`.
4. WHEN the `role` provided to `/users/create.php` is not one of `Admin`, `Receptionist`, or `Doctor`, THE API SHALL return HTTP 400 with `"message": "Invalid role"`.
5. WHEN a `PUT` request is made to `/users/toggle-status.php` with a valid `user_id` and `is_active` value of `0` or `1`, THE API SHALL update the corresponding user's `is_active` field and return HTTP 200 with `"message": "User status updated"`.
6. WHEN the `user_id` provided to `/users/toggle-status.php` is not a positive integer, or `is_active` is not `0` or `1`, THE API SHALL return HTTP 400 with `"message": "Invalid input"`.
7. THE API SHALL store all new user passwords as Bcrypt hashes using `password_hash($password, PASSWORD_BCRYPT)`.
8. THE API SHALL never return the `password` field in any user listing response.

---

### Requirement 7: Patient Management

**User Story:** As a Receptionist or Doctor, I want to search for patients, view patient details, and register new patients, so that I can manage patient records efficiently.

#### Acceptance Criteria

1. WHEN a `GET` request is made to `/patients/list.php` without a `search` query parameter, THE API SHALL return HTTP 200 with a `data` array of the 20 most recently registered patients, ordered by `created_at` descending.
2. WHEN a `GET` request is made to `/patients/list.php` with a `search` query parameter, THE API SHALL return HTTP 200 with a `data` array of patients whose `first_name`, `last_name`, or `phone` matches the search term using a `LIKE` pattern, limited to 100 results.
3. WHEN a `GET` request is made to `/patients/detail.php?id={id}` with a valid patient ID, THE API SHALL return HTTP 200 with the patient record in a `data` field and the patient's consultation history in a `medical_history` array.
4. WHEN the `id` parameter is missing or not a positive integer on `/patients/detail.php`, THE API SHALL return HTTP 400 with `"message": "Invalid or missing patient id"`.
5. WHEN the patient ID provided to `/patients/detail.php` does not exist in the `patients` table, THE API SHALL return HTTP 404 with `"message": "Patient not found"`.
6. WHEN a `POST` request is made to `/patients/register.php` with valid fields (`first_name`, `last_name`, `age`, `gender`, `phone`, `address`), THE API SHALL insert the patient and return HTTP 201 with the new `patient_id`.
7. WHEN the `gender` field provided to `/patients/register.php` is not one of `Male`, `Female`, or `Other`, THE API SHALL return HTTP 400 with `"message": "Invalid gender"`.
8. WHEN the `age` field provided to `/patients/register.php` is not a positive integer greater than zero, THE API SHALL return HTTP 400 with `"message": "Missing or invalid required fields"`.
9. THE API SHALL use PDO prepared statements with parameterized `LIKE` bindings (escaping `%` and `_` metacharacters) for all patient search queries.

---

### Requirement 8: Appointment Booking with Atomic Queue Generation

**User Story:** As a Receptionist, I want to book an appointment for a patient with a specific doctor on a given date, so that the patient receives a unique queue number without conflicts from concurrent bookings.

#### Acceptance Criteria

1. WHEN a `POST` request is made to `/appointments/book.php` with valid `patient_id`, `doctor_id`, and `appointment_date` (format `YYYY-MM-DD`), THE API SHALL atomically compute the next queue number and insert the appointment, returning HTTP 201 with `appointment_id`, `queue_number`, and `appointment_status: "Scheduled"`.
2. THE API SHALL compute the next queue number using `SELECT COALESCE(MAX(queue_number), 0) + 1 FROM appointments WHERE doctor_id = ? AND appointment_date = ?` inside a database transaction with a `FOR UPDATE` lock to prevent race conditions.
3. WHEN the `patient_id` does not reference an existing patient, THE API SHALL return HTTP 404 with `"message": "Patient not found"`.
4. WHEN the `doctor_id` does not reference an active user with role `Doctor`, THE API SHALL return HTTP 404 with `"message": "Doctor not found or inactive"`.
5. WHEN the `appointment_date` is not in `YYYY-MM-DD` format, THE API SHALL return HTTP 400 with `"message": "Invalid appointment_date format, expected YYYY-MM-DD"`.
6. WHEN any required field (`patient_id`, `doctor_id`, `appointment_date`) is missing or invalid, THE API SHALL return HTTP 400 with `"message": "Missing or invalid required fields"`.
7. WHEN the database transaction fails during appointment insertion, THE API SHALL roll back the transaction and return HTTP 500.

---

### Requirement 9: Appointment Queue View

**User Story:** As a Doctor or Receptionist, I want to view the active appointment queue for a specific doctor on the current date, so that I can manage patient flow efficiently.

#### Acceptance Criteria

1. WHEN a `GET` request is made to `/appointments/queue.php?doctor_id={id}`, THE API SHALL return HTTP 200 with a `data` array of appointments for that doctor on the current date (`CURDATE()`) where status is `Scheduled` or `In-Consultation`, ordered by `queue_number` ascending.
2. THE API SHALL include the following fields in each queue entry: `appointment_id`, `patient_id`, `doctor_id`, `appointment_date`, `queue_number`, `appointment_status`, `first_name`, `last_name`, `age`, `gender`, `phone`.
3. WHEN the `doctor_id` query parameter is missing or not a positive integer, THE API SHALL return HTTP 400 with `"message": "Missing or invalid doctor_id"`.

---

### Requirement 10: Appointment Status Update

**User Story:** As a Doctor or Receptionist, I want to update the status of an appointment, so that the queue reflects the current state of each patient's visit.

#### Acceptance Criteria

1. WHEN a `PUT` request is made to `/appointments/update-status.php` with a valid `appointment_id` and `status`, THE API SHALL update the appointment's status and return HTTP 200 with `"message": "Appointment updated"`.
2. THE API SHALL only accept the following values for `status`: `Scheduled`, `In-Consultation`, `Completed`, `Cancelled`.
3. WHEN the `status` value is not one of the four allowed values, THE API SHALL return HTTP 400 with `"message": "Invalid status value"`.
4. WHEN the `appointment_id` does not reference an existing appointment, THE API SHALL return HTTP 404 with `"message": "Appointment not found"`.
5. WHEN `appointment_id` is missing or not a positive integer, THE API SHALL return HTTP 400 with `"message": "Missing required fields"`.

---

### Requirement 11: Consultation Submission

**User Story:** As a Doctor, I want to submit a consultation record for a patient appointment, so that the medical details are saved and the appointment is automatically marked as Completed.

#### Acceptance Criteria

1. WHEN a `POST` request is made to `/consultations/submit.php` with valid `appointment_id`, `patient_id`, `symptoms`, `diagnosis`, and `prescription`, THE API SHALL insert the consultation record and atomically update the appointment status to `Completed`, returning HTTP 201 with the new `consultation_id`.
2. THE API SHALL perform the consultation insert and appointment status update within a single database transaction, rolling back both if either operation fails.
3. WHEN the `appointment_id` does not reference an existing appointment, THE API SHALL return HTTP 404 with `"message": "Appointment not found"`.
4. WHEN the `patient_id` in the request does not match the `patient_id` on the referenced appointment, THE API SHALL return HTTP 400 with `"message": "Patient ID does not match appointment"`.
5. WHEN the authenticated Doctor's `id` does not match the `doctor_id` on the referenced appointment, THE API SHALL return HTTP 403 with `"message": "Forbidden: appointment not assigned to you"`.
6. WHEN a consultation record already exists for the given `appointment_id`, THE API SHALL return HTTP 400 with `"message": "Consultation already exists for this appointment"`.
7. WHEN any required field (`appointment_id`, `patient_id`, `symptoms`, `diagnosis`, `prescription`) is missing or empty, THE API SHALL return HTTP 400 with `"message": "Missing or invalid required fields"`.
8. THE `notes` field SHALL be optional; WHEN omitted or empty, THE API SHALL store `NULL` in the `notes` column.

---

### Requirement 12: Consultation History

**User Story:** As a Doctor, I want to retrieve the full consultation history for a patient, so that I can review previous diagnoses and prescriptions before treating the patient.

#### Acceptance Criteria

1. WHEN a `GET` request is made to `/consultations/history.php?patient_id={id}`, THE API SHALL return HTTP 200 with a `data` array of all consultation records for that patient, ordered by `consultation_date` descending.
2. THE API SHALL include the following fields in each history entry: `consultation_id`, `appointment_id`, `patient_id`, `symptoms`, `diagnosis`, `prescription`, `notes`, `consultation_date`, `doctor_id`, `doctor_name`.
3. WHEN the `patient_id` query parameter is missing or not a positive integer, THE API SHALL return HTTP 400 with `"message": "Missing or invalid patient_id"`.
4. WHEN no consultation records exist for the given patient, THE API SHALL return HTTP 200 with an empty `data` array.

---

### Requirement 13: Database Integrity and Security

**User Story:** As a system architect, I want the database layer to enforce data integrity and prevent SQL injection, so that the system is secure and data remains consistent.

#### Acceptance Criteria

1. THE API SHALL use PDO prepared statements with bound parameters for every database query, with no string interpolation of user-supplied values into SQL.
2. THE API SHALL use MySQL InnoDB engine for all tables to support foreign key constraints and transactions.
3. THE API SHALL enforce foreign key relationships: `appointments.patient_id` references `patients(id)`, `appointments.doctor_id` references `users(id)`, `consultations.appointment_id` references `appointments(id)`, and `consultations.patient_id` references `patients(id)`.
4. THE API SHALL enforce a `UNIQUE` constraint on `consultations.appointment_id` to guarantee the one-to-one relationship between appointments and consultations.
5. THE API SHALL enforce a `UNIQUE` constraint on `users.email` to prevent duplicate staff accounts.
6. WHEN a database connection error occurs, THE API SHALL log the error using `error_log()` and return HTTP 500 without exposing internal error details to the client.

---

### Requirement 14: Input Validation and Sanitization

**User Story:** As a security-conscious developer, I want all user-supplied input to be validated and sanitized before processing, so that the system rejects malformed data and prevents injection attacks.

#### Acceptance Criteria

1. THE API SHALL validate that all required fields are present and non-empty before executing any database operation.
2. THE API SHALL sanitize string inputs using `trim()` and `strip_tags()` before use.
3. THE API SHALL validate email addresses using `filter_var($email, FILTER_VALIDATE_EMAIL)` before querying or inserting.
4. THE API SHALL cast numeric IDs to integers using `(int)` before use in queries.
5. WHEN the request body is not valid JSON or is empty, THE API SHALL return HTTP 400 with `"message": "Invalid JSON payload"`.
6. THE API SHALL validate ENUM field values (role, gender, appointment status) against an explicit allowlist before inserting or updating.

---

### Requirement 15: Database Migrations and Seeding

**User Story:** As a developer setting up the project, I want SQL migration scripts and a seed script to create the database schema and initial admin account, so that the system is ready to use after running the scripts.

#### Acceptance Criteria

1. THE Migration scripts SHALL create the `hms_clinic_db` database if it does not exist, using `utf8mb4` character set and `utf8mb4_unicode_ci` collation.
2. THE Migration scripts SHALL create the four tables (`users`, `patients`, `appointments`, `consultations`) in dependency order: `users` first, `patients` second, `appointments` third, `consultations` fourth.
3. THE Seed script SHALL insert at least one Admin user with a Bcrypt-hashed password into the `users` table.
4. THE UsersSeeder SHALL be executable as a standalone PHP CLI script that connects to the database and inserts test users for all three roles (Admin, Receptionist, Doctor) using `password_hash()`.
