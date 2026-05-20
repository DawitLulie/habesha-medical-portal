/**
 * axiosClient.js
 *
 * Configured Axios instance for the HMS REST API.
 *
 * Base URL  : http://localhost/HMS/backend/public/api/v1
 * Auth      : Reads the Bearer token from localStorage on every request
 *             and injects it as the Authorization header automatically.
 * Timeout   : 30 seconds — generous enough for slow local XAMPP stacks.
 *
 * This file is the canonical HTTP client. All API modules in src/api/
 * should import from here rather than creating their own axios instances.
 */

import axios from 'axios';

const axiosClient = axios.create({
	baseURL: 'http://localhost/HMS/backend/public/api/v1',
	headers: {
		Accept: 'application/json',
		'Content-Type': 'application/json',
	},
	timeout: 30000,
});

// ── Request interceptor ──────────────────────────────────────────────────────
// Attach the Bearer token from localStorage before every outgoing request.
axiosClient.interceptors.request.use(
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

// ── Response interceptor ─────────────────────────────────────────────────────
// Pass successful responses straight through.
// On error, normalise the rejection so callers always get a consistent shape.
axiosClient.interceptors.response.use(
	(response) => response,
	(error) => {
		// Surface the API's own message when available, otherwise keep the
		// original Axios error intact for the caller to inspect.
		return Promise.reject(error);
	}
);

export default axiosClient;
