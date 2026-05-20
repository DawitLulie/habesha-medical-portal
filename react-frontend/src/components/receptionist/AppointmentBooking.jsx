import React, { useState } from 'react';
import api from '../../services/api';

const initialState = {
	patient_id: '',
	doctor_id: '',
	appointment_date: '',
};

function AppointmentBooking() {
	const [form, setForm] = useState(initialState);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [result, setResult] = useState(null);

	function handleChange(event) {
		const { name, value } = event.target;
		setForm((current) => ({
			...current,
			[name]: value,
		}));
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setLoading(true);
		setError('');
		setResult(null);

		try {
			const response = await api.post('/appointments/book.php', {
				patient_id: form.patient_id,
				doctor_id: form.doctor_id,
				appointment_date: form.appointment_date,
			});

			const payload = response && response.data ? response.data : {};
			setResult({
				appointment_id: payload.appointment_id,
				queue_number: payload.queue_number,
				appointment_status: payload.appointment_status,
			});
			setForm(initialState);
		} catch (caughtError) {
			const message = caughtError && caughtError.response && caughtError.response.data && caughtError.response.data.message
				? caughtError.response.data.message
				: 'Unable to book appointment.';
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<section style={styles.section}>
			<div style={styles.header}>
				<div style={styles.eyebrow}>Appointment Booking</div>
				<h2 style={styles.title}>Schedule appointment</h2>
				<p style={styles.subtitle}>Book an appointment and display the exact queue contract returned by the backend.</p>
			</div>

			{error ? <div style={styles.errorBanner}>{error}</div> : null}

			{result ? (
				<div style={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Appointment booked successfully">
					<div style={styles.modalCard}>
						<div style={styles.modalTitle}>Appointment booked</div>
						<div style={styles.modalBody}>
							<div><strong>appointment_id:</strong> {result.appointment_id}</div>
							<div><strong>queue_number:</strong> {result.queue_number}</div>
							<div><strong>appointment_status:</strong> {result.appointment_status}</div>
						</div>
						<button type="button" style={styles.modalButton} onClick={() => setResult(null)}>Close</button>
					</div>
				</div>
			) : null}

			<form onSubmit={handleSubmit} style={styles.form}>
				<div>
					<label style={styles.label} htmlFor="patient_id">Patient ID</label>
					<input id="patient_id" name="patient_id" type="number" min="1" step="1" value={form.patient_id} onChange={handleChange} style={styles.input} required />
				</div>

				<div>
					<label style={styles.label} htmlFor="doctor_id">Doctor ID</label>
					<input id="doctor_id" name="doctor_id" type="number" min="1" step="1" value={form.doctor_id} onChange={handleChange} style={styles.input} required />
				</div>

				<div>
					<label style={styles.label} htmlFor="appointment_date">Appointment date</label>
					<input id="appointment_date" name="appointment_date" type="date" value={form.appointment_date} onChange={handleChange} style={styles.input} required />
				</div>

				<button type="submit" disabled={loading} style={styles.primaryButton}>
					{loading ? 'Booking appointment...' : 'Book appointment'}
				</button>
			</form>
		</section>
	);
}

const styles = {
	section: {
		display: 'grid',
		gap: '16px',
	},
	header: {
		marginBottom: '8px',
	},
	eyebrow: {
		fontSize: '0.78rem',
		fontWeight: 800,
		letterSpacing: '0.16em',
		textTransform: 'uppercase',
		color: '#0f766e',
		marginBottom: '8px',
	},
	title: {
		margin: 0,
		fontSize: '1.45rem',
		fontWeight: 800,
	},
	subtitle: {
		margin: '10px 0 0',
		color: '#475569',
		lineHeight: 1.6,
	},
	errorBanner: {
		background: '#fef2f2',
		border: '1px solid #fecaca',
		color: '#991b1b',
		borderRadius: '14px',
		padding: '12px 14px',
		lineHeight: 1.5,
	},
	form: {
		display: 'grid',
		gap: '14px',
		maxWidth: '520px',
	},
	label: {
		display: 'block',
		marginBottom: '8px',
		fontWeight: 700,
		color: '#0f172a',
	},
	input: {
		width: '100%',
		padding: '13px 14px',
		borderRadius: '14px',
		border: '1px solid #cbd5e1',
		background: '#f8fafc',
		fontSize: '1rem',
		color: '#0f172a',
	},
	primaryButton: {
		padding: '13px 16px',
		border: 'none',
		borderRadius: '14px',
		background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
		color: '#ffffff',
		fontWeight: 800,
		cursor: 'pointer',
		justifySelf: 'start',
	},
	modalOverlay: {
		position: 'fixed',
		inset: 0,
		background: 'rgba(15, 23, 42, 0.50)',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: '24px',
		zIndex: 40,
	},
	modalCard: {
		width: '100%',
		maxWidth: '460px',
		background: '#ffffff',
		borderRadius: '24px',
		padding: '28px',
		boxShadow: '0 30px 80px rgba(15, 23, 42, 0.28)',
	},
	modalTitle: {
		fontSize: '1.4rem',
		fontWeight: 800,
		marginBottom: '14px',
		color: '#0f172a',
	},
	modalBody: {
		display: 'grid',
		gap: '10px',
		color: '#334155',
		lineHeight: 1.6,
	},
	modalButton: {
		marginTop: '20px',
		padding: '12px 16px',
		border: 'none',
		borderRadius: '14px',
		background: '#0f172a',
		color: '#ffffff',
		fontWeight: 700,
		cursor: 'pointer',
	},
};

export default AppointmentBooking;