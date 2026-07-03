// Items API — wraps the backend item endpoints through the shared client.
// All endpoints are scoped to the authenticated user (token sent by the client).
//
//   POST   addItem            create (name + type required; sku required when RETAIL)
//   POST   updateItem         update (id in body)
//   GET    getItems           paginated list (records, pageNo, colName, sort, [name], [type], [category_id], [station_id], [status])
//   GET    itemDetails        fetch one with category + station (id)
//   GET    editItem           fetch one for editing (id)
//   GET    getItemsDropDown   id / name list ([type], [category_id], [station_id], [user_id])
//   DELETE deleteItem         delete (id)  — blocked if referenced
import { api, getStationId } from './client.js';
import { USE_MOCK } from './config.js';
import { delay, nextId, sortPaginate } from './mock-utils.js';
import { MOCK_ITEMS, MOCK_STATIONS } from '../data/mock/catalog.js';

// In-memory copy used only while USE_MOCK is true (see src/api/config.js).
let mockItems = USE_MOCK ? MOCK_ITEMS.map((i) => ({ ...i })) : [];
const stationName = (sid) => MOCK_STATIONS.find((s) => String(s.id) === String(sid)) || null;

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

// API item → UI shape. Adds flat `category_name` / `station_name` for table cells.
function mapItem(r = {}) {
  return {
    ...r,
    category_name: r.category?.name ?? '',
    station_name: r.station?.name ?? ''
  };
}

// UI form values → API payload. Empty optionals are dropped so the backend
// applies its own defaults.
function toPayload(v = {}) {
  const p = {
    name: v.name,
    type: v.type,
    sku: v.sku || undefined,
    barcode: v.barcode || undefined,
    description: v.description || undefined,
    image_url: v.image_url || undefined,
    category_id: numOrUndef(v.category_id),
    brand_id: numOrUndef(v.brand_id),
    station_id: numOrUndef(v.station_id),
    status: numOrUndef(v.status)
  };
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
  return p;
}

/**
 * Paginated list.
 * @returns {Promise<{ rows: object[], total: number, currentPage: number, lastPage: number }>}
 */
export async function getItems({ records = 10, pageNo = 1, colName = 'name', sort = 'asc', name, type, category_id, station_id, status } = {}) {
  if (USE_MOCK) {
    await delay();
    const sid = station_id ?? getStationId();
    let list = mockItems;
    if (sid) list = list.filter((i) => String(i.station_id) === String(sid));
    if (type) list = list.filter((i) => i.type === type);
    if (status !== '' && status !== undefined && status !== null) list = list.filter((i) => String(i.status) === String(status));
    if (name) list = list.filter((i) => String(i.name).toLowerCase().includes(String(name).toLowerCase()));
    const p = sortPaginate(list, { pageNo, records, colName, sort });
    return { rows: p.rows.map(mapItem), total: p.total, currentPage: p.currentPage, lastPage: p.lastPage };
  }
  const qs = new URLSearchParams({ records, pageNo, colName, sort });
  if (name) qs.set('name', name);
  if (type) qs.set('type', type);
  if (category_id) qs.set('category_id', category_id);
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  if (status !== '' && status !== undefined && status !== null) qs.set('status', status);
  const res = await api.get(`getItems?${qs.toString()}`);
  assertOk(res);
  const paginator = res?.Items || res?.items || {};
  const list = Array.isArray(paginator.data) ? paginator.data : [];
  return {
    rows: list.map(mapItem),
    total: Number(paginator.total ?? list.length) || 0,
    currentPage: Number(paginator.current_page ?? pageNo),
    lastPage: Number(paginator.last_page ?? 1)
  };
}

/** Full details (with category + station). */
export async function itemDetails(id) {
  if (USE_MOCK) {
    await delay(120);
    const it = mockItems.find((x) => String(x.id) === String(id));
    if (!it) throw new Error('Item not found');
    return mapItem(it);
  }
  const res = await api.get(`itemDetails?id=${encodeURIComponent(id)}`);
  assertOk(res);
  return mapItem(res?.Item || {});
}

/** Fetch one item for editing. */
export async function editItem(id) {
  if (USE_MOCK) {
    await delay(120);
    const it = mockItems.find((x) => String(x.id) === String(id));
    if (!it) throw new Error('Item not found');
    return mapItem(it);
  }
  const res = await api.get(`editItem?id=${encodeURIComponent(id)}`);
  assertOk(res);
  return mapItem(res?.item || {});
}

/** Dropdown options: [{ value: id, label: name }]. */
export async function getItemsDropDown({ type, category_id, station_id, userId, user_id } = {}) {
  if (USE_MOCK) {
    await delay(120);
    const sid = station_id ?? getStationId();
    let list = mockItems;
    if (sid) list = list.filter((i) => String(i.station_id) === String(sid));
    if (type) list = list.filter((i) => i.type === type);
    return list.map((i) => ({ value: i.id, label: i.name }));
  }
  const qs = new URLSearchParams();
  if (type) qs.set('type', type);
  if (category_id) qs.set('category_id', category_id);
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  const uid = user_id ?? userId;
  if (uid != null && uid !== '') qs.set('user_id', uid);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await api.get(`getItemsDropDown${suffix}`);
  assertOk(res);
  const list = Array.isArray(res?.items) ? res.items : [];
  return list.map((i) => ({ value: i.id, label: i.name }));
}

// Ensure the active station id is part of the payload (also sent as a header by
// the client). Explicit values win; falls back to the topbar station.
function withStation(values) {
  return { ...values, station_id: values.station_id ?? getStationId() ?? undefined };
}

/** Create (name + type required; sku required when RETAIL). */
export async function addItem(values) {
  if (USE_MOCK) {
    await delay();
    const v = withStation(values);
    if (v.type === 'RETAIL' && !v.sku) throw new Error('The sku field is required when type is RETAIL.');
    const id = nextId();
    const st = stationName(v.station_id);
    mockItems.unshift({
      id, station_id: v.station_id ?? null, category_id: v.category_id ?? null, brand_id: v.brand_id ?? null,
      name: v.name, type: v.type, sku: v.sku || null, barcode: v.barcode || null,
      status: Number(v.status ?? 1), description: v.description || '', image_url: v.image_url || '',
      category: null, station: st ? { id: st.id, name: st.name, code: st.code } : null
    });
    return { status: 'ok', message: 'Item added successfully' };
  }
  return assertOk(await api.post('addItem', toPayload(withStation(values))));
}

/** Update (id sent in the body). */
export async function updateItem(id, values) {
  if (USE_MOCK) {
    await delay();
    const i = mockItems.findIndex((x) => String(x.id) === String(id));
    if (i < 0) throw new Error('Item not found');
    const v = withStation(values);
    const st = stationName(v.station_id ?? mockItems[i].station_id);
    mockItems[i] = {
      ...mockItems[i], ...v, id: mockItems[i].id, status: Number(v.status ?? mockItems[i].status),
      station: st ? { id: st.id, name: st.name, code: st.code } : mockItems[i].station
    };
    return { status: 'ok', message: 'Item updated successfully' };
  }
  return assertOk(await api.post('updateItem', { id, ...toPayload(withStation(values)) }));
}

/** Delete. id sent as both query and body for server compatibility. */
export async function deleteItem(id) {
  if (USE_MOCK) {
    await delay();
    mockItems = mockItems.filter((x) => String(x.id) !== String(id));
    return { status: 'ok', message: 'Item deleted successfully' };
  }
  const sid = getStationId();
  return assertOk(await api.del(`deleteItem?id=${encodeURIComponent(id)}`, { body: { id, ...(sid ? { station_id: sid } : {}) } }));
}

export { mapItem, toPayload };
