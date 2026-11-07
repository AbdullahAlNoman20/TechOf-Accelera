import { AlertTriangle, ArrowUpCircle, Timer } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import DataTable from '@/components/data/DataTable';
import CrudTable from '@/components/data/CrudTable';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { countdown } from '@/utils/format';

const FIELDS = [
  { name: 'name', label: 'Policy name', required: true, span: 2 }, { name: 'priority', label: 'Applies to priority', type: 'select', options: ['high', 'medium', 'low'], required: true },
  { name: 'firstResponseMin', label: 'First response (minutes)', type: 'number', min: 1, required: true }, { name: 'resolveHours', label: 'Complete within (hours)', type: 'number', min: 1, required: true },
  { name: 'escalateTo', label: 'Escalate to', required: true }, { name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Active' },
];

export default function Sla() {
  const { items: tasks, update } = useCollection('tasks');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const open = tasks.filter((t) => !['completed'].includes(t.status));
  const late = open.filter((t) => new Date(t.slaAt) < new Date());
  const w = canWrite('taskHub');

  async function escalate(t, silent) {
    await update(t.id, { status: 'escalated', history: [...t.history, { by: 'System', text: 'Escalated to manager: SLA breached', at: new Date().toISOString() }] });
    await api.create('notifications', { userId: 'all', title: 'Escalation', body: `${t.id} escalated after SLA breach`, at: new Date().toISOString(), read: false, type: 'warning' });
    if (!silent) push(`${t.id} escalated to manager`);
  }
  async function runCheck() {
    const target = late.filter((t) => t.status !== 'escalated');
    for (const t of target) await escalate(t, true);
    await api.create('automationLogs', { rule: 'SLA escalation', module: 'Task Hub', at: new Date().toISOString(), action: `Escalated ${target.length} task(s)`, result: 'success', duration: '2s' });
    push(`${target.length} overdue task(s) escalated automatically`);
  }
  return (
    <>
      <PageHeader title="SLA, Deadlines & Escalation" subtitle="Timers, overdue alerts and automatic escalation keep every lead moving." actions={w && <Button icon={ArrowUpCircle} onClick={runCheck}>Run escalation check</Button>} />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Open tasks" value={open.length} icon={Timer} /><StatCard label="SLA breached" value={late.length} icon={AlertTriangle} tone="danger" />
        <StatCard label="SLA compliance" value={`${Math.round(((open.length - late.length) / Math.max(1, open.length)) * 100)}%`} icon={Timer} tone="success" />
      </div>
      <Card title="Tasks against SLA" bodyClass="p-0" className="mb-5">
        <DataTable rows={open} pageSize={8} searchKeys={['title', 'company']} defaultSort={{ key: 'slaAt', dir: 'asc' }}
          columns={[{ key: 'title', label: 'Task', render: (t) => <div><p className="font-medium text-ink-900">{t.title}</p><p className="text-xs text-ink-500">{t.id}</p></div> }, { key: 'assigneeId', label: 'Owner', render: (t) => <Ref id={t.assigneeId} /> }, { key: 'status', label: 'Status', render: (t) => <StatusBadge value={t.status} /> },
            { key: 'slaAt', label: 'SLA timer', render: (t) => { const c = countdown(t.slaAt); return <Badge tone={c.late ? 'danger' : 'success'}>{c.text}</Badge>; } },
            { key: 'a', label: '', sortable: false, render: (t) => w && t.status !== 'escalated' && <Button size="sm" variant="secondary" onClick={() => escalate(t)}>Escalate</Button> }]} />
      </Card>
      <h2 className="mb-2 text-sm font-semibold text-ink-700">SLA policies</h2>
      <CrudTable collection="slaPolicies" module="taskHub" noun="policy" fields={FIELDS} defaults={{ active: true, priority: 'medium' }} pageSize={5}
        columns={[{ key: 'name', label: 'Policy' }, { key: 'priority', label: 'Priority', render: (p) => <StatusBadge value={p.priority} /> }, { key: 'firstResponseMin', label: 'First response', render: (p) => `${p.firstResponseMin} min` }, { key: 'resolveHours', label: 'Complete within', render: (p) => `${p.resolveHours} h` }, { key: 'escalateTo', label: 'Escalate to' }]} />
    </>
  );
}
