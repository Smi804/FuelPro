import { useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import FormField from '../../components/crud/FormField.jsx';
import Toggle from '../../components/Toggle.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import { showToast } from '../../v4/toast.js';

export default function Settings() {
  const { theme, toggle } = useTheme();
  const [v, setV] = useState({
    orgName: 'Fuel-Pro Holdings',
    currency: 'EUR',
    timezone: 'Europe/Riga',
    lowStockThreshold: '10',
    invoicePrefix: 'INV-'
  });
  const set = (n, val) => setV((p) => ({ ...p, [n]: val }));

  const save = (e) => {
    e.preventDefault();
    showToast('Settings saved', { variant: 'success' });
  };

  return (
    <div className="page-wrapper">
      <PageHeader pretitle="Administration" title="Settings" />
      <form onSubmit={save}>
        <div className="row col-2">
          <div className="card">
            <div className="card-header"><div className="card-title">Organization</div></div>
            <div className="card-body">
              <FormField name="orgName" label="Organization name" value={v.orgName} onChange={set} required />
              <div className="form-row">
                <FormField name="currency" label="Currency" type="select" value={v.currency} onChange={set}
                  options={[{ value: 'EUR', label: 'EUR ($)' }, { value: 'USD', label: 'USD ($)' }, { value: 'GBP', label: 'GBP (£)' }]} />
                <FormField name="timezone" label="Timezone" type="select" value={v.timezone} onChange={set}
                  options={[{ value: 'Europe/Riga', label: 'Europe/Riga' }, { value: 'UTC', label: 'UTC' }, { value: 'Europe/London', label: 'Europe/London' }]} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><div className="card-title">Operations</div></div>
            <div className="card-body">
              <FormField name="lowStockThreshold" label="Default low-stock threshold (%)" type="number" min="0" value={v.lowStockThreshold} onChange={set} />
              <FormField name="invoicePrefix" label="Invoice number prefix" value={v.invoicePrefix} onChange={set} />
              <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>Dark mode</label>
                <Toggle on={theme === 'dark'} onChange={toggle} />
              </div>
            </div>
          </div>
        </div>
        <button className="btn btn-primary" type="submit">Save changes</button>
      </form>
    </div>
  );
}
