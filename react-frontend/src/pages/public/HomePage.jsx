import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function getDashboardPath(role) {
	if (role === 'Admin') {
		return '/admin';
	}

	if (role === 'Receptionist') {
		return '/receptionist';
	}

	if (role === 'Doctor') {
		return '/doctor';
	}

	return '/login';
}

function HomePage() {
	const { isAuthenticated, loading, user } = useAuth();

	if (loading) {
		return <div style={styles.loading}>Loading session...</div>;
	}

	if (isAuthenticated) {
		return <Navigate to={getDashboardPath(user && user.role ? user.role : '')} replace />;
	}

	return (
		<div style={styles.page}>
			<div style={styles.glowOne} />
			<div style={styles.glowTwo} />
			<div style={styles.shell}>
				<section style={styles.hero}>
					<div style={styles.badge}>HMS</div>
					<h1 style={styles.title}>Hospital Management System</h1>
					<p style={styles.copy}>
						Manage patients, appointments, consultations, and staff workflows from one secure platform.
					</p>
					<div style={styles.actions}>
						<Link to="/login" style={styles.primaryAction}>
							Sign in
						</Link>
						<a href="#services" style={styles.secondaryAction}>
							View services
						</a>
					</div>
				</section>

				<section style={styles.panel}>
					<div style={styles.card}>
						<div style={styles.cardTitle}>Secure, role-based access</div>
						<div style={styles.cardCopy}>
							Administrators, receptionists, and doctors each get their own dashboard and workflows.
						</div>
					</div>
					<div id="services" style={styles.servicesGrid}>
						<div style={styles.serviceItem}>
							<div style={styles.serviceLabel}>Patients</div>
							<div style={styles.serviceCopy}>Register, search, and follow patient records.</div>
						</div>
						<div style={styles.serviceItem}>
							<div style={styles.serviceLabel}>Appointments</div>
							<div style={styles.serviceCopy}>Book visits and manage daily queues.</div>
						</div>
						<div style={styles.serviceItem}>
							<div style={styles.serviceLabel}>Consultations</div>
							<div style={styles.serviceCopy}>Record diagnoses, prescriptions, and treatment notes.</div>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

const styles = {
	loading: {
		minHeight: '100vh',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
		color: '#0f172a',
		background: 'linear-gradient(135deg, #f4f7fb 0%, #eef3f8 55%, #ffffff 100%)',
	},
	page: {
		minHeight: '100vh',
		position: 'relative',
		overflow: 'hidden',
		background: 'linear-gradient(135deg, #f4f7fb 0%, #eef3f8 55%, #ffffff 100%)',
		fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
	},
	glowOne: {
		position: 'absolute',
		top: '-120px',
		right: '-60px',
		width: '320px',
		height: '320px',
		borderRadius: '50%',
		background: 'rgba(15, 118, 110, 0.12)',
		filter: 'blur(12px)',
	},
	glowTwo: {
		position: 'absolute',
		bottom: '-100px',
		left: '-70px',
		width: '280px',
		height: '280px',
		borderRadius: '50%',
		background: 'rgba(2, 132, 199, 0.10)',
		filter: 'blur(18px)',
	},
	shell: {
		position: 'relative',
		zIndex: 1,
		minHeight: '100vh',
		display: 'grid',
		gridTemplateColumns: '1.1fr 0.9fr',
		gap: '32px',
		padding: '40px',
		alignItems: 'center',
	},
	hero: {
		color: '#0f172a',
		padding: '24px 12px',
	},
	badge: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '10px 16px',
		borderRadius: '999px',
		background: '#0f766e',
		color: '#ffffff',
		fontWeight: 700,
		letterSpacing: '0.12em',
		fontSize: '0.78rem',
		boxShadow: '0 12px 30px rgba(15, 118, 110, 0.25)',
	},
	title: {
		margin: '22px 0 14px',
		fontSize: 'clamp(2.4rem, 4.4vw, 4.8rem)',
		lineHeight: 1.02,
		maxWidth: '12ch',
		fontWeight: 800,
	},
	copy: {
		fontSize: '1.03rem',
		lineHeight: 1.7,
		maxWidth: '52ch',
		color: '#475569',
		marginBottom: '28px',
	},
	actions: {
		display: 'flex',
		gap: '14px',
		flexWrap: 'wrap',
	},
	primaryAction: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '14px 20px',
		borderRadius: '14px',
		background: '#0f766e',
		color: '#ffffff',
		textDecoration: 'none',
		fontWeight: 700,
		boxShadow: '0 12px 30px rgba(15, 118, 110, 0.22)',
	},
	secondaryAction: {
		display: 'inline-flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '14px 20px',
		borderRadius: '14px',
		border: '1px solid rgba(15, 23, 42, 0.12)',
		background: 'rgba(255, 255, 255, 0.72)',
		color: '#0f172a',
		textDecoration: 'none',
		fontWeight: 700,
	},
	panel: {
		display: 'grid',
		gap: '18px',
	},
	card: {
		background: 'rgba(255, 255, 255, 0.82)',
		backdropFilter: 'blur(12px)',
		border: '1px solid rgba(148, 163, 184, 0.22)',
		borderRadius: '24px',
		padding: '28px',
		boxShadow: '0 20px 48px rgba(15, 23, 42, 0.08)',
	},
	cardTitle: {
		fontSize: '1.2rem',
		fontWeight: 800,
		color: '#0f172a',
		marginBottom: '10px',
	},
	cardCopy: {
		fontSize: '0.98rem',
		lineHeight: 1.7,
		color: '#475569',
	},
	servicesGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
		gap: '14px',
	},
	serviceItem: {
		background: 'rgba(255, 255, 255, 0.74)',
		border: '1px solid rgba(148, 163, 184, 0.18)',
		borderRadius: '20px',
		padding: '18px',
		boxShadow: '0 16px 40px rgba(15, 23, 42, 0.06)',
	},
	serviceLabel: {
		fontWeight: 800,
		color: '#0f172a',
		marginBottom: '8px',
	},
	serviceCopy: {
		fontSize: '0.92rem',
		lineHeight: 1.6,
		color: '#475569',
	},
};

export default HomePage;
