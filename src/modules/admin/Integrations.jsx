import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import DataTable from '@/components/data/DataTable';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import { fmtDateTime } from '@/utils/format';

const FIELDS = [
  { name: 'name', label: 'Integration', required: true, span: 2 }, { name: 'category', label: 'Category', type: 'select', options: ['Email', 'Messaging', 'Advertising', 'Calendar', 'E-signature', 'Accounting', 'Payment', 'ERP', 'Webhook', 'Telephony'], required: true },
  { name: 'status', label: 'Connection', type: 'select', options: ['connected', 'disconnected', 'error'], required: true }, { name: 'scope', label: 'Access scope', type: 'select', options: ['read', 'read, write', 'read, write, webhook'], required: true }, { name: 'owner', label: 'Owner' },
];
export default function Integrations() {
  const [tab, setTab] = useState('registry');
  const { items, update } = useCollection('integrations');
  const { items: hooks } = useCollection('webhooks');
  const { items: logs } = useCollection('syncLogs');
  const { push } = useToast();
  const fix = (i) => { update(i.id, { status: 'connected', credential: 'valid', errors24h: 0, lastSync: new Date().toISOString() }); push(`${i.name} re-authorized and reconnected`); };
  return (
    <>
      <PageHeader title="Integration Governance" subtitle="Registry, connection status, credentials, webhooks, sync history and retry for every connected system." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'registry', label: 'Registry', count: items.length }, { key: 'webhooks', label: 'Webhooks' }, { key: 'logs', label: 'Sync logs' }]} />
      {tab === 'registry' && <CrudTable collection="integrations" module="admin" noun="integration" fields={FIELDS} searchKeys={['name', 'category']} defaults={{ status: 'disconnected', scope: 'read', credential: 'valid', errors24h: 0, success: 100, rateLimit: '100 req/min', owner: 'Nusrat Jahan', lastSync: new Date().toISOString() }} filters={[{ key: 'status', label: 'Status', options: ['connected', 'disconnected', 'error'] }]}
        columns={[{ key: 'name', label: 'Integration', render: (i) => <div><p className="font-medium text-ink-900">{i.name}</p><p className="text-xs text-ink-500">{i.category} - scope: {i.scope}</p></div> }, { key: 'status', label: 'Status', render: (i) => <StatusBadge value={i.status} /> }, { key: 'credential', label: 'Credentials', render: (i) => <Badge tone={i.credential === 'valid' ? 'success' : 'danger'}>{i.credential}</Badge> }, { key: 'rateLimit', label: 'Rate limit' }, { key: 'errors24h', label: 'Errors (24h)' }, { key: 'lastSync', label: 'Last sync', render: (i) => fmtDateTime(i.lastSync) }]}
        rowActions={(i) => <>{i.status !== 'connected' && <Button size="sm" variant="secondary" icon={RefreshCw} onClick={() => fix(i)}>{i.status === 'error' ? 'Re-authorize' : 'Connect'}</Button>}{i.status === 'connected' && <Button size="sm" variant="ghost" onClick={() => { update(i.id, { credential: 'valid', lastSync: new Date().toISOString() }); push('Credentials rotated'); }}>Rotate keys</Button>}</>} />}
      {tab === 'webhooks' && <DataTable rows={hooks} columns={[{ key: 'integration', label: 'Integration' }, { key: 'event', label: 'Event', render: (h) => <code className="text-xs">{h.event}</code> }, { key: 'direction', label: 'Direction' }, { key: 'lastDelivery', label: 'Last delivery', render: (h) => fmtDateTime(h.lastDelivery) }, { key: 'successRate', label: 'Success', render: (h) => `${h.successRate}%` }, { key: 'status', label: 'Status', render: (h) => <StatusBadge value={h.status} /> }]} />}
      {tab === 'logs' && <DataTable rows={logs} pageSize={10} searchKeys={['integration', 'message']} defaultSort={{ key: 'at', dir: 'desc' }} filters={[{ key: 'status', label: 'Result', options: ['success', 'failed'] }]} columns={[{ key: 'at', label: 'When', render: (l) => fmtDateTime(l.at) }, { key: 'integration', label: 'Integration' }, { key: 'direction', label: 'Direction' }, { key: 'records', label: 'Records' }, { key: 'status', label: 'Result', render: (l) => <StatusBadge value={l.status} /> }, { key: 'message', label: 'Message' }]} />}
    </>
  );
}
