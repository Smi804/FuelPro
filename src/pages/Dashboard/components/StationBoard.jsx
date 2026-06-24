import { useState } from 'react';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import { Donut } from '../../../components/MiniCharts.jsx';
import { GRADES, SUPPLY_STATIONS, GALLONS_BY_GRADE, TOTAL_GALLONS, TOTAL_AMOUNT_PAID, TODAY_QUOTES, gallonsDonut, usd, gal } from '../../../data/mock/supply.js';

const price = (n) => `$${Number(n).toFixed(2)}`;

// All-stations aggregate presented in the same shape as a single station.
const ALL_VIEW = {
  id: 'all',
  name: 'All stations',
  supplier: `${SUPPLY_STATIONS.length} stations`,
  today: TODAY_QUOTES,
  gallons: GALLONS_BY_GRADE,
  totalGallons: TOTAL_GALLONS,
  amountPaid: TOTAL_AMOUNT_PAID
};

export default function StationBoard() {
  const [selected, setSelected] = useState('all');
  const view = selected === 'all' ? ALL_VIEW : SUPPLY_STATIONS.find((s) => s.id === selected) || ALL_VIEW;
  const segments = gallonsDonut(view.gallons);
  const tabs = [ALL_VIEW, ...SUPPLY_STATIONS];

  return (
    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
      <div className="card-header">
        <div>
          <div className="card-title">Station board</div>
          <div className="card-subtitle">Select a station to see its price, gallons and amount</div>
        </div>
      </div>

      {/* Menu bar — one entry per station */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px 14px', overflowX: 'auto' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            className={'btn btn-sm ' + (selected === t.id ? 'btn-primary' : 'btn-outline')}
            style={{ whiteSpace: 'nowrap' }}
            onClick={() => setSelected(t.id)}
          >
            {t.name}
          </button>
        ))}
      </div>

      <div className="card-body" style={{ borderTop: '1px solid var(--border-color)' }}>
        <div className="row col-3" style={{ marginBottom: 'var(--space-4)' }}>
          <SummaryCard icon="fuel" tone="blue" label="Total gallons purchased" value={gal(view.totalGallons)} subtext="To date" />
          <SummaryCard icon="wallet" tone="teal" label="Total amount paid" value={usd(view.amountPaid)} subtext="To date" />
          <SummaryCard icon="truck" tone="green" label="Supplier" value={view.supplier} subtext={view.name} />
        </div>

        <div className="row col-8-4">
          <div className="card" style={{ margin: 0, boxShadow: 'none', border: '1px solid var(--border-color)' }}>
            <div className="card-header"><div className="card-title" style={{ fontSize: 14 }}>Today's price — {view.name}</div></div>
            <div className="card-body">
              <div className="row col-4">
                {GRADES.map((g) => (
                  <div key={g.key} style={{ borderLeft: `3px solid ${g.color}`, paddingLeft: 12 }}>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{g.label}</div>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>{price(view.today[g.key])}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>per gallon</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="card" style={{ margin: 0, boxShadow: 'none', border: '1px solid var(--border-color)' }}>
            <div className="card-header"><div className="card-title" style={{ fontSize: 14 }}>Gallons by grade</div></div>
            <div className="card-body" style={{ display: 'flex', justifyContent: 'center' }}>
              <Donut segments={segments} centerNum={`${(view.totalGallons / 1e6).toFixed(2)}M`} centerSub="gal" size={150} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
