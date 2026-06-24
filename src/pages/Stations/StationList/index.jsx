import { useNavigate } from 'react-router-dom';
import ResourcePage from '../../../components/crud/ResourcePage.jsx';
import { STATIONS } from '../../../data/mock/stations.js';
import { stationColumns, stationFields } from './columns.jsx';

export default function StationList() {
  const navigate = useNavigate();

  const summary = (rows) => [
    { icon: 'fuel', tone: 'teal', label: 'Total Stations', value: rows.length },
    { icon: 'fuel', tone: 'green', label: 'Active', value: rows.filter((r) => r.status === 'active').length },
    { icon: 'clock', tone: 'yellow', label: 'Maintenance', value: rows.filter((r) => r.status === 'maintenance').length },
    { icon: 'inventory', tone: 'blue', label: 'Avg Fuel Stock', value: `${Math.round(rows.reduce((s, r) => s + r.fuelStockPct, 0) / (rows.length || 1))}%` }
  ];

  return (
    <ResourcePage
      perm="stations"
      pretitle="Network"
      title="Stations"
      data={STATIONS}
      columns={stationColumns}
      searchKeys={['name', 'city', 'managerName']}
      searchPlaceholder="Search stations…"
      formFields={stationFields}
      addLabel="Add station"
      exportName="stations"
      summary={summary}
      filters={[
        {
          label: 'Status',
          key: 'status',
          options: [
            { value: 'active', label: 'Active' },
            { value: 'maintenance', label: 'Maintenance' },
            { value: 'inactive', label: 'Inactive' }
          ]
        }
      ]}
      extraActions={(row) => [{ label: 'View details', onClick: () => navigate(`/stations/${row.id}`) }]}
    />
  );
}
