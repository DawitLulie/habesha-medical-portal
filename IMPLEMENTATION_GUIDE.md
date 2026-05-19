# Project Implementation Guide

## 12 Frontend Pages from SRS Document

| # | Page Name | Role | Module | Purpose |
|---|-----------|------|--------|---------|
| 1 | Home Page | Public | N/A | Landing page with hospital intro & services |
| 2 | Login Page | Public | Authentication | Email/password authentication |
| 3 | Admin Dashboard | Admin | Dashboard | System overview - total users, patients, appointments |
| 4 | Manage Users | Admin | User Management | View/search/filter staff by role, activate/deactivate |
| 5 | Add User Form | Admin | User Management | Register new staff with fields |
| 6 | Receptionist Dashboard | Receptionist | Dashboard | Today's appointments, queue, patient summary |
| 7 | Patient List | Receptionist | Patient Management | Search patients, view details, appointment status |
| 8 | Register Patient | Receptionist | Patient Management | New patient registration form |
| 9 | Create Appointment | Receptionist | Appointment | Assign patient to doctor |
| 10 | Doctor Dashboard | Doctor | Dashboard | Assigned patients, waiting queue, appointments |
| 11 | Patient History | Doctor | Consultation | Previous consultations, diagnosis, prescriptions |
| 12 | Consultation Page | Doctor | Consultation | Doctor consultation & treatment record |

## 11 API Endpoints from Specification Document

### Authentication (1)
- `POST /auth/login.php` - Authenticate user, return bearer token

### Users Management (3)
- `GET /users/list.php` - Get all staff users (admin only)
- `POST /users/create.php` - Create new user account (admin only)
- `PUT /users/toggle-status.php` - Activate/deactivate user (admin only)

### Patients Management (3)
- `GET /patients/list.php` - Get/search patient records
- `GET /patients/detail.php` - Get specific patient details
- `POST /patients/register.php` - Register new patient

### Appointments & Queue (3)
- `POST /appointments/book.php` - Book appointment, generate queue number
- `GET /appointments/queue.php` - Get doctor's daily queue
- `PUT /appointments/update-status.php` - Update appointment status

### Consultations (2)
- `POST /consultations/submit.php` - Save consultation record
- `GET /consultations/history.php` - Get patient medical history

## 4 Database Tables from Design Document

1. **users** - Staff accounts (Admin, Receptionist, Doctor)
2. **patients** - Patient information
3. **appointments** - Appointment scheduling & queue management
4. **consultations** - Medical consultations & treatment records

---

## Frontend Implementation Checklist

- [ ] Create Router.jsx with public & protected routes
- [ ] Implement HomePage.jsx with navigation
- [ ] Build LoginPage.jsx with form validation
- [ ] Create AuthContext for state management
- [ ] Build AdminDashboard with statistics
- [ ] Implement ManageUsers with table & filters
- [ ] Create AddUserForm with validation
- [ ] Build ReceptionistDashboard with queue
- [ ] Implement PatientList with search
- [ ] Create RegisterPatient form
- [ ] Build CreateAppointment form
- [ ] Implement DoctorDashboard with queue
- [ ] Create PatientHistory view
- [ ] Build ConsultationPage with form
- [ ] Implement API services (authApi, usersApi, etc.)
- [ ] Create custom hooks (useAuth, useFetch, useForm)
- [ ] Build common components (Button, Input, Modal, Table, etc.)
- [ ] Implement layout components (Header, Sidebar, MainLayout)
- [ ] Add responsive CSS
- [ ] Implement error handling & loading states

## Backend Implementation Checklist

- [ ] Create database: hms_clinic_db
- [ ] Run migrations (create all 4 tables)
- [ ] Create Models (User, Patient, Appointment, Consultation)
- [ ] Create Controllers (Auth, Users, Patients, Appointments, Consultations)
- [ ] Implement AuthMiddleware for bearer token validation
- [ ] Implement CorsMiddleware for CORS headers
- [ ] Create API routes/handlers for all 11 endpoints
- [ ] Implement input validation in Request classes
- [ ] Implement error handling & response formatting
- [ ] Add authentication to protected endpoints
- [ ] Test all endpoints with Postman
- [ ] Implement queue number generation logic
- [ ] Add soft delete support (is_active = 0)
- [ ] Create database seeders for test data
- [ ] Implement bcrypt password hashing
- [ ] Add transaction support for appointments

## Security Requirements

- [ ] Passwords hashed with bcrypt
- [ ] Bearer token authentication
- [ ] CORS headers configured
- [ ] PDO prepared statements (no SQL injection)
- [ ] Input validation on server side
- [ ] Role-based access control
- [ ] Soft delete for users

---

**Ready to begin implementation!**
