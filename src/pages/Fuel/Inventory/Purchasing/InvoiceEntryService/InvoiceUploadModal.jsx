import { useState, useEffect, useMemo, useRef } from 'react';
import Modal from '../../../../../components/Modal.jsx';
import FormField from '../../../../../components/crud/FormField.jsx';
import Toggle from '../../../../../components/Toggle.jsx';
import { showToast } from '../../../../../v4/toast.js';
import { getItemsDropDown } from '../../../../../api/items.js';
import { getTaxesDropDown } from '../../../../../api/taxes.js';
import { INVOICE_TYPE_OPTIONS } from '../../../../../data/mock/fuel.js';

const today = () => new Date().toISOString().slice(0, 10);
const num = (v) => Number(v) || 0;
const round2 = (n) => Math.round(n * 100) / 100;
const usd = (n) => `$${round2(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const emptyTax = () => ({ tax_id: '', tax_rate: '', tax_amount: '' });
const emptyLine = () => ({ item_id: '', quantity: '', price: '', subtotal: '', taxes: [], tax_total: '', amount: '' });

const calcSubtotal = (quantity, price) => {
  const q = num(quantity);
  const p = num(price);
  return q && p ? round2(q * p) : '';
};

const calcTaxAmount = (quantity, taxValue) => {
  const q = num(quantity);
  const v = num(taxValue);
  return q && v ? round2(q * v) : '';
};

const applyLineCalcs = (row) => {
  const subtotal = calcSubtotal(row.quantity, row.price);
  const taxes = (row.taxes || []).map((t) => ({
    ...t,
    tax_amount: t.tax_rate !== '' && t.tax_rate != null ? calcTaxAmount(row.quantity, t.tax_rate) : ''
  }));
  const tax_total = round2(taxes.reduce((s, t) => s + num(t.tax_amount), 0));
  const amount = subtotal ? round2(num(subtotal) + tax_total) : '';
  return { ...row, subtotal, taxes, tax_total, amount };
};

function invoiceToForm(inv) {
  const b = inv ?? {};
  return {
    type: b.type || 'fuel',
    vendor: b.vendor_id != null ? String(b.vendor_id) : '',
    invoiceNumber: b.invoiceNumber || '',
    bolNo: b.bolNo || '',
    invoiceDate: b.invoiceDate ? String(b.invoiceDate).slice(0, 10) : today(),
    dueDate: b.dueDate ? String(b.dueDate).slice(0, 10) : '',
    amount: b.amount != null && b.amount !== '' ? String(b.amount) : '',
    file: ''
  };
}

function invoiceToChildren(inv) {
  const rows = inv?.lines;
  if (!Array.isArray(rows) || !rows.length) return [emptyLine()];
  return rows.map((c) =>
    applyLineCalcs({
      item_id: String(c.item_id ?? ''),
      quantity: c.quantity ?? '',
      price: c.rate ?? '',
      subtotal: '',
      taxes: (c.taxes || []).map((t) => ({
        tax_id: String(t.tax_id ?? ''),
        tax_rate: t.tax_rate ?? '',
        tax_amount: t.tax_amount ?? ''
      })),
      tax_total: '',
      amount: ''
    })
  );
}

const invoiceDrafts = new Map();

function sessionKey(invoice) {
  return invoice?.id ? `edit:${invoice.id}` : 'create';
}

function readDraft(invoice) {
  const saved = invoiceDrafts.get(sessionKey(invoice));
  if (saved) return saved;
  return {
    values: invoiceToForm(invoice),
    manual: Array.isArray(invoice?.lines) && invoice.lines.length > 0,
    children: invoiceToChildren(invoice)
  };
}

/**
 * Create or edit an invoice with optional manual line items (invoices_children).
 * Each item can have multiple tax rows nested below it.
 */
export default function InvoiceUploadModal({ vendors = [], userId, stationId, invoice = null, onClose, onSubmit }) {
  const isEdit = !!invoice?.id;
  const key = sessionKey(invoice);
  const skipDraftSave = useRef(false);
  const draft = readDraft(invoice);
  const [values, setValues] = useState(draft.values);
  const [manual, setManual] = useState(draft.manual);
  const [children, setChildren] = useState(draft.children);
  const [items, setItems] = useState([]);
  const [taxes, setTaxes] = useState([]);
  const [errors, setErrors] = useState({});
  const [lineError, setLineError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return () => {
      if (!skipDraftSave.current) {
        invoiceDrafts.set(key, { values, manual, children });
      }
    };
  }, [key, values, manual, children]);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  useEffect(() => {
    getItemsDropDown({ type: String(values.type || '').toUpperCase(), userId })
      .then(setItems)
      .catch(() => setItems([]));
  }, [values.type, userId]);

  useEffect(() => {
    if (!stationId || stationId === 'all') {
      setTaxes([]);
      return;
    }
    getTaxesDropDown({ station_id: stationId })
      .then(setTaxes)
      .catch(() => setTaxes([]));
  }, [stationId]);

  const updateLine = (i, updater) => {
    setChildren((rows) => rows.map((r, idx) => (idx === i ? applyLineCalcs(updater(r)) : r)));
    setLineError('');
  };

  const setLine = (i, field, value) => updateLine(i, (r) => ({ ...r, [field]: value }));

  const allTaxRows = (quantity) =>
    taxes.map((meta) => ({
      tax_id: meta.value,
      tax_rate: meta.price,
      tax_amount: calcTaxAmount(quantity, meta.price)
    }));

  const setItemTax = (lineIdx, taxIdx, field, value) => {
    if (field === 'tax_id' && value === '__all__') {
      updateLine(lineIdx, (r) => ({ ...r, taxes: allTaxRows(r.quantity) }));
      return;
    }
    setChildren((rows) =>
      rows.map((r, idx) => {
        if (idx !== lineIdx) return r;
        const nextTaxes = (r.taxes || []).map((t, j) => {
          if (j !== taxIdx) return t;
          const row = { ...t, [field]: value };
          if (field === 'tax_id') {
            const meta = taxes.find((x) => String(x.value) === String(value));
            row.tax_rate = meta ? meta.price : '';
          }
          return row;
        });
        return applyLineCalcs({ ...r, taxes: nextTaxes });
      })
    );
    setLineError('');
  };

  const addItemTax = (lineIdx) => {
    updateLine(lineIdx, (r) => ({ ...r, taxes: [...(r.taxes || []), emptyTax()] }));
  };

  const removeItemTax = (lineIdx, taxIdx) => {
    updateLine(lineIdx, (r) => ({ ...r, taxes: (r.taxes || []).filter((_, j) => j !== taxIdx) }));
  };

  const addLine = () => setChildren((rows) => [...rows, emptyLine()]);
  const removeLine = (i) => setChildren((rows) => (rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows));

  const childrenTotal = useMemo(() => round2(children.reduce((s, r) => s + num(r.amount), 0)), [children]);
  const childrenSubtotal = useMemo(() => round2(children.reduce((s, r) => s + num(r.subtotal), 0)), [children]);
  const childrenTax = useMemo(() => round2(children.reduce((s, r) => s + num(r.tax_total), 0)), [children]);
  const amountNum = round2(manual ? childrenTotal : num(values.amount));

  const validate = () => {
    const e = {};
    if (!values.type) e.type = 'Type is required';
    if (!values.vendor) e.vendor = 'Vendor is required';
    if (!values.invoiceNumber) e.invoiceNumber = 'Invoice number is required';
    if (!values.invoiceDate) e.invoiceDate = 'Invoice date is required';
    if (!values.dueDate) e.dueDate = 'Due date is required';
    if (!manual && (!values.amount || amountNum <= 0)) e.amount = 'Amount is required';
    if (!isEdit && !values.file) e.file = 'A PDF or image is required';
    if (isEdit && !values.file && !invoice?.fileUrl) e.file = 'A PDF or image is required';
    setErrors(e);

    let lineMsg = '';
    if (manual) {
      const rows = children.filter((r) => r.item_id || r.quantity || r.price || (r.taxes || []).length);
      if (!rows.length) lineMsg = 'Add at least one item, or turn off manual entries.';
      else if (rows.some((r) => !r.item_id || !num(r.quantity) || !num(r.price)))
        lineMsg = 'Each item needs an item, quantity and price.';
      else if (rows.some((r) => (r.taxes || []).some((t) => t.tax_id && !num(t.tax_amount))))
        lineMsg = 'Each selected tax must have a calculated amount.';
      else if (rows.some((r) => !num(r.amount)))
        lineMsg = 'Each item line must have a total amount.';
      else if (childrenTotal <= 0)
        lineMsg = 'Invoice amount must be greater than zero.';
    }
    setLineError(lineMsg);
    return Object.keys(e).length === 0 && !lineMsg;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...values, docType: 'invoice', amount: amountNum, id: invoice?.id };
      if (manual) {
        payload.children = children
          .filter((r) => r.item_id || r.quantity || r.price || (r.taxes || []).length)
          .map((r) => ({
            item_id: r.item_id,
            quantity: num(r.quantity),
            price: num(r.price),
            amount: round2(num(r.amount)),
            taxes: (r.taxes || [])
              .filter((t) => t.tax_id)
              .map((t) => ({
                tax_id: t.tax_id,
                tax_rate: num(t.tax_rate),
                tax_amount: round2(num(t.tax_amount))
              }))
          }));
      }
      await onSubmit(payload);
      skipDraftSave.current = true;
      invoiceDrafts.delete(key);
      showToast(isEdit ? 'Invoice updated' : 'Invoice uploaded', { variant: 'success' });
      onClose();
    } catch (err) {
      showToast(err?.message || `Failed to ${isEdit ? 'update' : 'upload'} invoice`, { variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const itemGrid = { display: 'grid', gridTemplateColumns: 'minmax(140px, 2fr) 80px 100px 100px 100px 36px', gap: 8, alignItems: 'end' };
  const taxGrid = { display: 'grid', gridTemplateColumns: 'minmax(140px, 2fr) 100px 100px 36px', gap: 8, alignItems: 'end', marginTop: 6 };
  const lbl = { fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 };

  return (
    <Modal
      title={isEdit ? 'Edit invoice' : 'Upload invoice'}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="invoice-upload-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Upload'}
          </button>
        </>
      }
    >
      <form id="invoice-upload-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <FormField name="type" label="Type" type="select" required value={values.type} onChange={set} options={INVOICE_TYPE_OPTIONS} error={errors.type} />
          <FormField name="vendor" label="Vendor" type="select" required value={values.vendor} onChange={set} options={vendors} error={errors.vendor} />
          <FormField name="invoiceNumber" label="Invoice number" required value={values.invoiceNumber} onChange={set} placeholder="e.g. 365081" error={errors.invoiceNumber} />
          <FormField name="bolNo" label="BOL No." value={values.bolNo} onChange={set} placeholder="e.g. BOL-12345" error={errors.bolNo} />
          <FormField name="invoiceDate" label="Invoice date" type="date" required value={values.invoiceDate} onChange={set} error={errors.invoiceDate} />
          <FormField name="dueDate" label="Due date" type="date" required value={values.dueDate} onChange={set} error={errors.dueDate} />
          {!manual && (
            <FormField name="amount" label="Amount" type="number" min={0} step="0.01" required value={values.amount} onChange={set} error={errors.amount} />
          )}
          <FormField
            name="file"
            label={isEdit ? 'Replace file (optional)' : 'Upload PDF / image'}
            type="file"
            accept=".pdf,image/png,image/jpeg"
            required={!isEdit && !invoice?.fileUrl}
            value={values.file}
            onChange={set}
            span={2}
            error={errors.file}
            hint={isEdit && invoice?.fileName ? `Current: ${invoice.fileName}` : undefined}
          />
        </div>

        <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <div>
            <label className="form-label" style={{ marginBottom: 2 }}>Manual line items</label>
            <div className="form-hint">Add items, then attach taxes below each item. Use &ldquo;Select all&rdquo; to apply every tax. Invoice amount is calculated from line totals.</div>
          </div>
          <Toggle on={manual} onChange={setManual} />
        </div>

        {manual && (
          <div>
            {children.map((line, i) => (
              <div
                key={i}
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius)',
                  padding: '12px 12px 10px',
                  marginBottom: 10,
                  background: 'var(--bg-surface)'
                }}
              >
                <div style={itemGrid}>
                  <div>
                    <div style={lbl}>Item</div>
                    <select className="form-control" value={line.item_id} onChange={(e) => setLine(i, 'item_id', e.target.value)}>
                      <option value="">Select…</option>
                      {items.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <div style={lbl}>Qty</div>
                    <input className="form-control" type="number" min="0" step="0.01" value={line.quantity} onChange={(e) => setLine(i, 'quantity', e.target.value)} />
                  </div>
                  <div>
                    <div style={lbl}>Price</div>
                    <input className="form-control" type="number" min="0" step="0.000001" value={line.price} onChange={(e) => setLine(i, 'price', e.target.value)} />
                  </div>
                  <div>
                    <div style={lbl}>Subtotal</div>
                    <input className="form-control" value={line.subtotal} readOnly tabIndex={-1} style={{ background: 'var(--bg-surface-secondary)', cursor: 'default' }} />
                  </div>
                  <div>
                    <div style={lbl}>Line total</div>
                    <input className="form-control" value={line.amount} readOnly tabIndex={-1} style={{ background: 'var(--bg-surface-secondary)', cursor: 'default' }} />
                  </div>
                  <div>
                    <div style={lbl}>&nbsp;</div>
                    <button type="button" className="btn btn-outline btn-sm" aria-label="Remove item" onClick={() => removeLine(i)}>×</button>
                  </div>
                </div>

                {(line.taxes || []).length > 0 && (
                  <div style={{ marginTop: 10, paddingLeft: 12, borderLeft: '2px solid var(--border)' }}>
                    <div style={{ ...lbl, marginBottom: 6 }}>Taxes</div>
                    {(line.taxes || []).map((t, ti) => (
                      <div key={ti} style={taxGrid}>
                        <div>
                          <select className="form-control" value={t.tax_id} onChange={(e) => setItemTax(i, ti, 'tax_id', e.target.value)}>
                            <option value="">Select tax…</option>
                            {taxes.length > 0 && <option value="__all__">Select all</option>}
                            {taxes.map((opt) => (
                              <option key={opt.value} value={opt.value} disabled={(line.taxes || []).some((x, j) => j !== ti && String(x.tax_id) === String(opt.value))}>
                                {opt.code} ({opt.price})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <input className="form-control" value={t.tax_rate} readOnly tabIndex={-1} placeholder="Value" aria-label="Tax value per unit" style={{ background: 'var(--bg-surface-secondary)', cursor: 'default' }} />
                        </div>
                        <div>
                          <input className="form-control" value={t.tax_amount} readOnly tabIndex={-1} placeholder="Amount" style={{ background: 'var(--bg-surface-secondary)', cursor: 'default' }} />
                        </div>
                        <div>
                          <button type="button" className="btn btn-outline btn-sm" aria-label="Remove tax" onClick={() => removeItemTax(i, ti)}>×</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={() => addItemTax(i)}>
                  + Add tax
                </button>
              </div>
            ))}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={addLine}>
                + Add item
              </button>
              <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-muted)' }}>Subtotal {usd(childrenSubtotal)}</span>
                <span style={{ color: 'var(--text-muted)' }}>Tax {usd(childrenTax)}</span>
                <span style={{ color: 'var(--text-muted)' }}>Invoice total</span>
                <span className="cell-strong">{usd(childrenTotal)}</span>
              </div>
            </div>
          </div>
        )}

        {lineError && (
          <div className="form-hint" style={{ color: 'var(--red)', marginTop: 8 }}>
            {lineError}
          </div>
        )}
      </form>
    </Modal>
  );
}
