'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useHotkeys } from 'react-hotkeys-hook';

export function GlobalKeyboardShortcuts() {
  const router = useRouter();

  // Navigation shortcuts
  useHotkeys('alt+d', (e) => {
    e.preventDefault();
    router.push('/dashboard');
  });

  useHotkeys('alt+q', (e) => {
    e.preventDefault();
    router.push('/quran');
  });

  useHotkeys('alt+h', (e) => {
    e.preventDefault();
    router.push('/dhikr');
  });

  useHotkeys('alt+k', (e) => {
    e.preventDefault();
    router.push('/khatm');
  });

  useHotkeys('alt+c', (e) => {
    e.preventDefault();
    router.push('/courses');
  });

  useHotkeys('alt+z', (e) => {
    e.preventDefault();
    router.push('/zakat');
  });

  useHotkeys('alt+a', (e) => {
    e.preventDefault();
    router.push('/ai-assistant');
  });

  useHotkeys('alt+m', (e) => {
    e.preventDefault();
    router.push('/masjid');
  });

  useHotkeys('alt+t', (e) => {
    e.preventDefault();
    router.push('/achievements');
  });

  return null; // This component doesn't render anything
}
