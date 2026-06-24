import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';
import FormField from '../../../components/crud/FormField.jsx';
import { showToast } from '../../../v4/toast.js';
import { SHIFTS } from '../../../data/mock/operations.js';

export default function EndShift() {
  const navigate = useNavigate();
  const open = SHIFTS.filter((s) => s.status === 'open');
  const [v, setV] = useState({ shiftId: '', closingCash: '', expenses: '0', notes: '' });
  const [errors, setErrors] = useState({});
  const set = (n, val) => {
    setV((p) => ({ ...p, [n]: val }));
    setErrors((e) => ({ ...e, [n]: undefined }));
  };

  const shift = useMemo(() => open.find((s) => s.id === v.shiftId), [v.shiftId, open]);
  const cashDiff = useMemo(() => {
    if (!shift) return 0;
    return (parseFloat(v.closingCash) || 0) - shift.openingCash - (parseFloat(v.expenses) || 0);
  }, [shift, v.closingCash, v.expenses]);

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!v.shiftId) next.shiftId = 'Select an open shift';
    if (v.closingCash === '') next.closingCash = 'Required';
    setErrors(next);
    if (Object.keys(next).length) return;
    showToast(`Shift closed · cash difference $${cashDiff.toFixed(2)}`, { variant: cashDiff < 0 ? 'danger' : 'success' });
    navigate('/shifts/reports');
  };

  return (
    <div className="page-wrapper">
      <PageHeader pretitle="Shift Management" title="End Shift" />
      <form className="card" style={{ maxWidth: 560 }} onSubmit={submit} noValidate>
        <div className="card-header"><div className="card-title">Close an open shift</div></div>
        <div className="card-body">
          <FormField name="shiftId" label="Open shift" type="select" required value={v.shiftId} onChange={set} error={errors.shiftId}
            options={open.map((s) => ({ value: s.id, label: `${s.employeeName} · ${s.stationName} (opened ${s.startedAt.split(' ')[1]})` }))} />
          {shift && (
            <div className="form-group">
              <label className="form-label">Opening cash</label>
              <input className="form-control" readOnly value={`$${shift.openingCash.toFixed(2)}`} />
            </div>
          )}
          <div className="form-row">
            <FormField name="closingCash" label="Closing cash ($)" type="number" min="0" step="0.01" required value={v.closingCash} onChange={set} error={errors.closingCash} />
            <FormField name="expenses" label="Expenses ($)" type="number" min="0" step="0.01" value={v.expenses} onChange={set} />
          </div>
          <div className="form-group">
            <label className="form-label">Cash difference (calculated)</label>
            <input className="form-control" readOnly value={`$${cashDiff.toFixed(2)}`} style={{ color: cashDiff < 0 ? 'var(--red)' : 'var(--green)' }} />
          </div>
          <FormField name="notes" label="Notes" type="textarea" value={v.notes} onChange={set} />
          <button className="btn btn-primary" type="submit">End shift</button>
        </div>
      </form>
    </div>
  );
}
