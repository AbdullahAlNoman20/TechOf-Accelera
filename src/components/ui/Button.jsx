import { cn } from '@/utils/format';

const VARIANT = {
  primary: 'bg-brand-800 text-white hover:bg-brand-900',
  secondary: 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
  ghost: 'text-ink-600 hover:bg-ink-100',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  accent: 'bg-gold-500 text-ink-900 hover:bg-gold-600',
  teal: 'bg-teal-500 text-white hover:bg-teal-600',
};
const SIZE = { sm: 'px-2.5 py-1.5 text-xs', md: 'px-3.5 py-2 text-sm', icon: 'p-1.5' };

export default function Button({ variant = 'primary', size = 'md', icon: Icon, children, className, type = 'button', ...rest }) {
  return (
    <button type={type} className={cn('inline-flex items-center justify-center gap-1.5 whitespace-nowrap rounded-lg font-medium transition disabled:cursor-not-allowed disabled:opacity-50', VARIANT[variant], SIZE[size], className)} {...rest}>
      {Icon && <Icon size={size === 'sm' || size === 'icon' ? 14 : 16} />}
      {children}
    </button>
  );
}
