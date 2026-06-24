import Modal from '../Modal.jsx';

export default function ConfirmDialog({ title = 'Are you sure?', body, confirmLabel = 'Confirm', danger = true, onConfirm, onClose }) {
  return (
    <Modal
      title={title}
      onClose={onClose}
      size="sm"
      footer={
        <>
          <button className="btn btn-outline" type="button" onClick={onClose}>
            Cancel
          </button>
          <button
            className={'btn ' + (danger ? 'btn-danger' : 'btn-primary')}
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </>
      }
    >
      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>{body}</p>
    </Modal>
  );
}
