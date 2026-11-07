import { Check, X } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { fmtDateTime, humanize, money } from '@/utils/format';

const ORDER = { sales: 1, manager: 2, admin: 3, super_admin: 4 };
export default function Approvals() {
  const { items, update } = useCollection('approvals');
  const { items: proposals, update: updProp } = useCollection('proposals');
  const { items: recs, update: updRec } = useCollection('recommendations');
  const { items: drafts, update: updDraft } = useCollection('aiDrafts');
  const { user } = useAuth();
  const { push } = useToast();
  const can = (a) => (ORDER[user.role] || 0) >= (ORDER[a.approverRole] || 1);

  async function decide(a, ok) {
    await update(a.id, { status: ok ? 'approved' : 'rejected', decidedBy: user.name, decidedAt: new Date().toISOString() });
    const prop = a.type === 'discount' && proposals.find((p) => a.title.includes(p.id));
    if (prop) await updProp(prop.id, { status: ok ? 'draft' : 'rejected' });
    if (a.recId) await updRec(a.recId, { status: ok ? 'accepted' : 'dismissed' });
    if (a.draftId) await updDraft(a.draftId, { status: ok ? 'sent' : 'draft' });
    api.log(ok ? 'approve' : 'reject', a.type, a.title);
    push(ok ? 'Approved and logged' : 'Rejected and logged', ok ? 'success' : 'info');
  }
  const pending = items.filter((a) => a.status === 'pending');
  return (
    <>
      <PageHeader title="Approvals" subtitle="Financial, external or high-impact actions wait here for the right approver before they run." />
      <div className="grid gap-4 lg:grid-cols-2">
        {pending.map((a) => (
          <Card key={a.id} title={a.title} action={<Badge tone="warning">{humanize(a.type)}</Badge>}>
            <p className="text-sm text-ink-600">{a.detail}</p>
            <p className="mt-2 text-xs text-ink-500">Requested by {a.requestedBy} - {fmtDateTime(a.at)}{a.amount > 0 && ` - ${money(a.amount)}`}</p>
            <p className="mt-1 text-xs text-ink-400">Approver role: {humanize(a.approverRole)}</p>
            <div className="mt-3 flex gap-2">{can(a) ? <><Button size="sm" icon={Check} onClick={() => decide(a, true)}>Approve</Button><Button size="sm" variant="secondary" icon={X} onClick={() => decide(a, false)}>Reject</Button></> : <p className="text-xs text-amber-700">You do not have the required role to decide this request.</p>}</div>
          </Card>))}
        {!pending.length && <p className="card p-10 text-center text-sm text-ink-400 lg:col-span-2">No pending approvals.</p>}
      </div>
      <h2 className="mb-2 mt-6 text-sm font-semibold text-ink-700">Decision history</h2>
      <div className="card overflow-x-auto"><table className="min-w-full divide-y divide-ink-100"><tbody className="divide-y divide-ink-100">{items.filter((a) => a.status !== 'pending').map((a) => <tr key={a.id}><td className="td">{a.title}</td><td className="td"><StatusBadge value={a.status} /></td><td className="td">{a.decidedBy}</td><td className="td">{fmtDateTime(a.decidedAt)}</td></tr>)}{!items.some((a) => a.status !== 'pending') && <tr><td className="td text-center text-ink-400">No decisions yet</td></tr>}</tbody></table></div>
    </>
  );
}
