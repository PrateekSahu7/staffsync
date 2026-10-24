import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../../api';
import { useAuth } from '../../AuthContext.jsx';

const empty = { title: '', description: '', startDate: '', endDate: '', participants: [] };
const statusBadge = { upcoming: 'info text-dark', ongoing: 'success', completed: 'secondary' };
const dateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

export default function TrainingManagement() {
  const { user } = useAuth();
  const isManager = user.role === 'manager';
  const [items, setItems] = useState([]);
  const [team, setTeam] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  const load = () => api.get('/training').then((r) => setItems(r.data));
  useEffect(() => {
    load();
    if (isManager) api.get('/employees').then((r) => setTeam(r.data));
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editId) await api.put(`/training/${editId}`, form);
      else await api.post('/training', form);
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const edit = (t) => {
    setEditId(t._id);
    setForm({
      title: t.title, description: t.description || '',
      startDate: dateInput(t.startDate), endDate: dateInput(t.endDate),
      participants: t.participants.map((p) => p._id),
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this training program?')) return;
    await api.delete(`/training/${id}`);
    load();
  };

  const togglePerson = (id) =>
    setForm((f) => ({
      ...f,
      participants: f.participants.includes(id) ? f.participants.filter((p) => p !== id) : [...f.participants, id],
    }));

  const shown = filter === 'all' ? items : items.filter((t) => t.status === filter);

  return (
    <>
      <h3 className="page-title mb-4">Training and development</h3>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {isManager && (
        <form className="panel p-4 mb-4" onSubmit={submit}>
          <h5 className="mb-3">{editId ? 'Edit program' : 'New program'}</h5>
          <div className="row g-3">
            <div className="col-md-6"><input className="form-control" placeholder="Program title" required value={form.title} onChange={set('title')} /></div>
            <div className="col-md-3"><input type="date" className="form-control" required value={form.startDate} onChange={set('startDate')} /></div>
            <div className="col-md-3"><input type="date" className="form-control" required min={form.startDate} value={form.endDate} onChange={set('endDate')} /></div>
            <div className="col-12"><textarea className="form-control" rows="2" placeholder="What will the team learn?" value={form.description} onChange={set('description')} /></div>
            <div className="col-12">
              <div className="small text-muted mb-1">Who is attending</div>
              {team.length === 0 && <div className="text-muted small">No one reports to you yet. HR can assign team members.</div>}
              <div className="d-flex flex-wrap gap-3">
                {team.map((m) => (
                  <label key={m._id} className="form-check">
                    <input type="checkbox" className="form-check-input" checked={form.participants.includes(m._id)} onChange={() => togglePerson(m._id)} />
                    <span className="form-check-label">{m.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary">{editId ? 'Save changes' : 'Create program'}</button>
            {editId && <button type="button" className="btn btn-light" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
          </div>
        </form>
      )}

      <div className="d-flex align-items-center gap-2 mb-3">
        <span className="text-muted">Show</span>
        <select className="form-select w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All programs</option>
          <option value="upcoming">Upcoming</option>
          <option value="ongoing">Running now</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="panel table-responsive">
        <table className="table mb-0 align-middle">
          <thead><tr><th>Program</th><th>Dates</th><th>Led by</th><th>Status</th><th>Attending</th>{isManager && <th />}</tr></thead>
          <tbody>
            {shown.length === 0 && (
              <tr><td colSpan="6" className="text-muted text-center py-4">
                {items.length > 0 ? 'No programs match this filter.' : isManager ? 'No programs yet. Create one above.' : 'You are not enrolled in any training program.'}
              </td></tr>
            )}
            {shown.map((t) => (
              <tr key={t._id}>
                <td><strong>{t.title}</strong><div className="small text-muted">{t.description}</div></td>
                <td className="text-nowrap">{fmtDate(t.startDate)} to {fmtDate(t.endDate)}</td>
                <td>{t.createdBy?.name}</td>
                <td><span className={`badge bg-${statusBadge[t.status]}`}>{t.status}</span></td>
                <td>{t.participants.map((p) => p.name).join(', ') || '-'}</td>
                {isManager && (
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => edit(t)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(t._id)}>Delete</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
