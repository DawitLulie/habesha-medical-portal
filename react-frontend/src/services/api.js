import axios from 'axios';

const api = axios.create({
	baseURL: 'http://localhost/HMS/backend/public/api/v1',
	headers: {
		Accept: 'application/json',
	},
	timeout: 30000,
});

api.interceptors.request.use(
	(config) => {
		if (typeof window !== 'undefined') {
			const token = window.localStorage.getItem('token');
			if (token) {
				config.headers = config.headers || {};
				config.headers.Authorization = `Bearer ${token}`;
			}
		}

		return config;
	},
	(error) => Promise.reject(error)
);

export default api;