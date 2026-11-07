export default function KeyValue({ items, cols = 2 }) {
  return (
    <dl className={`grid gap-x-6 gap-y-3 ${cols === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
      {items.map(([k, v]) => (
        <div key={k}><dt className="text-xs font-medium uppercase tracking-wide text-ink-400">{k}</dt><dd className="mt-0.5 break-words text-sm text-ink-800">{v ?? '-'}</dd></div>
      ))}
    </dl>
  );
}
