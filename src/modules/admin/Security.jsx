import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Tabs from '@/components/ui/Tabs';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import CrudTable from '@/components/data/CrudTable';
import DataTable from '@/components/data/DataTable';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { fmtDate, fmtDateTime } from '@/utils/format';
import Preview from '@/components/ui/Preview';

export function Toggle({ on, onChange, disabled, label }) {
  return <button type="button" role="switch" aria-checked={on} aria-label={label} disabled={disabled} onClick={() => onChange(!on)} className={`relative h-6 w-11 shrink-0 rounded-full transition ${on ? 'bg-teal-500' : 'bg-ink-300'} disabled:opacity-50`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? 'left-[22px]' : 'left-0.5'}`} /></button>;
}
const CONSENT = [{ name: 'contact', label: 'Contact', required: true }, { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'channel', label: 'Channel', type: 'select', options: ['Email', 'WhatsApp', 'Phone'], required: true }, { name: 'status', label: 'Status', type: 'select', options: ['granted', 'withdrawn'], required: true }, { name: 'source', label: 'Source', required: true }];
const RETAIN = [{ name: 'dataType', label: 'Data type', required: true, span: 2 }, { name: 'retentionDays', label: 'Keep for (days)', type: 'number', min: 1, required: true }, { name: 'action', label: 'After that', type: 'select', options: ['Delete', 'Anonymize', 'Archive'], required: true }, { name: 'active', label: 'Status', type: 'checkbox', checkLabel: 'Rule is active' }];

export default function Security() {
  const [tab, setTab] = useState('policies');
  const { items: settings, update } = useCollection('securitySettings');
  const { items: reqs, update: updReq } = useCollection('dataRequests');
  const { items: logs } = useCollection('auditLogs');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const w = canWrite('admin');
  const groups = settings.reduce((m, s) => { (m[s.group] = m[s.group] || []).push(s); return m; }, {});
  const change = async (s, patch) => { await update(s.id, patch); api.log('security_change', 'securitySettings', `${s.name} updated`); push('Security setting saved (change is audit-logged)'); };
  const { items: sessions, remove: endSession } = useCollection('sessions');
  const { items: keys, update: updKey, create: addKey } = useCollection('apiKeys');
  const { items: users } = useCollection('users');
  const [newKey, setNewKey] = useState('');
  const makeKey = async () => { const raw = `acc_live_${Math.random().toString(36).slice(2, 10)}${Math.random().toString(36).slice(2, 10)}`; await addKey({ name: 'New integration key', preview: `${raw.slice(0, 9)}****${raw.slice(-4)}`, scopes: ['leads:create'], lastUsed: null, status: 'active' }); setNewKey(raw); api.log('api_key', 'apiKeys', 'API key created'); };
  const suspicious = logs.filter((l) => l.action === 'login_failed');
  return (
    <>
      <PageHeader title="Security, Privacy & Data Governance" subtitle="Authentication, session and access policies, consent, retention, data requests and login monitoring." />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'policies', label: 'Policies' }, { key: 'consent', label: 'Consent' }, { key: 'retention', label: 'Retention' }, { key: 'requests', label: 'Data requests', count: reqs.filter((r) => r.status === 'pending').length }, { key: 'login', label: 'Login monitoring', count: suspicious.length }, { key: 'sessions', label: 'Active sessions' }, { key: 'api', label: 'API keys' }, { key: 'recovery', label: 'Backup & recovery' }]} />
      {tab === 'policies' && <div className="grid gap-5 lg:grid-cols-2">{Object.entries(groups).map(([g, list]) => <Card key={g} title={g} bodyClass="p-0"><ul className="divide-y divide-ink-100">{list.map((s) => <li key={s.id} className="flex items-center justify-between gap-3 px-4 py-3"><div className="min-w-0"><p className="text-sm font-medium text-ink-900">{s.name}</p><p className="text-xs text-ink-500">{s.description}</p></div><div className="flex items-center gap-3">{s.value && <input aria-label={`${s.name} value`} className="input w-20 py-1 text-center text-xs" disabled={!w} defaultValue={s.value} maxLength={6} onBlur={(e) => /^\d+$/.test(e.target.value) && e.target.value !== s.value && change(s, { value: e.target.value })} />}<Toggle label={s.name} on={s.enabled} disabled={!w} onChange={(v) => change(s, { enabled: v })} /></div></li>)}</ul></Card>)}</div>}
      {tab === 'consent' && <CrudTable collection="consents" module="admin" noun="consent record" fields={CONSENT} searchKeys={['contact', 'email']} defaults={{ status: 'granted', channel: 'Email', source: 'Manual' }} filters={[{ key: 'status', label: 'Status', options: ['granted', 'withdrawn'] }]} columns={[{ key: 'contact', label: 'Contact', render: (c) => <div><p className="font-medium">{c.contact}</p><p className="text-xs text-ink-500">{c.email}</p></div> }, { key: 'channel', label: 'Channel' }, { key: 'status', label: 'Status', render: (c) => <StatusBadge value={c.status} /> }, { key: 'source', label: 'Source' }, { key: 'at', label: 'Recorded', render: (c) => fmtDate(c.at) }]} />}
      {tab === 'retention' && <CrudTable collection="retentionRules" module="admin" noun="rule" fields={RETAIN} defaults={{ active: true, action: 'Delete', retentionDays: 365 }} columns={[{ key: 'dataType', label: 'Data type' }, { key: 'retentionDays', label: 'Keep for', render: (r) => `${r.retentionDays} days` }, { key: 'action', label: 'Then', render: (r) => <Badge tone={r.action === 'Delete' ? 'danger' : 'brand'}>{r.action}</Badge> }, { key: 'active', label: 'Status', render: (r) => <StatusBadge value={r.active ? 'active' : 'paused'} /> }]} />}
      {tab === 'requests' && <DataTable rows={reqs} columns={[{ key: 'type', label: 'Request', render: (r) => <Badge tone={r.type === 'delete' ? 'danger' : 'brand'}>{r.type}</Badge> }, { key: 'subject', label: 'Subject' }, { key: 'requestedBy', label: 'Requested by' }, { key: 'at', label: 'Date', render: (r) => fmtDate(r.at) }, { key: 'status', label: 'Status', render: (r) => <StatusBadge value={r.status} /> }, { key: 'a', label: '', sortable: false, render: (r) => w && r.status === 'pending' && <div className="flex gap-1"><Button size="sm" onClick={() => { updReq(r.id, { status: 'completed' }); api.log('data_request', r.type, r.subject); push('Request completed and logged'); }}>Approve</Button><Button size="sm" variant="secondary" onClick={() => updReq(r.id, { status: 'rejected' })}>Reject</Button></div> }]} />}
      {tab === 'sessions' && <DataTable rows={sessions} columns={[{ key: 'userId', label: 'Person', render: (s) => users.find((u) => u.id === s.userId)?.name || s.userId }, { key: 'device', label: 'Device' }, { key: 'location', label: 'Place', render: (s) => <span className={s.location.startsWith('Unknown') ? 'font-semibold text-red-600' : ''}>{s.location}</span> }, { key: 'lastActive', label: 'Last active', render: (s) => fmtDateTime(s.lastActive) }, { key: 'a', label: '', sortable: false, render: (s) => (s.current ? <Badge tone="success">This device</Badge> : w && <Button size="sm" variant="secondary" onClick={() => { endSession(s.id); api.log('session_end', 'sessions', `Ended session ${s.id}`); push('Session ended'); }}>Sign out</Button>) }]} />}
      {tab === 'api' && <div className="space-y-4">{newKey && <div className="rounded-lg border border-gold-300 bg-gold-50 p-3 text-sm"><p className="font-semibold text-gold-700">Copy your new key now. It will not be shown again.</p><code className="break-all text-ink-800">{newKey}</code></div>}<DataTable rows={keys} toolbar={w && <Button onClick={makeKey}>Create API key</Button>} columns={[{ key: 'name', label: 'Key name' }, { key: 'preview', label: 'Key', render: (k) => <code className="text-xs">{k.preview}</code> }, { key: 'scopes', label: 'Can do', render: (k) => (k.scopes || []).join(', ') }, { key: 'lastUsed', label: 'Last used', render: (k) => (k.lastUsed ? fmtDateTime(k.lastUsed) : 'Never') }, { key: 'status', label: 'Status', render: (k) => <StatusBadge value={k.status === 'active' ? 'active' : 'paused'} /> }, { key: 'a', label: '', sortable: false, render: (k) => w && k.status === 'active' && <Button size="sm" variant="secondary" onClick={() => { updKey(k.id, { status: 'revoked' }); api.log('api_key', 'apiKeys', `Revoked ${k.name}`); push('Key revoked'); }}>Revoke</Button> }]} /></div>}
      {tab === 'recovery' && <div className="grid gap-5 lg:grid-cols-2"><Card title="Backup & restore" subtitle="Daily encrypted backups"><p className="text-sm text-ink-600">Latest verified backup is shown in System Health. A restore always needs approval and is written to the audit log.</p>{w && <Button className="mt-3" variant="secondary" onClick={() => { api.log('restore_request', 'backup', 'Restore requested'); push('Restore request sent for approval', 'info'); }}>Request restore<Preview kind="integration" /></Button>}</Card><Card title="Disaster recovery plan"><ul className="space-y-1.5 text-sm text-ink-700"><li>Goal: back online in <b>4 hours</b>, lose at most <b>15 minutes</b> of data.</li><li>Copies are stored in a second region.</li><li>Last recovery drill: <b>30 days ago</b>, passed.</li></ul><p className="mt-2 rounded bg-gold-50 p-2 text-xs text-gold-700"><b>NB:</b> These numbers are targets. Real values come from the hosting setup.</p></Card></div>}
      {tab === 'login' && <DataTable rows={suspicious} pageSize={8} emptyText="No failed or suspicious logins." columns={[{ key: 'at', label: 'When', render: (l) => fmtDateTime(l.at) }, { key: 'userName', label: 'Account' }, { key: 'ip', label: 'IP address' }, { key: 'detail', label: 'Detail' }]} />}
    </>
  );
}
