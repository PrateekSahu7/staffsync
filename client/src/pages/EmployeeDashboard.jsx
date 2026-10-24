import DashboardView from '../components/DashboardView.jsx';
import UpcomingTrainings from '../components/UpcomingTrainings.jsx';

const layout = (s) => [
  { label: 'Today', value: s.attendanceToday, to: '/attendance', text: true },
  { label: 'Leave days taken this year', value: s.daysTaken, to: '/leaves' },
  { label: 'Leave requests waiting', value: s.pendingLeaves, to: '/leaves' },
  { label: 'Your trainings upcoming or running', value: s.activeTrainings, to: '/training' },
];

export default function EmployeeDashboard() {
  return (
    <DashboardView subtitle="Your overview" layout={layout}>
      <UpcomingTrainings title="Your training" />
    </DashboardView>
  );
}
