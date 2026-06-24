import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthBrand from '../components/AuthBrand.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthBrand />
        <div className="auth-title">Forgot your password?</div>
        <div className="auth-subtitle">Enter your email and we'll send a reset link.</div>

        {!sent ? (
          <>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (email.trim()) setSent(true);
              }}
            >
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
              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 38 }}>
                Send reset link
              </button>
            </form>
            <div className="auth-divider">or</div>
            <div style={{ textAlign: 'center' }}>
              <Link to="/login" className="btn btn-outline" style={{ display: 'inline-flex', justifyContent: 'center' }}>
                ← Back to sign in
              </Link>
            </div>
          </>
        ) : (
          <div className="auth-success">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M8 12l3 3 5-6" />
            </svg>
            <div className="success-title">Check your email</div>
            <div className="success-desc">
              We sent a password reset link to <strong>{email}</strong>. The link expires in 30 minutes.
            </div>
          </div>
        )}

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </div>
      </div>
    </div>
  );
}
