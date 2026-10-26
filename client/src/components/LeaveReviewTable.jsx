import { useEffect, useMemo, useState } from 'react';
import api, { errMsg, fmtDay } from '../api';
import usePolling from '../usePolling.js';
import Icon from './ui/Icon.jsx';
import { useToast } from './ui/Toast.jsx';
import { useConfirm } from './ui/Confirm.jsx';
import { Avatar, EmptyState, Pill, SkeletonRows } from './ui/ui.jsx';

const dayCount = (a, b) => Math.round((new Date(b) - new Date(a)) / 86400000) + 1;
const tabs = [['pending', 'Waiting'], ['approved', 'Approved'], ['rejected', 'Rejected'], ['all', 'All']];

// Leave requests to approve or reject. The server decides which requests this person can
// see: HR sees everyone, a manager sees their own team.
export default function LeaveReviewTable({ title }) {
  const toast = useToast();
  const ask = useConfirm();
  const [requests, setRequests] = useState(null);
  const [tab, setTab] = useState('pending');
  const [query, setQuery] = useState('');

  const load = () => api.get('/leaves').then((r) => setRequests(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  usePolling(load);

  const count = (k) => (requests || []).filter((l) => k === 'all' || l.status === k).length;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (requests || []).filter((l) => (tab === 'all' || l.status === tab) && (!q || (l.employee?.name || '').toLowerCase().includes(q)));
  }, [requests, tab, query]);

  const approve = async (l) => {
    try {
      await api.put(`/leaves/${l._id}/status`, { status: 'approved' });
      toast.success(`Approved leave for ${l.employee?.name}`);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const reject = async (l) => {
    const note = await ask({
      title: `Reject leave for ${l.employee?.name}?`, message: 'They will see your note next to the request.',
      input: 'Reason (optional)', confirmText: 'Reject request', danger: true,
    });
    if (note === null) return;
    try {
      await api.put(`/leaves/${l._id}/status`, { status: 'rejected', comment: note });
      toast.success(`Rejected leave for ${l.employee?.name}`);
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <>
      <div className="page-head">
        <h5 className="mb-0">{title}</h5>
        <div className="page-actions">
          <div className="search">
            <Icon name="search" size={16} />
            <input className="form-control" placeholder="Search by name" aria-label="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {tabs.map(([k, label]) => (
          <button key={k} className={`chip ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
            {label}<span className="count">{count(k)}</span>
          </button>
        ))}
      </div>

      <div className="panel table-wrap">
        <table className="table">
          <thead><tr><th>Employee</th><th>Type</th><th>Dates</th><th>Days</th><th>Reason</th><th>Status</th><th /></tr></thead>
          <tbody>
            {requests === null && <SkeletonRows cols={7} />}
            {requests && shown.length === 0 && (
              <tr><td colSpan="7">
                <EmptyState icon="file" title={tab === 'pending' ? 'Nothing is waiting for you' : 'No requests here'}
                  hint={tab === 'pending' ? 'New leave requests will show up here.' : 'Try another tab or a different search.'} />
              </td></tr>
            )}
            {shown.map((l) => (
              <tr key={l._id}>
                <td><div className="person"><Avatar name={l.employee?.name} size={30} />{l.employee?.name}</div></td>
                <td className="text-capitalize">{l.type}</td>
                <td className="text-nowrap">{fmtDay(l.fromDate)} to {fmtDay(l.toDate)}</td>
                <td>{dayCount(l.fromDate, l.toDate)}</td>
                <td>{l.reason}</td>
                <td><Pill value={l.status} /></td>
                <td className="text-end text-nowrap">
                  {l.status === 'pending' && (
                    <>
                      <button className="btn btn-sm btn-primary me-2" onClick={() => approve(l)}>Approve</button>
                      <button className="btn btn-sm btn-light" onClick={() => reject(l)}>Reject</button>
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
