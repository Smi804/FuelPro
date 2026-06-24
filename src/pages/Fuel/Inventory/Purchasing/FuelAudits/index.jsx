import { useMemo, useState } from 'react';
import PageHeader from '../../../../../components/PageHeader.jsx';
import DataTable from '../../../../../components/crud/DataTable.jsx';
import FilterBar from '../../../../../components/crud/FilterBar.jsx';
import SummaryCard from '../../../../../components/crud/SummaryCard.jsx';
import StatusBadge from '../../../../../components/crud/StatusBadge.jsx';
import ExportButtons from '../../../../../components/crud/ExportButtons.jsx';
import { useAuth } from '../../../../../auth/AuthContext.jsx';
import { FUEL_AUDITS, AUDIT_PAY_STATUS } from '../../../../../data/mock/fuel.js';
import { GRADES, TODAY_QUOTES } from '../../../../../data/mock/supply.js';

const usd = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const usd0 = (n) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const GRADE_BY_KEY = Object.fromEntries(GRADES.map((g) => [g.key, g]));

const quotedAmount = (r) => r.gallons * r.dayQuote;
// Money matches within 0.5% (with a $1 floor) of the reference figure.
const moneyMatch = (a, b) => Math.abs(a - b) <= Math.max(Math.abs(a) * 0.005, 1);

const amountMatchesQuote = (r) => moneyMatch(r.amount, quotedAmount(r));
const qualityMatchesBol = (r) => r.quality === r.bolQuality;
const debitMatchesAmount = (r) => r.debited > 0 && moneyMatch(r.amount, r.debited);

const Pill = ({ ok, text }) => (
  <span className={'status ' + (ok ? 'status-green' : 'status-red')} style={{ width: 'fit-content' }}>
    {text}
  </span>
);

const gradeChip = (key) => {
  const g = GRADE_BY_KEY[key];
  return g ? <span className={`chip ${g.chip}`}>{g.label}</span> : key;
};

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="cell-strong">{r.invoiceNumber}</span> },
  { key: 'dueDate', label: 'Due date' },
  { key: 'vendor', label: 'Vendor' },
  { key: 'stationName', label: 'Station' },
  { key: 'grade', label: 'Grade', render: (r) => gradeChip(r.grade) },
  { key: 'gallons', label: 'Gallons', align: 'right', render: (r) => r.gallons.toLocaleString('en-US') },
  { key: 'dayQuote', label: "Day's Quote", align: 'right', render: (r) => `${usd(r.dayQuote)}/gal` },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => <span className="cell-strong">{usd0(r.amount)}</span> },
  {
    key: 'quoteAudit',
    label: 'Amount vs Quote',
    sortable: false,
    render: (r) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 140 }}>
        <span style={{ fontSize: 12 }}>
          <strong>{usd0(r.amount)}</strong> <span style={{ color: 'var(--text-muted)' }}>vs</span> {usd0(quotedAmount(r))}
        </span>
        <Pill ok={amountMatchesQuote(r)} text={amountMatchesQuote(r) ? 'Match' : `Δ ${usd0(r.amount - quotedAmount(r))}`} />
      </div>
    ),
    exportValue: (r) => `${r.amount} vs ${quotedAmount(r)}`
  },
  {
    key: 'qualityAudit',
    label: 'Quality vs BOL',
    sortable: false,
    render: (r) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 150 }}>
        <span style={{ fontSize: 12 }}>
          <strong>{r.quality}</strong> <span style={{ color: 'var(--text-muted)' }}>vs</span> {r.bolQuality}
        </span>
        <Pill ok={qualityMatchesBol(r)} text={qualityMatchesBol(r) ? 'Match' : 'Mismatch'} />
      </div>
    ),
    exportValue: (r) => `${r.quality} vs ${r.bolQuality}`
  },
  {
    key: 'debitAudit',
    label: 'Debited vs Invoice',
    sortable: false,
    render: (r) => (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 140 }}>
        <span style={{ fontSize: 12 }}>
          <strong>{r.debited > 0 ? usd0(r.debited) : '—'}</strong> <span style={{ color: 'var(--text-muted)' }}>vs</span> {usd0(r.amount)}
        </span>
        <Pill ok={debitMatchesAmount(r)} text={debitMatchesAmount(r) ? 'Match' : r.debited > 0 ? `Δ ${usd0(r.debited - r.amount)}` : 'Not debited'} />
      </div>
    ),
    exportValue: (r) => `${r.debited} vs ${r.amount}`
  },
  { key: 'paymentType', label: 'Pay type', render: (r) => <span className="chip chip-blue">{r.paymentType}</span> },
  { key: 'paymentTerms', label: 'Terms' },
  { key: 'paymentStatus', label: 'Status', render: (r) => <StatusBadge value={r.paymentStatus} map={AUDIT_PAY_STATUS} /> }
];

export default function FuelAudits() {
  const { can } = useAuth();
  const [search, setSearch] = useState('');
  const [vendor, setVendor] = useState('');
  const [grade, setGrade] = useState('');
  const [status, setStatus] = useState('');

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase();
    return FUEL_AUDITS.filter((r) => {
      if (vendor && r.vendor !== vendor) return false;
      if (grade && r.grade !== grade) return false;
      if (status && r.paymentStatus !== status) return false;
      if (q && ![r.invoiceNumber, r.vendor, r.stationName].some((v) => String(v).toLowerCase().includes(q))) return false;
      return true;
    });
  }, [search, vendor, grade, status]);

  const summaryCards = [
    { icon: 'shield', tone: 'teal', label: 'Invoices audited', value: rows.length },
    { icon: 'price', tone: 'green', label: 'Amount = Quote', value: rows.filter(amountMatchesQuote).length, subtext: `of ${rows.length}` },
    { icon: 'fuel', tone: 'blue', label: 'Quality = BOL', value: rows.filter(qualityMatchesBol).length, subtext: `of ${rows.length}` },
    { icon: 'wallet', tone: 'red', label: 'Debit matched', value: rows.filter(debitMatchesAmount).length, subtext: `of ${rows.length}` }
  ];

  const vendorOptions = [...new Set(FUEL_AUDITS.map((r) => r.vendor))].map((v) => ({ value: v, label: v }));
  const gradeOptions = GRADES.map((g) => ({ value: g.key, label: g.label }));
  const statusOptions = Object.entries(AUDIT_PAY_STATUS).map(([value, m]) => ({ value, label: m.label }));

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Fuel · Purchasing"
        title="Fuel Audits"
        actions={can('fuel_audits:export') && <ExportButtons columns={columns} rows={rows} filename="fuel-audits" />}
      />

      <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
        <div className="card-header">
          <div>
            <div className="card-title">Today's quote</div>
            <div className="card-subtitle">Reference $/gallon used to audit invoice amounts</div>
          </div>
        </div>
        <div className="card-body">
          <div className="row col-4">
            {GRADES.map((g) => (
              <div key={g.key} style={{ borderLeft: `3px solid ${g.color}`, paddingLeft: 12 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {g.label} <span style={{ opacity: 0.7 }}>({g.octane})</span>
                </div>
                <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text)' }}>{usd(TODAY_QUOTES[g.key])}</div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>per gallon</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="row col-4">
        {summaryCards.map((c, i) => (
          <SummaryCard key={i} {...c} />
        ))}
      </div>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search by invoice #, vendor or station…' }}
        filters={[
          { label: 'Vendor', value: vendor, onChange: setVendor, options: vendorOptions },
          { label: 'Grade', value: grade, onChange: setGrade, options: gradeOptions },
          { label: 'Status', value: status, onChange: setStatus, options: statusOptions }
        ]}
      />

      <DataTable
        title="Invoice audits"
        columns={columns}
        rows={rows}
        selectable={false}
        enableColumnToggle={false}
        pageSize={10}
        emptyText="No invoices match the current filters."
      />
    </div>
  );
}
