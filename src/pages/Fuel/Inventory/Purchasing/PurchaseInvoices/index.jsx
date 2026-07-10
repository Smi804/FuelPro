import ResourcePage from '../../../../../components/crud/ResourcePage.jsx';
import StatusBadge from '../../../../../components/crud/StatusBadge.jsx';
import { PI_STATUS } from '../../../../../data/mock/fuel.js';
import { SUPPLIERS } from '../../../../../data/mock/people.js';
import { productOptions, stationIdOptions } from '../../../../../data/options.js';

const columns = [
  { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="cell-strong">{r.invoiceNumber}</span> },
  { key: 'date', label: 'Date' },
  { key: 'supplierName', label: 'Supplier' },
  { key: 'productName', label: 'Product' },
  { key: 'quantity', label: 'Quantity', align: 'right', render: (r) => `${Number(r.quantity).toLocaleString()} L` },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => `$${Number(r.amount).toLocaleString()}`, exportValue: (r) => r.amount },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={PI_STATUS} />, exportValue: (r) => r.status }
];

const fields = [
  { name: 'invoiceNumber', label: 'Invoice number', required: true },
  { name: 'supplierName', label: 'Supplier', type: 'select', required: true, options: SUPPLIERS.map((s) => ({ value: s.name, label: s.name })) },
  { name: 'stationId', label: 'Station', type: 'select', required: true, options: stationIdOptions },
  { name: 'productName', label: 'Product', type: 'select', required: true, options: productOptions },
  { name: 'quantity', label: 'Quantity (L)', type: 'number', min: 0, required: true },
  { name: 'unitCost', label: 'Unit cost', type: 'number', min: 0, step: '0.01', required: true },
  { name: 'amount', label: 'Amount', type: 'number', derive: (vals) => ((Number(vals.quantity) || 0) * (Number(vals.unitCost) || 0)).toFixed(2) },
  { name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'draft', options: Object.entries(PI_STATUS).map(([value, m]) => ({ value, label: m.label })) },
  { name: 'date', label: 'Date', type: 'date', required: true }
];

export default function PurchaseInvoices() {
  const summary = (rows) => [
    { icon: 'receipt', tone: 'teal', label: 'Invoices', value: rows.length },
    { icon: 'wallet', tone: 'blue', label: 'Total Value', value: `$${rows.reduce((s, r) => s + Number(r.amount), 0).toLocaleString()}` },
    { icon: 'price', tone: 'red', label: 'Overdue', value: rows.filter((r) => r.status === 'overdue').length }
  ];
  return (
    <ResourcePage
      perm="purchase_invoices"
      pretitle="Fuel  "
      title="Purchase Invoices"
      data={[]}
      columns={columns}
      searchKeys={['invoiceNumber', 'supplierName', 'productName']}
      searchPlaceholder="Search invoices…"
      formFields={fields}
      addLabel="New invoice"
      exportName="purchase-invoices"
      summary={summary}
      filters={[{ label: 'Status', key: 'status', options: Object.entries(PI_STATUS).map(([value, m]) => ({ value, label: m.label })) }]}
    />
  );
}
