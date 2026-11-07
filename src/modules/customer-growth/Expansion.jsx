import { ArrowRight } from 'lucide-react';
import CrudPage from '@/components/data/CrudPage';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api, lookup } from '@/services/api';
import { humanize, money, sum } from '@/utils/format';

const FIELDS = [
  { name: 'customerId', label: 'Customer', optionsFrom: 'customers', required: true }, { name: 'type', label: 'Type', type: 'select', options: ['cross_sell', 'upsell', 'renewal_expansion'], required: true },
  { name: 'offer', label: 'Recommended offer', required: true, span: 2 }, { name: 'value', label: 'Estimated value ($)', type: 'number', min: 0, required: true }, { name: 'fit', label: 'Fit score (0-100)', type: 'number', min: 0, max: 100, required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['identified', 'in_pipeline', 'won', 'lost'], required: true }, { name: 'reason', label: 'Why this customer', type: 'textarea' },
];

export default function Expansion() {
  const { push } = useToast();
  const { user } = useAuth();
  const toPipeline = async (o, update) => {
    await api.create('deals', { title: `${o.offer} for ${o.customerName}`, leadId: null, company: o.customerName, contact: 'Existing customer', ownerId: user.id, stage: 'qualified', value: o.value, probability: 35, expectedClose: new Date(Date.now() + 45 * 864e5).toISOString().slice(0, 10), source: 'Customer Growth', service: o.offer, risk: 'low', competitor: '', lostReason: '', stakeholders: [], createdAt: new Date().toISOString(), lastActivityAt: new Date().toISOString(), followUps: 0, nextAction: 'Present expansion offer' });
    await update(o.id, { status: 'in_pipeline' }); push('Opportunity added to the sales pipeline');
  };
  return (
    <CrudPage collection="opportunities" module="customers" noun="opportunity" title="Cross-sell & Upsell" subtitle="Recommendations matched to each customer's profile, purchase history and renewal date."
      stats={(r) => [{ label: 'Opportunities', value: r.length }, { label: 'Potential value', value: money(sum(r.filter((x) => x.status === 'identified'), 'value')), tone: 'gold' }, { label: 'In pipeline', value: r.filter((x) => x.status === 'in_pipeline').length, tone: 'teal' }, { label: 'Won', value: r.filter((x) => x.status === 'won').length, tone: 'success' }]}
      fields={FIELDS} searchKeys={['customerName', 'offer']} defaults={{ status: 'identified', fit: 70, value: 1000 }} transform={(v) => ({ ...v, customerName: lookup('customers', v.customerId)?.name || v.customerName })}
      filters={[{ key: 'type', label: 'Type', options: ['cross_sell', 'upsell', 'renewal_expansion'] }, { key: 'status', label: 'Status', options: ['identified', 'in_pipeline', 'won', 'lost'] }]}
      columns={[{ key: 'customerName', label: 'Customer', render: (o) => <div><p className="font-medium text-ink-900">{o.customerName}</p><p className="text-xs text-ink-500">{o.reason}</p></div> }, { key: 'type', label: 'Type', render: (o) => <Badge tone="teal">{humanize(o.type)}</Badge> }, { key: 'offer', label: 'Offer' }, { key: 'value', label: 'Value', render: (o) => money(o.value) }, { key: 'fit', label: 'Fit', render: (o) => <div className="w-20"><ProgressBar value={o.fit} showValue /></div> }, { key: 'status', label: 'Status', render: (o) => <StatusBadge value={o.status} /> }]}
      rowActions={(o) => o.status === 'identified' && <Button size="sm" variant="secondary" icon={ArrowRight} onClick={() => toPipeline(o, (id, p) => api.update('opportunities', id, p))}>To pipeline</Button>} />
  );
}
