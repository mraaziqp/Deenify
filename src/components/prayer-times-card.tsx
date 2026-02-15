'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Sunrise, Sunset } from 'lucide-react';

interface PrayerTime {
  name: string;
  time: string;
  icon?: React.ReactNode;
}

export function PrayerTimesCard() {
  const [currentTime, setCurrentTime] = useState<string>('');
  const [nextPrayer, setNextPrayer] = useState<string>('Fajr');
  const [location] = useState<string>('Johannesburg, ZA');

  // South African prayer times (example for Johannesburg - should be dynamic based on location)
  const prayerTimes: PrayerTime[] = [
    { name: 'Fajr', time: '04:32', icon: <Sunrise className="h-4 w-4" /> },
    { name: 'Sunrise', time: '05:53', icon: <Sunrise className="h-4 w-4" /> },
    { name: 'Dhuhr', time: '12:05', icon: <Clock className="h-4 w-4" /> },
    { name: 'Asr', time: '15:32', icon: <Clock className="h-4 w-4" /> },
    { name: 'Maghrib', time: '18:17', icon: <Sunset className="h-4 w-4" /> },
    { name: 'Isha', time: '19:38', icon: <Clock className="h-4 w-4" /> },
  ];

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-ZA', { 
        hour: '2-digit', 
        minute: '2-digit',
        timeZone: 'Africa/Johannesburg'
      }));

      // Determine next prayer
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      const nextPrayerCalc = prayerTimes.find(prayer => {
        if (prayer.name === 'Sunrise') return false; // Skip sunrise
        const [hours, minutes] = prayer.time.split(':').map(Number);
        const prayerMinutes = hours * 60 + minutes;
        return prayerMinutes > currentMinutes;
      });
      
      setNextPrayer(nextPrayerCalc?.name || 'Fajr');
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Prayer Times</CardTitle>
          </div>
          <Badge variant="secondary" className="text-xs gap-1">
            <MapPin className="h-3 w-3" />
            {location}
          </Badge>
        </div>
        <p className="text-3xl font-bold text-primary">{currentTime}</p>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {prayerTimes.map((prayer) => (
            <div
              key={prayer.name}
              className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                prayer.name === nextPrayer && prayer.name !== 'Sunrise'
                  ? 'bg-primary/10 border border-primary/20'
                  : 'bg-muted/50'
              }`}
            >
              <div className="flex items-center gap-3">
                {prayer.icon}
                <span className={`font-medium ${prayer.name === 'Sunrise' ? 'text-muted-foreground text-sm' : ''}`}>
                  {prayer.name}
                </span>
                {prayer.name === nextPrayer && prayer.name !== 'Sunrise' && (
                  <Badge variant="default" className="text-xs">
                    Next
                  </Badge>
                )}
              </div>
              <span className={`font-semibold ${prayer.name === nextPrayer ? 'text-primary' : ''}`}>
                {prayer.time}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted-foreground mt-4 text-center">
          Times are calculated for Johannesburg. Enable location for accurate times.
        </p>
      </CardContent>
    </Card>
  );
}
