import { useEffect } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

export default function StatusToast({ notice, onClose }) {
  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timer = window.setTimeout(onClose, 4500);
    return () => window.clearTimeout(timer);
  }, [notice, onClose]);

  if (!notice) {
    return null;
  }

  const Icon = ICONS[notice.type] || Info;

  return (
    <div
      className={`status-toast is-${notice.type || 'info'}`}
      role="status"
      aria-live="polite"
    >
      <span className="toast-icon" aria-hidden="true">
        <Icon size={18} />
      </span>
      <div className="toast-copy">
        <strong>{notice.title}</strong>
        {notice.message && <p>{notice.message}</p>}
      </div>
      <button
        type="button"
        className="toast-close"
        onClick={onClose}
        aria-label="Dismiss notification"
      >
        <X size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
