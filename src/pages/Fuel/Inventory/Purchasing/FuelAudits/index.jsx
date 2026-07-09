import { useMemo, useState, useEffect, useCallback } from 'react';
import PageHeader from '../../../../../components/PageHeader.jsx';
import DataTable from '../../../../../components/crud/DataTable.jsx';
import FilterBar from '../../../../../components/crud/FilterBar.jsx';
import SummaryCard from '../../../../../components/crud/SummaryCard.jsx';
import StatusBadge from '../../../../../components/crud/StatusBadge.jsx';
import ExportButtons from '../../../../../components/crud/ExportButtons.jsx';
import { useAuth } from '../../../../../auth/AuthContext.jsx';
import { showToast } from '../../../../../v4/toast.js';
import { getPersonsDropDown } from '../../../../../api/persons.js';
import { getFuelAudits } from '../../../../../api/fuelAudits.js';
import { AUDIT_STATUS } from '../../../../../data/mock/fuel.js';
import { GRADES, TODAY_QUOTES } from '../../../../../data/mock/supply.js';

const SUPPLIER_TYPE = 2;

const usd = (n) => `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const usd0 = (n) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
const qty = (n) => (n == null ? '—' : Number(n).toLocaleString('en-US'));

const isPassed = (s) => s === 'passed';

const CompareCell = ({ left, right, status, delta, deltaFmt = qty }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 140 }}>
    <span style={{ fontSize: 12 }}>
      <strong>{left}</strong> <span style={{ color: 'var(--text-muted)' }}>vs</span> {right}
    </span>
    {status === 'n/a' ? (
      <StatusBadge value="n/a" map={AUDIT_STATUS} />
    ) : delta != null && status !== 'passed' ? (
      <span className={'status ' + (status === 'flagged' ? 'status-yellow' : 'status-red')} style={{ width: 'fit-content' }}>
        {status === 'flagged' ? 'Flagged' : 'Failed'} · Δ {deltaFmt(delta)}
      </span>
    ) : (
      <StatusBadge value={status} map={AUDIT_STATUS} />
    )}
  </div>
);

const columns = [
  { key: 'srNo', label: 'Sr. No.', render: (r) => <span className="cell-strong">{r.srNo ?? '—'}</span> },
  { key: 'date', label: 'Date' },
  { key: 'dueDate', label: 'Due date', render: (r) => r.dueDate || <span style={{ color: 'var(--text-muted)' }}>—</span> },
  { key: 'vendor', label: 'Vendor' },
  { key: 'invoiceNumber', label: 'Invoice #', render: (r) => <span className="cell-strong">{r.invoiceNumber}</span> },
  { key: 'bolNumber', label: 'BOL #', render: (r) => <span className="cell-strong">{r.bolNumber || '—'}</span> },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => <span className="cell-strong">{usd0(r.amount)}</span> },
  {
    key: 'bolAudit',
    label: 'Invoice vs BOL',
    sortable: false,
    render: (r) => {
      const b = r.invoiceVsBol;
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3, minWidth: 160 }}>
          <span style={{ fontSize: 12 }}>
            <strong>{qty(b.invoice_quantity)}</strong>
            <span style={{ color: 'var(--text-muted)' }}> vs </span>
            {qty(b.bol_quantity)}
          </span>
          {/* <span style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
            {b.invoice_quality || '—'} vs {b.bol_quality || '—'}
          </span> */}
          {b.status === 'n/a' ? (
            <StatusBadge value="n/a" map={AUDIT_STATUS} />
          ) : b.status !== 'passed' ? (
            <span className={'status ' + (b.status === 'flagged' ? 'status-yellow' : 'status-red')} style={{ width: 'fit-content' }}>
              {b.status === 'flagged' ? 'Flagged' : 'Failed'}
              {b.variance_pct != null ? ` · ${b.variance_pct}%` : ''}
            </span>
          ) : (
            <StatusBadge value={b.status} map={AUDIT_STATUS} />
          )}
        </div>
      );
    },
    exportValue: (r) => `${r.invoiceVsBol.invoice_quantity} vs ${r.invoiceVsBol.bol_quantity} (${r.invoiceVsBol.status})`
  },
  // {
  //   key: 'auditStatus',
  //   label: 'Audit status',
  //   render: (r) => <StatusBadge value={r.auditStatus} map={AUDIT_STATUS} />,
  //   exportValue: (r) => r.auditStatus
  // },
  {
    key: 'quoteAudit',
    label: 'Invoice vs Quote',
    sortable: false,
    render: (r) => {
      const b = r.invoiceVsQuote;
      return (
        <CompareCell
          left={usd0(b.invoice_amount)}
          right={usd0(b.quoted_amount)}
          status={b.status}
          // delta={b.variance}
          deltaFmt={usd0}
        />
      );
    },
    exportValue: (r) => `${r.invoiceVsQuote.invoice_amount} vs ${r.invoiceVsQuote.quoted_amount}`
  },
  {
    key: 'atgAudit',
    label: 'Invoice vs ATG',
    sortable: false,
    render: (r) => {
      const b = r.invoiceVsAtg;
      return (
        <CompareCell
          left={qty(b.invoice_quantity)}
          right={qty(b.atg_quantity)}
          status={b.status}
          delta={b.variance}
        />
      );
    },
    exportValue: (r) => `${r.invoiceVsAtg.invoice_quantity} vs ${r.invoiceVsAtg.atg_quantity}`
  },
  {
    key: 'debitAudit',
    label: 'Invoice vs Stmt',
    sortable: false,
    render: (r) => {
      const b = r.invoiceVsStmt;
      return (
        <CompareCell
          left={b.debited_amount != null ? usd0(b.debited_amount) : '—'}
          right={usd0(b.invoice_amount)}
          status={b.status}
          delta={b.variance}
          deltaFmt={usd0}
        />
      );
    },
    exportValue: (r) => `${r.invoiceVsStmt.debited_amount} vs ${r.invoiceVsStmt.invoice_amount}`
  }
];

export default function FuelAudits() {
  const { can, activeStationId } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [vendor, setVendor] = useState('');
  const [grade, setGrade] = useState('');
  const [auditStatus, setAuditStatus] = useState('');
  const [vendors, setVendors] = useState([]);

  useEffect(() => {
    getPersonsDropDown({ person_type: SUPPLIER_TYPE })
      .then(setVendors)
      .catch(() => setVendors([]));
  }, [activeStationId]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(
        await getFuelAudits({
          vendor_id: vendor || undefined,
          grade: grade || undefined,
          audit_status: auditStatus || undefined
        })
      );
    } catch (err) {
      showToast(err?.message || 'Failed to load fuel audits', { variant: 'danger' });
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [activeStationId, vendor, grade, auditStatus]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      [r.invoiceNumber, r.bolNumber, r.vendor].some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [rows, search]);

  const summaryCards = [
    { icon: 'shield', tone: 'teal', label: 'Invoices audited', value: filtered.length },
    {
      icon: 'fuel',
      tone: 'green',
      label: 'BOL passed',
      value: filtered.filter((r) => isPassed(r.invoiceVsBol?.status)).length,
      subtext: `of ${filtered.length}`
    },
    {
      icon: 'bell',
      tone: 'blue',
      label: 'Flagged',
      value: filtered.filter((r) => r.auditStatus === 'flagged').length,
      subtext: `of ${filtered.length}`
    },
    {
      icon: 'wallet',
      tone: 'red',
      label: 'Failed',
      value: filtered.filter((r) => r.auditStatus === 'failed').length,
      subtext: `of ${filtered.length}`
    }
  ];

  const gradeOptions = GRADES.map((g) => ({ value: g.key, label: g.label }));
  const auditStatusOptions = ['passed', 'flagged', 'failed'].map((value) => ({
    value,
    label: AUDIT_STATUS[value].label
  }));

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Fuel · Purchasing"
        title="Fuel Audits"
        actions={can('fuel_audits:export') && <ExportButtons columns={columns} rows={filtered} filename="fuel-audits" />}
      />

      {/* <div className="card" style={{ marginBottom: 'var(--space-4)' }}>
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
      </div> */}

      <div className="row col-4">
        {summaryCards.map((c, i) => (
          <SummaryCard key={i} {...c} />
        ))}
      </div>

      <FilterBar
        search={{ value: search, onChange: setSearch, placeholder: 'Search by invoice #, BOL # or vendor…' }}
        filters={[
          { label: 'Vendor', value: vendor, onChange: setVendor, options: vendors },
          { label: 'Grade', value: grade, onChange: setGrade, options: gradeOptions },
          { label: 'Audit status', value: auditStatus, onChange: setAuditStatus, options: auditStatusOptions }
        ]}
      />

      <DataTable
        title="Invoice audits"
        columns={columns}
        rows={filtered}
        loading={loading}
        selectable={false}
        enableColumnToggle={false}
        pageSize={10}
        emptyText="No invoices match the current filters."
      />
    </div>
  );
}
