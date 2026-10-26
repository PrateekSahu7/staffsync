import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './AuthContext.jsx';
import Layout from './components/Layout.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './components/auth/Login.jsx';
import Register from './components/auth/Register.jsx';
import Announcements from './components/employee/Announcements.jsx';
import Attendance from './components/employee/Attendance.jsx';
import LeaveApply from './components/employee/LeaveApply.jsx';
import LeaveList from './components/employee/LeaveList.jsx';
import AnnouncementsManager from './components/hr/AnnouncementsManager.jsx';
import AttendanceSummary from './components/hr/AttendanceSummary.jsx';
import EmployeeCRUD from './components/hr/EmployeeCRUD.jsx';
import HrLeaveApplications from './components/hr/LeaveApplications.jsx';
import Reports from './components/hr/Reports.jsx';
import ManagerLeaveApplications from './components/manager/LeaveApplications.jsx';
import TrainingManagement from './components/manager/TrainingManagement.jsx';
import EmployeeDashboard from './pages/EmployeeDashboard.jsx';
import HrDashboard from './pages/HrDashboard.jsx';
import ManagerDashboard from './pages/ManagerDashboard.jsx';

const dashboards = { hr: HrDashboard, manager: ManagerDashboard, employee: EmployeeDashboard };

// "/" shows the dashboard that belongs to the logged-in role
function Home() {
  const { user } = useAuth();
  const Dashboard = dashboards[user.role];
  return <Dashboard />;
}

// Everyone can mark their own attendance; HR and managers also see other people's
function AttendancePage() {
  const { user } = useAuth();
  return (
    <>
      <Attendance />
      {user.role !== 'employee' && <AttendanceSummary />}
    </>
  );
}

// Employees and managers apply for leave; managers and HR review requests
function LeavesPage() {
  const { user } = useAuth();
  const [version, setVersion] = useState(0); // bumped after applying so the list reloads
  return (
    <>
      <h3 className="page-title mb-4">Leaves</h3>
      {user.role !== 'hr' && (
        <>
          <LeaveApply onApplied={() => setVersion((v) => v + 1)} />
          <LeaveList refreshKey={version} />
        </>
      )}
      {user.role === 'manager' && <ManagerLeaveApplications />}
      {user.role === 'hr' && <HrLeaveApplications />}
    </>
  );
}

// HR and managers can post; employees read
function AnnouncementsPage() {
  const { user } = useAuth();
  return user.role === 'employee' ? <Announcements /> : <AnnouncementsManager />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
      <Routes>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/register" element={<ProtectedRoute roles={['hr']}><Register /></ProtectedRoute>} />
        <Route path="/employees" element={<ProtectedRoute roles={['hr', 'manager']}><EmployeeCRUD /></ProtectedRoute>} />
        <Route path="/leaves" element={<ProtectedRoute><LeavesPage /></ProtectedRoute>} />
        <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
        <Route path="/announcements" element={<ProtectedRoute><AnnouncementsPage /></ProtectedRoute>} />
        <Route path="/training" element={<ProtectedRoute><TrainingManagement /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute roles={['hr']}><Reports /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
  );
}

export default function App() {
  const { user } = useAuth();
  return user ? <Layout><AppRoutes /></Layout> : <AppRoutes />;
}
