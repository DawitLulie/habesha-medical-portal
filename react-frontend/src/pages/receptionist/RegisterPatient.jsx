import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import { registerPatient } from '../../api/patientsApi';

const NAV = [
  { label: 'Dashboard', to: '/receptionist', icon: '🏠', end: true },
  { label: 'Register Patient', to: '/receptionist/register', icon: '📋' },
  { label: 'Patient Search', to: '/receptionist/search', icon: '🔍' },
  { label: 'Book Appointment', to: '/receptionist/book', icon: '📅' },
];

const INITIAL = { first_name: '', last_name: '', age: '', gender: 'Female', phone: '', address: '' };

export default function RegisterPatient() {
  const [form, setForm] = useState(INITIAL);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [createdId, setCreatedId] = useState(null);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setCreatedId(null);
    try {
      const res = await registerPatient({
        ...form,
        age: Number(form.age),
      });
      setCreatedId(res.data?.patient_id);
      setForm(INITIAL);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to register patient. Please check the details.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell role="Receptionist" navItems={NAV}>
      <div className="mb-6">
        <div className="text-xs font-black tracking-widest uppercase text-blue-600 mb-1">Patient Intake</div>
        <h1 className="text-2xl font-black text-slate-900">Register New Patient</h1>
        <p className="text-slate-500 text-sm mt-1">Create a new patient profile with demographic information.</p>
      </div>

      <div className="max-w-2xl">
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
            <span className="mt-0.5">⚠️</span><span>{error}</span>
          </div>
        )}

        {/* Success card */}
        {createdId && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 mb-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">✅</span>
              <div>
                <div className="font-bold text-emerald-800 text-sm">Patient registered successfully</div>
                <div className="text-emerald-700 text-xs mt-0.5">Patient ID assigned: <strong className="font-black">#{createdId}</strong></div>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                to={`/receptionist/book`}
                className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg text-xs hover:bg-emerald-700 transition-all duration-200"
              >
                Book Appointment for #{createdId}
              </Link>
              <button
                type="button"
                onClick={() => setCreatedId(null)}
                className="px-4 py-2 bg-white border border-emerald-200 text-emerald-700 font-bold rounded-lg text-xs hover:bg-emerald-50 transition-all duration-200"
              >
                Register Another
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first_name" className="block text-sm font-bold text-slate-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="first_name" name="first_name" type="text"
                  value={form.first_name} onChange={handleChange}
                  placeholder="Sara" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="last_name" name="last_name" type="text"
                  value={form.last_name} onChange={handleChange}
                  placeholder="Tadesse" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
            </div>

            {/* Age + Gender row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="age" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Age <span className="text-red-500">*</span>
                </label>
                <input
                  id="age" name="age" type="number" min="1" max="150" step="1"
                  value={form.age} onChange={handleChange}
                  placeholder="28" required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                />
              </div>
              <div>
                <label htmlFor="gender" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  id="gender" name="gender"
                  value={form.gender} onChange={handleChange} required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-bold text-slate-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                id="phone" name="phone" type="tel"
                value={form.phone} onChange={handleChange}
                placeholder="0911223344" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>

            {/* Address */}
            <div>
              <label htmlFor="address" className="block text-sm font-bold text-slate-700 mb-1.5">
                Address <span className="text-red-500">*</span>
              </label>
              <input
                id="address" name="address" type="text"
                value={form.address} onChange={handleChange}
                placeholder="Addis Ababa, Bole Sub-city" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm text-sm"
              >
                {saving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Registering...
                  </>
                ) : 'Register Patient'}
              </button>
              <Link to="/receptionist" className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all duration-200 text-sm">
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </DashboardShell>
  );
}
