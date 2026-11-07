import { useNavigate } from 'react-router-dom';
import CrudPage from '@/components/data/CrudPage';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useAuth from '@/hooks/useAuth';
import { scopeRows } from '@/utils/scope';
import { fmtDate, money, sum } from '@/utils/format';

export const CUSTOMER_FIELDS = [
  { name: 'name', label: 'Company name', required: true, span: 2 }, { name: 'industry', label: 'Industry', required: true }, { name: 'size', label: 'Company size', type: 'select', options: ['1-10', '11-50', '51-200', '201-500', '500+'] },
  { name: 'country', label: 'Country' }, { name: 'city', label: 'City' }, { name: 'ownerId', label: 'Account owner', optionsFrom: 'users', optionFilter: (u) => ['sales', 'manager', 'support'].includes(u.role), required: true },
  { name: 'parentId', label: 'Parent account', optionsFrom: 'customers', placeholder: 'None' }, { name: 'tier', label: 'Tier', type: 'select', options: ['Gold', 'Silver', 'Bronze'] }, { name: 'status', label: 'Status', type: 'select', options: ['active', 'onboarding', 'at_risk', 'churned'], required: true },
  { name: 'health', label: 'Health score (0-100)', type: 'number', min: 0, max: 100 }, { name: 'revenue', label: 'Annual revenue ($)', type: 'number', min: 0 }, { name: 'renewalDate', label: 'Renewal date', type: 'date' },
  { name: 'services', label: 'Services', type: 'tags', span: 2 }, { name: 'preferences', label: 'Communication preferences', type: 'textarea' },
];
export const customerDefaults = (uid) => ({ status: 'active', tier: 'Silver', health: 75, churnRisk: 'low', nps: 50, revenue: 0, services: [], contacts: [], size: '11-50', country: 'Bangladesh', city: 'Dhaka', since: new Date().toISOString().slice(0, 10), ownerId: uid, parentId: null });
const hc = (h) => (h >= 70 ? 'success' : h >= 50 ? 'gold' : 'danger');

export default function Customers() {
  const nav = useNavigate();
  const { user, level } = useAuth();
  const { items } = useCollection('customers');
  const rows = scopeRows(items, user, level('customers'));
  return (
    <CrudPage collection="customers" rows={rows} module="customers" noun="customer" title="Customer 360°" subtitle="One profile per customer: purchases, conversations, support, contracts, preferences and health."
      stats={() => [{ label: 'Customers', value: rows.length }, { label: 'Annual revenue', value: money(sum(rows, 'revenue'), true), tone: 'gold' }, { label: 'At risk', value: rows.filter((c) => c.status === 'at_risk').length, tone: 'danger' }, { label: 'Renewals in 90 days', value: rows.filter((c) => { const d = (new Date(c.renewalDate) - Date.now()) / 864e5; return d >= 0 && d <= 90; }).length, tone: 'teal' }]}
      fields={CUSTOMER_FIELDS} searchKeys={['name', 'industry', 'city']} exportName="customers" defaults={customerDefaults(user.id)} onRowClick={(c) => nav(`/app/customers/${c.id}`)}
      filters={[{ key: 'status', label: 'Status', options: ['active', 'onboarding', 'at_risk', 'churned'] }, { key: 'tier', label: 'Tier', options: ['Gold', 'Silver', 'Bronze'] }]}
      columns={[{ key: 'name', label: 'Customer', render: (c) => <div><p className="font-medium text-ink-900">{c.name}</p><p className="text-xs text-ink-500">{c.industry} - {c.city}</p></div> }, { key: 'tier', label: 'Tier', render: (c) => <Badge tone={c.tier === 'Gold' ? 'gold' : 'neutral'}>{c.tier}</Badge> }, { key: 'status', label: 'Status', render: (c) => <StatusBadge value={c.status} /> },
        { key: 'health', label: 'Health', render: (c) => <div className="w-24"><ProgressBar value={c.health} tone={hc(c.health)} showValue /></div> }, { key: 'revenue', label: 'Revenue', render: (c) => money(c.revenue) }, { key: 'renewalDate', label: 'Renewal', render: (c) => fmtDate(c.renewalDate) }, { key: 'ownerId', label: 'Owner', render: (c) => <Ref id={c.ownerId} /> }]} />
  );
}
