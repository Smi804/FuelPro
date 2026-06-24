import { useState } from 'react';
import ChartCard from '../../../components/crud/ChartCard.jsx';
import { MultiLineChart, Donut } from '../../../components/MiniCharts.jsx';
import { GRADES, WEEKLY_PRICES, SUPPLIERS, getWeeklyPrices } from '../../../data/mock/supply.js';

const usd = (n) => `$${Number(n).toFixed(2)}`;
const PIE_COLORS = ['var(--blue)', 'var(--green)', 'var(--purple)', 'var(--yellow)'];

export default function PriceTrends() {
  const [grade, setGrade] = useState('regular');
  const [supplier, setSupplier] = useState('market');

  // Weekly price series — one line per grade (item), for the chosen supplier or
  // the market average.
  const weekly = supplier === 'market' ? WEEKLY_PRICES : getWeeklyPrices(supplier);
  const series = GRADES.map((g) => ({ label: g.label, color: g.color, data: weekly[g.key] }));

  // Daily change = last day minus previous day, per grade.
  const dayChange = (arr) => arr[arr.length - 1] - arr[arr.length - 2];

  // Supplier price comparison (pie) for the selected grade. Slice size is the
  // supplier's share of the summed price, so cheaper suppliers read as smaller.
  const total = SUPPLIERS.reduce((s, sup) => s + sup.prices[grade], 0) || 1;
  const segments = SUPPLIERS.map((s, i) => ({
    label: s.name,
    color: PIE_COLORS[i % PIE_COLORS.length],
    value: s.prices[grade],
    pct: (s.prices[grade] / total) * 100
  }));
  const cheapest = SUPPLIERS.reduce((a, b) => (b.prices[grade] < a.prices[grade] ? b : a));

  return (
    <div className="row col-2">
      <ChartCard
        title="Weekly price trends"
        height="auto"
        subtitle={`${supplier === 'market' ? 'Market average' : SUPPLIERS.find((s) => s.id === supplier).name} · all items · last 7 days · $/gal`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 10 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            <button
              type="button"
              className={'btn btn-sm ' + (supplier === 'market' ? 'btn-primary' : 'btn-secondary')}
              onClick={() => setSupplier('market')}
            >
              Market avg
            </button>
            {SUPPLIERS.map((s) => (
              <button
                key={s.id}
                type="button"
                className={'btn btn-sm ' + (supplier === s.id ? 'btn-primary' : 'btn-secondary')}
                onClick={() => setSupplier(s.id)}
              >
                {s.name}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 180 }}>
            <MultiLineChart series={series} labels={WEEKLY_PRICES.days} id="weekly-prices" formatY={usd} />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, paddingTop: 4, borderTop: '1px solid var(--border-color-light)' }}>
            {GRADES.map((g) => {
              const chg = dayChange(weekly[g.key]);
              const up = chg >= 0;
              return (
                <div key={g.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5 }}>
                  <span style={{ width: 10, height: 10, borderRadius: 3, background: g.color }} />
                  <span>{g.label}</span>
                  <span className="cell-strong">{usd(weekly[g.key].slice(-1)[0])}</span>
                  <span style={{ color: up ? 'var(--green)' : 'var(--red)', fontSize: 11.5 }}>
                    {up ? '▲' : '▼'} {usd(Math.abs(chg))}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </ChartCard>

      <ChartCard
        title="Supplier price comparison"
        height="auto"
        subtitle={`${GRADES.find((g) => g.key === grade).label} · current $/gallon`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {GRADES.map((g) => (
              <button
                key={g.key}
                type="button"
                className={'btn btn-sm ' + (grade === g.key ? 'btn-primary' : 'btn-secondary')}
                onClick={() => setGrade(g.key)}
              >
                {g.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', flex: 1 }}>
            <Donut segments={segments} centerNum={usd(cheapest.prices[grade])} centerSub="lowest" size={150} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: 1, minWidth: 150 }}>
              {segments
                .slice()
                .sort((a, b) => a.value - b.value)
                .map((s) => (
                  <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                    <span style={{ width: 10, height: 10, borderRadius: 3, background: s.color }} />
                    <span style={{ flex: 1 }}>{s.label}</span>
                    <span className="cell-strong">{usd(s.value)}</span>
                    {s.label === cheapest.name && <span className="badge status-green">Lowest</span>}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </ChartCard>
    </div>
  );
}
