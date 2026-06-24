import ResourcePage from '../../../components/crud/ResourcePage.jsx';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import { TANKS, TANK_STATUS } from '../../../data/mock/tanks.js';
import { FUEL_TYPE } from '../../../data/mock/products.js';
import { STATIONS } from '../../../data/mock/stations.js';
import { fuelTypeOptions, stationIdOptions } from '../../../data/options.js';

const stationName = (id) => STATIONS.find((s) => s.id === id)?.name || id;

const columns = [
  { key: 'name', label: 'Tank', render: (r) => <span className="cell-strong">{r.name}</span> },
  { key: 'stationId', label: 'Station', render: (r) => stationName(r.stationId), exportValue: (r) => stationName(r.stationId) },
  { key: 'fuelType', label: 'Fuel', render: (r) => <span className={`chip ${FUEL_TYPE[r.fuelType].cls}`}>{FUEL_TYPE[r.fuelType].label}</span>, exportValue: (r) => r.fuelType },
  { key: 'capacity', label: 'Capacity', align: 'right', render: (r) => `${Number(r.capacity).toLocaleString()} L` },
  { key: 'currentStock', label: 'Current stock', align: 'right', render: (r) => `${Number(r.currentStock).toLocaleString()} L` },
  { key: 'lowStockThreshold', label: 'Low threshold', align: 'right', render: (r) => `${Number(r.lowStockThreshold).toLocaleString()} L` },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={TANK_STATUS} />, exportValue: (r) => r.status }
];

const fields = [
  { name: 'name', label: 'Tank name', required: true },
  { name: 'stationId', label: 'Station', type: 'select', required: true, options: stationIdOptions },
  { name: 'fuelType', label: 'Fuel type', type: 'select', required: true, options: fuelTypeOptions },
  { name: 'capacity', label: 'Capacity (L)', type: 'number', min: 0, required: true },
  { name: 'currentStock', label: 'Current stock (L)', type: 'number', min: 0, required: true },
  { name: 'lowStockThreshold', label: 'Low stock threshold (L)', type: 'number', min: 0, required: true }
];

export default function Tanks() {
  const summary = (rows) => [
    { icon: 'inventory', tone: 'teal', label: 'Total Tanks', value: rows.length },
    { icon: 'fuel', tone: 'blue', label: 'Total Capacity', value: `${(rows.reduce((s, r) => s + Number(r.capacity), 0) / 1000).toFixed(0)}k L` },
    { icon: 'fuel', tone: 'green', label: 'In Stock', value: `${(rows.reduce((s, r) => s + Number(r.currentStock), 0) / 1000).toFixed(1)}k L` },
    { icon: 'bell', tone: 'red', label: 'Low / Critical', value: rows.filter((r) => r.status !== 'ok').length }
  ];
  return (
    <ResourcePage
      perm="tanks"
      pretitle="Inventory"
      title="Tanks"
      data={TANKS}
      columns={columns}
      searchKeys={['name']}
      searchPlaceholder="Search tanks…"
      formFields={fields}
      addLabel="Add tank"
      exportName="tanks"
      summary={summary}
      filters={[{ label: 'Station', key: 'stationId', options: stationIdOptions }, { label: 'Status', key: 'status', options: Object.entries(TANK_STATUS).map(([value, m]) => ({ value, label: m.label })) }]}
    />
  );
}
