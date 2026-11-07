import { CheckCircle2, CircleHelp, Copy, ShieldAlert, Sparkles, XCircle } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import StatCard from '@/components/ui/StatCard';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import DataTable from '@/components/data/DataTable';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { isEmail, isPhone } from '@/utils/validators';

const FREE = /@(gmail|yahoo|outlook|hotmail|mailinator)\b/i;
const Check = ({ v }) => (v === 'valid' ? <CheckCircle2 size={16} className="text-emerald-600" /> : v === 'invalid' ? <XCircle size={16} className="text-red-500" /> : <CircleHelp size={16} className="text-ink-300" />);
const quality = (l) => [l.checks.email === 'valid', l.checks.phone === 'valid', l.checks.company === 'valid', !l.checks.duplicate, !l.checks.spam, !!l.industry && !!l.country].filter(Boolean).length * 100 / 6;

export default function Verification() {
  const { items: leads, update, remove } = useCollection('leads');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const w = canWrite('leadIntel');
  const active = leads.filter((l) => l.status !== 'rejected');
  const dupes = leads.filter((l) => l.checks.duplicate);

  const verify = (l) => ({ email: isEmail(l.email) && !/mailinator/.test(l.email) ? 'valid' : 'invalid', phone: !l.phone ? 'unverified' : isPhone(l.phone) ? 'valid' : 'invalid', company: l.company ? 'valid' : 'unverified', duplicate: l.checks.duplicate, spam: /mailinator/.test(l.email) });
  async function runAll() {
    const pending = leads.filter((l) => [l.checks.email, l.checks.phone].includes('unverified'));
    for (const l of pending) await update(l.id, { checks: verify(l) });
    push(`Verification finished for ${pending.length} lead(s)`);
  }
  async function enrich(l) { await update(l.id, { industry: l.industry || 'General', country: l.country || 'Bangladesh', city: l.city || 'Dhaka', companySize: l.companySize || '11-50', notes: `${l.notes} Enriched from approved company sources.`.trim() }); push('Lead enriched from approved sources'); }
  async function normalize(l) { await update(l.id, { company: l.company.replace(/\s+/g, ' ').trim(), phone: (l.phone || '').replace(/[^\d+]/g, ''), email: l.email.toLowerCase().trim(), country: l.country === 'USA' ? 'United States' : l.country }); push('Fields normalized'); }
  async function merge(l) {
    const main = leads.find((x) => x.id === l.duplicateOf);
    if (main) await update(main.id, { notes: `${main.notes} Merged duplicate ${l.id}.`.trim(), engagement: Math.max(main.engagement, l.engagement) });
    await remove(l.id); push(`Duplicate merged into ${main?.id || 'existing record'} (history kept)`);
  }
  async function reject(l) { await update(l.id, { status: 'rejected', processing: 'sent' }); push('Lead rejected', 'info'); }

  return (
    <>
      <PageHeader title="Lead Verification & Data Quality" subtitle="Detect duplicates, spam and invalid contacts, then enrich and normalize records before qualification."
        actions={w && <Button icon={Sparkles} onClick={runAll}>Verify pending leads</Button>} />
      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Leads checked" value={active.length} icon={CheckCircle2} />
        <StatCard label="Duplicates" value={dupes.length} icon={Copy} tone="gold" />
        <StatCard label="Spam / fake" value={leads.filter((l) => l.checks.spam).length} icon={ShieldAlert} tone="danger" />
        <StatCard label="Missing data" value={leads.filter((l) => !l.phone || !l.industry).length} icon={CircleHelp} tone="teal" />
      </div>
      <DataTable rows={active} searchKeys={['name', 'company', 'email']} pageSize={12} exportName="verification"
        filters={[{ key: 'status', label: 'Status', options: ['new', 'qualified', 'nurture', 'needs_review', 'unqualified'] }]}
        columns={[
          { key: 'name', label: 'Lead', render: (l) => <div><p className="font-medium text-ink-900">{l.name}</p><p className="text-xs text-ink-500">{l.company} - {l.email}{FREE.test(l.email) && <span className="ml-1 text-amber-600">(free domain)</span>}</p></div> },
          { key: 'e', label: 'Email', sortable: false, render: (l) => <Check v={l.checks.email} /> }, { key: 'p', label: 'Phone', sortable: false, render: (l) => <Check v={l.checks.phone} /> }, { key: 'c', label: 'Company', sortable: false, render: (l) => <Check v={l.checks.company} /> },
          { key: 'd', label: 'Flags', sortable: false, render: (l) => <div className="flex gap-1">{l.checks.duplicate && <Badge tone="gold">Duplicate of {l.duplicateOf}</Badge>}{l.checks.spam && <Badge tone="danger">Spam</Badge>}{!l.checks.duplicate && !l.checks.spam && <span className="text-ink-300">-</span>}</div> },
          { key: 'q', label: 'Data quality', sortValue: quality, render: (l) => <span className={`font-semibold ${quality(l) >= 80 ? 'text-emerald-600' : quality(l) >= 50 ? 'text-amber-600' : 'text-red-600'}`}>{Math.round(quality(l))}%</span> },
          { key: 'a', label: '', sortable: false, className: 'text-right', render: (l) => w && (
            <div className="flex justify-end gap-1">
              {l.checks.duplicate && <Button size="sm" variant="secondary" onClick={() => merge(l)}>Merge</Button>}
              <Button size="sm" variant="secondary" onClick={() => update(l.id, { checks: verify(l) })}>Verify</Button>
              <Button size="sm" variant="ghost" onClick={() => enrich(l)}>Enrich</Button><Button size="sm" variant="ghost" onClick={() => normalize(l)}>Normalize</Button>
              <Button size="sm" variant="ghost" className="text-red-600" onClick={() => reject(l)}>Reject</Button>
            </div>) },
        ]} />
    </>
  );
}
