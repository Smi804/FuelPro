import PageHeader from '../../components/PageHeader.jsx';
import SummaryCard from '../../components/crud/SummaryCard.jsx';
import { useAuth } from '../../auth/AuthContext.jsx';
import SupplierPrices from './components/SupplierPrices.jsx';
import PriceTrends from './components/PriceTrends.jsx';
import DashboardCharts from './components/DashboardCharts.jsx';
import StationBoard from './components/StationBoard.jsx';
import SupplierStationMap from './components/SupplierStationMap.jsx';
import { TOTAL_AMOUNT_PAID, TOTAL_GALLONS, GALLONS_BY_GRADE, GRADES, SUPPLIERS, SUPPLY_STATIONS, usd, gal } from '../../data/mock/supply.js';

export default function Dashboard() {
  const { user } = useAuth();

  const totals = [
    { icon: 'wallet', tone: 'teal', label: 'Total Amount Paid', value: usd(TOTAL_AMOUNT_PAID), subtext: 'All stations · to date' },
    { icon: 'fuel', tone: 'blue', label: 'Total Gallons Purchased', value: gal(TOTAL_GALLONS), subtext: 'All stations · to date' },
    { icon: 'truck', tone: 'green', label: 'Suppliers', value: SUPPLIERS.length, subtext: 'Active gas suppliers' },
    { icon: 'fuel', tone: 'purple', label: 'Stations Served', value: SUPPLY_STATIONS.length, subtext: 'Across all suppliers' }
  ];

  // Gallons purchased to date, broken out per grade (regular / plus / premium / diesel).
  const gradeCards = GRADES.map((g) => ({
    icon: 'fuel',
    tone: { regular: 'blue', plus: 'green', premium: 'purple', diesel: 'yellow' }[g.key],
    label: `${g.label} purchased`,
    value: gal(GALLONS_BY_GRADE[g.key]),
    subtext: 'Gallons to date'
  }));

  return (
    <div className="page-wrapper">
      <PageHeader pretitle={`Welcome back, ${user.name.split(' ')[0]}`} title="Dashboard" />

      <div className="row col-4">
        {totals.map((c) => (
          <SummaryCard key={c.label} {...c} />
        ))}
      </div>

      <SupplierPrices />

      <PriceTrends />

      <div className="row col-4">
        {gradeCards.map((c) => (
          <SummaryCard key={c.label} {...c} />
        ))}
      </div>

      <DashboardCharts />

      <StationBoard />

      <SupplierStationMap />
    </div>
  );
}
