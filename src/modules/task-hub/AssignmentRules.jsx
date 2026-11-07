import { useState } from 'react';
import { Wand2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { suggestAssignee } from '@/services/assignment';
import { humanize } from '@/utils/format';

const FIELDS = [
  { name: 'name', label: 'Rule name', required: true, span: 2 },
  { name: 'method', label: 'Method', type: 'select', options: ['priority', 'industry', 'territory', 'workload', 'round_robin', 'skill'], required: true }, { name: 'priority', label: 'Order (1 = first)', type: 'number', min: 1, max: 99, required: true },
  { name: 'condition', label: 'Condition', required: true, span: 2 }, { name: 'assignTo', label: 'Assign to (person or team)', required: true }, { name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Rule is active' },
];

export default function AssignmentRules() {
  const { items: leads } = useCollection('leads');
  const { items: users } = useCollection('users');
  const { items: tasks, create } = useCollection('tasks');
  const { items: rules } = useCollection('assignmentRules');
  const { update } = useCollection('leads');
  const { user, canWrite } = useAuth();
  const { push } = useToast();
  const [leadId, setLeadId] = useState('');
  const lead = leads.find((l) => l.id === leadId);
  const result = lead ? suggestAssignee(lead, users, tasks, rules) : null;
  const unassigned = leads.filter((l) => l.status === 'qualified' && !tasks.some((t) => t.leadId === l.id));

  async function autoAssign() {
    for (const l of unassigned) {
      const { user: u } = suggestAssignee(l, users, tasks, rules);
      const due = new Date(Date.now() + 864e5).toISOString();
      await create({ title: `Make first contact with ${l.company}`, leadId: l.id, leadName: l.name, company: l.company, dealId: null, assigneeId: u.id, team: u.team, priority: l.temperature === 'hot' ? 'high' : 'medium', status: 'assigned', dueAt: due, slaAt: new Date(Date.now() + 36e5).toISOString(), dependsOn: null, notes: [], comments: [], attachments: [], history: [{ by: 'System', text: 'Task created automatically from qualified lead', at: new Date().toISOString() }] });
      await update(l.id, { ownerId: u.id });
    }
    push(`${unassigned.length} task(s) created and assigned by rules`);
  }
  return (
    <>
      <PageHeader title="Assignment Rules" subtitle="Business-specific routing: priority, industry, territory, workload and round-robin." actions={canWrite('taskHub') && <Button icon={Wand2} disabled={!unassigned.length} onClick={autoAssign}>Auto-assign {unassigned.length} qualified lead(s)</Button>} />
      <div className="mb-5 grid gap-5 lg:grid-cols-3">
        <Card title="Test routing" subtitle="Preview who a lead would be assigned to">
          <select aria-label="Lead" className="input" value={leadId} onChange={(e) => setLeadId(e.target.value)}><option value="">Select a lead...</option>{leads.filter((l) => l.status !== 'rejected').map((l) => <option key={l.id} value={l.id}>{l.company} - {l.name}</option>)}</select>
          {result && <div className="mt-4 space-y-1 rounded-lg bg-brand-50 p-3 text-sm"><p><b>Assignee:</b> {result.user?.name}</p><p><b>Matched rule:</b> {result.rule ? result.rule.name : 'Workload fallback'}</p><p className="text-xs text-ink-500">{lead.industry}, {lead.city} - {humanize(lead.temperature)} lead</p></div>}
        </Card>
        <div className="lg:col-span-2">
          <CrudTable collection="assignmentRules" module="taskHub" noun="rule" fields={FIELDS} searchKeys={['name', 'condition']} defaults={{ active: true, priority: 10, method: 'workload' }} defaultSort={{ key: 'priority', dir: 'asc' }}
            columns={[{ key: 'priority', label: '#' }, { key: 'name', label: 'Rule' }, { key: 'method', label: 'Method', render: (r) => <Badge tone="brand">{humanize(r.method)}</Badge> }, { key: 'condition', label: 'Condition' }, { key: 'assignTo', label: 'Assign to' }, { key: 'active', label: 'Status', render: (r) => <StatusBadge value={r.active ? 'active' : 'paused'} /> }]} />
        </div>
      </div>
    </>
  );
}
