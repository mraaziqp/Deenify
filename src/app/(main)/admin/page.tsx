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
import { redirect } from 'next/navigation';

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
  const { user, hasRole } = useAuth();
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect if not admin
  useEffect(() => {
    if (!user || !(hasRole && hasRole())) {
      redirect('/dashboard');
    }
  }, [user, hasRole]);

  // Fetch admin data
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        // TODO: Replace with real API calls
        // const response = await fetch('/api/admin/stats');
        // const data = await response.json();
        
        // Mock data for now
        setStats({
          totalUsers: 2547,
          totalCourses: 156,
          activeCourses: 142,
          pendingVerification: 8,
          totalRevenue: 45230.50,
          monthlyRevenue: 8420.00,
          totalEnrollments: 12456,
          activeTeachers: 34,
          activeVerifiers: 5,
        });

        setActivities([
          {
            id: '1',
            type: 'course_submitted',
            description: 'New course "Advanced Tajweed" submitted',
            timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
            userId: 'teacher-1',
            userName: 'Sheikh Ahmed',
          },
          {
            id: '2',
            type: 'course_approved',
            description: 'Course "Fiqh Essentials" approved',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            userId: 'verifier-1',
            userName: 'Dr. Fatima',
          },
          {
            id: '3',
            type: 'user_registered',
            description: 'New user registration',
            timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
            userId: 'user-123',
            userName: 'Ahmad Ibrahim',
          },
          {
            id: '4',
            type: 'enrollment',
            description: 'User enrolled in "Introduction to Islam"',
            timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
            userId: 'user-456',
            userName: 'Sarah Ahmed',
          },
          {
            id: '5',
            type: 'course_rejected',
            description: 'Course "Quick Fiqh" rejected - needs more sources',
            timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
            userId: 'verifier-2',
            userName: 'Sheikh Hassan',
          },
        ]);

        setIsLoading(false);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        setIsLoading(false);
      }
    };

    fetchAdminData();
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
    const date = new Date(timestamp);
    const now = new Date();
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
          <TabsTrigger value="quran-media">Quran Media</TabsTrigger>
          <TabsTrigger value="learning">Learning Library</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

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
        <TabsContent value="quran-media" className="space-y-4">
          <QuranMediaManager />
        </TabsContent>

        {/* Learning Library Tab */}
        <TabsContent value="learning" className="space-y-4">
          <LearningAdminManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
