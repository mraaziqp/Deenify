'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import {
  GraduationCap, Plus, LogIn, Copy, Check, Users,
  BookOpen, School, ChevronRight, Loader2, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

interface Madresah {
  id: string;
  name: string;
  description?: string;
  address?: string;
  inviteCode: string;
  myRole: string;
  admin: { id: string; email: string; displayName?: string; username?: string };
  _count: { members: number; classes: number };
}

function dname(u: any) {
  return u?.displayName || u?.username || u?.email?.split('@')[0] || 'User';
}

function roleBadge(role: string) {
  const map: Record<string, string> = {
    PRINCIPAL: 'bg-purple-100 text-purple-800',
    TEACHER: 'bg-blue-100 text-blue-800',
    STUDENT: 'bg-emerald-100 text-emerald-800',
    PARENT: 'bg-amber-100 text-amber-800',
  };
  return map[role] || 'bg-gray-100 text-gray-800';
}

export default function MadresahPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [madresahs, setMadresahs] = useState<Madresah[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({ name: '', description: '', address: '', phone: '', email: '' });
  const [creating, setCreating] = useState(false);

  // Join dialog
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinRole, setJoinRole] = useState<'STUDENT' | 'TEACHER' | 'PARENT'>('STUDENT');
  const [joining, setJoining] = useState(false);

  useEffect(() => { document.title = 'Madresah | Deenify'; }, []);

  const fetchMadresahs = useCallback(async () => {
    try {
      const res = await fetch('/api/madresah');
      const data = await res.json();
      setMadresahs(data.madresahs || []);
    } catch {
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (!authLoading) fetchMadresahs(); }, [fetchMadresahs, authLoading]);

  const handleCreate = async () => {
    if (!createForm.name.trim()) { toast.error('School name is required'); return; }
    setCreating(true);
    try {
      const res = await fetch('/api/madresah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create');
      setMadresahs((prev) => [{ ...data.madresah, myRole: 'PRINCIPAL' }, ...prev]);
      setCreateOpen(false);
      setCreateForm({ name: '', description: '', address: '', phone: '', email: '' });
      toast.success(`🎓 "${data.madresah.name}" registered!`);
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
      const res = await fetch('/api/madresah/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inviteCode: joinCode, role: joinRole }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join');
      toast.success(`Joined "${data.madresah.name}" as ${joinRole.toLowerCase()}!`);
      setJoinOpen(false);
      setJoinCode('');
      fetchMadresahs();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setJoining(false);
    }
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(code);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(null), 2000);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <GraduationCap className="h-12 w-12 text-emerald-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Madresah Portal</h2>
        <p className="text-muted-foreground mb-6">Please sign in to access your schools.</p>
        <Link href="/auth/sign-in"><Button>Sign In</Button></Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Toaster />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-100 rounded-lg">
            <GraduationCap className="h-8 w-8 text-emerald-700" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Madresah Portal</h1>
            <p className="text-muted-foreground text-sm">Muslim schools — register, learn, and grow</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setJoinOpen(true)}>
            <LogIn className="h-4 w-4 mr-2" /> Join School
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" /> Register School
          </Button>
        </div>
      </div>

      {/* Feature highlights + demo showcase when no schools */}
      {madresahs.length === 0 && (
        <div className="space-y-10 mb-8">
          {/* Hero showcase */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-medium">
              ✨ 100% Free · No school registered yet
            </div>
            <h2 className="text-2xl font-bold">Your complete Islamic school management platform</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built for principals, teachers, students, and parents. Everything you need to run your madresah — 
              from homework to Hifz tracking — in one place.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <Button onClick={() => setCreateOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <GraduationCap className="h-4 w-4 mr-2" /> Register Your School
              </Button>
              <Button variant="outline" onClick={() => setJoinOpen(true)}>
                <LogIn className="h-4 w-4 mr-2" /> Join with Invite Code
              </Button>
            </div>
          </div>

          {/* How it works steps */}
          <div>
            <h3 className="text-center text-lg font-semibold mb-4 text-muted-foreground">How it works</h3>
            <div className="grid gap-3 sm:grid-cols-4">
              {[
                { step: '1', icon: '🏫', title: 'Principal registers', desc: 'Create your school and get a unique invite code to share' },
                { step: '2', icon: '👨‍🏫', title: 'Teachers join', desc: 'Teachers enter the code to join and are assigned their classes' },
                { step: '3', icon: '🎒', title: 'Students enroll', desc: 'Students join with the code and are added to their classes' },
                { step: '4', icon: '📊', title: 'Track & grow', desc: 'Assign homework, track Hifz, monitor attendance and progress' },
              ].map((f) => (
                <div key={f.step} className="flex flex-col items-center text-center p-4 bg-muted/30 rounded-xl border">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white text-sm font-bold flex items-center justify-center mb-2">
                    {f.step}
                  </div>
                  <div className="text-2xl mb-1">{f.icon}</div>
                  <p className="font-semibold text-sm">{f.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Feature showcase by role */}
          <div>
            <h3 className="text-center text-lg font-semibold mb-4 text-muted-foreground">What each role gets</h3>
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Principal */}
              <Card className="border-purple-200 bg-purple-50/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎓</span>
                    <div>
                      <CardTitle className="text-base text-purple-800">Principal</CardTitle>
                      <p className="text-xs text-purple-600">School administrator</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {['📋 School analytics dashboard', '📈 Attendance & homework insights', '👥 Bulk student import (CSV)', '🏅 Award student badges', '📢 Post announcements', '🔧 Manage all classes & teachers'].map((f) => (
                    <p key={f} className="text-xs text-purple-900 flex items-start gap-1.5">
                      <span className="text-purple-500 mt-0.5">✓</span> {f.slice(2)}
                    </p>
                  ))}
                </CardContent>
              </Card>

              {/* Teacher */}
              <Card className="border-blue-200 bg-blue-50/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">👨‍🏫</span>
                    <div>
                      <CardTitle className="text-base text-blue-800">Teacher</CardTitle>
                      <p className="text-xs text-blue-600">Class leader</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {['📝 Assign homework with attachments', '📬 View & grade all submissions', '🤲 Record Hifz progress per surah', '📅 Mark daily attendance', '💬 Leave notes on struggle reports', '📎 Share resources & study materials'].map((f) => (
                    <p key={f} className="text-xs text-blue-900 flex items-start gap-1.5">
                      <span className="text-blue-500 mt-0.5">✓</span> {f.slice(2)}
                    </p>
                  ))}
                </CardContent>
              </Card>

              {/* Student */}
              <Card className="border-emerald-200 bg-emerald-50/40">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🎒</span>
                    <div>
                      <CardTitle className="text-base text-emerald-800">Student</CardTitle>
                      <p className="text-xs text-emerald-600">Even from home</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1.5">
                  {['📚 View homework & download attachments', '✏️ Submit work from home', '💬 Comment and ask questions', '✅ See grades and teacher feedback', '🆘 Flag topics they struggle with', '🏅 Earn achievement badges'].map((f) => (
                    <p key={f} className="text-xs text-emerald-900 flex items-start gap-1.5">
                      <span className="text-emerald-500 mt-0.5">✓</span> {f.slice(2)}
                    </p>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Mock preview cards */}
          <div>
            <h3 className="text-center text-lg font-semibold mb-4 text-muted-foreground">Sample features — live preview</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {/* Mock homework card */}
              <div className="border rounded-xl p-4 bg-white space-y-2">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm">📝 Homework Feed</p>
                  <Badge className="bg-red-100 text-red-700 text-xs">2 pending</Badge>
                </div>
                <div className="space-y-2">
                  {[
                    { title: 'Memorise Surah Al-Falaq', subject: 'Hifz', status: 'pending', due: 'Tomorrow' },
                    { title: 'Arabic alphabet worksheet', subject: 'Arabic', status: 'submitted', due: 'Fri' },
                    { title: 'Seerah essay — Chapter 3', subject: 'Islamic Studies', status: 'graded', grade: 87 },
                  ].map((hw) => (
                    <div key={hw.title} className={`p-2.5 rounded-lg border text-xs flex items-center justify-between ${
                      hw.status === 'graded' ? 'bg-emerald-50 border-emerald-200'
                      : hw.status === 'submitted' ? 'bg-blue-50 border-blue-200'
                      : 'bg-red-50 border-red-200'
                    }`}>
                      <div>
                        <p className="font-medium">{hw.title}</p>
                        <p className="text-muted-foreground">{hw.subject} · Due {hw.due}</p>
                      </div>
                      {hw.status === 'graded'
                        ? <Badge className="bg-emerald-100 text-emerald-800 text-[10px]">✅ {hw.grade}/100</Badge>
                        : hw.status === 'submitted'
                        ? <Badge className="bg-blue-100 text-blue-800 text-[10px]">📬 Sent</Badge>
                        : <Badge className="bg-red-100 text-red-800 text-[10px]">📋 Due</Badge>
                      }
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock Hifz tracker */}
              <div className="border rounded-xl p-4 bg-white space-y-2">
                <p className="font-semibold text-sm">🤲 Hifz Progress — Ahmad</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { name: 'Al-Fatihah', ok: true, q: 5 },
                    { name: 'Al-Ikhlas', ok: true, q: 4 },
                    { name: 'Al-Nas', ok: true, q: 5 },
                    { name: 'Al-Falaq', ok: true, q: 3 },
                    { name: 'An-Nasr', ok: false, q: 0 },
                    { name: 'Al-Kawthar', ok: false, q: 0 },
                  ].map((s) => (
                    <div key={s.name} className={`p-2 rounded-lg border text-xs text-center ${s.ok ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/50 border-muted'}`}>
                      <p className="font-medium truncate">{s.name}</p>
                      {s.ok && (
                        <div className="flex justify-center gap-0.5 mt-1">
                          {[1,2,3,4,5].map((i) => (
                            <span key={i} className={`text-[8px] ${i <= s.q ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
                          ))}
                        </div>
                      )}
                      {!s.ok && <p className="text-muted-foreground text-[10px] mt-0.5">Pending</p>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock analytics preview */}
              <div className="border rounded-xl p-4 bg-white space-y-2">
                <p className="font-semibold text-sm">📊 Class Analytics</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Avg Attendance', value: '92%', color: 'text-emerald-700' },
                    { label: 'HW Completion', value: '78%', color: 'text-blue-700' },
                    { label: 'Students', value: '24', color: 'text-purple-700' },
                    { label: 'Surahs Memorised', value: '156', color: 'text-amber-700' },
                  ].map((s) => (
                    <div key={s.label} className="text-center bg-muted/30 rounded-lg p-2">
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-muted-foreground">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock comments/interaction */}
              <div className="border rounded-xl p-4 bg-white space-y-2">
                <p className="font-semibold text-sm">💬 Homework Discussion</p>
                <div className="space-y-2">
                  {[
                    { name: 'Umar', isTeacher: false, msg: 'What page is the worksheet on?', time: '9:14 AM' },
                    { name: 'Teacher', isTeacher: true, msg: 'Page 12, section B — see the attachment link', time: '9:22 AM' },
                    { name: 'Fatima', isTeacher: false, msg: 'JazakAllah khair, found it!', time: '9:25 AM' },
                  ].map((c) => (
                    <div key={c.time} className={`flex gap-2 ${c.isTeacher ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${c.isTeacher ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                        {c.name[0]}
                      </div>
                      <div className={`flex-1 ${c.isTeacher ? 'text-right' : ''}`}>
                        <p className="text-[10px] text-muted-foreground mb-0.5">{c.name} · {c.time}</p>
                        <div className={`inline-block px-2.5 py-1.5 rounded-xl text-xs ${c.isTeacher ? 'bg-blue-600 text-white' : 'bg-muted text-gray-700'}`}>
                          {c.msg}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <Card className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <h3 className="text-xl font-bold mb-2">Ready to get started?</h3>
              <p className="text-emerald-100 text-sm mb-4">
                Register your school in 30 seconds. Free forever.
              </p>
              <div className="flex justify-center gap-3 flex-wrap">
                <Button
                  className="bg-white text-emerald-700 hover:bg-emerald-50"
                  onClick={() => setCreateOpen(true)}
                >
                  <GraduationCap className="h-4 w-4 mr-2" /> Register My School
                </Button>
                <Button
                  variant="outline"
                  className="border-white/50 text-white hover:bg-white/10"
                  onClick={() => setJoinOpen(true)}
                >
                  <LogIn className="h-4 w-4 mr-2" /> Join with Code
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Schools list */}
      {madresahs.length > 0 && (
        <div className="space-y-4">
          {madresahs.map((m) => (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-lg font-bold">{m.name}</h3>
                      <Badge className={roleBadge(m.myRole)}>{m.myRole}</Badge>
                    </div>
                    {m.description && <p className="text-muted-foreground text-sm mb-2">{m.description}</p>}
                    {m.address && <p className="text-xs text-muted-foreground mb-2">📍 {m.address}</p>}
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" /> {m._count.members} members
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" /> {m._count.classes} classes
                      </span>
                    </div>
                    {['PRINCIPAL', 'TEACHER'].includes(m.myRole) && m.inviteCode && (
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">Invite code:</span>
                          <code className="text-xs font-mono bg-muted px-2 py-0.5 rounded">{m.inviteCode}</code>
                          <button
                            onClick={() => copyCode(m.inviteCode)}
                            className="text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {copied === m.inviteCode ? (
                              <Check className="h-3.5 w-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/madresah/join/${m.inviteCode}`);
                            toast.success('Join link copied!');
                          }}
                          className="text-xs text-emerald-600 hover:text-emerald-800 underline underline-offset-2 flex items-center gap-1"
                        >
                          <Copy className="h-3 w-3" /> Copy join link
                        </button>
                      </div>
                    )}
                  </div>
                  <Link href={`/madresah/${m.id}`}>
                    <Button variant="outline" size="sm" className="shrink-0">
                      Open <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Admin quick link */}
      {user?.role === 'ADMIN' && (
        <div className="mt-6 flex justify-center">
          <Link href="/admin/madresah">
            <Button variant="outline" size="sm" className="text-rose-700 border-rose-200 hover:bg-rose-50">
              🛡️ Admin: Manage All Schools
            </Button>
          </Link>
        </div>
      )}

      {/* Register School Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-emerald-600" />
              Register a School
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>School Name *</Label>
              <Input
                placeholder="e.g. Al-Noor Madresah"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Brief description of your school..."
                rows={2}
                value={createForm.description}
                onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Address</Label>
                <Input
                  placeholder="School address"
                  value={createForm.address}
                  onChange={(e) => setCreateForm((f) => ({ ...f, address: e.target.value }))}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="Contact number"
                  value={createForm.phone}
                  onChange={(e) => setCreateForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label>School Email</Label>
              <Input
                type="email"
                placeholder="school@example.com"
                value={createForm.email}
                onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={creating} className="bg-emerald-600 hover:bg-emerald-700">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Register School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Join School Dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogIn className="h-5 w-5 text-emerald-600" />
              Join a School
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Invite Code *</Label>
              <Input
                placeholder="e.g. A1B2C3D4"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                className="font-mono tracking-widest"
              />
            </div>
            <div>
              <Label>I am joining as</Label>
              <div className="flex gap-2 mt-1.5">
                {(['STUDENT', 'TEACHER', 'PARENT'] as const).map((r) => (
                  <button
                    key={r}
                    onClick={() => setJoinRole(r)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      joinRole === r
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'border-muted-foreground/30 hover:bg-muted'
                    }`}
                  >
                    {r === 'STUDENT' ? '🎒' : r === 'TEACHER' ? '👨‍🏫' : '👪'} {r[0] + r.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJoinOpen(false)}>Cancel</Button>
            <Button onClick={handleJoin} disabled={joining} className="bg-emerald-600 hover:bg-emerald-700">
              {joining ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Join School
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
