import api from '../services/api';

/** GET /patients/list.php  (optional ?search=query) */
export function fetchPatients(search = '') {
  return api.get('/patients/list.php', { params: search ? { search } : {} });
}

/** GET /patients/detail.php?id=N */
export function fetchPatientDetail(id) {
  return api.get('/patients/detail.php', { params: { id } });
}

/** POST /patients/register.php */
export function registerPatient(payload) {
  return api.post('/patients/register.php', payload);
}
