'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Lock,
  CircleDollarSign,
  BookOpen,
  Sparkles,
  Award,
  Target,
  Clock,
  Heart,
  BookMarked,
  Apple,
  Lightbulb,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import { DailyHadithCard } from '@/components/daily-hadith-card';
import { PrayerTimesCard } from '@/components/prayer-times-card';
// TODO: Implement DB-based progress management

type DashboardStats = {
  currentStreak: number;
  totalDaysActive: number;
  coursesCompleted: number;
  totalCourses: number;
  dhikrCount: number;
};

type ActivityItem = {
  id: string;
  message: string;
  type: 'lesson' | 'course';
  timestamp: string;
};

const features = [
  {
    id: 'zakat',
    title: 'Zakat Calculator',
    description: 'Calculate your Zakat on various assets.',
    icon: CircleDollarSign,
    requiredMilestone: 'islamic_finance_intro',
    href: '/zakat',
  },
  {
    id: 'halal_food',
    title: 'Halal Food Guide',
    description: 'Learn about permissible and forbidden foods.',
    icon: Apple,
    requiredMilestone: 'quran_intro',
    href: '/halal-food',
  },
  {
    id: 'quran_page',
    title: 'Quran & Recitations',
    description: 'Read and listen to the Quran with renowned reciters.',
    icon: BookOpen,
    requiredMilestone: 'quran_intro',
    href: '/quran',
  },
];

const selectDailyFact = (facts: string[], dateKey: string) => {
  if (!facts.length) return '';
  let hash = 0;
  for (const char of dateKey) {
    hash = (hash * 31 + char.charCodeAt(0)) % facts.length;
  }
  return facts[hash];
};

export default function DashboardPage() {
  const [dailyFact, setDailyFact] = useState("Loading today's fact...");
  const [stats, setStats] = useState<DashboardStats>({
    currentStreak: 0,
    totalDaysActive: 0,
    coursesCompleted: 0,
    totalCourses: 0,
    dhikrCount: 0,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const initStats = async () => {
      // TODO: Fetch progress from API
      const progress = {} as any;
      const today = new Date();
      const todayString = today.toDateString();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const yesterdayString = yesterday.toDateString();

      let appStreak = Number(localStorage.getItem('appStreak') || '0');

      if (progress.lastActiveDate !== todayString) {
        progress.daysActive = (progress.daysActive || 0) + 1;
        appStreak = progress.lastActiveDate === yesterdayString ? appStreak + 1 : 1;
        progress.lastActiveDate = todayString;
        saveProgress(progress);
        localStorage.setItem('appStreak', appStreak.toString());
      } else if (progress.daysActive === 0) {
        progress.daysActive = 1;
        appStreak = Math.max(appStreak, 1);
        // TODO: Update progress via API
        localStorage.setItem('appStreak', appStreak.toString());
      }

      const dhikrCount = Number(localStorage.getItem('dhikrCount') || progress.dhikrCount || 0);

      setStats((prev) => ({
        ...prev,
        currentStreak: appStreak,
        totalDaysActive: progress.daysActive || 0,
        dhikrCount,
      }));

      // Fetch course stats
    };
    initStats();
  }, []);

  // Redirect unauthenticated users
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/sign-in');
    }
  }, [user, isLoading, router]);

      try {
        const response = await fetch('/api/library');
        if (!response.ok) return;
        const data = await response.json();
        const allCourses = [...(data.freeCourses || []), ...(data.specializedCourses || [])];

        const completedCourses = JSON.parse(localStorage.getItem('completed_courses') || '[]');
        let completedCount = Array.isArray(completedCourses) ? completedCourses.length : 0;

        if (!completedCount) {
          const enrolled = JSON.parse(localStorage.getItem('enrolled_courses') || '[]');
          completedCount = enrolled.filter((courseId: string) => {
            const course = allCourses.find((item: any) => item.id === courseId);
            if (!course || !course.lessons) return false;
            const progressData = JSON.parse(localStorage.getItem(`course_${courseId}`) || '{}');
            const completedLessons = Object.values(progressData).filter(Boolean).length;
            return completedLessons >= course.lessons;
          }).length;
        }

        progress.coursesCompleted = completedCount;
        saveProgress(progress);

        setStats((prev) => ({
          ...prev,
          coursesCompleted: completedCount,
          totalCourses: allCourses.length,
        }));
      } catch (error) {
        console.error('Failed to load course stats:', error);
      }
    };

    const loadActivity = () => {
      const stored = JSON.parse(localStorage.getItem('activityLog') || '[]');
      setActivity(Array.isArray(stored) ? stored.slice(0, 6) : []);
    };

    const loadDailyFact = async () => {
      try {
        const useCustomFacts = localStorage.getItem('useCustomFacts') === 'true';
        const customFacts = JSON.parse(localStorage.getItem('customFacts') || '[]');

        let facts: string[] = [];
        if (useCustomFacts && Array.isArray(customFacts) && customFacts.length > 0) {
          facts = customFacts;
        } else {
          const response = await fetch('/api/facts');
          if (response.ok) {
            const data = await response.json();
            facts = data.facts || [];
          }
        }

        const dateKey = new Date().toISOString().slice(0, 10);
        const fact = selectDailyFact(facts, dateKey) || 'Keep learning something beneficial every day.';
        setDailyFact(fact);
      } catch (error) {
        console.error('Failed to load daily fact:', error);
        setDailyFact('Keep learning something beneficial every day.');
      }
    };

    const refreshAll = () => {
      void initStats();
      void loadDailyFact();
      loadActivity();
    };

    refreshAll();
    window.addEventListener('progressUpdated', refreshAll);

    return () => {
      window.removeEventListener('progressUpdated', refreshAll);
    };
  }, []);

  const isFeatureUnlocked = (_milestone: string) => true;
  const progressPercentage = stats.totalCourses
    ? Math.round((stats.coursesCompleted / stats.totalCourses) * 100)
    : 0;

  return (
    <div className="container mx-auto p-4 sm:p-0">
      <div className="space-y-6">
        <Card className="shadow-lg border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-3xl font-bold text-primary flex items-center gap-2">
                  <Sparkles className="h-8 w-8" />
                  As-salamu alaykum!
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                  Your journey of knowledge and spiritual growth continues
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-base px-4 py-2">
                <Heart className="h-4 w-4 mr-1 fill-red-500 text-red-500" />
                Level {Math.floor(stats.totalDaysActive / 30) + 1}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                <div className="p-2 bg-accent/10 rounded-full">
                  <BookMarked className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.coursesCompleted}/{stats.totalCourses}</p>
                  <p className="text-sm text-muted-foreground">Courses Done</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                <div className="p-2 bg-secondary rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.totalDaysActive}</p>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Compass className="h-5 w-5 text-primary" />
                Qiblah Compass
              </CardTitle>
              <CardDescription>Find the Qiblah direction quickly</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/qiblah">Open Qiblah Compass</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Learning Library
              </CardTitle>
              <CardDescription>Explore PDFs, books, and ask questions</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/learning">Open Learning Library</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Islamic Fact of the Day
              </CardTitle>
              <CardDescription>Small, steady learning every day</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{dailyFact}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Your Learning Journey
              </CardTitle>
              <span className="text-2xl font-bold text-primary">{progressPercentage}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3 mb-4" />
            <p className="text-sm text-muted-foreground">
              Keep going! Complete your next course to unlock advanced features.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <DailyHadithCard />
          <PrayerTimesCard />
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning updates</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet. Complete a lesson to get started.</p>
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{item.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Islamic Tools & Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const unlocked = isFeatureUnlocked(feature.requiredMilestone);
              const FeatureIcon = feature.icon;
              return (
                <Card
                  key={feature.id}
                  className={`transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    !unlocked ? 'bg-muted/50 opacity-75' : 'border-primary/20'
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                          <FeatureIcon className={`h-6 w-6 ${unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="text-base">{feature.title}</span>
                      </span>
                      {!unlocked && (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Locked
                        </Badge>
                      )}
                      {unlocked && (
                        <Badge variant="default" className="gap-1">
                          Active
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {unlocked ? (
                      <Button asChild className="w-full">
                        <Link href={feature.href}>Access Tool</Link>
                      </Button>
                    ) : (
                      <div className="text-sm space-y-2">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-semibold text-foreground">How to unlock:</p>
                          <p className="text-muted-foreground mt-1">
                            Complete the required learning milestone.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
