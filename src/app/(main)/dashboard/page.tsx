'use client';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
export const dynamic = "force-dynamic";

import { useEffect, useState } from 'react';
import hisnulMuslimData from '@/data/hisnul_muslim.json';
const HISNUL_CHAPTERS = (hisnulMuslimData as { English: { TITLE: string; TEXT: { ARABIC_TEXT?: string; TRANSLITERATION?: string; TRANSLATED_TEXT?: string; REFERENCE?: string }[] }[] }).English;

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Lock,
  CircleDollarSign,
  BookOpen,
  Sparkles,
  Award,
  Target,
  Clock,
  Heart,
  BookMarked,
  Apple,
  Lightbulb,
  Compass,
} from 'lucide-react';
import Link from 'next/link';
import { DailyHadithCard } from '@/components/daily-hadith-card';
import { PrayerTimesCard } from '@/components/prayer-times-card';
import TasbeehCounter from '@/components/dhikr/tasbeeh-counter';
import SponsoredBannerCarousel from '@/components/sponsored-banner-carousel';

// TODO: Implement DB-based progress management

type DashboardStats = {
  currentStreak: number;
  totalDaysActive: number;
  coursesCompleted: number;
  totalCourses: number;
  dhikrCount: number;
};

type ActivityItem = {
  id: string;
  message: string;
  type: 'lesson' | 'course';
  timestamp: string;
};

const features = [
  {
    id: 'zakat',
    title: 'Zakat Calculator',
    description: 'Calculate your Zakat on various assets.',
    icon: CircleDollarSign,
    requiredMilestone: 'islamic_finance_intro',
    href: '/zakat',
  },
  {
    id: 'halal_food',
    title: 'Halal Food Guide',
    description: 'Learn about permissible and forbidden foods.',
    icon: Apple,
    requiredMilestone: 'quran_intro',
    href: '/halal-food',
  },
  {
    id: 'quran_page',
    title: 'Quran & Recitations',
    description: 'Read and listen to the Quran with renowned reciters.',
    icon: BookOpen,
    requiredMilestone: 'quran_intro',
    href: '/quran',
  },
];

const selectDailyFact = (facts: string[], dateKey: string) => {
  if (!facts.length) return '';
  let hash = 0;
  for (const char of dateKey) {
    hash = (hash * 31 + char.charCodeAt(0)) % facts.length;
  }
  return facts[hash];
};

export default function DashboardPage() {
  const { user, hasRole, isLoading } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState<'learning' | 'yaseen' | 'qiblah' | 'ccemag' | 'daily' | 'worship' | 'fact' | 'admin'>('learning');
  const [stats, setStats] = useState<DashboardStats>({
    currentStreak: 0,
    totalDaysActive: 0,
    coursesCompleted: 0,
    totalCourses: 0,
    dhikrCount: 0,
  });
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [dailyFact, setDailyFact] = useState('');

  useEffect(() => { document.title = 'Dashboard | Deenify'; }, []);



  // Helper: feature unlock logic (placeholder, always true)
  const isFeatureUnlocked = (_milestone: string) => true;
  // Helper: progress percentage
  const progressPercentage = stats.totalCourses
    ? Math.round((stats.coursesCompleted / stats.totalCourses) * 100)
    : 0;

  return (
    <div className="container mx-auto px-2 py-3 sm:px-4 md:px-8 max-w-5xl">
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
                السلام عليكم ورحمة الله
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
              <span className="text-yellow-300 text-xs font-medium" style={{fontFamily:'Scheherazade New,Amiri,serif',fontSize:'1.1rem'}}>
                بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ
              </span>
            </div>
          </div>
        </div>

        {/* ── Quick-access feature tiles ───────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {([
            { icon:'📖', label:'Quran',       sub:'Read & listen',  href:'/quran',          bg:'#e6f4f0',iconBg:'#059669',color:'#065f46' },
            { icon:'🤲', label:'Duas',         sub:'Hisnul Muslim',  href:'/hisnul-muslim',  bg:'#fdf6e3',iconBg:'#d97706',color:'#92400e' },
            { icon:'🕌', label:'Prayer Times', sub:'Cape Town',       href:'#prayer-times',   bg:'#eef2ff',iconBg:'#4f46e5',color:'#312e81' },
            { icon:'🥗', label:'Halal Food',   sub:'Guide',          href:'/halal-food',     bg:'#f0fdf4',iconBg:'#16a34a',color:'#14532d' },
            { icon:'🤖', label:'AI Assistant', sub:'Ask anything',   href:'/ai-assistant',   bg:'#faf5ff',iconBg:'#7c3aed',color:'#4c1d95' },
            { icon:'💰', label:'Zakat',        sub:'Calculator',     href:'/zakat',          bg:'#fff7ed',iconBg:'#ea580c',color:'#7c2d12' },
            { icon:'📚', label:'Library',      sub:'Books & PDFs',   href:'/library',        bg:'#f0f9ff',iconBg:'#0284c7',color:'#0c4a6e' },
            { icon:'📿', label:'Dhikr',        sub:'Circle',         href:'/dhikr',          bg:'#fdf2f8',iconBg:'#db2777',color:'#831843' },
          ] as const).map(t=>(
            <a key={t.label} href={t.href} className="block rounded-2xl p-3.5 card-hover" style={{background:t.bg,textDecoration:'none'}}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl mb-2" style={{background:t.iconBg}}>{t.icon}</div>
              <p className="font-semibold text-sm" style={{color:t.color}}>{t.label}</p>
              <p className="text-xs" style={{color:t.color+'99'}}>{t.sub}</p>
            </a>
          ))}
        </div>

        {/* ── Sponsored Banner ─────────────────────── */}
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
            <Card className="shadow-md min-h-[140px] flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Learning Library
                </CardTitle>
                <CardDescription>Explore PDFs, books, and ask questions</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/learning">Open Learning Library</Link>
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
            <Card className="shadow-md min-h-[140px] flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="h-5 w-5 text-primary" />
                  Qiblah Compass
                </CardTitle>
                <CardDescription>Find the Qiblah direction quickly</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/qiblah">Open Qiblah Compass</Link>
                </Button>
              </CardContent>
            </Card>
          )}
          {selectedTab === 'fact' && (
            <Card className="shadow-md min-h-[140px] flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-primary" />
                  Islamic Fact of the Day
                </CardTitle>
                <CardDescription>Small, steady learning every day</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{dailyFact}</p>
              </CardContent>
            </Card>
          )}
          {selectedTab === 'admin' && hasRole && hasRole('admin') && (
            <Card className="shadow-md min-h-[140px] flex flex-col justify-between">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Admin Dashboard
                </CardTitle>
                <CardDescription>Manage users, content, and settings.</CardDescription>
              </CardHeader>
              <CardContent>
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
