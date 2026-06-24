import { useState } from 'react';
import PageHeader from '../../../components/PageHeader.jsx';
import { MODULES, ACTIONS, can } from '../../../domain/permissions.js';
import { ROLE_LIST } from '../../../domain/roles.js';

const Check = ({ on }) =>
  on ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5">
      <path d="M5 12l4 4 10-10" />
    </svg>
  ) : (
    <span style={{ color: 'var(--text-disabled)' }}>—</span>
  );

export default function Permissions() {
  const [role, setRole] = useState(ROLE_LIST[1].key);

  return (
    <div className="page-wrapper">
      <PageHeader
        pretitle="Administration"
        title="Permissions"
        actions={
          <select className="form-control" style={{ width: 'auto' }} value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLE_LIST.map((r) => (
              <option key={r.key} value={r.key}>{r.label}</option>
            ))}
          </select>
        }
      />
      <div className="card">
        <div className="card-header">
          <div className="card-title">Permission matrix</div>
          <div className="card-subtitle">Role-based access control (View / Create / Update / Delete / Export / Approve)</div>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Module</th>
                {ACTIONS.map((a) => (
                  <th key={a} style={{ textAlign: 'center', textTransform: 'capitalize' }}>{a}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((m) => (
                <tr key={m.key}>
                  <td className="cell-strong">{m.label}</td>
                  {ACTIONS.map((a) => (
                    <td key={a} style={{ textAlign: 'center' }}>
                      <Check on={can(role, `${m.key}:${a}`)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
