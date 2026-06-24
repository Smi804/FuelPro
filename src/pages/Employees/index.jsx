import ResourcePage from '../../components/crud/ResourcePage.jsx';
import StatusBadge from '../../components/crud/StatusBadge.jsx';
import { EMPLOYEES, EMPLOYEE_STATUS } from '../../data/mock/people.js';
import { ROLE_LABEL, ROLE_LIST } from '../../domain/roles.js';
import { STATIONS } from '../../data/mock/stations.js';
import { stationIdOptions } from '../../data/options.js';

const stationName = (id) => STATIONS.find((s) => s.id === id)?.name || id;

const columns = [
  { key: 'name', label: 'Name', render: (r) => <span className="cell-strong">{r.name}</span> },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'role', label: 'Role', render: (r) => ROLE_LABEL[r.role] || r.role, exportValue: (r) => ROLE_LABEL[r.role] },
  { key: 'stationId', label: 'Station', render: (r) => stationName(r.stationId), exportValue: (r) => stationName(r.stationId) },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={EMPLOYEE_STATUS} />, exportValue: (r) => r.status }
];

const fields = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true, validate: (v) => (v && !/^[^@]+@[^@]+\.[^@]+$/.test(v) ? 'Invalid email' : null) },
  { name: 'phone', label: 'Phone', required: true },
  { name: 'role', label: 'Role', type: 'select', required: true, options: ROLE_LIST.map((r) => ({ value: r.key, label: r.label })) },
  { name: 'stationId', label: 'Assigned station', type: 'select', required: true, options: stationIdOptions },
  { name: 'status', label: 'Status', type: 'select', required: true, options: Object.entries(EMPLOYEE_STATUS).map(([value, m]) => ({ value, label: m.label })) }
];

export default function Employees() {
  return (
    <ResourcePage
      perm="employees"
      pretitle="People"
      title="Employees"
      data={EMPLOYEES}
      columns={columns}
      searchKeys={['name', 'email', 'phone']}
      searchPlaceholder="Search employees…"
      formFields={fields}
      addLabel="Add employee"
      exportName="employees"
      filters={[
        { label: 'Station', key: 'stationId', options: stationIdOptions },
        { label: 'Role', key: 'role', options: ROLE_LIST.map((r) => ({ value: r.key, label: r.label })) },
        { label: 'Status', key: 'status', options: Object.entries(EMPLOYEE_STATUS).map(([value, m]) => ({ value, label: m.label })) }
      ]}
    />
  );
}
