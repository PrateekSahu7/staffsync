import DashboardView from '../components/DashboardView.jsx';
import UpcomingTrainings from '../components/UpcomingTrainings.jsx';

const layout = (s) => [
  { label: 'People on your team', value: s.teamSize, to: '/employees' },
  { label: 'Team leave requests waiting', value: s.pendingLeaves, to: '/leaves' },
  { label: 'Team checked in today', value: s.presentToday, to: '/attendance' },
  { label: 'Trainings upcoming', value: s.upcomingTrainings, to: '/training' },
  { label: 'Trainings running now', value: s.ongoingTrainings, to: '/training' },
];

export default function ManagerDashboard() {
  return (
    <DashboardView subtitle="Team overview" layout={layout}>
      <UpcomingTrainings title="Training programs you run" />
    </DashboardView>
  );
}
