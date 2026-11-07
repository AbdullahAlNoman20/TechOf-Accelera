import { Mail } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { StatusBadge } from '@/components/ui/Badge';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { fmtDate } from '@/utils/format';

const STATUSES = ['not_started', 'in_progress', 'waiting', 'completed'];
export default function Onboarding() {
  const { items, update } = useCollection('onboardings');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const w = canWrite('operations');

  async function patch(o, change) {
    const next = { ...o, ...change };
    const done = next.checklist.filter((c) => c.done).length;
    let status = change.status || o.status;
    if (!change.status) status = done === next.checklist.length ? 'completed' : done > 0 && o.status === 'not_started' ? 'in_progress' : o.status;
    await update(o.id, { ...change, status });
    if (status === 'completed' && o.status !== 'completed') {
      await api.create('deliveries', { customerName: o.customerName, service: 'Service delivery', status: 'in_progress', progress: 0, ownerId: o.ownerId, due: new Date(Date.now() + 30 * 864e5).toISOString().slice(0, 10) });
      await api.create('followUps', { title: `Post-onboarding feedback - ${o.customerName}`, entityName: o.customerName, dealId: null, type: 'call', dueAt: new Date(Date.now() + 14 * 864e5).toISOString(), priority: 'medium', status: 'scheduled', ownerId: o.ownerId, responseStatus: 'awaiting', attempt: 1 });
      push('Onboarding complete: delivery workflow started and feedback follow-up scheduled');
    }
  }
  const missing = (o) => o.documents.filter((d) => !d.received).length;
  return (
    <>
      <PageHeader title="Customer Onboarding" subtitle="Won deals arrive here automatically. Track checklist, documents and status until delivery starts." />
      <div className="grid gap-5 lg:grid-cols-2">
        {items.map((o) => { const done = o.checklist.filter((c) => c.done).length; return (
          <Card key={o.id} title={o.customerName} subtitle={`${o.id} - started ${fmtDate(o.startedAt)} - owner `} action={<StatusBadge value={o.status} />}>
            <div className="mb-3 flex items-center gap-2 text-xs text-ink-500">Owner: <Ref id={o.ownerId} /></div>
            <ProgressBar value={done} max={o.checklist.length} showValue />
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div><p className="mb-1.5 text-xs font-semibold uppercase text-ink-400">Checklist</p>{o.checklist.map((c, i) => <label key={c.label} className="flex items-center gap-2 py-0.5 text-sm text-ink-700"><input type="checkbox" disabled={!w} className="h-4 w-4 rounded border-ink-300" checked={c.done} onChange={() => patch(o, { checklist: o.checklist.map((x, k) => (k === i ? { ...x, done: !x.done } : x)) })} />{c.label}</label>)}</div>
              <div><p className="mb-1.5 text-xs font-semibold uppercase text-ink-400">Documents {missing(o) > 0 && <span className="text-red-600">({missing(o)} missing)</span>}</p>{o.documents.map((d, i) => <label key={d.name} className="flex items-center gap-2 py-0.5 text-sm text-ink-700"><input type="checkbox" disabled={!w} className="h-4 w-4 rounded border-ink-300" checked={d.received} onChange={() => patch(o, { documents: o.documents.map((x, k) => (k === i ? { ...x, received: !x.received } : x)) })} />{d.name}</label>)}</div>
            </div>
            {w && <div className="mt-4 flex flex-wrap items-center gap-2"><select aria-label="Onboarding status" className="input w-auto" value={o.status} onChange={(e) => patch(o, { status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}</select>
              <Button size="sm" variant="secondary" icon={Mail} onClick={async () => { await api.create('approvals', { type: 'ai_send', title: `Welcome email to ${o.customerName}`, requestedBy: 'Onboarding workflow', at: new Date().toISOString(), status: 'pending', detail: 'Approved welcome template', amount: 0, approverRole: 'manager' }); push('Welcome email sent for approval', 'info'); }}>Send welcome</Button></div>}
          </Card>); })}
      </div>
    </>
  );
}
