import { humanize } from './format';

const TONES = {
  hot: 'danger', warm: 'gold', cold: 'brand',
  qualified: 'success', unqualified: 'neutral', nurture: 'teal', needs_review: 'warning', rejected: 'danger', new: 'brand',
  connected: 'success', disconnected: 'neutral', error: 'danger', active: 'success', paused: 'neutral', completed: 'success', success: 'success', failed: 'danger', partial: 'warning',
  high: 'danger', medium: 'gold', low: 'neutral', open: 'warning', resolved: 'success', escalated: 'danger', investigating: 'warning',
  assigned: 'brand', accepted: 'teal', working: 'gold', waiting: 'neutral',
  won: 'success', lost: 'danger', contacted: 'brand', meeting: 'teal', demo: 'teal', proposal: 'gold', negotiation: 'warning',
  draft: 'neutral', sent: 'brand', viewed: 'teal', accepted_: 'success', pending_approval: 'warning', expired: 'danger', pending: 'warning', approved: 'success',
  paid: 'success', overdue: 'danger', due: 'warning', expiring: 'warning', at_risk: 'danger', onboarding: 'teal',
  scheduled: 'brand', done: 'success', missed: 'danger', granted: 'success', withdrawn: 'neutral', delivered: 'success', retrying: 'warning',
  in_progress: 'gold', not_started: 'neutral', identified: 'brand', lead_created: 'success', in_pipeline: 'teal', converted: 'success', awaiting_approval: 'warning',
  collected: 'neutral', processing: 'gold', valid: 'success', invalid: 'danger', unverified: 'neutral', accepted_proposal: 'success', dismissed: 'neutral',
};
export const toneOf = (v) => TONES[String(v).toLowerCase()] || 'neutral';
export const label = (v) => humanize(v);

export const STAGES = ['new', 'contacted', 'qualified', 'meeting', 'demo', 'proposal', 'negotiation', 'won', 'lost'];
export const TASK_STATUSES = ['assigned', 'accepted', 'working', 'waiting', 'completed', 'escalated'];
