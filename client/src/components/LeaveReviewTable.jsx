import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate } from '../api';
import usePolling from '../usePolling.js';

const badge = { pending: 'warning text-dark', approved: 'success', rejected: 'danger' };

// Table of leave requests to approve or reject. The server decides which requests this
// person can see: HR sees everyone, a manager sees their own team.
export default function LeaveReviewTable({ title }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');

  const load = () => api.get('/leaves').then((r) => setRequests(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  usePolling(load);

  const review = async (id, status) => {
    const comment = status === 'rejected' ? window.prompt('Reason for rejecting (optional)') || '' : '';
    setError('');
    try {
      await api.put(`/leaves/${id}/status`, { status, comment });
      load();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <>
      <h5 className="mb-3">{title}</h5>
      {error && <div className="alert alert-danger py-2">{error}</div>}
      <div className="panel table-responsive">
        <table className="table mb-0 align-middle">
          <thead><tr><th>Employee</th><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th /></tr></thead>
          <tbody>
            {requests.length === 0 && <tr><td colSpan="7" className="text-muted text-center py-4">No leave requests to review.</td></tr>}
            {requests.map((l) => (
              <tr key={l._id}>
                <td>{l.employee?.name}</td><td className="text-capitalize">{l.type}</td>
                <td>{fmtDate(l.fromDate)}</td><td>{fmtDate(l.toDate)}</td><td>{l.reason}</td>
                <td><span className={`badge bg-${badge[l.status]}`}>{l.status}</span></td>
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
  );
}
