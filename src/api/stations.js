// Stations API — wraps the backend station endpoints through the shared client.
// All endpoints are scoped to the authenticated user (token sent by the client).
//
//   GET    getStations          paginated list (records, pageNo, colName, sort, [status])
//   GET    getStationsDropDown  id / name / code list
//   POST   addStation           create (name + code required)
//   GET    editStation          fetch one (id)
//   POST   updateStation        update (id in body)
//   DELETE deleteStation        delete (id)
import { api } from './client.js';
import { USE_MOCK } from './config.js';
import { delay, nextId, sortPaginate } from './mock-utils.js';
import { MOCK_STATIONS } from '../data/mock/catalog.js';

// In-memory copy used only while USE_MOCK is true (see src/api/config.js).
let mockStations = USE_MOCK ? MOCK_STATIONS.map((s) => ({ ...s })) : [];

// Backend returns `{ status: 'error', message }` (HTTP 200) for business/validation
// failures — surface those as thrown errors so callers can show the message.
function assertOk(res) {
  if (res && res.status === 'error') {
    const err = new Error(res.message || 'Request failed.');
    err.data = res;
    throw err;
  }
  return res;
}

const bool = (v) => v === true || v === 1 || v === '1' || v === 'true';
const numOrUndef = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));
const toDateInput = (v) => (v ? String(v).slice(0, 10) : ''); // ISO datetime → YYYY-MM-DD

// API station → UI shape. The API is already snake_case; we normalize the date
// for date inputs and coerce the boolean flags.
function mapStation(r = {}) {
  return {
    ...r,
    last_inspection_date: toDateInput(r.last_inspection_date),
    is_24_hours: bool(r.is_24_hours),
    shift_based_operation: bool(r.shift_based_operation),
    auto_close_shift: bool(r.auto_close_shift),
    epa_enabled: bool(r.epa_enabled)
  };
}

// UI form values → API payload. Optional empties are dropped so the backend
// applies its own defaults; booleans are always sent as true/false.
function toPayload(v = {}) {
  const p = {
    name: v.name,
    code: v.code,
    brand: v.brand || undefined,
    status: v.status || undefined,
    address: v.address || undefined,
    city: v.city || undefined,
    state: v.state || undefined,
    zip_code: v.zip_code || undefined,
    country: v.country || undefined,
    latitude: numOrUndef(v.latitude),
    longitude: numOrUndef(v.longitude),
    timezone: v.timezone || undefined,
    phone: v.phone || undefined,
    email: v.email || undefined,
    manager_name: v.manager_name || undefined,
    is_24_hours: bool(v.is_24_hours),
    shift_based_operation: bool(v.shift_based_operation),
    auto_close_shift: bool(v.auto_close_shift),
    fuel_unit: v.fuel_unit || undefined,
    default_tax_rate: numOrUndef(v.default_tax_rate),
    low_fuel_threshold_percent: numOrUndef(v.low_fuel_threshold_percent),
    inventory_method: v.inventory_method || undefined,
    epa_enabled: bool(v.epa_enabled),
    last_inspection_date: v.last_inspection_date || undefined
  };
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
  return p;
}

/**
 * Paginated list.
 * @param {{ records?: number, pageNo?: number, colName?: string, sort?: 'asc'|'desc', status?: string }} params
 * @returns {Promise<{ rows: object[], total: number, currentPage: number, lastPage: number }>}
 */
export async function getStations({ records = 10, pageNo = 1, colName = 'name', sort = 'asc', status } = {}) {
  if (USE_MOCK) {
    await delay();
    const list = status ? mockStations.filter((s) => s.status === status) : mockStations;
    const p = sortPaginate(list, { pageNo, records, colName, sort });
    return { rows: p.rows.map(mapStation), total: p.total, currentPage: p.currentPage, lastPage: p.lastPage };
  }
  const qs = new URLSearchParams({ records, pageNo, colName, sort });
  if (status) qs.set('status', status);
  const res = await api.get(`getStations?${qs.toString()}`);
  assertOk(res);
  const paginator = res?.stations || {};
  const list = Array.isArray(paginator.data) ? paginator.data : [];
  return {
    rows: list.map(mapStation),
    total: Number(paginator.total ?? list.length) || 0,
    currentPage: Number(paginator.current_page ?? pageNo),
    lastPage: Number(paginator.last_page ?? 1)
  };
}

/** Lightweight dropdown options: [{ value: id, label: name, code }]. */
export async function getStationsDropDown() {
  if (USE_MOCK) {
    await delay(120);
    return mockStations.map((s) => ({ value: s.id, label: s.name, code: s.code }));
  }
  const res = await api.get('getStationsDropDown');
  assertOk(res);
  const list = Array.isArray(res?.stations) ? res.stations : [];
  return list.map((s) => ({ value: s.id, label: s.name, code: s.code }));
}

/** Fetch one station for editing. */
export async function editStation(id) {
  if (USE_MOCK) {
    await delay(120);
    const s = mockStations.find((x) => String(x.id) === String(id));
    if (!s) throw new Error('Station not found');
    return mapStation(s);
  }
  const res = await api.get(`editStation?id=${encodeURIComponent(id)}`);
  assertOk(res);
  return mapStation(res?.station || {});
}

/** Create (name + code required). */
export async function addStation(values) {
  if (USE_MOCK) {
    await delay();
    const id = nextId();
    mockStations.unshift({ id, code: `STN-${String(id).padStart(4, '0')}`, status: values.status || 'active', ...values });
    return { status: 'ok', message: 'Station added successfully' };
  }
  return assertOk(await api.post('addStation', toPayload(values)));
}

/** Update (id sent in the body). */
export async function updateStation(id, values) {
  if (USE_MOCK) {
    await delay();
    const i = mockStations.findIndex((x) => String(x.id) === String(id));
    if (i < 0) throw new Error('Station not found');
    mockStations[i] = { ...mockStations[i], ...values, id: mockStations[i].id };
    return { status: 'ok', message: 'Station updated successfully' };
  }
  return assertOk(await api.post('updateStation', { id, ...toPayload(values) }));
}

/** Delete. id sent as both query and body for server compatibility. */
export async function deleteStation(id) {
  if (USE_MOCK) {
    await delay();
    mockStations = mockStations.filter((x) => String(x.id) !== String(id));
    return { status: 'ok', message: 'Station deleted successfully' };
  }
  return assertOk(await api.del(`deleteStation?id=${encodeURIComponent(id)}`, { body: { id } }));
}

export { mapStation, toPayload };
