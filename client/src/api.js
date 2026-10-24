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
