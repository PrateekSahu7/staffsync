import { Link } from 'react-router-dom';
import DashboardView from '../components/DashboardView.jsx';
import UpcomingTrainings from '../components/UpcomingTrainings.jsx';
import Icon from '../components/ui/Icon.jsx';

const layout = (s) => [
  { label: 'Today', value: s.attendanceToday, to: '/attendance', text: true },
  { label: 'Leave days taken this year', value: s.daysTaken, to: '/leaves' },
  { label: 'Leave requests waiting', value: s.pendingLeaves, to: '/leaves' },
  { label: 'Your trainings upcoming or running', value: s.activeTrainings, to: '/training' },
];

export default function EmployeeDashboard() {
  return (
    <DashboardView subtitle="Here is your day at a glance." layout={layout}>
      <div className="d-flex flex-wrap gap-2 mb-4">
        <Link to="/leaves" className="btn btn-primary"><Icon name="file" size={16} className="me-2" />Ask for leave</Link>
        <Link to="/attendance" className="btn btn-light"><Icon name="clock" size={16} className="me-2" />See my attendance</Link>
      </div>
      <UpcomingTrainings title="Your training" />
    </DashboardView>
  );
}
