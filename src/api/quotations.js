// Daily supplier quotations API — station-scoped price lists per supplier per day.
//
//   GET    getQuotations   list ([station_id], [supplier_id], [date], [date_from], [date_to])
//   GET    getQuotation    view one
//   GET    editQuotation   load for form
//   POST   addQuotation    create
//   POST   updateQuotation update (replaces line items)
//   DELETE deleteQuotation delete
import { api, getStationId } from './client.js';
import { USE_MOCK } from './config.js';
import { delay, nextId } from './mock-utils.js';

let mockQuotations = USE_MOCK
  ? [
      {
        id: 1,
        station_id: 1,
        supplier_id: 3,
        date: '2026-07-03',
        remarks: 'Rack prices',
        supplier: { id: 3, name: 'NordFuel Supply' },
        quotation_children: [
          { id: 1, item_id: 1, price: 1.42, item: { id: 1, name: 'Diesel', sku: 'DSL-01' } },
          { id: 2, item_id: 2, price: 1.58, item: { id: 2, name: 'Petrol 95', sku: 'P95' } }
        ]
      }
    ]
  : [];

function assertOk(res) {
  if (res && res.status === 'error') {
    const err = new Error(res.message || 'Request failed.');
    err.data = res;
    throw err;
  }
  return res;
}

const numOrUndef = (v) => (v === '' || v === null || v === undefined ? undefined : Number(v));

function mapChild(c = {}) {
  return {
    id: c.id,
    item_id: c.item_id,
    price: Number(c.price) || 0,
    item_name: c.item?.name || '',
    item_sku: c.item?.sku || ''
  };
}

/** API quotation → UI shape. */
function mapQuotation(r = {}) {
  const children = (Array.isArray(r.quotation_children) ? r.quotation_children : []).map(mapChild);
  return {
    id: r.id,
    station_id: r.station_id,
    supplier_id: r.supplier_id,
    supplier: r.supplier?.name || '',
    station_name: r.station?.name || '',
    station_code: r.station?.code || '',
    date: r.date,
    remarks: r.remarks || '',
    items_count: children.length,
    children
  };
}

function toPayload(v = {}) {
  const p = {
    supplier_id: numOrUndef(v.supplier_id),
    date: v.date || undefined,
    remarks: v.remarks || undefined,
    station_id: numOrUndef(v.station_id ?? getStationId())
  };
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
  return p;
}

function childrenPayload(children = []) {
  return children
    .filter((c) => c.item_id && c.price !== '' && c.price != null)
    .map((c) => ({ item_id: numOrUndef(c.item_id), price: numOrUndef(c.price) }));
}

function fetchOne(path, id, { station_id } = {}) {
  const qs = new URLSearchParams({ id });
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  return api.get(`${path}?${qs.toString()}`);
}

/**
 * List quotations for the active station.
 * @returns {Promise<{ rows: object[] }>}
 */
export async function getQuotations({ station_id, supplier_id, date, date_from, date_to } = {}) {
  if (USE_MOCK) {
    await delay();
    const sid = station_id ?? getStationId();
    let list = mockQuotations.map(mapQuotation);
    if (sid) list = list.filter((q) => String(q.station_id) === String(sid));
    if (supplier_id) list = list.filter((q) => String(q.supplier_id) === String(supplier_id));
    if (date) list = list.filter((q) => q.date === date);
    if (date_from) list = list.filter((q) => q.date >= date_from);
    if (date_to) list = list.filter((q) => q.date <= date_to);
    return { rows: list };
  }
  const qs = new URLSearchParams();
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  if (supplier_id) qs.set('supplier_id', supplier_id);
  if (date) qs.set('date', date);
  if (date_from) qs.set('date_from', date_from);
  if (date_to) qs.set('date_to', date_to);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await api.get(`getQuotations${suffix}`);
  assertOk(res);
  const list = Array.isArray(res?.quotations) ? res.quotations : [];
  return { rows: list.map(mapQuotation) };
}

/** View a single quotation. */
export async function getQuotation(id, { station_id } = {}) {
  if (USE_MOCK) {
    await delay(120);
    const q = mockQuotations.find((x) => String(x.id) === String(id));
    if (!q) throw new Error('Quotation not found');
    return mapQuotation(q);
  }
  const res = await fetchOne('getQuotation', id, { station_id });
  assertOk(res);
  return mapQuotation(res?.quotation || {});
}

/** Fetch one quotation for editing. */
export async function editQuotation(id, { station_id } = {}) {
  if (USE_MOCK) {
    await delay(120);
    const q = mockQuotations.find((x) => String(x.id) === String(id));
    if (!q) throw new Error('Quotation not found');
    return mapQuotation(q);
  }
  const res = await fetchOne('editQuotation', id, { station_id });
  assertOk(res);
  return mapQuotation(res?.quotation || {});
}

/** Create a daily quotation (one per supplier + date + station). */
export async function addQuotation(values = {}) {
  const quotation_children = childrenPayload(values.children);
  if (USE_MOCK) {
    await delay();
    const v = toPayload(values);
    const dup = mockQuotations.some(
      (q) =>
        String(q.station_id) === String(v.station_id) &&
        String(q.supplier_id) === String(v.supplier_id) &&
        q.date === v.date
    );
    if (dup) throw new Error('A quotation already exists for this supplier on this date.');
    const id = nextId();
    mockQuotations.unshift({
      id,
      ...v,
      supplier: { id: v.supplier_id, name: `Supplier #${v.supplier_id}` },
      quotation_children: quotation_children.map((c, i) => ({
        id: i + 1,
        ...c,
        item: { id: c.item_id, name: `Item #${c.item_id}`, sku: '' }
      }))
    });
    return { status: 'ok', message: 'Quotation added successfully' };
  }
  return assertOk(await api.post('addQuotation', { ...toPayload(values), quotation_children }));
}

/** Update (replaces all line items). */
export async function updateQuotation(id, values = {}) {
  const quotation_children = childrenPayload(values.children);
  if (USE_MOCK) {
    await delay();
    const i = mockQuotations.findIndex((x) => String(x.id) === String(id));
    if (i < 0) throw new Error('Quotation not found');
    const v = toPayload(values);
    mockQuotations[i] = {
      ...mockQuotations[i],
      ...v,
      id: mockQuotations[i].id,
      quotation_children: quotation_children.map((c, idx) => ({
        id: idx + 1,
        ...c,
        item: mockQuotations[i].quotation_children.find((x) => String(x.item_id) === String(c.item_id))?.item || {
          id: c.item_id,
          name: `Item #${c.item_id}`,
          sku: ''
        }
      }))
    };
    return { status: 'ok', message: 'Quotation updated successfully' };
  }
  return assertOk(await api.post('updateQuotation', { id, ...toPayload(values), quotation_children }));
}

/** Delete. */
export async function deleteQuotation(id, { station_id } = {}) {
  if (USE_MOCK) {
    await delay();
    mockQuotations = mockQuotations.filter((x) => String(x.id) !== String(id));
    return { status: 'ok', message: 'Quotation deleted successfully' };
  }
  const sid = station_id ?? getStationId();
  return assertOk(await api.del(`deleteQuotation?id=${encodeURIComponent(id)}`, { body: { id, ...(sid ? { station_id: sid } : {}) } }));
}

export { mapQuotation, mapChild };
