import { useEffect, useState } from 'react';

// Helper: fetch prayer times from AlAdhan API
async function fetchPrayerTimes(city: string, country: string, method = 2) {
  const today = new Date();
  const day = today.getDate();
  const month = today.getMonth() + 1;
  const year = today.getFullYear();
  const url = `https://api.aladhan.com/v1/timingsByCity/${day}-${month}-${year}?city=${city}&country=${country}&method=${method}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.data.timings;
}

function getTimeDiff(target: string) {
  const now = new Date();
  const [h, m] = target.split(":");
  const targetDate = new Date(now);
  targetDate.setHours(Number(h), Number(m), 0, 0);
  let diff = (targetDate.getTime() - now.getTime()) / 1000;
  if (diff < 0) diff += 24 * 3600; // next day
  const hours = Math.floor(diff / 3600);
  const minutes = Math.floor((diff % 3600) / 60);
  return { hours, minutes };
}

export default function SuhoorIftarWidget() {
  const [timings, setTimings] = useState<Record<string, string> | null>(null);
  const [loading, setLoading] = useState(true);
  const [city, setCity] = useState<'Cape Town' | 'Johannesburg'>('Cape Town');
  // Auto-detect fasting state based on current time
  const [fasting, setFasting] = useState(() => {
    const now = new Date();
    const hour = now.getHours();
    // Assume fasting from Fajr (5am) to Maghrib (7pm)
    return hour >= 5 && hour < 19;
  });

  useEffect(() => {
    setLoading(true);
    fetchPrayerTimes(city, 'South Africa').then(t => {
      setTimings(t);
      setLoading(false);
    });
  }, [city]);

  if (loading || !timings) return <div className="p-4">Loading Suhoor & Iftar times...</div>;

  // Determine state
  const now = new Date();
  const fajr = timings.Fajr;
  const maghrib = timings.Maghrib;
  const { hours, minutes } = getTimeDiff(fasting ? maghrib : fajr);
  const nextEvent = fasting ? 'Iftar (Maghrib)' : 'Suhoor (Fajr)';
  const nextTime = fasting ? maghrib : fajr;

  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2" aria-label="Suhoor and Iftar Command Center">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold" id="suhoor-iftar-title">Suhoor & Iftar Command Center</h2>
        <select value={city} onChange={e => setCity(e.target.value as any)} className="border rounded px-2 py-1" aria-label="Select city">
          <option value="Cape Town">Cape Town</option>
          <option value="Johannesburg">Johannesburg</option>
        </select>
      </div>
      <div className="text-lg font-bold mb-1" aria-live="polite">
        {fasting ? 'Fasting' : 'Not Fasting'}
      </div>
      <div className="text-2xl mb-2" aria-live="polite">
        Countdown to {nextEvent}: <span className="font-mono">{hours}h {minutes}m</span>
      </div>
      <div className="flex gap-4">
        <div>
          <span className="font-semibold">Fajr:</span> {timings.Fajr}
        </div>
        <div>
          <span className="font-semibold">Maghrib:</span> {timings.Maghrib}
        </div>
      </div>
      <button className="mt-2 px-3 py-1 bg-blue-100 rounded" onClick={() => setFasting(f => !f)} aria-pressed={fasting} aria-label="Toggle fasting state">
        Toggle: {fasting ? 'Switch to Eating' : 'Switch to Fasting'}
      </button>
    </div>
  );
}
