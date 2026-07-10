import { useState, useEffect, useCallback } from 'react';
import PageHeader from '../../../../../components/PageHeader.jsx';
import FormField from '../../../../../components/crud/FormField.jsx';
import Toggle from '../../../../../components/Toggle.jsx';
import { useAuth } from '../../../../../auth/AuthContext.jsx';
import { showToast } from '../../../../../v4/toast.js';
import { DEFAULT_CONFIG, getFuelAuditConfig, updateFuelAuditConfig } from '../../../../../api/fuelAuditConfig.js';

export default function FuelAuditConfig() {
  const { can, activeStationId } = useAuth();
  const canUpdate = can('fuel_audit_config:update');

  const [v, setV] = useState({ ...DEFAULT_CONFIG });
  const [requireApproval, setRequireApproval] = useState(DEFAULT_CONFIG.requireApproval);
  const [autoLock, setAutoLock] = useState(DEFAULT_CONFIG.autoLock);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const set = (n, val) => setV((p) => ({ ...p, [n]: val }));

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const cfg = await getFuelAuditConfig();
      setV({
        flagPct: cfg.flagPct,
        failPct: cfg.failPct,
        frequency: cfg.frequency,
        dipMethod: cfg.dipMethod
      });
      setRequireApproval(cfg.requireApproval);
      setAutoLock(cfg.autoLock);
    } catch (err) {
      showToast(err?.message || 'Failed to load audit configuration', { variant: 'danger' });
    } finally {
      setLoading(false);
    }
  }, [activeStationId]);

  useEffect(() => {
    load();
  }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (!canUpdate) return;
    setSaving(true);
    try {
      await updateFuelAuditConfig({
        ...v,
        requireApproval,
        autoLock
      });
      showToast('Audit configuration saved', { variant: 'success' });
      await load();
    } catch (err) {
      showToast(err?.message || 'Failed to save audit configuration', { variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <PageHeader pretitle="Fuel  " title="Fuel Audit Config" />
      <form className="card" style={{ maxWidth: 620 }} onSubmit={save}>
        <div className="card-header"><div className="card-title">Audit thresholds & rules</div></div>
        <div className="card-body">
          {loading ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13.5 }}>Loading configuration…</p>
          ) : (
            <>
              <div className="form-row">
                <FormField name="flagPct" label="Flag variance above (%)" type="number" min="0" step="0.1" value={v.flagPct} onChange={set} hint="Variance over this is flagged for review." readOnly={!canUpdate} />
                <FormField name="failPct" label="Fail variance above (%)" type="number" min="0" step="0.1" value={v.failPct} onChange={set} hint="Variance over this fails the audit." readOnly={!canUpdate} />
              </div>
              <div className="form-row">
                <FormField name="frequency" label="Audit frequency" type="select" value={v.frequency} onChange={set} readOnly={!canUpdate}
                  options={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]} />
                <FormField name="dipMethod" label="Measurement method" type="select" value={v.dipMethod} onChange={set} readOnly={!canUpdate}
                  options={[{ value: 'atg', label: 'ATG (automatic)' }, { value: 'manual', label: 'Manual dip' }]} />
              </div>
              <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label className="form-label" style={{ marginBottom: 2 }}>Require manager approval</label>
                  <div className="form-hint">Flagged & failed audits must be approved before closing.</div>
                </div>
                <Toggle on={requireApproval} onChange={canUpdate ? setRequireApproval : undefined} />
              </div>
              <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <label className="form-label" style={{ marginBottom: 2 }}>Auto-lock tank on failure</label>
                  <div className="form-hint">Disable sales from a tank until a failed audit is resolved.</div>
                </div>
                <Toggle on={autoLock} onChange={canUpdate ? setAutoLock : undefined} />
              </div>
              {canUpdate && (
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving…' : 'Save configuration'}
                </button>
              )}
            </>
          )}
        </div>
      </form>
    </div>
  );
}
