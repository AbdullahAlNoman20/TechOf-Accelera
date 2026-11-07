import { useState } from 'react';
import { Activity, Database, Gauge, HardDrive, Server, Sparkles } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/Badge';
import DataTable from '@/components/data/DataTable';
import CrudTable from '@/components/data/CrudTable';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { fmtDateTime } from '@/utils/format';

const INC = [
  { name: 'title', label: 'Incident', required: true, span: 2 }, { name: 'severity', label: 'Severity', type: 'select', options: ['low', 'medium', 'high', 'critical'], required: true }, { name: 'status', label: 'Status', type: 'select', options: ['open', 'investigating', 'resolved'], required: true },
  { name: 'owner', label: 'Owner', required: true }, { name: 'rootCause', label: 'Root cause / notes', type: 'textarea' },
];
export default function Health() {
  const [tab, setTab] = useState('overview');
  const { items: jobs, update: updJob } = useCollection('jobs');
  const { items: backups } = useCollection('backups');
  const { items: inc, update: updInc } = useCollection('incidents');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const failed = jobs.filter((j) => j.status === 'failed').length;
  const cards = [['Application', 'Operational', Server, 'success'], ['Database', 'Healthy - 18 ms', Database, 'teal'], ['API latency (p95)', '240 ms', Gauge, 'brand'], ['Queues', `${jobs.length - failed} ok, ${failed} failed`, Activity, failed ? 'danger' : 'success'], ['Last backup', backups[0] ? fmtDateTime(backups[0].at) : '-', HardDrive, backups[0]?.verified ? 'success' : 'danger']];
  const suggest = (i) => `Probable root cause: ${i.rootCause || 'under analysis'}. Suggested steps: 1) check the latest sync and error logs, 2) re-authorize the affected connection or reduce request rate, 3) retry failed jobs, 4) monitor for 30 minutes.`;
  return (
    <>
      <PageHeader title="System Health & Monitoring" subtitle="Application, database, API, jobs, queues, backups and incidents." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'overview', label: 'Overview' }, { key: 'jobs', label: 'Jobs & queues', count: failed }, { key: 'incidents', label: 'Incidents', count: inc.filter((i) => i.status !== 'resolved').length }, { key: 'backups', label: 'Backups' }]} />
      {tab === 'overview' && <><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cards.map(([l, v, I, t]) => <StatCard key={l} label={l} value={<span className="text-base">{v}</span>} icon={I} tone={t} />)}</div>
        <Card title="Maintenance & alerts" className="mt-5"><ul className="space-y-2 text-sm text-ink-700"><li>Scheduled maintenance: Saturday 02:00-03:00 (database patching). Read-only mode expected for 10 minutes.</li>{failed > 0 && <li className="text-red-700">{failed} background job(s) failed: open Jobs & queues to retry.</li>}</ul></Card></>}
      {tab === 'jobs' && <DataTable rows={jobs} columns={[{ key: 'name', label: 'Job' }, { key: 'queue', label: 'Queue' }, { key: 'status', label: 'Status', render: (j) => <StatusBadge value={j.status} /> }, { key: 'lastRun', label: 'Last run', render: (j) => fmtDateTime(j.lastRun) }, { key: 'nextRun', label: 'Next run', render: (j) => fmtDateTime(j.nextRun) }, { key: 'duration', label: 'Duration' }, { key: 'a', label: '', sortable: false, render: (j) => canWrite('admin') && j.status === 'failed' && <Button size="sm" variant="secondary" onClick={() => { updJob(j.id, { status: 'success', failed: 0, lastRun: new Date().toISOString() }); push('Job retried successfully'); }}>Retry</Button> }]} />}
      {tab === 'incidents' && <CrudTable collection="incidents" module="admin" noun="incident" fields={INC} defaults={{ status: 'open', severity: 'medium', owner: 'Nusrat Jahan', openedAt: new Date().toISOString() }} columns={[{ key: 'title', label: 'Incident', render: (i) => <div><p className="font-medium text-ink-900">{i.title}</p><p className="text-xs text-ink-500">{i.rootCause}</p></div> }, { key: 'severity', label: 'Severity', render: (i) => <StatusBadge value={i.severity} /> }, { key: 'status', label: 'Status', render: (i) => <StatusBadge value={i.status} /> }, { key: 'owner', label: 'Owner' }, { key: 'openedAt', label: 'Opened', render: (i) => fmtDateTime(i.openedAt) }]}
        rowActions={(i) => <Button size="sm" variant="ghost" icon={Sparkles} onClick={() => updInc(i.id, { rootCause: suggest(i) })}>AI root cause</Button>} />}
      {tab === 'backups' && <DataTable rows={backups} columns={[{ key: 'at', label: 'Backup time', render: (b) => fmtDateTime(b.at) }, { key: 'type', label: 'Type' }, { key: 'size', label: 'Size' }, { key: 'status', label: 'Status', render: (b) => <StatusBadge value={b.status} /> }, { key: 'verified', label: 'Restore verified', render: (b) => <StatusBadge value={b.verified ? 'valid' : 'invalid'} /> }]} />}
    </>
  );
}
