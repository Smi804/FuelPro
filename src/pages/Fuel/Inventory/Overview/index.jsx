import PageHeader from '../../../../components/PageHeader.jsx';
import DataTable from '../../../../components/crud/DataTable.jsx';
import SummaryCard from '../../../../components/crud/SummaryCard.jsx';
import ChartCard from '../../../../components/crud/ChartCard.jsx';
import StatusBadge from '../../../../components/crud/StatusBadge.jsx';
import { Bars } from '../../../../components/MiniCharts.jsx';
import { TANKS, TANK_STATUS } from '../../../../data/mock/tanks.js';
import { FUEL_TYPE } from '../../../../data/mock/products.js';
import { STATIONS } from '../../../../data/mock/stations.js';

const stationName = (id) => STATIONS.find((s) => s.id === id)?.name || id;

const columns = [
  { key: 'name', label: 'Tank', render: (r) => <span className="cell-strong">{r.name}</span> },
  { key: 'stationId', label: 'Station', render: (r) => stationName(r.stationId), exportValue: (r) => stationName(r.stationId) },
  { key: 'fuelType', label: 'Fuel', render: (r) => <span className={`chip ${FUEL_TYPE[r.fuelType].cls}`}>{FUEL_TYPE[r.fuelType].label}</span> },
  { key: 'currentStock', label: 'Current', align: 'right', render: (r) => `${r.currentStock.toLocaleString()} L` },
  { key: 'capacity', label: 'Capacity', align: 'right', render: (r) => `${r.capacity.toLocaleString()} L` },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={TANK_STATUS} /> }
];

export default function FuelInventoryOverview() {
  const totalCap = TANKS.reduce((s, t) => s + t.capacity, 0);
  const totalStock = TANKS.reduce((s, t) => s + t.currentStock, 0);
  const low = TANKS.filter((t) => t.status !== 'ok').length;

  return (
    <div className="page-wrapper">
      <PageHeader pretitle="Fuel  Inventory" title="Overview" />
      <div className="row col-4">
        <SummaryCard icon="inventory" tone="teal" label="Tanks" value={TANKS.length} />
        <SummaryCard icon="fuel" tone="blue" label="Total Capacity" value={`${(totalCap / 1000).toFixed(0)}k L`} />
        <SummaryCard icon="fuel" tone="green" label="In Stock" value={`${(totalStock / 1000).toFixed(1)}k L`} subtext={`${Math.round((totalStock / totalCap) * 100)}% full`} />
        <SummaryCard icon="bell" tone="red" label="Low / Critical" value={low} />
      </div>
      <div className="row col-1">
        <ChartCard title="Stock level by tank" subtitle="% of capacity">
          <Bars data={TANKS.map((t) => Math.round((t.currentStock / t.capacity) * 100))} color="var(--primary)" />
        </ChartCard>
      </div>
      <DataTable title="Fuel stock by tank" columns={columns} rows={TANKS} searchKeys={['name']} selectable={false} enableColumnToggle={false} />
    </div>
  );
}
