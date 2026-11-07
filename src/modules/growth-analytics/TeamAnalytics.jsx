import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import DataTable from '@/components/data/DataTable';
import { BarChart } from '@/components/charts/Charts';
import ProgressBar from '@/components/ui/ProgressBar';
import Ref from '@/components/common/Ref';
import useCollection from '@/hooks/useCollection';
import { teamMetrics } from '@/modules/team-performance/metrics';

export default function TeamAnalytics() {
  const { items: users } = useCollection('users');
  const { items: tasks } = useCollection('tasks');
  const { items: deals } = useCollection('deals');
  const { items: leads } = useCollection('leads');
  const { items: fus } = useCollection('followUps');
  const { items: targets } = useCollection('targets');
  const rows = teamMetrics({ users, tasks, deals, leads, fus, targets });
  return (
    <>
      <PageHeader title="Team & Task Analytics" subtitle="Task efficiency, conversion, workload, SLA compliance and process bottlenecks, in context." />
      <div className="mb-5 grid gap-5 lg:grid-cols-2"><Card title="Open workload per person"><BarChart data={rows.map((r) => ({ label: r.name.split(' ')[0], value: r.open }))} /></Card><Card title="Conversion rate (%)"><BarChart data={rows.map((r) => ({ label: r.name.split(' ')[0], value: Math.round(r.conversion) }))} color="#1A8F9B" format={(v) => `${v}%`} /></Card></div>
      <DataTable rows={rows} exportName="team-analytics" pageSize={10} columns={[{ key: 'name', label: 'Employee', render: (r) => <Ref id={r.id} /> }, { key: 'assigned', label: 'Tasks assigned' }, { key: 'completed', label: 'Completed' }, { key: 'overdue', label: 'Overdue' }, { key: 'taskRate', label: 'Task completion', render: (r) => <div className="w-24"><ProgressBar value={r.taskRate} showValue /></div> }, { key: 'sla', label: 'SLA compliance', render: (r) => `${Math.round(r.sla)}%` }, { key: 'conversion', label: 'Conversion', render: (r) => `${Math.round(r.conversion)}%` }, { key: 'responseMin', label: 'Avg response', render: (r) => `${Math.round(r.responseMin)} min` }]} />
      <p className="mt-3 text-xs text-ink-400">Performance is shown with context: workload, lead quality and territory differ between people, so compare trends rather than raw counts.</p>
    </>
  );
}
