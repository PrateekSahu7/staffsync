import { useEffect, useState } from 'react';
import api, { errMsg, fmtDay, downloadCSV, localDay } from '../../api';
import Icon from '../ui/Icon.jsx';
import { useToast } from '../ui/Toast.jsx';
import { EmptyState, PageHeader, Pill, SkeletonRows } from '../ui/ui.jsx';

const todayStr = () => localDay();
const monthStart = () => todayStr().slice(0, 8) + '01';
const tabs = [['attendance', 'Attendance'], ['leaves', 'Leaves'], ['employees', 'Headcount']];

// HR reports with a date range and CSV export
export default function Reports() {
  const toast = useToast();
  const [tab, setTab] = useState('attendance');
  const [range, setRange] = useState({ from: monthStart(), to: todayStr() });
  const [data, setData] = useState(null);

  useEffect(() => {
    setData(null);
    const params = tab === 'employees' ? {} : range;
    api.get(`/reports/${tab}`, { params }).then((r) => setData(r.data)).catch((e) => toast.error(errMsg(e)));
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
        ...data.rows.map((r) => [r.employee, r.department, r.type, fmtDay(r.fromDate), fmtDay(r.toDate), r.days, r.status, r.reason]),
      ]);
    } else {
      downloadCSV('headcount_by_department.csv', [
        ['Department', 'Total', 'HR', 'Managers', 'Employees'],
        ...data.rows.map((r) => [r.department, r.total, r.hr, r.manager, r.employee]),
      ]);
    }
    toast.success('Report downloaded');
  };

  const empty = <EmptyState icon="chart" title="Nothing to report for this period" hint="Try a wider date range." />;

  return (
    <>
      <PageHeader title="Reports" subtitle="Attendance, leave and headcount, ready to export.">
        <button className="btn btn-primary" onClick={exportCSV} disabled={!data || data.rows.length === 0}>
          <Icon name="download" size={16} className="me-2" />Download CSV
        </button>
      </PageHeader>

      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-3">
        <div className="segmented" role="tablist">
          {tabs.map(([key, label]) => (
            <button key={key} className={tab === key ? 'active' : ''} onClick={() => setTab(key)}>{label}</button>
          ))}
        </div>
        {tab !== 'employees' && (
          <div className="d-flex align-items-center gap-2">
            <input type="date" className="form-control w-auto" aria-label="From" value={range.from} max={range.to} onChange={(e) => setRange({ ...range, from: e.target.value })} />
            <span className="text-muted">to</span>
            <input type="date" className="form-control w-auto" aria-label="To" value={range.to} min={range.from} onChange={(e) => setRange({ ...range, to: e.target.value })} />
          </div>
        )}
      </div>

      {tab === 'attendance' && (
        <div className="panel table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Department</th><th>Days present</th><th>Hours worked</th></tr></thead>
            <tbody>
              {!data && <SkeletonRows cols={4} />}
              {data && data.rows.length === 0 && <tr><td colSpan="4">{empty}</td></tr>}
              {data && data.rows.map((r) => <tr key={r.name + r.department}><td>{r.name}</td><td>{r.department}</td><td>{r.daysPresent}</td><td>{r.hours}</td></tr>)}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'leaves' && (
        <>
          {data && (
            <div className="d-flex flex-wrap gap-2 mb-3">
              <Pill tone="warn">{data.summary.pending} pending</Pill>
              <Pill tone="success">{data.summary.approved} approved</Pill>
              <Pill tone="danger">{data.summary.rejected} rejected</Pill>
            </div>
          )}
          <div className="panel table-wrap">
            <table className="table">
              <thead><tr><th>Employee</th><th>Department</th><th>Type</th><th>Dates</th><th>Days</th><th>Status</th><th>Reason</th></tr></thead>
              <tbody>
                {!data && <SkeletonRows cols={7} />}
                {data && data.rows.length === 0 && <tr><td colSpan="7">{empty}</td></tr>}
                {data && data.rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.employee}</td><td>{r.department}</td><td className="text-capitalize">{r.type}</td>
                    <td className="text-nowrap">{fmtDay(r.fromDate)} to {fmtDay(r.toDate)}</td><td>{r.days}</td>
                    <td><Pill value={r.status} /></td><td>{r.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {tab === 'employees' && (
        <>
          {data && <p className="text-muted">{data.total} people in total.</p>}
          <div className="panel table-wrap">
            <table className="table">
              <thead><tr><th>Department</th><th>Total</th><th>HR</th><th>Managers</th><th>Employees</th></tr></thead>
              <tbody>
                {!data && <SkeletonRows cols={5} />}
                {data && data.rows.length === 0 && <tr><td colSpan="5">{empty}</td></tr>}
                {data && data.rows.map((r) => <tr key={r.department}><td>{r.department}</td><td>{r.total}</td><td>{r.hr}</td><td>{r.manager}</td><td>{r.employee}</td></tr>)}
              </tbody>
            </table>
          </div>
        </>
      )}
    </>
  );
}
