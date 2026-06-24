import ReportLayout from '../ReportLayout.jsx';
import SummaryCard from '../../../components/crud/SummaryCard.jsx';
import ChartCard from '../../../components/crud/ChartCard.jsx';
import { AreaChart } from '../../../components/MiniCharts.jsx';
import { SALES, DAILY_SALES } from '../../../data/mock/sales.js';

const columns = [
  { key: 'date', label: 'Date' },
  { key: 'stationName', label: 'Station' },
  { key: 'productName', label: 'Product' },
  { key: 'quantity', label: 'Quantity (L)', align: 'right' },
  { key: 'amount', label: 'Amount', align: 'right', render: (r) => `$${r.amount.toFixed(2)}`, exportValue: (r) => r.amount }
];

export default function SalesReports() {
  const total = SALES.reduce((s, r) => s + r.amount, 0);
  const litres = SALES.reduce((s, r) => s + r.quantity, 0);
  return (
    <ReportLayout
      title="Sales Reports"
      exportName="sales-report"
      summary={
        <>
          <SummaryCard icon="receipt" tone="teal" label="Total Sales" value={`$${total.toFixed(0)}`} />
          <SummaryCard icon="fuel" tone="blue" label="Litres Sold" value={`${litres.toFixed(0)} L`} />
          <SummaryCard icon="tag" tone="green" label="Transactions" value={SALES.length} />
        </>
      }
      chart={
        <div className="row col-1">
          <ChartCard title="Sales over time" subtitle="Daily revenue">
            <AreaChart points={DAILY_SALES} id="rep-sales" />
          </ChartCard>
        </div>
      }
      columns={columns}
      rows={SALES}
    />
  );
}
