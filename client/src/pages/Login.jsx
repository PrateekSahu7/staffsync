import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import { errMsg } from '../api';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-wrap">
      <div className="login-side">
        <h1>Run your people work in one place.</h1>
        <p>Leave requests, attendance, announcements and team training for HR, managers and employees.</p>
      </div>
      <div className="login-form">
        <form onSubmit={submit}>
          <h4 className="mb-4 page-title">Log in to StaffSync</h4>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <label className="form-label">Email</label>
          <input
            type="email" className="form-control mb-3" required autoFocus
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <label className="form-label">Password</label>
          <input
            type="password" className="form-control mb-4" required
            value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>
        </form>
      </div>
    </div>
  );
}
