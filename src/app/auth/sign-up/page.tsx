"use client";
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, Mail, Lock, User, Sparkles, CheckCircle2, Star } from 'lucide-react';
import Link from 'next/link';

/* ─── Floating orbs config ─── */
const orbs = [
  { size: 280, top: '-60px', right: '-60px', delay: '0s', duration: '20s', opacity: 0.16 },
  { size: 180, bottom: '5%', left: '-40px', delay: '4s', duration: '24s', opacity: 0.12 },
  { size: 120, top: '40%', right: '5%', delay: '8s', duration: '18s', opacity: 0.14 },
];

/* ─── Islamic star ─── */
function IslamicStar({ size = 40, className = '' }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" className={className} fill="currentColor">
      <polygon points="20,2 23.5,14.5 36,14.5 25.5,22.5 29,35 20,27.5 11,35 14.5,22.5 4,14.5 16.5,14.5" />
    </svg>
  );
}

const benefits = [
  'Access the full Quran with Tafsir & audio',
  'Track daily prayers and dhikr streaks',
  'Join global Khatm circles & groups',
  'Explore thousands of authentic Islamic texts',
];

export default function SignUpPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/sign-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name.trim(), email, password }),
      });
      if (!res.ok) throw new Error('Sign up failed. This email may already be in use.');
      window.location.href = '/welcome';
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ['', 'Weak', 'Good', 'Strong'][passwordStrength];
  const strengthColor = ['', 'bg-red-400', 'bg-yellow-400', 'bg-emerald-500'][passwordStrength];

  return (
    <div className="flex min-h-screen overflow-hidden">

      {/* ══════════════════════════════════════════
          LEFT PANEL — Islamic Hero
      ══════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative flex-col items-center justify-center overflow-hidden bg-hero-islamic">

        {/* Radial depth layers */}
        <div
          className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse at 25% 25%, hsl(162 68% 22% / 0.95) 0%, transparent 60%),
              radial-gradient(ellipse at 75% 75%, hsl(40 90% 18% / 0.7) 0%, transparent 55%),
              radial-gradient(ellipse at 50% 50%, hsl(162 72% 14%) 0%, transparent 100%)
            `,
          }}
        />

        {/* Dot-grid pattern */}
        <div
          className="absolute inset-0 opacity-18"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.5) 1px, transparent 0)`,
            backgroundSize: '26px 26px',
          }}
        />

        {/* Geometric rings */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="absolute rounded-full border border-white/5" style={{ width: 560, height: 560 }} />
          <div className="absolute rounded-full border border-white/8" style={{ width: 400, height: 400 }} />
          <div className="absolute rounded-full border border-white/12" style={{ width: 260, height: 260 }} />
        </div>

        {/* Floating orbs */}
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
                ? `radial-gradient(circle, hsl(162 72% 40% / ${orb.opacity * 1.4}), transparent)`
                : `radial-gradient(circle, hsl(40 90% 50% / ${orb.opacity}), transparent)`,
              animation: `subtlePulse ${orb.duration} ${orb.delay} ease-in-out infinite`,
            }}
          />
        ))}

        {/* Star deco */}
        <IslamicStar size={18} className="absolute top-14 left-20 text-yellow-300/30 animate-crescent" />
        <IslamicStar size={12} className="absolute top-28 left-36 text-white/20" />
        <IslamicStar size={16} className="absolute bottom-24 right-24 text-yellow-400/25 animate-crescent" />
        <IslamicStar size={10} className="absolute bottom-36 right-40 text-white/15" />
        <IslamicStar size={20} className="absolute top-1/2 right-8 text-white/15 animate-crescent" />

        {/* Hero content */}
        <div
          className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg"
          style={{
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          {/* Brand mark */}
          <div className="mb-5 relative">
            <div
              className="w-18 h-18 w-[72px] h-[72px] rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'linear-gradient(135deg, hsl(162 72% 35%), hsl(40 90% 45%))',
                boxShadow: '0 8px 32px hsl(162 72% 26% / 0.5), 0 0 0 1px rgba(255,255,255,0.1)',
              }}
            >
              <span className="text-3xl">☽</span>
            </div>
            <div
              className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
              style={{ background: 'hsl(40 90% 50%)' }}
            >
              <Star className="w-3 h-3 text-white fill-white" />
            </div>
          </div>

          <h1 className="text-5xl font-black tracking-tight text-white mb-1" style={{ letterSpacing: '-0.03em' }}>
            Deen<span style={{ color: 'hsl(40 90% 55%)' }}>ify</span>
          </h1>
          <p className="text-white/50 text-sm uppercase tracking-widest font-medium mb-7">
            Begin Your Journey
          </p>

          {/* Bismillah */}
          <div className="arabic-text text-white/90 mb-6" style={{ fontSize: '1.85rem', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </div>

          {/* Benefits list */}
          <div
            className="rounded-2xl px-6 py-5 mb-8 w-full text-left"
            style={{
              background: 'rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            <p className="text-white/60 text-xs uppercase tracking-widest font-semibold mb-3">
              What you&apos;ll get
            </p>
            <ul className="space-y-2.5">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-white/80 text-sm">{b}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Quote */}
          <p className="text-white/50 text-xs italic leading-relaxed px-2">
            "Seeking knowledge is an obligation upon every Muslim." — Ibn Majah
          </p>
        </div>

        <div
          className="absolute bottom-0 left-0 right-0 h-20"
          style={{ background: 'linear-gradient(to top, hsl(162 72% 12% / 0.6), transparent)' }}
        />
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANEL — Sign-Up Form
      ══════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col items-center justify-center relative bg-background overflow-y-auto">

        {/* Bg dot pattern */}
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, hsl(162 72% 26% / 0.06) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />
        {/* Soft glow */}
        <div
          className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, hsl(40 90% 50% / 0.05) 0%, transparent 70%)',
            transform: 'translate(-30%, 30%)',
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
              <span className="text-xs font-semibold text-yellow-600 uppercase tracking-widest">Free Account</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">Create your account</h2>
            <p className="text-muted-foreground mt-1.5 text-sm">Join thousands on their Islamic learning journey</p>
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
            <form onSubmit={handleSignUp} className="flex flex-col gap-4">

              {/* Name */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Your name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="e.g. Ahmed Abdullah"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    autoFocus
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>

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
                    className="pl-10 h-11 rounded-xl"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a password"
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
                {/* Password strength */}
                {password.length > 0 && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3].map(i => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength ? strengthColor : 'bg-border'}`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${passwordStrength === 1 ? 'text-red-500' : passwordStrength === 2 ? 'text-yellow-600' : 'text-emerald-600'}`}>
                      {strengthLabel} password
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm password */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className={`pl-10 pr-11 h-11 rounded-xl ${confirmPassword && confirmPassword !== password ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(v => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && password && confirmPassword === password && (
                  <p className="text-xs text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Passwords match
                  </p>
                )}
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
                className="w-full h-11 rounded-xl font-semibold text-sm btn-shine relative overflow-hidden mt-1"
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
                    Creating account…
                  </span>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border/60" />
            <span className="text-xs text-muted-foreground font-medium px-1">Already have an account?</span>
            <div className="flex-1 h-px bg-border/60" />
          </div>

          {/* Sign-in link */}
          <Link
            href="/auth/sign-in"
            className="flex items-center justify-center gap-2 w-full h-11 rounded-xl text-sm font-semibold transition-all duration-200 border hover:border-primary hover:text-primary"
            style={{
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
              background: 'hsl(var(--card))',
            }}
          >
            Sign in to existing account
          </Link>

          <p className="text-center text-xs text-muted-foreground/70 mt-6 px-4">
            By creating an account, you agree to Deenify&apos;s{' '}
            <a href="#" className="underline hover:text-primary transition-colors">Terms of Service</a>{' '}
            and{' '}
            <a href="#" className="underline hover:text-primary transition-colors">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
