import { CalendarCheck, CheckSquare, Clock, Repeat } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { countdown, fmtDateTime } from '@/utils/format';

const sameDay = (d) => new Date(d).toDateString() === new Date().toDateString();

export default function MyQueue() {
  const { user } = useAuth();
  const { items: tasks, update } = useCollection('tasks');
  const { items: fus, update: updFu } = useCollection('followUps');
  const { items: meetings } = useCollection('meetings');
  const { push } = useToast();
  const mine = tasks.filter((t) => t.assigneeId === user.id && t.status !== 'completed').sort((a, b) => new Date(a.dueAt) - new Date(b.dueAt));
  const prio = { high: 0, medium: 1, low: 2 };
  const queue = [...mine].sort((a, b) => prio[a.priority] - prio[b.priority] || new Date(a.dueAt) - new Date(b.dueAt));
  const myFu = fus.filter((f) => f.ownerId === user.id && f.status === 'scheduled');
  const myMt = meetings.filter((m) => m.ownerId === user.id && sameDay(m.start));
  const overdue = mine.filter((t) => new Date(t.dueAt) < new Date()).length;

  return (
    <>
      <PageHeader title="My Daily Queue" subtitle={`Priority work for ${user.name.split(' ')[0]}: overdue first, then high priority.`} />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open tasks" value={mine.length} icon={CheckSquare} /><StatCard label="Overdue" value={overdue} icon={Clock} tone="danger" />
        <StatCard label="Follow-ups" value={myFu.length} icon={Repeat} tone="teal" /><StatCard label="Meetings today" value={myMt.length} icon={CalendarCheck} tone="gold" />
      </div>
      <Card title="Your daily summary" subtitle="What a morning email would say" className="mb-5"><p className="text-sm text-ink-700">Good morning {user.name.split(' ')[0]}. You have <b>{mine.length}</b> open task(s), <b>{overdue}</b> overdue, <b>{myFu.length}</b> follow-up(s) and <b>{myMt.length}</b> meeting(s) today. {queue[0] ? <>Start with: <b>{queue[0].title}</b>.</> : 'Enjoy a clear day!'}</p></Card>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Task queue" className="lg:col-span-2" bodyClass="p-0">
          {queue.length === 0 && <p className="p-8 text-center text-sm text-ink-400">Your queue is clear. Great work!</p>}
          <ul className="divide-y divide-ink-100">{queue.map((t) => { const c = countdown(t.dueAt); return (
            <li key={t.id} className="flex items-center gap-3 px-4 py-3">
              <input type="checkbox" aria-label={`Complete ${t.title}`} className="h-4 w-4 rounded border-ink-300" onChange={() => { update(t.id, { status: 'completed', history: [...t.history, { by: user.name, text: 'Completed from daily queue', at: new Date().toISOString() }] }); push('Task completed'); }} />
              <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink-900">{t.title}</p><p className="text-xs text-ink-500">{t.leadName} - {t.company}</p></div>
              <StatusBadge value={t.priority} /><span className={`w-24 text-right text-xs font-medium ${c.late ? 'text-red-600' : 'text-ink-500'}`}>{c.text}</span>
            </li>); })}</ul>
        </Card>
        <div className="space-y-5">
          <Card title="Today's meetings" bodyClass="p-0"><ul className="divide-y divide-ink-100">{myMt.map((m) => <li key={m.id} className="px-4 py-2.5"><p className="text-sm font-medium text-ink-800">{m.title}</p><p className="text-xs text-ink-500">{fmtDateTime(m.start)} - {m.duration} min</p></li>)}{!myMt.length && <li className="p-4 text-center text-sm text-ink-400">No meetings today</li>}</ul></Card>
          <Card title="Follow-ups due" bodyClass="p-0"><ul className="divide-y divide-ink-100">{myFu.slice(0, 5).map((f) => <li key={f.id} className="flex items-center justify-between gap-2 px-4 py-2.5"><div className="min-w-0"><p className="truncate text-sm text-ink-800">{f.title}</p><p className="text-xs text-ink-500">{fmtDateTime(f.dueAt)}</p></div><button type="button" className="text-xs font-medium text-brand-600" onClick={() => { updFu(f.id, { status: 'done' }); push('Follow-up done'); }}>Done</button></li>)}{!myFu.length && <li className="p-4 text-center text-sm text-ink-400">No follow-ups</li>}</ul></Card>
        </div>
      </div>
    </>
  );
}
