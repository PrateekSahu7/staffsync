import { useEffect, useState } from 'react';
import api, { errMsg, fmtTime } from '../api';
import { useAuth } from '../AuthContext.jsx';

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function Attendance() {
  const { user } = useAuth();
  const canViewAll = user.role !== 'employee';
  const [mine, setMine] = useState([]);
  const [all, setAll] = useState([]);
  const [date, setDate] = useState(todayStr());
  const [error, setError] = useState('');

  const loadMine = () => api.get('/attendance/mine').then((r) => setMine(r.data));
  const loadAll = () => api.get('/attendance', { params: { date } }).then((r) => setAll(r.data));

  useEffect(() => { loadMine(); }, []);
  useEffect(() => { if (canViewAll) loadAll(); }, [date]);

  const today = mine.find((r) => r.date === todayStr());

  const act = async (fn) => {
    setError('');
    try {
      await fn();
      loadMine();
      if (canViewAll) loadAll();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <>
      <h3 className="page-title mb-4">Attendance</h3>
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="panel p-4 mb-4 d-flex flex-wrap align-items-center justify-content-between gap-3">
        <div>
          <h5 className="mb-1">Today, {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</h5>
          <div className="text-muted">
            {!today && 'You have not checked in yet.'}
            {today && `Checked in at ${fmtTime(today.checkIn)}${today.checkOut ? `, checked out at ${fmtTime(today.checkOut)}` : ''}`}
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" disabled={!!today} onClick={() => act(() => api.post('/attendance/check-in'))}>Check in</button>
          <button className="btn btn-outline-primary" disabled={!today || !!today?.checkOut} onClick={() => act(() => api.put('/attendance/check-out'))}>Check out</button>
        </div>
      </div>

      <h5 className="mb-3">My history</h5>
      <div className="panel table-responsive mb-5">
        <table className="table mb-0">
          <thead><tr><th>Date</th><th>Check in</th><th>Check out</th></tr></thead>
          <tbody>
            {mine.length === 0 && <tr><td colSpan="3" className="text-muted text-center py-4">No attendance recorded yet. Check in to start.</td></tr>}
            {mine.map((r) => <tr key={r._id}><td>{r.date}</td><td>{fmtTime(r.checkIn)}</td><td>{fmtTime(r.checkOut)}</td></tr>)}
          </tbody>
        </table>
      </div>

      {canViewAll && (
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
                  <tr key={r._id}><td>{r.user?.name}</td><td>{r.user?.department || '-'}</td><td>{r.date}</td><td>{fmtTime(r.checkIn)}</td><td>{fmtTime(r.checkOut)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
