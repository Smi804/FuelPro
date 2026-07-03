// Mock data for the Fuel module (ATG, purchasing, audits).
import { TANKS } from './tanks.js';
import { STATIONS } from './stations.js';

const stationName = (id) => STATIONS.find((s) => s.id === id)?.name || id;

// Automatic Tank Gauging (ATG) probe readings, derived from tank stock.
export const ATG_PROBES = TANKS.map((t, i) => {
  const ullage = t.capacity - t.currentStock;
  return {
    id: `atg_${t.id}`,
    tankId: t.id,
    tankName: t.name,
    stationId: t.stationId,
    stationName: stationName(t.stationId),
    fuelType: t.fuelType,
    volume: t.currentStock,
    ullage,
    fillPct: Math.round((t.currentStock / t.capacity) * 100),
    temperature: +(14 + (i % 5) * 0.8).toFixed(1),
    waterLevel: +((i % 3) * 1.4).toFixed(1),
    probeStatus: i % 7 === 0 ? 'fault' : 'online',
    status: t.status
  };
});

export const ATG_STATUS = {
  online: { label: 'Online', cls: 'status-green' },
  fault: { label: 'Fault', cls: 'status-red' },
  offline: { label: 'Offline', cls: 'status-yellow' }
};

export const PI_STATUS = {
  draft: { label: 'Draft', cls: 'status-yellow' },
  posted: { label: 'Posted', cls: 'status-blue' },
  paid: { label: 'Paid', cls: 'status-green' },
  overdue: { label: 'Overdue', cls: 'status-red' }
};

export const PURCHASE_INVOICES = [
  { id: 'pi_1', invoiceNumber: 'PI-8801', supplierName: 'BalticOil Wholesale', stationId: 'st_1', stationName: 'Riverside Fuel Center', productName: 'Petrol 95', quantity: 12000, unitCost: 1.34, amount: 16080, status: 'posted', date: '2026-06-20' },
  { id: 'pi_2', invoiceNumber: 'PI-8802', supplierName: 'BalticOil Wholesale', stationId: 'st_1', stationName: 'Riverside Fuel Center', productName: 'Diesel', quantity: 10000, unitCost: 1.28, amount: 12800, status: 'paid', date: '2026-06-20' },
  { id: 'pi_3', invoiceNumber: 'PI-8803', supplierName: 'NordFuel Supply', stationId: 'st_2', stationName: 'Highway 7 Station', productName: 'Petrol 95', quantity: 18000, unitCost: 1.32, amount: 23760, status: 'overdue', date: '2026-06-12' },
  { id: 'pi_4', invoiceNumber: 'PI-8804', supplierName: 'EuroGas Partners', stationId: 'st_2', stationName: 'Highway 7 Station', productName: 'CNG', quantity: 6000, unitCost: 0.88, amount: 5280, status: 'draft', date: '2026-06-23' },
  { id: 'pi_5', invoiceNumber: 'PI-8805', supplierName: 'PetroLink Distribution', stationId: 'st_3', stationName: 'Old Town Petrol', productName: 'Petrol 98', quantity: 8000, unitCost: 1.46, amount: 11680, status: 'posted', date: '2026-06-18' }
];

export const AUDIT_STATUS = {
  passed: { label: 'Passed', cls: 'status-green' },
  flagged: { label: 'Flagged', cls: 'status-yellow' },
  failed: { label: 'Failed', cls: 'status-red' },
  'n/a': { label: 'N/A', cls: 'status-blue' }
};

// Invoice payment status used by the audit table.
export const AUDIT_PAY_STATUS = {
  paid: { label: 'Paid', cls: 'status-green' },
  unpaid: { label: 'Unpaid', cls: 'status-yellow' },
  cancelled: { label: 'Cancelled', cls: 'status-red' },
  returned: { label: 'Returned', cls: 'status-blue' }
};

// Invoice reconciliation audits. Each row lets the user verify three things at a
// glance: (1) the invoice Amount matches the day's quote (gallons × dayQuote),
// (2) the invoice Quality matches the quality on the BOL, and (3) the amount the
// bank actually debited matches the invoice amount. `dayQuote` is $/gal for the
// row's grade; `debited` is what cleared the bank (0 when not yet debited).
export const FUEL_AUDITS = [
  {
    id: 'fa_1', date: '2026-06-20', invoiceNumber: 'INV-8801', dueDate: '2026-07-05', vendor: 'Synergy', stationName: 'Los Gatos',
    grade: 'diesel', gallons: 8000, quality: 'Diesel #2 ULSD', bolQuality: 'Diesel #2 ULSD',
    dayQuote: 4.25, amount: 34000, debited: 34000, paymentType: 'EFT', paymentTerms: 'Net 15', paymentStatus: 'paid'
  },
  {
    id: 'fa_2', date: '2026-06-19', invoiceNumber: 'INV-8802', dueDate: '2026-07-04', vendor: 'Synergy', stationName: 'Mountain View',
    grade: 'regular', gallons: 9000, quality: 'Regular 87', bolQuality: 'Regular 87',
    dayQuote: 3.45, amount: 31500, debited: 0, paymentType: 'EFT', paymentTerms: 'Net 15', paymentStatus: 'unpaid'
  },
  {
    id: 'fa_3', date: '2026-06-18', invoiceNumber: 'INV-8803', dueDate: '2026-07-18', vendor: 'Chevron', stationName: 'Santa Clara',
    grade: 'premium', gallons: 5000, quality: 'Premium 91', bolQuality: 'Plus 89',
    dayQuote: 4.05, amount: 20250, debited: 20250, paymentType: 'ACH', paymentTerms: 'Net 30', paymentStatus: 'paid'
  },
  {
    id: 'fa_4', date: '2026-06-17', invoiceNumber: 'INV-8804', dueDate: '2026-07-01', vendor: 'Valero', stationName: 'Sunnyvale',
    grade: 'plus', gallons: 6000, quality: 'Plus 89', bolQuality: 'Plus 89',
    dayQuote: 3.79, amount: 22740, debited: 22340, paymentType: 'EFT', paymentTerms: 'Net 14', paymentStatus: 'paid'
  },
  {
    id: 'fa_5', date: '2026-06-15', invoiceNumber: 'INV-8805', dueDate: '2026-06-30', vendor: 'Phillips 66', stationName: 'Saratoga',
    grade: 'regular', gallons: 4000, quality: 'Regular 87', bolQuality: 'Regular 87',
    dayQuote: 3.48, amount: 13920, debited: 0, paymentType: 'ACH', paymentTerms: 'Net 30', paymentStatus: 'cancelled'
  },
  {
    id: 'fa_6', date: '2026-06-14', invoiceNumber: 'INV-8806', dueDate: '2026-06-29', vendor: 'Valero', stationName: 'Campbell',
    grade: 'diesel', gallons: 7000, quality: 'Diesel #2', bolQuality: 'Diesel #2',
    dayQuote: 4.18, amount: 29260, debited: 0, paymentType: 'EFT', paymentTerms: 'Net 15', paymentStatus: 'returned'
  }
];

export const INVOICE_ENTRY_LOG = [
  { id: 'iel_1', time: '2026-06-23 09:02', source: 'BalticOil EDI', invoice: 'PI-8804', result: 'queued', detail: 'Awaiting manager approval' },
  { id: 'iel_2', time: '2026-06-23 08:40', source: 'Email inbox', invoice: 'PI-8803', result: 'imported', detail: 'Auto-matched to PO-5530' },
  { id: 'iel_3', time: '2026-06-22 17:15', source: 'NordFuel API', invoice: 'PI-8802', result: 'imported', detail: 'Posted to ledger' },
  { id: 'iel_4', time: '2026-06-22 12:08', source: 'Manual upload', invoice: 'PI-8801', result: 'failed', detail: 'Supplier tax ID mismatch' }
];

export const IEL_RESULT = {
  imported: { label: 'Imported', cls: 'status-green' },
  queued: { label: 'Queued', cls: 'status-blue' },
  failed: { label: 'Failed', cls: 'status-red' }
};

// ── Invoice Entry: upload options ───────────────────────────────
export const INVOICE_TYPE_OPTIONS = [
  { value: 'fuel', label: 'Fuel' },
  // { value: 'retail', label: 'Retail' }
];

export const INVOICE_TYPE = {
  fuel: { label: 'Fuel', cls: 'status-blue' },
  retail: { label: 'Retail', cls: 'status-green' }
};

// Document attached to the invoice upload.
export const DOC_TYPE_OPTIONS = [
  { value: 'invoice', label: 'Invoice' },
  // { value: 'bol', label: 'BOL' },
  // { value: 'both', label: 'Both' }
];

export const DOC_TYPE = {
  invoice: { label: 'Invoice', cls: 'status-blue' },
  bol: { label: 'BOL', cls: 'status-yellow' },
  both: { label: 'Both', cls: 'status-green' }
};

export const UPLOAD_STATUS = {
  processed: { label: 'Processed', cls: 'status-green' },
  pending: { label: 'Pending', cls: 'status-yellow' },
  error: { label: 'Error', cls: 'status-red' }
};

// ── Invoice Entry: uploaded invoices ────────────────────────────
export const UPLOADED_INVOICES = [
  { id: 'ui_1', invoiceNumber: 'PI-8801', type: 'fuel', vendor: 'BalticOil Wholesale', docType: 'both', amount: 16080, fileName: 'PI-8801.pdf', status: 'processed', date: '2026-06-20' },
  { id: 'ui_2', invoiceNumber: 'PI-8802', type: 'fuel', vendor: 'BalticOil Wholesale', docType: 'invoice', amount: 12800, fileName: 'PI-8802.pdf', status: 'processed', date: '2026-06-20' },
  { id: 'ui_3', invoiceNumber: 'PI-8803', type: 'fuel', vendor: 'NordFuel Supply', docType: 'bol', amount: 23760, fileName: 'bol-8803.jpg', status: 'pending', date: '2026-06-22' },
  { id: 'ui_4', invoiceNumber: 'RT-1190', type: 'retail', vendor: 'EuroGas Partners', docType: 'invoice', amount: 1340, fileName: 'RT-1190.pdf', status: 'processed', date: '2026-06-22' },
  { id: 'ui_5', invoiceNumber: 'PI-8805', type: 'fuel', vendor: 'PetroLink Distribution', docType: 'both', amount: 11680, fileName: 'PI-8805.pdf', status: 'error', date: '2026-06-18' }
];

// ── Invoice Entry: invoices that failed validation ──────────────
export const INVOICE_ERRORS = [
  { id: 'ier_1', invoiceNumber: 'PI-8805', type: 'fuel', vendor: 'PetroLink Distribution', amount: 11680, reason: 'Amount does not match BOL', date: '2026-06-18' },
  { id: 'ier_2', invoiceNumber: 'PI-8809', type: 'fuel', vendor: 'NordFuel Supply', amount: 9300, reason: 'Vendor tax ID mismatch', date: '2026-06-22' },
  { id: 'ier_3', invoiceNumber: 'RT-1205', type: 'retail', vendor: 'EuroGas Partners', amount: 760, reason: 'Unreadable PDF — re-upload required', date: '2026-06-23' }
];

// ── Invoice Entry: uploaded bank statements ─────────────────────
export const BANK_STATEMENTS = [
  { id: 'bs_1', bank: 'Swedbank', period: 'Jun 2026', transactions: 128, amount: 184200, fileName: 'swedbank-jun2026.csv', date: '2026-06-23' },
  { id: 'bs_2', bank: 'SEB', period: 'Jun 2026', transactions: 64, amount: 92140, fileName: 'seb-jun2026.csv', date: '2026-06-21' },
  { id: 'bs_3', bank: 'Swedbank', period: 'May 2026', transactions: 141, amount: 201380, fileName: 'swedbank-may2026.csv', date: '2026-05-31' }
];
