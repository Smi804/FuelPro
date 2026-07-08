import StatusBadge from '../../../components/crud/StatusBadge.jsx';

export const ACTIVE_STATUS = {
  1: { label: 'Active', cls: 'status-green' },
  0: { label: 'Inactive', cls: 'status-red' }
};

export const ITEM_TYPE = {
  FUEL: { label: 'Fuel', cls: 'status-blue' },
  RETAIL: { label: 'Retail', cls: 'status-yellow' }
};

export const STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' }
];

export const TYPE_OPTIONS = [
  { value: 'FUEL', label: 'Fuel' },
  { value: 'RETAIL', label: 'Retail' }
];

const dash = (v) => (v ? v : <span style={{ color: 'var(--text-muted)' }}>—</span>);

export const itemColumns = [
  {
    key: 'name',
    label: 'Name',
    render: (r) => (
      <span className="cell-strong" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {r.image_url && <img src={r.image_url} alt="" style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover' }} />}
        {r.name}
      </span>
    ),
    exportValue: (r) => r.name
  },
  { key: 'type', label: 'Type', render: (r) => <StatusBadge value={r.type} map={ITEM_TYPE} />, exportValue: (r) => r.type },
  // { key: 'sku', label: 'SKU', render: (r) => dash(r.sku), exportValue: (r) => r.sku || '' },
  // { key: 'category_name', label: 'Category', sortable: false, render: (r) => dash(r.category_name), exportValue: (r) => r.category_name || '' },
  { key: 'station_name', label: 'Station', sortable: false, render: (r) => dash(r.station_name), exportValue: (r) => r.station_name || '' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={ACTIVE_STATUS} />, exportValue: (r) => (r.status ? 'Active' : 'Inactive') }
];

/**
 * Create/edit fields. The item is scoped to the station selected in the topbar
 * (sent automatically), so there's no station picker here. Brand options are
 * injected at call time. `sku` is required only when the type is RETAIL.
 */
export const itemFields = ({ brands = [] } = {}) => [
  { name: 'name', label: 'Item name', required: true, span: 2 },
  { name: 'type', label: 'Type', type: 'select', options: TYPE_OPTIONS, required: true, defaultValue: 'FUEL' },
  {
    name: 'sku',
    label: 'SKU',
    placeholder: 'e.g. EO-1L-001',
    validate: (v, values) => (values.type === 'RETAIL' && !v ? 'SKU is required for retail items' : null)
  },
  { name: 'barcode', label: 'Barcode' },
  { name: 'brand_id', label: 'Brand', type: 'select', options: brands },
  { name: 'category_id', label: 'Category ID', type: 'number', min: 0, hint: 'Optional category reference' },
  { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, defaultValue: '1' },
  { name: 'image_url', label: 'Image URL', span: 2, placeholder: 'https://…' },
  { name: 'description', label: 'Description', type: 'textarea', span: 2 }
];
