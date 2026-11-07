import { Check, X } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';

export default function Recommendations() {
  const { items, update } = useCollection('recommendations');
  const { user, canWrite } = useAuth();
  const { push } = useToast();
  async function accept(r) {
    if (r.requiresApproval) {
      await api.create('approvals', { type: 'ad_budget', title: r.title, requestedBy: user.name, at: new Date().toISOString(), status: 'pending', detail: r.nextStep, amount: 0, approverRole: 'admin', recId: r.id });
      await update(r.id, { status: 'pending_approval' }); return push('Financial action: sent for approval, not applied automatically', 'info');
    }
    await update(r.id, { status: 'accepted' }); push('Recommendation accepted');
  }
  return (
    <>
      <PageHeader title="AI Business Recommendations" subtitle="Every recommendation shows its reason, supporting metric, confidence and data coverage. Budget or campaign changes always need approval." />
      <div className="grid gap-4 lg:grid-cols-2">
        {items.map((r) => (
          <Card key={r.id} title={r.title} action={<StatusBadge value={r.status} />}>
            <dl className="space-y-2 text-sm"><div><dt className="text-xs font-semibold uppercase text-ink-400">Reason</dt><dd className="text-ink-700">{r.reason}</dd></div><div><dt className="text-xs font-semibold uppercase text-ink-400">Supporting metric</dt><dd className="text-ink-700">{r.metric}</dd></div><div><dt className="text-xs font-semibold uppercase text-ink-400">Suggested next step</dt><dd className="text-ink-700">{r.nextStep}</dd></div></dl>
            <div className="mt-3 grid grid-cols-2 gap-3"><div><p className="mb-1 text-xs text-ink-500">Confidence</p><ProgressBar value={r.confidence} showValue /></div><div><p className="mb-1 text-xs text-ink-500">Data coverage</p><Badge tone="teal">{r.coverage}</Badge></div></div>
            {canWrite('analytics') && r.status === 'new' && <div className="mt-4 flex gap-2"><Button size="sm" icon={Check} onClick={() => accept(r)}>{r.requiresApproval ? 'Request approval' : 'Accept'}</Button><Button size="sm" variant="secondary" icon={X} onClick={() => update(r.id, { status: 'dismissed' })}>Dismiss</Button></div>}
          </Card>))}
      </div>
    </>
  );
}
