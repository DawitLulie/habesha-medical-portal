-- =============================================================================
-- schema.sql
-- Hospital Management System (HMS) — Combined DDL Migration Script
--
-- Run this file once against your MySQL server to create the database
-- and all four tables in the correct dependency order.
--
-- Usage (MySQL CLI):
--   mysql -u root -p < schema.sql
--
-- Usage (phpMyAdmin):
--   Open the SQL tab, paste this file, and click Go.
--
-- Engine  : InnoDB  (required for foreign keys and transactions)
-- Charset : utf8mb4 (supports Amharic and all Unicode characters)
-- =============================================================================


-- -----------------------------------------------------------------------------
-- 0. Database
-- -----------------------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS hms_clinic_db
    CHARACTER SET  utf8mb4
    COLLATE        utf8mb4_unicode_ci;

USE hms_clinic_db;


-- -----------------------------------------------------------------------------
-- 1. users
--    Must be created first — appointments references it via doctor_id.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    full_name  VARCHAR(100)    NOT NULL,
    email      VARCHAR(100)    NOT NULL,
    password   VARCHAR(255)    NOT NULL                 COMMENT 'bcrypt hash',
    phone      VARCHAR(20)         NULL DEFAULT NULL,
    role       ENUM(
                   'Admin',
                   'Receptionist',
                   'Doctor'
               )               NOT NULL,
    is_active  TINYINT(1)      NOT NULL DEFAULT 1       COMMENT '1 = active, 0 = deactivated (soft delete)',
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE  KEY uq_users_email (email)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Hospital staff accounts: Admin, Receptionist, Doctor';


-- -----------------------------------------------------------------------------
-- 2. patients
--    Must be created before appointments — appointments references it
--    via patient_id, and consultations references it via patient_id.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS patients (
    id         INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    first_name VARCHAR(50)     NOT NULL,
    last_name  VARCHAR(50)     NOT NULL,
    age        INT UNSIGNED    NOT NULL                 COMMENT 'Must be > 0',
    gender     ENUM(
                   'Male',
                   'Female',
                   'Other'
               )               NOT NULL,
    phone      VARCHAR(20)     NOT NULL,
    address    TEXT            NOT NULL,
    created_at TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id)

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Patient registration records';


-- -----------------------------------------------------------------------------
-- 3. appointments
--    References users(id) for doctor_id and patients(id) for patient_id.
--    queue_number is generated atomically by the application layer using
--    SELECT COALESCE(MAX(queue_number), 0) + 1 inside a transaction.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS appointments (
    id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    patient_id       INT UNSIGNED    NOT NULL,
    doctor_id        INT UNSIGNED    NOT NULL,
    appointment_date DATE            NOT NULL,
    queue_number     INT UNSIGNED    NOT NULL             COMMENT 'Sequential per doctor per day',
    status           ENUM(
                         'Scheduled',
                         'In-Consultation',
                         'Completed',
                         'Cancelled'
                     )               NOT NULL DEFAULT 'Scheduled',
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),

    CONSTRAINT fk_appointments_patient
        FOREIGN KEY (patient_id)
        REFERENCES  patients (id)
        ON UPDATE   CASCADE,

    CONSTRAINT fk_appointments_doctor
        FOREIGN KEY (doctor_id)
        REFERENCES  users (id)
        ON UPDATE   CASCADE

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Appointment scheduling and daily queue management';


-- -----------------------------------------------------------------------------
-- 4. consultations
--    References appointments(id) and patients(id).
--    The UNIQUE constraint on appointment_id enforces the one-to-one
--    relationship: each appointment can have at most one consultation.
-- -----------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS consultations (
    id                INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    appointment_id    INT UNSIGNED    NOT NULL,
    patient_id        INT UNSIGNED    NOT NULL,
    symptoms          TEXT            NOT NULL,
    diagnosis         TEXT            NOT NULL,
    prescription      TEXT            NOT NULL,
    notes             TEXT                NULL DEFAULT NULL,
    consultation_date TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE  KEY uq_consultations_appointment (appointment_id),

    CONSTRAINT fk_consultations_appointment
        FOREIGN KEY (appointment_id)
        REFERENCES  appointments (id)
        ON UPDATE   CASCADE,

    CONSTRAINT fk_consultations_patient
        FOREIGN KEY (patient_id)
        REFERENCES  patients (id)
        ON UPDATE   CASCADE

) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci
  COMMENT = 'Doctor consultation records: symptoms, diagnosis, prescription, notes';


-- =============================================================================
-- Schema creation complete.
-- Run database/seeds/UsersSeeder.php next to populate test accounts.
-- =============================================================================
