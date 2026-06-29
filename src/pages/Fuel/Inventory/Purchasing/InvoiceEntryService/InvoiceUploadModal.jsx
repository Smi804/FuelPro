import { useState, useEffect, useMemo } from 'react';
import Modal from '../../../../../components/Modal.jsx';
import FormField from '../../../../../components/crud/FormField.jsx';
import Toggle from '../../../../../components/Toggle.jsx';
import { showToast } from '../../../../../v4/toast.js';
import { getItemsDropDown } from '../../../../../api/items.js';
import { INVOICE_TYPE_OPTIONS, DOC_TYPE_OPTIONS } from '../../../../../data/mock/fuel.js';

const today = () => new Date().toISOString().slice(0, 10);
const num = (v) => Number(v) || 0;
const round2 = (n) => Math.round(n * 100) / 100;
const usd = (n) => `$${round2(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const emptyLine = () => ({ item_id: '', description: '', quantity: '', price: '', amount: '' });

/**
 * Upload-invoice modal with optional manual line items (invoices_children).
 * When manual entries are on, the sum of child amounts must equal the invoice
 * amount before the form can be submitted.
 */
export default function InvoiceUploadModal({ vendors = [], onClose, onSubmit }) {
  const [values, setValues] = useState({
    type: 'fuel',
    vendor: '',
    invoiceNumber: '',
    invoiceDate: today(),
    docType: '',
    amount: '',
    file: ''
  });
  const [manual, setManual] = useState(false);
  const [children, setChildren] = useState([emptyLine()]);
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [lineError, setLineError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  // Item options scoped to the invoice type (FUEL / RETAIL) and active station.
  useEffect(() => {
    getItemsDropDown({ type: String(values.type || '').toUpperCase() })
      .then(setItems)
      .catch(() => setItems([]));
  }, [values.type]);

  const setLine = (i, field, value) => {
    setChildren((rows) => {
      const next = rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r));
      // Auto-fill amount from qty × price while the amount is still blank.
      if ((field === 'quantity' || field === 'price') && !next[i].amount) {
        const q = num(next[i].quantity);
        const p = num(next[i].price);
        if (q && p) next[i].amount = round2(q * p);
      }
      return next;
    });
    setLineError('');
  };
  const addLine = () => setChildren((rows) => [...rows, emptyLine()]);
  const removeLine = (i) => setChildren((rows) => (rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows));

  const childrenTotal = useMemo(() => round2(children.reduce((s, r) => s + num(r.amount), 0)), [children]);
  const amountNum = round2(num(values.amount));
  const matches = manual ? Math.abs(childrenTotal - amountNum) < 0.01 : true;

  const validate = () => {
    const e = {};
    if (!values.type) e.type = 'Type is required';
    if (!values.vendor) e.vendor = 'Vendor is required';
    if (!values.invoiceNumber) e.invoiceNumber = 'Invoice number is required';
    if (!values.invoiceDate) e.invoiceDate = 'Invoice date is required';
    if (!values.docType) e.docType = 'Document is required';
    if (!values.amount || amountNum <= 0) e.amount = 'Amount is required';
    if (!values.file) e.file = 'A PDF or image is required';
    setErrors(e);

    let lineMsg = '';
    if (manual) {
      const rows = children.filter((r) => r.item_id || r.quantity || r.amount);
      if (!rows.length) lineMsg = 'Add at least one line item, or turn off manual entries.';
      else if (rows.some((r) => !r.item_id || !num(r.quantity) || !num(r.amount)))
        lineMsg = 'Each line needs an item, quantity and amount.';
      else if (!matches)
        lineMsg = `Line items total ${usd(childrenTotal)} but the invoice amount is ${usd(amountNum)}.`;
    }
    setLineError(lineMsg);
    return Object.keys(e).length === 0 && !lineMsg;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      const payload = { ...values };
      if (manual) {
        payload.children = children
          .filter((r) => r.item_id || r.quantity || r.amount)
          .map((r) => ({
            item_id: r.item_id,
            description: r.description || '',
            quantity: num(r.quantity),
            price: num(r.price),
            amount: round2(num(r.amount))
          }));
      }
      await onSubmit(payload);
      showToast('Invoice uploaded', { variant: 'success' });
      onClose();
    } catch (err) {
      showToast(err?.message || 'Failed to upload invoice', { variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const cell = { padding: '6px 6px' };

  return (
    <Modal
      title="Upload invoice"
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="invoice-upload-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Uploading…' : 'Upload'}
          </button>
        </>
      }
    >
      <form id="invoice-upload-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <FormField name="type" label="Type" type="select" required value={values.type} onChange={set} options={INVOICE_TYPE_OPTIONS} error={errors.type} />
          <FormField name="vendor" label="Vendor" type="select" required value={values.vendor} onChange={set} options={vendors} error={errors.vendor} />
          <FormField name="invoiceNumber" label="Invoice number" required value={values.invoiceNumber} onChange={set} placeholder="e.g. 365081" error={errors.invoiceNumber} />
          <FormField name="invoiceDate" label="Invoice date" type="date" required value={values.invoiceDate} onChange={set} error={errors.invoiceDate} />
          <FormField name="docType" label="Document" type="select" required value={values.docType} onChange={set} options={DOC_TYPE_OPTIONS} hint="Invoice, BOL or both" error={errors.docType} />
          <FormField name="amount" label="Amount" type="number" min={0} step="0.01" required value={values.amount} onChange={set} error={errors.amount} />
          <FormField name="file" label="Upload PDF / image" type="file" accept=".pdf,image/png,image/jpeg" required value={values.file} onChange={set} span={2} error={errors.file} />
        </div>

        <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
          <div>
            <label className="form-label" style={{ marginBottom: 2 }}>Manual line items</label>
            <div className="form-hint">Break the invoice into items (fuel, taxes, fees). Their amounts must total the invoice amount.</div>
          </div>
          <Toggle on={manual} onChange={setManual} />
        </div>

        {manual && (
          <div>
            <div style={{ overflowX: 'auto' }}>
              <table className="table" style={{ width: '100%', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th style={{ ...cell, minWidth: 180 }}>Item</th>
                    <th style={cell}>Description</th>
                    <th style={{ ...cell, width: 90 }}>Qty</th>
                    <th style={{ ...cell, width: 100 }}>Price</th>
                    <th style={{ ...cell, width: 110 }}>Amount</th>
                    <th style={{ ...cell, width: 36 }} />
                  </tr>
                </thead>
                <tbody>
                  {children.map((r, i) => (
                    <tr key={i}>
                      <td style={cell}>
                        <select className="form-control" value={r.item_id} onChange={(e) => setLine(i, 'item_id', e.target.value)}>
                          <option value="">Select…</option>
                          {items.map((o) => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                          ))}
                        </select>
                      </td>
                      <td style={cell}>
                        <input className="form-control" value={r.description} onChange={(e) => setLine(i, 'description', e.target.value)} placeholder="Optional" />
                      </td>
                      <td style={cell}>
                        <input className="form-control" type="number" min="0" step="0.01" value={r.quantity} onChange={(e) => setLine(i, 'quantity', e.target.value)} />
                      </td>
                      <td style={cell}>
                        <input className="form-control" type="number" min="0" step="0.000001" value={r.price} onChange={(e) => setLine(i, 'price', e.target.value)} />
                      </td>
                      <td style={cell}>
                        <input className="form-control" type="number" min="0" step="0.01" value={r.amount} onChange={(e) => setLine(i, 'amount', e.target.value)} />
                      </td>
                      <td style={{ ...cell, textAlign: 'center' }}>
                        <button type="button" className="btn btn-outline btn-sm" aria-label="Remove line" onClick={() => removeLine(i)}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <button type="button" className="btn btn-outline btn-sm" onClick={addLine}>
                + Add line
              </button>
              <div style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ color: 'var(--text-muted)' }}>Lines total</span>
                <span className="cell-strong">{usd(childrenTotal)}</span>
                <span style={{ color: 'var(--text-muted)' }}>/ Invoice {usd(amountNum)}</span>
                <span className={'status ' + (matches ? 'status-green' : 'status-red')}>
                  {matches ? 'Balanced' : `Δ ${usd(childrenTotal - amountNum)}`}
                </span>
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
