'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, X, CheckCircle2, Clock, Sunrise, Sunset, Moon } from 'lucide-react';

type PrayerTime = {
  name: string;
  time: string;
  icon: React.ElementType;
  passed: boolean;
};

export function DailyReminders() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Mock prayer times - in production, this would come from an API
  const prayerTimes: PrayerTime[] = [
    { name: 'Fajr', time: '05:30 AM', icon: Sunrise, passed: true },
    { name: 'Dhuhr', time: '12:45 PM', icon: Clock, passed: true },
    { name: 'Asr', time: '03:30 PM', icon: Clock, passed: false },
    { name: 'Maghrib', time: '06:15 PM', icon: Sunset, passed: false },
    { name: 'Isha', time: '08:00 PM', icon: Moon, passed: false },
  ];

  const nextPrayer = prayerTimes.find(prayer => !prayer.passed);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
        onClick={() => setIsVisible(true)}
      >
        <Bell className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-80 shadow-2xl z-50 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Prayer Reminders</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>
          {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {nextPrayer && (
          <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Next Prayer</span>
              <Badge variant="default">{nextPrayer.name}</Badge>
            </div>
            <div className="flex items-center gap-2">
              {nextPrayer.icon && <nextPrayer.icon className="h-5 w-5 text-primary" />}
              <span className="text-2xl font-bold text-primary">{nextPrayer.time}</span>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Today's Schedule
          </p>
          {prayerTimes.map((prayer) => {
            const Icon = prayer.icon;
            return (
              <div
                key={prayer.name}
                className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                  prayer.passed 
                    ? 'bg-muted/50 text-muted-foreground' 
                    : 'bg-accent/5 hover:bg-accent/10'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{prayer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">{prayer.time}</span>
                  {prayer.passed && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t space-y-2">
          <div className="p-3 bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg">
            <p className="text-sm font-medium mb-1">Daily Dhikr Reminder</p>
            <p className="text-xs text-muted-foreground">
              SubhanAllah (33×), Alhamdulillah (33×), Allahu Akbar (34×)
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
