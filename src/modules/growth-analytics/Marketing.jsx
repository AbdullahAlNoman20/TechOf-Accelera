import { DollarSign, Filter as FunnelIcon, Timer } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import DataTable from '@/components/data/DataTable';
import { BarChart, Funnel, HBar, LineChart } from '@/components/charts/Charts';
import useCollection from '@/hooks/useCollection';
import { StatusBadge } from '@/components/ui/Badge';
import { avg, money, sum } from '@/utils/format';

export default function Marketing() {
  const { items: camps } = useCollection('campaigns');
  const { items: trends } = useCollection('trends');
  const { items: leads } = useCollection('leads');
  const spend = sum(camps, 'spend'), ld = sum(camps, 'leads'), q = sum(camps, 'qualified'), won = sum(camps, 'won');
  const rows = camps.map((c) => ({ ...c, cpl: c.spend / Math.max(1, c.leads), cpql: c.spend / Math.max(1, c.qualified), roas: c.revenue / Math.max(1, c.spend) }));
  const byChannel = Object.entries(camps.reduce((m, c) => { m[c.channel] = (m[c.channel] || 0) + c.qualified; return m; }, {})).map(([label, value]) => ({ label: label.split(' ')[0], value }));
  return (
    <>
      <PageHeader title="Lead & Marketing Analytics" subtitle="Source and campaign performance, cost per lead, funnel conversion and revenue attribution." />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Marketing spend" value={money(spend)} icon={DollarSign} tone="gold" /><StatCard label="Cost per lead" value={money(spend / Math.max(1, ld))} icon={DollarSign} /><StatCard label="Cost per qualified lead" value={money(spend / Math.max(1, q))} icon={FunnelIcon} tone="teal" /><StatCard label="Avg response time" value={`${Math.round(avg(leads.filter((l) => l.firstResponseMin), 'firstResponseMin'))} min`} icon={Timer} tone="danger" /></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Conversion funnel"><Funnel data={[{ label: 'Leads', value: ld }, { label: 'Qualified', value: q }, { label: 'Won', value: won }]} /></Card>
        <Card title="Campaign trend" subtitle="Leads, qualified and won by month"><LineChart labels={trends.map((t) => t.month)} series={[{ name: 'Leads', data: trends.map((t) => t.leads) }, { name: 'Qualified', data: trends.map((t) => t.qualified) }, { name: 'Won', data: trends.map((t) => t.won) }]} /></Card>
        <Card title="Lead quality by source" subtitle="Share of leads that became qualified (%)"><HBar data={Object.entries(leads.reduce((m, l) => { m[l.source] = m[l.source] || [0, 0]; m[l.source][1] += 1; if (l.status === 'qualified') m[l.source][0] += 1; return m; }, {})).map(([label, [q2, t]]) => ({ label, value: Math.round((q2 / t) * 100) })).sort((a, b) => b.value - a.value).slice(0, 7)} format={(v) => `${v}%`} /></Card>
        <Card title="Channel comparison" subtitle="Qualified leads by channel"><BarChart data={byChannel} /></Card>
        <Card title="Revenue attribution" subtitle="Revenue by campaign"><BarChart data={camps.map((c) => ({ label: c.name.split(' ')[0], value: c.revenue }))} format={(v) => money(v, true)} /></Card>
      </div>
      <div className="mt-5"><DataTable rows={rows} searchKeys={['name', 'channel']} exportName="campaigns" pageSize={8} columns={[{ key: 'name', label: 'Campaign' }, { key: 'channel', label: 'Channel' }, { key: 'spend', label: 'Spend', render: (c) => money(c.spend) }, { key: 'leads', label: 'Leads' }, { key: 'qualified', label: 'Qualified' }, { key: 'cpl', label: 'CPL', render: (c) => money(c.cpl) }, { key: 'cpql', label: 'CPQL', render: (c) => money(c.cpql) }, { key: 'revenue', label: 'Revenue', render: (c) => money(c.revenue) }, { key: 'status', label: 'Status', render: (c) => <StatusBadge value={c.status} /> }]} /></div>
    </>
  );
}
