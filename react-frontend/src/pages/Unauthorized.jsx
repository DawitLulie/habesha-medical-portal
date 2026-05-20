import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getDashboardPath(role) {
  if (role === 'Admin') return '/admin';
  if (role === 'Receptionist') return '/receptionist';
  if (role === 'Doctor') return '/doctor';
  return '/login';
}

export default function Unauthorized() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-10 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center text-3xl mx-auto mb-6">
          🔒
        </div>
        <div className="text-xs font-black tracking-widest uppercase text-red-500 mb-3">Access Denied</div>
        <h1 className="text-2xl font-black text-slate-900 mb-3">Unauthorized</h1>
        <p className="text-slate-500 text-sm leading-relaxed mb-8">
          Your account does not have permission to access this area of the Hospital Management System. Please return to your assigned workspace.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isAuthenticated ? (
            <Link
              to={getDashboardPath(user?.role)}
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all duration-200 text-sm"
            >
              Go to My Dashboard
            </Link>
          ) : (
            <Link
              to="/login"
              className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all duration-200 text-sm"
            >
              Back to Login
            </Link>
          )}
          <Link
            to="/"
            className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all duration-200 text-sm"
          >
            Public Home
          </Link>
        </div>
      </div>
    </div>
  );
}
