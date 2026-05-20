import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DEPARTMENTS = [
  {
    icon: '🚨',
    title: 'Emergency & Trauma Care',
    desc: '24/7 rapid stabilization, ambulance routing, and critical patient tracking across all acuity levels.',
  },
  {
    icon: '🩺',
    title: 'General & Internal Medicine',
    desc: 'Comprehensive health evaluations, routine wellness checks, and expert diagnostic consultations.',
  },
  {
    icon: '🔬',
    title: 'Specialized Surgical Units',
    desc: 'Modern operating theaters managed by leading clinical specialists with advanced medical technologies.',
  },
  {
    icon: '👶',
    title: 'Pediatric & Family Health',
    desc: 'Compassionate care dedicated to the wellness of infants, children, and long-term family health.',
  },
];

function getDashboardPath(role) {
  if (role === 'Admin') return '/admin';
  if (role === 'Receptionist') return '/receptionist';
  if (role === 'Doctor') return '/doctor';
  return '/login';
}

export default function Home() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-slate-500 text-sm font-medium animate-pulse">Loading session...</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={getDashboardPath(user?.role)} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans antialiased overflow-x-hidden">

      {/* Decorative ambient canvas */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-[32rem] h-[32rem] rounded-full bg-indigo-200/50 blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-96 h-96 rounded-full bg-slate-300/60 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[28rem] h-[28rem] rounded-full bg-indigo-100/60 blur-3xl" />
      </div>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className="bg-slate-100/90 backdrop-blur-md border-b border-slate-300 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm tracking-wide shadow-md shadow-indigo-100 ring-4 ring-indigo-50">
              H
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-base leading-tight tracking-tight">Habesha Medical Center</div>
              <div className="text-xs text-indigo-600 font-medium leading-tight mt-0.5">Compassionate care · Advanced medicine · 24/7</div>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-1">
            <a href="#services" className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-all duration-200">Services</a>
            <a href="#about" className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-all duration-200">About</a>
            <a href="#contact" className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-200/80 hover:text-slate-900 transition-all duration-200">Contact</a>
            <Link
              to="/login"
              className="ml-3 inline-flex items-center justify-center bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-indigo-100 text-sm"
            >
              Staff Portal
            </Link>
          </nav>
          <Link to="/login" className="md:hidden inline-flex items-center justify-center bg-indigo-600 text-white font-semibold py-2.5 px-5 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all duration-200 shadow-lg shadow-indigo-100 text-sm">
            Staff Portal
          </Link>
        </div>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-slate-200/80 via-indigo-50 to-slate-100 border-b border-slate-300">
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-10 md:py-12">
          <div className="bg-white/95 backdrop-blur-sm rounded-2xl border border-slate-300 shadow-xl shadow-slate-300/30 p-6 md:p-8">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-10 items-center">
            <div className="max-w-xl lg:max-w-none">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full px-3 py-1.5 text-xs font-bold tracking-widest uppercase mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse" />
                Welcome to Habesha
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight tracking-tight mb-4">
                Your Health,<br />
                <span className="text-indigo-600">Our Lifelong</span><br />
                Mission.
              </h1>
              <p className="text-slate-600 text-base md:text-lg leading-relaxed mb-6 max-w-lg">
                Advanced clinical excellence, cutting-edge diagnostics, and a dedicated team of specialist physicians available around the clock.
              </p>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                <a
                  href="#services"
                  className="inline-flex items-center justify-center bg-slate-100 text-slate-700 border-2 border-slate-300 font-medium py-2.5 px-5 rounded-lg hover:bg-slate-200 hover:border-slate-400 transition-all duration-200 text-sm"
                >
                  View Departments
                </a>
                <a
                  href="#contact"
                  className="inline-flex items-center justify-center bg-slate-100 text-slate-700 border-2 border-slate-300 font-medium py-2.5 px-5 rounded-lg hover:bg-slate-200 hover:border-slate-400 transition-all duration-200 text-sm"
                >
                  Emergency Contact
                </a>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {[['24/7', 'Emergency coverage'], ['4', 'Clinical specialties'], ['365', 'Days open annually']].map(([val, label]) => (
                <div
                  key={label}
                  className="group bg-indigo-50/80 border border-indigo-200/80 rounded-xl p-3 md:p-4 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5 hover:border-indigo-300 transition-all duration-200"
                >
                  <div className="text-2xl md:text-3xl font-extrabold text-indigo-600 mb-1 tabular-nums">{val}</div>
                  <div className="text-slate-600 text-[0.65rem] sm:text-xs font-semibold leading-snug uppercase tracking-wide">{label}</div>
                </div>
              ))}
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* ── Departments ────────────────────────────────────────────────── */}
      <section id="services" className="bg-slate-100 border-y border-slate-300/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-14">
        <div className="mb-8 text-center md:text-left">
          <div className="text-xs font-bold tracking-widest uppercase text-indigo-600 mb-2">
            Clinical Services
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2 tracking-tight leading-tight">
            Specialized departments built around patient trust
          </h2>
          <p className="text-slate-600 max-w-2xl leading-relaxed text-sm md:text-base mx-auto md:mx-0">
            Each department reflects a professional medical environment where skilled teams deliver dependable attention and high-quality care.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {DEPARTMENTS.map((dept) => (
            <div
              key={dept.title}
              className="group bg-white rounded-xl border border-slate-300 shadow-md shadow-slate-300/20 p-5 hover:-translate-y-0.5 hover:shadow-lg hover:border-indigo-200 transition-all duration-200"
            >
              <div className="w-11 h-11 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-xl mb-3 group-hover:bg-indigo-100/80 transition-colors duration-200">
                {dept.icon}
              </div>
              <h3 className="font-extrabold text-slate-900 text-sm mb-2 leading-snug">{dept.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{dept.desc}</p>
            </div>
          ))}
        </div>
        </div>
      </section>

      {/* ── About ──────────────────────────────────────────────────────── */}
      <section id="about" className="bg-gradient-to-b from-indigo-50/70 via-slate-100 to-slate-100 border-y border-slate-300/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-14">
          <div className="mb-6">
            <div className="text-xs font-bold tracking-widest uppercase text-indigo-600 mb-2">About Our Facility</div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">A Seamless Healthcare Experience</h2>
            <div className="w-12 h-0.5 bg-indigo-600 rounded-full mt-2" />
          </div>
          <div className="bg-white/95 border border-slate-300 rounded-2xl p-6 md:p-8 shadow-xl shadow-slate-300/25 relative overflow-hidden">
            <div aria-hidden="true" className="absolute top-0 right-0 w-48 h-48 bg-indigo-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-70" />
            <p className="relative text-slate-600 text-sm md:text-base leading-relaxed max-w-4xl">
              Habesha Medical Center is designed to deliver a seamless healthcare experience from the first welcome at reception to the final clinical follow-up. Integrated medical charting keeps patient information accurate, organized, and available to the right care team at the right time. Real-time waiting-room coordination reduces unnecessary delays and creates a smoother flow between registration, consultation, and treatment — protecting medical confidentiality and preserving patient dignity at every stage.
            </p>
          </div>
        </div>
      </section>

      {/* ── Contact / Resources ────────────────────────────────────────── */}
      <section id="contact" className="bg-slate-200/40 border-t border-slate-300/80">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12 md:py-14">
        <div className="mb-6">
          <div className="text-xs font-bold tracking-widest uppercase text-indigo-600 mb-2">Patient Resources</div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Helpful information for every visit</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 lg:gap-5 mb-8">
          {[
            ['🚑', 'Emergency Hotline', '24/7 Priority Line: +251 11-XXX-XXXX'],
            ['📍', 'Hospital Location', 'Addis Ababa, Ethiopia'],
            ['🕐', 'Operating Hours', 'Open 24 Hours / 7 Days / 365 Days a Year'],
          ].map(([icon, label, value]) => (
            <div
              key={label}
              className="bg-white rounded-xl border border-slate-300 shadow-md shadow-slate-300/20 p-5 hover:shadow-lg hover:-translate-y-0.5 hover:border-indigo-200 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-lg mb-3">
                {icon}
              </div>
              <div className="text-xs font-bold tracking-widest uppercase text-indigo-600 mb-2">{label}</div>
              <div className="font-semibold text-slate-900 text-sm leading-relaxed">{value}</div>
            </div>
          ))}
        </div>

        {/* Staff portal CTA */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 border border-indigo-500 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl shadow-indigo-900/20">
          <div>
            <div className="text-white font-extrabold text-lg md:text-xl mb-1 tracking-tight">Staff Workspace Portal</div>
            <div className="text-indigo-100 text-sm">Administrators, receptionists, and doctors sign in here.</div>
          </div>
          <Link
            to="/login"
            className="flex-shrink-0 inline-flex items-center justify-center bg-white text-indigo-700 font-semibold py-2.5 px-5 rounded-lg hover:bg-indigo-50 active:scale-[0.98] transition-all duration-200 shadow-lg"
          >
            Sign In to Portal
          </Link>
        </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-slate-200/60 border-t border-slate-300 shadow-[0_-4px_24px_-8px_rgba(15,23,42,0.12)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-8 md:py-10">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 pb-6 border-b border-slate-200">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-100">
                  H
                </div>
                <div className="font-extrabold text-slate-900 text-lg">Habesha Medical Center</div>
              </div>
              <p className="text-slate-600 text-sm leading-relaxed max-w-xs">
                Premier clinical care with compassion, precision, and round-the-clock availability.
              </p>
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-indigo-600 mb-1.5">Location</div>
              <p className="text-slate-900 font-semibold text-sm">Addis Ababa, Ethiopia</p>
              <p className="text-slate-600 text-sm mt-1">National capital · Central access</p>
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-indigo-600 mb-1.5">Contact</div>
              <p className="text-slate-900 font-semibold text-sm">+251 11-XXX-XXXX</p>
              <p className="text-slate-600 text-sm mt-1">Emergency priority line</p>
            </div>
            <div>
              <div className="text-xs font-bold tracking-widest uppercase text-indigo-600 mb-1.5">Hours</div>
              <p className="text-slate-900 font-semibold text-sm">Open 24/7/365</p>
              <p className="text-slate-600 text-sm mt-1">Always here when you need us</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
            <div className="font-bold text-slate-700">Habesha Medical Center</div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              <span className="text-slate-600">Addis Ababa, Ethiopia</span>
              <span className="hidden sm:inline text-slate-200">|</span>
              <span className="text-slate-600">+251 11-XXX-XXXX</span>
              <span className="hidden sm:inline text-slate-200">|</span>
              <span className="text-indigo-600 font-medium">Open 24/7/365</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
