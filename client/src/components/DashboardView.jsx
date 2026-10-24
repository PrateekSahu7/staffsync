import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../AuthContext.jsx';
import usePolling from '../usePolling.js';

// Shared layout of the three dashboards. Each role page supplies its own numbers
// through `layout` (stats -> list of tiles) and may add extra content as children.
export default function DashboardView({ subtitle, layout, children }) {
  const { user, setUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [msg, setMsg] = useState(null);
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });
  const [pwMsg, setPwMsg] = useState(null);

  const load = () => {
    api.get('/reports/dashboard').then((r) => setStats(r.data.stats)).catch(() => {});
    api.get('/announcements').then((r) => setPosts(r.data.slice(0, 3))).catch(() => {});
  };
  useEffect(() => { load(); }, []);
  usePolling(load);

  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/me', form);
      setUser({ ...user, ...data });
      setMsg({ ok: true, text: 'Details saved' });
    } catch (err) {
      setMsg({ ok: false, text: errMsg(err) });
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      setPwMsg({ ok: true, text: 'Password changed' });
    } catch (err) {
      setPwMsg({ ok: false, text: errMsg(err) });
    }
  };

  const items = stats ? layout(stats) : [];

  return (
    <>
      <h3 className="page-title mb-1">Welcome back, {user.name.split(' ')[0]}</h3>
      <p className="text-muted mb-4">{subtitle}</p>

      <div className="panel stat-strip mb-4">
        {!stats && <div className="p-4 text-muted">Loading your numbers...</div>}
        {items.map((it) => (
          <Link key={it.label} to={it.to} className="stat">
            <b className={it.text ? 'text' : ''}>{it.value}</b>
            <span>{it.label}</span>
          </Link>
        ))}
      </div>

      {children}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="panel p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h5 className="mb-0">Latest announcements</h5>
              <Link to="/announcements" className="small">See all</Link>
            </div>
            {posts.length === 0 && <p className="text-muted mb-0">Nothing posted yet.</p>}
            {posts.map((p) => (
              <div key={p._id} className="mb-3 pb-3 border-bottom">
                <div className="d-flex justify-content-between">
                  <strong>{p.title}</strong>
                  <span className="small text-muted">{fmtDate(p.createdAt)}</span>
                </div>
                <div className="text-secondary">{p.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-5">
          <form className="panel p-4 mb-4" onSubmit={save}>
            <h5 className="mb-3">My details</h5>
            <dl className="row small mb-3">
              <dt className="col-4 text-muted fw-normal">Email</dt><dd className="col-8">{user.email}</dd>
              <dt className="col-4 text-muted fw-normal">Department</dt><dd className="col-8">{user.department || '-'}</dd>
              <dt className="col-4 text-muted fw-normal">Designation</dt><dd className="col-8">{user.designation || '-'}</dd>
              <dt className="col-4 text-muted fw-normal">Joined</dt><dd className="col-8">{fmtDate(user.joinDate)}</dd>
            </dl>
            {msg && <div className={`alert py-2 ${msg.ok ? 'alert-success' : 'alert-danger'}`}>{msg.text}</div>}
            <label className="form-label">Name</label>
            <input className="form-control mb-2" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <label className="form-label">Phone</label>
            <input className="form-control mb-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <label className="form-label">Address</label>
            <textarea className="form-control mb-3" rows="2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
            <button className="btn btn-primary">Save details</button>
          </form>

          <form className="panel p-4" onSubmit={changePassword}>
            <h5 className="mb-3">Change password</h5>
            {pwMsg && <div className={`alert py-2 ${pwMsg.ok ? 'alert-success' : 'alert-danger'}`}>{pwMsg.text}</div>}
            <label className="form-label">Current password</label>
            <input type="password" className="form-control mb-2" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
            <label className="form-label">New password (at least 6 characters)</label>
            <input type="password" className="form-control mb-3" required minLength={6} value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
            <button className="btn btn-primary">Change password</button>
          </form>
        </div>
      </div>
    </>
  );
}
