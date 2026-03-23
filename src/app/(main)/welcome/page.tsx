'use client';
export const dynamic = "force-dynamic";

import { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';

const QUICK_STARTS = [
  { icon: 'ðŸ“–', label: 'Read Quran', sub: 'with audio & tafsir', href: '/quran', bg: '#e6f4f0', color: '#065f46' },
  { icon: 'ðŸ¤²', label: 'Daily Duas', sub: 'Hisnul Muslim', href: '/hisnul-muslim', bg: '#fdf6e3', color: '#92400e' },
  { icon: 'ðŸ“¿', label: 'Dhikr Circle', sub: 'count globally', href: '/dhikr', bg: '#fdf2f8', color: '#831843' },
  { icon: '🕌', label: 'Prayer Times', sub: 'accurate & local', href: '/dashboard?tab=prayer', bg: '#eef2ff', color: '#312e81' },
  { icon: 'ðŸ«', label: 'Madresah', sub: 'school portal', href: '/madresah', bg: '#ecfdf5', color: '#065f46' },
  { icon: 'ðŸ¤–', label: 'AI Assistant', sub: 'ask anything', href: '/ai-assistant', bg: '#faf5ff', color: '#4c1d95' },
];

export default function WelcomePage() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const displayName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there';
  const callbackUrl =
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('callbackUrl') || '')
      : '';
  const finalDest = callbackUrl && callbackUrl.startsWith('/') ? callbackUrl : '/dashboard';

  return (
    <div className="container mx-auto max-w-xl py-10 px-4">
      {/* Progress dots */}
      <div className="flex justify-center gap-2 mb-8">
        {[0, 1].map((i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === step ? 'w-6 bg-emerald-600' : 'w-2 bg-gray-200'
            }`}
          />
        ))}
      </div>
      {/* Step 0 â€“ Greeting */}
      {step === 0 && (
        <div className="text-center">
          {/* Brand orb */}
          <div
            className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, hsl(162 72% 26%), hsl(40 90% 45%))' }}
          >
            <span className="text-4xl">â˜½</span>
          </div>
          <h1 className="text-3xl font-black mb-1">
            Ø§Ù„Ø³Ù„Ø§Ù… Ø¹Ù„ÙŠÙƒÙ…ØŒ <span className="text-emerald-600">{displayName}</span>!
          </h1>
          <p className="text-muted-foreground mt-2 mb-8 text-base">
            Welcome to <strong>Deenify</strong> â€” your all-in-one Islamic companion.
            May Allah bless your journey of knowledge and worship.
          </p>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 gap-3 mb-8 text-left">
            {[
              { icon: 'ðŸ“–', text: 'Full Quran with tafsir & audio' },
              { icon: 'ðŸ¤²', text: 'Duas from Hisnul Muslim' },
              { icon: 'ðŸ“¿', text: 'Global Dhikr circle' },
              { icon: 'ðŸ•Œ', text: 'Prayer times & Qibla compass' },
              { icon: 'ðŸ«', text: 'Madresah school portal' },
              { icon: 'ðŸ¤–', text: 'AI Islamic assistant' },
            ].map(f => (
              <div key={f.text} className="flex items-start gap-2 rounded-xl bg-muted/50 px-3 py-2.5">
                <span className="text-lg leading-none mt-0.5">{f.icon}</span>
                <span className="text-xs text-foreground/80">{f.text}</span>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl px-4 py-3 mb-8 text-sm italic text-left"
            style={{ background: 'hsl(162 72% 96%)', borderLeft: '3px solid hsl(162 72% 40%)' }}
          >
            <span className="not-italic font-semibold text-emerald-700">"</span>Seeking knowledge is an obligation upon every Muslim.<span className="not-italic font-semibold text-emerald-700">"</span>
            <span className="block text-xs text-muted-foreground mt-0.5">â€” Ibn Majah</span>
          </div>

          <Button
            onClick={() => setStep(1)}
            className="w-full h-12 rounded-xl text-base font-semibold gap-2"
            style={{ background: 'linear-gradient(135deg, hsl(162 72% 26%), hsl(162 65% 32%))' }}
          >
            Get started <ChevronRight className="h-5 w-5" />
          </Button>
          <Button asChild variant="ghost" className="w-full mt-2 text-muted-foreground">
            <Link href={finalDest}>Skip to {callbackUrl ? 'your destination' : 'dashboard'}</Link>
          </Button>
        </div>
      )}

      {/* Step 1 â€“ Quick start picker */}
      {step === 1 && (
        <div>
          <div className="text-center mb-6">
            <Sparkles className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
            <h2 className="text-2xl font-bold">What would you like to do first?</h2>
            <p className="text-muted-foreground text-sm mt-1">You can always explore everything from the dashboard.</p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-6">
            {QUICK_STARTS.map(q => (
              <Link
                key={q.label}
                href={q.href}
                className="block rounded-2xl p-4 text-left transition-shadow hover:shadow-md"
                style={{ background: q.bg, textDecoration: 'none' }}
              >
                <div className="text-3xl mb-2">{q.icon}</div>
                <p className="font-semibold text-sm" style={{ color: q.color }}>{q.label}</p>
                <p className="text-xs mt-0.5" style={{ color: q.color + '99' }}>{q.sub}</p>
              </Link>
            ))}
          </div>

          <Button asChild className="w-full h-12 rounded-xl text-base font-semibold gap-2">
            <Link href={finalDest}>
              {callbackUrl ? 'Continue to your destination' : 'Go to my dashboard'} <Sparkles className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
