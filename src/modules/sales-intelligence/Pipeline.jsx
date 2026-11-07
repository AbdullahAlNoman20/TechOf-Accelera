import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { onStageChange } from '@/services/automation';
import { scopeRows } from '@/utils/scope';
import { humanize, money, sum } from '@/utils/format';
import { STAGES, toneOf } from '@/utils/status';

const RISK = { high: 'danger', medium: 'warning', low: 'success' };
const REASONS = ['price', 'competitor', 'timing', 'budget', 'other'];

export default function Pipeline() {
  const { items, update } = useCollection('deals');
  const { user, level, canWrite } = useAuth();
  const { push } = useToast();
  const [lost, setLost] = useState(null);
  const [form, setForm] = useState({ reason: 'price', competitor: '' });
  const deals = scopeRows(items, user, level('sales'));
  const w = canWrite('sales');
  const open = deals.filter((d) => !['won', 'lost'].includes(d.stage));

  async function move(d, stage) {
    if (stage === 'lost') return setLost(d);
    await update(d.id, { stage, probability: { new: 10, contacted: 20, qualified: 35, meeting: 45, demo: 55, proposal: 65, negotiation: 80, won: 100 }[stage], lastActivityAt: new Date().toISOString() });
    const msgs = await onStageChange(d, stage);
    push([`${d.company} moved to ${humanize(stage)}`, ...msgs].join('. '));
  }
  async function confirmLost() {
    await update(lost.id, { stage: 'lost', probability: 0, lostReason: form.reason, competitor: form.competitor || lost.competitor });
    const msgs = await onStageChange(lost, 'lost'); push(msgs.join('. ') || 'Deal marked lost', 'info'); setLost(null);
  }
  return (
    <>
      <PageHeader title="Sales Pipeline" subtitle="Move deals through stages. Stage changes trigger follow-ups, proposals and the won-deal handoff automatically." />
      <div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Open deals" value={open.length} /><StatCard label="Open value" value={money(sum(open, 'value'))} tone="gold" /><StatCard label="Weighted forecast" value={money(sum(open, (d) => (d.value * d.probability) / 100))} tone="teal" /></div>
      <div className="flex gap-4 overflow-x-auto pb-3">
        {STAGES.map((s) => {
          const col = deals.filter((d) => d.stage === s);
          return (
            <section key={s} className="w-64 shrink-0 rounded-xl bg-ink-100/70 p-2.5">
              <header className="mb-2 flex items-center justify-between px-1"><Badge tone={toneOf(s)}>{humanize(s)}</Badge><span className="text-xs text-ink-500">{col.length} - {money(sum(col, 'value'), true)}</span></header>
              <div className="space-y-2">
                {col.map((d) => (
                  <article key={d.id} className="card p-3">
                    <Link to={`/app/sales/deals/${d.id}`} className="text-sm font-semibold text-ink-900 hover:text-brand-700">{d.company}</Link>
                    <p className="mt-0.5 line-clamp-2 text-xs text-ink-500">{d.title}</p>
                    <div className="mt-2 flex items-center justify-between"><b className="text-sm text-brand-800">{money(d.value)}</b><Badge tone={RISK[d.risk]}>{d.risk} risk</Badge></div>
                    <div className="mt-2 flex items-center justify-between text-xs text-ink-500"><Ref id={d.ownerId} /><span>{d.probability}%</span></div>
                    {w && <select aria-label="Move deal to stage" className="input mt-2 py-1 text-xs" value={d.stage} onChange={(e) => move(d, e.target.value)}>{STAGES.map((x) => <option key={x} value={x}>{humanize(x)}</option>)}</select>}
                  </article>))}
                {!col.length && <p className="py-6 text-center text-xs text-ink-400">No deals</p>}
              </div>
            </section>);
        })}
      </div>
      <Modal open={!!lost} onClose={() => setLost(null)} title="Mark deal as lost" subtitle={lost?.company} size="sm" footer={<><Button variant="secondary" onClick={() => setLost(null)}>Cancel</Button><Button variant="danger" onClick={confirmLost}>Mark lost</Button></>}>
        <div className="space-y-3"><div><label className="mb-1 block text-xs font-semibold text-ink-600">Lost reason</label><select className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}>{REASONS.map((r) => <option key={r} value={r}>{humanize(r)}</option>)}</select></div>
          <div><label className="mb-1 block text-xs font-semibold text-ink-600">Competitor (optional)</label><input className="input" maxLength={80} value={form.competitor} onChange={(e) => setForm({ ...form, competitor: e.target.value })} /></div></div>
      </Modal>
    </>
  );
}
