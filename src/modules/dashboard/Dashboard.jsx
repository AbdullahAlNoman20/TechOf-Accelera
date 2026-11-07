import { Link } from 'react-router-dom';
import { AlertTriangle, DollarSign, Target, Timer, TrendingUp, Users } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Ref from '@/components/common/Ref';
import { BarChart, Donut, Funnel } from '@/components/charts/Charts';
import useCollection from '@/hooks/useCollection';
import useAuth from '@/hooks/useAuth';
import { avg, countdown, groupCount, money, pct, sum } from '@/utils/format';
import { scopeRows } from '@/utils/scope';
import { STAGES } from '@/utils/status';

export default function Dashboard() {
  const { user, level } = useAuth();
  const { items: leads } = useCollection('leads');
  const { items: deals0 } = useCollection('deals');
  const { items: tasks0 } = useCollection('tasks');
  const { items: recs } = useCollection('recommendations');
  const deals = scopeRows(deals0, user, level('sales'));
  const tasks = scopeRows(tasks0, user, level('taskHub'), 'assigneeId');
  const open = deals.filter((d) => !['won', 'lost'].includes(d.stage));
  const won = deals.filter((d) => d.stage === 'won');
  const overdue = tasks.filter((t) => t.status !== 'completed' && new Date(t.dueAt) < new Date());
  const qualified = leads.filter((l) => l.status === 'qualified').length;
  const resp = avg(leads.filter((l) => l.firstResponseMin), 'firstResponseMin');
  const stageData = STAGES.slice(0, 7).map((s) => ({ label: s, value: deals.filter((d) => d.stage === s).length }));
  const funnel = [
    { label: 'Leads collected', value: leads.length }, { label: 'Qualified', value: qualified },
    { label: 'Opportunities', value: open.length + won.length }, { label: 'Won', value: won.length },
  ];
  const hot = leads.filter((l) => l.temperature === 'hot' && l.status === 'qualified').sort((a, b) => b.score - a.score).slice(0, 5);
  const todo = tasks.filter((t) => t.status !== 'completed').sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt)).slice(0, 6);

  return (
    <>
      <PageHeader title={`Welcome back, ${user.name.split(' ')[0]}`} subtitle="Here is how your growth engine is performing today." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Leads (30d)" value={leads.length} icon={Users} hint={`${qualified} qualified`} />
        <StatCard label="Qualified rate" value={pct((qualified / Math.max(1, leads.length)) * 100)} icon={Target} tone="teal" />
        <StatCard label="Open pipeline" value={money(sum(open, 'value'), true)} icon={TrendingUp} tone="gold" hint={`${open.length} deals`} />
        <StatCard label="Won revenue" value={money(sum(won, 'value'), true)} icon={DollarSign} tone="success" hint={`${won.length} deals`} />
        <StatCard label="Overdue tasks" value={overdue.length} icon={AlertTriangle} tone="danger" />
        <StatCard label="Avg first response" value={`${Math.round(resp)} min`} icon={Timer} tone="teal" />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Conversion funnel" subtitle="Lead collection to won deal" className="lg:col-span-2"><Funnel data={funnel} /></Card>
        <Card title="Leads by status"><Donut data={groupCount(leads, 'status').map((d) => ({ ...d, label: d.label.replace('_', ' ') }))} /></Card>
        <Card title="Pipeline by stage" className="lg:col-span-2"><BarChart data={stageData} /></Card>
        <Card title="AI recommendations" action={<Link to="/app/analytics/recommendations" className="text-xs font-medium text-brand-600">View all</Link>}>
          <ul className="space-y-3">{recs.slice(0, 3).map((r) => <li key={r.id}><p className="text-sm font-medium text-ink-800">{r.title}</p><p className="text-xs text-ink-500">{r.metric} - {r.confidence}% confidence</p></li>)}</ul>
        </Card>
        <Card title="Hot leads to contact" action={<Link to="/app/lead-intelligence/scoring" className="text-xs font-medium text-brand-600">Priority queue</Link>} bodyClass="p-0">
          <ul className="divide-y divide-ink-100">{hot.map((l) => <li key={l.id} className="flex items-center justify-between gap-3 px-4 py-2.5"><div className="min-w-0"><p className="truncate text-sm font-medium text-ink-800">{l.company}</p><p className="truncate text-xs text-ink-500">{l.name} - {l.source}</p></div><Badge tone="danger">{l.score}</Badge></li>)}</ul>
        </Card>
        <Card title="Tasks due next" className="lg:col-span-2" action={<Link to="/app/task-hub/tasks" className="text-xs font-medium text-brand-600">Open Task Hub</Link>} bodyClass="p-0">
          <ul className="divide-y divide-ink-100">{todo.map((t) => { const c = countdown(t.dueAt); return (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5"><div className="min-w-0"><p className="truncate text-sm font-medium text-ink-800">{t.title}</p><div className="text-xs text-ink-500"><Ref id={t.assigneeId} /></div></div><div className="flex items-center gap-2"><StatusBadge value={t.status} /><span className={`text-xs font-medium ${c.late ? 'text-red-600' : 'text-ink-500'}`}>{c.text}</span></div></li>); })}</ul>
        </Card>
      </div>
    </>
  );
}
