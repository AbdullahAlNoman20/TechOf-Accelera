import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { GUIDES } from '@/config/guides';
import { NAV } from '@/config/navigation';
import useAuth from '@/hooks/useAuth';

/** "Where is...?" search box. Type a word like "invoice" or "follow" and jump straight to the page. */
export default function PageFinder() {
  const [q, setQ] = useState('');
  const nav = useNavigate();
  const { can } = useAuth();
  const modOf = useMemo(() => Object.fromEntries(NAV.flatMap((n) => (n.items ? n.items.map((i) => [i.to, n.module]) : [[n.to, null]]))), []);
  const hits = q.trim().length < 2 ? [] : Object.entries(GUIDES).filter(([p, g]) => (!modOf[p] || can(modOf[p])) && `${g.name} ${g.tagline} ${g.why}`.toLowerCase().includes(q.trim().toLowerCase())).slice(0, 6);
  return (
    <div className="relative hidden w-72 md:block">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
      <input className="input pl-9" placeholder="Where is...? (try: invoice, follow-up)" aria-label="Find a page" value={q} onChange={(e) => setQ(e.target.value)} />
      {hits.length > 0 && <ul className="absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-ink-100 bg-white shadow-xl">{hits.map(([p, g]) => <li key={p}><button type="button" onClick={() => { nav(p); setQ(''); }} className="block w-full px-3 py-2 text-left hover:bg-brand-50"><p className="text-sm font-medium text-ink-900">{g.name}</p><p className="truncate text-xs text-ink-500">{g.tagline}</p></button></li>)}</ul>}
    </div>
  );
}
