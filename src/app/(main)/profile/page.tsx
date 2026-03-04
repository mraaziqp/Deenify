"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { CircleUser, Target, Award, BookOpen, Heart, Edit2, Check, X, Users } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editDisplayName, setEditDisplayName] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (!res.ok) return;
      const data = await res.json();
      setProfile(data);
      setEditUsername(data.username || '');
      setEditDisplayName(data.displayName || '');
    } catch { /* ignore */ } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: editUsername || null, displayName: editDisplayName || null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setProfile((prev: any) => ({ ...prev, username: data.username, displayName: data.displayName }));
      setIsEditing(false);
      toast.success('Profile updated!');
    } catch (e: any) { toast.error(e.message); } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="space-y-4">{[1, 2, 3].map((i) => <div key={i} className="h-32 bg-muted rounded-xl animate-pulse" />)}</div>
    </div>
  );

  const displayNameVal = profile?.displayName || profile?.username || profile?.email?.split('@')[0] || 'User';

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Toaster />
      <div className="flex items-center gap-3 mb-6">
        <CircleUser className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">Manage your identity and track your journey</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Identity card */}
        <div className="lg:col-span-1 space-y-4">
          <Card className="shadow-md">
            <CardContent className="pt-6 pb-5">
              <div className="flex flex-col items-center mb-5">
                <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-3xl mb-3">
                  {displayNameVal[0].toUpperCase()}
                </div>
                <p className="font-bold text-lg text-center">{displayNameVal}</p>
                {profile?.username && <p className="text-sm text-muted-foreground">@{profile.username}</p>}
                <p className="text-xs text-muted-foreground mt-0.5">{profile?.email}</p>
                <Badge variant="secondary" className="mt-2 capitalize">{(profile?.role || 'user').toLowerCase()}</Badge>
              </div>
              {isEditing ? (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="displayName" className="text-xs text-muted-foreground">Display Name</Label>
                    <Input id="displayName" value={editDisplayName} onChange={(e) => setEditDisplayName(e.target.value)} placeholder="Your visible name" className="mt-1" />
                  </div>
                  <div>
                    <Label htmlFor="username" className="text-xs text-muted-foreground">Username</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                      <Input id="username" value={editUsername} onChange={(e) => setEditUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))} placeholder="username" className="pl-7" maxLength={30} />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">3-30 chars. Used for group invites.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={saving} size="sm" className="flex-1 bg-emerald-600 hover:bg-emerald-700 gap-1">
                      <Check className="h-3.5 w-3.5" /> {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button onClick={() => { setEditUsername(profile?.username || ''); setEditDisplayName(profile?.displayName || ''); setIsEditing(false); }} size="sm" variant="outline" className="gap-1">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="w-full gap-2">
                  <Edit2 className="h-4 w-4" /> Edit Profile
                </Button>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4 pb-4">
              <Button asChild variant="outline" className="w-full gap-2">
                <Link href="/groups"><Users className="h-4 w-4" /> My Groups</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="lg:col-span-2 space-y-5">
          <Card className="shadow-md border-l-4 border-l-primary">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><Target className="h-5 w-5 text-primary" /> Streak & Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-primary/10 rounded-xl">
                  <p className="text-3xl font-bold text-primary">{profile?.currentStreak ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">🔥 Current Streak</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-xl">
                  <p className="text-3xl font-bold">{profile?.totalDaysActive ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Days Active</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-xl">
                  <p className="text-3xl font-bold">{profile?.dhikrCount ?? 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Total Dhikr</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl"><BookOpen className="h-5 w-5 text-primary" /></div>
                  <div><p className="text-2xl font-bold">{profile?.coursesCompleted ?? 0}</p><p className="text-sm text-muted-foreground">Courses Completed</p></div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-5">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-100 rounded-xl"><Heart className="h-5 w-5 text-rose-500" /></div>
                  <div><p className="text-2xl font-bold">{(profile?.dhikrCount ?? 0).toLocaleString()}</p><p className="text-sm text-muted-foreground">Total Dhikr</p></div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base"><Award className="h-5 w-5 text-primary" /> Achievements</CardTitle>
              <CardDescription>Unlock badges as you reach milestones</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { icon: '🏆', title: 'Starter', desc: 'Joined Deenify', unlocked: true },
                  { icon: '🔥', title: 'Consistent', desc: '7-day streak', unlocked: (profile?.currentStreak ?? 0) >= 7 },
                  { icon: '📿', title: 'Dhikr Master', desc: '1000 dhikr', unlocked: (profile?.dhikrCount ?? 0) >= 1000 },
                  { icon: '📚', title: 'Scholar Seeker', desc: 'Completed a course', unlocked: (profile?.coursesCompleted ?? 0) > 0 },
                  { icon: '🕌', title: 'Community', desc: 'Joined a group', unlocked: false },
                  { icon: '📖', title: 'Khatm', desc: 'Completed a Khatm', unlocked: false },
                ].map((a) => (
                  <div key={a.title} className={`p-3 rounded-xl border-2 text-center transition-all ${a.unlocked ? 'border-primary bg-primary/5' : 'border-muted bg-muted/30 opacity-50'}`}>
                    <div className="text-3xl mb-1">{a.icon}</div>
                    <p className="font-semibold text-sm">{a.title}</p>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                    {a.unlocked && <Badge variant="default" className="mt-1.5 text-xs">Unlocked ✓</Badge>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
