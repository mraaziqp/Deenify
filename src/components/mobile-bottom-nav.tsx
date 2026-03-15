'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, BookOpen, BookMarked, CircleUser } from 'lucide-react';
import { cn } from '@/lib/utils';

const BOTTOM_NAV = [
  { href: '/dashboard', label: 'Home',    icon: LayoutDashboard },
  { href: '/groups',    label: 'Groups',  icon: Users },
  { href: '/quran',     label: 'Quran',   icon: BookOpen },
  { href: '/library',   label: 'Library', icon: BookMarked },
  { href: '/dashboard#account', label: 'Profile', icon: CircleUser },
];

export default function MobileBottomNav() {
  const pathname = usePathname();

  // Hide on auth pages
  if (pathname?.startsWith('/auth/')) return null;

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white border-t border-gray-200 shadow-[0_-2px_12px_rgba(0,0,0,0.08)]">
      <div className="flex items-center justify-around px-1 h-16 safe-bottom">
        {BOTTOM_NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && (pathname?.startsWith(href) ?? false));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 flex-1 h-full px-1 transition-colors',
                active ? 'text-emerald-600' : 'text-gray-400 hover:text-gray-600'
              )}
            >
              <div className={cn(
                'flex items-center justify-center w-8 h-7 rounded-xl transition-all',
                active && 'bg-emerald-50'
              )}>
                <Icon className={cn('h-5 w-5', active && 'stroke-[2.5px]')} />
              </div>
              <span className={cn('text-[10px] font-medium leading-none', active && 'font-bold')}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
