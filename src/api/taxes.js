// Taxes API — station-scoped tax rates.
//
//   GET    getTaxes         paginated list
//   GET    getTaxesDropDown dropdown options
//   POST   addTax           create
//   GET    editTax          fetch one for editing
//   POST   updateTax        update
//   DELETE deleteTax        delete
import { api, getStationId } from './client.js';
import { USE_MOCK } from './config.js';
import { delay, nextId, sortPaginate } from './mock-utils.js';

let mockTaxes = USE_MOCK
  ? [
      { id: 1, station_id: 1, code: 'GST', description: 'General Sales Tax', price: '17.0000' },
      { id: 2, station_id: 1, code: 'VAT', description: 'Value Added Tax', price: '5.0000' }
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

function toPayload(v = {}) {
  const p = {
    code: v.code,
    description: v.description || undefined,
    price: numOrUndef(v.price),
    station_id: numOrUndef(v.station_id ?? getStationId())
  };
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
  return p;
}

/**
 * Paginated list.
 * @returns {Promise<{ rows: object[], total: number, currentPage: number, lastPage: number }>}
 */
export async function getTaxes({
  records = 10,
  pageNo = 1,
  colName = 'code',
  sort = 'asc',
  code,
  description,
  station_id
} = {}) {
  if (USE_MOCK) {
    await delay();
    const sid = station_id ?? getStationId();
    let list = mockTaxes;
    if (sid) list = list.filter((t) => String(t.station_id) === String(sid));
    if (code) list = list.filter((t) => String(t.code).toLowerCase().includes(String(code).toLowerCase()));
    if (description) list = list.filter((t) => String(t.description || '').toLowerCase().includes(String(description).toLowerCase()));
    const p = sortPaginate(list, { pageNo, records, colName, sort });
    return { rows: p.rows, total: p.total, currentPage: p.currentPage, lastPage: p.lastPage };
  }
  const qs = new URLSearchParams({ records, pageNo, colName, sort });
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  if (code) qs.set('code', code);
  if (description) qs.set('description', description);
  const res = await api.get(`getTaxes?${qs.toString()}`);
  assertOk(res);
  const paginator = res?.taxes || {};
  const list = Array.isArray(paginator.data) ? paginator.data : [];
  return {
    rows: list,
    total: Number(paginator.total ?? list.length) || 0,
    currentPage: Number(paginator.current_page ?? pageNo),
    lastPage: Number(paginator.last_page ?? 1)
  };
}

/** Dropdown: [{ value, label, code, description, price }]. */
export async function getTaxesDropDown({ station_id } = {}) {
  const sid = station_id ?? getStationId();
  if (USE_MOCK) {
    await delay(120);
    return mockTaxes
      .filter((t) => !sid || String(t.station_id) === String(sid))
      .map((t) => ({
        value: t.id,
        label: t.description ? `${t.code} — ${t.description}` : t.code,
        code: t.code,
        description: t.description,
        price: Number(t.price)
      }));
  }
  const res = await api.get(`getTaxesDropDown${sid ? `?station_id=${encodeURIComponent(sid)}` : ''}`);
  assertOk(res);
  const list = Array.isArray(res?.taxes) ? res.taxes : [];
  return list.map((t) => ({
    value: t.id,
    label: t.description ? `${t.code} — ${t.description}` : t.code,
    code: t.code,
    description: t.description,
    price: Number(t.price)
  }));
}

/** Fetch one tax for editing. */
export async function editTax(id, { station_id } = {}) {
  if (USE_MOCK) {
    await delay(120);
    const t = mockTaxes.find((x) => String(x.id) === String(id));
    if (!t) throw new Error('Tax not found');
    return { ...t, price: Number(t.price) };
  }
  const sid = station_id ?? getStationId();
  const qs = new URLSearchParams({ id });
  if (sid) qs.set('station_id', sid);
  const res = await api.get(`editTax?${qs.toString()}`);
  assertOk(res);
  const tax = res?.tax || {};
  return { ...tax, price: tax.price != null ? Number(tax.price) : tax.price };
}

/** Create (code + price required; unique per station). */
export async function addTax(values) {
  if (USE_MOCK) {
    await delay();
    const v = toPayload(values);
    const sid = v.station_id;
    if (mockTaxes.some((t) => String(t.station_id) === String(sid) && t.code.toLowerCase() === String(v.code).toLowerCase())) {
      throw new Error('The code has already been taken.');
    }
    mockTaxes.unshift({ id: nextId(), ...v, price: String(v.price) });
    return { status: 'ok', message: 'Tax added successfully' };
  }
  return assertOk(await api.post('addTax', toPayload(values)));
}

/** Update (id sent in the body). */
export async function updateTax(id, values) {
  if (USE_MOCK) {
    await delay();
    const i = mockTaxes.findIndex((x) => String(x.id) === String(id));
    if (i < 0) throw new Error('Tax not found');
    const v = toPayload(values);
    mockTaxes[i] = { ...mockTaxes[i], ...v, id: mockTaxes[i].id, price: String(v.price ?? mockTaxes[i].price) };
    return { status: 'ok', message: 'Tax updated successfully' };
  }
  return assertOk(await api.post('updateTax', { id, ...toPayload(values) }));
}

/** Delete. */
export async function deleteTax(id, { station_id } = {}) {
  if (USE_MOCK) {
    await delay();
    mockTaxes = mockTaxes.filter((x) => String(x.id) !== String(id));
    return { status: 'ok', message: 'Tax deleted successfully' };
  }
  const sid = station_id ?? getStationId();
  return assertOk(await api.del(`deleteTax?id=${encodeURIComponent(id)}`, { body: { id, ...(sid ? { station_id: sid } : {}) } }));
}
