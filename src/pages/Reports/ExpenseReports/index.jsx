import ReportLayout from '../ReportLayout.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import ChartCard from '../../../components/crud/ChartCard.jsx';
import { Bars } from '../../../components/MiniCharts.jsx';
import { EXPENSES } from '../../../data/mock/operations.js';
import { STATIONS } from '../../../data/mock/stations.js';

const stationName = (id) => STATIONS.find((s) => s.id === id)?.name || id;

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'category', label: 'Category' },
  { key: 'stationId', label: 'Station', render: (r) => stationName(r.stationId), exportValue: (r) => stationName(r.stationId) },
  { key: 'description', label: 'Description' },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => `$${r.amount.toLocaleString()}`, exportValue: (r) => r.amount }
];

export default function ExpenseReports() {
  const total = EXPENSES.reduce((s, e) => s + e.amount, 0);
  const byCat = {};
  EXPENSES.forEach((e) => { byCat[e.category] = (byCat[e.category] || 0) + e.amount; });
  const max = Math.max(...Object.values(byCat));
  return (
    <ReportLayout
      title="Expense Reports"
      exportName="expense-report"
      summary={
        <>
          <SummaryCard icon="wallet" tone="teal" label="Total Expenses" value={`$${total.toLocaleString()}`} />
          <SummaryCard icon="receipt" tone="blue" label="Records" value={EXPENSES.length} />
          <SummaryCard icon="price" tone="yellow" label="Categories" value={Object.keys(byCat).length} />
        </>
      }
      chart={
        <div className="row col-1">
          <ChartCard title="Expenses by category" subtitle="Share of spend">
            <Bars data={Object.values(byCat).map((v) => Math.round((v / max) * 100))} color="var(--yellow)" />
          </ChartCard>
        </div>
      }
      columns={columns}
      rows={EXPENSES}
    />
  );
}
