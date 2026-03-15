'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, BookMarked, Radio } from 'lucide-react';
import { cn } from '@/lib/utils';

const BOTTOM_NAV = [
  { href: '/dashboard',      label: 'Home',    icon: LayoutDashboard },
  { href: '/groups',         label: 'Groups',  icon: Users },
  { href: '/quran',          label: 'Quran',   icon: BookOpen },
  { href: '/library',        label: 'Library', icon: BookMarked },
  { href: '/radio',          label: 'Radio',   icon: Radio },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on auth and madresah pages (madresah has its own nav-free layout)
  if (pathname?.startsWith('/auth/')) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      {/* Use env(safe-area-inset-bottom) for notched phones */}
      <div className="flex items-center justify-around px-1" style={{ height: '56px', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && (pathname?.startsWith(href) ?? false));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1 transition-colors min-w-0',
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
    </nav>
  );
}
