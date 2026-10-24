import { useState } from 'react';
import api, { errMsg } from '../../api';

const empty = { type: 'casual', fromDate: '', toDate: '', reason: '' };

// Form to apply for leave. onApplied lets the page refresh the history list.
export default function LeaveApply({ onApplied }) {
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState(null);

  const apply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      setForm(empty);
      setMsg({ ok: true, text: 'Leave request sent' });
      if (onApplied) onApplied();
    } catch (err) {
      setMsg({ ok: false, text: errMsg(err) });
    }
  };

  return (
    <form className="panel p-4 mb-4" onSubmit={apply}>
      <h5 className="mb-3">Apply for leave</h5>
      {msg && <div className={`alert py-2 ${msg.ok ? 'alert-success' : 'alert-danger'}`}>{msg.text}</div>}
      <div className="row g-3">
        <div className="col-md-3">
          <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="casual">Casual</option><option value="sick">Sick</option>
            <option value="annual">Annual</option><option value="unpaid">Unpaid</option>
          </select>
        </div>
        <div className="col-md-3"><input type="date" className="form-control" required value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} /></div>
        <div className="col-md-3"><input type="date" className="form-control" required min={form.fromDate} value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} /></div>
        <div className="col-md-12"><input className="form-control" placeholder="Reason" required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>
      </div>
      <button className="btn btn-primary mt-3">Send request</button>
    </form>
  );
}
