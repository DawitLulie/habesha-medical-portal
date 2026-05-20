import api from '../services/api';

/** GET /users/list.php */
export function fetchUsers() {
  return api.get('/users/list.php');
}

/** POST /users/create.php */
export function createUser(payload) {
  return api.post('/users/create.php', payload);
}

/** PUT /users/toggle-status.php */
export function toggleUserStatus(user_id, is_active) {
  return api.put('/users/toggle-status.php', { user_id, is_active });
}
