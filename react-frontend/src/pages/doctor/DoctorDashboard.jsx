import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import { useAuth } from '../../context/AuthContext';
import { fetchQueue, updateAppointmentStatus } from '../../api/appointmentsApi';

const NAV = [
  { label: 'Dashboard', to: '/doctor', icon: '🏠', end: true },
];

const STATUS_STYLE = {
  Scheduled: { badge: 'bg-blue-100 text-blue-700', dot: 'bg-blue-500' },
  'In-Consultation': { badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  Completed: { badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  Cancelled: { badge: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
};

export default function DoctorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [admittingId, setAdmittingId] = useState(null);

  const loadQueue = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetchQueue(user.id);
      let list = Array.isArray(res.data?.data) ? res.data.data
        : Array.isArray(res.data?.queue) ? res.data.queue
        : Array.isArray(res.data) ? res.data : [];
      list.sort((a, b) => Number(a.queue_number) - Number(b.queue_number));
      setQueue(list);
    } catch {
      setError('Unable to load today\'s queue.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { loadQueue(); }, [loadQueue]);

  async function handleAdmit(item) {
    const apptId = item.appointment_id || item.id;
    setAdmittingId(apptId);
    try {
      await updateAppointmentStatus(apptId, 'In-Consultation');
      // Optimistic update
      setQueue((prev) => prev.map((q) => {
        const id = q.appointment_id || q.id;
        return String(id) === String(apptId) ? { ...q, status: 'In-Consultation' } : q;
      }));
      // Navigate to consultation desk
      navigate(`/doctor/consult/${apptId}`);
    } catch {
      setError('Unable to admit patient. Please try again.');
    } finally {
      setAdmittingId(null);
    }
  }

  const scheduled = queue.filter((q) => q.status === 'Scheduled');
  const inConsultation = queue.filter((q) => q.status === 'In-Consultation');
  const completed = queue.filter((q) => q.status === 'Completed');

  return (
    <DashboardShell role="Doctor" navItems={NAV}>
      <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
        <div>
          <div className="text-xs font-black tracking-widest uppercase text-indigo-600 mb-1">Doctor Evaluation Desk</div>
          <h1 className="text-2xl font-black text-slate-900">Today's Patient Queue</h1>
          <p className="text-slate-500 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <button
          type="button"
          onClick={loadQueue}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 disabled:opacity-50 transition-all duration-200 text-sm shadow-sm"
        >
          {loading ? (
            <svg className="animate-spin h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
            </svg>
          ) : '🔄'}
          Refresh Queue
        </button>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          ['Scheduled', scheduled.length, 'bg-blue-50 border-blue-100 text-blue-700'],
          ['In-Consultation', inConsultation.length, 'bg-amber-50 border-amber-100 text-amber-700'],
          ['Completed', completed.length, 'bg-emerald-50 border-emerald-100 text-emerald-700'],
        ].map(([label, count, cls]) => (
          <div key={label} className={`rounded-xl border p-4 ${cls}`}>
            <div className="text-2xl font-black">{count}</div>
            <div className="text-xs font-bold mt-1">{label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-4">{error}</div>
      )}

      {/* Queue table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="font-black text-slate-900 text-sm">Active Queue</div>
          <div className="text-xs text-slate-400">{queue.length} total appointment{queue.length !== 1 ? 's' : ''} today</div>
        </div>

        {loading ? (
          <div className="px-5 py-12 text-center text-slate-400 text-sm animate-pulse">Loading today's queue...</div>
        ) : queue.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <div className="text-3xl mb-3">🗓️</div>
            <div className="font-bold text-slate-700 text-sm mb-1">No appointments today</div>
            <div className="text-slate-400 text-xs">Your queue is empty for today.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Queue #</th>
                  <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Patient</th>
                  <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Age</th>
                  <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Gender</th>
                  <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-black tracking-widest uppercase text-slate-400">Action</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => {
                  const apptId = item.appointment_id || item.id;
                  const status = item.status || 'Scheduled';
                  const style = STATUS_STYLE[status] || STATUS_STYLE.Scheduled;
                  const isAdmitting = admittingId === apptId;
                  const firstName = item.first_name || item.patient?.first_name || '';
                  const lastName = item.last_name || item.patient?.last_name || '';
                  const age = item.age || item.patient?.age || '—';
                  const gender = item.gender || item.patient?.gender || '—';

                  return (
                    <tr key={apptId} className="border-b border-slate-50 hover:bg-slate-50 transition-all duration-200">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${style.dot}`} />
                          <span className="font-black text-slate-900 text-base">{item.queue_number}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{firstName} {lastName}</td>
                      <td className="px-5 py-4 text-slate-600">{age}</td>
                      <td className="px-5 py-4 text-slate-600">{gender}</td>
                      <td className="px-5 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${style.badge}`}>{status}</span>
                      </td>
                      <td className="px-5 py-4">
                        {status === 'Scheduled' ? (
                          <button
                            type="button"
                            onClick={() => handleAdmit(item)}
                            disabled={isAdmitting}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white font-bold rounded-lg text-xs hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                          >
                            {isAdmitting ? (
                              <svg className="animate-spin h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                              </svg>
                            ) : null}
                            {isAdmitting ? 'Admitting...' : 'Admit Patient'}
                          </button>
                        ) : status === 'In-Consultation' ? (
                          <button
                            type="button"
                            onClick={() => navigate(`/doctor/consult/${apptId}`)}
                            className="px-3 py-1.5 bg-amber-500 text-white font-bold rounded-lg text-xs hover:bg-amber-600 transition-all duration-200"
                          >
                            Resume
                          </button>
                        ) : (
                          <span className="text-slate-300 text-xs">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
