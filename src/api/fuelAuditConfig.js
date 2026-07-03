// Fuel audit config API — station-scoped thresholds & rules.
//
//   GET  getFuelAuditConfig   fetch saved config ([station_id])
//   POST updateFuelAuditConfig update config (station_id in body)
import { api, getStationId } from './client.js';
import { USE_MOCK } from './config.js';
import { delay } from './mock-utils.js';

const DEFAULT_CONFIG = {
  flagPct: '2',
  failPct: '5',
  frequency: 'daily',
  dipMethod: 'atg',
  requireApproval: true,
  autoLock: false
};

let mockConfig = { ...DEFAULT_CONFIG };

function assertOk(res) {
  if (res && res.status === 'error') {
    const err = new Error(res.message || 'Request failed.');
    err.data = res;
    throw err;
  }
  return res;
}

const bool = (v) => v === true || v === 1 || v === '1' || v === 'true';

// API config → UI form shape.
export function mapFuelAuditConfig(r = {}) {
  return {
    id: r.id,
    station_id: r.station_id,
    flagPct: r.flag_pct != null ? String(r.flag_pct) : DEFAULT_CONFIG.flagPct,
    failPct: r.fail_pct != null ? String(r.fail_pct) : DEFAULT_CONFIG.failPct,
    frequency: r.frequency || r.audit_frequency || DEFAULT_CONFIG.frequency,
    dipMethod: r.dip_method || r.measurement_method || DEFAULT_CONFIG.dipMethod,
    requireApproval: r.require_approval != null ? bool(r.require_approval) : DEFAULT_CONFIG.requireApproval,
    autoLock: r.auto_lock != null ? bool(r.auto_lock) : DEFAULT_CONFIG.autoLock
  };
}

// UI form → API payload.
function toPayload(v = {}) {
  const sid = getStationId();
  return {
    ...(sid ? { station_id: sid } : {}),
    flag_pct: v.flagPct,
    fail_pct: v.failPct,
    frequency: v.frequency,
    dip_method: v.dipMethod,
    require_approval: v.requireApproval ? 1 : 0,
    auto_lock: v.autoLock ? 1 : 0
  };
}

/** Load saved audit config for the active station. */
export async function getFuelAuditConfig({ station_id } = {}) {
  if (USE_MOCK) {
    await delay(120);
    return mapFuelAuditConfig({ ...mockConfig, station_id: station_id ?? getStationId() });
  }
  const qs = new URLSearchParams();
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await api.get(`getFuelAuditConfig${suffix}`);
  assertOk(res);
  const raw = res?.config || res?.fuel_audit_config || res?.FuelAuditConfig || {};
  return mapFuelAuditConfig(raw);
}

/** Persist audit config for the active station. */
export async function updateFuelAuditConfig(values = {}) {
  if (USE_MOCK) {
    await delay();
    mockConfig = {
      flagPct: values.flagPct,
      failPct: values.failPct,
      frequency: values.frequency,
      dipMethod: values.dipMethod,
      requireApproval: values.requireApproval,
      autoLock: values.autoLock
    };
    return { status: 'ok', message: 'Audit configuration saved successfully' };
  }
  return assertOk(await api.post('updateFuelAuditConfig', toPayload(values)));
}

export { DEFAULT_CONFIG };
