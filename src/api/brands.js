// Brands API — wraps the backend brand endpoints through the shared client.
// All endpoints are scoped to the authenticated user (token sent by the client).
//
//   POST   addBrand            create (name required, unique per account)
//   GET    getBrands           paginated list (records, pageNo, colName, sort, [name], [status])
//   GET    getBrandsDropDown   active brands (id / name)
//   GET    editBrand           fetch one (id)
//   POST   updateBrand         update (id in body)
//   DELETE deleteBrand         delete (id)  — blocked if referenced by items
import { api, getStationId } from './client.js';
import { USE_MOCK } from './config.js';
import { delay, nextId, sortPaginate } from './mock-utils.js';
import { MOCK_BRANDS } from '../data/mock/catalog.js';

// In-memory copy used only while USE_MOCK is true (see src/api/config.js).
let mockBrands = USE_MOCK ? MOCK_BRANDS.map((b) => ({ ...b })) : [];

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

const numOrUndef = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

// UI form values → API payload. Empty optionals are dropped so the backend
// applies its own defaults. The active station id is always included (also sent
// as a Station-Id header by the client).
function toPayload(v = {}) {
  const p = {
    name: v.name,
    status: numOrUndef(v.status),
    description: v.description || undefined,
    image_url: v.image_url || undefined,
    station_id: numOrUndef(v.station_id ?? getStationId())
  };
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
  return p;
}

/**
 * Paginated list.
 * @returns {Promise<{ rows: object[], total: number, currentPage: number, lastPage: number }>}
 */
export async function getBrands({ records = 10, pageNo = 1, colName = 'name', sort = 'asc', name, status, station_id } = {}) {
  if (USE_MOCK) {
    await delay();
    const sid = station_id ?? getStationId();
    let list = mockBrands;
    if (sid) list = list.filter((b) => String(b.station_id) === String(sid));
    if (status !== '' && status !== undefined && status !== null) list = list.filter((b) => String(b.status) === String(status));
    if (name) list = list.filter((b) => String(b.name).toLowerCase().includes(String(name).toLowerCase()));
    const p = sortPaginate(list, { pageNo, records, colName, sort });
    return { rows: p.rows, total: p.total, currentPage: p.currentPage, lastPage: p.lastPage };
  }
  const qs = new URLSearchParams({ records, pageNo, colName, sort });
  if (name) qs.set('name', name);
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  if (status !== '' && status !== undefined && status !== null) qs.set('status', status);
  const res = await api.get(`getBrands?${qs.toString()}`);
  assertOk(res);
  const paginator = res?.brands || {};
  const list = Array.isArray(paginator.data) ? paginator.data : [];
  return {
    rows: list,
    total: Number(paginator.total ?? list.length) || 0,
    currentPage: Number(paginator.current_page ?? pageNo),
    lastPage: Number(paginator.last_page ?? 1)
  };
}

/** Active brands for a <select>: [{ value: id, label: name }]. */
export async function getBrandsDropDown() {
  const sid = getStationId();
  if (USE_MOCK) {
    await delay(120);
    return mockBrands
      .filter((b) => Number(b.status) === 1 && (!sid || String(b.station_id) === String(sid)))
      .map((b) => ({ value: b.id, label: b.name }));
  }
  const res = await api.get(`getBrandsDropDown${sid ? `?station_id=${encodeURIComponent(sid)}` : ''}`);
  assertOk(res);
  const list = Array.isArray(res?.brands) ? res.brands : [];
  return list.map((b) => ({ value: b.id, label: b.name }));
}

/** Fetch one brand for editing. */
export async function editBrand(id) {
  if (USE_MOCK) {
    await delay(120);
    const b = mockBrands.find((x) => String(x.id) === String(id));
    if (!b) throw new Error('Brand not found');
    return { ...b };
  }
  const res = await api.get(`editBrand?id=${encodeURIComponent(id)}`);
  assertOk(res);
  return res?.brand || {};
}

/** Create (name required). */
export async function addBrand(values) {
  if (USE_MOCK) {
    await delay();
    if (mockBrands.some((b) => b.name.toLowerCase() === String(values.name).toLowerCase())) {
      throw new Error('The name has already been taken.');
    }
    const id = nextId();
    mockBrands.unshift({
      id, station_id: Number(getStationId()) || null, name: values.name,
      status: Number(values.status ?? 1), description: values.description || '', image_url: values.image_url || ''
    });
    return { status: 'ok', message: 'Brand added successfully' };
  }
  return assertOk(await api.post('addBrand', toPayload(values)));
}

/** Update (id sent in the body). */
export async function updateBrand(id, values) {
  if (USE_MOCK) {
    await delay();
    const i = mockBrands.findIndex((x) => String(x.id) === String(id));
    if (i < 0) throw new Error('Brand not found');
    mockBrands[i] = { ...mockBrands[i], ...values, id: mockBrands[i].id, status: Number(values.status ?? mockBrands[i].status) };
    return { status: 'ok', message: 'Brand updated successfully' };
  }
  return assertOk(await api.post('updateBrand', { id, ...toPayload(values) }));
}

/** Delete. id sent as both query and body for server compatibility. */
export async function deleteBrand(id) {
  if (USE_MOCK) {
    await delay();
    mockBrands = mockBrands.filter((x) => String(x.id) !== String(id));
    return { status: 'ok', message: 'Brand deleted successfully' };
  }
  const sid = getStationId();
  return assertOk(await api.del(`deleteBrand?id=${encodeURIComponent(id)}`, { body: { id, ...(sid ? { station_id: sid } : {}) } }));
}
