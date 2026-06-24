import Icon from '../Icon.jsx';

/**
 * Dashboard / page summary stat card. Reuses `.card .stat` markup so it inherits
 * the existing theme styling and dark-mode tokens.
 */
export default function SummaryCard({ icon, tone = 'teal', label, value, change, changeDir, subtext }) {
  return (
    <div className="card stat">
      <div className={`stat-icon ${tone}`}>{typeof icon === 'string' ? <Icon name={icon} /> : icon}</div>
      <div className="stat-content">
        <div className="stat-label">{label}</div>
        <div className="stat-value-row">
          <span className="stat-value">{value}</span>
          {change != null && (
            <span className={`stat-change ${changeDir === 'down' ? 'down' : 'up'}`}>
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
                {changeDir === 'down' ? <path d="M4 6l4 4 4-4" /> : <path d="M4 10l4-4 4 4" />}
              </svg>
              {change}
            </span>
          )}
        </div>
        {subtext && <div className="stat-subtext">{subtext}</div>}
      </div>
    </div>
  );
}
