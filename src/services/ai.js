/**
 * Mock AI helpers. They produce realistic drafts from CRM data so the UI can be demonstrated offline.
 * Replace each function with a call to the backend AI gateway when it is available.
 */
const first = (n = '') => n.split(' ')[0];

export const AI_TYPES = [
  { value: 'strategy', label: 'Personalized sales strategy' },
  { value: 'email', label: 'Email draft' },
  { value: 'whatsapp', label: 'WhatsApp draft' },
  { value: 'talking', label: 'Talking points' },
  { value: 'meeting', label: 'Meeting preparation' },
  { value: 'objection', label: 'Objection handling' },
  { value: 'next', label: 'Next best action' },
  { value: 'script', label: 'Call script' },
  { value: 'deal', label: 'Deal strategy' },
  { value: 'agenda', label: 'Meeting agenda' },
];
export const OBJECTIONS = ['Price is too high', 'Not the right time', 'We already have a vendor', 'Need to check with my team', 'Worried about implementation'];
const REPLY = {
  'Price is too high': 'Acknowledge the budget concern, then reframe around return: show how the solution pays back through saved hours and fewer lost leads. Offer a phased package or a fixed-price pilot.',
  'Not the right time': 'Ask what would make the timing right, quantify the cost of waiting, and propose a low-effort first step such as a discovery workshop.',
  'We already have a vendor': 'Respect the relationship, ask what is missing today, and position TechOf as a complement with a small proof-of-value project.',
  'Need to check with my team': 'Offer a short summary page and a joint call with the team. Ask who else should see the proposal and by when.',
  'Worried about implementation': 'Share the delivery plan, named team, milestones and two similar success stories. Offer a kick-off call before signing.',
};

export function generate({ type, deal, owner = 'Your sales executive', tone = 'Professional', objection }) {
  const c = deal?.company || 'the prospect';
  const n = first(deal?.contact) || 'there';
  const s = deal?.service || 'our solution';
  const v = deal?.value ? `$${deal.value.toLocaleString()}` : 'the proposed budget';
  const hello = tone === 'Friendly' ? `Hi ${n},` : `Hello ${n},`;
  const out = {
    strategy: `Strategy for ${c}\n\n1. Lead with the business problem: ${deal?.nextAction || 'manual processes slowing growth'}.\n2. Position ${s} as the fastest path to measurable results.\n3. Involve the decision-maker early and confirm timeline and budget (${v}).\n4. Share one relevant case study before the proposal.\n5. Agree a clear next step with a date.`,
    email: `Subject: ${s} for ${c}\n\n${hello}\n\nThank you for your time. Based on our conversation, ${c} could save significant effort with ${s}. I have outlined a short plan and timeline we can review together.\n\nWould Thursday afternoon work for a 20-minute call?\n\nBest regards,\n${owner}\nTechOf Solution`,
    whatsapp: `${hello} this is ${owner} from TechOf Solution. Following up on ${s} for ${c}. Shall I send the summary and available times for a quick call?`,
    talking: `Talking points - ${c}\n\n- Their goal: grow faster with less manual work\n- Pain points: scattered data, slow follow-up, limited reporting\n- Our fit: ${s} with local support\n- Proof: similar projects delivered on time\n- Ask: confirm decision-makers, budget range and start date`,
    meeting: `Meeting brief - ${c}\n\nContact: ${deal?.contact || '-'}\nStage: ${deal?.stage || '-'}   Value: ${v}\nObjective: confirm requirements and agree on a proposal date.\nQuestions: current tools? biggest bottleneck? who approves? target go-live?\nRisks: ${deal?.risk || 'low'} - ${deal?.competitor ? 'competing with ' + deal.competitor : 'no known competitor'}.`,
    objection: `Objection: "${objection || OBJECTIONS[0]}"\n\nSuggested response:\n${REPLY[objection || OBJECTIONS[0]]}`,
    next: `Next best action for ${c}\n\n${deal?.nextAction || 'Schedule a follow-up call'} within 48 hours.\nReason: last activity was recent enough to keep momentum, and the deal is in the ${deal?.stage || 'current'} stage with ${deal?.probability ?? 0}% probability.`,
    script: `Call script - ${c}\n\nOpen: "${hello} this is ${owner} from TechOf Solution. Do you have two minutes?"\nDiscover: "How do you manage leads and follow-ups today?"\nBridge: "Many ${deal?.industry || 'similar'} businesses use ${s} to fix that."\nClose: "Can we book a short demo this week?"`,
    deal: `Deal plan - ${c} (${v})\n\nStakeholders: ${(deal?.stakeholders || []).map((x) => x.name + ' (' + x.role + ')').join(', ') || 'to be mapped'}\nTimeline: close by ${deal?.expectedClose || 'TBD'}\nRisks: ${deal?.risk || 'low'} inactivity risk; ${deal?.competitor || 'no competitor'} noted\nFollow-up plan: call in 2 days, proposal review in 5 days, decision call in 10 days.`,
    agenda: `Agenda - ${c}\n\n1. Introductions (5 min)\n2. Their goals and challenges (10 min)\n3. ${s} overview and demo (15 min)\n4. Timeline, budget and next steps (10 min)`,
  };
  return out[type] || '';
}

export function summarize(messages = []) {
  if (!messages.length) return 'No messages to summarize.';
  const last = messages[messages.length - 1];
  return `${messages.length} messages exchanged. The customer asked about pricing and timeline and agreed to a meeting. Latest: "${last.text.slice(0, 80)}${last.text.length > 80 ? '...' : ''}"`;
}

export function research(lead) {
  return {
    company: lead.company, industry: lead.industry, website: 'www.' + lead.company.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 14) + '.com',
    summary: `${lead.company} is a ${lead.companySize}-employee ${lead.industry.toLowerCase()} business in ${lead.city}, ${lead.country}. Public information suggests it is investing in digital operations.`,
    painPoints: ['Manual reporting and spreadsheets', 'Slow response to inquiries', 'Limited visibility of customers and sales'],
    industryTrends: ['Customers expect faster digital service', 'Cloud tools replace spreadsheets'], industryChallenges: ['Rising operating costs', 'Hard to find skilled staff'], requirement: lead.need, opportunities: ['Website Development', 'Data Analytics Dashboard'], competitors: ['Regional competitor A', 'Regional competitor B'],
    decisionMakers: [`${lead.name} (${lead.title})`],
    sources: [{ title: `${lead.company} website`, url: 'https://example.com', date: new Date().toISOString().slice(0, 10), confidence: 'Medium' }],
  };
}

export const coachingFor = (m) => {
  const tips = [];
  if (m.responseMin > 60) tips.push({ area: 'Response time', tip: 'First response is slower than the 60-minute standard. Enable mobile alerts and use quick-reply templates.', training: 'Speed-to-lead workshop' });
  if (m.conversion < 25) tips.push({ area: 'Conversion', tip: 'Conversion is below team average. Review qualification questions and demo-to-proposal handoff.', training: 'Consultative selling' });
  if (m.taskRate < 70) tips.push({ area: 'Task completion', tip: 'Many tasks are overdue. Plan the daily queue each morning and clear blocked tasks.', training: 'Time and pipeline management' });
  if (m.targetPct < 60) tips.push({ area: 'Target gap', tip: 'Target achievement is behind plan. Focus on hot leads and deals in negotiation.', training: 'Closing techniques' });
  if (!tips.length) tips.push({ area: 'Keep it up', tip: 'Performance is on track. Share best practices with the team.', training: 'Peer mentoring' });
  return tips;
};
