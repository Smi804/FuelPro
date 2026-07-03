import { useState, useEffect } from 'react';
import Modal from '../../../../../components/Modal.jsx';
import FormField from '../../../../../components/crud/FormField.jsx';
import { showToast } from '../../../../../v4/toast.js';
import { getItemsDropDown } from '../../../../../api/items.js';
import { INVOICE_TYPE_OPTIONS } from '../../../../../data/mock/fuel.js';

const today = () => new Date().toISOString().slice(0, 10);
const num = (v) => Number(v) || 0;
const emptyLine = () => ({ item_id: '', quantity: '' });

function bolToForm(bol) {
  const b = bol ?? {};
  return {
    type: b.type || 'fuel',
    vendor: b.vendor_id != null ? String(b.vendor_id) : '',
    bolNo: b.bolNumber || b.bolNo || '',
    bolDate: b.date ? String(b.date).slice(0, 10) : today(),
    remarks: b.remarks || '',
    file: ''
  };
}

function bolToChildren(bol) {
  const rows = bol?.children;
  return Array.isArray(rows) && rows.length
    ? rows.map((c) => ({ item_id: String(c.item_id ?? ''), quantity: c.quantity ?? '' }))
    : [emptyLine()];
}

/**
 * Create or edit a Bill of Lading (quantity audit — item + quantity only).
 */
export default function BolUploadModal({ vendors = [], userId, bol = null, onClose, onSubmit }) {
  const isEdit = !!bol?.id;
  const [values, setValues] = useState(() => bolToForm(bol));
  const [children, setChildren] = useState(() => bolToChildren(bol));
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [lineError, setLineError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  useEffect(() => {
    getItemsDropDown({ type: String(values.type || '').toUpperCase(), userId })
      .then(setItems)
      .catch(() => setItems([]));
  }, [values.type, userId]);

  const setLine = (i, field, value) => {
    setChildren((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
    setLineError('');
  };
  const addLine = () => setChildren((rows) => [...rows, emptyLine()]);
  const removeLine = (i) => setChildren((rows) => (rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows));

  const validate = () => {
    const e = {};
    if (!values.type) e.type = 'Type is required';
    if (!values.bolNo?.trim()) e.bolNo = 'BOL number is required';
    if (!values.bolDate) e.bolDate = 'BOL date is required';
    if (!isEdit && !values.file && !bol?.fileUrl) e.file = 'A PDF or image is required';
    setErrors(e);

    let lineMsg = '';
    const rows = children.filter((r) => r.item_id || r.quantity);
    if (!rows.length) lineMsg = 'Add at least one line item with quantity.';
    else if (rows.some((r) => !r.item_id || !num(r.quantity)))
      lineMsg = 'Each line needs an item and quantity.';
    setLineError(lineMsg);
    return Object.keys(e).length === 0 && !lineMsg;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        id: bol?.id,
        ...values,
        docType: 'bol',
        children: children
          .filter((r) => r.item_id || r.quantity)
          .map((r) => ({ item_id: r.item_id, quantity: num(r.quantity) }))
      });
      showToast(isEdit ? 'BOL updated' : 'BOL uploaded', { variant: 'success' });
      onClose();
    } catch (err) {
      showToast(err?.message || `Failed to ${isEdit ? 'update' : 'upload'} BOL`, { variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const cell = { padding: '6px 6px' };

  return (
    <Modal
      title={isEdit ? 'Edit BOL' : 'Upload BOL'}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="bol-upload-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Upload'}
          </button>
        </>
      }
    >
      <form id="bol-upload-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <FormField name="type" label="Type" type="select" required value={values.type} onChange={set} options={INVOICE_TYPE_OPTIONS} error={errors.type} />
          <FormField name="vendor" label="Vendor" type="select" value={values.vendor} onChange={set} options={vendors} error={errors.vendor} />
          <FormField name="bolNo" label="BOL No." required value={values.bolNo} onChange={set} placeholder="e.g. 7878" error={errors.bolNo} />
          <FormField name="bolDate" label="BOL date" type="date" required value={values.bolDate} onChange={set} error={errors.bolDate} />
          <FormField name="remarks" label="Remarks" value={values.remarks} onChange={set} placeholder="Optional notes" error={errors.remarks} span={2} />
          <FormField
            name="file"
            label={isEdit ? 'Replace file (optional)' : 'Upload PDF / image'}
            type="file"
            accept=".pdf,image/png,image/jpeg"
            required={!isEdit && !bol?.fileUrl}
            value={values.file}
            onChange={set}
            span={2}
            error={errors.file}
            hint={isEdit && bol?.fileName ? `Current: ${bol.fileName}` : undefined}
          />
        </div>

        <div className="form-group" style={{ marginTop: 4 }}>
          <label className="form-label">Line items (quantity audit)</label>
          <div className="form-hint" style={{ marginBottom: 8 }}>
            Enter each fuel grade or product and the quantity on the BOL.
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ ...cell, minWidth: 180 }}>Item</th>
                  <th style={{ ...cell, width: 120 }}>Quantity</th>
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
                      <input className="form-control" type="number" min="0" step="0.01" value={r.quantity} onChange={(e) => setLine(i, 'quantity', e.target.value)} />
                    </td>
                    <td style={{ ...cell, textAlign: 'center' }}>
                      <button type="button" className="btn btn-outline btn-sm" aria-label="Remove line" onClick={() => removeLine(i)}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={addLine}>
            + Add line
          </button>
        </div>

        {lineError && (
          <div className="form-hint" style={{ color: 'var(--red)', marginTop: 8 }}>
            {lineError}
          </div>
        )}
      </form>
    </Modal>
  );
}
