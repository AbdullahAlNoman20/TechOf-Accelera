import { Check, Repeat } from 'lucide-react';
import CrudPage from '@/components/data/CrudPage';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { scopeRows } from '@/utils/scope';
import { fmtDateTime, humanize } from '@/utils/format';

const isMissed = (f) => f.status === 'scheduled' && new Date(f.dueAt) < new Date();
const FIELDS = [
  { name: 'title', label: 'Follow-up', required: true, span: 2 }, { name: 'entityName', label: 'Customer / company', required: true }, { name: 'type', label: 'Channel', type: 'select', options: ['call', 'email', 'whatsapp', 'meeting'], required: true },
  { name: 'dueAt', label: 'Due (date and time zone: local)', type: 'date', required: true }, { name: 'priority', label: 'Priority', type: 'select', options: ['high', 'medium', 'low'], required: true },
  { name: 'ownerId', label: 'Owner', optionsFrom: 'users', optionFilter: (u) => ['sales', 'manager', 'support'].includes(u.role), required: true }, { name: 'responseStatus', label: 'Customer response', type: 'select', options: ['awaiting', 'replied', 'no_response'] },
];
const SUGGEST = { no_response: 'No reply: try another channel (WhatsApp or call) and share a short case study.', awaiting: 'Waiting for a reply: send a gentle reminder after 2 days.', replied: 'Customer replied: schedule the next step within 24 hours.' };

export default function FollowUps() {
  const { items, update, create } = useCollection('followUps');
  const { user, level } = useAuth();
  const { push } = useToast();
  const rows = scopeRows(items, user, level('activity')).map((f) => ({ ...f, display: isMissed(f) ? 'missed' : f.status }));
  return (
    <CrudPage collection="followUps" rows={rows} module="activity" noun="follow-up" title="Smart Follow-up Management" subtitle="Scheduled follow-ups with priority, missed-follow-up detection and no-response guidance."
      stats={() => [{ label: 'Scheduled', value: rows.filter((r) => r.display === 'scheduled').length }, { label: 'Missed', value: rows.filter((r) => r.display === 'missed').length, tone: 'danger' }, { label: 'Done', value: rows.filter((r) => r.status === 'done').length, tone: 'success' }, { label: 'No response', value: rows.filter((r) => r.responseStatus === 'no_response').length, tone: 'gold' }]}
      fields={FIELDS} searchKeys={['title', 'entityName']} filters={[{ key: 'display', label: 'State', options: ['scheduled', 'missed', 'done'] }, { key: 'priority', label: 'Priority', options: ['high', 'medium', 'low'] }]}
      defaults={{ status: 'scheduled', priority: 'medium', ownerId: user.id, responseStatus: 'awaiting', attempt: 1, dealId: null }} transform={(v) => ({ ...v, dueAt: new Date(v.dueAt).toISOString() })} defaultSort={{ key: 'dueAt', dir: 'asc' }}
      columns={[{ key: 'title', label: 'Follow-up', render: (f) => <div><p className="font-medium text-ink-900">{f.title}</p><p className="text-xs text-ink-500">{humanize(f.type)} - attempt {f.attempt}</p><p className="mt-0.5 text-xs text-teal-700">{SUGGEST[f.responseStatus]}</p></div> },
        { key: 'ownerId', label: 'Owner', render: (f) => <Ref id={f.ownerId} /> }, { key: 'dueAt', label: 'Due', render: (f) => fmtDateTime(f.dueAt) }, { key: 'priority', label: 'Priority', render: (f) => <StatusBadge value={f.priority} /> },
        { key: 'display', label: 'State', render: (f) => <StatusBadge value={f.display} /> }, { key: 'responseStatus', label: 'Response', render: (f) => <Badge>{humanize(f.responseStatus)}</Badge> }]}
      rowActions={(f) => f.status !== 'done' && <>
        <Button size="icon" variant="ghost" aria-label="Mark done" icon={Check} className="text-emerald-600" onClick={() => { update(f.id, { status: 'done' }); push('Follow-up completed'); }} />
        <Button size="icon" variant="ghost" aria-label="Schedule next follow-up" icon={Repeat} className="text-brand-600" onClick={async () => { const { id, display, ...rest } = f; await update(f.id, { status: 'done' }); await create({ ...rest, status: 'scheduled', attempt: f.attempt + 1, dueAt: new Date(Date.now() + 2 * 864e5).toISOString() }); push('Next follow-up scheduled in 2 days'); }} /></>} />
  );
}
