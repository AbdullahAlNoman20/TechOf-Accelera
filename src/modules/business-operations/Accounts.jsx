import { useState } from 'react';
import { Contact2, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import CrudTable from '@/components/data/CrudTable';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { CUSTOMER_FIELDS, customerDefaults } from '@/modules/customer-growth/Customers';
import { isEmail } from '@/utils/validators';
import { money } from '@/utils/format';

const Node = ({ c, all, depth = 0 }) => (
  <li><div className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-50" style={{ marginLeft: depth * 20 }}><span className="text-ink-300">{depth ? '└' : ''}</span><b className="text-sm text-ink-900">{c.name}</b><Badge tone="neutral">{c.industry}</Badge><StatusBadge value={c.status} /></div>
    {all.filter((x) => x.parentId === c.id).map((x) => <Node key={x.id} c={x} all={all} depth={depth + 1} />)}</li>
);

export default function Accounts() {
  const { items, update } = useCollection('customers');
  const { user, canWrite } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('list');
  const [acc, setAcc] = useState(null);
  const [c, setC] = useState({ name: '', role: '', email: '', phone: '' });
  const cur = items.find((x) => x.id === acc?.id);
  const w = canWrite('operations');
  const addContact = async () => {
    if (!c.name.trim()) return push('Contact name is required', 'error');
    if (c.email && !isEmail(c.email)) return push('Enter a valid email', 'error');
    await update(cur.id, { contacts: [...(cur.contacts || []), { ...c, primary: !(cur.contacts || []).length }] }); setC({ name: '', role: '', email: '', phone: '' });
  };
  return (
    <>
      <PageHeader title="Accounts & Contacts" subtitle="Company accounts, ownership, hierarchy, segmentation and stakeholders." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'list', label: 'Accounts', count: items.length }, { key: 'hierarchy', label: 'Hierarchy' }]} />
      {tab === 'list' ? (
        <CrudTable collection="customers" module="operations" noun="account" fields={CUSTOMER_FIELDS} defaults={customerDefaults(user.id)} searchKeys={['name', 'industry']} exportName="accounts" filters={[{ key: 'tier', label: 'Segment (tier)', options: ['Gold', 'Silver', 'Bronze'] }, { key: 'industry', label: 'Industry', options: [...new Set(items.map((i) => i.industry))] }]}
          columns={[{ key: 'name', label: 'Account', render: (a) => <div><p className="font-medium text-ink-900">{a.name}</p><p className="text-xs text-ink-500">{a.parentId ? `Subsidiary of ${items.find((x) => x.id === a.parentId)?.name || '-'}` : 'Parent / independent'}</p></div> }, { key: 'ownerId', label: 'Owner', render: (a) => <Ref id={a.ownerId} /> }, { key: 'tier', label: 'Segment' }, { key: 'size', label: 'Size' }, { key: 'revenue', label: 'Value', render: (a) => money(a.revenue) }, { key: 'contacts', label: 'Contacts', sortable: false, render: (a) => (a.contacts || []).length }, { key: 'status', label: 'Status', render: (a) => <StatusBadge value={a.status} /> }]}
          rowActions={(a) => <Button size="icon" variant="ghost" aria-label="Manage contacts" icon={Contact2} onClick={() => setAcc(a)} />} />
      ) : <Card title="Account hierarchy" subtitle="Parent companies, subsidiaries and related businesses"><ul className="space-y-0.5">{items.filter((x) => !x.parentId || !items.some((p) => p.id === x.parentId)).map((x) => <Node key={x.id} c={x} all={items} />)}</ul></Card>}
      <Modal open={!!cur} onClose={() => setAcc(null)} title={cur ? `Contacts - ${cur.name}` : ''} size="md">
        {cur && <div className="space-y-4"><ul className="divide-y divide-ink-100 rounded-lg border border-ink-100">{(cur.contacts || []).map((p, i) => <li key={i} className="flex items-center justify-between gap-2 px-3 py-2"><div><p className="text-sm font-medium">{p.name} {p.primary && <Badge tone="brand">Primary</Badge>}</p><p className="text-xs text-ink-500">{p.role} - {p.email} - {p.phone}</p></div>{w && <Button size="icon" variant="ghost" aria-label="Remove contact" icon={Trash2} className="text-red-500" onClick={() => update(cur.id, { contacts: cur.contacts.filter((_, k) => k !== i) })} />}</li>)}{!(cur.contacts || []).length && <li className="p-4 text-center text-sm text-ink-400">No contacts yet</li>}</ul>
          {w && <div className="grid gap-2 sm:grid-cols-2">{['name', 'role', 'email', 'phone'].map((k) => <input key={k} className="input" aria-label={k} maxLength={120} placeholder={k[0].toUpperCase() + k.slice(1)} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} />)}<Button icon={Plus} className="sm:col-span-2" onClick={addContact}>Add contact</Button></div>}</div>}
      </Modal>
    </>
  );
}
