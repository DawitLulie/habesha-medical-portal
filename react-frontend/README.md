# Hospital Management System - Frontend

## Overview
React-based web interface for Hospital Management System

## Installation

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update the API URL to match your backend:
```
REACT_APP_API_URL=http://localhost/HMS/backend/api/v1
```

## Running the Application

### Development Mode
```bash
npm start
```
Opens [http://localhost:3000](http://localhost:3000)

### Build for Production
```bash
npm build
```

### Run Tests
```bash
npm test
```

## Project Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── components/          # Reusable components
│   ├── pages/               # Page components
│   ├── services/            # API calls
│   ├── hooks/               # Custom hooks
│   ├── context/             # React context
│   ├── utils/               # Helper functions
│   ├── assets/              # Images, fonts
│   ├── styles/              # CSS files
│   ├── App.js
│   └── index.js
├── package.json
└── .env.example
```

## Key Pages

- **Dashboard** - Overview of system statistics
- **Patients** - Manage patient records
- **Doctors** - Manage doctor profiles
- **Appointments** - Schedule and manage appointments
- **Billing** - Manage patient billing and invoices

## Features

- User authentication
- Patient management
- Doctor management
- Appointment scheduling
- Billing system
- Dashboard with statistics

## Technologies Used

- React 18
- React Router v6
- Axios for API calls
- React Toastify for notifications
- Date-fns for date handling

## API Integration

All API calls are made through service files in `src/services/`:
- `authService.js` - Authentication
- `patientService.js` - Patient operations
- `doctorService.js` - Doctor operations
- `appointmentService.js` - Appointment operations
- `billingService.js` - Billing operations
- `dashboardService.js` - Dashboard data

## Notes

- Token is stored in localStorage
- API base URL is configurable via `.env`
- Automatic logout on 401 Unauthorized responses

## License
All rights reserved
