import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function getDashboardPath(role) {
  if (role === 'Admin') return '/admin';
  if (role === 'Receptionist') return '/receptionist';
  if (role === 'Doctor') return '/doctor';
  return '/login';
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated, loading, error, setError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => { setError(null); }, [setError]);

  if (isAuthenticated && !loading) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');
    setError(null);
    try {
      const response = await login(email, password);
      const next = location.state?.from?.pathname || getDashboardPath(response.user?.role);
      navigate(next, { replace: true });
    } catch (err) {
      const status = err?.status;
      const msg = err?.message || 'Login failed.';
      if (status === 401 || status === 403 || status === 400) {
        setFormError(msg);
      } else {
        setFormError('Unable to sign in right now. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const banner = formError || error || '';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8 items-center">

        {/* ── Brand panel ──────────────────────────────────────────────── */}
        <div className="hidden md:block">
          <div className="inline-flex items-center gap-2 bg-indigo-600 text-white rounded-full px-4 py-1.5 text-xs font-black tracking-widest uppercase mb-6">
            HMS
          </div>
          <h1 className="text-4xl font-black text-slate-900 leading-tight mb-4">
            Hospital<br />Management<br />System
          </h1>
          <p className="text-slate-500 text-base leading-relaxed mb-8 max-w-sm">
            Secure access for administrators, receptionists, and doctors. Role-aware routing ensures every user lands in the right workspace.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[['01', 'Centralized login'], ['02', 'Role-aware access'], ['03', 'Queue-driven workflow']].map(([num, label]) => (
              <div key={num} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="text-indigo-600 font-black text-lg mb-1">{num}</div>
                <div className="text-slate-600 text-xs font-semibold leading-snug">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Login card ───────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-lg p-8 w-full">
          <div className="mb-6">
            <div className="text-xs font-black tracking-widest uppercase text-indigo-600 mb-2">Sign In</div>
            <h2 className="text-2xl font-black text-slate-900">Welcome back</h2>
            <p className="text-slate-500 text-sm mt-1">Use your staff credentials to continue.</p>
          </div>

          {/* Error banner — shown for 401/403/400 and network errors */}
          {banner && (
            <div
              role="alert"
              aria-live="assertive"
              className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm leading-relaxed"
            >
              <span className="mt-0.5 flex-shrink-0">⚠️</span>
              <span>{banner}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-bold text-slate-700 mb-1.5">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@hospital.com"
                autoComplete="email"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm mt-2"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Signing in...
                </>
              ) : 'Sign In'}
            </button>
          </form>

          <div className="mt-5 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Need access? Contact your administrator.</span>
            <Link to="/" className="text-indigo-600 font-semibold hover:underline">← Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
