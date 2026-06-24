import { useEffect } from 'react';

// Minimal accessible modal: backdrop click + Escape to close. Reuses the
// template's .modal-* class names so it picks up the existing SCSS styling.
export default function Modal({ title, onClose, children, footer, size = 'md' }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const sizeCls = size === 'sm' ? ' modal-sm' : size === 'lg' ? ' modal-lg' : '';

  return (
    <div className="modal-backdrop show" onClick={onClose}>
      <div
        className={'modal-dialog' + sizeCls}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="modal-title">{title}</div>
          <button className="modal-close" type="button" aria-label="Close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
