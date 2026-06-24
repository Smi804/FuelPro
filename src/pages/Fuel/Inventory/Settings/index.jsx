import { useState } from 'react';
import PageHeader from '../../../../components/PageHeader.jsx';
import FormField from '../../../../components/crud/FormField.jsx';
import Toggle from '../../../../components/Toggle.jsx';
import { showToast } from '../../../../v4/toast.js';

export default function FuelInventorySettings() {
  const [v, setV] = useState({ valuation: 'weighted_avg', unit: 'L', lowStockPct: '15', reorderPct: '25' });
  const [autoReorder, setAutoReorder] = useState(true);
  const set = (n, val) => setV((p) => ({ ...p, [n]: val }));

  const save = (e) => {
    e.preventDefault();
    showToast('Inventory settings saved', { variant: 'success' });
  };

  return (
    <div className="page-wrapper">
      <PageHeader pretitle="Fuel · Inventory" title="Settings" />
      <form className="card" style={{ maxWidth: 620 }} onSubmit={save}>
        <div className="card-header"><div className="card-title">Fuel inventory settings</div></div>
        <div className="card-body">
          <div className="form-row">
            <FormField name="valuation" label="Valuation method" type="select" value={v.valuation} onChange={set}
              options={[{ value: 'weighted_avg', label: 'Weighted average' }, { value: 'fifo', label: 'FIFO' }, { value: 'lifo', label: 'LIFO' }]} />
            <FormField name="unit" label="Default unit" type="select" value={v.unit} onChange={set}
              options={[{ value: 'L', label: 'Litres (L)' }, { value: 'kg', label: 'Kilograms (kg)' }, { value: 'gal', label: 'Gallons (gal)' }]} />
          </div>
          <div className="form-row">
            <FormField name="lowStockPct" label="Low-stock alert (%)" type="number" min="0" value={v.lowStockPct} onChange={set} />
            <FormField name="reorderPct" label="Reorder point (%)" type="number" min="0" value={v.reorderPct} onChange={set} />
          </div>
          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label className="form-label" style={{ marginBottom: 2 }}>Automatic reorder</label>
              <div className="form-hint">Create draft purchase invoices when a tank hits its reorder point.</div>
            </div>
            <Toggle on={autoReorder} onChange={setAutoReorder} />
          </div>
          <button className="btn btn-primary" type="submit">Save settings</button>
        </div>
      </form>
    </div>
  );
}
