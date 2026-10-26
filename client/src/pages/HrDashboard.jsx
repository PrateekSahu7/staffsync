import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import usePolling from '../usePolling.js';
import DashboardView from '../components/DashboardView.jsx';
import BarList from '../components/charts/BarList.jsx';
import Donut from '../components/charts/Donut.jsx';
import Icon from '../components/ui/Icon.jsx';
import { Skeleton } from '../components/ui/ui.jsx';

const layout = (s) => [
  { label: 'People in the company', value: s.employees, to: '/employees' },
  { label: 'Leave requests waiting', value: s.pendingLeaves, to: '/leaves' },
  { label: 'Checked in today', value: s.presentToday, to: '/attendance' },
  { label: 'On approved leave today', value: s.onLeaveToday, to: '/leaves' },
  { label: 'Trainings upcoming or running', value: s.activeTrainings, to: '/training' },
];

export default function HrDashboard() {
  const [headcount, setHeadcount] = useState(null);
  const [leaves, setLeaves] = useState(null);

  const load = () => {
    api.get('/reports/employees').then((r) => setHeadcount(r.data.rows)).catch(() => {});
    api.get('/reports/leaves').then((r) => setLeaves(r.data.summary)).catch(() => {});
  };
  useEffect(() => { load(); }, []);
  usePolling(load);

  return (
    <DashboardView subtitle="Here is where the company stands today." layout={layout}>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link to="/register" className="btn btn-primary"><Icon name="userplus" size={16} className="me-2" />Register a person</Link>
        <Link to="/leaves" className="btn btn-light"><Icon name="file" size={16} className="me-2" />Review leave</Link>
        <Link to="/reports" className="btn btn-light"><Icon name="chart" size={16} className="me-2" />Open reports</Link>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-7">
          <div className="panel p-4 h-100">
            <h5 className="mb-3">People by department</h5>
            {headcount ? <BarList rows={headcount.map((r) => ({ label: r.department, value: r.total }))} /> : <Skeleton lines={3} />}
          </div>
        </div>
        <div className="col-lg-5">
          <div className="panel p-4 h-100">
            <h5 className="mb-3">Leave requests this month</h5>
            {leaves ? (
              <Donut
                centerLabel="requests"
                segments={[
                  { label: 'Pending', value: leaves.pending, color: 'var(--now)' },
                  { label: 'Approved', value: leaves.approved, color: 'var(--accent)' },
                  { label: 'Rejected', value: leaves.rejected, color: 'var(--bad)' },
                ]}
              />
            ) : <Skeleton lines={3} />}
          </div>
        </div>
      </div>
    </DashboardView>
  );
}
