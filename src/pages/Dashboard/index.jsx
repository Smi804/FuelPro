import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import SummaryCards from './components/SummaryCards.jsx';
import DashboardCharts from './components/DashboardCharts.jsx';
import DashboardWidgets from './components/DashboardWidgets.jsx';
import { STATIONS } from '../../data/mock/stations.js';
import { TANKS } from '../../data/mock/tanks.js';
import { SALES } from '../../data/mock/sales.js';
import { SHIFTS } from '../../data/mock/operations.js';

const TODAY = '2026-06-23';

export default function Dashboard() {
  const { user } = useAuth();

  const todays = SALES.filter((s) => s.date.startsWith(TODAY));
  const salesToday = todays.reduce((sum, s) => sum + s.amount, 0);
  const creditToday = todays.filter((s) => s.paymentMethod === 'credit').reduce((sum, s) => sum + s.amount, 0);
  const cashToday = todays.filter((s) => s.paymentMethod === 'cash').reduce((sum, s) => sum + s.amount, 0);
  const openCash = SHIFTS.filter((s) => s.status === 'open').reduce((sum, s) => sum + s.openingCash, 0);
  const pending = SALES.filter((s) => s.paymentStatus !== 'paid').reduce((sum, s) => sum + s.amount, 0);
  const totalStock = TANKS.reduce((sum, t) => sum + t.currentStock, 0);
  const avgStockPct = Math.round(TANKS.reduce((s, t) => s + t.currentStock / t.capacity, 0) / TANKS.length * 100);
  const activeStations = STATIONS.filter((s) => s.status === 'active').length;

  const cards = [
    { icon: 'receipt', tone: 'teal', label: 'Total Sales Today', value: `$${salesToday.toFixed(0)}`, change: '8.2%', changeDir: 'up', subtext: `${todays.length} transactions` },
    { icon: 'fuel', tone: 'blue', label: 'Fuel Stock', value: `${(totalStock / 1000).toFixed(1)}k L`, subtext: `${avgStockPct}% avg capacity` },
    { icon: 'wallet', tone: 'green', label: 'Cash in Hand', value: `$${(cashToday + openCash).toFixed(0)}`, subtext: 'Across open shifts' },
    { icon: 'tag', tone: 'yellow', label: 'Credit Sales', value: `$${creditToday.toFixed(0)}`, change: '3.1%', changeDir: 'up', subtext: 'Today, on credit' },
    { icon: 'fuel', tone: 'purple', label: 'Active Stations', value: `${activeStations}/${STATIONS.length}`, subtext: 'Operational now' },
    { icon: 'price', tone: 'red', label: 'Pending Payments', value: `$${pending.toFixed(0)}`, change: '1.4%', changeDir: 'down', subtext: 'Unsettled invoices' }
  ];

  return (
    <div className="page-wrapper">
      <PageHeader pretitle={`Welcome back, ${user.name.split(' ')[0]}`} title="Dashboard" />
      <SummaryCards cards={cards} />
      <DashboardCharts />
      <DashboardWidgets />
    </div>
  );
}
