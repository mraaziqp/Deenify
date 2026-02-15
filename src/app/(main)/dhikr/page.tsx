
'use client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HeartPulse, PlusCircle, MinusCircle, RefreshCw, Target } from "lucide-react";
import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { useHotkeys } from 'react-hotkeys-hook';
import { loadProgress, saveProgress } from '@/lib/achievements';

export default function DhikrPage() {
  const [count, setCount] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [streak, setStreak] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);
  const dailyGoal = 100;
  const progress = Math.min((count / dailyGoal) * 100, 100);

  // Load count from localStorage on mount
  useEffect(() => {
    const savedCount = localStorage.getItem('dhikrCount');
    const savedDate = localStorage.getItem('dhikrDate');
    const today = new Date().toDateString();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toDateString();
    let storedStreak = Number(localStorage.getItem('dhikrStreak') || '0');

    if (savedDate === today && savedCount) {
      setCount(parseInt(savedCount, 10));
    } else {
      if (savedDate && savedDate !== today) {
        const previousCount = parseInt(savedCount || '0', 10);
        if (previousCount > 0) {
          storedStreak = savedDate === yesterdayString ? storedStreak + 1 : 1;
        } else {
          storedStreak = 0;
        }
        localStorage.setItem('dhikrStreak', storedStreak.toString());
      }

      // New day - reset count
      localStorage.setItem('dhikrDate', today);
      localStorage.setItem('dhikrCount', '0');
      if (savedDate && savedDate !== today && parseInt(savedCount || '0', 10) > 0) {
        toast('New day! Your counter has been reset.', { duration: 3000 });
      }
    }

    setStreak(Number(localStorage.getItem('dhikrStreak') || storedStreak || 0));
    setIsLoaded(true);
  }, []);

  // Save count to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('dhikrCount', count.toString());
      const progressData = loadProgress();
      progressData.dhikrCount = count;
      progressData.dhikrStreak = Number(localStorage.getItem('dhikrStreak') || streak || 0);
      saveProgress(progressData);
      window.dispatchEvent(new Event('progressUpdated'));
      
      // Show milestone toasts
      if (count === dailyGoal) {
        toast.success('🎉 Alhamdulillah! Daily goal reached!', { duration: 4000 });
      } else if (count === 33) {
        toast('✨ SubhanAllah completed (33)', { duration: 2000 });
      } else if (count === 66) {
        toast('✨ Alhamdulillah completed (33)', { duration: 2000 });
      } else if (count === 99) {
        toast('✨ Close to completing! Keep going!', { duration: 2000 });
      }
    }
  }, [count, isLoaded, dailyGoal]);

  // Optimistic UI: Update local state immediately
  const increment = () => {
    setCount(prev => prev + 1);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);
  };
  
  const decrement = () => setCount(prev => (prev > 0 ? prev - 1 : 0));
  const reset = () => {
    setCount(0);
    toast.success('Counter reset successfully', { duration: 2000 });
  };

  // Keyboard shortcuts
  useHotkeys('space', (e) => {
    e.preventDefault();
    increment();
  }, { enableOnFormTags: false });

  useHotkeys('r', (e) => {
    e.preventDefault();
    reset();
  }, { enableOnFormTags: false });

  useHotkeys('backspace', (e) => {
    e.preventDefault();
    decrement();
  }, { enableOnFormTags: false });

  return (
    <div className="container mx-auto max-w-4xl">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#363636',
          color: '#fff',
        },
      }} />
      <div className="flex items-center gap-3 mb-6">
        <HeartPulse className="h-8 w-8 text-primary animate-pulse" />
        <div>
          <h1 className="text-3xl font-bold">Dhikr Circle</h1>
          <p className="text-muted-foreground">
            Join Muslims worldwide in remembrance of Allah
          </p>
        </div>
      </div>

      {/* Daily Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <HeartPulse className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{count.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Your Dhikr Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-accent/20 bg-gradient-to-br from-accent/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-full">
                <Target className="h-5 w-5 text-accent" />
              </div>
              <div>
                <p className="text-2xl font-bold text-accent">{dailyGoal}</p>
                <p className="text-sm text-muted-foreground">Daily Goal</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-full">
                <HeartPulse className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{streak}</p>
                <p className="text-sm text-muted-foreground">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Counter Card */}
      <Card className="shadow-2xl mb-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <CardHeader className="text-center relative">
          <CardTitle className="text-2xl">Your Tasbih Counter</CardTitle>
          <CardDescription>
            Subhan Allah, Alhamdulillah, Allahu Akbar
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 text-center relative">
          {/* Counter Display */}
          <div className="mb-8">
            <div 
              className={`text-8xl font-bold text-primary transition-all duration-300 ${
                isAnimating ? 'scale-110' : 'scale-100'
              }`}
            >
              {count.toLocaleString()}
            </div>
            {count >= dailyGoal && (
              <Badge className="mt-4 text-base px-4 py-2 bg-green-500">
                🎉 Daily Goal Reached!
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mb-8 max-w-md mx-auto">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-muted-foreground">Daily Goal</span>
              <span className="font-semibold text-primary">
                {count}/{dailyGoal}
              </span>
            </div>
            <Progress value={progress} className="h-3" />
          </div>

          {/* Control Buttons */}
          <div className="flex justify-center gap-4 mb-6">
            <Button 
              onClick={decrement} 
              variant="outline" 
              size="lg" 
              className="h-16 w-16 rounded-full"
              aria-label="Decrement count"
            >
              <MinusCircle className="h-6 w-6" />
            </Button>
            
            <Button 
              onClick={increment} 
              size="lg" 
              className="h-24 w-24 rounded-full text-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95"
              aria-label="Increment count"
            >
              <div className="flex flex-col items-center">
                <PlusCircle className="h-8 w-8 mb-1" />
                <span>Count</span>
              </div>
            </Button>

            <Button 
              onClick={reset} 
              variant="outline" 
              size="lg" 
              className="h-16 w-16 rounded-full"
              aria-label="Reset count"
            >
              <RefreshCw className="h-6 w-6" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Your counts sync automatically with the global total
          </p>
        </CardContent>
      </Card>

      {/* Dhikr Guide */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-lg">SubhanAllah</CardTitle>
            <CardDescription>Glory be to Allah</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary mb-2">33×</p>
            <p className="text-sm text-muted-foreground">
              After each prayer
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader>
            <CardTitle className="text-lg">Alhamdulillah</CardTitle>
            <CardDescription>All praise be to Allah</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-accent mb-2">33×</p>
            <p className="text-sm text-muted-foreground">
              After each prayer
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardHeader>
            <CardTitle className="text-lg">Allahu Akbar</CardTitle>
            <CardDescription>Allah is the Greatest</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary mb-2">34×</p>
            <p className="text-sm text-muted-foreground">
              After each prayer
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
