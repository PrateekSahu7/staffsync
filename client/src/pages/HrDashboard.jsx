import { Link } from 'react-router-dom';
import DashboardView from '../components/DashboardView.jsx';

const layout = (s) => [
  { label: 'People in the company', value: s.employees, to: '/employees' },
  { label: 'Leave requests waiting', value: s.pendingLeaves, to: '/leaves' },
  { label: 'Checked in today', value: s.presentToday, to: '/attendance' },
  { label: 'On approved leave today', value: s.onLeaveToday, to: '/leaves' },
  { label: 'Trainings upcoming or running', value: s.activeTrainings, to: '/training' },
];

export default function HrDashboard() {
  return (
    <DashboardView subtitle="HR overview" layout={layout}>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link to="/register" className="btn btn-primary">Register a person</Link>
        <Link to="/leaves" className="btn btn-outline-primary">Review leave requests</Link>
        <Link to="/reports" className="btn btn-outline-primary">Open reports</Link>
      </div>
    </DashboardView>
  );
}
