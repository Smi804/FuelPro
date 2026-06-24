import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';
import Tabs from '../../../components/crud/Tabs.jsx';
import StationRequired from '../../../components/crud/StationRequired.jsx';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { editStation } from '../../../api/stations.js';
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
  const { activeStationId } = useAuth();
  const [active, setActive] = useState('overview');
  const [station, setStation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Prefer a concrete id from the URL (e.g. "View details" from the list);
  // otherwise fall back to the station selected in the topbar.
  const routeId = id && id !== 'current' ? id : null;
  const targetId = routeId || (activeStationId && activeStationId !== 'all' ? activeStationId : null);

  useEffect(() => {
    if (!targetId) {
      setStation(null);
      setError('');
      setLoading(false);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError('');
    editStation(targetId)
      .then((s) => !cancelled && setStation(s))
      .catch((err) => !cancelled && setError(err?.message || 'Station not found'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [targetId]);

  if (!targetId) {
    return (
      <div className="page-wrapper">
        <PageHeader pretitle="Network" title="Station details" />
        <StationRequired resource="station details" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ padding: 32, textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</div>
      </div>
    );
  }

  if (error || !station) {
    return (
      <div className="page-wrapper">
        <div className="card" style={{ padding: 32, textAlign: 'center' }}>
          <p>{error || 'Station not found.'}</p>
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
        pretitle={[station.city, station.state].filter(Boolean).join(', ') || station.code}
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
