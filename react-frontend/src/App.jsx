import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';


// Public pages
import Home from './pages/Home';
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import StaffList from './pages/admin/StaffList';
import CreateStaff from './pages/admin/CreateStaff';

// Receptionist pages
import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import RegisterPatient from './pages/receptionist/RegisterPatient';
import PatientSearch from './pages/receptionist/PatientSearch';
import BookAppointment from './pages/receptionist/BookAppointment';

// Doctor pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import ConsultationDesk from './pages/doctor/ConsultationDesk';

function getDashboardPath(role) {
  if (role === 'Admin') return '/admin';
  if (role === 'Receptionist') return '/receptionist';
  if (role === 'Doctor') return '/doctor';
  return '/login';
}

function HomeRedirect() {
  const { isAuthenticated, loading, user } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-slate-400 text-sm animate-pulse">Loading...</div>
      </div>
    );
  }
  if (isAuthenticated) return <Navigate to={getDashboardPath(user?.role)} replace />;
  return <Home />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<HomeRedirect />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute allowedRoles={['Admin']}><StaffList /></ProtectedRoute>} />
      <Route path="/admin/staff/create" element={<ProtectedRoute allowedRoles={['Admin']}><CreateStaff /></ProtectedRoute>} />

      {/* Receptionist */}
      <Route path="/receptionist" element={<ProtectedRoute allowedRoles={['Receptionist']}><ReceptionistDashboard /></ProtectedRoute>} />
      <Route path="/receptionist/register" element={<ProtectedRoute allowedRoles={['Receptionist']}><RegisterPatient /></ProtectedRoute>} />
      <Route path="/receptionist/search" element={<ProtectedRoute allowedRoles={['Receptionist']}><PatientSearch /></ProtectedRoute>} />
      <Route path="/receptionist/book" element={<ProtectedRoute allowedRoles={['Receptionist']}><BookAppointment /></ProtectedRoute>} />

      {/* Doctor */}
      <Route path="/doctor" element={<ProtectedRoute allowedRoles={['Doctor']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/consult/:appointmentId" element={<ProtectedRoute allowedRoles={['Doctor']}><ConsultationDesk /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
