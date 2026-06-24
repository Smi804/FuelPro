import ReportLayout from '../ReportLayout.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import ChartCard from '../../../components/crud/ChartCard.jsx';
import { Bars } from '../../../components/MiniCharts.jsx';
import { TANKS } from '../../../data/mock/tanks.js';
import { STATIONS } from '../../../data/mock/stations.js';

const stationName = (id) => STATIONS.find((s) => s.id === id)?.name || id;

const columns = [
  { key: 'name', label: 'Tank' },
  { key: 'stationId', label: 'Station', render: (r) => stationName(r.stationId), exportValue: (r) => stationName(r.stationId) },
  { key: 'fuelType', label: 'Fuel' },
  { key: 'capacity', label: 'Capacity (L)', align: 'right', render: (r) => r.capacity.toLocaleString() },
  { key: 'currentStock', label: 'Current (L)', align: 'right', render: (r) => r.currentStock.toLocaleString() }
];

export default function InventoryReports() {
  const totalCap = TANKS.reduce((s, t) => s + t.capacity, 0);
  const totalStock = TANKS.reduce((s, t) => s + t.currentStock, 0);
  return (
    <ReportLayout
      title="Inventory Reports"
      exportName="inventory-report"
      summary={
        <>
          <SummaryCard icon="inventory" tone="teal" label="Total Capacity" value={`${(totalCap / 1000).toFixed(0)}k L`} />
          <SummaryCard icon="fuel" tone="blue" label="In Stock" value={`${(totalStock / 1000).toFixed(1)}k L`} />
          <SummaryCard icon="bell" tone="red" label="Low Tanks" value={TANKS.filter((t) => t.status !== 'ok').length} />
        </>
      }
      chart={
        <div className="row col-1">
          <ChartCard title="Stock level by tank" subtitle="% of capacity">
            <Bars data={TANKS.map((t) => Math.round((t.currentStock / t.capacity) * 100))} color="var(--blue)" />
          </ChartCard>
        </div>
      }
      columns={columns}
      rows={TANKS}
    />
  );
}
