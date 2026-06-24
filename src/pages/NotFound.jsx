import { useNavigate, Link } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="error-page">
      <div className="error-content">
        <div className="error-code">404</div>
        <div className="error-title">Page not found</div>
        <div className="error-message">
          The page you're looking for doesn't exist or has been moved. Try heading back to the dashboard.
        </div>
        <div className="error-actions">
          <Link to="/" className="btn btn-primary">
            <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M8 2L2 7v7h12V7L8 2z" />
              <path d="M6 14V9h4v5" />
            </svg>
            Back to dashboard
          </Link>
          <button className="btn btn-outline" onClick={() => navigate(-1)}>
            ← Go back
          </button>
        </div>
      </div>
    </div>
  );
}
