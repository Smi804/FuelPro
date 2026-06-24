// Card wrapper for a chart, matching the template's `.card.chart-card` markup.
export default function ChartCard({ title, subtitle, right, height = 240, children }) {
  return (
    <div className="card chart-card">
      <div className="card-header">
        <div>
          <div className="card-title">{title}</div>
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
        {right}
      </div>
      <div className="chart" style={{ height, padding: '8px 16px 16px' }}>
        {children}
      </div>
    </div>
  );
}
