import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import { createUser } from '../../api/usersApi';

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: '🏠', end: true },
  { label: 'Staff List', to: '/admin/staff', icon: '👥' },
  { label: 'Create Staff', to: '/admin/staff/create', icon: '➕' },
];

const INITIAL = { full_name: '', email: '', password: '', phone: '', role: 'Doctor' };

export default function CreateStaff() {
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await createUser(form);
      setSuccess(res.data?.message || 'Staff account created successfully.');
      setForm(INITIAL);
      setTimeout(() => navigate('/admin/staff'), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to create user. Please check the details and try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell role="Admin" navItems={NAV}>
      <div className="mb-6">
        <div className="text-xs font-black tracking-widest uppercase text-indigo-600 mb-1">Create Staff</div>
        <h1 className="text-2xl font-black text-slate-900">Register New User</h1>
        <p className="text-slate-500 text-sm mt-1">Create a new administrator, doctor, or receptionist account.</p>
      </div>

      <div className="max-w-2xl">
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
            <span className="mt-0.5">⚠️</span><span>{error}</span>
          </div>
        )}
        {success && (
          <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-5">
            <span className="mt-0.5">✅</span><span>{success} Redirecting to staff list...</span>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Full name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-bold text-slate-700 mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                value={form.full_name}
                onChange={handleChange}
                placeholder="e.g. Dr. Abebe Kebede"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="abebe@hospital.com"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
              <p className="text-xs text-slate-400 mt-1">Must be unique across all staff accounts.</p>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5">
                Password <span className="text-red-500">*</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                required
                minLength={8}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
              <p className="text-xs text-slate-400 mt-1">Stored securely using bcrypt hashing.</p>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-1.5">
                Phone Number
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="e.g. 0911223344"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              />
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-bold text-slate-700 mb-1.5">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
              >
                <option value="Admin">Admin</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Doctor">Doctor</option>
              </select>
              <p className="text-xs text-slate-400 mt-1">Determines which areas of the system this user can access.</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md shadow-indigo-100 text-sm"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Creating account...
                  </>
                ) : 'Create Account'}
              </button>
              <Link
                to="/admin/staff"
                className="px-6 py-2.5 bg-white text-slate-600 border border-slate-200 font-medium rounded-lg hover:bg-slate-50 transition-all duration-200 text-sm"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
