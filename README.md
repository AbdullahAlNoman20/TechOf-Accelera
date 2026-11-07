# TechOf Accelera AI CRM - Frontend

> **Accelerate Every Lead. Automate Every Growth.**
> AI-powered lead generation, sales, customer management and business automation platform by **TechOf Solution**.

This is the complete **frontend** of the Accelera SRS (all 10 modules). It runs entirely on **sample JSON data + localStorage**, so it works today without a backend. A backend developer can connect a real API later by changing **one file** (`src/services/api.js`) - no page code needs to change.

## Quick start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build in /dist
```

Requires Node.js 18+.

**Demo login:** open `/login`, click any demo account (password for all: `Demo@123`).

| Account | Role | What you will see |
|---|---|---|
| tanvir@techofsolution.com | Super Admin | Everything |
| nusrat@techofsolution.com | Admin | Everything |
| imran@techofsolution.com | Manager | All business modules, team views |
| sadia@ / rafiq@ / mehedi@techofsolution.com | Sales | Own leads, tasks, deals |
| farzana@techofsolution.com | Marketing | Lead Engine, campaigns, analytics |
| shamim@techofsolution.com | Support | Customers, tasks, activity |
| anika@techofsolution.com | Analyst | Read-only analytics |
| kamal@techofsolution.com | Operations (custom role) | Onboarding, contracts, invoices |

Use **Reset demo data** in the top bar to restore the original sample data.

## Module map (SRS to screens)

| SRS module | Routes (`/app/...`) | Main features implemented |
|---|---|---|
| 01 Lead Engine | `lead-engine/inbox, discovery, sources` | Unified inbox, manual entry, CSV import + error queue, ICP saved searches, run discovery, history and coverage, channel health, attribution |
| 02 Lead Intelligence | `lead-intelligence/verification, scoring, rules, segments, learning` | Duplicate/spam/invalid checks, merge, enrich, normalize, scoring, Hot/Warm/Cold, BANT, overrides with reason, segments, requalification, calibration |
| 03 Task Hub | `task-hub/tasks, my-queue, assignment-rules, sla` | Kanban + list, lifecycle, dependencies, notes/comments/attachments/history, handoff, assignment rules + auto-assign, SLA timers, escalation |
| 04 Sales Intelligence | `sales/pipeline, deals, deals/:id, research, assistant, conversations, proposals, catalogue` | Pipeline with stage automation, deal risk, stakeholders, research with sources, AI drafts + approval, conversation center, quotations with discount approval, PDF print |
| 05 Activity Hub | `activity/timeline, follow-ups, calendar, templates, response-sla` | Timeline, missed follow-up detection, calendar with conflict check, AI meeting summary, templates, response SLA |
| 06 Customer Growth | `customers/list, :id, health, referrals, expansion, network` | Customer 360°, health + churn, referrals + campaigns, cross/upsell to pipeline, related-business leads with consent check |
| 07 Growth Analytics | `analytics/marketing, sales, team, recommendations, reports` | CPL/CPQL, funnel, attribution, bottlenecks, forecast, AI recommendations with approval, reports, alerts |
| 08 Business Operations | `operations/accounts, onboarding, contracts, invoices` | Accounts + hierarchy + contacts, onboarding checklist and documents, contracts + renewals, delivery, invoices + sync |
| 09 Team Performance | `performance/overview, targets, leaderboard, workload, coaching` | Role-based dashboards, targets, leaderboard + recognition, workload balancing, AI coaching |
| 10 Admin & Security | `admin/users, roles, security, audit, automation, approvals, integrations, health` | RBAC matrix, security policies, consent/retention/data requests, audit log, approval rules, AI controls, automation logs, integrations, system health |

## Folder structure

```
src/
  assets/            logo
  config/            brand.js, navigation.js (sidebar + module keys)
  data/              sample JSON (one file per collection) + index.js
  services/          api.js (data layer), storage.js, ai.js, automation.js, scoring.js, assignment.js
  context/           AuthContext (login, RBAC), ToastContext
  hooks/             useCollection, useAuth, useToast
  utils/             format, validators, sanitize, status, scope
  components/
    ui/              Button, Badge, Card, Modal, Tabs, StatCard ...
    data/            DataTable, FormModal, CrudTable, CrudPage (config-driven lists and forms)
    charts/          dependency-free SVG charts
    layout/          AppShell, Sidebar, Topbar
    common/          Ref, Logo, ProtectedRoute
  modules/           one folder per SRS module (pages)
  pages/             Home, Login, NotFound
  routes/            route table (path -> page, required module access)
```

## How the data layer works

All pages read and write through `useCollection('leads')` / `api.create(...)`.

* **Default (no backend):** `api.js` seeds each collection from `src/data/*.json` into `localStorage` (keys `accelera:db:<collection>`). Every create/update/delete is also written to the `auditLogs` collection.
* **With a backend:** copy `.env.example` to `.env` and set `VITE_API_URL=https://your-api.example.com`. The same `api` calls then use the REST adapter inside `api.js`.

### REST contract expected by the frontend

For every collection name below:

| Method | Path | Purpose |
|---|---|---|
| GET | `/{collection}` | Return a JSON array of all records |
| GET | `/{collection}/{id}` | Return one record |
| POST | `/{collection}` | Create (body = record, server assigns `id`, returns the record) |
| PATCH | `/{collection}/{id}` | Partial update, returns the updated record |
| DELETE | `/{collection}/{id}` | Delete (204) |

Authentication: the frontend sends `Authorization: Bearer <token>` (read from `storage.get('token')`). The demo login in `AuthContext.jsx` should be replaced by a call to `POST /auth/login`, returning `{ token, user }`. Role permissions come from the `roles` collection (`access` per module: `none | view | own | full`). The server must enforce the same rules (the UI check is only a convenience).

Records keep the exact field names shown in `src/data/<collection>.json`, so those files double as the API schema examples. Ids look like `LD-1001`. For large collections add server-side pagination later and extend `DataTable` (client-side paging today).

Collections and sample record counts:

| Collection | Records |
|---|---|
| `activities` | 60 |
| `aiControls` | 7 |
| `approvalRules` | 6 |
| `approvals` | 5 |
| `assignmentRules` | 6 |
| `auditLogs` | 40 |
| `automationLogs` | 20 |
| `backups` | 7 |
| `campaigns` | 8 |
| `channels` | 18 |
| `configVersions` | 4 |
| `consents` | 12 |
| `contracts` | 11 |
| `conversations` | 14 |
| `customers` | 14 |
| `dataRequests` | 3 |
| `deals` | 28 |
| `deliveries` | 8 |
| `discoveryRuns` | 14 |
| `discoverySearches` | 5 |
| `feedback` | 18 |
| `followUps` | 18 |
| `importErrors` | 6 |
| `incidents` | 3 |
| `integrations` | 10 |
| `invoices` | 16 |
| `jobs` | 8 |
| `leads` | 50 |
| `meetings` | 14 |
| `notifications` | 6 |
| `onboardings` | 5 |
| `opportunities` | 6 |
| `pricingRules` | 4 |
| `products` | 10 |
| `proposals` | 10 |
| `qualificationRules` | 5 |
| `recommendations` | 6 |
| `referralCampaigns` | 3 |
| `referrals` | 11 |
| `relatedBusinesses` | 6 |
| `reports` | 5 |
| `research` | 6 |
| `retentionRules` | 5 |
| `roles` | 8 |
| `scoringRules` | 9 |
| `securitySettings` | 12 |
| `segments` | 4 |
| `slaPolicies` | 4 |
| `supportTickets` | 8 |
| `syncLogs` | 14 |
| `targets` | 13 |
| `tasks` | 30 |
| `templates` | 8 |
| `trends` | 7 |
| `users` | 10 |
| `webhooks` | 6 |
### Business logic that should move to the server

These are implemented in the browser for the demo (see `src/services`) and should become backend jobs/services:

* `automation.js` - stage-change automation (follow-ups, draft proposal, won-deal handoff, lost-deal nurture)
* `scoring.js`, `assignment.js` - lead scoring and routing rules
* `ai.js` - mock AI (drafts, research, summaries, coaching): replace with calls to your AI gateway
* SLA escalation, health scores, workload balancing and report generation

## Design system

* Colours come from the TechOf logo: navy `#0B3A7A`, blue `#1456A8`, teal `#1A8F9B`, gold `#F2B632` (see `tailwind.config.js`). Flat colours only, no gradients.
* Icons: `lucide-react`. Charts: small built-in SVG components (no extra library).
* Fully responsive: sidebar becomes a drawer on mobile, tables scroll, boards scroll horizontally.

## Security practices in the frontend

* Input is validated in forms (`utils/validators.js`) and sanitized before storage (`utils/sanitize.js`).
* React escapes all output; no `dangerouslySetInnerHTML` is used.
* Routes are protected by login and by role access; write buttons are hidden for read-only roles.
* Sensitive or external actions (discounts, AI messages, budget changes, deletions) go through the Approvals queue.
* The demo password check is for demonstration only. Real authentication, MFA and rate limiting must be done by the backend.
