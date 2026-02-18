import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuroraBackground } from '@/components/ui/aurora-background';
import { DevRoleSwitcher } from '@/components/dev-role-switcher';
import RootRedirector from '@/components/root-redirector';

export const metadata: Metadata = {
  title: 'Deenify',
  description: 'Your companion for Islamic growth and knowledge.',
};



export default function RootLayout(props: Readonly<{ children: React.ReactNode }>) {
  const { children } = props;
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('font-body antialiased')}>
        <AuroraBackground>
          <RootRedirector />
          {children}
        </AuroraBackground>
        <Toaster />
        <DevRoleSwitcher />
      </body>
    </html>
  );
}

