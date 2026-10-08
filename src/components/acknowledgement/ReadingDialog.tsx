import { useEffect, useId, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import './readingDialog.css';

export default function ReadingDialog({ title, eyebrow, children, onClose, compact = false, closeLabel = 'Close window' }: {
  title: string; eyebrow: string; children: ReactNode; onClose: () => void; compact?: boolean; closeLabel?: string;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const openerRef = useRef(typeof document !== 'undefined' && document.activeElement instanceof HTMLElement ? document.activeElement : null);
  useEffect(() => {
    const dialog = ref.current;
    const opener = openerRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog?.showModal();
    document.body.style.overflow = 'hidden';
    return () => {
      dialog?.close(); document.body.style.overflow = previousOverflow;
      requestAnimationFrame(() => { if (!dialog?.open && opener?.isConnected) opener.focus(); });
    };
  }, []);
  return <dialog ref={ref} className={`reading-dialog${compact ? ' reading-dialog-compact' : ''}`} aria-labelledby={titleId}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onClick={event => { if (event.target === event.currentTarget) {
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    } }}>
    <header className="reading-dialog-header"><div><p className="reading-eyebrow">{eyebrow}</p><h2 id={titleId}>{title}</h2></div>
      <button type="button" className="reading-close" aria-label={closeLabel} onClick={onClose}><X size={20} /></button>
    </header>
    <div className="reading-dialog-content">{children}</div>
  </dialog>;
}
