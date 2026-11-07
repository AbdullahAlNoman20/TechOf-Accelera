import { money } from '@/utils/format';

export const PALETTE = ['#0B3A7A', '#1A8F9B', '#F2B632', '#1F63B5', '#157782', '#D99A12', '#4F85CF', '#8DB0E3'];

export function BarChart({ data, height = 180, color = '#1456A8', format = (v) => v }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  const w = Math.max(data.length * 56, 280);
  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${height + 28}`} className="w-full" style={{ minWidth: Math.min(w, 320) }} role="img" aria-label="Bar chart">
        {data.map((d, i) => {
          const bh = (d.value / max) * (height - 18);
          const x = i * (w / data.length) + (w / data.length - 28) / 2;
          return (
            <g key={d.label}>
              <rect x={x} y={height - bh} width="28" height={bh} rx="4" fill={d.color || color} />
              <text x={x + 14} y={height - bh - 5} textAnchor="middle" fontSize="10" fill="#475569">{format(d.value)}</text>
              <text x={x + 14} y={height + 14} textAnchor="middle" fontSize="10" fill="#64748B">{String(d.label).slice(0, 9)}</text>
            </g>
          );
        })}
        <line x1="0" x2={w} y1={height} y2={height} stroke="#D9E0EA" />
      </svg>
    </div>
  );
}

export function HBar({ data, format = (v) => v, color = '#1456A8' }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="mb-1 flex justify-between text-xs"><span className="truncate text-ink-700">{d.label}</span><span className="font-semibold text-ink-800">{format(d.value)}</span></div>
          <div className="h-2 rounded-full bg-ink-100"><div className="h-2 rounded-full" style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color || (data.length > 1 ? PALETTE[i % PALETTE.length] : color) }} /></div>
        </li>
      ))}
    </ul>
  );
}

export function LineChart({ labels, series, height = 200, format = (v) => v }) {
  const w = 520, pad = 28;
  const max = Math.max(1, ...series.flatMap((s) => s.data));
  const pt = (v, i) => [pad + (i * (w - pad * 2)) / Math.max(1, labels.length - 1), height - 16 - (v / max) * (height - 40)];
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${height + 8}`} className="w-full" role="img" aria-label="Line chart">
        {[0, 0.5, 1].map((g) => <line key={g} x1={pad} x2={w - pad} y1={height - 16 - g * (height - 40)} y2={height - 16 - g * (height - 40)} stroke="#EBEFF5" />)}
        {series.map((s, si) => (
          <g key={s.name}>
            <polyline fill="none" stroke={s.color || PALETTE[si]} strokeWidth="2.5" points={s.data.map((v, i) => pt(v, i).join(',')).join(' ')} />
            {s.data.map((v, i) => <circle key={i} cx={pt(v, i)[0]} cy={pt(v, i)[1]} r="3.5" fill={s.color || PALETTE[si]}><title>{`${s.name} ${labels[i]}: ${format(v)}`}</title></circle>)}
          </g>
        ))}
        {labels.map((l, i) => <text key={l} x={pt(0, i)[0]} y={height + 4} textAnchor="middle" fontSize="10" fill="#64748B">{l}</text>)}
      </svg>
      <div className="mt-1 flex flex-wrap gap-3 text-xs text-ink-600">{series.map((s, i) => <span key={s.name} className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full" style={{ background: s.color || PALETTE[i] }} />{s.name}</span>)}</div>
    </div>
  );
}

export function Donut({ data, size = 150 }) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  const r = 52, c = 2 * Math.PI * r;
  let off = 0;
  return (
    <div className="flex flex-wrap items-center gap-5">
      <svg viewBox="0 0 140 140" width={size} height={size} role="img" aria-label="Donut chart" className="shrink-0">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#EBEFF5" strokeWidth="20" />
        {data.map((d, i) => {
          const len = (d.value / total) * c;
          const el = <circle key={d.label} cx="70" cy="70" r={r} fill="none" stroke={d.color || PALETTE[i % PALETTE.length]} strokeWidth="20" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} transform="rotate(-90 70 70)" />;
          off += len;
          return el;
        })}
        <text x="70" y="75" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0F172A">{total}</text>
      </svg>
      <ul className="space-y-1.5 text-xs">
        {data.map((d, i) => <li key={d.label} className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-sm" style={{ background: d.color || PALETTE[i % PALETTE.length] }} /><span className="text-ink-600">{d.label}</span><b className="text-ink-900">{d.value}</b></li>)}
      </ul>
    </div>
  );
}

export function Funnel({ data, format = (v) => v }) {
  const max = Math.max(1, data[0]?.value || 1);
  return (
    <ul className="space-y-2">
      {data.map((d, i) => {
        const prev = data[i - 1]?.value;
        return (
          <li key={d.label} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-ink-600">{d.label}</span>
            <div className="h-7 flex-1 rounded bg-ink-50"><div className="flex h-7 items-center rounded px-2 text-xs font-semibold text-white" style={{ width: `${Math.max(8, (d.value / max) * 100)}%`, background: PALETTE[i % PALETTE.length] }}>{format(d.value)}</div></div>
            <span className="w-12 text-right text-xs text-ink-500">{prev ? `${Math.round((d.value / prev) * 100)}%` : ''}</span>
          </li>
        );
      })}
    </ul>
  );
}
export { money };
