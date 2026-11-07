import { ArrowRight } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import useTeam from './useTeam';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';

export default function Workload() {
  const { rows, tasks, leads } = useTeam();
  const { update } = useCollection('tasks');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const load = rows.map((r) => ({ ...r, load: r.open + r.openDeals, pct: ((r.open + r.openDeals) / r.capacity) * 100 }));
  const over = load.filter((r) => r.pct > 100).sort((a, b) => b.pct - a.pct), free = [...load].sort((a, b) => a.pct - b.pct);
  const incoming = leads.filter((l) => l.status === 'new' || l.processing === 'collected').length;
  const spare = Math.max(0, load.reduce((s, r) => s + Math.max(0, r.capacity - r.load), 0));
  const suggestions = over.map((o) => ({ from: o, to: free.find((f) => f.id !== o.id && f.pct < 85), task: tasks.find((t) => t.assigneeId === o.id && ['assigned', 'accepted'].includes(t.status)) })).filter((s) => s.to && s.task);
  const apply = async (s) => { await update(s.task.id, { assigneeId: s.to.id, history: [...s.task.history, { by: 'Workload balancing', text: `Reassigned from ${s.from.name} to ${s.to.name}`, at: new Date().toISOString() }] }); await api.create('automationLogs', { rule: 'Workload balancing', module: 'Team Performance', at: new Date().toISOString(), action: `Moved ${s.task.id}`, result: 'success', duration: '1s' }); push('Task redistributed'); };
  return (
    <>
      <PageHeader title="Workload & Capacity" subtitle="Active tasks and open deals against each person's capacity, with rebalancing suggestions." />
      <div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Overloaded people" value={over.length} tone="danger" /><StatCard label="Incoming leads waiting" value={incoming} tone="gold" /><StatCard label="Spare capacity (items)" value={spare} tone="teal" hint="Plan hiring or shifts if incoming leads exceed spare capacity" /></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Capacity by employee">{load.map((r) => <div key={r.id} className="mb-3 last:mb-0"><div className="mb-1 flex justify-between text-sm"><span className="font-medium text-ink-800">{r.name}</span><span className="text-xs text-ink-500">{r.load} / {r.capacity} {r.pct > 100 && <Badge tone="danger">Overloaded</Badge>}</span></div><ProgressBar value={r.load} max={r.capacity} tone={r.pct > 100 ? 'danger' : r.pct > 80 ? 'gold' : 'teal'} /></div>)}</Card>
        <Card title="Rebalancing suggestions">{suggestions.length ? <ul className="space-y-3">{suggestions.map((s) => <li key={s.task.id} className="rounded-lg border border-ink-100 p-3"><p className="text-sm text-ink-800"><b>{s.from.name.split(' ')[0]}</b> <ArrowRight size={14} className="inline" /> <b>{s.to.name.split(' ')[0]}</b>: move "{s.task.title}"</p>{canWrite('performance') && <Button size="sm" className="mt-2" onClick={() => apply(s)}>Apply</Button>}</li>)}</ul> : <p className="text-sm text-ink-500">Workload is balanced. No action needed.</p>}</Card>
      </div>
    </>
  );
}
