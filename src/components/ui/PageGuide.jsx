import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BookOpen, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { guideFor } from '@/config/guides';
import { storage } from '@/services/storage';
import { cn } from '@/utils/format';

const KIND = { ai: ['AI', 'gold'], automation: ['Automation', 'teal'], integration: ['Integration', 'brand'] };
const TABS = [['use', 'How to use'], ['need', 'What you need'], ['next', 'Coming next (AI & automation)']];

/** Plain-language guide shown under every page title. Open on the first visit, then collapsed. */
export default function PageGuide() {
  const { pathname } = useLocation();
  const g = guideFor(pathname);
  const key = `guide:${pathname}`;
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('use');
  useEffect(() => { if (g) { const seen = storage.get(key); setOpen(!seen); setTab('use'); if (!seen) storage.set(key, true); } }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!g) return null;
  const tabs = g.future?.length ? TABS : TABS.slice(0, 2);
  return (
    <section className="mb-5 rounded-xl border border-brand-100 bg-brand-50/60" aria-label="Page guide">
      <div className="flex items-start gap-3 p-3 sm:p-4">
        <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-gold-600"><Lightbulb size={18} /></span>
        <div className="min-w-0 flex-1"><p className="text-sm text-ink-700">{g.why}</p>
          {g.flags?.length > 0 && <div className="mt-2 flex flex-wrap gap-1.5">{g.flags.map((f) => <Badge key={f} tone={KIND[f][1]}>{KIND[f][0]} preview</Badge>)}</div>}</div>
        <button type="button" onClick={() => setOpen((o) => !o)} aria-expanded={open} className="inline-flex shrink-0 items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-brand-800 shadow-card hover:bg-brand-50">
          <BookOpen size={14} />{open ? 'Hide guide' : 'Show guide'}{open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}</button>
      </div>
      {open && (
        <div className="border-t border-brand-100 bg-white p-3 sm:p-4">
          <div className="mb-3 flex gap-1 overflow-x-auto" role="tablist">{tabs.map(([k, l]) => <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold', tab === k ? 'bg-brand-800 text-white' : 'bg-ink-100 text-ink-600 hover:bg-ink-200')}>{l}</button>)}</div>
          {tab === 'use' && <><ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-700">{g.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            {g.words?.length > 0 && <dl className="mt-4 grid gap-2 rounded-lg bg-ink-50 p-3 text-sm sm:grid-cols-2">{g.words.map(([w, m]) => <div key={w}><dt className="inline font-semibold text-ink-800">{w}: </dt><dd className="inline text-ink-600">{m}</dd></div>)}</dl>}</>}
          {tab === 'need' && <ul className="list-disc space-y-1.5 pl-5 text-sm text-ink-700">{g.needs.map((s) => <li key={s}>{s}</li>)}</ul>}
          {tab === 'next' && (
            <div className="space-y-4">
              {g.future.map((f) => (
                <div key={f.title} className="rounded-lg border border-ink-100 p-3">
                  <div className="mb-2 flex items-center gap-2"><Badge tone={KIND[f.kind][1]}>{KIND[f.kind][0]}</Badge><p className="text-sm font-semibold text-ink-900">{f.title}</p></div>
                  <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-700">{f.steps.map((s) => <li key={s}>{s}</li>)}</ol>
                  <p className="mt-2 rounded bg-gold-50 px-2.5 py-1.5 text-xs text-gold-700"><b>{f.nb.startsWith('NB:') ? 'NB:' : ''}</b>{f.nb.replace(/^NB:/, '')}</p>
                </div>))}
              <p className="text-xs text-ink-400">When the backend server is connected, this page loads and saves through the API. Nothing changes for you. See <Link to="/app/help" className="font-medium text-brand-600">Help Center</Link>.</p>
            </div>)}
        </div>)}
    </section>
  );
}
