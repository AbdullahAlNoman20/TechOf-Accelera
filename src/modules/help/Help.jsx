import { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Rocket, Search } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { GLOSSARY } from '@/config/guides';
import { storage } from '@/services/storage';
import useAuth from '@/hooks/useAuth';

const QUICK = {
  sales: ['Open My Day to see today\'s tasks.', 'Call the first lead. Log what happened in the Conversation Center.', 'Move the deal on the Deal Pipeline.', 'Create a quotation in Proposals & Quotes.'],
  manager: ['Open Home to see the team numbers.', 'Check Approvals for requests waiting for you.', 'Use Response Guard to catch late replies.', 'Open Performance and Coach to support your team.'],
  marketing: ['Open Lead Channels to see which channels work.', 'Create a saved search in Prospect Finder.', 'Open Marketing Results to compare campaigns.', 'Read AI Advisor for spending advice.'],
  support: ['Open Customer Health to see who needs help.', 'Click Check-in to schedule a call.', 'Open Onboarding for new customers.', 'Use Customer 360° for the full story of any customer.'],
  admin: ['Add people in Users and give each a role.', 'Review Roles & Access.', 'Turn on MFA in Security & Privacy.', 'Connect tools in Integrations.'],
  default: ['Open Home to see today\'s picture.', 'Use "Where is...?" at the top to find a page.', 'Open Explore Accelera to see every feature.', 'Read the guide under each page title.'],
};
const FAQ = [
  ['Is my data safe?', 'In this demo, data stays in your browser. In the live system the server protects it with roles, encryption and an audit log.'],
  ['Will AI send messages without asking?', 'No. AI writes drafts. A person approves before anything is sent, unless an admin turns on auto-send.'],
  ['What does "Preview" mean?', 'The feature works with sample logic now. The real AI or integration is added later. Each page guide explains how.'],
  ['I changed something by mistake.', 'Use Reset demo data in the top bar to restore the sample data. In the live system, ask an admin to check the Audit Logs.'],
  ['Does it work on my phone?', 'Yes. Use the bottom bar for Home, Leads, My Day and Deals. Tables turn into easy cards.'],
];

export default function Help() {
  const { user } = useAuth();
  const [q, setQ] = useState('');
  const role = ['sales'].includes(user.role) ? 'sales' : ['manager'].includes(user.role) ? 'manager' : ['marketing'].includes(user.role) ? 'marketing' : ['support', 'operations'].includes(user.role) ? 'support' : ['admin', 'super_admin'].includes(user.role) ? 'admin' : 'default';
  const words = GLOSSARY.filter(([w, m]) => !q || `${w} ${m}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Help Center" actions={<Button variant="secondary" icon={Rocket} onClick={() => { storage.remove(`tour:${user.id}`); window.location.reload(); }}>Replay welcome tour</Button>} />
      <div className="grid gap-5 lg:grid-cols-2">
        <Card title="Quick start for your role" subtitle="Four steps to be productive today"><ol className="list-decimal space-y-2 pl-5 text-sm text-ink-700">{QUICK[role].map((s) => <li key={s}>{s}</li>)}</ol></Card>
        <Card title="How the pages help you" subtitle="Every page has a guide under its title"><ul className="space-y-2 text-sm text-ink-700"><li><Badge tone="brand">How to use</Badge> simple steps for that page</li><li><Badge tone="brand">What you need</Badge> what to prepare for the best result</li><li><Badge tone="gold">Coming next</Badge> where AI, automation and integrations will work later, as step-by-step notes</li></ul><Link to="/app/explore" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-700"><BookOpen size={15} />Explore every feature</Link></Card>
        <Card title="Words explained" className="lg:col-span-2" action={<div className="relative w-56"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" /><input className="input pl-8" placeholder="Find a word" aria-label="Search words" value={q} onChange={(e) => setQ(e.target.value)} /></div>}>
          <dl className="grid gap-3 sm:grid-cols-2">{words.map(([w, m]) => <div key={w} className="rounded-lg bg-ink-50 p-3"><dt className="text-sm font-semibold text-ink-900">{w}</dt><dd className="text-sm text-ink-600">{m}</dd></div>)}</dl></Card>
        <Card title="Common questions" className="lg:col-span-2"><ul className="divide-y divide-ink-100">{FAQ.map(([a, b]) => <li key={a} className="py-3"><p className="text-sm font-semibold text-ink-900">{a}</p><p className="text-sm text-ink-600">{b}</p></li>)}</ul></Card>
        <Card title="For the developer team" subtitle="How AI, automation and the backend plug in" className="lg:col-span-2" bodyClass="p-4"><ol className="list-decimal space-y-1.5 pl-5 text-sm text-ink-700"><li>All screens read and write through <code className="rounded bg-ink-100 px-1">src/services/api.js</code>. Set <code className="rounded bg-ink-100 px-1">VITE_API_URL</code> to switch from sample data to the real API.</li><li>Replace the sample AI in <code className="rounded bg-ink-100 px-1">src/services/ai.js</code> with calls to your AI service.</li><li>Move stage rules, scoring, assignment and SLA from <code className="rounded bg-ink-100 px-1">src/services</code> to server jobs.</li><li>Each page guide lists its own "Coming next" steps. Follow them in order.</li></ol><p className="mt-3 rounded bg-gold-50 p-2 text-xs text-gold-700"><b>NB:</b> The server must enforce roles and approvals. The screen only hides buttons.</p></Card>
      </div>
    </>
  );
}
