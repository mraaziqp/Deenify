
'use client';
export const dynamic = "force-dynamic";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
// import { Progress } from "@/components/ui/progress";
// import { HeartPulse, PlusCircle, MinusCircle, RefreshCw, Target } from "lucide-react";
import { useState, useEffect } from "react";
import toast, { Toaster } from 'react-hot-toast';
import { useHotkeys } from 'react-hotkeys-hook';
// TODO: Implement DB-based progress management

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
      // TODO: Update progress via API (dhikrCount, dhikrStreak)
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
    <div>
      <Toaster />
      <h1 className="text-3xl font-bold">Dhikr Circle (UI temporarily disabled for build test)</h1>
      <p>Count: {count}</p>
      <p>Streak: {streak}</p>
      <p>Daily Goal: {dailyGoal}</p>
      <button onClick={increment}>Increment</button>
      <button onClick={decrement}>Decrement</button>
      <button onClick={reset}>Reset</button>
    </div>
  );
}
