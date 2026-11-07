import { useState } from 'react';
import { Copy, Eye, FilePlus2, Send } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import ProposalBuilder from './ProposalBuilder';
import ProposalPreview from './ProposalPreview';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { daysFromNow, fmtDate, money } from '@/utils/format';

export default function Proposals() {
  const { items, create, update } = useCollection('proposals');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const [builder, setBuilder] = useState(null);
  const [view, setView] = useState(null);
  const w = canWrite('sales');
  const track = (p, status, msg) => { update(p.id, { status }); push(msg); };

  return (
    <>
      <PageHeader title="Proposals & Quotations" subtitle="Drafts, approvals, versions and customer response tracking, all linked to the deal." actions={w && <Button icon={FilePlus2} onClick={() => setBuilder({})}>New proposal</Button>} />
      <CrudTable collection="proposals" module="sales" noun="proposal" canCreate={false} fields={[{ name: 'title', label: 'Title', required: true, span: 2 }, { name: 'status', label: 'Status', type: 'select', options: ['draft', 'pending_approval', 'sent', 'viewed', 'accepted', 'rejected', 'expired'], required: true }, { name: 'validUntil', label: 'Valid until', type: 'date' }]}
        searchKeys={['id', 'company', 'title']} filters={[{ key: 'status', label: 'Status', options: ['draft', 'pending_approval', 'sent', 'viewed', 'accepted', 'rejected', 'expired'] }]} exportName="proposals"
        columns={[{ key: 'id', label: 'No.', render: (p) => <span>{p.id} <span className="text-xs text-ink-400">v{p.version}</span></span> }, { key: 'company', label: 'Customer' }, { key: 'total', label: 'Total', render: (p) => money(p.total) },
          { key: 'status', label: 'Status', render: (p) => <StatusBadge value={p.status} /> }, { key: 'validUntil', label: 'Valid until', render: (p) => <span>{fmtDate(p.validUntil)} {daysFromNow(p.validUntil) < 0 && !['accepted', 'rejected'].includes(p.status) && <Badge tone="danger">Expired</Badge>}</span> }, { key: 'ownerId', label: 'Owner', render: (p) => <Ref id={p.ownerId} /> }]}
        rowActions={(p) => <>
          <Button size="icon" variant="ghost" aria-label="Preview" icon={Eye} onClick={() => setView(p)} />
          {w && <Button size="icon" variant="ghost" aria-label="Edit lines" icon={FilePlus2} onClick={() => setBuilder(p)} />}
          {w && p.status === 'draft' && <Button size="icon" variant="ghost" aria-label="Mark as sent" icon={Send} className="text-brand-600" onClick={() => track(p, 'sent', 'Proposal sent to customer')} />}
          {w && p.status === 'sent' && <Button size="sm" variant="ghost" onClick={() => track(p, 'viewed', 'Customer viewed the proposal')}>Viewed</Button>}
          {w && ['sent', 'viewed'].includes(p.status) && <Button size="sm" variant="ghost" onClick={() => track(p, 'accepted', 'Proposal accepted')}>Accepted</Button>}
          {w && <Button size="icon" variant="ghost" aria-label="New version" icon={Copy} onClick={async () => { const { id, ...rest } = p; await create({ ...rest, version: p.version + 1, status: 'draft' }); push(`Version ${p.version + 1} created`); }} />}</>} />
      {builder && <ProposalBuilder open initial={builder} key={builder.id || 'new'} onClose={() => setBuilder(null)} />}
      <ProposalPreview proposal={view} onClose={() => setView(null)} />
    </>
  );
}
