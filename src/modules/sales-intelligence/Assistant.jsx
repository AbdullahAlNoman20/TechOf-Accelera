import { useState } from 'react';
import { Copy, Send, Sparkles } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import DataTable from '@/components/data/DataTable';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { AI_TYPES, OBJECTIONS, generate } from '@/services/ai';
import { fmtDateTime } from '@/utils/format';

export default function Assistant() {
  const { user, canWrite } = useAuth();
  const { items: deals } = useCollection('deals');
  const { items: drafts, create, update } = useCollection('aiDrafts');
  const { items: controls } = useCollection('aiControls');
  const { push } = useToast();
  const [f, setF] = useState({ dealId: '', type: 'email', tone: 'Professional', objection: OBJECTIONS[0] });
  const [text, setText] = useState('');
  const deal = deals.find((d) => d.id === f.dealId);
  const autoSend = controls.find((c) => c.name === 'Auto-send AI messages')?.enabled;
  const aiOn = controls.find((c) => c.name === 'Message drafting')?.enabled !== false;
  const w = canWrite('sales');
  const external = ['email', 'whatsapp'].includes(f.type);

  const run = () => { if (!deal) return push('Select a deal first', 'error'); if (!aiOn) return push('AI drafting is disabled by an administrator', 'error'); setText(generate({ type: f.type, deal, owner: user.name, tone: f.tone, objection: f.objection })); };
  async function save(status) {
    if (!text.trim()) return push('Generate or write content first', 'error');
    const needs = external && !autoSend && status === 'sent';
    const rec = await create({ dealId: deal.id, company: deal.company, type: f.type, content: text, status: needs ? 'pending_approval' : status, createdBy: user.id, at: new Date().toISOString() });
    if (needs) { await api.create('approvals', { type: 'ai_send', title: `Send AI ${f.type} to ${deal.company}`, requestedBy: user.name, at: new Date().toISOString(), status: 'pending', detail: `Draft ${rec.id} reviewed by employee`, amount: 0, approverRole: 'sales', draftId: rec.id }); push('Submitted for approval: AI drafts are not sent automatically', 'info'); }
    else if (status === 'sent') { await api.create('activities', { type: f.type, title: `AI-assisted ${f.type} sent - ${deal.company}`, entityType: 'deal', entityId: deal.id, entityName: deal.company, actorId: user.id, at: new Date().toISOString(), outcome: 'Sent', notes: '' }); push('Message sent and logged to the timeline'); }
    else push('Draft saved');
  }
  return (
    <>
      <PageHeader title="AI Sales Assistant" subtitle="Strategy, drafts, talking points, meeting prep and objection handling tailored to each deal." />
      <div className="mb-5 grid gap-5 lg:grid-cols-5">
        <Card title="Request" className="lg:col-span-2">
          <div className="space-y-3">
            <div><label className="mb-1 block text-xs font-semibold text-ink-600">Deal</label><select className="input" value={f.dealId} onChange={(e) => setF({ ...f, dealId: e.target.value })}><option value="">Select a deal...</option>{deals.filter((d) => !['lost'].includes(d.stage)).map((d) => <option key={d.id} value={d.id}>{d.company} ({d.stage})</option>)}</select></div>
            <div><label className="mb-1 block text-xs font-semibold text-ink-600">What do you need?</label><select className="input" value={f.type} onChange={(e) => setF({ ...f, type: e.target.value })}>{AI_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}</select></div>
            {f.type === 'objection' && <div><label className="mb-1 block text-xs font-semibold text-ink-600">Objection</label><select className="input" value={f.objection} onChange={(e) => setF({ ...f, objection: e.target.value })}>{OBJECTIONS.map((o) => <option key={o}>{o}</option>)}</select></div>}
            <div><label className="mb-1 block text-xs font-semibold text-ink-600">Tone</label><select className="input" value={f.tone} onChange={(e) => setF({ ...f, tone: e.target.value })}>{['Professional', 'Friendly', 'Concise'].map((t) => <option key={t}>{t}</option>)}</select></div>
            <Button icon={Sparkles} className="w-full" onClick={run}>Generate</Button>
          </div>
        </Card>
        <Card title="Result" subtitle="AI-generated draft. Review and edit before using." className="lg:col-span-3" action={text && <Button size="sm" variant="ghost" icon={Copy} onClick={() => { navigator.clipboard?.writeText(text); push('Copied'); }}>Copy</Button>}>
          <textarea aria-label="Generated content" className="input h-64 font-mono text-xs leading-relaxed" value={text} onChange={(e) => setText(e.target.value)} placeholder="Your draft will appear here..." maxLength={4000} />
          {w && <div className="mt-3 flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={() => save('draft')}>Save draft</Button>{external && <Button icon={Send} onClick={() => save('sent')}>{autoSend ? 'Send' : 'Submit for approval'}</Button>}</div>}
        </Card>
      </div>
      <Card title="Saved drafts" bodyClass="p-0"><DataTable rows={drafts} pageSize={5} searchKeys={['company', 'type']} defaultSort={{ key: 'at', dir: 'desc' }} columns={[{ key: 'company', label: 'Deal' }, { key: 'type', label: 'Type' }, { key: 'content', label: 'Preview', render: (d) => <span className="line-clamp-1 max-w-md text-ink-500">{d.content}</span> }, { key: 'status', label: 'Status', render: (d) => <StatusBadge value={d.status} /> }, { key: 'at', label: 'Created', render: (d) => fmtDateTime(d.at) }]} /></Card>
    </>
  );
}
