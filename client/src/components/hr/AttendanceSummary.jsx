import { useEffect, useMemo, useState } from 'react';
import api, { fmtDuration, fmtTime } from '../../api';
import { useAuth } from '../../AuthContext.jsx';
import usePolling from '../../usePolling.js';
import Icon from '../ui/Icon.jsx';
import { Avatar, EmptyState, Pill, SkeletonRows } from '../ui/ui.jsx';

// Attendance of other people on a chosen day: everyone for HR, the team for a manager
export default function AttendanceSummary() {
  const { user } = useAuth();
  const [all, setAll] = useState(null);
  const [date, setDate] = useState('');
  const [query, setQuery] = useState('');

  // start on the company's today, as decided by the server
  useEffect(() => {
    api.get('/attendance/today').then((r) => setDate(r.data.date)).catch(() => {});
  }, []);

  const load = () =>
    date ? api.get('/attendance', { params: { date } }).then((r) => setAll(r.data)).catch(() => {}) : null;
  useEffect(() => { setAll(null); load(); }, [date]);
  usePolling(load);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (all || []).filter((r) => !q || (r.employee?.name || '').toLowerCase().includes(q) || (r.employee?.department || '').toLowerCase().includes(q));
  }, [all, query]);

  return (
    <>
      <div className="page-head">
        <div>
          <h5 className="mb-0">{user.role === 'hr' ? 'Everyone' : 'My team'}</h5>
          <div className="text-muted">{all ? `${all.length} checked in on this day` : 'Loading...'}</div>
        </div>
        <div className="page-actions">
          <div className="search">
            <Icon name="search" size={16} />
            <input className="form-control" placeholder="Search name or department" aria-label="Search" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <input type="date" className="form-control w-auto" aria-label="Day" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div className="panel table-wrap mb-4">
        <table className="table">
          <thead><tr><th>Name</th><th>Department</th><th>In</th><th>Out</th><th>Time worked</th></tr></thead>
          <tbody>
            {all === null && <SkeletonRows cols={5} />}
            {all && shown.length === 0 && (
              <tr><td colSpan="5"><EmptyState icon="clock" title={all.length === 0 ? 'No check-ins on this day' : 'No one matches that search'} hint={all.length === 0 ? 'Pick another day, or check back later.' : 'Try a different name.'} /></td></tr>
            )}
            {shown.map((r) => (
              <tr key={r._id}>
                <td><div className="person"><Avatar name={r.employee?.name} size={30} />{r.employee?.name}</div></td>
                <td>{r.employee?.department || '-'}</td>
                <td>{fmtTime(r.checkIn)}</td>
                <td>{r.checkOut ? fmtTime(r.checkOut) : <Pill tone="warn">Still in</Pill>}</td>
                <td>{fmtDuration(r.checkIn, r.checkOut)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
