// Reusable form field used by FormModal and standalone forms. Supports text,
// number, email, tel, date, time, textarea, select and file inputs. Reuses the
// theme `.form-group / .form-label / .form-control` classes.
export default function FormField({
  name,
  label,
  type = 'text',
  value,
  onChange,
  options = [],
  required,
  error,
  placeholder,
  hint,
  readOnly,
  min,
  step,
  span,
  accept
}) {
  const cls = 'form-control' + (error ? ' is-invalid' : '');
  const handle = (e) => {
    if (type === 'file') {
      const file = e.target.files?.[0];
      // Keep the actual file (via an object URL) so it can be previewed later,
      // not just its name.
      onChange(name, file ? { name: file.name, url: URL.createObjectURL(file), type: file.type } : '');
      return;
    }
    onChange(name, e.target.value);
  };
  const fileMeta = type === 'file' && value && typeof value === 'object' ? value : null;

  if (type === 'checkbox') {
    return (
      <div className="form-group" style={span ? { gridColumn: `span ${span}` } : undefined}>
        <label className="form-check" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input
            id={name}
            type="checkbox"
            checked={!!value}
            onChange={(e) => onChange(name, e.target.checked)}
            disabled={readOnly}
            style={{ margin: 0 }}
          />
          <span>{label}</span>
        </label>
        {hint && <div className="form-hint">{hint}</div>}
      </div>
    );
  }

  return (
    <div className="form-group" style={span ? { gridColumn: `span ${span}` } : undefined}>
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      {type === 'select' ? (
        <select id={name} className={cls} value={value ?? ''} onChange={handle} disabled={readOnly}>
          <option value="">Select…</option>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      ) : type === 'textarea' ? (
        <textarea id={name} className={cls} rows={3} value={value ?? ''} onChange={handle} placeholder={placeholder} readOnly={readOnly} />
      ) : type === 'file' ? (
        <>
          <input id={name} className={cls} type="file" accept={accept} onChange={handle} />
          {fileMeta?.url && (
            <a
              href={fileMeta.url}
              target="_blank"
              rel="noreferrer"
              className="form-hint"
              style={{ color: 'var(--primary)', display: 'inline-block', marginTop: 4 }}
            >
              View selected file ({fileMeta.name})
            </a>
          )}
        </>
      ) : (
        <input
          id={name}
          className={cls}
          type={type}
          value={value ?? ''}
          onChange={handle}
          placeholder={placeholder}
          readOnly={readOnly}
          min={min}
          step={step}
        />
      )}
      {error ? (
        <div className="form-hint" style={{ color: 'var(--red)' }}>
          {error}
        </div>
      ) : (
        hint && <div className="form-hint">{hint}</div>
      )}
    </div>
  );
}
