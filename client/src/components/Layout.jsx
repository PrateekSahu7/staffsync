import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import CheckInChip from './CheckInChip.jsx';
import Icon from './ui/Icon.jsx';
import { useTheme } from '../ThemeContext.jsx';

// Sidebar, top bar and the page area. On small screens the sidebar slides in over the page.
export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const { theme, toggle } = useTheme();
  const { pathname } = useLocation();

  useEffect(() => { setOpen(false); }, [pathname]);

  const date = new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
  const next = theme === 'dark' ? 'light' : 'dark';

  return (
    <div className={`shell ${open ? 'nav-open' : ''}`}>
      <Navbar />
      <div className="scrim" onClick={() => setOpen(false)} />
      <div className="main">
        <header className="topbar">
          <button className="icon-btn menu-btn" aria-label="Open menu" onClick={() => setOpen(true)}><Icon name="menu" /></button>
          <span className="topbar-date">{date}</span>
          <div className="topbar-right">
            <CheckInChip />
            <button className="icon-btn" aria-label={`Switch to ${next} mode`} title={`Switch to ${next} mode`} onClick={toggle}>
              <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
            </button>
          </div>
        </header>
        <main className="content">{children}</main>
      </div>
    </div>
  );
}
