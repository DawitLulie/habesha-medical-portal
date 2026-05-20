import api from '../services/api';

/** POST /auth/login.php */
export function loginRequest(email, password) {
  return api.post('/auth/login.php', { email, password });
}
