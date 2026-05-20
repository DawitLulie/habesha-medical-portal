/**
 * DashboardShell.jsx
 * Shared sidebar + topbar layout wrapper for all three role dashboards.
 *
 * Design: White-label professional medical aesthetic.
 * - Dark slate sidebar (slate-900) with unified indigo-600 active accent
 * - Clean white topbar with subtle shadow
 * - Bright white main content canvas
 */
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ROLE_LABEL = {
  Admin: 'Administrator Console',
  Receptionist: 'Reception Desk',
  Doctor: 'Doctor Evaluation Desk',
};

// Spinner used in the loading state of ProtectedRoute
function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
    </svg>
  );
}

export default function DashboardShell({ role, navItems = [], children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">

      {/* ── Sidebar ──────────────────────────────────────────────────── */}
      <aside
        className={`${sidebarOpen ? 'w-60' : 'w-16'} flex-shrink-0 bg-slate-900 text-white flex flex-col transition-all duration-200`}
      >
        {/* Brand */}
        <div className="flex items-center gap-3 px-4 py-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
            H
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden">
              <div className="font-black text-sm leading-tight truncate text-white">Habesha HMS</div>
              <div className="text-slate-400 text-xs truncate">{ROLE_LABEL[role]}</div>
            </div>
          )}
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <span className="text-base flex-shrink-0 leading-none">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-slate-800 p-3">
          {sidebarOpen && (
            <div className="flex items-center gap-2 mb-2 px-1">
              <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xs flex-shrink-0">
                {user?.full_name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-white truncate">{user?.full_name || 'User'}</div>
                <div className="text-xs text-slate-400 truncate">{user?.role}</div>
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-all duration-200"
          >
            <span className="flex-shrink-0 text-base leading-none">🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* ── Main content area ────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-20 shadow-sm">
          <button
            type="button"
            onClick={() => setSidebarOpen((v) => !v)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-all duration-200 text-lg leading-none"
            aria-label="Toggle sidebar"
          >
            ☰
          </button>
          <div className="flex items-center gap-3 ml-auto">
            <div className="text-xs text-slate-400 font-medium hidden sm:block">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
            <div className="px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-xs font-semibold">
              {user?.role}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
