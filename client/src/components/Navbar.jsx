import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Dashboard', end: true },
    ...(user.role !== 'employee' ? [{ to: '/employees', label: user.role === 'hr' ? 'Employees' : 'My team' }] : []),
    { to: '/leaves', label: 'Leaves' },
    { to: '/attendance', label: 'Attendance' },
    { to: '/announcements', label: 'Announcements' },
    { to: '/training', label: 'Training' },
    ...(user.role === 'hr' ? [{ to: '/reports', label: 'Reports' }] : []),
  ];

  return (
    <nav className="navbar navbar-expand-lg app-nav">
      <div className="container">
        <span className="navbar-brand">StaffSync</span>
        <button className="navbar-toggler border-0" type="button" data-bs-toggle="collapse" data-bs-target="#nav">
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }} />
        </button>
        <div className="collapse navbar-collapse" id="nav">
          <ul className="navbar-nav me-auto gap-1">
            {links.map((l) => (
              <li className="nav-item" key={l.to}>
                <NavLink to={l.to} end={l.end} className="nav-link">{l.label}</NavLink>
              </li>
            ))}
          </ul>
          <div className="d-flex align-items-center gap-3 text-white-50 small">
            <span>{user.name} ({user.role})</span>
            <button
              className="btn btn-sm btn-outline-light"
              onClick={() => { logout(); navigate('/login'); }}
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
