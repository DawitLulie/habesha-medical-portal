import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import { fetchUsers } from '../../api/usersApi';

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: '🏠', end: true },
  { label: 'Staff List', to: '/admin/staff', icon: '👥' },
  { label: 'Create Staff', to: '/admin/staff/create', icon: '➕' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, active: 0, inactive: 0, admins: 0, doctors: 0, receptionists: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetchUsers();
        const users = Array.isArray(res.data?.data) ? res.data.data : [];
        if (active) {
          setStats({
            total: users.length,
            active: users.filter((u) => Number(u.is_active) === 1).length,
            inactive: users.filter((u) => Number(u.is_active) === 0).length,
            admins: users.filter((u) => u.role === 'Admin').length,
            doctors: users.filter((u) => u.role === 'Doctor').length,
            receptionists: users.filter((u) => u.role === 'Receptionist').length,
          });
        }
      } catch {
        if (active) setError('Unable to load staff statistics.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  const metricCards = [
    { label: 'Total Staff', value: stats.total, icon: '👥', color: 'bg-indigo-50 text-indigo-700 border-indigo-100' },
    { label: 'Active Accounts', value: stats.active, icon: '✅', color: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
    { label: 'Inactive Accounts', value: stats.inactive, icon: '⛔', color: 'bg-red-50 text-red-700 border-red-100' },
    { label: 'Administrators', value: stats.admins, icon: '🛡️', color: 'bg-violet-50 text-violet-700 border-violet-100' },
    { label: 'Doctors', value: stats.doctors, icon: '🩺', color: 'bg-blue-50 text-blue-700 border-blue-100' },
    { label: 'Receptionists', value: stats.receptionists, icon: '🖥️', color: 'bg-amber-50 text-amber-700 border-amber-100' },
  ];

  return (
    <DashboardShell role="Admin" navItems={NAV}>
      <div className="mb-6">
        <div className="text-xs font-black tracking-widest uppercase text-indigo-600 mb-1">Administrator Console</div>
        <h1 className="text-2xl font-black text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Operational metrics for the hospital staff roster.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-6">{error}</div>
      )}

      {/* Metric grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        {metricCards.map((card) => (
          <div key={card.label} className={`bg-white rounded-xl border shadow-sm p-5 ${card.color.split(' ')[2]}`}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xl">{card.icon}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${card.color}`}>{card.label}</span>
            </div>
            <div className="text-3xl font-black text-slate-900">
              {loading ? <span className="animate-pulse text-slate-300">—</span> : card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">Quick Actions</div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Link
            to="/admin/staff"
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-xl group-hover:bg-violet-200 transition-all duration-200">👥</div>
            <div>
              <div className="font-bold text-slate-900 text-sm">View Staff List</div>
              <div className="text-slate-500 text-xs mt-0.5">Browse and manage all staff accounts</div>
            </div>
          </Link>
          <Link
            to="/admin/staff/create"
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-violet-200 hover:bg-violet-50 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center text-xl group-hover:bg-violet-200 transition-all duration-200">➕</div>
            <div>
              <div className="font-bold text-slate-900 text-sm">Create New Staff</div>
              <div className="text-slate-500 text-xs mt-0.5">Register a new administrator, doctor, or receptionist</div>
            </div>
          </Link>
        </div>
      </div>
    </DashboardShell>
  );
}
