import ChartCard from '../../../components/crud/ChartCard.jsx';
import { AreaChart, Bars } from '../../../components/MiniCharts.jsx';
import { DAILY_SALES, MONTHLY_REVENUE, FUEL_CONSUMPTION, PROFIT_TREND } from '../../../data/mock/sales.js';

export default function DashboardCharts() {
  return (
    <>
      <div className="row col-2">
        <ChartCard title="Daily Sales" subtitle="Last 14 days · litres sold (k)">
          <AreaChart points={DAILY_SALES} id="daily" color="var(--primary)" />
        </ChartCard>
        <ChartCard title="Monthly Revenue" subtitle="This year · € thousands">
          <Bars data={MONTHLY_REVENUE} color="var(--blue)" />
        </ChartCard>
      </div>
      <div className="row col-2">
        <ChartCard title="Fuel Consumption" subtitle="Litres dispensed (k)">
          <AreaChart points={FUEL_CONSUMPTION} id="fuel" color="var(--yellow)" />
        </ChartCard>
        <ChartCard title="Profit Trend" subtitle="Net margin · € thousands">
          <AreaChart points={PROFIT_TREND} id="profit" color="var(--green)" />
        </ChartCard>
      </div>
    </>
  );
}
