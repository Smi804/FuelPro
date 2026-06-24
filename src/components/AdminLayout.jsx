import { useCallback, useEffect, useMemo, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar.jsx';
import Topbar from './Topbar.jsx';
import Footer from './Footer.jsx';
import { NAV } from '../data/nav.js';

// Resolve a breadcrumb trail from the (possibly deeply nested) nav model.
// Matches the longest `to` prefix so dynamic routes (e.g. /stations/st_1) and
// nested routes still resolve to their full ancestor trail.
function walk(items, pathname, parents, best) {
  for (const item of items) {
    if (item.children) {
      best = walk(item.children, pathname, [...parents, item.text], best);
    } else if (item.to && (pathname === item.to || (item.to !== '/' && pathname.startsWith(item.to + '/')))) {
      if (!best || item.to.length > best.score) best = { trail: [...parents, item.text], score: item.to.length };
    }
  }
  return best;
}

function resolveBreadcrumb(pathname) {
  let best = null;
  for (const group of NAV) best = walk(group.items, pathname, ['Home', group.label], best);
  return best ? best.trail : ['Home'];
}

export default function AdminLayout() {
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rail, setRail] = useState(() => {
    try {
      return localStorage.getItem('fp_sidebar_rail') === '1';
    } catch {
      return false;
    }
  });

  // Close the mobile drawer on navigation.
  useEffect(() => {
    setDrawerOpen(false);
  }, [location.pathname]);

  // Reflect drawer state on <body> for the SCSS backdrop/lock behavior.
  useEffect(() => {
    document.body.classList.toggle('sidebar-open', drawerOpen);
    return () => document.body.classList.remove('sidebar-open');
  }, [drawerOpen]);

  // Collapsed (rail) mode on desktop — body.sidebar-rail drives the SCSS.
  useEffect(() => {
    document.body.classList.toggle('sidebar-rail', rail);
    return () => document.body.classList.remove('sidebar-rail');
  }, [rail]);

  // One toggle button: opens the drawer on narrow viewports, collapses to the
  // icon rail on desktop.
  const toggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 768) {
      setDrawerOpen((v) => !v);
    } else {
      setRail((v) => {
        const next = !v;
        try {
          localStorage.setItem('fp_sidebar_rail', next ? '1' : '0');
        } catch {
          /* ignore */
        }
        return next;
      });
    }
  }, []);

  const breadcrumb = useMemo(() => resolveBreadcrumb(location.pathname), [location.pathname]);

  return (
    <>
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>
      <Sidebar open={drawerOpen} />
      <Topbar breadcrumb={breadcrumb} onToggleSidebar={toggleSidebar} />
      <div className="sidebar-backdrop" hidden={!drawerOpen} onClick={() => setDrawerOpen(false)} />
      <main id="main-content" tabIndex="-1" className="main">
        <Outlet />
        <Footer />
      </main>
    </>
  );
}
