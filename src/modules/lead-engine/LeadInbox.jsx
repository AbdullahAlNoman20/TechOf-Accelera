import { useState } from 'react';
import { Send, Upload } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import { api } from '@/services/api';
import { isEmail, isPhone } from '@/utils/validators';
import { clean } from '@/utils/sanitize';
import { fmtDateTime, humanize } from '@/utils/format';

const SOURCES = ['Website Contact Form', 'Quotation Request', 'Demo Request', 'Landing Page', 'Google Ads', 'Meta Lead Ads', 'Social Media', 'Email Inquiry', 'Phone Call', 'WhatsApp Business', 'Live Chat', 'Webinar / Event', 'Referral', 'Partner / Affiliate', 'Manual Entry', 'CSV Import', 'API / Webhook', 'AI Discovery'];
const INDUSTRIES = ['IT', 'Healthcare', 'Manufacturing', 'Education', 'Real Estate', 'Retail', 'Logistics', 'Energy', 'Hospitality', 'Finance'];
const FIELDS = [
  { name: 'name', label: 'Contact name', required: true }, { name: 'title', label: 'Job title' },
  { name: 'company', label: 'Company', required: true }, { name: 'industry', label: 'Industry', type: 'select', options: INDUSTRIES },
  { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'country', label: 'Country' }, { name: 'city', label: 'City' },
  { name: 'source', label: 'Source', type: 'select', options: SOURCES, required: true }, { name: 'campaign', label: 'Campaign' },
  { name: 'need', label: 'Need / inquiry', type: 'textarea' },
];
const CSV_SAMPLE = 'name,email,company,phone,source\nAnika Rahman,anika@example.com,Sunrise Foods,+8801711000000,CSV Import';
const blank = { fit: 50, intent: 50, engagement: 30, score: 45, temperature: 'cold', status: 'new', processing: 'collected', budget: 'unknown', authority: 'unknown', timeline: 'unknown', companySize: '11-50', ownerId: null, firstResponseMin: null, overrides: [], notes: '', outcome: null, checks: { email: 'unverified', phone: 'unverified', company: 'unverified', duplicate: false, spam: false }, duplicateOf: null };

export default function LeadInbox() {
  const { items, update } = useCollection('leads');
  const { items: errs, update: updErr } = useCollection('importErrors');
  const { push } = useToast();
  const [tab, setTab] = useState('all');
  const [csvOpen, setCsvOpen] = useState(false);
  const [csv, setCsv] = useState(CSV_SAMPLE);

  const tabs = [
    { key: 'all', label: 'All leads', count: items.length },
    { key: 'pending', label: 'Awaiting processing', count: items.filter((l) => l.processing === 'collected').length },
    { key: 'sent', label: 'Sent to Intelligence', count: items.filter((l) => l.processing === 'sent').length },
    { key: 'error', label: 'Error queue', count: errs.filter((e) => e.status === 'open').length + items.filter((l) => l.processing === 'error').length },
  ];
  const rows = tab === 'pending' ? items.filter((l) => l.processing === 'collected') : tab === 'sent' ? items.filter((l) => l.processing === 'sent') : items;

  async function importCsv() {
    const lines = csv.split('\n').map((l) => l.trim()).filter(Boolean);
    const head = lines.shift()?.split(',').map((h) => h.trim().toLowerCase()) || [];
    if (!head.includes('email') || !head.includes('name')) return push('CSV needs at least "name" and "email" columns', 'error');
    let ok = 0, bad = 0;
    for (const [i, line] of lines.slice(0, 500).entries()) {
      const cells = line.split(',');
      const r = Object.fromEntries(head.map((h, k) => [h, clean(cells[k] || '', 200)]));
      const reason = !r.name ? 'Missing name' : !isEmail(r.email) ? 'Invalid email format' : r.phone && !isPhone(r.phone) ? 'Phone number too short' : !r.company ? 'Missing company name' : '';
      if (reason) { bad += 1; await api.create('importErrors', { file: 'pasted.csv', row: i + 2, reason, source: 'CSV Import', at: new Date().toISOString(), status: 'open' }); continue; }
      await api.create('leads', { ...blank, ...r, source: r.source || 'CSV Import', industry: 'IT', country: 'Bangladesh', city: 'Dhaka', campaign: '', title: '', need: '' });
      ok += 1;
    }
    push(`${ok} lead(s) imported, ${bad} sent to error queue`, bad ? 'info' : 'success');
    setCsvOpen(false);
  }

  return (
    <>
      <PageHeader title="Lead Inbox" subtitle="Every discovered prospect and incoming lead lands here with its source, campaign and processing status." />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'error' ? (
        <div className="space-y-5">
          <div className="card overflow-x-auto">
            <table className="min-w-full divide-y divide-ink-100"><thead className="bg-ink-50"><tr>{['File / source', 'Row', 'Reason', 'When', 'Status', ''].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
              <tbody className="divide-y divide-ink-100">{errs.map((e) => (
                <tr key={e.id}><td className="td">{e.file}<div className="text-xs text-ink-400">{e.source}</div></td><td className="td">{e.row}</td><td className="td">{e.reason}</td><td className="td">{fmtDateTime(e.at)}</td><td className="td"><StatusBadge value={e.status} /></td>
                  <td className="td text-right">{e.status === 'open' && <Button size="sm" variant="secondary" onClick={() => { updErr(e.id, { status: 'reprocessed' }); push('Record queued for re-processing'); }}>Re-process</Button>}</td></tr>))}</tbody></table>
          </div>
          <div className="card overflow-x-auto"><p className="border-b border-ink-100 px-4 py-3 text-sm font-semibold">Leads with processing errors</p>
            <table className="min-w-full divide-y divide-ink-100"><tbody className="divide-y divide-ink-100">{items.filter((l) => l.processing === 'error').map((l) => (
              <tr key={l.id}><td className="td">{l.company}<div className="text-xs text-ink-400">{l.name}</div></td><td className="td">{l.source}</td><td className="td text-right"><Button size="sm" variant="secondary" onClick={() => { update(l.id, { processing: 'collected' }); push('Lead returned to the processing queue'); }}>Retry</Button></td></tr>))}</tbody></table></div>
        </div>
      ) : (
        <CrudTable collection="leads" rows={rows} module="leadEngine" noun="lead" createLabel="Add lead" exportName="leads" fields={FIELDS} searchKeys={['name', 'company', 'email', 'source', 'campaign']}
          filters={[{ key: 'source', label: 'Source', options: SOURCES }, { key: 'status', label: 'Status', options: ['new', 'qualified', 'nurture', 'needs_review', 'unqualified', 'rejected'] }]}
          defaults={{ ...blank, source: 'Manual Entry', industry: 'IT', country: 'Bangladesh', city: 'Dhaka', companySize: '11-50' }} defaultSort={{ key: 'createdAt', dir: 'desc' }}
          columns={[
            { key: 'name', label: 'Lead', render: (l) => <div><p className="font-medium text-ink-900">{l.name}</p><p className="text-xs text-ink-500">{l.company}</p></div> },
            { key: 'source', label: 'Source', render: (l) => <div><p>{l.source}</p><p className="text-xs text-ink-400">{l.campaign}</p></div> },
            { key: 'status', label: 'Status', render: (l) => <StatusBadge value={l.status} /> },
            { key: 'processing', label: 'Processing', render: (l) => <StatusBadge value={l.processing} /> },
            { key: 'score', label: 'Score', render: (l) => <Badge tone={l.temperature === 'hot' ? 'danger' : l.temperature === 'warm' ? 'gold' : 'brand'}>{l.score} {humanize(l.temperature)}</Badge> },
            { key: 'createdAt', label: 'Collected', render: (l) => fmtDateTime(l.createdAt) },
          ]}
          rowActions={(l) => l.processing === 'collected' && <Button size="icon" variant="ghost" aria-label="Send to Lead Intelligence" icon={Send} className="text-brand-600" onClick={() => { update(l.id, { processing: 'sent', status: 'needs_review' }); push('Sent to Lead Intelligence'); }} />}
          toolbar={<Button variant="secondary" icon={Upload} onClick={() => setCsvOpen(true)}>Import CSV</Button>} />
      )}
      <Modal open={csvOpen} onClose={() => setCsvOpen(false)} title="Import leads from CSV" subtitle="Paste CSV text. Invalid rows go to the error queue." size="lg"
        footer={<><Button variant="secondary" onClick={() => setCsvOpen(false)}>Cancel</Button><Button icon={Upload} onClick={importCsv}>Import</Button></>}>
        <textarea className="input h-56 font-mono text-xs" value={csv} onChange={(e) => setCsv(e.target.value)} aria-label="CSV content" />
        <p className="mt-2 text-xs text-ink-500">Columns: name, email, company, phone, source (name and email are required). Up to 500 rows.</p>
      </Modal>
    </>
  );
}
