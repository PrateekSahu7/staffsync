import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api';
import { useAuth } from '../../AuthContext.jsx';
import Icon from '../ui/Icon.jsx';
import { useToast } from '../ui/Toast.jsx';
import { useConfirm } from '../ui/Confirm.jsx';
import { Avatar, EmptyState, PageHeader, Pill, SkeletonRows } from '../ui/ui.jsx';

const empty = { name: '', email: '', password: '', role: 'employee', department: '', designation: '', phone: '', manager: '' };
const roleOrder = { hr: 0, manager: 1, employee: 2 };
const roleTabs = [['all', 'Everyone'], ['hr', 'HR'], ['manager', 'Managers'], ['employee', 'Employees']];

// HR adds, edits and deletes people. A manager sees their team here, read-only.
export default function EmployeeCRUD() {
  const { user } = useAuth();
  const toast = useToast();
  const ask = useConfirm();
  const isHR = user.role === 'hr';

  const [list, setList] = useState(null);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sort, setSort] = useState({ key: 'name', dir: 1 });
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/employees').then((r) => setList(r.data)).catch((e) => toast.error(errMsg(e)));
  useEffect(() => { load(); }, []);

  const visible = useMemo(() => {
    if (!list) return [];
    const q = query.trim().toLowerCase();
    const rows = list.filter((p) =>
      (roleFilter === 'all' || p.role === roleFilter) &&
      (!q || [p.name, p.email, p.department, p.designation].some((v) => (v || '').toLowerCase().includes(q))));
    const val = (p) => (sort.key === 'role' ? roleOrder[p.role] : String(p[sort.key] || '').toLowerCase());
    return rows.sort((a, b) => (val(a) > val(b) ? 1 : val(a) < val(b) ? -1 : 0) * sort.dir);
  }, [list, query, roleFilter, sort]);

  const countRole = (k) => (list || []).filter((p) => k === 'all' || p.role === k).length;

  const managers = (list || []).filter((p) => ['manager', 'hr'].includes(p.role));
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const toggleSort = (key) => setSort((s) => (s.key === key ? { key, dir: -s.dir } : { key, dir: 1 }));
  const arrow = (key) => (sort.key === key ? (sort.dir === 1 ? ' ↑' : ' ↓') : '');

  const openAdd = () => { setEditId(null); setForm(empty); setShowForm(true); };
  const openEdit = (p) => {
    setEditId(p._id);
    setForm({ ...empty, ...p, password: '', manager: p.manager?._id || '' });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const closeForm = () => { setShowForm(false); setEditId(null); setForm(empty); };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, manager: form.manager || null };
    if (editId && !payload.password) delete payload.password;
    try {
      if (editId) await api.put(`/employees/${editId}`, payload);
      else await api.post('/employees', payload);
      toast.success(editId ? 'Changes saved' : `${form.name} added`);
      closeForm();
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const remove = async (p) => {
    const answer = await ask({
      title: `Delete ${p.name}?`,
      message: 'This removes their login, leave requests, attendance and posts. It cannot be undone.',
      confirmText: 'Delete person', danger: true,
    });
    if (answer === null) return;
    try {
      await api.delete(`/employees/${p._id}`);
      toast.success(`${p.name} deleted`);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <>
      <PageHeader title={isHR ? 'Employees' : 'My team'} subtitle={list ? `${list.length} ${list.length === 1 ? 'person' : 'people'}` : 'Loading...'}>
        <div className="search">
          <Icon name="search" size={16} />
          <input className="form-control" placeholder="Search people" aria-label="Search people" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {isHR && <button className="btn btn-primary" onClick={showForm && !editId ? closeForm : openAdd}><Icon name={showForm && !editId ? 'x' : 'plus'} size={16} className="me-2" />{showForm && !editId ? 'Close' : 'Add person'}</button>}
        {isHR && <Link to="/register" className="btn btn-light">Registration form</Link>}
      </PageHeader>

      {isHR && showForm && (
        <form className="panel p-4 mb-4" onSubmit={submit}>
          <h5 className="mb-3">{editId ? 'Edit person' : 'Add a person'}</h5>
          <div className="row g-3">
            <div className="col-md-4"><label className="form-label">Full name</label><input className="form-control" required autoFocus value={form.name} onChange={set('name')} /></div>
            <div className="col-md-4"><label className="form-label">Email</label><input type="email" className="form-control" required value={form.email} onChange={set('email')} /></div>
            <div className="col-md-4">
              <label className="form-label">{editId ? 'New password (optional)' : 'Password (at least 6 characters)'}</label>
              <input type="password" className="form-control" minLength={6} required={!editId} autoComplete="new-password" value={form.password} onChange={set('password')} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Role</label>
              <select className="form-select" value={form.role} onChange={set('role')}>
                <option value="employee">Employee</option><option value="manager">Manager</option><option value="hr">HR</option>
              </select>
            </div>
            <div className="col-md-3"><label className="form-label">Department</label><input className="form-control" value={form.department} onChange={set('department')} /></div>
            <div className="col-md-3"><label className="form-label">Designation</label><input className="form-control" value={form.designation} onChange={set('designation')} /></div>
            <div className="col-md-3"><label className="form-label">Phone</label><input className="form-control" value={form.phone} onChange={set('phone')} /></div>
            <div className="col-md-4">
              <label className="form-label">Reports to</label>
              <select className="form-select" value={form.manager} onChange={set('manager')}>
                <option value="">No manager</option>
                {managers.filter((m) => m._id !== editId).map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary">{editId ? 'Save changes' : 'Add person'}</button>
            <button type="button" className="btn btn-light" onClick={closeForm}>Cancel</button>
          </div>
        </form>
      )}

      <div className="d-flex flex-wrap gap-2 mb-3">
        {roleTabs.map(([k, label]) => (
          <button key={k} className={`chip ${roleFilter === k ? 'active' : ''}`} onClick={() => setRoleFilter(k)}>
            {label}<span className="count">{countRole(k)}</span>
          </button>
        ))}
      </div>

      <div className="panel table-wrap">
        <table className="table align-middle">
          <thead>
            <tr>
              <th><button className="th-btn" onClick={() => toggleSort('name')}>Name{arrow('name')}</button></th>
              <th><button className="th-btn" onClick={() => toggleSort('role')}>Role{arrow('role')}</button></th>
              <th><button className="th-btn" onClick={() => toggleSort('department')}>Department{arrow('department')}</button></th>
              <th>Designation</th><th>Reports to</th>{isHR && <th />}
            </tr>
          </thead>
          <tbody>
            {list === null && <SkeletonRows cols={isHR ? 6 : 5} />}
            {list && visible.length === 0 && (
              <tr><td colSpan={isHR ? 6 : 5}>
                <EmptyState icon="users" title={list.length === 0 ? (isHR ? 'No one here yet' : 'No one reports to you yet') : 'No one matches'}
                  hint={list.length === 0 ? (isHR ? 'Add the first person to get started.' : 'HR can assign people to your team.') : 'Try another search or filter.'} />
              </td></tr>
            )}
            {visible.map((p) => (
              <tr key={p._id}>
                <td><div className="person"><Avatar name={p.name} /><div>{p.name}<small>{p.email}</small></div></div></td>
                <td><Pill value={p.role}>{p.role === 'hr' ? 'HR' : p.role}</Pill></td>
                <td>{p.department || '-'}</td><td>{p.designation || '-'}</td><td>{p.manager?.name || '-'}</td>
                {isHR && (
                  <td className="text-end text-nowrap">
                    <button className="icon-btn me-2" aria-label={`Edit ${p.name}`} title="Edit" onClick={() => openEdit(p)}><Icon name="edit" size={16} /></button>
                    <button className="icon-btn danger" aria-label={`Delete ${p.name}`} title="Delete" onClick={() => remove(p)}><Icon name="trash" size={16} /></button>
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
