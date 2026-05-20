import React, { useState } from 'react';
import api from '../../services/api';

const initialState = {
	first_name: '',
	last_name: '',
	age: '',
	gender: 'Female',
	phone: '',
	address: '',
};

function PatientRegistration() {
	const [form, setForm] = useState(initialState);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [successPatientId, setSuccessPatientId] = useState(null);

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
		setSuccessPatientId(null);

		try {
			const response = await api.post('/patients/register.php', {
				first_name: form.first_name,
				last_name: form.last_name,
				age: form.age,
				gender: form.gender,
				phone: form.phone,
				address: form.address,
			});

			const patientId = response && response.data ? response.data.patient_id : null;
			setSuccessPatientId(patientId);
			setForm(initialState);
		} catch (caughtError) {
			const message = caughtError && caughtError.response && caughtError.response.data && caughtError.response.data.message
				? caughtError.response.data.message
				: 'Unable to register patient.';
			setError(message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<section style={styles.section}>
			<div style={styles.header}>
				<div style={styles.eyebrow}>Patient Management</div>
				<h2 style={styles.title}>Register new patient</h2>
				<p style={styles.subtitle}>Create a patient profile using the schema defined in the database design document.</p>
			</div>

			{error ? <div style={styles.errorBanner}>{error}</div> : null}
			{successPatientId ? (
				<div style={styles.successBanner} role="status">
					Patient created successfully. Patient ID: <strong>{successPatientId}</strong>
				</div>
			) : null}

			<form onSubmit={handleSubmit} style={styles.form}>
				<div style={styles.gridTwo}>
					<div>
						<label style={styles.label} htmlFor="first_name">First name</label>
						<input id="first_name" name="first_name" value={form.first_name} onChange={handleChange} style={styles.input} required />
					</div>
					<div>
						<label style={styles.label} htmlFor="last_name">Last name</label>
						<input id="last_name" name="last_name" value={form.last_name} onChange={handleChange} style={styles.input} required />
					</div>
				</div>

				<div style={styles.gridTwo}>
					<div>
						<label style={styles.label} htmlFor="age">Age</label>
						<input id="age" name="age" type="number" min="1" step="1" value={form.age} onChange={handleChange} style={styles.input} required />
					</div>
					<div>
						<label style={styles.label} htmlFor="gender">Gender</label>
						<select id="gender" name="gender" value={form.gender} onChange={handleChange} style={styles.input} required>
							<option value="Male">Male</option>
							<option value="Female">Female</option>
							<option value="Other">Other</option>
						</select>
					</div>
				</div>

				<div style={styles.gridTwo}>
					<div>
						<label style={styles.label} htmlFor="phone">Phone</label>
						<input id="phone" name="phone" value={form.phone} onChange={handleChange} style={styles.input} required />
					</div>
					<div>
						<label style={styles.label} htmlFor="address">Address</label>
						<input id="address" name="address" value={form.address} onChange={handleChange} style={styles.input} required />
					</div>
				</div>

				<button type="submit" disabled={loading} style={styles.primaryButton}>
					{loading ? 'Registering patient...' : 'Register patient'}
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
	successBanner: {
		background: '#ecfdf5',
		border: '1px solid #a7f3d0',
		color: '#065f46',
		borderRadius: '14px',
		padding: '12px 14px',
		lineHeight: 1.5,
	},
	form: {
		display: 'grid',
		gap: '14px',
	},
	gridTwo: {
		display: 'grid',
		gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
		gap: '14px',
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
};

export default PatientRegistration;