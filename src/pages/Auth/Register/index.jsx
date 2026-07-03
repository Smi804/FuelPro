import { useNavigate, Link } from 'react-router-dom';
import AuthBrand from '../components/AuthBrand.jsx';
import SocialButtons from '../components/SocialButtons.jsx';

export default function Register() {
  const navigate = useNavigate();
  return (
    <div className="auth-page">
      <div className="auth-card">
        <AuthBrand />
        <div className="auth-title">Create your account</div>
        <div className="auth-subtitle">Get started in less than a minute.</div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            navigate('/dashboard');
          }}
        >
          <div className="form-group">
            <label className="form-label" htmlFor="name">
              Full name
            </label>
            <div className="input-group">
              <svg className="input-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="8" cy="5" r="3" />
                <path d="M2 14a6 6 0 0112 0" />
              </svg>
              <input type="text" id="name" className="form-control" placeholder="Aigars Silkalns" required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">
              Email
            </label>
            <div className="input-group">
              <svg className="input-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="12" height="10" rx="1.5" />
                <path d="M2 5l6 4 6-4" />
              </svg>
              <input type="email" id="email" className="form-control" placeholder="you@company.com" required />
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
              <input type="password" id="password" className="form-control" placeholder="At least 8 characters" minLength={8} required />
            </div>
            <div className="form-hint">8+ characters, mixed case + a number</div>
          </div>
          <div className="auth-actions" style={{ justifyContent: 'flex-start' }}>
            <label className="form-check">
              <input type="checkbox" required /> I agree to the <a href="#">Terms</a> and <a href="#">Privacy Policy</a>
            </label>
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 38 }}>
            Create account
          </button>
        </form>

        <div className="auth-divider">or sign up with</div>
        <SocialButtons />

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
