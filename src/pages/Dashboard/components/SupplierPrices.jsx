import { GRADES, SUPPLIERS } from '../../../data/mock/supply.js';

const usd = (n) => `$${Number(n).toFixed(2)}`;

// Big, bold current per-gallon quotes for every gas supplier.
export default function SupplierPrices() {
  return (
    <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
      <div className="card-header">
        <div>
          <div className="card-title">Supplier prices today</div>
          <div className="card-subtitle">Current per-gallon quote by supplier and grade</div>
        </div>
      </div>
      <div className="card-body">
        <div className="row col-4">
          {SUPPLIERS.map((s) => {
            const up = s.change >= 0;
            return (
              <div key={s.id} className="card" style={{ margin: 0, boxShadow: 'none', border: '1px solid var(--border-color)' }}>
                <div className="card-body" style={{ padding: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span className="cell-strong" style={{ fontSize: 15 }}>{s.name}</span>
                    <span className={'status ' + (up ? 'status-green' : 'status-red')}>
                      {up ? '▲' : '▼'} {usd(Math.abs(s.change))}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {GRADES.map((g) => (
                      <div key={g.key} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                          <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: g.color, marginRight: 6 }} />
                          {g.label}
                        </span>
                        <span style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>{usd(s.prices[g.key])}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
