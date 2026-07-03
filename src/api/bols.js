// BOLs API — Bill of Lading endpoints (quantity audit, no amount fields).
// Station-scoped: active station id is sent as `Station-Id` header and in the body.
//
//   GET    getBols     list ([station_id], [type], [doc_type])
//   POST   addBol      create (multipart/form-data)
//   GET    editBol     fetch one for editing (id, station_id)
//   POST   updateBol   update (multipart, replaces all line items)
//   DELETE deleteBol   delete (id, station_id in body)
//   GET    bolFile/{id} public file URL (returned as file_url on each BOL)
import { api, getStationId } from './client.js';
import { USE_MOCK } from './config.js';
import { delay } from './mock-utils.js';

function assertOk(res) {
  if (res && res.status === 'error') {
    const err = new Error(res.message || 'Request failed.');
    err.data = res;
    throw err;
  }
  return res;
}

const IMG_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];

function fileMeta(url, path) {
  const src = url || path || '';
  const name = src ? src.split('/').pop() : '';
  const ext = (name.split('.').pop() || '').toLowerCase();
  const type = IMG_EXT.includes(ext) ? `image/${ext === 'jpg' ? 'jpeg' : ext}` : ext === 'pdf' ? 'application/pdf' : '';
  return { name, type };
}

function mapChild(c = {}) {
  return {
    id: c.id,
    item_id: c.item_id,
    quantity: Number(c.quantity) || 0,
    item: c.item || null
  };
}

// API BOL → UI/table shape.
export function mapBol(r = {}) {
  const f = fileMeta(r.file_url, r.file_path);
  const children = Array.isArray(r.bol_children) ? r.bol_children.map(mapChild) : [];
  return {
    id: r.id,
    type: r.type,
    vendor_id: r.vendor_id,
    vendor: r.vendor?.name || r.vendor_id || '',
    bolNumber: r.bol_number,
    bolNo: r.bol_number,
    docType: r.doc_type,
    remarks: r.remarks ?? '',
    fileName: f.name,
    fileUrl: r.file_url || '',
    fileType: f.type,
    status: 'processed',
    date: r.bol_date,
    station_id: r.station_id,
    station: r.station || null,
    children
  };
}

function bolFormData(values = {}, { id } = {}) {
  const sid = getStationId();
  const fd = new FormData();
  if (id != null) fd.append('id', id);
  if (sid) fd.append('station_id', sid);
  if (values.type != null) fd.append('type', values.type);
  fd.append('doc_type', values.docType || 'bol');
  if (values.vendor != null && values.vendor !== '') fd.append('vendor_id', values.vendor);
  if (values.bolNo != null) fd.append('bol_number', values.bolNo);
  if (values.bolDate != null) fd.append('bol_date', values.bolDate);
  if (values.remarks != null && values.remarks !== '') fd.append('remarks', values.remarks);
  const f = values.file;
  if (f && typeof File !== 'undefined' && f.file instanceof File) fd.append('file', f.file, f.name);
  (Array.isArray(values.children) ? values.children : []).forEach((c, i) => {
    fd.append(`bol_children[${i}][item_id]`, c.item_id ?? '');
    fd.append(`bol_children[${i}][quantity]`, c.quantity ?? '');
  });
  return fd;
}

/** List BOLs for the active station. */
export async function getBols({ station_id, type, doc_type } = {}) {
  if (USE_MOCK) {
    await delay();
    return [];
  }
  const qs = new URLSearchParams();
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  if (type) qs.set('type', type);
  if (doc_type) qs.set('doc_type', doc_type);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await api.get(`getBols${suffix}`);
  assertOk(res);
  return (Array.isArray(res?.bols) ? res.bols : []).map(mapBol);
}

/** Fetch one BOL for editing. */
export async function editBol(id, { station_id } = {}) {
  if (USE_MOCK) {
    await delay(120);
    throw new Error('BOL not found');
  }
  const qs = new URLSearchParams({ id });
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  const res = await api.get(`editBol?${qs.toString()}`);
  assertOk(res);
  return mapBol(res?.bol || {});
}

/**
 * Create a BOL (multipart/form-data).
 * @param {{ type, vendor, bolNo, bolDate, docType?, remarks?, file?, children? }} values
 */
export async function addBol(values = {}) {
  if (USE_MOCK) {
    await delay();
    return { status: 'ok', message: 'BOL added successfully' };
  }
  return assertOk(await api.post('addBol', bolFormData(values)));
}

/** Update a BOL — same fields as add, plus id; replaces all line items. */
export async function updateBol(id, values = {}) {
  if (USE_MOCK) {
    await delay();
    return { status: 'ok', message: 'BOL updated successfully' };
  }
  return assertOk(await api.post('updateBol', bolFormData(values, { id })));
}

/** Delete a BOL. */
export async function deleteBol(id) {
  if (USE_MOCK) {
    await delay();
    return { status: 'ok', message: 'BOL deleted successfully' };
  }
  const sid = getStationId();
  return assertOk(
    await api.del(`deleteBol?id=${encodeURIComponent(id)}`, {
      body: { id, ...(sid ? { station_id: sid } : {}) }
    })
  );
}
