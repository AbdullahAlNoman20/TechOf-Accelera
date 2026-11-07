import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import { BarChart, Donut } from '@/components/charts/Charts';
import useCollection from '@/hooks/useCollection';
import { fmtDate, groupCount, humanize, money } from '@/utils/format';

const R_FIELDS = [
  { name: 'referrerId', label: 'Referred by (customer)', optionsFrom: 'customers', required: true }, { name: 'leadName', label: 'Referred contact', required: true }, { name: 'company', label: 'Referred company', required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['new', 'contacted', 'qualified', 'converted', 'lost'], required: true }, { name: 'reward', label: 'Reward ($)', type: 'number', min: 0 }, { name: 'rewardStatus', label: 'Reward status', type: 'select', options: ['pending', 'approved', 'paid'] }, { name: 'campaign', label: 'Campaign' },
];
const C_FIELDS = [
  { name: 'name', label: 'Campaign name', required: true, span: 2 }, { name: 'reward', label: 'Incentive rule', required: true, span: 2 }, { name: 'start', label: 'Start', type: 'date' }, { name: 'end', label: 'End', type: 'date' }, { name: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'paused'], required: true },
];

export default function Referrals() {
  const [tab, setTab] = useState('referrals');
  const { items: refs } = useCollection('referrals');
  const { items: customers } = useCollection('customers');
  const { items: camps } = useCollection('referralCampaigns');
  const conv = Object.entries(refs.reduce((m, r) => { m[r.referrerName] = m[r.referrerName] || [0, 0]; m[r.referrerName][1] += 1; if (r.status === 'converted') m[r.referrerName][0] += 1; return m; }, {})).map(([label, [c]]) => ({ label: label.split(' ')[0], value: c }));
  return (
    <>
      <PageHeader title="Referral Management" subtitle="Track who referred whom, reward status and which customers bring the best leads. Referral leads enter the normal Lead Engine intake." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'referrals', label: 'Referrals', count: refs.length }, { key: 'campaigns', label: 'Referral campaigns' }, { key: 'analytics', label: 'Conversion analytics' }]} />
      {tab === 'referrals' && <CrudTable collection="referrals" module="customers" noun="referral" fields={R_FIELDS} searchKeys={['referrerName', 'leadName', 'company']} filters={[{ key: 'status', label: 'Status', options: ['new', 'contacted', 'qualified', 'converted', 'lost'] }]} defaults={{ status: 'new', reward: 150, rewardStatus: 'pending', campaign: 'Referral Rewards 2026', date: new Date().toISOString().slice(0, 10) }}
        transform={(v) => ({ ...v, referrerName: customers.find((c) => c.id === v.referrerId)?.name || v.referrerName })}
        columns={[{ key: 'referrerName', label: 'Referred by' }, { key: 'leadName', label: 'Referred contact', render: (r) => <div><p>{r.leadName}</p><p className="text-xs text-ink-500">{r.company}</p></div> }, { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> }, { key: 'reward', label: 'Reward', render: (r) => <span>{money(r.reward)} <StatusBadge value={r.rewardStatus} /></span> }, { key: 'date', label: 'Date', render: (r) => fmtDate(r.date) }]} />}
      {tab === 'campaigns' && <CrudTable collection="referralCampaigns" module="customers" noun="campaign" fields={C_FIELDS} defaults={{ status: 'active', referrals: 0, converted: 0 }} columns={[{ key: 'name', label: 'Campaign' }, { key: 'reward', label: 'Incentive' }, { key: 'start', label: 'Start', render: (c) => fmtDate(c.start) }, { key: 'end', label: 'End', render: (c) => fmtDate(c.end) }, { key: 'status', label: 'Status', render: (c) => <StatusBadge value={c.status} /> }, { key: 'referrals', label: 'Referrals' }, { key: 'converted', label: 'Converted' }]} />}
      {tab === 'analytics' && <div className="grid gap-5 lg:grid-cols-2"><Card title="Referral status"><Donut data={groupCount(refs, 'status').map((d) => ({ ...d, label: humanize(d.label) }))} /></Card><Card title="Converted referrals by customer"><BarChart data={conv} /></Card></div>}
    </>
  );
}
