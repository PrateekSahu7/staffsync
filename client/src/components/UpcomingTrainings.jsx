import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { fmtDate } from '../api';
import usePolling from '../usePolling.js';

const badge = { upcoming: 'info text-dark', ongoing: 'success' };

// Next few training programs that have not finished (the server already limits
// the list to what this person may see)
export default function UpcomingTrainings({ title }) {
  const [items, setItems] = useState(null);

  const load = () =>
    api.get('/training')
      .then((r) => setItems(r.data.filter((t) => t.status !== 'completed').slice(0, 3)))
      .catch(() => {});
  useEffect(() => { load(); }, []);
  usePolling(load);

  return (
    <div className="panel p-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{title}</h5>
        <Link to="/training" className="small">See all</Link>
      </div>
      {items === null && <p className="text-muted mb-0">Loading...</p>}
      {items && items.length === 0 && <p className="text-muted mb-0">No trainings coming up.</p>}
      {items && items.map((t) => (
        <div key={t._id} className="d-flex justify-content-between align-items-center py-2 border-top">
          <div>
            <strong>{t.title}</strong>
            <div className="small text-muted">{fmtDate(t.startDate)} to {fmtDate(t.endDate)}</div>
          </div>
          <span className={`badge bg-${badge[t.status]}`}>{t.status}</span>
        </div>
      ))}
    </div>
  );
}
