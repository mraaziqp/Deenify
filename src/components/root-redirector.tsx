"use client";
import { useEffect } from 'react';

export default function RootRedirector() {
  useEffect(() => {
    if (window.location.pathname === '/') {
      window.location.replace('/ramadan');
    }
  }, []);
  return null;
}
