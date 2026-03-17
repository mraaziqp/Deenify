'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  BookOpen, ChevronLeft, Loader2, Plus, Users, Check, X,
  AlertTriangle, Star, Calendar, ClipboardList, CheckSquare,
  UserPlus, BookMarked, Send, BarChart3, Megaphone, Link2,
  Award, FileText, Pin, Trash2, MessageSquare, Eye, Paperclip,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

function dname(u: any) {
  return u?.displayName || u?.username || u?.email?.split('@')[0] || 'User';
}

const SURAH_NAMES: Record<number, string> = {
  1: 'Al-Fatihah', 2: 'Al-Baqarah', 3: 'Al-Imran', 4: 'An-Nisa', 5: 'Al-Maidah',
  6: 'Al-Anam', 7: 'Al-Araf', 8: 'Al-Anfal', 9: 'At-Tawbah', 10: 'Yunus',
  36: 'Ya-Sin', 67: 'Al-Mulk', 78: 'An-Naba', 87: 'Al-Ala', 93: 'Ad-Duha',
  94: 'Ash-Sharh', 99: 'Az-Zalzalah', 100: 'Al-Adiyat', 108: 'Al-Kawthar',
  110: 'An-Nasr', 112: 'Al-Ikhlas', 113: 'Al-Falaq', 114: 'An-Nas',
};

export default function ClassDetailPage() {
  const params = useParams();
  const madresahId = params?.madresahId as string;
  const classId = params?.classId as string;
  const router = useRouter();
  const { user } = useAuth();

  const [cls, setCls] = useState<any>(null);
  const [myRole, setMyRole] = useState('');
  const [loading, setLoading] = useState(true);
  const [homework, setHomework] = useState<any[]>([]);
  const [hifz, setHifz] = useState<any[]>([]);
  const [struggles, setStruggles] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [resources, setResources] = useState<any[]>([]);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [badges, setBadges] = useState<any[]>([]);

  // Homework dialog
  const [hwOpen, setHwOpen] = useState(false);
  const [hwForm, setHwForm] = useState({ title: '', description: '', dueDate: '', subjectId: '', attachmentUrl: '', attachmentName: '' });
  const [creatingHw, setCreatingHw] = useState(false);

  // Submit homework dialog
  const [submitOpen, setSubmitOpen] = useState(false);
  const [submitHw, setSubmitHw] = useState<any>(null);
  const [submitContent, setSubmitContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Teacher: View submissions for a homework
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  const [submissionsHw, setSubmissionsHw] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingMap, setGradingMap] = useState<Record<string, { grade: string; feedback: string }>>({});
  const [gradingId, setGradingId] = useState<string | null>(null);

  // Comments dialog
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [commentsHw, setCommentsHw] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [postingComment, setPostingComment] = useState(false);

  // Enroll student dialog
  const [enrollOpen, setEnrollOpen] = useState(false);
  const [enrollEmail, setEnrollEmail] = useState('');
  const [enrolling, setEnrolling] = useState(false);

  // Hifz dialog
  const [hifzOpen, setHifzOpen] = useState(false);
  const [hifzForm, setHifzForm] = useState({
    studentId: '', surahNumber: '1', ayahFrom: '1', ayahTo: '7',
    memorized: true, quality: '4', notes: '',
  });
  const [savingHifz, setSavingHifz] = useState(false);

  // Struggle dialog
  const [struggleOpen, setStruggleOpen] = useState(false);
  const [struggleForm, setStruggleForm] = useState({ subjectName: '', topic: '', description: '' });
  const [savingStruggle, setSavingStruggle] = useState(false);

  // Attendance dialog
  const [attendanceOpen, setAttendanceOpen] = useState(false);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, boolean>>({});
  const [savingAttendance, setSavingAttendance] = useState(false);

  // Announcement dialog
  const [announcementOpen, setAnnouncementOpen] = useState(false);
  const [announcementForm, setAnnouncementForm] = useState({ title: '', content: '', isPinned: false });
  const [savingAnnouncement, setSavingAnnouncement] = useState(false);

  // Resource dialog
  const [resourceOpen, setResourceOpen] = useState(false);
  const [resourceForm, setResourceForm] = useState({ title: '', description: '', fileUrl: '', subjectName: '' });
  const [savingResource, setSavingResource] = useState(false);

  // Badge dialog
  const [badgeOpen, setBadgeOpen] = useState(false);
  const [badgeForm, setBadgeForm] = useState({ studentId: '', type: 'ACHIEVEMENT', label: '', description: '' });
  const [savingBadge, setSavingBadge] = useState(false);

  const fetchClass = useCallback(async () => {
    try {
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}`);
      if (!res.ok) { router.push(`/madresah/${madresahId}`); return; }
      const data = await res.json();
      setCls(data.class);
      setMyRole(data.myRole);
    } catch {
      toast.error('Failed to load class');
    } finally {
      setLoading(false);
    }
  }, [madresahId, classId, router]);

  const fetchHomework = useCallback(async () => {
    const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/homework`);
    const data = await res.json();
    setHomework(data.homework || []);
  }, [madresahId, classId]);

  const fetchHifz = useCallback(async () => {
    const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/hifz`);
    const data = await res.json();
    setHifz(data.hifz || []);
  }, [madresahId, classId]);

  const fetchStruggles = useCallback(async () => {
    const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/struggles`);
    const data = await res.json();
    setStruggles(data.struggles || []);
  }, [madresahId, classId]);

  const fetchAttendance = useCallback(async () => {
    const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/attendance`);
    const data = await res.json();
    setAttendance(data.attendance || []);
  }, [madresahId, classId]);

  const fetchAnnouncements = useCallback(async () => {
    const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/announcements`);
    if (res.ok) setAnnouncements(await res.json());
  }, [madresahId, classId]);

  const fetchResources = useCallback(async () => {
    const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/resources`);
    if (res.ok) setResources(await res.json());
  }, [madresahId, classId]);

  const fetchReport = useCallback(async () => {
    setReportLoading(true);
    const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/report`);
    if (res.ok) setReportData(await res.json());
    setReportLoading(false);
  }, [madresahId, classId]);

  const fetchBadges = useCallback(async () => {
    const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/badges`);
    if (res.ok) setBadges(await res.json());
  }, [madresahId, classId]);

  useEffect(() => {
    fetchClass();
    fetchHomework();
    fetchHifz();
    fetchStruggles();
    fetchAttendance();
    fetchAnnouncements();
    fetchResources();
    fetchBadges();
  }, [fetchClass, fetchHomework, fetchHifz, fetchStruggles, fetchAttendance, fetchAnnouncements, fetchResources, fetchBadges]);

  useEffect(() => {
    if (cls) document.title = `${cls.name} | Deenify`;
  }, [cls]);

  const isStaff = ['PRINCIPAL', 'TEACHER'].includes(myRole);

  // ── Actions ────────────────────────────────────────────────────────────────

  const handleAssignHw = async () => {
    if (!hwForm.title || !hwForm.description || !hwForm.dueDate) {
      toast.error('Title, description and due date are required');
      return;
    }
    setCreatingHw(true);
    try {
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/homework`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...hwForm,
          subjectId: hwForm.subjectId || null,
          attachmentUrl: hwForm.attachmentUrl || null,
          attachmentName: hwForm.attachmentName || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Homework assigned!');
      setHwOpen(false);
      setHwForm({ title: '', description: '', dueDate: '', subjectId: '', attachmentUrl: '', attachmentName: '' });
      fetchHomework();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setCreatingHw(false);
    }
  };

  const openSubmissions = async (hw: any) => {
    setSubmissionsHw(hw);
    setSubmissionsOpen(true);
    setLoadingSubmissions(true);
    try {
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/homework/${hw.id}/submissions`);
      const data = await res.json();
      const subs = data.submissions || [];
      setSubmissions(subs);
      const map: Record<string, { grade: string; feedback: string }> = {};
      subs.forEach((s: any) => {
        map[s.id] = { grade: s.grade != null ? String(s.grade) : '', feedback: s.feedback || '' };
      });
      setGradingMap(map);
    } catch {
      toast.error('Failed to load submissions');
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGradeSubmission = async (submissionId: string) => {
    const g = gradingMap[submissionId];
    if (!g) return;
    setGradingId(submissionId);
    try {
      const res = await fetch(
        `/api/madresah/${madresahId}/classes/${classId}/homework/${submissionsHw?.id}/submissions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ submissionId, grade: g.grade ? parseInt(g.grade) : null, feedback: g.feedback }),
        }
      );
      if (!res.ok) throw new Error('Failed to grade');
      toast.success('Graded!');
      const updated = await res.json();
      setSubmissions((prev) =>
        prev.map((s) => (s.id === submissionId ? { ...s, ...updated.submission } : s))
      );
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setGradingId(null);
    }
  };

  const openComments = async (hw: any) => {
    setCommentsHw(hw);
    setCommentsOpen(true);
    setLoadingComments(true);
    try {
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/homework/${hw.id}/comments`);
      const data = await res.json();
      setComments(data.comments || []);
    } catch {
      toast.error('Failed to load comments');
    } finally {
      setLoadingComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!newComment.trim() || !commentsHw) return;
    setPostingComment(true);
    try {
      const res = await fetch(
        `/api/madresah/${madresahId}/classes/${classId}/homework/${commentsHw.id}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: newComment }),
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setComments((prev) => [...prev, data.comment]);
      setNewComment('');
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setPostingComment(false);
    }
  };

  const handleSubmitHw = async () => {
    if (!submitContent.trim()) { toast.error('Please write your answer'); return; }
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/madresah/${madresahId}/classes/${classId}/homework/${submitHw.id}/submit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ content: submitContent }),
        }
      );
      if (!res.ok) throw new Error('Failed to submit');
      toast.success('Homework submitted! Alhamdulillah 📚');
      setSubmitOpen(false);
      setSubmitContent('');
      fetchHomework();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnroll = async () => {
    if (!enrollEmail.trim()) { toast.error('Enter email or username'); return; }
    setEnrolling(true);
    try {
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername: enrollEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      toast.success('Student enrolled!');
      setEnrollOpen(false);
      setEnrollEmail('');
      fetchClass();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setEnrolling(false);
    }
  };

  const handleRecordHifz = async () => {
    if (!hifzForm.studentId) { toast.error('Select a student'); return; }
    setSavingHifz(true);
    try {
      const surahNum = parseInt(hifzForm.surahNumber);
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/hifz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: hifzForm.studentId,
          surahNumber: surahNum,
          surahName: SURAH_NAMES[surahNum] || `Surah ${surahNum}`,
          ayahFrom: parseInt(hifzForm.ayahFrom),
          ayahTo: parseInt(hifzForm.ayahTo),
          memorized: hifzForm.memorized,
          quality: parseInt(hifzForm.quality),
          notes: hifzForm.notes,
        }),
      });
      if (!res.ok) throw new Error('Failed to record');
      toast.success('Hifz progress recorded!');
      setHifzOpen(false);
      fetchHifz();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingHifz(false);
    }
  };

  const handleStruggle = async () => {
    if (!struggleForm.topic.trim()) { toast.error('Please describe the topic'); return; }
    setSavingStruggle(true);
    try {
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/struggles`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(struggleForm),
      });
      if (!res.ok) throw new Error('Failed to submit');
      toast.success('Report submitted! Your teacher will see this 📬');
      setStruggleOpen(false);
      setStruggleForm({ subjectName: '', topic: '', description: '' });
      fetchStruggles();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingStruggle(false);
    }
  };

  const handleResolveStruggle = async (reportId: string, isResolved: boolean, teacherNote: string) => {
    try {
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/struggles`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, isResolved, teacherNote }),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(isResolved ? 'Marked as resolved!' : 'Note saved');
      fetchStruggles();
    } catch {
      toast.error('Failed to update');
    }
  };

  const initAttendance = () => {
    const map: Record<string, boolean> = {};
    cls?.students?.forEach((e: any) => { map[e.userId] = true; });
    setAttendanceMap(map);
    setAttendanceOpen(true);
  };

  const handleSaveAttendance = async () => {
    setSavingAttendance(true);
    try {
      const records = Object.entries(attendanceMap).map(([studentId, present]) => ({ studentId, present }));
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(records),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Attendance saved for ${records.length} students`);
      setAttendanceOpen(false);
      fetchAttendance();
    } catch {
      toast.error('Failed to save attendance');
    } finally {
      setSavingAttendance(false);
    }
  };

  const handleAddAnnouncement = async () => {
    if (!announcementForm.title.trim() || !announcementForm.content.trim()) {
      toast.error('Title and content required');
      return;
    }
    setSavingAnnouncement(true);
    try {
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/announcements`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(announcementForm),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Announcement posted!');
      setAnnouncementOpen(false);
      setAnnouncementForm({ title: '', content: '', isPinned: false });
      fetchAnnouncements();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingAnnouncement(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    try {
      await fetch(`/api/madresah/${madresahId}/classes/${classId}/announcements`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, delete: true }),
      });
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch {
      toast.error('Failed to delete');
    }
  };

  const handleAddResource = async () => {
    if (!resourceForm.title.trim()) { toast.error('Title required'); return; }
    setSavingResource(true);
    try {
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resourceForm),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success('Resource added!');
      setResourceOpen(false);
      setResourceForm({ title: '', description: '', fileUrl: '', subjectName: '' });
      fetchResources();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingResource(false);
    }
  };

  const handleDeleteResource = async (id: string) => {
    try {
      await fetch(`/api/madresah/${madresahId}/classes/${classId}/resources`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      toast.success('Resource removed');
      fetchResources();
    } catch {
      toast.error('Failed to remove');
    }
  };

  const handleAwardBadge = async () => {
    if (!badgeForm.studentId || !badgeForm.label.trim()) {
      toast.error('Select student and enter badge label');
      return;
    }
    setSavingBadge(true);
    try {
      const res = await fetch(`/api/madresah/${madresahId}/classes/${classId}/badges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(badgeForm),
      });
      if (!res.ok) throw new Error('Failed');
      toast.success(`Badge awarded! 🏅`);
      setBadgeOpen(false);
      setBadgeForm({ studentId: '', type: 'ACHIEVEMENT', label: '', description: '' });
      fetchBadges();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSavingBadge(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }
  if (!cls) return null;

  const pendingStruggles = struggles.filter((s) => !s.isResolved).length;

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Toaster />

      {/* Back + Header */}
      <div className="mb-6">
        <Link href={`/madresah/${madresahId}`}>
          <Button variant="ghost" size="sm" className="mb-3 -ml-2 text-muted-foreground">
            <ChevronLeft className="h-4 w-4 mr-1" /> Back to School
          </Button>
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <BookOpen className="h-7 w-7 text-blue-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{cls.name}</h1>
              {cls.description && <p className="text-muted-foreground text-sm">{cls.description}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">
                Teacher: {dname(cls.teacher)} • {cls.students?.length ?? 0} students
              </p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {isStaff && (
              <>
                <Button size="sm" variant="outline" onClick={initAttendance}>
                  <ClipboardList className="h-4 w-4 mr-1" /> Attendance
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEnrollOpen(true)}>
                  <UserPlus className="h-4 w-4 mr-1" /> Enroll Student
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Subjects pills */}
        {cls.subjects?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {cls.subjects.map((s: any) => (
              <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>
            ))}
          </div>
        )}
      </div>

      {/* ── Tabs ── */}
      <Tabs defaultValue="homework">
        <TabsList className="mb-4 flex w-full overflow-x-auto scrollbar-hide h-auto py-1 gap-1 flex-nowrap">
          <TabsTrigger value="homework" className="whitespace-nowrap shrink-0 text-xs sm:text-sm">
            📝 Homework
            {homework.filter((h) => !h.submissions?.length).length > 0 && (
              <span className="ml-1.5 bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                {homework.filter((h) => !h.submissions?.length).length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="hifz" className="whitespace-nowrap shrink-0 text-xs sm:text-sm">🤲 Hifz</TabsTrigger>
          <TabsTrigger value="struggles" className="whitespace-nowrap shrink-0 text-xs sm:text-sm">
            🆘 Struggles
            {pendingStruggles > 0 && (
              <span className="ml-1.5 bg-amber-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">
                {pendingStruggles}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="announcements" className="whitespace-nowrap shrink-0 text-xs sm:text-sm">📢 Announce</TabsTrigger>
          <TabsTrigger value="resources" className="whitespace-nowrap shrink-0 text-xs sm:text-sm">📎 Resources</TabsTrigger>
          <TabsTrigger value="attendance" className="whitespace-nowrap shrink-0 text-xs sm:text-sm">📅 Attendance</TabsTrigger>
          {isStaff && <TabsTrigger value="report" className="whitespace-nowrap shrink-0 text-xs sm:text-sm" onClick={fetchReport}>📊 Report</TabsTrigger>}
          <TabsTrigger value="achievements" className="whitespace-nowrap shrink-0 text-xs sm:text-sm">🏅 Badges</TabsTrigger>
          {isStaff && <TabsTrigger value="students" className="whitespace-nowrap shrink-0 text-xs sm:text-sm">👨‍🎓 Students</TabsTrigger>}
        </TabsList>

        {/* ──── Homework Tab ──── */}
        <TabsContent value="homework">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Homework ({homework.length})</h2>
            {isStaff && (
              <Button size="sm" onClick={() => setHwOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" /> Assign
              </Button>
            )}
          </div>

          {homework.length === 0 ? (
            <Card className="text-center py-10">
              <CardContent>
                <BookOpen className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No homework assigned yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {homework.map((hw) => {
                const mySubmission = hw.submissions?.[0];
                const overdue = new Date(hw.dueDate) < new Date() && !mySubmission;
                const statusColor = mySubmission?.status === 'GRADED'
                  ? 'bg-emerald-50 border-emerald-200'
                  : mySubmission
                  ? 'bg-blue-50 border-blue-200'
                  : overdue
                  ? 'bg-red-50 border-red-200'
                  : 'bg-white';

                return (
                  <Card key={hw.id} className={`border ${statusColor}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="font-semibold">{hw.title}</h3>
                            {hw.subject && <Badge variant="secondary" className="text-xs">{hw.subject.name}</Badge>}
                            {mySubmission?.status === 'GRADED' && (
                              <Badge className="bg-emerald-100 text-emerald-800 text-xs">
                                ✅ Graded: {mySubmission.grade}/100
                              </Badge>
                            )}
                            {mySubmission && mySubmission.status !== 'GRADED' && (
                              <Badge className="bg-blue-100 text-blue-800 text-xs">📬 Submitted</Badge>
                            )}
                            {overdue && (
                              <Badge className="bg-red-100 text-red-800 text-xs">⚠️ Overdue</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{hw.description}</p>
                          {/* Attachment */}
                          {hw.attachmentUrl && (
                            <a
                              href={hw.attachmentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
                            >
                              <Paperclip className="h-3.5 w-3.5" />
                              {hw.attachmentName || 'View Attachment'}
                            </a>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground flex-wrap">
                            <span>📅 Due: {new Date(hw.dueDate).toLocaleDateString('en-ZA', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
                            {isStaff && <span>📬 {hw._count?.submissions ?? 0} submissions</span>}
                            {hw._count?.comments > 0 && (
                              <span>💬 {hw._count.comments} comment{hw._count.comments !== 1 ? 's' : ''}</span>
                            )}
                          </div>
                          {/* Student: feedback from teacher */}
                          {!isStaff && mySubmission?.feedback && (
                            <div className="mt-2 p-2 bg-emerald-50 rounded-lg border border-emerald-200 text-xs text-emerald-800">
                              <span className="font-semibold">Teacher feedback:</span> {mySubmission.feedback}
                            </div>
                          )}
                          {/* Student: submitted content preview */}
                          {!isStaff && mySubmission?.content && (
                            <div className="mt-1.5 p-2 bg-blue-50 rounded-lg border border-blue-200 text-xs text-blue-800 line-clamp-2">
                              <span className="font-semibold">Your submission:</span> {mySubmission.content}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 shrink-0">
                          {isStaff ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openSubmissions(hw)}
                            >
                              <Eye className="h-3.5 w-3.5 mr-1" /> Submissions ({hw._count?.submissions ?? 0})
                            </Button>
                          ) : (
                            !mySubmission && (
                              <Button
                                size="sm"
                                onClick={() => { setSubmitHw(hw); setSubmitOpen(true); }}
                                className="bg-emerald-600 hover:bg-emerald-700"
                              >
                                <Send className="h-4 w-4 mr-1" /> Submit
                              </Button>
                            )
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => openComments(hw)}
                            className="text-muted-foreground"
                          >
                            <MessageSquare className="h-3.5 w-3.5 mr-1" />
                            Comments {hw._count?.comments > 0 ? `(${hw._count.comments})` : ''}
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ──── Hifz Tab ──── */}
        <TabsContent value="hifz">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Hifz Progress</h2>
            {isStaff && (
              <Button size="sm" onClick={() => setHifzOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" /> Record
              </Button>
            )}
          </div>

          {hifz.length === 0 ? (
            <Card className="text-center py-10">
              <CardContent>
                <BookMarked className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No hifz records yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {Object.entries(
                hifz.reduce((acc: any, h: any) => {
                  const key = h.studentId;
                  if (!acc[key]) acc[key] = { student: h.student, entries: [] };
                  acc[key].entries.push(h);
                  return acc;
                }, {})
              ).map(([sid, data]: any) => {
                const memorized = data.entries.filter((e: any) => e.memorized).length;
                const total = data.entries.length;
                return (
                  <Card key={sid}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center justify-between">
                        <span>🤲 {dname(data.student)}</span>
                        <Badge variant="secondary">{memorized}/{total} surahs</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {data.entries.map((e: any) => (
                          <div
                            key={e.id}
                            className={`p-2.5 rounded-lg border text-xs ${
                              e.memorized ? 'bg-emerald-50 border-emerald-200' : 'bg-muted/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="font-semibold">{e.surahName}</span>
                              {e.memorized && <Check className="h-3.5 w-3.5 text-emerald-600" />}
                            </div>
                            <div className="text-muted-foreground">
                              Ayah {e.ayahFrom}–{e.ayahTo}
                            </div>
                            {e.quality && (
                              <div className="mt-1 flex gap-0.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-3 w-3 ${i < e.quality ? 'text-amber-400 fill-amber-400' : 'text-muted-foreground/30'}`}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ──── Struggles Tab ──── */}
        <TabsContent value="struggles">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Struggle Reports</h2>
            {!isStaff && (
              <Button size="sm" onClick={() => setStruggleOpen(true)} className="bg-amber-600 hover:bg-amber-700">
                <AlertTriangle className="h-4 w-4 mr-1" /> Report
              </Button>
            )}
          </div>
          {!isStaff && (
            <p className="text-sm text-muted-foreground mb-4">
              Struggling with a topic? Let your teacher know so they can help you. 💛
            </p>
          )}

          {struggles.length === 0 ? (
            <Card className="text-center py-10">
              <CardContent>
                <AlertTriangle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No struggle reports.</p>
                {!isStaff && (
                  <Button className="mt-4 bg-amber-600 hover:bg-amber-700" onClick={() => setStruggleOpen(true)}>
                    Flag a topic I struggle with
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {struggles.map((s) => (
                <StruggleCard
                  key={s.id}
                  struggle={s}
                  isStaff={isStaff}
                  onResolve={handleResolveStruggle}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* ──── Attendance Tab ──── */}
        <TabsContent value="attendance">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Attendance</h2>
            {isStaff && (
              <Button size="sm" onClick={initAttendance} className="bg-blue-600 hover:bg-blue-700">
                <ClipboardList className="h-4 w-4 mr-1" /> Mark Today
              </Button>
            )}
          </div>

          {attendance.length === 0 ? (
            <Card className="text-center py-10">
              <CardContent>
                <Calendar className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No attendance records yet.</p>
              </CardContent>
            </Card>
          ) : (
            <AttendanceSummary attendance={attendance} />
          )}
        </TabsContent>

        {/* ──── Announcements Tab ──── */}
        <TabsContent value="announcements">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Announcements</h2>
            {isStaff && (
              <Button size="sm" onClick={() => setAnnouncementOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" /> Post
              </Button>
            )}
          </div>
          {announcements.length === 0 ? (
            <Card className="text-center py-10">
              <CardContent>
                <Megaphone className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No announcements yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {announcements.map((a: any) => (
                <Card key={a.id} className={a.isPinned ? 'border-amber-300 bg-amber-50/40' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {a.isPinned && <Pin className="h-3.5 w-3.5 text-amber-600" />}
                          <h3 className="font-semibold text-sm">{a.title}</h3>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-line">{a.content}</p>
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {dname(a.author)} • {new Date(a.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {isStaff && (
                        <button
                          onClick={() => handleDeleteAnnouncement(a.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ──── Resources Tab ──── */}
        <TabsContent value="resources">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Class Resources</h2>
            {isStaff && (
              <Button size="sm" onClick={() => setResourceOpen(true)} className="bg-emerald-600 hover:bg-emerald-700">
                <Plus className="h-4 w-4 mr-1" /> Add
              </Button>
            )}
          </div>
          {resources.length === 0 ? (
            <Card className="text-center py-10">
              <CardContent>
                <FileText className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No resources shared yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {resources.map((r: any) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{r.title}</p>
                        {r.subjectName && (
                          <Badge variant="secondary" className="text-xs mb-1">{r.subjectName}</Badge>
                        )}
                        {r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}
                        {r.fileUrl && (
                          <a
                            href={r.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline mt-1.5"
                          >
                            <Link2 className="h-3.5 w-3.5" /> Open resource
                          </a>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {dname(r.author)} • {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      {isStaff && (
                        <button
                          onClick={() => handleDeleteResource(r.id)}
                          className="text-muted-foreground hover:text-red-500 transition-colors shrink-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ──── Report Card Tab (staff only) ──── */}
        {isStaff && (
          <TabsContent value="report">
            {reportLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-emerald-600" /></div>
            ) : reportData.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-10 w-10 mx-auto mb-3 opacity-40" />
                <p>Click the Report tab to load student progress data</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reportData.map((s: any) => (
                  <Card key={s.student.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">{dname(s.student)}</CardTitle>
                      <CardDescription>{s.student.email}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                        {[
                          { label: 'Homework', value: s.hwCompletion != null ? `${s.hwCompletion}%` : '–' },
                          { label: 'Avg Grade', value: s.avgGrade != null ? `${s.avgGrade}%` : '–' },
                          { label: 'Attendance', value: s.attendancePct != null ? `${s.attendancePct}%` : '–' },
                          { label: 'Hifz Pages', value: s.memorizedPages },
                        ].map((k) => (
                          <div key={k.label} className="text-center bg-muted/40 rounded-lg p-2.5">
                            <p className="text-lg font-bold">{k.value}</p>
                            <p className="text-xs text-muted-foreground">{k.label}</p>
                          </div>
                        ))}
                      </div>
                      {s.unresolvedStruggles > 0 && (
                        <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1">
                          ⚠️ {s.unresolvedStruggles} unresolved struggle report{s.unresolvedStruggles !== 1 ? 's' : ''}
                        </p>
                      )}
                      {s.gradesBySubject.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {s.gradesBySubject.map((g: any, i: number) => (
                            <div key={i} className="flex items-center gap-2 text-xs">
                              <span className="w-28 truncate text-muted-foreground">{g.subject}</span>
                              <div className="flex-1 bg-muted rounded-full h-1.5">
                                <div
                                  className={`h-full rounded-full ${g.percentage >= 75 ? 'bg-emerald-500' : g.percentage >= 50 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                  style={{ width: `${g.percentage}%` }}
                                />
                              </div>
                              <span className="font-medium w-10 text-right">{g.percentage}%</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}

        {/* ──── Achievements Tab ──── */}
        <TabsContent value="achievements">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">Achievements & Badges</h2>
            {isStaff && (
              <Button size="sm" onClick={() => setBadgeOpen(true)} className="bg-amber-500 hover:bg-amber-600">
                <Award className="h-4 w-4 mr-1" /> Award Badge
              </Button>
            )}
          </div>
          {badges.length === 0 ? (
            <Card className="text-center py-10">
              <CardContent>
                <Award className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">No badges awarded yet.</p>
                {isStaff && (
                  <Button className="mt-4 bg-amber-500 hover:bg-amber-600" onClick={() => setBadgeOpen(true)}>
                    Award first badge
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {Object.entries(
                badges.reduce((acc: any, b: any) => {
                  const key = b.student.id;
                  if (!acc[key]) acc[key] = { student: b.student, badges: [] };
                  acc[key].badges.push(b);
                  return acc;
                }, {})
              ).map(([sid, data]: any) => (
                <Card key={sid}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">🎒 {dname(data.student)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {data.badges.map((b: any) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2"
                          title={b.description || ''}
                        >
                          <Award className="h-4 w-4 text-amber-500" />
                          <div>
                            <p className="text-xs font-bold text-amber-800">{b.label}</p>
                            <p className="text-[10px] text-amber-600">{new Date(b.awardedAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* ──── Students Tab (staff only) ──── */}
        {isStaff && (
          <TabsContent value="students">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Enrolled Students ({cls.students?.length ?? 0})</h2>
              <Button size="sm" variant="outline" onClick={() => setEnrollOpen(true)}>
                <UserPlus className="h-4 w-4 mr-1" /> Enroll
              </Button>
            </div>
            {cls.students?.length === 0 ? (
              <Card className="text-center py-10">
                <CardContent>
                  <Users className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No students enrolled yet.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-2">
                {cls.students?.map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{dname(e.user)}</p>
                      <p className="text-xs text-muted-foreground">{e.user.email}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enrolled {new Date(e.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* ── Assign Homework Dialog ── */}
      <Dialog open={hwOpen} onOpenChange={setHwOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Assign Homework</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Title *</Label>
              <Input placeholder="e.g. Learn Surah Al-Fatiha" value={hwForm.title}
                onChange={(e) => setHwForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Instructions *</Label>
              <Textarea placeholder="Describe what students need to do..." rows={3} value={hwForm.description}
                onChange={(e) => setHwForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Due Date *</Label>
                <Input type="date" value={hwForm.dueDate}
                  onChange={(e) => setHwForm((f) => ({ ...f, dueDate: e.target.value }))} />
              </div>
              <div>
                <Label>Subject</Label>
                <select
                  className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={hwForm.subjectId}
                  onChange={(e) => setHwForm((f) => ({ ...f, subjectId: e.target.value }))}
                >
                  <option value="">General</option>
                  {cls.subjects?.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <Label>Attachment Link (optional)</Label>
              <Input placeholder="https://docs.google.com/..." value={hwForm.attachmentUrl}
                onChange={(e) => setHwForm((f) => ({ ...f, attachmentUrl: e.target.value }))} />
            </div>
            {hwForm.attachmentUrl && (
              <div>
                <Label>Attachment Label</Label>
                <Input placeholder="e.g. Worksheet PDF" value={hwForm.attachmentName}
                  onChange={(e) => setHwForm((f) => ({ ...f, attachmentName: e.target.value }))} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHwOpen(false)}>Cancel</Button>
            <Button onClick={handleAssignHw} disabled={creatingHw} className="bg-emerald-600 hover:bg-emerald-700">
              {creatingHw && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Submit Homework Dialog ── */}
      <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Submit: {submitHw?.title}</DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Label>Your answer / notes</Label>
            <Textarea placeholder="Write your answer here..." rows={5} value={submitContent}
              onChange={(e) => setSubmitContent(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmitOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitHw} disabled={submitting} className="bg-emerald-600 hover:bg-emerald-700">
              {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Send className="h-4 w-4 mr-1" /> Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Enroll Student Dialog ── */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Enroll Student</DialogTitle></DialogHeader>
          <div className="py-2">
            <Label>Email or Username</Label>
            <Input placeholder="student@email.com" value={enrollEmail}
              onChange={(e) => setEnrollEmail(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEnrollOpen(false)}>Cancel</Button>
            <Button onClick={handleEnroll} disabled={enrolling} className="bg-emerald-600 hover:bg-emerald-700">
              {enrolling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <UserPlus className="h-4 w-4 mr-1" /> Enroll
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Record Hifz Dialog ── */}
      <Dialog open={hifzOpen} onOpenChange={setHifzOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Record Hifz Progress</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Student</Label>
              <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={hifzForm.studentId}
                onChange={(e) => setHifzForm((f) => ({ ...f, studentId: e.target.value }))}>
                <option value="">Select student...</option>
                {cls.students?.map((e: any) => (
                  <option key={e.userId} value={e.userId}>{dname(e.user)}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Surah #</Label>
                <Input type="number" min="1" max="114" value={hifzForm.surahNumber}
                  onChange={(e) => setHifzForm((f) => ({ ...f, surahNumber: e.target.value }))} />
              </div>
              <div>
                <Label>Ayah From</Label>
                <Input type="number" min="1" value={hifzForm.ayahFrom}
                  onChange={(e) => setHifzForm((f) => ({ ...f, ayahFrom: e.target.value }))} />
              </div>
              <div>
                <Label>Ayah To</Label>
                <Input type="number" min="1" value={hifzForm.ayahTo}
                  onChange={(e) => setHifzForm((f) => ({ ...f, ayahTo: e.target.value }))} />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label>Quality (1–5)</Label>
                <Input type="number" min="1" max="5" value={hifzForm.quality}
                  onChange={(e) => setHifzForm((f) => ({ ...f, quality: e.target.value }))} />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <input type="checkbox" id="mem" checked={hifzForm.memorized}
                  onChange={(e) => setHifzForm((f) => ({ ...f, memorized: e.target.checked }))}
                  className="h-4 w-4 accent-emerald-600" />
                <label htmlFor="mem" className="text-sm">Memorized</label>
              </div>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea placeholder="Teacher notes on recitation..." rows={2} value={hifzForm.notes}
                onChange={(e) => setHifzForm((f) => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setHifzOpen(false)}>Cancel</Button>
            <Button onClick={handleRecordHifz} disabled={savingHifz} className="bg-emerald-600 hover:bg-emerald-700">
              {savingHifz && <Loader2 className="h-4 w-4 animate-spin mr-2" />} Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Report Struggle Dialog ── */}
      <Dialog open={struggleOpen} onOpenChange={setStruggleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>🆘 Report a Struggle Area</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground px-1 pb-1">
            Tell your teacher what you are finding difficult — they will help you in sha Allah.
          </p>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Subject</Label>
                <select className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                  value={struggleForm.subjectName}
                  onChange={(e) => setStruggleForm((f) => ({ ...f, subjectName: e.target.value }))}>
                  <option value="">General</option>
                  {cls.subjects?.map((s: any) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Topic *</Label>
                <Input placeholder="e.g. Long vowels in Arabic" value={struggleForm.topic}
                  onChange={(e) => setStruggleForm((f) => ({ ...f, topic: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label>More details (optional)</Label>
              <Textarea placeholder="Describe what is confusing or hard..." rows={3}
                value={struggleForm.description}
                onChange={(e) => setStruggleForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStruggleOpen(false)}>Cancel</Button>
            <Button onClick={handleStruggle} disabled={savingStruggle} className="bg-amber-600 hover:bg-amber-700">
              {savingStruggle && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <AlertTriangle className="h-4 w-4 mr-1" /> Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Attendance Dialog ── */}
      <Dialog open={attendanceOpen} onOpenChange={setAttendanceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mark Attendance — {new Date().toLocaleDateString('en-ZA', { weekday: 'long', day: 'numeric', month: 'long' })}</DialogTitle>
          </DialogHeader>
          <div className="max-h-72 overflow-y-auto space-y-2 py-2">
            {cls.students?.map((e: any) => (
              <div key={e.userId} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/40">
                <span className="text-sm font-medium">{dname(e.user)}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setAttendanceMap((m) => ({ ...m, [e.userId]: true }))}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      attendanceMap[e.userId] === true
                        ? 'bg-emerald-600 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-emerald-100'
                    }`}
                  >
                    Present
                  </button>
                  <button
                    onClick={() => setAttendanceMap((m) => ({ ...m, [e.userId]: false }))}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      attendanceMap[e.userId] === false
                        ? 'bg-red-500 text-white'
                        : 'bg-muted text-muted-foreground hover:bg-red-100'
                    }`}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAttendanceOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveAttendance} disabled={savingAttendance} className="bg-blue-600 hover:bg-blue-700">
              {savingAttendance && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Save Attendance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Post Announcement Dialog ── */}
      <Dialog open={announcementOpen} onOpenChange={setAnnouncementOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>📢 Post Announcement</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Title *</Label>
              <Input placeholder="e.g. Exam next Thursday" value={announcementForm.title}
                onChange={(e) => setAnnouncementForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Message *</Label>
              <Textarea placeholder="Write your announcement..." rows={4} value={announcementForm.content}
                onChange={(e) => setAnnouncementForm((f) => ({ ...f, content: e.target.value }))} />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinned"
                checked={announcementForm.isPinned}
                onChange={(e) => setAnnouncementForm((f) => ({ ...f, isPinned: e.target.checked }))}
                className="h-4 w-4 accent-amber-500"
              />
              <label htmlFor="pinned" className="text-sm">📌 Pin this announcement to the top</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAnnouncementOpen(false)}>Cancel</Button>
            <Button onClick={handleAddAnnouncement} disabled={savingAnnouncement} className="bg-emerald-600 hover:bg-emerald-700">
              {savingAnnouncement && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Megaphone className="h-4 w-4 mr-1" /> Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Resource Dialog ── */}
      <Dialog open={resourceOpen} onOpenChange={setResourceOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>📎 Add Resource</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Title *</Label>
              <Input placeholder="e.g. Arabic Alphabet Chart" value={resourceForm.title}
                onChange={(e) => setResourceForm((f) => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <Label>Description</Label>
              <Input placeholder="Brief description..." value={resourceForm.description}
                onChange={(e) => setResourceForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
            <div>
              <Label>Link / URL</Label>
              <Input placeholder="https://..." value={resourceForm.fileUrl}
                onChange={(e) => setResourceForm((f) => ({ ...f, fileUrl: e.target.value }))} />
            </div>
            <div>
              <Label>Subject</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={resourceForm.subjectName}
                onChange={(e) => setResourceForm((f) => ({ ...f, subjectName: e.target.value }))}
              >
                <option value="">General</option>
                {cls?.subjects?.map((s: any) => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResourceOpen(false)}>Cancel</Button>
            <Button onClick={handleAddResource} disabled={savingResource} className="bg-emerald-600 hover:bg-emerald-700">
              {savingResource && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Add Resource
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Award Badge Dialog ── */}
      <Dialog open={badgeOpen} onOpenChange={setBadgeOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>🏅 Award Achievement Badge</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label>Student *</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={badgeForm.studentId}
                onChange={(e) => setBadgeForm((f) => ({ ...f, studentId: e.target.value }))}
              >
                <option value="">Select student...</option>
                {cls?.students?.map((e: any) => (
                  <option key={e.userId} value={e.userId}>{dname(e.user)}</option>
                ))}
              </select>
            </div>
            <div>
              <Label>Badge Type</Label>
              <select
                className="w-full border rounded-md px-3 py-2 text-sm bg-background"
                value={badgeForm.type}
                onChange={(e) => setBadgeForm((f) => ({ ...f, type: e.target.value }))}
              >
                <option value="ACHIEVEMENT">🏆 Achievement</option>
                <option value="HIFZ">📖 Hifz Milestone</option>
                <option value="IMPROVEMENT">📈 Most Improved</option>
                <option value="EFFORT">💪 Outstanding Effort</option>
                <option value="ATTENDANCE">🌟 Perfect Attendance</option>
                <option value="CUSTOM">✨ Custom</option>
              </select>
            </div>
            <div>
              <Label>Badge Label *</Label>
              <Input placeholder="e.g. Completed Surah Al-Baqarah" value={badgeForm.label}
                onChange={(e) => setBadgeForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div>
              <Label>Note (optional)</Label>
              <Input placeholder="Extra detail..." value={badgeForm.description}
                onChange={(e) => setBadgeForm((f) => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBadgeOpen(false)}>Cancel</Button>
            <Button onClick={handleAwardBadge} disabled={savingBadge} className="bg-amber-500 hover:bg-amber-600">
              {savingBadge && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              <Award className="h-4 w-4 mr-1" /> Award Badge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── View Submissions Dialog (Teacher grading panel) ── */}
      <Dialog open={submissionsOpen} onOpenChange={setSubmissionsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>📬 Submissions — {submissionsHw?.title}</DialogTitle>
          </DialogHeader>
          {loadingSubmissions ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              <Send className="h-10 w-10 mx-auto mb-2 opacity-40" />
              <p>No submissions yet.</p>
            </div>
          ) : (
            <div className="space-y-4 py-2">
              {submissions.map((sub) => {
                const g = gradingMap[sub.id] || { grade: '', feedback: '' };
                return (
                  <div key={sub.id} className="border rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-sm">{dname(sub.student)}</p>
                        <p className="text-xs text-muted-foreground">{sub.student.email}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {sub.status === 'GRADED' ? (
                          <Badge className="bg-emerald-100 text-emerald-800">✅ Graded: {sub.grade}/100</Badge>
                        ) : (
                          <Badge className="bg-blue-100 text-blue-800">📬 Submitted</Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(sub.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    {sub.content && (
                      <div className="bg-muted/40 rounded-lg p-3 text-sm whitespace-pre-wrap">
                        {sub.content}
                      </div>
                    )}
                    <div className="grid grid-cols-[80px_1fr] gap-2 items-end">
                      <div>
                        <Label className="text-xs">Grade /100</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          placeholder="–"
                          className="text-sm"
                          value={g.grade}
                          onChange={(e) =>
                            setGradingMap((m) => ({ ...m, [sub.id]: { ...m[sub.id], grade: e.target.value } }))
                          }
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Teacher Feedback</Label>
                        <Input
                          placeholder="Leave a note for the student…"
                          className="text-sm"
                          value={g.feedback}
                          onChange={(e) =>
                            setGradingMap((m) => ({ ...m, [sub.id]: { ...m[sub.id], feedback: e.target.value } }))
                          }
                        />
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 w-full"
                      onClick={() => handleGradeSubmission(sub.id)}
                      disabled={gradingId === sub.id}
                    >
                      {gradingId === sub.id
                        ? <Loader2 className="h-4 w-4 animate-spin mr-1" />
                        : <Check className="h-4 w-4 mr-1" />
                      }
                      {sub.status === 'GRADED' ? 'Update Grade' : 'Save Grade & Feedback'}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSubmissionsOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Homework Comments Dialog ── */}
      <Dialog open={commentsOpen} onOpenChange={setCommentsOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>💬 Discussion — {commentsHw?.title}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto space-y-3 py-2 min-h-0">
            {loadingComments ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No comments yet. Be the first to ask a question!</p>
              </div>
            ) : (
              comments.map((c) => (
                <div
                  key={c.id}
                  className={`flex gap-2.5 ${c.isTeacher ? 'flex-row-reverse' : ''}`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                    c.isTeacher ? 'bg-blue-600 text-white' : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {(c.user?.displayName || c.user?.username || c.user?.email || '?')[0].toUpperCase()}
                  </div>
                  <div className={`flex-1 ${c.isTeacher ? 'text-right' : ''}`}>
                    <p className={`text-xs font-semibold mb-0.5 ${c.isTeacher ? 'text-blue-700' : 'text-gray-700'}`}>
                      {dname(c.user)} {c.isTeacher && '(Teacher)'}
                    </p>
                    <div className={`inline-block px-3 py-2 rounded-xl text-sm max-w-xs ${
                      c.isTeacher
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-muted text-gray-800 rounded-tl-none'
                    }`}>
                      {c.content}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {new Date(c.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2 pt-3 border-t">
            <Input
              placeholder="Ask a question or leave a note…"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handlePostComment(); } }}
            />
            <Button onClick={handlePostComment} disabled={postingComment || !newComment.trim()} className="bg-emerald-600 hover:bg-emerald-700 shrink-0">
              {postingComment ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────

function StruggleCard({
  struggle, isStaff, onResolve,
}: {
  struggle: any;
  isStaff: boolean;
  onResolve: (id: string, resolved: boolean, note: string) => void;
}) {
  const [note, setNote] = useState(struggle.teacherNote || '');
  const [open, setOpen] = useState(false);

  return (
    <Card className={struggle.isResolved ? 'opacity-60' : 'border-amber-200 bg-amber-50/40'}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Badge variant="secondary" className="text-xs">{struggle.subjectName}</Badge>
              <span className="font-semibold text-sm">{struggle.topic}</span>
              {struggle.isResolved && <Badge className="bg-emerald-100 text-emerald-800 text-xs">✅ Resolved</Badge>}
            </div>
            {struggle.description && <p className="text-sm text-muted-foreground">{struggle.description}</p>}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground flex-wrap">
              <span>👤 {dname(struggle.student)}</span>
              <span>📅 {new Date(struggle.createdAt).toLocaleDateString()}</span>
            </div>
            {struggle.teacherNote && (
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-800 border border-blue-200">
                💬 Teacher: {struggle.teacherNote}
              </div>
            )}
          </div>
          {isStaff && !struggle.isResolved && (
            <Button size="sm" variant="outline" onClick={() => setOpen(!open)}>
              Respond
            </Button>
          )}
        </div>
        {isStaff && open && (
          <div className="mt-3 space-y-2">
            <Textarea placeholder="Leave a note for the student..." rows={2} value={note}
              onChange={(e) => setNote(e.target.value)} className="text-sm" />
            <div className="flex gap-2">
              <Button size="sm" variant="outline"
                onClick={() => { onResolve(struggle.id, false, note); setOpen(false); }}>
                Save Note
              </Button>
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700"
                onClick={() => { onResolve(struggle.id, true, note); setOpen(false); }}>
                <Check className="h-3.5 w-3.5 mr-1" /> Mark Resolved
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function AttendanceSummary({ attendance }: { attendance: any[] }) {
  const byStudent = attendance.reduce((acc: any, a: any) => {
    const key = a.studentId;
    if (!acc[key]) acc[key] = { student: a.student, present: 0, absent: 0 };
    if (a.present) acc[key].present++;
    else acc[key].absent++;
    return acc;
  }, {});

  return (
    <div className="space-y-2">
      {Object.values(byStudent).map((s: any) => {
        const total = s.present + s.absent;
        const pct = total > 0 ? Math.round((s.present / total) * 100) : 0;
        return (
          <Card key={s.student.id}>
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-medium text-sm">{dname(s.student)}</span>
                <span className={`text-xs font-bold ${pct >= 80 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-600' : 'text-red-600'}`}>
                  {pct}%
                </span>
              </div>
              <Progress value={pct} className="h-1.5" />
              <p className="text-xs text-muted-foreground mt-1">
                {s.present} present / {s.absent} absent of {total} sessions
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
