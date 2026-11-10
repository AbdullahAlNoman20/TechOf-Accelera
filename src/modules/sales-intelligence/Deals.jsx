import { useNavigate } from 'react-router-dom';
import CrudTable from '@/components/data/CrudTable';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import Ref from '@/components/common/Ref';
import useAuth from '@/hooks/useAuth';
import useFieldAccess from '@/hooks/useFieldAccess';
import useStages from '@/hooks/useStages';
import useCollection from '@/hooks/useCollection';
import { scopeRows } from '@/utils/scope';
import { fmtDate, money } from '@/utils/format';

const RISK = { high: 'danger', medium: 'warning', low: 'success' };
export const dealFields = (stageIds) => [
  { name: 'title', label: 'Deal title', required: true, span: 2 }, { name: 'company', label: 'Company', required: true }, { name: 'contact', label: 'Contact person', required: true },
  { name: 'ownerId', label: 'Owner', optionsFrom: 'users', optionFilter: (u) => ['sales', 'manager'].includes(u.role), required: true },
  { name: 'stage', label: 'Stage', type: 'select', options: stageIds, required: true }, { name: 'value', label: 'Deal value ($)', type: 'number', min: 0, required: true },
  { name: 'probability', label: 'Chance of winning (%)', type: 'number', min: 0, max: 100, required: true }, { name: 'expectedClose', label: 'Expected closing date', type: 'date', required: true },
  { name: 'service', label: 'Service / product' }, { name: 'competitor', label: 'Competitor (if any)' }, { name: 'nextAction', label: 'Next action', span: 2 },
];

/** List view of deals (used inside Deal Pipeline). */
export default function DealList() {
  const nav = useNavigate();
  const { user, level } = useAuth();
  const { show } = useFieldAccess();
  const { ids } = useStages();
  const { items } = useCollection('deals');
  const rows = scopeRows(items, user, level('sales'));
  return (
    <CrudTable collection="deals" rows={rows} module="sales" noun="deal" createLabel="New deal" fields={dealFields(ids)} searchKeys={['title', 'company', 'contact']} exportName="deals" onRowClick={(d) => nav(`/app/sales/deals/${d.id}`)}
      defaults={{ stage: 'new', probability: 10, risk: 'low', stakeholders: [], leadId: null, source: 'Manual Entry', lostReason: '', followUps: 0, ownerId: user.id, createdAt: new Date().toISOString(), lastActivityAt: new Date().toISOString() }}
      filters={[{ key: 'stage', label: 'Stage', options: ids }, { key: 'risk', label: 'Risk', options: ['low', 'medium', 'high'] }]}
      columns={[
        { key: 'title', label: 'Deal', render: (d) => <div><p className="font-medium text-ink-900">{d.company}</p><p className="max-w-xs truncate text-xs text-ink-500">{d.title}</p></div> },
        { key: 'ownerId', label: 'Owner', render: (d) => <Ref id={d.ownerId} /> }, { key: 'stage', label: 'Stage', render: (d) => <StatusBadge value={d.stage} /> },
        { key: 'value', label: 'Value', render: (d) => (show('Deal value') ? money(d.value) : <span className="text-ink-300">Hidden</span>) }, { key: 'probability', label: 'Chance', render: (d) => `${d.probability}%` },
        { key: 'expectedClose', label: 'Expected close', render: (d) => fmtDate(d.expectedClose) }, { key: 'risk', label: 'Risk', render: (d) => <Badge tone={RISK[d.risk]}>{d.risk}</Badge> },
      ]} />
  );
}
