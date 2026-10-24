import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api';

const empty = { name: '', email: '', password: '', role: 'employee', department: '', designation: '', manager: '' };

// HR registers a new person: creates their login and their employee record
export default function Register() {
  const [form, setForm] = useState(empty);
  const [managers, setManagers] = useState([]);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/employees').then((r) => setManagers(r.data.filter((p) => p.role === 'manager'))).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', { ...form, manager: form.manager || null });
      setMsg({ ok: true, text: `${data.name} is registered and can now log in as ${data.role}.` });
      setForm(empty);
    } catch (err) {
      setMsg({ ok: false, text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3 className="page-title mb-0">Register a person</h3>
        <Link to="/employees" className="btn btn-outline-primary">Back to employees</Link>
      </div>
      <form className="panel p-4" style={{ maxWidth: 640 }} onSubmit={submit}>
        {msg && <div className={`alert py-2 ${msg.ok ? 'alert-success' : 'alert-danger'}`}>{msg.text}</div>}
        <div className="row g-3">
          <div className="col-md-6"><label className="form-label">Full name</label><input className="form-control" required value={form.name} onChange={set('name')} /></div>
          <div className="col-md-6"><label className="form-label">Email</label><input type="email" className="form-control" required value={form.email} onChange={set('email')} /></div>
          <div className="col-md-6"><label className="form-label">Password (at least 6 characters)</label><input type="password" className="form-control" required minLength={6} value={form.password} onChange={set('password')} /></div>
          <div className="col-md-6">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.role} onChange={set('role')}>
              <option value="employee">Employee</option>
              <option value="manager">Manager</option>
              <option value="hr">HR</option>
            </select>
          </div>
          <div className="col-md-6"><label className="form-label">Department</label><input className="form-control" value={form.department} onChange={set('department')} /></div>
          <div className="col-md-6"><label className="form-label">Designation</label><input className="form-control" value={form.designation} onChange={set('designation')} /></div>
          {form.role === 'employee' && (
            <div className="col-md-6">
              <label className="form-label">Reports to</label>
              <select className="form-select" value={form.manager} onChange={set('manager')}>
                <option value="">No manager yet</option>
                {managers.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
              </select>
            </div>
          )}
        </div>
        <button className="btn btn-primary mt-4" disabled={busy}>{busy ? 'Registering...' : 'Register'}</button>
      </form>
    </>
  );
}
