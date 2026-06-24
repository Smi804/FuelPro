import DataTable from '../../../components/crud/DataTable.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import ChartCard from '../../../components/crud/ChartCard.jsx';
import { AreaChart } from '../../../components/MiniCharts.jsx';
import { PUMPS, PUMP_STATUS } from '../../../data/mock/pumps.js';
import { TANKS, TANK_STATUS } from '../../../data/mock/tanks.js';
import { EMPLOYEES, EMPLOYEE_STATUS } from '../../../data/mock/people.js';
import { SALES, PAYMENT_STATUS, DAILY_SALES } from '../../../data/mock/sales.js';
import { STOCK_ENTRIES } from '../../../data/mock/inventory.js';
import { FUEL_TYPE } from '../../../data/mock/products.js';
import { ROLE_LABEL } from '../../../domain/roles.js';

const fuelChip = (t) => <span className={`chip ${FUEL_TYPE[t].cls}`}>{FUEL_TYPE[t].label}</span>;

export function OverviewTab({ station }) {
  return (
    <>
      <div className="row col-4">
        <SummaryCard icon="fuel" tone="teal" label="Pumps" value={station.pumpCount} />
        <SummaryCard icon="inventory" tone="blue" label="Tanks" value={station.tankCount} />
        <SummaryCard icon="profile" tone="green" label="Employees" value={station.employeeCount} />
        <SummaryCard icon="price" tone="yellow" label="Fuel Stock" value={`${station.fuelStockPct}%`} />
      </div>
      <div className="row col-8-4">
        <ChartCard title="Sales trend" subtitle="Last 14 days">
          <AreaChart points={DAILY_SALES} id={`st-${station.id}`} />
        </ChartCard>
        <div className="card">
          <div className="card-header"><div className="card-title">Station info</div></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13 }}>
            <Info label="Address" value={`${station.address}, ${station.city}`} />
            <Info label="Manager" value={station.managerName} />
            <Info label="Status" value={<StatusBadge value={station.status} map={{ active: { label: 'Active', cls: 'status-green' }, maintenance: { label: 'Maintenance', cls: 'status-yellow' }, inactive: { label: 'Inactive', cls: 'status-red' } }} />} />
            <Info label="Opened" value={station.createdAt} />
          </div>
        </div>
      </div>
    </>
  );
}

const Info = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
    <span style={{ color: 'var(--text-muted)' }}>{label}</span>
    <span className="cell-strong" style={{ textAlign: 'right' }}>{value}</span>
  </div>
);

export function PumpsTab({ station }) {
  const rows = PUMPS.filter((p) => p.stationId === station.id);
  return (
    <DataTable
      title="Pumps"
      rows={rows}
      searchKeys={['pumpNumber', 'tankName']}
      selectable={false}
      enableColumnToggle={false}
      columns={[
        { key: 'pumpNumber', label: 'Pump #' },
        { key: 'fuelType', label: 'Fuel', render: (r) => fuelChip(r.fuelType) },
        { key: 'tankName', label: 'Tank' },
        { key: 'currentReading', label: 'Reading', align: 'right', render: (r) => r.currentReading.toLocaleString() },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={PUMP_STATUS} /> }
      ]}
    />
  );
}

export function TanksTab({ station }) {
  const rows = TANKS.filter((t) => t.stationId === station.id);
  return (
    <DataTable
      title="Tanks"
      rows={rows}
      searchKeys={['name']}
      selectable={false}
      enableColumnToggle={false}
      columns={[
        { key: 'name', label: 'Tank' },
        { key: 'fuelType', label: 'Fuel', render: (r) => fuelChip(r.fuelType) },
        { key: 'capacity', label: 'Capacity', align: 'right', render: (r) => `${r.capacity.toLocaleString()} L` },
        { key: 'currentStock', label: 'Current', align: 'right', render: (r) => `${r.currentStock.toLocaleString()} L` },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={TANK_STATUS} /> }
      ]}
    />
  );
}

export function EmployeesTab({ station }) {
  const rows = EMPLOYEES.filter((e) => e.stationId === station.id);
  return (
    <DataTable
      title="Employees"
      rows={rows}
      searchKeys={['name', 'email']}
      selectable={false}
      enableColumnToggle={false}
      columns={[
        { key: 'name', label: 'Name', render: (r) => <span className="cell-strong">{r.name}</span> },
        { key: 'role', label: 'Role', render: (r) => ROLE_LABEL[r.role] },
        { key: 'phone', label: 'Phone' },
        { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={EMPLOYEE_STATUS} /> }
      ]}
    />
  );
}

export function InventoryTab({ station }) {
  const rows = STOCK_ENTRIES.filter((s) => s.stationId === station.id);
  return (
    <DataTable
      title="Recent stock entries"
      rows={rows}
      searchKeys={['productName', 'supplierName', 'invoiceNumber']}
      selectable={false}
      enableColumnToggle={false}
      emptyText="No stock entries for this station."
      columns={[
        { key: 'date', label: 'Date' },
        { key: 'supplierName', label: 'Supplier' },
        { key: 'productName', label: 'Product' },
        { key: 'quantity', label: 'Quantity', align: 'right', render: (r) => `${r.quantity.toLocaleString()} L` },
        { key: 'invoiceNumber', label: 'Invoice' }
      ]}
    />
  );
}

export function SalesTab({ station }) {
  const rows = SALES.filter((s) => s.stationId === station.id);
  return (
    <DataTable
      title="Sales"
      rows={rows}
      searchKeys={['invoiceNumber', 'customerName', 'productName']}
      selectable={false}
      enableColumnToggle={false}
      columns={[
        { key: 'invoiceNumber', label: 'Invoice' },
        { key: 'date', label: 'Date' },
        { key: 'customerName', label: 'Customer' },
        { key: 'productName', label: 'Product' },
        { key: 'amount', label: 'Amount', align: 'right', render: (r) => `$${r.amount.toFixed(2)}` },
        { key: 'paymentStatus', label: 'Payment', render: (r) => <StatusBadge value={r.paymentStatus} map={PAYMENT_STATUS} /> }
      ]}
    />
  );
}

export function ReportsTab({ station }) {
  return (
    <div className="row col-2">
      <ChartCard title="Fuel consumption" subtitle="Litres dispensed">
        <AreaChart points={DAILY_SALES} id={`rep-${station.id}`} color="var(--yellow)" />
      </ChartCard>
      <ChartCard title="Revenue" subtitle="Daily revenue (€)">
        <AreaChart points={DAILY_SALES.map((d) => d * 1.4)} id={`rev-${station.id}`} color="var(--green)" />
      </ChartCard>
    </div>
  );
}

export function SettingsTab({ station }) {
  return (
    <div className="card" style={{ maxWidth: 560 }}>
      <div className="card-header"><div className="card-title">Station settings</div></div>
      <div className="card-body">
        <div className="form-group">
          <label className="form-label">Station name</label>
          <input className="form-control" defaultValue={station.name} />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">City</label>
            <input className="form-control" defaultValue={station.city} />
          </div>
          <div className="form-group">
            <label className="form-label">Manager</label>
            <input className="form-control" defaultValue={station.managerName} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Address</label>
          <input className="form-control" defaultValue={station.address} />
        </div>
        <button className="btn btn-primary">Save changes</button>
      </div>
    </div>
  );
}
