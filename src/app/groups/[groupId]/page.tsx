'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users, Copy, Check, Plus, UserPlus, BookOpen, Heart,
  Clock, CheckCircle2, Circle, Loader2, ChevronLeft, Trophy,
  Shield, Trash2, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

// ── helpers ──────────────────────────────────────────────────────────────────

function displayName(u: any) {
  return u?.displayName || u?.username || u?.email?.split('@')[0] || 'User';
}

function JuzGrid({ campaign, groupId, currentUserId, onUpdate }: {
  campaign: any; groupId: string; currentUserId: string; onUpdate: () => void;
}) {
  const [acting, setActing] = useState<number | null>(null);

  const doAction = async (juz: any) => {
    if (acting) return;
    const isMyJuz = juz.claimedByUserId === currentUserId;
    if (juz.status === 'COMPLETED') return;
    if (juz.status === 'READING' && !isMyJuz) {
      toast('This Juz is being recited by ' + displayName(juz.claimedByUser)); return;
    }
    const endpoint = juz.status === 'OPEN'
      ? `/api/groups/${groupId}/campaigns/${campaign.id}/juz/${juz.juzNumber}/claim`
      : `/api/groups/${groupId}/campaigns/${campaign.id}/juz/${juz.juzNumber}/complete`;

    setActing(juz.juzNumber);
    try {
      const res = await fetch(endpoint, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(juz.status === 'OPEN'
        ? `📖 Juz ${juz.juzNumber} claimed! May Allah make it easy.`
        : `✅ Juz ${juz.juzNumber} completed! Alhamdulillah!`);
      onUpdate();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setActing(null);
    }
  };

  const juzList = campaign.khatmJuz || [];
  const completed = juzList.filter((j: any) => j.status === 'COMPLETED').length;
  const reading = juzList.filter((j: any) => j.status === 'READING').length;
  const pct = Math.round((completed / 30) * 100);

  return (
    <div>
      <div className="flex gap-4 text-sm mb-3 flex-wrap">
        <span className="text-emerald-600 font-semibold">{completed}/30 Completed</span>
        <span className="text-amber-600">{reading} Being recited</span>
        <span className="text-muted-foreground">{30 - completed - reading} Available</span>
        <span className="font-bold">{pct}%</span>
      </div>
      <Progress value={pct} className="h-2 mb-4" />
      <div className="grid grid-cols-6 sm:grid-cols-10 gap-1.5">
        {juzList.map((juz: any) => {
          const isMe = juz.claimedByUserId === currentUserId;
          let bg = 'bg-emerald-500 hover:bg-emerald-400 cursor-pointer';
          let title = `Juz ${juz.juzNumber} — click to claim`;
          if (juz.status === 'READING') {
            bg = isMe
              ? 'bg-amber-400 hover:bg-amber-300 cursor-pointer ring-2 ring-amber-600'
              : 'bg-amber-300 cursor-default opacity-80';
            title = isMe
              ? `Juz ${juz.juzNumber} — you're reciting (click to mark complete)`
              : `Juz ${juz.juzNumber} — ${displayName(juz.claimedByUser)} is reciting`;
          }
          if (juz.status === 'COMPLETED') {
            bg = 'bg-gray-300 cursor-default';
            title = `Juz ${juz.juzNumber} — completed by ${displayName(juz.claimedByUser)}`;
          }
          return (
            <button
              key={juz.juzNumber}
              title={title}
              onClick={() => doAction(juz)}
              disabled={
                acting === juz.juzNumber ||
                juz.status === 'COMPLETED' ||
                (juz.status === 'READING' && !isMe)
              }
              className={`${bg} text-white rounded-lg h-10 text-sm font-bold flex items-center justify-center transition-all relative`}
            >
              {acting === juz.juzNumber
                ? <Loader2 className="h-3 w-3 animate-spin" />
                : juz.status === 'COMPLETED'
                  ? <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  : juz.juzNumber}
            </button>
          );
        })}
      </div>
      <div className="flex gap-3 mt-3 text-xs flex-wrap">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> Available</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-300 inline-block" /> Being recited</span>
        <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-600" /> Completed</span>
      </div>
    </div>
  );
}

function DhikrPanel({ campaign, groupId, currentUserId, onUpdate }: {
  campaign: any; groupId: string; currentUserId: string; onUpdate: () => void;
}) {
  const [count, setCount] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const pct = Math.min(Math.round((campaign.currentCount / campaign.targetCount) * 100), 100);

  const submit = async () => {
    if (count < 1) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/campaigns/${campaign.id}/contribute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(`+${count} added! Total: ${data.updatedCount.toLocaleString()}`);
      onUpdate();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  // Summarise contributors
  const contribs: Record<string, { name: string; total: number }> = {};
  (campaign.dhikrContributions || []).forEach((c: any) => {
    if (!contribs[c.userId]) contribs[c.userId] = { name: displayName(c.user), total: 0 };
    contribs[c.userId].total += c.count;
  });
  const leaderboard = Object.values(contribs).sort((a, b) => b.total - a.total).slice(0, 5);

  return (
    <div>
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-semibold text-emerald-600">{campaign.currentCount.toLocaleString()} / {campaign.targetCount.toLocaleString()}</span>
          <span>{pct}%</span>
        </div>
        <Progress value={pct} className="h-3" />
      </div>
      <div className="flex gap-2 items-center mb-4">
        <Input
          type="number"
          min={1}
          max={10000}
          value={count}
          onChange={(e) => setCount(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-28 text-center font-bold text-lg"
        />
        <Button onClick={submit} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
          Add Dhikr
        </Button>
        <div className="flex gap-1">
          {[1, 33, 100].map((n) => (
            <button key={n} onClick={() => setCount(n)} className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors">
              +{n}
            </button>
          ))}
        </div>
      </div>
      {leaderboard.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Top Contributors</p>
          <div className="space-y-1.5">
            {leaderboard.map((l, i) => (
              <div key={l.name} className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground w-4">{i + 1}.</span>
                <span className="font-medium flex-1">{l.name}</span>
                <span className="font-bold text-emerald-600">{l.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const groupId = (params?.groupId ?? '') as string;

  const [group, setGroup] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  // Add member dialog
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [memberQuery, setMemberQuery] = useState('');
  const [memberSearch, setMemberSearch] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingMember, setAddingMember] = useState('');

  // Create campaign dialog
  const [campaignOpen, setCampaignOpen] = useState(false);
  const [campTitle, setCampTitle] = useState('');
  const [campType, setCampType] = useState<'DHIKR' | 'KHATM'>('KHATM');
  const [campTarget, setCampTarget] = useState(100000);
  const [creatingCamp, setCreatingCamp] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchGroup = useCallback(async () => {
    try {
      const res = await fetch(`/api/groups/${groupId}`);
      if (res.status === 404 || res.status === 403) { setError('Group not found or access denied.'); return; }
      const data = await res.json();
      setGroup(data.group);
    } catch {
      // silent poll failure
    } finally {
      setLoading(false);
    }
  }, [groupId]);

  useEffect(() => {
    fetchGroup();
    // Live poll every 8 seconds
    intervalRef.current = setInterval(fetchGroup, 8000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchGroup]);

  // User search debounce
  useEffect(() => {
    if (!memberQuery.trim() || memberQuery.length < 2) { setMemberSearch([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await fetch(`/api/users/search?q=${encodeURIComponent(memberQuery)}`);
        const data = await res.json();
        setMemberSearch(data.users || []);
      } finally {
        setSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [memberQuery]);

  const addMember = async (emailOrUsername: string) => {
    setAddingMember(emailOrUsername);
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Member added!');
      setAddMemberOpen(false);
      setMemberQuery('');
      setMemberSearch([]);
      fetchGroup();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setAddingMember('');
    }
  };

  const createCampaign = async () => {
    if (!campTitle.trim()) { toast.error('Title required'); return; }
    setCreatingCamp(true);
    try {
      const res = await fetch(`/api/groups/${groupId}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: campType, title: campTitle, targetCount: campTarget }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Campaign created!');
      setCampaignOpen(false);
      setCampTitle(''); setCampTarget(100000); setCampType('KHATM');
      fetchGroup();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreatingCamp(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/members`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId }),
      });
      if (!res.ok) throw new Error('Failed to remove member');
      toast.success('Member removed');
      fetchGroup();
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
    </div>
  );

  if (error) return (
    <div className="container mx-auto max-w-2xl py-20 text-center">
      <p className="text-lg text-muted-foreground">{error}</p>
      <Button asChild className="mt-4"><Link href="/groups">← Back to Groups</Link></Button>
    </div>
  );

  if (!group) return null;

  const isAdmin = group.adminId === user?.id;
  const inviteCode = group.inviteCode;

  return (
    <div className="container mx-auto max-w-4xl py-6 px-4">
      <Toaster />

      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground">
          <Link href="/groups"><ChevronLeft className="h-4 w-4" /> Groups</Link>
        </Button>
      </div>

      <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{group.name}</h1>
              {isAdmin && <Badge className="bg-amber-400 text-amber-900 text-xs"><Shield className="h-3 w-3 mr-1" />Admin</Badge>}
            </div>
            {group.description && <p className="text-emerald-100 text-sm">{group.description}</p>}
            <div className="flex items-center gap-4 mt-3 text-sm text-emerald-100">
              <span><Users className="h-4 w-4 inline mr-1" />{group.members.length} members</span>
              <span>{group.campaigns.length} campaigns</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 items-end shrink-0">
            {inviteCode && (
              <button
                onClick={() => { navigator.clipboard.writeText(inviteCode); setCopied(true); toast.success('Invite code copied!'); setTimeout(() => setCopied(false), 2000); }}
                className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 px-3 py-2 rounded-xl text-sm font-mono transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {inviteCode}
              </button>
            )}
            <button onClick={fetchGroup} className="text-emerald-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors" title="Refresh">
              <RefreshCw className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="campaigns">
        <TabsList className="mb-4">
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="members">Members ({group.members.length})</TabsTrigger>
        </TabsList>

        {/* ── Campaigns Tab ── */}
        <TabsContent value="campaigns">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">Live updates every 8 seconds</p>
            {isAdmin && (
              <Button onClick={() => setCampaignOpen(true)} size="sm" className="bg-emerald-600 hover:bg-emerald-700 gap-1">
                <Plus className="h-4 w-4" /> New Campaign
              </Button>
            )}
          </div>

          {group.campaigns.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-semibold text-muted-foreground">No campaigns yet</p>
                {isAdmin && <Button className="mt-4 bg-emerald-600 hover:bg-emerald-700" onClick={() => setCampaignOpen(true)}>Start a Campaign</Button>}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {group.campaigns.map((c: any) => (
                <Card key={c.id} className="border-l-4 border-l-emerald-400">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {c.type === 'KHATM' ? <BookOpen className="h-5 w-5 text-emerald-600" /> : <Heart className="h-5 w-5 text-rose-500" />}
                        <CardTitle className="text-lg">{c.title}</CardTitle>
                        <Badge variant="outline" className="text-xs">{c.type}</Badge>
                      </div>
                      <Badge className={c.status === 'OPEN' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}>
                        {c.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {c.type === 'KHATM' ? (
                      <JuzGrid campaign={c} groupId={groupId} currentUserId={user?.id || ''} onUpdate={fetchGroup} />
                    ) : (
                      <DhikrPanel campaign={c} groupId={groupId} currentUserId={user?.id || ''} onUpdate={fetchGroup} />
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Members Tab ── */}
        <TabsContent value="members">
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-muted-foreground">Share the invite code to add members</p>
            {isAdmin && (
              <Button onClick={() => setAddMemberOpen(true)} size="sm" variant="outline" className="gap-1">
                <UserPlus className="h-4 w-4" /> Add by Email/Username
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {group.members.map((m: any) => (
              <div key={m.id} className="flex items-center justify-between p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                    {displayName(m.user)[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{displayName(m.user)}</p>
                    <p className="text-xs text-muted-foreground">{m.user.email}{m.user.username ? ` · @${m.user.username}` : ''}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {m.role === 'ADMIN' && (
                    <Badge className="text-xs bg-amber-100 text-amber-700 border border-amber-300">
                      <Shield className="h-3 w-3 mr-1" />Admin
                    </Badge>
                  )}
                  {isAdmin && m.userId !== user?.id && (
                    <button
                      onClick={() => removeMember(m.id)}
                      className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      title="Remove member"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Member</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label>Search by email or username</Label>
            <Input
              value={memberQuery}
              onChange={(e) => setMemberQuery(e.target.value)}
              placeholder="e.g. ahmad or ahmad@email.com"
              className="mt-1"
            />
            {searching && <p className="text-xs text-muted-foreground mt-2">Searching...</p>}
            {memberSearch.length > 0 && (
              <div className="mt-2 border rounded-lg overflow-hidden divide-y">
                {memberSearch.map((u) => {
                  const alreadyMember = group.members.some((m: any) => m.userId === u.id);
                  return (
                    <div key={u.id} className="flex items-center justify-between px-3 py-2.5 hover:bg-accent/50">
                      <div>
                        <p className="font-medium text-sm">{displayName(u)}</p>
                        <p className="text-xs text-muted-foreground">{u.email}{u.username ? ` · @${u.username}` : ''}</p>
                      </div>
                      <Button
                        size="sm"
                        disabled={alreadyMember || addingMember === u.email}
                        onClick={() => addMember(u.email)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs h-7"
                      >
                        {alreadyMember ? 'Already in' : addingMember === u.email ? 'Adding...' : 'Add'}
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}
            {memberQuery.length >= 2 && !searching && memberSearch.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">No users found. Try a full email address.</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Campaign Dialog */}
      <Dialog open={campaignOpen} onOpenChange={setCampaignOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Campaign</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Campaign Type</Label>
              <div className="flex gap-3 mt-2">
                {(['KHATM', 'DHIKR'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setCampType(t); setCampTarget(t === 'KHATM' ? 30 : 100000); }}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-semibold transition-colors ${campType === t ? 'bg-emerald-600 text-white border-emerald-600' : 'border-muted text-muted-foreground hover:border-emerald-400'}`}
                  >
                    {t === 'KHATM' ? '📖 Quran Khatm' : '📿 Dhikr'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={campTitle} onChange={(e) => setCampTitle(e.target.value)} placeholder={campType === 'KHATM' ? 'e.g. Ramadan Khatm 2026' : 'e.g. 1 Million Salawat'} className="mt-1" />
            </div>
            {campType === 'DHIKR' && (
              <div>
                <Label>Target Count</Label>
                <Input type="number" min={1} value={campTarget} onChange={(e) => setCampTarget(parseInt(e.target.value) || 100000)} className="mt-1" />
                <div className="flex gap-2 mt-2">
                  {[1000, 10000, 100000, 1000000].map((n) => (
                    <button key={n} onClick={() => setCampTarget(n)} className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 hover:bg-emerald-200">
                      {n >= 1000000 ? '1M' : n >= 1000 ? `${n / 1000}K` : n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCampaignOpen(false)}>Cancel</Button>
            <Button onClick={createCampaign} disabled={creatingCamp} className="bg-emerald-600 hover:bg-emerald-700">
              {creatingCamp ? 'Creating...' : 'Create Campaign'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
