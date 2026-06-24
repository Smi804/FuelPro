import ReportLayout from '../ReportLayout.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import { SHIFTS, SHIFT_STATUS } from '../../../data/mock/operations.js';

const fmt = (n) => (n == null ? '—' : `$${Number(n).toFixed(2)}`);

const columns = [
  { key: 'employeeName', label: 'Employee' },
  { key: 'stationName', label: 'Station' },
  { key: 'startedAt', label: 'Started' },
  { key: 'openingCash', label: 'Opening', align: 'right', render: (r) => fmt(r.openingCash) },
  { key: 'closingCash', label: 'Closing', align: 'right', render: (r) => fmt(r.closingCash) },
  { key: 'cashDifference', label: 'Difference', align: 'right', render: (r) => fmt(r.cashDifference), exportValue: (r) => r.cashDifference },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={SHIFT_STATUS} />, exportValue: (r) => r.status }
];

export default function ShiftReportsPage() {
  return (
    <ReportLayout
      title="Shift Reports"
      exportName="shift-report"
      summary={
        <>
          <SummaryCard icon="clock" tone="teal" label="Shifts" value={SHIFTS.length} />
          <SummaryCard icon="clock" tone="green" label="Open" value={SHIFTS.filter((s) => s.status === 'open').length} />
          <SummaryCard icon="price" tone="red" label="Shortfalls" value={SHIFTS.filter((s) => (s.cashDifference || 0) < 0).length} />
        </>
      }
      columns={columns}
      rows={SHIFTS}
    />
  );
}
