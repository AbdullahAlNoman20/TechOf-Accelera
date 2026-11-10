import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Preview from '@/components/ui/Preview';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import useTeam from './useTeam';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { coachingFor } from '@/services/ai';

export default function Coaching() {
  const { rows } = useTeam();
  const { user, level, canWrite } = useAuth();
  const { push } = useToast();
  const list = level('performance') === 'own' ? rows.filter((r) => r.id === user.id) : rows;
  const create = async (r, tip) => { await api.create('tasks', { title: `Coaching: ${tip.area} - ${r.name}`, leadId: null, leadName: r.name, company: 'Internal', dealId: null, assigneeId: 'U-03', team: 'Dhaka Sales', priority: 'medium', status: 'assigned', dueAt: new Date(Date.now() + 7 * 864e5).toISOString(), slaAt: new Date(Date.now() + 7 * 864e5).toISOString(), dependsOn: null, notes: [], comments: [], attachments: [], history: [{ by: 'AI Coaching', text: 'Coaching task created for manager', at: new Date().toISOString() }] }); push('Coaching task created for the manager'); };
  return (
    <>
      <PageHeader title="AI Coaching & Training" subtitle="Suggestions based on follow-up, response time, pipeline and conversion data. They support managers and never replace their judgment." />
      <div className="grid gap-5 lg:grid-cols-2">
        {list.map((r) => (
          <Card key={r.id} title={r.name} subtitle={r.team} action={<Badge tone={r.targetPct >= 80 ? 'success' : r.targetPct >= 50 ? 'gold' : 'danger'}>{Math.round(r.targetPct)}% of target</Badge>}>
            <div className="mb-3"><p className="mb-1 text-xs text-ink-500">Performance gap (target vs achieved)</p><ProgressBar value={r.targetPct} showValue /></div>
            <ul className="space-y-3">{coachingFor(r).map((t) => <li key={t.area} className="rounded-lg bg-ink-50 p-3"><p className="text-sm font-semibold text-ink-900">{t.area}</p><p className="text-sm text-ink-600">{t.tip}</p><p className="mt-1 text-xs text-teal-700">Training: {t.training}</p>{canWrite('performance') && t.area !== 'Keep it up' && <Button size="sm" variant="secondary" className="mt-2" onClick={() => create(r, t)}>Create coaching task<Preview kind="automation" /></Button>}</li>)}</ul>
          </Card>))}
      </div>
    </>
  );
}
