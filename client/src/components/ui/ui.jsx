import Icon from './Icon.jsx';

// A few lines of grey shimmer while a panel loads
export function Skeleton({ lines = 3 }) {
  return (
    <div>
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="skel mb-3" style={{ width: `${92 - i * 14}%` }} />
      ))}
    </div>
  );
}

// Shimmer rows for a table that is still loading
export function SkeletonRows({ cols = 4, rows = 4 }) {
  return Array.from({ length: rows }).map((_, r) => (
    <tr key={r}>
      {Array.from({ length: cols }).map((__, c) => (
        <td key={c}><div className="skel" style={{ width: `${50 + ((r + c) % 3) * 18}%` }} /></td>
      ))}
    </tr>
  ));
}

// Shown when a list has nothing in it: say what is missing and what to do
export function EmptyState({ icon = 'inbox', title, hint, children }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon name={icon} size={24} /></div>
      <div className="empty-title">{title}</div>
      {hint && <div className="empty-hint">{hint}</div>}
      {children}
    </div>
  );
}

const hue = (s = '') => {
  let h = 0;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return h;
};

// Round initials badge, colour picked from the name so each person keeps theirs
export function Avatar({ name = '?', size = 34 }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join('') || '?';
  return (
    <span
      className="avatar" title={name}
      style={{ width: size, height: size, fontSize: size * 0.38, background: `hsl(${hue(name)} 42% 40%)` }}
    >
      {initials}
    </span>
  );
}

const tones = {
  pending: 'warn', approved: 'success', rejected: 'danger',
  upcoming: 'info', ongoing: 'warn', completed: 'neutral',
  hr: 'info', manager: 'success', employee: 'neutral',
};

// Small coloured status label
export function Pill({ value, tone, children }) {
  return <span className={`pill ${tone || tones[value] || 'neutral'}`}>{children || value}</span>;
}

export function PageHeader({ title, subtitle, children }) {
  return (
    <div className="page-head">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-muted mb-0">{subtitle}</p>}
      </div>
      {children && <div className="page-actions">{children}</div>}
    </div>
  );
}
