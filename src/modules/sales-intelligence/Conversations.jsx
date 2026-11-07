import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { summarize } from '@/services/ai';
import { scopeRows } from '@/utils/scope';
import { fmtDateTime, humanize } from '@/utils/format';

const CH = ['email', 'whatsapp', 'call', 'meeting'];

export default function Conversations() {
  const { items, update } = useCollection('conversations');
  const { user, level, canWrite } = useAuth();
  const { push } = useToast();
  const [ch, setCh] = useState('');
  const [sel, setSel] = useState(null);
  const [reply, setReply] = useState('');
  const rows = scopeRows(items, user, level('sales')).filter((c) => !ch || c.channel === ch);
  const cur = rows.find((c) => c.id === sel) || rows[0];

  async function send() {
    if (!reply.trim()) return;
    await update(cur.id, { messages: [...cur.messages, { sender: user.name, dir: 'out', text: reply.trim(), at: new Date().toISOString() }] });
    await api.create('activities', { type: cur.channel === 'call' ? 'call' : cur.channel, title: `Reply sent - ${cur.company}`, entityType: 'deal', entityId: cur.dealId, entityName: cur.company, actorId: user.id, at: new Date().toISOString(), outcome: 'Sent', notes: '' });
    setReply(''); push('Reply sent and logged');
  }
  return (
    <>
      <PageHeader title="Conversation Center" subtitle="Email, WhatsApp, calls and meetings for each customer in one place." actions={<select aria-label="Channel" className="input w-auto" value={ch} onChange={(e) => setCh(e.target.value)}><option value="">All channels</option>{CH.map((c) => <option key={c} value={c}>{humanize(c)}</option>)}</select>} />
      <div className="grid gap-5 lg:grid-cols-3">
        <ul className="card max-h-[72vh] divide-y divide-ink-100 overflow-y-auto">{rows.map((c) => (
          <li key={c.id}><button type="button" onClick={() => setSel(c.id)} className={`w-full px-4 py-3 text-left hover:bg-ink-50 ${cur?.id === c.id ? 'bg-brand-50' : ''}`}>
            <div className="flex items-center justify-between gap-2"><p className="truncate text-sm font-medium text-ink-900">{c.company}</p><Badge tone="brand">{c.channel}</Badge></div><p className="truncate text-xs text-ink-500">{c.subject}</p><p className="mt-1 text-[11px] text-ink-400">{c.messages.length} messages - {fmtDateTime(c.messages.at(-1)?.at)}</p></button></li>))}
          {!rows.length && <li className="p-6 text-center text-sm text-ink-400">No conversations</li>}</ul>
        {cur && (
          <div className="space-y-5 lg:col-span-2">
            <Card title={cur.subject} subtitle={`${cur.contact} - ${cur.company}`} action={<span className="text-xs text-ink-500">Owner: <Ref id={cur.ownerId} /></span>}>
              <ul className="max-h-80 space-y-3 overflow-y-auto">{cur.messages.map((m, i) => <li key={i} className={`flex ${m.dir === 'out' ? 'justify-end' : ''}`}><div className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.dir === 'out' ? 'bg-brand-800 text-white' : 'bg-ink-100 text-ink-800'}`}><p>{m.text}</p><p className={`mt-1 text-[11px] ${m.dir === 'out' ? 'text-white/60' : 'text-ink-400'}`}>{m.sender} - {fmtDateTime(m.at)}</p></div></li>)}</ul>
              {canWrite('sales') && <div className="mt-4 flex gap-2"><input className="input" maxLength={1000} placeholder="Write a reply..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} /><Button icon={Send} onClick={send}>Send</Button></div>}
            </Card>
            <div className="grid gap-5 sm:grid-cols-2">
              <Card title="AI summary" action={canWrite('sales') && <Button size="sm" variant="secondary" icon={Sparkles} onClick={() => update(cur.id, { summary: summarize(cur.messages) })}>Summarize</Button>}><p className="text-sm text-ink-600">{cur.summary || 'No summary yet. Click Summarize to generate one.'}</p></Card>
              <Card title="Customer questions & requirements"><ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">{cur.needs.map((n) => <li key={n}>{n}</li>)}</ul></Card>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
