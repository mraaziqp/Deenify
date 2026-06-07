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
  Settings,
  Search,
  ChevronLeft,
  ChevronRight,
  UserCog,
  Handshake,
  BarChart3
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useRouter } from 'next/navigation';
import PDFReader from '@/components/pdf/PDFReader';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

// ─── Inline Admin Sub-Components ────────────────────────────────────────────

function AdManagerTab() {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    businessName: '', imageUrl: '', targetUrl: '',
    description: '', monthlyRate: '', startsAt: '', expiresAt: '',
  });
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
    setForm({ businessName: '', imageUrl: '', targetUrl: '', description: '', monthlyRate: '', startsAt: '', expiresAt: '' });
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

  const getExpiryStatus = (expiresAt: string | null) => {
    if (!expiresAt) return null;
    const exp = new Date(expiresAt);
    const now = new Date();
    const daysLeft = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { label: 'Expired', color: 'destructive' as const };
    if (daysLeft <= 7) return { label: `Expires in ${daysLeft}d`, color: 'secondary' as const };
    return { label: `Exp: ${exp.toLocaleDateString()}`, color: 'outline' as const };
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1 sm:col-span-2">
              <Label>Description (optional)</Label>
              <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief ad copy shown on hover" />
            </div>
            <div className="space-y-1">
              <Label>Monthly Rate (R)</Label>
              <Input type="number" value={form.monthlyRate} onChange={e => setForm(f => ({ ...f, monthlyRate: e.target.value }))} placeholder="200" min="0" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Start Date (optional)</Label>
              <Input type="date" value={form.startsAt} onChange={e => setForm(f => ({ ...f, startsAt: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Expiry Date (optional)</Label>
              <Input type="date" value={form.expiresAt} onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))} />
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
          {banners.map(b => {
            const expiry = getExpiryStatus(b.expiresAt);
            return (
              <Card key={b.id} className="p-3">
                <div className="flex items-center gap-3 flex-wrap">
                  <img src={b.imageUrl} alt={b.businessName} className="w-20 h-10 object-cover rounded-lg flex-shrink-0" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-sm">{b.businessName}</p>
                      {b.monthlyRate && <Badge variant="outline" className="text-emerald-600 text-xs">R{b.monthlyRate}/mo</Badge>}
                      {expiry && <Badge variant={expiry.color} className="text-xs">{expiry.label}</Badge>}
                    </div>
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
            );
          })}
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
  usersByRole: { user: number; admin: number; scholar: number };
  recentSignups7d: number;
  recentSignups30d: number;
  totalGroups: number;
  totalBanners: number;
  activeBanners: number;
  totalDhikrCount: number;
  totalPartnerships: number;
  // kept for backward compat
  pendingVerification?: number;
}

interface AdminUser {
  id: string;
  email: string;
  username: string | null;
  displayName: string | null;
  role: string;
  createdAt: string;
  dhikrCount: number;
  currentStreak: number;
  totalDaysActive: number;
  emailVerified: boolean;
  _count: { groupMemberships: number; bookmarks: number };
}

interface Partnership {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  website: string | null;
  message: string;
  proposedRate: number | null;
  status: 'PENDING' | 'REVIEWING' | 'ACTIVE' | 'DECLINED';
  notes: string | null;
  createdAt: string;
}

interface RecentActivity {
  id: string;
  type: 'course_submitted' | 'course_approved' | 'course_rejected' | 'user_registered' | 'enrollment';
  description: string;
  timestamp: string;
  userId: string;
  userName: string;
}

// ─── Real User Management Tab ────────────────────────────────────────────────

function UserManagementTab() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const load = (p = page, search = q, role = roleFilter) => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(p), q: search, role });
    fetch(`/api/admin/users?${params}`)
      .then(r => r.json())
      .then(d => {
        setUsers(d.users ?? []);
        setTotal(d.total ?? 0);
        setPages(d.pages ?? 1);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(1, '', ''); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load(1, q, roleFilter);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    await fetch(`/api/admin/users?id=${userId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: newRole }),
    });
    setUpdatingId(null);
    load(page, q, roleFilter);
  };

  const roleBadgeColor = (role: string) => {
    if (role === 'ADMIN') return 'bg-red-100 text-red-700';
    if (role === 'SCHOLAR') return 'bg-purple-100 text-purple-700';
    return 'bg-gray-100 text-gray-700';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCog className="h-5 w-5" /> User Management
        </CardTitle>
        <CardDescription>{total.toLocaleString()} total users registered</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email or username…"
              className="pl-9"
              value={q}
              onChange={e => setQ(e.target.value)}
            />
          </div>
          <Select value={roleFilter || 'all'} onValueChange={v => { setRoleFilter(v === 'all' ? '' : v); setPage(1); load(1, q, v === 'all' ? '' : v); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              <SelectItem value="USER">Users</SelectItem>
              <SelectItem value="SCHOLAR">Scholars</SelectItem>
              <SelectItem value="ADMIN">Admins</SelectItem>
            </SelectContent>
          </Select>
          <Button type="submit" variant="secondary">Search</Button>
        </form>

        {loading ? (
          <p className="text-muted-foreground text-sm py-4 text-center">Loading users…</p>
        ) : users.length === 0 ? (
          <p className="text-muted-foreground text-sm py-4 text-center">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-3 font-medium">User</th>
                  <th className="pb-2 pr-3 font-medium">Role</th>
                  <th className="pb-2 pr-3 font-medium hidden sm:table-cell">Dhikr</th>
                  <th className="pb-2 pr-3 font-medium hidden sm:table-cell">Streak</th>
                  <th className="pb-2 pr-3 font-medium hidden md:table-cell">Days Active</th>
                  <th className="pb-2 pr-3 font-medium hidden md:table-cell">Groups</th>
                  <th className="pb-2 font-medium">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-muted/30">
                    <td className="py-2 pr-3">
                      <div className="font-medium truncate max-w-[160px]">{u.displayName ?? u.username ?? u.email.split('@')[0]}</div>
                      <div className="text-xs text-muted-foreground truncate max-w-[160px]">{u.email}</div>
                      {!u.emailVerified && <span className="text-xs text-amber-600">unverified</span>}
                    </td>
                    <td className="py-2 pr-3">
                      <Select
                        value={u.role}
                        onValueChange={v => handleRoleChange(u.id, v)}
                        disabled={updatingId === u.id}
                      >
                        <SelectTrigger className="h-7 text-xs w-28">
                          <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${roleBadgeColor(u.role)}`}>{u.role}</span>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USER">USER</SelectItem>
                          <SelectItem value="SCHOLAR">SCHOLAR</SelectItem>
                          <SelectItem value="ADMIN">ADMIN</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 pr-3 hidden sm:table-cell text-muted-foreground">{u.dhikrCount.toLocaleString()}</td>
                    <td className="py-2 pr-3 hidden sm:table-cell text-muted-foreground">{u.currentStreak}d</td>
                    <td className="py-2 pr-3 hidden md:table-cell text-muted-foreground">{u.totalDaysActive}</td>
                    <td className="py-2 pr-3 hidden md:table-cell text-muted-foreground">{u._count.groupMemberships}</td>
                    <td className="py-2 text-muted-foreground text-xs whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-muted-foreground">Page {page} of {pages}</p>
            <div className="flex gap-1">
              <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => { setPage(p => p - 1); load(page - 1, q, roleFilter); }}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" disabled={page >= pages} onClick={() => { setPage(p => p + 1); load(page + 1, q, roleFilter); }}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Partnerships Tab ────────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  REVIEWING: 'bg-blue-100 text-blue-700',
  ACTIVE: 'bg-green-100 text-green-700',
  DECLINED: 'bg-red-100 text-red-700',
};

function PartnershipsTab() {
  const [partnerships, setPartnerships] = useState<Partnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ companyName: '', contactName: '', email: '', phone: '', website: '', message: '', proposedRate: '' });
  const [saving, setSaving] = useState(false);

  const load = (status = statusFilter) => {
    setLoading(true);
    fetch(`/api/admin/partnerships${status ? `?status=${status}` : ''}`)
      .then(r => r.json())
      .then(d => setPartnerships(d.partnerships ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/admin/partnerships?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes: notes[id] }),
    });
    load(statusFilter);
  };

  const saveNotes = async (id: string) => {
    await fetch(`/api/admin/partnerships?id=${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes: notes[id] }),
    });
    load(statusFilter);
  };

  const handleAddPartnership = async () => {
    if (!form.companyName || !form.contactName || !form.email || !form.message) return;
    setSaving(true);
    await fetch('/api/admin/partnerships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    setForm({ companyName: '', contactName: '', email: '', phone: '', website: '', message: '', proposedRate: '' });
    setShowForm(false);
    setSaving(false);
    load(statusFilter);
  };

  const activeCount = partnerships.filter(p => p.status === 'ACTIVE').length;
  const pendingCount = partnerships.filter(p => p.status === 'PENDING').length;

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: partnerships.length },
          { label: 'Pending', value: pendingCount },
          { label: 'Active Partners', value: activeCount },
          { label: 'Declined', value: partnerships.filter(p => p.status === 'DECLINED').length },
        ].map(s => (
          <Card key={s.label} className="p-3">
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-xl font-bold">{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Select value={statusFilter || 'all'} onValueChange={v => { const s = v === 'all' ? '' : v; setStatusFilter(s); load(s); }}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="REVIEWING">Reviewing</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DECLINED">Declined</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button size="sm" onClick={() => setShowForm(v => !v)}>
          <Handshake className="h-4 w-4 mr-1" />
          {showForm ? 'Cancel' : 'Add Partnership'}
        </Button>
      </div>

      {/* Add form */}
      {showForm && (
        <Card className="border-dashed border-primary/40 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">New Partnership Inquiry</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input placeholder="Company Name *" value={form.companyName} onChange={e => setForm(p => ({ ...p, companyName: e.target.value }))} />
              <Input placeholder="Contact Name *" value={form.contactName} onChange={e => setForm(p => ({ ...p, contactName: e.target.value }))} />
              <Input placeholder="Email *" type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              <Input placeholder="Phone" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
              <Input placeholder="Website" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
              <Input placeholder="Proposed Rate (ZAR/month)" type="number" value={form.proposedRate} onChange={e => setForm(p => ({ ...p, proposedRate: e.target.value }))} />
            </div>
            <Textarea placeholder="Message / Partnership Details *" rows={3} value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))} />
            <Button onClick={handleAddPartnership} disabled={saving} className="w-full">
              {saving ? 'Saving…' : 'Save Partnership'}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* List */}
      {loading ? (
        <p className="text-muted-foreground text-sm py-4 text-center">Loading partnerships…</p>
      ) : partnerships.length === 0 ? (
        <p className="text-muted-foreground text-sm py-4 text-center">No partnerships found. Add your first one above.</p>
      ) : (
        <div className="space-y-3">
          {partnerships.map(p => (
            <Card key={p.id} className="overflow-hidden">
              <div
                className="flex items-start justify-between gap-3 p-4 cursor-pointer hover:bg-muted/30"
                onClick={() => {
                  setExpanded(e => e === p.id ? null : p.id);
                  if (!notes[p.id]) setNotes(n => ({ ...n, [p.id]: p.notes ?? '' }));
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold">{p.companyName}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                    {p.proposedRate && <span className="text-xs text-muted-foreground">R{p.proposedRate}/mo</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">{p.contactName} · {p.email}</div>
                  {p.phone && <div className="text-xs text-muted-foreground">{p.phone}</div>}
                </div>
                <div className="text-xs text-muted-foreground shrink-0">{new Date(p.createdAt).toLocaleDateString()}</div>
              </div>
              {expanded === p.id && (
                <div className="border-t p-4 space-y-3 bg-muted/20">
                  <p className="text-sm">{p.message}</p>
                  {p.website && <a href={p.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">{p.website}</a>}
                  <div className="flex gap-2 flex-wrap">
                    {['PENDING', 'REVIEWING', 'ACTIVE', 'DECLINED'].map(s => (
                      <Button
                        key={s}
                        size="sm"
                        variant={p.status === s ? 'default' : 'outline'}
                        onClick={() => updateStatus(p.id, s)}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Internal Notes</p>
                    <Textarea
                      rows={2}
                      placeholder="Add internal notes…"
                      value={notes[p.id] ?? ''}
                      onChange={e => setNotes(n => ({ ...n, [p.id]: e.target.value }))}
                    />
                    <Button size="sm" variant="secondary" onClick={() => saveNotes(p.id)}>Save Notes</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
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

  // Fetch admin stats from real API
  useEffect(() => {
    if (!user || !hasRole('admin')) return;
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => setStats(d))
      .catch(() => {});
  }, [user, hasRole]);

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

      {/* ── Quick Access Navigation ─────────────────────────────────── */}
      <div className="space-y-4">
        {/* Admin Tools */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">⚙️ Admin Tools</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {[
              { href: '/admin', label: 'Admin Dashboard', icon: '🛡️' },
              { href: '/admin/madresah', label: 'Madresah Schools', icon: '🏫' },
              { href: '/admin/media', label: 'Media Upload', icon: '📁' },
              { href: '/admin/content', label: 'Content Upload', icon: '📚' },
              { href: '/facts-admin', label: 'Daily Facts', icon: '💡' },
              { href: '/verifier', label: 'Verifier Dashboard', icon: '🛡️' },
              { href: '/teacher', label: 'Teacher Portal', icon: '🎓' },
              { href: '/scholar/dashboard', label: 'Scholar Q&A', icon: '📖' },
            ].map(({ href, label, icon }) => (
              <a key={href} href={href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-white hover:bg-emerald-50 hover:border-emerald-300 transition-all text-center shadow-sm">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-medium text-gray-700 leading-tight">{label}</span>
              </a>
            ))}
          </div>
        </div>

        {/* Main App Pages */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">📱 App Pages</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {[
              { href: '/dashboard', label: 'Dashboard', icon: '🏠' },
              { href: '/quran', label: 'Quran Reader', icon: '📖' },
              { href: '/yaseen', label: 'Surah Yaaseen', icon: '📜' },
              { href: '/hisnul-muslim', label: 'Hisnul Muslim', icon: '🤲' },
              { href: '/dhikr', label: 'Dhikr Counter', icon: '📿' },
              { href: '/awrad', label: 'Awrad & Mawlid', icon: '🌙' },
              { href: '/library', label: 'Learning Library', icon: '📚' },
              { href: '/madresah', label: 'Madresah Portal', icon: '🏫' },
              { href: '/groups', label: 'Groups', icon: '👥' },
              { href: '/khatm', label: 'Quran Khatm', icon: '📗' },
              { href: '/radio', label: 'Muslim Radio', icon: '📻' },
              { href: '/halal-food', label: 'Halal Food', icon: '🥗' },
              { href: '/halal-screener', label: 'Halal Screener', icon: '🔍' },
              { href: '/ai-assistant', label: 'AI Assistant', icon: '🤖' },
              { href: '/zakat', label: 'Zakat Calculator', icon: '💰' },
              { href: '/qiblah', label: 'Qibla Compass', icon: '🧭' },
              { href: '/ramadan', label: 'Ramadan Tracker', icon: '🌙' },
              { href: '/qna', label: 'Scholar Q&A', icon: '❓' },
              { href: '/news', label: 'Islamic News', icon: '📰' },
              { href: '/achievements', label: 'Achievements', icon: '🏆' },
              { href: '/profile', label: 'Profile', icon: '👤' },
              { href: '/settings', label: 'Settings', icon: '⚙️' },
              { href: '/ccemag', label: 'CCE Mag', icon: '📰' },
              { href: '/collab', label: 'Collab', icon: '🤝' },
              { href: '/wasiya', label: 'Wasiya', icon: '📝' },
              { href: '/learn', label: 'Video Library', icon: '🎬' },
              { href: '/masjid', label: 'Masjid Finder', icon: '🕌' },
              { href: '/taraweeh', label: 'Taraweeh', icon: '🌙' },
              { href: '/welcome', label: 'Welcome Page', icon: '👋' },
            ].map(({ href, label, icon }) => (
              <a key={href} href={href}
                className="flex flex-col items-center gap-1.5 p-3 rounded-xl border bg-white hover:bg-blue-50 hover:border-blue-300 transition-all text-center shadow-sm">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-medium text-gray-700 leading-tight">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalUsers.toLocaleString() : '—'}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.recentSignups7d ?? '—'} this week · +{stats?.recentSignups30d ?? '—'} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Ads</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.activeBanners : '—'}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.totalBanners ?? '—'} total · {stats?.totalPartnerships ?? '—'} partnerships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Groups</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalGroups.toLocaleString() : '—'}</div>
            <p className="text-xs text-muted-foreground">Active jamaah groups</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dhikr</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats ? stats.totalDhikrCount.toLocaleString() : '—'}</div>
            <p className="text-xs text-muted-foreground">
              Across all users
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <div className="overflow-x-auto pb-1">
          <TabsList className="flex w-max min-w-full flex-wrap gap-1 h-auto p-1">
            <TabsTrigger value="activity">Recent Activity</TabsTrigger>
            <TabsTrigger value="alerts">System Alerts</TabsTrigger>
            <TabsTrigger value="users">👥 User Management</TabsTrigger>
            <TabsTrigger value="partnerships">🤝 Partnerships</TabsTrigger>
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
            <TabsTrigger value="madresah" asChild>
              <a href="/admin/madresah">🏫 Madresah Schools</a>
            </TabsTrigger>
          </TabsList>
        </div>
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
          <UserManagementTab />
        </TabsContent>

        {/* Partnerships Tab */}
        <TabsContent value="partnerships" className="space-y-4">
          <PartnershipsTab />
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
