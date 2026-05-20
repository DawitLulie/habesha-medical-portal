import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppointmentBooking from '../components/receptionist/AppointmentBooking';
import PatientRegistration from '../components/receptionist/PatientRegistration';

function ReceptionistDashboard() {
	const { user, logout } = useAuth();
	const [activeTab, setActiveTab] = useState('patients');

	if (!user || user.role !== 'Receptionist') {
		return <Navigate to="/unauthorized" replace />;
	}

	return (
		<div style={styles.page}>
			<header style={styles.header}>
				<div>
					<div style={styles.eyebrow}>Reception Desk</div>
					<h1 style={styles.title}>Patient Management & Appointment Booking</h1>
					<p style={styles.subtitle}>Register patients and create appointments from a focused workflow view.</p>
				</div>
				<button type="button" onClick={logout} style={styles.logoutButton}>Logout</button>
			</header>

			<div style={styles.shell}>
				<aside style={styles.sidebar}>
					<button type="button" onClick={() => setActiveTab('patients')} style={activeTab === 'patients' ? styles.activeNav : styles.nav}>
						Patient Management
					</button>
					<button type="button" onClick={() => setActiveTab('appointments')} style={activeTab === 'appointments' ? styles.activeNav : styles.nav}>
						Appointment Booking
					</button>
				</aside>

				<main style={styles.content}>
					{activeTab === 'patients' ? <PatientRegistration /> : <AppointmentBooking />}
				</main>
			</div>
		</div>
	);
}

const styles = {
	page: {
		minHeight: '100vh',
		padding: '32px',
		background: 'linear-gradient(180deg, #f8fbfd 0%, #eef4f8 100%)',
		fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
		color: '#0f172a',
	},
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		gap: '16px',
		marginBottom: '24px',
	},
	eyebrow: {
		fontSize: '0.8rem',
		fontWeight: 800,
		letterSpacing: '0.18em',
		textTransform: 'uppercase',
		color: '#0f766e',
		marginBottom: '10px',
	},
	title: {
		margin: 0,
		fontSize: '2rem',
		fontWeight: 800,
	},
	subtitle: {
		margin: '10px 0 0',
		color: '#475569',
		lineHeight: 1.6,
		maxWidth: '62ch',
	},
	logoutButton: {
		padding: '12px 18px',
		borderRadius: '14px',
		border: 'none',
		background: '#0f172a',
		color: '#ffffff',
		fontWeight: 700,
		cursor: 'pointer',
	},
	shell: {
		display: 'grid',
		gridTemplateColumns: '260px minmax(0, 1fr)',
		gap: '20px',
		alignItems: 'start',
	},
	sidebar: {
		background: '#ffffff',
		borderRadius: '22px',
		padding: '16px',
		boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
		display: 'grid',
		gap: '10px',
	},
	nav: {
		padding: '14px 16px',
		borderRadius: '14px',
		border: '1px solid #e2e8f0',
		background: '#f8fafc',
		textAlign: 'left',
		fontWeight: 700,
		cursor: 'pointer',
		color: '#0f172a',
	},
	activeNav: {
		padding: '14px 16px',
		borderRadius: '14px',
		border: '1px solid #0f766e',
		background: '#0f766e',
		textAlign: 'left',
		fontWeight: 700,
		cursor: 'pointer',
		color: '#ffffff',
	},
	content: {
		background: '#ffffff',
		borderRadius: '24px',
		padding: '24px',
		boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
	},
};

export default ReceptionistDashboard;