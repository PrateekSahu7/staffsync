import { useEffect, useState } from 'react';
import api from '../../api';
import usePolling from '../../usePolling.js';
import AnnouncementFeed from '../AnnouncementFeed.jsx';
import { PageHeader } from '../ui/ui.jsx';

// Read-only list of company announcements, news and events
export default function Announcements() {
  const [items, setItems] = useState(null);

  const load = () => api.get('/announcements').then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  usePolling(load);

  return (
    <>
      <PageHeader title="Announcements" subtitle="News, notices and events from HR and your managers." />
      <AnnouncementFeed items={items} />
    </>
  );
}
