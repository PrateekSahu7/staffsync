import { useEffect, useState } from 'react';
import api, { fmtDate } from '../../api';
import usePolling from '../../usePolling.js';

const labels = { announcement: 'Announcement', news: 'Company news', event: 'Event' };

// Read-only list of company announcements, news and events
export default function Announcements() {
  const [items, setItems] = useState([]);

  const load = () => api.get('/announcements').then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  usePolling(load);

  return (
    <>
      <h3 className="page-title mb-4">Announcements, news and events</h3>
      {items.length === 0 && <div className="panel p-4 text-muted">Nothing has been posted yet.</div>}
      {items.map((p) => (
        <div key={p._id} className="panel p-4 mb-3">
          <h5 className="mb-1">{p.title}</h5>
          <div className="small text-muted mb-2">
            {labels[p.category]}{p.category === 'event' && p.eventDate ? ` on ${fmtDate(p.eventDate)}` : ''} - {p.postedBy?.name} - posted {fmtDate(p.createdAt)}
          </div>
          <div style={{ whiteSpace: 'pre-wrap' }}>{p.body}</div>
        </div>
      ))}
    </>
  );
}
