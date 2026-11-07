/** Lead scoring helpers (rules-based demo model). */
export const temperature = (s) => (s >= 75 ? 'hot' : s >= 50 ? 'warm' : 'cold');

export function scoreLead(lead, rules = []) {
  let base = Math.round(lead.fit * 0.4 + lead.intent * 0.35 + lead.engagement * 0.25);
  const active = rules.filter((r) => r.active);
  const ind = active.find((r) => r.factor === 'authority');
  if (ind && /ceo|director|owner|founder|managing/i.test(lead.title || '')) base += Math.round(ind.points / 3);
  if (lead.budget === 'likely') base += 4;
  if (lead.budget === 'unlikely') base -= 6;
  if (lead.checks?.spam) base -= 40;
  if (lead.checks?.email === 'invalid') base -= 15;
  return Math.max(0, Math.min(100, base));
}

export function segmentFor(score, lead) {
  if (lead.checks?.spam || lead.status === 'rejected') return 'rejected';
  if (score >= 70) return 'qualified';
  if (score >= 45) return 'nurture';
  return 'unqualified';
}

export const readiness = (l) => (l.temperature === 'hot' && l.authority !== 'unknown' ? 'Ready for sales contact' : l.temperature === 'cold' ? 'Nurture first' : 'Ready after one more touch');
