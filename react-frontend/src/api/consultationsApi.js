import api from '../services/api';

/** POST /consultations/submit.php */
export function submitConsultation(payload) {
  return api.post('/consultations/submit.php', payload);
}

/** GET /consultations/history.php?patient_id=N */
export function fetchConsultationHistory(patient_id) {
  return api.get('/consultations/history.php', { params: { patient_id } });
}
