import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import { useAuth } from '../AuthContext.jsx';

const badge = { pending: 'warning text-dark', approved: 'success', rejected: 'danger' };
const empty = { type: 'casual', fromDate: '', toDate: '', reason: '' };

export default function Leaves() {
  const { user } = useAuth();
  const canApply = user.role !== 'hr';
  const canReview = user.role !== 'employee';
  const [mine, setMine] = useState([]);
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState(null);

  const load = () => {
    if (canApply) api.get('/leaves/mine').then((r) => setMine(r.data));
    if (canReview) api.get('/leaves').then((r) => setRequests(r.data));
  };
  useEffect(() => { load(); }, []);

  const apply = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leaves', form);
      setForm(empty);
      setMsg({ ok: true, text: 'Leave request sent' });
      load();
    } catch (err) {
      setMsg({ ok: false, text: errMsg(err) });
    }
  };

  const review = async (id, status) => {
    const comment = status === 'rejected' ? window.prompt('Reason for rejecting (optional)') || '' : '';
    try {
      await api.put(`/leaves/${id}/status`, { status, comment });
      load();
    } catch (err) {
      setMsg({ ok: false, text: errMsg(err) });
    }
  };

  const Status = ({ s }) => <span className={`badge bg-${badge[s]}`}>{s}</span>;

  return (
    <>
      <h3 className="page-title mb-4">Leaves</h3>
      {msg && <div className={`alert py-2 ${msg.ok ? 'alert-success' : 'alert-danger'}`}>{msg.text}</div>}

      {canApply && (
        <>
          <form className="panel p-4 mb-4" onSubmit={apply}>
            <h5 className="mb-3">Apply for leave</h5>
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

          <h5 className="mb-3">My requests</h5>
          <div className="panel table-responsive mb-5">
            <table className="table mb-0">
              <thead><tr><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Reviewer note</th></tr></thead>
              <tbody>
                {mine.length === 0 && <tr><td colSpan="6" className="text-muted text-center py-4">You have not requested any leave.</td></tr>}
                {mine.map((l) => (
                  <tr key={l._id}>
                    <td className="text-capitalize">{l.type}</td><td>{fmtDate(l.fromDate)}</td><td>{fmtDate(l.toDate)}</td>
                    <td>{l.reason}</td><td><Status s={l.status} /></td>
                    <td>{l.reviewComment || (l.reviewedBy ? `by ${l.reviewedBy.name}` : '-')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {canReview && (
        <>
          <h5 className="mb-3">{user.role === 'hr' ? 'All leave requests' : 'Team leave requests'}</h5>
          <div className="panel table-responsive">
            <table className="table mb-0 align-middle">
              <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th /></tr></thead>
              <tbody>
                {requests.length === 0 && <tr><td colSpan="7" className="text-muted text-center py-4">No leave requests to review.</td></tr>}
                {requests.map((l) => (
                  <tr key={l._id}>
                    <td>{l.employee?.name}</td><td className="text-capitalize">{l.type}</td>
                    <td>{fmtDate(l.fromDate)}</td><td>{fmtDate(l.toDate)}</td><td>{l.reason}</td>
                    <td><Status s={l.status} /></td>
                    <td className="text-end text-nowrap">
                      {l.status === 'pending' && (
                        <>
                          <button className="btn btn-sm btn-primary me-2" onClick={() => review(l._id, 'approved')}>Approve</button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => review(l._id, 'rejected')}>Reject</button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
