import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../api';
import { useToast } from '../ui/Toast.jsx';
import { PageHeader } from '../ui/ui.jsx';

const empty = { name: '', email: '', password: '', role: 'employee', department: '', designation: '', manager: '' };

// HR registers a new person: creates their login and their employee record
export default function Register() {
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [managers, setManagers] = useState([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/employees').then((r) => setManagers(r.data.filter((p) => p.role === 'manager'))).catch(() => {});
  }, []);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data } = await api.post('/auth/register', { ...form, manager: form.manager || null });
      toast.success(`${data.name} is registered and can log in as ${data.role === 'hr' ? 'HR' : data.role}.`);
      setForm(empty);
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <PageHeader title="Register a person" subtitle="Creates their login and their employee record.">
        <Link to="/employees" className="btn btn-light">Back to employees</Link>
      </PageHeader>
      <form className="panel p-4" style={{ maxWidth: 680 }} onSubmit={submit}>
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
        <button className="btn btn-primary mt-4" disabled={busy}>{busy ? 'Registering...' : 'Register person'}</button>
      </form>
    </>
  );
}
