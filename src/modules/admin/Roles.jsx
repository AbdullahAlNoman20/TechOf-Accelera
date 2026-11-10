import { useState } from 'react';
import { Plus } from 'lucide-react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import FormModal from '@/components/data/FormModal';
import DataTable from '@/components/data/DataTable';
import useCollection from '@/hooks/useCollection';
import useToast from '@/hooks/useToast';
import useAuth from '@/hooks/useAuth';
import { api } from '@/services/api';
import { MODULES, MODULE_LABEL } from '@/config/navigation';
import { fmtDateTime, humanize } from '@/utils/format';
import Tabs from '@/components/ui/Tabs';

const LEVELS = ['none', 'view', 'own', 'full'];
const FIELDS = [{ name: 'name', label: 'Role name', required: true, span: 2 }, { name: 'description', label: 'Description', type: 'textarea' }];

export default function Roles() {
  const { items: roles, create, update } = useCollection('roles');
  const { items: logs } = useCollection('auditLogs');
  const { items: users } = useCollection('users');
  const { canWrite } = useAuth();
  const { push } = useToast();
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('modules');
  const { items: fields, update: updField } = useCollection('fieldPermissions');
  const w = canWrite('admin');
  const setLevel = async (r, m, v) => {
    if (r.id === 'super_admin') return push('Super Admin access cannot be reduced', 'error');
    await update(r.id, { access: { ...r.access, [m]: v } });
    api.log('permission_change', 'role', `${r.name}: ${MODULE_LABEL[m]} set to ${v}`);
  };
  return (
    <>
      <PageHeader title="Roles & Access Control" subtitle="Role-based access per module: None, View (read only), Own (own records) or Full. Team, territory, record-level and field-level limits are in Security." actions={w && <Button icon={Plus} onClick={() => setOpen(true)}>Custom role</Button>} />
      <Tabs value={tab} onChange={setTab} tabs={[{ key: 'modules', label: 'Who can open what' }, { key: 'fields', label: 'Sensitive fields' }]} />
      {tab === 'fields' && <Card title="Hide sensitive values from some roles" subtitle="Tick the roles that must NOT see the field. The value shows as Hidden on every screen." bodyClass="p-0"><ul className="divide-y divide-ink-100">{fields.map((f) => <li key={f.id} className="px-4 py-3"><p className="text-sm font-semibold text-ink-900">{f.field} <span className="text-xs font-normal text-ink-500">({f.where})</span></p><div className="mt-2 flex flex-wrap gap-3">{roles.map((r) => <label key={r.id} className="flex items-center gap-1.5 text-sm text-ink-700"><input type="checkbox" disabled={!w || r.id === 'super_admin'} className="h-4 w-4 rounded border-ink-300" checked={f.hiddenFor.includes(r.id)} onChange={(e) => { updField(f.id, { hiddenFor: e.target.checked ? [...f.hiddenFor, r.id] : f.hiddenFor.filter((x) => x !== r.id) }); api.log('permission_change', 'fieldPermissions', `${f.field} visibility changed for ${r.name}`); push('Field permission saved'); }} />{r.name}</label>)}</div></li>)}</ul></Card>}
      <div className={tab === 'modules' ? 'card mb-5 overflow-x-auto' : 'hidden'}>
        <table className="min-w-full divide-y divide-ink-100 text-sm"><thead className="bg-ink-50"><tr><th className="th">Role</th>{MODULES.map((m) => <th key={m} className="th">{MODULE_LABEL[m]}</th>)}</tr></thead>
          <tbody className="divide-y divide-ink-100">{roles.map((r) => (
            <tr key={r.id}><td className="td"><p className="font-medium text-ink-900">{r.name} {r.system && <Badge tone="brand">System</Badge>}</p><p className="text-xs text-ink-500">{users.filter((u) => u.role === r.id).length} user(s)</p></td>
              {MODULES.map((m) => <td key={m} className="td"><select aria-label={`${r.name} ${MODULE_LABEL[m]}`} disabled={!w || r.id === 'super_admin'} className="input w-24 py-1 text-xs" value={r.access?.[m] || 'none'} onChange={(e) => setLevel(r, m, e.target.value)}>{LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}</select></td>)}</tr>))}</tbody></table>
      </div>
      {tab === 'modules' && <Card title="Permission review: change history" bodyClass="p-0"><DataTable rows={logs.filter((l) => ['permission_change', 'update'].includes(l.action) && ['role', 'users'].includes(l.entity))} pageSize={5} columns={[{ key: 'at', label: 'When', render: (l) => fmtDateTime(l.at) }, { key: 'userName', label: 'Changed by' }, { key: 'detail', label: 'Change' }]} emptyText="No permission changes recorded yet." /></Card>}
      <FormModal open={open} onClose={() => setOpen(false)} title="New custom role" subtitle="Starts with no access. Set module levels in the table." fields={FIELDS} onSubmit={async (v) => { await create({ ...v, id: v.name.toLowerCase().replace(/\W+/g, '_'), system: false, access: Object.fromEntries(MODULES.map((m) => [m, 'none'])) }); push('Role created'); setOpen(false); }} />
    </>
  );
}
