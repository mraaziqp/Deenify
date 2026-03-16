'use client';
import { useAuth } from '@/lib/auth-context';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BookOpen,
  Award,
  Compass,
  HelpCircle,
  Languages,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { DailyHadithCard } from '@/components/daily-hadith-card';
import { PrayerTimesCard } from '@/components/prayer-times-card';
import TasbeehCounter from '@/components/dhikr/tasbeeh-counter';
import SponsoredBannerCarousel from '@/components/sponsored-banner-carousel';

// TODO: Implement DB-based progress management

const GUIDE_CATEGORIES = [
  {
    title: '📖 Quran & Reading',
    color: '#e6f4f0',
    accent: '#059669',
    items: [
      { icon: '📖', name: 'Quran Reader', desc: 'Read the full Quran with translations, tafsir, and audio recitation.', href: '/quran' },
      { icon: '📜', name: 'Surah Yaaseen', desc: 'Read Surah Yaaseen (36) individually or join a group Khatm recitation.', href: '/yaseen' },
      { icon: '📚', name: 'Learning Library', desc: 'Browse Islamic PDFs, books, and educational resources.', href: '/library' },
      { icon: '🗣️', name: 'Arabic Learning Hub', desc: 'Beginner to advanced Arabic class journey with games and Quran-focused understanding.', href: '/arabic-learning' },
    ],
  },
  {
    title: '🤲 Worship & Dhikr',
    color: '#fdf6e3',
    accent: '#d97706',
    items: [
      { icon: '🤲', name: 'Duas (Hisnul Muslim)', desc: 'Daily authenticated duas from Hisnul Muslim with Arabic, transliteration & translation.', href: '/hisnul-muslim' },
      { icon: '📿', name: 'Dhikr Counter', desc: 'Digital tasbeeh — count SubhanAllah, Alhamdulillah, Allahu Akbar and more.', href: '/dhikr' },
      { icon: '🌙', name: 'Awrad & Mawlid', desc: 'Daily awrad recitations and Mawlid programmes.', href: '/awrad' },
    ],
  },
  {
    title: '🕌 Prayer & Guidance',
    color: '#eef2ff',
    accent: '#4f46e5',
    items: [
      { icon: '🕌', name: 'Prayer Times', desc: 'Accurate daily prayer times for Cape Town. Displayed on your dashboard.', href: '/dashboard' },
      { icon: '🧭', name: 'Qibla Compass', desc: 'Find the direction of the Kaabah from your current location.', href: '/qiblah' },
      { icon: '📅', name: 'Ramadan Tracker', desc: 'Track fasting days, sehri & iftaar times during Ramadan.', href: '/ramadan' },
    ],
  },
  {
    title: '🥗 Halal & Community',
    color: '#f0fdf4',
    accent: '#16a34a',
    items: [
      { icon: '🥗', name: 'Halal Food Guide', desc: 'Check whether food products and additives are halal or haram.', href: '/halal-food' },
      { icon: '👥', name: 'Groups', desc: 'Join or create Jamaah groups for Yaaseen Khatms and collective worship.', href: '/groups' },
      { icon: '🎓', name: 'Scholar Q&A', desc: 'Browse answers to common Islamic questions from qualified scholars.', href: '/qna' },
    ],
  },
  {
    title: '🏫 Madresah',
    color: '#ecfdf5',
    accent: '#059669',
    items: [
      { icon: '🏫', name: 'Madresah Portal', desc: 'Register your Muslim school, manage classes, assign homework and track student Hifz progress.', href: '/madresah' },
    ],
  },
  {
    title: '🎵 Media & Entertainment',
    color: '#f0fdf4',
    accent: '#0f766e',
    items: [
      { icon: '📻', name: 'Muslim Radio', desc: 'Listen live to Muslim radio stations including Voice of the Cape, CII, Radio Islam and more.', href: '/radio' },
    ],
  },
  {
    title: '🤖 AI & Tools',
    color: '#faf5ff',
    accent: '#7c3aed',
    items: [
      { icon: '🤖', name: 'AI Assistant', desc: 'Ask any Islamic question and get an AI-powered response with references.', href: '/ai-assistant' },
      { icon: '💰', name: 'Zakat Calculator', desc: 'Calculate your Zakat obligations accurately using current nisab values.', href: '/zakat' },
      { icon: '📰', name: 'CCE Mag Portal', desc: 'Access the CCE Magazine quality-of-life portal for resources and opportunities.', href: '/ccemag' },
    ],
  },
];

type DashboardStats = {
  currentStreak: number;
  totalDaysActive: number;
  coursesCompleted: number;
  totalCourses: number;
  dhikrCount: number;
};


const ALL_TILES = [
  { icon:'📖', label:'Quran',          sub:'Read & listen',     href:'/quran',          bg:'#e6f4f0',iconBg:'#059669',color:'#065f46' },
  { icon:'🤲', label:'Duas',            sub:'Hisnul Muslim',     href:'/hisnul-muslim',  bg:'#fdf6e3',iconBg:'#d97706',color:'#92400e' },
  { icon:'🕌', label:'Prayer Times',    sub:'Cape Town',         href:'#prayer-times',   bg:'#eef2ff',iconBg:'#4f46e5',color:'#312e81' },
  { icon:'🥗', label:'Halal Food',      sub:'Guide',             href:'/halal-food',     bg:'#f0fdf4',iconBg:'#16a34a',color:'#14532d' },
  { icon:'🤖', label:'AI Assistant',    sub:'Ask anything',      href:'/ai-assistant',   bg:'#faf5ff',iconBg:'#7c3aed',color:'#4c1d95' },
  { icon:'💰', label:'Zakat',           sub:'Calculator',        href:'/zakat',          bg:'#fff7ed',iconBg:'#ea580c',color:'#7c2d12' },
  { icon:'📚', label:'Library',         sub:'Books & PDFs',      href:'/library',        bg:'#f0f9ff',iconBg:'#0284c7',color:'#0c4a6e' },
  { icon:'🗣️', label:'Arabic Learning', sub:'Class + games',     href:'/arabic-learning',bg:'#ecfeff',iconBg:'#0891b2',color:'#164e63' },
  { icon:'📿', label:'Dhikr',           sub:'Circle',            href:'/dhikr',          bg:'#fdf2f8',iconBg:'#db2777',color:'#831843' },
  { icon:'📻', label:'Radio',           sub:'Muslim stations',   href:'/radio',          bg:'#f0fdf4',iconBg:'#0f766e',color:'#134e4a' },
  { icon:'🏫', label:'Madresah',        sub:'School portal',     href:'/madresah',       bg:'#ecfdf5',iconBg:'#059669',color:'#064e3b' },
  { icon:'👥', label:'Groups',          sub:'Jamaah & Khatm',    href:'/groups',         bg:'#eff6ff',iconBg:'#2563eb',color:'#1e3a8a' },
  { icon:'📜', label:'Surah Yaaseen',   sub:'Read & Khatm',      href:'/yaseen',         bg:'#fefce8',iconBg:'#ca8a04',color:'#713f12' },
  { icon:'🌙', label:'Awrad',           sub:'Daily recitations', href:'/awrad',          bg:'#f5f3ff',iconBg:'#7c3aed',color:'#3b0764' },
  { icon:'📖', label:'Quran Khatm',     sub:'Group recitation',  href:'/khatm',          bg:'#fff1f2',iconBg:'#e11d48',color:'#881337' },
  { icon:'🧭', label:'Qiblah',          sub:'Compass',           href:'/qiblah',         bg:'#f0fdf4',iconBg:'#16a34a',color:'#14532d' },
  { icon:'📅', label:'Ramadan',         sub:'Tracker',           href:'/ramadan',        bg:'#fdf4ff',iconBg:'#a21caf',color:'#581c87' },
  { icon:'❓', label:'Scholar Q&A',     sub:'Islamic answers',   href:'/qna',            bg:'#f0f9ff',iconBg:'#0284c7',color:'#0c4a6e' },
  { icon:'📰', label:'News',            sub:'Islamic news',      href:'/news',           bg:'#fafaf9',iconBg:'#57534e',color:'#1c1917' },
  { icon:'🏆', label:'Achievements',    sub:'Badges & streaks',  href:'/achievements',   bg:'#fff7ed',iconBg:'#f59e0b',color:'#78350f' },
  { icon:'🔍', label:'Halal Screener',  sub:'Food checker',      href:'/halal-screener', bg:'#f0fdf4',iconBg:'#15803d',color:'#14532d' },
  { icon:'🕌', label:'Masjid Finder',   sub:'Near you',          href:'/masjid',         bg:'#eff6ff',iconBg:'#3b82f6',color:'#1e3a8a' },
  { icon:'🎬', label:'Video Library',   sub:'Islamic videos',    href:'/learn',          bg:'#fef2f2',iconBg:'#dc2626',color:'#7f1d1d' },
  { icon:'🤝', label:'Collab',          sub:'Collaboration',     href:'/collab',         bg:'#f5f5f4',iconBg:'#78716c',color:'#1c1917' },
  { icon:'📝', label:'Wasiya',          sub:'Last will',         href:'/wasiya',         bg:'#faf5ff',iconBg:'#9333ea',color:'#3b0764' },
  { icon:'📄', label:'CCE Mag',         sub:'Portal',            href:'/ccemag',         bg:'#ecfdf5',iconBg:'#10b981',color:'#064e3b' },
];

export default function DashboardPage() {
  const { user, hasRole, isLoading } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'learning' | 'arabic' | 'yaseen' | 'qiblah' | 'ccemag' | 'daily' | 'worship' | 'admin'>('learning');
  const [showGuide, setShowGuide] = useState(false);
  const [showAllTiles, setShowAllTiles] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    currentStreak: 0,
    totalDaysActive: 0,
    coursesCompleted: 0,
    totalCourses: 0,
    dhikrCount: 0,
  });
  useEffect(() => { document.title = 'Dashboard | Deenify'; }, []);

  const displayName = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || null;

  return (
    <div className="container mx-auto px-2 py-3 sm:px-4 md:px-8 max-w-5xl">

      {/* ── App Guide Modal ─────────────────────── */}
      {showGuide && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowGuide(false); }}
        >
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white shadow-2xl">
            {/* Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-3xl border-b" style={{ background: 'linear-gradient(135deg,#0a4a36 0%,#0d6e50 100%)' }}>
              <div>
                <h2 className="text-white font-bold text-xl">📘 App Guide</h2>
                <p className="text-emerald-200 text-sm">Everything Deenify has to offer</p>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Intro */}
            <div className="px-6 pt-5 pb-2">
              <p className="text-sm text-muted-foreground">Deenify is your all-in-one Islamic companion. Use the quick-access tiles on your dashboard, or explore the sidebar to navigate between features. Here&apos;s what you can find:</p>
            </div>

            {/* Categories */}
            <div className="px-6 pb-6 space-y-5">
              {GUIDE_CATEGORIES.map((cat) => (
                <div key={cat.title}>
                  <h3 className="font-bold text-sm uppercase tracking-wider mb-2" style={{ color: cat.accent }}>{cat.title}</h3>
                  <div className="space-y-2">
                    {cat.items.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        onClick={() => setShowGuide(false)}
                        className="flex items-start gap-3 rounded-2xl p-3 transition-all hover:shadow-sm cursor-pointer no-underline"
                        style={{ background: cat.color }}
                      >
                        <span className="text-2xl mt-0.5 shrink-0">{item.icon}</span>
                        <div>
                          <p className="font-semibold text-sm" style={{ color: cat.accent }}>{item.name}</p>
                          <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              ))}

              {/* Navigation tip */}
              <div className="rounded-2xl p-4 border border-emerald-100 bg-emerald-50">
                <p className="text-sm font-semibold text-emerald-800 mb-1">💡 Navigation Tips</p>
                <ul className="text-xs text-emerald-700 space-y-1 list-disc list-inside">
                  <li>Use the <strong>sidebar / bottom nav</strong> to jump between sections quickly.</li>
                  <li>The <strong>dashboard tiles</strong> give one-tap access to your most-used features.</li>
                  <li>Tap the <strong>Daily</strong> tab on your dashboard for today&apos;s hadith &amp; prayer times.</li>
                  <li>Use <strong>Groups</strong> to coordinate Yaaseen Khatms with family and friends.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
      <div className="space-y-4 md:space-y-6">
        {/* ── Islamic Hero Banner ─────────────────────── */}
        <div className="relative overflow-hidden rounded-3xl shadow-2xl" style={{background:'linear-gradient(135deg,#0a4a36 0%,#0d6e50 45%,#1e5f74 100%)',minHeight:'9rem'}}>
          {/* Geometric ornaments */}
          <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full" style={{background:'radial-gradient(circle,rgba(212,175,55,0.18) 0%,transparent 70%)'}} />
          <div className="absolute top-1/2 left-1/3 w-48 h-48 rounded-full" style={{background:'radial-gradient(circle,rgba(16,185,129,0.1) 0%,transparent 70%)',transform:'translateY(-50%)'}} />
          <div className="absolute top-3 right-8 select-none" style={{color:'rgba(251,191,36,0.22)',fontSize:'4rem',lineHeight:1}}>✦</div>
          <div className="absolute bottom-3 right-32 select-none" style={{color:'rgba(251,191,36,0.1)',fontSize:'2.5rem',lineHeight:1}}>✦</div>
          <div className="absolute bottom-4 left-6 select-none" style={{color:'rgba(255,255,255,0.06)',fontSize:'5rem',fontFamily:'Scheherazade New,Amiri,serif',lineHeight:1}}>بسم الله</div>

          <div className="relative z-10 px-6 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-emerald-200 text-sm font-medium mb-0.5 flex items-center gap-1.5">
                <span>☪️</span>
                <span>Ramadan Mubarak 1447 · {new Date().toLocaleDateString('en-ZA',{weekday:'long',day:'numeric',month:'long'})}</span>
              </p>
              <h1 className="text-white font-bold" style={{fontSize:'clamp(1.4rem,3vw,2.1rem)',letterSpacing:'-0.02em',lineHeight:1.15}}>
                {displayName ? `السلام عليكم، ${displayName}` : 'السلام عليكم ورحمة الله'}
              </h1>
              <p className="text-emerald-100 mt-1" style={{fontSize:'0.95rem',opacity:0.85}}>May Allah bless your day with peace, barakah &amp; remembrance.</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 border border-white/15">
                <span className="text-2xl">🔥</span>
                <div className="text-right">
                  <p className="text-white/65 text-xs">Daily Streak</p>
                  <p className="text-white font-bold text-xl tabular-nums">{stats.currentStreak || 1}</p>
                </div>
              </div>
              <span className="text-yellow-300 text-xs font-medium" style={{fontFamily:'Scheherazade New,Amiri,serif',fontSize:'1.05rem'}}>
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
              </span>
              <button
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-1.5 bg-white/10 hover:bg-white/20 transition-colors rounded-xl px-3 py-1.5 border border-white/15 text-white text-xs font-medium"
              >
                <HelpCircle className="h-3.5 w-3.5" /> App Guide
              </button>
            </div>
          </div>
        </div>

        {/* ── Quick-access feature tiles ───────────────── */}
        <div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {(showAllTiles ? ALL_TILES : ALL_TILES.slice(0, 9)).map(t => (
              <a key={t.label} href={t.href} className="block rounded-2xl p-3.5 card-hover" style={{background:t.bg,textDecoration:'none'}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl mb-2" style={{background:t.iconBg}}>{t.icon}</div>
                <p className="font-semibold text-sm" style={{color:t.color}}>{t.label}</p>
                <p className="text-xs" style={{color:t.color+'99'}}>{t.sub}</p>
              </a>
            ))}
          </div>
          <button
            onClick={() => setShowAllTiles(v => !v)}
            className="mt-3 w-full py-2.5 rounded-2xl border border-dashed border-gray-300 text-sm text-gray-500 hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all font-medium"
          >
            {showAllTiles ? '▲ Show less' : `▼ Show all ${ALL_TILES.length} features`}
          </button>
        </div>

        {/* ── Sponsored Banner (main app only — NOT rendered in /madresah) ── */}
        <SponsoredBannerCarousel />

        {/* Dashboard Tabs */}
        <div className="w-full mt-2">
          <div className="border-b border-muted mb-4">
            <div className="flex gap-2 overflow-x-auto pb-1" style={{scrollbarWidth:'none',msOverflowStyle:'none'}}>
              <button
                className={`px-4 py-2 font-semibold rounded-t-md border-b-2 transition-colors ${selectedTab === 'learning' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
                onClick={() => setSelectedTab('learning')}
              >
                <BookOpen className="inline h-5 w-5 mr-1 align-text-bottom" /> Learning Library
              </button>
              <button
                className={`px-4 py-2 font-semibold rounded-t-md border-b-2 transition-colors ${selectedTab === 'arabic' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
                onClick={() => setSelectedTab('arabic')}
              >
                <Languages className="inline h-5 w-5 mr-1 align-text-bottom" /> Arabic Class
              </button>
              <button
                className={`px-4 py-2 font-semibold rounded-t-md border-b-2 transition-colors ${selectedTab === 'yaseen' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
                onClick={() => setSelectedTab('yaseen')}
              >
                <BookOpen className="inline h-5 w-5 mr-1 align-text-bottom" /> Surah Yaaseen
              </button>
              <button
                className={`px-4 py-2 font-semibold rounded-t-md border-b-2 transition-colors ${selectedTab === 'qiblah' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
                onClick={() => setSelectedTab('qiblah')}
              >
                <Compass className="inline h-5 w-5 mr-1 align-text-bottom" /> Qiblah Compass
              </button>
              <button
                className={`px-4 py-2 font-semibold rounded-t-md border-b-2 transition-colors ${selectedTab === 'ccemag' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
                onClick={() => setSelectedTab('ccemag')}
              >
                <Award className="inline h-5 w-5 mr-1 align-text-bottom" /> CCE Mag Portal
              </button>
              <button
                className={`px-4 py-2 font-semibold rounded-t-md border-b-2 transition-colors whitespace-nowrap ${selectedTab === 'daily' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
                onClick={() => setSelectedTab('daily')}
              >
                📅 Daily
              </button>
              <button
                className={`px-4 py-2 font-semibold rounded-t-md border-b-2 transition-colors whitespace-nowrap ${selectedTab === 'worship' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
                onClick={() => setSelectedTab('worship')}
              >
                📿 Worship
              </button>
              {hasRole && hasRole('admin') && (
                <button
                  className={`px-4 py-2 font-semibold rounded-t-md border-b-2 transition-colors whitespace-nowrap ${selectedTab === 'admin' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
                  onClick={() => setSelectedTab('admin')}
                >
                  <Award className="inline h-5 w-5 mr-1 align-text-bottom" /> Admin
                </button>
              )}
            </div>
          </div>
          {/* Tab Content */}
          {selectedTab === 'learning' && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Learning Library
                </CardTitle>
                <CardDescription>Browse Islamic books, PDFs, and educational resources curated for Muslims of all levels.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  {[['📚','PDF Books'],['🎓','Scholar Texts'],['🔖','Bookmarks'],['🔍','Search & Filter']].map(([icon,label])=>(
                    <div key={label as string} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                      <span>{icon}</span><span className="text-muted-foreground">{label as string}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full">
                  <Link href="/library">Open Learning Library</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {selectedTab === 'arabic' && (
            <Card className="shadow-md border-cyan-100 bg-gradient-to-br from-cyan-50/80 via-white to-emerald-50/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Languages className="h-5 w-5 text-cyan-700" />
                  Arabic Learning Hub
                </CardTitle>
                <CardDescription>
                  Start from absolute beginner and level up to advanced Quran comprehension with guided classes, game rounds, root analysis, and speaking drills.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[['🔤','Beginner letter lessons'],['🎮','Interactive language games'],['🧠','Root & grammar mastery'],['📖','Quran comprehension bridge']].map(([icon,label])=>(
                    <div key={label as string} className="flex items-center gap-2 rounded-xl bg-white/80 border border-cyan-100 px-3 py-2">
                      <span>{icon}</span><span className="text-cyan-900/80">{label as string}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full bg-cyan-700 hover:bg-cyan-800">
                  <Link href="/arabic-learning">Enter Arabic Learning Hub</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-cyan-200 text-cyan-800 hover:bg-cyan-50">
                  <Link href="/arabic-learning?tab=placement">Take Placement Challenge</Link>
                </Button>
                <Button asChild variant="outline" className="w-full border-cyan-200 text-cyan-800 hover:bg-cyan-50">
                  <Link href="/quran">Practice in Quran Reader</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {selectedTab === 'yaseen' && (
            <Card className="shadow-md min-h-[140px] flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Surah Yaaseen
                </CardTitle>
                <CardDescription>
                  The heart of the Quran. Read, listen, and reflect on Surah Yaaseen (36).<br />
                  <span className="font-semibold">New:</span> Join a group recitation and mark your progress together!
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button asChild className="w-full">
                  <Link href="/yaseen">Open Group Recitation & Tracker</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/quran?surah=36">Read Surah Yaaseen (in-app)</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/quran">Open Full Quran Reader</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {selectedTab === 'ccemag' && (
            <Card className="shadow-md flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      CCE Mag Quality of Life Portal
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Access the CCE Magazine portal for quality of life resources and opportunities.
                    </CardDescription>
                  </div>
                  <a
                    href="https://ccemagazine.web.za/ccemag/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 underline hover:text-blue-800 whitespace-nowrap mt-1"
                  >
                    Open in new tab ↗
                  </a>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="w-full rounded-b-xl overflow-hidden border-t" style={{ height: '65vh' }}>
                  <iframe
                    src="https://ccemagazine.web.za/ccemag/"
                    title="CCE Mag Quality of Life Portal"
                    className="w-full h-full border-0"
                    loading="lazy"
                    allowFullScreen
                  />
                </div>
              </CardContent>
            </Card>
          )}
          {selectedTab === 'qiblah' && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  Qiblah Compass
                </CardTitle>
                <CardDescription>Find the exact direction of the Kaabah in Makkah from your current GPS location.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                <p className="text-sm text-muted-foreground rounded-xl bg-indigo-50 border border-indigo-100 px-4 py-3">
                  🧭 Uses your device&apos;s location &amp; compass sensor. Make sure location permissions are enabled for accurate results.
                </p>
                <Button asChild className="w-full">
                  <Link href="/qiblah">Open Qiblah Compass</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {selectedTab === 'admin' && hasRole && hasRole('admin') && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription>Manage users, content, system alerts, and all platform settings.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2 text-sm mb-2">
                  {[['👥','User Management'],['📚','Content Manager'],['🎵','Audio Library'],['⚙️','Settings']].map(([icon,label])=>(
                    <div key={label as string} className="flex items-center gap-2 rounded-xl bg-muted/50 px-3 py-2">
                      <span>{icon}</span><span className="text-muted-foreground">{label as string}</span>
                    </div>
                  ))}
                </div>
                <Button asChild className="w-full">
                  <Link href="/admin">Go to Full Admin Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {selectedTab === 'daily' && (
            <div className="grid gap-4 md:grid-cols-2">
              <DailyHadithCard />
              <PrayerTimesCard />
            </div>
          )}
          {selectedTab === 'worship' && (
            <Card className="shadow-md">
              <CardHeader>
                <CardTitle>Tasbeeh Counter</CardTitle>
                <CardDescription>Count your dhikr easily</CardDescription>
              </CardHeader>
              <CardContent>
                <TasbeehCounter />
              </CardContent>
            </Card>
          )}
        </div>

      </div>
    </div>
  );
}
