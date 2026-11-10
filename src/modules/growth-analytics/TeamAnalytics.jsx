import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import { BarChart, Donut, HBar } from '@/components/charts/Charts';
import { CheckCircle2, Clock, Timer } from 'lucide-react';
import useCollection from '@/hooks/useCollection';
import { groupCount, humanize, pct } from '@/utils/format';

/** Process-level view (where work waits). Per-person results are in Team Performance. */
export default function TeamAnalytics() {
  const { items: tasks } = useCollection('tasks');
  const { items: users } = useCollection('users');
  const open = tasks.filter((t) => t.status !== 'completed');
  const late = open.filter((t) => new Date(t.dueAt) < new Date());
  const done = tasks.filter((t) => t.status === 'completed');
  const steps = ['assigned', 'accepted', 'working', 'waiting', 'escalated'].map((s) => ({ label: humanize(s), value: tasks.filter((t) => t.status === s).length }));
  const slow = [...steps].sort((a, b) => b.value - a.value)[0];
  const byTeam = Object.entries(tasks.reduce((m, t) => { const team = users.find((u) => u.id === t.assigneeId)?.team || 'Other'; m[team] = (m[team] || 0) + 1; return m; }, {})).map(([label, value]) => ({ label: label.split(' ')[0], value }));
  const bySla = [{ label: 'On time', value: open.length - late.length, color: '#1A8F9B' }, { label: 'Late', value: late.length, color: '#F2B632' }];
  return (
    <>
      <PageHeader title="Team & Task Insights" />
      <div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Task completion" value={pct((done.length / Math.max(1, tasks.length)) * 100)} icon={CheckCircle2} tone="success" /><StatCard label="SLA compliance" value={pct(((open.length - late.length) / Math.max(1, open.length)) * 100)} icon={Timer} tone="teal" /><StatCard label="Waiting longest at" value={slow?.label || '-'} icon={Clock} tone="gold" hint="Process bottleneck" /></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Where tasks are right now" subtitle="The tallest bar is where work waits"><BarChart data={steps} /></Card>
        <Card title="On time or late?"><Donut data={bySla} /></Card>
        <Card title="Workload distribution" subtitle="Tasks by team"><HBar data={byTeam} /></Card>
        <Card title="Task priority mix"><Donut data={groupCount(tasks, 'priority').map((d) => ({ ...d, label: humanize(d.label) }))} /></Card>
      </div>
      <p className="mt-3 text-xs text-ink-400">Per-person results, conversion and targets are in Team Performance. Performance is shown in context: workload and lead quality differ between people.</p>
    </>
  );
}
