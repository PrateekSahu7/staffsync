import { useEffect, useState } from 'react';
import api, { errMsg, fmtDay } from '../../api';
import { useAuth } from '../../AuthContext.jsx';
import usePolling from '../../usePolling.js';
import Icon from '../ui/Icon.jsx';
import { useToast } from '../ui/Toast.jsx';
import { useConfirm } from '../ui/Confirm.jsx';
import { Avatar, EmptyState, PageHeader, Pill, Skeleton } from '../ui/ui.jsx';

const empty = { title: '', description: '', startDate: '', endDate: '', participants: [] };
const dateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');
const filters = [['all', 'All'], ['upcoming', 'Upcoming'], ['ongoing', 'Running now'], ['completed', 'Completed']];

// How far through the program we are, from its dates
function progress(t) {
  if (t.status === 'upcoming') return 0;
  if (t.status === 'completed') return 100;
  const start = new Date(t.startDate).getTime();
  const end = new Date(t.endDate).getTime() + 86400000;
  return Math.round(Math.min(1, Math.max(0, (Date.now() - start) / (end - start))) * 100);
}

// Managers plan and assign training. Employees and HR see the programs read-only.
export default function TrainingManagement() {
  const { user } = useAuth();
  const toast = useToast();
  const ask = useConfirm();
  const isManager = user.role === 'manager';

  const [items, setItems] = useState(null);
  const [team, setTeam] = useState([]);
  const [filter, setFilter] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/training').then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => {
    load();
    if (isManager) api.get('/employees').then((r) => setTeam(r.data)).catch(() => {});
  }, []);
  usePolling(load);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const togglePerson = (id) => setForm((f) => ({
    ...f, participants: f.participants.includes(id) ? f.participants.filter((p) => p !== id) : [...f.participants, id],
  }));
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(empty); };

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editId) await api.put(`/training/${editId}`, form);
      else await api.post('/training', form);
      toast.success(editId ? 'Program updated' : 'Program created');
      closeForm();
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const edit = (t) => {
    setEditId(t._id);
    setForm({
      title: t.title, description: t.description || '', startDate: dateInput(t.startDate), endDate: dateInput(t.endDate),
      participants: t.participants.map((p) => p._id),
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (t) => {
    const answer = await ask({ title: 'Delete this program?', message: `"${t.title}" will be removed for everyone enrolled.`, confirmText: 'Delete program', danger: true });
    if (answer === null) return;
    try {
      await api.delete(`/training/${t._id}`);
      toast.success('Program deleted');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const shown = (items || []).filter((t) => filter === 'all' || t.status === filter);
  const count = (k) => (items || []).filter((t) => k === 'all' || t.status === k).length;

  return (
    <>
      <PageHeader title="Training" subtitle={isManager ? 'Plan programs and choose who attends.' : user.role === 'hr' ? 'Every program in the company.' : 'Programs you are enrolled in.'}>
        {isManager && (
          <button className={`btn ${showForm && !editId ? 'btn-light' : 'btn-primary'}`} onClick={() => (showForm && !editId ? closeForm() : (setEditId(null), setForm(empty), setShowForm(true)))}>
            <Icon name={showForm && !editId ? 'x' : 'plus'} size={16} className="me-2" />{showForm && !editId ? 'Close' : 'New program'}
          </button>
        )}
      </PageHeader>

      {isManager && showForm && (
        <form className="panel p-4 mb-4" onSubmit={submit}>
          <h5 className="mb-3">{editId ? 'Edit program' : 'New program'}</h5>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">Title</label><input className="form-control" required autoFocus value={form.title} onChange={set('title')} /></div>
            <div className="col-md-3"><label className="form-label">Starts</label><input type="date" className="form-control" required value={form.startDate} onChange={set('startDate')} /></div>
            <div className="col-md-3"><label className="form-label">Ends</label><input type="date" className="form-control" required min={form.startDate} value={form.endDate} onChange={set('endDate')} /></div>
            <div className="col-12"><label className="form-label">What will the team learn?</label><textarea className="form-control" rows="2" value={form.description} onChange={set('description')} /></div>
            <div className="col-12">
              <div className="form-label">Who attends</div>
              {team.length === 0 && <div className="text-muted">No one reports to you yet. HR can assign people to your team.</div>}
              <div className="d-flex flex-wrap gap-2">
                {team.map((m) => (
                  <button type="button" key={m._id} className={`chip ${form.participants.includes(m._id) ? 'active' : ''}`} onClick={() => togglePerson(m._id)} aria-pressed={form.participants.includes(m._id)}>
                    <Avatar name={m.name} size={20} />{m.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary">{editId ? 'Save changes' : 'Create program'}</button>
            <button type="button" className="btn btn-light" onClick={closeForm}>Cancel</button>
          </div>
        </form>
      )}

      <div className="d-flex flex-wrap gap-2 mb-3">
        {filters.map(([k, label]) => (
          <button key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>
            {label}<span className="count">{count(k)}</span>
          </button>
        ))}
      </div>

      <div className="panel">
        {items === null && <div className="p-4"><Skeleton lines={3} /></div>}
        {items && shown.length === 0 && (
          <EmptyState icon="book" title={items.length === 0 ? 'No training programs yet' : 'No programs match this filter'}
            hint={items.length === 0 ? (isManager ? 'Create a program and choose who attends.' : 'Programs you are enrolled in will appear here.') : 'Try another filter.'} />
        )}
        {shown.map((t) => (
          <div className="trow" key={t._id}>
            <div>
              <div className="d-flex align-items-center gap-2 mb-1"><strong>{t.title}</strong><Pill value={t.status} /></div>
              <div className="desc">{t.description || 'No description added.'}</div>
              <div className="desc">Led by {t.createdBy?.name}</div>
            </div>
            <div>
              <div className="small">{fmtDay(t.startDate)} to {fmtDay(t.endDate)}</div>
              <div className={`progress-x ${t.status === 'completed' ? 'done' : ''}`} role="progressbar" aria-valuenow={progress(t)} aria-valuemin="0" aria-valuemax="100" aria-label="Progress">
                <i style={{ width: `${progress(t)}%` }} />
              </div>
            </div>
            <div className="avatars" title={t.participants.map((p) => p.name).join(', ')}>
              {t.participants.length === 0 && <span className="text-muted small">No one enrolled</span>}
              {t.participants.slice(0, 4).map((p) => <Avatar key={p._id} name={p.name} size={30} />)}
              {t.participants.length > 4 && <span className="avatar more" style={{ width: 30, height: 30 }}>+{t.participants.length - 4}</span>}
            </div>
            {isManager ? (
              <div className="text-nowrap">
                <button className="icon-btn me-2" aria-label={`Edit ${t.title}`} title="Edit" onClick={() => edit(t)}><Icon name="edit" size={16} /></button>
                <button className="icon-btn danger" aria-label={`Delete ${t.title}`} title="Delete" onClick={() => remove(t)}><Icon name="trash" size={16} /></button>
              </div>
            ) : <span />}
          </div>
        ))}
      </div>
    </>
  );
}
