import { useState } from 'react';
import { Play } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import DataTable from '@/components/data/DataTable';
import { BarChart } from '@/components/charts/Charts';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import { api } from '@/services/api';
import { fmtDateTime, groupCount } from '@/utils/format';

const SOURCES = ['Public business directories', 'Company websites', 'Authorized data provider'];
const FIELDS = [
  { name: 'name', label: 'Search name', required: true, span: 2 }, { name: 'niche', label: 'Niche / service need', required: true },
  { name: 'industry', label: 'Industry', required: true }, { name: 'country', label: 'Country', required: true }, { name: 'city', label: 'City' },
  { name: 'companySize', label: 'Company size', type: 'select', options: ['1-10', '11-50', '51-200', '201-500', '500+'] },
  { name: 'decisionMaker', label: 'Decision-makers to find', placeholder: 'Owner, CEO, Manager', span: 2 },
  { name: 'sources', label: 'Sources', type: 'tags', placeholder: SOURCES.join(', '), span: 2, help: 'Only approved public or licensed sources are used.' },
  { name: 'schedule', label: 'Schedule', type: 'select', options: ['manual', 'daily', 'weekly'], required: true }, { name: 'status', label: 'Status', type: 'select', options: ['active', 'paused'], required: true },
];
const FIRST = ['Hasan', 'Mitu', 'Rubel', 'Nabila', 'Arif', 'Sohana', 'Faisal', 'Tania'], LAST = ['Sheikh', 'Talukder', 'Miah', 'Sarker', 'Das', 'Molla'], SUFFIX = ['Group', 'Industries', 'Solutions', 'Trading', 'Holdings', 'Services'];
const pick = (a) => a[Math.floor(Math.random() * a.length)];

export default function Discovery() {
  const { items: searches, update } = useCollection('discoverySearches');
  const { items: runs } = useCollection('discoveryRuns');
  const { push } = useToast();
  const [tab, setTab] = useState('searches');
  const [running, setRunning] = useState(null);

  async function run(s) {
    setRunning(s.id);
    const found = 6 + Math.floor(Math.random() * 10), fresh = Math.max(2, found - 3);
    for (let i = 0; i < Math.min(fresh, 4); i += 1) {
      const nm = `${pick(FIRST)} ${pick(LAST)}`;
      await api.create('leads', { name: nm, title: 'Owner', company: `${pick(LAST)} ${pick(SUFFIX)}`, industry: s.industry, companySize: s.companySize || '11-50', email: `${nm.split(' ')[0].toLowerCase()}@example.com`, phone: '', country: s.country, city: s.city || '', source: 'AI Discovery', campaign: s.name, status: 'new', processing: 'collected', score: 50, temperature: 'warm', fit: 70, intent: 40, engagement: 20, budget: 'unknown', authority: 'decision-maker', timeline: 'unknown', need: s.niche, ownerId: null, firstResponseMin: null, overrides: [], notes: '', outcome: null, checks: { email: 'unverified', phone: 'unverified', company: 'unverified', duplicate: false, spam: false }, duplicateOf: null });
    }
    await api.create('discoveryRuns', { searchId: s.id, searchName: s.name, runAt: new Date().toISOString(), source: (s.sources || [])[0] || SOURCES[0], found, newLeads: Math.min(fresh, 4), duplicates: found - fresh, status: 'success' });
    await update(s.id, { lastRun: new Date().toISOString(), found: (s.found || 0) + found });
    setRunning(null);
    push(`${Math.min(fresh, 4)} new prospects added to the Lead Inbox`);
  }

  const bySource = Object.entries(runs.reduce((m, r) => { m[r.source] = m[r.source] || { ok: 0, fail: 0 }; r.status === 'failed' ? (m[r.source].fail += 1) : (m[r.source].ok += 1); return m; }, {})).map(([source, v]) => ({ id: source, source, ...v, rate: Math.round((v.ok / (v.ok + v.fail)) * 100) }));

  return (
    <>
      <PageHeader title="AI Lead Discovery" subtitle="Define your Ideal Customer Profile once; Accelera searches approved sources on a schedule and sends prospects to the Lead Inbox." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'searches', label: 'Saved searches', count: searches.length }, { key: 'history', label: 'Discovery history', count: runs.length }, { key: 'coverage', label: 'Source coverage' }]} />
      {tab === 'searches' && (
        <CrudTable collection="discoverySearches" module="leadEngine" noun="search" createLabel="New saved search" fields={FIELDS} searchKeys={['name', 'niche', 'industry', 'country']} defaults={{ schedule: 'weekly', status: 'active', sources: [SOURCES[0]], found: 0 }}
          columns={[
            { key: 'name', label: 'Search', render: (s) => <div><p className="font-medium text-ink-900">{s.name}</p><p className="text-xs text-ink-500">{s.niche}</p></div> },
            { key: 'industry', label: 'Target', render: (s) => `${s.industry}, ${s.city || s.country}` }, { key: 'companySize', label: 'Size' },
            { key: 'schedule', label: 'Schedule', render: (s) => <StatusBadge value={s.schedule} /> }, { key: 'status', label: 'Status', render: (s) => <StatusBadge value={s.status} /> },
            { key: 'lastRun', label: 'Last run', render: (s) => fmtDateTime(s.lastRun) }, { key: 'found', label: 'Found' },
          ]}
          rowActions={(s) => <Button size="sm" variant="secondary" icon={Play} disabled={running === s.id || s.status === 'paused'} onClick={() => run(s)}>{running === s.id ? 'Running...' : 'Run now'}</Button>} />
      )}
      {tab === 'history' && <DataTable rows={runs} searchKeys={['searchName', 'source']} filters={[{ key: 'status', label: 'Result', options: ['success', 'partial', 'failed'] }]} defaultSort={{ key: 'runAt', dir: 'desc' }}
        columns={[{ key: 'runAt', label: 'Run time', render: (r) => fmtDateTime(r.runAt) }, { key: 'searchName', label: 'Search' }, { key: 'source', label: 'Source' }, { key: 'found', label: 'Found' }, { key: 'newLeads', label: 'New leads' }, { key: 'duplicates', label: 'Duplicates' }, { key: 'status', label: 'Result', render: (r) => <StatusBadge value={r.status} /> }]} />}
      {tab === 'coverage' && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card title="Discovery runs by search"><BarChart data={groupCount(runs, 'searchName').map((d) => ({ ...d, label: d.label.split(' ')[0] }))} /></Card>
          <DataTable rows={bySource} pageSize={5} columns={[{ key: 'source', label: 'Source' }, { key: 'ok', label: 'Successful' }, { key: 'fail', label: 'Failed' }, { key: 'rate', label: 'Success rate', render: (r) => `${r.rate}%` }]} />
        </div>
      )}
    </>
  );
}
