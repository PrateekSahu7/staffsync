import { useState } from 'react';

const R = 42;
const C = 2 * Math.PI * R;

// Ring chart. Hover (or focus) a legend row to isolate that slice.
// segments: [{ label, value, color }]
export default function Donut({ segments, centerLabel = 'total' }) {
  const [hover, setHover] = useState(null);
  const total = segments.reduce((sum, s) => sum + s.value, 0);
  const shown = hover !== null ? segments[hover] : null;
  let offset = 0;

  return (
    <div className="donut-wrap">
      <div className="donut">
        <svg viewBox="0 0 100 100" width="150" height="150" role="img" aria-label={`${total} ${centerLabel}`}>
          <circle cx="50" cy="50" r={R} fill="none" style={{ stroke: 'var(--surface-2)' }} strokeWidth="12" />
          {total > 0 && segments.map((s, i) => {
            const len = (s.value / total) * C;
            const slice = (
              <circle
                key={s.label} cx="50" cy="50" r={R} fill="none"
                style={{ stroke: s.color, opacity: hover === null || hover === i ? 1 : 0.3 }}
                strokeWidth={hover === i ? 15 : 12}
                strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-offset}
                onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
              />
            );
            offset += len;
            return slice;
          })}
        </svg>
        <div className="donut-center">
          <b>{shown ? shown.value : total}</b>
          <span>{shown ? shown.label : centerLabel}</span>
        </div>
      </div>
      <ul className="legend">
        {segments.map((s, i) => (
          <li
            key={s.label} tabIndex={0}
            onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(i)} onBlur={() => setHover(null)}
          >
            <i style={{ background: s.color }} />
            <span>{s.label}</span>
            <b>{s.value}</b>
          </li>
        ))}
      </ul>
    </div>
  );
}
