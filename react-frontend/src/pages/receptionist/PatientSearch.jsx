import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import { fetchPatients } from '../../api/patientsApi';

const NAV = [
  { label: 'Dashboard', to: '/receptionist', icon: '🏠', end: true },
  { label: 'Register Patient', to: '/receptionist/register', icon: '📋' },
  { label: 'Patient Search', to: '/receptionist/search', icon: '🔍' },
  { label: 'Book Appointment', to: '/receptionist/book', icon: '📅' },
];

const GENDER_BADGE = {
  Male: 'bg-blue-100 text-blue-700',
  Female: 'bg-pink-100 text-pink-700',
  Other: 'bg-slate-100 text-slate-600',
};

export default function PatientSearch() {
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef(null);

  // Debounced live search — fires 400ms after the user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length === 0) {
      setPatients([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      runSearch(query.trim());
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  async function runSearch(q) {
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const res = await fetchPatients(q);
      const rows = Array.isArray(res.data?.data) ? res.data.data
        : Array.isArray(res.data) ? res.data : [];
      setPatients(rows);
    } catch {
      setError('Unable to search patients. Please try again.');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardShell role="Receptionist" navItems={NAV}>
      <div className="mb-6">
        <div className="text-xs font-black tracking-widest uppercase text-blue-600 mb-1">Patient Records</div>
        <h1 className="text-2xl font-black text-slate-900">Patient Search</h1>
        <p className="text-slate-500 text-sm mt-1">Search existing patient charts by name, phone number, or patient ID.</p>
      </div>

      {/* Search input */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-5">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a patient name, phone number, or ID..."
            autoFocus
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          />
          {loading && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2">
              <svg className="animate-spin h-4 w-4 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
      )}

      {/* Results */}
      {searched && !loading && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          {patients.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <div className="text-3xl mb-3">🔍</div>
              <div className="font-bold text-slate-700 text-sm mb-1">No patients found</div>
              <div className="text-slate-400 text-xs mb-4">No records match "{query}"</div>
              <Link
                to="/receptionist/register"
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition-all duration-200"
              >
                📋 Register New Patient
              </Link>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">ID</th>
                      <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Name</th>
                      <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Age</th>
                      <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Gender</th>
                      <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Phone</th>
                      <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Address</th>
                      <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Registered</th>
                      <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((p) => (
                      <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 transition-all duration-200">
                        <td className="px-5 py-4 text-slate-400 font-mono text-xs">#{p.id}</td>
                        <td className="px-5 py-4 font-semibold text-slate-900">{p.first_name} {p.last_name}</td>
                        <td className="px-5 py-4 text-slate-600">{p.age}</td>
                        <td className="px-5 py-4">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${GENDER_BADGE[p.gender] || 'bg-slate-100 text-slate-600'}`}>
                            {p.gender}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-500">{p.phone}</td>
                        <td className="px-5 py-4 text-slate-500 max-w-xs truncate">{p.address}</td>
                        <td className="px-5 py-4 text-slate-400 text-xs">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-4">
                          <Link
                            to={`/receptionist/book?patient_id=${p.id}`}
                            className="px-3 py-1.5 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-700 transition-all duration-200"
                          >
                            Book Appt
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 border-t border-slate-50 text-xs text-slate-400">
                {patients.length} result{patients.length !== 1 ? 's' : ''} for "{query}"
              </div>
            </>
          )}
        </div>
      )}

      {/* Idle state */}
      {!searched && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-6 py-12 text-center">
          <div className="text-4xl mb-3">🗂️</div>
          <div className="font-bold text-slate-700 text-sm mb-1">Start typing to search</div>
          <div className="text-slate-400 text-xs">Results will appear automatically as you type.</div>
        </div>
      )}
    </DashboardShell>
  );
}
