import { CheckCircle2, DollarSign, Target, Timer } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import DataTable from '@/components/data/DataTable';
import { BarChart } from '@/components/charts/Charts';
import Ref from '@/components/common/Ref';
import useAuth from '@/hooks/useAuth';
import useCollection from '@/hooks/useCollection';
import useTeam from './useTeam';
import { money, pct } from '@/utils/format';

export default function Overview() {
  const { user, level } = useAuth();
  const { rows, tasks, fus } = useTeam();
  const { items: trends } = useCollection('trends');
  const done = trends.slice(0, -1);
  const accuracy = done.length ? done.reduce((s, t) => s + Math.max(0, 1 - Math.abs(t.revenue - t.forecast) / t.forecast), 0) / done.length * 100 : 0;
  const own = level('performance') === 'own';
  const me = rows.find((r) => r.id === user.id);
  const list = own ? rows.filter((r) => r.id === user.id) : rows;
  const today = new Date().toDateString();
  const mine = tasks.filter((t) => t.assigneeId === user.id);
  return (
    <>
      <PageHeader title={own ? 'My Performance' : 'Team Performance Dashboard'} subtitle={own ? 'Your assigned work, progress and targets.' : 'Role-based visibility into conversion, revenue, SLA and workload.'} />
      {me && <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Revenue contribution" value={money(me.revenue, true)} icon={DollarSign} tone="gold" /><StatCard label="Conversion rate" value={pct(me.conversion)} icon={Target} tone="teal" /><StatCard label="Task completion" value={pct(me.taskRate)} icon={CheckCircle2} tone="success" /><StatCard label="Avg response" value={`${Math.round(me.responseMin)} min`} icon={Timer} /></div>}
      {!own && <div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Forecast accuracy" value={pct(accuracy)} icon={Target} tone="teal" hint="Forecast vs real revenue, past months" /></div>}
      {me && <Card title="Daily activity summary" className="mb-5"><div className="grid gap-3 text-center sm:grid-cols-4">{[['Tasks completed', mine.filter((t) => t.status === 'completed').length], ['Open tasks', me.open], ['Overdue / blocked', me.overdue], ['Follow-ups due today', fus.filter((f) => f.ownerId === user.id && f.status === 'scheduled' && new Date(f.dueAt).toDateString() === today).length]].map(([k, v]) => <div key={k} className="rounded-lg bg-ink-50 p-3"><p className="text-2xl font-bold text-brand-800">{v}</p><p className="text-xs text-ink-500">{k}</p></div>)}</div></Card>}
      {!own && <div className="mb-5 grid gap-5 lg:grid-cols-2"><Card title="Revenue contribution"><BarChart data={rows.map((r) => ({ label: r.name.split(' ')[0], value: r.revenue }))} format={(v) => money(v, true)} /></Card><Card title="Branch / team comparison" subtitle="Won deals by team"><BarChart color="#1A8F9B" data={Object.entries(rows.reduce((m, r) => { m[r.team] = (m[r.team] || 0) + r.won; return m; }, {})).map(([label, value]) => ({ label: label.split(' ')[0], value }))} /></Card></div>}
      <DataTable rows={list} exportName="team-performance" pageSize={10} columns={[{ key: 'name', label: 'Employee', render: (r) => <Ref id={r.id} /> }, { key: 'team', label: 'Team' }, { key: 'conversion', label: 'Conversion', render: (r) => pct(r.conversion) }, { key: 'revenue', label: 'Revenue', render: (r) => money(r.revenue) }, { key: 'taskRate', label: 'Tasks on time', render: (r) => <div className="w-24"><ProgressBar value={r.taskRate} showValue /></div> }, { key: 'followRate', label: 'Follow-ups done', render: (r) => pct(r.followRate) }, { key: 'sla', label: 'SLA', render: (r) => pct(r.sla) }, { key: 'targetPct', label: 'Target', render: (r) => <div className="w-24"><ProgressBar value={r.targetPct} showValue /></div> }]} />
    </>
  );
}
