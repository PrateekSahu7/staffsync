import { useEffect, useState } from 'react';
import api, { fmtDay } from '../../api';
import usePolling from '../../usePolling.js';
import { EmptyState, Pill, SkeletonRows } from '../ui/ui.jsx';

const dayCount = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000) + 1;

// My leave history and the status of each request. Reloads when refreshKey changes.
export default function LeaveList({ refreshKey = 0 }) {
  const [mine, setMine] = useState(null);

  const load = () => api.get('/leaves/mine').then((r) => setMine(r.data)).catch(() => {});
  useEffect(() => { load(); }, [refreshKey]);
  usePolling(load);

  return (
    <>
      <h5 className="mb-3">My requests</h5>
      <div className="panel table-wrap mb-5">
        <table className="table">
          <thead><tr><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th>Reviewer note</th></tr></thead>
          <tbody>
            {mine === null && <SkeletonRows cols={6} />}
            {mine && mine.length === 0 && (
              <tr><td colSpan="6"><EmptyState icon="file" title="No leave requests yet" hint="When you ask for leave, it is listed here with its status." /></td></tr>
            )}
            {mine && mine.map((l) => (
              <tr key={l._id}>
                <td className="text-capitalize">{l.type}</td>
                <td className="text-nowrap">{fmtDay(l.fromDate)} to {fmtDay(l.toDate)}</td>
                <td>{dayCount(l.fromDate, l.toDate)}</td>
                <td>{l.reason}</td>
                <td><Pill value={l.status} /></td>
                <td>{l.reviewComment || (l.reviewedBy ? `Reviewed by ${l.reviewedBy.name}` : '-')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
