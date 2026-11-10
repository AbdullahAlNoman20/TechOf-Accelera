import { useState } from 'react';
import { Contact2, Plus, Trash2 } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import DataTable from '@/components/data/DataTable';
import Ref from '@/components/common/Ref';
import { Donut } from '@/components/charts/Charts';
import { Link } from 'react-router-dom';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { isEmail } from '@/utils/validators';
import { groupCount, money } from '@/utils/format';

const Node = ({ c, all, depth = 0 }) => (
  <li><div className="flex flex-wrap items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-ink-50" style={{ marginLeft: depth * 20 }}><span className="text-ink-300">{depth ? '└' : ''}</span><Link to={`/app/customers/${c.id}`} className="text-sm font-bold text-ink-900 hover:text-brand-700">{c.name}</Link><Badge>{c.industry}</Badge><StatusBadge value={c.status} /></div>
    {all.filter((x) => x.parentId === c.id).map((x) => <Node key={x.id} c={x} all={all} depth={depth + 1} />)}</li>
);

/** Structure view of accounts. The customer list itself lives in Customer 360°. */
export default function Accounts() {
  const { items, update } = useCollection('customers');
  const { items: users } = useCollection('users');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('hierarchy');
  const [acc, setAcc] = useState(null);
  const [c, setC] = useState({ name: '', role: '', email: '', phone: '' });
  const cur = items.find((x) => x.id === acc?.id);
  const w = canWrite('operations');
  const addContact = async () => {
    if (!c.name.trim()) return push('Contact name is required', 'error');
    if (c.email && !isEmail(c.email)) return push('Enter a valid email', 'error');
    await update(cur.id, { contacts: [...(cur.contacts || []), { ...c, primary: !(cur.contacts || []).length }] }); setC({ name: '', role: '', email: '', phone: '' });
  };
  const owners = users.filter((u) => ['sales', 'manager', 'support'].includes(u.role));
  return (
    <>
      <PageHeader title="Account Structure" />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'hierarchy', label: 'Company tree' }, { key: 'ownership', label: 'Ownership & contacts' }, { key: 'segments', label: 'Segments' }]} />
      {tab === 'hierarchy' && <Card title="Parent companies and subsidiaries" subtitle="Click a name to open the full customer profile"><ul className="space-y-0.5">{items.filter((x) => !x.parentId || !items.some((p) => p.id === x.parentId)).map((x) => <Node key={x.id} c={x} all={items} />)}</ul></Card>}
      {tab === 'ownership' && <DataTable rows={items} searchKeys={['name']} pageSize={10} columns={[{ key: 'name', label: 'Account', render: (a) => <div><p className="font-medium text-ink-900">{a.name}</p><p className="text-xs text-ink-500">{(a.contacts || []).length} contact(s)</p></div> },
        { key: 'ownerId', label: 'Account owner', render: (a) => (w ? <select aria-label={`Owner of ${a.name}`} className="input py-1 text-xs" value={a.ownerId} onChange={(e) => { update(a.id, { ownerId: e.target.value }); push('Account owner changed'); }}>{owners.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select> : <Ref id={a.ownerId} />) },
        { key: 'a', label: '', sortable: false, render: (a) => <Button size="sm" variant="secondary" icon={Contact2} onClick={() => setAcc(a)}>Contacts</Button> }]} />}
      {tab === 'segments' && <div className="grid gap-5 lg:grid-cols-3"><Card title="By tier"><Donut data={groupCount(items, 'tier')} /></Card><Card title="By industry"><Donut data={groupCount(items, 'industry')} /></Card><Card title="By size"><Donut data={groupCount(items, 'size')} /></Card><Card title="Value by tier" className="lg:col-span-3"><div className="grid gap-3 sm:grid-cols-3">{['Gold', 'Silver', 'Bronze'].map((t) => <div key={t} className="rounded-lg bg-ink-50 p-3 text-center"><p className="text-xs text-ink-500">{t}</p><p className="text-xl font-bold text-brand-800">{money(items.filter((i) => i.tier === t).reduce((s, i) => s + i.revenue, 0), true)}</p></div>)}</div></Card></div>}
      <Modal open={!!cur} onClose={() => setAcc(null)} title={cur ? `Contacts: ${cur.name}` : ''} size="md">
        {cur && <div className="space-y-4"><ul className="divide-y divide-ink-100 rounded-lg border border-ink-100">{(cur.contacts || []).map((p, i) => <li key={i} className="flex items-center justify-between gap-2 px-3 py-2"><div><p className="text-sm font-medium">{p.name} {p.primary && <Badge tone="brand">Primary</Badge>}</p><p className="text-xs text-ink-500">{p.role} - {p.email} - {p.phone}</p></div>{w && <Button size="icon" variant="ghost" aria-label="Remove contact" icon={Trash2} className="text-red-500" onClick={() => update(cur.id, { contacts: cur.contacts.filter((_, k) => k !== i) })} />}</li>)}{!(cur.contacts || []).length && <li className="p-4 text-center text-sm text-ink-400">No contacts yet</li>}</ul>
          {w && <div className="grid gap-2 sm:grid-cols-2">{['name', 'role', 'email', 'phone'].map((k) => <input key={k} className="input" aria-label={k} maxLength={120} placeholder={k[0].toUpperCase() + k.slice(1)} value={c[k]} onChange={(e) => setC({ ...c, [k]: e.target.value })} />)}<Button icon={Plus} className="sm:col-span-2" onClick={addContact}>Add contact</Button></div>}</div>}
      </Modal>
    </>
  );
}
