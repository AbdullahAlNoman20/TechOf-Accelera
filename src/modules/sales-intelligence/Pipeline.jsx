import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, LayoutGrid, List, Settings2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import CrudTable from '@/components/data/CrudTable';
import Ref from '@/components/common/Ref';
import DealList from './Deals';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import useFieldAccess from '@/hooks/useFieldAccess';
import useStages from '@/hooks/useStages';
import { api } from '@/services/api';
import { onStageChange } from '@/services/automation';
import { scopeRows } from '@/utils/scope';
import { humanize, money, sum } from '@/utils/format';
import { toneOf } from '@/utils/status';

const RISK = { high: 'danger', medium: 'warning', low: 'success' };
const REASONS = ['price', 'competitor', 'timing', 'budget', 'other'];
const STAGE_FIELDS = [
  { name: 'name', label: 'Stage name', required: true }, { name: 'order', label: 'Order', type: 'number', min: 1, max: 99, required: true },
  { name: 'probability', label: 'Default chance (%)', type: 'number', min: 0, max: 100, required: true }, { name: 'type', label: 'Stage type', type: 'select', options: ['open', 'won', 'lost'], required: true },
  { name: 'requires', label: 'Rule before entering', placeholder: 'Quotation required / Lost reason required', span: 2 },
];

export default function Pipeline() {
  const { items, update } = useCollection('deals');
  const { items: proposals } = useCollection('proposals');
  const { user, level, canWrite } = useAuth();
  const { show } = useFieldAccess();
  const { stages, byId } = useStages();
  const { push } = useToast();
  const [view, setView] = useState('board');
  const [lost, setLost] = useState(null);
  const [settings, setSettings] = useState(false);
  const [form, setForm] = useState({ reason: 'price', competitor: '' });
  const deals = scopeRows(items, user, level('sales'));
  const w = canWrite('sales');
  const open = deals.filter((d) => byId[d.stage]?.type === 'open');
  const quiet = open.filter((d) => (Date.now() - new Date(d.lastActivityAt)) / 864e5 > 14);

  async function move(d, id) {
    const st = byId[id];
    if (st.type === 'lost') return setLost({ deal: d, stage: st });
    if (/quotation/i.test(st.requires) && !proposals.some((p) => p.dealId === d.id)) return push(`Rule: create a quotation for ${d.company} before moving to ${st.name}`, 'error');
    await update(d.id, { stage: id, probability: st.probability, lastActivityAt: new Date().toISOString() });
    const msgs = await onStageChange(d, st.type === 'won' ? 'won' : id);
    push([`${d.company} moved to ${st.name}`, ...msgs].join('. '));
  }
  async function confirmLost() {
    await update(lost.deal.id, { stage: lost.stage.id, probability: 0, lostReason: form.reason, competitor: form.competitor || lost.deal.competitor });
    const msgs = await onStageChange(lost.deal, 'lost'); push(msgs.join('. ') || 'Deal marked lost', 'info'); setLost(null);
  }
  const nudge = async (d) => { await api.create('followUps', { title: `Re-engage quiet deal - ${d.company}`, entityName: d.company, dealId: d.id, type: 'call', dueAt: new Date(Date.now() + 864e5).toISOString(), priority: 'high', status: 'scheduled', ownerId: d.ownerId, responseStatus: 'awaiting', attempt: 1 }); await update(d.id, { lastActivityAt: new Date().toISOString() }); push('Follow-up created for tomorrow'); };

  return (
    <>
      <PageHeader title="Deal Pipeline" actions={<>
        <div className="flex rounded-lg border border-ink-200 bg-white p-0.5"><Button size="icon" variant={view === 'board' ? 'primary' : 'ghost'} aria-label="Board view" icon={LayoutGrid} onClick={() => setView('board')} /><Button size="icon" variant={view === 'list' ? 'primary' : 'ghost'} aria-label="List view" icon={List} onClick={() => setView('list')} /></div>
        {canWrite('admin') && <Button variant="secondary" icon={Settings2} onClick={() => setSettings(true)}>Pipeline settings</Button>}</>} />
      <div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Open deals" value={open.length} /><StatCard label="Open value" value={show('Deal value') ? money(sum(open, 'value')) : 'Hidden'} tone="gold" /><StatCard label="Weighted forecast" value={show('Deal value') ? money(sum(open, (d) => (d.value * d.probability) / 100)) : 'Hidden'} tone="teal" hint="Value x chance of winning" /></div>
      {quiet.length > 0 && <Card title="Needs attention" subtitle="No activity for more than 14 days" className="mb-5" bodyClass="p-0"><ul className="divide-y divide-ink-100">{quiet.slice(0, 4).map((d) => <li key={d.id} className="flex items-center justify-between gap-3 px-4 py-2.5"><span className="flex min-w-0 items-center gap-2 text-sm text-ink-800"><AlertTriangle size={15} className="shrink-0 text-amber-500" /><span className="truncate">{d.company} ({humanize(d.stage)})</span></span>{w && <Button size="sm" variant="secondary" onClick={() => nudge(d)}>Create follow-up</Button>}</li>)}</ul></Card>}
      {view === 'list' ? <DealList /> : (
        <div className="flex gap-4 overflow-x-auto pb-3">
          {stages.map((s) => {
            const col = deals.filter((d) => d.stage === s.id);
            return (
              <section key={s.id} className="w-64 shrink-0 rounded-xl bg-ink-100/70 p-2.5">
                <header className="mb-2 flex items-center justify-between px-1"><Badge tone={toneOf(s.id)}>{s.name}</Badge><span className="text-xs text-ink-500">{col.length}{show('Deal value') && ` - ${money(sum(col, 'value'), true)}`}</span></header>
                <div className="space-y-2">
                  {col.map((d) => (
                    <article key={d.id} className="card p-3">
                      <Link to={`/app/sales/deals/${d.id}`} className="text-sm font-semibold text-ink-900 hover:text-brand-700">{d.company}</Link>
                      <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{d.title}</p>
                      <div className="mt-2 flex items-center justify-between"><b className="text-sm text-brand-800">{show('Deal value') ? money(d.value) : '-'}</b><Badge tone={RISK[d.risk]}>{d.risk} risk</Badge></div>
                      <div className="mt-2 flex items-center justify-between text-xs text-ink-500"><Ref id={d.ownerId} /><span>{d.probability}%</span></div>
                      {w && <select aria-label="Move deal to stage" className="input mt-2 py-1 text-xs" value={d.stage} onChange={(e) => move(d, e.target.value)}>{stages.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>}
                    </article>))}
                  {!col.length && <p className="py-6 text-center text-xs text-ink-400">No deals here</p>}
                </div>
              </section>);
          })}
        </div>)}
      <Modal open={!!lost} onClose={() => setLost(null)} title="Why was this deal lost?" subtitle={lost?.deal.company} size="sm" footer={<><Button variant="secondary" onClick={() => setLost(null)}>Cancel</Button><Button variant="danger" onClick={confirmLost}>Mark as lost</Button></>}>
        <div className="space-y-3"><div><label className="mb-1 block text-xs font-semibold text-ink-600">Reason</label><select className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>{REASONS.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}</select></div>
          <div><label className="mb-1 block text-xs font-semibold text-ink-600">Competitor (optional)</label><input className="input" maxLength={80} value={form.competitor} onChange={(e) => setForm({ ...form, competitor: e.target.value })} /></div></div>
      </Modal>
      <Modal open={settings} onClose={() => setSettings(false)} title="Pipeline settings" subtitle="Rename stages, change order, set default chances and add rules. Won and Lost types trigger the automatic handoffs." size="lg">
        <CrudTable collection="pipelineStages" module="admin" noun="stage" fields={STAGE_FIELDS} defaults={{ type: 'open', probability: 20, order: stages.length + 1 }} defaultSort={{ key: 'order', dir: 'asc' }} pageSize={12}
          transform={(v) => ({ ...v, id: v.id || v.name.toLowerCase().replace(/\W+/g, '_') })}
          columns={[{ key: 'order', label: '#' }, { key: 'name', label: 'Stage' }, { key: 'probability', label: 'Chance', render: (s) => `${s.probability}%` }, { key: 'type', label: 'Type', render: (s) => <Badge tone={toneOf(s.type === 'open' ? 'new' : s.type)}>{s.type}</Badge> }, { key: 'requires', label: 'Rule' }]} />
        <p className="mt-3 rounded bg-gold-50 p-2 text-xs text-gold-700"><b>NB:</b> Rules written like "Quotation required" are checked before a deal can enter that stage.</p>
      </Modal>
    </>
  );
}
