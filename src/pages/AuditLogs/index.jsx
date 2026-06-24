import PageHeader from '../../components/PageHeader.jsx';
import DataTable from '../../components/crud/DataTable.jsx';
import ExportButtons from '../../components/crud/ExportButtons.jsx';
import Can from '../../auth/Can.jsx';
import { MODULES } from '../../domain/permissions.js';
import { AUDIT_LOGS } from '../../data/mock/system.js';

const moduleLabel = (key) => MODULES.find((m) => m.key === key)?.label || key;

const ACTION_CLS = { create: 'chip-green', update: 'chip-blue', delete: 'chip-red', approve: 'chip-purple', export: 'chip-yellow', view: 'chip' };

const columns = [
  { key: 'timestamp', label: 'Timestamp' },
  { key: 'user', label: 'User', render: (r) => <span className="cell-strong">{r.user}</span> },
  { key: 'action', label: 'Action', render: (r) => <span className={`chip ${ACTION_CLS[r.action] || 'chip'}`}>{r.action}</span>, exportValue: (r) => r.action },
  { key: 'module', label: 'Module', render: (r) => moduleLabel(r.module), exportValue: (r) => moduleLabel(r.module) },
  { key: 'previousValue', label: 'Previous', render: (r) => <span style={{ color: 'var(--text-muted)' }}>{r.previousValue}</span> },
  { key: 'newValue', label: 'New' },
  { key: 'ipAddress', label: 'IP address' }
];

export default function AuditLogs() {
  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Administration"
        title="Audit Logs"
        actions={
          <Can perm="audit_logs:export">
            <ExportButtons columns={columns} rows={AUDIT_LOGS} filename="audit-logs" />
          </Can>
        }
      />
      <DataTable
        title="Activity trail"
        subtitle="Every create, update, delete, approve and export is recorded."
        columns={columns}
        rows={AUDIT_LOGS}
        searchKeys={['user', 'action', 'module', 'newValue']}
        searchPlaceholder="Search audit logs…"
        selectable={false}
      />
    </div>
  );
}
