import { useState } from 'react';
import Modal from '../Modal.jsx';
import FormField from './FormField.jsx';
import { showToast } from '../../v4/toast.js';

/**
 * Config-driven create/edit modal. `fields` is the schema:
 *   { name, label, type, options, required, validate(value, values), span, ... }
 *
 * Validation runs on submit (required + per-field `validate`), mirroring a
 * resolver-style flow without pulling in a form/validation library. Handles
 * loading state, inline errors and a success toast.
 */
export default function FormModal({
  title,
  fields,
  initialValues = {},
  onClose,
  onSubmit,
  submitLabel = 'Save',
  successMessage = 'Saved',
  size = 'md',
  cols = 2
}) {
  const [values, setValues] = useState(() => {
    const base = {};
    fields.forEach((f) => {
      base[f.name] = initialValues[f.name] ?? f.defaultValue ?? '';
    });
    return base;
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const setValue = (name, value) => {
    setValues((v) => {
      const next = { ...v, [name]: value };
      // Recompute a derived field if any field declares `derive`.
      fields.forEach((f) => {
        if (f.derive) next[f.name] = f.derive(next);
      });
      return next;
    });
    setErrors((e) => (e[name] ? { ...e, [name]: undefined } : e));
  };

  const validate = () => {
    const next = {};
    fields.forEach((f) => {
      const val = values[f.name];
      if (f.required && (val === '' || val == null)) next[f.name] = `${f.label} is required`;
      else if (f.validate) {
        const msg = f.validate(val, values);
        if (msg) next[f.name] = msg;
      }
    });
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    try {
      await onSubmit?.(values);
      showToast(successMessage, { variant: 'success' });
      onClose();
    } catch (err) {
      showToast(err?.message || 'Something went wrong', { variant: 'danger' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={onClose}
      size={size}
      footer={
        <>
          <button type="button" className="btn btn-outline" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="submit" form="form-modal" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : submitLabel}
          </button>
        </>
      }
    >
      <form id="form-modal" onSubmit={submit} noValidate>
        <div className="form-row" style={cols === 1 ? { gridTemplateColumns: '1fr' } : undefined}>
          {fields.map((f) => (
            <FormField
              key={f.name}
              {...f}
              value={values[f.name]}
              onChange={setValue}
              error={errors[f.name]}
              readOnly={f.readOnly || !!f.derive}
            />
          ))}
        </div>
      </form>
    </Modal>
  );
}
