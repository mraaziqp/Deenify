"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';

/* ─── Floating geometric orbs ─── */
const orbs = [
  { size: 320, top: '-80px', left: '-80px', delay: '0s', duration: '18s', opacity: 0.18 },
  { size: 200, top: '30%', right: '-60px', delay: '3s', duration: '22s', opacity: 0.12 },
  { size: 150, bottom: '10%', left: '15%', delay: '6s', duration: '16s', opacity: 0.15 },
  { size: 100, top: '55%', left: '5%', delay: '9s', duration: '20s', opacity: 0.10 },
];

/* ─── Islamic star ─── */
function IslamicStar({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="currentColor">
      <polygon points="20,2 23.5,14.5 36,14.5 25.5,22.5 29,35 20,27.5 11,35 14.5,22.5 4,14.5 16.5,14.5" />
    </svg>
  );
}

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error('Invalid credentials. Please check your email and password.');
      router.replace('/dashboard');
      setTimeout(() => window.location.reload(), 100);
    } catch (err: any) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen overflow-hidden">

      {/* ══════════════════════════════════════════
          LEFT PANEL — Islamic Hero
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[55%] relative flex-col items-center justify-center overflow-hidden bg-hero-islamic">

        {/* Animated radial backdrop */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 20% 20%, hsl(162 68% 22% / 0.95) 0%, transparent 60%),
              radial-gradient(ellipse at 80% 80%, hsl(40 90% 20% / 0.7) 0%, transparent 55%),
              radial-gradient(ellipse at 50% 50%, hsl(162 72% 14% / 1) 0%, transparent 100%)
            `,
          }}
        />

        {/* Islamic dot-grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.55) 1px, transparent 0)`,
            backgroundSize: '28px 28px',
          }}
        />

        {/* Decorative geometric rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute rounded-full border border-white/5" style={{ width: 600, height: 600 }} />
          <div className="absolute rounded-full border border-white/8" style={{ width: 450, height: 450 }} />
          <div className="absolute rounded-full border border-white/12" style={{ width: 300, height: 300 }} />
        </div>

        {/* Floating colour orbs */}
        {orbs.map((orb, i) => (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              top: (orb as any).top,
              left: (orb as any).left,
              right: (orb as any).right,
              bottom: (orb as any).bottom,
              background: i % 2 === 0
                ? `radial-gradient(circle, hsl(162 72% 40% / ${orb.opacity * 1.5}), transparent)`
                : `radial-gradient(circle, hsl(40 90% 50% / ${orb.opacity}), transparent)`,
              animation: `subtlePulse ${orb.duration} ${orb.delay} ease-in-out infinite`,
            }}
          />
        ))}

        {/* Star decorations */}
        <IslamicStar size={20} className="absolute top-12 right-20 text-yellow-300/30 animate-crescent" />
        <IslamicStar size={14} className="absolute top-24 right-36 text-white/20" />
        <IslamicStar size={16} className="absolute bottom-20 left-20 text-yellow-400/25 animate-crescent" />
        <IslamicStar size={10} className="absolute bottom-32 left-36 text-white/15" />
        <IslamicStar size={18} className="absolute top-1/3 left-10 text-white/20 animate-crescent" />

        {/* ── Main hero content ── */}
        <div
          className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          {/* Brand mark */}
          <div className="mb-6 relative">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mb-4 mx-auto"
              style={{
                background: 'linear-gradient(135deg, hsl(162 72% 35%), hsl(40 90% 45%))',
                boxShadow: '0 8px 32px hsl(162 72% 26% / 0.5), 0 0 0 1px rgba(255,255,255,0.1)',
              }}
            >
              <span className="text-4xl">☽</span>
            </div>
            <div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'hsl(40 90% 50%)' }}
            >
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          </div>

          {/* App name */}
          <h1 className="text-5xl font-black tracking-tight text-white mb-1" style={{ letterSpacing: '-0.03em' }}>
            Deen<span style={{ color: 'hsl(40 90% 55%)' }}>ify</span>
          </h1>
          <p className="text-white/50 text-sm uppercase tracking-widest font-medium mb-8">
            Your Islamic Companion
          </p>

          {/* Bismillah */}
          <div className="arabic-text text-white/90 mb-6" style={{ fontSize: '2rem', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          {/* Hadith quote card */}
          <div
            className="rounded-2xl px-6 py-4 mb-8"
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <p className="text-white/85 text-base font-light leading-relaxed">
              "Whoever treads a path in search of knowledge,
              God will make easy for him a path to Paradise."
            </p>
            <p className="text-yellow-300/70 text-xs mt-2 font-medium tracking-wide">— Sahih Muslim</p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['Quran & Tafsir', 'Prayer Times', 'Dhikr & Awrad', 'Islamic Library'].map((f) => (
              <span
                key={f}
                className="text-xs px-3 py-1.5 rounded-full text-white/80 font-medium"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div
          className="absolute bottom-0 left-0 right-0 h-24"
          style={{ background: 'linear-gradient(to top, hsl(162 72% 12% / 0.6), transparent)' }}
        />
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Sign-In Form
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center relative bg-background overflow-y-auto">

        {/* Subtle bg dot pattern */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(162 72% 26% / 0.06) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Soft glow top-right */}
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, hsl(162 72% 26% / 0.06) 0%, transparent 70%)',
            transform: 'translate(30%, -30%)',
          }}
        />

        <div
          className="relative z-10 w-full max-w-md px-6 py-10"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(16px)',
            transition: 'opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s',
          }}
        >
          {/* Mobile brand */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ background: 'linear-gradient(135deg, hsl(162 72% 26%), hsl(40 90% 45%))' }}
            >
              <span className="text-2xl">☽</span>
            </div>
            <h1 className="text-3xl font-black text-gradient-emerald">Deenify</h1>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-yellow-500" />
              <span className="text-xs font-semibold text-yellow-600 uppercase tracking-widest">Welcome Back</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Sign in to your account</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">Continue your journey of knowledge and worship</p>
          </div>

          {/* Form card */}
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              boxShadow: '0 4px 24px hsl(162 72% 26% / 0.07), 0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <form onSubmit={handleSignIn} className="flex flex-col gap-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-foreground">Password</label>
                  <a href="#" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="pl-10 pr-11 h-11 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div
                  className="flex items-start gap-2.5 rounded-xl px-4 py-3 text-sm text-red-700 dark:text-red-400 animate-fade-in"
                  style={{ background: 'hsl(0 84% 60% / 0.08)', border: '1px solid hsl(0 84% 60% / 0.2)' }}
                >
                  <span className="mt-0.5 text-red-500 shrink-0">⚠</span>
                  {error}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 rounded-xl font-semibold text-sm btn-shine relative overflow-hidden"
                style={{
                  background: loading
                    ? 'hsl(162 72% 26% / 0.7)'
                    : 'linear-gradient(135deg, hsl(162 72% 26%) 0%, hsl(162 65% 32%) 100%)',
                  boxShadow: loading ? 'none' : '0 4px 16px hsl(162 72% 26% / 0.3)',
                  border: 'none',
                }}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Signing in…
                  </span>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground font-medium px-1">New to Deenify?</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* Sign-up link */}
          <Link
            href="/auth/sign-up"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200 border hover:border-primary hover:text-primary"
            style={{
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              background: 'hsl(var(--card))',
            }}
          >
            Create a free account
          </Link>

          <p className="text-center text-xs text-muted-foreground/70 mt-6 px-4">
            By signing in, you agree to Deenify&apos;s{' '}
            <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
