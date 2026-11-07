import {
  LayoutDashboard, Radar, Inbox, Compass, Plug, ShieldCheck, ScanSearch, Gauge, SlidersHorizontal, Layers, GraduationCap,
  ListChecks, KanbanSquare, GitBranch, Timer, CalendarCheck, Briefcase, Handshake, Search, Sparkles, MessagesSquare, FileText, Package,
  Activity, History, Repeat, CalendarDays, Mail, Users, HeartPulse, Gift, TrendingUp, Network, BarChart3, LineChart, UserCog, Lightbulb, FileBarChart,
  Building2, ClipboardCheck, FileSignature, Receipt, Trophy, Target, Scale, Award, Lock, ScrollText, Workflow, BadgeCheck, Server,
} from 'lucide-react';

/** Sidebar structure. `module` maps to role access keys in roles.json. */
export const NAV = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { group: 'Lead Engine', module: 'leadEngine', icon: Radar, items: [
    { to: '/app/lead-engine/inbox', label: 'Lead Inbox', icon: Inbox },
    { to: '/app/lead-engine/discovery', label: 'AI Discovery', icon: Compass },
    { to: '/app/lead-engine/sources', label: 'Channels & Sources', icon: Plug },
  ] },
  { group: 'Lead Intelligence', module: 'leadIntel', icon: ShieldCheck, items: [
    { to: '/app/lead-intelligence/verification', label: 'Verification', icon: ScanSearch },
    { to: '/app/lead-intelligence/scoring', label: 'Scoring & Priority', icon: Gauge },
    { to: '/app/lead-intelligence/rules', label: 'Qualification Rules', icon: SlidersHorizontal },
    { to: '/app/lead-intelligence/segments', label: 'Segments', icon: Layers },
    { to: '/app/lead-intelligence/learning', label: 'Learning', icon: GraduationCap },
  ] },
  { group: 'Task Hub', module: 'taskHub', icon: ListChecks, items: [
    { to: '/app/task-hub/tasks', label: 'Tasks', icon: KanbanSquare },
    { to: '/app/task-hub/my-queue', label: 'My Daily Queue', icon: CalendarCheck },
    { to: '/app/task-hub/assignment-rules', label: 'Assignment Rules', icon: GitBranch },
    { to: '/app/task-hub/sla', label: 'SLA & Escalation', icon: Timer },
  ] },
  { group: 'Sales Intelligence', module: 'sales', icon: Briefcase, items: [
    { to: '/app/sales/pipeline', label: 'Pipeline', icon: KanbanSquare },
    { to: '/app/sales/deals', label: 'Deals', icon: Handshake },
    { to: '/app/sales/research', label: 'Prospect Research', icon: Search },
    { to: '/app/sales/assistant', label: 'AI Sales Assistant', icon: Sparkles },
    { to: '/app/sales/conversations', label: 'Conversations', icon: MessagesSquare },
    { to: '/app/sales/proposals', label: 'Proposals & Quotes', icon: FileText },
    { to: '/app/sales/catalogue', label: 'Catalogue & Pricing', icon: Package },
  ] },
  { group: 'Activity Hub', module: 'activity', icon: Activity, items: [
    { to: '/app/activity/timeline', label: 'Activity Timeline', icon: History },
    { to: '/app/activity/follow-ups', label: 'Follow-ups', icon: Repeat },
    { to: '/app/activity/calendar', label: 'Calendar & Meetings', icon: CalendarDays },
    { to: '/app/activity/templates', label: 'Templates', icon: Mail },
    { to: '/app/activity/response-sla', label: 'Response SLA', icon: Timer },
  ] },
  { group: 'Customer Growth', module: 'customers', icon: Users, items: [
    { to: '/app/customers/list', label: 'Customer 360°', icon: Users },
    { to: '/app/customers/health', label: 'Health & Retention', icon: HeartPulse },
    { to: '/app/customers/referrals', label: 'Referrals', icon: Gift },
    { to: '/app/customers/expansion', label: 'Cross-sell & Upsell', icon: TrendingUp },
    { to: '/app/customers/network', label: 'Related Businesses', icon: Network },
  ] },
  { group: 'Growth Analytics', module: 'analytics', icon: BarChart3, items: [
    { to: '/app/analytics/marketing', label: 'Marketing', icon: LineChart },
    { to: '/app/analytics/sales', label: 'Sales & Deals', icon: BarChart3 },
    { to: '/app/analytics/team', label: 'Team & Tasks', icon: UserCog },
    { to: '/app/analytics/recommendations', label: 'AI Recommendations', icon: Lightbulb },
    { to: '/app/analytics/reports', label: 'Reports & Alerts', icon: FileBarChart },
  ] },
  { group: 'Business Operations', module: 'operations', icon: Building2, items: [
    { to: '/app/operations/accounts', label: 'Accounts & Contacts', icon: Building2 },
    { to: '/app/operations/onboarding', label: 'Onboarding', icon: ClipboardCheck },
    { to: '/app/operations/contracts', label: 'Contracts & Delivery', icon: FileSignature },
    { to: '/app/operations/invoices', label: 'Invoices & Payments', icon: Receipt },
  ] },
  { group: 'Team Performance', module: 'performance', icon: Trophy, items: [
    { to: '/app/performance/overview', label: 'Dashboards', icon: Gauge },
    { to: '/app/performance/targets', label: 'Targets', icon: Target },
    { to: '/app/performance/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/app/performance/workload', label: 'Workload', icon: Scale },
    { to: '/app/performance/coaching', label: 'AI Coaching', icon: Award },
  ] },
  { group: 'Admin & Security', module: 'admin', icon: Lock, items: [
    { to: '/app/admin/users', label: 'Users', icon: Users },
    { to: '/app/admin/roles', label: 'Roles & Access', icon: Lock },
    { to: '/app/admin/security', label: 'Security & Privacy', icon: ShieldCheck },
    { to: '/app/admin/audit', label: 'Audit Logs', icon: ScrollText },
    { to: '/app/admin/automation', label: 'Automation Governance', icon: Workflow },
    { to: '/app/admin/approvals', label: 'Approvals', icon: BadgeCheck },
    { to: '/app/admin/integrations', label: 'Integrations', icon: Plug },
    { to: '/app/admin/health', label: 'System Health', icon: Server },
  ] },
];
export const MODULES = ['leadEngine', 'leadIntel', 'taskHub', 'sales', 'activity', 'customers', 'analytics', 'operations', 'performance', 'admin'];
export const MODULE_LABEL = { leadEngine: 'Lead Engine', leadIntel: 'Lead Intelligence', taskHub: 'Task Hub', sales: 'Sales Intelligence', activity: 'Activity Hub', customers: 'Customer Growth', analytics: 'Growth Analytics', operations: 'Business Operations', performance: 'Team Performance', admin: 'Admin & Security' };
