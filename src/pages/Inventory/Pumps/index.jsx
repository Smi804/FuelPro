import ResourcePage from '../../../components/crud/ResourcePage.jsx';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import { PUMPS, PUMP_STATUS } from '../../../data/mock/pumps.js';
import { FUEL_TYPE } from '../../../data/mock/products.js';
import { TANKS } from '../../../data/mock/tanks.js';
import { STATIONS } from '../../../data/mock/stations.js';
import { fuelTypeOptions, stationIdOptions } from '../../../data/options.js';

const stationName = (id) => STATIONS.find((s) => s.id === id)?.name || id;

const columns = [
  { key: 'pumpNumber', label: 'Pump #', render: (r) => <span className="cell-strong">{r.pumpNumber}</span> },
  { key: 'stationId', label: 'Station', render: (r) => stationName(r.stationId), exportValue: (r) => stationName(r.stationId) },
  { key: 'fuelType', label: 'Fuel', render: (r) => <span className={`chip ${FUEL_TYPE[r.fuelType].cls}`}>{FUEL_TYPE[r.fuelType].label}</span>, exportValue: (r) => r.fuelType },
  { key: 'tankName', label: 'Assigned tank' },
  { key: 'currentReading', label: 'Current reading', align: 'right', render: (r) => Number(r.currentReading).toLocaleString() },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={PUMP_STATUS} />, exportValue: (r) => r.status }
];

const fields = [
  { name: 'pumpNumber', label: 'Pump number', required: true },
  { name: 'stationId', label: 'Station', type: 'select', required: true, options: stationIdOptions },
  { name: 'fuelType', label: 'Fuel type', type: 'select', required: true, options: fuelTypeOptions },
  { name: 'tankName', label: 'Assigned tank', type: 'select', required: true, options: TANKS.map((t) => ({ value: t.name, label: `${t.name} (${t.fuelType})` })) },
  { name: 'currentReading', label: 'Current reading', type: 'number', min: 0, defaultValue: 0 },
  { name: 'status', label: 'Status', type: 'select', required: true, options: Object.entries(PUMP_STATUS).map(([value, m]) => ({ value, label: m.label })) }
];

export default function Pumps() {
  return (
    <ResourcePage
      perm="pumps"
      pretitle="Inventory"
      title="Pumps"
      data={PUMPS}
      columns={columns}
      searchKeys={['pumpNumber', 'tankName']}
      searchPlaceholder="Search pumps…"
      formFields={fields}
      addLabel="Add pump"
      exportName="pumps"
      filters={[{ label: 'Station', key: 'stationId', options: stationIdOptions }, { label: 'Status', key: 'status', options: Object.entries(PUMP_STATUS).map(([value, m]) => ({ value, label: m.label })) }]}
    />
  );
}
