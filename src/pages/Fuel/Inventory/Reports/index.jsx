import PageHeader from '../../../../components/PageHeader.jsx';
import DataTable from '../../../../components/crud/DataTable.jsx';
import SummaryCard from '../../../../components/crud/SummaryCard.jsx';
import ChartCard from '../../../../components/crud/ChartCard.jsx';
import ExportButtons from '../../../../components/crud/ExportButtons.jsx';
import { AreaChart } from '../../../../components/MiniCharts.jsx';
import Can from '../../../../auth/Can.jsx';
import { STOCK_ENTRIES } from '../../../../data/mock/inventory.js';
import { FUEL_CONSUMPTION } from '../../../../data/mock/sales.js';
import { STATIONS } from '../../../../data/mock/stations.js';

const stationName = (id) => STATIONS.find((s) => s.id === id)?.name || id;

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'productName', label: 'Product' },
  { key: 'stationId', label: 'Station', render: (r) => stationName(r.stationId), exportValue: (r) => stationName(r.stationId) },
  { key: 'quantity', label: 'Received', align: 'right', render: (r) => `${r.quantity.toLocaleString()} L` },
  { key: 'supplierName', label: 'Supplier' }
];

export default function FuelInventoryReports() {
  const received = STOCK_ENTRIES.reduce((s, e) => s + e.quantity, 0);
  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Fuel · Inventory"
        title="Reports"
        actions={
          <Can perm="fuel_inventory:export">
            <ExportButtons columns={columns} rows={STOCK_ENTRIES} filename="fuel-inventory-report" />
          </Can>
        }
      />
      <div className="row col-3">
        <SummaryCard icon="inventory" tone="teal" label="Fuel Received" value={`${(received / 1000).toFixed(0)}k L`} />
        <SummaryCard icon="truck" tone="blue" label="Deliveries" value={STOCK_ENTRIES.length} />
        <SummaryCard icon="fuel" tone="green" label="Suppliers" value={new Set(STOCK_ENTRIES.map((e) => e.supplierName)).size} />
      </div>
      <div className="row col-1">
        <ChartCard title="Fuel consumption" subtitle="Litres dispensed">
          <AreaChart points={FUEL_CONSUMPTION} id="fuel-inv-rep" color="var(--yellow)" />
        </ChartCard>
      </div>
      <DataTable title="Stock movement" columns={columns} rows={STOCK_ENTRIES} searchKeys={['productName', 'supplierName']} selectable={false} enableColumnToggle={false} />
    </div>
  );
}
