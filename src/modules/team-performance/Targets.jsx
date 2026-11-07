import CrudPage from '@/components/data/CrudPage';
import ProgressBar from '@/components/ui/ProgressBar';
import Ref from '@/components/common/Ref';
import { StatusBadge } from '@/components/ui/Badge';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import { api } from '@/services/api';

const FIELDS = [
  { name: 'userId', label: 'Employee', optionsFrom: 'users', optionFilter: (u) => ['sales', 'manager', 'marketing', 'support'].includes(u.role), required: true }, { name: 'period', label: 'Period', required: true, placeholder: 'Q4 2026' },
  { name: 'metric', label: 'Metric', required: true, placeholder: 'Revenue ($)' }, { name: 'target', label: 'Target', type: 'number', min: 1, required: true }, { name: 'achieved', label: 'Achieved so far', type: 'number', min: 0, required: true },
];
export default function Targets() {
  const { items } = useCollection('targets');
  const { push } = useToast();
  const behind = items.filter((t) => t.achieved / t.target < 0.4);
  return (
    <CrudPage collection="targets" module="performance" noun="target" title="Targets & Progress" subtitle="Individual and team sales, revenue or activity targets with live progress. Targets that fall behind raise alerts."
      stats={(r) => [{ label: 'Targets', value: r.length }, { label: 'On track (70%+)', value: r.filter((t) => t.achieved / t.target >= 0.7).length, tone: 'success' }, { label: 'Behind (<40%)', value: behind.length, tone: 'danger' }, { label: 'Achieved', value: r.filter((t) => t.achieved >= t.target).length, tone: 'teal' }]}
      fields={FIELDS} searchKeys={['metric', 'period']} defaults={{ period: 'Q4 2026', achieved: 0 }} exportName="targets"
      columns={[{ key: 'userId', label: 'Employee', render: (t) => <Ref id={t.userId} /> }, { key: 'metric', label: 'Metric' }, { key: 'period', label: 'Period' }, { key: 'target', label: 'Target' }, { key: 'achieved', label: 'Achieved' }, { key: 'p', label: 'Progress', sortValue: (t) => t.achieved / t.target, render: (t) => <div className="w-32"><ProgressBar value={t.achieved} max={t.target} showValue /></div> }, { key: 's', label: 'Status', sortable: false, render: (t) => <StatusBadge value={t.achieved >= t.target ? 'completed' : t.achieved / t.target < 0.4 ? 'at_risk' : 'active'} /> }]}
      rowActions={(t) => t.achieved / t.target < 0.4 && <button type="button" className="text-xs font-medium text-brand-600" onClick={async () => { await api.create('notifications', { userId: t.userId, title: 'Target alert', body: `${t.metric} is behind plan`, at: new Date().toISOString(), read: false, type: 'warning' }); push('Target alert sent'); }}>Send alert</button>} />
  );
}
