import { useState } from 'react';
import PageHeader from '@/components/ui/PageHeader';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import KeyValue from '@/components/ui/KeyValue';
import { Toggle } from '@/modules/admin/Security';
import useAuth from '@/hooks/useAuth';
import useToast from '@/hooks/useToast';
import { storage } from '@/services/storage';

const OPTIONS = [
  ['newLead', 'New lead assigned to me', 'In-app alert when a lead is assigned', true], ['sla', 'Reply-time warnings', 'Alert before a promised reply time runs out', true], ['followUp', 'Follow-up reminders', 'Remind me when a follow-up is due', true],
  ['meeting', 'Meeting reminders', 'Reminder before each meeting', true], ['approval', 'Approvals waiting for me', 'Alert when something needs my yes or no', true], ['daily', 'Daily summary', 'One summary of my day each morning', false], ['email', 'Also send by email', 'Needs the email service (see the guide)', false],
];
export default function Settings() {
  const { user, role } = useAuth();
  const { push } = useToast();
  const [prefs, setPrefs] = useState(() => ({ ...Object.fromEntries(OPTIONS.map(([k, , , d]) => [k, d])), reminderMinutes: 15, ...(storage.get(`prefs:${user.id}`) || {}) }));
  const save = () => { storage.set(`prefs:${user.id}`, prefs); push('Your settings are saved'); };
  return (
    <>
      <PageHeader title="My Settings" />
      <div className="grid gap-5 lg:grid-cols-3">
        <Card title="My profile"><div className="mb-4 flex items-center gap-3"><Avatar name={user.name} color={user.avatarColor} size={48} /><div><p className="font-semibold text-ink-900">{user.name}</p><p className="text-xs text-ink-500">{user.title}</p></div></div><KeyValue items={[['Email', user.email], ['Role', role?.name], ['Team', user.team], ['Area', user.territory]]} /></Card>
        <Card title="Which alerts do you want?" className="lg:col-span-2" bodyClass="p-0"><ul className="divide-y divide-ink-100">{OPTIONS.map(([k, l, d]) => <li key={k} className="flex items-center justify-between gap-3 px-4 py-3"><div><p className="text-sm font-medium text-ink-900">{l}</p><p className="text-xs text-ink-500">{d}</p></div><Toggle label={l} on={prefs[k]} onChange={(v) => setPrefs({ ...prefs, [k]: v })} /></li>)}
          <li className="flex items-center justify-between gap-3 px-4 py-3"><div><p className="text-sm font-medium text-ink-900">Remind me before a meeting</p><p className="text-xs text-ink-500">How many minutes before</p></div><select aria-label="Reminder minutes" className="input w-28" value={prefs.reminderMinutes} onChange={(e) => setPrefs({ ...prefs, reminderMinutes: Number(e.target.value) })}>{[5, 10, 15, 30, 60].map((m) => <option key={m} value={m}>{m} min</option>)}</select></li></ul>
          <div className="flex justify-end border-t border-ink-100 p-3"><Button onClick={save}>Save settings</Button></div></Card>
      </div>
    </>
  );
}
