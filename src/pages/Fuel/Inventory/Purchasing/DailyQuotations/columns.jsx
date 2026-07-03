const dash = (v) => (v ? v : <span style={{ color: 'var(--text-muted)' }}>—</span>);
const fmtPrice = (n) => (n != null && n !== '' ? Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : '—');

export const quotationColumns = [
  { key: 'date', label: 'Date', render: (r) => <span className="cell-strong">{r.date}</span> },
  { key: 'supplier', label: 'Supplier', render: (r) => r.supplier || <span style={{ color: 'var(--text-muted)' }}>—</span> },
  { key: 'items_count', label: 'Items', align: 'right' },
  {
    key: 'remarks',
    label: 'Remarks',
    render: (r) => dash(r.remarks),
    exportValue: (r) => r.remarks || ''
  }
];

export function quotationLineColumns() {
  return [
    { key: 'item_name', label: 'Item', render: (r) => <span className="cell-strong">{r.item_name || `Item #${r.item_id}`}</span> },
    { key: 'item_sku', label: 'SKU', render: (r) => dash(r.item_sku) },
    { key: 'price', label: 'Quoted price', align: 'right', render: (r) => fmtPrice(r.price) }
  ];
}
