import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { NAV } from '../data/nav.js';
import Icon from './Icon.jsx';
import { useAuth } from '../auth/AuthContext.jsx';
import { ROLE_LABEL } from '../domain/roles.js';
import { isModuleEnabled } from '../domain/permissions.js';

const Chevron = () => (
  <svg className="nav-chev" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M6 4l4 4-4 4" />
  </svg>
);

const LockIcon = () => (
  <svg className="nav-lock" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <rect x="3" y="7" width="10" height="6" rx="1.5" />
    <path d="M5 7V5a3 3 0 016 0v2" />
  </svg>
);

// True when the item (or any descendant leaf) maps to an unlocked module.
function hasUnlocked(item) {
  return item.children ? item.children.some(hasUnlocked) : isModuleEnabled(item.module);
}

// A non-navigable, greyed row with a lock icon.
function LockedRow({ item, depth }) {
  const cls = (depth === 0 ? 'nav-link' : 'nav-sublink') + ' nav-locked';
  return (
    <span className={cls} aria-disabled="true" title="Locked">
      {depth === 0 && <Icon name={item.icon} />}
      <span className="nav-text">{item.text}</span>
      <LockIcon />
    </span>
  );
}

// True if `pathname` matches any (possibly nested) leaf under these items.
function containsActive(items, pathname) {
  return items.some((c) =>
    c.children ? containsActive(c.children, pathname) : pathname === c.to || pathname.startsWith(c.to + '/')
  );
}

// Recursive node renderer — supports arbitrary nesting depth. `depth === 0`
// items render as top-level `.nav-link`s (with icons); deeper items render as
// `.nav-sublink`s.
function NavNode({ item, pathname, depth }) {
  if (!item.children) {
    if (!isModuleEnabled(item.module)) return <LockedRow item={item} depth={depth} />;
    const cls = depth === 0 ? 'nav-link' : 'nav-sublink';
    return (
      <NavLink to={item.to} end={item.to === '/dashboard'} className={({ isActive }) => cls + (isActive ? ' active' : '')}>
        {depth === 0 && <Icon name={item.icon} />}
        <span className="nav-text">{item.text}</span>
        {item.badge && <span className={`badge ${item.badge.cls}`}>{item.badge.text}</span>}
      </NavLink>
    );
  }
  // Fully-locked branch (no unlocked descendant) → show one locked row.
  if (!hasUnlocked(item)) return <LockedRow item={item} depth={depth} />;
  return <NavTree item={item} pathname={pathname} depth={depth} />;
}

function NavTree({ item, pathname, depth }) {
  const childActive = containsActive(item.children, pathname);
  const [open, setOpen] = useState(childActive);
  const toggleCls = (depth === 0 ? 'nav-link' : 'nav-sublink') + ' nav-toggle';

  return (
    <div className={'nav-tree' + (open ? ' open' : '') + (childActive ? ' has-active' : '')}>
      <button type="button" className={toggleCls} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        {depth === 0 && <Icon name={item.icon} />}
        <span className="nav-text">{item.text}</span>
        {item.badge && <span className={`badge ${item.badge.cls}`}>{item.badge.text}</span>}
        <Chevron />
      </button>
      <div className="nav-sub">
        <div className="nav-sub-inner">
          {item.children.map((c, i) => (
            <NavNode key={c.key || c.text || i} item={c} pathname={pathname} depth={depth + 1} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Sidebar({ open = false }) {
  const { pathname } = useLocation();
  const { can, user } = useAuth();

  // Recursively filter the nav tree by the current role's permissions. A branch
  // stays visible if any descendant leaf is permitted.
  const filterItems = (items) =>
    items
      .map((item) => {
        if (item.children) {
          const children = filterItems(item.children);
          return children.length ? { ...item, children } : null;
        }
        return can(`${item.module}:view`) ? item : null;
      })
      .filter(Boolean);

  const groups = NAV.map((group) => ({ ...group, items: filterItems(group.items) })).filter((g) => g.items.length);

  const initials = user.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

  return (
    <aside className={'sidebar' + (open ? ' open' : '')} aria-label="Primary navigation">
      <div className="sidebar-brand">
        <img src={`${import.meta.env.BASE_URL}images/fuelpro.png`} alt="Fuel Pro" className="brand-logo" />
        <span className="brand-name">FuelPRO</span>
      </div>
      <nav className="sidebar-nav">
        {groups.map((group) => (
          <div className="nav-group" key={group.label}>
            <div className="nav-label">{group.label}</div>
            {group.items.map((item, i) => (
              <NavNode key={item.key || item.text || i} item={item} pathname={pathname} depth={0} />
            ))}
          </div>
        ))}
      </nav>
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="avatar">
            {initials}
            <span className="online"></span>
          </div>
          <div className="sidebar-user-info">
            <div className="name">{user.name}</div>
            <div className="role">{ROLE_LABEL[user.role]}</div>
          </div>
          <button className="more-btn" aria-label="More options">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
              <circle cx="8" cy="3" r="1.2" />
              <circle cx="8" cy="8" r="1.2" />
              <circle cx="8" cy="13" r="1.2" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
