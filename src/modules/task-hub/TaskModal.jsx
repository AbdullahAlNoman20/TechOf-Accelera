import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import KeyValue from '@/components/ui/KeyValue';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { fmtDateTime } from '@/utils/format';

/** Task detail: notes, comments, attachments, dependencies, history and team handoff. */
export default function TaskModal({ task, onClose }) {
  const { update } = useCollection('tasks');
  const { items: users } = useCollection('users');
  const { user, canWrite } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('overview');
  const [text, setText] = useState('');
  const [file, setFile] = useState('');
  const [to, setTo] = useState('');
  const w = canWrite('taskHub');
  if (!task) return null;
  const now = () => new Date().toISOString();
  const add = async (key, entry) => { await update(task.id, { [key]: [...(task[key] || []), entry], history: [...(task.history || []), { by: user.name, text: `Added ${key.slice(0, -1)}`, at: now() }] }); setText(''); setFile(''); push('Saved'); };
  const handoff = async () => {
    if (!to) return push('Select a new owner', 'error');
    await update(task.id, { assigneeId: to, history: [...task.history, { by: user.name, text: `Handoff to ${users.find((u) => u.id === to)?.name} with full context and history`, at: now() }] });
    push('Task handed off with context and activity history'); setTo('');
  };
  const list = (key) => (task[key] || []).map((n, i) => <li key={i} className="rounded-lg bg-ink-50 p-3 text-sm"><p className="text-ink-800">{n.text || n.name}</p><p className="mt-1 text-xs text-ink-400">{n.by ? <Ref id={n.by} avatar={false} /> : n.size} {n.at && `- ${fmtDateTime(n.at)}`}</p></li>);

  return (
    <Modal open onClose={onClose} title={task.title} subtitle={`${task.id} - ${task.company}`} size="lg">
      <Tabs value={tab} onChange={setTab} tabs={['overview', 'notes', 'comments', 'attachments', 'history'].map((k) => ({ key: k, label: k[0].toUpperCase() + k.slice(1), count: Array.isArray(task[k]) ? task[k].length : undefined }))} />
      {tab === 'overview' && (
        <div className="space-y-5">
          <KeyValue items={[['Status', <StatusBadge value={task.status} />], ['Priority', <StatusBadge value={task.priority} />], ['Owner', <Ref id={task.assigneeId} />], ['Lead', `${task.leadName} (${task.leadId || '-'})`], ['Due', fmtDateTime(task.dueAt)], ['SLA first response', fmtDateTime(task.slaAt)], ['Depends on', task.dependsOn || 'No dependency']]} />
          {w && <div className="flex flex-wrap items-end gap-2 rounded-lg border border-ink-100 p-3"><div className="min-w-[200px] flex-1"><label className="mb-1 block text-xs font-semibold text-ink-600">Team handoff - new owner</label><select className="input" value={to} onChange={(e) => setTo(e.target.value)}><option value="">Select...</option>{users.filter((u) => ['sales', 'manager', 'support'].includes(u.role) && u.id !== task.assigneeId).map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div><Button variant="secondary" onClick={handoff}>Hand off</Button></div>}
        </div>
      )}
      {['notes', 'comments'].includes(tab) && (
        <div className="space-y-3"><ul className="space-y-2">{list(tab)}</ul>{!(task[tab] || []).length && <p className="text-sm text-ink-400">Nothing here yet.</p>}
          {w && <div className="flex gap-2"><input className="input" maxLength={500} placeholder={`Add ${tab.slice(0, -1)}...`} value={text} onChange={(e) => setText(e.target.value)} /><Button disabled={!text.trim()} onClick={() => add(tab, { by: user.id, text: text.trim(), at: now() })}>Add</Button></div>}</div>
      )}
      {tab === 'attachments' && (
        <div className="space-y-3"><ul className="space-y-2">{list('attachments')}</ul>{!(task.attachments || []).length && <p className="text-sm text-ink-400">No files attached.</p>}
          {w && <div className="flex gap-2"><input className="input" maxLength={120} placeholder="File name, e.g. requirements.pdf" value={file} onChange={(e) => setFile(e.target.value)} /><Button disabled={!file.trim()} onClick={() => add('attachments', { name: file.trim(), size: '120 KB' })}>Attach</Button></div>}</div>
      )}
      {tab === 'history' && <ol className="space-y-2 border-l-2 border-ink-100 pl-4">{[...(task.history || [])].reverse().map((h, i) => <li key={i} className="text-sm"><p className="text-ink-800">{h.text}</p><p className="text-xs text-ink-400">{h.by} - {fmtDateTime(h.at)}</p></li>)}</ol>}
    </Modal>
  );
}
