import { AlertTriangle, CheckCircle2, Timer } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/data/DataTable';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import { avg, fmtDateTime, pct } from '@/utils/format';

const TARGET = { hot: 15, warm: 60, cold: 240 };
export default function ResponseSla() {
  const { items } = useCollection('leads');
  const rows = items.filter((l) => l.firstResponseMin).map((l) => ({ ...l, target: TARGET[l.temperature], breach: l.firstResponseMin > TARGET[l.temperature] }));
  const breaches = rows.filter((r) => r.breach);
  return (
    <>
      <PageHeader title="Response SLA" subtitle="How quickly each lead received its first response, measured against the SLA target for its priority." />
      <div className="mb-5 grid gap-4 sm:grid-cols-3"><StatCard label="Avg first response" value={`${Math.round(avg(rows, 'firstResponseMin'))} min`} icon={Timer} tone="teal" /><StatCard label="Within SLA" value={pct((1 - breaches.length / Math.max(1, rows.length)) * 100)} icon={CheckCircle2} tone="success" /><StatCard label="SLA breaches" value={breaches.length} icon={AlertTriangle} tone="danger" /></div>
      <DataTable rows={rows} searchKeys={['name', 'company']} exportName="response-sla" defaultSort={{ key: 'firstResponseMin', dir: 'desc' }} filters={[{ key: 'temperature', label: 'Priority', options: ['hot', 'warm', 'cold'] }]}
        columns={[{ key: 'name', label: 'Lead', render: (l) => <div><p className="font-medium text-ink-900">{l.name}</p><p className="text-xs text-ink-500">{l.company}</p></div> }, { key: 'ownerId', label: 'Owner', render: (l) => <Ref id={l.ownerId} /> }, { key: 'temperature', label: 'Priority', render: (l) => <Badge tone={l.temperature === 'hot' ? 'danger' : l.temperature === 'warm' ? 'gold' : 'brand'}>{l.temperature}</Badge> },
          { key: 'createdAt', label: 'Received', render: (l) => fmtDateTime(l.createdAt) }, { key: 'target', label: 'SLA target', render: (l) => `${l.target} min` }, { key: 'firstResponseMin', label: 'First response', render: (l) => `${l.firstResponseMin} min` }, { key: 'breach', label: 'Result', render: (l) => <Badge tone={l.breach ? 'danger' : 'success'}>{l.breach ? 'Breached' : 'Met'}</Badge> }]} />
    </>
  );
}
