// Invoices API — wraps the backend invoice endpoints through the shared client.
// Station-scoped: the active station id is sent both as a `Station-Id` header
// (by the client) and inside the multipart body.
//
//   GET  getInvoices    list invoices ([station_id], [type], [doc_type])
//   GET  getInvoice     fetch one invoice with line items and taxes
//   POST addInvoice     upload a supplier invoice (multipart/form-data with file)
//   POST updateInvoice  update an invoice (same fields as add, plus id)
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
    bolNo: r.bol_no,
    docType: r.doc_type,
    amount: Number(r.amount) || 0,
    fileName: f.name,
    fileUrl: r.file_url || '',
    fileType: f.type,
    status: 'processed',
    date: r.invoice_date,
    dueDate: r.due_date,
    station_id: r.station_id
  };
}

function mapInvoiceLineTax(t = {}) {
  return {
    tax_id: t.tax_id,
    tax_rate: Number(t.tax_rate) || 0,
    tax_amount: Number(t.tax_amount) || 0,
    code: t.tax?.code || '',
    description: t.tax?.description || ''
  };
}

function mapInvoiceLine(c = {}) {
  return {
    id: c.id,
    item_id: c.item_id,
    item_name: c.item?.name || '',
    item_sku: c.item?.sku || '',
    quantity: Number(c.quantity) || 0,
    rate: Number(c.rate ?? c.price) || 0,
    amount: Number(c.amount) || 0,
    sales_tax: Number(c.sales_tax) || 0,
    total_amount: Number(c.total_amount) || 0,
    taxes: (Array.isArray(c.taxes) ? c.taxes : []).map(mapInvoiceLineTax)
  };
}

/** Full invoice with line items and nested taxes (getInvoice). */
function mapInvoiceDetail(r = {}) {
  const f = fileMeta(r.file_url, r.file_path);
  const children = r.invoice_child ?? r.invoice_children ?? r.invoices_children ?? [];
  return {
    id: r.id,
    station_id: r.station_id,
    station_name: r.station?.name || '',
    station_code: r.station?.code || '',
    type: r.type,
    vendor_id: r.vendor_id,
    vendor: r.vendor?.name || '',
    invoiceNumber: r.invoice_number,
    bolNo: r.bol_no,
    invoiceDate: r.invoice_date,
    dueDate: r.due_date,
    docType: r.doc_type,
    subtotal: Number(r.subtotal) || 0,
    taxTotal: Number(r.tax_total) || 0,
    amount: Number(r.amount) || 0,
    fileUrl: r.file_url || '',
    fileName: f.name,
    fileType: f.type,
    lines: (Array.isArray(children) ? children : []).map(mapInvoiceLine)
  };
}

/** Fetch one invoice with line items and taxes. */
export async function getInvoice(id, { station_id } = {}) {
  if (USE_MOCK) {
    await delay(120);
    return mapInvoiceDetail({
      id,
      invoice_number: 'PI-8801',
      invoice_date: '2026-07-03',
      due_date: '2026-07-10',
      type: 'fuel',
      doc_type: 'invoice',
      bol_no: '124',
      subtotal: 276,
      tax_total: 9.55,
      amount: 285.55,
      vendor: { name: 'Sample Vendor' },
      station: { name: 'Main Station', code: 'STN-001' },
      invoice_child: [
        {
          id: 1,
          quantity: 12,
          rate: 23,
          amount: 276,
          sales_tax: 9.55,
          total_amount: 285.55,
          item: { name: 'Diesel', sku: 'DSL-01' },
          taxes: [
            { tax_id: 1, tax_rate: 0.184, tax_amount: 2.21, tax: { code: 'FED' } },
            { tax_id: 2, tax_rate: 0.612, tax_amount: 7.34, tax: { code: 'PST' } }
          ]
        }
      ]
    });
  }
  const qs = new URLSearchParams({ id });
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  const res = await api.get(`getInvoice?${qs.toString()}`);
  assertOk(res);
  return mapInvoiceDetail(res?.invoice || {});
}

/** List invoices, scoped to the active station unless overridden. */
export async function getInvoices({ station_id, type, doc_type } = {}) {
  if (USE_MOCK) {
    await delay();
    const sid = station_id ?? getStationId();
    return UPLOADED_INVOICES.filter((r) => !sid || String(r.station_id ?? sid) === String(sid));
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
 * Build multipart body for add/update invoice.
 * `vendor` is the supplier person id. `children` are line items saved as
 * `invoices_children[i][...]` with nested `taxes[j][tax_id|tax_rate|tax_amount]`.
 */
function invoiceFormData(values = {}, { id } = {}) {
  const sid = getStationId();
  const fd = new FormData();
  if (id != null) fd.append('id', id);
  if (sid) fd.append('station_id', sid);
  if (values.type != null) fd.append('type', values.type);
  if (values.vendor != null) fd.append('vendor_id', values.vendor);
  if (values.invoiceNumber != null) fd.append('invoice_number', values.invoiceNumber);
  if (values.bolNo != null && values.bolNo !== '') fd.append('bol_no', values.bolNo);
  if (values.invoiceDate != null) fd.append('invoice_date', values.invoiceDate);
  if (values.dueDate != null) fd.append('due_date', values.dueDate);
  if (values.docType != null) fd.append('doc_type', values.docType);
  if (values.amount != null) fd.append('amount', values.amount);
  const f = values.file;
  if (f && typeof File !== 'undefined' && f.file instanceof File) fd.append('file', f.file, f.name);
  (Array.isArray(values.children) ? values.children : []).forEach((c, i) => {
    fd.append(`invoices_children[${i}][item_id]`, c.item_id ?? '');
    fd.append(`invoices_children[${i}][description]`, c.description ?? '');
    fd.append(`invoices_children[${i}][quantity]`, c.quantity ?? '');
    fd.append(`invoices_children[${i}][price]`, c.price ?? '');
    fd.append(`invoices_children[${i}][amount]`, c.amount ?? '');
    (Array.isArray(c.taxes) ? c.taxes : []).forEach((t, j) => {
      if (t.tax_id != null && t.tax_id !== '') fd.append(`invoices_children[${i}][taxes][${j}][tax_id]`, t.tax_id);
      if (t.tax_rate != null && t.tax_rate !== '') fd.append(`invoices_children[${i}][taxes][${j}][tax_rate]`, t.tax_rate);
      if (t.tax_amount != null && t.tax_amount !== '') fd.append(`invoices_children[${i}][taxes][${j}][tax_amount]`, t.tax_amount);
    });
  });
  return fd;
}

/** Upload a supplier invoice as multipart/form-data. */
export async function addInvoice(values = {}) {
  if (USE_MOCK) {
    await delay();
    return { status: 'ok', message: 'Invoice uploaded successfully' };
  }
  return assertOk(await api.post('addInvoice', invoiceFormData(values)));
}

/** Update an invoice — same fields as add, plus id; replaces all line items. */
export async function updateInvoice(id, values = {}) {
  if (USE_MOCK) {
    await delay();
    return { status: 'ok', message: 'Invoice updated successfully' };
  }
  return assertOk(await api.post('updateInvoice', invoiceFormData(values, { id })));
}

export { mapInvoice, mapInvoiceDetail };
