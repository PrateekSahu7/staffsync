import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../AuthContext.jsx';

export default function Dashboard() {
  const { user, setUser } = useAuth();
  const [posts, setPosts] = useState([]);
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', address: user.address || '' });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    api.get('/announcements').then((r) => setPosts(r.data.slice(0, 3))).catch(() => {});
  }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.put('/auth/me', form);
      setUser({ ...user, ...data });
      setMsg({ ok: true, text: 'Profile saved' });
    } catch (err) {
      setMsg({ ok: false, text: errMsg(err) });
    }
  };

  return (
    <>
      <h3 className="page-title mb-4">Welcome back, {user.name.split(' ')[0]}</h3>
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="panel p-4">
            <h5 className="mb-3">Latest from HR</h5>
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
          <form className="panel p-4" onSubmit={save}>
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
        </div>
      </div>
    </>
  );
}
