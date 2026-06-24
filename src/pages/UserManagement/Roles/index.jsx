import PageHeader from '../../../components/PageHeader.jsx';
import { ROLE_LIST, ROLE_BADGE_CLS } from '../../../domain/roles.js';
import { permissionsForRole, MODULES } from '../../../domain/permissions.js';
import { USERS } from '../../../data/mock/system.js';

export default function Roles() {
  return (
    <div className="page-wrapper">
      <PageHeader pretitle="Administration" title="Roles" />
      <div className="row col-3">
        {ROLE_LIST.map((role) => {
          const perms = permissionsForRole(role.key);
          const moduleCount = new Set(perms.map((p) => p.split(':')[0])).size;
          const userCount = USERS.filter((u) => u.role === role.key).length;
          return (
            <div className="card" key={role.key}>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <span className={`role-chip ${ROLE_BADGE_CLS[role.key]}`} style={{ alignSelf: 'flex-start' }}>{role.label}</span>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', minHeight: 38 }}>{role.description}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 12.5, color: 'var(--text-muted)' }}>
                  <span><strong style={{ color: 'var(--text)' }}>{moduleCount}</strong> modules</span>
                  <span><strong style={{ color: 'var(--text)' }}>{perms.length}</strong> permissions</span>
                  <span><strong style={{ color: 'var(--text)' }}>{userCount}</strong> users</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
        {MODULES.length} modules are governed by role-based access control. See the Permissions matrix for a full breakdown.
      </p>
    </div>
  );
}
