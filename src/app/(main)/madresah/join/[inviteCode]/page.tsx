'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2, GraduationCap, CheckCircle2, AlertCircle, Users, BookOpen, School } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

type JoinState = 'loading' | 'resolving' | 'choose-role' | 'joining' | 'success' | 'already' | 'error';

const ROLES = [
  { value: 'STUDENT', label: 'Student', icon: BookOpen, desc: 'Join as a student and do homework, track Hifz' },
  { value: 'TEACHER', label: 'Teacher', icon: GraduationCap, desc: 'Teach classes, assign work, grade students' },
  { value: 'PARENT', label: 'Parent', icon: Users, desc: 'Monitor your child\'s progress and attendance' },
];

export default function MadresahJoinPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const inviteCode = (params?.inviteCode as string)?.toUpperCase();

  const [state, setState] = useState<JoinState>('loading');
  const [schoolName, setSchoolName] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [schoolInfo, setSchoolInfo] = useState<any>(null);
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [errorMsg, setErrorMsg] = useState('');

  // Step 1: resolve the school info (no auth needed)
  useEffect(() => {
    if (!inviteCode) return;
    setState('resolving');
    fetch(`/api/madresah/join?code=${inviteCode}`)
      .then(async (res) => {
        if (!res.ok) {
          setErrorMsg('Invalid or expired invite link. Please check the code and try again.');
          setState('error');
          return;
        }
        const data = await res.json();
        setSchoolInfo(data.madresah);
        setSchoolName(data.madresah.name);
        setSchoolId(data.madresah.id);
        // Now wait for auth
        if (!isLoading && user) {
          setState('choose-role');
        } else {
          setState('loading');
        }
      })
      .catch(() => {
        setErrorMsg('Could not load school details. Please try again.');
        setState('error');
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inviteCode]);

  // Step 2: once auth resolves
  useEffect(() => {
    if (isLoading) return;
    if (state === 'resolving') return; // still fetching school

    if (!user) {
      // Save invite code so we can return after login
      router.replace(`/auth/sign-in?callbackUrl=/madresah/join/${inviteCode}`);
      return;
    }

    if (schoolInfo && state === 'loading') {
      setState('choose-role');
    }
  }, [user, isLoading, state, schoolInfo, inviteCode, router]);

  const handleJoin = async () => {
    setState('joining');
    try {
      const res = await fetch('/api/madresah/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode, role: selectedRole }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'Failed to join school');
        setState('error');
        return;
      }
      setState(data.alreadyMember ? 'already' : 'success');
    } catch {
      setErrorMsg('Something went wrong. Please try again.');
      setState('error');
    }
  };

  // Auto-redirect after success or already-member
  useEffect(() => {
    if ((state === 'success' || state === 'already') && schoolId) {
      const timer = setTimeout(() => {
        router.push(`/madresah/${schoolId}`);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [state, schoolId, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'linear-gradient(135deg,#0a1a6e 0%,#0d3080 45%,#1a1466 100%)' }}
    >
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center" style={{ background: 'linear-gradient(135deg,#0a1a6e,#1a1466)' }}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <School className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-white font-bold text-xl">Deenify Madresah</h1>
          <p className="text-blue-200 text-sm mt-1">School Invite</p>
        </div>

        <div className="px-8 py-8 text-center">
          {/* Loading / Resolving */}
          {(state === 'loading' || state === 'resolving') && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="font-semibold text-gray-700">
                {state === 'resolving' ? 'Looking up school…' : 'Checking your session…'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Code: <span className="font-mono font-bold text-blue-700">{inviteCode}</span>
              </p>
            </>
          )}

          {/* Choose role */}
          {state === 'choose-role' && schoolInfo && (
            <>
              <div className="mb-5">
                <p className="text-sm text-muted-foreground mb-1">You&apos;ve been invited to join</p>
                <h2 className="text-xl font-bold text-gray-800">{schoolName}</h2>
                <div className="flex justify-center gap-3 mt-2">
                  <Badge variant="secondary">{schoolInfo._count?.members ?? 0} members</Badge>
                  <Badge variant="secondary">{schoolInfo._count?.classes ?? 0} classes</Badge>
                </div>
                {schoolInfo.description && (
                  <p className="text-sm text-muted-foreground mt-2">{schoolInfo.description}</p>
                )}
              </div>

              <p className="text-sm font-medium text-gray-700 mb-3 text-left">I&apos;m joining as a…</p>
              <div className="space-y-2 mb-5">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const active = selectedRole === r.value;
                  return (
                    <button
                      key={r.value}
                      onClick={() => setSelectedRole(r.value)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${
                        active
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-gray-800">{r.label}</p>
                        <p className="text-xs text-muted-foreground">{r.desc}</p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <Button onClick={handleJoin} className="w-full bg-blue-600 hover:bg-blue-700">
                Join {schoolName}
              </Button>
            </>
          )}

          {/* Joining */}
          {state === 'joining' && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="font-semibold text-gray-700">Joining school…</p>
            </>
          )}

          {/* Success */}
          {state === 'success' && (
            <>
              <CheckCircle2 className="h-14 w-14 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome! 🎉</h2>
              <p className="text-muted-foreground">You&apos;ve joined</p>
              <p className="font-bold text-blue-700 text-lg mt-1">{schoolName}</p>
              <p className="text-xs text-muted-foreground mt-3">Redirecting to school dashboard…</p>
              <Button asChild className="w-full mt-4 bg-blue-600 hover:bg-blue-700">
                <Link href={`/madresah/${schoolId}`}>Go to School →</Link>
              </Button>
            </>
          )}

          {/* Already member */}
          {state === 'already' && (
            <>
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-1">Already a member!</h2>
              <p className="text-muted-foreground">You&apos;re already enrolled in</p>
              <p className="font-bold text-emerald-700 text-lg mt-1">{schoolName}</p>
              <p className="text-xs text-muted-foreground mt-3">Redirecting to school dashboard…</p>
              <Button asChild className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/madresah/${schoolId}`}>Open School →</Link>
              </Button>
            </>
          )}

          {/* Error */}
          {state === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-1">Could not join</h2>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <div className="flex flex-col gap-2 mt-5">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/madresah">Browse Schools</Link>
                </Button>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/dashboard">Go Home</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
