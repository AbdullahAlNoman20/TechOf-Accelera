import { cn } from '@/utils/format';

const TONE = { brand: 'bg-brand-50 text-brand-700', teal: 'bg-teal-50 text-teal-700', gold: 'bg-gold-100 text-gold-700', danger: 'bg-red-50 text-red-600', success: 'bg-emerald-50 text-emerald-700' };
export default function StatCard({ label, value, hint, icon: Icon, tone = 'brand' }) {
  return (
    <div className="card flex items-start justify-between gap-3 p-4">
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-ink-500">{label}</p>
        <p className="mt-1 truncate text-2xl font-bold text-ink-900">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-500">{hint}</p>}
      </div>
      {Icon && <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', TONE[tone])}><Icon size={20} /></span>}
    </div>
  );
}
