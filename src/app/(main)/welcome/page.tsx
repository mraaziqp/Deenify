'export const dynamic = "force-dynamic";'
'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  BookOpen, 
  Heart, 
  Sparkles, 
  Users, 
  Target,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import Link from 'next/link';

const onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to Your Journey',
    description: 'Deenify is your companion for Islamic knowledge and spiritual growth',
    icon: Sparkles,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 2,
    title: 'Learn at Your Pace',
    description: 'Start with the basics and unlock advanced topics as you progress',
    icon: BookOpen,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
  {
    id: 3,
    title: 'Connect & Grow',
    description: 'Join the global Dhikr circle and participate in Quran Khatm',
    icon: Users,
    color: 'text-primary',
    bgColor: 'bg-primary/10',
  },
  {
    id: 4,
    title: 'Track Your Progress',
    description: 'Build streaks, complete courses, and watch your knowledge grow',
    icon: Target,
    color: 'text-accent',
    bgColor: 'bg-accent/10',
  },
];

export default function WelcomePage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<'new' | 'learning' | 'advanced' | null>(null);

  const progress = ((currentStep + 1) / onboardingSteps.length) * 100;
  const currentStepData = onboardingSteps[currentStep];
  const Icon = currentStepData.icon;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-0">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">
            Step {currentStep + 1} of {onboardingSteps.length}
          </span>
          <span className="text-sm font-medium text-primary">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Main Content Card */}
      <Card className="shadow-2xl border-t-4 border-t-primary">
        <CardHeader className="text-center pb-8">
          <div className={`mx-auto w-20 h-20 rounded-full ${currentStepData.bgColor} flex items-center justify-center mb-4`}>
            <Icon className={`h-10 w-10 ${currentStepData.color}`} />
          </div>
          <CardTitle className="text-3xl font-bold mb-2">
            {currentStepData.title}
          </CardTitle>
          <CardDescription className="text-lg">
            {currentStepData.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step-specific content */}
          {currentStep === 0 && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground">
                As-salamu alaykum! We're honored to be part of your Islamic journey.
                Let's make learning accessible, engaging, and spiritually fulfilling.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Heart className="h-8 w-8 mx-auto mb-2 text-red-500" />
                  <p className="font-semibold">Daily Practice</p>
                  <p className="text-sm text-muted-foreground">Build consistent habits</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-semibold">Authentic Sources</p>
                  <p className="text-sm text-muted-foreground">Quran & Sahih Hadith</p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg text-center">
                  <Users className="h-8 w-8 mx-auto mb-2 text-accent" />
                  <p className="font-semibold">Global Community</p>
                  <p className="text-sm text-muted-foreground">Connect with others</p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground mb-6">
                Select your current knowledge level to get personalized recommendations
              </p>
              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => setSelectedLevel('new')}
                  className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    selectedLevel === 'new' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">New to Islam</h3>
                      <p className="text-sm text-muted-foreground">
                        Start with the fundamentals and build a strong foundation
                      </p>
                    </div>
                    {selectedLevel === 'new' && (
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
                
                <button
                  onClick={() => setSelectedLevel('learning')}
                  className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    selectedLevel === 'learning' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">Learning Muslim</h3>
                      <p className="text-sm text-muted-foreground">
                        Deepen your knowledge and explore various Islamic topics
                      </p>
                    </div>
                    {selectedLevel === 'learning' && (
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>

                <button
                  onClick={() => setSelectedLevel('advanced')}
                  className={`p-6 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                    selectedLevel === 'advanced' 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg mb-1">Advanced Student</h3>
                      <p className="text-sm text-muted-foreground">
                        Access advanced topics, Fiqh discussions, and scholarly content
                      </p>
                    </div>
                    {selectedLevel === 'advanced' && (
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0" />
                    )}
                  </div>
                </button>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-3">Global Dhikr Circle</h3>
                <p className="text-muted-foreground mb-4">
                  Join Muslims worldwide in collective remembrance of Allah. Your Dhikr 
                  counts contribute to the global total, creating a sense of unity and shared worship.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    1.2M+ Dhikr Today
                  </Badge>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    45K+ Active Members
                  </Badge>
                </div>
              </div>

              <div className="bg-gradient-to-r from-accent/10 to-primary/10 p-6 rounded-lg">
                <h3 className="font-bold text-lg mb-3">Quran Khatm Circles</h3>
                <p className="text-muted-foreground mb-4">
                  Participate in completing the Quran with your community. Claim a Juz, 
                  complete it, and help the circle finish together.
                </p>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    120+ Active Circles
                  </Badge>
                  <Badge variant="secondary" className="text-base px-3 py-1">
                    Daily Khatm Completion
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-center text-muted-foreground mb-6">
                Track your Islamic learning journey with meaningful metrics
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent border rounded-lg">
                  <Target className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-bold mb-2">Learning Streaks</h3>
                  <p className="text-sm text-muted-foreground">
                    Build consistent daily habits and maintain your streak
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-accent/5 to-transparent border rounded-lg">
                  <BookOpen className="h-8 w-8 text-accent mb-3" />
                  <h3 className="font-bold mb-2">Course Progress</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete courses to unlock advanced features
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-primary/5 to-transparent border rounded-lg">
                  <CheckCircle2 className="h-8 w-8 text-primary mb-3" />
                  <h3 className="font-bold mb-2">Milestone Achievements</h3>
                  <p className="text-sm text-muted-foreground">
                    Earn badges as you progress through your journey
                  </p>
                </div>
                <div className="p-6 bg-gradient-to-br from-accent/5 to-transparent border rounded-lg">
                  <Heart className="h-8 w-8 text-red-500 mb-3" />
                  <h3 className="font-bold mb-2">Daily Dhikr Count</h3>
                  <p className="text-sm text-muted-foreground">
                    Track your remembrance of Allah daily
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              Back
            </Button>

            {currentStep < onboardingSteps.length - 1 ? (
              <Button
                onClick={handleNext}
                className="gap-2"
                disabled={currentStep === 1 && !selectedLevel}
              >
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button asChild className="gap-2">
                <Link href="/dashboard">
                  Start Your Journey
                  <Sparkles className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Skip Option */}
      <div className="text-center mt-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard" className="text-muted-foreground">
            Skip for now
          </Link>
        </Button>
      </div>
    </div>
  );
}
