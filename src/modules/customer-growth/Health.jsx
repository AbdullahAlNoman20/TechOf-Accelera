import { AlertTriangle, HeartPulse, Smile } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import DataTable from '@/components/data/DataTable';
import Ref from '@/components/common/Ref';
import { HBar } from '@/components/charts/Charts';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { avg } from '@/utils/format';

export default function Health() {
  const { items: custs } = useCollection('customers');
  const { items: fb } = useCollection('feedback');
  const { items: tickets, update: updTicket } = useCollection('supportTickets');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const risky = custs.filter((c) => c.health < 65);
  const themes = Object.entries(fb.reduce((m, f) => { (m[f.theme] = m[f.theme] || []).push(f.score); return m; }, {})).map(([label, s]) => ({ label, value: Math.round(avg(s.map((v) => ({ v })), 'v') * 10) / 10 }));
  const tip = (c) => (c.health < 45 ? 'Call this week: review open issues and agree a recovery plan' : c.health < 65 ? 'Personalized check-in: share a usage review and ask for feedback' : 'Healthy: ask for a referral or review');
  const checkIn = async (c) => { await api.create('followUps', { title: `Personalized check-in - ${c.name}`, entityName: c.name, dealId: null, type: 'call', dueAt: new Date(Date.now() + 2 * 864e5).toISOString(), priority: c.health < 45 ? 'high' : 'medium', status: 'scheduled', ownerId: c.ownerId, responseStatus: 'awaiting', attempt: 1 }); push('Check-in follow-up created'); };
  return (
    <>
      <PageHeader title="Customer Health & Retention" subtitle="Health scores, churn risk, satisfaction and feedback in one view." />
      <div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Avg health score" value={Math.round(avg(custs, 'health'))} icon={HeartPulse} tone="teal" /><StatCard label="Churn risk (high)" value={custs.filter((c) => c.churnRisk === 'high').length} icon={AlertTriangle} tone="danger" /><StatCard label="Avg NPS" value={Math.round(avg(custs, 'nps'))} icon={Smile} tone="gold" /></div>
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2"><DataTable rows={[...custs]} searchKeys={['name']} defaultSort={{ key: 'health', dir: 'asc' }} pageSize={8}
          columns={[{ key: 'name', label: 'Customer', render: (c) => <div><p className="font-medium text-ink-900">{c.name}</p><p className="text-xs text-teal-700">{tip(c)}</p></div> }, { key: 'health', label: 'Health', render: (c) => <div className="w-24"><ProgressBar value={c.health} showValue /></div> }, { key: 'churnRisk', label: 'Churn risk', render: (c) => <Badge tone={c.churnRisk === 'high' ? 'danger' : c.churnRisk === 'medium' ? 'gold' : 'success'}>{c.churnRisk}</Badge> }, { key: 'ownerId', label: 'Owner', render: (c) => <Ref id={c.ownerId} /> },
            { key: 'a', label: '', sortable: false, render: (c) => canWrite('customers') && c.health < 65 && <Button size="sm" variant="secondary" onClick={() => checkIn(c)}>Check-in</Button> }]} /></div>
        <div className="space-y-5"><Card title="Feedback themes" subtitle="Average score by theme (out of 10)"><HBar data={themes} format={(v) => v} /></Card>
          <Card title="Issue escalation" bodyClass="p-0"><ul className="divide-y divide-ink-100">{tickets.filter((t) => ['open', 'escalated'].includes(t.status)).map((t) => <li key={t.id} className="flex items-center justify-between gap-2 px-4 py-2.5"><span className="truncate text-sm">{t.subject}</span>{t.status === 'open' && canWrite('customers') ? <Button size="sm" variant="secondary" onClick={() => { updTicket(t.id, { status: 'escalated' }); push('Issue escalated to the responsible team'); }}>Escalate</Button> : <Badge tone="danger">{t.status}</Badge>}</li>)}</ul></Card></div>
      </div>
      <p className="mt-3 text-xs text-ink-400">At risk: {risky.length} customer(s) below 65 health. Health alerts are raised automatically when a score drops.</p>
    </>
  );
}
