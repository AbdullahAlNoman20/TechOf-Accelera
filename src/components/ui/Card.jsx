import { cn } from '@/utils/format';

export default function Card({ title, subtitle, action, children, className, bodyClass = 'p-4' }) {
  return (
    <section className={cn('card', className)}>
      {(title || action) && (
        <header className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
          <div>
            <h3 className="text-sm font-semibold text-ink-900">{title}</h3>
            {subtitle && <p className="text-xs text-ink-500">{subtitle}</p>}
          </div>
          {action}
        </header>
      )}
      <div className={bodyClass}>{children}</div>
    </section>
  );
}
