import { Link } from 'react-router-dom';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import { TANKS, TANK_STATUS } from '../../../data/mock/tanks.js';
import { SHIFTS } from '../../../data/mock/operations.js';
import { SALES, PAYMENT_STATUS } from '../../../data/mock/sales.js';

export default function DashboardWidgets() {
  const lowStock = TANKS.filter((t) => t.status !== 'ok').sort((a, b) => a.currentStock - b.currentStock);
  const openShifts = SHIFTS.filter((s) => s.status === 'open');
  const recent = SALES.slice(0, 6);

  return (
    <div className="row col-3">
      <div className="card">
        <div className="card-header">
          <div className="card-title">Low Stock Alerts</div>
          <Link to="/inventory/tanks" className="card-subtitle" style={{ color: 'var(--primary)' }}>
            View tanks
          </Link>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {lowStock.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>All tanks healthy.</p>}
          {lowStock.map((t) => {
            const pct = Math.round((t.currentStock / t.capacity) * 100);
            return (
              <div key={t.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
                  <span className="cell-strong">{t.name}</span>
                  <StatusBadge value={t.status} map={TANK_STATUS} />
                </div>
                <div style={{ height: 6, borderRadius: 4, background: 'var(--border-color-light)', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${pct}%`,
                      height: '100%',
                      background: t.status === 'critical' ? 'var(--red)' : 'var(--yellow)'
                    }}
                  />
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)', marginTop: 3 }}>
                  {t.currentStock.toLocaleString()} / {t.capacity.toLocaleString()} L
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Open Shifts</div>
          <Link to="/shifts/reports" className="card-subtitle" style={{ color: 'var(--primary)' }}>
            All shifts
          </Link>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {openShifts.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No open shifts.</p>}
          {openShifts.map((s) => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div className="cell-avatar" style={{ background: 'var(--primary)' }}>
                {s.employeeName.split(' ').map((p) => p[0]).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="cell-strong" style={{ fontSize: 13 }}>{s.employeeName}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                  {s.stationName} · since {s.startedAt.split(' ')[1]}
                </div>
              </div>
              <span className="status status-green">Open</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Transactions</div>
          <Link to="/sales" className="card-subtitle" style={{ color: 'var(--primary)' }}>
            View sales
          </Link>
        </div>
        <div className="table-responsive">
          <table className="table">
            <tbody>
              {recent.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div className="cell-strong" style={{ fontSize: 12.5 }}>{s.invoiceNumber}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{s.customerName}</div>
                  </td>
                  <td style={{ textAlign: 'right' }} className="cell-strong">
                    ${s.amount.toFixed(2)}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <StatusBadge value={s.paymentStatus} map={PAYMENT_STATUS} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
