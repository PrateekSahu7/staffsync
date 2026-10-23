import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../AuthContext.jsx';

export default function Announcements() {
  const { user } = useAuth();
  const isHR = user.role === 'hr';
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ title: '', body: '', category: 'announcement' });
  const [error, setError] = useState('');

  const load = () => api.get('/announcements').then((r) => setItems(r.data));
  useEffect(() => { load(); }, []);

  const post = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/announcements', form);
      setForm({ title: '', body: '', category: 'announcement' });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    await api.delete(`/announcements/${id}`);
    load();
  };

  return (
    <>
      <h3 className="page-title mb-4">Announcements and news</h3>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {isHR && (
        <form className="panel p-4 mb-4" onSubmit={post}>
          <h5 className="mb-3">New post</h5>
          <div className="row g-3">
            <div className="col-md-8"><input className="form-control" placeholder="Title" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="col-md-4">
              <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="announcement">Announcement</option><option value="news">Company news</option>
              </select>
            </div>
            <div className="col-12"><textarea className="form-control" rows="3" placeholder="What do people need to know?" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary mt-3">Publish</button>
        </form>
      )}

      {items.length === 0 && <div className="panel p-4 text-muted">Nothing has been posted yet.</div>}
      {items.map((p) => (
        <div key={p._id} className="panel p-4 mb-3">
          <div className="d-flex justify-content-between align-items-start">
            <div>
              <h5 className="mb-1">{p.title}</h5>
              <div className="small text-muted mb-2">
                {p.category === 'news' ? 'Company news' : 'Announcement'} - {p.postedBy?.name} - {fmtDate(p.createdAt)}
              </div>
            </div>
            {isHR && <button className="btn btn-sm btn-outline-danger" onClick={() => remove(p._id)}>Delete</button>}
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{p.body}</div>
        </div>
      ))}
    </>
  );
}
