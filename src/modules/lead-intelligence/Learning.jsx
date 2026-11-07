import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import DataTable from '@/components/data/DataTable';
import { BarChart, Donut, HBar } from '@/components/charts/Charts';
import { Brain, ThumbsDown, ThumbsUp } from 'lucide-react';
import useCollection from '@/hooks/useCollection';
import { fmtDateTime, groupCount, humanize } from '@/utils/format';

export default function Learning() {
  const { items: leads } = useCollection('leads');
  const { items: deals } = useCollection('deals');
  const decided = leads.filter((l) => l.outcome);
  const bands = [['0-49', 0, 49], ['50-69', 50, 69], ['70-84', 70, 84], ['85-100', 85, 100]].map(([label, lo, hi]) => {
    const g = decided.filter((l) => l.score >= lo && l.score <= hi); return { label, value: g.length ? Math.round((g.filter((l) => l.outcome === 'won').length / g.length) * 100) : 0 };
  });
  const sources = Object.entries(leads.reduce((m, l) => { m[l.source] = m[l.source] || [0, 0]; m[l.source][1] += 1; if (l.status === 'qualified') m[l.source][0] += 1; return m; }, {})).map(([label, [q, t]]) => ({ label, value: Math.round((q / t) * 100) })).sort((a, b) => b.value - a.value).slice(0, 7);
  const overrides = leads.flatMap((l) => (l.overrides || []).map((o, i) => ({ id: `${l.id}-${i}`, lead: `${l.name} (${l.company})`, ...o })));
  return (
    <>
      <PageHeader title="Learning from Conversion Outcomes" subtitle="Scoring improves as won and lost results, source quality and human overrides are fed back into the model." />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">
        <StatCard label="Won outcomes" value={decided.filter((l) => l.outcome === 'won').length} icon={ThumbsUp} tone="success" />
        <StatCard label="Lost outcomes" value={decided.filter((l) => l.outcome === 'lost').length} icon={ThumbsDown} tone="danger" />
        <StatCard label="Human overrides" value={overrides.length} icon={Brain} tone="gold" />
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Score calibration" subtitle="Win rate by score band (%)"><BarChart data={bands} format={(v) => `${v}%`} /></Card>
        <Card title="Source quality" subtitle="Qualified rate by source (%)"><HBar data={sources} format={(v) => `${v}%`} /></Card>
        <Card title="Lost reasons (win/loss feedback)"><Donut data={groupCount(deals.filter((d) => d.stage === 'lost' && d.lostReason), 'lostReason').map((d) => ({ ...d, label: humanize(d.label) }))} /></Card>
        <Card title="Human override feedback" bodyClass="p-0">{overrides.length ? <DataTable rows={overrides} pageSize={5} columns={[{ key: 'lead', label: 'Lead' }, { key: 'to', label: 'Changed to', render: (o) => humanize(o.to) }, { key: 'reason', label: 'Reason' }, { key: 'at', label: 'When', render: (o) => fmtDateTime(o.at) }]} /> : <p className="p-6 text-center text-sm text-ink-400">No overrides yet. Override a score in Scoring & Priority to see feedback here.</p>}</Card>
      </div>
    </>
  );
}
