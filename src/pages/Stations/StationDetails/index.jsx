import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';
import Tabs from '../../../components/crud/Tabs.jsx';
import { STATIONS } from '../../../data/mock/stations.js';
import { OverviewTab, PumpsTab, TanksTab, EmployeesTab, InventoryTab, SalesTab, ReportsTab, SettingsTab } from './tabs.jsx';

const TABS = [
  { key: 'overview', label: 'Overview', Comp: OverviewTab },
  { key: 'pumps', label: 'Pumps', Comp: PumpsTab },
  { key: 'tanks', label: 'Tanks', Comp: TanksTab },
  { key: 'employees', label: 'Employees', Comp: EmployeesTab },
  { key: 'inventory', label: 'Inventory', Comp: InventoryTab },
  { key: 'sales', label: 'Sales', Comp: SalesTab },
  { key: 'reports', label: 'Reports', Comp: ReportsTab },
  { key: 'settings', label: 'Settings', Comp: SettingsTab }
];

export default function StationDetails() {
  const { id } = useParams();
  const station = STATIONS.find((s) => s.id === id);
  const [active, setActive] = useState('overview');

  if (!station) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <p>Station not found.</p>
          <Link to="/stations" className="btn btn-primary" style={{ marginTop: 12 }}>
            Back to stations
          </Link>
        </div>
      </div>
    );
  }

  const ActiveComp = TABS.find((t) => t.key === active).Comp;

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle={`${station.city} · ${station.address}`}
        title={station.name}
        actions={
          <Link to="/stations" className="btn btn-outline">
            ← All stations
          </Link>
        }
      />
      <div style={{ marginBottom: 'var(--space-4)' }}>
        <Tabs tabs={TABS} active={active} onChange={setActive} />
      </div>
      <ActiveComp station={station} />
    </div>
  );
}
