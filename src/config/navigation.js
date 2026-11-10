import {
  LayoutDashboard, Radar, Inbox, Compass, Plug, ShieldCheck, ScanSearch, Gauge, SlidersHorizontal, Layers, GraduationCap,
  ListChecks, KanbanSquare, GitBranch, Timer, CalendarCheck, Briefcase, Search, Sparkles, MessagesSquare, FileText, Package,
  Activity, History, Repeat, CalendarDays, Mail, Users, HeartPulse, Gift, TrendingUp, Network, BarChart3, LineChart, UserCog, Lightbulb, FileBarChart,
  Building2, ClipboardCheck, FileSignature, Receipt, Trophy, Target, Scale, Award, Lock, ScrollText, Workflow, BadgeCheck, Server, LifeBuoy, Telescope, Settings,
} from 'lucide-react';

/** Sidebar structure. `module` maps to role access keys in roles.json. `hint` is the one-line promise of each module. */
export const NAV = [
  { to: '/app/dashboard', label: 'Home', icon: LayoutDashboard },
  { group: 'Lead Engine', hint: 'Find & collect leads', module: 'leadEngine', icon: Radar, items: [
    { to: '/app/lead-engine/inbox', label: 'Lead Inbox', icon: Inbox },
    { to: '/app/lead-engine/discovery', label: 'Prospect Finder', icon: Compass },
    { to: '/app/lead-engine/sources', label: 'Lead Channels', icon: Plug },
  ] },
  { group: 'Lead Intelligence', hint: 'Know which leads matter', module: 'leadIntel', icon: ShieldCheck, items: [
    { to: '/app/lead-intelligence/verification', label: 'Lead Check', icon: ScanSearch },
    { to: '/app/lead-intelligence/scoring', label: 'Hot Leads Queue', icon: Gauge },
    { to: '/app/lead-intelligence/rules', label: 'Scoring Rules', icon: SlidersHorizontal },
    { to: '/app/lead-intelligence/segments', label: 'Smart Lead Groups', icon: Layers },
    { to: '/app/lead-intelligence/learning', label: 'Smart Learning', icon: GraduationCap },
  ] },
  { group: 'Task Hub', hint: 'The right lead, the right person', module: 'taskHub', icon: ListChecks, items: [
    { to: '/app/task-hub/my-queue', label: 'My Day', icon: CalendarCheck },
    { to: '/app/task-hub/tasks', label: 'Task Board', icon: KanbanSquare },
    { to: '/app/task-hub/assignment-rules', label: 'Auto-Assign Rules', icon: GitBranch },
    { to: '/app/task-hub/sla', label: 'Response Guard', icon: Timer },
  ] },
  { group: 'Sales Intelligence', hint: 'Win more deals', module: 'sales', icon: Briefcase, items: [
    { to: '/app/sales/pipeline', label: 'Deal Pipeline', icon: KanbanSquare },
    { to: '/app/sales/research', label: 'Prospect Insights', icon: Search },
    { to: '/app/sales/assistant', label: 'Sales Copilot', icon: Sparkles },
    { to: '/app/sales/conversations', label: 'Conversation Center', icon: MessagesSquare },
    { to: '/app/sales/proposals', label: 'Proposals & Quotes', icon: FileText },
    { to: '/app/sales/catalogue', label: 'Catalogue & Pricing', icon: Package },
  ] },
  { group: 'Activity Hub', hint: 'Never miss a follow-up', module: 'activity', icon: Activity, items: [
    { to: '/app/activity/follow-ups', label: 'Follow-up Planner', icon: Repeat },
    { to: '/app/activity/calendar', label: 'Calendar & Meetings', icon: CalendarDays },
    { to: '/app/activity/timeline', label: 'Activity Timeline', icon: History },
    { to: '/app/activity/templates', label: 'Message Templates', icon: Mail },
  ] },
  { group: 'Customer Growth', hint: 'Keep customers. Grow them.', module: 'customers', icon: Users, items: [
    { to: '/app/customers/list', label: 'Customer 360°', icon: Users },
    { to: '/app/customers/health', label: 'Customer Health', icon: HeartPulse },
    { to: '/app/customers/referrals', label: 'Referrals', icon: Gift },
    { to: '/app/customers/expansion', label: 'Growth Opportunities', icon: TrendingUp },
    { to: '/app/customers/network', label: 'Network Finder', icon: Network },
  ] },
  { group: 'Growth Analytics', hint: 'See what works', module: 'analytics', icon: BarChart3, items: [
    { to: '/app/analytics/recommendations', label: 'AI Advisor', icon: Lightbulb },
    { to: '/app/analytics/marketing', label: 'Marketing Results', icon: LineChart },
    { to: '/app/analytics/sales', label: 'Sales Results', icon: BarChart3 },
    { to: '/app/analytics/team', label: 'Team & Task Insights', icon: UserCog },
    { to: '/app/analytics/reports', label: 'Reports & Alerts', icon: FileBarChart },
  ] },
  { group: 'Business Operations', hint: 'From "yes" to delivered', module: 'operations', icon: Building2, items: [
    { to: '/app/operations/onboarding', label: 'Onboarding', icon: ClipboardCheck },
    { to: '/app/operations/contracts', label: 'Contracts & Delivery', icon: FileSignature },
    { to: '/app/operations/invoices', label: 'Invoices & Payments', icon: Receipt },
    { to: '/app/operations/accounts', label: 'Account Structure', icon: Building2 },
  ] },
  { group: 'Team Performance', hint: 'A team that grows', module: 'performance', icon: Trophy, items: [
    { to: '/app/performance/overview', label: 'Performance', icon: Gauge },
    { to: '/app/performance/targets', label: 'Targets', icon: Target },
    { to: '/app/performance/leaderboard', label: 'Leaderboard', icon: Trophy },
    { to: '/app/performance/workload', label: 'Workload', icon: Scale },
    { to: '/app/performance/coaching', label: 'Coach', icon: Award },
  ] },
  { group: 'Admin & Security', hint: 'Safe, controlled, reliable', module: 'admin', icon: Lock, items: [
    { to: '/app/admin/users', label: 'Users', icon: Users },
    { to: '/app/admin/roles', label: 'Roles & Access', icon: Lock },
    { to: '/app/admin/approvals', label: 'Approvals', icon: BadgeCheck },
    { to: '/app/admin/security', label: 'Security & Privacy', icon: ShieldCheck },
    { to: '/app/admin/automation', label: 'Automation & AI Controls', icon: Workflow },
    { to: '/app/admin/integrations', label: 'Integrations', icon: Plug },
    { to: '/app/admin/health', label: 'System Health', icon: Server },
    { to: '/app/admin/audit', label: 'Audit Logs', icon: ScrollText },
  ] },
];
export const HELP_NAV = [
  { to: '/app/explore', label: 'Explore Accelera', icon: Telescope },
  { to: '/app/help', label: 'Help Center', icon: LifeBuoy },
  { to: '/app/settings', label: 'My Settings', icon: Settings },
];
export const MODULES = ['leadEngine', 'leadIntel', 'taskHub', 'sales', 'activity', 'customers', 'analytics', 'operations', 'performance', 'admin'];
export const MODULE_LABEL = { leadEngine: 'Lead Engine', leadIntel: 'Lead Intelligence', taskHub: 'Task Hub', sales: 'Sales Intelligence', activity: 'Activity Hub', customers: 'Customer Growth', analytics: 'Growth Analytics', operations: 'Business Operations', performance: 'Team Performance', admin: 'Admin & Security' };
