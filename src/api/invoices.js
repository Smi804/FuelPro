// Invoices API — wraps the backend invoice endpoints through the shared client.
// Station-scoped: the active station id is sent both as a `Station-Id` header
// (by the client) and inside the multipart body.
//
//   GET  getInvoices  list invoices ([station_id], [type], [doc_type])
//   POST addInvoice   upload a supplier invoice (multipart/form-data with file)
import { api, getStationId } from './client.js';
import { USE_MOCK } from './config.js';
import { delay } from './mock-utils.js';
import { UPLOADED_INVOICES } from '../data/mock/fuel.js';

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

const IMG_EXT = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg'];

// Derive a filename + mime from the stored file path/url so the table's "View"
// preview (image vs. iframe) works without extra metadata from the server.
function fileMeta(url, path) {
  const src = url || path || '';
  const name = src ? src.split('/').pop() : '';
  const ext = (name.split('.').pop() || '').toLowerCase();
  const type = IMG_EXT.includes(ext) ? `image/${ext === 'jpg' ? 'jpeg' : ext}` : ext === 'pdf' ? 'application/pdf' : '';
  return { name, type };
}

// API invoice → UI/table shape (camelCase keys the columns expect).
function mapInvoice(r = {}) {
  const f = fileMeta(r.file_url, r.file_path);
  return {
    id: r.id,
    type: r.type,
    vendor_id: r.vendor_id,
    vendor: r.vendor?.name || r.vendor_id,
    invoiceNumber: r.invoice_number,
    docType: r.doc_type,
    amount: Number(r.amount) || 0,
    fileName: f.name,
    fileUrl: r.file_url || '',
    fileType: f.type,
    status: 'processed',
    date: r.invoice_date,
    station_id: r.station_id
  };
}

/** List invoices, scoped to the active station unless overridden. */
export async function getInvoices({ station_id, type, doc_type } = {}) {
  if (USE_MOCK) {
    await delay();
    const sid = station_id ?? getStationId();
    return UPLOADED_INVOICES.filter((r) => (!sid || String(r.station_id ?? sid) === String(sid)));
  }
  const qs = new URLSearchParams();
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  if (type) qs.set('type', type);
  if (doc_type) qs.set('doc_type', doc_type);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await api.get(`getInvoices${suffix}`);
  assertOk(res);
  return (Array.isArray(res?.invoices) ? res.invoices : []).map(mapInvoice);
}

/**
 * Upload a supplier invoice as multipart/form-data.
 * @param {{ type, vendor, invoiceDate, invoiceNumber, docType, amount,
 *           file: { file: File }, children?: Array }} values
 *   `vendor` is the supplier person id. `children` are line items saved as
 *   `invoices_children[i][...]` (item_id, description, quantity, price, amount).
 */
export async function addInvoice(values = {}) {
  if (USE_MOCK) {
    await delay();
    return { status: 'ok', message: 'Invoice uploaded successfully' };
  }
  const sid = getStationId();
  const fd = new FormData();
  if (sid) fd.append('station_id', sid);
  if (values.type != null) fd.append('type', values.type);
  if (values.vendor != null) fd.append('vendor_id', values.vendor);
  if (values.invoiceNumber != null) fd.append('invoice_number', values.invoiceNumber);
  if (values.invoiceDate != null) fd.append('invoice_date', values.invoiceDate);
  if (values.docType != null) fd.append('doc_type', values.docType);
  if (values.amount != null) fd.append('amount', values.amount);
  const f = values.file;
  if (f && typeof File !== 'undefined' && f.file instanceof File) fd.append('file', f.file, f.name);
  // Manual line items → invoices_children[i][field] (Laravel array form).
  (Array.isArray(values.children) ? values.children : []).forEach((c, i) => {
    fd.append(`invoices_children[${i}][item_id]`, c.item_id ?? '');
    fd.append(`invoices_children[${i}][description]`, c.description ?? '');
    fd.append(`invoices_children[${i}][quantity]`, c.quantity ?? '');
    fd.append(`invoices_children[${i}][price]`, c.price ?? '');
    fd.append(`invoices_children[${i}][amount]`, c.amount ?? '');
  });
  return assertOk(await api.post('addInvoice', fd));
}

export { mapInvoice };
