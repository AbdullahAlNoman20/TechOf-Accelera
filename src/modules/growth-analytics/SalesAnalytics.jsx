import { Clock, DollarSign, Percent, TrendingUp } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Card from '@/components/ui/Card';
import { BarChart, Donut, Funnel, HBar } from '@/components/charts/Charts';
import useCollection from '@/hooks/useCollection';
import { avg, groupCount, humanize, money, pct, sum } from '@/utils/format';
import { STAGES } from '@/utils/status';

const topOf = (rows, k) => Object.entries(rows.reduce((m, r) => { m[r[k]] = (m[r[k]] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
export default function SalesAnalytics() {
  const { items: deals } = useCollection('deals');
  const won = deals.filter((d) => d.stage === 'won'), lost = deals.filter((d) => d.stage === 'lost'), open = deals.filter((d) => !['won', 'lost'].includes(d.stage));
  const idx = (s) => STAGES.indexOf(s);
  const reached = STAGES.slice(0, 8).map((s) => ({ label: humanize(s), value: deals.filter((d) => idx(d.stage) >= idx(s) || (d.stage === 'lost' && s === 'new')).length }));
  const cycle = avg(won.map((d) => ({ v: Math.round((new Date(d.expectedClose) - new Date(d.createdAt)) / 864e5) })), 'v');
  const stageAge = STAGES.slice(0, 7).map((s) => ({ label: humanize(s), value: Math.round(avg(deals.filter((d) => d.stage === s).map((d) => ({ v: (Date.now() - new Date(d.lastActivityAt)) / 864e5 })), 'v')) })).sort((a, b) => b.value - a.value);
  const byService = Object.entries(deals.reduce((m, d) => { m[d.service] = (m[d.service] || 0) + d.value; return m; }, {})).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 6);
  const fu = [['1-2', 1, 2], ['3-4', 3, 4], ['5+', 5, 99]].map(([label, lo, hi]) => { const g = deals.filter((d) => d.followUps >= lo && d.followUps <= hi); return { label, value: g.length ? Math.round((g.filter((d) => d.stage === 'won').length / g.length) * 100) : 0 }; });
  return (
    <>
      <PageHeader title="Sales & Deal Analytics" subtitle="Pipeline, stage conversion, win/loss, sales cycle, forecast and bottlenecks." />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><StatCard label="Win rate" value={pct((won.length / Math.max(1, won.length + lost.length)) * 100)} icon={Percent} tone="success" /><StatCard label="Avg deal value" value={money(avg(deals, 'value'))} icon={DollarSign} tone="gold" /><StatCard label="Avg sales cycle" value={`${Math.round(cycle)} days`} icon={Clock} tone="teal" /><StatCard label="Weighted forecast" value={money(sum(open, (d) => (d.value * d.probability) / 100), true)} icon={TrendingUp} /></div>
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Pipeline performance" subtitle="Deals that reached each stage"><Funnel data={reached} /></Card>
        <Card title="Bottleneck detection" subtitle="Average days since last activity by stage. Highest = slowest."><HBar data={stageAge} format={(v) => `${v}d`} color="#D99A12" /><p className="mt-3 rounded-lg bg-gold-50 p-2.5 text-xs text-gold-700">Deals in <b>{stageAge[0]?.label}</b> wait longest. Add an automatic follow-up after 3 days.</p></Card>
        <Card title="Lost deal intelligence"><Donut data={groupCount(lost.filter((d) => d.lostReason), 'lostReason').map((d) => ({ ...d, label: humanize(d.label) }))} /></Card>
        <Card title="Service performance" subtitle="Deal value by service"><HBar data={byService} format={(v) => money(v, true)} /></Card>
        <Card title="Follow-up effectiveness" subtitle="Win rate (%) by number of follow-ups"><BarChart data={fu} format={(v) => `${v}%`} /></Card>
        <Card title="Win analysis" subtitle="What won deals have in common"><ul className="space-y-2 text-sm text-ink-700"><li>Best source: <b>{topOf(won, 'source')}</b></li><li>Best-selling service: <b>{topOf(won, 'service')}</b></li><li>Average won value: <b>{money(avg(won, 'value'))}</b></li><li>Average follow-ups before winning: <b>{avg(won, 'followUps').toFixed(1)}</b></li></ul></Card>
        <Card title="Competitor tracking" subtitle="Deals where a competitor was noted"><HBar data={Object.entries(deals.filter((d) => d.competitor).reduce((m, d) => { m[d.competitor] = (m[d.competitor] || 0) + 1; return m; }, {})).map(([label, value]) => ({ label, value }))} /></Card>
        <Card title="Win / loss"><Donut data={[{ label: 'Won', value: won.length, color: '#1A8F9B' }, { label: 'Lost', value: lost.length, color: '#F2B632' }, { label: 'Open', value: open.length, color: '#1456A8' }]} /></Card>
      </div>
    </>
  );
}
