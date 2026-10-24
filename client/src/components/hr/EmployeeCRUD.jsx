import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api';
import { useAuth } from '../../AuthContext.jsx';

const empty = { name: '', email: '', password: '', role: 'employee', department: '', designation: '', phone: '', manager: '' };

export default function EmployeeCRUD() {
  const { user } = useAuth();
  const isHR = user.role === 'hr';
  const [list, setList] = useState([]);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [error, setError] = useState('');

  const load = () => api.get('/employees').then((r) => setList(r.data)).catch((e) => setError(errMsg(e)));
  useEffect(() => { load(); }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const payload = { ...form, manager: form.manager || null };
    if (editId && !payload.password) delete payload.password;
    try {
      if (editId) await api.put(`/employees/${editId}`, payload);
      else await api.post('/employees', payload);
      setForm(empty);
      setEditId(null);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const edit = (u) => {
    setEditId(u._id);
    setForm({ ...empty, ...u, password: '', manager: u.manager?._id || '' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const remove = async (u) => {
    if (!window.confirm(`Delete ${u.name}? This cannot be undone.`)) return;
    try {
      await api.delete(`/employees/${u._id}`);
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  const managers = list.filter(
    (u) => ['manager', 'hr'].includes(u.role)
  );
  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="page-title mb-0">{isHR ? 'Employees' : 'My team'}</h3>
        {isHR && <Link to="/register" className="btn btn-outline-primary">Register a person</Link>}
      </div>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      {isHR && (
        <form className="panel p-4 mb-4" onSubmit={submit}>
          <h5 className="mb-3">{editId ? 'Edit employee' : 'Add employee'}</h5>
          <div className="row g-3">
            <div className="col-md-4"><input className="form-control" placeholder="Full name" required value={form.name} onChange={set('name')} /></div>
            <div className="col-md-4"><input type="email" className="form-control" placeholder="Email" required value={form.email} onChange={set('email')} /></div>
            <div className="col-md-4">
              <input type="password" className="form-control" minLength={6}
                placeholder={editId ? 'New password (optional)' : 'Password (min 6)'} required={!editId}
                value={form.password} onChange={set('password')} />
            </div>
            <div className="col-md-3">
              <select className="form-select" value={form.role} onChange={set('role')}>
                <option value="employee">Employee</option>
                <option value="manager">Manager</option>
                <option value="hr">HR</option>
              </select>
            </div>
            <div className="col-md-3"><input className="form-control" placeholder="Department" value={form.department} onChange={set('department')} /></div>
            <div className="col-md-3"><input className="form-control" placeholder="Designation" value={form.designation} onChange={set('designation')} /></div>
            <div className="col-md-3"><input className="form-control" placeholder="Phone" value={form.phone} onChange={set('phone')} /></div>
            <div className="col-md-4">
              <select className="form-select" value={form.manager} onChange={set('manager')}>
                <option value="">No manager</option>
                {managers.filter((m) => m._id !== editId).map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary">{editId ? 'Save changes' : 'Add employee'}</button>
            {editId && <button type="button" className="btn btn-light" onClick={() => { setEditId(null); setForm(empty); }}>Cancel</button>}
          </div>
        </form>
      )}

      <div className="panel table-responsive">
        <table className="table mb-0 align-middle">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Department</th><th>Designation</th><th>Manager</th>{isHR && <th />}</tr>
          </thead>
          <tbody>
            {list.length === 0 && <tr><td colSpan="7" className="text-muted text-center py-4">No people to show yet.</td></tr>}
            {list.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td><td>{u.email}</td><td className="text-capitalize">{u.role}</td>
                <td>{u.department || '-'}</td><td>{u.designation || '-'}</td><td>{u.manager?.name || '-'}</td>
                {isHR && (
                  <td className="text-end text-nowrap">
                    <button className="btn btn-sm btn-outline-primary me-2" onClick={() => edit(u)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => remove(u)}>Delete</button>
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
