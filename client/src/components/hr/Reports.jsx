import { useEffect, useState } from 'react';
import api, { errMsg, fmtDate, downloadCSV, localDay } from '../../api';

const todayStr = () => localDay();
const monthStart = () => todayStr().slice(0, 8) + '01';

export default function Reports() {
  const [tab, setTab] = useState('attendance');
  const [range, setRange] = useState({ from: monthStart(), to: todayStr() });
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    setData(null);
    setError('');
    const params = tab === 'employees' ? {} : range;
    api.get(`/reports/${tab}`, { params }).then((r) => setData(r.data)).catch((e) => setError(errMsg(e)));
  }, [tab, range.from, range.to]);

  const exportCSV = () => {
    if (!data) return;
    if (tab === 'attendance') {
      downloadCSV(`attendance_${range.from}_to_${range.to}.csv`, [
        ['Name', 'Department', 'Days present', 'Hours worked'],
        ...data.rows.map((r) => [r.name, r.department, r.daysPresent, r.hours]),
      ]);
    } else if (tab === 'leaves') {
      downloadCSV(`leaves_${range.from}_to_${range.to}.csv`, [
        ['Employee', 'Department', 'Type', 'From', 'To', 'Days', 'Status', 'Reason'],
        ...data.rows.map((r) => [r.employee, r.department, r.type, fmtDate(r.fromDate), fmtDate(r.toDate), r.days, r.status, r.reason]),
      ]);
    } else {
      downloadCSV('headcount_by_department.csv', [
        ['Department', 'Total', 'HR', 'Managers', 'Employees'],
        ...data.rows.map((r) => [r.department, r.total, r.hr, r.manager, r.employee]),
      ]);
    }
  };

  const tabs = [['attendance', 'Attendance'], ['leaves', 'Leaves'], ['employees', 'Headcount']];

  return (
    <>
      <h3 className="page-title mb-4">Reports</h3>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <ul className="nav nav-pills gap-1">
          {tabs.map(([key, label]) => (
            <li className="nav-item" key={key}>
              <button className={`nav-link ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>{label}</button>
            </li>
          ))}
        </ul>
        <div className="d-flex align-items-center gap-2">
          {tab !== 'employees' && (
            <>
              <input type="date" className="form-control w-auto" value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} />
              <span className="text-muted">to</span>
              <input type="date" className="form-control w-auto" value={range.to} min={range.from} onChange={(e) => setRange({ ...range, to: e.target.value })} />
            </>
          )}
          <button className="btn btn-outline-primary" onClick={exportCSV} disabled={!data || data.rows.length === 0}>Export CSV</button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}
      {!data && !error && <div className="panel p-4 text-muted">Loading report...</div>}

      {data && tab === 'attendance' && (
        <div className="panel table-responsive">
          <table className="table mb-0">
            <thead><tr><th>Name</th><th>Department</th><th>Days present</th><th>Hours worked</th></tr></thead>
            <tbody>
              {data.rows.length === 0 && <tr><td colSpan="4" className="text-muted text-center py-4">No people to report on.</td></tr>}
              {data.rows.map((r) => <tr key={r.name + r.department}><td>{r.name}</td><td>{r.department}</td><td>{r.daysPresent}</td><td>{r.hours}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {data && tab === 'leaves' && (
        <>
          <p className="text-muted">
            {data.summary.pending} pending, {data.summary.approved} approved, {data.summary.rejected} rejected in this period.
          </p>
          <div className="panel table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Employee</th><th>Department</th><th>Type</th><th>From</th><th>To</th><th>Days</th><th>Status</th><th>Reason</th></tr></thead>
              <tbody>
                {data.rows.length === 0 && <tr><td colSpan="8" className="text-muted text-center py-4">No leave falls in this period.</td></tr>}
                {data.rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.employee}</td><td>{r.department}</td><td className="text-capitalize">{r.type}</td>
                    <td>{fmtDate(r.fromDate)}</td><td>{fmtDate(r.toDate)}</td><td>{r.days}</td>
                    <td className="text-capitalize">{r.status}</td><td>{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {data && tab === 'employees' && (
        <>
          <p className="text-muted">{data.total} people in total.</p>
          <div className="panel table-responsive">
            <table className="table mb-0">
              <thead><tr><th>Department</th><th>Total</th><th>HR</th><th>Managers</th><th>Employees</th></tr></thead>
              <tbody>
                {data.rows.map((r) => <tr key={r.department}><td>{r.department}</td><td>{r.total}</td><td>{r.hr}</td><td>{r.manager}</td><td>{r.employee}</td></tr>)}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
