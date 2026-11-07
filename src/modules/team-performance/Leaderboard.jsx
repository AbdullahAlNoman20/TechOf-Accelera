import { useState } from 'react';
import { Award } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { LineChart } from '@/components/charts/Charts';
import useTeam from './useTeam';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { money, pct } from '@/utils/format';

const CRITERIA = { revenue: ['Revenue', (r) => r.revenue, (v) => money(v)], conversion: ['Conversion rate', (r) => r.conversion, (v) => pct(v)], response: ['Fastest response', (r) => -r.responseMin, (v) => `${Math.round(-v)} min`], tasks: ['Task completion', (r) => r.taskRate, (v) => pct(v)] };
export default function Leaderboard() {
  const { rows } = useTeam();
  const { items: users } = useCollection('users');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const [k, setK] = useState('revenue');
  const [, fn, fmt] = CRITERIA[k];
  const ranked = [...rows].sort((a, b) => fn(b) - fn(a));
  const col = (id) => users.find((u) => u.id === id)?.avatarColor;
  const recognize = async (r) => { await api.create('notifications', { userId: r.id, title: 'Recognition', body: `You are #${ranked.indexOf(r) + 1} on the ${CRITERIA[k][0]} leaderboard. Great work!`, at: new Date().toISOString(), read: false, type: 'success' }); push(`Recognition sent to ${r.name}`); };
  return (
    <>
      <PageHeader title="Leaderboard" subtitle="Ranking by your chosen criteria. Remember: lead quality, territory and workload differ between people." actions={<select aria-label="Criteria" className="input w-auto" value={k} onChange={(e) => setK(e.target.value)}>{Object.entries(CRITERIA).map(([key, [l]]) => <option key={key} value={key}>{l}</option>)}</select>} />
      <div className="mb-5 grid gap-4 sm:grid-cols-3">{ranked.slice(0, 3).map((r, i) => (
        <div key={r.id} className={`card p-5 text-center ${i === 0 ? 'border-gold-400' : ''}`}><Badge tone={i === 0 ? 'gold' : 'neutral'}>#{i + 1}</Badge><div className="mt-3 flex justify-center"><Avatar name={r.name} color={col(r.id)} size={56} /></div><p className="mt-2 font-semibold text-ink-900">{r.name}</p><p className="text-xs text-ink-500">{r.team}</p><p className="mt-2 text-xl font-bold text-brand-800">{fmt(fn(r))}</p></div>))}</div>
      <Card title="Full ranking" bodyClass="p-0"><ul className="divide-y divide-ink-100">{ranked.map((r, i) => <li key={r.id} className="flex items-center gap-3 px-4 py-3"><span className="w-6 text-sm font-bold text-ink-400">{i + 1}</span><Avatar name={r.name} color={col(r.id)} size={32} /><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium text-ink-900">{r.name}</p><p className="text-xs text-ink-500">{r.team}</p></div><b className="text-sm text-ink-800">{fmt(fn(r))}</b>{canWrite('performance') && i < 3 && <Button size="sm" variant="secondary" icon={Award} onClick={() => recognize(r)}>Recognize</Button>}</li>)}</ul></Card>
      <Card title="Performance trend" subtitle="Team leads and wins by month" className="mt-5"><TrendChart /></Card>
    </>
  );
}
function TrendChart() { const { items } = useCollection('trends'); return <LineChart labels={items.map((t) => t.month)} series={[{ name: 'Qualified', data: items.map((t) => t.qualified) }, { name: 'Won', data: items.map((t) => t.won) }]} />; }
