import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import { CATALOG, STATUS_INFO, statusOf, totalFeatures } from '@/config/catalog';
import { cn } from '@/utils/format';

/** Marketing-style map of every Accelera capability, with where it lives and its current status. */
export default function Explore() {
  const [q, setQ] = useState('');
  const [mod, setMod] = useState('');
  const [st, setSt] = useState('');
  const counts = useMemo(() => { const c = { ready: 0, ai: 0, connect: 0 }; CATALOG.forEach((m) => m.groups.forEach((g) => g.items.forEach((i) => { c[statusOf(i)] += 1; }))); return c; }, []);
  const term = q.trim().toLowerCase();
  const mods = CATALOG.filter((m) => !mod || m.n === mod).map((m) => ({ ...m, groups: m.groups.map((g) => ({ ...g, items: g.items.filter((i) => (!term || `${i} ${g.title} ${g.blurb}`.toLowerCase().includes(term)) && (!st || statusOf(i) === st)) })).filter((g) => g.items.length) })).filter((m) => m.groups.length);

  return (
    <>
      <PageHeader title="Explore Accelera" />
      <div className="mb-5 grid gap-3 sm:grid-cols-4">
        <div className="card p-4"><p className="text-2xl font-bold text-brand-800">{totalFeatures()}</p><p className="text-xs text-ink-500">features in 10 modules</p></div>
        {Object.entries(STATUS_INFO).map(([k, v]) => <button key={k} type="button" onClick={() => setSt(st === k ? '' : k)} className={cn('card p-4 text-left transition', st === k && 'ring-2 ring-brand-500')}><p className="text-2xl font-bold text-ink-900">{counts[k]}</p><Badge tone={v.tone}>{v.label}</Badge><p className="mt-1 text-xs text-ink-500">{v.text}</p></button>)}
      </div>
      <div className="mb-5 flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1"><Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" /><input className="input pl-9" placeholder="Search features, for example: quotation, referral, backup" aria-label="Search features" value={q} onChange={(e) => setQ(e.target.value)} /></div>
        <select aria-label="Module" className="input w-auto" value={mod} onChange={(e) => setMod(e.target.value)}><option value="">All modules</option>{CATALOG.map((m) => <option key={m.n} value={m.n}>{m.n} {m.name}</option>)}</select>
      </div>
      <div className="space-y-8">
        {mods.map((m) => (
          <section key={m.n}>
            <div className="mb-3 flex items-baseline gap-3"><span className="rounded-lg bg-brand-800 px-2 py-1 text-xs font-bold text-white">{m.n}</span><div><h2 className="text-lg font-bold text-ink-900">{m.name}: {m.brand}</h2><p className="text-sm text-ink-500">{m.blurb}</p></div></div>
            <div className="grid gap-4 lg:grid-cols-2">
              {m.groups.map((g) => (
                <Card key={g.id} title={`${g.id}  ${g.title}`} subtitle={g.blurb} action={<Link to={g.route} className="inline-flex items-center gap-1 rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-800 hover:bg-brand-100">Open<ArrowRight size={12} /></Link>}>
                  <ul className="flex flex-wrap gap-1.5">{g.items.map((i) => { const s = statusOf(i); return <li key={i} title={STATUS_INFO[s].text} className={cn('rounded-full border px-2.5 py-1 text-xs', s === 'ready' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : s === 'ai' ? 'border-gold-200 bg-gold-50 text-gold-700' : 'border-brand-200 bg-brand-50 text-brand-700')}>{i}</li>; })}</ul>
                </Card>))}
            </div>
          </section>))}
        {!mods.length && <p className="card p-10 text-center text-sm text-ink-400">No features match. Try another word.</p>}
      </div>
    </>
  );
}
