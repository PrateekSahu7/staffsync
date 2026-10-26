import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { fmtDay } from '../api';
import usePolling from '../usePolling.js';
import { Pill } from './ui/ui.jsx';

// Next few training programs that have not finished (the server already limits
// the list to what this person may see)
export default function UpcomingTrainings({ title, fill = false }) {
  const [items, setItems] = useState(null);

  const load = () =>
    api.get('/training')
      .then((r) => setItems(r.data.filter((t) => t.status !== 'completed').slice(0, 3)))
      .catch(() => {});
  useEffect(() => { load(); }, []);
  usePolling(load);

  return (
    <div className={`panel p-4 ${fill ? 'h-100' : 'mb-4'}`}>
      <div className="section-title">
        <h5 className="mb-0">{title}</h5>
        <Link to="/training" className="small">See all</Link>
      </div>
      {items === null && <div className="skel mb-3" />}
      {items && items.length === 0 && <p className="text-muted mb-0">No training is coming up.</p>}
      {items && items.map((t) => (
        <div key={t._id} className="d-flex justify-content-between align-items-center gap-3 py-3 border-top">
          <div>
            <strong>{t.title}</strong>
            <div className="small text-muted">{fmtDay(t.startDate)} to {fmtDay(t.endDate)}</div>
          </div>
          <Pill value={t.status} />
        </div>
      ))}
    </div>
  );
}
