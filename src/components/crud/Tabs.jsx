// Tab strip reusing the theme's `.chart-tabs` / `.chart-tab` styling.
export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="chart-tabs" role="tablist" style={{ flexWrap: 'wrap' }}>
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          role="tab"
          aria-selected={active === t.key}
          className={'chart-tab' + (active === t.key ? ' active' : '')}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
