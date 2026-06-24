import { useState } from 'react';
import PageHeader from '../../../components/PageHeader.jsx';
import DataTable from '../../../components/crud/DataTable.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import ExportButtons from '../../../components/crud/ExportButtons.jsx';
import Can from '../../../auth/Can.jsx';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { showToast } from '../../../v4/toast.js';
import { SALES, PAYMENT_STATUS } from '../../../data/mock/sales.js';

export default function Invoices() {
  const { can } = useAuth();
  const [rows, setRows] = useState(SALES);

  const markPaid = (id) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, paymentStatus: 'paid' } : r)));
    showToast('Invoice marked as paid', { variant: 'success' });
  };

  const columns = [
    { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="cell-strong">{r.invoiceNumber}</span> },
    { key: 'date', label: 'Date' },
    { key: 'customerName', label: 'Customer' },
    { key: 'stationName', label: 'Station' },
    { key: 'amount', label: 'Amount', align: 'right', render: (r) => `$${r.amount.toFixed(2)}`, exportValue: (r) => r.amount },
    { key: 'paymentStatus', label: 'Status', render: (r) => <StatusBadge value={r.paymentStatus} map={PAYMENT_STATUS} />, exportValue: (r) => r.paymentStatus }
  ];

  const outstanding = rows.filter((r) => r.paymentStatus !== 'paid');

  const rowActions = (row) => {
    const items = [];
    if (can('invoices:approve') && row.paymentStatus !== 'paid') items.push({ label: 'Mark as paid', onClick: () => markPaid(row.id) });
    items.push({ label: 'Download PDF', onClick: () => window.print() });
    return items;
  };

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Sales"
        title="Invoices"
        actions={
          <Can perm="invoices:export">
            <ExportButtons columns={columns} rows={rows} filename="invoices" />
          </Can>
        }
      />
      <div className="row col-3">
        <SummaryCard icon="receipt" tone="teal" label="Total Invoices" value={rows.length} />
        <SummaryCard icon="price" tone="red" label="Outstanding" value={`$${outstanding.reduce((s, r) => s + r.amount, 0).toFixed(0)}`} subtext={`${outstanding.length} unpaid`} />
        <SummaryCard icon="wallet" tone="green" label="Collected" value={`$${rows.filter((r) => r.paymentStatus === 'paid').reduce((s, r) => s + r.amount, 0).toFixed(0)}`} />
      </div>
      <DataTable
        title="All invoices"
        columns={columns}
        rows={rows}
        searchKeys={['invoiceNumber', 'customerName']}
        searchPlaceholder="Search invoices…"
        selectable={false}
        rowActions={rowActions}
      />
    </div>
  );
}
