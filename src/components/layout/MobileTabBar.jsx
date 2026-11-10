import { NavLink } from 'react-router-dom';
import { Inbox, KanbanSquare, LayoutDashboard, ListChecks, Menu } from 'lucide-react';
import useAuth from '@/hooks/useAuth';

const ITEMS = [
  { to: '/app/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/app/lead-engine/inbox', label: 'Leads', icon: Inbox, module: 'leadEngine' },
  { to: '/app/task-hub/my-queue', label: 'My Day', icon: ListChecks, module: 'taskHub' },
  { to: '/app/sales/pipeline', label: 'Deals', icon: KanbanSquare, module: 'sales' },
];
export default function MobileTabBar({ onMenu }) {
  const { can } = useAuth();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-ink-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden" aria-label="Quick navigation">
      {ITEMS.filter((i) => !i.module || can(i.module)).map((i) => (
        <NavLink key={i.to} to={i.to} className={({ isActive }) => `flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium ${isActive ? 'text-brand-800' : 'text-ink-500'}`}><i.icon size={20} />{i.label}</NavLink>))}
      <button type="button" onClick={onMenu} className="col-start-5 flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium text-ink-500"><Menu size={20} />Menu</button>
    </nav>
  );
}
