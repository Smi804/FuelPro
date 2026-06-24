import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * Generic click-outside dropdown menu, reusing the theme's `.menu-popover`
 * styling. `items` is an array of { label, onClick, danger, icon, separator }.
 * `trigger` is a render function receiving { open, toggle }.
 *
 * The menu is rendered in a portal with fixed positioning so it can never be
 * clipped by an overflowing ancestor (e.g. a short `.table-responsive`). It
 * also flips above the trigger when there isn't room below.
 */
export default function Dropdown({ trigger, items = [], align = 'right' }) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState(null);
  const [up, setUp] = useState(false);
  const wrapRef = useRef(null);
  const menuRef = useRef(null);

  // Track the trigger position while open (and on scroll/resize).
  useLayoutEffect(() => {
    if (!open) return undefined;
    const measure = () => {
      const el = wrapRef.current;
      if (el) setRect(el.getBoundingClientRect());
    };
    measure();
    window.addEventListener('scroll', measure, true);
    window.addEventListener('resize', measure);
    return () => {
      window.removeEventListener('scroll', measure, true);
      window.removeEventListener('resize', measure);
    };
  }, [open]);

  // Decide whether to open upward once we know the menu height.
  useLayoutEffect(() => {
    if (!open || !rect || !menuRef.current) return;
    const h = menuRef.current.offsetHeight;
    const room = window.innerHeight - rect.bottom;
    setUp(room < h + 8 && rect.top > h + 8);
  }, [open, rect, items.length]);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (wrapRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
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

  const menu =
    open &&
    rect &&
    createPortal(
      <div
        ref={menuRef}
        className="menu-popover"
        style={{
          position: 'fixed',
          ...(up ? { top: rect.top - 4, transform: 'translateY(-100%)' } : { top: rect.bottom + 4 }),
          ...(align === 'right' ? { right: window.innerWidth - rect.right } : { left: rect.left }),
          minWidth: 168,
          zIndex: 1200
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
      </div>,
      document.body
    );

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-flex' }}>
      {trigger({ open, toggle })}
      {menu}
    </div>
  );
}
