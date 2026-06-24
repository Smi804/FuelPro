import { useAuth } from './AuthContext.jsx';

// Route-level authorization. Renders the page when the user holds `perm`,
// otherwise shows a consistent, theme-styled "access denied" panel.
export default function ProtectedRoute({ perm, children }) {
  const { can } = useAuth();
  if (perm && !can(perm)) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ maxWidth: 520, margin: '40px auto', textAlign: 'center' }}>
          <div className="card-body" style={{ padding: 32 }}>
            <div className="stat-icon red" style={{ margin: '0 auto 16px' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 018 0v3" />
              </svg>
            </div>
            <h2 className="page-title" style={{ fontSize: 18 }}>Access denied</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 8 }}>
              Your role doesn’t have permission to view this page. Contact an administrator if you
              believe this is a mistake.
            </p>
          </div>
        </div>
      </div>
    );
  }
  return children;
}
