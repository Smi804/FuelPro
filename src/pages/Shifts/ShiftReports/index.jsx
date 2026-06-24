import PageHeader from '../../../components/PageHeader.jsx';
import DataTable from '../../../components/crud/DataTable.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import ExportButtons from '../../../components/crud/ExportButtons.jsx';
import Can from '../../../auth/Can.jsx';
import { SHIFTS, SHIFT_STATUS } from '../../../data/mock/operations.js';

const fmt = (n) => (n == null ? '—' : `$${Number(n).toFixed(2)}`);

const columns = [
  { key: 'employeeName', label: 'Employee', render: (r) => <span className="cell-strong">{r.employeeName}</span> },
  { key: 'stationName', label: 'Station' },
  { key: 'startedAt', label: 'Started' },
  { key: 'endedAt', label: 'Ended', render: (r) => r.endedAt || '—' },
  { key: 'openingCash', label: 'Opening', align: 'right', render: (r) => fmt(r.openingCash) },
  { key: 'closingCash', label: 'Closing', align: 'right', render: (r) => fmt(r.closingCash) },
  {
    key: 'cashDifference',
    label: 'Difference',
    align: 'right',
    render: (r) => (r.cashDifference == null ? '—' : <span style={{ color: r.cashDifference < 0 ? 'var(--red)' : 'var(--green)' }}>{fmt(r.cashDifference)}</span>),
    exportValue: (r) => r.cashDifference
  },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={SHIFT_STATUS} />, exportValue: (r) => r.status }
];

export default function ShiftReports() {
  const open = SHIFTS.filter((s) => s.status === 'open').length;
  const shortfalls = SHIFTS.filter((s) => (s.cashDifference || 0) < 0).length;
  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Shift Management"
        title="Shift Reports"
        actions={
          <Can perm="shifts:export">
            <ExportButtons columns={columns} rows={SHIFTS} filename="shift-reports" />
          </Can>
        }
      />
      <div className="row col-3">
        <SummaryCard icon="clock" tone="teal" label="Total Shifts" value={SHIFTS.length} />
        <SummaryCard icon="clock" tone="green" label="Open Now" value={open} />
        <SummaryCard icon="price" tone="red" label="Cash Shortfalls" value={shortfalls} />
      </div>
      <DataTable title="All shifts" columns={columns} rows={SHIFTS} searchKeys={['employeeName', 'stationName']} searchPlaceholder="Search shifts…" selectable={false} />
    </div>
  );
}
