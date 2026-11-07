import { useState } from 'react';
import { CalendarDays, FileText, ListChecks, Mail, MessageCircle, Phone, User } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import { fmtDate, fmtDateTime, humanize } from '@/utils/format';

const ICON = { call: Phone, email: Mail, whatsapp: MessageCircle, meeting: CalendarDays, task: ListChecks, document: FileText, user: User };
const TYPES = ['call', 'email', 'whatsapp', 'meeting', 'task', 'document', 'user'];

export default function Timeline() {
  const { items } = useCollection('activities');
  const [type, setType] = useState('');
  const [q, setQ] = useState('');
  const rows = [...items].filter((a) => (!type || a.type === type) && (!q || (a.title + a.entityName).toLowerCase().includes(q.toLowerCase()))).sort((a, b) => new Date(b.at) - new Date(a.at)).slice(0, 60);
  const days = rows.reduce((m, a) => { const k = fmtDate(a.at); (m[k] = m[k] || []).push(a); return m; }, {});
  return (
    <>
      <PageHeader title="Unified Activity Timeline" subtitle="Calls, emails, WhatsApp, meetings, tasks, documents and user actions in chronological order." />
      <div className="mb-4 flex flex-wrap gap-2"><input className="input max-w-xs" placeholder="Search activity..." aria-label="Search" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="Type" className="input w-auto" value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{TYPES.map((t) => <option key={t} value={t}>{humanize(t)}</option>)}</select></div>
      <div className="space-y-5">{Object.entries(days).map(([day, list]) => (
        <Card key={day} title={day} bodyClass="p-0"><ul className="divide-y divide-ink-100">{list.map((a) => { const I = ICON[a.type] || User; return (
          <li key={a.id} className="flex items-start gap-3 px-4 py-3"><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-700"><I size={16} /></span>
            <div className="min-w-0 flex-1"><p className="text-sm font-medium text-ink-900">{a.title}</p><p className="text-xs text-ink-500"><Ref id={a.actorId} avatar={false} /> - {fmtDateTime(a.at)}</p></div>{a.outcome && <Badge tone="neutral">{a.outcome}</Badge>}</li>); })}</ul></Card>))}
        {!rows.length && <p className="p-8 text-center text-sm text-ink-400">No activity matches your filters.</p>}</div>
    </>
  );
}
