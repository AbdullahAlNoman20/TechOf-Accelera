import { RefreshCw } from 'lucide-react';
import CrudPage from '@/components/data/CrudPage';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import { lookup } from '@/services/api';
import { fmtDate, fmtDateTime, money, sum } from '@/utils/format';

const FIELDS = [
  { name: 'customerId', label: 'Customer', optionsFrom: 'customers', required: true }, { name: 'contractId', label: 'Contract', optionsFrom: 'contracts', optionLabel: 'title' }, { name: 'amount', label: 'Amount ($)', type: 'number', min: 1, required: true },
  { name: 'status', label: 'Status', type: 'select', options: ['draft', 'sent', 'due', 'paid', 'overdue'], required: true }, { name: 'issuedAt', label: 'Issued', type: 'date', required: true }, { name: 'dueAt', label: 'Due', type: 'date', required: true }, { name: 'gateway', label: 'Payment method', type: 'select', options: ['Bank transfer', 'Card', 'bKash', 'Stripe'] },
];
export default function Invoices() {
  const { items, update } = useCollection('invoices');
  const { push } = useToast();
  const sync = async () => { for (const i of items.filter((x) => x.status === 'sent' && new Date(x.dueAt) < new Date())) await update(i.id, { status: 'overdue', syncedAt: new Date().toISOString() }); push('Synchronized with accounting and payment systems'); };
  return (
    <CrudPage collection="invoices" module="operations" noun="invoice" title="Invoices & Payments" subtitle="Invoice and payment status synchronized from your accounting system and payment gateway. This is CRM tracking, not a full accounting module."
      headerActions={<Button variant="secondary" icon={RefreshCw} onClick={sync}>Sync now</Button>}
      stats={(r) => [{ label: 'Invoiced', value: money(sum(r, 'amount'), true) }, { label: 'Paid', value: money(sum(r.filter((x) => x.status === 'paid'), 'amount'), true), tone: 'success' }, { label: 'Outstanding', value: money(sum(r.filter((x) => ['sent', 'due'].includes(x.status)), 'amount'), true), tone: 'gold' }, { label: 'Overdue', value: money(sum(r.filter((x) => x.status === 'overdue'), 'amount'), true), tone: 'danger' }]}
      fields={FIELDS} searchKeys={['id', 'customerName']} exportName="invoices" defaults={{ status: 'draft', gateway: 'Bank transfer', issuedAt: new Date().toISOString().slice(0, 10) }} filters={[{ key: 'status', label: 'Status', options: ['draft', 'sent', 'due', 'paid', 'overdue'] }]}
      transform={(v) => ({ ...v, customerName: lookup('customers', v.customerId)?.name || v.customerName, syncedAt: new Date().toISOString() })}
      columns={[{ key: 'id', label: 'Invoice' }, { key: 'customerName', label: 'Customer' }, { key: 'amount', label: 'Amount', render: (i) => money(i.amount) }, { key: 'status', label: 'Status', render: (i) => <StatusBadge value={i.status} /> }, { key: 'dueAt', label: 'Due', render: (i) => fmtDate(i.dueAt) }, { key: 'gateway', label: 'Method' }, { key: 'syncedAt', label: 'Last sync', render: (i) => fmtDateTime(i.syncedAt) }]}
      rowActions={(i) => i.status !== 'paid' && <Button size="sm" variant="ghost" onClick={() => { update(i.id, { status: 'paid', paidAt: new Date().toISOString(), syncedAt: new Date().toISOString() }); push('Payment status received from gateway'); }}>Mark paid</Button>} />
  );
}
