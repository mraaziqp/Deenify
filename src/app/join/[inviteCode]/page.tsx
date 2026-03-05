'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type JoinState = 'loading' | 'joining' | 'success' | 'already' | 'error';

export default function MagicJoinPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const inviteCode = (params?.inviteCode as string)?.toUpperCase();

  const [state, setState] = useState<JoinState>('loading');
  const [groupName, setGroupName] = useState('');
  const [groupId, setGroupId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Wait for auth to resolve
    if (isLoading) return;

    // Not logged in → redirect to sign-in with callback
    if (!user) {
      router.replace(`/auth/sign-in?callbackUrl=/join/${inviteCode}`);
      return;
    }

    // Logged in → attempt to join
    setState('joining');
    fetch('/api/groups/join', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ inviteCode }),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          setErrorMsg(data.error || 'Failed to join group');
          setState('error');
          return;
        }
        setGroupId(data.groupId);
        // Fetch group name for the success message
        return fetch(`/api/groups/${data.groupId}`).then(async (r) => {
          const gdata = await r.json();
          setGroupName(gdata.group?.name || 'the group');
          setState(data.alreadyMember ? 'already' : 'success');
        });
      })
      .catch(() => {
        setErrorMsg('Something went wrong. Please try again.');
        setState('error');
      });
  }, [user, isLoading, inviteCode, router]);

  // Auto-redirect after success
  useEffect(() => {
    if ((state === 'success' || state === 'already') && groupId) {
      const timer = setTimeout(() => {
        router.push(`/groups/${groupId}?joined=${state === 'success' ? '1' : '0'}`);
      }, 2200);
      return () => clearTimeout(timer);
    }
  }, [state, groupId, router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg,#0a4a36 0%,#0d6e50 45%,#1e5f74 100%)' }}>
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 text-center" style={{ background: 'linear-gradient(135deg,#0a4a36,#0d6e50)' }}>
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Users className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-white font-bold text-xl">Deenify Groups</h1>
          <p className="text-emerald-200 text-sm mt-1">Group Invite</p>
        </div>

        <div className="px-8 py-8 text-center">
          {(state === 'loading' || state === 'joining') && (
            <>
              <Loader2 className="h-10 w-10 animate-spin text-emerald-600 mx-auto mb-4" />
              <p className="font-semibold text-gray-700">
                {state === 'loading' ? 'Checking your session…' : 'Joining group…'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">Invite code: <span className="font-mono font-bold text-emerald-700">{inviteCode}</span></p>
            </>
          )}

          {state === 'success' && (
            <>
              <CheckCircle2 className="h-14 w-14 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-1">Welcome! 🎉</h2>
              <p className="text-muted-foreground">You&apos;ve successfully joined</p>
              <p className="font-bold text-emerald-700 text-lg mt-1">{groupName}</p>
              <p className="text-xs text-muted-foreground mt-3">Redirecting you now…</p>
              <Button asChild className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/groups/${groupId}`}>Go to Group →</Link>
              </Button>
            </>
          )}

          {state === 'already' && (
            <>
              <CheckCircle2 className="h-14 w-14 text-blue-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-1">Already a member!</h2>
              <p className="text-muted-foreground">You&apos;re already in</p>
              <p className="font-bold text-blue-700 text-lg mt-1">{groupName}</p>
              <Button asChild className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700">
                <Link href={`/groups/${groupId}`}>Open Group →</Link>
              </Button>
            </>
          )}

          {state === 'error' && (
            <>
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-800 mb-1">Could not join</h2>
              <p className="text-sm text-muted-foreground">{errorMsg}</p>
              <div className="flex flex-col gap-2 mt-5">
                <Button asChild variant="outline" className="w-full">
                  <Link href="/groups">Browse My Groups</Link>
                </Button>
                <Button asChild className="w-full bg-emerald-600 hover:bg-emerald-700">
                  <Link href="/dashboard">Go Home</Link>
                </Button>
              </div>
            </>
          )}
        </div>

        <div className="px-8 pb-6 text-center">
          <p className="text-xs text-muted-foreground">
            Invite code: <span className="font-mono font-bold">{inviteCode}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
