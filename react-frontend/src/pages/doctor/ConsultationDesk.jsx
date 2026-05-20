/**
 * ConsultationDesk.jsx
 *
 * Split-view clinical workbench:
 *   Left  — Patient history timeline (all past consultations)
 *   Right — Live clinical form (symptoms, diagnosis, prescription, notes)
 *
 * On submit: POST /consultations/submit.php
 *   → Backend atomically marks appointment status = 'Completed'
 *   → UI navigates back to the queue on success
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardShell from '../../components/layout/DashboardShell';
import { fetchQueue } from '../../api/appointmentsApi';
import { fetchConsultationHistory, submitConsultation } from '../../api/consultationsApi';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { label: 'Back to Queue', to: '/doctor', icon: '← Queue', end: true },
];

export default function ConsultationDesk() {
  const { appointmentId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Appointment + patient data resolved from the queue
  const [appointment, setAppointment] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loadingAppt, setLoadingAppt] = useState(true);

  // History timeline
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Clinical form
  const [form, setForm] = useState({ symptoms: '', diagnosis: '', prescription: '', notes: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  // ── Load appointment details from queue ──────────────────────────────────
  useEffect(() => {
    if (!user?.id || !appointmentId) return;
    let active = true;
    async function load() {
      setLoadingAppt(true);
      try {
        const res = await fetchQueue(user.id);
        let list = Array.isArray(res.data?.data) ? res.data.data
          : Array.isArray(res.data?.queue) ? res.data.queue
          : Array.isArray(res.data) ? res.data : [];
        const found = list.find((item) => {
          const id = item.appointment_id || item.id;
          return String(id) === String(appointmentId);
        });
        if (active && found) {
          setAppointment(found);
          const p = found.patient || {
            id: found.patient_id,
            first_name: found.first_name || '',
            last_name: found.last_name || '',
            age: found.age || '',
            gender: found.gender || '',
          };
          setPatient(p);
        }
      } catch {
        // non-fatal — form still usable
      } finally {
        if (active) setLoadingAppt(false);
      }
    }
    load();
    return () => { active = false; };
  }, [user?.id, appointmentId]);

  // ── Load history once patient is known ──────────────────────────────────
  const loadHistory = useCallback(async (patientId) => {
    if (!patientId) return;
    setLoadingHistory(true);
    try {
      const res = await fetchConsultationHistory(patientId);
      let list = Array.isArray(res.data?.data) ? res.data.data
        : Array.isArray(res.data?.history) ? res.data.history
        : Array.isArray(res.data) ? res.data : [];
      list.sort((a, b) => new Date(b.consultation_date) - new Date(a.consultation_date));
      setHistory(list);
    } catch {
      setHistory([]);
    } finally {
      setLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    if (patient?.id) loadHistory(patient.id);
  }, [patient?.id, loadHistory]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError('');
    setSubmitSuccess('');
    try {
      await submitConsultation({
        appointment_id: Number(appointmentId),
        patient_id: patient?.id,
        symptoms: form.symptoms,
        diagnosis: form.diagnosis,
        prescription: form.prescription,
        notes: form.notes,
      });
      setSubmitSuccess('Consultation submitted. Appointment marked as Completed.');
      setTimeout(() => navigate('/doctor'), 1800);
    } catch (err) {
      setSubmitError(err?.response?.data?.message || 'Unable to submit consultation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <DashboardShell role="Doctor" navItems={NAV}>
      <div className="mb-6">
        <div className="text-xs font-black tracking-widest uppercase text-indigo-600 mb-1">Clinical Workbench</div>
        <h1 className="text-2xl font-black text-slate-900">Consultation Desk</h1>
        {loadingAppt ? (
          <p className="text-slate-400 text-sm mt-1 animate-pulse">Loading patient data...</p>
        ) : patient ? (
          <p className="text-slate-500 text-sm mt-1">
            Patient: <strong className="text-slate-900">{patient.first_name} {patient.last_name}</strong>
            {' · '}Age {patient.age}{' · '}{patient.gender}
            {' · '}Queue #{appointment?.queue_number}
          </p>
        ) : (
          <p className="text-slate-500 text-sm mt-1">Appointment #{appointmentId}</p>
        )}
      </div>

      <div className="grid lg:grid-cols-5 gap-6 items-start">

        {/* ── LEFT: History timeline ──────────────────────────────────── */}
        <aside className="lg:col-span-2 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <div className="font-black text-slate-900 text-sm">Medical History</div>
            <div className="text-xs text-slate-400 mt-0.5">All prior consultations for this patient</div>
          </div>

          <div className="p-4 max-h-[calc(100vh-280px)] overflow-y-auto">
            {loadingHistory ? (
              <div className="py-8 text-center text-slate-400 text-xs animate-pulse">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="py-8 text-center">
                <div className="text-2xl mb-2">📋</div>
                <div className="text-slate-500 text-xs font-semibold">No prior consultations</div>
                <div className="text-slate-400 text-xs mt-1">This is the patient's first visit.</div>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-3.5 top-0 bottom-0 w-px bg-slate-100" />
                <div className="space-y-5">
                  {history.map((entry, idx) => {
                    const entryId = entry.consultation_id || entry.id || idx;
                    const date = entry.consultation_date
                      ? new Date(entry.consultation_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                      : '—';
                    const time = entry.consultation_date
                      ? new Date(entry.consultation_date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <div key={entryId} className="relative pl-8">
                        {/* Timeline dot */}
                        <div className="absolute left-2 top-1.5 w-3 h-3 rounded-full bg-indigo-500 border-2 border-white shadow-sm" />
                        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
                          <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="text-xs font-bold text-slate-900">{date}</div>
                            <div className="text-xs text-slate-400">{time}</div>
                          </div>
                          {entry.doctor_name || entry.treating_doctor_full_name ? (
                            <div className="text-xs text-indigo-600 font-semibold mb-2">
                              Dr. {entry.doctor_name || entry.treating_doctor_full_name}
                            </div>
                          ) : null}
                          <div className="space-y-2 text-xs">
                            <div>
                              <div className="font-bold text-slate-500 uppercase tracking-wide text-xs mb-0.5">Symptoms</div>
                              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.symptoms}</div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-500 uppercase tracking-wide text-xs mb-0.5">Diagnosis</div>
                              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.diagnosis}</div>
                            </div>
                            <div>
                              <div className="font-bold text-slate-500 uppercase tracking-wide text-xs mb-0.5">Prescription</div>
                              <div className="text-slate-700 leading-relaxed whitespace-pre-wrap">{entry.prescription}</div>
                            </div>
                            {entry.notes ? (
                              <div>
                                <div className="font-bold text-slate-500 uppercase tracking-wide text-xs mb-0.5">Notes</div>
                                <div className="text-slate-600 leading-relaxed whitespace-pre-wrap">{entry.notes}</div>
                              </div>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── RIGHT: Clinical form ────────────────────────────────────── */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <div className="font-black text-slate-900 text-sm">New Consultation</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Submitting will mark this appointment as <span className="font-bold text-emerald-600">Completed</span>
            </div>
          </div>

          <div className="p-6">
            {submitError && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm mb-5">
                <span className="mt-0.5">⚠️</span><span>{submitError}</span>
              </div>
            )}
            {submitSuccess && (
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl px-4 py-3 text-sm mb-5">
                <span className="mt-0.5">✅</span><span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Symptoms */}
              <div>
                <label htmlFor="symptoms" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Symptoms <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="symptoms" name="symptoms"
                  value={form.symptoms} onChange={handleChange}
                  rows={4} required
                  placeholder="Describe the patient's presenting symptoms in detail..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 resize-none"
                />
              </div>

              {/* Diagnosis */}
              <div>
                <label htmlFor="diagnosis" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="diagnosis" name="diagnosis"
                  value={form.diagnosis} onChange={handleChange}
                  rows={3} required
                  placeholder="Clinical diagnosis based on examination and symptoms..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 resize-none"
                />
              </div>

              {/* Prescription */}
              <div>
                <label htmlFor="prescription" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Prescription <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="prescription" name="prescription"
                  value={form.prescription} onChange={handleChange}
                  rows={3} required
                  placeholder="Medications, dosages, and treatment instructions..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 resize-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label htmlFor="notes" className="block text-sm font-bold text-slate-700 mb-1.5">
                  Additional Notes
                  <span className="ml-1 text-xs font-normal text-slate-400">(optional)</span>
                </label>
                <textarea
                  id="notes" name="notes"
                  value={form.notes} onChange={handleChange}
                  rows={2}
                  placeholder="Follow-up instructions, referrals, or other clinical notes..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 resize-none"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
                <button
                  type="submit" disabled={submitting || !!submitSuccess}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-sm text-sm"
                >
                  {submitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Submitting...
                    </>
                  ) : submitSuccess ? '✅ Submitted' : 'Submit & Complete'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/doctor')}
                  className="px-6 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all duration-200 text-sm"
                >
                  Back to Queue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
