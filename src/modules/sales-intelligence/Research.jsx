import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { research } from '@/services/ai';
import { fmtDate } from '@/utils/format';

const Section = ({ title, children }) => <div><h4 className="mb-1 text-xs font-semibold uppercase tracking-wide text-ink-400">{title}</h4>{children}</div>;
const List = ({ items }) => <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink-700">{(items || []).map((i) => <li key={i}>{i}</li>)}</ul>;

export default function Research() {
  const { items, create } = useCollection('research');
  const { items: leads } = useCollection('leads');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const [sel, setSel] = useState(items[0]?.id);
  const [leadId, setLeadId] = useState('');
  const cur = items.find((r) => r.id === sel) || items[0];

  async function generate() {
    const l = leads.find((x) => x.id === leadId);
    if (!l) return push('Choose a lead first', 'error');
    const r = await create({ ...research(l), dealId: null }); setSel(r.id); push('Research generated from public information');
  }
  return (
    <>
      <PageHeader title="Prospect Research" subtitle="Company, industry and competitor intelligence. Every finding keeps its source, date and confidence." />
      {canWrite('sales') && <div className="card mb-5 flex flex-wrap items-center gap-2 p-3"><select aria-label="Lead" className="input w-auto min-w-[240px] flex-1" value={leadId} onChange={(e) => setLeadId(e.target.value)}><option value="">Select a lead to research...</option>{leads.filter((l) => l.status !== 'rejected').map((l) => <option key={l.id} value={l.id}>{l.company} - {l.name}</option>)}</select><Button icon={Sparkles} onClick={generate}>Generate research</Button></div>}
      <div className="grid gap-5 lg:grid-cols-4">
        <ul className="card max-h-[70vh] divide-y divide-ink-100 overflow-y-auto lg:col-span-1">{items.map((r) => <li key={r.id}><button type="button" onClick={() => setSel(r.id)} className={`w-full px-4 py-3 text-left hover:bg-ink-50 ${cur?.id === r.id ? 'bg-brand-50' : ''}`}><p className="text-sm font-medium text-ink-900">{r.company}</p><p className="text-xs text-ink-500">{r.industry}</p></button></li>)}</ul>
        {cur && (
          <Card title={cur.company} subtitle={`${cur.industry} - ${cur.website}`} className="lg:col-span-3">
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2"><Section title="Company analysis"><p className="text-sm text-ink-700">{cur.summary}</p></Section></div>
              <Section title="Pain points"><List items={cur.painPoints} /></Section><Section title="Customer requirement"><p className="text-sm text-ink-700">{cur.requirement}</p></Section>
              <Section title="Opportunity: our matching services"><div className="flex flex-wrap gap-1.5">{(cur.opportunities || []).map((o) => <Badge key={o} tone="teal">{o}</Badge>)}</div></Section><Section title="Competitive environment"><List items={cur.competitors} /></Section>
              <Section title="Decision-maker context"><List items={cur.decisionMakers} /></Section>
              <div className="sm:col-span-2"><Section title="Research sources"><ul className="divide-y divide-ink-100 rounded-lg border border-ink-100">{(cur.sources || []).map((s) => <li key={s.title} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm"><span className="text-brand-700">{s.title}</span><span className="flex items-center gap-2 text-xs text-ink-500">{fmtDate(s.date)}<Badge tone={s.confidence === 'High' ? 'success' : 'gold'}>{s.confidence} confidence</Badge></span></li>)}</ul></Section></div>
            </div>
          </Card>
        )}
      </div>
    </>
  );
}
