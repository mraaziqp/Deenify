'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  User, 
  Shield, 
  Bell,
  Eye,
  Mail,
  Lock,
  Save,
  ShieldCheck,
  Database,
  Download,
  Trash2,
  RefreshCw
} from "lucide-react";
import { useAuth } from '@/lib/auth-context';
import toast from 'react-hot-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const { user } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [devRole, setDevRole] = useState('student');
  const isDev = process.env.NODE_ENV !== 'production';

  const [settings, setSettings] = useState({
    // Profile
    name: user?.name || '',
    email: user?.email || '',
    madhab: 'Hanafi',
    
    // Notifications
    emailNotifications: true,
    courseUpdates: true,
    dhikrReminders: true,
    prayerReminders: true,
    weeklyDigest: false,
    
    // Privacy
    profileVisibility: 'public' as 'public' | 'private',
    showProgress: true,
    showDhikrCount: true,
    
    // Appearance
    language: 'en',
    theme: 'system' as 'light' | 'dark' | 'system',
  });

  useEffect(() => {
    if (!isDev) return;
    const storedRole = localStorage.getItem('devRole');
    if (storedRole) {
      setDevRole(storedRole);
    }
  }, [isDev]);

  const handleDevRoleChange = (role: string) => {
    setDevRole(role);
    localStorage.setItem('devRole', role);
    window.dispatchEvent(new Event('devRoleChanged'));
    toast.success(`Role set to ${role}`, { duration: 2000 });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Save settings to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Settings saved successfully!', { duration: 3000 });
    } catch (error) {
      toast.error('Failed to save settings. Please try again.', { duration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportData = () => {
    const data = {
      settings,
      dhikrCount: localStorage.getItem('dhikrCount'),
      aiChatHistory: localStorage.getItem('aiChatHistory'),
      khatmJuzData: localStorage.getItem('khatmJuzData'),
      userProgress: localStorage.getItem('userProgress'),
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `deenify-data-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    toast.success('Data exported successfully!', { duration: 3000 });
  };

  const handleClearData = () => {
    localStorage.removeItem('dhikrCount');
    localStorage.removeItem('dhikrDate');
    localStorage.removeItem('aiChatHistory');
    localStorage.removeItem('khatmJuzData');
    localStorage.removeItem('userProgress');
    toast.success('All local data cleared!', { duration: 3000 });
  };

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account and preferences
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Role Badge */}
        {user && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Account Role</CardTitle>
                  <CardDescription>Your current permissions and access level</CardDescription>
                </div>
                <Badge variant="default" className="text-base px-4 py-2 capitalize">
                  <ShieldCheck className="h-4 w-4 mr-2" />
                  {user.role}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2">
                {user.role === 'student' && (
                  <p className="text-muted-foreground">
                    You can enroll in courses, track your progress, and participate in community features.
                  </p>
                )}
                {user.role === 'teacher' && (
                  <p className="text-muted-foreground">
                    You can create and submit courses for verification, and offer teaching services.
                  </p>
                )}
                {user.role === 'verifier' && (
                  <p className="text-muted-foreground">
                    You can review and approve/reject course submissions to ensure quality and authenticity.
                  </p>
                )}
                {user.role === 'admin' && (
                  <p className="text-muted-foreground">
                    You have full access to all features including user management and system configuration.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Settings
            </CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="madhab">Madhab (Optional)</Label>
              <Select
                value={settings.madhab}
                onValueChange={(value) => setSettings({ ...settings, madhab: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Hanafi">Hanafi</SelectItem>
                  <SelectItem value="Maliki">Maliki</SelectItem>
                  <SelectItem value="Shafi'i">Shafi'i</SelectItem>
                  <SelectItem value="Hanbali">Hanbali</SelectItem>
                  <SelectItem value="Other">Other/Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Daily Facts Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RefreshCw className="h-5 w-5" />
              Daily Facts
            </CardTitle>
            <CardDescription>Manage the facts shown on the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Add, edit, or replace the daily Islamic facts for learners.
            </div>
            <Button asChild variant="outline">
              <a href="/facts-admin">Manage Facts</a>
            </Button>
          </CardContent>
        </Card>

        {isDev && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Dev Tools
              </CardTitle>
              <CardDescription>Testing helpers for role-based access</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label htmlFor="dev-role">Impersonate Role</Label>
                <Select
                  value={devRole}
                  onValueChange={handleDevRoleChange}
                >
                  <SelectTrigger id="dev-role" className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="verifier">Verifier</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  This only affects local testing in this browser.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Choose what you want to be notified about</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive emails about your account</p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, emailNotifications: checked })
                }
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Course Updates</Label>
                <p className="text-sm text-muted-foreground">New lessons and course announcements</p>
              </div>
              <Switch
                checked={settings.courseUpdates}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, courseUpdates: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Dhikr Reminders</Label>
                <p className="text-sm text-muted-foreground">Daily reminders for Dhikr practice</p>
              </div>
              <Switch
                checked={settings.dhikrReminders}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, dhikrReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Prayer Reminders</Label>
                <p className="text-sm text-muted-foreground">Notifications for Salah times</p>
              </div>
              <Switch
                checked={settings.prayerReminders}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, prayerReminders: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Weekly Digest</Label>
                <p className="text-sm text-muted-foreground">Summary of your weekly progress</p>
              </div>
              <Switch
                checked={settings.weeklyDigest}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, weeklyDigest: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Privacy
            </CardTitle>
            <CardDescription>Control your profile visibility</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="visibility">Profile Visibility</Label>
              <Select
                value={settings.profileVisibility}
                onValueChange={(value: 'public' | 'private') => 
                  setSettings({ ...settings, profileVisibility: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">Public - Visible to all users</SelectItem>
                  <SelectItem value="private">Private - Only you can see</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Learning Progress</Label>
                <p className="text-sm text-muted-foreground">Display your course progress publicly</p>
              </div>
              <Switch
                checked={settings.showProgress}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, showProgress: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Dhikr Count</Label>
                <p className="text-sm text-muted-foreground">Display your Dhikr statistics</p>
              </div>
              <Switch
                checked={settings.showDhikrCount}
                onCheckedChange={(checked) => 
                  setSettings({ ...settings, showDhikrCount: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how Deenify looks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) => setSettings({ ...settings, language: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية (Arabic)</SelectItem>
                  <SelectItem value="ur">اردو (Urdu)</SelectItem>
                  <SelectItem value="id">Bahasa Indonesia</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  setSettings({ ...settings, theme: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Management
            </CardTitle>
            <CardDescription>Manage your stored data and preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Export Your Data</p>
                <p className="text-sm text-muted-foreground">
                  Download all your data including progress, settings, and history
                </p>
              </div>
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div>
                <p className="font-medium">Clear Local Data</p>
                <p className="text-sm text-muted-foreground">
                  Remove all locally stored data (Dhikr count, chat history, etc.)
                </p>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-orange-600 border-orange-200">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Clear
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear all local data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will remove your Dhikr count, chat history, Khatm claims, and other locally stored data. 
                      This action cannot be undone. Consider exporting your data first.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleClearData} className="bg-orange-600">
                      Clear Data
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>

        {/*     value={settings.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  setSettings({ ...settings, theme: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving} size="lg">
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>
    </div>
  );
}
