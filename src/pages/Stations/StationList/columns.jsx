import { Link } from 'react-router-dom';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import { STATION_STATUS } from '../../../data/mock/stations.js';

function StockBar({ pct }) {
  const color = pct > 50 ? 'var(--green)' : pct > 20 ? 'var(--yellow)' : 'var(--red)';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 120 }}>
      <div style={{ flex: 1, height: 6, borderRadius: 4, background: 'var(--border-color-light)', overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color }} />
      </div>
      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{pct}%</span>
    </div>
  );
}

export const stationColumns = [
  {
    key: 'name',
    label: 'Name',
    render: (r) => (
      <Link to={`/stations/${r.id}`} className="cell-strong" style={{ color: 'var(--primary)' }}>
        {r.name}
      </Link>
    ),
    exportValue: (r) => r.name
  },
  { key: 'address', label: 'Address', render: (r) => `${r.address}, ${r.city}`, exportValue: (r) => `${r.address}, ${r.city}` },
  { key: 'managerName', label: 'Manager' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={STATION_STATUS} />, exportValue: (r) => r.status },
  { key: 'fuelStockPct', label: 'Fuel Stock', render: (r) => <StockBar pct={r.fuelStockPct} />, exportValue: (r) => `${r.fuelStockPct}%` }
];

export const stationFields = [
  { name: 'name', label: 'Station name', required: true, span: 2 },
  { name: 'address', label: 'Address', required: true },
  { name: 'city', label: 'City', required: true },
  { name: 'managerName', label: 'Manager', required: true },
  {
    name: 'status',
    label: 'Status',
    type: 'select',
    required: true,
    options: [
      { value: 'active', label: 'Active' },
      { value: 'maintenance', label: 'Maintenance' },
      { value: 'inactive', label: 'Inactive' }
    ]
  },
  { name: 'fuelStockPct', label: 'Fuel stock %', type: 'number', min: 0, defaultValue: 50 }
];
