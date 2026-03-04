'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuranMediaManager } from '@/components/admin/quran-media-manager';
import { LearningAdminManager } from '@/components/admin/learning-admin-manager';
import { AudioLibraryManager } from '@/components/admin/audio-library-manager';
import PDFBookList from '@/components/admin/pdf-book-list';
import PDFBookUploadForm from '@/components/admin/pdf-book-upload-form';
import { YaseenAudioManager } from '@/components/admin/yaseen-audio-manager';
import { ContentManager } from '@/components/admin/content-manager';
import { 
  Users, 
  BookOpen, 
  ShieldCheck, 
  TrendingUp, 
  AlertCircle,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Eye,
  Settings
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import PDFReader from '@/components/pdf/PDFReader';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// ─── Inline Admin Sub-Components ────────────────────────────────────────────

function AdManagerTab() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ businessName: '', imageUrl: '', targetUrl: '' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/banners?admin=true')
      .then(r => r.json())
      .then(d => setBanners(d.banners ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const totalViews = banners.reduce((s, b) => s + b.views, 0);
  const totalClicks = banners.reduce((s, b) => s + b.clicks, 0);
  const avgCtr = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : '0.0';

  const handleAdd = async () => {
    if (!form.businessName || !form.imageUrl) return;
    setSaving(true);
    await fetch('/api/banners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ businessName: '', imageUrl: '', targetUrl: '' });
    setShowAdd(false);
    setSaving(false);
    load();
  };

  const toggleActive = async (id: string, current: boolean) => {
    await fetch(`/api/banners?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    });
    load();
  };

  const deleteBanner = async (id: string) => {
    if (!confirm('Delete this banner?')) return;
    await fetch(`/api/banners?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Active Banners', value: banners.filter(b => b.isActive).length },
          { label: 'Total Views', value: totalViews.toLocaleString() },
          { label: 'Total Clicks', value: totalClicks.toLocaleString() },
          { label: 'Avg CTR', value: `${avgCtr}%` },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Add Banner */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Sponsored Banners</h2>
        <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? 'outline' : 'default'} size="sm">
          {showAdd ? 'Cancel' : '+ Add Banner'}
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Business Name *</Label>
              <Input value={form.businessName} onChange={e => setForm(f => ({ ...f, businessName: e.target.value }))} placeholder="Cape Town Halaal Butchery" />
            </div>
            <div className="space-y-1">
              <Label>Image URL * <span className="text-xs text-muted-foreground">(1200×400px recommended)</span></Label>
              <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} placeholder="https://cloudinary.com/..." />
            </div>
            <div className="space-y-1">
              <Label>Target URL (optional)</Label>
              <Input value={form.targetUrl} onChange={e => setForm(f => ({ ...f, targetUrl: e.target.value }))} placeholder="https://business-website.co.za" />
            </div>
          </div>
          <Button onClick={handleAdd} disabled={saving || !form.businessName || !form.imageUrl}>
            {saving ? 'Saving...' : 'Create Banner'}
          </Button>
        </Card>
      )}

      {/* Banner List */}
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : banners.length === 0 ? (
        <p className="text-sm text-muted-foreground">No banners yet. Add your first sponsor above.</p>
      ) : (
        <div className="space-y-2">
          {banners.map(b => (
            <Card key={b.id} className="p-3">
              <div className="flex items-center gap-3 flex-wrap">
                <img src={b.imageUrl} alt={b.businessName} className="w-20 h-10 object-cover rounded-lg flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{b.businessName}</p>
                  <p className="text-xs text-muted-foreground truncate">{b.targetUrl || 'No link'}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>👁 {b.views}</span>
                  <span>🖱 {b.clicks}</span>
                  <span>CTR: {b.views > 0 ? ((b.clicks / b.views) * 100).toFixed(1) : 0}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => toggleActive(b.id, b.isActive)}>
                    {b.isActive ? '✅ Active' : '⏸ Paused'}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => deleteBanner(b.id)}>Delete</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pricing reminder */}
      <div className="text-xs text-muted-foreground bg-muted/50 rounded-xl p-3 mt-2">
        💡 Pricing guide: Free for first 3 months (launch partners) · R200/month per banner slot after. Tell businesses to send a 1200×400px image, then paste the Cloudinary/Firebase URL above.
      </div>
    </div>
  );
}

function VideoPlaylistsTab() {
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: '', instructor: '', youtubePlaylistId: '', thumbnailUrl: '', category: 'General' });
  const [saving, setSaving] = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/video-playlists')
      .then(r => r.json())
      .then(d => setPlaylists(d.playlists ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!form.title || !form.youtubePlaylistId || !form.thumbnailUrl) return;
    setSaving(true);
    await fetch('/api/video-playlists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, instructor: form.instructor || 'Unknown' }),
    });
    setForm({ title: '', instructor: '', youtubePlaylistId: '', thumbnailUrl: '', category: 'General' });
    setShowAdd(false);
    setSaving(false);
    load();
  };

  const deletePlaylist = async (id: string) => {
    if (!confirm('Delete this playlist?')) return;
    await fetch(`/api/video-playlists?id=${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">Video Playlists</h2>
        <Button onClick={() => setShowAdd(!showAdd)} variant={showAdd ? 'outline' : 'default'} size="sm">
          {showAdd ? 'Cancel' : '+ Add Playlist'}
        </Button>
      </div>

      {showAdd && (
        <Card className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Stories of the Prophets" />
            </div>
            <div className="space-y-1">
              <Label>Instructor</Label>
              <Input value={form.instructor} onChange={e => setForm(f => ({ ...f, instructor: e.target.value }))} placeholder="Mufti Menk" />
            </div>
            <div className="space-y-1">
              <Label>YouTube Playlist ID * <span className="text-xs text-muted-foreground">(from ?list=... in URL)</span></Label>
              <Input value={form.youtubePlaylistId} onChange={e => setForm(f => ({ ...f, youtubePlaylistId: e.target.value }))} placeholder="PLxxxxxxxxxxxxxxxxx" />
            </div>
            <div className="space-y-1">
              <Label>Thumbnail URL *</Label>
              <Input value={form.thumbnailUrl} onChange={e => setForm(f => ({ ...f, thumbnailUrl: e.target.value }))} placeholder="https://img.youtube.com/vi/VIDEO_ID/mqdefault.jpg" />
            </div>
            <div className="space-y-1">
              <Label>Category</Label>
              <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} placeholder="History, Fiqh, Tafseer..." />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">💡 Get Thumbnail URL: Open any YouTube video → right-click thumbnail → Copy image address. Or use: https://img.youtube.com/vi/VIDEO_ID/mqdefault.jpg</p>
          <Button onClick={handleAdd} disabled={saving || !form.title || !form.youtubePlaylistId || !form.thumbnailUrl}>
            {saving ? 'Saving...' : 'Add Playlist'}
          </Button>
        </Card>
      )}

      {loading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : playlists.length === 0 ? (
        <p className="text-sm text-muted-foreground">No playlists yet. Add your first playlist above.</p>
      ) : (
        <div className="space-y-2">
          {playlists.map(p => (
            <Card key={p.id} className="p-3 flex items-center gap-3 flex-wrap">
              <img src={p.thumbnailUrl} alt={p.title} className="w-20 h-12 object-cover rounded-lg flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{p.title}</p>
                <p className="text-xs text-muted-foreground">{p.instructor} · {p.category}</p>
                <p className="text-xs text-muted-foreground font-mono truncate">list={p.youtubePlaylistId}</p>
              </div>
              <Button size="sm" variant="destructive" onClick={() => deletePlaylist(p.id)}>Delete</Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

interface SystemStats {
  totalUsers: number;
  totalCourses: number;
  activeCourses: number;
  pendingVerification: number;
  totalRevenue: number;
  monthlyRevenue: number;
  totalEnrollments: number;
  activeTeachers: number;
  activeVerifiers: number;
}

interface RecentActivity {
  id: string;
  type: 'course_submitted' | 'course_approved' | 'course_rejected' | 'user_registered' | 'enrollment';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

export default function AdminDashboard() {
  const { user, hasRole, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);

  // Redirect if not admin (only after loading)
  useEffect(() => {
    if (!isLoading && (!user || !hasRole('admin'))) {
      router.replace('/dashboard');
    }
    if (!isLoading && user && hasRole('admin')) {
      document.title = 'Admin Dashboard | Deenify';
    }
  }, [user, hasRole, isLoading, router]);

  // Fetch admin data from real API
  useEffect(() => {
    // Removed broken fetch calls to /api/admin/stats and /api/admin/activities
    // TODO: Implement real admin stats and activities endpoints or use available data
  }, []);

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'course_submitted':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'course_approved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'course_rejected':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'user_registered':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'enrollment':
        return <BookOpen className="h-4 w-4 text-purple-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    if (typeof window === 'undefined') return '';
    const date = new Date(timestamp);
    const now = new Date();
    if (isNaN(date.getTime())) return '';
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / 1440)}d ago`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System overview and management
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          <ShieldCheck className="h-4 w-4 mr-2" />
          Administrator
        </Badge>
      </div>

      {/* Quran Media Upload Shortcut */}
      <div className="flex justify-end mb-2">
        <Button variant="default" size="lg" onClick={() => {
          const el = document.querySelector('[data-tab="quran-media"]');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}>
          <span className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Upload Recitation Audio
          </span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeTeachers} teachers, {stats?.activeVerifiers} verifiers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.activeCourses} active, {stats?.pendingVerification} pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.monthlyRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              ${stats?.totalRevenue.toLocaleString()} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrollments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalEnrollments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              All time enrollments
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="alerts">System Alerts</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="content-manager">📚 Content Manager</TabsTrigger>
          <TabsTrigger value="yaseen-audio">🎵 Yaaseen Audio</TabsTrigger>
          <TabsTrigger value="quran-media" data-tab="quran-media">Quran Media</TabsTrigger>
          <TabsTrigger value="audio-library">🎙 Audio Library</TabsTrigger>
          <TabsTrigger value="learning">Learning Library</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="pdf-books">PDF Book Upload</TabsTrigger>
          <TabsTrigger value="cce-mag-portal">CCE Mag Portal</TabsTrigger>
          <TabsTrigger value="pdf-reader-demo">PDF Reader Demo</TabsTrigger>
          <TabsTrigger value="ad-manager">💰 Ad Manager</TabsTrigger>
          <TabsTrigger value="video-playlists">📺 Video Library</TabsTrigger>
          <TabsTrigger value="media-upload">📁 Media Upload</TabsTrigger>
  </TabsList>
        <TabsContent value="cce-mag-portal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CCE Mag Quality of Life Portal</CardTitle>
              <CardDescription>
                Access the CCE Magazine Get Hired portal for quality of life resources and opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[70vh] rounded-lg overflow-hidden border shadow">
                <iframe
                  src="https://ccemagazine.web.za/ccemag/gethired/"
                  title="CCE Mag Portal"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
              <div className="mt-4 text-center">
                <a
                  href="https://ccemagazine.web.za/ccemag/gethired/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:text-blue-900"
                >
                  Open CCE Mag Portal in new tab
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PDF Reader Demo Tab (Visible) */}

        {/* PDF Book Upload Tab */}
        <TabsContent value="pdf-books" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upload PDF Books</CardTitle>
              <CardDescription>
                Upload Islamic books (e.g. Al Mufeedah, Surah Yaaseen) as PDFs for users to read in the Learning Library.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PDFBookUploadForm />
              <hr className="my-6" />
              <PDFBookList />
            </CardContent>
          </Card>
        </TabsContent>

        {/* CCE Mag Portal Tab */}
        <TabsContent value="cce-mag-portal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CCE Mag Quality of Life Portal</CardTitle>
              <CardDescription>
                Access the CCE Magazine Get Hired portal for quality of life resources and opportunities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="w-full h-[70vh] rounded-lg overflow-hidden border shadow">
                <iframe
                  src="https://ccemagazine.web.za/ccemag/gethired/"
                  title="CCE Mag Portal"
                  className="w-full h-full border-0"
                  allowFullScreen
                />
              </div>
              <div className="mt-4 text-center">
                <a
                  href="https://ccemagazine.web.za/ccemag/gethired/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline hover:text-blue-900"
                >
                  Open CCE Mag Portal in new tab
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PDF Reader Demo Tab (Visible) */}
        <TabsContent value="pdf-reader-demo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Beautiful PDF Reader Demo</CardTitle>
              <CardDescription>
                Experience the in-app PDF reader. This is a sample preview.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Replace the URL below with a real PDF if available */}
              <div className="w-full flex justify-center">
                <PDFReader pdfUrl="https://arxiv.org/pdf/2203.15556.pdf" bookId="demo" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Upload Tab */}
        <TabsContent value="media-upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>📁 Media Upload Manager</CardTitle>
              <CardDescription>
                Upload PDFs and audio files (Surah Yaaseen, Surah Baqarah, etc.) directly to the public folder.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Use the dedicated media upload page to upload and manage PDFs and audio files with drag-and-drop support.
              </p>
              <a
                href="/admin/media"
                className="inline-flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                📁 Open Media Upload Manager →
              </a>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Manager Tab */}
        <TabsContent value="content-manager" className="space-y-4">
          <ContentManager />
        </TabsContent>

        {/* Yaaseen Audio Tab */}
        <TabsContent value="yaseen-audio" className="space-y-4">
          <YaseenAudioManager />
        </TabsContent>

        {/* Recent Activity Tab */}
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Latest actions and events in the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    {getActivityIcon(activity.type)}
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {activity.description}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        by {activity.userName} · {formatTimestamp(activity.timestamp)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Alerts Tab */}
        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Alerts</CardTitle>
              <CardDescription>
                Important notifications requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-4 p-4 rounded-lg border border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-yellow-900">
                      {stats?.pendingVerification} courses pending verification
                    </p>
                    <p className="text-sm text-yellow-700">
                      Some courses have been waiting for more than 48 hours
                    </p>
                    <Button size="sm" variant="outline" className="mt-2">
                      View Verification Queue
                    </Button>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border border-blue-200 bg-blue-50">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-blue-900">
                      Server performance is optimal
                    </p>
                    <p className="text-sm text-blue-700">
                      All systems operational, 99.8% uptime this month
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 rounded-lg border border-green-200 bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium text-green-900">
                      Database backup completed
                    </p>
                    <p className="text-sm text-green-700">
                      Last backup: 2 hours ago · Next scheduled: In 22 hours
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                Manage user roles and permissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Students</p>
                      <p className="text-sm text-muted-foreground">2,508 active users</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium">Teachers</p>
                      <p className="text-sm text-muted-foreground">34 active instructors</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <ShieldCheck className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Verifiers</p>
                      <p className="text-sm text-muted-foreground">5 content moderators</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Manage
                  </Button>
                </div>

                <Button className="w-full">
                  <Users className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure platform-wide settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Automatic Course Approval</p>
                    <p className="text-sm text-muted-foreground">
                      Auto-approve courses from verified teachers
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">
                      Configure email templates and triggers
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Payment Processing</p>
                    <p className="text-sm text-muted-foreground">
                      Manage Stripe integration and pricing
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Content Moderation Rules</p>
                    <p className="text-sm text-muted-foreground">
                      Set guidelines for course verification
                    </p>
                  </div>
                  <Button variant="outline" size="sm">
                    Configure
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quran Media Tab */}
        <TabsContent value="quran-media" className="space-y-4" data-tab="quran-media">
          <QuranMediaManager />
        </TabsContent>

        {/* Audio Library Tab */}
        <TabsContent value="audio-library" className="space-y-4">
          <div className="mb-2">
            <h2 className="text-xl font-bold">Audio Library Manager</h2>
            <p className="text-muted-foreground text-sm">
              Add audio tracks for Surahs, Hadith narrations, Duas, Lectures, Dhikr and more.
              Paste any direct audio URL — mp3, m4a, archive.org, Dropbox, or CDN links.
            </p>
          </div>
          <AudioLibraryManager />
        </TabsContent>

        {/* Learning Library Tab */}
        <TabsContent value="learning" className="space-y-4">
          <LearningAdminManager />
        </TabsContent>

        {/* Ad Manager Tab */}
        <TabsContent value="ad-manager" className="space-y-4">
          <AdManagerTab />
        </TabsContent>

        {/* Video Playlists Tab */}
        <TabsContent value="video-playlists" className="space-y-4">
          <VideoPlaylistsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
