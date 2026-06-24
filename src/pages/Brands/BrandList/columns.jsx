import StatusBadge from '../../../components/crud/StatusBadge.jsx';

export const ACTIVE_STATUS = {
  1: { label: 'Active', cls: 'status-green' },
  0: { label: 'Inactive', cls: 'status-red' }
};

export const STATUS_OPTIONS = [
  { value: '1', label: 'Active' },
  { value: '0', label: 'Inactive' }
];

const dash = (v) => (v ? v : <span style={{ color: 'var(--text-muted)' }}>—</span>);

export const brandColumns = [
  {
    key: 'name',
    label: 'Name',
    render: (r) => (
      <span className="cell-strong" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {r.image_url && (
          <img src={r.image_url} alt="" style={{ width: 22, height: 22, borderRadius: 4, objectFit: 'cover' }} />
        )}
        {r.name}
      </span>
    ),
    exportValue: (r) => r.name
  },
  { key: 'description', label: 'Description', render: (r) => dash(r.description), exportValue: (r) => r.description || '' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={ACTIVE_STATUS} />, exportValue: (r) => (r.status ? 'Active' : 'Inactive') }
];

export const brandFields = [
  { name: 'name', label: 'Brand name', required: true, span: 2, validate: (v) => (v && v.length > 255 ? 'Name is too long' : null) },
  { name: 'status', label: 'Status', type: 'select', options: STATUS_OPTIONS, defaultValue: '1' },
  { name: 'image_url', label: 'Image URL', placeholder: 'https://…' },
  { name: 'description', label: 'Description', type: 'textarea', span: 2 }
];
