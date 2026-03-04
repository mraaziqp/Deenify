


import "./globals.css";
import ClientAuthProvider from '@/components/client-auth-provider';
import HeaderWrapper from '@/components/layout/header-wrapper';
import PwaInstallPrompt from '@/components/pwa-install-prompt';
import { ReactNode } from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Deenify',
  description: 'Your Islamic learning and spiritual growth companion',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  // LayoutWithHeader is now handled by HeaderWrapper client component
    return (
      <html lang="en" data-scroll-behavior="smooth">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="icon" type="image/png" sizes="192x192" href="/icon-192.png" />
          <link rel="icon" type="image/png" sizes="96x96" href="/icon-96.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/icon-96.png" />
          <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
          <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
          <link rel="apple-touch-icon" sizes="144x144" href="/icon-144.png" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          <meta name="apple-mobile-web-app-title" content="Deenify" />
          <meta name="mobile-web-app-capable" content="yes" />
          <meta name="theme-color" content="#0d9488" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Amiri:ital,wght@0,400;0,700;1,400&family=Scheherazade+New:wght@400;500;600;700&family=Lateef:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
          <script dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/service-worker.js'); }); }`
          }} />
        </head>
        <body>
          <ClientAuthProvider>
            <HeaderWrapper>{children}</HeaderWrapper>
          </ClientAuthProvider>
          <PwaInstallPrompt />
        </body>
      </html>
    );
}

