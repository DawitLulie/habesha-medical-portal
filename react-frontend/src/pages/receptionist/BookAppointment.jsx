import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import { bookAppointment } from '../../api/appointmentsApi';

const NAV = [
  { label: 'Dashboard', to: '/receptionist', icon: '🏠', end: true },
  { label: 'Register Patient', to: '/receptionist/register', icon: '📋' },
  { label: 'Patient Search', to: '/receptionist/search', icon: '🔍' },
  { label: 'Book Appointment', to: '/receptionist/book', icon: '📅' },
];

const STATUS_BADGE = {
  Scheduled: 'bg-blue-100 text-blue-700',
  'In-Consultation': 'bg-amber-100 text-amber-700',
  Completed: 'bg-emerald-100 text-emerald-700',
  Cancelled: 'bg-red-100 text-red-600',
};

export default function BookAppointment() {
  const [searchParams] = useSearchParams();
  const prefillPatientId = searchParams.get('patient_id') || '';

  const [form, setForm] = useState({
    patient_id: prefillPatientId,
    doctor_id: '',
    appointment_date: new Date().toISOString().split('T')[0],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  // If patient_id arrives via URL query, pre-fill it
  useEffect(() => {
    if (prefillPatientId) {
      setForm((prev) => ({ ...prev, patient_id: prefillPatientId }));
    }
  }, [prefillPatientId]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    setResult(null);
    try {
      const res = await bookAppointment({
        patient_id: Number(form.patient_id),
        doctor_id: Number(form.doctor_id),
        appointment_date: form.appointment_date,
      });
      setResult({
        appointment_id: res.data?.appointment_id,
        queue_number: res.data?.queue_number,
        appointment_status: res.data?.appointment_status || 'Scheduled',
      });
      setForm((prev) => ({ ...prev, patient_id: '', doctor_id: '' }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to book appointment. Please verify the patient and doctor IDs.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <DashboardShell role="Receptionist" navItems={NAV}>
      <div className="mb-6">
        <div className="text-xs font-black tracking-widest uppercase text-blue-600 mb-1">Scheduling Desk</div>
        <h1 className="text-2xl font-black text-slate-900">Book Appointment</h1>
        <p className="text-slate-500 text-sm mt-1">Link a patient to a doctor. The system will assign a queue number automatically.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 items-start">

        {/* Form */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
              <span className="mt-0.5">⚠️</span><span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="patient_id" className="block text-sm font-bold text-slate-700 mb-1.5">
                Patient ID <span className="text-red-500">*</span>
              </label>
              <input
                id="patient_id" name="patient_id" type="number" min="1" step="1"
                value={form.patient_id} onChange={handleChange}
                placeholder="e.g. 45" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
              <p className="text-xs text-slate-400 mt-1">
                Don't know the ID?{' '}
                <Link to="/receptionist/search" className="text-blue-600 font-semibold hover:underline">Search patient records</Link>
              </p>
            </div>

            <div>
              <label htmlFor="doctor_id" className="block text-sm font-bold text-slate-700 mb-1.5">
                Doctor ID <span className="text-red-500">*</span>
              </label>
              <input
                id="doctor_id" name="doctor_id" type="number" min="1" step="1"
                value={form.doctor_id} onChange={handleChange}
                placeholder="e.g. 3" required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="appointment_date" className="block text-sm font-bold text-slate-700 mb-1.5">
                Appointment Date <span className="text-red-500">*</span>
              </label>
              <input
                id="appointment_date" name="appointment_date" type="date"
                value={form.appointment_date} onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
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
                    Booking...
                  </>
                ) : 'Book Appointment'}
              </button>
              <Link to="/receptionist" className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all duration-200 text-sm">
                Cancel
              </Link>
            </div>
          </form>
        </div>

        {/* Queue confirmation card */}
        <div>
          {result ? (
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 text-white shadow-lg">
              <div className="text-xs font-black tracking-widest uppercase text-emerald-100 mb-4">Appointment Confirmed</div>
              <div className="text-center mb-6">
                <div className="text-xs font-bold text-emerald-200 mb-1">Queue Number Assigned</div>
                <div className="text-7xl font-black leading-none">{result.queue_number}</div>
              </div>
              <div className="space-y-3 bg-white/10 rounded-xl p-4 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200 font-semibold">Appointment ID</span>
                  <span className="font-black">#{result.appointment_id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-emerald-200 font-semibold">Status</span>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_BADGE[result.appointment_status] || 'bg-white/20 text-white'}`}>
                    {result.appointment_status}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setResult(null)}
                className="mt-5 w-full py-2.5 bg-white/20 hover:bg-white/30 text-white font-bold rounded-xl text-sm transition-all duration-200"
              >
                Book Another Appointment
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 text-center">
              <div className="text-4xl mb-3">📋</div>
              <div className="font-bold text-slate-700 text-sm mb-1">Queue confirmation</div>
              <div className="text-slate-400 text-xs leading-relaxed">
                After booking, the system will display the patient's assigned queue number here.
              </div>
            </div>
          )}

          {/* Lifecycle reminder */}
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mt-4">
            <div className="text-xs font-black tracking-widest uppercase text-slate-400 mb-3">Appointment Lifecycle</div>
            <div className="space-y-2">
              {[
                ['Scheduled', 'bg-blue-100 text-blue-700', 'Booked, awaiting doctor'],
                ['In-Consultation', 'bg-amber-100 text-amber-700', 'Doctor admitted patient'],
                ['Completed', 'bg-emerald-100 text-emerald-700', 'Consultation submitted'],
                ['Cancelled', 'bg-red-100 text-red-600', 'Appointment cancelled'],
              ].map(([status, cls, desc]) => (
                <div key={status} className="flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex-shrink-0 ${cls}`}>{status}</span>
                  <span className="text-slate-500 text-xs">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
