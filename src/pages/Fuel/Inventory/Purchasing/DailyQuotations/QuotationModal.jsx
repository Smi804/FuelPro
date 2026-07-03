import { useState, useEffect } from 'react';
import Modal from '../../../../../components/Modal.jsx';
import FormField from '../../../../../components/crud/FormField.jsx';
import { showToast } from '../../../../../v4/toast.js';
import { getItemsDropDown } from '../../../../../api/items.js';

const today = () => new Date().toISOString().slice(0, 10);
const num = (v) => Number(v) || 0;
const emptyLine = () => ({ item_id: '', price: '' });

function toForm(quotation = null) {
  const children =
    quotation?.children?.length > 0
      ? quotation.children.map((c) => ({ item_id: String(c.item_id ?? ''), price: c.price ?? '' }))
      : [emptyLine()];
  return {
    supplier_id: quotation?.supplier_id != null ? String(quotation.supplier_id) : '',
    date: quotation?.date || today(),
    remarks: quotation?.remarks || '',
    children
  };
}

export default function QuotationModal({ vendors = [], stationId, quotation, onClose, onSubmit }) {
  const isEdit = !!quotation?.id;
  const [values, setValues] = useState(() => toForm(quotation));
  const [children, setChildren] = useState(() => toForm(quotation).children);
  const [items, setItems] = useState([]);
  const [errors, setErrors] = useState({});
  const [lineError, setLineError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (name, value) => {
    setValues((v) => ({ ...v, [name]: value }));
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  useEffect(() => {
    getItemsDropDown({ station_id: stationId })
      .then(setItems)
      .catch(() => setItems([]));
  }, [stationId]);

  const setLine = (i, field, value) => {
    setChildren((rows) => rows.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
    setLineError('');
  };

  const addLine = () => setChildren((rows) => [...rows, emptyLine()]);
  const removeLine = (i) => setChildren((rows) => (rows.length > 1 ? rows.filter((_, idx) => idx !== i) : rows));

  const validate = () => {
    const e = {};
    if (!values.supplier_id) e.supplier_id = 'Supplier is required';
    if (!values.date) e.date = 'Date is required';
    setErrors(e);

    const rows = children.filter((r) => r.item_id || r.price !== '');
    let lineMsg = '';
    if (!rows.length) lineMsg = 'Add at least one item with a quoted price.';
    else if (rows.some((r) => !r.item_id || r.price === '' || r.price == null || num(r.price) < 0))
      lineMsg = 'Each line needs an item and a valid price.';
    else {
      const dup = rows.map((r) => r.item_id).filter((id, i, arr) => arr.indexOf(id) !== i);
      if (dup.length) lineMsg = 'Each item can only appear once per quotation.';
    }
    setLineError(lineMsg);
    return Object.keys(e).length === 0 && !lineMsg;
  };

  const submit = async (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit({
        ...values,
        station_id: stationId,
        children: children
          .filter((r) => r.item_id && r.price !== '' && r.price != null)
          .map((r) => ({ item_id: r.item_id, price: num(r.price) }))
      });
      showToast(isEdit ? 'Quotation updated' : 'Quotation saved', { variant: 'success' });
      onClose();
    } catch (err) {
      showToast(err?.message || 'Failed to save quotation', { variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  const cell = { padding: '6px 6px' };

  return (
    <Modal
      title={isEdit ? 'Edit daily quotation' : 'Add daily quotation'}
      size="lg"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="quotation-form" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Save quotation'}
          </button>
        </>
      }
    >
      <form id="quotation-form" onSubmit={submit} noValidate>
        <div className="form-row">
          <FormField
            name="supplier_id"
            label="Supplier"
            type="select"
            required
            value={values.supplier_id}
            onChange={set}
            options={vendors}
            error={errors.supplier_id}
          />
          <FormField
            name="date"
            label="Quotation date"
            type="date"
            required
            value={values.date}
            onChange={set}
            error={errors.date}
          />
          <FormField name="remarks" label="Remarks" value={values.remarks} onChange={set} placeholder="Optional notes" span={2} />
        </div>

        <div className="form-label" style={{ marginTop: 8, marginBottom: 6 }}>
          Item prices
        </div>
        <div className="form-hint" style={{ marginBottom: 8 }}>
          Enter the supplier&apos;s quoted price for each product on this date.
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', fontSize: 13 }}>
            <thead>
              <tr>
                <th style={{ ...cell, minWidth: 200 }}>Item</th>
                <th style={{ ...cell, width: 140 }}>Quoted price</th>
                <th style={{ ...cell, width: 36 }} />
              </tr>
            </thead>
            <tbody>
              {children.map((r, i) => (
                <tr key={i}>
                  <td style={cell}>
                    <select className="form-control" value={r.item_id} onChange={(e) => setLine(i, 'item_id', e.target.value)}>
                      <option value="">Select item…</option>
                      {items.map((o) => (
                        <option
                          key={o.value}
                          value={o.value}
                          disabled={children.some((x, j) => j !== i && String(x.item_id) === String(o.value))}
                        >
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td style={cell}>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      step="0.000001"
                      value={r.price}
                      onChange={(e) => setLine(i, 'price', e.target.value)}
                      placeholder="0.00"
                    />
                  </td>
                  <td style={{ ...cell, textAlign: 'center' }}>
                    <button type="button" className="btn btn-outline btn-sm" aria-label="Remove line" onClick={() => removeLine(i)}>
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" className="btn btn-outline btn-sm" style={{ marginTop: 8 }} onClick={addLine}>
          + Add item
        </button>

        {lineError && (
          <div className="form-hint" style={{ color: 'var(--red)', marginTop: 8 }}>
            {lineError}
          </div>
        )}
      </form>
    </Modal>
  );
}
