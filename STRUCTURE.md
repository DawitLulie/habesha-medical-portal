# Hospital Management System (HMS)

## Project Structure - Document-Driven Organization

This project is structured based on the requirements from 3 specification documents:
- **HMS_SRS.docx** - System Requirements Specification (12 pages, 5 modules)
- **HMS_API ENDPOINT SPECIFICATION DOCUMENT.docx** - REST API endpoints
- **HMS_DATABASE DESIGN DOCUMENT.docx** - Database schema design

---

## 📁 FRONTEND STRUCTURE

### Pages (12 exactly as per SRS)

```
src/pages/
├── public/
│   ├── HomePage.jsx          # Page 1: Public landing page
│   └── LoginPage.jsx         # Page 2: Authentication page
├── admin/
│   ├── AdminDashboard.jsx    # Page 3: Admin control panel
│   ├── ManageUsers.jsx       # Page 4: Manage hospital staff
│   └── AddUserForm.jsx       # Page 5: Register new staff
├── receptionist/
│   ├── ReceptionistDashboard.jsx  # Page 6: Today's appointments & queue
│   ├── PatientList.jsx            # Page 7: Search patients
│   ├── RegisterPatient.jsx        # Page 8: Patient registration
│   └── CreateAppointment.jsx      # Page 9: Assign patient to doctor
└── doctor/
    ├── DoctorDashboard.jsx    # Page 10: Assigned patients & queue
    ├── PatientHistory.jsx     # Page 11: Consultation history
    └── ConsultationPage.jsx   # Page 12: Doctor consultation form
```

### Components

```
src/components/
├── common/           # Reusable UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Modal.jsx
│   ├── Table.jsx
│   ├── Card.jsx
│   ├── Alert.jsx
│   └── Loader.jsx
├── forms/            # Form components
│   ├── LoginForm.jsx
│   ├── UserForm.jsx
│   ├── PatientForm.jsx
│   ├── AppointmentForm.jsx
│   └── ConsultationForm.jsx
└── layout/           # Layout components
    ├── Header.jsx
    ├── Sidebar.jsx
    └── MainLayout.jsx
```

### API Services

```
src/api/
├── authApi.js          # Authentication endpoints
├── usersApi.js         # User management
├── patientsApi.js      # Patient operations
├── appointmentsApi.js  # Appointment management
├── consultationsApi.js # Consultation operations
└── axiosClient.js      # Axios configuration
```

### State Management & Hooks

```
src/context/
└── AuthContext.jsx     # Authentication context

src/hooks/
├── useAuth.js
├── useFetch.js
└── useForm.js
```

### Utilities

```
src/utils/
├── helpers.js
├── validators.js
├── formatters.js
└── storage.js

src/config/
├── routes.js
└── api.js

src/styles/
├── global.css
├── variables.css
└── responsive.css
```

---

## 📁 BACKEND STRUCTURE

### API Endpoints (11 exactly as per specification)

```
public/api/v1/
├── auth/
│   └── login.php                    # POST /auth/login
├── users/
│   ├── list.php                     # GET /users/list (admin)
│   ├── create.php                   # POST /users/create (admin)
│   └── toggle-status.php            # PUT /users/toggle-status (admin)
├── patients/
│   ├── list.php                     # GET /patients/list
│   ├── detail.php                   # GET /patients/detail
│   └── register.php                 # POST /patients/register
├── appointments/
│   ├── book.php                     # POST /appointments/book
│   ├── queue.php                    # GET /appointments/queue
│   └── update-status.php            # PUT /appointments/update-status
└── consultations/
    ├── submit.php                   # POST /consultations/submit
    └── history.php                  # GET /consultations/history
```

### Controllers (5)

```
app/controllers/
├── AuthController.php
├── UsersController.php
├── PatientsController.php
├── AppointmentsController.php
└── ConsultationsController.php
```

### Models (4)

```
app/models/
├── User.php          # Staff accounts
├── Patient.php       # Patient records
├── Appointment.php   # Appointments & queue
└── Consultation.php  # Consultation records
```

### Middleware

```
app/middleware/
├── AuthMiddleware.php   # Bearer token validation
└── CorsMiddleware.php   # CORS headers
```

### Database

```
database/
├── migrations/
│   ├── 001_create_users_table.sql
│   ├── 002_create_patients_table.sql
│   ├── 003_create_appointments_table.sql
│   └── 004_create_consultations_table.sql
└── seeds/
    └── UsersSeeder.php
```

### Configuration & Helpers

```
config/
├── database.php
└── constants.php

helpers/
├── Helper.php
└── Validator.php

storage/
└── uploads/
```

---

## 🗄️ DATABASE SCHEMA (4 Tables)

### 1. users (Staff Accounts)
- id (PRIMARY KEY)
- full_name
- email (UNIQUE)
- password (bcrypt hashed)
- phone
- role (ENUM: Admin, Receptionist, Doctor)
- is_active (soft delete)
- created_at

### 2. patients (Patient Records)
- id (PRIMARY KEY)
- first_name
- last_name
- age
- gender (ENUM: Male, Female, Other)
- phone
- address
- created_at

### 3. appointments (Scheduling & Queue)
- id (PRIMARY KEY)
- patient_id (FOREIGN KEY → patients)
- doctor_id (FOREIGN KEY → users)
- appointment_date
- queue_number
- status (ENUM: Scheduled, In-Consultation, Completed, Cancelled)
- created_at

### 4. consultations (Medical Records)
- id (PRIMARY KEY)
- appointment_id (FOREIGN KEY → appointments, UNIQUE)
- patient_id (FOREIGN KEY → patients)
- symptoms
- diagnosis
- prescription
- notes
- consultation_date

---

## 🔐 AUTHENTICATION & AUTHORIZATION

### Roles
- **Admin** - System management (users/*)
- **Receptionist** - Patient & appointment management (patients/*, appointments/*)
- **Doctor** - Queue & consultation (appointments/queue, consultations/*)

### Bearer Token
- All protected endpoints require: `Authorization: Bearer <TOKEN>`
- Tokens generated on login

---

## 🌐 API RESPONSE FORMAT

All endpoints return JSON with structure:
```json
{
  "status": "success|error",
  "message": "Description",
  "data": {}
}
```

---

## 📝 MODULES IMPLEMENTED

1. **Authentication Module** - Login with role-based redirect
2. **User Management Module** - Add/manage staff (admin only)
3. **Patient Management Module** - Register/search patients
4. **Appointment Module** - Book appointments, manage queue
5. **Consultation Module** - Record symptoms, diagnosis, prescriptions

---

## 🚀 KEY FEATURES

✅ Clean separation of concerns  
✅ Role-based access control (RBAC)  
✅ Queue management system  
✅ Medical history tracking  
✅ Secure bearer token authentication  
✅ CORS-enabled REST API  
✅ Prepared statements (PDO) for security  
✅ Soft delete for data integrity  
✅ Responsive React frontend  

---

## 📌 TECH STACK

- **Frontend**: React 18 + Axios + React Router
- **Backend**: PHP 8+ (Core PHP, no framework)
- **Database**: MySQL with InnoDB
- **Server**: XAMPP/Apache
- **Base API URL**: http://localhost/hms-api/v1

---

**Status**: ✅ Structure complete and ready for implementation
