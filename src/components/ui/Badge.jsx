import { cn } from '@/utils/format';
import { toneOf, label } from '@/utils/status';

const TONE = {
  neutral: 'bg-ink-100 text-ink-600', brand: 'bg-brand-50 text-brand-700', teal: 'bg-teal-50 text-teal-700', gold: 'bg-gold-100 text-gold-700',
  success: 'bg-emerald-50 text-emerald-700', warning: 'bg-amber-50 text-amber-700', danger: 'bg-red-50 text-red-700',
};
export default function Badge({ tone = 'neutral', children, className }) {
  return <span className={cn('inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium', TONE[tone], className)}>{children}</span>;
}
/** Colours itself from a status keyword, e.g. <StatusBadge value="needs_review" />. */
export const StatusBadge = ({ value }) => (value ? <Badge tone={toneOf(value)}>{label(value)}</Badge> : <span className="text-ink-300">-</span>);
