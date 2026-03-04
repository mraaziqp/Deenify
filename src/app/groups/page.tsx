'use client';

import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, LogIn, Copy, Check, Trash2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

interface Group {
  id: string;
  name: string;
  description?: string;
  visibility: string;
  inviteCode?: string;
  myRole: string;
  members: any[];
  campaigns: any[];
  admin: { id: string; email: string; username?: string; displayName?: string };
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState('');
  const [createDesc, setCreateDesc] = useState('');
  const [createVis, setCreateVis] = useState<'PUBLIC' | 'PRIVATE'>('PUBLIC');
  const [creating, setCreating] = useState(false);

  // Join dialog
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joining, setJoining] = useState(false);

  const [copied, setCopied] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    try {
      const res = await fetch('/api/groups');
      const data = await res.json();
      setGroups(data.groups || []);
    } catch {
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  const handleCreate = async () => {
    if (!createName.trim()) { toast.error('Group name is required'); return; }
    setCreating(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: createName, description: createDesc, visibility: createVis }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create group');
      setGroups((prev) => [{ ...data.group, myRole: 'ADMIN' }, ...prev]);
      setCreateOpen(false);
      setCreateName(''); setCreateDesc(''); setCreateVis('PUBLIC');
      toast.success(`Group "${data.group.name}" created!`);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreating(false);
    }
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) { toast.error('Enter an invite code'); return; }
    setJoining(true);
    try {
      const res = await fetch('/api/groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: joinCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join group');
      toast.success('Joined group!');
      setJoinOpen(false);
      setJoinCode('');
      fetchGroups();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setJoining(false);
    }
  };

  const copyInviteCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Toaster />
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-emerald-600" />
          <div>
            <h1 className="text-3xl font-bold">My Groups</h1>
            <p className="text-muted-foreground">Collaborate on Khatm &amp; Dhikr with your community</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setJoinOpen(true)} className="gap-2">
            <LogIn className="h-4 w-4" /> Join
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> New Group
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : groups.length === 0 ? (
        <Card className="text-center py-16">
          <CardContent>
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-lg font-semibold text-muted-foreground">No groups yet</p>
            <p className="text-sm text-muted-foreground mt-1 mb-6">Create a group or join one with an invite code</p>
            <div className="flex gap-3 justify-center">
              <Button variant="outline" onClick={() => setJoinOpen(true)}>Join with Code</Button>
              <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">Create Group</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {groups.map((g) => (
            <Card key={g.id} className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link href={`/groups/${g.id}`} className="text-xl font-bold text-emerald-700 hover:underline">
                        {g.name}
                      </Link>
                      <Badge variant={g.visibility === 'PUBLIC' ? 'default' : 'secondary'} className="text-xs">
                        {g.visibility}
                      </Badge>
                      {g.myRole === 'ADMIN' && (
                        <Badge className="text-xs bg-amber-100 text-amber-700 border border-amber-300">
                          <Shield className="h-3 w-3 mr-1" /> Admin
                        </Badge>
                      )}
                    </div>
                    {g.description && <p className="text-sm text-muted-foreground mt-1">{g.description}</p>}
                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground flex-wrap">
                      <span className="flex items-center gap-1"><Users className="h-3.5 w-3.5" /> {g.members.length} member{g.members.length !== 1 ? 's' : ''}</span>
                      <span>{g.campaigns.length} campaign{g.campaigns.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    {g.inviteCode && (
                      <button
                        onClick={() => copyInviteCode(g.inviteCode!)}
                        className="flex items-center gap-1.5 text-xs font-mono bg-emerald-50 border border-emerald-200 text-emerald-700 px-2.5 py-1.5 rounded-lg hover:bg-emerald-100 transition-colors"
                      >
                        {copied === g.inviteCode ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        {g.inviteCode}
                      </button>
                    )}
                    <Button asChild size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs">
                      <Link href={`/groups/${g.id}`}>Open →</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create Group Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create a Group</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="cname">Group Name *</Label>
              <Input id="cname" value={createName} onChange={(e) => setCreateName(e.target.value)} placeholder="e.g. Ramadan Khatm Circle" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="cdesc">Description (optional)</Label>
              <Input id="cdesc" value={createDesc} onChange={(e) => setCreateDesc(e.target.value)} placeholder="Short description..." className="mt-1" />
            </div>
            <div>
              <Label>Visibility</Label>
              <div className="flex gap-3 mt-2">
                {(['PUBLIC', 'PRIVATE'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setCreateVis(v)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${createVis === v ? 'bg-emerald-600 text-white border-emerald-600' : 'border-muted text-muted-foreground hover:border-emerald-400'}`}
                  >
                    {v === 'PUBLIC' ? '🌍 Public' : '🔒 Private'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
              {creating ? 'Creating...' : 'Create Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join Group Dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Join a Group</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label htmlFor="jcode">Invite Code</Label>
            <Input
              id="jcode"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              placeholder="e.g. A3F7C2"
              className="mt-1 font-mono tracking-widest text-center text-lg"
              maxLength={6}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinOpen(false)}>Cancel</Button>
            <Button onClick={handleJoin} disabled={joining} className="bg-emerald-600 hover:bg-emerald-700">
              {joining ? 'Joining...' : 'Join Group'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
