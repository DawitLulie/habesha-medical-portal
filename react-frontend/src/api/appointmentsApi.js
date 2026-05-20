import api from '../services/api';

/** POST /appointments/book.php */
export function bookAppointment(payload) {
  return api.post('/appointments/book.php', payload);
}

/** GET /appointments/queue.php?doctor_id=N */
export function fetchQueue(doctor_id) {
  return api.get('/appointments/queue.php', { params: { doctor_id } });
}

/** PUT /appointments/update-status.php */
export function updateAppointmentStatus(appointment_id, status) {
  return api.put('/appointments/update-status.php', { appointment_id, status });
}
