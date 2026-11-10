import { lazy } from 'react';

const L = (loader) => lazy(loader);
const Explore = L(() => import('@/modules/help/Explore'));
const Help = L(() => import('@/modules/help/Help'));
const Settings = L(() => import('@/modules/help/Settings'));
const Dashboard = L(() => import('@/modules/dashboard/Dashboard'));
const LeadInbox = L(() => import('@/modules/lead-engine/LeadInbox'));
const Discovery = L(() => import('@/modules/lead-engine/Discovery'));
const Sources = L(() => import('@/modules/lead-engine/Sources'));
const Verification = L(() => import('@/modules/lead-intelligence/Verification'));
const Scoring = L(() => import('@/modules/lead-intelligence/Scoring'));
const Rules = L(() => import('@/modules/lead-intelligence/Rules'));
const Segments = L(() => import('@/modules/lead-intelligence/Segments'));
const Learning = L(() => import('@/modules/lead-intelligence/Learning'));
const Tasks = L(() => import('@/modules/task-hub/Tasks'));
const MyQueue = L(() => import('@/modules/task-hub/MyQueue'));
const AssignmentRules = L(() => import('@/modules/task-hub/AssignmentRules'));
const Sla = L(() => import('@/modules/task-hub/Sla'));
const Pipeline = L(() => import('@/modules/sales-intelligence/Pipeline'));
const DealDetail = L(() => import('@/modules/sales-intelligence/DealDetail'));
const Research = L(() => import('@/modules/sales-intelligence/Research'));
const Assistant = L(() => import('@/modules/sales-intelligence/Assistant'));
const Conversations = L(() => import('@/modules/sales-intelligence/Conversations'));
const Proposals = L(() => import('@/modules/sales-intelligence/Proposals'));
const Catalogue = L(() => import('@/modules/sales-intelligence/Catalogue'));
const Timeline = L(() => import('@/modules/activity-hub/Timeline'));
const FollowUps = L(() => import('@/modules/activity-hub/FollowUps'));
const Calendar = L(() => import('@/modules/activity-hub/Calendar'));
const Templates = L(() => import('@/modules/activity-hub/Templates'));
const Customers = L(() => import('@/modules/customer-growth/Customers'));
const Customer360 = L(() => import('@/modules/customer-growth/Customer360'));
const CustomerHealth = L(() => import('@/modules/customer-growth/Health'));
const Referrals = L(() => import('@/modules/customer-growth/Referrals'));
const Expansion = L(() => import('@/modules/customer-growth/Expansion'));
const Network = L(() => import('@/modules/customer-growth/Network'));
const Marketing = L(() => import('@/modules/growth-analytics/Marketing'));
const SalesAnalytics = L(() => import('@/modules/growth-analytics/SalesAnalytics'));
const TeamAnalytics = L(() => import('@/modules/growth-analytics/TeamAnalytics'));
const Recommendations = L(() => import('@/modules/growth-analytics/Recommendations'));
const Reports = L(() => import('@/modules/growth-analytics/Reports'));
const Accounts = L(() => import('@/modules/business-operations/Accounts'));
const Onboarding = L(() => import('@/modules/business-operations/Onboarding'));
const Contracts = L(() => import('@/modules/business-operations/Contracts'));
const Invoices = L(() => import('@/modules/business-operations/Invoices'));
const Overview = L(() => import('@/modules/team-performance/Overview'));
const Targets = L(() => import('@/modules/team-performance/Targets'));
const Leaderboard = L(() => import('@/modules/team-performance/Leaderboard'));
const Workload = L(() => import('@/modules/team-performance/Workload'));
const Coaching = L(() => import('@/modules/team-performance/Coaching'));
const Users = L(() => import('@/modules/admin/Users'));
const Roles = L(() => import('@/modules/admin/Roles'));
const Security = L(() => import('@/modules/admin/Security'));
const Audit = L(() => import('@/modules/admin/Audit'));
const Automation = L(() => import('@/modules/admin/Automation'));
const Approvals = L(() => import('@/modules/admin/Approvals'));
const Integrations = L(() => import('@/modules/admin/Integrations'));
const SystemHealth = L(() => import('@/modules/admin/Health'));

/** Paths are relative to /app. `module` is the access key checked by ProtectedRoute. */
export const appRoutes = [
  { path: 'dashboard', element: <Dashboard /> },
  { path: 'explore', element: <Explore /> },
  { path: 'help', element: <Help /> },
  { path: 'settings', element: <Settings /> },
  { path: 'lead-engine/inbox', module: 'leadEngine', element: <LeadInbox /> },
  { path: 'lead-engine/discovery', module: 'leadEngine', element: <Discovery /> },
  { path: 'lead-engine/sources', module: 'leadEngine', element: <Sources /> },
  { path: 'lead-intelligence/verification', module: 'leadIntel', element: <Verification /> },
  { path: 'lead-intelligence/scoring', module: 'leadIntel', element: <Scoring /> },
  { path: 'lead-intelligence/rules', module: 'leadIntel', element: <Rules /> },
  { path: 'lead-intelligence/segments', module: 'leadIntel', element: <Segments /> },
  { path: 'lead-intelligence/learning', module: 'leadIntel', element: <Learning /> },
  { path: 'task-hub/tasks', module: 'taskHub', element: <Tasks /> },
  { path: 'task-hub/my-queue', module: 'taskHub', element: <MyQueue /> },
  { path: 'task-hub/assignment-rules', module: 'taskHub', element: <AssignmentRules /> },
  { path: 'task-hub/sla', module: 'taskHub', element: <Sla /> },
  { path: 'sales/pipeline', module: 'sales', element: <Pipeline /> },
  { path: 'sales/deals/:id', module: 'sales', element: <DealDetail /> },
  { path: 'sales/research', module: 'sales', element: <Research /> },
  { path: 'sales/assistant', module: 'sales', element: <Assistant /> },
  { path: 'sales/conversations', module: 'sales', element: <Conversations /> },
  { path: 'sales/proposals', module: 'sales', element: <Proposals /> },
  { path: 'sales/catalogue', module: 'sales', element: <Catalogue /> },
  { path: 'activity/timeline', module: 'activity', element: <Timeline /> },
  { path: 'activity/follow-ups', module: 'activity', element: <FollowUps /> },
  { path: 'activity/calendar', module: 'activity', element: <Calendar /> },
  { path: 'activity/templates', module: 'activity', element: <Templates /> },
  { path: 'customers/list', module: 'customers', element: <Customers /> },
  { path: 'customers/health', module: 'customers', element: <CustomerHealth /> },
  { path: 'customers/referrals', module: 'customers', element: <Referrals /> },
  { path: 'customers/expansion', module: 'customers', element: <Expansion /> },
  { path: 'customers/network', module: 'customers', element: <Network /> },
  { path: 'customers/:id', module: 'customers', element: <Customer360 /> },
  { path: 'analytics/marketing', module: 'analytics', element: <Marketing /> },
  { path: 'analytics/sales', module: 'analytics', element: <SalesAnalytics /> },
  { path: 'analytics/team', module: 'analytics', element: <TeamAnalytics /> },
  { path: 'analytics/recommendations', module: 'analytics', element: <Recommendations /> },
  { path: 'analytics/reports', module: 'analytics', element: <Reports /> },
  { path: 'operations/accounts', module: 'operations', element: <Accounts /> },
  { path: 'operations/onboarding', module: 'operations', element: <Onboarding /> },
  { path: 'operations/contracts', module: 'operations', element: <Contracts /> },
  { path: 'operations/invoices', module: 'operations', element: <Invoices /> },
  { path: 'performance/overview', module: 'performance', element: <Overview /> },
  { path: 'performance/targets', module: 'performance', element: <Targets /> },
  { path: 'performance/leaderboard', module: 'performance', element: <Leaderboard /> },
  { path: 'performance/workload', module: 'performance', element: <Workload /> },
  { path: 'performance/coaching', module: 'performance', element: <Coaching /> },
  { path: 'admin/users', module: 'admin', element: <Users /> },
  { path: 'admin/roles', module: 'admin', element: <Roles /> },
  { path: 'admin/security', module: 'admin', element: <Security /> },
  { path: 'admin/audit', module: 'admin', element: <Audit /> },
  { path: 'admin/automation', module: 'admin', element: <Automation /> },
  { path: 'admin/approvals', module: 'admin', element: <Approvals /> },
  { path: 'admin/integrations', module: 'admin', element: <Integrations /> },
  { path: 'admin/health', module: 'admin', element: <SystemHealth /> },
];
