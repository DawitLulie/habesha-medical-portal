import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children, allowedRoles }) {
	const { isAuthenticated, loading, user } = useAuth();
	const location = useLocation();

	if (loading) {
		return (
			<div style={styles.loadingShell}>
				<div style={styles.loadingCard}>
					<div style={styles.loadingTitle}>Verifying session</div>
					<div style={styles.loadingText}>Checking authentication state...</div>
				</div>
			</div>
		);
	}

	if (!isAuthenticated) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}

	if (Array.isArray(allowedRoles) && allowedRoles.length > 0) {
		const hasAllowedRole = user && allowedRoles.includes(user.role);
		if (!hasAllowedRole) {
			return <Navigate to="/unauthorized" replace />;
		}
	}

	return children;
}

const styles = {
	loadingShell: {
		minHeight: '100vh',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		background: '#f5f7fb',
		padding: '24px',
	},
	loadingCard: {
		background: '#ffffff',
		borderRadius: '20px',
		padding: '28px 32px',
		boxShadow: '0 20px 60px rgba(15, 23, 42, 0.12)',
		textAlign: 'center',
		maxWidth: '420px',
		width: '100%',
	},
	loadingTitle: {
		fontSize: '1.1rem',
		fontWeight: 700,
		color: '#0f172a',
		marginBottom: '8px',
	},
	loadingText: {
		fontSize: '0.95rem',
		color: '#475569',
	},
};

export default ProtectedRoute;