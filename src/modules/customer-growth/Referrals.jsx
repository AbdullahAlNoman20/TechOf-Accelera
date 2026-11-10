import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import { BarChart, Donut } from '@/components/charts/Charts';
import useCollection from '@/hooks/useCollection';
import { fmtDate, groupCount, humanize, money } from '@/utils/format';
import Button from '@/components/ui/Button';
import useToast from '@/hooks/useToast';
import { api } from '@/services/api';

const R_FIELDS = [
  { name: 'referrerId', label: 'Referred by (customer)', optionsFrom: 'customers', required: true }, { name: 'leadName', label: 'Referred contact', required: true }, { name: 'company', label: 'Referred company', required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['new', 'contacted', 'qualified', 'converted', 'lost'], required: true }, { name: 'reward', label: 'Reward ($)', type: 'number', min: 0 }, { name: 'rewardStatus', label: 'Reward status', type: 'select', options: ['pending', 'approved', 'paid'] }, { name: 'campaign', label: 'Campaign' },
];
const C_FIELDS = [
  { name: 'name', label: 'Campaign name', required: true, span: 2 }, { name: 'reward', label: 'Incentive rule', required: true, span: 2 }, { name: 'start', label: 'Start', type: 'date' }, { name: 'end', label: 'End', type: 'date' }, { name: 'status', label: 'Status', type: 'select', options: ['active', 'completed', 'paused'], required: true },
];

export default function Referrals() {
  const [tab, setTab] = useState('referrals');
  const { push } = useToast();
  const { items: refs } = useCollection('referrals');
  const { items: customers } = useCollection('customers');
  const { items: camps } = useCollection('referralCampaigns');
  const ready = customers.filter((c) => c.health >= 80 && c.nps >= 50 && c.status === 'active');
  const toInbox = async (r) => { await api.create('leads', { name: r.leadName, title: '', company: r.company, industry: 'General', companySize: '11-50', email: 'pending@example.com', phone: '', country: 'Bangladesh', city: 'Dhaka', source: 'Referral', campaign: `Referred by ${r.referrerName}`, status: 'new', processing: 'collected', score: 60, temperature: 'warm', fit: 70, intent: 50, engagement: 30, budget: 'unknown', authority: 'unknown', timeline: 'unknown', need: 'Referral', ownerId: null, firstResponseMin: null, overrides: [], notes: '', outcome: null, checks: { email: 'unverified', phone: 'unverified', company: 'unverified', duplicate: false, spam: false }, duplicateOf: null }); push('Sent to Lead Inbox: it will be checked and scored like any lead'); };
  const conv = Object.entries(refs.reduce((m, r) => { m[r.referrerName] = m[r.referrerName] || [0, 0]; m[r.referrerName][1] += 1; if (r.status === 'converted') m[r.referrerName][0] += 1; return m; }, {})).map(([label, [c]]) => ({ label: label.split(' ')[0], value: c }));
  return (
    <>
      <PageHeader title="Referral Management" subtitle="Track who referred whom, reward status and which customers bring the best leads. Referral leads enter the normal Lead Engine intake." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'referrals', label: 'Referrals', count: refs.length }, { key: 'campaigns', label: 'Referral campaigns' }, { key: 'ready', label: 'Ready to ask', count: ready.length }, { key: 'analytics', label: 'Conversion analytics' }]} />
      {tab === 'referrals' && <CrudTable collection="referrals" module="customers" noun="referral" fields={R_FIELDS} searchKeys={['referrerName', 'leadName', 'company']} filters={[{ key: 'status', label: 'Status', options: ['new', 'contacted', 'qualified', 'converted', 'lost'] }]} defaults={{ status: 'new', reward: 150, rewardStatus: 'pending', campaign: 'Referral Rewards 2026', date: new Date().toISOString().slice(0, 10) }}
        transform={(v) => ({ ...v, referrerName: customers.find((c) => c.id === v.referrerId)?.name || v.referrerName })}
        columns={[{ key: 'referrerName', label: 'Referred by' }, { key: 'leadName', label: 'Referred contact', render: (r) => <div><p>{r.leadName}</p><p className="text-xs text-ink-500">{r.company}</p></div> }, { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> }, { key: 'reward', label: 'Reward', render: (r) => <span>{money(r.reward)} <StatusBadge value={r.rewardStatus} /></span> }, { key: 'date', label: 'Date', render: (r) => fmtDate(r.date) }]} rowActions={(r) => <Button size="sm" variant="ghost" onClick={() => toInbox(r)}>Send to Lead Inbox</Button>} />}
      {tab === 'campaigns' && <CrudTable collection="referralCampaigns" module="customers" noun="campaign" fields={C_FIELDS} defaults={{ status: 'active', referrals: 0, converted: 0 }} columns={[{ key: 'name', label: 'Campaign' }, { key: 'reward', label: 'Incentive' }, { key: 'start', label: 'Start', render: (c) => fmtDate(c.start) }, { key: 'end', label: 'End', render: (c) => fmtDate(c.end) }, { key: 'status', label: 'Status', render: (c) => <StatusBadge value={c.status} /> }, { key: 'referrals', label: 'Referrals' }, { key: 'converted', label: 'Converted' }]} />}
      {tab === 'ready' && <Card title="Happy customers who may refer" subtitle="Health 80+ and NPS 50+" bodyClass="p-0"><ul className="divide-y divide-ink-100">{ready.map((c) => <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3"><div><p className="text-sm font-medium text-ink-900">{c.name}</p><p className="text-xs text-ink-500">Health {c.health}, NPS {c.nps}</p></div><Button size="sm" variant="secondary" onClick={async () => { await api.create('followUps', { title: `Ask for a referral - ${c.name}`, entityName: c.name, dealId: null, type: 'call', dueAt: new Date(Date.now() + 2 * 864e5).toISOString(), priority: 'medium', status: 'scheduled', ownerId: c.ownerId, responseStatus: 'awaiting', attempt: 1 }); push('Reminder created for the account owner'); }}>Remind owner to ask</Button></li>)}{!ready.length && <li className="p-6 text-center text-sm text-ink-400">No customers match yet</li>}</ul></Card>}
      {tab === 'analytics' && <div className="grid gap-5 lg:grid-cols-2"><Card title="Referral status"><Donut data={groupCount(refs, 'status').map((d) => ({ ...d, label: humanize(d.label) }))} /></Card><Card title="Converted referrals by customer"><BarChart data={conv} /></Card></div>}
    </>
  );
}
