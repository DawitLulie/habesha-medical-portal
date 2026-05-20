import React from 'react';
import { Link } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { label: 'Dashboard', to: '/receptionist', icon: '🏠', end: true },
  { label: 'Register Patient', to: '/receptionist/register', icon: '📋' },
  { label: 'Patient Search', to: '/receptionist/search', icon: '🔍' },
  { label: 'Book Appointment', to: '/receptionist/book', icon: '📅' },
];

const ACTIONS = [
  {
    icon: '📋',
    title: 'Register New Patient',
    desc: 'Create a new patient profile with demographic information.',
    to: '/receptionist/register',
    color: 'hover:border-blue-200 hover:bg-blue-50',
    iconBg: 'bg-blue-100 group-hover:bg-blue-200',
  },
  {
    icon: '🔍',
    title: 'Search Patient Records',
    desc: 'Find existing patients by name, phone, or ID.',
    to: '/receptionist/search',
    color: 'hover:border-indigo-200 hover:bg-indigo-50',
    iconBg: 'bg-indigo-100 group-hover:bg-indigo-200',
  },
  {
    icon: '📅',
    title: 'Book Appointment',
    desc: 'Schedule a patient with a doctor and receive a queue number.',
    to: '/receptionist/book',
    color: 'hover:border-emerald-200 hover:bg-emerald-50',
    iconBg: 'bg-emerald-100 group-hover:bg-emerald-200',
  },
];

export default function ReceptionistDashboard() {
  const { user } = useAuth();

  return (
    <DashboardShell role="Receptionist" navItems={NAV}>
      <div className="mb-8">
        <div className="text-xs font-black tracking-widest uppercase text-blue-600 mb-1">Reception Desk</div>
        <h1 className="text-2xl font-black text-slate-900">
          Good {getGreeting()}, {user?.full_name?.split(' ')[0] || 'Receptionist'}
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Action cards */}
      <div className="grid sm:grid-cols-3 gap-5 mb-8">
        {ACTIONS.map((action) => (
          <Link
            key={action.to}
            to={action.to}
            className={`group bg-white rounded-xl border border-slate-100 shadow-sm p-6 transition-all duration-200 ${action.color}`}
          >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-all duration-200 ${action.iconBg}`}>
              {action.icon}
            </div>
            <div className="font-bold text-slate-900 text-base mb-1">{action.title}</div>
            <div className="text-slate-500 text-sm leading-relaxed">{action.desc}</div>
          </Link>
        ))}
      </div>

      {/* Workflow guide */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <div className="text-xs font-black tracking-widest uppercase text-slate-400 mb-4">Intake Workflow</div>
        <ol className="space-y-3">
          {[
            ['1', 'Search for the patient', 'Check if the patient already has a record in the system.'],
            ['2', 'Register if new', 'If no record exists, create a new patient profile with their demographics.'],
            ['3', 'Book appointment', 'Link the patient to an available doctor and select a date. The system will assign a queue number automatically.'],
          ].map(([step, title, desc]) => (
            <li key={step} className="flex items-start gap-4">
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                {step}
              </div>
              <div>
                <div className="font-bold text-slate-900 text-sm">{title}</div>
                <div className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </DashboardShell>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}
