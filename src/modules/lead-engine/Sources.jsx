import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import StatCard from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/Badge';
import DataTable from '@/components/data/DataTable';
import { Donut } from '@/components/charts/Charts';
import { Inbox, Plug, Percent } from 'lucide-react';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { fmtDateTime, money, sum } from '@/utils/format';

export default function Sources() {
  const { items: channels, update } = useCollection('channels');
  const { items: camps } = useCollection('campaigns');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const connected = channels.filter((c) => c.status === 'connected').length;
  const toggle = (c) => { update(c.id, { status: c.status === 'connected' ? 'disconnected' : 'connected', lastSync: new Date().toISOString() }); push(`${c.name} ${c.status === 'connected' ? 'disconnected' : 'connected'}`); };

  return (
    <>
      <PageHeader title="Channels & Sources" subtitle="Every authentic lead source, its health and attribution to campaigns." />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Connected channels" value={`${connected} / ${channels.length}`} icon={Plug} />
        <StatCard label="Leads (30d)" value={sum(channels, 'leads30d')} icon={Inbox} tone="teal" />
        <StatCard label="Campaign leads" value={sum(camps, 'leads')} icon={Percent} tone="gold" hint={`${money(sum(camps, 'spend'))} spend`} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {channels.map((c) => (
          <div key={c.id} className="card p-4">
            <div className="flex items-start justify-between gap-2"><div><p className="font-semibold text-ink-900">{c.name}</p><p className="text-xs text-ink-500">{c.type}</p></div><StatusBadge value={c.status} /></div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center"><div><p className="text-lg font-bold text-brand-800">{c.leads30d}</p><p className="text-[11px] text-ink-500">Leads</p></div><div><p className="text-lg font-bold text-teal-600">{c.qualifiedRate}%</p><p className="text-[11px] text-ink-500">Qualified</p></div><div><p className="text-lg font-bold text-gold-600">{c.reliability}</p><p className="text-[11px] text-ink-500">Reliability</p></div></div>
            <div className="mt-3 flex items-center justify-between"><span className="text-xs text-ink-400">Synced {fmtDateTime(c.lastSync)}</span>{canWrite('leadEngine') && <Button size="sm" variant="secondary" onClick={() => toggle(c)}>{c.status === 'connected' ? 'Disconnect' : 'Connect'}</Button>}</div>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-3">
        <Card title="Leads by channel (30d)"><Donut data={[...channels].sort((a, b) => b.leads30d - a.leads30d).slice(0, 6).map((c) => ({ label: c.name, value: c.leads30d }))} /></Card>
        <div className="lg:col-span-2"><DataTable rows={camps} pageSize={6} searchKeys={['name', 'channel']} columns={[{ key: 'name', label: 'Campaign' }, { key: 'channel', label: 'Channel' }, { key: 'leads', label: 'Leads' }, { key: 'qualified', label: 'Qualified' }, { key: 'status', label: 'Status', render: (c) => <StatusBadge value={c.status} /> }]} /></div>
      </div>
    </>
  );
}
