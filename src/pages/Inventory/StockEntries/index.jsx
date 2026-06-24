import ResourcePage from '../../../components/crud/ResourcePage.jsx';
import { STOCK_ENTRIES } from '../../../data/mock/inventory.js';
import { STATIONS } from '../../../data/mock/stations.js';
import { SUPPLIERS } from '../../../data/mock/people.js';
import { productOptions, stationIdOptions } from '../../../data/options.js';

const stationName = (id) => STATIONS.find((s) => s.id === id)?.name || id;

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'supplierName', label: 'Supplier' },
  { key: 'productName', label: 'Product' },
  { key: 'quantity', label: 'Quantity', align: 'right', render: (r) => `${Number(r.quantity).toLocaleString()} L` },
  { key: 'purchasePrice', label: 'Purchase price', align: 'right', render: (r) => `$${Number(r.purchasePrice).toFixed(2)}` },
  { key: 'invoiceNumber', label: 'Invoice #' },
  { key: 'stationId', label: 'Station', render: (r) => stationName(r.stationId), exportValue: (r) => stationName(r.stationId) }
];

const fields = [
  { name: 'supplierName', label: 'Supplier', type: 'select', required: true, options: SUPPLIERS.map((s) => ({ value: s.name, label: s.name })) },
  { name: 'productName', label: 'Product', type: 'select', required: true, options: productOptions },
  { name: 'quantity', label: 'Quantity (L)', type: 'number', min: 0, required: true },
  { name: 'purchasePrice', label: 'Purchase price', type: 'number', min: 0, step: '0.01', required: true },
  { name: 'invoiceNumber', label: 'Invoice number', required: true },
  { name: 'stationId', label: 'Station', type: 'select', required: true, options: stationIdOptions },
  { name: 'date', label: 'Date', type: 'date', required: true }
];

export default function StockEntries() {
  return (
    <ResourcePage
      perm="stock_entries"
      pretitle="Inventory"
      title="Stock Entries"
      data={STOCK_ENTRIES}
      columns={columns}
      searchKeys={['supplierName', 'productName', 'invoiceNumber']}
      searchPlaceholder="Search entries…"
      formFields={fields}
      addLabel="New entry"
      exportName="stock-entries"
      filters={[{ label: 'Station', key: 'stationId', options: stationIdOptions }]}
    />
  );
}
