import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, LogOut, X } from 'lucide-react';
import Logo from '@/components/common/Logo';
import Avatar from '@/components/ui/Avatar';
import useAuth from '@/hooks/useAuth';
import { NAV } from '@/config/navigation';
import { BRAND } from '@/config/brand';
import { cn } from '@/utils/format';

const linkCls = ({ isActive }) => cn('flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition', isActive ? 'bg-white/10 text-white shadow-[inset_3px_0_0_#F2B632]' : 'text-white/65 hover:bg-white/5 hover:text-white');

export default function Sidebar({ open, onClose }) {
  const { user, role, can, logout } = useAuth();
  const { pathname } = useLocation();
  const visible = NAV.filter((n) => !n.module || can(n.module));
  const [openGroups, setOpenGroups] = useState(() => Object.fromEntries(NAV.filter((n) => n.group).map((n) => [n.group, n.items.some((i) => pathname.startsWith(i.to))])));

  const body = (
    <div className="flex h-full flex-col bg-brand-800 text-white">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <Logo size={38} />
        <div className="min-w-0 flex-1 leading-tight"><p className="truncate text-sm font-bold">{BRAND.product}</p><p className="truncate text-[11px] text-gold-300">AI CRM</p></div>
        <button type="button" onClick={onClose} aria-label="Close menu" className="rounded p-1 text-white/70 hover:bg-white/10 lg:hidden"><X size={18} /></button>
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3" aria-label="Main">
        {visible.map((n) => {
          if (!n.group) return <NavLink key={n.to} to={n.to} onClick={onClose} className={linkCls}><n.icon size={18} />{n.label}</NavLink>;
          const isOpen = openGroups[n.group];
          return (
            <div key={n.group} className="pt-1.5">
              <button type="button" aria-expanded={!!isOpen} onClick={() => setOpenGroups((s) => ({ ...s, [n.group]: !s[n.group] }))}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-semibold text-white/85 hover:bg-white/5">
                <n.icon size={18} className="text-gold-400" /><span className="flex-1 truncate">{n.group}</span>{isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
              {isOpen && <div className="ml-4 mt-0.5 space-y-0.5 border-l border-white/10 pl-2">{n.items.map((i) => <NavLink key={i.to} to={i.to} onClick={onClose} className={linkCls}><i.icon size={16} />{i.label}</NavLink>)}</div>}
            </div>
          );
        })}
      </nav>
      <div className="flex items-center gap-3 border-t border-white/10 p-3">
        <Avatar name={user?.name} color="#1A8F9B" size={34} />
        <div className="min-w-0 flex-1 leading-tight"><p className="truncate text-sm font-medium">{user?.name}</p><p className="truncate text-xs text-white/60">{role?.name}</p></div>
        <button type="button" onClick={logout} aria-label="Log out" className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"><LogOut size={16} /></button>
      </div>
    </div>
  );

  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 lg:block">{body}</aside>
      {open && (
        <div className="fixed inset-0 z-40 flex lg:hidden">
          <div className="absolute inset-0 bg-ink-900/50" onClick={onClose} />
          <aside className="relative h-full w-72 max-w-[85%]">{body}</aside>
        </div>
      )}
    </>
  );
}
