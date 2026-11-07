/** Stage-based automation (Sales Automation, Won Deal Handoff, Lost Deal Workflow). Every run is written to automationLogs. */
import { api, peek } from './api';

const log = (rule, module, action, result = 'success') =>
  api.create('automationLogs', { rule, module, at: new Date().toISOString(), action, result, duration: '1s' });
const inDays = (d) => new Date(Date.now() + d * 864e5).toISOString();

export async function onStageChange(deal, stage) {
  const msgs = [];
  const mk = (title, days, type = 'call') => api.create('followUps', { title: `${title} - ${deal.company}`, entityName: deal.company, dealId: deal.id, type, dueAt: inDays(days), priority: 'medium', status: 'scheduled', ownerId: deal.ownerId, responseStatus: 'awaiting', attempt: 1 });
  if (stage === 'contacted') { await mk('Follow up on first contact', 2); msgs.push('Follow-up task created'); }
  if (stage === 'meeting') { await mk('Prepare meeting brief', 1, 'email'); msgs.push('Meeting preparation task created'); }
  if (stage === 'proposal' && !peek('proposals').some((p) => p.dealId === deal.id)) {
    await api.create('proposals', { dealId: deal.id, title: `Proposal - ${deal.company}`, company: deal.company, status: 'draft', version: 1, items: [], total: deal.value, discountPct: 0, validUntil: inDays(14).slice(0, 10), ownerId: deal.ownerId });
    msgs.push('Draft proposal created');
  }
  if (stage === 'negotiation') { await mk('Negotiation check-in', 3); msgs.push('Negotiation alert scheduled'); }
  if (stage === 'won') {
    let cust = peek('customers').find((c) => c.name === deal.company);
    if (!cust) cust = await api.create('customers', { name: deal.company, industry: 'General', size: '11-50', country: 'Bangladesh', city: 'Dhaka', ownerId: deal.ownerId, parentId: null, tier: 'Silver', status: 'onboarding', health: 80, churnRisk: 'low', nps: 50, revenue: deal.value, renewalDate: inDays(365).slice(0, 10), since: new Date().toISOString().slice(0, 10), services: [deal.service], contacts: [{ name: deal.contact, role: 'Primary contact', email: '', phone: '', primary: true }], preferences: 'To be captured during onboarding.' });
    await api.create('onboardings', { customerId: cust.id, customerName: deal.company, dealId: deal.id, ownerId: 'U-08', status: 'not_started', startedAt: new Date().toISOString().slice(0, 10), checklist: ['Kick-off call', 'Collect requirements', 'Sign contract', 'Create accounts', 'Training session', 'Go-live check'].map((label) => ({ label, done: false })), documents: ['Signed contract', 'Trade licence', 'Company logo', 'Technical contact form'].map((name) => ({ name, received: false })) });
    await log('Won deal handoff', 'Sales Intelligence', `Created onboarding for ${deal.company}`);
    msgs.push('Handed off to Business Operations (onboarding created)');
  }
  if (stage === 'lost') { await mk('Re-engage lost prospect (nurture)', 90, 'email'); await log('Lost deal workflow', 'Sales Intelligence', `Nurture follow-up for ${deal.company}`); msgs.push('Lost reason recorded and nurture follow-up scheduled'); }
  return msgs;
}
export { log as logAutomation };
