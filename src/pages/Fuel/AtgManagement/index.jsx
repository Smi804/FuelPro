import PageHeader from '../../../components/PageHeader.jsx';
import DataTable from '../../../components/crud/DataTable.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import ExportButtons from '../../../components/crud/ExportButtons.jsx';
import Can from '../../../auth/Can.jsx';
import { ATG_PROBES, ATG_STATUS } from '../../../data/mock/fuel.js';
import { FUEL_TYPE } from '../../../data/mock/products.js';

function FillBar({ pct }) {
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

const columns = [
  { key: 'tankName', label: 'Tank', render: (r) => <span className="cell-strong">{r.tankName}</span> },
  { key: 'stationName', label: 'Station' },
  { key: 'fuelType', label: 'Fuel', render: (r) => <span className={`chip ${FUEL_TYPE[r.fuelType].cls}`}>{FUEL_TYPE[r.fuelType].label}</span>, exportValue: (r) => r.fuelType },
  { key: 'volume', label: 'Volume', align: 'right', render: (r) => `${r.volume.toLocaleString()} L` },
  { key: 'fillPct', label: 'Fill', render: (r) => <FillBar pct={r.fillPct} /> },
  { key: 'ullage', label: 'Ullage', align: 'right', render: (r) => `${r.ullage.toLocaleString()} L` },
  { key: 'temperature', label: 'Temp', align: 'right', render: (r) => `${r.temperature}°C` },
  { key: 'waterLevel', label: 'Water', align: 'right', render: (r) => `${r.waterLevel} mm` },
  { key: 'probeStatus', label: 'Probe', render: (r) => <StatusBadge value={r.probeStatus} map={ATG_STATUS} />, exportValue: (r) => r.probeStatus }
];

export default function AtgManagement() {
  const online = ATG_PROBES.filter((p) => p.probeStatus === 'online').length;
  const faults = ATG_PROBES.filter((p) => p.probeStatus === 'fault').length;
  const totalVol = ATG_PROBES.reduce((s, p) => s + p.volume, 0);
  const avgFill = Math.round(ATG_PROBES.reduce((s, p) => s + p.fillPct, 0) / ATG_PROBES.length);

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Fuel · ATG"
        title="ATG Management"
        actions={
          <Can perm="atg:export">
            <ExportButtons columns={columns} rows={ATG_PROBES} filename="atg-probes" />
          </Can>
        }
      />
      <div className="row col-4">
        <SummaryCard icon="inventory" tone="teal" label="Probes Online" value={`${online}/${ATG_PROBES.length}`} />
        <SummaryCard icon="fuel" tone="blue" label="Monitored Volume" value={`${(totalVol / 1000).toFixed(1)}k L`} />
        <SummaryCard icon="fuel" tone="green" label="Avg Fill" value={`${avgFill}%`} />
        <SummaryCard icon="bell" tone="red" label="Probe Faults" value={faults} />
      </div>
      <DataTable
        title="Tank gauges"
        subtitle="Live automatic tank gauging readings"
        columns={columns}
        rows={ATG_PROBES}
        searchKeys={['tankName', 'stationName']}
        searchPlaceholder="Search tanks…"
        selectable={false}
      />
    </div>
  );
}
