import { useParams } from 'react-router-dom';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import KeyValue from '@/components/ui/KeyValue';
import ProgressBar from '@/components/ui/ProgressBar';
import BackLink from '@/components/common/BackLink';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import { fmtDate, fmtDateTime, money } from '@/utils/format';

const List = ({ rows, empty, render }) => (rows.length ? <ul className="divide-y divide-ink-100">{rows.map(render)}</ul> : <p className="p-5 text-center text-sm text-ink-400">{empty}</p>);

export default function Customer360() {
  const { id } = useParams();
  const { items } = useCollection('customers');
  const { items: deals } = useCollection('deals');
  const { items: invoices } = useCollection('invoices');
  const { items: acts } = useCollection('activities');
  const { items: tickets } = useCollection('supportTickets');
  const { items: contracts } = useCollection('contracts');
  const { items: feedback } = useCollection('feedback');
  const c = items.find((x) => x.id === id);
  if (!c) return <p className="p-6 text-sm text-ink-500">Customer not found.</p>;
  const myDeals = deals.filter((d) => d.company === c.name && d.stage === 'won');
  const myActs = acts.filter((a) => a.entityName === c.name).slice(0, 6);
  const timeline = [{ at: c.since, t: 'Became a customer' }, ...myDeals.map((d) => ({ at: d.expectedClose, t: `Won: ${d.title}` })), ...contracts.filter((x) => x.customerId === c.id).map((x) => ({ at: x.start, t: `Contract signed: ${x.title}` })), { at: c.renewalDate, t: 'Next renewal' }].sort((a, b) => new Date(a.at) - new Date(b.at));
  return (
    <>
      <PageHeader back={<BackLink to="/app/customers/list">All customers</BackLink>} title={c.name} subtitle={`${c.industry} - ${c.city}, ${c.country} - customer since ${fmtDate(c.since)}`} actions={<StatusBadge value={c.status} />} />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="Profile" className="lg:col-span-2"><KeyValue cols={3} items={[['Account owner', <Ref id={c.ownerId} />], ['Tier', c.tier], ['Annual revenue', money(c.revenue)], ['Renewal date', fmtDate(c.renewalDate)], ['Services', (c.services || []).join(', ')], ['NPS', c.nps], ['Preferences', c.preferences]]} /></Card>
        <Card title="Health & risk"><div className="space-y-3"><div><p className="mb-1 text-xs text-ink-500">Health score</p><ProgressBar value={c.health} showValue /></div><p className="text-sm">Churn risk: <Badge tone={c.churnRisk === 'high' ? 'danger' : c.churnRisk === 'medium' ? 'gold' : 'success'}>{c.churnRisk}</Badge></p></div></Card>
        <Card title="Contacts" bodyClass="p-0"><List rows={c.contacts || []} empty="No contacts" render={(p, i) => <li key={i} className="px-4 py-2.5"><p className="text-sm font-medium">{p.name} {p.primary && <Badge tone="brand">Primary</Badge>}</p><p className="text-xs text-ink-500">{p.role} - {p.email} - {p.phone}</p></li>} /></Card>
        <Card title="Purchase history" bodyClass="p-0"><List rows={[...myDeals.map((d) => ({ id: d.id, t: d.title, v: d.value })), ...invoices.filter((i) => i.customerId === c.id && i.status === 'paid').map((i) => ({ id: i.id, t: `Invoice ${i.id}`, v: i.amount }))]} empty="No purchases yet" render={(r) => <li key={r.id} className="flex justify-between gap-2 px-4 py-2.5 text-sm"><span className="truncate">{r.t}</span><b>{money(r.v)}</b></li>} /></Card>
        <Card title="Support history" bodyClass="p-0"><List rows={tickets.filter((t) => t.customerId === c.id)} empty="No support requests" render={(t) => <li key={t.id} className="flex items-center justify-between gap-2 px-4 py-2.5"><span className="truncate text-sm">{t.subject}</span><StatusBadge value={t.status} /></li>} /></Card>
        <Card title="Communication history" bodyClass="p-0"><List rows={myActs} empty="No logged communication" render={(a) => <li key={a.id} className="px-4 py-2.5"><p className="text-sm">{a.title}</p><p className="text-xs text-ink-400">{fmtDateTime(a.at)}</p></li>} /></Card>
        <Card title="Contracts & renewals" bodyClass="p-0"><List rows={contracts.filter((x) => x.customerId === c.id)} empty="No contracts" render={(x) => <li key={x.id} className="flex items-center justify-between gap-2 px-4 py-2.5"><div><p className="text-sm">{x.title}</p><p className="text-xs text-ink-500">Renews {fmtDate(x.renewalDate)}</p></div><StatusBadge value={x.status} /></li>} /></Card>
        <Card title="Feedback" bodyClass="p-0"><List rows={feedback.filter((f) => f.customerId === c.id)} empty="No feedback" render={(f) => <li key={f.id} className="px-4 py-2.5"><p className="text-sm">{f.comment}</p><p className="text-xs text-ink-400">Score {f.score}/10 - {f.theme}</p></li>} /></Card>
        <Card title="Relationship timeline" className="lg:col-span-3"><ol className="space-y-2 border-l-2 border-ink-100 pl-4">{timeline.map((t, i) => <li key={i} className="text-sm"><span className="font-medium text-ink-800">{t.t}</span> <span className="text-xs text-ink-400">- {fmtDate(t.at)}</span></li>)}</ol></Card>
      </div>
    </>
  );
}
