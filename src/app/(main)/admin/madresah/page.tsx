'use client';
export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  School, Search, Trash2, UserPlus, Eye, Shield,
  Loader2, Users, BookOpen, ChevronLeft, AlertCircle, CheckCircle, X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';

function dname(u: any) {
  return u?.displayName || u?.username || u?.email?.split('@')[0] || 'User';
}

export default function AdminMadresahPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [madresahs, setMadresahs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Force-add member dialog
  const [addOpen, setAddOpen] = useState(false);
  const [addTarget, setAddTarget] = useState<any>(null);
  const [addEmail, setAddEmail] = useState('');
  const [addRole, setAddRole] = useState('STUDENT');
  const [adding, setAdding] = useState(false);

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchSchools = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page) });
      if (search) params.set('q', search);
      const res = await fetch(`/api/admin/madresah?${params}`);
      if (!res.ok) { router.push('/dashboard'); return; }
      const data = await res.json();
      setMadresahs(data.madresahs);
      setTotal(data.total);
    } catch {
      toast.error('Failed to load schools');
    } finally {
      setLoading(false);
    }
  }, [page, search, router]);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== 'ADMIN') {
      router.replace('/dashboard');
      return;
    }
    fetchSchools();
  }, [user, isLoading, fetchSchools, router]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/madresah?id=${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success(`"${deleteTarget.name}" deleted`);
        setDeleteTarget(null);
        fetchSchools();
      } else {
        toast.error('Delete failed');
      }
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const handleAddMember = async () => {
    if (!addTarget || !addEmail.trim()) return;
    setAdding(true);
    try {
      const res = await fetch('/api/admin/madresah', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ madresahId: addTarget.id, userEmail: addEmail.trim(), role: addRole }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Member added to "${addTarget.name}"`);
        setAddOpen(false);
        setAddEmail('');
        setAddRole('STUDENT');
      } else {
        toast.error(data.error || 'Failed to add member');
      }
    } catch {
      toast.error('Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  if (isLoading || (loading && madresahs.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin"><ChevronLeft className="h-5 w-5" /></Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-rose-500" />
            <h1 className="text-2xl font-bold">Madresah Admin Panel</h1>
            <Badge className="bg-rose-100 text-rose-700 border-rose-200">Admin Only</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {total} school{total !== 1 ? 's' : ''} registered · manage, view, and troubleshoot any school
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search schools by name…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Schools', value: total, icon: School },
          { label: 'Showing', value: madresahs.length, icon: Eye },
          { label: 'Total Members', value: madresahs.reduce((s, m) => s + (m._count?.members ?? 0), 0), icon: Users },
          { label: 'Total Classes', value: madresahs.reduce((s, m) => s + (m._count?.classes ?? 0), 0), icon: BookOpen },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="p-3">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className="text-2xl font-bold mt-1">{s.value}</p>
            </Card>
          );
        })}
      </div>

      {/* School list */}
      {loading ? (
        <div className="text-center py-10 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
          Loading schools…
        </div>
      ) : madresahs.length === 0 ? (
        <Card className="p-12 text-center">
          <School className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">{search ? 'No schools match your search.' : 'No schools registered yet.'}</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {madresahs.map((school) => (
            <Card key={school.id} className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <School className="h-4 w-4 text-blue-600 flex-shrink-0" />
                    <span className="font-semibold truncate">{school.name}</span>
                    <Badge variant="outline" className="font-mono text-xs">{school.inviteCode}</Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span>Admin: {dname(school.admin)}</span>
                    <span>·</span>
                    <span>{school._count?.members ?? 0} members</span>
                    <span>·</span>
                    <span>{school._count?.classes ?? 0} classes</span>
                    {school.address && <><span>·</span><span>{school.address}</span></>}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Created {new Date(school.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={`/madresah/${school.id}?adminOverride=1`}>
                      <Eye className="h-3.5 w-3.5 mr-1" />
                      View
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => { setAddTarget(school); setAddOpen(true); }}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Add User
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-rose-600 hover:bg-rose-50 border-rose-200"
                    onClick={() => setDeleteTarget(school)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>
            Next
          </Button>
        </div>
      )}

      {/* Force-add member dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add User to &ldquo;{addTarget?.name}&rdquo;</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>User Email</Label>
              <Input
                className="mt-1"
                placeholder="user@example.com"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
              />
            </div>
            <div>
              <Label>Role</Label>
              <div className="flex gap-2 mt-1 flex-wrap">
                {['STUDENT', 'TEACHER', 'PARENT', 'PRINCIPAL'].map((r) => (
                  <button
                    key={r}
                    onClick={() => setAddRole(r)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                      addRole === r
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 text-gray-700 hover:border-blue-400'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button onClick={handleAddMember} disabled={adding || !addEmail.trim()}>
              {adding ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <UserPlus className="h-4 w-4 mr-1" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-rose-700">
              <Trash2 className="h-5 w-5" />
              Delete School
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-rose-50 rounded-lg border border-rose-200">
              <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-rose-800">This is irreversible!</p>
                <p className="text-xs text-rose-600 mt-0.5">
                  Deleting <strong>{deleteTarget?.name}</strong> will permanently remove all its classes, students,
                  homework, hifz records, and attendance data.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Are you sure you want to proceed?</p>
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Trash2 className="h-4 w-4 mr-1" />}
              Yes, Delete Permanently
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
