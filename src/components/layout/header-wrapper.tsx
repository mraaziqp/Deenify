"use client";
import Header from './header';
import MobileBottomNav from '@/components/mobile-bottom-nav';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ReactNode } from 'react';

export default function HeaderWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const hideHeader = pathname === '/auth/sign-in' && !user && !isLoading;
  const isAuthPage = pathname?.startsWith('/auth/') ?? false;
  return (
    <>
      {!hideHeader && <Header />}
      {/* Extra bottom padding on mobile so content isn't hidden behind bottom nav and device safe area */}
      <div className={!isAuthPage ? 'pb-[calc(56px+env(safe-area-inset-bottom)+0.75rem)] md:pb-0' : ''}>
        {children}
      </div>
      {!isAuthPage && <MobileBottomNav />}
    </>
  );
}
