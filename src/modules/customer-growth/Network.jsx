import { UserPlus } from 'lucide-react';
import CrudPage from '@/components/data/CrudPage';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import useToast from '@/hooks/useToast';
import { api } from '@/services/api';
import { humanize } from '@/utils/format';

const FIELDS = [
  { name: 'name', label: 'Business name', required: true, span: 2 }, { name: 'relation', label: 'Relationship', type: 'select', options: ['sister', 'subsidiary', 'partner', 'supplier'], required: true }, { name: 'ofCustomer', label: 'Related to customer', required: true },
  { name: 'industry', label: 'Industry' }, { name: 'source', label: 'Information source', required: true, help: 'Public or authorized sources only' }, { name: 'consent', label: 'Consent / permission', type: 'checkbox', checkLabel: 'Permission to approach is confirmed or source is public' },
  { name: 'status', label: 'Status', type: 'select', options: ['identified', 'lead_created'], required: true },
];

export default function Network() {
  const { push } = useToast();
  const createLead = async (b, update) => {
    if (!b.consent) return push('Blocked: consent or an approved public source is required before creating a lead', 'error');
    await api.create('leads', { name: 'Decision-maker (to be identified)', title: 'Owner', company: b.name, industry: b.industry || 'General', companySize: '11-50', email: 'pending@example.com', phone: '', country: 'Bangladesh', city: 'Dhaka', source: 'Referral', campaign: `Related: ${b.ofCustomer}`, status: 'new', processing: 'collected', score: 55, temperature: 'warm', fit: 70, intent: 40, engagement: 20, budget: 'unknown', authority: 'unknown', timeline: 'unknown', need: `${humanize(b.relation)} of ${b.ofCustomer}`, ownerId: null, firstResponseMin: null, overrides: [], notes: '', outcome: null, checks: { email: 'unverified', phone: 'unverified', company: 'unverified', duplicate: false, spam: false }, duplicateOf: null });
    await update(b.id, { status: 'lead_created' }); push('Lead created: it now goes through Lead Intelligence verification');
  };
  return (
    <CrudPage collection="relatedBusinesses" module="customers" noun="business" title="Related Business Discovery" subtitle="Sister, subsidiary and partner companies of existing customers. New leads go through the normal intake and verification, with consent respected."
      stats={(r) => [{ label: 'Identified', value: r.filter((x) => x.status === 'identified').length }, { label: 'Leads created', value: r.filter((x) => x.status === 'lead_created').length, tone: 'success' }, { label: 'Consent confirmed', value: r.filter((x) => x.consent).length, tone: 'teal' }, { label: 'Needs consent', value: r.filter((x) => !x.consent).length, tone: 'gold' }]}
      fields={FIELDS} searchKeys={['name', 'ofCustomer']} defaults={{ status: 'identified', consent: false, relation: 'sister' }} filters={[{ key: 'relation', label: 'Relation', options: ['sister', 'subsidiary', 'partner', 'supplier'] }]}
      columns={[{ key: 'name', label: 'Business', render: (b) => <div><p className="font-medium text-ink-900">{b.name}</p><p className="text-xs text-ink-500">{b.industry}</p></div> }, { key: 'relation', label: 'Relationship', render: (b) => <Badge tone="brand">{humanize(b.relation)}</Badge> }, { key: 'ofCustomer', label: 'Related to' }, { key: 'source', label: 'Source' }, { key: 'consent', label: 'Consent', render: (b) => <Badge tone={b.consent ? 'success' : 'warning'}>{b.consent ? 'Confirmed' : 'Missing'}</Badge> }, { key: 'status', label: 'Status', render: (b) => <StatusBadge value={b.status} /> }]}
      rowActions={(b) => b.status === 'identified' && <Button size="sm" variant="secondary" icon={UserPlus} onClick={() => createLead(b, (id, p) => api.update('relatedBusinesses', id, p))}>Create lead</Button>} />
  );
}
