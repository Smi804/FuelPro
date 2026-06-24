import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';
import DataTable from '../../../components/crud/DataTable.jsx';
import FilterBar from '../../../components/crud/FilterBar.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import ExportButtons from '../../../components/crud/ExportButtons.jsx';
import Can from '../../../auth/Can.jsx';
import { SALES, PAYMENT_STATUS, PAYMENT_METHOD } from '../../../data/mock/sales.js';
import { STATIONS } from '../../../data/mock/stations.js';

const columns = [
  { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="cell-strong">{r.invoiceNumber}</span> },
  { key: 'date', label: 'Date' },
  { key: 'stationName', label: 'Station' },
  { key: 'customerName', label: 'Customer' },
  { key: 'quantity', label: 'Quantity', align: 'right', render: (r) => `${r.quantity} L`, exportValue: (r) => r.quantity },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => `$${r.amount.toFixed(2)}`, exportValue: (r) => r.amount },
  { key: 'paymentMethod', label: 'Method', render: (r) => PAYMENT_METHOD[r.paymentMethod] },
  { key: 'paymentStatus', label: 'Status', render: (r) => <StatusBadge value={r.paymentStatus} map={PAYMENT_STATUS} />, exportValue: (r) => r.paymentStatus }
];

export default function SalesList() {
  const [filters, setFilters] = useState({ stationId: '', paymentStatus: '' });

  const rows = useMemo(
    () =>
      SALES.filter(
        (s) =>
          (!filters.stationId || s.stationId === filters.stationId) &&
          (!filters.paymentStatus || s.paymentStatus === filters.paymentStatus)
      ),
    [filters]
  );

  const total = rows.reduce((s, r) => s + r.amount, 0);
  const credit = rows.filter((r) => r.paymentMethod === 'credit').reduce((s, r) => s + r.amount, 0);
  const pending = rows.filter((r) => r.paymentStatus !== 'paid').reduce((s, r) => s + r.amount, 0);

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Sales"
        title="Sales List"
        actions={
          <>
            <Can perm="sales:export">
              <ExportButtons columns={columns} rows={rows} filename="sales" />
            </Can>
            <Can perm="sales:create">
              <Link to="/sales/new" className="btn btn-primary">
                <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 8h8M8 4v8" />
                </svg>
                New Sale
              </Link>
            </Can>
          </>
        }
      />

      <div className="row col-3">
        <SummaryCard icon="receipt" tone="teal" label="Total Sales" value={`$${total.toFixed(0)}`} subtext={`${rows.length} transactions`} />
        <SummaryCard icon="tag" tone="yellow" label="Credit Sales" value={`$${credit.toFixed(0)}`} />
        <SummaryCard icon="price" tone="red" label="Outstanding" value={`$${pending.toFixed(0)}`} />
      </div>

      <FilterBar
        filters={[
          {
            label: 'Station',
            value: filters.stationId,
            onChange: (v) => setFilters((f) => ({ ...f, stationId: v })),
            options: STATIONS.map((s) => ({ value: s.id, label: s.name }))
          },
          {
            label: 'Status',
            value: filters.paymentStatus,
            onChange: (v) => setFilters((f) => ({ ...f, paymentStatus: v })),
            options: Object.entries(PAYMENT_STATUS).map(([value, m]) => ({ value, label: m.label }))
          }
        ]}
      />

      <DataTable
        title="All sales"
        columns={columns}
        rows={rows}
        searchKeys={['invoiceNumber', 'customerName', 'productName']}
        searchPlaceholder="Search invoices…"
        selectable={false}
      />
    </div>
  );
}
