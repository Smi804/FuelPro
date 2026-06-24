import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import AuthBrand from '../components/AuthBrand.jsx';
import SocialButtons from '../components/SocialButtons.jsx';
import { useAuth } from '../../../auth/AuthContext.jsx';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const from = location.state?.from?.pathname || '/';
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to={from} replace />;

  const onSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = login(email, password);
    setLoading(false);
    if (res.ok) navigate(from, { replace: true });
    else setError(res.error);
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthBrand />
        <div className="auth-title">Welcome back</div>
        <div className="auth-subtitle">Sign in to continue to your dashboard.</div>

        <form onSubmit={onSubmit}>
          {error && (
            <div className="alert alert-error" role="alert" style={{ marginBottom: 14 }}>
              {error}
            </div>
          )}
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <div className="input-group">
              <svg className="input-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="12" height="10" rx="1.5" />
                <path d="M2 5l6 4 6-4" />
              </svg>
              <input
                type="email"
                id="email"
                className="form-control"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">
              Password
            </label>
            <div className="input-group">
              <svg className="input-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="7" width="10" height="7" rx="1.5" />
                <path d="M5 7V5a3 3 0 016 0v2" />
              </svg>
              <input
                type="password"
                id="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="auth-actions">
            <label className="form-check">
              <input type="checkbox" defaultChecked /> Remember me
            </label>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center', height: 38 }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="auth-hint" style={{ marginTop: 14, fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center' }}>
          Demo login — <strong>admin@gmail.com</strong> / <strong>admin123</strong>
        </div>

        <div className="auth-divider">or continue with</div>
        <SocialButtons />

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
