const dash = (v) => (v ? v : <span style={{ color: 'var(--text-muted)' }}>—</span>);
const fmtPrice = (n) => (n != null && n !== '' ? Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '—');

export const taxColumns = [
  { key: 'code', label: 'Code', render: (r) => <span className="cell-strong">{r.code}</span>, exportValue: (r) => r.code },
  { key: 'description', label: 'Description', render: (r) => dash(r.description), exportValue: (r) => r.description || '' },
  {
    key: 'price',
    label: 'Rate / amount',
    align: 'right',
    render: (r) => fmtPrice(r.price),
    exportValue: (r) => (r.price != null ? Number(r.price) : '')
  }
];

export const taxFields = [
  { name: 'code', label: 'Code', required: true, placeholder: 'e.g. GST', validate: (v) => (v && v.length > 50 ? 'Code is too long' : null) },
  { name: 'description', label: 'Description', type: 'textarea', span: 2, placeholder: 'Optional' },
  {
    name: 'price',
    label: 'Rate / amount',
    type: 'number',
    required: true,
    min: 0,
    step: '0.0001',
    validate: (v) => (v !== '' && v != null && Number(v) < 0 ? 'Must be zero or greater' : null)
  }
];
