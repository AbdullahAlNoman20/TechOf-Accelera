import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { BRAND } from '@/config/brand';
import MobileTabBar from './MobileTabBar';
import WelcomeTour from '@/components/common/WelcomeTour';
import useAuth from '@/hooks/useAuth';

export default function AppShell() {
  const [menu, setMenu] = useState(false);
  const { user } = useAuth();
  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      <Sidebar open={menu} onClose={() => setMenu(false)} />
      <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
        <Topbar onMenu={() => setMenu(true)} />
        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-5 pb-24 sm:px-6 sm:py-6 lg:pb-6"><Outlet /></main>
        <footer className="border-t border-ink-100 bg-white px-6 py-3 text-center text-xs text-ink-400">{BRAND.fullName} - built by {BRAND.company}</footer>
      </div>
      <MobileTabBar onMenu={() => setMenu(true)} />
      <WelcomeTour userId={user.id} />
    </div>
  );
}
