"use client";
import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { AuthProvider } from '@/lib/auth-context';
import { DevRoleSwitcher } from '@/components/dev-role-switcher';

export const metadata: Metadata = {
  title: 'Deenify',
  description: 'Your companion for Islamic growth and knowledge.',
};

import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
  const router = typeof window !== 'undefined' ? require('next/navigation').useRouter() : null;
  useEffect(() => {
    if (pathname === '/') {
      if (router) router.replace('/ramadan');
      else window.location.href = '/ramadan';
    }
  }, [pathname]);
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <AuthProvider>
          <AuroraBackground>
            {children}
          </AuroraBackground>
          <Toaster />
          <DevRoleSwitcher />
        </AuthProvider>
      </body>
    </html>
  );
}
