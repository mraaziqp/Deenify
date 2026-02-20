"use client";
import React, { useState, useEffect } from 'react';
export const dynamic = "force-dynamic";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  CircleUser, 
  Calendar, 
  Award, 
  Target, 
  TrendingUp,
  BookOpen,
  Heart,
  Clock,
  Edit2,
  Save
} from "lucide-react";
import { useAuth } from '@/lib/auth-context';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: user?.name || user?.email?.split('@')[0] || '',
    joinedDate: user?.createdAt ? new Date(user.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) : '',
    madhab: user?.madhab || '',
    level: user?.level || '',
  });

  // Update profile state when user changes
  React.useEffect(() => {
    setProfile({
      name: user?.name || user?.email?.split('@')[0] || '',
      joinedDate: user?.createdAt ? new Date(user.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' }) : '',
      madhab: user?.madhab || '',
      level: user?.level || '',
    });
  }, [user]);

  // Mock streak data
  const streakData = {
    currentStreak: 7,
    longestStreak: 42,
    totalDaysActive: 145,
    lastActive: "Today",
  };

  // Mock achievement data
  const achievements = [
    { id: 1, title: "First Steps", description: "Completed first course", icon: "🎯", unlocked: true },
    { id: 2, title: "Consistent Learner", description: "7-day streak", icon: "🔥", unlocked: true },
    { id: 3, title: "Dhikr Master", description: "1000+ Dhikr count", icon: "💎", unlocked: true },
    { id: 4, title: "Dedicated Student", description: "30-day streak", icon: "⭐", unlocked: false },
    { id: 5, title: "Course Champion", description: "Complete 5 courses", icon: "👑", unlocked: false },
    { id: 6, title: "Community Builder", description: "Join 5 Khatm circles", icon: "🤝", unlocked: false },
  ];

  // Mock weekly activity (7 days)
  const weeklyActivity = [
    { day: "Mon", active: true, count: 45 },
    { day: "Tue", active: true, count: 32 },
    { day: "Wed", active: true, count: 58 },
    { day: "Thu", active: true, count: 41 },
    { day: "Fri", active: true, count: 67 },
    { day: "Sat", active: true, count: 39 },
    { day: "Sun", active: true, count: 52 },
  ];

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <CircleUser className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Your Profile</h1>
          <p className="text-muted-foreground">
            Track your progress and manage your learning journey
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          {/* Profile Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Profile Details</CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? <Save className="h-4 w-4" /> : <Edit2 className="h-4 w-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-center mb-4">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold">
                  {profile.name.charAt(0)}
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="name" className="text-sm text-muted-foreground">Name</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-semibold">{profile.name}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Member Since</Label>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {profile.joinedDate}
                  </p>
                </div>

                <div>
                  <Label htmlFor="madhab" className="text-sm text-muted-foreground">Madhab</Label>
                  {isEditing ? (
                    <Input
                      id="madhab"
                      value={profile.madhab}
                      onChange={(e) => setProfile({ ...profile, madhab: e.target.value })}
                      className="mt-1"
                    />
                  ) : (
                    <p className="font-semibold">{profile.madhab}</p>
                  )}
                </div>

                <div>
                  <Label className="text-sm text-muted-foreground">Learning Level</Label>
                  <Badge variant="secondary" className="mt-1">
                    {profile.level}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Stats */}
          <Card className="shadow-lg border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Streak Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Current Streak</p>
                  <p className="text-3xl font-bold text-primary">{streakData.currentStreak}</p>
                </div>
                <span className="text-4xl">🔥</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Longest</p>
                  <p className="text-xl font-bold">{streakData.longestStreak}</p>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <p className="text-xs text-muted-foreground">Total Days</p>
                  <p className="text-xl font-bold">{streakData.totalDaysActive}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Activity & Achievements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Weekly Activity */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                This Week's Activity
              </CardTitle>
              <CardDescription>Your daily learning engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-2">
                {weeklyActivity.map((day, index) => (
                  <div key={index} className="flex flex-col items-center gap-2">
                    <div
                      className={`w-full h-24 rounded-lg transition-all ${
                        day.active 
                          ? 'bg-primary hover:bg-primary/80' 
                          : 'bg-muted'
                      }`}
                      style={{ height: `${Math.max(day.count / 1.5, 20)}px` }}
                      title={`${day.count} activities`}
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {day.day}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-primary" />
                  Active
                </span>
                <span className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-muted" />
                  Inactive
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Learning Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">12</p>
                    <p className="text-sm text-muted-foreground">Courses Started</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-accent/10 rounded-lg">
                    <Award className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">3</p>
                    <p className="text-sm text-muted-foreground">Achievements</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Heart className="h-6 w-6 text-red-500" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">1.2K</p>
                    <p className="text-sm text-muted-foreground">Total Dhikr</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Achievements
              </CardTitle>
              <CardDescription>Unlock badges as you progress</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.unlocked
                        ? 'border-primary bg-primary/5 hover:shadow-md'
                        : 'border-muted bg-muted/30 opacity-60'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <h3 className="font-semibold text-sm mb-1">{achievement.title}</h3>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                      {achievement.unlocked && (
                        <Badge variant="default" className="mt-2 text-xs">
                          Unlocked
                        </Badge>
                      )}
                    </div>
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
