import { useState } from 'react';
import { fmtDay, timeAgo } from '../api';
import Icon from './ui/Icon.jsx';
import { EmptyState, Skeleton } from './ui/ui.jsx';

const kinds = {
  announcement: { label: 'Announcement', icon: 'bell' },
  news: { label: 'Company news', icon: 'file' },
  event: { label: 'Event', icon: 'calendar' },
};
const filters = [['all', 'All'], ['announcement', 'Announcements'], ['news', 'News'], ['event', 'Events']];

// Filterable list of posts. items is null while loading.
// canDelete(post) says whether to show a delete button, onDelete(post) removes it.
export default function AnnouncementFeed({ items, canDelete, onDelete }) {
  const [filter, setFilter] = useState('all');

  if (items === null) return <div className="panel p-4"><Skeleton lines={3} /></div>;

  const shown = filter === 'all' ? items : items.filter((p) => p.category === filter);
  const count = (k) => (k === 'all' ? items.length : items.filter((p) => p.category === k).length);

  return (
    <>
      <div className="d-flex flex-wrap gap-2 mb-3">
        {filters.map(([k, label]) => (
          <button key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>
            {label}<span className="count">{count(k)}</span>
          </button>
        ))}
      </div>

      <div className="panel">
        {shown.length === 0 && (
          <EmptyState icon="bell" title={items.length === 0 ? 'Nothing posted yet' : 'No posts of this kind'}
            hint={items.length === 0 ? 'New announcements, news and events will appear here.' : 'Try another filter.'} />
        )}
        {shown.map((p) => (
          <article key={p._id} className={`feed-item ${p.category}`}>
            <div className="feed-mark"><Icon name={kinds[p.category].icon} size={18} /></div>
            <div className="feed-body">
              <h5 className="mb-1">{p.title}</h5>
              <div className="feed-meta">
                <span>{kinds[p.category].label}</span>
                <span>Posted by {p.postedBy?.name || 'a former colleague'}</span>
                <span>{timeAgo(p.createdAt)}</span>
              </div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{p.body}</div>
            </div>
            {p.category === 'event' && p.eventDate && (
              <div className="datebox" title={fmtDay(p.eventDate)}>
                <b>{new Date(p.eventDate).toLocaleDateString(undefined, { day: 'numeric', timeZone: 'UTC' })}</b>
                <span>{new Date(p.eventDate).toLocaleDateString(undefined, { month: 'short', timeZone: 'UTC' })}</span>
              </div>
            )}
            {canDelete && canDelete(p) && (
              <button className="icon-btn danger" aria-label={`Delete ${p.title}`} title="Delete" onClick={() => onDelete(p)}>
                <Icon name="trash" size={16} />
              </button>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
