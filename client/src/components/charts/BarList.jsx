// Horizontal bars with a label and value on each row
export default function BarList({ rows, empty = 'Nothing to show yet.' }) {
  if (rows.length === 0) return <div className="text-muted">{empty}</div>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <div className="barlist">
      {rows.map((r, i) => (
        <div className="barrow" key={r.label}>
          <div className="barlabel"><span>{r.label}</span><b>{r.value}</b></div>
          <div className="bartrack">
            <i style={{ width: `${(r.value / max) * 100}%`, animationDelay: `${i * 70}ms` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
