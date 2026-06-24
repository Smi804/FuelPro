import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../../../components/PageHeader.jsx';
import FormField from '../../../components/crud/FormField.jsx';
import { showToast } from '../../../v4/toast.js';
import { useAuth } from '../../../auth/AuthContext.jsx';
import { EMPLOYEES } from '../../../data/mock/people.js';

export default function StartShift() {
  const navigate = useNavigate();
  const { stations } = useAuth();
  const [v, setV] = useState({ employeeId: '', stationId: '', openingCash: '' });
  const [errors, setErrors] = useState({});
  const set = (n, val) => {
    setV((p) => ({ ...p, [n]: val }));
    setErrors((e) => ({ ...e, [n]: undefined }));
  };

  const submit = (e) => {
    e.preventDefault();
    const next = {};
    if (!v.employeeId) next.employeeId = 'Required';
    if (!v.stationId) next.stationId = 'Required';
    if (v.openingCash === '') next.openingCash = 'Required';
    setErrors(next);
    if (Object.keys(next).length) return;
    showToast('Shift started', { variant: 'success' });
    navigate('/shifts/reports');
  };

  return (
    <div className="page-wrapper">
      <PageHeader pretitle="Shift Management" title="Start Shift" />
      <form className="card" style={{ maxWidth: 560 }} onSubmit={submit} noValidate>
        <div className="card-header"><div className="card-title">Open a new shift</div></div>
        <div className="card-body">
          <FormField name="employeeId" label="Employee" type="select" required value={v.employeeId} onChange={set} error={errors.employeeId}
            options={EMPLOYEES.filter((e) => e.status === 'active').map((e) => ({ value: e.id, label: e.name }))} />
          <FormField name="stationId" label="Station" type="select" required value={v.stationId} onChange={set} error={errors.stationId}
            options={stations.map((s) => ({ value: s.id, label: s.name }))} />
          <FormField name="openingCash" label="Opening cash ($)" type="number" min="0" step="0.01" required value={v.openingCash} onChange={set} error={errors.openingCash} />
          <button className="btn btn-primary" type="submit">Start shift</button>
        </div>
      </form>
    </div>
  );
}
