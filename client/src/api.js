import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Attach the JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const errMsg = (e) => e.response?.data?.message || e.message || 'Something went wrong';
export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '-');
export const fmtTime = (d) => (d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-');

export default api;

// Downloads rows (array of arrays) as a CSV file. Cells starting with = + - @ are
// prefixed so spreadsheets don't run them as formulas.
export function downloadCSV(filename, rows) {
  const esc = (v) => {
    let s = String(v ?? '');
    if (/^[=+\-@]/.test(s)) s = `'${s}`;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// Today's date in the browser's own time zone as YYYY-MM-DD (used for report date ranges)
export const localDay = () => new Date().toLocaleDateString('en-CA');

// "7h 32m" between two timestamps
export const fmtDuration = (from, to) => {
  if (!from || !to) return '-';
  const m = Math.max(0, Math.round((new Date(to) - new Date(from)) / 60000));
  return `${Math.floor(m / 60)}h ${String(m % 60).padStart(2, '0')}m`;
};

// "5 minutes ago", "yesterday", or the date for anything older than a week
export const timeAgo = (d) => {
  const mins = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'} ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'} ago`;
  const days = Math.round(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(d).toLocaleDateString();
};

// Date-only values (leave dates, event dates, training dates) are stored at midnight UTC,
// so show them in UTC. That keeps "5 March" as 5 March in every time zone.
export const fmtDay = (d) => (d ? new Date(d).toLocaleDateString(undefined, { timeZone: 'UTC' }) : '-');
