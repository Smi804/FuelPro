import { useEffect, useRef, useState } from 'react';

/**
 * Generic click-outside dropdown menu, reusing the theme's `.menu-popover`
 * styling. `items` is an array of { label, onClick, danger, icon, separator }.
 * `trigger` is a render function receiving { open, toggle }.
 */
export default function Dropdown({ trigger, items = [], align = 'right' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggle = () => setOpen((o) => !o);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-flex' }}>
      {trigger({ open, toggle })}
      {open && (
        <div
          className="menu-popover"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            [align]: 0,
            minWidth: 168
          }}
        >
          {items.map((item, i) =>
            item.separator ? (
              <div key={`sep-${i}`} className="menu-separator" />
            ) : (
              <button
                key={item.label}
                type="button"
                className="menu-item"
                style={item.danger ? { color: 'var(--red)' } : undefined}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
