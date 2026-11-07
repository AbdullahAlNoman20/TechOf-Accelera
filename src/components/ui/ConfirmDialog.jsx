import Modal from './Modal';
import Button from './Button';

export default function ConfirmDialog({ open, title = 'Please confirm', message, confirmLabel = 'Confirm', danger, onConfirm, onCancel }) {
  return (
    <Modal open={open} onClose={onCancel} title={title} size="sm"
      footer={<><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>{confirmLabel}</Button></>}>
      <p className="text-sm text-ink-600">{message}</p>
    </Modal>
  );
}
