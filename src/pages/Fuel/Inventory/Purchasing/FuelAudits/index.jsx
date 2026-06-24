import ResourcePage from '../../../../../components/crud/ResourcePage.jsx';
import { FUEL_AUDITS } from '../../../../../data/mock/fuel.js';

const fmtL = (n) => `${Number(n).toLocaleString()} L`;
const fmtMoney = (n) => `€${Number(n).toLocaleString()}`;

// True when the source figure matches the invoice figure within tolerance
// (0.5%, with a small absolute floor so tiny invoices don't read as failures).
const isMatch = (inv, src, unit) => {
  const tol = Math.max(Math.abs(inv) * 0.005, unit === 'L' ? 5 : 1);
  return Math.abs(src - inv) <= tol;
};

/** Compact invoice-vs-source comparison cell with a match/diff pill. */
function AuditCell({ data, unit }) {
  if (!data) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
  const { inv, src } = data;
  const fmt = unit === 'L' ? fmtL : fmtMoney;
  const ok = isMatch(inv, src, unit);
  const diff = +(src - inv).toFixed(2);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 124 }}>
      <span style={{ fontSize: 12 }}>
        <strong>{fmt(inv)}</strong> <span style={{ color: 'var(--text-muted)' }}>vs</span> {fmt(src)}
      </span>
      <span className={'status ' + (ok ? 'status-green' : 'status-red')} style={{ width: 'fit-content' }}>
        {ok ? 'Match' : `${diff > 0 ? '+' : ''}${fmt(diff)}`}
      </span>
    </div>
  );
}

const auditCol = (key, label, unit) => ({
  key,
  label,
  sortable: false,
  render: (r) => <AuditCell data={r[key]} unit={unit} />,
  exportValue: (r) => (r[key] ? `${r[key].inv} vs ${r[key].src}` : '')
});

const columns = [
  { key: 'srNo', label: 'Sr No', width: 64 },
  { key: 'invoiceDate', label: 'Invoice Date' },
  { key: 'deliveryDateTime', label: 'Delivery Date & Time' },
  { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="cell-strong">{r.invoiceNumber}</span> },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => fmtMoney(r.amount) },
  auditCol('atg', 'ATG Audit', 'L'),
  auditCol('handTag', 'Hand Tag Audit', 'L'),
  auditCol('quotation', 'Quotation Audit', '€'),
  auditCol('stmt', 'Bank Statement Audit', '€'),
  { key: 'vendor', label: 'Vendor' }
];

// An audit row "passes" only when every source reconciles with the invoice.
const rowMatches = (r) =>
  isMatch(r.atg.inv, r.atg.src, 'L') &&
  isMatch(r.handTag.inv, r.handTag.src, 'L') &&
  isMatch(r.quotation.inv, r.quotation.src, '€') &&
  isMatch(r.stmt.inv, r.stmt.src, '€');

export default function FuelAudits() {
  const summary = (rows) => {
    const matched = rows.filter(rowMatches).length;
    return [
      { icon: 'shield', tone: 'teal', label: 'Invoices audited', value: rows.length },
      { icon: 'receipt', tone: 'green', label: 'Fully reconciled', value: matched },
      { icon: 'bell', tone: 'red', label: 'With discrepancies', value: rows.length - matched }
    ];
  };

  const vendorOptions = [...new Set(FUEL_AUDITS.map((r) => r.vendor))].map((v) => ({ value: v, label: v }));

  return (
    <ResourcePage
      perm="fuel_audits"
      pretitle="Fuel · Purchasing"
      title="Fuel Audits"
      data={FUEL_AUDITS}
      columns={columns}
      searchKeys={['invoiceNumber', 'vendor']}
      searchPlaceholder="Search by invoice # or vendor…"
      exportName="fuel-audits"
      summary={summary}
      filters={[{ label: 'Vendor', key: 'vendor', options: vendorOptions }]}
    />
  );
}
