"use client";
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle');
  const [message, setMessage] = useState('');

  const email = searchParams?.get('email') || '';
  const token = searchParams?.get('token') || '';

  useEffect(() => {
    if (!email || !token) return;
    setStatus('loading');
    fetch('/api/auth/verify-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Something went wrong. Please try again.');
      });
  }, [email, token]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        {/* Brand */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'linear-gradient(135deg, hsl(162 72% 26%), hsl(40 90% 45%))' }}
        >
          <span className="text-3xl">☽</span>
        </div>
        <h1 className="text-3xl font-black mb-1">Deen<span className="text-emerald-600">ify</span></h1>

        <div
          className="mt-8 rounded-2xl p-8"
          style={{
            background: 'hsl(var(--card))',
            border: '1px solid hsl(var(--border))',
            boxShadow: '0 4px 24px hsl(162 72% 26% / 0.07)',
          }}
        >
          {/* No params */}
          {status === 'idle' && (
            <>
              <Mail className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Check your email</h2>
              <p className="text-muted-foreground text-sm">
                We&apos;ve sent a verification link to your email address.<br />
                Click the link in the email to verify your account.
              </p>
              <p className="text-xs text-muted-foreground mt-4">Didn&apos;t receive the email? Check your spam folder.</p>
            </>
          )}

          {/* Loading */}
          {status === 'loading' && (
            <>
              <Loader2 className="h-12 w-12 text-emerald-600 mx-auto mb-4 animate-spin" />
              <h2 className="text-xl font-bold mb-2">Verifying your email…</h2>
              <p className="text-muted-foreground text-sm">Please wait a moment.</p>
            </>
          )}

          {/* Success */}
          {status === 'success' && (
            <>
              <CheckCircle2 className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Email verified!</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Your email has been verified. You can now sign in to Deenify.
              </p>
              <Button asChild className="w-full h-11 rounded-xl">
                <Link href="/auth/sign-in">Continue to Sign In</Link>
              </Button>
            </>
          )}

          {/* Error */}
          {status === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Verification failed</h2>
              <p className="text-muted-foreground text-sm mb-6">
                {message || 'This link may have expired or already been used.'}
              </p>
              <Button asChild variant="outline" className="w-full h-11 rounded-xl">
                <Link href="/auth/sign-in">Go to Sign In</Link>
              </Button>
            </>
          )}
        </div>

        {status !== 'success' && (
          <p className="text-xs text-muted-foreground mt-6">
            Already verified?{' '}
            <Link href="/auth/sign-in" className="text-primary underline hover:text-primary/80">
              Sign in here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
