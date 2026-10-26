import { useState } from 'react';
import api, { errMsg } from '../../api';
import { useToast } from '../ui/Toast.jsx';

const empty = { type: 'casual', fromDate: '', toDate: '', reason: '' };
const types = [['casual', 'Casual'], ['sick', 'Sick'], ['annual', 'Annual'], ['unpaid', 'Unpaid']];

// Form to apply for leave. onApplied lets the page refresh the history list.
export default function LeaveApply({ onApplied }) {
  const toast = useToast();
  const [form, setForm] = useState(empty);
  const [busy, setBusy] = useState(false);

  const days = form.fromDate && form.toDate && form.toDate >= form.fromDate
    ? Math.round((new Date(form.toDate) - new Date(form.fromDate)) / 86400000) + 1
    : 0;

  const apply = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post('/leaves', form);
      setForm(empty);
      toast.success('Leave request sent');
      if (onApplied) onApplied();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="panel p-4 mb-4" onSubmit={apply}>
      <h5 className="mb-3">Ask for leave</h5>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {types.map(([k, label]) => (
          <button type="button" key={k} className={`chip ${form.type === k ? 'active' : ''}`} onClick={() => setForm({ ...form, type: k })}>{label}</button>
        ))}
      </div>
      <div className="row g-3 align-items-end">
        <div className="col-md-3">
          <label className="form-label">From</label>
          <input type="date" className="form-control" required value={form.fromDate} onChange={(e) => setForm({ ...form, fromDate: e.target.value })} />
        </div>
        <div className="col-md-3">
          <label className="form-label">To</label>
          <input type="date" className="form-control" required min={form.fromDate} value={form.toDate} onChange={(e) => setForm({ ...form, toDate: e.target.value })} />
        </div>
        <div className="col-md-6">
          <label className="form-label">Reason</label>
          <input className="form-control" placeholder="Tell your manager why" required value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
        </div>
      </div>
      <div className="d-flex align-items-center gap-3 mt-3">
        <button className="btn btn-primary" disabled={busy}>{busy ? 'Sending...' : 'Send request'}</button>
        {days > 0 && <span className="text-muted">{days} day{days === 1 ? '' : 's'} of {form.type} leave</span>}
      </div>
    </form>
  );
}
