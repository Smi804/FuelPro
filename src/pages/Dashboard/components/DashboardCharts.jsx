import ChartCard from '../../../components/crud/ChartCard.jsx';
import { Donut } from '../../../components/MiniCharts.jsx';
import { GRADES, GALLONS_BY_GRADE, TOTAL_GALLONS, TODAY_QUOTES, gallonsDonut } from '../../../data/mock/supply.js';

const usd = (n) => `$${Number(n).toFixed(2)}`;

export default function DashboardCharts() {
  const segments = gallonsDonut(GALLONS_BY_GRADE);
  const maxQuote = Math.max(...GRADES.map((g) => TODAY_QUOTES[g.key]));

  return (
    <>
      <div className="row col-2">
        <ChartCard title="Gallons purchased by grade" subtitle="All stations · to date">
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, height: '100%', flexWrap: 'wrap' }}>
            <Donut segments={segments} centerNum={`${(TOTAL_GALLONS / 1e6).toFixed(2)}M`} centerSub="gallons" size={160} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 160 }}>
              {segments.map((s) => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                  <span style={{ flex: 1 }}>{s.label}</span>
                  <span className="cell-strong">{(s.value / 1000).toLocaleString()}k</span>
                  <span style={{ color: 'var(--text-muted)', width: 42, textAlign: 'right' }}>{s.pct.toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
        </ChartCard>

        <ChartCard title="Today's quote by grade" subtitle="Market reference · $/gallon">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, justifyContent: 'center', height: '100%' }}>
            {GRADES.map((g) => (
              <div key={g.key}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12.5, marginBottom: 4 }}>
                  <span>{g.label}</span>
                  <span className="cell-strong">{usd(TODAY_QUOTES[g.key])}</span>
                </div>
                <div style={{ height: 8, borderRadius: 4, background: 'var(--border-color-light)', overflow: 'hidden' }}>
                  <div style={{ width: `${(TODAY_QUOTES[g.key] / maxQuote) * 100}%`, height: '100%', background: g.color }} />
                </div>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>
    </>
  );
}
