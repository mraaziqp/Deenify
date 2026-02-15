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
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Mock user progress for the "Slow-Drip" feature
const userProgress = {
  completedMilestones: ['welcome', 'salah_basics'],
  currentStreak: 7,
  totalDaysActive: 42,
  coursesCompleted: 2,
  totalCourses: 12,
  dhikrCount: 1250,
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

export default function DashboardPage() {
  const isFeatureUnlocked = (milestone: string) =>
    userProgress.completedMilestones.includes(milestone);

  const progressPercentage = Math.round(
    (userProgress.coursesCompleted / userProgress.totalCourses) * 100
  );

  return (
    <div className="container mx-auto p-4 sm:p-0">
      <div className="space-y-6">
        {/* Welcome Card with enhanced visuals */}
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
                Level {Math.floor(userProgress.totalDaysActive / 30) + 1}
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
                  <p className="text-2xl font-bold">{userProgress.currentStreak}</p>
                  <p className="text-sm text-muted-foreground">Day Streak 🔥</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                <div className="p-2 bg-accent/10 rounded-full">
                  <BookMarked className="h-6 w-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userProgress.coursesCompleted}/{userProgress.totalCourses}</p>
                  <p className="text-sm text-muted-foreground">Courses Done</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-card rounded-lg border">
                <div className="p-2 bg-secondary rounded-full">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userProgress.totalDaysActive}</p>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Progress Card */}
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

        {/* Features Grid with enhanced cards */}
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
                        <Link href={feature.href}>
                          Access Tool
                        </Link>
                      </Button>
                    ) : (
                      <div className="text-sm space-y-2">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-semibold text-foreground">How to unlock:</p>
                          <p className="text-muted-foreground mt-1">
                            Complete the &quot;Intro to Islamic Finance&quot; course in the
                            Library.
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

        {/* Daily Ayah Card with enhanced design */}
        <Card className="shadow-lg overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-6 w-6 text-primary" />
              Daily Ayah
            </CardTitle>
            <CardDescription>Reflection for today</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6 items-center relative">
            <div className="relative rounded-lg overflow-hidden shadow-md">
              <Image
                src="https://picsum.photos/seed/1/600/400"
                alt="Mosque architecture"
                width={300}
                height={200}
                className="object-cover"
                data-ai-hint="mosque architecture"
              />
            </div>
            <blockquote className="space-y-4 border-l-4 border-primary pl-6 flex-1">
              <p className="text-xl italic leading-relaxed">
                &quot;And He is with you wherever you are. And Allah, of what you do, is Seeing.&quot;
              </p>
              <footer className="text-right">
                <span className="font-semibold text-primary text-lg">Quran 57:4</span>
              </footer>
            </blockquote>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
