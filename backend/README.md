# Hospital Management System - Backend API

## Overview
PHP REST API for Hospital Management System

## Setup Instructions

### 1. Environment Configuration
Copy `.env.example` to `.env` and update with your settings:
```bash
cp .env.example .env
```

### 2. Database Setup
- Create a MySQL database named `hms_db`
- Run migration files from `database/migrations/` folder
- (Optional) Seed sample data from `database/seeds/seed_data.sql`

### 3. Directory Permissions
Ensure `uploads/` and `logs/` directories are writable:
```bash
chmod 755 uploads logs
```

## API Documentation

### Base URL
```
http://localhost/HMS/backend/api/v1
```

### Authentication
Include Bearer token in Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `GET /auth/me` - Get current user

### Patients
- `GET /patients` - Get all patients
- `GET /patients/:id` - Get patient by ID
- `POST /patients` - Create patient
- `PUT /patients/:id` - Update patient
- `DELETE /patients/:id` - Delete patient

### Doctors
- `GET /doctors` - Get all doctors
- `GET /doctors/:id` - Get doctor by ID
- `POST /doctors` - Create doctor
- `PUT /doctors/:id` - Update doctor
- `DELETE /doctors/:id` - Delete doctor

### Appointments
- `GET /appointments` - Get all appointments
- `GET /appointments/:id` - Get appointment by ID
- `POST /appointments` - Create appointment
- `PUT /appointments/:id` - Update appointment
- `DELETE /appointments/:id` - Delete appointment

### Billing
- `GET /billings` - Get all billings
- `GET /billings/:id` - Get billing by ID
- `POST /billings` - Create billing
- `PUT /billings/:id` - Update billing
- `DELETE /billings/:id` - Delete billing

### Dashboard
- `GET /dashboard/stats` - Get statistics
- `GET /dashboard/recent-patients` - Get recent patients
- `GET /dashboard/recent-appointments` - Get recent appointments

## Project Structure
```
backend/
├── api/
│   └── v1/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       └── middleware/
├── config/
├── database/
│   ├── migrations/
│   └── seeds/
├── utils/
├── logs/
├── uploads/
└── index.php
```

## Technologies Used
- PHP 7.4+
- MySQL
- REST API

## License
All rights reserved
