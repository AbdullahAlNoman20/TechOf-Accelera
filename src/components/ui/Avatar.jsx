import { initials } from '@/utils/format';

export default function Avatar({ name = '', color = '#0B3A7A', size = 28 }) {
  return (
    <span className="inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white" style={{ width: size, height: size, backgroundColor: color, fontSize: size * 0.38 }} title={name}>
      {initials(name)}
    </span>
  );
}
