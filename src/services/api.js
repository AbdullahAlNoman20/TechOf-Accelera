/**
 * Data access layer (repository pattern).
 *
 * Every page talks to `api` / `useCollection` only. Two adapters implement the same async interface:
 *  - local adapter : sample JSON seeded into localStorage (default)
 *  - http adapter  : REST backend, enabled by setting VITE_API_URL
 * Backend developers only need to match the REST contract in README.md; no page code changes.
 */
import seed from '@/data';
import { storage } from './storage';
import { clean } from '@/utils/sanitize';

const BASE = import.meta.env.VITE_API_URL;
const cache = new Map();
const listeners = new Map();

const PREFIX = {
  leads: 'LD', deals: 'DL', tasks: 'TK', customers: 'CU', users: 'U', proposals: 'PR', products: 'PD', activities: 'AC', followUps: 'FU', meetings: 'MT',
  templates: 'TP', conversations: 'CV', research: 'RS', referrals: 'RF', campaigns: 'CM', referralCampaigns: 'RC', contracts: 'CT', onboardings: 'OB', invoices: 'INV',
  integrations: 'IN', auditLogs: 'AL', importErrors: 'IE', discoverySearches: 'DS', discoveryRuns: 'DR', scoringRules: 'SR', qualificationRules: 'QR', segments: 'SG',
  assignmentRules: 'AR', slaPolicies: 'SL', opportunities: 'OP', relatedBusinesses: 'RB', approvals: 'AQ', approvalRules: 'AP', notifications: 'NT', reports: 'RP',
  targets: 'TG', incidents: 'IC', aiDrafts: 'AD', consents: 'CN', retentionRules: 'RR', dataRequests: 'DQ', deliveries: 'DV', feedback: 'FB', supportTickets: 'ST',
};
const SILENT = new Set(['auditLogs', 'notifications', 'automationLogs', 'activities']);

const emit = (c) => (listeners.get(c) || []).forEach((f) => f());
export const subscribe = (c, f) => {
  listeners.set(c, [...(listeners.get(c) || []), f]);
  return () => listeners.set(c, (listeners.get(c) || []).filter((x) => x !== f));
};
const nextId = (c, rows) => {
  const p = PREFIX[c] || c.slice(0, 2).toUpperCase();
  const max = rows.reduce((m, r) => Math.max(m, parseInt(String(r.id).split('-')[1], 10) || 0), 0);
  return `${p}-${max + 1}`;
};
const sanitizeObject = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, typeof v === 'string' ? clean(v) : v]));
const actor = () => { const s = storage.get('session'); const u = s && (storage.get('db:users') || seed.users).find((x) => x.id === s.id); return u ? { id: u.id, name: u.name } : { id: 'system', name: 'System' }; };

/* ---------- local adapter ---------- */
const readLocal = (c) => {
  if (cache.has(c)) return cache.get(c);
  let rows = storage.get('db:' + c);
  if (rows === null) { rows = JSON.parse(JSON.stringify(seed[c] || [])); storage.set('db:' + c, rows); }
  cache.set(c, rows);
  return rows;
};
const writeLocal = (c, rows) => { cache.set(c, rows); storage.set('db:' + c, rows); emit(c); };

const local = {
  async list(c) { return readLocal(c); },
  async get(c, id) { return readLocal(c).find((r) => r.id === id) || null; },
  async create(c, payload) {
    const rows = readLocal(c);
    const body = sanitizeObject(payload);
    const rec = { createdAt: new Date().toISOString(), ...body, id: body.id || nextId(c, rows) };
    writeLocal(c, [rec, ...rows]);
    return rec;
  },
  async update(c, id, patch) {
    let out = null;
    writeLocal(c, readLocal(c).map((r) => (r.id === id ? (out = { ...r, ...sanitizeObject(patch), updatedAt: new Date().toISOString() }) : r)));
    return out;
  },
  async remove(c, id) { writeLocal(c, readLocal(c).filter((r) => r.id !== id)); return true; },
};

/* ---------- http adapter (backend) ---------- */
const http = async (method, path, body) => {
  const res = await fetch(BASE + path, { method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${storage.get('token', '')}` }, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) throw new Error(`${method} ${path} failed (${res.status})`);
  return res.status === 204 ? null : res.json();
};
const remote = {
  async list(c) { const rows = await http('GET', `/${c}`); cache.set(c, rows); emit(c); return rows; },
  get: (c, id) => http('GET', `/${c}/${id}`),
  async create(c, p) { const r = await http('POST', `/${c}`, sanitizeObject(p)); await remote.list(c); return r; },
  async update(c, id, p) { const r = await http('PATCH', `/${c}/${id}`, sanitizeObject(p)); await remote.list(c); return r; },
  async remove(c, id) { await http('DELETE', `/${c}/${id}`); await remote.list(c); return true; },
};
const adapter = BASE ? remote : local;

/** Synchronous cache read used for first render. */
export const peek = (c) => (BASE ? cache.get(c) || [] : readLocal(c));
export const lookup = (c, id) => peek(c).find((r) => r.id === id);

const audit = (action, entity, detail) => {
  if (BASE) return;
  const a = actor();
  writeLocal('auditLogs', [{ id: nextId('auditLogs', readLocal('auditLogs')), userId: a.id, userName: a.name, action, entity, detail, at: new Date().toISOString(), ip: '127.0.0.1' }, ...readLocal('auditLogs')].slice(0, 300));
};

export const api = {
  list: (c) => adapter.list(c),
  get: (c, id) => adapter.get(c, id),
  async create(c, p) { const r = await adapter.create(c, p); if (!SILENT.has(c)) audit('create', c, `Created ${r?.id || ''}`); return r; },
  async update(c, id, p) { const r = await adapter.update(c, id, p); if (!SILENT.has(c)) audit('update', c, `Updated ${id}`); return r; },
  async remove(c, id) { const r = await adapter.remove(c, id); if (!SILENT.has(c)) audit('delete', c, `Deleted ${id}`); return r; },
  log: audit,
  /** Restores the original sample data. */
  reset() { storage.clearAll(); cache.clear(); window.location.assign('/login'); },
};
