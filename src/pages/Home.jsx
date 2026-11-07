import { Link } from 'react-router-dom';
import { ArrowRight, Radar, ShieldCheck, ListChecks, Briefcase, Activity, Users, BarChart3, Building2, Trophy, Lock } from 'lucide-react';
import Logo from '@/components/common/Logo';
import { BRAND } from '@/config/brand';

const MODULES = [
  [Radar, 'Lead Engine', 'Discover prospects with AI and collect leads from every channel in one inbox.'],
  [ShieldCheck, 'Lead Intelligence', 'Verify, enrich, score and qualify leads so sales only sees what matters.'],
  [ListChecks, 'Task Hub', 'Route each lead to the right person with SLA timers and escalation.'],
  [Briefcase, 'Sales Intelligence', 'Research, AI drafts, pipeline, deals, proposals and quotations.'],
  [Activity, 'Activity Hub', 'Never miss a follow-up: timeline, calendar, templates and response SLA.'],
  [Users, 'Customer Growth', 'Customer 360°, health, referrals, cross-sell and upsell.'],
  [BarChart3, 'Growth Analytics', 'Marketing, sales and team insights with AI recommendations.'],
  [Building2, 'Business Operations', 'Onboarding, contracts, delivery and invoice tracking.'],
  [Trophy, 'Team Performance', 'Targets, workload, leaderboard and AI coaching.'],
  [Lock, 'Admin & Security', 'Roles, audit, approvals, integrations and system health.'],
];
const FLOW = ['Discover', 'Process', 'Distribute', 'Convert', 'Retain', 'Grow'];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-ink-100">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3"><Logo size={40} /><div className="leading-tight"><p className="font-bold text-brand-800">{BRAND.product}</p><p className="text-[11px] text-ink-500">by {BRAND.company}</p></div></div>
          <Link to="/login" className="rounded-lg bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900">Sign in</Link>
        </div>
      </header>
      <section className="mx-auto max-w-6xl px-5 py-16 text-center sm:py-24">
        <p className="mb-3 inline-block rounded-full bg-gold-100 px-3 py-1 text-xs font-semibold text-gold-700">AI-powered growth platform</p>
        <h1 className="mx-auto max-w-3xl text-4xl font-extrabold leading-tight text-brand-900 sm:text-5xl">{BRAND.tagline}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-base text-ink-500">From finding the first prospect to growing loyal customers, {BRAND.fullName} connects lead generation, sales, operations and analytics in one simple workspace.</p>
        <Link to="/login" className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-800 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-900">Enter workspace <ArrowRight size={16} /></Link>
        <ol className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-2 text-sm font-semibold text-brand-800">
          {FLOW.map((f, i) => <li key={f} className="flex items-center gap-2"><span className="rounded-full bg-brand-50 px-3 py-1">{f}</span>{i < FLOW.length - 1 && <ArrowRight size={14} className="text-gold-500" />}</li>)}
        </ol>
      </section>
      <section className="border-t border-ink-100 bg-ink-50 py-14">
        <div className="mx-auto grid max-w-6xl gap-4 px-5 sm:grid-cols-2 lg:grid-cols-5">
          {MODULES.map(([I, t, d]) => (
            <div key={t} className="card p-4"><span className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><I size={20} /></span><h3 className="text-sm font-semibold text-ink-900">{t}</h3><p className="mt-1 text-xs text-ink-500">{d}</p></div>
          ))}
        </div>
      </section>
    </div>
  );
}
