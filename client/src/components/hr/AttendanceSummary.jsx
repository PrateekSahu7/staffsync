import { useEffect, useState } from 'react';
import api, { fmtTime } from '../../api';
import { useAuth } from '../../AuthContext.jsx';
import usePolling from '../../usePolling.js';

// Attendance of other people on a chosen day: everyone for HR, the team for a manager
export default function AttendanceSummary() {
  const { user } = useAuth();
  const [all, setAll] = useState([]);
  const [date, setDate] = useState('');

  // start on the company's today, as decided by the server
  useEffect(() => {
    api.get('/attendance/today').then((r) => setDate(r.data.date)).catch(() => {});
  }, []);

  const load = () =>
    date ? api.get('/attendance', { params: { date } }).then((r) => setAll(r.data)).catch(() => {}) : null;
  useEffect(() => { load(); }, [date]);
  usePolling(load);

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="mb-0">{user.role === 'hr' ? 'Everyone' : 'My team'}</h5>
        <input type="date" className="form-control w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>
      <div className="panel table-responsive">
        <table className="table mb-0">
          <thead><tr><th>Name</th><th>Department</th><th>Date</th><th>Check in</th><th>Check out</th></tr></thead>
          <tbody>
            {all.length === 0 && <tr><td colSpan="5" className="text-muted text-center py-4">No check-ins on this date.</td></tr>}
            {all.map((r) => (
              <tr key={r._id}><td>{r.employee?.name}</td><td>{r.employee?.department || '-'}</td><td>{r.date}</td><td>{fmtTime(r.checkIn)}</td><td>{fmtTime(r.checkOut)}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
