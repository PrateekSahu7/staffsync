import { useEffect, useState } from 'react';
import api, { errMsg, fmtDuration, fmtTime } from '../api';
import usePolling from '../usePolling.js';
import { useToast } from './ui/Toast.jsx';
import Icon from './ui/Icon.jsx';

const hm = (ms) => {
  const m = Math.max(0, Math.floor(ms / 60000));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
};

// Attendance control that lives in the top bar on every page, so checking in
// or out never needs a trip to the Attendance page.
export default function CheckInChip() {
  const toast = useToast();
  const [info, setInfo] = useState(null); // { date, record }
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);

  const load = () => api.get('/attendance/today').then((r) => setInfo(r.data)).catch(() => {});

  useEffect(() => {
    load();
    window.addEventListener('attendance:changed', load);
    return () => window.removeEventListener('attendance:changed', load);
  }, []);
  usePolling(load);
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(id);
  }, []);

  if (!info) return null;
  const rec = info.record;

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

  if (!rec) {
    return (
      <div className="ci">
        <span className="ci-text">Not checked in</span>
        <button className="btn btn-primary btn-sm" disabled={busy} onClick={() => act(() => api.post('/attendance/check-in'), 'Checked in')}>
          Check in
        </button>
      </div>
    );
  }
  if (!rec.checkOut) {
    return (
      <div className="ci working">
        <span className="ci-dot" />
        <span className="ci-text">In since {fmtTime(rec.checkIn)}, {hm(now - new Date(rec.checkIn).getTime())}</span>
        <button className="btn btn-outline-primary btn-sm" disabled={busy} onClick={() => act(() => api.put('/attendance/check-out'), 'Checked out')}>
          Check out
        </button>
      </div>
    );
  }
  return (
    <div className="ci done">
      <Icon name="check" size={14} />
      <span className="ci-text">Done for today, {fmtDuration(rec.checkIn, rec.checkOut)}</span>
    </div>
  );
}
