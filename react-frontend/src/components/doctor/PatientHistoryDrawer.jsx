import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function PatientHistoryDrawer({ patientId, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!isOpen || !patientId) return;
    let mounted = true;

    async function loadHistory() {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.get('/consultations/history.php', { params: { patient_id: patientId } });
        let list = [];
        if (Array.isArray(resp.data)) list = resp.data;
        else if (Array.isArray(resp.data.data)) list = resp.data.data;
        else if (Array.isArray(resp.data.history)) list = resp.data.history;

        // newest first
        list.sort((a, b) => new Date(b.consultation_date) - new Date(a.consultation_date));

        if (mounted) setHistory(list);
      } catch (err) {
        setError('Unable to load history.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadHistory();
    return () => { mounted = false; };
  }, [patientId, isOpen]);

  if (!isOpen) return null;

  return (
    <div style={{position:'fixed', right:0, top:0, height:'100vh', width:480, background:'#fff', boxShadow:'-4px 0 12px rgba(0,0,0,0.08)', zIndex:1200, overflow:'auto'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:16, borderBottom:'1px solid #eee'}}>
        <h3 style={{margin:0}}>Patient History</h3>
        <div>
          <button onClick={onClose}>Close</button>
        </div>
      </div>

      <div style={{padding:16}}>
        {loading && <div>Loading history…</div>}
        {error && <div style={{color:'red'}}>{error}</div>}

        {!loading && history.length === 0 && <div style={{color:'#666'}}>No prior consultations found.</div>}

        {history.map((entry) => (
          <div key={entry.consultation_id || entry.id || entry._id} style={{borderBottom:'1px solid #f0f0f0', paddingBottom:12, marginBottom:12}}>
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <div style={{fontWeight:600}}>{entry.treating_doctor_full_name || entry.doctor_name || entry.doctor_full_name}</div>
              <div style={{color:'#666'}}>{entry.consultation_date ? new Date(entry.consultation_date).toLocaleString() : ''}</div>
            </div>
            <div style={{marginTop:8}}>
              <div><strong>Symptoms:</strong></div>
              <div style={{whiteSpace:'pre-wrap'}}>{entry.symptoms}</div>
            </div>
            <div style={{marginTop:8}}>
              <div><strong>Diagnosis:</strong></div>
              <div style={{whiteSpace:'pre-wrap'}}>{entry.diagnosis}</div>
            </div>
            <div style={{marginTop:8}}>
              <div><strong>Prescription:</strong></div>
              <div style={{whiteSpace:'pre-wrap'}}>{entry.prescription}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
