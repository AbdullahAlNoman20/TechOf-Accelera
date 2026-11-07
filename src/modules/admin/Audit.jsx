import PageHeader from '@/components/ui/PageHeader';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/data/DataTable';
import useCollection from '@/hooks/useCollection';
import { fmtDateTime, humanize } from '@/utils/format';

export default function Audit() {
  const { items } = useCollection('auditLogs');
  const actions = [...new Set(items.map((l) => l.action))], entities = [...new Set(items.map((l) => l.entity))];
  return (
    <>
      <PageHeader title="Audit Logs" subtitle="Who accessed, changed, exported or administered what, and when." />
      <DataTable rows={items} pageSize={15} searchKeys={['userName', 'detail', 'ip']} exportName="audit-log" defaultSort={{ key: 'at', dir: 'desc' }} filters={[{ key: 'action', label: 'Action', options: actions }, { key: 'entity', label: 'Entity', options: entities }]}
        columns={[{ key: 'at', label: 'When', render: (l) => fmtDateTime(l.at) }, { key: 'userName', label: 'User' }, { key: 'action', label: 'Action', render: (l) => <Badge tone={['delete', 'login_failed'].includes(l.action) ? 'danger' : l.action === 'export' ? 'warning' : 'brand'}>{humanize(l.action)}</Badge> }, { key: 'entity', label: 'Entity' }, { key: 'detail', label: 'Detail' }, { key: 'ip', label: 'IP' }]} />
    </>
  );
}
