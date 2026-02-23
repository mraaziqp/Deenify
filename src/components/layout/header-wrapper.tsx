"use client";
import Header from './header';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { ReactNode } from 'react';

export default function HeaderWrapper({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const hideHeader = pathname === '/auth/sign-in' && !user && !isLoading;
  return (
    <>
      {!hideHeader && <Header />}
      {children}
    </>
  );
}
