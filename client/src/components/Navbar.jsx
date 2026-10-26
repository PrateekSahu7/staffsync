import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.jsx';
import Icon from './ui/Icon.jsx';
import { Avatar } from './ui/ui.jsx';

// Left sidebar: links for the current role and the signed-in person
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const links = [
    { to: '/', label: 'Dashboard', icon: 'home', end: true },
    ...(user.role !== 'employee' ? [{ to: '/employees', label: user.role === 'hr' ? 'Employees' : 'My team', icon: 'users' }] : []),
    { to: '/leaves', label: 'Leaves', icon: 'file' },
    { to: '/attendance', label: 'Attendance', icon: 'clock' },
    { to: '/announcements', label: 'Announcements', icon: 'bell' },
    { to: '/training', label: 'Training', icon: 'book' },
    ...(user.role === 'hr'
      ? [{ to: '/reports', label: 'Reports', icon: 'chart' }, { to: '/register', label: 'Register a person', icon: 'userplus' }]
      : []),
  ];

  return (
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">S</span>StaffSync</div>
      <nav className="side-nav" aria-label="Main">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end} className="side-link">
            <Icon name={l.icon} />{l.label}
          </NavLink>
        ))}
      </nav>
      <div className="side-user">
        <Avatar name={user.name} size={36} />
        <div className="side-who">
          <div className="side-name">{user.name}</div>
          <div className="side-role">{user.role === 'hr' ? 'HR' : user.role}</div>
        </div>
        <button className="icon-btn" aria-label="Log out" title="Log out" onClick={() => { logout(); navigate('/login'); }}>
          <Icon name="logout" />
        </button>
      </div>
    </aside>
  );
}
