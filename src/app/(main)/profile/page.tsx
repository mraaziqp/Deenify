"use client";

import React, { useState, useEffect } from 'react';
import { CircleUser, Target, Clock, Award, BookOpen, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  // TEMP MOCK STATE for local build/test
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({
    name: 'John Doe',
    madhab: 'Hanafi',
    level: 'practicing',
  });
  const [streakData] = useState({
    currentStreak: 5,
    longestStreak: 12,
    totalDaysActive: 30,
  });
  const [weeklyActivity] = useState([
    { day: 'Mon', count: 3, active: true },
    { day: 'Tue', count: 2, active: true },
    { day: 'Wed', count: 0, active: false },
    { day: 'Thu', count: 1, active: true },
    { day: 'Fri', count: 4, active: true },
    { day: 'Sat', count: 0, active: false },
    { day: 'Sun', count: 2, active: true },
  ]);
  const [achievements] = useState([
    { id: 1, icon: '🏆', title: 'Starter', description: 'Joined Deenify', unlocked: true },
    { id: 2, icon: '🔥', title: 'Streaker', description: '5-day streak', unlocked: false },
    { id: 3, icon: '📚', title: 'Learner', description: 'Completed a course', unlocked: true },
  ]);
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

      {/* The rest of the profile page content (Cards, Stats, Activity, Achievements, Admin Panel, etc.) should follow here, all inside this parent <div> */}
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
      </div>
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
  );
}
