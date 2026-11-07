import { cn } from '@/utils/format';

const TONE = { brand: 'bg-brand-600', teal: 'bg-teal-500', gold: 'bg-gold-500', danger: 'bg-red-500', success: 'bg-emerald-500' };
export default function ProgressBar({ value = 0, max = 100, tone, showValue }) {
  const p = Math.max(0, Math.min(100, max ? (value / max) * 100 : 0));
  const t = tone || (p >= 80 ? 'success' : p >= 50 ? 'teal' : p >= 30 ? 'gold' : 'danger');
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-ink-100"><div className={cn('h-full rounded-full', TONE[t])} style={{ width: `${p}%` }} /></div>
      {showValue && <span className="w-9 text-right text-xs font-medium text-ink-600">{Math.round(p)}%</span>}
    </div>
  );
}
