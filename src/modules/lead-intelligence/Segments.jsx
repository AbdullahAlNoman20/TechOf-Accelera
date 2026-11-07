import { RefreshCw } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { scoreLead, temperature } from '@/services/scoring';
import { humanize } from '@/utils/format';

const SYSTEM = [['qualified', 'Ready to send to the sales team'], ['unqualified', 'Does not meet business criteria'], ['nurture', 'Future potential, not sales-ready'], ['needs_review', 'Needs human review'], ['rejected', 'Invalid, spam or unacceptable']];
const FIELDS = [
  { name: 'name', label: 'Segment name', required: true, span: 2 }, { name: 'industry', label: 'Industry' }, { name: 'country', label: 'Country' },
  { name: 'companySize', label: 'Company size', type: 'select', options: ['1-10', '11-50', '51-200', '201-500', '500+'] }, { name: 'source', label: 'Source / campaign' }, { name: 'criteria', label: 'Description', type: 'textarea' },
];
const matches = (l, s) => (!s.industry || l.industry === s.industry) && (!s.country || l.country === s.country) && (!s.companySize || l.companySize === s.companySize) && (!s.source || l.source === s.source || l.campaign === s.source);

export default function Segments() {
  const { items: leads, update } = useCollection('leads');
  const { items: rules } = useCollection('scoringRules');
  const { items: segs } = useCollection('segments');
  const { canWrite } = useAuth();
  const { push } = useToast();

  async function requalify() {
    const list = leads.filter((l) => l.status === 'nurture' || l.status === 'needs_review');
    let moved = 0;
    for (const l of list) { const s = scoreLead(l, rules); const next = s >= 70 ? 'qualified' : l.status; if (next !== l.status) moved += 1; await update(l.id, { score: s, temperature: temperature(s), status: next }); }
    push(`${list.length} lead(s) requalified, ${moved} moved to Qualified`);
  }
  return (
    <>
      <PageHeader title="Smart Segmentation" subtitle="Lead status and custom segments by industry, location, size, campaign or customer type."
        actions={canWrite('leadIntel') && <Button variant="secondary" icon={RefreshCw} onClick={requalify}>Requalify nurture & review leads</Button>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SYSTEM.map(([k, d]) => <div key={k} className="card p-4"><StatusBadge value={k} /><p className="mt-2 text-2xl font-bold text-ink-900">{leads.filter((l) => l.status === k).length}</p><p className="text-xs text-ink-500">{d}</p></div>)}
      </div>
      <Card title="Custom segments" subtitle="Leads are counted live from the Lead Inbox" bodyClass="p-3">
        <CrudTable collection="segments" module="leadIntel" noun="segment" fields={FIELDS} defaults={{ type: 'custom' }} searchKeys={['name', 'industry', 'country']}
          columns={[{ key: 'name', label: 'Segment', render: (s) => <div><p className="font-medium text-ink-900">{s.name}</p><p className="text-xs text-ink-500">{s.criteria}</p></div> }, { key: 'industry', label: 'Industry' }, { key: 'country', label: 'Country' }, { key: 'companySize', label: 'Size' }, { key: 'source', label: 'Source' }, { key: 'count', label: 'Leads', sortable: false, render: (s) => <b>{leads.filter((l) => matches(l, s)).length}</b> }]} />
      </Card>
    </>
  );
}
