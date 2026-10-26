import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg, fmtDate, timeAgo } from '../api';
import { useAuth } from '../AuthContext.jsx';
import usePolling from '../usePolling.js';
import useCountUp from '../useCountUp.js';
import { useToast } from './ui/Toast.jsx';

function Stat({ item }) {
  const value = useCountUp(item.value);
  return (
    <Link to={item.to} className="stat">
      <b className={item.text ? 'text' : ''}>{value}</b>
      <span>{item.label}</span>
    </Link>
  );
}

// Shared layout of the three dashboards. Each role page supplies its own numbers through
// `layout` (stats -> list of items) and may add more content as children. Children can be
// a function that receives the stats (null while they load).
export default function DashboardView({ subtitle, layout, children }) {
  const { user, setUser } = useAuth();
  const toast = useToast();
  const [stats, setStats] = useState(null);
  const [posts, setPosts] = useState(null);
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '' });

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
      toast.success('Details saved');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    try {
      await api.put('/auth/password', pw);
      setPw({ currentPassword: '', newPassword: '' });
      toast.success('Password changed');
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const items = stats ? layout(stats) : [];
  const extra = typeof children === 'function' ? children(stats) : children;

  return (
    <>
      <h1 className="hero-title">{greet}, {user.name.split(' ')[0]}</h1>
      <p className="text-muted mb-4">{subtitle}</p>

      <div className="panel strip mb-4">
        {!stats && [0, 1, 2, 3].map((i) => (
          <div className="stat" key={i}>
            <div className="skel mb-2" style={{ width: '40%', height: 32 }} />
            <div className="skel" style={{ width: '70%' }} />
          </div>
        ))}
        {items.map((it) => <Stat key={it.label} item={it} />)}
      </div>

      {extra}

      <div className="row g-4">
        <div className="col-lg-7">
          <div className="panel p-4 h-100">
            <div className="section-title">
              <h5 className="mb-0">Latest announcements</h5>
              <Link to="/announcements" className="small">See all</Link>
            </div>
            {posts === null && <div className="skel mb-3" />}
            {posts && posts.length === 0 && <p className="text-muted mb-0">Nothing has been posted yet.</p>}
            {posts && posts.map((p) => (
              <div key={p._id} className="py-3 border-top">
                <div className="d-flex justify-content-between gap-3">
                  <strong>{p.title}</strong>
                  <span className="small text-muted text-nowrap">{timeAgo(p.createdAt)}</span>
                </div>
                <div className="text-muted">{p.body.length > 140 ? `${p.body.slice(0, 140)}...` : p.body}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-5">
          <div className="panel p-4 h-100">
            <div className="segmented mb-3" role="tablist">
              <button className={tab === 'profile' ? 'active' : ''} onClick={() => setTab('profile')}>My details</button>
              <button className={tab === 'password' ? 'active' : ''} onClick={() => setTab('password')}>Password</button>
            </div>

            {tab === 'profile' && (
              <form onSubmit={save}>
                <dl className="row small mb-3">
                  <dt className="col-4 text-muted fw-normal">Email</dt><dd className="col-8">{user.email}</dd>
                  <dt className="col-4 text-muted fw-normal">Department</dt><dd className="col-8">{user.department || '-'}</dd>
                  <dt className="col-4 text-muted fw-normal">Designation</dt><dd className="col-8">{user.designation || '-'}</dd>
                  <dt className="col-4 text-muted fw-normal">Joined</dt><dd className="col-8">{fmtDate(user.joinDate)}</dd>
                </dl>
                <label className="form-label">Name</label>
                <input className="form-control mb-2" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                <label className="form-label">Phone</label>
                <input className="form-control mb-2" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                <label className="form-label">Address</label>
                <textarea className="form-control mb-3" rows="2" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                <button className="btn btn-primary">Save details</button>
              </form>
            )}

            {tab === 'password' && (
              <form onSubmit={changePassword}>
                <label className="form-label">Current password</label>
                <input type="password" className="form-control mb-2" required autoComplete="current-password" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} />
                <label className="form-label">New password (at least 6 characters)</label>
                <input type="password" className="form-control mb-3" required minLength={6} autoComplete="new-password" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} />
                <button className="btn btn-primary">Change password</button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
