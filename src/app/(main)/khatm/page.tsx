'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookOpen, Check, User, Clock } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface JuzStatus {
  juzNumber: number;
  status: 'available' | 'taken' | 'completed';
  reciterName?: string;
  claimedAt?: string;
  completedAt?: string;
}

export default function KhatmPage() {
  const [selectedJuz, setSelectedJuz] = useState<number | null>(null);
  const [userName, setUserName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Initial data for default state
  const initialJuzStatus: JuzStatus[] = Array.from({ length: 30 }, (_, i) => ({
    juzNumber: i + 1,
    status: 'available' as const,
    reciterName: undefined,
    claimedAt: undefined,
    completedAt: undefined,
  }));

  const [juzData, setJuzData] = useState<JuzStatus[]>(initialJuzStatus);

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('khatmJuzData');
    if (savedData) {
      try {
        setJuzData(JSON.parse(savedData));
      } catch (error) {
        console.error('Failed to load Khatm data:', error);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save to localStorage whenever juzData changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('khatmJuzData', JSON.stringify(juzData));
    }
  }, [juzData, isLoaded]);

  const handleJuzClick = (juz: JuzStatus) => {
    if (juz.status === 'available') {
      setSelectedJuz(juz.juzNumber);
      setIsDialogOpen(true);
    }
  };

  const handleCommit = () => {
    if (selectedJuz && userName.trim()) {
      // In production, update Firestore: circles/{circleId}/juz/{juzNumber}
      setJuzData(prev =>
        prev.map(juz =>
          juz.juzNumber === selectedJuz
            ? {
                ...juz,
                status: 'taken',
                reciterName: userName,
                claimedAt: new Date().toISOString(),
              }
            : juz
        )
      );
      toast.success(`🎉 Juz ${selectedJuz} claimed! May Allah make it easy for you.`, { 
        duration: 4000,
        icon: '📖'
      });
      setIsDialogOpen(false);
      setUserName('');
      setSelectedJuz(null);
    }
  };

  const handleMarkComplete = (juzNumber: number) => {
    // In production, update Firestore here
    setJuzData(prev =>
      prev.map(juz =>
        juz.juzNumber === juzNumber
          ? {
              ...juz,
              status: 'completed',
              completedAt: new Date().toISOString(),
            }
          : juz
      )
    );
    
    const newCompletedCount = juzData.filter(j => j.status === 'completed').length + 1;
    if (newCompletedCount === 30) {
      toast.success('🎊 Alhamdulillah! The entire Quran has been completed! 🎊', { 
        duration: 6000 
      });
    } else {
      toast.success(`✅ Juz ${juzNumber} marked as complete! Barakallahu feek!`, { 
        duration: 3000 
      });
    }
  };
          : juz
      )
    );
  };

  const availableCount = juzData.filter(j => j.status === 'available').length;
  const takenCount = juzData.filter(j => j.status === 'taken').length;
  const completedCount = juzData.filter(j => j.status === 'completed').length;
  const progress = (completedCount / 30) * 100;

  return (
    <div className="container mx-auto max-w-6xl">
      <Toaster position="top-center" toastOptions={{
        style: {
          background: '#363636',
          color: '#fff',
        },
      }} />
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Khatm al-Quran Circle</h1>
          <p className="text-muted-foreground">
            Complete the entire Quran as a community - claim your Juz and start reciting
          </p>
        </div>
      </div>

      {/* Progress Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-1">
                {completedCount}/30
              </div>
              <p className="text-sm text-muted-foreground">Juz Completed</p>
              <div className="mt-2 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/20 bg-gradient-to-br from-yellow-50 to-transparent">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-1">
                {takenCount}
              </div>
              <p className="text-sm text-muted-foreground">Being Recited</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-500/20 bg-gradient-to-br from-green-50 to-transparent">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {availableCount}
              </div>
              <p className="text-sm text-muted-foreground">Available</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-500/20 bg-gradient-to-br from-blue-50 to-transparent">
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {progress.toFixed(0)}%
              </div>
              <p className="text-sm text-muted-foreground">Progress</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-500"></div>
              <span className="text-sm">Available - Click to claim</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-yellow-500"></div>
              <span className="text-sm">Being Recited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-yellow-600"></div>
              <span className="text-sm">Completed ✓</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Juz Grid */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Select a Juz to Recite</CardTitle>
          <CardDescription>
            Each Juz contains approximately 20 pages of the Quran
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
            {juzData.map((juz) => (
              <div
                key={juz.juzNumber}
                onClick={() => handleJuzClick(juz)}
                className={`
                  relative aspect-square rounded-lg flex flex-col items-center justify-center
                  text-white font-bold text-xl transition-all duration-200 cursor-pointer
                  hover:scale-105 hover:shadow-lg
                  ${
                    juz.status === 'available'
                      ? 'bg-green-500 hover:bg-green-600'
                      : juz.status === 'taken'
                      ? 'bg-yellow-500 hover:bg-yellow-600'
                      : 'bg-gradient-to-br from-amber-400 to-yellow-600'
                  }
                `}
                title={
                  juz.status === 'available'
                    ? `Click to claim Juz ${juz.juzNumber}`
                    : juz.status === 'taken'
                    ? `Reciting: ${juz.reciterName}`
                    : `Completed by ${juz.reciterName}`
                }
              >
                <div className="text-2xl font-bold">{juz.juzNumber}</div>
                {juz.status === 'completed' && (
                  <Check className="absolute top-1 right-1 h-4 w-4" />
                )}
                {juz.status === 'taken' && (
                  <Clock className="absolute top-1 right-1 h-3 w-3" />
                )}
              </div>
            ))}
          </div>

          {/* Active Recitations */}
          {takenCount > 0 && (
            <div className="mt-6 pt-6 border-t">
              <h3 className="font-semibold mb-3">Currently Being Recited</h3>
              <div className="grid md:grid-cols-2 gap-3">
                {juzData
                  .filter(j => j.status === 'taken')
                  .map(juz => (
                    <div
                      key={juz.juzNumber}
                      className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                    >
                      <div>
                        <p className="font-semibold">Juz {juz.juzNumber}</p>
                        <p className="text-sm text-muted-foreground">Reciting: {juz.reciterName}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleMarkComplete(juz.juzNumber)}
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                      >
                        Mark Complete
                      </Button>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Commitment Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Commit to Read Juz {selectedJuz}</DialogTitle>
            <DialogDescription>
              You're about to claim Juz {selectedJuz} for recitation. Enter your name
              to track your commitment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Your Name</Label>
              <Input
                id="name"
                placeholder="Enter your name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleCommit()}
              />
            </div>
            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
              <p className="font-semibold text-blue-900 mb-1">Remember:</p>
              <ul className="list-disc list-inside space-y-1 text-blue-800">
                <li>Complete your Juz within a reasonable time</li>
                <li>Recite with proper tajweed if possible</li>
                <li>Make dua for the entire Ummah</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCommit} disabled={!userName.trim()}>
              Commit to Recite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Information Card */}
      <Card className="mt-6 bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
        <CardHeader>
          <CardTitle>About Khatm al-Quran</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            A Khatm (completion) circle allows the community to complete the entire
            Quran together. When multiple people read different sections, the reward is shared by all.
          </p>
          <p className="font-semibold text-teal-900">
            "And when the Quran is recited, listen to it and be silent that you may receive mercy."
            — Quran 7:204
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
