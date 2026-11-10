import { useState } from 'react';
import { BellPlus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import CrudTable from '@/components/data/CrudTable';
import Ref from '@/components/common/Ref';
import useToast from '@/hooks/useToast';
import { api, lookup } from '@/services/api';
import { daysFromNow, fmtDate, money } from '@/utils/format';
import useCollection from '@/hooks/useCollection';
import Modal from '@/components/ui/Modal';

const C_FIELDS = [
  { name: 'customerId', label: 'Customer', optionsFrom: 'customers', required: true }, { name: 'title', label: 'Contract title', required: true }, { name: 'start', label: 'Start', type: 'date', required: true }, { name: 'end', label: 'End', type: 'date', required: true },
  { name: 'renewalDate', label: 'Renewal date', type: 'date', required: true }, { name: 'value', label: 'Value ($)', type: 'number', min: 0, required: true }, { name: 'status', label: 'Status', type: 'select', options: ['draft', 'active', 'expiring', 'expired'], required: true }, { name: 'services', label: 'Services', type: 'tags' },
];
const D_FIELDS = [
  { name: 'customerName', label: 'Customer', required: true }, { name: 'service', label: 'Service', required: true }, { name: 'status', label: 'Status', type: 'select', options: ['in_progress', 'waiting', 'completed'], required: true },
  { name: 'progress', label: 'Progress (%)', type: 'number', min: 0, max: 100, required: true }, { name: 'ownerId', label: 'Owner', optionsFrom: 'users', optionFilter: (u) => ['operations', 'support', 'manager'].includes(u.role) }, { name: 'due', label: 'Due', type: 'date' },
];

export default function Contracts() {
  const [tab, setTab] = useState('contracts');
  const { push } = useToast();
  const { items: deliveries, update: updDel } = useCollection('deliveries');
  const [open, setOpen] = useState(null);
  const del = deliveries.find((d) => d.id === open);
  const toggle = (i) => { const checklist = del.checklist.map((c, k) => (k === i ? { ...c, done: !c.done } : c)); const p = Math.round(checklist.filter((c) => c.done).length / checklist.length * 100); updDel(del.id, { checklist, progress: p, status: p === 100 ? 'completed' : 'in_progress' }); };
  const remind = async (c) => { await api.create('followUps', { title: `Renewal discussion - ${c.customerName}`, entityName: c.customerName, dealId: null, type: 'call', dueAt: new Date(Date.now() + 7 * 864e5).toISOString(), priority: 'high', status: 'scheduled', ownerId: lookup('customers', c.customerId)?.ownerId || 'U-08', responseStatus: 'awaiting', attempt: 1 }); push('Renewal task created for the account team'); };
  return (
    <>
      <PageHeader title="Contracts & Service Delivery" subtitle="Contract validity, renewals, expiry alerts and delivery tracking." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'contracts', label: 'Contracts' }, { key: 'delivery', label: 'Service delivery' }]} />
      {tab === 'contracts' ? (
        <CrudTable collection="contracts" module="operations" noun="contract" fields={C_FIELDS} searchKeys={['customerName', 'title']} defaults={{ status: 'draft', signed: false, services: [] }} filters={[{ key: 'status', label: 'Status', options: ['draft', 'active', 'expiring', 'expired'] }]} exportName="contracts"
          transform={(v) => ({ ...v, customerName: lookup('customers', v.customerId)?.name || v.customerName })}
          columns={[{ key: 'customerName', label: 'Customer', render: (c) => <div><p className="font-medium text-ink-900">{c.customerName}</p><p className="text-xs text-ink-500">{c.title}</p></div> }, { key: 'value', label: 'Value', render: (c) => money(c.value) }, { key: 'end', label: 'Valid until', render: (c) => fmtDate(c.end) },
            { key: 'renewalDate', label: 'Renewal', render: (c) => { const d = daysFromNow(c.renewalDate); return <span>{fmtDate(c.renewalDate)} {d <= 60 && d >= 0 && <Badge tone="warning">{d}d left</Badge>}{d < 0 && <Badge tone="danger">Expired</Badge>}</span>; } }, { key: 'status', label: 'Status', render: (c) => <StatusBadge value={c.status} /> }]}
          rowActions={(c) => <Button size="icon" variant="ghost" aria-label="Create renewal task" icon={BellPlus} className="text-brand-600" onClick={() => remind(c)} />} />
      ) : (
        <CrudTable collection="deliveries" module="operations" noun="delivery" fields={D_FIELDS} searchKeys={['customerName', 'service']} defaults={{ status: 'in_progress', progress: 0 }}
          rowActions={(d) => <Button size="sm" variant="secondary" onClick={() => setOpen(d.id)}>Checklist</Button>}
          columns={[{ key: 'customerName', label: 'Customer' }, { key: 'service', label: 'Service' }, { key: 'progress', label: 'Progress', render: (d) => <div className="w-28"><ProgressBar value={d.progress} showValue /></div> }, { key: 'status', label: 'Status', render: (d) => <StatusBadge value={d.status} /> }, { key: 'ownerId', label: 'Owner', render: (d) => <Ref id={d.ownerId} /> }, { key: 'due', label: 'Due', render: (d) => fmtDate(d.due) }]} />
      )}
      <Modal open={!!del} onClose={() => setOpen(null)} title={del ? `Delivery checklist: ${del.customerName}` : ''} subtitle={del?.service} size="sm">{del && <div className="space-y-1">{(del.checklist || []).map((c, i) => <label key={c.label} className="flex items-center gap-2 py-1 text-sm text-ink-700"><input type="checkbox" className="h-4 w-4 rounded border-ink-300" checked={c.done} onChange={() => toggle(i)} />{c.label}</label>)}<ProgressBar value={del.progress} showValue /></div>}</Modal>
    </>
  );
}
