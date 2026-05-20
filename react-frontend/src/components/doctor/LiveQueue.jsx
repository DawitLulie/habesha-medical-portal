import React, { useEffect, useState } from 'react';
import api from '../../services/api';

export default function LiveQueue({ doctorId, onAdmit, onOpenHistory, refreshKey, activeAppointmentId }) {
  const [queue, setQueue] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!doctorId) return;
    let mounted = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const resp = await api.get('/appointments/queue.php', { params: { doctor_id: doctorId } });
        let list = [];
        if (Array.isArray(resp.data)) list = resp.data;
        else if (Array.isArray(resp.data.data)) list = resp.data.data;
        else if (Array.isArray(resp.data.queue)) list = resp.data.queue;
        else if (Array.isArray(resp.data.appointments)) list = resp.data.appointments;

        // ensure proper ordering by queue_number
        list.sort((a, b) => (Number(a.queue_number) || 0) - (Number(b.queue_number) || 0));

        if (mounted) setQueue(list);
      } catch (err) {
        setError('Unable to fetch queue.');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();

    return () => { mounted = false; };
  }, [doctorId, refreshKey]);

  function getPatient(item) {
    // support both flattened and nested patient shapes
    if (!item) return {};
    if (item.patient && typeof item.patient === 'object') return item.patient;
    return {
      id: item.patient_id || item.patientId || item.patientId || item.id || null,
      first_name: item.first_name || item.firstName || (item.patient && item.patient.first_name) || '',
      last_name: item.last_name || item.lastName || (item.patient && item.patient.last_name) || '',
      age: item.age || (item.patient && item.patient.age) || '',
      gender: item.gender || (item.patient && item.patient.gender) || '',
    };
  }

  async function admitPatient(item) {
    const appointmentId = item.appointment_id || item.id || item.appointmentId;
    if (!appointmentId) return;

    // optimistic UI update
    setQueue((prev) => prev.map((q) => {
      const id = q.appointment_id || q.id || q.appointmentId;
      if (String(id) === String(appointmentId)) {
        return { ...q, status: 'In-Consultation' };
      }
      return q;
    }));

    try {
      await api.put('/appointments/update-status.php', {
        appointment_id: appointmentId,
        status: 'In-Consultation',
      });

      const patient = getPatient(item);
      const appointment = {
        id: appointmentId,
        queue_number: item.queue_number,
        status: 'In-Consultation',
      };

      if (typeof onAdmit === 'function') onAdmit(appointment, patient);
    } catch (err) {
      // rollback optimistic change on error
      setQueue((prev) => prev.map((q) => {
        const id = q.appointment_id || q.id || q.appointmentId;
        if (String(id) === String(appointmentId)) {
          return { ...q, status: 'Scheduled' };
        }
        return q;
      }));
      setError('Unable to admit patient.');
    }
  }

  return (
    <div>
      {loading && <div>Loading queue…</div>}
      {error && <div style={{color:'red'}}>{error}</div>}

      <div style={{maxHeight: '75vh', overflow: 'auto'}}>
        <table style={{width: '100%', borderCollapse: 'collapse'}}>
          <thead>
            <tr>
              <th style={{textAlign:'left', padding:8}}>#</th>
              <th style={{textAlign:'left', padding:8}}>Patient</th>
              <th style={{padding:8}}>Age</th>
              <th style={{padding:8}}>Gender</th>
              <th style={{padding:8}}>Status</th>
              <th style={{padding:8}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {queue.map((item) => {
              const patient = getPatient(item);
              const appointmentId = item.appointment_id || item.id || item.appointmentId;
              const status = item.status || item.appointment_status || 'Scheduled';
              const isActive = activeAppointmentId && String(activeAppointmentId) === String(appointmentId);

              return (
                <tr key={appointmentId} style={{background: isActive ? '#f7fbff' : 'transparent'}}>
                  <td style={{padding:8}}>{item.queue_number}</td>
                  <td style={{padding:8}}>{patient.first_name} {patient.last_name}</td>
                  <td style={{padding:8, textAlign:'center'}}>{patient.age}</td>
                  <td style={{padding:8, textAlign:'center'}}>{patient.gender}</td>
                  <td style={{padding:8, textAlign:'center'}}>{status}</td>
                  <td style={{padding:8, textAlign:'center'}}>
                    {String(status) === 'Scheduled' ? (
                      <button onClick={() => admitPatient(item)}>Admit Patient</button>
                    ) : (
                      <span style={{color:'#666'}}>—</span>
                    )}
                    <button onClick={() => onOpenHistory && onOpenHistory(patient.id)} style={{marginLeft:8}}>History</button>
                  </td>
                </tr>
              );
            })}
            {queue.length === 0 && !loading && (
              <tr>
                <td colSpan={6} style={{padding:12, textAlign:'center', color:'#666'}}>No appointments in queue.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
