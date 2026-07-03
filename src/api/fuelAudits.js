// Fuel audits API — invoice reconciliation rows built on the backend.
//
//   GET  getFuelAudits  list audits ([station_id], [vendor_id], [grade],
//                         [audit_status], [date_from], [date_to])
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

const num = (v) => (v == null || v === '' ? null : Number(v));

function mapCheckLine(l = {}) {
  return {
    item_id: l.item_id,
    item_name: l.item_name,
    invoice_quantity: num(l.invoice_quantity),
    bol_quantity: num(l.bol_quantity),
    variance: num(l.variance),
    variance_pct: num(l.variance_pct),
    status: l.status || 'n/a'
  };
}

function mapCheck(c = {}) {
  return {
    status: c.status || 'n/a',
    variance: num(c.variance),
    variance_pct: num(c.variance_pct),
    lines: Array.isArray(c.lines) ? c.lines.map(mapCheckLine) : []
  };
}

function mapAtg(c = {}) {
  return {
    ...mapCheck(c),
    invoice_quantity: num(c.invoice_quantity),
    atg_quantity: num(c.atg_quantity)
  };
}

function mapQuote(c = {}) {
  return {
    ...mapCheck(c),
    invoice_amount: num(c.invoice_amount),
    quoted_amount: num(c.quoted_amount),
    day_quote: num(c.day_quote),
    gallons: num(c.gallons)
  };
}

function mapBol(c = {}) {
  return {
    ...mapCheck(c),
    invoice_quantity: num(c.invoice_quantity),
    bol_quantity: num(c.bol_quantity),
    invoice_quality: c.invoice_quality ?? '',
    bol_quality: c.bol_quality ?? '',
    quality_match: c.quality_match ?? null
  };
}

function mapStmt(c = {}) {
  return {
    ...mapCheck(c),
    invoice_amount: num(c.invoice_amount),
    debited_amount: num(c.debited_amount)
  };
}

// API audit row → UI/table shape.
export function mapAudit(r = {}) {
  return {
    id: r.id,
    station_id: r.station_id,
    srNo: r.sr_no,
    invoice_id: r.invoice_id,
    invoiceNumber: r.invoice_number,
    date: r.invoice_date,
    dueDate: r.due_date,
    vendor_id: r.vendor_id,
    vendor: r.vendor?.name || '',
    bol_id: r.bol_id,
    bolNumber: r.bol_number,
    bolDate: r.bol_date,
    amount: num(r.amount) ?? 0,
    grade: r.grade,
    auditStatus: r.audit_status || 'n/a',
    paymentStatus: r.payment_status,
    invoiceVsAtg: mapAtg(r.invoice_vs_atg),
    invoiceVsQuote: mapQuote(r.invoice_vs_quote),
    invoiceVsBol: mapBol(r.invoice_vs_bol),
    invoiceVsStmt: mapStmt(r.invoice_vs_stmt)
  };
}

/** List fuel audit rows for the active station. */
export async function getFuelAudits({ station_id, vendor_id, grade, audit_status, date_from, date_to } = {}) {
  if (USE_MOCK) {
    await delay();
    return [];
  }
  const qs = new URLSearchParams();
  const sid = station_id ?? getStationId();
  if (sid) qs.set('station_id', sid);
  if (vendor_id) qs.set('vendor_id', vendor_id);
  if (grade) qs.set('grade', grade);
  if (audit_status) qs.set('audit_status', audit_status);
  if (date_from) qs.set('date_from', date_from);
  if (date_to) qs.set('date_to', date_to);
  const suffix = qs.toString() ? `?${qs.toString()}` : '';
  const res = await api.get(`getFuelAudits${suffix}`);
  assertOk(res);
  return (Array.isArray(res?.audits) ? res.audits : []).map(mapAudit);
}
