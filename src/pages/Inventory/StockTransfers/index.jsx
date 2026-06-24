import ResourcePage from '../../../components/crud/ResourcePage.jsx';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import { STOCK_TRANSFERS, TRANSFER_STATUS } from '../../../data/mock/inventory.js';
import { productOptions, stationOptions } from '../../../data/options.js';

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'fromStationName', label: 'From' },
  { key: 'toStationName', label: 'To' },
  { key: 'productName', label: 'Product' },
  { key: 'quantity', label: 'Quantity', align: 'right', render: (r) => `${Number(r.quantity).toLocaleString()} L` },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={TRANSFER_STATUS} />, exportValue: (r) => r.status }
];

const fields = [
  { name: 'fromStationName', label: 'From station', type: 'select', required: true, options: stationOptions },
  { name: 'toStationName', label: 'To station', type: 'select', required: true, options: stationOptions, validate: (v, vals) => (v && v === vals.fromStationName ? 'Must differ from source' : null) },
  { name: 'productName', label: 'Product', type: 'select', required: true, options: productOptions },
  { name: 'quantity', label: 'Quantity (L)', type: 'number', min: 0, required: true },
  { name: 'status', label: 'Status', type: 'select', required: true, options: Object.entries(TRANSFER_STATUS).map(([value, m]) => ({ value, label: m.label })) },
  { name: 'notes', label: 'Notes', type: 'textarea', span: 2 }
];

export default function StockTransfers() {
  return (
    <ResourcePage
      perm="stock_transfers"
      pretitle="Inventory"
      title="Stock Transfers"
      data={STOCK_TRANSFERS}
      columns={columns}
      searchKeys={['fromStationName', 'toStationName', 'productName']}
      searchPlaceholder="Search transfers…"
      formFields={fields}
      addLabel="New transfer"
      exportName="stock-transfers"
      filters={[{ label: 'Status', key: 'status', options: Object.entries(TRANSFER_STATUS).map(([value, m]) => ({ value, label: m.label })) }]}
    />
  );
}
