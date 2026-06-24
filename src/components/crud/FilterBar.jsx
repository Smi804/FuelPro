// A consistent filter row: search box + select filters + optional right slot.
export default function FilterBar({ search, filters = [], right }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        flexWrap: 'wrap',
        marginBottom: 'var(--space-4)'
      }}
    >
      {search && (
        <div className="search-box" style={{ maxWidth: 260 }}>
          <svg className="s-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="7" cy="7" r="5" />
            <path d="M11 11l3.5 3.5" />
          </svg>
          <input
            type="text"
            placeholder={search.placeholder || 'Search…'}
            aria-label="Search"
            value={search.value}
            onChange={(e) => search.onChange(e.target.value)}
          />
        </div>
      )}
      {filters.map((f) => (
        <select
          key={f.label}
          className="form-control"
          style={{ maxWidth: 200, width: 'auto' }}
          aria-label={f.label}
          value={f.value}
          onChange={(e) => f.onChange(e.target.value)}
        >
          <option value="">{f.label}: All</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ))}
      {right && <div style={{ marginLeft: 'auto' }}>{right}</div>}
    </div>
  );
}
