import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lock, CircleDollarSign, TrendingUp, BookOpen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Mock user progress for the "Slow-Drip" feature
const userProgress = {
  completedMilestones: ['welcome', 'salah_basics'],
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
    id: 'halal_screener',
    title: 'Halal Stock Screener',
    description: 'Check if stocks are Sharia-compliant.',
    icon: TrendingUp,
    requiredMilestone: 'islamic_finance_intro',
    href: '/halal-screener',
  },
  {
    id: 'fiqh_debates',
    title: 'Fiqh Debates',
    description: 'Explore deep scholarly discussions.',
    icon: BookOpen,
    requiredMilestone: 'advanced_fiqh',
    href: '#',
  },
];

export default function DashboardPage() {
  const isFeatureUnlocked = (milestone: string) =>
    userProgress.completedMilestones.includes(milestone);

  return (
    <div className="container mx-auto p-4 sm:p-0">
      <div className="space-y-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-primary">
              Welcome to Deenify!
            </CardTitle>
            <CardDescription className="text-lg">
              As-salamu alaykum, your journey of knowledge and growth starts here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              We've designed a path to help you learn and grow at a comfortable
              pace. As you complete milestones, new features will unlock.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const unlocked = isFeatureUnlocked(feature.requiredMilestone);
            const FeatureIcon = feature.icon;
            return (
              <Card
                key={feature.id}
                className={`transition-all hover:shadow-md ${
                  !unlocked ? 'bg-muted/50' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FeatureIcon className="h-6 w-6 text-primary" />
                      {feature.title}
                    </span>
                    {!unlocked && (
                      <Badge variant="secondary" className="gap-1">
                        <Lock className="h-3 w-3" />
                        Locked
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {unlocked ? (
                    <Button asChild>
                      <Link href={feature.href}>
                        Access Tool
                      </Link>
                    </Button>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      <p className="font-semibold">How to unlock:</p>
                      <p>
                        Complete the &quot;Intro to Islamic Finance&quot; course in the
                        Library.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Daily Ayah</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6 items-center">
            <Image
              src="https://picsum.photos/seed/1/600/400"
              alt="Mosque architecture"
              width={300}
              height={200}
              className="rounded-lg object-cover"
              data-ai-hint="mosque architecture"
            />
            <blockquote className="space-y-4 border-l-4 border-primary pl-4">
              <p className="text-xl italic">
                &quot;And He is with you wherever you are. And Allah, of what you do, is Seeing.&quot;
              </p>
              <footer className="text-right font-semibold text-primary">
                - Quran 57:4
              </footer>
            </blockquote>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
