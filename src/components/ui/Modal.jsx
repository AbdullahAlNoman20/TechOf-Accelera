import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/utils/format';

const SIZE = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl', xl: 'max-w-6xl' };
export default function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} />
      <div className={cn('relative flex max-h-[92vh] w-full flex-col rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl', SIZE[size])}>
        <header className="flex items-start justify-between gap-3 border-b border-ink-100 px-5 py-4">
          <div><h2 className="text-base font-semibold text-ink-900">{title}</h2>{subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}</div>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1 text-ink-400 hover:bg-ink-100"><X size={18} /></button>
        </header>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <footer className="flex flex-wrap justify-end gap-2 border-t border-ink-100 px-5 py-3">{footer}</footer>}
      </div>
    </div>
  );
}
