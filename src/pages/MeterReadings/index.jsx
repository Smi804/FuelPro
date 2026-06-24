import { useMemo, useState } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import FormField from '../../components/crud/FormField.jsx';
import DataTable from '../../components/crud/DataTable.jsx';
import Can from '../../auth/Can.jsx';
import { showToast } from '../../v4/toast.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import { PUMPS } from '../../data/mock/pumps.js';
import { METER_READINGS } from '../../data/mock/operations.js';

export default function MeterReadings() {
  const { stations } = useAuth();
  const [rows, setRows] = useState(METER_READINGS);
  const [v, setV] = useState({ stationId: '', pumpId: '', openingReading: '', closingReading: '' });
  const [errors, setErrors] = useState({});

  const set = (name, value) => {
    setV((p) => ({ ...p, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const pumps = useMemo(() => PUMPS.filter((p) => !v.stationId || p.stationId === v.stationId), [v.stationId]);
  const litres = useMemo(() => {
    const o = parseFloat(v.openingReading) || 0;
    const c = parseFloat(v.closingReading) || 0;
    return Math.max(0, c - o);
  }, [v.openingReading, v.closingReading]);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!v.stationId) next.stationId = 'Required';
    if (!v.pumpId) next.pumpId = 'Required';
    if (parseFloat(v.closingReading) < parseFloat(v.openingReading)) next.closingReading = 'Closing must be ≥ opening';
    setErrors(next);
    if (Object.keys(next).length) return;
    const pump = PUMPS.find((p) => p.id === v.pumpId);
    setRows((prev) => [
      {
        id: `mr_${Date.now()}`,
        stationId: v.stationId,
        pumpId: v.pumpId,
        pumpNumber: pump?.pumpNumber || '—',
        openingReading: parseFloat(v.openingReading) || 0,
        closingReading: parseFloat(v.closingReading) || 0,
        litresSold: litres,
        date: new Date().toISOString().slice(0, 10)
      },
      ...prev
    ]);
    showToast(`Reading saved · ${litres.toLocaleString()} L sold`, { variant: 'success' });
    setV({ stationId: '', pumpId: '', openingReading: '', closingReading: '' });
  };

  return (
    <div className="page-wrapper">
      <PageHeader pretitle="Sales" title="Meter Readings" />
      <div className="row col-4-8">
        <Can perm="meter_readings:create" fallback={<div />}>
          <form className="card" style={{ alignSelf: 'flex-start' }} onSubmit={submit} noValidate>
            <div className="card-header"><div className="card-title">Daily reading</div></div>
            <div className="card-body">
              <FormField name="stationId" label="Station" type="select" required value={v.stationId} onChange={set} error={errors.stationId}
                options={stations.map((s) => ({ value: s.id, label: s.name }))} />
              <FormField name="pumpId" label="Pump" type="select" required value={v.pumpId} onChange={set} error={errors.pumpId}
                options={pumps.map((p) => ({ value: p.id, label: `${p.pumpNumber} · ${p.fuelType}` }))} />
              <div className="form-row">
                <FormField name="openingReading" label="Opening reading" type="number" min="0" value={v.openingReading} onChange={set} />
                <FormField name="closingReading" label="Closing reading" type="number" min="0" value={v.closingReading} onChange={set} error={errors.closingReading} />
              </div>
              <div className="form-group">
                <label className="form-label">Litres sold (calculated)</label>
                <input className="form-control" readOnly value={`${litres.toLocaleString()} L`} />
              </div>
              <button className="btn btn-primary" type="submit" style={{ width: '100%' }}>Save reading</button>
            </div>
          </form>
        </Can>

        <DataTable
          title="Recent readings"
          rows={rows}
          searchKeys={['pumpNumber']}
          selectable={false}
          enableColumnToggle={false}
          columns={[
            { key: 'date', label: 'Date' },
            { key: 'pumpNumber', label: 'Pump' },
            { key: 'openingReading', label: 'Opening', align: 'right', render: (r) => r.openingReading.toLocaleString() },
            { key: 'closingReading', label: 'Closing', align: 'right', render: (r) => r.closingReading.toLocaleString() },
            { key: 'litresSold', label: 'Litres sold', align: 'right', render: (r) => `${r.litresSold.toLocaleString()} L` }
          ]}
        />
      </div>
    </div>
  );
}
