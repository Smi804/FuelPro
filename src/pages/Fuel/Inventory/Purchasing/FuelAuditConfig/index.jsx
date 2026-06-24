import { useState } from 'react';
import PageHeader from '../../../../../components/PageHeader.jsx';
import FormField from '../../../../../components/crud/FormField.jsx';
import Toggle from '../../../../../components/Toggle.jsx';
import { showToast } from '../../../../../v4/toast.js';

export default function FuelAuditConfig() {
  const [v, setV] = useState({ flagPct: '2', failPct: '5', frequency: 'daily', dipMethod: 'atg' });
  const [requireApproval, setRequireApproval] = useState(true);
  const [autoLock, setAutoLock] = useState(false);
  const set = (n, val) => setV((p) => ({ ...p, [n]: val }));

  const save = (e) => {
    e.preventDefault();
    showToast('Audit configuration saved', { variant: 'success' });
  };

  return (
    <div className="page-wrapper">
      <PageHeader pretitle="Fuel · Purchasing" title="Fuel Audit Config" />
      <form className="card" style={{ maxWidth: 620 }} onSubmit={save}>
        <div className="card-header"><div className="card-title">Audit thresholds & rules</div></div>
        <div className="card-body">
          <div className="form-row">
            <FormField name="flagPct" label="Flag variance above (%)" type="number" min="0" step="0.1" value={v.flagPct} onChange={set} hint="Variance over this is flagged for review." />
            <FormField name="failPct" label="Fail variance above (%)" type="number" min="0" step="0.1" value={v.failPct} onChange={set} hint="Variance over this fails the audit." />
          </div>
          <div className="form-row">
            <FormField name="frequency" label="Audit frequency" type="select" value={v.frequency} onChange={set}
              options={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]} />
            <FormField name="dipMethod" label="Measurement method" type="select" value={v.dipMethod} onChange={set}
              options={[{ value: 'atg', label: 'ATG (automatic)' }, { value: 'manual', label: 'Manual dip' }]} />
          </div>
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label className="form-label" style={{ marginBottom: 2 }}>Require manager approval</label>
              <div className="form-hint">Flagged & failed audits must be approved before closing.</div>
            </div>
            <Toggle on={requireApproval} onChange={setRequireApproval} />
          </div>
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label className="form-label" style={{ marginBottom: 2 }}>Auto-lock tank on failure</label>
              <div className="form-hint">Disable sales from a tank until a failed audit is resolved.</div>
            </div>
            <Toggle on={autoLock} onChange={setAutoLock} />
          </div>
          <button className="btn btn-primary" type="submit">Save configuration</button>
        </div>
      </form>
    </div>
  );
}
