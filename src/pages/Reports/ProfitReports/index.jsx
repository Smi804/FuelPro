import ReportLayout from '../ReportLayout.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import ChartCard from '../../../components/crud/ChartCard.jsx';
import { AreaChart } from '../../../components/MiniCharts.jsx';
import { PROFIT_TREND, MONTHLY_REVENUE } from '../../../data/mock/sales.js';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const rows = MONTHS.map((m, i) => ({
  id: m,
  month: m,
  revenue: (MONTHLY_REVENUE[i] || 0) * 1000,
  profit: (PROFIT_TREND[i] || 0) * 1000,
  margin: MONTHLY_REVENUE[i] ? Math.round((PROFIT_TREND[i] / MONTHLY_REVENUE[i]) * 100) : 0
}));

const columns = [
  { key: 'month', label: 'Month' },
  { key: 'revenue', label: 'Revenue', align: 'right', render: (r) => `$${r.revenue.toLocaleString()}`, exportValue: (r) => r.revenue },
  { key: 'profit', label: 'Profit', align: 'right', render: (r) => `$${r.profit.toLocaleString()}`, exportValue: (r) => r.profit },
  { key: 'margin', label: 'Margin', align: 'right', render: (r) => `${r.margin}%` }
];

export default function ProfitReports() {
  const totalProfit = rows.reduce((s, r) => s + r.profit, 0);
  const totalRev = rows.reduce((s, r) => s + r.revenue, 0);
  return (
    <ReportLayout
      title="Profit Reports"
      exportName="profit-report"
      summary={
        <>
          <SummaryCard icon="receipt" tone="teal" label="Revenue (YTD)" value={`$${(totalRev / 1000).toFixed(0)}k`} />
          <SummaryCard icon="wallet" tone="green" label="Profit (YTD)" value={`$${(totalProfit / 1000).toFixed(0)}k`} />
          <SummaryCard icon="book" tone="blue" label="Avg Margin" value={`${Math.round((totalProfit / totalRev) * 100)}%`} />
        </>
      }
      chart={
        <div className="row col-1">
          <ChartCard title="Profit trend" subtitle="Net margin per month">
            <AreaChart points={PROFIT_TREND} id="rep-profit" color="var(--green)" />
          </ChartCard>
        </div>
      }
      columns={columns}
      rows={rows}
    />
  );
}
