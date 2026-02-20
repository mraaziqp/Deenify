"use client";

import Header from '@/components/layout/header';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container mx-auto max-w-4xl px-4 py-8">
        {children}
      </main>
    </>
  );
}
