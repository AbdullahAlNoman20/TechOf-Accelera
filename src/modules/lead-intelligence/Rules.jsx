import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';

const SCORE_FIELDS = [
  { name: 'name', label: 'Rule name', required: true, span: 2 }, { name: 'factor', label: 'Factor', type: 'select', options: ['fit', 'intent', 'engagement', 'budget', 'authority', 'need', 'timeline'], required: true },
  { name: 'points', label: 'Points (+/-)', type: 'number', min: -50, max: 50, required: true }, { name: 'condition', label: 'Condition', required: true, span: 2 }, { name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Rule is active' },
];
const VAL_FIELDS = [
  { name: 'name', label: 'Rule name', required: true, span: 2 }, { name: 'field', label: 'Applies to', type: 'select', options: ['email', 'phone', 'company', 'country', 'name'], required: true }, { name: 'severity', label: 'If broken', type: 'select', options: ['error', 'warning'], required: true },
  { name: 'rule', label: 'What must be true', required: true, span: 2 }, { name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Active' },
];
const QUAL_FIELDS = [
  { name: 'name', label: 'Rule name', required: true }, { name: 'criterion', label: 'Criterion', type: 'select', options: ['Budget', 'Authority', 'Need', 'Timeline', 'Custom'], required: true },
  { name: 'question', label: 'Qualification question', type: 'textarea', required: true }, { name: 'weight', label: 'Weight (%)', type: 'number', min: 0, max: 100, required: true },
  { name: 'mandatory', label: 'Mandatory', type: 'checkbox', checkLabel: 'Must be answered before qualification' }, { name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Active' },
];

export default function Rules() {
  const [tab, setTab] = useState('scoring');
  return (
    <>
      <PageHeader title="Qualification Rules" subtitle="Company-specific scoring conditions and BANT-style qualification questions." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'scoring', label: 'Scoring rules' }, { key: 'qualification', label: 'BANT questions' }, { key: 'data', label: 'Data rules' }]} />
      {tab === 'data' && <CrudTable collection="validationRules" module="leadIntel" noun="data rule" fields={VAL_FIELDS} defaults={{ active: true, severity: 'error' }} columns={[{ key: 'name', label: 'Rule' }, { key: 'field', label: 'Field', render: (r) => <Badge tone="brand">{r.field}</Badge> }, { key: 'rule', label: 'What must be true' }, { key: 'severity', label: 'If broken', render: (r) => <StatusBadge value={r.severity === 'error' ? 'rejected' : 'needs_review'} /> }, { key: 'active', label: 'Status', render: (r) => <StatusBadge value={r.active ? 'active' : 'paused'} /> }]} />}
      {tab === 'data' ? null : tab === 'scoring'
        ? <CrudTable collection="scoringRules" module="leadIntel" noun="scoring rule" fields={SCORE_FIELDS} searchKeys={['name', 'factor', 'condition']} defaults={{ active: true, points: 10 }}
            columns={[{ key: 'name', label: 'Rule' }, { key: 'factor', label: 'Factor', render: (r) => <Badge tone="brand">{r.factor}</Badge> }, { key: 'condition', label: 'Condition' }, { key: 'points', label: 'Points', render: (r) => <b className={r.points < 0 ? 'text-red-600' : 'text-emerald-600'}>{r.points > 0 ? '+' : ''}{r.points}</b> }, { key: 'active', label: 'Status', render: (r) => <StatusBadge value={r.active ? 'active' : 'paused'} /> }]} />
        : <CrudTable collection="qualificationRules" module="leadIntel" noun="question" fields={QUAL_FIELDS} searchKeys={['name', 'question']} defaults={{ active: true, mandatory: false, weight: 10 }}
            columns={[{ key: 'name', label: 'Rule' }, { key: 'criterion', label: 'Criterion', render: (r) => <Badge tone="teal">{r.criterion}</Badge> }, { key: 'question', label: 'Question' }, { key: 'weight', label: 'Weight', render: (r) => `${r.weight}%` }, { key: 'mandatory', label: 'Mandatory', render: (r) => (r.mandatory ? 'Yes' : 'No') }]} />}
    </>
  );
}
