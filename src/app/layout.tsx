

import "./globals.css";
import ClientAuthProvider from '@/components/client-auth-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0d9488" />
        <script dangerouslySetInnerHTML={{
          __html: `if ('serviceWorker' in navigator) { window.addEventListener('load', function() { navigator.serviceWorker.register('/service-worker.js'); }); }`
        }} />
      </head>
      <body>
        <ClientAuthProvider>
          {children}
        </ClientAuthProvider>
      </body>
    </html>
  );
}

