import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import DataTable from '@/components/data/DataTable';
import { Toggle } from './Security';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { fmtDateTime, humanize } from '@/utils/format';

const RULE = [
  { name: 'name', label: 'Rule name', required: true, span: 2 }, { name: 'action', label: 'Action covered', required: true }, { name: 'condition', label: 'When approval is needed', required: true },
  { name: 'approverRole', label: 'Approver role', optionsFrom: 'roles', required: true }, { name: 'required', label: 'Approval', type: 'checkbox', checkLabel: 'Human approval is mandatory' }, { name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Rule is active' },
];
export default function Automation() {
  const [tab, setTab] = useState('rules');
  const { items: ai, update: updAi } = useCollection('aiControls');
  const { items: logs, update: updLog } = useCollection('automationLogs');
  const { items: versions } = useCollection('configVersions');
  const { items: settings } = useCollection('securitySettings');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const w = canWrite('admin');
  const limits = settings.filter((s) => s.group === 'Limits');
  return (
    <>
      <PageHeader title="Automation & AI Governance" subtitle="Which actions need human approval, where AI may be used, and a full record of what automation did." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'rules', label: 'Approval rules' }, { key: 'ai', label: 'AI usage controls' }, { key: 'logs', label: 'Automation logs', count: logs.filter((l) => l.result === 'failed').length }, { key: 'limits', label: 'Execution limits' }, { key: 'versions', label: 'Config versions' }]} />
      {tab === 'rules' && <CrudTable collection="approvalRules" module="admin" noun="approval rule" fields={RULE} defaults={{ required: true, active: true }} searchKeys={['name', 'action']} columns={[{ key: 'name', label: 'Rule' }, { key: 'action', label: 'Action' }, { key: 'condition', label: 'Condition' }, { key: 'approverRole', label: 'Approver', render: (r) => <Badge tone="brand">{humanize(r.approverRole)}</Badge> }, { key: 'active', label: 'Status', render: (r) => <StatusBadge value={r.active ? 'active' : 'paused'} /> }]} />}
      {tab === 'ai' && <Card title="Where AI may be used" bodyClass="p-0"><ul className="divide-y divide-ink-100">{ai.map((c) => <li key={c.id} className="flex items-center justify-between gap-3 px-4 py-3"><div><p className="text-sm font-medium text-ink-900">{c.name} <Badge>{c.scope}</Badge></p><p className="text-xs text-ink-500">{c.description}</p></div><Toggle label={c.name} on={c.enabled} disabled={!w} onChange={(v) => { updAi(c.id, { enabled: v }); api.log('ai_policy', 'aiControls', `${c.name} ${v ? 'enabled' : 'disabled'}`); push('AI control updated'); }} /></li>)}</ul></Card>}
      {tab === 'logs' && <DataTable rows={logs} pageSize={10} searchKeys={['rule', 'action', 'module']} exportName="automation-logs" defaultSort={{ key: 'at', dir: 'desc' }} filters={[{ key: 'result', label: 'Result', options: ['success', 'failed', 'awaiting_approval'] }, { key: 'module', label: 'Module', options: [...new Set(logs.map((l) => l.module))] }]}
        columns={[{ key: 'at', label: 'Run time', render: (l) => fmtDateTime(l.at) }, { key: 'rule', label: 'Rule' }, { key: 'module', label: 'Module' }, { key: 'action', label: 'Action' }, { key: 'result', label: 'Result', render: (l) => <StatusBadge value={l.result} /> }, { key: 'duration', label: 'Time' }, { key: 'a', label: '', sortable: false, render: (l) => w && l.result === 'failed' && <Button size="sm" variant="secondary" icon={RotateCcw} onClick={() => { updLog(l.id, { result: 'success', action: `${l.action} (retried)` }); push('Authorized retry succeeded'); }}>Retry</Button> }]} />}
      {tab === 'limits' && <Card title="Execution limits" subtitle="Protect against runaway automation and duplicate actions" bodyClass="p-0"><ul className="divide-y divide-ink-100">{limits.map((s) => <li key={s.id} className="flex items-center justify-between px-4 py-3"><div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-ink-500">{s.description}</p></div><b className="text-sm text-brand-800">{s.value}</b></li>)}</ul><p className="border-t border-ink-100 px-4 py-2 text-xs text-ink-400">Edit values in Security & Privacy, then Policies.</p></Card>}
      {tab === 'versions' && <DataTable rows={versions} columns={[{ key: 'item', label: 'Configuration' }, { key: 'version', label: 'Version', render: (v) => <Badge tone="teal">{v.version}</Badge> }, { key: 'changedBy', label: 'Changed by' }, { key: 'at', label: 'When', render: (v) => fmtDateTime(v.at) }, { key: 'note', label: 'Note' }]} />}
    </>
  );
}
