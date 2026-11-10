import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import KeyValue from '@/components/ui/KeyValue';
import DataTable from '@/components/data/DataTable';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { readiness, scoreLead, segmentFor, temperature } from '@/services/scoring';
import { humanize } from '@/utils/format';
import Preview from '@/components/ui/Preview';
import { suggestAssignee } from '@/services/assignment';

const SEGMENTS = ['qualified', 'unqualified', 'nurture', 'needs_review', 'rejected'];
const tone = (t) => (t === 'hot' ? 'danger' : t === 'warm' ? 'gold' : 'brand');

export default function Scoring() {
  const { items: leads, update } = useCollection('leads');
  const { items: rules } = useCollection('scoringRules');
  const { items: users } = useCollection('users');
  const { items: tasks } = useCollection('tasks');
  const { items: arules } = useCollection('assignmentRules');
  const { user, canWrite } = useAuth();
  const { push } = useToast();
  const [tab, setTab] = useState('priority');
  const [sel, setSel] = useState(null);
  const [override, setOverride] = useState({ segment: '', reason: '' });
  const w = canWrite('leadIntel');
  const scored = leads.filter((l) => l.status !== 'rejected');
  const queue = scored.filter((l) => l.status === 'qualified').sort((a, b) => b.score - a.score);

  async function recalc() {
    for (const l of scored) { const s = scoreLead(l, rules); await update(l.id, { score: s, temperature: temperature(s) }); }
    push(`Recalculated ${scored.length} scores using ${rules.filter((r) => r.active).length} active rules`);
  }
  async function applyOverride() {
    if (!override.segment) return push('Choose a segment', 'error');
    if (override.reason.trim().length < 5) return push('A reason is required for overrides', 'error');
    await update(sel.id, { status: override.segment, overrides: [...(sel.overrides || []), { by: user.name, from: sel.status, to: override.segment, reason: override.reason, at: new Date().toISOString() }] });
    push('Override saved and added to learning feedback'); setSel(null); setOverride({ segment: '', reason: '' });
  }
  const cols = [
    { key: 'name', label: 'Lead', render: (l) => <div><p className="font-medium text-ink-900">{l.name}</p><p className="text-xs text-ink-500">{l.company}</p></div> },
    { key: 'score', label: 'Score', render: (l) => <div className="w-28"><ProgressBar value={l.score} tone={tone(l.temperature)} showValue /></div> },
    { key: 'temperature', label: 'Class', render: (l) => <Badge tone={tone(l.temperature)}>{humanize(l.temperature)}</Badge> },
    { key: 'fit', label: 'Fit' }, { key: 'intent', label: 'Intent' }, { key: 'engagement', label: 'Engagement' },
    { key: 'bant', label: 'BANT', sortable: false, render: (l) => <span className="font-mono text-xs"><b className={l.budget === 'likely' ? 'text-emerald-600' : 'text-ink-300'}>B</b><b className={l.authority === 'decision-maker' ? 'text-emerald-600' : 'text-ink-300'}>A</b><b className="text-emerald-600">N</b><b className={l.timeline !== 'unknown' ? 'text-emerald-600' : 'text-ink-300'}>T</b></span> },
    { key: 'status', label: 'Segment', render: (l) => <StatusBadge value={l.status} /> },
  ];
  return (
    <>
      <PageHeader title="Lead Scoring & Priority Queue" subtitle="AI scores support decisions. Authorized users can override any classification with a recorded reason." actions={w && <Button icon={RefreshCw} onClick={recalc}>Recalculate scores<Preview /></Button>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'priority', label: 'Priority queue', count: queue.length }, { key: 'all', label: 'All scored leads', count: scored.length }]} />
      <DataTable rows={tab === 'priority' ? queue : scored} columns={cols} searchKeys={['name', 'company']} onRowClick={setSel} defaultSort={{ key: 'score', dir: 'desc' }} exportName="lead-scores" />
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel ? `${sel.name} - ${sel.company}` : ''} subtitle="Score breakdown and readiness" size="lg"
        footer={w && <><Button variant="secondary" onClick={() => setSel(null)}>Close</Button><Button onClick={applyOverride}>Save override</Button></>}>
        {sel && (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-3">{[['Business fit', sel.fit], ['Buying intent', sel.intent], ['Engagement', sel.engagement]].map(([k, v]) => <div key={k}><p className="mb-1 text-xs font-medium text-ink-500">{k}</p><ProgressBar value={v} showValue /></div>)}</div>
            <KeyValue cols={3} items={[['Score', `${sel.score} (${humanize(sel.temperature)})`], ['Readiness', readiness(sel)], ['Suggested segment', humanize(segmentFor(sel.score, sel))], ['Need', sel.need], ['Budget signal', `${humanize(sel.budget)} (estimate, not confirmed)`], ['Authority', humanize(sel.authority)], ['Timeline', humanize(sel.timeline)], ['Source', sel.source], ['Current segment', humanize(sel.status)], ['Best person for this lead', (() => { const r = suggestAssignee(sel, users, tasks, arules); return r.user ? `${r.user.name} (${r.rule ? r.rule.name : 'least busy'})` : '-'; })()], ['Priority for assignment', sel.temperature === 'hot' ? 'Urgent' : sel.temperature === 'warm' ? 'Normal' : 'Low']]} />
            {w && <div className="grid gap-3 sm:grid-cols-3"><div><label className="mb-1 block text-xs font-semibold text-ink-600">Override segment</label><select className="input" value={override.segment} onChange={(e) => setOverride({ ...override, segment: e.target.value })}><option value="">Select...</option>{SEGMENTS.map((s) => <option key={s} value={s}>{humanize(s)}</option>)}</select></div>
              <div className="sm:col-span-2"><label className="mb-1 block text-xs font-semibold text-ink-600">Reason (required)</label><input className="input" maxLength={300} value={override.reason} onChange={(e) => setOverride({ ...override, reason: e.target.value })} placeholder="Why is the AI result being changed?" /></div></div>}
            {(sel.overrides || []).length > 0 && <div><p className="mb-1 text-xs font-semibold uppercase text-ink-400">Override history</p><ul className="space-y-1 text-sm text-ink-600">{sel.overrides.map((o, i) => <li key={i}>{o.by}: {humanize(o.from)} to {humanize(o.to)} - {o.reason}</li>)}</ul></div>}
          </div>
        )}
      </Modal>
    </>
  );
}
