import React, { useState } from 'react';
import api from '../../services/api';

export default function ConsultationForm({ appointment, patient, onSuccess }) {
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setLoading(true);

    try {
      const payload = {
        appointment_id: appointment.id || appointment.appointment_id,
        patient_id: patient.id,
        symptoms,
        diagnosis,
        prescription,
        notes,
      };

      const resp = await api.post('/consultations/submit.php', payload);

      // consider 201 or 200 with consultation_id in body as success
      const success = resp && (resp.status === 201 || (resp.data && resp.data.consultation_id));
      if (!success) throw new Error('Unexpected API response');

      setSuccessMessage('Consultation recorded successfully.');

      // small delay to let doctor read success, then trigger parent callback
      setTimeout(() => {
        setSymptoms('');
        setDiagnosis('');
        setPrescription('');
        setNotes('');
        if (typeof onSuccess === 'function') onSuccess();
      }, 800);
    } catch (err) {
      const apiMessage = err && err.response && err.response.data && err.response.data.message ? err.response.data.message : err.message;
      setError(apiMessage || 'Unable to submit consultation.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{marginTop:0}}>Consultation</h2>
      <div style={{marginBottom:12}}>
        <strong>{patient.first_name} {patient.last_name}</strong>
        <div style={{color:'#666'}}>{patient.age} / {patient.gender}</div>
        <div style={{marginTop:8}}><strong>Queue #:</strong> {appointment.queue_number}</div>
      </div>

      {error && <div style={{background:'#ffecec', padding:8, borderRadius:4, color:'#900'}}>{error}</div>}
      {successMessage && <div style={{background:'#e6ffed', padding:8, borderRadius:4, color:'#084'}}>{successMessage}</div>}

      <form onSubmit={handleSubmit} style={{display:'flex', flexDirection:'column', gap:8}}>
        <label>
          Symptoms
          <textarea value={symptoms} onChange={(e) => setSymptoms(e.target.value)} rows={4} style={{width:'100%'}} required />
        </label>

        <label>
          Diagnosis
          <textarea value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} rows={3} style={{width:'100%'}} required />
        </label>

        <label>
          Prescription
          <textarea value={prescription} onChange={(e) => setPrescription(e.target.value)} rows={3} style={{width:'100%'}} />
        </label>

        <label>
          Notes
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} style={{width:'100%'}} />
        </label>

        <div style={{display:'flex', gap:8, marginTop:8}}>
          <button type="submit" disabled={loading}>{loading ? 'Saving…' : 'Submit Consultation'}</button>
        </div>
      </form>
    </div>
  );
}
