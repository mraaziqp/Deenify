'use client';
export const dynamic = "force-dynamic";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Lock, Sparkles } from 'lucide-react';

import { achievementsList, checkAchievements, getProgressPercentage, type Achievement, type UserProgress } from '@/lib/achievements';

export default function AchievementsPage() {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProgress() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/achievements/progress');
        if (!res.ok) throw new Error('Failed to fetch progress');
        const data = await res.json();
        if (!data.progress) throw new Error('No progress data');
        setProgress(data.progress);
        // Map DB fields to UserProgress type if needed
        // setAchievements(checkAchievements(data.progress));
        // For now, use checkAchievements with DB data
        setAchievements(checkAchievements(data.progress));
      } catch (err: any) {
        setError(err.message || 'Unknown error');
      } finally {
        setLoading(false);
      }
    }
    fetchProgress();
  }, []);

  if (loading) {
    return <div className="container mx-auto max-w-6xl">Loading...</div>;
  }
  if (error) {
    return <div className="container mx-auto max-w-6xl text-red-500">{error}</div>;
  }
  if (!progress) {
    return <div className="container mx-auto max-w-6xl">No progress data found.</div>;
  }

  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  const overallProgress = getProgressPercentage(progress);

  const categories = ['all', 'dhikr', 'quran', 'courses', 'khatm', 'general'];
  
  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory);

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="h-8 w-8 text-yellow-500" />
        <div>
          <h1 className="text-3xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">
            Track your progress and unlock new achievements
          </p>
        </div>
      </div>

      {/* Overall Progress */}
      <Card className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-600" />
            Overall Progress
          </CardTitle>
          <CardDescription>
            {unlockedAchievements} of {totalAchievements} achievements unlocked
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-semibold">Progress</span>
              <span className="text-primary font-bold">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {progress.dhikrCount}
              </div>
              <p className="text-sm text-muted-foreground">Today's Dhikr</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">
                {progress.dhikrStreak}
              </div>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {progress.khatmJuzCompleted}
              </div>
              <p className="text-sm text-muted-foreground">Juz Completed</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {progress.coursesCompleted}
              </div>
              <p className="text-sm text-muted-foreground">Courses Done</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Filter */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          {categories.map(cat => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedCategory}>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAchievements.map((achievement) => (
              <Card 
                key={achievement.id}
                className={`relative overflow-hidden transition-all hover:shadow-md ${
                  achievement.unlocked 
                    ? 'bg-gradient-to-br from-yellow-50 to-amber-50 border-yellow-200' 
                    : 'bg-gray-50 opacity-70'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-4xl ${achievement.unlocked ? '' : 'grayscale'}`}>
                        {achievement.unlocked ? achievement.icon : <Lock className="h-8 w-8 text-gray-400" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{achievement.title}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className="mt-1 text-xs capitalize"
                        >
                          {achievement.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">
                    {achievement.description}
                  </p>
                  {achievement.unlocked ? (
                    <Badge className="bg-green-500 text-white">
                      ✓ Unlocked
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-gray-400">
                      🔒 Locked
                    </Badge>
                  )}
                </CardContent>
                {achievement.unlocked && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400 transform rotate-45 translate-x-8 -translate-y-8">
                    <Trophy className="h-4 w-4 text-white absolute bottom-2 left-2" />
                  </div>
                )}
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Motivational Card */}
      <Card className="mt-6 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardHeader>
          <CardTitle>Keep Going!</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm">
            Every act of remembrance, every page of Quran, and every lesson completed
            brings you closer to Allah. These achievements are a way to celebrate your
            dedication to the path of knowledge and righteousness.
          </p>
          <p className="text-sm mt-2 italic text-muted-foreground">
            "And those who strive for Us - We will surely guide them to Our ways." — Quran 29:69
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
