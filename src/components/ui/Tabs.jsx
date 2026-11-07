import { cn } from '@/utils/format';

export default function Tabs({ tabs, value, onChange, className }) {
  return (
    <div className={cn('mb-4 flex gap-1 overflow-x-auto border-b border-ink-200', className)} role="tablist">
      {tabs.map((t) => (
        <button key={t.key} type="button" role="tab" aria-selected={value === t.key} onClick={() => onChange(t.key)}
          className={cn('whitespace-nowrap border-b-2 px-3.5 py-2 text-sm font-medium transition', value === t.key ? 'border-brand-800 text-brand-800' : 'border-transparent text-ink-500 hover:text-ink-800')}>
          {t.label}
          {t.count !== undefined && <span className="ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[11px] text-ink-600">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
