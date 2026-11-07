import { useState } from 'react';
import { LayoutGrid, List, Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import DataTable from '@/components/data/DataTable';
import FormModal from '@/components/data/FormModal';
import Ref from '@/components/common/Ref';
import TaskModal from './TaskModal';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { scopeRows } from '@/utils/scope';
import { lookup } from '@/services/api';
import { countdown, fmtDateTime, humanize } from '@/utils/format';
import { TASK_STATUSES } from '@/utils/status';

export const TASK_FIELDS = [
  { name: 'title', label: 'Task title', required: true, span: 2 }, { name: 'leadName', label: 'Lead / contact' }, { name: 'company', label: 'Company' },
  { name: 'assigneeId', label: 'Assign to', optionsFrom: 'users', optionFilter: (u) => ['sales', 'manager', 'support', 'operations'].includes(u.role), required: true },
  { name: 'priority', label: 'Priority', type: 'select', options: ['high', 'medium', 'low'], required: true }, { name: 'dueAt', label: 'Due date', type: 'date', required: true },
  { name: 'dependsOn', label: 'Depends on task (ID)', placeholder: 'e.g. TK-1003' },
];
const PRI = { high: 'danger', medium: 'gold', low: 'neutral' };

export default function Tasks() {
  const { items, create, update } = useCollection('tasks');
  const { user, level, canWrite } = useAuth();
  const { push } = useToast();
  const [view, setView] = useState('board');
  const [open, setOpen] = useState(null);
  const [creating, setCreating] = useState(false);
  const [who, setWho] = useState('');
  const w = canWrite('taskHub');
  const rows = scopeRows(items, user, level('taskHub'), 'assigneeId').filter((t) => !who || t.assigneeId === who);

  async function move(t, status) {
    if (status === 'working' && t.dependsOn) {
      const dep = items.find((x) => x.id === t.dependsOn);
      if (dep && dep.status !== 'completed') return push(`Blocked: complete ${dep.id} first`, 'error');
    }
    await update(t.id, { status, history: [...(t.history || []), { by: user.name, text: `Status changed to ${humanize(status)}`, at: new Date().toISOString() }] });
    push(`Task moved to ${humanize(status)}`);
  }
  const assignees = [...new Set(items.map((t) => t.assigneeId))];

  return (
    <>
      <PageHeader title="Task Hub" subtitle="Qualified leads become tasks with owners, deadlines and SLA timers. Move cards through the lifecycle."
        actions={<>
          <select aria-label="Assignee" className="input w-auto" value={who} onChange={(e) => setWho(e.target.value)}><option value="">All assignees</option>{assignees.map((a) => <option key={a} value={a}>{lookup('users', a)?.name || 'Unassigned'}</option>)}</select>
          <div className="flex rounded-lg border border-ink-200 bg-white p-0.5"><Button size="icon" variant={view === 'board' ? 'primary' : 'ghost'} aria-label="Board view" icon={LayoutGrid} onClick={() => setView('board')} /><Button size="icon" variant={view === 'list' ? 'primary' : 'ghost'} aria-label="List view" icon={List} onClick={() => setView('list')} /></div>
          {w && <Button icon={Plus} onClick={() => setCreating(true)}>New task</Button>}</>} />
      {view === 'board' ? (
        <div className="flex gap-4 overflow-x-auto pb-3">
          {TASK_STATUSES.map((s) => {
            const col = rows.filter((t) => t.status === s);
            return (
              <section key={s} className="w-72 shrink-0 rounded-xl bg-ink-100/70 p-2.5">
                <header className="mb-2 flex items-center justify-between px-1"><StatusBadge value={s} /><span className="text-xs font-semibold text-ink-500">{col.length}</span></header>
                <div className="space-y-2">
                  {col.map((t) => { const c = countdown(t.dueAt); return (
                    <article key={t.id} className="card cursor-pointer p-3 hover:border-brand-300" onClick={() => setOpen(t)}>
                      <div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-ink-900">{t.title}</p><Badge tone={PRI[t.priority]}>{t.priority}</Badge></div>
                      <p className="mt-1 text-xs text-ink-500">{t.leadName} - {t.company}</p>
                      <div className="mt-2 flex items-center justify-between text-xs"><Ref id={t.assigneeId} /><span className={c.late && s !== 'completed' ? 'font-semibold text-red-600' : 'text-ink-500'}>{s === 'completed' ? 'Done' : c.text}</span></div>
                      {w && <select aria-label="Move task" className="input mt-2 py-1 text-xs" value={t.status} onClick={(e) => e.stopPropagation()} onChange={(e) => move(t, e.target.value)}>{TASK_STATUSES.map((x) => <option key={x} value={x}>{humanize(x)}</option>)}</select>}
                    </article>); })}
                  {!col.length && <p className="px-2 py-6 text-center text-xs text-ink-400">No tasks</p>}
                </div>
              </section>);
          })}
        </div>
      ) : (
        <DataTable rows={rows} searchKeys={['title', 'leadName', 'company']} onRowClick={setOpen} exportName="tasks" defaultSort={{ key: 'dueAt', dir: 'asc' }} filters={[{ key: 'status', label: 'Status', options: TASK_STATUSES }, { key: 'priority', label: 'Priority', options: ['high', 'medium', 'low'] }]}
          columns={[{ key: 'title', label: 'Task', render: (t) => <div><p className="font-medium text-ink-900">{t.title}</p><p className="text-xs text-ink-500">{t.id}{t.dependsOn && ` - after ${t.dependsOn}`}</p></div> }, { key: 'assigneeId', label: 'Owner', render: (t) => <Ref id={t.assigneeId} /> }, { key: 'priority', label: 'Priority', render: (t) => <Badge tone={PRI[t.priority]}>{t.priority}</Badge> }, { key: 'status', label: 'Status', render: (t) => <StatusBadge value={t.status} /> }, { key: 'dueAt', label: 'Due', render: (t) => fmtDateTime(t.dueAt) }]} />
      )}
      <FormModal open={creating} onClose={() => setCreating(false)} title="New task" fields={TASK_FIELDS} initial={{ priority: 'medium', assigneeId: user.id }}
        onSubmit={async (v) => { const due = new Date(v.dueAt); await create({ ...v, team: '', dealId: null, status: 'assigned', dueAt: due.toISOString(), slaAt: new Date(due.getTime() + 36e5).toISOString(), notes: [], comments: [], attachments: [], history: [{ by: user.name, text: 'Task created manually', at: new Date().toISOString() }] }); push('Task created and assigned'); setCreating(false); }} />
      <TaskModal task={items.find((t) => t.id === open?.id)} onClose={() => setOpen(null)} />
    </>
  );
}
