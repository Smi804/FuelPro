import { useMemo, useState } from 'react';
import PageHeader from '../../../components/PageHeader.jsx';
import DataTable from '../../../components/crud/DataTable.jsx';
import FilterBar from '../../../components/crud/FilterBar.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import ChartCard from '../../../components/crud/ChartCard.jsx';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import ExportButtons from '../../../components/crud/ExportButtons.jsx';
import { AreaChart } from '../../../components/MiniCharts.jsx';
import Can from '../../../auth/Can.jsx';
import { SALES, PAYMENT_STATUS, DAILY_SALES } from '../../../data/mock/sales.js';
import { STATIONS } from '../../../data/mock/stations.js';
import { stationIdOptions } from '../../../data/options.js';

const columns = [
  { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="cell-strong">{r.invoiceNumber}</span> },
  { key: 'date', label: 'Date' },
  { key: 'stationName', label: 'Station' },
  { key: 'productName', label: 'Fuel product' },
  { key: 'quantity', label: 'Litres', align: 'right', render: (r) => `${r.quantity} L` },
  { key: 'unitPrice', label: 'Unit price', align: 'right', render: (r) => `$${r.unitPrice.toFixed(2)}` },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => `$${r.amount.toFixed(2)}`, exportValue: (r) => r.amount },
  { key: 'paymentStatus', label: 'Status', render: (r) => <StatusBadge value={r.paymentStatus} map={PAYMENT_STATUS} />, exportValue: (r) => r.paymentStatus }
];

export default function FuelSales() {
  const [stationId, setStationId] = useState('');
  const rows = useMemo(() => SALES.filter((s) => !stationId || s.stationId === stationId), [stationId]);

  const litres = rows.reduce((s, r) => s + r.quantity, 0);
  const revenue = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Fuel"
        title="Fuel Sales"
        actions={
          <Can perm="fuel_sales:export">
            <ExportButtons columns={columns} rows={rows} filename="fuel-sales" />
          </Can>
        }
      />
      <div className="row col-3">
        <SummaryCard icon="receipt" tone="teal" label="Fuel Revenue" value={`$${revenue.toFixed(0)}`} subtext={`${rows.length} fills`} />
        <SummaryCard icon="fuel" tone="blue" label="Litres Sold" value={`${litres.toFixed(0)} L`} />
        <SummaryCard icon="price" tone="green" label="Avg / Fill" value={`$${rows.length ? (revenue / rows.length).toFixed(2) : '0.00'}`} />
      </div>
      <div className="row col-1">
        <ChartCard title="Fuel sales trend" subtitle="Litres dispensed per day">
          <AreaChart points={DAILY_SALES} id="fuel-sales" />
        </ChartCard>
      </div>
      <FilterBar
        filters={[
          { label: 'Station', value: stationId, onChange: setStationId, options: stationIdOptions }
        ]}
      />
      <DataTable
        title="Fuel sales"
        columns={columns}
        rows={rows}
        searchKeys={['invoiceNumber', 'productName', 'stationName']}
        searchPlaceholder="Search fuel sales…"
        selectable={false}
      />
    </div>
  );
}
