import ResourcePage from '../../../components/crud/ResourcePage.jsx';
import StatusBadge from '../../../components/crud/StatusBadge.jsx';
import { USERS, USER_STATUS } from '../../../data/mock/system.js';
import { ROLE_LABEL, ROLE_LIST, ROLE_BADGE_CLS } from '../../../domain/roles.js';
import { STATIONS } from '../../../data/mock/stations.js';
import { stationIdOptions } from '../../../data/options.js';

const stationsLabel = (ids) => {
  if (!ids || !ids.length) return 'All stations';
  return ids.map((id) => STATIONS.find((s) => s.id === id)?.name || id).join(', ');
};

const columns = [
  {
    key: 'name',
    label: 'User',
    render: (r) => (
      <div className="cell-customer">
        <div className="cell-avatar" style={{ background: r.avatarColor || 'var(--primary)' }}>
          {r.name.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase()}
        </div>
        <div>
          <div className="cell-strong">{r.name}</div>
          <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{r.email}</div>
        </div>
      </div>
    ),
    exportValue: (r) => r.name
  },
  { key: 'role', label: 'Role', render: (r) => <span className={`role-chip ${ROLE_BADGE_CLS[r.role]}`}>{ROLE_LABEL[r.role]}</span>, exportValue: (r) => ROLE_LABEL[r.role] },
  { key: 'stationIds', label: 'Stations', render: (r) => stationsLabel(r.stationIds), exportValue: (r) => stationsLabel(r.stationIds) },
  { key: 'lastActive', label: 'Last active' },
  { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} map={USER_STATUS} />, exportValue: (r) => r.status }
];

const fields = [
  { name: 'name', label: 'Full name', required: true },
  { name: 'email', label: 'Email', type: 'email', required: true, validate: (v) => (v && !/^[^@]+@[^@]+\.[^@]+$/.test(v) ? 'Invalid email' : null) },
  { name: 'role', label: 'Role', type: 'select', required: true, options: ROLE_LIST.map((r) => ({ value: r.key, label: r.label })) },
  { name: 'status', label: 'Status', type: 'select', required: true, defaultValue: 'invited', options: Object.entries(USER_STATUS).map(([value, m]) => ({ value, label: m.label })) }
];

export default function Users() {
  return (
    <ResourcePage
      perm="users"
      pretitle="Administration"
      title="Users"
      data={USERS}
      columns={columns}
      searchKeys={['name', 'email']}
      searchPlaceholder="Search users…"
      formFields={fields}
      addLabel="Invite user"
      exportName="users"
      filters={[
        { label: 'Role', key: 'role', options: ROLE_LIST.map((r) => ({ value: r.key, label: r.label })) },
        { label: 'Status', key: 'status', options: Object.entries(USER_STATUS).map(([value, m]) => ({ value, label: m.label })) }
      ]}
    />
  );
}
