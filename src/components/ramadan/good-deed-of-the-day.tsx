import { useMemo } from 'react';

const goodDeeds = [
  'Call a relative and make dua for them.',
  'Feed a hungry person today.',
  'Give a small charity (even R5).',
  'Smile at someone for the sake of Allah.',
  'Read Surah Al-Mulk before sleeping.',
  'Help a neighbor with something.',
  'Make sincere dua for the Ummah.',
  'Share a hadith with a friend.',
  'Pray two extra rakats of nafl.',
  'Forgive someone who wronged you.',
  'Send a message of encouragement.',
  'Reflect on a verse of the Quran.',
  'Thank Allah for three blessings.',
  'Make istighfar 100 times.',
  'Give water to a fasting person.',
  'Visit a sick person or call them.',
  'Read about a Sahabi.',
  'Make peace between two people.',
  'Support a local masjid.',
  'Teach a child something Islamic.',
  'Donate to an orphanage.',
  'Help clean your home or masjid.',
  'Pray Tahajjud tonight.',
  'Share food with someone.',
  'Make dhikr after every salah.',
  'Encourage someone to do good.',
  'Read a page of tafsir.',
  'Make a list of your Ramadan goals.',
  'Thank your parents or elders.',
  'Plan a family iftar.'
];

function getHijriDay() {
  // Simple fallback: use Gregorian day of Ramadan (for demo)
  const now = new Date();
  // Assume Ramadan started Feb 18, 2026
  const ramadanStart = new Date('2026-02-18T00:00:00Z');
  const diff = Math.floor((now.getTime() - ramadanStart.getTime()) / (1000 * 60 * 60 * 24));
  return (diff % 30);
}

export default function GoodDeedOfTheDay() {
  const deed = useMemo(() => goodDeeds[getHijriDay()] || goodDeeds[0], []);
  return (
    <div className="bg-white rounded-lg shadow p-6 flex flex-col gap-2" aria-label="30 Days of Good Deeds">
      <h2 className="text-xl font-semibold mb-2" id="good-deeds-title">30 Days of Good Deeds</h2>
      <div className="text-lg" aria-live="polite">Today’s Deed:</div>
      <div className="text-2xl font-bold text-green-700" aria-live="polite">{deed}</div>
    </div>
  );
}
