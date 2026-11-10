import { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import Preview from '@/components/ui/Preview';
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
  const [call, setCall] = useState(null);
  const [timeline, setTimeline] = useState(false);
  const { items: acts } = useCollection('activities');
  const rows = scopeRows(items, user, level('sales')).filter((c) => !ch || c.channel === ch);
  const cur = rows.find((c) => c.id === sel) || rows[0];

  async function send() {
    if (!reply.trim()) return;
    await update(cur.id, { messages: [...cur.messages, { sender: user.name, dir: 'out', text: reply.trim(), at: new Date().toISOString() }] });
    await api.create('activities', { type: cur.channel === 'call' ? 'call' : cur.channel, title: `Reply sent - ${cur.company}`, entityType: 'deal', entityId: cur.dealId, entityName: cur.company, actorId: user.id, at: new Date().toISOString(), outcome: 'Sent', notes: '' });
    setReply(''); push('Reply sent and logged');
  }
  async function logCall() {
    if (!call.minutes || Number(call.minutes) < 1) return push('Enter the call length in minutes', 'error');
    await update(cur.id, { messages: [...cur.messages, { sender: user.name, dir: 'out', text: `Call (${call.minutes} min), outcome: ${call.outcome}. ${call.notes}`.trim(), at: new Date().toISOString() }] });
    await api.create('activities', { type: 'call', title: `Call logged - ${cur.company}`, entityType: 'deal', entityId: cur.dealId, entityName: cur.company, actorId: user.id, at: new Date().toISOString(), outcome: call.outcome, notes: call.notes });
    setCall(null); push('Call logged');
  }
  const together = cur ? [...cur.messages.map((m) => ({ at: m.at, t: `${cur.channel}: ${m.text}`, by: m.sender })), ...acts.filter((a) => a.entityName === cur.company).map((a) => ({ at: a.at, t: a.title, by: a.outcome }))].sort((a, b) => new Date(b.at) - new Date(a.at)) : [];
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
              {canWrite('sales') && <div className="mt-4 flex flex-wrap gap-2"><Button variant="secondary" onClick={() => setCall({ minutes: '', outcome: 'Connected', notes: '' })}>Log a call</Button><Button variant="ghost" onClick={() => setTimeline(true)}>Full timeline</Button><input className="input" maxLength={1000} placeholder="Write a reply..." value={reply} onChange={(e) => setReply(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} /><Button icon={Send} onClick={send}>Send</Button></div>}
            </Card>
            <div className="grid gap-5 sm:grid-cols-2">
              <Card title="AI summary" action={canWrite('sales') && <Button size="sm" variant="secondary" icon={Sparkles} onClick={() => update(cur.id, { summary: summarize(cur.messages) })}>Summarize<Preview /></Button>}><p className="text-sm text-ink-600">{cur.summary || 'No summary yet. Click Summarize to generate one.'}</p></Card>
              <Card title="Customer questions & requirements"><ul className="list-disc space-y-1 pl-5 text-sm text-ink-700">{cur.needs.map((n) => <li key={n}>{n}</li>)}</ul></Card>
            </div>
          </div>
        )}
      </div>
      <Modal open={!!call} onClose={() => setCall(null)} title="Log a call" subtitle={cur?.company} size="sm" footer={<><Button variant="secondary" onClick={() => setCall(null)}>Cancel</Button><Button onClick={logCall}>Save call</Button></>}>{call && <div className="space-y-3"><div><label className="mb-1 block text-xs font-semibold text-ink-600">Call length (minutes)</label><input type="number" min="1" className="input" value={call.minutes} onChange={(e) => setCall({ ...call, minutes: e.target.value })} /></div><div><label className="mb-1 block text-xs font-semibold text-ink-600">Outcome</label><select className="input" value={call.outcome} onChange={(e) => setCall({ ...call, outcome: e.target.value })}>{['Connected', 'No answer', 'Interested', 'Needs follow-up', 'Not interested'].map((o) => <option key={o}>{o}</option>)}</select></div><div><label className="mb-1 block text-xs font-semibold text-ink-600">Notes</label><textarea className="input" rows={3} maxLength={500} value={call.notes} onChange={(e) => setCall({ ...call, notes: e.target.value })} /></div></div>}</Modal>
      <Modal open={timeline} onClose={() => setTimeline(false)} title="Conversation timeline" subtitle={cur ? `${cur.company}: all channels, newest first` : ''} size="md"><ol className="space-y-2 border-l-2 border-ink-100 pl-4">{together.map((t, i) => <li key={i} className="text-sm"><p className="text-ink-800">{t.t}</p><p className="text-xs text-ink-400">{t.by} - {fmtDateTime(t.at)}</p></li>)}</ol></Modal>
    </>
  );
}
