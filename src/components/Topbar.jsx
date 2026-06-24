import { useNavigate } from 'react-router-dom';
import { useTheme } from '../hooks/useTheme.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { ROLE_LIST } from '../domain/roles.js';

export default function Topbar({ breadcrumb = ['Home'], onToggleSidebar }) {
  const { theme, toggle } = useTheme();
  const { user, setRole, stations, activeStationId, setActiveStationId, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="sidebar-toggle"
          type="button"
          aria-label="Toggle sidebar"
          title="Collapse / expand sidebar"
          onClick={onToggleSidebar}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d="M9 4v16" />
          </svg>
        </button>
        <nav className="breadcrumb" aria-label="Breadcrumb">
          {breadcrumb.map((c, i) => {
            const isLast = i === breadcrumb.length - 1;
            return (
              <span key={i}>
                {i > 0 && (
                  <span className="sep" aria-hidden="true">
                    ›
                  </span>
                )}
                <span className={isLast ? 'current' : undefined} aria-current={isLast ? 'page' : undefined}>
                  {c}
                </span>
              </span>
            );
          })}
        </nav>
      </div>
      <div className="search-box">
        <svg className="s-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <circle cx="7" cy="7" r="5" />
          <path d="M11 11l3.5 3.5" />
        </svg>
        <input type="text" placeholder="Search pages…" aria-label="Search" />
        <kbd>⌘K</kbd>
      </div>
      <div className="topbar-right">
        <select
          className="form-control station-switcher"
          style={{ width: 'auto', maxWidth: 180, height: 34, fontSize: 12.5 }}
          aria-label="Active station"
          title="Select the station whose data you want to view"
          value={activeStationId}
          onChange={(e) => setActiveStationId(e.target.value)}
        >
          <option value="all">All stations</option>
          {stations.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        {/* <select
          className="form-control"
          style={{ width: 'auto', height: 34, fontSize: 12.5 }}
          aria-label="Switch role (demo)"
          title="Switch role to preview role-based access"
          value={user.role}
          onChange={(e) => setRole(e.target.value)}
        >
          {ROLE_LIST.map((r) => (
            <option key={r.key} value={r.key}>
              {r.label}
            </option>
          ))}
        </select> */}
        <button
          className="tb-btn theme-toggle"
          type="button"
          title="Toggle theme"
          aria-label="Toggle theme"
          aria-pressed={theme === 'dark'}
          onClick={toggle}
        >
          <svg className="theme-icon-light" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <svg className="theme-icon-dark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
        <button className="tb-btn tb-notifications" type="button" title="Notifications" aria-label="Notifications">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z" />
            <path d="M10.5 21a1.5 1.5 0 003 0" />
          </svg>
          <span className="dot"></span>
        </button>
        <button className="tb-btn tb-messages" type="button" title="Messages" aria-label="Messages">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="3" />
            <path d="M2 7l10 6 10-6" />
          </svg>
        </button>
        <button className="tb-avatar" type="button" aria-label="Account menu">
          {user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
        </button>
        <button className="tb-btn" type="button" title="Log out" aria-label="Log out" onClick={handleLogout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <path d="M16 17l5-5-5-5" />
            <path d="M21 12H9" />
          </svg>
        </button>
      </div>
    </header>
  );
}
