import { useEffect, useState } from 'react';
import api, { errMsg, fmtTime } from '../../api';
import usePolling from '../../usePolling.js';

// My own attendance: check in and out, and my history
export default function Attendance() {
  const [mine, setMine] = useState([]);
  const [todayInfo, setTodayInfo] = useState(null); // { date, record } from the server
  const [error, setError] = useState('');

  const loadMine = () => api.get('/attendance/mine').then((r) => setMine(r.data)).catch(() => {});
  const loadToday = () => api.get('/attendance/today').then((r) => setTodayInfo(r.data)).catch(() => {});
  const load = () => { loadMine(); loadToday(); };

  useEffect(() => { load(); }, []);
  usePolling(load);

  const today = todayInfo?.record;
  const heading = todayInfo
    ? new Date(todayInfo.date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  const act = async (fn) => {
    setError('');
    try {
      await fn();
      load();
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
          <h5 className="mb-1">Today{heading && `, ${heading}`}</h5>
          <div className="text-muted">
            {!todayInfo && 'Loading...'}
            {todayInfo && !today && 'You have not checked in yet.'}
            {today && `Checked in at ${fmtTime(today.checkIn)}${today.checkOut ? `, checked out at ${fmtTime(today.checkOut)}` : ''}`}
          </div>
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-primary" disabled={!todayInfo || !!today} onClick={() => act(() => api.post('/attendance/check-in'))}>Check in</button>
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
    </>
  );
}
