'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  GraduationCap, Users, BookOpen, Plus, ChevronLeft,
  Copy, Check, Loader2, UserPlus, Trash2, School,
  BarChart2, Upload, FileUp, AlertCircle, TrendingUp,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

function dname(u: any) {
  return u?.displayName || u?.username || u?.email?.split('@')[0] || 'User';
}

function roleBadge(role: string) {
  const map: Record<string, string> = {
    PRINCIPAL: 'bg-purple-100 text-purple-800 border-purple-200',
    TEACHER: 'bg-blue-100 text-blue-800 border-blue-200',
    STUDENT: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    PARENT: 'bg-amber-100 text-amber-800 border-amber-200',
  };
  return map[role] || 'bg-gray-100 text-gray-800';
}

export default function MadresahDashboardPage() {
  const params = useParams();
  const madresahId = params?.madresahId as string;
  const router = useRouter();
  const { user } = useAuth();

  const [madresah, setMadresah] = useState<any>(null);
  const [myRole, setMyRole] = useState<string>('');
  const [isAdminOverride, setIsAdminOverride] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  // Analytics state
  const [analytics, setAnalytics] = useState<any>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Bulk import state
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkData, setBulkData] = useState<{ email: string; displayName: string }[]>([]);
  const [bulkRaw, setBulkRaw] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResults, setBulkResults] = useState<any>(null);

  // Create class dialog
  const [classOpen, setClassOpen] = useState(false);
  const [classForm, setClassForm] = useState({ name: '', description: '', subjects: '' });
  const [creatingClass, setCreatingClass] = useState(false);

  const fetchSchool = useCallback(async () => {
    try {
      const res = await fetch(`/api/madresah/${madresahId}`);
      if (!res.ok) { router.push('/madresah'); return; }
      const data = await res.json();
      setMadresah(data.madresah);
      setMyRole(data.myRole);
      setIsAdminOverride(data.isAdminOverride ?? false);
    } catch {
      toast.error('Failed to load school');
    } finally {
      setLoading(false);
    }
  }, [madresahId, router]);

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const res = await fetch(`/api/madresah/${madresahId}/analytics`);
      if (res.ok) setAnalytics(await res.json());
    } catch { /* silent */ } finally {
      setAnalyticsLoading(false);
    }
  }, [madresahId]);

  // Parse CSV/tab-separated text for bulk import
  function parseBulkCsv(raw: string) {
    const lines = raw.trim().split(/\r?\n/).filter(Boolean);
    return lines.map((line) => {
      const parts = line.split(/[,\t]/).map((p) => p.trim().replace(/^"|"$/g, ''));
      return { email: parts[0] || '', displayName: parts[1] || parts[0]?.split('@')[0] || '' };
    }).filter((r) => r.email.includes('@'));
  }

  const handleBulkFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setBulkRaw(text);
      setBulkData(parseBulkCsv(text));
    };
    reader.readAsText(file);
  };

  const handleBulkEnroll = async () => {
    if (bulkData.length === 0) { toast.error('No valid students to import'); return; }
    setBulkLoading(true);
    setBulkResults(null);
    try {
      const res = await fetch(`/api/madresah/${madresahId}/bulk-enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: bulkData }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');
      setBulkResults(data.summary);
      toast.success(`Imported: ${data.summary.created} new, ${data.summary.existing} existing`);
      fetchSchool();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setBulkLoading(false);
    }
  };

  useEffect(() => { fetchSchool(); }, [fetchSchool]);
  useEffect(() => {
    if (madresah) document.title = `${madresah.name} | Deenify`;
  }, [madresah]);
  const copyCode = () => {
    navigator.clipboard.writeText(madresah.inviteCode);
    setCopied(true);
    toast.success('Invite code copied!');
    setTimeout(() => setCopied(false), 2000);
  };
  const copyLink = () => {
    const url = `${window.location.origin}/madresah/join/${madresah.inviteCode}`;
    navigator.clipboard.writeText(url);
    toast.success('Join link copied! Share it with students & parents.');
  };

  const handleCreateClass = async () => {
    if (!classForm.name.trim()) { toast.error('Class name required'); return; }
    setCreatingClass(true);
    try {
      const subjectList = classForm.subjects
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`/api/madresah/${madresahId}/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: classForm.name,
          description: classForm.description,
          subjects: subjectList,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success(`Class "${data.class.name}" created!`);
      setClassOpen(false);
      setClassForm({ name: '', description: '', subjects: '' });
      fetchSchool();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreatingClass(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!madresah) return null;

  const isStaff = ['PRINCIPAL', 'TEACHER'].includes(myRole) || isAdminOverride;
  const isPrincipal = myRole === 'PRINCIPAL' || isAdminOverride;

  const teachers = madresah.members?.filter((m: any) => ['PRINCIPAL', 'TEACHER'].includes(m.role)) ?? [];
  const students = madresah.members?.filter((m: any) => m.role === 'STUDENT') ?? [];
  const parents = madresah.members?.filter((m: any) => m.role === 'PARENT') ?? [];

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Toaster />

      {/* Admin override banner */}
      {isAdminOverride && (
        <div className="mb-4 flex items-center gap-3 p-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-800">
          <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Admin Override Active</span>
            <span className="ml-2">— Viewing this school as a system administrator. All management features are enabled.</span>
          </div>
          <Link href="/admin/madresah" className="text-xs underline text-rose-600 hover:text-rose-800 shrink-0">
            ← Back to Admin Panel
          </Link>
        </div>
      )}

      {/* Back + Header */}
      <div className="mb-6">
        <Link href="/madresah">
          <Button variant="ghost" size="sm" className="mb-3 -ml-2 text-muted-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" /> All Schools
          </Button>
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 rounded-xl">
              <School className="h-8 w-8 text-emerald-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{madresah.name}</h1>
              {madresah.description && (
                <p className="text-muted-foreground text-sm">{madresah.description}</p>
              )}
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className={roleBadge(myRole)}>{myRole}</Badge>
                {madresah.address && (
                  <span className="text-xs text-muted-foreground">📍 {madresah.address}</span>
                )}
              </div>
            </div>
          </div>
          {isStaff && (
            <div className="flex flex-col gap-1.5 items-end">
              <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
                <span className="text-xs text-muted-foreground font-medium">Invite code:</span>
                <code className="text-sm font-mono font-bold tracking-widest">{madresah.inviteCode}</code>
                <button onClick={copyCode} title="Copy code" className="text-muted-foreground hover:text-foreground">
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <button
                onClick={copyLink}
                className="text-xs text-emerald-600 hover:text-emerald-800 underline underline-offset-2 flex items-center gap-1"
              >
                <Copy className="h-3 w-3" /> Copy magic join link
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: 'Classes', value: madresah.classes?.length ?? 0, icon: BookOpen, color: 'text-blue-600' },
          { label: 'Members', value: madresah.members?.length ?? 0, icon: Users, color: 'text-emerald-600' },
          { label: 'Students', value: students.length, icon: GraduationCap, color: 'text-purple-600' },
        ].map((s) => (
          <Card key={s.label} className="text-center p-4">
            <s.icon className={`h-6 w-6 mx-auto mb-1 ${s.color}`} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="classes">
        <TabsList className="mb-4 flex overflow-x-auto scrollbar-hide h-auto py-1 gap-1 flex-nowrap sm:inline-flex">
          <TabsTrigger value="classes" className="shrink-0">Classes</TabsTrigger>
          <TabsTrigger value="members" className="shrink-0">Members</TabsTrigger>
          {isStaff && (
            <TabsTrigger value="analytics" className="shrink-0" onClick={fetchAnalytics}>Analytics</TabsTrigger>
          )}
          {isPrincipal && <TabsTrigger value="settings" className="shrink-0">Settings</TabsTrigger>}
        </TabsList>

        {/* ── Classes Tab ── */}
        <TabsContent value="classes">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Classes ({madresah.classes?.length ?? 0})</h2>
            {isStaff && (
              <Button size="sm" onClick={() => setClassOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" /> New Class
              </Button>
            )}
          </div>

          {madresah.classes?.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">No classes yet.</p>
                {isStaff && (
                  <Button onClick={() => setClassOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" /> Create first class
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {madresah.classes?.map((cls: any) => (
                <Link key={cls.id} href={`/madresah/${madresahId}/class/${cls.id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-emerald-600" />
                        {cls.name}
                      </CardTitle>
                      {cls.description && (
                        <CardDescription className="text-xs">{cls.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>👨‍🏫 {dname(cls.teacher)}</span>
                        <span>👨‍🎓 {cls._count?.students ?? 0} students</span>
                        <span>📝 {cls._count?.homework ?? 0} tasks</span>
                      </div>
                      {cls.subjects?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {cls.subjects.map((s: any) => (
                            <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ── Members Tab ── */}
        <TabsContent value="members">
          {isStaff && (
            <div className="flex justify-end mb-4">
              <Button size="sm" variant="outline" onClick={() => { setBulkResults(null); setBulkRaw(''); setBulkData([]); setBulkOpen(true); }}>
                <Upload className="h-4 w-4 mr-1.5" /> Bulk Import Students
              </Button>
            </div>
          )}
          <div className="space-y-6">
            {[
              { title: '🏫 Staff', list: teachers },
              { title: '🎒 Students', list: students },
              { title: '👪 Parents', list: parents },
            ].map(({ title, list }) => (
              list.length > 0 && (
                <div key={title}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                    {title} ({list.length})
                  </h3>
                  <div className="space-y-1.5">
                    {list.map((m: any) => (
                      <div key={m.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{dname(m.user)}</p>
                          <p className="text-xs text-muted-foreground">{m.user.email}</p>
                        </div>
                        <Badge className={roleBadge(m.role)} variant="outline">{m.role}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        </TabsContent>

        {/* ── Analytics Tab ── */}
        {isStaff && (
          <TabsContent value="analytics">
            {analyticsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
            ) : !analytics ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart2 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>Click the Analytics tab to load data</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Students', value: analytics.totalStudents, icon: '🎒' },
                    { label: 'Total Classes', value: analytics.totalClasses, icon: '🏫' },
                    { label: 'Hifz Entries', value: analytics.hifzSummary?.totalEntries ?? 0, icon: '📖' },
                    { label: 'Pages Memorized', value: analytics.hifzSummary?.totalMemorized ?? 0, icon: '⭐' },
                  ].map(k => (
                    <Card key={k.label} className="text-center p-4">
                      <p className="text-2xl mb-1">{k.icon}</p>
                      <p className="text-xl font-bold">{k.value}</p>
                      <p className="text-xs text-muted-foreground">{k.label}</p>
                    </Card>
                  ))}
                </div>

                {/* Struggle analytics */}
                {analytics.struggleAnalytics?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-amber-500" /> Top Struggle Areas
                      </CardTitle>
                      <CardDescription>Topics where students need the most help</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analytics.struggleAnalytics.slice(0, 10).map((s: any, i: number) => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="w-5 text-xs text-muted-foreground text-right shrink-0">{i + 1}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-0.5">
                                <span className="text-sm font-medium truncate">{s.topic}</span>
                                <span className="text-xs text-muted-foreground shrink-0 ml-2">{s.count} reports</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                                  <div
                                    className="h-full bg-amber-500 rounded-full"
                                    style={{ width: `${Math.min(100, (s.count / analytics.struggleAnalytics[0].count) * 100)}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground w-16 shrink-0">{s.subject}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Attendance per class */}
                {analytics.attendanceByClass?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4 text-emerald-600" /> Attendance by Class
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.attendanceByClass.map((c: any) => (
                          <div key={c.classId}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{c.className}</span>
                              <span className="text-sm font-semibold">
                                {c.attendancePct != null ? `${c.attendancePct}%` : 'No data'}
                              </span>
                            </div>
                            {c.attendancePct != null && (
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className={`h-full rounded-full ${c.attendancePct >= 75 ? 'bg-emerald-500' : c.attendancePct >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                  style={{ width: `${c.attendancePct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Homework completion */}
                {analytics.hwByClass?.length > 0 && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-blue-600" /> Homework Completion
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analytics.hwByClass.map((c: any) => (
                          <div key={c.classId}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium">{c.className}</span>
                              <span className="text-sm font-semibold">
                                {c.completionPct != null ? `${c.completionPct}%` : 'No data'}
                              </span>
                            </div>
                            {c.completionPct != null && (
                              <div className="w-full bg-muted rounded-full h-2">
                                <div
                                  className="h-full rounded-full bg-blue-500"
                                  style={{ width: `${c.completionPct}%` }}
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>
        )}

        {/* ── Settings Tab (Principal only) ── */}
        {isPrincipal && (
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>School Settings</CardTitle>
                <CardDescription>Update your school information</CardDescription>
              </CardHeader>
              <CardContent>
                <SchoolSettingsForm madresah={madresah} madresahId={madresahId} onUpdated={fetchSchool} />
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Bulk Import Dialog */}
      <Dialog open={bulkOpen} onOpenChange={setBulkOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileUp className="h-5 w-5 text-emerald-600" /> Bulk Import Students
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="rounded-xl border-2 border-dashed border-border p-4 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm font-medium mb-1">Upload CSV or Excel file</p>
              <p className="text-xs text-muted-foreground mb-3">Format: email, display name (one per row)</p>
              <input
                type="file"
                accept=".csv,.txt,.xlsx,.xls"
                onChange={handleBulkFile}
                className="block w-full text-sm text-muted-foreground cursor-pointer"
              />
            </div>
            <div className="relative">
              <div className="flex items-center gap-2 mb-1">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or paste data</span>
                <div className="flex-1 h-px bg-border" />
              </div>
              <textarea
                className="w-full rounded-xl border border-border bg-muted/30 p-3 text-sm font-mono h-28 resize-none"
                placeholder={"student@example.com, Ahmed Ali\nstudent2@example.com, Fatima Hassan"}
                value={bulkRaw}
                onChange={(e) => {
                  setBulkRaw(e.target.value);
                  setBulkData(parseBulkCsv(e.target.value));
                }}
              />
            </div>
            {bulkData.length > 0 && (
              <div className="rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-sm text-emerald-800">
                ✓ {bulkData.length} student{bulkData.length !== 1 ? 's' : ''} ready to import
              </div>
            )}
            {bulkResults && (
              <div className="rounded-lg bg-muted px-3 py-2 text-sm space-y-0.5">
                <p>✅ Created: <strong>{bulkResults.created}</strong></p>
                <p>♻️ Already existing: <strong>{bulkResults.existing}</strong></p>
                {bulkResults.errors > 0 && <p>❌ Errors: <strong>{bulkResults.errors}</strong></p>}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBulkOpen(false)}>Close</Button>
            <Button
              onClick={handleBulkEnroll}
              disabled={bulkLoading || bulkData.length === 0}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              {bulkLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload className="h-4 w-4 mr-1.5" />}
              Import {bulkData.length > 0 ? `${bulkData.length} Students` : 'Students'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Class Dialog */}
      <Dialog open={classOpen} onOpenChange={setClassOpen}>        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Class</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Class Name *</Label>
              <Input
                placeholder="e.g. Grade 3, Hifz Class, Adult Beginners"
                value={classForm.name}
                onChange={(e) => setClassForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea
                placeholder="Optional description..."
                rows={2}
                value={classForm.description}
                onChange={(e) => setClassForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div>
              <Label>Subjects (comma-separated)</Label>
              <Input
                placeholder="e.g. Quran, Arabic, Islamic Studies, Seerah"
                value={classForm.subjects}
                onChange={(e) => setClassForm((f) => ({ ...f, subjects: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground mt-1">Separate subjects with commas</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClassOpen(false)}>Cancel</Button>
            <Button onClick={handleCreateClass} disabled={creatingClass} className="bg-emerald-600 hover:bg-emerald-700">
              {creatingClass ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Create Class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SchoolSettingsForm({
  madresah, madresahId, onUpdated,
}: { madresah: any; madresahId: string; onUpdated: () => void }) {
  const [form, setForm] = useState({
    name: madresah.name || '',
    description: madresah.description || '',
    address: madresah.address || '',
    phone: madresah.phone || '',
    email: madresah.email || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/madresah/${madresahId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Failed to update');
      toast.success('School details updated!');
      onUpdated();
    } catch {
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div><Label>School Name</Label>
        <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      </div>
      <div><Label>Description</Label>
        <Textarea rows={2} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><Label>Address</Label>
          <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </div>
        <div><Label>Phone</Label>
          <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        </div>
      </div>
      <div><Label>School Email</Label>
        <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
      </div>
      <Button onClick={handleSave} disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
        {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Save Changes
      </Button>
    </div>
  );
}
