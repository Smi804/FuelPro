// Shown on station-scoped pages (Items, Brands) when no specific station is
// selected in the topbar. The backend requires a station for these resources.
export default function StationRequired({ resource = 'records' }) {
  return (
    <div className="card" style={{ padding: 'var(--space-6)', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', marginBottom: 12, color: 'var(--text-muted)' }}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M3 9.5 12 4l9 5.5" />
          <path d="M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
          <path d="M9 20v-6h6v6" />
        </svg>
      </div>
      <div className="card-title" style={{ marginBottom: 4 }}>
        Select a station
      </div>
      <div className="card-subtitle">Choose a station from the switcher in the top bar to manage {resource}.</div>
    </div>
  );
}
