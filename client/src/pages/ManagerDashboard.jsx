import DashboardView from '../components/DashboardView.jsx';
import UpcomingTrainings from '../components/UpcomingTrainings.jsx';
import Donut from '../components/charts/Donut.jsx';
import { Skeleton } from '../components/ui/ui.jsx';

const layout = (s) => [
  { label: 'People on your team', value: s.teamSize, to: '/employees' },
  { label: 'Team leave requests waiting', value: s.pendingLeaves, to: '/leaves' },
  { label: 'Team checked in today', value: s.presentToday, to: '/attendance' },
  { label: 'Trainings upcoming', value: s.upcomingTrainings, to: '/training' },
  { label: 'Trainings running now', value: s.ongoingTrainings, to: '/training' },
];

export default function ManagerDashboard() {
  return (
    <DashboardView subtitle="Here is how your team is doing today." layout={layout}>
      {(s) => (
        <div className="row g-4 mb-4">
          <div className="col-lg-5">
            <div className="panel p-4 h-100">
              <h5 className="mb-3">Team today</h5>
              {s ? (
                <Donut
                  centerLabel="people"
                  segments={[
                    { label: 'Checked in', value: s.presentToday, color: 'var(--accent)' },
                    { label: 'Not yet', value: Math.max(0, s.teamSize - s.presentToday), color: 'var(--border)' },
                  ]}
                />
              ) : <Skeleton lines={3} />}
            </div>
          </div>
          <div className="col-lg-7"><UpcomingTrainings title="Training you run" fill /></div>
        </div>
      )}
    </DashboardView>
  );
}
