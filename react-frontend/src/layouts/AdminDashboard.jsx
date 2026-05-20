import React, { useEffect, useMemo, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const initialFormState = {
	full_name: '',
	email: '',
	password: '',
	phone: '',
	role: 'Doctor',
};

function AdminDashboard() {
	const { user, logout } = useAuth();
	const [staff, setStaff] = useState([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [togglingId, setTogglingId] = useState(null);
	const [error, setError] = useState('');
	const [success, setSuccess] = useState('');
	const [form, setForm] = useState(initialFormState);

	const roleIsAllowed = user && user.role === 'Admin';

	useEffect(() => {
		let active = true;

		async function loadStaff() {
			setLoading(true);
			setError('');

			try {
				const response = await api.get('/users/list.php');
				const rows = response && response.data && Array.isArray(response.data.data) ? response.data.data : [];
				if (active) {
					setStaff(rows);
				}
			} catch (caughtError) {
				const message = caughtError && caughtError.response && caughtError.response.data && caughtError.response.data.message
					? caughtError.response.data.message
					: 'Unable to load staff list.';
				if (active) {
					setError(message);
				}
			} finally {
				if (active) {
					setLoading(false);
				}
			}
		}

		loadStaff();

		return () => {
			active = false;
		};
	}, []);

	const activeCount = useMemo(() => staff.filter((member) => Number(member.is_active) === 1).length, [staff]);

	function handleFieldChange(event) {
		const { name, value } = event.target;
		setForm((current) => ({
			...current,
			[name]: value,
		}));
	}

	async function handleSubmit(event) {
		event.preventDefault();
		setSaving(true);
		setError('');
		setSuccess('');

		try {
			const response = await api.post('/users/create.php', form);
			const createdId = response && response.data ? response.data.user_id : null;

			setSuccess(response && response.data && response.data.message ? response.data.message : 'User created successfully.');
			setForm(initialFormState);

			if (createdId) {
				const refreshed = await api.get('/users/list.php');
				const rows = refreshed && refreshed.data && Array.isArray(refreshed.data.data) ? refreshed.data.data : [];
				setStaff(rows);
			}
		} catch (caughtError) {
			const message = caughtError && caughtError.response && caughtError.response.data && caughtError.response.data.message
				? caughtError.response.data.message
				: 'Unable to create user.';
			setError(message);
		} finally {
			setSaving(false);
		}
	}

	async function toggleStatus(member) {
		const nextStatus = Number(member.is_active) === 1 ? 0 : 1;
		setTogglingId(member.id);
		setError('');
		setSuccess('');

		try {
			await api.put('/users/toggle-status.php', {
				user_id: member.id,
				is_active: nextStatus,
			});

			setStaff((current) =>
				current.map((row) =>
					row.id === member.id
						? {
							...row,
							is_active: nextStatus,
						}
						: row
				)
			);
		} catch (caughtError) {
			const message = caughtError && caughtError.response && caughtError.response.data && caughtError.response.data.message
				? caughtError.response.data.message
				: 'Unable to update user status.';
			setError(message);
		} finally {
			setTogglingId(null);
		}
	}

	if (!roleIsAllowed) {
		return <Navigate to="/unauthorized" replace />;
	}

	return (
		<div style={styles.page}>
			<header style={styles.header}>
				<div>
					<div style={styles.eyebrow}>Administrator Console</div>
					<h1 style={styles.title}>User Management</h1>
					<p style={styles.subtitle}>Register staff accounts, monitor active users, and update account status.</p>
				</div>
				<button type="button" onClick={logout} style={styles.logoutButton}>
					Logout
				</button>
			</header>

			<div style={styles.statsGrid}>
				<div style={styles.statCard}>
					<div style={styles.statValue}>{staff.length}</div>
					<div style={styles.statLabel}>Total staff</div>
				</div>
				<div style={styles.statCard}>
					<div style={styles.statValue}>{activeCount}</div>
					<div style={styles.statLabel}>Active accounts</div>
				</div>
				<div style={styles.statCard}>
					<div style={styles.statValue}>{staff.length - activeCount}</div>
					<div style={styles.statLabel}>Inactive accounts</div>
				</div>
			</div>

			<div style={styles.grid}>
				<section style={styles.panel}>
					<div style={styles.panelHeader}>
						<div>
							<div style={styles.panelEyebrow}>Create Staff</div>
							<h2 style={styles.panelTitle}>Register user</h2>
						</div>
					</div>

					{error ? <div style={styles.errorBanner}>{error}</div> : null}
					{success ? <div style={styles.successBanner}>{success}</div> : null}

					<form onSubmit={handleSubmit} style={styles.form}>
						<label style={styles.label} htmlFor="full_name">Full name</label>
						<input id="full_name" name="full_name" value={form.full_name} onChange={handleFieldChange} style={styles.input} required />

						<label style={styles.label} htmlFor="email">Email</label>
						<input id="email" type="email" name="email" value={form.email} onChange={handleFieldChange} style={styles.input} required />

						<label style={styles.label} htmlFor="password">Password</label>
						<input id="password" type="password" name="password" value={form.password} onChange={handleFieldChange} style={styles.input} required />

						<label style={styles.label} htmlFor="phone">Phone</label>
						<input id="phone" name="phone" value={form.phone} onChange={handleFieldChange} style={styles.input} />

						<label style={styles.label} htmlFor="role">Role</label>
						<select id="role" name="role" value={form.role} onChange={handleFieldChange} style={styles.input} required>
							<option value="Admin">Admin</option>
							<option value="Receptionist">Receptionist</option>
							<option value="Doctor">Doctor</option>
						</select>

						<button type="submit" disabled={saving} style={styles.primaryButton}>
							{saving ? 'Creating user...' : 'Create user'}
						</button>
					</form>
				</section>

				<section style={styles.panel}>
					<div style={styles.panelHeader}>
						<div>
							<div style={styles.panelEyebrow}>Staff Directory</div>
							<h2 style={styles.panelTitle}>System users</h2>
						</div>
					</div>

					<div style={styles.tableWrap}>
						<table style={styles.table}>
							<thead>
								<tr>
									<th style={styles.th}>ID</th>
									<th style={styles.th}>Name</th>
									<th style={styles.th}>Email</th>
									<th style={styles.th}>Phone</th>
									<th style={styles.th}>Role</th>
									<th style={styles.th}>Status</th>
									<th style={styles.th}>Action</th>
								</tr>
							</thead>
							<tbody>
								{loading ? (
									<tr>
										<td style={styles.td} colSpan={7}>Loading staff members...</td>
									</tr>
								) : staff.length === 0 ? (
									<tr>
										<td style={styles.td} colSpan={7}>No staff records found.</td>
									</tr>
								) : (
									staff.map((member) => (
										<tr key={member.id}>
											<td style={styles.td}>{member.id}</td>
											<td style={styles.td}>{member.full_name}</td>
											<td style={styles.td}>{member.email}</td>
											<td style={styles.td}>{member.phone || '-'}</td>
											<td style={styles.td}>{member.role}</td>
											<td style={styles.td}>
												<span style={Number(member.is_active) === 1 ? styles.activeBadge : styles.inactiveBadge}>
													{Number(member.is_active) === 1 ? 'Active' : 'Inactive'}
												</span>
											</td>
											<td style={styles.td}>
												<button
													type="button"
													onClick={() => toggleStatus(member)}
													disabled={togglingId === member.id}
													style={styles.secondaryButton}
												>
													{togglingId === member.id ? 'Updating...' : Number(member.is_active) === 1 ? 'Deactivate' : 'Activate'}
												</button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</section>
			</div>
		</div>
	);
}

const styles = {
	page: {
		minHeight: '100vh',
		padding: '32px',
		background: 'linear-gradient(180deg, #f7fafc 0%, #eef4f8 100%)',
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
		maxWidth: '60ch',
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
	statsGrid: {
		display: 'grid',
		gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
		gap: '16px',
		marginBottom: '24px',
	},
	statCard: {
		background: '#ffffff',
		borderRadius: '20px',
		padding: '20px',
		boxShadow: '0 20px 50px rgba(15, 23, 42, 0.08)',
	},
	statValue: {
		fontSize: '2rem',
		fontWeight: 800,
		color: '#0f172a',
	},
	statLabel: {
		marginTop: '8px',
		color: '#64748b',
		fontWeight: 600,
	},
	grid: {
		display: 'grid',
		gridTemplateColumns: '0.95fr 1.15fr',
		gap: '20px',
		alignItems: 'start',
	},
	panel: {
		background: '#ffffff',
		borderRadius: '24px',
		padding: '24px',
		boxShadow: '0 20px 60px rgba(15, 23, 42, 0.08)',
	},
	panelHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: '18px',
	},
	panelEyebrow: {
		fontSize: '0.78rem',
		fontWeight: 800,
		letterSpacing: '0.16em',
		textTransform: 'uppercase',
		color: '#0f766e',
		marginBottom: '8px',
	},
	panelTitle: {
		margin: 0,
		fontSize: '1.35rem',
		fontWeight: 800,
	},
	errorBanner: {
		background: '#fef2f2',
		border: '1px solid #fecaca',
		color: '#991b1b',
		borderRadius: '14px',
		padding: '12px 14px',
		marginBottom: '14px',
		lineHeight: 1.5,
	},
	successBanner: {
		background: '#ecfdf5',
		border: '1px solid #a7f3d0',
		color: '#065f46',
		borderRadius: '14px',
		padding: '12px 14px',
		marginBottom: '14px',
		lineHeight: 1.5,
	},
	form: {
		display: 'grid',
		gap: '12px',
	},
	label: {
		fontWeight: 700,
		fontSize: '0.95rem',
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
		marginTop: '6px',
		padding: '13px 16px',
		border: 'none',
		borderRadius: '14px',
		background: 'linear-gradient(135deg, #0f766e 0%, #115e59 100%)',
		color: '#ffffff',
		fontWeight: 800,
		cursor: 'pointer',
	},
	tableWrap: {
		overflowX: 'auto',
	},
	table: {
		width: '100%',
		borderCollapse: 'collapse',
	},
	th: {
		textAlign: 'left',
		padding: '12px 10px',
		fontSize: '0.88rem',
		textTransform: 'uppercase',
		letterSpacing: '0.08em',
		color: '#64748b',
		borderBottom: '1px solid #e2e8f0',
	},
	td: {
		padding: '14px 10px',
		borderBottom: '1px solid #e2e8f0',
		verticalAlign: 'top',
	},
	activeBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		padding: '6px 10px',
		borderRadius: '999px',
		background: '#ecfdf5',
		color: '#065f46',
		fontWeight: 700,
		fontSize: '0.84rem',
	},
	inactiveBadge: {
		display: 'inline-flex',
		alignItems: 'center',
		padding: '6px 10px',
		borderRadius: '999px',
		background: '#fef2f2',
		color: '#991b1b',
		fontWeight: 700,
		fontSize: '0.84rem',
	},
	secondaryButton: {
		padding: '10px 14px',
		borderRadius: '12px',
		border: '1px solid #cbd5e1',
		background: '#ffffff',
		fontWeight: 700,
		cursor: 'pointer',
		color: '#0f172a',
	},
};

export default AdminDashboard;