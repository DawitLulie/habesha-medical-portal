import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

function readStoredUser() {
	if (typeof window === 'undefined') {
		return null;
	}

	const storedUser = window.localStorage.getItem('user');
	if (!storedUser) {
		return null;
	}

	try {
		return JSON.parse(storedUser);
	} catch (error) {
		window.localStorage.removeItem('user');
		window.localStorage.removeItem('token');
		return null;
	}
}

export function AuthProvider({ children }) {
	const [user, setUser] = useState(null);
	const [token, setToken] = useState(null);
	const [isAuthenticated, setIsAuthenticated] = useState(false);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		if (typeof window === 'undefined') {
			setLoading(false);
			return;
		}

		const storedToken = window.localStorage.getItem('token');
		const storedUser = readStoredUser();

		if (storedToken && storedUser) {
			setToken(storedToken);
			setUser(storedUser);
			setIsAuthenticated(true);
		} else {
			window.localStorage.removeItem('token');
			window.localStorage.removeItem('user');
			setToken(null);
			setUser(null);
			setIsAuthenticated(false);
		}

		setLoading(false);
	}, []);

	async function login(email, password) {
		setError(null);
		setLoading(true);

		try {
			const response = await api.post('/auth/login.php', {
				email,
				password,
			});

			const responseToken = response.data && response.data.token ? response.data.token : null;
			const responseUser = response.data && response.data.user ? response.data.user : null;

			if (!responseToken || !responseUser) {
				throw new Error('Login response was missing required data.');
			}

			window.localStorage.setItem('token', responseToken);
			window.localStorage.setItem('user', JSON.stringify(responseUser));
			setToken(responseToken);
			setUser(responseUser);
			setIsAuthenticated(true);
			setError(null);

			return response.data;
		} catch (caughtError) {
			const status = caughtError && caughtError.response ? caughtError.response.status : null;
			const apiMessage = caughtError && caughtError.response && caughtError.response.data && caughtError.response.data.message
				? caughtError.response.data.message
				: null;
			const message = apiMessage || caughtError.message || 'Unable to complete login.';

			setError(message);

			const normalizedError = new Error(message);
			normalizedError.status = status;
			normalizedError.response = caughtError.response;
			throw normalizedError;
		} finally {
			setLoading(false);
		}
	}

	function logout() {
		if (typeof window !== 'undefined') {
			window.localStorage.removeItem('token');
			window.localStorage.removeItem('user');
		}

		setUser(null);
		setToken(null);
		setIsAuthenticated(false);
		setError(null);
		setLoading(false);
	}

	const value = {
		user,
		token,
		isAuthenticated,
		loading,
		error,
		login,
		logout,
		setError,
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider.');
	}
	return context;
}

export default AuthContext;// Auth Context
