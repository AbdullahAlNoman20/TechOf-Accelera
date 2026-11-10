import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import KeyValue from '@/components/ui/KeyValue';
import BackLink from '@/components/common/BackLink';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { onStageChange } from '@/services/automation';
import { fmtDate, fmtDateTime, humanize, money } from '@/utils/format';
import useStages from '@/hooks/useStages';
import useFieldAccess from '@/hooks/useFieldAccess';

export function dealRisks(d) {
  const r = [];
  const idle = Math.round((Date.now() - new Date(d.lastActivityAt)) / 864e5);
  if (idle > 14 && !['won', 'lost'].includes(d.stage)) r.push(`No activity for ${idle} days (inactive deal)`);
  if (new Date(d.expectedClose) < new Date() && !['won', 'lost'].includes(d.stage)) r.push('Expected closing date has passed (repeated postponement)');
  if (!(d.stakeholders || []).some((s) => s.influence === 'high')) r.push('No high-influence decision-maker identified');
  if (d.followUps >= 5 && d.stage !== 'won') r.push(`${d.followUps} follow-ups without progress`);
  return r;
}

export default function DealDetail() {
  const { id } = useParams();
  const { items, update } = useCollection('deals');
  const { items: proposals } = useCollection('proposals');
  const { items: convs } = useCollection('conversations');
  const { items: acts } = useCollection('activities');
  const { canWrite } = useAuth();
  const { stages, byId } = useStages();
  const { show } = useFieldAccess();
  const [file, setFile] = useState('');
  const { push } = useToast();
  const [sh, setSh] = useState({ name: '', role: '', influence: 'medium' });
  const d = items.find((x) => x.id === id);
  if (!d) return <p className="p-6 text-sm text-ink-500">Deal not found.</p>;
  const w = canWrite('sales');
  const risks = dealRisks(d);
  const timeline = acts.filter((a) => a.entityName === d.company).slice(0, 6);

  async function stage(s) { const st = byId[s]; await update(d.id, { stage: s, probability: st.probability, lastActivityAt: new Date().toISOString() }); const m = await onStageChange(d, st.type === 'won' ? 'won' : st.type === 'lost' ? 'lost' : s); push([`Stage: ${st.name}`, ...m].join('. ')); }
  async function attach() { if (!file.trim()) return; await update(d.id, { files: [...(d.files || []), { name: file.trim(), kind: /contract|agreement/i.test(file) ? 'Contract' : /scope|brief/i.test(file) ? 'Scope document' : 'File', at: new Date().toISOString() }] }); setFile(''); push('File attached to the deal'); }
  async function addSh() { if (!sh.name.trim()) return push('Enter a name', 'error'); await update(d.id, { stakeholders: [...(d.stakeholders || []), { ...sh }] }); setSh({ name: '', role: '', influence: 'medium' }); }

  return (
    <>
      <PageHeader back={<BackLink to="/app/sales/pipeline">Deal Pipeline</BackLink>} title={d.company} subtitle={d.title} actions={w && <select aria-label="Stage" className="input w-auto" value={d.stage} onChange={(e) => stage(e.target.value)}>{stages.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>} />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Deal summary" className="lg:col-span-2"><KeyValue cols={3} items={[['Value', show('Deal value') ? money(d.value) : 'Hidden for your role'], ['Probability', `${d.probability}%`], ['Expected close', fmtDate(d.expectedClose)], ['Stage', <StatusBadge value={d.stage} />], ['Owner', <Ref id={d.ownerId} />], ['Source', d.source], ['Contact', d.contact], ['Competitor', d.competitor || 'None recorded'], ['Lost reason', d.lostReason ? humanize(d.lostReason) : '-'], ['Next action', d.nextAction]]} /></Card>
        <Card title="Risk signals" action={<Badge tone={d.risk === 'high' ? 'danger' : d.risk === 'medium' ? 'warning' : 'success'}>{d.risk}</Badge>}>
          {risks.length ? <ul className="space-y-2">{risks.map((r) => <li key={r} className="flex gap-2 text-sm text-ink-700"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-500" />{r}</li>)}</ul> : <p className="text-sm text-emerald-700">No risk signals detected.</p>}
        </Card>
        <Card title="Stakeholders" className="lg:col-span-2" bodyClass="p-0">
          <ul className="divide-y divide-ink-100">{(d.stakeholders || []).map((s, i) => <li key={i} className="flex items-center justify-between gap-2 px-4 py-2.5"><div><p className="text-sm font-medium text-ink-800">{s.name}</p><p className="text-xs text-ink-500">{s.role}</p></div><div className="flex items-center gap-2"><Badge tone={s.influence === 'high' ? 'danger' : s.influence === 'medium' ? 'gold' : 'neutral'}>{s.influence} influence</Badge>{w && <Button size="icon" variant="ghost" aria-label="Remove" icon={Trash2} className="text-red-500" onClick={() => update(d.id, { stakeholders: d.stakeholders.filter((_, k) => k !== i) })} />}</div></li>)}</ul>
          {w && <div className="flex flex-wrap gap-2 border-t border-ink-100 p-3"><input className="input min-w-[140px] flex-1" maxLength={80} placeholder="Name" value={sh.name} onChange={(e) => setSh({ ...sh, name: e.target.value })} /><input className="input min-w-[140px] flex-1" maxLength={80} placeholder="Role" value={sh.role} onChange={(e) => setSh({ ...sh, role: e.target.value })} /><select aria-label="Influence" className="input w-auto" value={sh.influence} onChange={(e) => setSh({ ...sh, influence: e.target.value })}>{['high', 'medium', 'low'].map((x) => <option key={x}>{x}</option>)}</select><Button icon={Plus} onClick={addSh}>Add</Button></div>}
        </Card>
        <Card title="Proposals" bodyClass="p-0"><ul className="divide-y divide-ink-100">{proposals.filter((p) => p.dealId === d.id).map((p) => <li key={p.id} className="flex items-center justify-between px-4 py-2.5 text-sm"><span>{p.id} v{p.version} - {money(p.total)}</span><StatusBadge value={p.status} /></li>)}{!proposals.some((p) => p.dealId === d.id) && <li className="p-4 text-center text-sm text-ink-400">No proposals yet</li>}</ul></Card>
        <Card title="Conversations" bodyClass="p-0"><ul className="divide-y divide-ink-100">{convs.filter((c) => c.dealId === d.id).map((c) => <li key={c.id} className="px-4 py-2.5 text-sm"><p className="font-medium text-ink-800">{c.subject}</p><p className="text-xs text-ink-500">{humanize(c.channel)} - {c.messages.length} messages</p></li>)}{!convs.some((c) => c.dealId === d.id) && <li className="p-4 text-center text-sm text-ink-400">No conversations</li>}</ul></Card>
        <Card title="Contract & files" bodyClass="p-0"><ul className="divide-y divide-ink-100">{(d.files || []).map((f, i) => <li key={i} className="flex items-center justify-between gap-2 px-4 py-2.5"><div><p className="text-sm text-ink-800">{f.name}</p><p className="text-xs text-ink-400">{f.kind} - {fmtDateTime(f.at)}</p></div>{w && <Button size="icon" variant="ghost" aria-label="Remove file" icon={Trash2} className="text-red-500" onClick={() => update(d.id, { files: d.files.filter((_, k) => k !== i) })} />}</li>)}{!(d.files || []).length && <li className="p-4 text-center text-sm text-ink-400">No files yet. Attach the contract or scope document.</li>}</ul>{w && <div className="flex gap-2 border-t border-ink-100 p-3"><input className="input" maxLength={120} placeholder="e.g. Signed contract.pdf" value={file} onChange={(e) => setFile(e.target.value)} /><Button onClick={attach}>Attach</Button></div>}</Card>
        <Card title="Recent activity" className="lg:col-span-1" bodyClass="p-0"><ul className="divide-y divide-ink-100">{timeline.map((a) => <li key={a.id} className="px-4 py-2.5"><p className="text-sm text-ink-800">{a.title}</p><p className="text-xs text-ink-400">{fmtDateTime(a.at)}</p></li>)}{!timeline.length && <li className="p-4 text-center text-sm text-ink-400">No activity logged</li>}</ul></Card>
      </div>
    </>
  );
}
