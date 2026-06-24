import { SUPPLIERS } from '../../../data/mock/supply.js';

const usd = (n) => `$${Number(n).toFixed(2)}`;

// Which supplier supplies which stations (e.g. Synergy → Los Gatos, Mountain
// View, Gilroy), with the supplier's current regular quote.
export default function SupplierStationMap() {
  return (
    <div className="card">
      <div className="card-header">
        <div>
          <div className="card-title">Supplier coverage</div>
          <div className="card-subtitle">Which supplier serves which stations</div>
        </div>
      </div>
      <div className="card-body">
        <div className="row col-2">
          {SUPPLIERS.map((s) => (
            <div key={s.id} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '12px 0', borderBottom: '1px solid var(--border-color-light)' }}>
              <div style={{ minWidth: 110 }}>
                <div className="cell-strong" style={{ fontSize: 14 }}>{s.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Regular {usd(s.prices.regular)}/gal</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, flex: 1 }}>
                {s.stations.map((st) => (
                  <span key={st} className="chip chip-blue">{st}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
