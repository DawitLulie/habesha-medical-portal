import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import { fetchUsers, toggleUserStatus } from '../../api/usersApi';

const NAV = [
  { label: 'Dashboard', to: '/admin', icon: '🏠', end: true },
  { label: 'Staff List', to: '/admin/staff', icon: '👥' },
  { label: 'Create Staff', to: '/admin/staff/create', icon: '➕' },
];

const ROLE_BADGE = {
  Admin: 'bg-violet-100 text-violet-700',
  Doctor: 'bg-blue-100 text-blue-700',
  Receptionist: 'bg-amber-100 text-amber-700',
};

export default function StaffList() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const res = await fetchUsers();
        const rows = Array.isArray(res.data?.data) ? res.data.data : [];
        if (active) setStaff(rows);
      } catch {
        if (active) setError('Unable to load staff list.');
      } finally {
        if (active) setLoading(false);
      }
    }
    load();
    return () => { active = false; };
  }, []);

  async function handleToggle(member) {
    const nextStatus = Number(member.is_active) === 1 ? 0 : 1;
    setTogglingId(member.id);
    setError('');
    setSuccess('');
    try {
      await toggleUserStatus(member.id, nextStatus);
      setStaff((prev) => prev.map((u) => u.id === member.id ? { ...u, is_active: nextStatus } : u));
      setSuccess(`${member.full_name} has been ${nextStatus === 1 ? 'activated' : 'deactivated'}.`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err?.response?.data?.message || 'Unable to update status.');
    } finally {
      setTogglingId(null);
    }
  }

  const filtered = staff.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.full_name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    );
  });

  return (
    <DashboardShell role="Admin" navItems={NAV}>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="text-xs font-black tracking-widest uppercase text-violet-600 mb-1">Staff Directory</div>
          <h1 className="text-2xl font-black text-slate-900">System Users</h1>
          <p className="text-slate-500 text-sm mt-1">Manage staff accounts and toggle active status.</p>
        </div>
        <Link
          to="/admin/staff/create"
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-all duration-200 text-sm shadow-md shadow-indigo-100"
        >
          <span>➕</span> Create Staff
        </Link>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>}
      {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-4">{success}</div>}

      {/* Search */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, or role..."
          className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">ID</th>
                <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Name</th>
                <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Email</th>
                <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Phone</th>
                <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Role</th>
                <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Status</th>
                <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm animate-pulse">Loading staff members...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">No staff records found.</td></tr>
              ) : (
                filtered.map((member) => {
                  const isActive = Number(member.is_active) === 1;
                  const isToggling = togglingId === member.id;
                  return (
                    <tr key={member.id} className="border-b border-slate-50 hover:bg-slate-50 transition-all duration-200">
                      <td className="px-5 py-4 text-slate-400 font-mono text-xs">{member.id}</td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{member.full_name}</td>
                      <td className="px-5 py-4 text-slate-500">{member.email}</td>
                      <td className="px-5 py-4 text-slate-500">{member.phone || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${ROLE_BADGE[member.role] || 'bg-slate-100 text-slate-600'}`}>
                          {member.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => handleToggle(member)}
                          disabled={isToggling}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                            isActive
                              ? 'border-red-200 text-red-600 hover:bg-red-50'
                              : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          {isToggling ? (
                            <svg className="animate-spin h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                          ) : null}
                          {isToggling ? 'Updating...' : isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-slate-50 text-xs text-slate-400">
            Showing {filtered.length} of {staff.length} staff members
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
