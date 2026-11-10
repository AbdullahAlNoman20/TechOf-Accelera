import { useState } from 'react';
import { Bell, Menu, RotateCcw } from 'lucide-react';
import useAuth from '@/hooks/useAuth';
import useCollection from '@/hooks/useCollection';
import { api } from '@/services/api';
import { timeAgo } from '@/utils/format';
import { BRAND } from '@/config/brand';
import Badge from '@/components/ui/Badge';
import PageFinder from './PageFinder';

export default function Topbar({ onMenu }) {
  const { user } = useAuth();
  const { items, update } = useCollection('notifications');
  const [open, setOpen] = useState(false);
  const mine = items.filter((n) => n.userId === 'all' || n.userId === user?.id);
  const unread = mine.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-ink-100 bg-white px-4 sm:px-6">
      <button type="button" onClick={onMenu} aria-label="Open menu" className="rounded-lg p-2 text-ink-600 hover:bg-ink-100 lg:hidden"><Menu size={20} /></button>
      <PageFinder />
      <p className="hidden text-sm font-medium text-brand-800 xl:block">{BRAND.tagline}</p>
      <div className="ml-auto flex items-center gap-1">
        <button type="button" onClick={() => { if (window.confirm('Restore the original sample data? Your changes will be lost.')) api.reset(); }} className="hidden items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-ink-500 hover:bg-ink-100 sm:flex"><RotateCcw size={14} />Reset demo data</button>
        <div className="relative">
          <button type="button" onClick={() => setOpen((o) => !o)} aria-label="Notifications" className="relative rounded-lg p-2 text-ink-600 hover:bg-ink-100">
            <Bell size={20} />{unread > 0 && <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-gold-500 px-1 text-[10px] font-bold text-ink-900">{unread}</span>}
          </button>
          {open && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-xl border border-ink-100 bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-ink-100 px-4 py-3"><p className="text-sm font-semibold">Notifications</p>
                  {unread > 0 && <button type="button" className="text-xs font-medium text-brand-600" onClick={() => mine.filter((n) => !n.read).forEach((n) => update(n.id, { read: true }))}>Mark all read</button>}</div>
                <ul className="max-h-80 divide-y divide-ink-100 overflow-y-auto">
                  {mine.length === 0 && <li className="p-4 text-center text-sm text-ink-400">You are all caught up</li>}
                  {mine.map((n) => (
                    <li key={n.id} className={`p-3 ${n.read ? '' : 'bg-brand-50/50'}`}>
                      <div className="flex items-center justify-between gap-2"><p className="text-sm font-medium text-ink-800">{n.title}</p><Badge tone={n.type === 'error' ? 'danger' : n.type === 'warning' ? 'warning' : n.type === 'success' ? 'success' : 'brand'}>{n.type}</Badge></div>
                      <p className="mt-0.5 text-xs text-ink-500">{n.body}</p><p className="mt-1 text-[11px] text-ink-400">{timeAgo(n.at)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
