import { useState } from 'react';
import { Copy } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import { STAGES } from '@/utils/status';
import { humanize } from '@/utils/format';

const FIELDS = [
  { name: 'name', label: 'Template name', required: true }, { name: 'channel', label: 'Channel', type: 'select', options: ['email', 'whatsapp', 'call_script'], required: true },
  { name: 'stage', label: 'Best for stage', type: 'select', options: STAGES, required: true }, { name: 'subject', label: 'Subject (email only)' },
  { name: 'body', label: 'Body', type: 'textarea', rows: 7, required: true, help: 'Variables: {{name}}, {{company}}, {{service}}, {{owner}}' }, { name: 'approved', label: 'Approval', type: 'checkbox', checkLabel: 'Approved for use (required for WhatsApp)' },
];
const fill = (t, d, owner) => t.replace(/{{name}}/g, d?.contact?.split(' ')[0] || 'there').replace(/{{company}}/g, d?.company || 'your company').replace(/{{service}}/g, d?.service || 'our service').replace(/{{owner}}/g, owner || 'TechOf Solution');

export default function Templates() {
  const { items } = useCollection('templates');
  const { items: deals } = useCollection('deals');
  const { push } = useToast();
  const [dealId, setDealId] = useState('');
  const deal = deals.find((d) => d.id === dealId);
  const suggested = deal ? items.filter((t) => t.stage === deal.stage || (deal.stage === 'qualified' && t.stage === 'contacted')) : [];
  return (
    <>
      <PageHeader title="Communication Templates" subtitle="Reusable email, WhatsApp and call-script templates with personalized suggestions." />
      <Card title="Personalized suggestions" subtitle="Pick a deal to see templates for its stage, already filled in" className="mb-5">
        <select aria-label="Deal" className="input max-w-md" value={dealId} onChange={(e) => setDealId(e.target.value)}><option value="">Select a deal...</option>{deals.map((d) => <option key={d.id} value={d.id}>{d.company} ({d.stage})</option>)}</select>
        {deal && <div className="mt-4 grid gap-3 md:grid-cols-2">{suggested.map((t) => (
          <div key={t.id} className="rounded-lg border border-ink-100 p-3"><div className="mb-1 flex items-center justify-between"><p className="text-sm font-semibold">{t.name}</p><Badge tone="teal">{humanize(t.channel)}</Badge></div><pre className="whitespace-pre-wrap font-sans text-xs text-ink-600">{fill(t.body, deal, 'Your name')}</pre><Button size="sm" variant="ghost" icon={Copy} className="mt-2" onClick={() => { navigator.clipboard?.writeText(fill(t.body, deal)); push('Copied'); }}>Copy</Button></div>))}
          {!suggested.length && <p className="text-sm text-ink-400">No template for this stage yet. Create one below.</p>}</div>}
      </Card>
      <CrudTable collection="templates" module="activity" noun="template" fields={FIELDS} searchKeys={['name', 'body']} defaults={{ approved: true, channel: 'email', stage: 'contacted' }} filters={[{ key: 'channel', label: 'Channel', options: ['email', 'whatsapp', 'call_script'] }]}
        columns={[{ key: 'name', label: 'Template' }, { key: 'channel', label: 'Channel', render: (t) => <Badge tone="brand">{humanize(t.channel)}</Badge> }, { key: 'stage', label: 'Stage', render: (t) => <StatusBadge value={t.stage} /> }, { key: 'body', label: 'Preview', render: (t) => <span className="line-clamp-1 max-w-sm text-ink-500">{t.body}</span> }, { key: 'approved', label: 'Approved', render: (t) => (t.approved ? 'Yes' : 'No') }]} />
    </>
  );
}
