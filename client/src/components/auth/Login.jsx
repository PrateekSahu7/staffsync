import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../AuthContext.jsx';
import { errMsg } from '../../api';
import Icon from '../ui/Icon.jsx';

// One-click demo logins appear only when VITE_DEMO_LOGINS=true (for a demo site)
const showDemo = import.meta.env.VITE_DEMO_LOGINS === 'true';
const demo = [
  { label: 'HR', email: 'hr@staffsync.com', password: 'hr12345' },
  { label: 'Manager', email: 'manager@staffsync.com', password: 'manager123' },
  { label: 'Employee', email: 'employee@staffsync.com', password: 'employee123' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [show, setShow] = useState(false);
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
    <div className="auth">
      <div className="auth-side">
        <div className="auth-brand"><span className="brand-mark">S</span>StaffSync</div>
        <h1>Time, leave and people in one place.</h1>
        <ul className="auth-points">
          <li><Icon name="clock" size={18} />Check in and out from any page, and see your hours build through the day.</li>
          <li><Icon name="file" size={18} />Ask for leave and see the answer as soon as your manager gives it.</li>
          <li><Icon name="users" size={18} />HR and managers handle requests, training and announcements without the paperwork.</li>
        </ul>
      </div>
      <div className="auth-form">
        <form onSubmit={submit}>
          <h2 className="page-title mb-1">Log in</h2>
          <p className="text-muted mb-4">Use the email and password HR gave you.</p>
          {error && <div className="alert alert-danger py-2" role="alert">{error}</div>}

          <label className="form-label" htmlFor="email">Email</label>
          <input
            id="email" type="email" className="form-control mb-3" required autoFocus autoComplete="username"
            value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <label className="form-label" htmlFor="password">Password</label>
          <div className="pw mb-4">
            <input
              id="password" type={show ? 'text' : 'password'} className="form-control" required autoComplete="current-password"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" className="icon-btn" aria-label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)}>
              <Icon name={show ? 'eyeoff' : 'eye'} />
            </button>
          </div>
          <button className="btn btn-primary w-100" disabled={busy}>{busy ? 'Logging in...' : 'Log in'}</button>

          {showDemo && (
            <div className="mt-4">
              <div className="text-muted small mb-2">Try a demo account</div>
              <div className="d-flex flex-wrap gap-2">
                {demo.map((d) => (
                  <button type="button" key={d.label} className="chip" onClick={() => { setForm({ email: d.email, password: d.password }); setError(''); }}>
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
