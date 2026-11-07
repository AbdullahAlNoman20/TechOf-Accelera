import CrudPage from '@/components/data/CrudPage';
import Badge, { StatusBadge } from '@/components/ui/Badge';
import { lookup } from '@/services/api';
import useAuth from '@/hooks/useAuth';

const FIELDS = [
  { name: 'name', label: 'Full name', required: true }, { name: 'email', label: 'Work email', type: 'email', required: true }, { name: 'phone', label: 'Phone', type: 'tel' },
  { name: 'role', label: 'Role', optionsFrom: 'roles', required: true }, { name: 'team', label: 'Team' }, { name: 'territory', label: 'Territory' }, { name: 'title', label: 'Job title' },
  { name: 'capacity', label: 'Work capacity (items)', type: 'number', min: 1, max: 50 }, { name: 'skills', label: 'Skills / industries', type: 'tags', span: 2 },
  { name: 'status', label: 'Status', type: 'select', options: ['active', 'inactive'], required: true }, { name: 'mfa', label: 'Security', type: 'checkbox', checkLabel: 'Multi-factor authentication enabled' },
];
export default function Users() {
  const { user } = useAuth();
  return (
    <CrudPage collection="users" module="admin" noun="user" title="User Management" subtitle="Create users, assign roles, teams and territories. Role changes are recorded in the audit log."
      stats={(r) => [{ label: 'Users', value: r.length }, { label: 'Active', value: r.filter((u) => u.status === 'active').length, tone: 'success' }, { label: 'MFA enabled', value: r.filter((u) => u.mfa).length, tone: 'teal' }, { label: 'Inactive', value: r.filter((u) => u.status !== 'active').length, tone: 'gold' }]}
      fields={FIELDS} searchKeys={['name', 'email', 'team']} exportName="users" defaults={{ status: 'active', mfa: false, skills: [], capacity: 10, avatarColor: '#1456A8' }}
      filters={[{ key: 'role', label: 'Role', options: ['super_admin', 'admin', 'manager', 'sales', 'marketing', 'support', 'analyst', 'operations'] }, { key: 'status', label: 'Status', options: ['active', 'inactive'] }]}
      canDelete={true}
      columns={[{ key: 'name', label: 'User', render: (u) => <div><p className="font-medium text-ink-900">{u.name}{u.id === user.id && <span className="ml-1 text-xs text-ink-400">(you)</span>}</p><p className="text-xs text-ink-500">{u.email}</p></div> }, { key: 'role', label: 'Role', render: (u) => <Badge tone="brand">{lookup('roles', u.role)?.name || u.role}</Badge> }, { key: 'team', label: 'Team' }, { key: 'territory', label: 'Territory' }, { key: 'mfa', label: 'MFA', render: (u) => (u.mfa ? <Badge tone="success">On</Badge> : <Badge>Off</Badge>) }, { key: 'status', label: 'Status', render: (u) => <StatusBadge value={u.status} /> }]} />
  );
}
