// Persons API — wraps the backend person endpoints through the shared client.
// Every route is JWT-protected and station-scoped: the active station id is
// sent both as a `Station-Id` header (by the client) and inside the payload /
// query. A missing or out-of-account station yields
// `{ status: 'error', message: 'A valid station is required' }`.
//
//   GET    getPersons               paginated list (records, pageNo, colName, sort, [status],
//                                    [person_type], [cnic], [phone_no], [ntn], [gst], [dsl], [id])
//   POST   addPerson                create (person_type_id drives COA/opening voucher)
//   GET    editPerson               fetch one (id) for editing
//   POST   updateperson             update (id in body)
//   DELETE deletePerson             delete (id in body)
//   GET    getPersonsDropDown       id / name list ([isActive], [person_type])
//   GET    getPersonsByPersonType   active persons of a type ([person_type_id])
//   GET    getActiveSuppliers       active suppliers in the station
//   GET    getPersonTypes           all person types (no station required)
//   GET    stationBootstrap         station + brands + items for a station
import { api, getStationId } from './client.js';
import { USE_MOCK } from './config.js';
import { delay, nextId, sortPaginate } from './mock-utils.js';
import { MOCK_PERSONS, MOCK_PERSON_TYPES } from '../data/mock/persons.js';
import { MOCK_STATIONS, MOCK_BRANDS, MOCK_ITEMS } from '../data/mock/catalog.js';

// In-memory copy used only while USE_MOCK is true (see src/api/config.js).
let mockPersons = USE_MOCK ? MOCK_PERSONS.map((p) => ({ ...p })) : [];

// person_type_id → label fallback (matches the backend's seeded types).
const PERSON_TYPE_FALLBACK = { 1: 'Customer', 2: 'Supplier', 4: 'Employee', 5: 'Labor', 7: 'Vendor' };

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
const hasVal = (v) => v !== '' && v !== undefined && v !== null;

// `person_type` arrives as a number column and/or a nested relation (`person_type`
// or `PersonType`). Normalize to a flat id + label so cells/filters stay simple.
function typeId(r) {
  if (r.person_type && typeof r.person_type === 'object') return Number(r.person_type.id);
  if (r.PersonType && typeof r.PersonType === 'object') return Number(r.PersonType.id);
  if (hasVal(r.person_type_id)) return Number(r.person_type_id);
  return hasVal(r.person_type) ? Number(r.person_type) : null;
}
function typeLabel(r, id) {
  if (r.person_type && typeof r.person_type === 'object') return r.person_type.type;
  if (r.PersonType && typeof r.PersonType === 'object') return r.PersonType.type;
  return PERSON_TYPE_FALLBACK[id] || (id != null ? `Type ${id}` : '—');
}

// API person → UI shape with flat `person_type_id` / `person_type_label`.
function mapPerson(r = {}) {
  const id = typeId(r);
  return {
    ...r,
    person_type_id: id,
    person_type_label: typeLabel(r, id),
    isActive: Number(r.isActive ?? 1)
  };
}

// UI form values → API payload. Empty optionals are dropped so the backend
// applies its own defaults. station_id is always included.
function toPayload(v = {}) {
  const p = {
    station_id: numOrUndef(v.station_id ?? getStationId()),
    name: v.name,
    person_type_id: numOrUndef(v.person_type_id),
    father_name: v.father_name || undefined,
    phone_no: v.phone_no || undefined,
    email: v.email || undefined,
    cnic: v.cnic || undefined,
    address: v.address || undefined,
    ntn: v.ntn || undefined,
    gst: v.gst || undefined,
    dsl: v.dsl || undefined,
    opening_balance: numOrUndef(v.opening_balance),
    date: v.date || undefined,
    cheque_no: v.cheque_no || undefined,
    cheque_date: v.cheque_date || undefined
  };
  Object.keys(p).forEach((k) => p[k] === undefined && delete p[k]);
  return p;
}

/**
 * Paginated list.
 * @returns {Promise<{ rows: object[], total: number, currentPage: number, lastPage: number }>}
 */
export async function getPersons({
  records = 10, pageNo = 1, colName = 'name', sort = 'asc',
  status, person_type, cnic, phone_no, ntn, gst, dsl, id, station_id
} = {}) {
  if (USE_MOCK) {
    await delay();
    const sid = station_id ?? getStationId();
    let list = mockPersons;
    if (sid) list = list.filter((p) => String(p.station_id) === String(sid));
    if (hasVal(person_type)) list = list.filter((p) => String(typeId(p)) === String(person_type));
    if (hasVal(status)) list = list.filter((p) => String(p.isActive) === String(status));
    if (cnic) list = list.filter((p) => String(p.cnic || '').includes(cnic));
    if (phone_no) list = list.filter((p) => String(p.phone_no || '').includes(phone_no));
    if (ntn) list = list.filter((p) => String(p.ntn || '').includes(ntn));
    if (gst) list = list.filter((p) => String(p.gst || '').includes(gst));
    if (dsl) list = list.filter((p) => String(p.dsl || '').includes(dsl));
    if (hasVal(id)) list = list.filter((p) => String(p.id) === String(id));
    const pg = sortPaginate(list, { pageNo, records, colName, sort });
    return { rows: pg.rows.map(mapPerson), total: pg.total, currentPage: pg.currentPage, lastPage: pg.lastPage };
  }
  const qs = new URLSearchParams({ records, pageNo, colName, sort });
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  if (hasVal(status)) qs.set('status', status);
  if (hasVal(person_type)) qs.set('person_type', person_type);
  if (cnic) qs.set('cnic', cnic);
  if (phone_no) qs.set('phone_no', phone_no);
  if (ntn) qs.set('ntn', ntn);
  if (gst) qs.set('gst', gst);
  if (dsl) qs.set('dsl', dsl);
  if (hasVal(id)) qs.set('id', id);
  const res = await api.get(`getPersons?${qs.toString()}`);
  assertOk(res);
  const paginator = res?.persons || {};
  const list = Array.isArray(paginator.data) ? paginator.data : [];
  const total = Number(paginator.total ?? list.length) || 0;
  const perPage = Number(paginator.per_page ?? records) || records;
  return {
    rows: list.map(mapPerson),
    total,
    currentPage: Number(paginator.current_page ?? pageNo),
    lastPage: Number(paginator.last_page ?? Math.max(1, Math.ceil(total / perPage)))
  };
}

/** Fetch one person for editing. */
export async function editPerson(id) {
  if (USE_MOCK) {
    await delay(120);
    const p = mockPersons.find((x) => String(x.id) === String(id));
    if (!p) throw new Error('Person not found');
    return mapPerson(p);
  }
  const sid = getStationId();
  const qs = new URLSearchParams({ id });
  if (sid) qs.set('station_id', sid);
  const res = await api.get(`editPerson?${qs.toString()}`);
  assertOk(res);
  return mapPerson(res?.person || {});
}

/** Create. person_type_id drives auto COA-account / opening-balance voucher. */
export async function addPerson(values) {
  if (USE_MOCK) {
    await delay();
    const sid = getStationId();
    if (!sid) throw new Error('A valid station is required');
    const id = nextId();
    mockPersons.unshift({
      id, user_id: 10, station_id: Number(sid),
      name: values.name, person_type: numOrUndef(values.person_type_id) ?? null,
      father_name: values.father_name || '', phone_no: values.phone_no || '', email: values.email || '',
      cnic: values.cnic || '', address: values.address || '', isActive: 1,
      ntn: values.ntn || null, gst: values.gst || null, dsl: values.dsl || null,
      date: values.date || null, opening_balance: Number(values.opening_balance || 0)
    });
    return { status: 'ok', message: 'person Stored Successfully' };
  }
  return assertOk(await api.post('addPerson', toPayload(values)));
}

/** Update (id sent in the body; route is `updateperson`). */
export async function updatePerson(id, values) {
  if (USE_MOCK) {
    await delay();
    const i = mockPersons.findIndex((x) => String(x.id) === String(id));
    if (i < 0) throw new Error('Person not found');
    mockPersons[i] = {
      ...mockPersons[i], ...values, id: mockPersons[i].id,
      person_type: numOrUndef(values.person_type_id) ?? mockPersons[i].person_type,
      opening_balance: Number(values.opening_balance ?? mockPersons[i].opening_balance)
    };
    return { status: 'ok', message: 'Person updated successfully' };
  }
  return assertOk(await api.post('updateperson', { id, ...toPayload(values) }));
}

/** Delete (id + station_id sent in the body). */
export async function deletePerson(id) {
  if (USE_MOCK) {
    await delay();
    mockPersons = mockPersons.filter((x) => String(x.id) !== String(id));
    return { status: 'ok', message: 'Person deleted successfully' };
  }
  const sid = getStationId();
  return assertOk(await api.del('deletePerson', { body: { id, ...(sid ? { station_id: sid } : {}) } }));
}

/** Toggle active/inactive. Returns the server message ("Person Active/InActive Successfully"). */
export async function togglePersonActive(id) {
  if (USE_MOCK) {
    await delay();
    const i = mockPersons.findIndex((x) => String(x.id) === String(id));
    if (i < 0) throw new Error('Person not found');
    const nowActive = Number(mockPersons[i].isActive) === 1 ? 0 : 1;
    mockPersons[i] = { ...mockPersons[i], isActive: nowActive };
    return { status: 'ok', message: nowActive ? 'Person Active Successfully' : 'Person InActive Successfully' };
  }
  const sid = getStationId();
  return assertOk(await api.post('activeUnactivePerson', { id, ...(sid ? { station_id: sid } : {}) }));
}

/** Dropdown: [{ value: id, label: name }]. */
export async function getPersonsDropDown({ isActive = 1, person_type, station_id } = {}) {
  const sid = station_id ?? getStationId();
  if (USE_MOCK) {
    await delay(120);
    return mockPersons
      .filter((p) => (!sid || String(p.station_id) === String(sid)) && (!hasVal(isActive) || Number(p.isActive) === Number(isActive)) && (!hasVal(person_type) || String(typeId(p)) === String(person_type)))
      .map((p) => ({ value: p.id, label: p.name }));
  }
  const qs = new URLSearchParams();
  if (sid) qs.set('station_id', sid);
  if (hasVal(isActive)) qs.set('isActive', isActive);
  if (hasVal(person_type)) qs.set('person_type', person_type);
  const res = await api.get(`getPersonsDropDown?${qs.toString()}`);
  assertOk(res);
  const list = Array.isArray(res?.persons) ? res.persons : [];
  return list.map((p) => ({ value: p.id, label: p.name }));
}

/** Active persons of a given type in the station. */
export async function getPersonsByPersonType(person_type_id, { station_id } = {}) {
  const sid = station_id ?? getStationId();
  if (USE_MOCK) {
    await delay(120);
    return mockPersons
      .filter((p) => (!sid || String(p.station_id) === String(sid)) && Number(p.isActive) === 1 && String(typeId(p)) === String(person_type_id))
      .map(mapPerson);
  }
  const qs = new URLSearchParams({ person_type_id });
  if (sid) qs.set('station_id', sid);
  const res = await api.get(`getPersonsByPersonType?${qs.toString()}`);
  assertOk(res);
  return (Array.isArray(res?.persons) ? res.persons : []).map(mapPerson);
}

/** Active suppliers in the station. */
export async function getActiveSuppliers({ station_id } = {}) {
  const sid = station_id ?? getStationId();
  if (USE_MOCK) {
    await delay(120);
    return mockPersons
      .filter((p) => (!sid || String(p.station_id) === String(sid)) && Number(p.isActive) === 1 && typeId(p) === 2)
      .map(mapPerson);
  }
  const qs = new URLSearchParams();
  if (sid) qs.set('station_id', sid);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await api.get(`getActiveSuppliers${suffix}`);
  assertOk(res);
  return (Array.isArray(res?.persons) ? res.persons : []).map(mapPerson);
}

/** All person types: [{ value: id, label: type }]. No station required. */
export async function getPersonTypes() {
  if (USE_MOCK) {
    await delay(80);
    return MOCK_PERSON_TYPES.map((t) => ({ value: t.id, label: t.type }));
  }
  const res = await api.get('getPersonTypes');
  assertOk(res);
  const list = Array.isArray(res?.personTypes) ? res.personTypes : [];
  return list.map((t) => ({ value: t.id, label: t.type }));
}

/** Station bootstrap — station + brands + items. Call after picking a station. */
export async function stationBootstrap(station_id) {
  const sid = station_id ?? getStationId();
  if (USE_MOCK) {
    await delay(120);
    const station = MOCK_STATIONS.find((s) => String(s.id) === String(sid)) || null;
    return {
      status: 'ok',
      station,
      brands: MOCK_BRANDS.filter((b) => String(b.station_id) === String(sid)),
      items: MOCK_ITEMS.filter((i) => String(i.station_id) === String(sid))
    };
  }
  const res = await api.get(`stationBootstrap?station_id=${encodeURIComponent(sid)}`);
  assertOk(res);
  return res;
}

export { mapPerson, toPayload, PERSON_TYPE_FALLBACK };
