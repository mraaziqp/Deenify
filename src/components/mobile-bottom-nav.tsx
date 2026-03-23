'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, BookMarked, Radio, Languages, Clock3 } from 'lucide-react';
import { cn } from '@/lib/utils';

const BOTTOM_NAV = [
  { href: '/dashboard',      label: 'Home',    icon: LayoutDashboard },
  { href: '/dashboard?tab=prayer#prayer-times', label: 'Salaah', icon: Clock3 },
  { href: '/groups',         label: 'Groups',  icon: Users },
  { href: '/quran',          label: 'Quran',   icon: BookOpen },
  { href: '/library',        label: 'Library', icon: BookMarked },
  { href: '/radio',          label: 'Radio',   icon: Radio },
  { href: '/arabic-learning',label: 'Arabic',  icon: Languages },
];

export default function MobileBottomNav() {
  const pathname = usePathname();
  const [dashboardTab, setDashboardTab] = useState('');

  useEffect(() => {
    const syncDashboardTab = () => {
      setDashboardTab((new URLSearchParams(window.location.search).get('tab') || '').toLowerCase());
    };

    syncDashboardTab();
    window.addEventListener('hashchange', syncDashboardTab);
    window.addEventListener('popstate', syncDashboardTab);
    return () => {
      window.removeEventListener('hashchange', syncDashboardTab);
      window.removeEventListener('popstate', syncDashboardTab);
    };
  }, [pathname]);

  // Hide on auth and madresah pages (madresah has its own nav-free layout)
  if (pathname?.startsWith('/auth/')) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      {/* Use env(safe-area-inset-bottom) for notched phones */}
      <div className="overflow-x-auto" style={{ paddingBottom: 'env(safe-area-inset-bottom)', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="flex items-center min-w-max px-1" style={{ height: '56px' }}>
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const isPrayerLink = href.includes('tab=prayer');
          const isHomeLink = href === '/dashboard';
          const active = isPrayerLink
            ? pathname === '/dashboard' && dashboardTab === 'prayer'
            : isHomeLink
              ? pathname === '/dashboard' && dashboardTab !== 'prayer'
              : pathname === href || (pathname?.startsWith(href) ?? false);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 h-full px-2 transition-colors min-w-[68px] flex-none',
                active ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-6 rounded-xl transition-all',
                active && 'bg-emerald-50'
              )}>
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.5px]')} />
              </div>
              <span className={cn('text-[10px] font-medium leading-none truncate', active && 'font-bold')}>{label}</span>
            </Link>
          );
        })}
      </div>
      </div>
    </nav>
  );
}
