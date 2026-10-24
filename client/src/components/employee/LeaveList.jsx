import { useEffect, useState } from 'react';
import api, { fmtDate } from '../../api';
import usePolling from '../../usePolling.js';

const badge = { pending: 'warning text-dark', approved: 'success', rejected: 'danger' };

// My leave history and the status of each request. Reloads when refreshKey changes.
export default function LeaveList({ refreshKey = 0 }) {
  const [mine, setMine] = useState([]);

  const load = () => api.get('/leaves/mine').then((r) => setMine(r.data)).catch(() => {});
  useEffect(() => { load(); }, [refreshKey]);
  usePolling(load);

  return (
    <>
      <h5 className="mb-3">My requests</h5>
      <div className="panel table-responsive mb-5">
        <table className="table mb-0">
          <thead><tr><th>Type</th><th>From</th><th>To</th><th>Reason</th><th>Status</th><th>Reviewer note</th></tr></thead>
          <tbody>
            {mine.length === 0 && <tr><td colSpan="6" className="text-muted text-center py-4">You have not requested any leave.</td></tr>}
            {mine.map((l) => (
              <tr key={l._id}>
                <td className="text-capitalize">{l.type}</td><td>{fmtDate(l.fromDate)}</td><td>{fmtDate(l.toDate)}</td>
                <td>{l.reason}</td><td><span className={`badge bg-${badge[l.status]}`}>{l.status}</span></td>
                <td>{l.reviewComment || (l.reviewedBy ? `by ${l.reviewedBy.name}` : '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
