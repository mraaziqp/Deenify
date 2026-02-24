


import "./globals.css";
import ClientAuthProvider from '@/components/client-auth-provider';


import HeaderWrapper from '@/components/layout/header-wrapper';
import { ReactNode } from 'react';

export default function RootLayout({ children }: { children: ReactNode }) {
  // LayoutWithHeader is now handled by HeaderWrapper client component
    return (
      <html lang="en" data-scroll-behavior="smooth">
        <head>
          <link rel="manifest" href="/manifest.json" />
          <link rel="apple-touch-icon" href="/icon-192.png" />
          <meta name="theme-color" content="#0d9488" />
          <script dangerouslySetInnerHTML={{
            __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/service-worker.js'); }); }`
          }} />
        </head>
        <body>
          <ClientAuthProvider>
            <HeaderWrapper>{children}</HeaderWrapper>
          </ClientAuthProvider>
        </body>
      </html>
    );
}

