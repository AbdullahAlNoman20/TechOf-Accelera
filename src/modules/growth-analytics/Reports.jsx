import { useState } from 'react';
import { Eye, Printer } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import Logo from '@/components/common/Logo';
import useCollection from '@/hooks/useCollection';
import { BRAND } from '@/config/brand';
import { fmtDateTime, humanize, money, pct, sum } from '@/utils/format';

const FIELDS = [
  { name: 'name', label: 'Report name', required: true, span: 2 }, { name: 'type', label: 'Type', type: 'select', options: ['daily', 'weekly', 'monthly', 'custom'], required: true }, { name: 'format', label: 'Format', type: 'select', options: ['PDF', 'Excel'] },
  { name: 'schedule', label: 'Schedule', required: true, placeholder: 'e.g. Monday 09:00' }, { name: 'recipients', label: 'Recipients', required: true, help: 'Only authorized users receive reports' }, { name: 'active', label: 'Delivery', type: 'checkbox', checkLabel: 'Scheduled delivery is on' },
];

export default function Reports() {
  const [tab, setTab] = useState('reports');
  const [view, setView] = useState(null);
  const { items: leads } = useCollection('leads');
  const { items: deals } = useCollection('deals');
  const { items: tasks } = useCollection('tasks');
  const { items: customers } = useCollection('customers');
  const { items: trends } = useCollection('trends');
  const won = deals.filter((d) => d.stage === 'won'), open = deals.filter((d) => !['won', 'lost'].includes(d.stage));
  const last = trends.at(-1), prev = trends.slice(0, -1);
  const alerts = [
    ...(last && prev.length && last.leads < (sum(prev, 'leads') / prev.length) * 0.5 ? [{ id: 'a1', tone: 'warning', title: 'Anomaly: lead volume', text: `${last.month} so far is well below the monthly average. This may be a partial month; check campaign status.` }] : []),
    ...(tasks.filter((t) => t.status === 'escalated').length ? [{ id: 'a2', tone: 'danger', title: 'Performance alert: escalated tasks', text: `${tasks.filter((t) => t.status === 'escalated').length} task(s) escalated after SLA breach.` }] : []),
    ...(customers.filter((c) => c.health < 45).length ? [{ id: 'a3', tone: 'danger', title: 'Customer health alert', text: `${customers.filter((c) => c.health < 45).length} customer(s) with critical health.` }] : []),
    { id: 'a4', tone: 'brand', title: 'Target check', text: `Qualified rate is ${pct((leads.filter((l) => l.status === 'qualified').length / Math.max(1, leads.length)) * 100)}. Threshold: 30%.` },
  ];
  const metrics = view && [['Leads collected', leads.length], ['Qualified leads', leads.filter((l) => l.status === 'qualified').length], ['Open pipeline', money(sum(open, 'value'))], ['Won revenue', money(sum(won, 'value'))], ['Tasks overdue', tasks.filter((t) => t.status !== 'completed' && new Date(t.dueAt) < new Date()).length], ['Customers at risk', customers.filter((c) => c.status === 'at_risk').length]];
  return (
    <>
      <PageHeader title="Reports & Alerts" subtitle="Daily, weekly, monthly and custom reports with scheduled delivery, plus anomaly and performance alerts." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'reports', label: 'Reports' }, { key: 'alerts', label: 'Alerts', count: alerts.length }]} />
      {tab === 'reports' ? (
        <CrudTable collection="reports" module="analytics" noun="report" fields={FIELDS} defaults={{ active: true, format: 'PDF', type: 'weekly', ownerId: 'U-09' }} searchKeys={['name', 'recipients']}
          columns={[{ key: 'name', label: 'Report' }, { key: 'type', label: 'Type', render: (r) => <Badge tone="brand">{humanize(r.type)}</Badge> }, { key: 'schedule', label: 'Schedule' }, { key: 'recipients', label: 'Recipients' }, { key: 'format', label: 'Format' }, { key: 'lastRun', label: 'Last run', render: (r) => fmtDateTime(r.lastRun) }, { key: 'active', label: 'Delivery', render: (r) => <StatusBadge value={r.active ? 'active' : 'paused'} /> }]}
          rowActions={(r) => <Button size="sm" variant="secondary" icon={Eye} onClick={() => setView(r)}>Generate</Button>} />
      ) : (
        <div className="grid gap-3">{alerts.map((a) => <Card key={a.id}><div className="flex items-start gap-3"><Badge tone={a.tone}>{a.tone === 'danger' ? 'Critical' : a.tone === 'warning' ? 'Warning' : 'Info'}</Badge><div><p className="text-sm font-semibold text-ink-900">{a.title}</p><p className="text-sm text-ink-600">{a.text}</p></div></div></Card>)}</div>
      )}
      <Modal open={!!view} onClose={() => setView(null)} title={view?.name} subtitle="Generated now from current data" size="lg" footer={<><Button variant="secondary" onClick={() => setView(null)}>Close</Button><Button icon={Printer} onClick={() => window.print()}>Print / Save PDF</Button></>}>
        {view && <div className="print-area"><div className="mb-4 flex items-center gap-3 border-b-4 border-gold-500 pb-3"><Logo size={44} /><div><p className="font-bold text-brand-800">{BRAND.company}</p><p className="text-xs text-ink-500">{view.name} - {new Date().toLocaleDateString('en-GB')}</p></div></div>
          <div className="grid gap-3 sm:grid-cols-3">{metrics.map(([k, v]) => <div key={k} className="rounded-lg border border-ink-100 p-3"><p className="text-xs text-ink-500">{k}</p><p className="text-xl font-bold text-ink-900">{v}</p></div>)}</div></div>}
      </Modal>
    </>
  );
}
