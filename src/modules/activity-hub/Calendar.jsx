import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Sparkles } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import FormModal from '@/components/data/FormModal';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { fmtDateTime, humanize } from '@/utils/format';

const FIELDS = [
  { name: 'title', label: 'Meeting title', required: true, span: 2 }, { name: 'type', label: 'Type', type: 'select', options: ['meeting', 'demo', 'consultation', 'internal'], required: true }, { name: 'withName', label: 'With (contact)' },
  { name: 'start', label: 'Start', type: 'datetime-local', required: true }, { name: 'duration', label: 'Duration (min)', type: 'number', min: 15, max: 480, required: true },
  { name: 'ownerId', label: 'Owner', optionsFrom: 'users', optionFilter: (u) => ['sales', 'manager', 'support', 'operations'].includes(u.role), required: true }, { name: 'agenda', label: 'Agenda', type: 'textarea' }, { name: 'notes', label: 'Meeting notes', type: 'textarea' },
];
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const toLocal = (iso) => { const d = new Date(iso); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 16); };

export default function Calendar() {
  const { items: meetings, create, update } = useCollection('meetings');
  const { items: fus } = useCollection('followUps');
  const { user, canWrite } = useAuth();
  const { push } = useToast();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [day, setDay] = useState(new Date());
  const [edit, setEdit] = useState(null);
  const w = canWrite('activity');
  const first = (month.getDay() + 6) % 7, count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells = [...Array(first).fill(null), ...Array.from({ length: count }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1))];
  const same = (a, b) => new Date(a).toDateString() === new Date(b).toDateString();
  const dayMeet = meetings.filter((m) => same(m.start, day)).sort((a, b) => new Date(a.start) - new Date(b.start));
  const dayFu = fus.filter((f) => f.status === 'scheduled' && same(f.dueAt, day));

  async function save(v) {
    const s = new Date(v.start).getTime(), e = s + v.duration * 6e4;
    const clash = meetings.find((m) => m.id !== edit?.id && m.ownerId === v.ownerId && m.status !== 'completed' && s < new Date(m.start).getTime() + m.duration * 6e4 && e > new Date(m.start).getTime());
    if (clash) return push(`Time conflict with "${clash.title}". Choose another slot.`, 'error');
    const payload = { ...v, start: new Date(v.start).toISOString() };
    if (edit?.id) { await update(edit.id, payload); push('Meeting rescheduled: calendar and reminders updated'); } else { await create({ ...payload, status: 'scheduled', link: 'https://meet.example.com/new' }); push('Meeting scheduled and synced to calendar'); }
    setEdit(null);
  }
  const summarize = (m) => update(m.id, { summary: `Summary: ${m.title}. ${m.notes || 'Discussed requirements, timeline and next steps.'} Next action: send proposal and confirm decision date.`, status: 'completed' });

  return (
    <>
      <PageHeader title="Calendar & Meetings" subtitle="Schedule meetings, avoid conflicts, and generate agendas and AI summaries." actions={w && <Button icon={Plus} onClick={() => setEdit({ ownerId: user.id, duration: 30, type: 'meeting', start: toLocal(new Date(day.getTime() + 36e5)) })}>Schedule meeting</Button>} />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2" title={month.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })} action={<div className="flex gap-1"><Button size="icon" variant="ghost" aria-label="Previous month" icon={ChevronLeft} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} /><Button size="icon" variant="ghost" aria-label="Next month" icon={ChevronRight} onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} /></div>}>
          <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold text-ink-400">{DAYS.map((d) => <div key={d}>{d}</div>)}</div>
          <div className="mt-1 grid grid-cols-7 gap-1">{cells.map((c, i) => c ? (
            <button key={i} type="button" onClick={() => setDay(c)} className={`min-h-[64px] rounded-lg border p-1.5 text-left text-xs transition ${same(c, day) ? 'border-brand-600 bg-brand-50' : 'border-ink-100 hover:bg-ink-50'} ${same(c, new Date()) ? 'ring-1 ring-gold-500' : ''}`}>
              <span className="font-semibold text-ink-700">{c.getDate()}</span>
              {meetings.filter((m) => same(m.start, c)).slice(0, 2).map((m) => <span key={m.id} className="mt-0.5 block truncate rounded bg-brand-800 px-1 text-[10px] text-white">{m.title.split(' - ')[0]}</span>)}
            </button>) : <div key={i} />)}</div>
        </Card>
        <div className="space-y-5">
          <Card title={day.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })} bodyClass="p-0">
            <ul className="divide-y divide-ink-100">{dayMeet.map((m) => (
              <li key={m.id} className="space-y-1 px-4 py-3"><div className="flex items-start justify-between gap-2"><p className="text-sm font-medium text-ink-900">{m.title}</p><StatusBadge value={m.status} /></div>
                <p className="text-xs text-ink-500">{fmtDateTime(m.start)} - {m.duration} min - <Ref id={m.ownerId} avatar={false} /></p>
                {m.summary && <p className="rounded bg-teal-50 p-2 text-xs text-teal-800">{m.summary}</p>}
                {w && <div className="flex gap-1.5 pt-1"><Button size="sm" variant="secondary" onClick={() => setEdit({ ...m, start: toLocal(m.start) })}>Reschedule</Button>{m.status !== 'completed' && <Button size="sm" variant="ghost" icon={Sparkles} onClick={() => summarize(m)}>Complete + AI summary</Button>}</div>}
              </li>))}
              {dayFu.map((f) => <li key={f.id} className="flex items-center justify-between px-4 py-2.5"><span className="text-sm text-ink-700">{f.title}</span><Badge tone="gold">Follow-up</Badge></li>)}
              {!dayMeet.length && !dayFu.length && <li className="p-6 text-center text-sm text-ink-400">Nothing scheduled</li>}</ul>
          </Card>
        </div>
      </div>
      <FormModal open={!!edit} onClose={() => setEdit(null)} title={edit?.id ? 'Reschedule / edit meeting' : 'Schedule meeting'} fields={FIELDS} initial={edit || {}} onSubmit={save} subtitle="Availability is checked against the owner's calendar" />
    </>
  );
}
