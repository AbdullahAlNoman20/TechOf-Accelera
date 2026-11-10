import { useState } from 'react';
import { AlertTriangle, ArrowUpCircle, BellRing, Timer } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Preview from '@/components/ui/Preview';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import DataTable from '@/components/data/DataTable';
import CrudTable from '@/components/data/CrudTable';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { avg, countdown, fmtDateTime, pct } from '@/utils/format';

const FIELDS = [
  { name: 'name', label: 'Policy name', required: true, span: 2 }, { name: 'priority', label: 'Applies to priority', type: 'select', options: ['high', 'medium', 'low'], required: true },
  { name: 'firstResponseMin', label: 'Reply within (minutes)', type: 'number', min: 1, required: true }, { name: 'resolveHours', label: 'Finish within (hours)', type: 'number', min: 1, required: true },
  { name: 'escalateTo', label: 'Tell this person if late', required: true }, { name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Active' },
];
const TARGET = { hot: 15, warm: 60, cold: 240 };

export default function Sla() {
  const [tab, setTab] = useState('tasks');
  const { items: tasks, update } = useCollection('tasks');
  const { items: leads } = useCollection('leads');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const w = canWrite('taskHub');
  const open = tasks.filter((t) => t.status !== 'completed');
  const late = open.filter((t) => new Date(t.slaAt) < new Date());
  const soon = open.filter((t) => { const m = (new Date(t.dueAt) - Date.now()) / 6e4; return m > 0 && m < 1440; });
  const stale = open.filter((t) => t.status === 'assigned' && (Date.now() - new Date(t.createdAt)) / 864e5 > 3);
  const resp = leads.filter((l) => l.firstResponseMin).map((l) => ({ ...l, target: TARGET[l.temperature], breach: l.firstResponseMin > TARGET[l.temperature] }));
  const breaches = resp.filter((r) => r.breach);

  async function escalate(t, silent) {
    await update(t.id, { status: 'escalated', history: [...t.history, { by: 'System', text: 'Escalated to manager: SLA breached', at: new Date().toISOString() }] });
    await api.create('notifications', { userId: 'all', title: 'Escalation', body: `${t.id} escalated after SLA breach`, at: new Date().toISOString(), read: false, type: 'warning' });
    if (!silent) push(`${t.id} escalated to manager`);
  }
  async function runCheck() {
    const target = late.filter((t) => t.status !== 'escalated');
    for (const t of target) await escalate(t, true);
    await api.create('automationLogs', { rule: 'SLA escalation', module: 'Task Hub', at: new Date().toISOString(), action: `Escalated ${target.length} task(s)`, result: 'success', duration: '2s' });
    push(`${target.length} late task(s) escalated automatically`);
  }
  async function reassignStale() {
    for (const t of stale) await update(t.id, { status: 'escalated', history: [...t.history, { by: 'System', text: 'Unaccepted for 3+ days: returned to manager for reassignment', at: new Date().toISOString() }] });
    push(`${stale.length} inactive task(s) sent back for reassignment`);
  }
  const alertManagers = async () => { await api.create('notifications', { userId: 'all', title: 'Reply-time alert', body: `${breaches.length} lead(s) waited longer than the promised time`, at: new Date().toISOString(), read: false, type: 'warning' }); push('Managers alerted'); };

  return (
    <>
      <PageHeader title="Response Guard" actions={w && <Button icon={ArrowUpCircle} onClick={runCheck}>Run escalation check<Preview kind="automation" /></Button>} />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open tasks" value={open.length} icon={Timer} /><StatCard label="Promise broken" value={late.length} icon={AlertTriangle} tone="danger" />
        <StatCard label="Due in 24 hours" value={soon.length} icon={BellRing} tone="gold" hint="Smart reminders" /><StatCard label="Replies on time" value={pct(((resp.length - breaches.length) / Math.max(1, resp.length)) * 100)} tone="success" hint={`Avg first reply ${Math.round(avg(resp, 'firstResponseMin'))} min`} />
      </div>
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'tasks', label: 'Tasks & deadlines', count: open.length }, { key: 'reminders', label: 'Reminders', count: soon.length }, { key: 'response', label: 'Lead reply times', count: breaches.length }, { key: 'policies', label: 'Promised times' }]} />
      {tab === 'tasks' && <DataTable rows={open} pageSize={8} searchKeys={['title', 'company']} defaultSort={{ key: 'slaAt', dir: 'asc' }} toolbar={w && stale.length > 0 && <Button size="sm" variant="secondary" onClick={reassignStale}>Return {stale.length} inactive task(s) for reassignment</Button>}
        columns={[{ key: 'title', label: 'Task', render: (t) => <div><p className="font-medium text-ink-900">{t.title}</p><p className="text-xs text-ink-500">{t.id}</p></div> }, { key: 'assigneeId', label: 'Owner', render: (t) => <Ref id={t.assigneeId} /> }, { key: 'status', label: 'Status', render: (t) => <StatusBadge value={t.status} /> },
          { key: 'slaAt', label: 'Reply clock', render: (t) => { const c = countdown(t.slaAt); return <Badge tone={c.late ? 'danger' : 'success'}>{c.text}</Badge>; } }, { key: 'a', label: '', sortable: false, render: (t) => w && t.status !== 'escalated' && <Button size="sm" variant="secondary" onClick={() => escalate(t)}>Escalate</Button> }]} />}
      {tab === 'reminders' && <Card title="Due in the next 24 hours" subtitle="Smart reminders are sent to the owner" bodyClass="p-0"><ul className="divide-y divide-ink-100">{soon.map((t) => <li key={t.id} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="truncate text-sm font-medium text-ink-900">{t.title}</p><p className="text-xs text-ink-500"><Ref id={t.assigneeId} avatar={false} /> - due {fmtDateTime(t.dueAt)}</p></div>{w && <Button size="sm" variant="secondary" onClick={async () => { await api.create('notifications', { userId: t.assigneeId, title: 'Task reminder', body: t.title, at: new Date().toISOString(), read: false, type: 'info' }); push('Reminder sent'); }}>Send reminder</Button>}</li>)}{!soon.length && <li className="p-8 text-center text-sm text-ink-400">Nothing due in the next 24 hours.</li>}</ul></Card>}
      {tab === 'response' && <DataTable rows={resp} searchKeys={['name', 'company']} exportName="lead-response" defaultSort={{ key: 'firstResponseMin', dir: 'desc' }} filters={[{ key: 'temperature', label: 'Priority', options: ['hot', 'warm', 'cold'] }]} toolbar={w && breaches.length > 0 && <Button size="sm" variant="secondary" onClick={alertManagers}>Alert managers</Button>}
        columns={[{ key: 'name', label: 'Lead', render: (l) => <div><p className="font-medium text-ink-900">{l.name}</p><p className="text-xs text-ink-500">{l.company}</p></div> }, { key: 'ownerId', label: 'Owner', render: (l) => <Ref id={l.ownerId} /> }, { key: 'temperature', label: 'Priority', render: (l) => <StatusBadge value={l.temperature} /> }, { key: 'target', label: 'Promised', render: (l) => `${l.target} min` }, { key: 'firstResponseMin', label: 'First reply', render: (l) => `${l.firstResponseMin} min` }, { key: 'breach', label: 'Result', render: (l) => <Badge tone={l.breach ? 'danger' : 'success'}>{l.breach ? 'Too slow' : 'On time'}</Badge> }]} />}
      {tab === 'policies' && <CrudTable collection="slaPolicies" module="taskHub" noun="promise" fields={FIELDS} defaults={{ active: true, priority: 'medium' }} pageSize={5}
        columns={[{ key: 'name', label: 'Promise' }, { key: 'priority', label: 'Priority', render: (p) => <StatusBadge value={p.priority} /> }, { key: 'firstResponseMin', label: 'Reply within', render: (p) => `${p.firstResponseMin} min` }, { key: 'resolveHours', label: 'Finish within', render: (p) => `${p.resolveHours} h` }, { key: 'escalateTo', label: 'Tell if late' }]} />}
    </>
  );
}
