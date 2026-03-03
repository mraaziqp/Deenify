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
import { PrismaClient } from '@prisma/client';

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
  const [selectedTab, setSelectedTab] = useState<'learning' | 'yaseen' | 'qiblah' | 'ccemag' | 'fact' | 'admin'>('learning');
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

        {/* Dashboard Tabs */}
        <div className="w-full mt-2">
          <div className="border-b border-muted mb-4">
            <div className="flex gap-2">
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
              {hasRole && hasRole('admin') && (
                <button
                  className={`px-4 py-2 font-semibold rounded-t-md border-b-2 transition-colors ${selectedTab === 'admin' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`}
                  onClick={() => setSelectedTab('admin')}
                >
                  <Award className="inline h-5 w-5 mr-1 align-text-bottom" /> Admin Panel
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
                <CardDescription>
                  Manage users, content, and settings.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href="/admin">Go to Full Admin Dashboard</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="shadow-md mt-4">
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-6 w-6 text-primary" />
                Your Learning Journey
              </CardTitle>
              <span className="text-xl md:text-2xl font-bold text-primary">{progressPercentage}%</span>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="h-3 mb-4" />
            <p className="text-sm text-muted-foreground">
              Keep going! Complete your next course to unlock advanced features.
            </p>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <DailyHadithCard />
          <PrayerTimesCard />
        </div>

        <Card className="shadow-md mt-6">
          <CardHeader>
            <CardTitle>Tasbeeh Counter</CardTitle>
            <CardDescription>Count your dhikr easily</CardDescription>
          </CardHeader>
          <CardContent>
            <TasbeehCounter />
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest learning updates</CardDescription>
          </CardHeader>
          <CardContent>
            {activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet. Complete a lesson to get started.</p>
            ) : (
              <div className="space-y-3">
                {activity.map((item) => (
                  <div key={item.id} className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{item.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeof window !== 'undefined' ? new Date(item.timestamp).toLocaleString() : ''}
                      </p>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {item.type}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-2xl font-bold mb-4">Islamic Tools & Features</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const unlocked = isFeatureUnlocked(feature.requiredMilestone);
              const FeatureIcon = feature.icon;
              return (
                <Card
                  key={feature.id}
                  className={`transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                    !unlocked ? 'bg-muted/50 opacity-75' : 'border-primary/20'
                  }`}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${unlocked ? 'bg-primary/10' : 'bg-muted'}`}>
                          <FeatureIcon className={`h-6 w-6 ${unlocked ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <span className="text-base">{feature.title}</span>
                      </span>
                      {!unlocked && (
                        <Badge variant="secondary" className="gap-1">
                          <Lock className="h-3 w-3" />
                          Locked
                        </Badge>
                      )}
                      {unlocked && (
                        <Badge variant="default" className="gap-1">
                          Active
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {unlocked ? (
                      <Button asChild className="w-full">
                        <Link href={feature.href}>Access Tool</Link>
                      </Button>
                    ) : (
                      <div className="text-sm space-y-2">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <p className="font-semibold text-foreground">How to unlock:</p>
                          <p className="text-muted-foreground mt-1">
                            Complete the required learning milestone.
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4 text-primary">Hisnul Muslim Duas</h2>
          {/* Featured dua card */}
          <Card className="shadow-md border-primary/20 mb-4 bg-gradient-to-r from-teal-50 to-emerald-50/30">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
                🤲 {HISNUL_CHAPTERS[0]?.TITLE}
              </CardTitle>
              <CardDescription>Featured duas from Hisnul Muslim</CardDescription>
            </CardHeader>
            <CardContent>
              {HISNUL_CHAPTERS[0]?.TEXT.slice(0, 2).map((dua: any, i: number) => (
                <div key={i} className="mb-4 p-3 bg-white/70 rounded-xl">
                  <div className="text-xl font-bold text-right mb-1 text-gray-800" dir="rtl" lang="ar" style={{ fontFamily: "'Scheherazade New', serif", lineHeight: '2' }}>{dua.ARABIC_TEXT}</div>
                  <div className="text-sm italic text-teal-700 mb-1">{dua.TRANSLITERATION}</div>
                  <div className="text-sm text-gray-700 mb-1">{dua.TRANSLATED_TEXT}</div>
                  {dua.REFERENCE && <div className="text-xs text-muted-foreground bg-teal-50 px-2 py-0.5 rounded inline-block">📚 {dua.REFERENCE}</div>}
                </div>
              ))}
              <Button asChild className="w-full mt-2">
                <Link href="/hisnul-muslim">📖 Open Full Hisnul Muslim ({HISNUL_CHAPTERS.length} chapters)</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
