import { useEffect, useState } from 'react';
import api, { errMsg } from '../../api';
import { useAuth } from '../../AuthContext.jsx';
import usePolling from '../../usePolling.js';
import AnnouncementFeed from '../AnnouncementFeed.jsx';
import Icon from '../ui/Icon.jsx';
import { useToast } from '../ui/Toast.jsx';
import { useConfirm } from '../ui/Confirm.jsx';
import { PageHeader } from '../ui/ui.jsx';

const empty = { title: '', body: '', category: 'announcement', eventDate: '' };

// Post and manage announcements, news and events. Used by HR (can delete any post)
// and by managers (can delete only their own posts).
export default function AnnouncementsManager() {
  const { user } = useAuth();
  const toast = useToast();
  const ask = useConfirm();
  const isHR = user.role === 'hr';
  const [items, setItems] = useState(null);
  const [form, setForm] = useState(empty);
  const [open, setOpen] = useState(false);

  const load = () => api.get('/announcements').then((r) => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);
  usePolling(load);

  const post = async (e) => {
    e.preventDefault();
    try {
      await api.post('/announcements', form);
      setForm(empty);
      setOpen(false);
      toast.success('Published');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  const remove = async (p) => {
    const answer = await ask({
      title: 'Delete this post?', message: `"${p.title}" will disappear for everyone.`, confirmText: 'Delete post', danger: true,
    });
    if (answer === null) return;
    try {
      await api.delete(`/announcements/${p._id}`);
      toast.success('Post deleted');
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };

  return (
    <>
      <PageHeader title="Announcements" subtitle="Post news, notices and events for the whole company.">
        <button className={`btn ${open ? 'btn-light' : 'btn-primary'}`} onClick={() => setOpen((o) => !o)}>
          <Icon name={open ? 'x' : 'plus'} size={16} className="me-2" />{open ? 'Close' : 'New post'}
        </button>
      </PageHeader>

      {open && (
        <form className="panel p-4 mb-4" onSubmit={post}>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {[['announcement', 'Announcement'], ['news', 'Company news'], ['event', 'Event']].map(([k, label]) => (
              <button type="button" key={k} className={`chip ${form.category === k ? 'active' : ''}`} onClick={() => setForm({ ...form, category: k })}>
                {label}
              </button>
            ))}
          </div>
          <div className="row g-3">
            <div className={form.category === 'event' ? 'col-md-8' : 'col-12'}>
              <input className="form-control" placeholder="Title" required autoFocus value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            {form.category === 'event' && (
              <div className="col-md-4"><input type="date" className="form-control" required aria-label="Event date" value={form.eventDate} onChange={(e) => setForm({ ...form, eventDate: e.target.value })} /></div>
            )}
            <div className="col-12"><textarea className="form-control" rows="3" placeholder="What do people need to know?" required value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} /></div>
          </div>
          <button className="btn btn-primary mt-3">Publish</button>
        </form>
      )}

      <AnnouncementFeed items={items} canDelete={(p) => isHR || p.postedBy?._id === user._id} onDelete={remove} />
    </>
  );
}
