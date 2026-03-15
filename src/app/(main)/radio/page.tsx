'use client';

import { useState } from 'react';
import { Radio, Mail } from 'lucide-react';
import RadioPlayer, { type RadioStation } from '@/components/radio-player';

// ──────────────────────────────────────────────────────────────────────────────
// Station data — update streamUrl values with actual live stream endpoints.
// Contact each station's webmaster/tech team for the direct MP3/AAC stream URL.
// ──────────────────────────────────────────────────────────────────────────────
const STATIONS: RadioStation[] = [
  {
    id: 'votc',
    name: 'Voice of the Cape',
    location: 'Cape Town, South Africa',
    description: '89.9 FM — Cape Town\'s premier Muslim community radio station since 1995.',
    streamUrl: 'https://cast1.my-control-panel.com/proxy/voiceofthecape/stream',
    websiteUrl: 'https://www.voiceofthecape.net',
    logoEmoji: '🟢',
    genre: 'Community',
  },
  {
    id: 'cii',
    name: 'Channel Islam International',
    location: 'Johannesburg, South Africa',
    description: 'Talk radio upholding Islamic values for the global Muslim community.',
    streamUrl: 'https://stream.channelislam.com/live',
    websiteUrl: 'https://www.channelislam.com',
    logoEmoji: '🔵',
    genre: 'Talk Radio',
  },
  {
    id: 'radioislam',
    name: 'Radio Islam',
    location: 'South Africa',
    description: 'South Africa\'s leading Islamic radio station featuring news, lectures, and Quran recitation.',
    streamUrl: 'https://stream.radioislam.org.za/radioislam',
    websiteUrl: 'https://www.radioislam.org.za',
    logoEmoji: '🟡',
    genre: 'Islamic',
  },
  {
    id: 'ansaar',
    name: 'Radio Al-Ansaar',
    location: 'Durban, South Africa',
    description: 'KwaZulu-Natal\'s Islamic radio serving the ummah of Durban and surrounding areas.',
    streamUrl: 'https://stream.radioalansaar.co.za/live',
    websiteUrl: 'https://www.radioalansaar.co.za',
    logoEmoji: '🟣',
    genre: 'Community',
  },
  {
    id: 'radio786',
    name: 'Radio 786',
    location: 'Cape Town, South Africa',
    description: '100.4 FM — Cape Town\'s pioneering Muslim community radio station providing news, talk, and Islamic programming since 1995.',
    // TODO: Replace with the official Radio 786 stream URL once partnership is confirmed
    streamUrl: '',
    websiteUrl: 'https://www.radio786.co.za',
    logoEmoji: '🟠',
    genre: 'Talk & News',
    status: 'pending' as const,
  },
];

export default function RadioPage() {
  const [activeStationId, setActiveStationId] = useState<string | null>(null);

  return (
    <div className="max-w-3xl mx-auto py-6 px-2">
      {/* Header */}
      <div className="rounded-3xl overflow-hidden mb-8 shadow-lg" style={{ background: 'linear-gradient(135deg,#0a4a36 0%,#0d6e50 60%,#065f46 100%)' }}>
        <div className="px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center flex-shrink-0">
            <Radio className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl leading-tight">Muslim Radio Stations</h1>
            <p className="text-emerald-200 text-sm mt-1">Listen live to trusted Muslim radio stations from South Africa and beyond. Tap any station to start streaming.</p>
          </div>
        </div>
      </div>

      {/* Live Station List */}
      <section className="mb-10">
        <h2 className="text-base font-bold text-gray-700 uppercase tracking-wide mb-4">🎙️ Live Streams</h2>
        <div className="space-y-3">
          {STATIONS.map((station) => (
            <RadioPlayer
              key={station.id}
              station={station}
              isActive={activeStationId === station.id}
              onActivate={() => setActiveStationId(station.id)}
              onStop={() => setActiveStationId(null)}
            />
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-3">
          * Stream availability depends on the broadcaster. If a stream is unavailable, visit the station&apos;s website directly.
        </p>
      </section>

      {/* Partnership & Collaboration Section */}
      <section className="rounded-3xl border-2 border-dashed border-emerald-200 bg-emerald-50 p-6">
        <div className="flex items-start gap-3 mb-4">
          <span className="text-2xl">🤝</span>
          <div>
            <h2 className="text-lg font-bold text-emerald-800">Partner with Deenify</h2>
            <p className="text-sm text-emerald-700 mt-1">
              Are you a Muslim radio station, podcast, or Islamic media outlet? We want to feature you on Deenify and bring your content to thousands of Muslim listeners across South Africa and the world.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {[
            { icon: '📡', title: 'Live Stream Integration', desc: 'Get your live stream embedded directly in the Deenify app.' },
            { icon: '📣', title: 'Promotional Exposure', desc: 'Reach Deenify\'s growing Muslim community audience.' },
            { icon: '🎧', title: 'On-Demand Clips', desc: 'Share recordings, lectures, and programme highlights.' },
            { icon: '📈', title: 'Listener Analytics', desc: 'See how many Deenify users are tuning into your station.' },
          ].map(({ icon, title, desc }) => (
            <div key={title} className="flex gap-3 bg-white rounded-xl p-3 border border-emerald-100">
              <span className="text-xl mt-0.5">{icon}</span>
              <div>
                <p className="text-sm font-semibold text-emerald-800">{title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 mb-4">
          <p className="text-sm font-semibold text-gray-700 mb-1">📋 How to apply</p>
          <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
            <li>Email us your station name, location, and live stream URL.</li>
            <li>Include a brief description of your programming.</li>
            <li>We&apos;ll review and add your station within 3–5 business days.</li>
          </ol>
        </div>

        <a
          href="mailto:partnerships@deenify.app?subject=Radio%20Station%20Partnership%20Request&body=Station%20Name%3A%0ALocation%3A%0ALive%20Stream%20URL%3A%0AWebsite%3A%0ADescription%3A"
          className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl px-5 py-2.5 text-sm transition-colors no-underline"
        >
          <Mail className="h-4 w-4" />
          Apply for Partnership
        </a>
      </section>
    </div>
  );
}
