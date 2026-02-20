
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
      <Toaster />
      <div className="w-full max-w-md p-6 rounded-xl shadow-xl bg-white/90 border border-primary/10">
        <h1 className="text-3xl font-bold text-center mb-2 text-primary">Dhikr & Tasbeeh Counter</h1>
        <div className="flex items-center justify-between mb-4">
          <div className="text-lg font-semibold">Streak: <span className="text-green-600">{streak}</span></div>
          <div className="text-lg font-semibold">Goal: <span className="text-blue-600">{dailyGoal}</span></div>
        </div>
        <div className="flex flex-col items-center mb-6">
          <div className={`text-5xl font-bold mb-2 ${isAnimating ? 'animate-bounce' : ''}`}>{count}</div>
          <div className="w-full">
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-4 bg-primary rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="text-xs text-center mt-1 text-muted-foreground">Progress: {Math.round(progress)}%</div>
          </div>
        </div>
        <div className="flex gap-3 justify-center mb-4">
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg font-semibold shadow hover:bg-green-600 transition" onClick={increment}>+1</button>
          <button className="px-4 py-2 bg-yellow-400 text-white rounded-lg font-semibold shadow hover:bg-yellow-500 transition" onClick={decrement}>-1</button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold shadow hover:bg-red-600 transition" onClick={reset}>Reset</button>
        </div>
        <div className="text-sm text-muted-foreground text-center mb-2">Tip: Use <b>Space</b> to increment, <b>R</b> to reset, <b>Backspace</b> to decrement.</div>
        <div className="text-xs text-center text-blue-700">Milestones: 33 (SubhanAllah), 66 (Alhamdulillah), 99 (Allahu Akbar), 100 (Goal)</div>
      </div>
    </div>
  );
}
