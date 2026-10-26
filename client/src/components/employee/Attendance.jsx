import { useEffect, useMemo, useState } from 'react';
import api, { errMsg, fmtDuration, fmtTime } from '../../api';
import usePolling from '../../usePolling.js';
import { useToast } from '../ui/Toast.jsx';
import { EmptyState, PageHeader, Pill, SkeletonRows } from '../ui/ui.jsx';

const R = 84;
const C = 2 * Math.PI * R;
const TARGET = 8 * 3600 * 1000; // the ring fills over an eight-hour day
const pad = (n) => String(n).padStart(2, '0');
const hms = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
};

// My own attendance: a live day ring, check in and out, the last two weeks and my history
export default function Attendance() {
  const toast = useToast();
  const [mine, setMine] = useState(null);
  const [todayInfo, setTodayInfo] = useState(null); // { date, record } from the server
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);

  const load = () => {
    api.get('/attendance/mine').then((r) => setMine(r.data)).catch(() => {});
    api.get('/attendance/today').then((r) => setTodayInfo(r.data)).catch(() => {});
  };
  useEffect(() => {
    load();
    window.addEventListener('attendance:changed', load);
    return () => window.removeEventListener('attendance:changed', load);
  }, []);
  usePolling(load);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const rec = todayInfo?.record;
  const working = !!rec && !rec.checkOut;
  const elapsed = rec ? new Date(rec.checkOut || now).getTime() - new Date(rec.checkIn).getTime() : 0;
  const frac = Math.min(1, elapsed / TARGET);

  const last14 = useMemo(() => {
    if (!todayInfo) return [];
    const base = new Date(`${todayInfo.date}T12:00:00Z`).getTime();
    return Array.from({ length: 14 }, (_, i) => new Date(base - (13 - i) * 86400000).toISOString().slice(0, 10));
  }, [todayInfo?.date]);
  const presentDays = new Set((mine || []).map((r) => r.date));
  const daysIn = last14.filter((d) => presentDays.has(d)).length;

  const act = async (fn, text) => {
    setBusy(true);
    try {
      await fn();
      toast.success(text);
      window.dispatchEvent(new Event('attendance:changed'));
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const heading = todayInfo
    ? new Date(`${todayInfo.date}T12:00:00`).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
    : '';

  return (
    <>
      <PageHeader title="Attendance" subtitle={heading || 'Loading today...'} />

      <div className="panel p-4 mb-4">
        <div className="d-flex flex-wrap align-items-center gap-4">
          <div className="ring-wrap">
            <svg viewBox="0 0 200 200" width="210" height="210" aria-hidden="true">
              <circle cx="100" cy="100" r={R} fill="none" strokeWidth="14" style={{ stroke: 'var(--surface-2)' }} />
              {frac > 0 && (
                <circle
                  cx="100" cy="100" r={R} fill="none" strokeWidth="14" strokeLinecap="round"
                  style={{ stroke: working ? 'var(--now)' : 'var(--accent)' }} strokeDasharray={`${frac * C} ${C}`}
                />
              )}
            </svg>
            <div className="ring-center">
              <div className="clock">{new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
              <span>
                {!todayInfo && 'Loading...'}
                {todayInfo && !rec && 'Not checked in'}
                {working && `${hms(elapsed)} worked`}
                {rec && rec.checkOut && `${fmtDuration(rec.checkIn, rec.checkOut)} worked`}
              </span>
            </div>
          </div>

          <div style={{ flex: 1, minWidth: 260 }}>
            <div className="mb-3">
              {todayInfo && !rec && <Pill tone="neutral">Not checked in</Pill>}
              {working && <Pill tone="warn">Working</Pill>}
              {rec && rec.checkOut && <Pill tone="success">Done for today</Pill>}
            </div>
            <p className="mb-3 text-muted">
              {!rec && 'Check in when you start. Your hours build here through the day.'}
              {working && `You checked in at ${fmtTime(rec.checkIn)}. Check out when you finish.`}
              {rec && rec.checkOut && `In at ${fmtTime(rec.checkIn)}, out at ${fmtTime(rec.checkOut)}.`}
            </p>
            <div className="d-flex gap-2 mb-4">
              <button className="btn btn-primary" disabled={busy || !todayInfo || !!rec} onClick={() => act(() => api.post('/attendance/check-in'), 'Checked in')}>Check in</button>
              <button className="btn btn-outline-primary" disabled={busy || !working} onClick={() => act(() => api.put('/attendance/check-out'), 'Checked out')}>Check out</button>
            </div>
            <div className="small text-muted mb-2">Last 14 days: in on {daysIn}</div>
            <div className="dots">
              {last14.map((d) => (
                <span key={d} className={`dot ${presentDays.has(d) ? 'on' : ''} ${d === todayInfo?.date ? 'today' : ''}`} title={`${d}: ${presentDays.has(d) ? 'checked in' : 'no check-in'}`} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <h5 className="mb-3">My history</h5>
      <div className="panel table-wrap mb-4">
        <table className="table">
          <thead><tr><th>Date</th><th>In</th><th>Out</th><th>Time worked</th></tr></thead>
          <tbody>
            {mine === null && <SkeletonRows cols={4} />}
            {mine && mine.length === 0 && (
              <tr><td colSpan="4"><EmptyState icon="clock" title="No attendance yet" hint="Check in above and your days will be listed here." /></td></tr>
            )}
            {mine && mine.map((r) => (
              <tr key={r._id}>
                <td>{r.date}</td><td>{fmtTime(r.checkIn)}</td>
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
