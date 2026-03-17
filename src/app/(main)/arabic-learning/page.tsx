'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  BrainCircuit,
  CheckCircle2,
  Crown,
  Flame,
  Gamepad2,
  Languages,
  Mic2,
  Sparkles,
  Star,
  Swords,
  Target,
  Trophy,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth-context';
import ArabicTypingGame from '@/components/arabic-typing-game';

type StageId = 'alphabet' | 'beginner' | 'intermediate' | 'advanced';
type GameId = 'letters' | 'vocab' | 'grammar';
type HubTabId = 'path' | 'adventure' | 'games' | 'bridge' | 'speaking' | 'revision' | 'placement' | 'planner' | 'typing';

type Lesson = {
  id: string;
  stage: StageId;
  title: string;
  objective: string;
  duration: string;
  challengeLevel: string;
  drills: string[];
  quranBridge: {
    arabic: string;
    transliteration: string;
    meaning: string;
    note: string;
  };
};

type QuizQuestion = {
  id: string;
  prompt: string;
  context: string;
  options: string[];
  answer: string;
  explanation: string;
};

type PlacementQuestion = {
  id: string;
  skill: string;
  prompt: string;
  options: Array<{
    id: string;
    label: string;
    points: number;
  }>;
};

type SprintWeek = {
  week: number;
  title: string;
  target: string;
  output: string;
};

type RemoteArabicProgress = {
  completedLessons: string[];
  xp: number;
  streak: number;
  gamesWon: number;
  placementCompleted: boolean;
  lastActiveDate: string | null;
  dailyMinutes: number;
  daysPerWeek: number;
  journalEntry: string;
  updatedAt?: string;
};

type AssignmentItem = {
  id: string;
  title: string;
  focusArea?: string | null;
  notes?: string | null;
  dueDate?: string | null;
  recommendedMinutes: number;
  daysPerWeek: number;
  isCompleted: boolean;
  createdAt: string;
  completedAt?: string | null;
  createdById: string;
  targetUserId?: string | null;
  targetClassId?: string | null;
  targetClass?: {
    id: string;
    name: string;
    madresahId: string;
  } | null;
};

type SchoolSummary = {
  madresahId: string;
  name: string;
  role: 'PRINCIPAL' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'ADMIN';
};

type SchoolClassOption = {
  id: string;
  name: string;
};

type RootTrack = {
  root: string;
  title: string;
  concept: string;
  quranContext: string;
  words: Array<{
    word: string;
    transliteration: string;
    meaning: string;
  }>;
};

type KidsAvatar = {
  id: string;
  name: string;
  emoji: string;
  superpower: string;
  color: string;
};

type KidsQuest = {
  id: string;
  title: string;
  mission: string;
  rewardXp: number;
  sticker: string;
};

type KidsChallenge = {
  id: string;
  prompt: string;
  helper: string;
  options: string[];
  answer: string;
};

type KidsTreasureReward = {
  id: string;
  title: string;
  emoji: string;
  xp: number;
  sparkles: number;
};

type LearnerProgress = {
  completedLessons: string[];
  xp: number;
  streak: number;
  gamesWon: number;
  placementCompleted: boolean;
  lastActiveDate: string | null;
};

const STORAGE_KEY = 'deenify-arabic-learning-progress-v1';
const SETTINGS_STORAGE_KEY = 'deenify-arabic-learning-settings-v1';
const JOURNAL_STORAGE_KEY = 'deenify-arabic-learning-journal-v1';
const ADVENTURE_STORAGE_KEY = 'deenify-arabic-adventure-v1';
const LESSONS_PER_PAGE = 10;

const STAGE_META: Record<
  StageId,
  {
    title: string;
    subtitle: string;
    color: string;
    xpBand: string;
  }
> = {
  alphabet: {
    title: 'Alphabet: The Arabic Script',
    subtitle: 'Master every letter, sound, and written form.',
    color: 'from-violet-600 to-purple-700',
    xpBand: 'Start here',
  },
  beginner: {
    title: 'Beginner: Arabic Foundations',
    subtitle: 'Master letters, sounds, and survival vocabulary.',
    color: 'from-emerald-600 to-teal-700',
    xpBand: '0-350 XP',
  },
  intermediate: {
    title: 'Intermediate: Sentence Builder',
    subtitle: 'Build grammar instincts and Quran reading fluency.',
    color: 'from-amber-500 to-orange-600',
    xpBand: '351-900 XP',
  },
  advanced: {
    title: 'Advanced: Quran Comprehension',
    subtitle: 'Analyze roots, patterns, and rhetorical structures.',
    color: 'from-sky-600 to-indigo-700',
    xpBand: '901+ XP',
  },
};

const LESSONS: Lesson[] = [
  // ── ALPHABET (al1–al28): One lesson per Arabic letter ───────────────────
  {
    id: 'al1',
    stage: 'alphabet',
    title: 'Alif (ا) — The Silent Pillar',
    objective: 'Write alif, recognize its role as a vowel seat and long-ā carrier.',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Trace 15 alifs', 'Spot alif in 10 words', 'Distinguish hamzated vs bare alif'],
    quranBridge: {
      arabic: 'اقْرَأْ',
      transliteration: 'Iqra',
      meaning: 'Read!',
      note: 'The first word of revelation begins with alif carrying hamza — the letter that opens the Quran.',
    },
  },
  {
    id: 'al2',
    stage: 'alphabet',
    title: 'Ba (ب) — The First Connector',
    objective: 'Write ba in all four positions and produce a clean bilabial b-sound.',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Trace ba in isolated, initial, medial, final forms', 'Distinguish ba from ta and tha by dot count', 'Build 5 ba-initial words'],
    quranBridge: {
      arabic: 'بِسْمِ اللَّهِ',
      transliteration: 'Bismi-llah',
      meaning: 'In the name of Allah.',
      note: 'بِسْمِ — ba is the very first letter of the Basmalah, opening of virtually every surah.',
    },
  },
  {
    id: 'al3',
    stage: 'alphabet',
    title: 'Ta (ت) — Two Dots Above',
    objective: 'Write ta in all positions and distinguish it from ba and tha by dot placement.',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Trace ta forms', 'Two-dot vs one-dot vs three-dot sorting drill', 'Spell 5 words using ta'],
    quranBridge: {
      arabic: 'التَّوَّابِينَ',
      transliteration: 'At-tawwabeen',
      meaning: 'Those who repent.',
      note: 'تَّ in التَّوَّابِينَ shows ta with shadda — doubling the letter sound.',
    },
  },
  {
    id: 'al4',
    stage: 'alphabet',
    title: 'Tha (ث) — Three Dots, One Sound',
    objective: 'Produce the interdental "th" as in "think" and write tha in all positions.',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Contrast tha vs ta vs ba', 'Say "think / thin" to feel the tongue position', 'Find 5 tha words in the Quran'],
    quranBridge: {
      arabic: 'ثُمَّ',
      transliteration: 'Thumma',
      meaning: 'Then.',
      note: 'ثُمَّ is one of the most common discourse connectors in the Quran — mastering tha unlocks it.',
    },
  },
  {
    id: 'al5',
    stage: 'alphabet',
    title: 'Jim (ج) — The Belly Letter',
    objective: 'Write jim and produce the classical "j" sound correctly.',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Trace jim in all 4 positions', 'Pronounce 10 jim words', 'Spot jim in 5 Quran snippets'],
    quranBridge: {
      arabic: 'جَنَّاتٌ',
      transliteration: 'Jannat',
      meaning: 'Gardens.',
      note: 'جَنَّاتٌ (paradise gardens) — jim begins one of the most beautiful words in the Quran.',
    },
  },
  {
    id: 'al6',
    stage: 'alphabet',
    title: 'Ha (ح) — The Throat Breath',
    objective: 'Correctly produce the voiceless pharyngeal Ha, distinct from Ha (ه) and Kha (خ).',
    duration: '12 min',
    challengeLevel: 'Starter+',
    drills: ['Contrast ح vs ه vs خ', 'Breath-from-throat warm-up', 'Read 8 ha-heavy words aloud'],
    quranBridge: {
      arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
      transliteration: 'Ar-Rahmani r-Rahim',
      meaning: 'The Most Gracious, the Most Merciful.',
      note: 'Both الرحمن and الرحيم contain ح — the most essential pharyngeal letter to master.',
    },
  },
  {
    id: 'al7',
    stage: 'alphabet',
    title: 'Kha (خ) — The Raspy Letter',
    objective: 'Produce the uvular fricative kha (like "ch" in Scottish "loch").',
    duration: '12 min',
    challengeLevel: 'Starter+',
    drills: ['Throat rasping warm-up', 'Minimal pairs: ح vs خ vs ه', 'Read 8 kha words aloud'],
    quranBridge: {
      arabic: 'خَلَقَ',
      transliteration: 'Khalaqa',
      meaning: 'He created.',
      note: 'خَلَقَ — the third word of the first revelation contains kha, making it essential from day one.',
    },
  },
  {
    id: 'al8',
    stage: 'alphabet',
    title: 'Dal (د) — The Simple Stop',
    objective: 'Write dal in its two positions (connects on left only) and produce a crisp d-sound.',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Trace dal shapes', 'Non-connector rule practice', 'Build 5 dal words'],
    quranBridge: {
      arabic: 'الدِّينِ',
      transliteration: 'Ad-din',
      meaning: 'The religion / way of life.',
      note: 'الدِّينِ closes Surah al-Fatihah — dal with shadda is a critical sound to recognise.',
    },
  },
  {
    id: 'al9',
    stage: 'alphabet',
    title: 'Dhal (ذ) — The Voiced Interdental',
    objective: 'Produce the voiced "dh" sound as in "the" and distinguish dhal from dal.',
    duration: '10 min',
    challengeLevel: 'Starter+',
    drills: ['"The / that / them" voice exercise', 'Contrast dal vs dhal pairs', '5 dhal words from Quran'],
    quranBridge: {
      arabic: 'ذَٰلِكَ',
      transliteration: 'Dhalika',
      meaning: 'That.',
      note: 'ذَٰلِكَ is the demonstrative "that" — one of the most frequent words in the Quran.',
    },
  },
  {
    id: 'al10',
    stage: 'alphabet',
    title: 'Ra (ر) — The Rolling Letter',
    objective: 'Produce the trilled/flapped r and understand when ra is heavy vs light.',
    duration: '12 min',
    challengeLevel: 'Starter+',
    drills: ['Tongue-tip trill warm-up', 'Heavy ra (after fat-ha) vs light ra', 'Read 8 ra words'],
    quranBridge: {
      arabic: 'الرَّحِيمِ',
      transliteration: 'Ar-Rahim',
      meaning: 'The Most Merciful.',
      note: 'The ra in الرَّحِيمِ is heavy — it carries a full rounded quality after the fat-ha.',
    },
  },
  {
    id: 'al11',
    stage: 'alphabet',
    title: 'Zayn (ز) — The Buzzing Letter',
    objective: 'Write zayn and produce a voiced z-buzz distinct from sin (س).',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Bee-buzz z-production exercise', 'Sin vs zayn minimal pairs', '5 zayn words from Quran'],
    quranBridge: {
      arabic: 'الزَّكَاةَ',
      transliteration: 'Az-Zakah',
      meaning: 'The purifying almsgiving.',
      note: 'الزَّكَاةَ — zayn with shadda begins one of the five pillars of Islam.',
    },
  },
  {
    id: 'al12',
    stage: 'alphabet',
    title: 'Sin (س) — The Smooth Hiss',
    objective: 'Write sin in all positions and produce a clean unvoiced s-sound.',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Trace sin in 4 positions', 'Sin vs sad vs zayn distinction drill', '5 sin words from Quran'],
    quranBridge: {
      arabic: 'سَبِيلِ اللَّهِ',
      transliteration: 'Sabilillah',
      meaning: 'The path of Allah.',
      note: 'سَبِيلِ — sin starts this pivotal Quranic phrase about striving in the way of God.',
    },
  },
  {
    id: 'al13',
    stage: 'alphabet',
    title: 'Shin (ش) — The Shushing Letter',
    objective: 'Produce the "sh" sound and write shin distinctly from sin by its three dots.',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Shushing sound warm-up', 'Sin vs shin visual sorting', '5 shin words from Quran'],
    quranBridge: {
      arabic: 'شَهِيدٌ',
      transliteration: 'Shahid',
      meaning: 'A witness.',
      note: 'شَهِيدٌ shares a root with شَهَادَة (the testimony) — shin is in the shahada itself.',
    },
  },
  {
    id: 'al14',
    stage: 'alphabet',
    title: 'Sad (ص) — The Emphatic S',
    objective: 'Produce the emphatic sad with retracted tongue creating a heavy "s" quality.',
    duration: '12 min',
    challengeLevel: 'Starter+',
    drills: ['Tongue retraction drill', 'Contrast sin vs sad', '5 sad words, read with heavy quality'],
    quranBridge: {
      arabic: 'الصِّرَاطَ',
      transliteration: 'As-Sirat',
      meaning: 'The path.',
      note: 'الصِّرَاطَ in al-Fatihah — using sin instead of sad would be a recitation error.',
    },
  },
  {
    id: 'al15',
    stage: 'alphabet',
    title: 'Dad (ض) — The Letter of Arabic',
    objective: 'Produce the unique dad — found only in Arabic — with correct emphatic heaviness.',
    duration: '14 min',
    challengeLevel: 'Starter+',
    drills: ['Lateral tongue-edge pressure drill', 'Dad vs dal vs sad distinction', '5 dad words read aloud'],
    quranBridge: {
      arabic: 'الْمَغْضُوبِ',
      transliteration: 'Al-Maghdub',
      meaning: 'Those who earned anger.',
      note: 'الْمَغْضُوبِ from al-Fatihah — dad is called "letter of Arabic" as it is unique to this language.',
    },
  },
  {
    id: 'al16',
    stage: 'alphabet',
    title: 'Ta Emphatic (ط) — The Heavy Stop',
    objective: 'Produce emphatic ta with retracted tongue and distinguish it from regular ta (ت).',
    duration: '12 min',
    challengeLevel: 'Starter+',
    drills: ['Light ta vs heavy ta contrast drill', 'Trace ط in 4 positions', '5 ta-emphatic words'],
    quranBridge: {
      arabic: 'طَيِّبَةٌ',
      transliteration: 'Tayyibah',
      meaning: 'Good / wholesome.',
      note: 'طَيِّبَةٌ — the heavy ط gives an entirely different quality than regular ت would.',
    },
  },
  {
    id: 'al17',
    stage: 'alphabet',
    title: 'Dha Emphatic (ظ) — The Heavy Dh',
    objective: 'Produce emphatic dha and distinguish it from dhal (ذ) and dal (د).',
    duration: '12 min',
    challengeLevel: 'Starter+',
    drills: ['ذ vs ظ minimal pair drill', 'Find ظ in 5 Quran words', 'Emphatic vs non-emphatic comparison'],
    quranBridge: {
      arabic: 'الظَّالِمِينَ',
      transliteration: 'Az-zalimin',
      meaning: 'The wrongdoers.',
      note: 'الظَّالِمِينَ — the heavy ظ gives this word its gravity; confusing it with ذ changes the word.',
    },
  },
  {
    id: 'al18',
    stage: 'alphabet',
    title: 'Ayn (ع) — The Deepest Letter',
    objective: 'Produce the voiced pharyngeal fricative ayn correctly from the throat.',
    duration: '14 min',
    challengeLevel: 'Starter+',
    drills: ['Throat constriction warm-up', 'Ayn vs hamzah minimal pairs', 'Recite 5 ayn-heavy ayat'],
    quranBridge: {
      arabic: 'الْعَالَمِينَ',
      transliteration: 'Al-alamin',
      meaning: 'The worlds.',
      note: "الْعَالَمِينَ in al-Fatihah — the ayn is one of the most important sounds in Quranic recitation.",
    },
  },
  {
    id: 'al19',
    stage: 'alphabet',
    title: 'Ghayn (غ) — The Gargled Letter',
    objective: 'Produce the voiced uvular ghayn — like a soft French "r" — and distinguish from ayn.',
    duration: '12 min',
    challengeLevel: 'Starter+',
    drills: ['French-r gargling warm-up', 'Ayn vs ghayn contrast', '5 ghayn words from Quran'],
    quranBridge: {
      arabic: 'الْغَيْبِ',
      transliteration: 'Al-ghayb',
      meaning: 'The unseen.',
      note: 'الْغَيْبِ — ghayn starts this theologically crucial word about faith in what cannot be seen.',
    },
  },
  {
    id: 'al20',
    stage: 'alphabet',
    title: 'Fa (ف) — The Gentle Puff',
    objective: 'Write fa in all positions and produce a clean labiodental f-sound.',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Trace fa in 4 positions', 'Fa vs qaf distinction drill', '5 fa words from Quran'],
    quranBridge: {
      arabic: 'فَاطِرَ السَّمَاوَاتِ',
      transliteration: 'Fatira s-samawat',
      meaning: 'Originator of the heavens.',
      note: 'فَاطِرَ — fa begins this beautiful divine attribute meaning the Originator of creation.',
    },
  },
  {
    id: 'al21',
    stage: 'alphabet',
    title: 'Qaf (ق) — The Deep Click',
    objective: 'Produce qaf from the very back of the tongue against the uvula — not like English "k".',
    duration: '12 min',
    challengeLevel: 'Starter+',
    drills: ['Back-of-tongue click drill', 'Kaf vs qaf comparison', 'Read 8 qaf words aloud'],
    quranBridge: {
      arabic: 'الْقُرْآنِ',
      transliteration: 'Al-Quran',
      meaning: 'The Quran.',
      note: 'الْقُرْآنِ — qaf is the opening sound of the name of the Holy Book itself.',
    },
  },
  {
    id: 'al22',
    stage: 'alphabet',
    title: 'Kaf (ك) — The Clear Velar',
    objective: 'Write kaf in all positions and produce a clear velar k-stop (less deep than qaf).',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Trace kaf in 4 positions', 'Kaf vs qaf depth comparison', '5 kaf words from Quran'],
    quranBridge: {
      arabic: 'كِتَابٌ',
      transliteration: 'Kitab',
      meaning: 'A book.',
      note: 'كِتَابٌ — kaf starts "book" which shares a root with كَتَبَ (to write).',
    },
  },
  {
    id: 'al23',
    stage: 'alphabet',
    title: 'Lam (ل) — The Smooth Lateral',
    objective: 'Produce the clear lateral lam and understand when it becomes heavy in the word Allah.',
    duration: '12 min',
    challengeLevel: 'Starter',
    drills: ['Trace lam in 4 positions', 'Light vs heavy lam in Allah drill', '5 lam words from Quran'],
    quranBridge: {
      arabic: 'اللَّهِ',
      transliteration: 'Allahi',
      meaning: 'Allah.',
      note: 'The lam in اللَّهِ becomes heavy (tafkheem) after a fat-ha — a special rule for the divine Name.',
    },
  },
  {
    id: 'al24',
    stage: 'alphabet',
    title: 'Mim (م) — The Closed Lips',
    objective: 'Write mim in all positions and produce the bilabial nasal m correctly.',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Trace mim in 4 positions', 'Mim vs nun distinction drill', '5 mim words from Quran'],
    quranBridge: {
      arabic: 'مَالِكِ يَوْمِ الدِّينِ',
      transliteration: 'Maliki yawmid-din',
      meaning: 'Master of the Day of Judgment.',
      note: "مَالِكِ — mim also opens مُحَمَّد, the Prophet's name ﷺ.",
    },
  },
  {
    id: 'al25',
    stage: 'alphabet',
    title: 'Nun (ن) — The Nasal Connector',
    objective: 'Write nun in all positions, produce a dental nasal n, and see the noon sakinah rule.',
    duration: '12 min',
    challengeLevel: 'Starter',
    drills: ['Trace nun in 4 positions', 'Nun vs mim nasal distinction', 'Identify noon sakinah in 5 words'],
    quranBridge: {
      arabic: 'نَسْتَعِينُ',
      transliteration: 'Nastain',
      meaning: 'We seek help.',
      note: 'نَسْتَعِينُ ends with noon — the sound that closes verse 5 of al-Fatihah.',
    },
  },
  {
    id: 'al26',
    stage: 'alphabet',
    title: 'Ha (ه) — The Gentle Exhale',
    objective: 'Write ha in all its shape variants and produce a glottal h-breath, distinct from ح.',
    duration: '10 min',
    challengeLevel: 'Starter',
    drills: ['Ha shape variants practice', 'Ha vs ha (ح) vs kha comparison', '5 ha words from Quran'],
    quranBridge: {
      arabic: 'هُوَ',
      transliteration: 'Huwa',
      meaning: 'He.',
      note: 'هُوَ — the simplest pronoun for Allah, and begins with ha.',
    },
  },
  {
    id: 'al27',
    stage: 'alphabet',
    title: 'Waw (و) — The Double Duty',
    objective: 'Recognize waw as both consonant (w) and long vowel (uu), and as the conjunction "and".',
    duration: '12 min',
    challengeLevel: 'Starter',
    drills: ['Consonant waw vs long vowel waw sorting', 'Waw as "and" in 10 Quran phrases', 'Trace waw shape'],
    quranBridge: {
      arabic: 'وَالتِّينِ وَالزَّيْتُونِ',
      transliteration: 'Wat-tini waz-zaytun',
      meaning: 'By the fig and the olive.',
      note: 'Both و here are the conjunction "and" — waw at its most common Quranic role.',
    },
  },
  {
    id: 'al28',
    stage: 'alphabet',
    title: 'Ya (ي) — The Double Duty Finale',
    objective: 'Recognize ya as consonant (y), long vowel (ii), and the vocative particle يَا.',
    duration: '12 min',
    challengeLevel: 'Starter',
    drills: ['Consonant vs vowel ya identification', 'يَا (O!) in Quran addresses drill', 'Trace ya in 4 positions'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا النَّاسُ',
      transliteration: 'Ya ayyuhan-nas',
      meaning: 'O mankind!',
      note: 'يَا is the vocative particle — it precedes every direct address to humanity in the Quran.',
    },
  },

  // ── BEGINNER (b1–b40) ────────────────────────────────────────────────────
  {
    id: 'b1',
    stage: 'beginner',
    title: 'Letter Quest: Shapes and Sounds',
    objective: 'Recognize all 28 Arabic letters in isolated forms and pronounce core sounds.',
    duration: '18 min',
    challengeLevel: 'Starter',
    drills: ['Trace 8 letters', 'Spot the odd letter', 'Repeat difficult sounds: ع, ح, خ'],
    quranBridge: {
      arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
      transliteration: 'Iqra bismi rabbika alladhi khalaq',
      meaning: 'Read in the name of your Lord who created.',
      note: 'You immediately see letters hamzah, qaf, and kha in action.',
    },
  },
  {
    id: 'b2',
    stage: 'beginner',
    title: 'Vowel Magic: Fathah, Kasrah, Dammah',
    objective: 'Read short-vowel syllables smoothly without pausing between letters.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Build 12 syllables', 'Fast-read mini words', 'Pair sound to symbol'],
    quranBridge: {
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: 'Alhamdu lillahi rabbil alamin',
      meaning: 'All praise is for Allah, Lord of the worlds.',
      note: 'Short vowels unlock fluent reading in Surah al-Fatihah.',
    },
  },
  {
    id: 'b3',
    stage: 'beginner',
    title: 'Joining Letters Lab',
    objective: 'Understand initial, middle, and final letter forms.',
    duration: '22 min',
    challengeLevel: 'Starter+',
    drills: ['Join 15 letter chains', 'Fix broken words', 'Read 10 connected words'],
    quranBridge: {
      arabic: 'مَالِكِ يَوْمِ الدِّينِ',
      transliteration: 'Maliki yawmid-din',
      meaning: 'Master of the Day of Judgment.',
      note: 'You train the eye to follow connected script instantly.',
    },
  },
  {
    id: 'b4',
    stage: 'beginner',
    title: 'First 60 Quran Words',
    objective: 'Memorize and understand high-frequency Quran words.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Flash 20 words', 'Context matching', 'Daily 5-word recall'],
    quranBridge: {
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      transliteration: 'Qul huwa Allahu ahad',
      meaning: 'Say: He is Allah, One.',
      note: 'Words like قل and هو repeat across many surahs.',
    },
  },
  {
    id: 'b5',
    stage: 'beginner',
    title: 'Reading Sprint: From Letters to Lines',
    objective: 'Read short ayat with rhythm and confidence.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Ayah pacing drill', 'Breath control', 'Stop-sign practice'],
    quranBridge: {
      arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ',
      transliteration: 'Inna ataynaka al-kawthar',
      meaning: 'Indeed, We have granted you al-Kawthar.',
      note: 'You begin seeing sentence flow, not isolated words.',
    },
  },
  {
    id: 'b6',
    stage: 'beginner',
    title: 'Sun & Moon Letters',
    objective: 'Master the two letter groups that control how ال is pronounced.',
    duration: '20 min',
    challengeLevel: 'Starter+',
    drills: ['Sort 14 sun vs 14 moon letters', 'Read 20 al- words aloud', 'Listen-and-repeat contrast pairs'],
    quranBridge: {
      arabic: 'الرَّحْمَٰنِ الرَّحِيمِ',
      transliteration: 'Ar-Rahman ir-Rahim',
      meaning: 'The Most Gracious, the Most Merciful.',
      note: 'رّ shows a sun letter assimilating the lam of al- perfectly.',
    },
  },
  {
    id: 'b7',
    stage: 'beginner',
    title: 'Long Vowels: Alif, Waw, Ya',
    objective: 'Identify and pronounce the three long vowels (madd asli).',
    duration: '22 min',
    challengeLevel: 'Starter+',
    drills: ['Mark long vs short in 15 words', 'Minimal pair drills', 'Read 10 madd words from Quran'],
    quranBridge: {
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      transliteration: 'Iyyaka nabudu wa iyyaka nastain',
      meaning: 'You alone we worship, and You alone we ask for help.',
      note: 'The long alif in إيا carries an extended vowel sound critical to meaning.',
    },
  },
  {
    id: 'b8',
    stage: 'beginner',
    title: 'Tanwin: Double Vowels',
    objective: 'Read and write tanwin correctly at end of indefinite nouns.',
    duration: '20 min',
    challengeLevel: 'Starter+',
    drills: ['Add tanwin to 12 nouns', 'Read aloud tanwin endings', 'Spot tanwin in 5 Quran snippets'],
    quranBridge: {
      arabic: 'هُدًى لِّلْمُتَّقِينَ',
      transliteration: 'Hudan lil-muttaqin',
      meaning: 'A guidance for the mindful.',
      note: 'هُدًى ends in tanwin fathah — an indefinite noun indicating "a guidance".',
    },
  },
  {
    id: 'b9',
    stage: 'beginner',
    title: 'Shadda: The Doubled Consonant',
    objective: 'Recognise and pronounce shadda-bearing letters with correct elongation.',
    duration: '18 min',
    challengeLevel: 'Starter+',
    drills: ['Shadow-read 10 shadda words', 'Clap on every shadda', 'Contrast pairs drill'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ بِكُلِّ شَيْءٍ عَلِيمٌ',
      transliteration: 'Innallaha bikulli shayin alim',
      meaning: 'Indeed, Allah is All-Knowing of everything.',
      note: 'إنّ has shadda on the nun — miss it and meaning shifts dramatically.',
    },
  },
  {
    id: 'b10',
    stage: 'beginner',
    title: 'Sukun: The Silent Stopper',
    objective: 'Stop the vowel sound correctly at sukun letters for accurate Quranic reading.',
    duration: '18 min',
    challengeLevel: 'Starter+',
    drills: ['Mark sukun in 12 words', 'Read 5 short ayat with pauses', 'CVC syllable building'],
    quranBridge: {
      arabic: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      transliteration: 'Walam yakun lahu kufuwan ahad',
      meaning: 'Nor is there to Him any equivalent.',
      note: 'لَمْ has sukun on the mim — a closed syllable you hear in every recitation.',
    },
  },
  {
    id: 'b11',
    stage: 'beginner',
    title: 'Hamza: Its Four Seats',
    objective: 'Identify hamza sitting on alif, waw, ya, and independently (hamza on the line).',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Sort hamza words by seat', 'Write hamza in 10 words', 'Read hamza-heavy passage'],
    quranBridge: {
      arabic: 'أَمَّنْ يُجِيبُ الْمُضْطَرَّ',
      transliteration: 'Amman yujibul mudtarr',
      meaning: 'Who answers the distressed one?',
      note: 'Three different hamzas appear in just four words here.',
    },
  },
  {
    id: 'b12',
    stage: 'beginner',
    title: 'Emphatic Letters: Sad, Dad, Ta, Dha',
    objective: 'Produce the four emphatic "heavy" letters with correct throat articulation.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Minimal pairs: س vs ص, د vs ض', 'Tongue placement mirror drill', 'Spot emphatic letters in 10 words'],
    quranBridge: {
      arabic: 'الصِّرَاطَ الْمُسْتَقِيمَ',
      transliteration: 'As-sirat al-mustaqim',
      meaning: 'The straight path.',
      note: 'ص and ط are emphatic letters; confusing ص with س changes the word entirely.',
    },
  },
  {
    id: 'b13',
    stage: 'beginner',
    title: 'The Letters Ayn & Ghain',
    objective: 'Produce ع and غ from the correct pharyngeal and uvular articulation points.',
    duration: '20 min',
    challengeLevel: 'Momentum',
    drills: ['Throat warm-up exercises', '10-word contrast drill', 'Read ayn-heavy Quran line'],
    quranBridge: {
      arabic: 'وَتَوَاصَوْا بِالصَّبْرِ',
      transliteration: 'Watawassaw bis-sabr',
      meaning: 'And advised each other to patience.',
      note: 'وَ uses the throat-based waw — practising back consonants opens deeper Quran sounds.',
    },
  },
  {
    id: 'b14',
    stage: 'beginner',
    title: 'Letter Families and Dot Groups',
    objective: 'Learn the 5 letter families that share dots and base shapes.',
    duration: '20 min',
    challengeLevel: 'Starter+',
    drills: ['Match dotted to undotted base', 'Family card sort', 'Speed read 15 differentiated words'],
    quranBridge: {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',
      transliteration: 'Bismillahir rahmanir rahim',
      meaning: 'In the name of Allah, the Most Gracious, the Most Merciful.',
      note: 'ب, ن, ي and ت share nearly the same base shape — dots are everything.',
    },
  },
  {
    id: 'b15',
    stage: 'beginner',
    title: 'The Lam-Alif Ligature',
    objective: 'Recognise and write the special لا combination correctly in all positions.',
    duration: '15 min',
    challengeLevel: 'Starter',
    drills: ['Trace 20 لا occurrences', 'Decode words with لا inside', 'Write bismillah from memory'],
    quranBridge: {
      arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
      transliteration: 'La ilaha illallah',
      meaning: 'There is no god but Allah.',
      note: 'The shahada shape is built on the لا ligature you are practising.',
    },
  },
  {
    id: 'b16',
    stage: 'beginner',
    title: 'Basic Nouns: Gender and Ta Marbuta',
    objective: 'Distinguish masculine from feminine nouns and recognize the ta marbuta marker.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Sort 20 nouns by gender', 'Add ta marbuta to 10 words', 'Context matching game'],
    quranBridge: {
      arabic: 'جَنَّةٌ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ',
      transliteration: 'Jannaton arduhas-samawatu wal ard',
      meaning: 'A paradise whose width spans the heavens and the earth.',
      note: 'جنّة uses ta marbuta — a feminine noun that recurs 77 times in the Quran.',
    },
  },
  {
    id: 'b17',
    stage: 'beginner',
    title: 'The Definite Article Al-',
    objective: 'Apply al- correctly including assimilation with sun letters.',
    duration: '20 min',
    challengeLevel: 'Momentum',
    drills: ['Attach al- to 15 words', 'Sun vs Moon sorting race', 'Read 8 al- phrases aloud'],
    quranBridge: {
      arabic: 'الرَّحْمَٰنُ عَلَّمَ الْقُرْآنَ',
      transliteration: 'Ar-Rahmanu allamal-quran',
      meaning: 'The Most Gracious has taught the Quran.',
      note: 'الرحمن assimilates ال with the sun letter ر, while القرآن keeps the lam audible.',
    },
  },
  {
    id: 'b18',
    stage: 'beginner',
    title: 'Dual Form: Muthanna',
    objective: 'Form the dual of nouns and understand -ani vs -ayni endings.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Dual formation from 12 nouns', 'Raf vs jarr dual pairs', 'Find 5 duals in short surahs'],
    quranBridge: {
      arabic: 'رَبُّ الْمَشْرِقَيْنِ وَرَبُّ الْمَغْرِبَيْنِ',
      transliteration: "Rabbul mashriqayni wa rabbul maghribayn",
      meaning: 'Lord of the two easts and Lord of the two wests.',
      note: 'الْمَشْرِقَيْنِ and الْمَغْرِبَيْنِ are dual genitive forms — the -ayni ending in action.',
    },
  },
  {
    id: 'b19',
    stage: 'beginner',
    title: 'Sound Masculine Plural (-oon / -een)',
    objective: 'Form the sound masculine plural and read its two case forms.',
    duration: '20 min',
    challengeLevel: 'Momentum',
    drills: ['Add -oon to 10 nouns', 'Case swap drill (raf vs jarr)', 'Spot SMP in Surah al-Muminun'],
    quranBridge: {
      arabic: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ',
      transliteration: 'Qad aflaha al-muminun',
      meaning: 'Certainly the believers have succeeded.',
      note: 'الْمُؤْمِنُونَ is a sound masculine plural in the nominative case with -oon.',
    },
  },
  {
    id: 'b20',
    stage: 'beginner',
    title: 'Sound Feminine Plural (-aat)',
    objective: 'Form and read the sound feminine plural ending in all cases.',
    duration: '18 min',
    challengeLevel: 'Momentum',
    drills: ['Convert 10 feminine nouns to plural', 'Fill-in-the-blank sentences', 'Read 5 Quran ayat with -aat'],
    quranBridge: {
      arabic: 'وَبَشِّرِ الْمُؤْمِنَاتِ',
      transliteration: 'Wabash-shiril-muminat',
      meaning: 'And give glad tidings to the believing women.',
      note: 'الْمُؤْمِنَاتِ is a sound feminine plural — the -aat ending you are practising.',
    },
  },
  {
    id: 'b21',
    stage: 'beginner',
    title: 'Broken Plurals: An Introduction',
    objective: 'Recognise the three most common broken plural patterns.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Match 15 singulars to broken plurals', 'Pattern spotting exercise', 'Quran plural hunt'],
    quranBridge: {
      arabic: 'وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ',
      transliteration: 'Walladhina amanu wa amilussa-alihat',
      meaning: 'And those who believed and did righteous deeds.',
      note: 'الصَّالِحَاتِ is a broken plural form that appears over 40 times in the Quran.',
    },
  },
  {
    id: 'b22',
    stage: 'beginner',
    title: 'Adjective Agreement',
    objective: 'Match adjectives to nouns in gender, number, case, and definiteness.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Agree 12 adjective-noun pairs', 'Spot agreement errors in 8 sentences', 'Build 5 Quranic phrases'],
    quranBridge: {
      arabic: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',
      transliteration: 'Sirata alladhina anamta alayhim',
      meaning: 'The path of those upon whom You have bestowed favor.',
      note: 'Every noun-adjective pair in al-Fatihah matches perfectly in all four features.',
    },
  },
  {
    id: 'b23',
    stage: 'beginner',
    title: 'Question Words: Man, Ma, Kayfa, Ayna',
    objective: 'Use the 7 core Arabic question words accurately in context.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Question word matching drill', 'Translate 10 Quranic questions', 'Build 6 questions from prompts'],
    quranBridge: {
      arabic: 'مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ',
      transliteration: 'Man dhalladhi yashfau indahu',
      meaning: 'Who can intercede with Him?',
      note: 'مَن (who) is one of the seven question words and appears in Ayatul Kursi.',
    },
  },
  {
    id: 'b24',
    stage: 'beginner',
    title: 'Islamic Phrases: Daily Vocabulary',
    objective: 'Learn 30 essential daily Islamic phrases and their exact meanings.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['Meaning match for 30 phrases', 'Situation role-play', 'Spell 10 phrases from memory'],
    quranBridge: {
      arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
      transliteration: "Waqul rabbi zidni ilma",
      meaning: 'And say: My Lord, increase me in knowledge.',
      note: "This du'a encapsulates why we learn — a phrase to say before every lesson.",
    },
  },
  {
    id: 'b25',
    stage: 'beginner',
    title: 'Greetings and Introductions',
    objective: 'Hold a basic introduction conversation using correct Arabic forms.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Greeting dialogue practice', 'Formal vs casual distinction', 'Role-play 3 introduction scenarios'],
    quranBridge: {
      arabic: 'وَإِذَا حُيِّيتُم بِتَحِيَّةٍ فَحَيُّوا بِأَحْسَنَ مِنْهَا',
      transliteration: 'Wa idha huyyitum bitahiyyatin fahayyuu biahsana minha',
      meaning: 'When you are greeted with a greeting, return it with something better.',
      note: 'The Quran addresses the ethics of greeting — your opening lesson in speaking.',
    },
  },
  {
    id: 'b26',
    stage: 'beginner',
    title: 'Numbers 1–10',
    objective: 'Say, read, and write Arabic numerals 1-10 with correct gender agreement.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Count 1-10 forwards and backwards', 'Gender agreement sorting', 'Number dictation'],
    quranBridge: {
      arabic: 'سَبْعَ سَمَاوَاتٍ طِبَاقًا',
      transliteration: "Sab'a samawatin tibaqan",
      meaning: 'Seven heavens in layers.',
      note: 'سبع (seven) is one of the most common numbers in the Quran.',
    },
  },
  {
    id: 'b27',
    stage: 'beginner',
    title: 'Numbers 11–1000',
    objective: 'Build and read compound Arabic numbers up to 1000.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Say numbers from hearing', 'Translate Quranic number phrases', 'Match digits to Arabic words'],
    quranBridge: {
      arabic: 'أَلْفَ شَهْرٍ',
      transliteration: 'Alfa shahr',
      meaning: 'One thousand months.',
      note: 'ألف (1000) appears in Laylat al-Qadr — the night better than 1000 months.',
    },
  },
  {
    id: 'b28',
    stage: 'beginner',
    title: 'Days, Months, and Time Expressions',
    objective: 'Name the days of the week, Islamic months, and common time expressions.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Days of week flashcard race', 'Islamic month order quiz', 'Build 5 time sentences'],
    quranBridge: {
      arabic: 'إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا',
      transliteration: 'Inna iddata ash-shuhori indallahi ithna ashara shahran',
      meaning: 'Indeed, the number of months with Allah is twelve months.',
      note: "12 months are named — including Muharram, Ramadan, and Dhul-Hijja you'll study.",
    },
  },
  {
    id: 'b29',
    stage: 'beginner',
    title: 'Family Vocabulary',
    objective: 'Learn 25 core family terms and use them in simple sentences.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Family tree labelling', 'Meaning quick-fire', 'Build 5 sentences about your family'],
    quranBridge: {
      arabic: 'وَاذْكُر فِي الْكِتَابِ إِبْرَاهِيمَ',
      transliteration: 'Wadhkur fil-kitabi Ibrahim',
      meaning: 'And mention in the Book, Ibrahim.',
      note: 'The Quran is full of family narratives — learning family terms unlocks these stories.',
    },
  },
  {
    id: 'b30',
    stage: 'beginner',
    title: 'Body Parts and the Human Form',
    objective: 'Name 20 body parts and understand related Quranic references.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Label a body diagram in Arabic', 'Quran reference match', 'Fill-in-the-blank sentences'],
    quranBridge: {
      arabic: 'وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ',
      transliteration: 'Walaqad karramna bani adam',
      meaning: 'And We have certainly honored the children of Adam.',
      note: 'The body and its honor are addressed repeatedly — body-part vocab gives rich context.',
    },
  },
  {
    id: 'b31',
    stage: 'beginner',
    title: 'Colors and Descriptions',
    objective: 'Use the 8 core Arabic colors and describe objects in simple sentences.',
    duration: '18 min',
    challengeLevel: 'Starter',
    drills: ['Color flashcards with gender forms', 'Describe 5 objects in Arabic', 'Find colors in Quran descriptions'],
    quranBridge: {
      arabic: 'وَمِنَ الْجِبَالِ جُدَدٌ بِيضٌ وَحُمْرٌ',
      transliteration: 'Wa minal-jibali jududun bidun wahumrun',
      meaning: 'And from mountains are white and red stripes.',
      note: 'Color vocabulary is used to describe the natural world in Quranic ayat.',
    },
  },
  {
    id: 'b32',
    stage: 'beginner',
    title: 'Nature, Food, and Daily Life',
    objective: 'Build a 60-word everyday vocabulary bank covering nature, food, and home.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Category sort into 4 groups', 'Context sentence fill-in', 'Visual vocabulary map'],
    quranBridge: {
      arabic: 'فَلْيَنظُرِ الْإِنسَانُ إِلَى طَعَامِهِ',
      transliteration: 'Falyandhur al-insanu ila taamihi',
      meaning: 'Let man look at his food.',
      note: "طعام (food) — the Quran invites us to reflect on everyday things you're now naming.",
    },
  },
  {
    id: 'b33',
    stage: 'beginner',
    title: 'Simple Sentences: Mubtada and Khabar',
    objective: 'Build correct Arabic sentences using subject-predicate (mubtada-khabar) order.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Identify mubtada and khabar in 10 sentences', 'Build 8 sentences from word cards', 'Arabic to English sentence translation'],
    quranBridge: {
      arabic: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',
      transliteration: 'Allahu nurus-samawati wal-ard',
      meaning: 'Allah is the Light of the heavens and the earth.',
      note: 'Allah (mubtada) is Light (khabar) — the simplest most powerful sentence structure.',
    },
  },
  {
    id: 'b34',
    stage: 'beginner',
    title: 'Arabic Has No "Is/Are": Jumlah Ismiyya',
    objective: 'Understand that Arabic drops the verb "to be" in the present tense.',
    duration: '20 min',
    challengeLevel: 'Starter+',
    drills: ['Build 10 is/are sentences without a verb', 'Translate English sentences dropping "is"', 'Spot jumlah ismiyya in 5 ayat'],
    quranBridge: {
      arabic: 'وَاللَّهُ بِكُلِّ شَيْءٍ عَلِيمٌ',
      transliteration: 'Wallahu bikulli shayin alim',
      meaning: 'And Allah is of everything All-Knowing.',
      note: 'No verb "is" needed — the predicate عليم sits directly after the subject.',
    },
  },
  {
    id: 'b35',
    stage: 'beginner',
    title: 'Common Prepositions',
    objective: 'Use the 10 most frequent Arabic prepositions accurately.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Preposition fill-in-the-blank', 'Translate 10 prepositional phrases', 'Build 5 sentences with prepositions'],
    quranBridge: {
      arabic: 'لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
      transliteration: 'Lillahi ma fis-samawati wama fil-ard',
      meaning: 'To Allah belongs what is in the heavens and what is on earth.',
      note: 'لِـ (to/for) and فِي (in) are two of the top 5 most common prepositions in the Quran.',
    },
  },
  {
    id: 'b36',
    stage: 'beginner',
    title: 'Attached Pronouns: Basics',
    objective: 'Learn the 8 attached pronouns suffixed to nouns and prepositions.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Detach and identify 12 pronouns', 'Reattach pronoun drill', 'Read 5 ayat with pronoun comprehension'],
    quranBridge: {
      arabic: 'رَبِّهِمْ وَبِحَمْدِهِ',
      transliteration: 'Rabbihim wabihamdih',
      meaning: 'Their Lord and His praise.',
      note: 'هِمْ (their) and هِ (his) are attached pronouns that carry entire meanings in one syllable.',
    },
  },
  {
    id: 'b37',
    stage: 'beginner',
    title: 'Reading Juz Amma: Short Surahs',
    objective: 'Read all 37 surahs of Juz Amma with correct pronunciation.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Read 5 surahs back-to-back', 'Self-assess pronunciation checklist', 'Memorize meanings of 3 new surahs'],
    quranBridge: {
      arabic: 'وَالضُّحَى وَاللَّيْلِ إِذَا سَجَى',
      transliteration: 'Wad-duhaa wallayli idha saja',
      meaning: 'By the morning brightness and by the night when it is still.',
      note: 'Juz Amma contains rhythmic surahs perfect for building reading fluency.',
    },
  },
  {
    id: 'b38',
    stage: 'beginner',
    title: 'Tajweed Basics: Qalqalah Letters',
    objective: 'Produce the 5 qalqalah letters with their characteristic echo sound.',
    duration: '20 min',
    challengeLevel: 'Starter+',
    drills: ['Identify 5 qalqalah letters: ق ط ب ج د', 'Tap-and-echo drill', 'Read 3 surah snippets with qalqalah'],
    quranBridge: {
      arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
      transliteration: 'Qul audhu bi rabbil falaq',
      meaning: 'Say: I seek refuge in the Lord of daybreak.',
      note: 'Both ق in قُلْ and الفَلَقِ are qalqalah letters with an echo when stopping.',
    },
  },
  {
    id: 'b39',
    stage: 'beginner',
    title: 'Tajweed: Noon and Meem Rules',
    objective: 'Apply the four rules of noon sakinah and tanwin correctly.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Colour-code idhhar, idgham, iqlab, ikhfa in a passage', 'Listen and identify rule type', 'Read 5 ayat applying each rule'],
    quranBridge: {
      arabic: 'مِن شَرِّ مَا خَلَقَ',
      transliteration: 'Min sharri ma khalaq',
      meaning: 'From the evil of what He created.',
      note: 'مِن شَرِّ — observe the noon sakinah followed by شَ: an ikhfa rule in action.',
    },
  },
  {
    id: 'b40',
    stage: 'beginner',
    title: 'Beginner Graduation: al-Fatihah Mastery',
    objective: 'Recite, translate, and grammatically explain every word of Surah al-Fatihah.',
    duration: '35 min',
    challengeLevel: 'Capstone',
    drills: ['Word-by-word explanation from memory', 'Grammatical labelling of every word', 'Teach it back to a partner'],
    quranBridge: {
      arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
      transliteration: 'Ihdinas-siratal mustaqim',
      meaning: 'Guide us to the straight path.',
      note: 'Mastering every word of al-Fatihah is the most powerful beginner milestone possible.',
    },
  },
  {
    id: 'b41',
    stage: 'beginner',
    title: 'Verb-Subject-Object: Arabic Word Order',
    objective: 'Understand that Arabic verbal sentences default to VSO order unlike English.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Reorder 10 sentences to VSO', 'Identify verb first in 10 Quran sentences', 'Build 5 VSO sentences from prompts'],
    quranBridge: {
      arabic: 'خَلَقَ اللَّهُ السَّمَاوَاتِ وَالْأَرْضَ',
      transliteration: 'Khalaqallahu s-samawati wal-ard',
      meaning: 'Allah created the heavens and the earth.',
      note: 'Verb (خلق) → Subject (الله) → Object — classic Quranic VSO order.',
    },
  },
  {
    id: 'b42',
    stage: 'beginner',
    title: 'Professions: 25 Job Titles',
    objective: 'Name 25 Arabic professions and use them in simple sentences with masculine/feminine forms.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Match professions to images', 'Add ta marbuta for female versions', 'Build 5 "he is a..." sentences'],
    quranBridge: {
      arabic: 'وَمَا مُحَمَّدٌ إِلَّا رَسُولٌ',
      transliteration: 'Wama Muhammadun illa rasul',
      meaning: 'Muhammad is not but a messenger.',
      note: 'رَسُولٌ (messenger) is a profession noun — one of the most significant in the Quran.',
    },
  },
  {
    id: 'b43',
    stage: 'beginner',
    title: 'Animals: 30 Arabic Animal Names',
    objective: 'Learn 30 animal names found in Quran and hadith with correct pronunciation.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['Animal flashcard race', 'Match Arabic to image', 'Find 5 animal names in Quran stories'],
    quranBridge: {
      arabic: 'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ',
      transliteration: 'Wamin kulli shayin khalaqna zawjayn',
      meaning: 'And of all things We created two mates.',
      note: 'The animal kingdom is referenced throughout — knowing their Arabic names enriches Quran comprehension.',
    },
  },
  {
    id: 'b44',
    stage: 'beginner',
    title: 'Weather and Seasons',
    objective: 'Describe weather conditions and the four seasons in Arabic.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Weather vocabulary matching', 'Season sentence building', 'Find weather references in Quran'],
    quranBridge: {
      arabic: 'وَأَنزَلَ مِنَ السَّمَاءِ مَاءً',
      transliteration: 'Wa anzala minas-samai maa',
      meaning: 'And He sent down from the sky water.',
      note: 'مَاءً (water/rain) is the most fundamental weather word — it appears over 60 times in the Quran.',
    },
  },
  {
    id: 'b45',
    stage: 'beginner',
    title: 'Food and Drink Vocabulary',
    objective: 'Build a 40-word food and drink vocabulary bank with halal/haram context.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['Category sort: fruits / grains / drinks', 'Halal food identification exercise', 'Build a simple Arabic menu'],
    quranBridge: {
      arabic: 'كُلُوا مِن طَيِّبَاتِ مَا رَزَقْنَاكُمْ',
      transliteration: 'Kulu min tayyibati ma razaqnakum',
      meaning: 'Eat from the good things We have provided you.',
      note: 'طَيِّبَاتِ (wholesome/lawful foods) — the Quran repeatedly connects food to gratitude and law.',
    },
  },
  {
    id: 'b46',
    stage: 'beginner',
    title: 'The Home: Rooms and Objects',
    objective: 'Name 30 household items and rooms in Arabic.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Label a house diagram', 'Room-object matching game', 'Build 5 "The X is in the Y" sentences'],
    quranBridge: {
      arabic: 'فِي بُيُوتٍ أَذِنَ اللَّهُ أَن تُرْفَعَ',
      transliteration: 'Fi buyutin adhina Allahu an turfa',
      meaning: 'In houses Allah has permitted to be raised.',
      note: 'بُيُوتٍ (houses/mosques) — the plural of بَيْت, the first home vocabulary word to know.',
    },
  },
  {
    id: 'b47',
    stage: 'beginner',
    title: 'Transport and Travel',
    objective: 'Use 20 transport and travel words in simple Arabic sentences.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Transport vocabulary matching', 'Build 5 journey sentences', 'Find travel references in Surah al-Quraysh'],
    quranBridge: {
      arabic: 'رِحْلَةَ الشِّتَاءِ وَالصَّيْفِ',
      transliteration: "Rihlata sh-shitai was-sayf",
      meaning: 'The journey of winter and summer.',
      note: 'رِحْلَة (journey) in Surah al-Quraysh — travel vocabulary rooted in Quranic context.',
    },
  },
  {
    id: 'b48',
    stage: 'beginner',
    title: 'Emotions and Feelings',
    objective: 'Express 20 emotions in Arabic with correct gender forms.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Emotion flashcard matching', 'Sentence stems: "I feel..."', 'Find emotion words in Quran stories'],
    quranBridge: {
      arabic: 'وَلَا تَحْزَنْ عَلَيْهِمْ',
      transliteration: 'Wala tahzan alayhim',
      meaning: 'And do not grieve over them.',
      note: 'تَحْزَنْ (to grieve) — emotion vocabulary deepens your connection to Allah\'s comforting address.',
    },
  },
  {
    id: 'b49',
    stage: 'beginner',
    title: 'School and Learning Vocabulary',
    objective: 'Name 25 school and learning items and use them in classroom-style sentences.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['School object labelling', 'Classroom instructions practice', '"The student reads..." sentence patterns'],
    quranBridge: {
      arabic: 'عَلَّمَهُ الْبَيَانَ',
      transliteration: 'Allamahul-bayan',
      meaning: 'He taught him eloquence.',
      note: 'عَلَّمَ (taught) — the root for teaching and knowledge, central to the culture of Islamic learning.',
    },
  },
  {
    id: 'b50',
    stage: 'beginner',
    title: 'Directions: Cardinal Points and Navigation',
    objective: 'Give and follow directions using Arabic direction vocabulary.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Compass labelling in Arabic', 'Give directions from a simple map', 'Find direction words in Quran'],
    quranBridge: {
      arabic: 'وَلِلَّهِ الْمَشْرِقُ وَالْمَغْرِبُ',
      transliteration: 'Walillahi l-mashriqu wal-maghrib',
      meaning: 'And to Allah belongs the East and the West.',
      note: 'الْمَشْرِقُ (east) and الْمَغْرِبُ (west) — direction vocabulary in a profound theological verse.',
    },
  },
  {
    id: 'b51',
    stage: 'beginner',
    title: 'Al-Asmaul Husna: Names 1-30',
    objective: 'Learn the first 30 of Allah\'s 99 beautiful names with meanings and simple sentences.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Flash 30 names and meanings', 'Match name to its meaning', 'Recite names 1-15 from memory'],
    quranBridge: {
      arabic: 'وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَى فَادْعُوهُ بِهَا',
      transliteration: 'Walillahi l-asmaul husna fad-uhu biha',
      meaning: 'And to Allah belong the Best Names, so call upon Him by them.',
      note: 'The Quran commands using the 99 names in du\'a — learning them is devotion and vocabulary combined.',
    },
  },
  {
    id: 'b52',
    stage: 'beginner',
    title: 'Al-Asmaul Husna: Names 31-66',
    objective: 'Learn Al-Asmaul Husna names 31-66 with meanings.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Flash names 31-66', 'Group names by theme (mercy, power, knowledge)', 'Match 20 names to their Quran contexts'],
    quranBridge: {
      arabic: 'هُوَ اللَّهُ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ',
      transliteration: 'Huwallahulladhi la ilaha illa huwwal-maliku l-quddus',
      meaning: 'He is Allah, other than whom there is no deity, the Sovereign, the Pure.',
      note: 'Surah al-Hashr 23 lists eight of the 99 names consecutively — a gift for name memorisers.',
    },
  },
  {
    id: 'b53',
    stage: 'beginner',
    title: 'Al-Asmaul Husna: Names 67-99',
    objective: 'Complete the 99 beautiful names with meanings and themes.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Flash names 67-99', 'Full 99-name recognition test', 'Write 10 favourite names with meanings'],
    quranBridge: {
      arabic: 'الصَّبُورُ',
      transliteration: 'As-Sabur',
      meaning: 'The Most Patient.',
      note: 'الصَّبُور is the 99th name — the last beautiful name carries the message of divine patience.',
    },
  },
  {
    id: 'b54',
    stage: 'beginner',
    title: '25 Prophets in the Quran',
    objective: 'Name all 25 prophets mentioned in the Quran in Arabic with their stories in brief.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Prophet name recognition drill', 'Match prophet to key story keyword', 'Recite all 25 in order'],
    quranBridge: {
      arabic: 'وَتِلْكَ حُجَّتُنَا آتَيْنَاهَا إِبْرَاهِيمَ',
      transliteration: 'Watilka hujjatuna ataynahai Ibrahim',
      meaning: 'And that was Our argument which We gave to Abraham.',
      note: 'The Quran names 25 prophets — knowing their Arabic names transforms your reading of their stories.',
    },
  },
  {
    id: 'b55',
    stage: 'beginner',
    title: 'The Human Body: Internal and External',
    objective: 'Learn 30 body part names including internal organs with Quranic references.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Label a body diagram', 'Heart/mind vocabulary in Quran context', 'Build 5 body-related sentences'],
    quranBridge: {
      arabic: 'إِنَّ فِي ذَٰلِكَ لَذِكْرَى لِمَن كَانَ لَهُ قَلْبٌ',
      transliteration: 'Inna fi dhalika ladhikra liman kana lahu qalb',
      meaning: 'Indeed in that is a reminder for whoever has a heart.',
      note: 'قَلْبٌ (heart) — the most spiritually significant body word in the Quran.',
    },
  },
  {
    id: 'b56',
    stage: 'beginner',
    title: 'Demonstratives: Hadha, Hadhihi, Dhalika, Tilka',
    objective: 'Use all four core demonstratives correctly by gender and distance.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Demonstrative selection for 15 nouns', 'Near vs far distinction drill', 'Build 8 demonstrative sentences from prompts'],
    quranBridge: {
      arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ',
      transliteration: 'Dhalika l-kitabu la rayba fih',
      meaning: 'That is the Book about which there is no doubt.',
      note: 'ذَٰلِكَ (distant demonstrative) is used for the Quran — suggesting its exalted, transcendent nature.',
    },
  },
  {
    id: 'b57',
    stage: 'beginner',
    title: 'Basic Negation: La, Ma, Lan, Lam',
    objective: 'Use the four main negation particles correctly according to what they negate.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Negation particle matching', 'Fill-in-the-blank negation', 'Spot 4 negation types in 3 surahs'],
    quranBridge: {
      arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      transliteration: 'Lam yalid walam yulad',
      meaning: 'He neither begets nor was He begotten.',
      note: 'لَمْ + jussive verb — the most common past-negative structure in the Quran.',
    },
  },
  {
    id: 'b58',
    stage: 'beginner',
    title: 'Ordinal Numbers: First to Tenth',
    objective: 'Form and use ordinal numbers (first, second...) with correct gender agreement.',
    duration: '20 min',
    challengeLevel: 'Starter+',
    drills: ['Ordinal formation from 1-10', 'Gender agreement for ordinals', 'Use ordinals to describe surah order'],
    quranBridge: {
      arabic: 'الرَّكْعَةُ الأُولَى',
      transliteration: 'Ar-rakatu l-ula',
      meaning: 'The first prayer unit.',
      note: 'الأُولَى (first, feminine) — ordinal numbers are used constantly in Islamic worship contexts.',
    },
  },
  {
    id: 'b59',
    stage: 'beginner',
    title: 'Mosque and Prayer Vocabulary',
    objective: 'Master 30 mosque and salah-related vocabulary words.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['Mosque layout labelling', 'Prayer sequence vocabulary ordering', 'Meanings of Arabic prayer phrases'],
    quranBridge: {
      arabic: 'أَقِيمُوا الصَّلَاةَ',
      transliteration: 'Aquimus-salah',
      meaning: 'Establish prayer.',
      note: 'أَقِيمُوا الصَّلَاةَ — this command appears over 20 times in the Quran, making it essential vocabulary.',
    },
  },
  {
    id: 'b60',
    stage: 'beginner',
    title: 'Hajj and Umrah Vocabulary',
    objective: 'Learn 30 pilgrimage-related terms with their correct meanings and pronunciation.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Hajj rite sequence ordering', 'Term-meaning matching', 'Find Hajj vocabulary in Surah al-Hajj'],
    quranBridge: {
      arabic: 'وَأَتِمُّوا الْحَجَّ وَالْعُمْرَةَ لِلَّهِ',
      transliteration: 'Wa atimmul-hajja wal-umrata lillah',
      meaning: 'And complete the Hajj and Umrah for Allah.',
      note: 'الْحَجَّ and الْعُمْرَةَ — knowing these terms prepares you linguistically for one of Islam\'s greatest acts.',
    },
  },
  {
    id: 'b61',
    stage: 'beginner',
    title: 'Surah al-Ikhlas: Word by Word',
    objective: 'Translate and grammatically explain every word of Surah al-Ikhlas.',
    duration: '20 min',
    challengeLevel: 'Momentum',
    drills: ['Word-by-word translation', 'Grammar role labelling', 'Recite with meaning commentary'],
    quranBridge: {
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      transliteration: 'Qul huwallahu ahad',
      meaning: 'Say: He is Allah, the One.',
      note: 'Four short verses, yet the entire theology of tawhid is contained — the most concentrated surah.',
    },
  },
  {
    id: 'b62',
    stage: 'beginner',
    title: 'Surah al-Falaq: Word by Word',
    objective: 'Explain every word of Surah al-Falaq with vocabulary and grammatical notes.',
    duration: '20 min',
    challengeLevel: 'Momentum',
    drills: ['Root extraction for each new word', 'Translation without looking', 'Grammar: imperatives and genitive phrases'],
    quranBridge: {
      arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
      transliteration: 'Qul audu birabbal-falaq',
      meaning: 'Say: I seek refuge in the Lord of daybreak.',
      note: 'أَعُوذُ (I seek refuge) — a first-person verb form students learn in Surah al-Falaq.',
    },
  },
  {
    id: 'b63',
    stage: 'beginner',
    title: 'Surah an-Nas: Word by Word',
    objective: 'Explain every word of Surah an-Nas with vocabulary and grammar notes.',
    duration: '20 min',
    challengeLevel: 'Momentum',
    drills: ['Build full glossary of Surah an-Nas', 'Grammar: repetition of the genitive', 'Recite with understanding'],
    quranBridge: {
      arabic: 'مِن شَرِّ الْوَسْوَاسِ الْخَنَّاسِ',
      transliteration: 'Min sharril waswasil khannas',
      meaning: 'From the evil of the whispering retreater.',
      note: 'Two derived nouns (الوسواس and الخنّاس) built on roots you are now learning to decode.',
    },
  },
  {
    id: 'b64',
    stage: 'beginner',
    title: 'Surah al-Asr: Word by Word',
    objective: 'Break down all 14 words of Surah al-Asr with complete grammatical understanding.',
    duration: '18 min',
    challengeLevel: 'Momentum',
    drills: ['14-word glossary building', 'Grammatical roles: oath / subject / predicate', 'Explain the surah in your own words'],
    quranBridge: {
      arabic: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ',
      transliteration: 'Innal-insana lafi khusr',
      meaning: 'Indeed, mankind is in loss.',
      note: 'إِنَّ + لَفِي — double emphasis in just 4 words. The deepest short surah in the Quran.',
    },
  },
  {
    id: 'b65',
    stage: 'beginner',
    title: 'Surah al-Qadr: Word by Word',
    objective: 'Translate and explain every word of Surah al-Qadr.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Word-by-word glossary', 'The question-answer structure analysis', 'Recite with meaning awareness'],
    quranBridge: {
      arabic: 'لَيْلَةُ الْقَدْرِ خَيْرٌ مِّنْ أَلْفِ شَهْرٍ',
      transliteration: 'Laylatul-qadri khayrum min alfi shahr',
      meaning: 'The Night of Decree is better than a thousand months.',
      note: 'خَيْرٌ مِّنْ — the comparative construction "better than" is used for the greatest night of the year.',
    },
  },
  {
    id: 'b66',
    stage: 'beginner',
    title: 'Surah az-Zalzalah: Word by Word',
    objective: 'Explain every word of Surah az-Zalzalah with vocabulary and grammar notes.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Root extraction for 8 new vocabulary words', 'The idiom: "whoever does an atom\'s weight"', 'Full translation drill'],
    quranBridge: {
      arabic: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ',
      transliteration: 'Faman yamal mithqala dharratin khayran yarah',
      meaning: 'So whoever does an atom\'s weight of good will see it.',
      note: 'مِثْقَالَ ذَرَّةٍ — an idafa meaning "weight of a particle", the most powerful small-deed verse.',
    },
  },
  {
    id: 'b67',
    stage: 'beginner',
    title: 'Surah al-Bayyinah: Vocabulary Study',
    objective: 'Build a complete vocabulary list for Surah al-Bayyinah and translate 4 key verses.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Vocabulary extraction (20 words)', 'Translate verses 1, 5, 7, 8', 'New grammar: "حنفاء" broken plural'],
    quranBridge: {
      arabic: 'وَمَا أُمِرُوا إِلَّا لِيَعْبُدُوا اللَّهَ مُخْلِصِينَ لَهُ الدِّينَ',
      transliteration: 'Wama umiru illa liyabudu Allaha mukhlisina lahud-din',
      meaning: 'And they were not commanded except to worship Allah sincerely.',
      note: 'حَالٌ structure: مُخْلِصِينَ describes the manner of worship — a beginner-accessible hal clause.',
    },
  },
  {
    id: 'b68',
    stage: 'beginner',
    title: 'Arabic Sentence Joining: Wa, Fa, Thumma',
    objective: 'Use the three main coordinating conjunctions to join sentences and clauses.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Wa (and) vs Fa (so/and then) vs Thumma (then later) distinction', 'Join 10 sentence pairs using correct connector', 'Find all three in Surah al-Asr'],
    quranBridge: {
      arabic: 'وَتَوَاصَوْا بِالْحَقِّ وَتَوَاصَوْا بِالصَّبْرِ',
      transliteration: 'Watawassaw bilhaqqi watawassaw bis-sabr',
      meaning: 'And advised each other to truth, and advised each other to patience.',
      note: 'Wa joins two equal, parallel acts in Surah al-Asr — coordination at its most elegant.',
    },
  },
  {
    id: 'b69',
    stage: 'beginner',
    title: "Du'a Vocabulary: 30 Essential Terms",
    objective: "Learn 30 words that recur across Quranic du'as for deeper supplication.",
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ["Du'a vocabulary flashcards", "Translate 10 Quranic du'as", "Build a personal du'a using these words"],
    quranBridge: {
      arabic: 'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا',
      transliteration: "Rabbana la tuzigh qulubana ba'da idh hadaytana",
      meaning: 'Our Lord, let not our hearts deviate after You have guided us.',
      note: "This du'a contains 7 essential vocabulary items — all new learners should memorize it.",
    },
  },
  {
    id: 'b70',
    stage: 'beginner',
    title: 'Numbers in the Quran',
    objective: 'Find and translate every distinct number used in the Quran from 1 to 1000.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Quran number scavenger hunt', 'Match number to its surah context', 'Read 5 Quran number phrases aloud'],
    quranBridge: {
      arabic: 'إِن يَكُن مِّنكُمْ عِشْرُونَ صَابِرُونَ يَغْلِبُوا مِائَتَيْنِ',
      transliteration: 'In yakun minkum ishrun sabirun yaghlibu miatain',
      meaning: 'If there are twenty patient ones among you, they will overcome two hundred.',
      note: 'عِشْرُونَ (20) and مِائَتَيْنِ (200) — compound numbers appear naturally in Quranic battle strategy.',
    },
  },
  {
    id: 'b71',
    stage: 'beginner',
    title: 'Expressing Possession with Inda and Li',
    objective: 'Use عِنْد and لِ to express "having" something in Arabic.',
    duration: '20 min',
    challengeLevel: 'Momentum',
    drills: ['Build 8 "I have..." sentences', 'Convert Li sentences to Inda and vice versa', 'Find possession expressions in Quran'],
    quranBridge: {
      arabic: 'عِندَهُ مَفَاتِحُ الْغَيْبِ',
      transliteration: "Indahu mafatihu l-ghayb",
      meaning: 'With Him are the keys of the unseen.',
      note: "عِندَهُ — Allah 'has' the keys: this is the عند possession construction in its most profound usage.",
    },
  },
  {
    id: 'b72',
    stage: 'beginner',
    title: 'Verbs of Motion: Walking, Running, Coming, Going',
    objective: 'Use 10 common motion verbs in past and present tense.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Motion verb conjugation drill', 'Story-building with motion verbs', 'Find motion verbs in Surah al-Kahf'],
    quranBridge: {
      arabic: 'وَجَاءَ مِنْ أَقْصَى الْمَدِينَةِ رَجُلٌ يَسْعَى',
      transliteration: 'Wajaa min aqsal-madinati rajulun yas-a',
      meaning: 'And a man came rushing from the far end of the city.',
      note: 'جَاءَ (came) and يَسْعَى (runs/hurries) — two motion verbs in one vivid Quranic scene.',
    },
  },
  {
    id: 'b73',
    stage: 'beginner',
    title: "Verbs of Seeing, Hearing, Knowing",
    objective: 'Master the verbs of perception: رأى, سمع, علم and their common derived forms.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Conjugate each verb in past tense', "Perception verb spotting in al-Baqarah's opening", 'Build 5 "Allah sees/hears/knows" sentences'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ سَمِيعٌ بَصِيرٌ',
      transliteration: 'Innallaha sameeun basir',
      meaning: 'Indeed Allah is All-Hearing, All-Seeing.',
      note: 'سَمِيعٌ from سَمَعَ (to hear) and بَصِيرٌ from بَصَرَ (to see) — active participles of two core perception verbs.',
    },
  },
  {
    id: 'b74',
    stage: 'beginner',
    title: "Verbs of Giving and Taking",
    objective: 'Use أَعْطَى, أَخَذَ, آتَى, and أَخَذَ in sentences describing giving and taking.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Give/take verb conjugation', 'Sentence building with dual objects', 'Find giving/taking verbs in Quran'],
    quranBridge: {
      arabic: 'مَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ',
      transliteration: 'Ma ataakumur-rasulu fakhudhuh',
      meaning: 'What the Messenger gives you, take it.',
      note: 'آتَاكُمْ (gave you) and خُذُوهُ (take it) — both verbs in one binding Quranic command.',
    },
  },
  {
    id: 'b75',
    stage: 'beginner',
    title: 'Islamic Calendar: Months and Seasons',
    objective: 'Name all 12 Islamic months in order and explain the key events in each.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Islamic month order test', 'Match event to month', 'Read month names in Arabic from a calendar'],
    quranBridge: {
      arabic: 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ',
      transliteration: 'Shahru Ramadanal-ladhi unzila fihil-Quran',
      meaning: 'The month of Ramadan in which the Quran was revealed.',
      note: 'شَهْرُ رَمَضَانَ — the most mentioned month in the Quran, an essential vocabulary item.',
    },
  },
  {
    id: 'b76',
    stage: 'beginner',
    title: 'Arabic Place Names and Geography',
    objective: 'Learn 20 key place names mentioned in the Quran and hadith with their Arabic forms.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['Place name pronunciation drill', 'Match place to Quran story', 'Map labelling in Arabic'],
    quranBridge: {
      arabic: 'إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ لَلَّذِي بِبَكَّةَ',
      transliteration: 'Inna awwala baytin wuddi-a linnaasi lallladhi bi-bakkata',
      meaning: 'Indeed, the first House established for the people was that at Makkah.',
      note: 'بَكَّةَ (Makkah) — one of two names for the holy city; geography vocabulary grounds Quran in space.',
    },
  },
  {
    id: 'b77',
    stage: 'beginner',
    title: "Kana and Its Sisters: Past States",
    objective: 'Use كَانَ and its sisters to describe past states and conditions.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Kana conjugation drill', 'Kana sisters table', 'Translate 8 kana sentences from Quran'],
    quranBridge: {
      arabic: 'وَكَانَ اللَّهُ غَفُورًا رَّحِيمًا',
      transliteration: 'Wakana Allahu ghafuran rahima',
      meaning: 'And Allah is Ever Forgiving, Most Merciful.',
      note: 'كَانَ here is not a simple past — it expresses an eternal attribute, and is one of the most common Quran verbs.',
    },
  },
  {
    id: 'b78',
    stage: 'beginner',
    title: 'Making Requests and Commands in Arabic',
    objective: 'Form polite requests and direct commands using the imperative and softening particles.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Form imperatives from 10 verbs', 'Add please/I ask you particles', 'Translate 8 Quranic commands'],
    quranBridge: {
      arabic: 'اتَّقُوا اللَّهَ',
      transliteration: 'Ittaqullaha',
      meaning: 'Fear / be mindful of Allah.',
      note: 'اتَّقُوا is one of the most frequent commands in the Quran — the imperative of تَقْوَى (God-consciousness).',
    },
  },
  {
    id: 'b79',
    stage: 'beginner',
    title: 'The Particle "Inna" and Its Effect',
    objective: 'Understand how إِنَّ intensifies a statement and changes the noun after it.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Identify inna sentences in 10 ayat', 'Case change after inna drill', 'Build 5 emphatic sentences with inna'],
    quranBridge: {
      arabic: 'إِنَّ الصَّلَاةَ تَنْهَى عَنِ الْفَحْشَاءِ',
      transliteration: 'Innas-salata tanha anil-fahsha',
      meaning: 'Indeed prayer prevents from immorality.',
      note: 'إِنَّ + الصَّلَاةَ (accusative) — inna places the noun into nasb case as an emphatic grammatical device.',
    },
  },
  {
    id: 'b80',
    stage: 'beginner',
    title: 'Quran Vocabulary: 100 Essential Words',
    objective: 'Rapidly learn the 100 most repeated words in the Quran covering 45% of its text.',
    duration: '40 min',
    challengeLevel: 'Momentum',
    drills: ['Spaced repetition: 20-word sprint × 5', 'Context sentence matching for each word', 'Passage blind recognition test'],
    quranBridge: {
      arabic: 'الَّذِي يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الْآخِرِ',
      transliteration: 'Alladhi yuminu billahi wal-yawmil-akhir',
      meaning: 'He who believes in Allah and the Last Day.',
      note: 'يُؤْمِنُ, اللَّهِ, يَوْمِ — three of the top 100 most-used Quran words together in one phrase.',
    },
  },
  {
    id: 'b81',
    stage: 'beginner',
    title: 'Quran Vocabulary: Words 101-200',
    objective: 'Learn words 101-200 in Quranic frequency, building toward 60% text coverage.',
    duration: '40 min',
    challengeLevel: 'Momentum',
    drills: ['Spaced repetition: 25-word sprint × 4', 'Vocabulary in context worksheet', 'Self-test: 20 random words from the set'],
    quranBridge: {
      arabic: 'وَيَعْلَمُ مَا تُخْفُونَ وَمَا تُعْلِنُونَ',
      transliteration: 'Wayalamu ma tukhfuna wama tulinum',
      meaning: 'And He knows what you conceal and what you reveal.',
      note: 'تُخْفُونَ (you conceal) and تُعْلِنُونَ (you reveal) — frequency words 150-170 range.',
    },
  },
  {
    id: 'b82',
    stage: 'beginner',
    title: 'Quran Vocabulary: Words 201-300',
    objective: 'Complete the top-300 Quran word bank covering approximately 70% of the text.',
    duration: '40 min',
    challengeLevel: 'Momentum',
    drills: ['Final frequency words spaced repetition', 'Full 300-word recognition test', 'Passage coverage estimation test'],
    quranBridge: {
      arabic: 'وَمَا تَشَاءُونَ إِلَّا أَن يَشَاءَ اللَّهُ',
      transliteration: 'Wama tashauna illa an yashaa Allahu',
      meaning: 'And you do not will except that Allah wills.',
      note: 'تَشَاءُونَ and يَشَاءَ are from the root ش-ي-أ — words 250-275 in Quran frequency.',
    },
  },
  {
    id: 'b83',
    stage: 'beginner',
    title: 'Reading: Surah al-Mulk Vocabulary',
    objective: 'Build a complete vocabulary map for Surah al-Mulk (30 verses).',
    duration: '40 min',
    challengeLevel: 'Momentum',
    drills: ['Vocabulary extraction per 5 verses', 'Group by root', 'Translate 5 full verses independently'],
    quranBridge: {
      arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ',
      transliteration: 'Tabarakalladhi biyadihil-mulk',
      meaning: 'Blessed is He in whose hand is dominion.',
      note: 'الْمُلْكُ (dominion) — an essential beginner-to-intermediate vocabulary word with rich theological depth.',
    },
  },
  {
    id: 'b84',
    stage: 'beginner',
    title: 'Reading: Surah ar-Rahman Vocabulary',
    objective: 'Learn all vocabulary for Surah ar-Rahman including natural world and paradise terms.',
    duration: '38 min',
    challengeLevel: 'Momentum',
    drills: ['Sort vocabulary: nature / paradise / punishment', 'Read surah aloud translating mentally', 'Vocabulary gap test'],
    quranBridge: {
      arabic: 'خَلَقَ الْإِنسَانَ مِن صَلْصَالٍ كَالْفَخَّارِ',
      transliteration: 'Khalaqal-insana min salsalin kal-fakhkhar',
      meaning: 'He created man from clay like pottery.',
      note: 'صَلْصَالٍ (dry clay) and الْفَخَّارِ (pottery) — advanced beginner vocabulary from Quran science.',
    },
  },
  {
    id: 'b85',
    stage: 'beginner',
    title: 'Compound Nouns and Title Structures',
    objective: 'Form compound noun titles and descriptive names as used in the Quran.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Build 8 compound titles from components', 'Idafa title construction', 'Find 5 compound titles in Quran'],
    quranBridge: {
      arabic: 'عِبَادُ الرَّحْمَٰنِ',
      transliteration: "Ibadu r-Rahmaan",
      meaning: 'The servants of the Most Gracious.',
      note: 'عِبَادُ الرَّحْمَٰنِ is an idafa title — Surah al-Furqan devotes 20 verses describing who they are.',
    },
  },
  {
    id: 'b86',
    stage: 'beginner',
    title: 'Describing People: Adjective Patterns',
    objective: 'Use the 5 most productive Arabic adjective patterns to describe people.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Pattern recognition for 20 adjectives', 'Build descriptions of Quranic characters', 'Gender/number agreement check'],
    quranBridge: {
      arabic: 'إِنَّهُ كَانَ صِدِّيقًا نَّبِيًّا',
      transliteration: "Innahu kana siddiqan nabiyya",
      meaning: 'Indeed he was a truthful person, a prophet.',
      note: 'صِدِّيقًا (most truthful) uses the فِعِّيل pattern — an intensified adjective form of الصِّدْق.',
    },
  },
  {
    id: 'b87',
    stage: 'beginner',
    title: 'Opinion and Belief Sentences',
    objective: 'Express opinions and beliefs using أَظُنُّ, أَعْتَقِدُ, أَعْلَمُ, and similar verbs.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Opinion verb conjugation', 'Complete 8 opinion sentence starters', 'Find belief verbs in Quran moral passages'],
    quranBridge: {
      arabic: 'وَظَنَّ دَاوُودُ أَنَّمَا فَتَنَّاهُ',
      transliteration: 'Wazanna Dawudu annama fatannahu',
      meaning: 'And David knew that We had tried him.',
      note: 'ظَنَّ (thought/realized) — the same root used for "thought" and "certainty" depending on context.',
    },
  },
  {
    id: 'b88',
    stage: 'beginner',
    title: 'Expressing Comparison: More and Most',
    objective: 'Form comparatives and superlatives using the أَفْعَل pattern.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Build comparatives from 10 adjectives', 'Superlative + idafa construction', 'Find 8 comparatives in Quran'],
    quranBridge: {
      arabic: 'وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَى',
      transliteration: 'Walal-akhiratu khayrun laka minal-ula',
      meaning: 'And the next life is better for you than this one.',
      note: 'خَيْرٌ (better) is the comparative of حَسَن — one of the most important Quranic comparatives.',
    },
  },
  {
    id: 'b89',
    stage: 'beginner',
    title: 'Colours in Arabic: All 12 Core Colours',
    objective: 'Master all 12 main Arabic colours in both genders and use them descriptively.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Full colour chart masculine/feminine', 'Describe 10 objects in Arabic', 'Find 6 colours in Quran passages'],
    quranBridge: {
      arabic: 'وَمِن جِبَالٍ جُدَدٌ بِيضٌ وَحُمْرٌ مُّخْتَلِفٌ أَلْوَانُهَا وَغَرَابِيبُ سُودٌ',
      transliteration: 'Wamin jibalin jududun bidun wahumrun mukhtalifun alwanuha wa-gharabibu sud',
      meaning: 'And of mountains are streaks white and red and intensely black.',
      note: 'بِيضٌ (white), حُمْرٌ (red), سُودٌ (black) — three colour plurals in one vivid Quran verse.',
    },
  },
  {
    id: 'b90',
    stage: 'beginner',
    title: 'Beginner Reading Passage: Surah al-Fajr',
    objective: 'Read, translate, and identify vocabulary structures across all 30 verses of Surah al-Fajr.',
    duration: '40 min',
    challengeLevel: 'Capstone',
    drills: ['Full translation attempt then verify', 'Grammar spotting: oaths / questions / condemnation', 'Vocabulary list: 25 new words'],
    quranBridge: {
      arabic: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ارْجِعِي إِلَى رَبِّكِ رَاضِيَةً مَّرْضِيَّةً',
      transliteration: "Ya ayyatuhan-nafsul mutmainnatu irji'i ila rabbiki radiyatan mardiyya",
      meaning: 'O tranquil soul, return to your Lord well-pleased and pleasing.',
      note: 'The surah ends with one of the most beautiful addresses in the Quran — a beginner reading milestone.',
    },
  },
  {
    id: 'b91',
    stage: 'beginner',
    title: 'Expressing Existence: Hunaka and Thamma',
    objective: 'Use هُنَاكَ and ثَمَّ to say "there is / there are" in Arabic sentences.',
    duration: '18 min',
    challengeLevel: 'Momentum',
    drills: ['Build 8 existence sentences', 'Near vs far distinction', 'Find existence expressions in Quran'],
    quranBridge: {
      arabic: 'هُنَالِكَ دَعَا زَكَرِيَّا رَبَّهُ',
      transliteration: 'Hunalika da-a zakariyya rabbahu',
      meaning: 'Thereupon, Zakariyya called upon his Lord.',
      note: 'هُنَالِكَ (there/then) — a place-time expression used to mark pivotal narrative moments in Quran stories.',
    },
  },
  {
    id: 'b92',
    stage: 'beginner',
    title: 'Expressions of Quantity: Much, Little, All',
    objective: 'Use كَثِير, قَلِيل, كُلّ, and بَعْض correctly with nouns.',
    duration: '20 min',
    challengeLevel: 'Momentum',
    drills: ['Quantity word matching', 'Insert correct quantity word in 10 sentences', 'Find كُلّ and بَعْض in 5 ayat'],
    quranBridge: {
      arabic: 'وَاذْكُرُوا اللَّهَ كَثِيرًا',
      transliteration: 'Wadhkurullaha kathira',
      meaning: 'And remember Allah much.',
      note: 'كَثِيرًا (abundantly) — acts as an adverb here; the Quran commands dhikr in quantity.',
    },
  },
  {
    id: 'b93',
    stage: 'beginner',
    title: 'Adverbs of Manner: How You Do Things',
    objective: 'Form and use adverbs of manner (hal, tamyiz) to describe the quality of actions.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Adverb formation from 10 adjectives', 'Insert manner adverbs in 8 sentences', 'Spot manner expressions in 3 surahs'],
    quranBridge: {
      arabic: 'وَادْعُوهُ خَوْفًا وَطَمَعًا',
      transliteration: 'Wadauhu khawfan watamaaan',
      meaning: 'And call upon Him in fear and aspiration.',
      note: 'خَوْفًا وَطَمَعًا — both are tamyiz/manner nouns telling how the du\'a should be made.',
    },
  },
  {
    id: 'b94',
    stage: 'beginner',
    title: 'Time Expressions: Before, After, When',
    objective: 'Use قَبْلَ, بَعْدَ, حِينَ, and لَمَّا in time-clause sentences.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Time expression fill-in for 10 sentences', 'Build 5 time-clause sentences', 'Find time expressions in Surah Yusuf'],
    quranBridge: {
      arabic: 'فَلَمَّا جَاءَ أَمْرُنَا',
      transliteration: 'Falamma jaa amruna',
      meaning: 'Then when Our command came.',
      note: 'فَلَمَّا (then when) — one of the most common narrative time-connectors in Quran stories.',
    },
  },
  {
    id: 'b95',
    stage: 'beginner',
    title: 'Spatial Prepositions: In, On, Under, Between',
    objective: 'Master 8 spatial prepositions and use them with correct case endings.',
    duration: '20 min',
    challengeLevel: 'Momentum',
    drills: ['Spatial preposition diagram labelling', 'Build 8 location sentences', 'Quran spatial phrase hunt'],
    quranBridge: {
      arabic: 'تَجْرِي مِن تَحْتِهِمُ الْأَنْهَارُ',
      transliteration: 'Tajri min tahtihimul-anhar',
      meaning: 'Rivers flowing beneath them.',
      note: 'مِن تَحْتِ (from beneath) — a compound spatial preposition describing paradise throughout the Quran.',
    },
  },
  {
    id: 'b96',
    stage: 'beginner',
    title: 'The Quran on Nature: Sky, Earth, Sea',
    objective: 'Learn 30 natural world vocabulary words and locate them across surahs.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Nature vocabulary matching', 'Sky / earth / sea category sort', '5 nature ayat translation'],
    quranBridge: {
      arabic: 'الَّذِي جَعَلَ لَكُمُ الْأَرْضَ فِرَاشًا وَالسَّمَاءَ بِنَاءً',
      transliteration: "Alladhi ja-ala lakumul-arda firashawn was-samaa binaa",
      meaning: 'Who made the earth a bed for you and the sky a structure.',
      note: 'الْأَرْضَ (earth) and السَّمَاءَ (sky) — the two most referenced natural phenomena in the Quran.',
    },
  },
  {
    id: 'b97',
    stage: 'beginner',
    title: 'The Quran on Light and Darkness',
    objective: 'Learn نُور, ظُلُمَات, and related light/dark vocabulary from the Quran.',
    duration: '22 min',
    challengeLevel: 'Starter+',
    drills: ['Light vocab flashcards', 'Find light/dark imagery in 5 surahs', 'Build 5 metaphor sentences'],
    quranBridge: {
      arabic: 'يُخْرِجُهُم مِّنَ الظُّلُمَاتِ إِلَى النُّورِ',
      transliteration: "Yukhrijuhum minaz-zulumati ilan-nur",
      meaning: 'He brings them out of the darknesses into the light.',
      note: 'الظُّلُمَاتِ (plural of darkness) and النُّورِ (light) — one of the Quran\'s grand metaphors.',
    },
  },
  {
    id: 'b98',
    stage: 'beginner',
    title: 'Islamic Ethics Vocabulary',
    objective: 'Learn 30 key virtue and vice terms used in Quranic moral discourse.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Virtue vs vice sorting', 'Match Arabic term to definition', 'Find 5 ethical terms in Surah al-Hujurat'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ',
      transliteration: 'Innallaha yamuru bil-adli wal-ihsan',
      meaning: 'Indeed Allah commands justice and excellence.',
      note: 'الْعَدْلِ (justice) and الْإِحْسَانِ (excellence) — two of the most important ethical terms in the Quran.',
    },
  },
  {
    id: 'b99',
    stage: 'beginner',
    title: 'Iman (Faith) Vocabulary',
    objective: 'Build a 25-word vocabulary for the language of faith, belief, and conviction.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Faith vocabulary flashcards', 'Match term to Quran verse', 'Build 5 personal faith sentences'],
    quranBridge: {
      arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ',
      transliteration: 'Amana r-rasoolu bima unzila ilayhi mir-rabbihi wal-muminun',
      meaning: 'The Messenger has believed in what was revealed to him from his Lord, and the believers.',
      note: 'آمَنَ (believed) and الْمُؤْمِنُونَ (the believers) — faith vocabulary at the opening of Surah al-Baqarah.',
    },
  },
  {
    id: 'b100',
    stage: 'beginner',
    title: 'Connecting Faith Vocabulary to Prayer',
    objective: 'Identify all faith-related terms that appear in the daily five prayers.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Prayer phase vocabulary analysis', 'Meaning of each prayer phrase', 'Grammar: which are verbs, which nouns'],
    quranBridge: {
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: 'Allahu akbar',
      meaning: 'Allah is the Greatest.',
      note: 'أَكْبَرُ is a comparative (greater/greatest) — the phrase that opens and closes every prayer unit.',
    },
  },
  {
    id: 'b101',
    stage: 'beginner',
    title: 'Tawbah and Forgiveness Vocabulary',
    objective: 'Learn 20 terms related to repentance, forgiveness, and mercy from the Quran.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Forgiveness term matching', 'Root: gh-f-r family', 'Build a tawbah du\'a using these words'],
    quranBridge: {
      arabic: 'إِنَّهُ كَانَ تَوَّابًا',
      transliteration: 'Innahu kana tawwaba',
      meaning: 'Indeed He is ever-accepting of repentance.',
      note: 'تَوَّابًا is Form II active participle of تَوَبَ — the intensive "one who constantly accepts repentance".',
    },
  },
  {
    id: 'b102',
    stage: 'beginner',
    title: 'Quran and Knowledge Vocabulary',
    objective: 'Learn 25 terms from the Quranic discourse about knowledge, wisdom, and reflection.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Knowledge vocabulary flashcards', 'Root: a-l-m family words', 'Translate 5 knowledge-themed ayat'],
    quranBridge: {
      arabic: 'وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ',
      transliteration: "Wafawqa kulli dhi ilmin alim",
      meaning: 'And above every possessor of knowledge is one more knowing.',
      note: 'عِلْمٍ (knowledge) and عَلِيمٌ (the Knower) — both from root ع-ل-م, the richest knowledge root in Arabic.',
    },
  },
  {
    id: 'b103',
    stage: 'beginner',
    title: 'Introducing Yourself Fully in Arabic',
    objective: 'Give a complete 1-minute introduction: name, origin, occupation, hobbies, faith.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Write out full introduction', 'Speak aloud without notes', 'Grammar check: sentence types used'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَى',
      transliteration: 'Ya ayyuhan-naasu inna khalaqnakum min dhakarin wa-untha',
      meaning: 'O mankind, We have created you from male and female.',
      note: 'Self-introduction is rooted in the Quran\'s recognition of human diversity and individual identity.',
    },
  },
  {
    id: 'b104',
    stage: 'beginner',
    title: 'Shopping and Markets Vocabulary',
    objective: 'Conduct a simple Arabic shopping transaction using 25 market vocabulary words.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Price negotiation role-play', 'Market vocabulary matching', 'Build 5 "How much is...?" sentences'],
    quranBridge: {
      arabic: 'وَلَا تَبْخَسُوا النَّاسَ أَشْيَاءَهُمْ',
      transliteration: "Wala tabkhasu n-nasa ashyaahum",
      meaning: 'And do not deprive people of their due things.',
      note: 'The Quran regulates markets and trade — commercial vocabulary has deep Quranic roots.',
    },
  },
  {
    id: 'b105',
    stage: 'beginner',
    title: 'Medical and Health Vocabulary',
    objective: 'Learn 25 health and medical terms that appear in Islamic contexts and Quran.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Health term matching', 'Quran references to healing', 'Build 3 sentences about health'],
    quranBridge: {
      arabic: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
      transliteration: 'Wa idha maridtu fahuwa yashfin',
      meaning: 'And when I am ill, it is He who cures me.',
      note: 'مَرِضْتُ (I became sick) and يَشْفِينِ (He cures me) — health vocabulary from Ibrahim\'s du\'a.',
    },
  },
  {
    id: 'b106',
    stage: 'beginner',
    title: 'Sadaqa and Charity Vocabulary',
    objective: 'Learn 20 charity and generosity terms from Quranic and Islamic sources.',
    duration: '22 min',
    challengeLevel: 'Starter+',
    drills: ['Charity vocabulary flashcards', 'Types of sadaqa sorting', 'Translate 5 charity ayat'],
    quranBridge: {
      arabic: 'مَّثَلُ الَّذِينَ يُنفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ',
      transliteration: "Mathalul-ladhina yunfiquuna amwaalahum fi sabilillah",
      meaning: 'The example of those who spend their wealth in the way of Allah.',
      note: 'يُنفِقُونَ (they spend/give) — the primary charity verb in the Quran, from root ن-ف-ق.',
    },
  },
  {
    id: 'b107',
    stage: 'beginner',
    title: 'Gratitude Vocabulary and Shukr',
    objective: 'Learn 20 gratitude expressions and understand the Quranic theology of thankfulness.',
    duration: '22 min',
    challengeLevel: 'Starter+',
    drills: ['Gratitude vocabulary flash drill', 'Opposite pairs: shukr vs kufr', 'Build 5 thankfulness sentences'],
    quranBridge: {
      arabic: 'وَاشْكُرُوا لِي وَلَا تَكْفُرُونِ',
      transliteration: 'Washkuru li wala takfurun',
      meaning: 'Be grateful to Me and do not be ungrateful.',
      note: 'اشْكُرُوا (be grateful) and تَكْفُرُونِ (be ungrateful) — two opposites from the root of gratitude and disbelief.',
    },
  },
  {
    id: 'b108',
    stage: 'beginner',
    title: 'Words for Beauty and Goodness',
    objective: 'Build vocabulary around جَمَال, حُسْن, and الطَّيِّب and learn their Quranic contexts.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Beauty vocabulary matching', 'Superlative forms drill', 'Find 5 beauty words in Surah Yusuf'],
    quranBridge: {
      arabic: 'فَاصْبِرْ صَبْرًا جَمِيلًا',
      transliteration: 'Fasbir sabran jamila',
      meaning: 'So be patient with beautiful patience.',
      note: 'جَمِيلًا (beautiful) as a manner adverb — the Quran asks for patience that is internally beautiful.',
    },
  },
  {
    id: 'b109',
    stage: 'beginner',
    title: 'Arabic for Daily Planning',
    objective: 'Build simple future-tense planning sentences using سَوْفَ, سَـ, and نِيَّة.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Future prefix drill', 'Build a daily schedule in Arabic', '"I intend to..." intention sentences'],
    quranBridge: {
      arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَى',
      transliteration: 'Walasawfa yutika rabbuka fatarda',
      meaning: 'And your Lord is going to give you, and you will be satisfied.',
      note: 'لَسَوْفَ — doubly emphatic future (lam + sawfa), promising a future gift.',
    },
  },
  {
    id: 'b110',
    stage: 'beginner',
    title: 'The Word "Nafs": Soul, Self, and Person',
    objective: 'Explore the 5 types of nafs in the Quran and master all its grammatical uses.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['5 nafs type identification', 'Grammatical roles of nafs in 10 ayat', 'Build 5 sentences with nafs'],
    quranBridge: {
      arabic: 'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ',
      transliteration: 'Kullu nafsin dha-iqatul-mawt',
      meaning: 'Every soul shall taste death.',
      note: 'نَفْسٍ (soul, indefinite genitive) — one of the most profound and frequently occurring Quran words.',
    },
  },
  {
    id: 'b111',
    stage: 'beginner',
    title: 'Surah at-Teen: Complete Analysis',
    objective: 'Fully translate and grammatically explain every verse of Surah at-Teen.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Verse-by-verse independent translation', 'Oaths and their objects identified', 'Grammar: أَحْسَنِ تَقْوِيمٍ idafa'],
    quranBridge: {
      arabic: 'لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ',
      transliteration: "Laqad khalaqnal-insana fi ahsani taqwim",
      meaning: 'We have certainly created man in the best form.',
      note: 'أَحْسَنِ تَقْوِيمٍ — superlative idafa: "in the most excellent of forms". A grammatical gem.',
    },
  },
  {
    id: 'b112',
    stage: 'beginner',
    title: 'Surah al-Alaq: The First Revelation',
    objective: 'Translate and analyze all 19 verses of Surah al-Alaq — the birthplace of the Quran.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Verse-by-verse translation', 'Grammar: commands and prohibition', 'Vocabulary: alaq / qalam / rabb'],
    quranBridge: {
      arabic: 'عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ',
      transliteration: "Allamal-insana ma lam yalam",
      meaning: 'He taught man what he did not know.',
      note: "عَلَّمَ (taught) is Form II — intensified teaching. Allah taught humanity what it couldn't learn alone.",
    },
  },
  {
    id: 'b113',
    stage: 'beginner',
    title: 'Surah ad-Duha: Grammar and Meaning',
    objective: 'Explain every verse of Surah ad-Duha with grammar notes and reflection.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Qasam (oath) structure analysis', 'Conditional verb forms', 'Vocabulary: adha / saja / awah'],
    quranBridge: {
      arabic: 'وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَى',
      transliteration: "Walal-akhiratu khayrun laka minal-ula",
      meaning: 'And the next life is better for you than this world.',
      note: 'A consoling Quranic promise — خَيْرٌ (better) is the comparative form in a sentence of comfort.',
    },
  },
  {
    id: 'b114',
    stage: 'beginner',
    title: 'The Root System: An Introduction',
    objective: 'Understand why Arabic root-based morphology makes the language powerful and learnable.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Find 6 derivatives of root ك-ت-ب', 'Root family mapping for ع-ل-م', 'Write the root of 15 common words'],
    quranBridge: {
      arabic: 'اقْرَأْ وَرَبُّكَ الْأَكْرَمُ الَّذِي عَلَّمَ بِالْقَلَمِ',
      transliteration: "Iqra warrabbuka l-akramu alladhi allama bil-qalam",
      meaning: 'Read, and your Lord is the Most Generous — who taught by the pen.',
      note: 'قَلَم, عَلَّمَ, أَكْرَم — three triliteral roots that encompass writing, teaching, and generosity.',
    },
  },
  {
    id: 'b115',
    stage: 'beginner',
    title: 'Opposites in Arabic: 30 Antonym Pairs',
    objective: 'Learn 30 antonym pairs and understand how they enrich Quranic meaning.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Antonym matching pairs', 'Find 5 antonym contrasts in Quran', 'Build 5 sentences using contrast'],
    quranBridge: {
      arabic: 'فَأَمَّا مَن أَعْطَى وَاتَّقَى... وَأَمَّا مَن بَخِلَ وَاسْتَغْنَى',
      transliteration: "Faamma man ata wattaqa... wa amma man bakhila wastaghnaa",
      meaning: 'As for one who gives and fears Allah... and as for one who withholds and considers himself free...',
      note: 'The Quran constructs moral argument through antithetical pairs — أَعْطَى vs بَخِلَ is a masterclass.',
    },
  },
  {
    id: 'b116',
    stage: 'beginner',
    title: 'Synonyms in Arabic: The Richness of the Language',
    objective: 'Explore synonym sets in Arabic and understand how subtle meaning differences are expressed.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Match synonyms with subtle difference explanations', 'Find synonym groups in Surah Yusuf', 'Choose the correct synonym in 8 sentences'],
    quranBridge: {
      arabic: 'الْخَوْفُ وَالْخَشْيَةُ',
      transliteration: 'Al-khawfu wal-khashya',
      meaning: 'Fear (general) and deep awe/reverence.',
      note: 'Both mean "fear" yet خَشْيَة refers to the awe of those with knowledge — a synonym pair with a theological difference.',
    },
  },
  {
    id: 'b117',
    stage: 'beginner',
    title: 'The Quran on Justice: Adl and Qist',
    objective: 'Learn the vocabulary of justice in the Quran and understand the distinction between عَدْل and قِسْط.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Justice vocabulary matching', 'Contextual usage of adl vs qist', 'Find 5 justice ayat and translate'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ بِالْقِسْطِ',
      transliteration: "Ya ayyuhalladhina amanu kunu qawwamina bil-qist",
      meaning: 'O believers, be persistently standing firm in justice.',
      note: 'قِسْط (proportional justice) vs عَدْل (balance) — the Quran precision-engineers its justice vocabulary.',
    },
  },
  {
    id: 'b118',
    stage: 'beginner',
    title: 'The Quran on Speech and Silence',
    objective: 'Learn 20 speech-related vocabulary words: saying, speaking, telling, whispering, silence.',
    duration: '22 min',
    challengeLevel: 'Starter+',
    drills: ['Speech verb conjugation drill', '"They said" narrative pattern in Quran stories', 'Speech ethics ayat translation'],
    quranBridge: {
      arabic: 'قُولُوا قَوْلًا سَدِيدًا',
      transliteration: "Qulu qawlan sadida",
      meaning: 'Say words that are right and true.',
      note: 'قَوْلًا سَدِيدًا — mafuul mutlaq: say a saying that is sound. Speech ethics in grammar form.',
    },
  },
  {
    id: 'b119',
    stage: 'beginner',
    title: 'Surah al-Insan: Key Vocabulary',
    objective: 'Build vocabulary from Surah al-Insan covering paradise, gratitude, and patience.',
    duration: '32 min',
    challengeLevel: 'Momentum',
    drills: ['30-word vocabulary extraction', 'Paradise description vocabulary grouping', 'Translate 5 key verses'],
    quranBridge: {
      arabic: 'إِنَّا أَعْتَدْنَا لِلْكَافِرِينَ سَلَاسِلَ وَأَغْلَالًا وَسَعِيرًا',
      transliteration: "Inna a'tadna lil-kafiruna salaasila wa-aghlalan wa-sa-ira",
      meaning: 'We have prepared for the disbelievers chains, shackles, and a blaze.',
      note: 'Three broken plurals in one verse: سَلَاسِل, أَغْلَال, سَعِير — advanced beginner vocabulary.',
    },
  },
  {
    id: 'b120',
    stage: 'beginner',
    title: 'Beginner Grammar Review: Consolidation',
    objective: 'Consolidate all beginner grammar topics through a comprehensive review worksheet.',
    duration: '45 min',
    challengeLevel: 'Capstone',
    drills: ['50-question multichoice grammar test', 'Correct mistakes in 10 marked-up sentences', 'Build a 10-sentence paragraph in Arabic'],
    quranBridge: {
      arabic: 'وَنُيَسِّرُكَ لِلْيُسْرَى',
      transliteration: "Wanuyassiruka lil-yusra",
      meaning: 'And We will ease you toward ease.',
      note: 'A promise from Surah ad-Duha — this review lesson is the "easing" before the next climb.',
    },
  },
  {
    id: 'b121',
    stage: 'beginner',
    title: 'The Particle "Laa": Prohibition and Negation',
    objective: 'Distinguish between لا النافية (negating) and لا الناهية (prohibiting) with correct verb forms.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Nafi vs nahi identification drill', 'Add correct verb form after each laa type', 'Find both types in 5 surahs'],
    quranBridge: {
      arabic: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
      transliteration: "La tahzan innallaha maana",
      meaning: 'Do not grieve; indeed Allah is with us.',
      note: 'لَا تَحْزَنْ is prohibitive laa + jussive verb — a divine command not to grieve.',
    },
  },
  {
    id: 'b122',
    stage: 'beginner',
    title: 'Arabic Discourse Markers',
    objective: 'Learn 15 discourse markers (connectors, contrast, result, emphasis) used in Quran.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Discourse marker function matching', 'Insert correct connector in 10 sentence pairs', 'Map discourse flow in Surah an-Naba'],
    quranBridge: {
      arabic: 'أَمَّا مَن أَعْطَى وَاتَّقَى فَسَنُيَسِّرُهُ لِلْيُسْرَى',
      transliteration: "Amma man ata wattaqa fasanuyassiruh lil-yusra",
      meaning: 'As for one who gives and fears Allah, We will ease him toward ease.',
      note: 'أَمَّا... فَـ is a cleft discourse structure — "as for X, then Y" appearing over 40 times in the Quran.',
    },
  },
  {
    id: 'b123',
    stage: 'beginner',
    title: '50 Core Quran Verbs: Past and Present',
    objective: 'Master the 50 most common verb roots in the Quran in past and present tense.',
    duration: '40 min',
    challengeLevel: 'Momentum',
    drills: ['50-verb conjugation sprint', 'Match verb to Quran verse context', 'Root-to-meaning rapid recall'],
    quranBridge: {
      arabic: 'يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ',
      transliteration: "Yalamu ma bayna aydihim wama khalfahum",
      meaning: 'He knows what is before them and what is behind them.',
      note: 'يَعْلَمُ (He knows) — one of the top 10 verbs in the Quran by frequency.',
    },
  },
  {
    id: 'b124',
    stage: 'beginner',
    title: 'The Five Prayer Times in Arabic',
    objective: 'Name all five prayers, their times, and associated vocabulary in Arabic.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Prayer times matching', 'Arabic name and timing pair-off', 'Build 5 "I pray at..." sentences'],
    quranBridge: {
      arabic: 'أَقِمِ الصَّلَاةَ لِدُلُوكِ الشَّمْسِ إِلَى غَسَقِ اللَّيْلِ',
      transliteration: "Aqimis-salata liduluish-shamsi ila ghasaqil-layl",
      meaning: 'Establish prayer from the decline of the sun until the darkness of the night.',
      note: 'دُلُوكِ الشَّمْسِ (sun\'s decline) and غَسَقِ اللَّيْلِ (night\'s darkness) — prayer time vocabulary from Quran.',
    },
  },
  {
    id: 'b125',
    stage: 'beginner',
    title: 'Arabic Reading Comprehension Strategies',
    objective: 'Learn 5 active reading strategies for Arabic: skimming, scanning, root-guessing, context use.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Skim a new surah and identify 5 themes', 'Guess 5 unknown words from root knowledge', 'Context clue worksheet'],
    quranBridge: {
      arabic: 'كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ لِتُخْرِجَ النَّاسَ مِنَ الظُّلُمَاتِ إِلَى النُّورِ',
      transliteration: "Kitabun anzalnahu ilayka litukhrija n-naasa minaz-zulumati ilan-nur",
      meaning: 'A Book We have revealed to you that you may bring people out of darknesses into light.',
      note: 'Reading the Quran with comprehension strategies transforms every recitation into active understanding.',
    },
  },
  {
    id: 'b126',
    stage: 'beginner',
    title: 'Surah al-Waqia: First 40 Verses Vocabulary',
    objective: 'Build a vocabulary bank from the first 40 verses of Surah al-Waqia on the Last Day.',
    duration: '38 min',
    challengeLevel: 'Momentum',
    drills: ['30-word vocabulary extraction', 'Category sort: paradise / punishment / events', 'Translate 5 key verses'],
    quranBridge: {
      arabic: 'إِذَا وَقَعَتِ الْوَاقِعَةُ لَيْسَ لِوَقْعَتِهَا كَاذِبَةٌ',
      transliteration: "Idha waqa-atil waqi-atu laysa liwaq-atiha kadhibah",
      meaning: 'When the Occurrence occurs, there is no denying its occurrence.',
      note: 'الْوَاقِعَة — the event that cannot be denied: an immediate vocabulary and grammar challenge.',
    },
  },
  {
    id: 'b127',
    stage: 'beginner',
    title: 'Narrating Past Events in Arabic',
    objective: 'Narrate past events using past tense verbs and time expressions coherently.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Build a 5-sentence story in past tense', 'Add time expressions to the story', 'Correct 8 past-tense errors'],
    quranBridge: {
      arabic: 'وَلَقَدْ أَرْسَلْنَا نُوحًا إِلَى قَوْمِهِ',
      transliteration: "Walaqad arsalna nuhan ila qawmih",
      meaning: 'And We certainly sent Noah to his people.',
      note: 'وَلَقَدْ + past tense — emphasis particle confirming a completed historical event.',
    },
  },
  {
    id: 'b128',
    stage: 'beginner',
    title: 'Present and Habitual Actions',
    objective: 'Use the mudari (present/habitual) tense to describe ongoing and repeated actions.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Present tense conjugation for 10 verbs', 'Habitual vs one-time distinction', 'Describe your daily routine in Arabic'],
    quranBridge: {
      arabic: 'تُسَبِّحُ لَهُ السَّمَاوَاتُ السَّبْعُ وَالْأَرْضُ',
      transliteration: "Tusabbihu lahus-samawatus-sabu wal-ard",
      meaning: 'The seven heavens and the earth and all that is therein praise Him.',
      note: 'تُسَبِّحُ is present/habitual — describing ongoing cosmic worship that never stops.',
    },
  },
  {
    id: 'b129',
    stage: 'beginner',
    title: 'Talking About the Future',
    objective: 'Discuss future plans using سَـ, سَوْفَ, and future-meaning present verbs.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Future prefix drill', 'Future promises in Quran', 'Build 5 sentences about future intentions'],
    quranBridge: {
      arabic: 'وَسَيَعْلَمُ الَّذِينَ ظَلَمُوا أَيَّ مُنقَلَبٍ يَنقَلِبُونَ',
      transliteration: "Wasayalamu l-ladhina zalamu ayya munqalabin yanqalibun",
      meaning: 'And those who wronged are going to know what a return they will be returned to.',
      note: 'سَيَعْلَمُ — the سَـ prefix turns present into near certain future: a divine warning.',
    },
  },
  {
    id: 'b130',
    stage: 'beginner',
    title: 'Phonological Awareness: All 28 Sounds',
    objective: 'Develop phonological awareness of all 28 sounds and their written triggers.',
    duration: '30 min',
    challengeLevel: 'Starter+',
    drills: ['Sound identification from letter sequences', '28-sound chart completion', 'Minimal pair discrimination test'],
    quranBridge: {
      arabic: 'قُلْ إِنِّي أُمِرْتُ أَنْ أَكُونَ أَوَّلَ مَنْ أَسْلَمَ',
      transliteration: "Qul inni umirtu an akuna awwala man aslam",
      meaning: 'Say: I have been commanded to be the first to submit.',
      note: 'This verse contains 11 of the 28 Arabic phonemes — an ideal phonological awareness passage.',
    },
  },
  {
    id: 'b131',
    stage: 'beginner',
    title: 'Arabic Listening Skills: Training Your Ear',
    objective: 'Develop listening comprehension using Quranic audio and basic Arabic speech.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Listen and identify 10 frequent words', 'Dictation: short familiar ayat', 'Match spoken word to written form'],
    quranBridge: {
      arabic: 'وَإِذَا قُرِئَ الْقُرْآنُ فَاسْتَمِعُوا لَهُ وَأَنصِتُوا',
      transliteration: "Wa idha quril-qurano fastime-u lahu wansitu",
      meaning: 'When the Quran is recited, listen to it attentively and be silent.',
      note: 'اسْتَمِعُوا (listen) and أَنصِتُوا (be silent) — the Quran commands active listening as worship.',
    },
  },
  {
    id: 'b132',
    stage: 'beginner',
    title: 'Arabic Writing Practice: Script Mastery',
    objective: 'Write 50 Arabic words from memory with correct letter forms and diacritics.',
    duration: '35 min',
    challengeLevel: 'Starter+',
    drills: ['Dictation of 50 beginner vocabulary words', 'Self-check against key', 'Correct 10 script errors'],
    quranBridge: {
      arabic: 'الَّذِي عَلَّمَ بِالْقَلَمِ',
      transliteration: "Alladhi allama bilqalam",
      meaning: 'Who taught by the pen.',
      note: 'Writing with the قَلَم (pen) is the very act the first revelation celebrates.',
    },
  },
  {
    id: 'b133',
    stage: 'beginner',
    title: 'Surah al-Kahf: Story of the Cave',
    objective: 'Build vocabulary for the first cave story in Surah al-Kahf (verses 9–26).',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Story vocabulary (25 words)', 'Narrative flow comprehension questions', 'Translate 5 key verses'],
    quranBridge: {
      arabic: 'أَمْ حَسِبْتَ أَنَّ أَصْحَابَ الْكَهْفِ وَالرَّقِيمِ كَانُوا مِنْ آيَاتِنَا عَجَبًا',
      transliteration: "Am hasibta anna ashaba l-kahfi war-raqimi kanu min ayatina ajaba",
      meaning: 'Or have you thought that the companions of the cave and inscription were, of Our signs, a wonder?',
      note: 'أَصْحَابَ الْكَهْفِ (companions of the cave) — story vocabulary begins with the title characters.',
    },
  },
  {
    id: 'b134',
    stage: 'beginner',
    title: 'Surah Yusuf: Opening Vocabulary',
    objective: 'Build vocabulary for the first 20 verses of Surah Yusuf, the best of stories.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Opening passage vocabulary (25 words)', 'Dream interpretation vocabulary', 'Translate 5 verses independently'],
    quranBridge: {
      arabic: 'إِذْ قَالَ يُوسُفُ لِأَبِيهِ يَا أَبَتِ إِنِّي رَأَيْتُ أَحَدَ عَشَرَ كَوْكَبًا',
      transliteration: "Idh qala yusufu li-abihi ya abati inni raaitu ahada ashara kawkaba",
      meaning: "When Yusuf said to his father: O my father, I saw eleven stars...",
      note: 'أَحَدَ عَشَرَ كَوْكَبًا — a compound number with its counted noun: grammar and story opening in one.',
    },
  },
  {
    id: 'b135',
    stage: 'beginner',
    title: 'Quranic Story Vocabulary: Prophet Musa',
    objective: 'Master 30 vocabulary words from the stories of Prophet Musa across multiple surahs.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Musa story vocabulary flashcards', 'Timeline ordering of events', 'Translate 3 key Musa verses'],
    quranBridge: {
      arabic: 'وَكَلَّمَ اللَّهُ مُوسَى تَكْلِيمًا',
      transliteration: "Wakallama Allahu Musa takleema",
      meaning: 'And Allah spoke to Musa directly.',
      note: 'تَكْلِيمًا — the absolute object adds "truly/directly" emphasis to the speaking.',
    },
  },
  {
    id: 'b136',
    stage: 'beginner',
    title: 'Quranic Story Vocabulary: Prophet Ibrahim',
    objective: 'Master 30 vocabulary words from the stories of Prophet Ibrahim.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Ibrahim story vocabulary flashcards', 'Key events matching', "Translate 3 Ibrahim du'a verses"],
    quranBridge: {
      arabic: 'رَبِّ اجْعَلْ هَٰذَا الْبَلَدَ آمِنًا',
      transliteration: "Rabbi ij'al hadhal-balada amina",
      meaning: "My Lord, make this city safe.",
      note: "Ibrahim's du'a for Makkah — the imperative اجْعَلْ with a direct and indirect object.",
    },
  },
  {
    id: 'b137',
    stage: 'beginner',
    title: 'Antonyms in Sentence Structure',
    objective: 'Build complex sentences using Arabic antonyms with correct conjunction patterns.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Antonym pairs sentence building', 'Contrast with أَمَّا...وَأَمَّا', '5 contrast sentences from Quran adapted'],
    quranBridge: {
      arabic: 'فَأَمَّا الْيَتِيمَ فَلَا تَقْهَرْ وَأَمَّا السَّائِلَ فَلَا تَنْهَرْ',
      transliteration: "Fa-ammal-yatima fala taqhar wa-ammas-saila fala tanhar",
      meaning: 'As for the orphan, do not oppress. And as for the petitioner, do not repel.',
      note: 'Two أَمَّا clauses of contrast — a structural and ethical lesson simultaneously.',
    },
  },
  {
    id: 'b138',
    stage: 'beginner',
    title: 'The Arabic Kitchen: Cooking Vocabulary',
    objective: 'Learn 30 cooking and kitchen words through Islamic food narratives.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Kitchen vocabulary matching', 'Islamic food ethics sentences', 'Compare halal/haram food terms'],
    quranBridge: {
      arabic: 'فَجَاءَ بِعِجْلٍ حَنِيذٍ',
      transliteration: "Fajaa bi-ijlin hanidh",
      meaning: 'And he came with a roasted calf.',
      note: 'حَنِيذٍ (roasted) — Ibrahim\'s hospitality in Surah Hud; food vocabulary meets prophetic generosity.',
    },
  },
  {
    id: 'b139',
    stage: 'beginner',
    title: 'Quranic Similes: Simple Examples',
    objective: 'Understand 10 simple Quranic similes introduced with كَ or مَثَل.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Identify simile vehicle and tenor in 10 ayat', 'Explain the meaning of 5 similes in your own words', 'Find new similes in 2 surahs'],
    quranBridge: {
      arabic: 'وَمَثَلُ كَلِمَةٍ طَيِّبَةٍ كَشَجَرَةٍ طَيِّبَةٍ',
      transliteration: "Wamathalu kalimatin tayyibatin kashajarat-tayyibah",
      meaning: 'And the example of a good word is like a good tree.',
      note: 'كَـ introduces the simile comparing a good word to a tree — Quranic similes at their most elegant.',
    },
  },
  {
    id: 'b140',
    stage: 'beginner',
    title: 'Beginner Milestone: Read Surah al-Mulk',
    objective: 'Read and translate Surah al-Mulk with less than 30% error rate.',
    duration: '50 min',
    challengeLevel: 'Capstone',
    drills: ['Full surah translation timed test', 'Self-correction using annotations', 'Grammar highlight: 10 structures identified'],
    quranBridge: {
      arabic: 'أَلَا يَعْلَمُ مَنْ خَلَقَ وَهُوَ اللَّطِيفُ الْخَبِيرُ',
      transliteration: "Ala yalamu man khalaqa wahuwal-latifu l-khabir",
      meaning: 'Does He who created not know? And He is the Subtle, the All-Aware.',
      note: 'A rhetorical question packed with grammar: negation + question + relative clause + khabar.',
    },
  },
  {
    id: 'b141',
    stage: 'beginner',
    title: 'Islamic Months Vocabulary',
    objective: 'Name and understand the significance of all 12 Hijri months in Arabic.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Month name memorisation drill', 'Match months to Islamic events', '5 date-writing exercises in Arabic'],
    quranBridge: {
      arabic: 'إِنَّ عِدَّةَ الشُّهُورِ عِندَ اللَّهِ اثْنَا عَشَرَ شَهْرًا',
      transliteration: 'Inna iddatas-shuhoori indallaahi ithna ashara shahra',
      meaning: 'Indeed the number of months with Allah is twelve months.',
      note: 'اثْنَا عَشَرَ (twelve) — a dual compound number; the Quran itself establishes the 12-month lunar year.',
    },
  },
  {
    id: 'b142',
    stage: 'beginner',
    title: 'Arabic Greetings: Beyond Salam',
    objective: 'Master 20 Arabic greetings and farewells used across Islamic contexts.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Greeting situation matching', 'Respond to 10 greeting scenarios', 'Quran reference for assalamu alaykum'],
    quranBridge: {
      arabic: 'وَإِذَا حُيِّيتُم بِتَحِيَّةٍ فَحَيُّوا بِأَحْسَنَ مِنْهَا',
      transliteration: 'Wa idha huyyitum bitahiyyatin fahayyuu bi-ahsana minha',
      meaning: 'And when you are greeted with a greeting, greet in return with what is better.',
      note: 'تَحِيَّة (greeting) — the Quran legislates returning greetings with something better or equal.',
    },
  },
  {
    id: 'b143',
    stage: 'beginner',
    title: 'Weather and Seasons in Arabic',
    objective: 'Build a 30-word vocabulary for weather phenomena mentioned in the Quran and daily life.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Weather vocabulary matching', 'Seasonal cycle labelling in Arabic', 'Find 5 weather words in Quran'],
    quranBridge: {
      arabic: 'وَأَرْسَلْنَا الرِّيَاحَ لَوَاقِحَ',
      transliteration: 'Wa arsalnaar-riyaha lawaqiha',
      meaning: 'And We have sent the fertilising winds.',
      note: 'الرِّيَاحَ (the winds) — weather vocabulary from Surah al-Hijr; the Quran describes wind as a divine agent.',
    },
  },
  {
    id: 'b144',
    stage: 'beginner',
    title: 'Plants and Agriculture in the Quran',
    objective: 'Learn 25 plant and agriculture words used in Quranic parables and descriptions.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Plant vocabulary matching', 'Parable of the grain (Surah al-Baqarah)', 'Garden description sentences'],
    quranBridge: {
      arabic: 'كَمَثَلِ حَبَّةٍ أَنبَتَتْ سَبْعَ سَنَابِلَ',
      transliteration: 'Kamathali habbatin ambatsat saba sanaabila',
      meaning: 'Like a grain which grows seven spikes.',
      note: 'حَبَّة (grain), سَنَابِل (spikes) — agriculture vocabulary serving Quran\'s most famous charity parable.',
    },
  },
  {
    id: 'b145',
    stage: 'beginner',
    title: 'Water and Rain in the Quran',
    objective: 'Learn 20 water-related words and understand their theological significance.',
    duration: '22 min',
    challengeLevel: 'Starter+',
    drills: ['Water vocabulary flashcards', 'Types of water in Quran classification', 'Translate 5 water-themed ayat'],
    quranBridge: {
      arabic: 'وَجَعَلْنَا مِنَ الْمَاءِ كُلَّ شَيْءٍ حَيٍّ',
      transliteration: 'Waja-alna minal-maa-i kulla shay-in hayy',
      meaning: 'And We made from water every living thing.',
      note: 'الْمَاء (water) — one of the most theologically loaded natural words in the Quran.',
    },
  },
  {
    id: 'b146',
    stage: 'beginner',
    title: 'Fire and Punishment Vocabulary',
    objective: 'Learn the Quran\'s vocabulary for fire, punishment, and hellfire for theological literacy.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Punishment vocabulary flashcards', 'Differentiate: naar / jahim / saqar / sa-eer', 'Build 5 warning sentences'],
    quranBridge: {
      arabic: 'وَاتَّقُوا النَّارَ الَّتِي أُعِدَّتْ لِلْكَافِرِينَ',
      transliteration: 'Wattaqun-naara l-lati u-iddat lil-kafirin',
      meaning: 'And guard yourselves against the fire prepared for the disbelievers.',
      note: 'النَّارَ (the fire) — the core punishment word in the Quran, always referencing accountability.',
    },
  },
  {
    id: 'b147',
    stage: 'beginner',
    title: 'Paradise Vocabulary: Jannah Descriptions',
    objective: 'Master 30 paradise description words from Quranic accounts of jannah.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Paradise vocabulary flashcards', 'Category sort: food / clothing / rivers / companions', 'Translate 5 jannah verses'],
    quranBridge: {
      arabic: 'فِيهَا أَنْهَارٌ مِّن مَّاءٍ غَيْرِ آسِنٍ',
      transliteration: 'Fiha anharum mim-maain ghayri asin',
      meaning: 'In it are rivers of water undecaying.',
      note: 'أَنْهَارٌ (rivers), آسِن (decaying/stagnant) — paradise vocabulary contrasting this world with the next.',
    },
  },
  {
    id: 'b148',
    stage: 'beginner',
    title: 'Angel Vocabulary in the Quran',
    objective: 'Learn 20 angel-related words from the Quran and their grammatical forms.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Angel vocabulary matching', 'Jibreel vs Mikail vs Israfeel distinction', 'Find angel mentions in 5 surahs'],
    quranBridge: {
      arabic: 'وَالْمَلَائِكَةُ يَدْخُلُونَ عَلَيْهِم مِّن كُلِّ بَابٍ',
      transliteration: 'Wal-malaikatu yadkhuluuna alayhim min kulli bab',
      meaning: 'And the angels will enter upon them from every gate.',
      note: 'الْمَلَائِكَة (the angels) — plural of مَلَك, a broken plural pattern important for intermediate study.',
    },
  },
  {
    id: 'b149',
    stage: 'beginner',
    title: 'Jinn Vocabulary in the Quran',
    objective: 'Learn what the Quran says about jinn and the vocabulary used to describe them.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Jinn vocabulary flashcards', 'Surah al-Jinn first 5 verses vocabulary', 'Compare jinn vs insan in Quran'],
    quranBridge: {
      arabic: 'قُلْ أُوحِيَ إِلَيَّ أَنَّهُ اسْتَمَعَ نَفَرٌ مِّنَ الْجِنِّ',
      transliteration: 'Qul uuhiya ilayya annahu istama-a nafarum minal-jinn',
      meaning: 'Say: It has been revealed to me that a group of jinn listened.',
      note: 'الْجِنِّ (the jinn) — an entire surah devoted to their faith story; Islamic ontology vocabulary.',
    },
  },
  {
    id: 'b150',
    stage: 'beginner',
    title: 'Day of Judgment Vocabulary: The Events',
    objective: 'Learn 30 vocabulary words describing the events of Yawm al-Qiyamah.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Event vocabulary flashcards', 'Timeline sequencing activity', 'Translate 5 Judgment Day ayat'],
    quranBridge: {
      arabic: 'يَوْمَ تَرْجُفُ الرَّاجِفَةُ تَتْبَعُهَا الرَّادِفَةُ',
      transliteration: 'Yawma tarjufur-rajifatu tatbauhaa r-radifa',
      meaning: 'On the day the shaking one will shake, followed by the subsequent one.',
      note: 'الرَّاجِفَة and الرَّادِفَة — two active participles naming the consecutive trumpet blasts.',
    },
  },
  {
    id: 'b151',
    stage: 'beginner',
    title: 'Numbers 1–100 in Arabic',
    objective: 'Read, write, and use cardinal numbers 1–100 correctly with masculine and feminine nouns.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Number dictation drill', 'Masculine/feminine polarity rule practice', '10 quantity sentences using Quran nouns'],
    quranBridge: {
      arabic: 'وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ',
      transliteration: 'Was-samaa banaynaha bi-aydin wa-inna lamuusiun',
      meaning: 'And We constructed the heaven with strength, and indeed We are expanding it.',
      note: 'Numbers and quantities appear throughout the Quran — mastering them unlocks every numerical ayah.',
    },
  },
  {
    id: 'b152',
    stage: 'beginner',
    title: 'Numbers 101–1000 and Beyond',
    objective: 'Use large numbers in Arabic: hundreds, thousands, millions, and beyond.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Large number reading sprint', 'Write 10 large numbers in Arabic word form', 'Quran number facts quiz'],
    quranBridge: {
      arabic: 'أَلْفَ سَنَةٍ إِلَّا خَمْسِينَ عَامًا',
      transliteration: 'Alfa sana-tin illa khamseena ama',
      meaning: 'A thousand years less fifty.',
      note: 'The Quran describes Nuh\'s mission as 950 years — a compound number to practise.',
    },
  },
  {
    id: 'b153',
    stage: 'beginner',
    title: 'Pronouns: All 12 Arabic Pronouns',
    objective: 'Master all 12 Arabic personal pronouns with their attached and detached forms.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['All 12 pronoun memorisation chart', 'Identify pronouns in 10 ayat', 'Replace nouns with pronouns in 8 sentences'],
    quranBridge: {
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      transliteration: 'Iyyaka nabudu wa iyyaka nastain',
      meaning: 'You alone we worship and You alone we seek help from.',
      note: 'إِيَّاكَ is the emphatic detached object pronoun — placed first for exclusivity emphasis.',
    },
  },
  {
    id: 'b154',
    stage: 'beginner',
    title: 'Demonstratives: This and That',
    objective: 'Master all forms of near (هَذَا) and far (ذَلِكَ) demonstratives for all genders and numbers.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Demonstrative substitution drill', 'Gender/number matching for 10 nouns', 'Find demonstratives in Surah al-Baqarah'],
    quranBridge: {
      arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ',
      transliteration: 'Dhalikal-kitabu la rayba fih',
      meaning: 'That is the Book; there is no doubt in it.',
      note: 'ذَٰلِكَ (that — far demonstrative) — immediately after Bismillah in Surah al-Baqarah.',
    },
  },
  {
    id: 'b155',
    stage: 'beginner',
    title: 'Relative Pronouns: Who, Which, That',
    objective: 'Use الَّذِي and الَّتِي correctly to build relative clauses.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Alladhi vs allati gender drill', 'Build 8 relative clauses', 'Identify relative clauses in 5 Quran ayat'],
    quranBridge: {
      arabic: 'إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ',
      transliteration: 'Innal-ladhina amanu wa amilas-salihat',
      meaning: 'Indeed those who believe and do righteous deeds.',
      note: 'الَّذِينَ (those who) — masculine plural relative pronoun beginning one of the Quran\'s most repeated phrases.',
    },
  },
  {
    id: 'b156',
    stage: 'beginner',
    title: 'Question Words: Who, What, When, How, Why',
    objective: 'Master all 8 Arabic interrogative words and use them to form natural questions.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Question word identification drill', 'Match question to answer from Quran verses', 'Write 5 questions about a Quran story'],
    quranBridge: {
      arabic: 'مَنْ يَعْمَلْ سُوءًا يُجْزَ بِهِ',
      transliteration: 'Man yamaal suu-an yujza bih',
      meaning: 'Whoever does evil shall be recompensed for it.',
      note: 'مَنْ (whoever) — used as a conditional pronoun here, not only as a direct question word.',
    },
  },
  {
    id: 'b157',
    stage: 'beginner',
    title: 'Negation: La, Lam, Lan, Laysa, Ma',
    objective: 'Distinguish all 5 Arabic negation particles and apply them in contexts.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['5 negation particle identification from Quran verses', 'Insert correct negation in 10 sentences', 'Past / present / future negation distinction'],
    quranBridge: {
      arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      transliteration: 'Lam yalid walam yulad walam yakul-lahu kufuwan ahad',
      meaning: 'He neither begets nor is born, nor is there to Him any equivalent.',
      note: 'Three consecutive لَمْ negations — the heart of Surah al-Ikhlas in grammar form.',
    },
  },
  {
    id: 'b158',
    stage: 'beginner',
    title: 'Conditional Sentences: If/Then in Arabic',
    objective: 'Form basic conditional sentences using إِنْ, إِذَا, and لَوْ.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Conditional particle identification', 'Complete 8 if/then sentences', 'Find conditionals in Surah al-Kahf'],
    quranBridge: {
      arabic: 'إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي',
      transliteration: 'In kuntum tuhibbuunallaaha fat-tabi-uni',
      meaning: 'If you love Allah, follow me.',
      note: 'إِن (real condition) + جواب (answer) — the test of love: a conditional sentence of profound impact.',
    },
  },
  {
    id: 'b159',
    stage: 'beginner',
    title: 'Describing Location: Adverbs of Place',
    objective: 'Use هُنَا, هُنَاكَ, أَمَامَ, وَرَاءَ, يَمِينَ, يَسَارَ in location descriptions.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Location adverb flashcards', 'Describe mosque/masjid layout in Arabic', 'Quranic geography sentences'],
    quranBridge: {
      arabic: 'وَهُوَ مَعَكُمْ أَيْنَمَا كُنتُمْ',
      transliteration: 'Wahuwa maakum aynamaa kuntum',
      meaning: 'And He is with you wherever you are.',
      note: 'أَيْنَمَا (wherever) — a compound location word: presence of Allah is not limited by place.',
    },
  },
  {
    id: 'b160',
    stage: 'beginner',
    title: 'Ordinal Numbers and Sequence',
    objective: 'Form and use ordinal numbers (first through tenth) in Arabic sentences.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Ordinal number formation drill', 'Rank 5 events in sequence in Arabic', 'Islamic pillar numbering exercise'],
    quranBridge: {
      arabic: 'فَكَانَ قَابَ قَوْسَيْنِ أَوْ أَدْنَى',
      transliteration: 'Fakana qaaba qawsayni aw adna',
      meaning: 'And he was at a distance of two bow lengths or even nearer.',
      note: 'قَوْسَيْنِ (dual of bow) and أَدْنَى (nearer, comparative of dani) — measurement and ordinal vocabulary.',
    },
  },
  {
    id: 'b161',
    stage: 'beginner',
    title: 'Basic Verb Conjugation: Singular Forms',
    objective: 'Conjugate regular verbs in all 6 singular past-tense persons (he/she/you/I).',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Past tense conjugation table for 5 verbs', 'Identify subject from verb ending alone', 'Fill-in-the-blank 10 conjugation exercises'],
    quranBridge: {
      arabic: 'قَالَ رَبِّ إِنِّي وَهَنَ الْعَظْمُ مِنِّي',
      transliteration: 'Qaala rabb inni wahana l-azmu minni',
      meaning: 'He said: My Lord, my bone has weakened.',
      note: 'قَالَ (3rd m.sg) and وَهَنَ (3rd m.sg) — two past conjugations in Zakariyya\'s du\'a.',
    },
  },
  {
    id: 'b162',
    stage: 'beginner',
    title: 'Basic Verb Conjugation: Plural Forms',
    objective: 'Conjugate regular verbs in all 6 plural past-tense persons.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Plural past tense conjugation table', 'Identify plural vs singular from endings', 'Quran plurals identification exercise'],
    quranBridge: {
      arabic: 'وَقَالُوا سَمِعْنَا وَأَطَعْنَا',
      transliteration: 'Waqaloo samina wa ata-na',
      meaning: 'And they said: We hear and we obey.',
      note: 'قَالُوا (3rd m.pl) and سَمِعْنَا/أَطَعْنَا (1st pl) — plural conjugation in one powerful declaration.',
    },
  },
  {
    id: 'b163',
    stage: 'beginner',
    title: 'Present Tense Conjugation: All Persons',
    objective: 'Conjugate regular verbs in all 14 present tense persons.',
    duration: '32 min',
    challengeLevel: 'Momentum',
    drills: ['Full present tense conjugation table', 'Spot present tense in 10 Quran verses', 'Convert past to present in 8 sentences'],
    quranBridge: {
      arabic: 'يُؤْمِنُونَ بِالْغَيْبِ وَيُقِيمُونَ الصَّلَاةَ',
      transliteration: 'Yuminuuna bil-ghaybi wayuqimuunas-salaah',
      meaning: 'They believe in the unseen and establish prayer.',
      note: 'يُؤْمِنُونَ and يُقِيمُونَ — 3rd masculine plural present tense: describing the believers.',
    },
  },
  {
    id: 'b164',
    stage: 'beginner',
    title: 'Hollow Verbs: Understanding Weakness',
    objective: 'Recognise and conjugate the most common hollow verbs (waw and ya-middle).',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Identify hollow root from conjugated form', 'Conjugate 5 hollow verbs in past/present', 'Find hollow verbs in 5 ayat'],
    quranBridge: {
      arabic: 'قَالَ وَمَن يَقْنَطُ مِن رَّحْمَةِ رَبِّهِ إِلَّا الضَّالُّونَ',
      transliteration: 'Qaala wa man yaqnatu mir-rahmati rabbihi illad-dallun',
      meaning: 'He said: who despairs of the mercy of his Lord except the astray?',
      note: 'يَقْنَطُ — a hollow verb in present tense; the Quran forbids despair even when all seems lost.',
    },
  },
  {
    id: 'b165',
    stage: 'beginner',
    title: 'Defective Verbs: Ya-Final Roots',
    objective: 'Recognise and conjugate ya-final (defective) verbs like دَعَا, رَأَى, and مَشَى.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Defective verb conjugation drill', 'Identify defective root in 8 words', 'Past/present for دَعَا and مَشَى'],
    quranBridge: {
      arabic: 'وَإِذَا دَعَاكُمْ لِمَا يُحْيِيكُمْ',
      transliteration: 'Wa idha daakum lima yuhyiikum',
      meaning: 'When He calls you to that which gives you life.',
      note: 'دَعَاكُم (he called you) and يُحْيِيكُم (He enlivens you) — two defective verbs in one ayah.',
    },
  },
  {
    id: 'b166',
    stage: 'beginner',
    title: 'Hamzated Verbs: Managing the Glottal Stop',
    objective: 'Read and write common hamzated verbs correctly without dropping the hamza.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Hamzated verb spelling practice', 'Hamza seat identification in 10 words', 'Conjugate أَكَلَ and أَخَذَ'],
    quranBridge: {
      arabic: 'أَكَلَا مِنْهَا فَبَدَتْ لَهُمَا سَوْآتُهُمَا',
      transliteration: 'Akala minha fabadata lahuma saw-atuhuma',
      meaning: 'They both ate from it, and their shame became apparent.',
      note: 'أَكَلَا (they both ate) — dual past tense of the hamzated verb أَكَلَ in the story of Adam.',
    },
  },
  {
    id: 'b167',
    stage: 'beginner',
    title: 'Doubled Verbs: Geminate Roots',
    objective: 'Recognise and conjugate doubled (geminate) verbs where the second and third root letters are identical.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Doubled verb identification', 'Conjugate مَدَّ and رَدَّ', 'Find doubled verbs in 5 ayat'],
    quranBridge: {
      arabic: 'وَرَدَّ اللَّهُ الَّذِينَ كَفَرُوا بِغَيْظِهِمْ',
      transliteration: 'Wa raddallaahu l-ladhina kafaru bighayzihim',
      meaning: 'And Allah turned back those who disbelieved in their rage.',
      note: 'رَدَّ (He turned back) — geminate verb: root رَدَّ with doubled dal compressed into shadda.',
    },
  },
  {
    id: 'b168',
    stage: 'beginner',
    title: 'Verb Form II: Intensification and Teaching',
    objective: 'Understand Form II (فَعَّلَ) verbs: their formation, meanings of intensification and causation.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Form II identification from 10 verbs', 'Build Form II from 5 Form I roots', 'Find 8 Form II verbs in Quran'],
    quranBridge: {
      arabic: 'عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ',
      transliteration: "Allamal-qur'ana khalaqal-insan",
      meaning: 'He taught the Quran. He created humanity.',
      note: 'عَلَّمَ is Form II of عَلِمَ — the intensified/causative form: "He made learn / directly taught".',
    },
  },
  {
    id: 'b169',
    stage: 'beginner',
    title: 'Verb Form III: Mutual and Reciprocal Actions',
    objective: 'Understand Form III (فَاعَلَ) verbs indicating reciprocal or attempted actions.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Form III identification from 10 verbs', 'Build Form III from 5 Form I roots', 'Find 5 Form III verbs in Quran'],
    quranBridge: {
      arabic: 'وَسَارِعُوا إِلَى مَغْفِرَةٍ مِّن رَّبِّكُمْ',
      transliteration: 'Wasariu ila maghfiratin mir-rabbikum',
      meaning: 'And hasten to forgiveness from your Lord.',
      note: 'سَارِعُوا is Form III imperative plural of سَرِعَ — implying competing with each other to reach forgiveness.',
    },
  },
  {
    id: 'b170',
    stage: 'beginner',
    title: 'Verb Form IV: Making Something Happen',
    objective: 'Understand Form IV (أَفْعَلَ) verbs and their causative meaning.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Form IV identification drill', 'Convert simple verb to causative Form IV', 'Find 8 Form IV verbs in Quran'],
    quranBridge: {
      arabic: 'أَسْلَمْتُ وَجْهِيَ لِلَّهِ',
      transliteration: 'Aslamtu wajhiya lillah',
      meaning: 'I have submitted my face to Allah.',
      note: 'أَسْلَمَ (Form IV of سَلِمَ) — "to make oneself safe / enter into submission." The root of Islam.',
    },
  },
  {
    id: 'b171',
    stage: 'beginner',
    title: 'Active and Passive Participles',
    objective: 'Form and recognise active (فَاعِل) and passive (مَفْعُول) participles.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Build active and passive participles from 10 roots', 'Spot participles vs verbs in 5 ayat', 'Adjectival participle usage drill'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ كَانَ سَمِيعًا بَصِيرًا',
      transliteration: 'Innallaha kana samian basira',
      meaning: 'Indeed Allah is ever Hearing, ever Seeing.',
      note: 'سَمِيعًا and بَصِيرًا — both are فَعِيل patterns (intensified Form I active participle-adjectives).',
    },
  },
  {
    id: 'b172',
    stage: 'beginner',
    title: 'The Imperative (Command) Form',
    objective: 'Form singular and plural imperatives from regular verbs and use them correctly.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Build imperatives from 10 verbs', 'Command vs prohibition pair drill', 'Quran commands identification'],
    quranBridge: {
      arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
      transliteration: 'Iqra bismi rabbikal-lladhi khalaq',
      meaning: 'Read in the name of your Lord who created.',
      note: 'اقْرَأْ — Form I imperative of قَرَأَ; the first revealed command in the Quran.',
    },
  },
  {
    id: 'b173',
    stage: 'beginner',
    title: 'Expressing Ability and Possibility',
    objective: 'Use يَسْتَطِيعُ, يُمْكِنُ, and قَادِرٌ to express ability, capacity, and possibility.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Ability expression flashcards', 'Build 8 "I am able to..." sentences', 'Find ability expressions in 3 surahs'],
    quranBridge: {
      arabic: 'إِنَّكَ لَا تَهْدِي مَنْ أَحْبَبْتَ وَلَٰكِنَّ اللَّهَ يَهْدِي مَن يَشَاءُ',
      transliteration: 'Innaka la tahdi man ahbabta walakinnallaha yahdi man yasha',
      meaning: 'Indeed you do not guide those you love, but Allah guides whom He wills.',
      note: 'لَا تَهْدِي — the limit of human ability; يَهْدِي — the unlimited divine ability. Contrast in one verse.',
    },
  },
  {
    id: 'b174',
    stage: 'beginner',
    title: 'Expressing Need and Want',
    objective: 'Use يُرِيدُ, يَحْتَاجُ, and يَطْلُبُ to express desire, need, and request.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Desire/need expression drill', 'Build 5 "I want / I need" sentences', 'Find want/need in 5 Quran ayat'],
    quranBridge: {
      arabic: 'يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ',
      transliteration: 'Yureedullahu bikumul-yusra wala yuredu bikumul-usr',
      meaning: 'Allah wants ease for you and does not want hardship for you.',
      note: 'يُرِيدُ (Form IV: He wants/intends) — divine will vocabulary essential for theology and conversation.',
    },
  },
  {
    id: 'b175',
    stage: 'beginner',
    title: 'Expressing Emotion in Arabic',
    objective: 'Build 25 emotion-vocabulary words and construct a simple emotional narrative in Arabic.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Emotion vocabulary matching', 'Describe a Quranic character\'s emotional state', 'Build affective sentences'],
    quranBridge: {
      arabic: 'وَابْيَضَّتْ عَيْنَاهُ مِنَ الْحُزْنِ',
      transliteration: 'Wabyaddhat aynahu minal-huzn',
      meaning: 'And his eyes whitened from grief.',
      note: 'الْحُزْن (grief) — the whitening of Yaqub\'s eyes from sadness over Yusuf: emotion vocabulary at its most vivid.',
    },
  },
  {
    id: 'b176',
    stage: 'beginner',
    title: 'Speaking About Intentions: Niyya',
    objective: 'Build the language of intention: نَوَى, قَصَدَ, نِيَّة and their grammatical structures.',
    duration: '22 min',
    challengeLevel: 'Starter+',
    drills: ['Intention vocabulary drill', 'Build 5 intention sentences', 'Islamic niyya formula in Arabic'],
    quranBridge: {
      arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
      transliteration: 'Innamal-amalu bin-niyyat',
      meaning: 'Actions are only by intentions.',
      note: 'النِّيَّات (intentions) — the foundational hadith of Islamic scholarship, packed into 4 Arabic words.',
    },
  },
  {
    id: 'b177',
    stage: 'beginner',
    title: 'Expressing Certainty and Doubt',
    objective: 'Use قَطْعًا, بِلَا شَكّ, رُبَّمَا, and لَعَلَّ to express degrees of certainty.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Certainty spectrum placement drill', 'Insert word from certainty/doubt in 8 sentences', 'Quran certainty/hope phrases'],
    quranBridge: {
      arabic: 'لَعَلَّكُمْ تُفْلِحُونَ',
      transliteration: 'Laallakum tuflihun',
      meaning: 'Perhaps you will succeed.',
      note: 'لَعَلَّ (perhaps/in hope that) — one of the most motivating particles in the Quran.',
    },
  },
  {
    id: 'b178',
    stage: 'beginner',
    title: 'Talking About Family in Arabic',
    objective: 'Name every family relationship in Arabic and use family vocabulary in sentences.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Family tree labelling in Arabic', 'Construct 5 family description sentences', 'Quran family relationships vocabulary'],
    quranBridge: {
      arabic: 'وَوَصَّيْنَا الْإِنسَانَ بِوَالِدَيْهِ إِحْسَانًا',
      transliteration: 'Wawassaynal-insaana biwaalidayhi ihsana',
      meaning: 'And We have instructed mankind to be good to their parents.',
      note: 'وَالِدَيْهِ (dual: his two parents) — the Quran links family duty directly to worship throughout.',
    },
  },
  {
    id: 'b179',
    stage: 'beginner',
    title: 'Ta Marbuta: The Tied Ta',
    objective: 'Read and write ta marbuta correctly and understand its role in Arabic grammar.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Ta marbuta identification in 20 words', 'Pronunciation rules: pausing vs continuing', 'Idafa with feminine noun drill'],
    quranBridge: {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ',
      transliteration: 'Bismillahir-rahmanir-rahim',
      meaning: 'In the name of Allah, the Most Gracious, the Most Merciful.',
      note: 'الرَّحْمَـٰنِ ends in ta marbuta (before the kasra ending): the most recited ta marbuta in existence.',
    },
  },
  {
    id: 'b180',
    stage: 'beginner',
    title: 'Alif Layyina vs Alif Mamduda',
    objective: 'Distinguish between the two types of long alif and write them without confusion.',
    duration: '18 min',
    challengeLevel: 'Starter',
    drills: ['Alif type identification in 20 words', 'Dictation of 15 words with alif distinctions', 'Quran word sorting by alif type'],
    quranBridge: {
      arabic: 'هُدًى لِّلْمُتَّقِينَ',
      transliteration: 'Hudan lil-muttaqin',
      meaning: 'Guidance for the God-fearing.',
      note: 'هُدًى ends with alif layyina (ى without dots) — a critical script distinction for reading accuracy.',
    },
  },
  {
    id: 'b181',
    stage: 'beginner',
    title: 'The Tanwin: Nunation in Arabic',
    objective: 'Apply tanwin correctly across all three cases (damm, fath, kasr) and understand its purpose.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Tanwin application to 10 indefinite nouns', 'Identify tanwin type in 10 Quran words', 'The madd rule with fathatayn drill'],
    quranBridge: {
      arabic: 'نُورًا وَهُدًى',
      transliteration: 'Nuran wahuda',
      meaning: 'A light and a guidance.',
      note: 'نُورًا (accusative tanwin) and هُدًى (alif layyina + tanwin) — two tanwin types in two words.',
    },
  },
  {
    id: 'b182',
    stage: 'beginner',
    title: 'Reading Without Harakat (Undotted/Unvoweled)',
    objective: 'Begin reading simple Arabic text without full diacritical marks using context.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Short passage reading without harakat', 'Add missing harakat to partially voweled text', 'Compare self-correction with marked original'],
    quranBridge: {
      arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
      transliteration: 'Walaqad yassarnal-qurana lidh-dhikri fahal mim muddakir',
      meaning: 'And We have certainly made the Quran easy for remembrance, so is there any who will remember?',
      note: 'The Quran promises ease — reading without harakat is a natural step, not a barrier.',
    },
  },
  {
    id: 'b183',
    stage: 'beginner',
    title: 'Arabic Conversation Starters',
    objective: 'Open, sustain, and close a simple 3-minute Arabic conversation using known vocabulary.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Dialogue role-play: meeting someone new', 'Conversation repair expressions', 'Natural filler words in Arabic'],
    quranBridge: {
      arabic: 'وَقُولُوا لِلنَّاسِ حُسْنًا',
      transliteration: 'Waquloo lin-naasi husna',
      meaning: 'And speak to people with goodness.',
      note: 'حُسْنًا (goodness) — the Quran sets the standard for every conversation: speak with excellence.',
    },
  },
  {
    id: 'b184',
    stage: 'beginner',
    title: 'Describing Places in Arabic',
    objective: 'Use adjectives and prepositions to describe a physical place in Arabic.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Describe your home using Arabic adjectives', 'Mosque description writing exercise', 'Find place descriptions in 2 surahs'],
    quranBridge: {
      arabic: 'وَإِذْ جَعَلْنَا الْبَيْتَ مَثَابَةً لِّلنَّاسِ وَأَمْنًا',
      transliteration: 'Wa idh jaalna l-bayta mathabatan lin-naasi wa-amna',
      meaning: 'And when We made the House a centre for people and a sanctuary.',
      note: 'مَثَابَة (a place of return) and أَمْن (sanctuary) — place descriptions for the Kaaba in Quran.',
    },
  },
  {
    id: 'b185',
    stage: 'beginner',
    title: 'Adjective Agreement Rules: Full Chart',
    objective: 'Master adjective-noun agreement across all combinations of gender, number, and definiteness.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Full agreement table completion', 'Correct agreement errors in 10 phrases', 'Build 8 noun-adjective descriptions from Quran vocabulary'],
    quranBridge: {
      arabic: 'صِرَاطَ الْمُسْتَقِيمَ',
      transliteration: 'Siratal-mustaqim',
      meaning: 'The straight path.',
      note: 'صِرَاط (m.sg) + الْمُسْتَقِيم (m.sg definite) — agreement perfect; one of the most repeated Quran phrases.',
    },
  },
  {
    id: 'b186',
    stage: 'beginner',
    title: 'Country and City Names in Arabic',
    objective: 'Read and write 25 country and city names in Arabic script with correct pronunciation.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Arabic country name flashcards', 'Write 10 country names in Arabic script', 'Identify countries in Islamic geography context'],
    quranBridge: {
      arabic: 'سُبْحَانَ الَّذِي أَسْرَى بِعَبْدِهِ لَيْلًا مِّنَ الْمَسْجِدِ الْحَرَامِ إِلَى الْمَسْجِدِ الْأَقْصَى',
      transliteration: "Subhana l-ladhee asra bi-abdihi laylan minal-masjidil-haraami ilal-masjidil-aqsa",
      meaning: 'Glory to Him who took His servant by night from al-Masjid al-Haram to al-Masjid al-Aqsa.',
      note: 'مَسْجِد الْحَرَام (Makkah) and مَسْجِد الْأَقْصَى (Jerusalem) — two holy city names in one verse.',
    },
  },
  {
    id: 'b187',
    stage: 'beginner',
    title: 'Passive Voice Basics',
    objective: 'Recognise the passive voice pattern (فُعِلَ past, يُفْعَلُ present) and translate passives.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Identify passive in 10 Quran verbs', 'Convert 5 active to passive sentences', 'Passive vocabulary: خُلِقَ, أُنزِلَ, أُرسِلَ'],
    quranBridge: {
      arabic: 'خُلِقَ الْإِنسَانُ مِنْ عَجَلٍ',
      transliteration: 'Khuliqal-insaanu min ajal',
      meaning: 'Man was created of haste.',
      note: 'خُلِقَ is passive past — the agent (Allah) is omitted, keeping focus on the human condition.',
    },
  },
  {
    id: 'b188',
    stage: 'beginner',
    title: 'Dual Form: Two of Everything',
    objective: 'Form and use the Arabic dual for nouns, verbs, and pronouns.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Dual noun formation drill', 'Dual verb identification in 10 ayat', 'Dual pronoun in attached form'],
    quranBridge: {
      arabic: 'أَكَلَا مِنْهَا فَبَدَتْ لَهُمَا سَوْآتُهُمَا',
      transliteration: 'Akalaa minha fabadata lahuma saw-atuhuma',
      meaning: 'They both ate from it, and their shame became apparent to them both.',
      note: 'أَكَلَا (dual past), لَهُمَا (dual prep pronoun), سَوْآتُهُمَا (dual possessive) — the dual system in action.',
    },
  },
  {
    id: 'b189',
    stage: 'beginner',
    title: 'Sound Plurals vs Broken Plurals',
    objective: 'Distinguish sound (سَالِم) plurals from broken (تَكْسِير) plurals and form both correctly.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Sort 20 nouns into sound or broken plural', 'Form sound plurals for 10 nouns', 'Identify broken plural pattern in 5 words'],
    quranBridge: {
      arabic: 'وَالْمُؤْمِنُونَ وَالْمُؤْمِنَاتُ',
      transliteration: 'Wal-muminuuna wal-muminaat',
      meaning: 'The believing men and the believing women.',
      note: 'مُؤْمِنُونَ (m. sound plural) and مُؤْمِنَاتُ (f. sound plural) — the two sound plural endings in one phrase.',
    },
  },
  {
    id: 'b190',
    stage: 'beginner',
    title: 'Beginner Vocabulary Milestone: 500 Words',
    objective: 'Review and seal 500 core beginner vocabulary words through rapid-fire testing.',
    duration: '50 min',
    challengeLevel: 'Capstone',
    drills: ['500-word recognition speed drill', 'Gap-fill sentences with vocabulary choices', 'Build a 20-sentence passage using only known words'],
    quranBridge: {
      arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
      transliteration: 'Waqul rabbi zidni ilma',
      meaning: 'And say: My Lord, increase me in knowledge.',
      note: 'زِدْنِي عِلْمًا — the only place in the Quran where the Prophet ﷺ is told to ask for increase of anything specific: knowledge.',
    },
  },
  {
    id: 'b191',
    stage: 'beginner',
    title: 'Broken Plural Patterns: The Six Most Common',
    objective: 'Recognise and form broken plurals using 6 major patterns (awzaan).',
    duration: '32 min',
    challengeLevel: 'Momentum',
    drills: ['Pattern-to-example matching', 'Form broken plurals from 10 singular nouns', 'Find each pattern in Quran examples'],
    quranBridge: {
      arabic: 'وَخَلَقَ الْجِبَالَ',
      transliteration: 'Wakhalaqal-jibaal',
      meaning: 'And He created the mountains.',
      note: 'الْجِبَال is broken plural of جَبَل (Pattern: فِعَال) — one of the six most productive patterns.',
    },
  },
  {
    id: 'b192',
    stage: 'beginner',
    title: 'The Idafa (Possessive Construction)',
    objective: 'Build idafa chains correctly: first word without al, second word genitive.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Build 10 idafa phrases', 'Add third member to idafa chain', 'Identify idafa boundaries in 5 ayat'],
    quranBridge: {
      arabic: 'كِتَابُ اللَّهِ',
      transliteration: 'Kitabullahi',
      meaning: 'The Book of Allah.',
      note: 'كِتَابُ (construct state, no al) + اللَّهِ (genitive) — the simplest and most important idafa in the Quran.',
    },
  },
  {
    id: 'b193',
    stage: 'beginner',
    title: 'Possessive Pronouns Attached to Nouns',
    objective: 'Attach all 12 possessive pronoun suffixes to nouns correctly.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Suffix attachment drill for 5 nouns', 'Identify pronoun suffix in 10 Quran words', 'Build 8 possessive phrases'],
    quranBridge: {
      arabic: 'إِيَّاكَ نَعْبُدُ',
      transliteration: 'Iyyaka nabudu',
      meaning: 'You alone we worship.',
      note: 'كَ is a 2nd person singular masculine pronoun attached to إِيَّا — the most worshipped pronoun in Arabic.',
    },
  },
  {
    id: 'b194',
    stage: 'beginner',
    title: 'The Mazmum (Case System) Introduction',
    objective: 'Understand Arabic\'s three cases (rafa, nasb, jarr) and know when each applies.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Identify case of subject/object/prepositional in 10 sentences', 'Add correct case endings to 8 phrases', 'Case quiz from Quran passage'],
    quranBridge: {
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: 'Alhamdu lillahi rabbil-alamin',
      meaning: 'All praise is for Allah, Lord of all worlds.',
      note: 'الْحَمْدُ (nominative), لِلَّهِ (genitive after li), رَبِّ (genitive in idafa) — three cases in one verse.',
    },
  },
  {
    id: 'b195',
    stage: 'beginner',
    title: 'Kana and Its Sisters: The Past State Verb',
    objective: 'Use كَانَ and its 13 sisters to express past states and attributes.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Kana conjugation drill', 'Insert kana sister in 10 sentences', 'Find 5 kana structures in Quran'],
    quranBridge: {
      arabic: 'وَكَانَ اللَّهُ سَمِيعًا بَصِيرًا',
      transliteration: 'Wakanallahu samian basira',
      meaning: 'And Allah has always been Hearing and Seeing.',
      note: 'كَانَ as a timeless state copula — its khabar سَمِيعًا بَصِيرًا is in the accusative.',
    },
  },
  {
    id: 'b196',
    stage: 'beginner',
    title: 'Inna and Its Sisters: Emphasising Sentences',
    objective: 'Use إِنَّ and its 5 sisters to emphasise and change the preceding noun to accusative.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Inna sisters identification', 'Add inna to 8 sentences correctly', 'Find 3 each of different inna sisters in Quran'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
      transliteration: 'Innallaha maas-sabirin',
      meaning: 'Indeed Allah is with those who are patient.',
      note: 'إِنَّ changes اللَّه to اللَّهَ (accusative) — the emphasis particle that begins 100s of Quranic verses.',
    },
  },
  {
    id: 'b197',
    stage: 'beginner',
    title: 'Jussive Mood: After Lam and Negation',
    objective: 'Use the jussive (مَجْزُوم) mood correctly after لَمْ, لَمَّا, and لام الأمر.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Jussive verb identification in 10 ayat', 'Convert present to jussive after lam', 'Jussive vs indicative distinction drill'],
    quranBridge: {
      arabic: 'لَمْ يَلِدْ وَلَمْ يُولَدْ',
      transliteration: 'Lam yalid walam yulad',
      meaning: 'He did not beget nor was He begotten.',
      note: 'يَلِدْ and يُولَدْ — both jussive after لَمْ: the dropping of the final vowel confirms jussive mood.',
    },
  },
  {
    id: 'b198',
    stage: 'beginner',
    title: 'Subjunctive Mood: After An and Li',
    objective: 'Use the subjunctive (مَنْصُوب) mood correctly after أَنْ, لِـ, and كَيْ.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Subjunctive identification in 10 verses', 'Build purpose clauses with li + subjunctive', 'Convert 5 sentences from indicative to subjunctive'],
    quranBridge: {
      arabic: 'لِيَغْفِرَ لَكُم مِّن ذُنُوبِكُمْ',
      transliteration: 'Liyaghfira lakum min dhunubikum',
      meaning: 'That He may forgive you your sins.',
      note: 'لِيَغْفِرَ — lam of purpose + subjunctive: the final ا dropped, showing the nassb mood ending.',
    },
  },
  {
    id: 'b199',
    stage: 'beginner',
    title: 'Circumstantial Clause (Hal): While and As',
    objective: 'Form and translate hal clauses describing the state of the subject when the verb occurs.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Hal clause identification in 5 verses', 'Add a hal clause to 5 sentences', 'Translate 5 hal-containing ayat'],
    quranBridge: {
      arabic: 'فَخَرَجَ عَلَى قَوْمِهِ فِي زِينَتِهِ',
      transliteration: 'Fakharaja ala qawmihi fi-zinatih',
      meaning: 'And he came out before his people in his adornment.',
      note: 'فِي زِينَتِهِ — a hal phrase describing the state of Qarun as he emerged.',
    },
  },
  {
    id: 'b200',
    stage: 'beginner',
    title: 'Beginner Grammar Milestone Test',
    objective: 'Demonstrate mastery of all beginner grammar topics through a comprehensive test.',
    duration: '60 min',
    challengeLevel: 'Capstone',
    drills: ['75-question grammar test', 'Translation of Surah al-Mulk verse-by-verse', 'Written essay: 20 sentences about Islamic topics'],
    quranBridge: {
      arabic: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ',
      transliteration: 'Faman yammal mithqaala dharratin khayran yarah, waman yammal mithqaala dharratin sharran yarah',
      meaning: 'Whoever does an atom\'s weight of good will see it, and whoever does an atom\'s weight of evil will see it.',
      note: 'Two perfect mirror sentences — the beginner capstone tests whether you can read, understand, and explain both.',
    },
  },
  {
    id: 'b201',
    stage: 'beginner',
    title: 'The Quran\'s Rhetorical Questions',
    objective: 'Identify and explain 15 rhetorical questions in the Quran and their implied answers.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Identify false-question vs real-question', 'Provide the implied answer for 8 rhetorical questions', 'Find 5 new rhetorical questions in 2 surahs'],
    quranBridge: {
      arabic: 'أَلَيْسَ اللَّهُ بِكَافٍ عَبْدَهُ',
      transliteration: "Alayasallahu bikaafin abdah",
      meaning: 'Is Allah not sufficient for His servant?',
      note: 'أَلَيْسَ — a negated question expecting "yes/of course" — rhetorical question for affirmation.',
    },
  },
  {
    id: 'b202',
    stage: 'beginner',
    title: 'The Quran\'s Oaths: Swearing by Creation',
    objective: 'Understand the structure and purpose of Quranic oaths (qasam) and list 10 examples.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Oath structure analysis (waw/ba/ta of oath + object)', 'Identify 10 Quranic oaths across 5 surahs', 'Explain why each oath object is chosen'],
    quranBridge: {
      arabic: 'وَالتِّينِ وَالزَّيْتُونِ وَطُورِ سِينِينَ',
      transliteration: 'Wat-teeni waz-zaytuni wa-turi sineen',
      meaning: 'By the fig and the olive and Mount Sinai.',
      note: 'Three consecutive oaths — each connected to prophetic geography (Palestine, olive country, Sinai).',
    },
  },
  {
    id: 'b203',
    stage: 'beginner',
    title: 'Divine Names in the Quran: Grammar Review',
    objective: 'Map the grammatical forms of all 99 names of Allah and classify them by pattern.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Name pattern classification', 'Intensive vs comparative vs active participle types', 'Memorise 10 names with meaning and pattern'],
    quranBridge: {
      arabic: 'هُوَ اللَّهُ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ الْمُؤْمِنُ الْمُهَيْمِنُ',
      transliteration: "Huwallaahu l-ladhee la ilaha illa huwal-maliku l-quddoosu s-salamu l-mu'minu l-muhayminu",
      meaning: 'He is Allah, other than whom there is no god — the King, the Holy, the Peace, the Granter of Security, the Guardian.',
      note: 'Five divine names in sequence — each a unique morphological pattern worth analysing.',
    },
  },
  {
    id: 'b204',
    stage: 'beginner',
    title: 'How to Make Du\'a in Arabic',
    objective: 'Construct a complete Arabic du\'a using 5 structural elements: praise, need, response, sincerity.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Du\'a structure analysis of 3 prophetic du\'as', 'Write your own du\'a using covered vocabulary', 'Identify grammatical structures in du\'a texts'],
    quranBridge: {
      arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      transliteration: "Rabbana atina fid-dunya hasanatan wafil-akhirati hasanatan waqina adhaban-nar",
      meaning: 'Our Lord, give us good in this world and good in the Hereafter and protect us from the torment of the Fire.',
      note: 'The most comprehensive du\'a of the Quran — three requests, a grammar lesson, and a theology in one verse.',
    },
  },
  {
    id: 'b205',
    stage: 'beginner',
    title: 'Personal Pronouns as Khabar',
    objective: 'Use pronoun sentences (mubtada/khabar) with detached pronouns as the predicate.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Pronoun khabar identification', 'Build 8 pronoun predicate sentences', 'Translate 5 Quran pronoun-khabar structures'],
    quranBridge: {
      arabic: 'إِنَّهُ هُوَ السَّمِيعُ الْعَلِيمُ',
      transliteration: 'Innahu huwas-samiul-alim',
      meaning: 'Indeed He is the Hearing, the Knowing.',
      note: 'هُوَ here separates the subject إِنَّهُ from the predicate السَّمِيعُ — a فصل (separator) pronoun.',
    },
  },
  {
    id: 'b206',
    stage: 'beginner',
    title: 'Writing Arabic Sentences: Wordorder Practice',
    objective: 'Practise writing grammatically correct Arabic sentences with proper word order.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Sentence reordering exercise', 'Correct 10 wrongly ordered sentences', 'Build 8 original sentences about Islamic themes'],
    quranBridge: {
      arabic: 'إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ',
      transliteration: 'Innama yakhshallaha min ibadihil-ulama',
      meaning: 'Indeed only those who fear Allah among His servants are the knowledgeable ones.',
      note: 'Subject (الْعُلَمَاءُ) follows the object (اللَّهَ) — a VSO sentence with rhetorical focus on the scholars.',
    },
  },
  {
    id: 'b207',
    stage: 'beginner',
    title: 'The Particle "Fa": Sequence and Result',
    objective: 'Use the فَـ particle to show sequence, result, and cause in Arabic sentences.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Fa particle type identification in 10 ayat', 'Add fa to 5 sentence pairs', 'Distinguish consecutive from causal fa'],
    quranBridge: {
      arabic: 'فَمَن يُؤْمِن بِرَبِّهِ فَلَا يَخَافُ بَخْسًا وَلَا رَهَقًا',
      transliteration: "Faman yu'min birabbih fala yakhaafu bakhsan wala rahaqaa",
      meaning: 'So whoever believes in his Lord need not fear deprivation or burden.',
      note: 'Two فَـ particles: first = "so/then" (result) and second = "then (therefore)" — both consequential.',
    },
  },
  {
    id: 'b208',
    stage: 'beginner',
    title: 'The Particle "Waw": And, With, While',
    objective: 'Distinguish between waw of coordination, companionship, circumstance, and oath.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Waw type identification in 10 examples', 'Build sentences using 3 different waw types', 'Find all waw types in Surah al-Kahf opening'],
    quranBridge: {
      arabic: 'وَالضُّحَى وَاللَّيْلِ إِذَا سَجَى',
      transliteration: 'Wad-duha wal-layli idha saja',
      meaning: 'By the morning brightness and the night when it covers with darkness.',
      note: 'Both وَ here are the oath waw — a special use of Arabic\'s most common conjunction.',
    },
  },
  {
    id: 'b209',
    stage: 'beginner',
    title: 'Arabic Transitional Phrases',
    objective: 'Use 15 transitional phrases to connect ideas in extended Arabic speech or writing.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Transition matching to function', 'Build a 10-sentence paragraph with transitional phrases', 'Identify transitions in Surah an-Naba'],
    quranBridge: {
      arabic: 'ثُمَّ كَلَّا سَيَعْلَمُونَ',
      transliteration: 'Thumma kalla sayalamun',
      meaning: 'Then no! They will come to know.',
      note: 'ثُمَّ (then) + كَلَّا (surely not/rebuke) + سَيَعْلَمُونَ — three powerful transitions in three words.',
    },
  },
  {
    id: 'b210',
    stage: 'beginner',
    title: 'Reading Surah an-Naba Full Analysis',
    objective: 'Read, translate, and analyse the complete Surah an-Naba (the Great News).',
    duration: '40 min',
    challengeLevel: 'Momentum',
    drills: ['Full translation attempt', 'Grammar identification: 10 structures', 'Vocabulary: 20 new words extracted'],
    quranBridge: {
      arabic: 'عَمَّ يَتَسَاءَلُونَ عَنِ النَّبَإِ الْعَظِيمِ',
      transliteration: "Amma yatasaa-aluun aninnabaijl-azim",
      meaning: 'About what are they asking one another? About the great news.',
      note: 'An opening rhetorical question — the surah builds its answer through dramatic cosmic imagery.',
    },
  },
  {
    id: 'b211',
    stage: 'beginner',
    title: 'Reading Surah an-Nazi\'at Vocabulary',
    objective: 'Build vocabulary from Surah an-Nazi\'at covering resurrection and prophet Musa stories.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['20-word vocabulary extraction', 'Story events ordering', 'Translate 5 key verses'],
    quranBridge: {
      arabic: 'وَالنَّازِعَاتِ غَرْقًا وَالنَّاشِطَاتِ نَشْطًا',
      transliteration: 'Wan-naziati gharqan wannashitaati nashta',
      meaning: 'By those who extract with violence and those who release with ease.',
      note: 'النَّازِعَاتِ and النَّاشِطَاتِ — active participle plurals; the angels described by their actions.',
    },
  },
  {
    id: 'b212',
    stage: 'beginner',
    title: 'Reading Surah Abasa Vocabulary',
    objective: 'Build vocabulary from Surah Abasa covering the episode with the blind man and resurrection.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Vocabulary extraction', 'Identify all verb forms in the surah', 'Translate the first 10 verses'],
    quranBridge: {
      arabic: 'عَبَسَ وَتَوَلَّى أَن جَاءَهُ الْأَعْمَى',
      transliteration: "Abasa watawalla an jaahul-aama",
      meaning: 'He frowned and turned away because there came to him the blind man.',
      note: 'عَبَسَ (he frowned) — Form I verb opening a surah that corrects a momentary human oversight.',
    },
  },
  {
    id: 'b213',
    stage: 'beginner',
    title: 'Reading Surah at-Takwir Vocabulary',
    objective: 'Build vocabulary from Surah at-Takwir (the folding up of the sun).',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['20-word vocabulary extraction', 'Day of Judgment event sequence', 'Translate 5 key verses'],
    quranBridge: {
      arabic: 'إِذَا الشَّمْسُ كُوِّرَتْ',
      transliteration: "Idha sh-shamsu kuwwirat",
      meaning: 'When the sun is wrapped up (dissolved).',
      note: 'كُوِّرَتْ is Form II passive — "was made to roll up/collapse". Apocalyptic grammar.',
    },
  },
  {
    id: 'b214',
    stage: 'beginner',
    title: 'Islamic History Vocabulary: The Seerah',
    objective: 'Build 30 vocabulary words for speaking about prophetic history in Arabic.',
    duration: '30 min',
    challengeLevel: 'Starter+',
    drills: ['Seerah vocabulary flashcards', 'Timeline in Arabic', 'Build 5 seerah sentences'],
    quranBridge: {
      arabic: 'لَقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ',
      transliteration: "Laqad kaana lakum fi rasulillahi uswatun hasanah",
      meaning: 'There has certainly been for you in the Messenger of Allah an excellent example.',
      note: 'أُسْوَة حَسَنَة (excellent example/model) — the Quran\'s foundational statement about following the Prophet ﷺ.',
    },
  },
  {
    id: 'b215',
    stage: 'beginner',
    title: 'Islamic Jurisprudence (Fiqh) Basic Vocabulary',
    objective: 'Learn 25 basic fiqh terms: halal, haram, makruh, mubah, wajib, sunnah.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Ruling category matching', 'Apply rulings to 10 actions', 'Quran foundations for each ruling category'],
    quranBridge: {
      arabic: 'أَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
      transliteration: 'Ahallallahul-bayia waharrama r-riba',
      meaning: 'Allah has permitted trade and forbidden interest.',
      note: 'أَحَلَّ (Form IV: made lawful) and حَرَّمَ (Form II: made forbidden) — fiqh vocabulary from the Quran itself.',
    },
  },
  {
    id: 'b216',
    stage: 'beginner',
    title: 'Tasbeeh and Dhikr Phrases: Grammar Study',
    objective: 'Analyse the grammar of the 5 most common tasbeeh and dhikr phrases.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Grammatical role identification in each phrase', 'Meaning extension: beyond literal translation', 'Count dhikr repetitions in Arabic'],
    quranBridge: {
      arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
      transliteration: 'Subhanallahi wabihamdih',
      meaning: 'Glory to Allah and by His praise.',
      note: 'سُبْحَانَ is a mafuul mutlaq from root س-ب-ح: "I declare Him far above imperfection". Deep grammar, simple phrase.',
    },
  },
  {
    id: 'b217',
    stage: 'beginner',
    title: 'Bismillah: A Deep Grammar Study',
    objective: 'Analyse every word and grammatical element of Bismillah ir-Rahman ir-Rahim.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Word-by-word grammatical labelling', 'Case analysis of all genitive nouns', 'Hidden elements: the understood verb'],
    quranBridge: {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَـٰنِ الرَّحِيمِ',
      transliteration: 'Bismillahir-rahmanir-rahim',
      meaning: 'In the name of Allah, the Most Gracious, the Most Merciful.',
      note: 'بِ (jarr), اسْمِ (idafa first term), اللَّهِ (second term), الرَّحْمَـٰنِ الرَّحِيمِ (sifah) — 9 grammar lessons in 4 words.',
    },
  },
  {
    id: 'b218',
    stage: 'beginner',
    title: 'Al-Fatihah: Word-by-Word Grammar',
    objective: 'Label every word in Surah al-Fatihah with its grammatical function.',
    duration: '40 min',
    challengeLevel: 'Momentum',
    drills: ['Full word-by-word labelling', 'All cases identified', 'All sentence types (nominal/verbal) identified'],
    quranBridge: {
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ الرَّحْمَـٰنِ الرَّحِيمِ مَالِكِ يَوْمِ الدِّينِ',
      transliteration: 'Alhamdu lillahi rabbil-alamina r-rahmani r-rahimi maliki yawmid-din',
      meaning: 'Praise is for Allah, Lord of all worlds, the Most Gracious, the Most Merciful, Master of the Day of Judgment.',
      note: 'Four verses of Fatihah contain 5 attributes of Allah in idafa, sifah and بدل — a complete grammar lesson.',
    },
  },
  {
    id: 'b219',
    stage: 'beginner',
    title: 'Surah al-Baqarah: Opening Verses (1-20)',
    objective: 'Read and analyse the first 20 verses of Surah al-Baqarah.',
    duration: '45 min',
    challengeLevel: 'Capstone',
    drills: ['Vocabulary extraction: 30 words', 'Three-type believer classification', 'Grammar: identify 5 different structures'],
    quranBridge: {
      arabic: 'الم ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ',
      transliteration: 'Alif lam meem. Dhalikal-kitabu la rayba fih. Hudal-lil-muttaqin.',
      meaning: 'Alif, Lam, Meem. That is the Book about which there is no doubt, a guidance for those conscious of Allah.',
      note: 'A nominal sentence + negated predicate + further description: three grammar structures in one verse.',
    },
  },
  {
    id: 'b220',
    stage: 'beginner',
    title: 'Arabic Pronunciation Journey: Review',
    objective: 'Review all 28 Arabic sounds with a focus on the 8 sounds most challenging for English speakers.',
    duration: '35 min',
    challengeLevel: 'Starter+',
    drills: ['All 28 sounds production test', 'Focus drill on ح, خ, ع, غ, ق, ص, ض, ظ', 'Minimal pair listening test'],
    quranBridge: {
      arabic: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا',
      transliteration: 'Warattilil-qurana tartila',
      meaning: 'And recite the Quran with measured recitation.',
      note: 'تَرْتِيلًا — absolute object emphasising the command: recite properly, distinctly, with care for each sound.',
    },
  },
  {
    id: 'b221',
    stage: 'beginner',
    title: 'Numbers and Counting: Revision and Extension',
    objective: 'Revise 1–1000 and extend to discuss fractions, percentages, and Quran number facts.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Rapid number dictation', 'Fraction and half/third vocabulary', '10 Quran numerical facts in Arabic'],
    quranBridge: {
      arabic: 'الله أَكْبَرُ',
      transliteration: 'Allahu Akbar',
      meaning: 'Allah is Greater.',
      note: 'أَكْبَرُ is a comparative and superlative — grammatically, the phrase means God is always greater than anything counted.',
    },
  },
  {
    id: 'b222',
    stage: 'beginner',
    title: 'The Pronoun of Separation (Fasl)',
    objective: 'Identify and use the fasl pronoun that separates subject from predicate for emphasis.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Identify fasl pronoun in 8 ayat', 'Explain its emphasis function in each', 'Build 5 sentences using fasl pronoun'],
    quranBridge: {
      arabic: 'إِنَّهُمْ هُمُ الْمُفْلِحُونَ',
      transliteration: 'Innahum humul-muflihun',
      meaning: 'Indeed they are the successful ones.',
      note: 'هُمُ is the fasl pronoun — it signals that الْمُفْلِحُونَ is the predicate, not another qualifier.',
    },
  },
  {
    id: 'b223',
    stage: 'beginner',
    title: 'Substitution Words (Badal)',
    objective: 'Understand and identify badal (appositive/substitute) in Arabic sentences.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Badal identification in 8 Quran phrases', 'Explain the badal relationship in each', 'Build 3 sentences with badal'],
    quranBridge: {
      arabic: 'بِاللَّهِ رَبِّكُمُ',
      transliteration: 'Billahi rabbikum',
      meaning: 'By Allah, your Lord.',
      note: 'رَبِّكُمُ is a badal (explanatory appositive) of اللَّه — clarifying who "Allah" is to the addressees.',
    },
  },
  {
    id: 'b224',
    stage: 'beginner',
    title: 'Using Munada: Calling Out to Someone',
    objective: 'Use the vocative particle يَا and the different munada (vocative) noun forms.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Vocative construction in 10 Quran addresses', 'Mansub vs marfu vocative distinction', 'Build 5 original vocative sentences'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ',
      transliteration: "Ya ayyuhalladhina amanu ttaqullaha",
      meaning: 'O you who believe, fear Allah.',
      note: 'يَا + أَيُّهَا + الَّذِينَ — the Quran\'s most common vocative formula; grammar and command in one.',
    },
  },
  {
    id: 'b225',
    stage: 'beginner',
    title: 'Arabic Language Learning: Motivation and Method',
    objective: 'Understand the science of language learning and apply best practices to Arabic study.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['Design a 2-week Arabic study plan', 'Identify your 3 weakest areas', "Commit to one Quran page's vocabulary weekly"],
    quranBridge: {
      arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      transliteration: 'Inna maaal-usri yusra',
      meaning: 'Indeed with hardship will be ease.',
      note: 'Arabic grammar study has its difficulties, but this divine promise applies to the student of the Book.',
    },
  },
  {
    id: 'b226',
    stage: 'beginner',
    title: 'Quran Reading Aloud: Fluency Practice',
    objective: 'Read 10 varied surahs aloud with correct pronunciation and basic tarteel.',
    duration: '40 min',
    challengeLevel: 'Momentum',
    drills: ['Timed surah recitation', 'Focus on 3 problematic sounds per session', 'Record and review for self-correction'],
    quranBridge: {
      arabic: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا',
      transliteration: 'Warattilil-qurana tartila',
      meaning: 'And recite the Quran with measured recitation.',
      note: 'تَرْتِيل (tarteel) — the Quranic standard of recitation: distinct, measured, and beautiful.',
    },
  },
  {
    id: 'b227',
    stage: 'beginner',
    title: 'Surah al-Baqarah: Ayah al-Kursi Deep Dive',
    objective: 'Fully translate, analyse grammar, and extract all divine attributes in Ayah al-Kursi.',
    duration: '40 min',
    challengeLevel: 'Capstone',
    drills: ['Word-by-word grammatical analysis', 'All 9 divine attributes named and explained', 'Build a concept map of the ayah'],
    quranBridge: {
      arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
      transliteration: "Allahu la ilaha illah huwal-hayyul-qayyum la ta'khudhuhu sinatun wala nawm",
      meaning: 'Allah — there is no god except Him, the Ever-Living, the Self-Subsisting. Neither drowsiness overtakes Him nor sleep.',
      note: 'الْحَيُّ الْقَيُّومُ — two of the greatest names, both hyperbolically intensive forms. The ayah of the Throne.',
    },
  },
  {
    id: 'b228',
    stage: 'beginner',
    title: 'Writing Composition: First Islamic Essay',
    objective: 'Write a 100-word Arabic composition on the topic "Why I learn Arabic."',
    duration: '40 min',
    challengeLevel: 'Capstone',
    drills: ['Outline planning in Arabic', 'Draft and revise composition', 'Grammar self-check: 5 rules verified'],
    quranBridge: {
      arabic: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَعَلَّكُمْ تَعْقِلُونَ',
      transliteration: 'Inna anzalnahu quranaan arabiyyan laallakum taqilun',
      meaning: 'Indeed We have sent it down as an Arabic Quran that you might understand.',
      note: 'عَرَبِيًّا — the language itself is named in the Quran as the reason for its clarity.',
    },
  },
  {
    id: 'b229',
    stage: 'beginner',
    title: 'Verbal Noun (Masdār): The Core of Arabic Vocabulary',
    objective: 'Understand that every Arabic verb has a masdār and use 20 of the most common ones.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Masdār identification from 15 verbs', 'Use masdār as subject in 8 sentences', 'Most frequent Quran masadirs list'],
    quranBridge: {
      arabic: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ',
      transliteration: 'Wa-aqimus-salata wa-atuz-zakata',
      meaning: 'And establish prayer and give zakah.',
      note: 'الصَّلَاة and الزَّكَاة are masadirs used as proper nouns for Islamic institutions.',
    },
  },
  {
    id: 'b230',
    stage: 'beginner',
    title: 'Expressing Contrast: However, But, Yet',
    objective: 'Use لَكِنْ, بَلْ, أَمَّا, غَيْرَ أَنَّ to express contrast and correction.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Contrast particle function identification', 'Insert correct contrast particle in 8 sentences', 'Contrast particle hunt in Surah Ali Imran'],
    quranBridge: {
      arabic: 'لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا',
      transliteration: "La tahzan innallaha maana",
      meaning: 'Do not grieve; indeed Allah is with us.',
      note: 'The contrast between human anxiety and divine presence — expressed without a formal contrast particle, only with إِنَّ.',
    },
  },
  {
    id: 'b231',
    stage: 'beginner',
    title: 'Cause and Effect: Because, Therefore, So',
    objective: 'Use لِأَنَّ, بِسَبَبِ, لِذَلِكَ, فَـ to express cause and result.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Cause-effect particle identification', 'Link 8 cause-effect sentence pairs', 'Identify logical connectors in Surah al-Kahf verses'],
    quranBridge: {
      arabic: 'فَبِمَا رَحْمَةٍ مِّنَ اللَّهِ لِنتَ لَهُمْ',
      transliteration: 'Fabima rahmatin minallahi linta lahum',
      meaning: 'So by mercy from Allah you were gentle to them.',
      note: 'فَبِمَا — a cause expression: "it was because of" mercy that gentleness resulted.',
    },
  },
  {
    id: 'b232',
    stage: 'beginner',
    title: 'Expressing Purpose: In Order To',
    objective: 'Use لِـ, لِكَيْ, حَتَّى, and لِأَجْلِ to express purpose.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Purpose clause building with 5 constructions', 'Identify purpose in 8 Quran passages', 'Build 6 Islamic purpose sentences'],
    quranBridge: {
      arabic: 'كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ لِتُخْرِجَ النَّاسَ مِنَ الظُّلُمَاتِ إِلَى النُّورِ',
      transliteration: 'Kitabun anzalnahu ilayka litukhrija n-naasa minaz-zulumati ilan-nur',
      meaning: 'A book We revealed to you so that you bring people from darknesses to light.',
      note: 'لِتُخْرِجَ — lam of purpose + subjunctive: the Quran\'s declared purpose stated in its own words.',
    },
  },
  {
    id: 'b233',
    stage: 'beginner',
    title: 'Expressing Condition: Even If, Unless',
    objective: 'Use وَلَوْ, إِلَّا أَنْ, and حَتَّى لَوْ to express conditionality and exception.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Conditional expression identification in 8 ayat', 'Build 5 "even if" sentences in Arabic', 'Translate 3 complex conditionals from Quran'],
    quranBridge: {
      arabic: 'وَلَوْ كَرِهَ الْمُشْرِكُونَ',
      transliteration: 'Walaw karihal-mushrikun',
      meaning: 'Even if the polytheists dislike it.',
      note: 'وَلَوْ (even if) — an emphatic conditional countering objection. Truth continues regardless of opposition.',
    },
  },
  {
    id: 'b234',
    stage: 'beginner',
    title: 'Expressing Result: So Much That',
    objective: 'Use حَتَّى as a result conjunction meaning "to the extent that" or "so that finally".',
    duration: '20 min',
    challengeLevel: 'Momentum',
    drills: ['Hatta as conjunction vs preposition distinction', 'Build 5 result sentences', 'Find hatta in 3 Quran narratives'],
    quranBridge: {
      arabic: 'حَتَّى يَتَبَيَّنَ لَكُمُ الْخَيْطُ الْأَبْيَضُ مِنَ الْخَيْطِ الْأَسْوَدِ',
      transliteration: "Hatta yatabayyana lakumul-khaytul-abyadu minal-khaytil-aswad",
      meaning: 'Until the white thread of dawn becomes distinct from the black thread of night.',
      note: 'حَتَّى يَتَبَيَّنَ — until + subjunctive: the boundary of Ramadan fasting expressed as a result clause.',
    },
  },
  {
    id: 'b235',
    stage: 'beginner',
    title: 'Degrees of Comparison: Equal, More, Most',
    objective: 'Build equative (مِثْل), comparative (أَفْعَل), and superlative (اَلْأَفْعَل) forms.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Build all three comparison degrees from 8 adjectives', 'Apply in 8 Quran-sourced sentences', 'Superlative form quiz'],
    quranBridge: {
      arabic: 'وَلَلْآخِرَةُ خَيْرٌ لَّكَ مِنَ الْأُولَى',
      transliteration: 'Walal-akhiratu khayrun laka minal-ula',
      meaning: 'And the next life is better for you than this world.',
      note: 'خَيْرٌ min (better than) — comparative structure using أَفْعَل pattern with مِن for the comparison point.',
    },
  },
  {
    id: 'b236',
    stage: 'beginner',
    title: 'Noun Formation Patterns (Ism Shares)',
    objective: 'Learn 8 common noun formation patterns and derive nouns from 20 verb roots.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Pattern-to-example matching for 8 patterns', 'Derive nouns from 20 roots', 'Identify pattern of 10 Quran nouns'],
    quranBridge: {
      arabic: 'عَالِمُ الْغَيْبِ وَالشَّهَادَةِ',
      transliteration: "Aaalmul-ghaybi wash-shahada",
      meaning: 'Knower of the unseen and the witnessed.',
      note: 'عَالِم (active participle as noun = knower) and شَهَادَة (Form I masdār with tā) — two noun formations.',
    },
  },
  {
    id: 'b237',
    stage: 'beginner',
    title: 'Place Nouns (Ism al-Makan)',
    objective: 'Learn the مَفْعَل and مَفْعِل patterns for place nouns and apply them.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Build place nouns from 10 verb roots', 'Match place noun to its function in 8 words', 'Find 5 place nouns in Quran'],
    quranBridge: {
      arabic: 'وَاتَّخِذُوا مِن مَّقَامِ إِبْرَاهِيمَ مُصَلًّى',
      transliteration: "Wattakhidhu mim maqami ibrahima musalla",
      meaning: 'And take the station of Ibrahim as a place of prayer.',
      note: 'مَقَام (place of standing) and مُصَلَّى (place of prayer) — two mafal/mafil place nouns in one command.',
    },
  },
  {
    id: 'b238',
    stage: 'beginner',
    title: 'Instrument Nouns (Ism al-Ala)',
    objective: 'Learn the مِفْعَل and مِفْعَلَة patterns for instrument/tool nouns.',
    duration: '20 min',
    challengeLevel: 'Momentum',
    drills: ['Build instrument nouns from 8 roots', 'Match instrument noun to its tool in 6 examples', 'Find instrument nouns in Quran'],
    quranBridge: {
      arabic: 'يَعْزِفُونَ بِالْمَعَازِفِ',
      transliteration: 'Yazifuna bil-maazif',
      meaning: 'They play musical instruments.',
      note: 'الْمَعَازِف is the plural of مِعْزَف (instrument of playing) — a clear مِفْعَل pattern.',
    },
  },
  {
    id: 'b239',
    stage: 'beginner',
    title: 'Diminutive Forms in Arabic',
    objective: 'Form and use Arabic diminutives (تَصْغِير) to express smallness or endearment.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Build diminutives from 10 nouns', 'Diminutive identification in classical texts', 'Use diminutive in 5 sentences'],
    quranBridge: {
      arabic: 'يَا بُنَيَّ لَا تُشْرِكْ بِاللَّهِ',
      transliteration: "Ya bunayya la tushrik billah",
      meaning: 'O my dear son, do not associate partners with Allah.',
      note: 'بُنَيَّ is the diminutive of ابن (son) — expressing Luqman\'s affection for his son while advising him.',
    },
  },
  {
    id: 'b240',
    stage: 'beginner',
    title: 'Beginner Vocabulary: Islamic Concepts 101',
    objective: 'Master 50 core Islamic concept words in Arabic with accurate definitions.',
    duration: '35 min',
    challengeLevel: 'Capstone',
    drills: ['50-concept speed definition drill', 'Match concept to Quranic context', 'Build sentences using 10 Islamic concepts'],
    quranBridge: {
      arabic: 'شَهِدَ اللَّهُ أَنَّهُ لَا إِلَهَ إِلَّا هُوَ وَالْمَلَائِكَةُ وَأُولُو الْعِلْمِ',
      transliteration: "Shahidallahu annahu la ilaha illaa huwa wal-malaikatu wa-ulul-ilm",
      meaning: 'Allah witnesses that there is no god but He — and so do the angels and those of knowledge.',
      note: 'أُولُو الْعِلْم — those with knowledge bear witness. Mastering Islamic concepts makes you one of them.',
    },
  },
  {
    id: 'b241',
    stage: 'beginner',
    title: 'Common Quran Phrases Everyone Should Know',
    objective: 'Memorise and understand 20 everyday Quran phrases used by Muslims universally.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['Phrase meaning matching', 'Usage context identification', 'Build 5 sentences incorporating phrases'],
    quranBridge: {
      arabic: 'إِنَّا لِلَّهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ',
      transliteration: 'Inna lillahi wa inna ilayhi rajiun',
      meaning: 'Indeed we belong to Allah, and indeed to Him we will return.',
      note: 'رَاجِعُونَ is a plural active participle in a nominal predicate — the grammar of inna at its most comforting.',
    },
  },
  {
    id: 'b242',
    stage: 'beginner',
    title: 'Quran Memorisation Vocabulary',
    objective: 'Learn 20 terms specific to Quran memorisation (hifz, wara, murajaah, etc.).',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Hifz vocabulary flashcards', 'Build a memorisation schedule in Arabic', '5 sentences about your Quran goals'],
    quranBridge: {
      arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
      transliteration: 'Walaqad yassarnal-qurana lidh-dhikri fahal mim muddakir',
      meaning: 'And We have certainly made the Quran easy for remembrance — so is there any who will remember?',
      note: 'يَسَّرْنَا (Form II: We made easy) — divine facilitation of memorisation is an active promise.',
    },
  },
  {
    id: 'b243',
    stage: 'beginner',
    title: 'Islamic Months: Ramadan Vocabulary',
    objective: 'Build a 25-word vocabulary for Ramadan: fasting, iftar, suhoor, tarawih, laylatul qadr.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Ramadan vocabulary flashcards', 'Describe a Ramadan day in 5 sentences', 'Find Ramadan ayat in Surah al-Baqarah'],
    quranBridge: {
      arabic: 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ',
      transliteration: "Shahru ramadaana l-ladhee unzila feehil-qur'an",
      meaning: 'The month of Ramadan in which was revealed the Quran.',
      note: 'شَهْر (month) + رَمَضَان (name) — the Quran celebrates its own month of revelation.',
    },
  },
  {
    id: 'b244',
    stage: 'beginner',
    title: 'Arabic for Story Telling: Narrative Frames',
    objective: 'Tell a simple story in Arabic using narrative frame vocabulary and sequencing.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Story frame vocabulary (beginning, middle, end)', 'Retell story of Prophet Musa in 10 sentences', 'Time sequence markers'],
    quranBridge: {
      arabic: 'فَلَمَّا بَلَغَا مَجْمَعَ بَيْنِهِمَا نَسِيَا حُوتَهُمَا',
      transliteration: 'Falamma balaghaa majmaa bayinihima nasiyaa hutahuma',
      meaning: 'But when they reached the junction between them, they forgot their fish.',
      note: 'فَلَمَّا (then when) + past verb — the classic narrative frame opener of the Kahf story.',
    },
  },
  {
    id: 'b245',
    stage: 'beginner',
    title: 'Classical Arabic Proverbs',
    objective: 'Learn 20 classical Arabic proverbs and amthal with their meanings and grammatical analysis.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Proverb meaning matching', 'Identify which proverbs have Quran echoes', 'Grammatical analysis of 5 proverbs'],
    quranBridge: {
      arabic: 'وَتِلْكَ الْأَمْثَالُ نَضْرِبُهَا لِلنَّاسِ وَمَا يَعْقِلُهَا إِلَّا الْعَالِمُونَ',
      transliteration: "Watilkal-amthalu nadribuha lin-naasi wama yaqiluha illal-aalimuun",
      meaning: 'And these examples We present for the people, but none will understand them except those of knowledge.',
      note: 'الْأَمْثَال (parables/proverbs) — the Quran itself is a book of proverbs for the understanding.',
    },
  },
  {
    id: 'b246',
    stage: 'beginner',
    title: 'Reading Classical Arabic News',
    objective: 'Read basic Modern Standard Arabic (MSA) news headlines and extract meaning.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['5 headline vocabulary extraction', 'Recognise cognates from Quran vocabulary', 'Build a short news sentence in Arabic'],
    quranBridge: {
      arabic: 'يُبَشِّرُكَ بِيَحْيَى',
      transliteration: 'Yubashshiruka biyahya',
      meaning: 'He gives you glad tidings of Yahya.',
      note: 'يُبَشِّرُ (Form II: he gives news) — the Quran\'s word for "give good news" is the root of modern بِشَارَة (news).',
    },
  },
  {
    id: 'b247',
    stage: 'beginner',
    title: 'Tajweed Rule: Al-Madd (Prolongation)',
    objective: 'Learn all 6 types of madd (prolongation) and when they apply in Quranic recitation.',
    duration: '30 min',
    challengeLevel: 'Starter+',
    drills: ['6 madd type identification in passage', 'Count beats for each madd type', 'Recite passage applying all madd rules'],
    quranBridge: {
      arabic: 'وَلَا الضَّالِّينَ',
      transliteration: 'Walad-daallin',
      meaning: 'Nor those who are astray.',
      note: 'الضَّالِّينَ contains madd tabii (natural prolongation) — a foundational tajweed rule in the closing of Fatihah.',
    },
  },
  {
    id: 'b248',
    stage: 'beginner',
    title: 'Tajweed Rule: Idgham (Merging)',
    objective: 'Apply idgham with and without ghunnah to noon sakinah and tanwin.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Identify idgham letters (6)', 'Mark idgham in a passage', 'Recite passage correctly applying idgham'],
    quranBridge: {
      arabic: 'مِن وَرَائِهِم',
      transliteration: 'Min waraaihim',
      meaning: 'From behind them.',
      note: 'نْ + وَ triggers idgham with ghunnah — the noon is absorbed into the waw with nasal resonance.',
    },
  },
  {
    id: 'b249',
    stage: 'beginner',
    title: 'Tajweed Rule: Ikhfaa (Hiding)',
    objective: 'Apply ikhfaa to noon sakinah before all 15 ikhfaa letters.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['15 ikhfaa letters memorisation', 'Identify ikhfaa in passage', 'Recite ikhfaa sounds correctly'],
    quranBridge: {
      arabic: 'مِن قَبْلِ',
      transliteration: 'Min qabli',
      meaning: 'From before.',
      note: 'نْ + قَ — ikhfaa: the noon is "hidden" with a ghost nasal sound before the qaf.',
    },
  },
  {
    id: 'b250',
    stage: 'beginner',
    title: 'Tajweed Rule: Iqlab (Converting)',
    objective: 'Apply iqlab — the conversion of noon sakinah to a mim sound before ba.',
    duration: '20 min',
    challengeLevel: 'Starter',
    drills: ['Find all iqlab positions in Surah al-Baqarah', 'Recite iqlab correctly', 'Why ba causes iqlab (lip articulation)'],
    quranBridge: {
      arabic: 'لَيُنبَذَنَّ فِي الْحُطَمَةِ',
      transliteration: 'Layunbadhanna fil-hutama',
      meaning: 'He will surely be thrown into al-Hutama.',
      note: 'نْ + بَ — iqlab converts to labial mim to smooth the transition from nasal to bilabial stop.',
    },
  },
  {
    id: 'b251',
    stage: 'beginner',
    title: 'Tajweed Rule: Izhar (Clear Pronunciation)',
    objective: 'Apply izhar to noon sakinah before the 6 throat letters.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['6 izhar throat letters memorisation', 'Identify izhar in passage', 'Contrast izhar vs idgham vs ikhfaa'],
    quranBridge: {
      arabic: 'مَنْ آمَنَ',
      transliteration: 'Man aaman',
      meaning: 'Whoever believed.',
      note: 'نْ + أ — izhar: clear noon followed by hamzah; no merging, no hiding, pure clarity.',
    },
  },
  {
    id: 'b252',
    stage: 'beginner',
    title: 'Tajweed: Qalqala (Echoing Letters)',
    objective: 'Apply qalqala to the 5 qalqala letters when they carry sukoon.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['5 qalqala letters memorisation (ق ط ب ج د)', 'Identify qalqala in 3 surahs', 'Produce the echo bounce correctly'],
    quranBridge: {
      arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ',
      transliteration: 'Qul aaodhu birabbil-falaq',
      meaning: 'Say: I seek refuge with the Lord of daybreak.',
      note: 'قُلْ — the qaf has sukoon = qalqala; the echo is mandatory in correct recitation.',
    },
  },
  {
    id: 'b253',
    stage: 'beginner',
    title: 'Tajweed: Heavy and Light Letters (Tafkhim and Tarqiq)',
    objective: 'Understand which letters are always heavy, always light, and conditionally either.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Heavy letter list memorisation', 'Light vs heavy minimal pair reading', 'The 7 always-heavy letters drill'],
    quranBridge: {
      arabic: 'الصِّرَاطَ الْمُسْتَقِيمَ',
      transliteration: 'Siratal-mustaqim',
      meaning: 'The straight path.',
      note: 'ص, ط — both heavy letters: they raise the tongue back and up, darkening all surrounding vowels.',
    },
  },
  {
    id: 'b254',
    stage: 'beginner',
    title: 'Tajweed: Lam in the Name of Allah',
    objective: 'Apply the rule that lam in اللَّه is heavy after fat-ha/damma and light after kasra.',
    duration: '18 min',
    challengeLevel: 'Starter',
    drills: ['Pre-Allah vowel identification drill', 'Recite phrases with heavy vs light lam', '5 contrasting examples from Quran'],
    quranBridge: {
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      transliteration: 'Qul huwallaahu ahad',
      meaning: 'Say: He is Allah, One.',
      note: 'هُوَ + اللَّهُ — the waw carries a damma, so the lam of Allah is heavy (tafkhim).',
    },
  },
  {
    id: 'b255',
    stage: 'beginner',
    title: 'Tajweed: Waqf Rules (Stopping at End of Verses)',
    objective: 'Apply the 5 waqf signs and understand when to stop, continue, or have a choice.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['5 waqf sign identification', 'Read a passage applying stops correctly', 'Stopping on ta marbuta: pronunciation rule'],
    quranBridge: {
      arabic: 'لَا رَيْبَ ۛ فِيهِ ۛ هُدًى لِّلْمُتَّقِينَ',
      transliteration: "La rayba feeh. Hudan lil-muttaqin.",
      meaning: 'There is no doubt in it; guidance for the God-fearing.',
      note: 'The two ۛ signs indicate a mustahabb waqf option — different stopping places change the meaning slightly.',
    },
  },
  {
    id: 'b256',
    stage: 'beginner',
    title: 'Understand Every Word of Your Daily Salah',
    objective: 'Translate and explain every word of the 5 daily prayers from the opening takbir to the tasleem.',
    duration: '50 min',
    challengeLevel: 'Capstone',
    drills: ['Word-by-word prayer translation', 'Grammar analysis of 10 prayer phrases', 'Silent reflection: meaning while praying'],
    quranBridge: {
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: 'Alhamdu lillahi rabbil-alamin',
      meaning: 'All praise is for Allah, Lord of all worlds.',
      note: 'The opening ayah of al-Fatihah: the most repeated sentence in Arabic by any person alive.',
    },
  },
  {
    id: 'b257',
    stage: 'beginner',
    title: 'The 6 Articles of Faith: Arabic Terms',
    objective: 'Express all 6 pillars of iman in Arabic with accurate vocabulary and definition.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['6 articles Arabic term flashcards', 'Define each article in a simple Arabic sentence', 'Quran reference for each article'],
    quranBridge: {
      arabic: 'آمَنَ الرَّسُولُ بِمَا أُنزِلَ إِلَيْهِ مِن رَّبِّهِ وَالْمُؤْمِنُونَ',
      transliteration: 'Aamanar-rasoolu bima unzila ilayhi mir-rabbihi wal-muminun',
      meaning: 'The Messenger believed in what was revealed to him from his Lord, and the believers.',
      note: 'The complete iman declaration of Surah al-Baqarah: articles of faith in narrative grammar.',
    },
  },
  {
    id: 'b258',
    stage: 'beginner',
    title: 'The 5 Pillars in Arabic',
    objective: 'Express all 5 pillars of Islam in Arabic with vocabulary and grammatical context.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['5 pillars Arabic terms flashcards', 'Build one sentence per pillar in Arabic', 'Quran reference for each pillar'],
    quranBridge: {
      arabic: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ',
      transliteration: 'Wa-aqimus-salata wa-atuz-zakata war-kaoo maaar-rakieen',
      meaning: 'And establish prayer and give zakah and bow with those who bow.',
      note: 'Two pillars of Islam commanded in one verse — grammar: three imperatives in sequence.',
    },
  },
  {
    id: 'b259',
    stage: 'beginner',
    title: 'Surah Ya-Sin: Opening 20 Verses',
    objective: 'Read and build vocabulary from the first 20 verses of Surah Ya-Sin.',
    duration: '38 min',
    challengeLevel: 'Momentum',
    drills: ['Vocabulary extraction: 25 words', 'Multiple grammar structures identified', 'Translate 5 full verses'],
    quranBridge: {
      arabic: 'يس وَالْقُرْآنِ الْحَكِيمِ إِنَّكَ لَمِنَ الْمُرْسَلِينَ',
      transliteration: "Ya Seen. Wal-Quranul-hakim. Innaka laminal-mursalin.",
      meaning: 'Ya, Seen. By the wise Quran. Indeed you are among the messengers.',
      note: 'لَمِنَ الْمُرْسَلِينَ — the lam of oath in inna sentence + partitive من + broken plural: three layers of emphasis.',
    },
  },
  {
    id: 'b260',
    stage: 'beginner',
    title: 'Surah al-Kahf: Two Gardens Parable (Verses 32-44)',
    objective: 'Read and fully analyse the parable of the two garden owners in Surah al-Kahf.',
    duration: '38 min',
    challengeLevel: 'Momentum',
    drills: ['Vocabulary extraction: 25 words', 'Two character contrast vocabulary', 'Translate 5 verses'],
    quranBridge: {
      arabic: 'وَلَمْ تَكُن لَّهُ فِئَةٌ يَنصُرُونَهُ مِن دُونِ اللَّهِ وَمَا كَانَ مُنتَصِرًا',
      transliteration: "Walam takul-lahu fiatin yansuroonahu min dunillahi wama kana muntasira",
      meaning: 'And there was for him no company to help him other than Allah, and he was not able to defend himself.',
      note: 'The arrogant man\'s end: three negation structures in one verse. Arabic moral reasoning at work.',
    },
  },
  {
    id: 'b261',
    stage: 'beginner',
    title: 'Reading Poetry in Arabic: Introduction',
    objective: 'Read 5 short classical Arabic poems and identify their vocabulary and basic metre.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Vocabulary extraction from 5 short poems', 'Identify rhyme scheme', 'Translate poem 1 line by line'],
    quranBridge: {
      arabic: 'وَالشُّعَرَاءُ يَتَّبِعُهُمُ الْغَاوُونَ',
      transliteration: 'Wash-shuarau yattabiuhumulghawun',
      meaning: 'And the poets — the deviants follow them.',
      note: 'The Quran distinguishes between prophetic speech and poetry — understanding both deepens your Arabic.',
    },
  },
  {
    id: 'b262',
    stage: 'beginner',
    title: 'Arabic Grammar for Quran Translation',
    objective: 'Apply all beginner grammar rules to translate a full page of Quran accurately.',
    duration: '50 min',
    challengeLevel: 'Capstone',
    drills: ['Open-book translation of Surah al-Hashr last 3 verses', 'Self-check translation accuracy', 'Grammar label 10 structures found'],
    quranBridge: {
      arabic: 'هُوَ اللَّهُ الَّذِي لَا إِلَهَ إِلَّا هُوَ عَالِمُ الْغَيْبِ وَالشَّهَادَةِ',
      transliteration: "Huwallaahu l-ladhee la ilaha illaa huwa aalimul-ghaybi wash-shahada",
      meaning: 'He is Allah, other than whom there is no god, Knower of the unseen and the witnessed.',
      note: 'The beginning of the most grammatically dense verses in the Quran — the beginner\'s ultimate translation challenge.',
    },
  },
  {
    id: 'b263',
    stage: 'beginner',
    title: 'Describing Character: Positive Traits in Arabic',
    objective: 'Use 30 Arabic adjectives for positive character traits in context.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['Positive trait vocabulary flashcards', 'Describe a Quranic character\'s virtues', 'Build 5 character description sentences'],
    quranBridge: {
      arabic: 'وَإِنَّكَ لَعَلَى خُلُقٍ عَظِيمٍ',
      transliteration: 'Wa-innaka la-ala khuluqin azim',
      meaning: 'And indeed, you are of a great moral character.',
      note: 'خُلُق (character/morality) — the highest praise of the Prophet ﷺ is an Arabic vocabulary lesson.',
    },
  },
  {
    id: 'b264',
    stage: 'beginner',
    title: 'Describing Character: Negative Traits in Arabic',
    objective: 'Use 30 Arabic adjectives for negative character traits to understand Quranic warnings.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['Negative trait vocabulary flashcards', 'Identify negative traits described in Quran stories', 'Build 5 warning sentences'],
    quranBridge: {
      arabic: 'إِنَّ الْمُنَافِقِينَ فِي الدَّرْكِ الْأَسْفَلِ مِنَ النَّارِ',
      transliteration: "Innal-munafiqina fid-darkil-asfali minan-nar",
      meaning: 'Indeed the hypocrites will be in the lowest depths of the Fire.',
      note: 'الْمُنَافِقِين (the hypocrites) — a character vocabulary word with permanent Quranic consequences.',
    },
  },
  {
    id: 'b265',
    stage: 'beginner',
    title: 'Spatial Arabic: Above, Below, Inside, Outside',
    objective: 'Master all 10 directional/spatial nouns used in Arabic and their use as adverbs of place.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Spatial vocabulary flashcards', 'Describe the position of 10 objects', 'Quran spatial description translation'],
    quranBridge: {
      arabic: 'مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
      transliteration: "Ma fis-samawati wama fil-ard",
      meaning: 'What is in the heavens and what is in the earth.',
      note: 'فِي السَّمَاوَاتِ and فِي الْأَرْضِ — the most frequent spatial phrase pair in the Quran.',
    },
  },
  {
    id: 'b266',
    stage: 'beginner',
    title: 'Arabic Temporal Vocabulary: Days of the Week',
    objective: 'Name all 7 days of the week and understand their Arabic etymology and Islamic significance.',
    duration: '18 min',
    challengeLevel: 'Starter',
    drills: ['Days of the week memorisation', 'Build 5 "I do X on Y day" sentences', 'Friday vocabulary: jumu\'ah, khutbah'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا نُودِيَ لِلصَّلَاةِ مِن يَوْمِ الْجُمُعَةِ',
      transliteration: "Ya ayyuhalladhina amanu idha nudiya lis-salati min yawmil-jumu-ah",
      meaning: 'O believers, when the call to prayer is made on Friday...',
      note: 'يَوْمِ الْجُمُعَةِ (the day of gathering) — Friday is the only day of the week named in the Quran.',
    },
  },
  {
    id: 'b267',
    stage: 'beginner',
    title: 'Expressing Duration: How Long in Arabic',
    objective: 'Express durations using مُدَّة, طُول, اليوم كلّه, and time measure phrases.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Duration expression drills', 'Build 5 "I studied Arabic for X hours" sentences', 'Find duration expressions in Quran stories'],
    quranBridge: {
      arabic: 'فَلَبِثَ فِيهِمْ أَلْفَ سَنَةٍ إِلَّا خَمْسِينَ عَامًا',
      transliteration: 'Falabitha fihim alfa sanatin illa khamseena ama',
      meaning: 'And he remained among them a thousand years less fifty.',
      note: 'أَلْف سَنَة إِلَّا خَمْسِين — duration expression with exception: Nuh\'s mission in precise Arabic numbers.',
    },
  },
  {
    id: 'b268',
    stage: 'beginner',
    title: 'Verbs of Perception: See, Hear, Feel',
    objective: 'Master perception verbs and their unique grammatical patterns (verb + acc. + acc).',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Perception verb conjugation drill', 'Double accusative identification', 'Build 5 perception sentences from Quran vocabulary'],
    quranBridge: {
      arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ',
      transliteration: "Alam tara kayfa fa-ala rabbuka bi-ashaabil-fil",
      meaning: 'Have you not seen how your Lord dealt with the companions of the elephant?',
      note: 'تَرَ — jussive of رَأَى (to see) after ألم: perception verb in a rhetorical question structure.',
    },
  },
  {
    id: 'b269',
    stage: 'beginner',
    title: 'Verbs of Motion: Come, Go, Return, Run',
    objective: 'Master 10 Arabic motion verbs and their directional complements.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Motion verb conjugation drill', 'Add directional prepositions to motion verbs', 'Find motion verbs in Quran narratives'],
    quranBridge: {
      arabic: 'فَاسْعَوْا إِلَى ذِكْرِ اللَّهِ',
      transliteration: "Fasau ila dhikrillah",
      meaning: 'Then hasten to the remembrance of Allah.',
      note: 'اسْعَوْا (Form I plural imperative: hasten!) — a motion verb commanding urgent spiritual movement.',
    },
  },
  {
    id: 'b270',
    stage: 'beginner',
    title: 'Verbs of Communication: Say, Tell, Ask, Answer',
    objective: 'Master communication verbs with their proper object and complement constructions.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Communication verb conjugation', 'Build dialogue sentences', 'Quran dialogue structure in Surah Yusuf'],
    quranBridge: {
      arabic: 'قَالَ أَعْلَمُ أَنِّي أَعْلَمُ مَا لَا تَعْلَمُونَ',
      transliteration: "Qaala inni aalamu ma la taalamun",
      meaning: 'He said: I know what you do not know.',
      note: 'قَالَ (he said) + أَعْلَمُ (I know) — the primary communication verb introducing divine speech.',
    },
  },
  {
    id: 'b271',
    stage: 'beginner',
    title: 'Verbs of Giving and Taking',
    objective: 'Master أَعْطَى, أَخَذَ, أَتَى, and their grammatical complements.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['Giving/taking verb conjugation', 'Build 5 give/take sentences', 'Quran: divine giving vocabulary'],
    quranBridge: {
      arabic: 'وَيُؤْتُونَ الزَّكَاةَ',
      transliteration: 'Wayutunaz-zakah',
      meaning: 'And they give zakah.',
      note: 'يُؤْتُونَ (Form IV of أَتَى: they bring/give) — giving zakah described with the causative form.',
    },
  },
  {
    id: 'b272',
    stage: 'beginner',
    title: 'Verbs of Creation and Making',
    objective: 'Understand خَلَقَ, جَعَلَ, صَنَعَ, أَنشَأَ and their distinct theological implications.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Creation verb distinction chart', '10 Quran creation verb occurrences', 'Build 5 creation sentences'],
    quranBridge: {
      arabic: 'خَلَقَ الْإِنسَانَ مِن صَلْصَالٍ كَالْفَخَّارِ',
      transliteration: 'Khalaqal-insana min salsalin kal-fakhkhar',
      meaning: 'He created man from clay like pottery.',
      note: 'خَلَقَ (create ex nihilo / from substance) — the most theologically precise Arabic creation verb.',
    },
  },
  {
    id: 'b273',
    stage: 'beginner',
    title: 'Verbs of Sending and Revealing',
    objective: 'Understand أَرْسَلَ, أَنزَلَ, and وَحَى and their distinction in Quranic context.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Sending/revealing verb distinction', '10 examples of each from Quran', 'Build 5 sentences of revelation vocabulary'],
    quranBridge: {
      arabic: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ',
      transliteration: "Wama arsalnaka illa rahmatan lil-alamin",
      meaning: 'And We have not sent you except as a mercy to the worlds.',
      note: 'أَرْسَلْنَاكَ — Form I first person plural past: "We sent you" — the divine sending is declared emphatically.',
    },
  },
  {
    id: 'b274',
    stage: 'beginner',
    title: 'Verbs of Worship: Pray, Fast, Give, Perform Hajj',
    objective: 'Master the verbs and vocabulary of the 5 pillars in their full Arabic form.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['5 pillar verbs memorisation', 'Conjugate each pillar verb in past/present', 'Build sentences about each pillar'],
    quranBridge: {
      arabic: 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ',
      transliteration: "Walillahi alan-naasi hijjul-bayt",
      meaning: 'And due to Allah from the people is a pilgrimage to the House.',
      note: 'حِجُّ الْبَيْتِ — the pilgrimage obligation stated in idafa: the hajj-vocabulary verse.',
    },
  },
  {
    id: 'b275',
    stage: 'beginner',
    title: 'Quran and Science Vocabulary',
    objective: 'Learn 25 scientific vocabulary words from the Quran\'s descriptions of creation and nature.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Science vocabulary flashcards', 'Match Quran verse to scientific concept', 'Build 3 descriptive sentences'],
    quranBridge: {
      arabic: 'وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ وَإِنَّا لَمُوسِعُونَ',
      transliteration: 'Was-samaa banaynaha biaydin wa-inna lamuusiuun',
      meaning: 'And the heaven We constructed with strength, and indeed We are expanding it.',
      note: 'لَمُوسِعُونَ (We are expanding) — modern science confirmed the expansion of the universe; the Quran stated it first.',
    },
  },
  {
    id: 'b276',
    stage: 'beginner',
    title: 'Animals in the Quran: Vocabulary and Stories',
    objective: 'Learn 20 animal vocabulary words from Quranic stories and descriptions.',
    duration: '25 min',
    challengeLevel: 'Starter',
    drills: ['Animal vocabulary matching', 'Match animal to its Quran story', 'Build 5 animal description sentences'],
    quranBridge: {
      arabic: 'وَمَا مِن دَابَّةٍ فِي الْأَرْضِ إِلَّا عَلَى اللَّهِ رِزْقُهَا',
      transliteration: "Wama min dabbatin fil-ardi illa alallahi rizquha",
      meaning: 'And there is no creature on earth but that its provision is upon Allah.',
      note: 'دَابَّة (creature that moves) — the comprehensive animal vocabulary of Quranic divine care.',
    },
  },
  {
    id: 'b277',
    stage: 'beginner',
    title: 'Night and Day Vocabulary in the Quran',
    objective: 'Learn all temporal vocabulary relating to night, day, morning, and evening in the Quran.',
    duration: '22 min',
    challengeLevel: 'Starter',
    drills: ['Day/night vocabulary flashcards', 'Match descriptions to times of day', 'Find night and day words in 3 surahs'],
    quranBridge: {
      arabic: 'يُولِجُ اللَّيْلَ فِي النَّهَارِ وَيُولِجُ النَّهَارَ فِي اللَّيْلِ',
      transliteration: "Yooliju l-layla fin-nahaari wayuoliju n-nahaara fil-layl",
      meaning: 'He causes the night to enter the day and causes the day to enter the night.',
      note: 'يُولِجُ (Form IV: He inserts/causes to enter) — the cyclical vocabulary of cosmic daily rhythm.',
    },
  },
  {
    id: 'b278',
    stage: 'beginner',
    title: 'Heart and Mind Vocabulary in the Quran',
    objective: 'Understand the 5 Arabic words for heart/mind/intellect and their distinct uses.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Qalb / aql / fuad / sadr / lubb distinction chart', 'Find each in Quran context', 'Build 5 sentences about understanding'],
    quranBridge: {
      arabic: 'أَفَلَا تَعْقِلُونَ',
      transliteration: "Afala taaqilun",
      meaning: 'Will you not then reason?',
      note: 'تَعْقِلُونَ (from عَقَل: to reason/bind) — the Quran challenges intellect more than any other faculty.',
    },
  },
  {
    id: 'b279',
    stage: 'beginner',
    title: 'Quranic Vocabulary: The Afterlife Terms',
    objective: 'Build a 30-word vocabulary for the afterlife using Quranic sources.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Afterlife vocabulary flashcards', 'Sequence the afterlife events in Arabic', 'Translate 5 afterlife verses'],
    quranBridge: {
      arabic: 'يَوْمَ يَبْعَثُهُمُ اللَّهُ جَمِيعًا',
      transliteration: "Yawma yabathhumullaahu jamia",
      meaning: 'The day Allah will resurrect them all.',
      note: 'يَبْعَثُ (resurrect/send) — the core resurrection verb from root ب-ع-ث.',
    },
  },
  {
    id: 'b280',
    stage: 'beginner',
    title: 'End of Beginner Phase: Complete Self-Assessment',
    objective: 'Complete a full self-assessment covering all beginner vocabulary, grammar, and reading skills.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['100-word translation test', 'Grammar error correction: 20 sentences', 'Read and explain Surah al-Hashr verses 22-24'],
    quranBridge: {
      arabic: 'هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ لَهُ الْأَسْمَاءُ الْحُسْنَى',
      transliteration: "Huwallaahu l-khaliqu l-bariu l-musawwiru lahul-asmaa-ul-husna",
      meaning: 'He is Allah, the Creator, the Originator, the Fashioner. To Him belong the most beautiful names.',
      note: 'Three divine names, each a Form I/II active participle: the most exalted grammar in the beginner curriculum.',
    },
  },
  {
    id: 'b281',
    stage: 'beginner',
    title: 'Reading Practice: Surah al-Inshirah',
    objective: 'Read, translate, and analyse every verse of Surah al-Inshirah for vocabulary and grammar.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Verse-by-verse vocabulary extraction', 'Grammar annotation of 5 verses', 'Memorise the surah with meanings'],
    quranBridge: {
      arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
      transliteration: "Fa-inna maal-usri yusra",
      meaning: 'For indeed with hardship will be ease.',
      note: 'مَعَ الْعُسْرِ يُسْرًا — inna sentence with a temporal complement; كُفران الجحود يقابله يسر ',
    },
  },
  {
    id: 'b282',
    stage: 'beginner',
    title: 'Reading Practice: Surah al-Duha',
    objective: 'Read, translate, and fully analyse Surah ad-Duhaa for vocabulary and emotional resonance.',
    duration: '30 min',
    challengeLevel: 'Starter+',
    drills: ['Verse-by-verse translation', 'Divine comfort vocabulary extraction', 'Grammar: 3 question structures in the surah'],
    quranBridge: {
      arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَى',
      transliteration: 'Walasawfa yutika rabbuka fatarda',
      meaning: 'And your Lord will give you and you will be satisfied.',
      note: 'لَسَوْفَ — the lam of oath + سَوْفَ (future) = emphatic future Divine promise: a grammar of certainty.',
    },
  },
  {
    id: 'b283',
    stage: 'beginner',
    title: 'Reading Practice: Surah al-Ghashiyah',
    objective: 'Read and translate Surah al-Ghashiyah, focusing on Paradise and Hell vocabulary.',
    duration: '32 min',
    challengeLevel: 'Momentum',
    drills: ['Hell/Paradise vocabulary extraction from surah', 'Identify all interrogative structures', 'Translate 5 verses independently'],
    quranBridge: {
      arabic: 'هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ',
      transliteration: 'Hal ataka hadithul-ghashiya',
      meaning: 'Has there reached you the report of the Overwhelming Event?',
      note: 'هَلْ + past tense — interrogative structure used for dramatic narrative introduction.',
    },
  },
  {
    id: 'b284',
    stage: 'beginner',
    title: 'Reading Practice: Surah al-Aala',
    objective: 'Read, translate, and analyse Surah al-Aala for vocabulary and divine attributes.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Surah vocabulary extraction', 'Imperatives identification in the surah', 'Translate 5 verses independently'],
    quranBridge: {
      arabic: 'سَبِّحِ اسْمَ رَبِّكَ الْأَعْلَى',
      transliteration: "Sabbihi sma rabbika l-a'la",
      meaning: 'Exalt the name of your Lord, the Most High.',
      note: 'سَبِّحِ (Form II imperative: glorify!) + idafa اسْمَ رَبِّكَ — the divine name in possession.',
    },
  },
  {
    id: 'b285',
    stage: 'beginner',
    title: 'Reading Practice: Surah at-Tariq',
    objective: 'Read, translate, and analyse Surah at-Tariq with focus on oaths and cosmological vocabulary.',
    duration: '28 min',
    challengeLevel: 'Starter+',
    drills: ['Oath structure identification', 'Cosmic vocabulary extraction', 'Translate full surah independently'],
    quranBridge: {
      arabic: 'وَالسَّمَاءِ وَالطَّارِقِ وَمَا أَدْرَاكَ مَا الطَّارِقُ',
      transliteration: "Was-samaai wat-tariq. Wama adraka mat-tariq.",
      meaning: 'By the sky and by the night visitor — and what will make you know what the night visitor is?',
      note: 'وَمَا أَدْرَاكَ (and what made you know?) — the Quran\'s signature rhetorical repetition idiom.',
    },
  },
  {
    id: 'b286',
    stage: 'beginner',
    title: 'Reading Practice: Surah al-Mutaffifin',
    objective: 'Read and analyse Surah al-Mutaffifin for commercial ethics and eschatological vocabulary.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Commercial ethics vocabulary extraction', 'Heavenly records vocabulary (Illiyyun / Sijjin)', 'Translate 5 verses'],
    quranBridge: {
      arabic: 'وَيْلٌ لِّلْمُطَفِّفِينَ',
      transliteration: 'Waylun lil-mutaffifin',
      meaning: 'Woe to those who give less than due.',
      note: 'وَيْل (woe!) — a standalone noun used as an exclamation of condemnation: rare and powerful structure.',
    },
  },
  {
    id: 'b287',
    stage: 'beginner',
    title: 'Listening Comprehension: Following Arabic Speech',
    objective: 'Train your ear to follow short Arabic spoken passages and extract main ideas.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Listen to 3 short Quran recitations and extract 10 words each', 'Identify known words in unfamiliar passage', 'Shadow-recite 3 verses maintaining rhythm'],
    quranBridge: {
      arabic: 'وَإِذَا قُرِئَ الْقُرْآنُ فَاسْتَمِعُوا لَهُ وَأَنصِتُوا',
      transliteration: 'Wa-idha quria l-quranu fastamiu lahu wa-ansitu',
      meaning: 'And when the Quran is recited, listen to it attentively and be silent.',
      note: 'اسْتَمِعُوا (Form X plural imperative: listen attentively!) — the Quran commands active, focused listening.',
    },
  },
  {
    id: 'b288',
    stage: 'beginner',
    title: 'Speaking Practice: Describing Yourself in Arabic',
    objective: 'Introduce yourself fully in Arabic: name, city, background, interests, and goals.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Full self-introduction script', 'Record and listen back', 'Add 5 new details to introduction'],
    quranBridge: {
      arabic: 'قُلْ هَذِهِ سَبِيلِي',
      transliteration: 'Qul hadhihi sabilî',
      meaning: 'Say: This is my way.',
      note: 'سَبِيلِي (my way/path) — speak your path in Arabic: the grammar of personal declaration.',
    },
  },
  {
    id: 'b289',
    stage: 'beginner',
    title: 'Writing Practice: Summarise a Quran Story',
    objective: 'Write a 100-word summary of the story of Prophet Yusuf in simple Arabic.',
    duration: '40 min',
    challengeLevel: 'Momentum',
    drills: ['Story vocabulary review', 'Draft summary 1 (50 words)', 'Expand to 100 words using conjunctions'],
    quranBridge: {
      arabic: 'نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ',
      transliteration: 'Nahnu naqussu alayka ahsanal-qasas',
      meaning: 'We relate to you the best of stories.',
      note: 'أَحْسَنَ الْقَصَصِ — the elative adjective of خَيْر + masdar: "the most beautiful of narratives."',
    },
  },
  {
    id: 'b290',
    stage: 'beginner',
    title: 'Quran Club Meeting: Discuss a Verse',
    objective: 'Practise discussing your favourite Quran verse in Arabic with basic opinion vocabulary.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['Opinion vocabulary (أَرَى, أَظُن, أَشعُر)', 'Describe why you love a verse in Arabic', 'Role-play: discuss with a partner'],
    quranBridge: {
      arabic: 'قُل لَّوْ كَانَ الْبَحْرُ مِدَادًا لِّكَلِمَاتِ رَبِّي',
      transliteration: "Qul law kanal-bahru midadal-likalimati rabbi",
      meaning: 'Say: If the sea were ink for the words of my Lord...',
      note: 'لَوْ (counterfactual condition) — the Quran hypothesises an infinite ocean of ink: a grammar and vocabulary gift.',
    },
  },
  {
    id: 'b291',
    stage: 'beginner',
    title: 'Reading Practice: Surah al-Balad',
    objective: 'Read, translate, and analyse all 20 verses of Surah al-Balad.',
    duration: '30 min',
    challengeLevel: 'Starter+',
    drills: ['Verse-by-verse translation', 'Oaths and conditional structures identification', 'Social justice vocabulary extraction'],
    quranBridge: {
      arabic: 'لَقَدْ خَلَقْنَا الْإِنسَانَ فِي كَبَدٍ',
      transliteration: 'Laqad khalaqnal-insana fi kabad',
      meaning: 'We have certainly created man in hardship/struggle.',
      note: 'كَبَد (hardship/exertion) — the human condition summarised in three Arabic words.',
    },
  },
  {
    id: 'b292',
    stage: 'beginner',
    title: 'Reading Practice: Surah al-Shams',
    objective: 'Read, translate, and fully analyse Surah ash-Shams\'s oaths, creation, and moral warning.',
    duration: '30 min',
    challengeLevel: 'Starter+',
    drills: ['11 oaths identification and translation', 'Nafs vocabulary extraction', 'Grammar: the conditional outcome structure'],
    quranBridge: {
      arabic: 'وَنَفْسٍ وَمَا سَوَّاهَا فَأَلْهَمَهَا فُجُورَهَا وَتَقْوَاهَا',
      transliteration: "Wanafsin wama sawwaha fa-alhamaha fujuraha wataqwaha",
      meaning: 'By the soul and He who proportioned it and inspired it with its wickedness and its righteousness.',
      note: 'أَلْهَمَ (Form IV: inspire) — divine inspiration of both moral knowledge and temptation explored in one verse.',
    },
  },
  {
    id: 'b293',
    stage: 'beginner',
    title: 'Reading Practice: Surah al-Layl',
    objective: 'Read, translate, and analyse Surah al-Layl\'s dualities, moral choices, and outcomes.',
    duration: '30 min',
    challengeLevel: 'Starter+',
    drills: ['Duality vocabulary: giving/withholding', 'Conditional if/then structures in surah', 'Translate 5 verses independently'],
    quranBridge: {
      arabic: 'وَاللَّيْلِ إِذَا يَغْشَى وَالنَّهَارِ إِذَا تَجَلَّى',
      transliteration: "Wallayli idha yaghsha. Wannahari idha tajalla.",
      meaning: 'By the night when it covers, and by the day when it appears.',
      note: 'يَغْشَى (Form IV: envelop) and تَجَلَّى (Form V reflexive: manifest itself) — the grammar of cosmic opposites.',
    },
  },
  {
    id: 'b294',
    stage: 'beginner',
    title: 'Grammar: The Tanwin and Nunation',
    objective: 'Master all three tanwin forms (tanwin fath, damm, kasr) and know when each is used.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Tanwin identification in 50 words', 'Apply correct tanwin to 20 adjective-noun pairs', 'Exception words that never take tanwin'],
    quranBridge: {
      arabic: 'رَحِيمًا غَفُورًا',
      transliteration: 'Rahiman ghafura',
      meaning: 'Merciful, Forgiving (indefinite accusative/adverbial forms).',
      note: 'رَحِيمًا — tanwin with fath (ً) on an indefinite predicate: the grammar of divine mercy described without the.',
    },
  },
  {
    id: 'b295',
    stage: 'beginner',
    title: 'Grammar: Definite Vs Indefinite — Al and Tanwin',
    objective: 'Understand the complete system of definiteness in Arabic: al, possessives, proper nouns, tanwin.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['Definite vs indefinite identification drill', 'Four ways to make a noun definite', 'Translate paragraph, mark all definiteness markers'],
    quranBridge: {
      arabic: 'الرَّحْمَانُ الرَّحِيمُ',
      transliteration: 'Ar-rahmanu r-rahim',
      meaning: 'The Most Merciful, the Especially Merciful.',
      note: 'الرَّحْمَان — the ال here makes the attribute definite: THE All-Merciful, not merely a merciful one.',
    },
  },
  {
    id: 'b296',
    stage: 'beginner',
    title: 'Grammar: Sound Masculine Plural (SMP)',
    objective: 'Form, read, and use sound masculine plurals (-oon/-een) correctly in all cases.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['20 SMP formation drills', 'Case identification: -oon vs -een', 'Build 5 sentences with SMP subjects'],
    quranBridge: {
      arabic: 'وَبَشِّرِ الصَّابِرِينَ',
      transliteration: 'Wabashiris-saabireen',
      meaning: 'And give good tidings to the patient ones.',
      note: 'الصَّابِرِينَ — SMP in genitive (-een): الصَّابِرُون as subject → الصَّابِرِين as object/genitive.',
    },
  },
  {
    id: 'b297',
    stage: 'beginner',
    title: 'Grammar: Sound Feminine Plural (SFP)',
    objective: 'Form, read, and use sound feminine plurals (-aat) correctly in all cases.',
    duration: '22 min',
    challengeLevel: 'Momentum',
    drills: ['20 SFP formation drills', 'Distinguish SFP from other -aat nouns', 'Build 5 sentences with SFP subjects'],
    quranBridge: {
      arabic: 'إِنَّ الْمُسْلِمَاتِ وَالْمُؤْمِنَاتِ',
      transliteration: "Innal-muslimati wal-muminat",
      meaning: 'Indeed the Muslim women and the believing women...',
      note: 'الْمُسْلِمَات — SFP in accusative (ismu inna): the ات plural pattern used for feminine believers.',
    },
  },
  {
    id: 'b298',
    stage: 'beginner',
    title: 'Grammar: Adjective-Noun Agreement Full Review',
    objective: 'Apply all 4 dimensions of Arabic adjective agreement: number, gender, case, definiteness.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['20 agreement drills', 'Correct 10 error sentences', 'Build 5 fully-agreed noun phrases from Quranic vocabulary'],
    quranBridge: {
      arabic: 'الْعَذَابَ الْأَلِيمَ',
      transliteration: "Al-adhabal-alim",
      meaning: 'The painful punishment.',
      note: 'الْأَلِيمَ — definite, masculine, singular, accusative: four dimensions of agreement applied perfectly.',
    },
  },
  {
    id: 'b299',
    stage: 'beginner',
    title: 'Grammar: Verbal Sentences — Verb First vs Subject First',
    objective: 'Understand the difference between verbal and nominal sentences and their emphasis patterns.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['Convert 10 nominal to verbal sentences', 'Identify sentence type in 20 Quran verses', 'Why does word order shift emphasis?'],
    quranBridge: {
      arabic: 'قَالَ اللَّهُ هَذَا يَوْمُ يَنفَعُ الصَّادِقِينَ صِدْقُهُمْ',
      transliteration: "Qalallaahu hadha yawmu yanfaus-saadiqina sidquhum",
      meaning: 'Allah said: This is the day when the truthful will benefit from their truth.',
      note: 'قَالَ (verbal sentence order) — verb-first structure used for narration; the divine dialogue format.',
    },
  },
  {
    id: 'b300',
    stage: 'beginner',
    title: 'Milestone 300: Beginner Fluency Check',
    objective: 'Complete a full fluency check: speak for 5 minutes in Arabic about Islam, recite 3 surahs with meaning, write a prayer dua.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['5-minute Arabic monologue', '3 surah recitation with full translation', 'Write original dua in 80 Arabic words'],
    quranBridge: {
      arabic: 'رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ',
      transliteration: "Rabbana hab lana min azwajina wa dhurriyyatina qurrata ayunin",
      meaning: 'Our Lord, grant us comfort in our spouses and children, and make us a leader for the righteous.',
      note: 'هَبْ (Form I imperative: grant!) — a dua using imperative address to Allah: the grammar of supplication at its finest.',
    },
  },
  {
    id: 'b301',
    stage: 'beginner',
    title: 'Quran Surah Analysis: Surah al-Qiyamah',
    objective: 'Read, translate, and analyse Surah al-Qiyamah\'s eschatological vocabulary and oath structures.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Resurrection vocabulary extraction', 'Identify oaths and their grammatical role', 'Translate 5 verses independently'],
    quranBridge: {
      arabic: 'أَيَحْسَبُ الْإِنسَانُ أَن يُتْرَكَ سُدًى',
      transliteration: 'Ayahsabul-insanu an yutraka suda',
      meaning: 'Does man think that he will be left neglected?',
      note: 'أَن يُتْرَكَ — passive masdar as object of أَحْسَبَ: the question of divine accountability in grammar.',
    },
  },
  {
    id: 'b302',
    stage: 'beginner',
    title: 'Quran Surah Analysis: Surah al-Insaan',
    objective: 'Read, translate, and analyse Surah al-Insaan for its description of the righteous and Paradise.',
    duration: '40 min',
    challengeLevel: 'Momentum',
    drills: ['Abrar (righteous) vocabulary extraction', 'Paradise description vocabulary', 'Translate 8 verses independently'],
    quranBridge: {
      arabic: 'إِنَّمَا نُطْعِمُكُمْ لِوَجْهِ اللَّهِ لَا نُرِيدُ مِنكُمْ جَزَاءً وَلَا شُكُورًا',
      transliteration: "Innama nut-imukum liwajhillahi la nuridu minkum jazaa-an wala shukoora",
      meaning: 'We only feed you for the face of Allah; we do not want reward or gratitude.',
      note: 'لِوَجْهِ اللَّهِ (for the face of Allah) — the sincerity formula: a prepositional phrase of pure intention.',
    },
  },
  {
    id: 'b303',
    stage: 'beginner',
    title: 'Quran Surah Analysis: Surah al-Mursalat',
    objective: 'Read and analyse Surah al-Mursalat with its repeated refrain and eschatological vision.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Identify the repeated refrain and its function', 'Woe vocabulary analysis', 'Translate 5 verses'],
    quranBridge: {
      arabic: 'وَيْلٌ يَوْمَئِذٍ لِّلْمُكَذِّبِينَ',
      transliteration: 'Waylun yawmaythin lil-mukadhdhibin',
      meaning: 'Woe on that day to those who denied.',
      note: 'وَيْلٌ (woe) — used 10 times in this surah creating an unforgettable refrain: the grammar of divine warning at its most repeated.',
    },
  },
  {
    id: 'b304',
    stage: 'beginner',
    title: 'Islamic Jurisprudence Vocabulary',
    objective: 'Learn 25 fiqh terms: halal, haram, makruh, mustahabb, mubah, wajib, fard.',
    duration: '25 min',
    challengeLevel: 'Starter+',
    drills: ['Fiqh term vocabulary flashcards', 'Classify 10 actions by their fiqh ruling', 'Quran evidence for each main category'],
    quranBridge: {
      arabic: 'أُحِلَّ لَكُم صَيْدُ الْبَحْرِ وَطَعَامُهُ مَتَاعًا لَّكُمْ',
      transliteration: "Uhilla lakum saydul-bahri watamuhu mataan lakum",
      meaning: 'Lawful to you is game from the sea and its food, as provision for you.',
      note: 'أُحِلَّ (passive past: it has been made lawful) — the Quran\'s halal declaration in passive grammar form.',
    },
  },
  {
    id: 'b305',
    stage: 'beginner',
    title: 'Prophets in the Quran: Vocabulary of Prophethood',
    objective: 'Learn 30 vocabulary words related to the Prophets mentioned by name in the Quran.',
    duration: '30 min',
    challengeLevel: 'Starter+',
    drills: ['25 Prophet names in Arabic', 'Prophet vocabulary flashcards', 'Match each prophet to their specific Quran event'],
    quranBridge: {
      arabic: 'إِنَّا أَوْحَيْنَا إِلَيْكَ كَمَا أَوْحَيْنَا إِلَى نُوحٍ وَالنَّبِيِّينَ مِن بَعْدِهِ',
      transliteration: "Inna awhayna ilayka kama awhayna ila nuhin wannabiyyina mim badihi",
      meaning: 'We have revealed to you as We revealed to Noah and the prophets after him.',
      note: 'أَوْحَيْنَا (Form IV plural: We revealed) — divine revelation described as a consistent historical practice.',
    },
  },
  {
    id: 'b306',
    stage: 'beginner',
    title: 'Arabic Dialectal Expressions vs Classical',
    objective: 'Understand the key differences between Modern Standard Arabic (MSA/fusha) and common dialects.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['10 MSA vs dialect equivalents: vocabulary', 'Why learn fusha first? 5 reasons', 'Quran language register: formal/classical'],
    quranBridge: {
      arabic: 'بِلِسَانٍ عَرَبِيٍّ مُّبِينٍ',
      transliteration: 'Bilisanin arabiyyin mubin',
      meaning: 'In a clear Arabic tongue.',
      note: 'عَرَبِيٍّ مُّبِينٍ (clear/eloquent Arabic) — the Quran describes itself as clear Arabic: the fusha standard.',
    },
  },
  {
    id: 'b307',
    stage: 'beginner',
    title: 'Arabic Root Word Families: Root ع-ل-م',
    objective: 'Build a complete word family from the root ع-ل-م (knowledge) — 20+ derived words.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['ع-ل-م word family tree construction', 'Find all ع-ل-م derived words in Surah al-Alaq', 'Build 5 sentences with different ع-ل-م words'],
    quranBridge: {
      arabic: 'عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ',
      transliteration: "Allamal-inaana maa lam yalam",
      meaning: 'He taught man what he did not know.',
      note: 'عَلَّمَ (Form II), يَعْلَمْ (Form I after lam) — two forms of the same root in one verse of revelation.',
    },
  },
  {
    id: 'b308',
    stage: 'beginner',
    title: 'Arabic Root Word Families: Root ك-ت-ب',
    objective: 'Build a complete word family from the root ك-ت-ب (writing/book) — 20+ derived words.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['ك-ت-ب word family construction', 'Find all ك-ت-ب words in the Quran (5 minimum)', 'Build 5 sentences using different ك-ت-ب forms'],
    quranBridge: {
      arabic: 'كَتَبَ اللَّهُ لَأَغْلِبَنَّ أَنَا وَرُسُلِي',
      transliteration: "Katab-Allaahu la-aghlibanna ana wa rusuli",
      meaning: 'Allah has written: I will surely overcome, I and My messengers.',
      note: 'كَتَبَ (He decreed/wrote) — the divine writing metaphor: destiny as divine inscription.',
    },
  },
  {
    id: 'b309',
    stage: 'beginner',
    title: 'Arabic Root Word Families: Root ن-ص-ر',
    objective: 'Build a complete word family from the root ن-ص-ر (help/victory) — 20+ derived words.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['ن-ص-ر word family construction', 'Find ن-ص-ر in key Quran victories', 'Build 5 sentences using different ن-ص-ر forms'],
    quranBridge: {
      arabic: 'إِن يَنصُرْكُمُ اللَّهُ فَلَا غَالِبَ لَكُمْ',
      transliteration: "In yansur-kumullahu fala ghaliba lakum",
      meaning: 'If Allah should aid you, none can overcome you.',
      note: 'يَنصُرْ (jussive of Form I ن-ص-ر) — divine help expressed in conditional grammar: victory depends on alignment.',
    },
  },
  {
    id: 'b310',
    stage: 'beginner',
    title: 'Arabic Root Word Families: Root ح-م-د',
    objective: 'Build a complete word family from the root ح-م-د (praise/gratitude) — 20+ derived words.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['ح-م-د word family: Hamd, Mahmud, Muhammad, Ahmd', 'Find ح-م-د in al-Fatihah and analysis', 'Build 5 praise sentences from root'],
    quranBridge: {
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: 'Alhamdu lillahi rabbil-alamin',
      meaning: 'All praise belongs to Allah, Lord of all the worlds.',
      note: 'الْحَمْد — definite masdar with lam of possession: ALL praise is ALLAH\'s; the grammar of total attribution.',
    },
  },
  {
    id: 'b311',
    stage: 'beginner',
    title: 'Arabic Root Families: Root ر-ح-م',
    objective: 'Build a complete word family from ر-ح-م (mercy) — 20+ words including divine names.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['ر-ح-م word family construction', 'Distinguish Rahman from Rahim (grammar difference)', 'Count ر-ح-م occurrences in Surah ar-Rahman'],
    quranBridge: {
      arabic: 'وَرَحْمَتِي وَسِعَتْ كُلَّ شَيْءٍ',
      transliteration: 'Wa-rahmati wasicat kulla shay',
      meaning: 'And My mercy encompasses all things.',
      note: 'وَسِعَتْ (she/it encompassed) — third person feminine past: رَحْمَة is feminine, so the verb agrees in gender.',
    },
  },
  {
    id: 'b312',
    stage: 'beginner',
    title: 'Arabic Root Families: Root ق-و-ل',
    objective: 'Build a complete word family from ق-و-ل (speech/saying) — 20+ words.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['ق-و-ل word family construction', 'Find all forms of قال in Surah Yusuf', 'Build 5 speech vocabulary sentences'],
    quranBridge: {
      arabic: 'وَقُولُوا لِلنَّاسِ حُسْنًا',
      transliteration: 'Waqulu lin-naasi husna',
      meaning: 'And speak to people good words.',
      note: 'قُولُوا (Form I plural imperative: say!) — the root ق-و-ل has ~523 occurrences in the Quran.',
    },
  },
  {
    id: 'b313',
    stage: 'beginner',
    title: 'Arabic Root Families: Root أ-م-ن',
    objective: 'Build a complete word family from أ-م-ن (faith/security/trust) — 20+ words.',
    duration: '28 min',
    challengeLevel: 'Momentum',
    drills: ['أ-م-ن word family: Iman, Muslim, Amn, Amin, Mumin', 'Distinguish akin vocabulary items', 'Build 5 faith vocabulary sentences'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا آمِنُوا بِاللَّهِ',
      transliteration: "Ya ayyuhalladhina amanu aminu billah",
      meaning: 'O you who have believed, believe in Allah.',
      note: 'آمَنُوا (past Form IV: they believed) + آمِنُوا (imperative: believe!) — same root, different forms addressing believers.',
    },
  },
  {
    id: 'b314',
    stage: 'beginner',
    title: 'Arabic Root Families: Root ص-ل-و',
    objective: 'Build a complete word family from ص-ل-و (prayer/blessing) — 15+ words.',
    duration: '25 min',
    challengeLevel: 'Momentum',
    drills: ['ص-ل-و word family construction', 'Distinguish salah (prayer) from sala (he blessed)', 'Allah and angels doing salah — meaning difference'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ',
      transliteration: "Innallaaha wamalaikatahu yusalluna alan-nabi",
      meaning: 'Indeed Allah and His angels confer blessing upon the Prophet.',
      note: 'يُصَلُّونَ (Form II plural: they send salah) — when applied to Allah it means blessing; angels means du\'a; humans means salah.',
    },
  },
  {
    id: 'b315',
    stage: 'beginner',
    title: 'Arabic Verb Review: All Tenses and Moods',
    objective: 'Complete a comprehensive review of all Arabic verb tenses and moods in one session.',
    duration: '45 min',
    challengeLevel: 'Capstone',
    drills: ['Past/present/future verb table completion', 'Jussive, subjunctive, imperative transformations', 'Parse 20 Quranic verbs: full analysis'],
    quranBridge: {
      arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
      transliteration: "Waman yatawakkal alallahi fahuwa hasbuh",
      meaning: 'And whoever relies upon Allah — He is sufficient for him.',
      note: 'يَتَوَكَّلْ (jussive of Form V after man) — conditional mood triggered by the relative man particle.',
    },
  },
  {
    id: 'b316',
    stage: 'beginner',
    title: 'Arabic Nouns Review: All Declension Patterns',
    objective: 'Complete a comprehensive review of all Arabic noun declension patterns and cases.',
    duration: '40 min',
    challengeLevel: 'Capstone',
    drills: ['Triple case declension for 20 nouns', 'Diptote identification and explanation', 'Parse 20 nouns from long Quran passage'],
    quranBridge: {
      arabic: 'لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
      transliteration: "Lillahi maa fis-samawati wama fil-ard",
      meaning: 'To Allah belongs whatever is in the heavens and whatever is in the earth.',
      note: 'السَّمَاوَاتِ (genitive after fi) and الْأَرْضِ (genitive after fi) — locative expressions in consistent case.',
    },
  },
  {
    id: 'b317',
    stage: 'beginner',
    title: 'Arabic: 99 Names of Allah — Full Study',
    objective: 'Study all 99 Names of Allah (Asma ul Husna) with Arabic, meaning, and root analysis.',
    duration: '120 min',
    challengeLevel: 'Capstone',
    drills: ['All 99 names vocabulary flashcards', 'Group by grammatical form (fa\'il, fa\'aal, muf\'il)', 'Build 10 sentences using divine names as nouns of address'],
    quranBridge: {
      arabic: 'وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَى فَادْعُوهُ بِهَا',
      transliteration: "Walillahil-asmaau l-husna fadoohu biha",
      meaning: 'And to Allah belong the best names, so invoke Him by them.',
      note: 'فَادْعُوهُ بِهَا — the divine command to use the 99 names in du\'a: grammar + theology in one verse.',
    },
  },
  {
    id: 'b318',
    stage: 'beginner',
    title: 'Arabic Reading: Selected Prophetic Hadith',
    objective: 'Read and translate 10 famous short hadith in Arabic, extracting vocabulary and grammar.',
    duration: '40 min',
    challengeLevel: 'Momentum',
    drills: ['Hadith vocabulary extraction', 'Grammar analysis of 3 hadith', 'Memorise 5 short hadith with meaning'],
    quranBridge: {
      arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
      transliteration: "Innama l-amalu bin-niyyat",
      meaning: 'Actions are only [judged] by intentions.',
      note: 'إِنَّمَا (restricted emphasis: ONLY) + الْأَعْمَال (subject) + بِالنِّيَّات (predicate): a nominal sentence with the most famous restriction in Islamic texts.',
    },
  },
  {
    id: 'b319',
    stage: 'beginner',
    title: 'Surah al-Anbiya Opening: Prophetic Theme',
    objective: 'Read and analyse verses 1-10 of Surah al-Anbiya with prophetic vocabulary.',
    duration: '35 min',
    challengeLevel: 'Momentum',
    drills: ['Prophethood vocabulary extraction', 'Grammar: iqtaraba (Form VIII) analysis', 'Translate 5 opening verses'],
    quranBridge: {
      arabic: 'اقْتَرَبَ لِلنَّاسِ حِسَابُهُمْ وَهُمْ فِي غَفْلَةٍ مُّعْرِضُونَ',
      transliteration: "Iqtaraba lin-naasi hisabuhum wahum fi ghaflatim muridun",
      meaning: 'The reckoning has approached for people while they are in heedlessness, turning away.',
      note: 'اقْتَرَبَ (Form VIII: draw near) — subject delayed after verb: accounts approach while people ignore.',
    },
  },
  {
    id: 'b320',
    stage: 'beginner',
    title: 'Final Beginner Vocabulary Test: 500 Words',
    objective: 'Test your knowledge of the 500 most important beginner Quran vocabulary words.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['500 vocabulary flashcard rapid test', 'Test score analysis and weak areas identification', 'Review all words missed'],
    quranBridge: {
      arabic: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',
      transliteration: "Waallama adama l-asmaa kullaha",
      meaning: 'And He taught Adam all the names.',
      note: 'كُلَّهَا (all of them — emphatic complement) — vocabulary mastery is itself a divine gift since creation.',
    },
  },
  {
    id: 'b321',
    stage: 'beginner',
    title: 'Beginner Graduation: Quran Passage Independent Reading',
    objective: 'Read and translate one full page of Quran (20 verses) with no dictionary.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['Independent reading attempt', 'Mark unknown words vs known', 'Achieve 80% comprehension: advance to intermediate'],
    quranBridge: {
      arabic: 'فَأَمَّا مَن أَعْطَى وَاتَّقَى وَصَدَّقَ بِالْحُسْنَى فَسَنُيَسِّرُهُ لِلْيُسْرَى',
      transliteration: "Fa-amma man aata wattaqa wasaddaqa bil-husna fasanuyassiruhoo lil-yusra",
      meaning: 'As for one who gives and fears Allah and believes in the best — We will ease him toward ease.',
      note: 'فَسَنُيَسِّرُ (Form II future: We will ease/facilitate) — three conditions, one promise; the beginner\'s graduation verse.',
    },
  },
  {
    id: 'i1',
    stage: 'intermediate',
    title: 'Verb Patterns Level 1',
    objective: 'Identify past tense and present tense indicators in common Quran verbs.',
    duration: '35 min',
    challengeLevel: 'Core',
    drills: ['Past vs present sort', 'Pattern spotting', 'Root extraction starter'],
    quranBridge: {
      arabic: 'خَلَقَ الْإِنسَانَ مِنْ عَلَقٍ',
      transliteration: 'Khalaqal-insana min alaq',
      meaning: 'He created man from a clinging substance.',
      note: 'The verb خَلَقَ becomes easier to recognize in new contexts.',
    },
  },
  {
    id: 'i2',
    stage: 'intermediate',
    title: 'Pronouns and Prepositions',
    objective: 'Understand who is being addressed and how meaning shifts with attached pronouns.',
    duration: '32 min',
    challengeLevel: 'Core',
    drills: ['Pronoun swap game', 'Mini translation ladder', 'Context quick checks'],
    quranBridge: {
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      transliteration: 'Iyyaka nabudu wa iyyaka nastain',
      meaning: 'You alone we worship, and You alone we ask for help.',
      note: 'Direct-object pronoun focus transforms understanding of this ayah.',
    },
  },
  {
    id: 'i3',
    stage: 'intermediate',
    title: 'Noun States and Idafa',
    objective: 'Decode possessive structures and phrase relationships.',
    duration: '34 min',
    challengeLevel: 'Core+',
    drills: ['Build idafa pairs', 'Detect mudaf and mudaf ilayh', 'Meaning compression drill'],
    quranBridge: {
      arabic: 'رَبِّ الْعَالَمِينَ',
      transliteration: 'Rabbil alamin',
      meaning: 'Lord of the worlds.',
      note: 'Idafa is one of the most common Quranic phrase structures.',
    },
  },
  {
    id: 'i4',
    stage: 'intermediate',
    title: 'Negation and Contrast in Quranic Style',
    objective: 'Track meaning shifts using لا, ما, لن, and contrast markers.',
    duration: '36 min',
    challengeLevel: 'Core+',
    drills: ['Negation pattern bingo', 'Contrast markers map', 'Ayah rewrites'],
    quranBridge: {
      arabic: 'لَا رَيْبَ فِيهِ',
      transliteration: 'La rayba fih',
      meaning: 'There is no doubt in it.',
      note: 'Negation creates certainty in powerful Quranic statements.',
    },
  },
  {
    id: 'i5',
    stage: 'intermediate',
    title: 'Context Comprehension: Surah Workshop',
    objective: 'Follow the narrative thread of a short surah without translation first.',
    duration: '40 min',
    challengeLevel: 'Bridge',
    drills: ['Theme tagging', 'Connector hunt', 'Meaning checkpoints'],
    quranBridge: {
      arabic: 'وَالْعَصْرِ ۝ إِنَّ الْإِنسَانَ لَفِي خُسْرٍ',
      transliteration: 'Wal-asr, innal-insana lafi khusr',
      meaning: 'By time, mankind is surely in loss.',
      note: 'You begin tracking argument flow across verses.',
    },
  },
  {
    id: 'i6',
    stage: 'intermediate',
    title: 'Three Verb Tenses: Madi, Mudari, Amr',
    objective: 'Identify and produce all three Arabic tenses with their time meanings.',
    duration: '35 min',
    challengeLevel: 'Core',
    drills: ['Tense sorting from 20 verbs', 'Convert past to present for 10 verbs', 'Find 3 command verbs in a surah'],
    quranBridge: {
      arabic: 'أَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ',
      transliteration: 'Aqimus-salata wa atuz-zakah',
      meaning: 'Establish prayer and give zakah.',
      note: 'أقيموا and آتوا are imperative plural commands — the amr form in direct address.',
    },
  },
  {
    id: 'i7',
    stage: 'intermediate',
    title: 'Verb Conjugation: Third Person',
    objective: 'Conjugate Form I verbs for he, she, they (m), they (f) in all tenses.',
    duration: '38 min',
    challengeLevel: 'Core',
    drills: ['Conjugation table fill-in', 'Identify subject from verb ending', 'Build 8 sentences with correct gender agreement'],
    quranBridge: {
      arabic: 'يُسَبِّحُ لَهُ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ',
      transliteration: 'Yusabbihu lahu ma fis-samawati wal-ard',
      meaning: 'Exalting Him is whatever is in the heavens and the earth.',
      note: "يُسَبِّحُ is third-person masculine singular mudari — a pattern you'll see in every surah.",
    },
  },
  {
    id: 'i8',
    stage: 'intermediate',
    title: 'Verb Conjugation: First and Second Person',
    objective: 'Conjugate correctly for I (ana), we (nahnu), you (m/f/pl).',
    duration: '36 min',
    challengeLevel: 'Core',
    drills: ['First/second person substitution drill', 'Dialogue gap-fill', "Build a personal du'a using I/we verbs"],
    quranBridge: {
      arabic: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ',
      transliteration: 'Inna nahnu nazzalna adh-dhikr',
      meaning: 'Indeed it is We who sent down the Quran.',
      note: 'نَحْنُ نَزَّلْنَا — first-person plural subject and verb perfectly aligned.',
    },
  },
  {
    id: 'i9',
    stage: 'intermediate',
    title: 'Root Extraction Bootcamp',
    objective: 'Extract the 3-letter root from any derived word form.',
    duration: '40 min',
    challengeLevel: 'Core+',
    drills: ['Extract root from 20 derived words', 'Root family mapping exercise', 'Identify 5 roots in a surah page'],
    quranBridge: {
      arabic: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',
      transliteration: 'Wa allama Adama al-asmaa kullaha',
      meaning: 'And He taught Adam the names of all things.',
      note: 'عَلَّمَ comes from root ع-ل-م meaning to know/teach — a root recurring 800+ times.',
    },
  },
  {
    id: 'i10',
    stage: 'intermediate',
    title: 'The 10 Verb Forms: Overview',
    objective: 'Recognize the purpose and meaning contribution of all 10 verb forms.',
    duration: '38 min',
    challengeLevel: 'Core+',
    drills: ['Match 10 forms to their meanings', 'Form identification from 15 verbs', 'Build one sentence per form'],
    quranBridge: {
      arabic: 'وَاسْتَغْفِرُوا رَبَّكُمْ ثُمَّ تُوبُوا إِلَيْهِ',
      transliteration: 'Wastagfiru rabbakum thumma tubu ilayh',
      meaning: 'And seek forgiveness of your Lord and repent to Him.',
      note: 'اسْتَغْفِرُوا is Form X — the seeking/requesting pattern you are now learning.',
    },
  },
  {
    id: 'i11',
    stage: 'intermediate',
    title: "Form II: Intensification and Causation (Fa''ala)",
    objective: "Recognize Form II verbs (fa''ala pattern) and understand their added meaning.",
    duration: '35 min',
    challengeLevel: 'Core+',
    drills: ['Convert Form I to Form II for 10 verbs', 'Meaning change analysis', 'Spot Form II in Surah al-Baqarah'],
    quranBridge: {
      arabic: 'وَكَلَّمَ اللَّهُ مُوسَى تَكْلِيمًا',
      transliteration: 'Wakallama Allahu Musa takleema',
      meaning: 'And Allah spoke to Moses directly.',
      note: 'كَلَّمَ is Form II of ك-ل-م — the doubled middle letter intensifies "to speak".',
    },
  },
  {
    id: 'i12',
    stage: 'intermediate',
    title: 'Form III: Mutual Action (Mufaala)',
    objective: 'Identify Form III verbs expressing action between two parties.',
    duration: '35 min',
    challengeLevel: 'Core+',
    drills: ['Spot Form III in 10 verses', 'Explain the "mutual" meaning', 'Build 4 Form III sentences'],
    quranBridge: {
      arabic: 'وَجَاهِدُوا فِي اللَّهِ حَقَّ جِهَادِهِ',
      transliteration: 'Wajahidu fillahi haqqa jihadih',
      meaning: 'And strive for Allah with the striving due to Him.',
      note: 'جَاهِدُوا comes from Form III — striving as a sustained engagement.',
    },
  },
  {
    id: 'i13',
    stage: 'intermediate',
    title: "Form IV: Causative Verbs (If'ala)",
    objective: "Recognize and use Form IV (if'ala) as a causative meaning maker.",
    duration: '35 min',
    challengeLevel: 'Core+',
    drills: ['Convert to Form IV for 8 verbs', 'Causative vs basic meaning comparison', 'Find 5 Form IV verbs in Quran'],
    quranBridge: {
      arabic: 'أَسْلَمْتُ وَجْهِيَ لِلَّهِ',
      transliteration: 'Aslamtu wajhiya lillah',
      meaning: 'I have submitted my face to Allah.',
      note: 'أَسْلَمَ is Form IV of س-ل-م — to cause submission, giving us the word Islam.',
    },
  },
  {
    id: 'i14',
    stage: 'intermediate',
    title: "Forms V & VI: Reflexive and Reciprocal",
    objective: "Identify Forms V (tafa''ala) and VI (tafa'ala) as reflexive and reciprocal.",
    duration: '38 min',
    challengeLevel: 'Core+',
    drills: ['Match to Forms II & III counterparts', 'Reflexive meaning analysis for 8 verbs', 'Read a passage identifying Forms V/VI'],
    quranBridge: {
      arabic: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى',
      transliteration: 'Wataawanu alal-birri wattaqwa',
      meaning: 'And cooperate in righteousness and piety.',
      note: 'تَعَاوَنُوا is Form VI — mutual cooperation between plural parties.',
    },
  },
  {
    id: 'i15',
    stage: 'intermediate',
    title: "Forms VII, VIII & X: Passive and Seeking",
    objective: "Use Forms VII (infa'ala), VIII (ifta'ala) and X (istaf'ala) correctly.",
    duration: '38 min',
    challengeLevel: 'Bridge',
    drills: ['Label 15 verbs by form number', 'Meaning derivation for 8 verbs', 'Highlight all three forms in a Quran page'],
    quranBridge: {
      arabic: 'يَسْتَغْفِرُونَ لِمَن فِي الْأَرْضِ',
      transliteration: 'Yastagfrun liman fil-ard',
      meaning: 'They seek forgiveness for those on earth.',
      note: 'يَسْتَغْفِرُونَ is Form X — perfect for learning the seeking/requesting meaning.',
    },
  },
  {
    id: 'i16',
    stage: 'intermediate',
    title: 'Verbal Nouns (Masdar)',
    objective: 'Derive and use masdar (verbal nouns) to express actions as concepts.',
    duration: '36 min',
    challengeLevel: 'Core+',
    drills: ['Derive masdar from 15 verbs', 'Masdar in sentences fill-in', 'Find 5 masdar in an ayah block'],
    quranBridge: {
      arabic: 'وَتَوَكَّلْ عَلَى اللَّهِ وَكَفَى بِاللَّهِ وَكِيلًا',
      transliteration: 'Watawakkal alallahi wakafa billahi wakila',
      meaning: 'And rely upon Allah; Allah is sufficient as Trustee.',
      note: 'وَكِيلًا is a derived noun from و-ك-ل — a masdar-family word appearing many times.',
    },
  },
  {
    id: 'i17',
    stage: 'intermediate',
    title: 'Active Participle (Ism Faail)',
    objective: 'Form and recognize the active participle to describe ongoing agents.',
    duration: '32 min',
    challengeLevel: 'Core+',
    drills: ['Derive ism faail from 12 verbs', 'Spot active participles in passage', 'Translate 8 participle descriptions'],
    quranBridge: {
      arabic: 'وَاللَّهُ سَمِيعٌ عَلِيمٌ',
      transliteration: 'Wallahu sameeun alim',
      meaning: 'And Allah is All-Hearing, All-Knowing.',
      note: "سَمِيعٌ and عَلِيمٌ are active participles — describing Allah's ongoing attributes.",
    },
  },
  {
    id: 'i18',
    stage: 'intermediate',
    title: 'Passive Participle (Ism Mafuul)',
    objective: 'Form and recognize passive participles for things acted upon.',
    duration: '32 min',
    challengeLevel: 'Core+',
    drills: ['Derive ism mafuul from 12 verbs', 'Active vs passive comparison drill', 'Quran passive noun hunt'],
    quranBridge: {
      arabic: 'كِتَابٌ مَّكْنُونٌ',
      transliteration: 'Kitabun maknun',
      meaning: 'A well-preserved book.',
      note: 'مَكْنُونٌ is an ism mafuul — passive participle meaning "that which is hidden/preserved".',
    },
  },
  {
    id: 'i19',
    stage: 'intermediate',
    title: 'Case Endings: Raf, Nasb, Jarr',
    objective: 'Read and assign the three case endings to nouns, adjectives, and pronouns.',
    duration: '40 min',
    challengeLevel: 'Bridge',
    drills: ['Case assignment from 15 sentences', 'Add correct endings to 10 words', 'Parse case roles in 5 Quran sentences'],
    quranBridge: {
      arabic: 'لِلَّهِ مُلْكُ السَّمَاوَاتِ وَالْأَرْضِ',
      transliteration: 'Lillahi mulku s-samawati wal-ard',
      meaning: 'To Allah belongs the dominion of the heavens and the earth.',
      note: 'مُلْكُ is nominative (raf), السَّمَاوَاتِ is genitive (jarr) — two cases in four words.',
    },
  },
  {
    id: 'i20',
    stage: 'intermediate',
    title: 'The Conditional Sentence',
    objective: 'Construct and interpret conditional sentences using in, idha, and law.',
    duration: '36 min',
    challengeLevel: 'Core+',
    drills: ['Identify condition and response in 10 sentences', 'Match condition to outcome', 'Build 5 conditional sentences'],
    quranBridge: {
      arabic: 'إِن تَنصُرُوا اللَّهَ يَنصُرْكُمْ',
      transliteration: 'In tansurullaha yansurkom',
      meaning: 'If you support Allah, He will support you.',
      note: 'إن + mudari verb → jussive outcome: a classic Quran conditional.',
    },
  },
  {
    id: 'i21',
    stage: 'intermediate',
    title: 'Relative Pronouns: Alladhi and Allati',
    objective: 'Use the six forms of the relative pronoun correctly by gender/number.',
    duration: '32 min',
    challengeLevel: 'Core',
    drills: ['Pronoun selection for 12 relative clauses', 'Relative clause building exercise', 'Find 6 relative clauses in a surah'],
    quranBridge: {
      arabic: 'الَّذِينَ يُؤْمِنُونَ بِالْغَيْبِ',
      transliteration: 'Alladhina yuuminuna bilghayb',
      meaning: 'Those who believe in the unseen.',
      note: 'الَّذِينَ is the masculine plural relative pronoun — in Surah al-Baqarah verse 3.',
    },
  },
  {
    id: 'i22',
    stage: 'intermediate',
    title: 'Emphasis Particles: Inna, Anna, Lakinna',
    objective: 'Apply the sisters of inna and understand their effect on sentence grammar.',
    duration: '35 min',
    challengeLevel: 'Core+',
    drills: ['Inna sisters matching table', 'Meaning shift analysis for 8 sentences', 'Build sentences using each particle'],
    quranBridge: {
      arabic: 'إِنَّ الْإِنسَانَ خُلِقَ هَلُوعًا',
      transliteration: 'Innal-insana khuliqa halooa',
      meaning: 'Indeed mankind was created anxious.',
      note: 'إِنَّ places رَفْع on subject but shifts it to نَصْب — a grammar pivot many students miss.',
    },
  },
  {
    id: 'i23',
    stage: 'intermediate',
    title: 'Broken Plural Patterns: Complete Study',
    objective: 'Recognize all 8 major broken plural patterns by form and sound.',
    duration: '40 min',
    challengeLevel: 'Bridge',
    drills: ['Pattern table memorization', 'Singular to plural conversion for 20 words', 'Pattern identification in passage'],
    quranBridge: {
      arabic: 'وَالْأَنْهَارُ تَجْرِي مِن تَحْتِهِمُ',
      transliteration: 'Wal-anharu tajri min tahtihim',
      meaning: 'And rivers flowing beneath them.',
      note: 'أَنْهَار is a broken plural of نَهْر — pattern أَفْعَال, the most common broken plural form.',
    },
  },
  {
    id: 'i24',
    stage: 'intermediate',
    title: 'Hal and Tamyiz: Circumstantial Phrases',
    objective: 'Identify hal (state) and tamyiz (specification) phrases in complex Quranic sentences.',
    duration: '36 min',
    challengeLevel: 'Bridge',
    drills: ['Underline hal in 10 sentences', 'Tamyiz extraction from 8 sentences', 'Build 5 sentences using both structures'],
    quranBridge: {
      arabic: 'فَادْخُلُوهَا خَالِدِينَ',
      transliteration: 'Fadkhluha khalideen',
      meaning: 'Enter it, abiding eternally.',
      note: 'خَالِدِينَ is a hal — it describes the state of those entering ("while being eternal").',
    },
  },
  {
    id: 'i25',
    stage: 'intermediate',
    title: 'Direct and Absolute Objects',
    objective: 'Identify mafuul bihi and mafuul mutlaq (absolute object) in Quranic sentences.',
    duration: '34 min',
    challengeLevel: 'Core+',
    drills: ['Object identification drill', 'Mafuul mutlaq hunt in 3 surahs', 'Build sentences with both object types'],
    quranBridge: {
      arabic: 'وَكَلَّمَ اللَّهُ مُوسَى تَكْلِيمًا',
      transliteration: 'Wakallama Allahu Musa takleema',
      meaning: 'And Allah spoke to Moses directly.',
      note: 'تَكْلِيمًا is a mafuul mutlaq — it emphasizes how completely Moses was spoken to.',
    },
  },
  {
    id: 'i26',
    stage: 'intermediate',
    title: 'Reported Speech and Qawl',
    objective: 'Understand how قال introduces reported speech and how the content changes.',
    duration: '32 min',
    challengeLevel: 'Core+',
    drills: ['Extract direct speech from 10 ayat', 'Convert direct to indirect', 'Find 5 qawl structures in Quran stories'],
    quranBridge: {
      arabic: 'قَالَ إِنِّي عَبْدُ اللَّهِ',
      transliteration: 'Qala inni abdullahi',
      meaning: 'He said: I am a servant of Allah.',
      note: 'قَالَ + إنّ introduces direct speech — a constant Quranic narrative structure.',
    },
  },
  {
    id: 'i27',
    stage: 'intermediate',
    title: 'Time and Place Adverbs',
    objective: 'Use adverbs of time (zaman) and place (makan) correctly in sentences.',
    duration: '30 min',
    challengeLevel: 'Core',
    drills: ['Classify 15 adverbs by type', 'Place adverbs in correct sentence positions', 'Quranic time expression hunt'],
    quranBridge: {
      arabic: 'وَمِنَ اللَّيْلِ فَسَبِّحْهُ وَأَدْبَارَ السُّجُودِ',
      transliteration: 'Waminallyli fasabbihhu wa adbara as-sujud',
      meaning: 'And during the night glorify Him and after prostrations.',
      note: 'مِنَ اللَّيْلِ (time) and أَدْبَارَ (after-time) are two types of temporal adverbs.',
    },
  },
  {
    id: 'i28',
    stage: 'intermediate',
    title: 'Quranic Vocabulary: 300 Core Words',
    objective: 'Master the 300 highest-frequency words that cover 70% of the Quran.',
    duration: '45 min',
    challengeLevel: 'Bridge',
    drills: ['Spaced repetition 50-word round', 'Context sentence translation', 'Quran passage blind recognition test'],
    quranBridge: {
      arabic: 'إِنَّ هَٰذَا الْقُرْآنَ يَهْدِي',
      transliteration: 'Inna hadhal-qurana yahdi',
      meaning: 'Indeed, this Quran guides.',
      note: 'Knowing the 300 core words means you understand the structure of every ayah you recite.',
    },
  },
  {
    id: 'i29',
    stage: 'intermediate',
    title: "Al-Fatihah: Complete Grammatical Analysis",
    objective: "Parse every word of al-Fatihah with full i'rab and morphological annotation.",
    duration: '40 min',
    challengeLevel: 'Bridge',
    drills: ['Word-by-word parsing worksheet', 'Case role identification', 'Explain each phrase structure to a partner'],
    quranBridge: {
      arabic: 'غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ',
      transliteration: 'Ghayril maghdubi alayhim wala addaaleen',
      meaning: 'Not the path of those who earned anger or those who went astray.',
      note: 'The final verse of al-Fatihah features idafa, passive participle, and exclusion all at once.',
    },
  },
  {
    id: 'i30',
    stage: 'intermediate',
    title: 'Surah al-Baqarah: First 20 Verses',
    objective: 'Read, translate, and parse the opening 20 verses of al-Baqarah independently.',
    duration: '45 min',
    challengeLevel: 'Bridge',
    drills: ['Independent translation of each ayah', 'Spot grammar structures covered so far', 'Vocabulary list building from the passage'],
    quranBridge: {
      arabic: 'ذَٰلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ',
      transliteration: 'Dhalikal-kitabu la rayba fihi hudan lil-muttaqin',
      meaning: 'That is the Book about which there is no doubt, a guidance for those conscious of Allah.',
      note: 'Verse 2:2 is a compressed grammatical masterclass — nominal sentence, negation, and idafa in one.',
    },
  },
  {
    id: 'i31',
    stage: 'intermediate',
    title: 'Juz Amma: Full Translation Workout',
    objective: 'Translate every surah in Juz Amma without assistance, then verify.',
    duration: '50 min',
    challengeLevel: 'Bridge',
    drills: ['Blind translate 5 surahs', 'Self-mark and correct', 'Vocabulary gap analysis'],
    quranBridge: {
      arabic: 'أَلَمْ نَشْرَحْ لَكَ صَدْرَكَ',
      transliteration: 'Alam nashrah laka sadrak',
      meaning: 'Did We not expand for you your breast?',
      note: 'Surah ash-Sharh is an 8-verse morale boost — the whole surah is parseable at this level.',
    },
  },
  {
    id: 'i32',
    stage: 'intermediate',
    title: 'Surah al-Kahf: Vocabulary and Grammar',
    objective: 'Work through the first 10 verses of al-Kahf with grammatical precision.',
    duration: '45 min',
    challengeLevel: 'Bridge',
    drills: ['Verse-by-verse translation', 'Grammar structure hunting', 'New vocabulary list (20 words)'],
    quranBridge: {
      arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَنزَلَ عَلَى عَبْدِهِ الْكِتَابَ',
      transliteration: 'Alhamdu lillahilladhi anzala ala abdihi al-kitab',
      meaning: 'Praise to Allah, who revealed to His servant the Book.',
      note: 'The opening of al-Kahf has an idafa, relative pronoun, and prepositional phrase — ideal parsing practice.',
    },
  },
  {
    id: 'i33',
    stage: 'intermediate',
    title: 'Reading Unvowelled Text (Rasm Uthmani)',
    objective: 'Read Arabic without harakat using grammatical and contextual knowledge.',
    duration: '45 min',
    challengeLevel: 'Bridge',
    drills: ['Unvowelled word identification from context', 'Add missing vowels back in', 'Read a full rasm uthmani page'],
    quranBridge: {
      arabic: 'وَنَزَّلْنَا عَلَيْكَ الْكِتَابَ تِبْيَانًا لِّكُلِّ شَيْءٍ',
      transliteration: "Wanazzalna alaykal-kitaba tibyanan likulli shay'",
      meaning: 'And We have sent down to you the Book as clarification for all things.',
      note: 'Most printed Qurans include harakat, but classical texts do not — this skill opens the full tradition.',
    },
  },
  {
    id: 'i34',
    stage: 'intermediate',
    title: 'Comprehensive Grammar Review',
    objective: 'Consolidate all intermediate grammar topics through a mock exam passage.',
    duration: '50 min',
    challengeLevel: 'Bridge',
    drills: ['Full parsing of a 10-verse passage', 'Error correction worksheet (15 errors)', 'Oral explanation of 5 grammar choices'],
    quranBridge: {
      arabic: 'وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا',
      transliteration: 'Wama utitum minal-ilmi illa qalila',
      meaning: 'And you have not been given of knowledge except a little.',
      note: 'A humbling ayah to begin the review — passive verb, partitive preposition, and exception all in one.',
    },
  },
  {
    id: 'i35',
    stage: 'intermediate',
    title: 'Storytelling Patterns in Quran',
    objective: 'Understand how the Quran introduces, develops, and concludes stories using grammar.',
    duration: '42 min',
    challengeLevel: 'Bridge',
    drills: ['Narrative arc mapping in 3 stories', 'Identify discourse connectors', 'Summarize a Quran story in Arabic'],
    quranBridge: {
      arabic: 'نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ',
      transliteration: 'Nahnu naqussu alayka ahsanal-qasas',
      meaning: 'We relate to you the best of stories.',
      note: 'This verse opens Surah Yusuf — the "best story" and a rich intermediate-level grammar source.',
    },
  },
  {
    id: 'i36',
    stage: 'intermediate',
    title: "Quranic Du'a Formulas",
    objective: "Learn 20 du'a structures from the Quran with full grammatical understanding.",
    duration: '38 min',
    challengeLevel: 'Core+',
    drills: ["Translate 20 Quranic du'as", 'Identify verb forms in each', "Memorize 5 du'as with analysis"],
    quranBridge: {
      arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
      transliteration: 'Rabbana atina fid-dunya hasanatan wafil-akhirati hasanatan',
      meaning: 'Our Lord, give us good in this world and good in the hereafter.',
      note: "This du'a has a command verb (آتِنَا), two prepositional phrases, and an adjective.",
    },
  },
  {
    id: 'i37',
    stage: 'intermediate',
    title: 'Particles of Purpose and Cause',
    objective: 'Use li, kay, hatta, and li-anna to express purpose and cause.',
    duration: '34 min',
    challengeLevel: 'Core+',
    drills: ['Particle purpose identification in 10 sentences', 'Build purpose clauses with li and kay', 'Translate cause-and-effect ayat'],
    quranBridge: {
      arabic: 'لِيَغْفِرَ لَكَ اللَّهُ مَا تَقَدَّمَ مِن ذَنبِكَ',
      transliteration: 'Liyaghfira laka Allahu ma taqaddama min dhanbik',
      meaning: 'That Allah may forgive you what preceded of your sin.',
      note: 'لِـ + subjunctive verb opens this purpose clause — the most frequent purpose structure in Quran.',
    },
  },
  {
    id: 'i38',
    stage: 'intermediate',
    title: 'Concession and Exception: Illa and Ghayra',
    objective: 'Parse exception structures introduced by إلا and غير.',
    duration: '34 min',
    challengeLevel: 'Bridge',
    drills: ['Find the exception in 10 sentences', 'Positive vs negative exception drill', 'Build 5 exception sentences from prompts'],
    quranBridge: {
      arabic: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',
      transliteration: 'Wama khalaqtul-jinna wal-insa illa liyaabudun',
      meaning: 'I did not create jinn and mankind except to worship Me.',
      note: 'إلا (except) introduces the purpose exception — one of the most powerful statements in the Quran.',
    },
  },
  {
    id: 'i39',
    stage: 'intermediate',
    title: "Surah Yasin: Vocabulary Deep Dive",
    objective: "Build a complete vocabulary and grammar map of Surah Yasin's first passage.",
    duration: '45 min',
    challengeLevel: 'Bridge',
    drills: ['Vocabulary extraction (30 words)', 'Grammar structure tagging', 'Group parallel structures in ayat'],
    quranBridge: {
      arabic: 'إِنَّكَ لَمِنَ الْمُرْسَلِينَ',
      transliteration: 'Innaka laminal-mursalin',
      meaning: 'Indeed you are among the messengers.',
      note: 'إنّ + lam al-tawkid — double emphasis: a classic emphatic structure in Yasin.',
    },
  },
  {
    id: 'i40',
    stage: 'intermediate',
    title: 'Intermediate Capstone: Surah al-Mulk',
    objective: 'Independently read, translate, and analyze Surah al-Mulk with full comprehension.',
    duration: '55 min',
    challengeLevel: 'Capstone',
    drills: ['Full translation without notes', 'Grammar highlight: 15 structures', 'Oral recitation with meaning commentary'],
    quranBridge: {
      arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      transliteration: 'Tabarakalladhi biyadihil-mulku wahuwa ala kulli shayin qadir',
      meaning: 'Blessed is He in whose hand is dominion, and He is over all things competent.',
      note: "The opening ayah of al-Mulk is a dense grammar workout — the perfect capstone challenge.",
    },
  },
  {
    id: 'i41',
    stage: 'intermediate',
    title: 'Form V Verbs: Reflexive and Resultative',
    objective: 'Master Form V (تَفَعَّلَ) verbs: reflexive force, deliberate action, and gradual effects.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Form V conjugation table (12 pronouns)', 'Form V vs Form II semantic difference', 'Find 10 Form V verbs in Quran'],
    quranBridge: {
      arabic: 'وَتَقَلُّبَكَ فِي السَّاجِدِينَ',
      transliteration: 'Wataqallubaka fis-sajideen',
      meaning: 'And your movement among those who prostrate.',
      note: 'تَقَلُّب (Form V masdar: movement/turning) — the Prophet\'s blessed movement observed by Allah.',
    },
  },
  {
    id: 'i42',
    stage: 'intermediate',
    title: 'Form VI Verbs: Reciprocal Actions',
    objective: 'Master Form VI (تَفَاعَلَ) verbs: mutual/reciprocal actions between two parties.',
    duration: '32 min',
    challengeLevel: 'Advanced',
    drills: ['Form VI conjugation table', 'Form VI vs Form III (both reciprocal — difference)', 'Find 10 Form VI verbs in Quran'],
    quranBridge: {
      arabic: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى',
      transliteration: "Wataawanu alal-birri wattaqwa",
      meaning: 'And cooperate in righteousness and piety.',
      note: 'تَعَاوَنُوا (Form VI plural imperative: cooperate!) — mutual helping from root ع-و-ن.',
    },
  },
  {
    id: 'i43',
    stage: 'intermediate',
    title: 'Form VII Verbs: Passive/Reflexive with Intransitive Force',
    objective: 'Master Form VII (اِنفَعَلَ) verbs: spontaneous passive, intransitive results.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['Form VII conjugation table', 'Form VII vs passive (difference in force)', 'Find 10 Form VII verbs in Quran'],
    quranBridge: {
      arabic: 'فَانفَجَرَتْ مِنْهُ اثْنَتَا عَشْرَةَ عَيْنًا',
      transliteration: "Fanfajarat minhu ithna ashrata ayna",
      meaning: 'And there gushed forth from it twelve springs.',
      note: 'اِنفَجَرَت (Form VII: it burst forth spontaneously) — gushing without an agent stated: the miracle grammar.',
    },
  },
  {
    id: 'i44',
    stage: 'intermediate',
    title: 'Form VIII Verbs: Intensive/Reflexive with Transitivity',
    objective: 'Master Form VIII (اِفتَعَلَ) verbs: earnest action performed by the subject on themselves.',
    duration: '32 min',
    challengeLevel: 'Advanced',
    drills: ['Form VIII conjugation table', 'Form I vs Form VIII semantic shift for 10 roots', 'Find 10 Form VIII verbs in Quran'],
    quranBridge: {
      arabic: 'فَاتَّقُوا اللَّهَ مَا اسْتَطَعْتُمْ',
      transliteration: "Fettaqullaaha masta-tatoom",
      meaning: 'So fear Allah as much as you are able.',
      note: 'اتَّقُوا (Form VIII of و-ق-ي: fear/protect yourself) — Form VIII adds internality to the root meaning.',
    },
  },
  {
    id: 'i45',
    stage: 'intermediate',
    title: 'Form IX Verbs: Colour and Defect',
    objective: 'Master Form IX (اِفعَلَّ): the rare color/defect form and its limited but essential vocabulary.',
    duration: '22 min',
    challengeLevel: 'Advanced',
    drills: ['Form IX vocabulary list (10 words)', 'Use 5 Form IX words in descriptive sentences', 'Find Form IX in Quran eschatological vocabulary'],
    quranBridge: {
      arabic: 'وُجُوهٌ يَوْمَئِذٍ مُّسْفِرَةٌ وَوُجُوهٌ يَوْمَئِذٍ عَلَيْهَا غَبَرَةٌ',
      transliteration: "Wujuhun yawmaydhin musfiratun wa-wujuhun yawmaydhin alayha ghabara",
      meaning: 'Faces that day will be bright, and faces that day will have dust upon them.',
      note: 'مُسْفِرَة vs غَبَرَة — color/brightness vocabulary from the grammar family that Form IX describes.',
    },
  },
  {
    id: 'i46',
    stage: 'intermediate',
    title: 'Form X Verbs: Deeming and Requesting',
    objective: 'Master Form X (اِستَفعَلَ): seeking, deeming, or requesting that a quality be present.',
    duration: '32 min',
    challengeLevel: 'Advanced',
    drills: ['Form X conjugation table', 'Distinguish Form X: seeking vs causative', 'Find 10 Form X verbs in Quran'],
    quranBridge: {
      arabic: 'وَاسْتَغْفِرُوا اللَّهَ',
      transliteration: "Wastaghfirullaah",
      meaning: 'And seek forgiveness from Allah.',
      note: 'اسْتَغْفَرَ (Form X: seek forgiveness) — the most commonly performed Form X: استفعل of غ-ف-ر.',
    },
  },
  {
    id: 'i47',
    stage: 'intermediate',
    title: 'Verb Quadriliteral Roots',
    objective: 'Understand four-letter root verbs: their patterns, meanings, and Quran occurrences.',
    duration: '28 min',
    challengeLevel: 'Advanced',
    drills: ['10 quadriliteral verbs list', 'Form I quadriliteral conjugation', 'Find 5 in Quran'],
    quranBridge: {
      arabic: 'وَوَسْوَسَ إِلَيْهِ الشَّيْطَانُ',
      transliteration: "Wawaswasaw ilayhi sh-shaytan",
      meaning: 'And Shaytan whispered to him.',
      note: 'وَسْوَسَ — a quadriliteral root (4-letter): onsomatopoeic whisper, expressing the sound of the act.',
    },
  },
  {
    id: 'i48',
    stage: 'intermediate',
    title: 'Active and Passive Participles: All Verb Forms',
    objective: 'Form active and passive participles for all 10 Arabic verb forms (I-X).',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Participle formation table for all forms', '20 Quranic participle identification', 'Participle vs adjective: functional distinction'],
    quranBridge: {
      arabic: 'وَهُوَ الْعَلِيمُ الْحَكِيمُ',
      transliteration: "Wahuwal-alimul-hakim",
      meaning: 'And He is the All-Knowing, the Wise.',
      note: 'الْعَلِيم and الْحَكِيم — both Form I intensive active participles (fa\'eel pattern = hyperbolic agent).',
    },
  },
  {
    id: 'i49',
    stage: 'intermediate',
    title: 'Verbal Noun (Masdar): All 10 Forms',
    objective: 'Form masdars for all 10 Arabic verb forms (I-X) and use them as subjects and objects.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Masdar formation table for all forms', 'Use 20 masdars in sentences', 'Masdar vs active participle in Quran'],
    quranBridge: {
      arabic: 'وَعَسَى أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ',
      transliteration: "Waasa an takrahoo shayan wahuwa khayrul-lakum",
      meaning: 'Perhaps you dislike something and it is good for you.',
      note: 'تَكْرَهُوا (subjunctive after عَسَى أَنْ) — the verb is a masdar equivalent acting as subject complement.',
    },
  },
  {
    id: 'i50',
    stage: 'intermediate',
    title: 'Intermediate Milestone: Grammar Systems Review',
    objective: 'Review all verb form patterns (I-X), all noun declension patterns, and all particle systems.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['Form I-X rapid conjugation test', 'Noun case identification in 3 paragraphs', 'Parse 30 words fully: root, form, case'],
    quranBridge: {
      arabic: 'وَكَذَلِكَ أَنزَلْنَاهُ حُكْمًا عَرَبِيًّا',
      transliteration: "Wakadhaliaka anzalnaahu hukman arabiyya",
      meaning: 'And thus We have revealed it as an Arabic judgement.',
      note: 'حُكْمًا عَرَبِيًّا (Arabic judgment — indefinite accusative of manner) — the Quran\'s self-description in grammar.',
    },
  },
  {
    id: 'i51',
    stage: 'intermediate',
    title: 'Reading Surah al-Baqarah: Verses 1-20',
    objective: 'Read, analyse, and master the first 20 verses of Surah al-Baqarah for advanced vocabulary.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Verse-by-verse vocabulary extraction', 'Grammar analysis of 10 structures', 'Translate all 20 verses independently'],
    quranBridge: {
      arabic: 'ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ',
      transliteration: "Dhalikal-kitabu la rayba feeh hudan lil-muttaqin",
      meaning: 'That is the Book about which there is no doubt, a guidance for those conscious of Allah.',
      note: 'ذَلِكَ (distal demonstrative) — referring to a near book with a distancing demonstrative: a mark of supreme elevation.',
    },
  },
  {
    id: 'i52',
    stage: 'intermediate',
    title: 'Reading Surah al-Baqarah: Verses 21-40',
    objective: 'Read and analyse al-Baqarah 21-40: the creation story of Adam in linguistic depth.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Adam creation vocabulary', 'Dialogue structures in the passage', 'Translate 10 verses independently'],
    quranBridge: {
      arabic: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا ثُمَّ عَرَضَهُمْ عَلَى الْمَلَائِكَةِ',
      transliteration: "Waallama adama l-asmaa kullaha thumma aradahum alal-malaikah",
      meaning: 'And He taught Adam all the names, then presented them to the angels.',
      note: 'عَرَضَهُمْ (he presented them — masculine plural pronoun for الأسماء): the grammar of name-presentation in divine pedagogy.',
    },
  },
  {
    id: 'i53',
    stage: 'intermediate',
    title: 'Rhetorical Devices in the Quran: Isnad Majazi',
    objective: 'Understand and identify metaphorical attribution (isnad majazi) in Quranic rhetoric.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['10 isnad majazi examples from Quran', 'Distinguish literal vs metaphorical attribution', 'Construct 5 isnad majazi sentences'],
    quranBridge: {
      arabic: 'فَمَا بَكَتْ عَلَيْهِمُ السَّمَاءُ وَالْأَرْضُ',
      transliteration: "Fama bakat alayhimus-samau wal-ard",
      meaning: 'And the heaven and earth did not weep for them.',
      note: 'بَكَتِ السَّمَاء (the sky wept) — isnad majazi: weeping attributed to the sky for poetic personification.',
    },
  },
  {
    id: 'i54',
    stage: 'intermediate',
    title: 'Rhetorical Devices: Tashbih (Simile)',
    objective: 'Identify, analyse, and construct Arabic similes using كَ, كَأَنَّ, مِثْل.',
    duration: '32 min',
    challengeLevel: 'Advanced',
    drills: ['10 Quranic simile identification', '4-part simile analysis (mushabah/wajh/adah/mushabah bih)', 'Construct 5 original similes'],
    quranBridge: {
      arabic: 'مَثَلُهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا',
      transliteration: "Mathaluhum kamathalil-ladhee istawqada nara",
      meaning: 'Their example is like one who kindled a fire.',
      note: 'كَمَثَلِ (like the example of) — the Quran\'s extended simile frame: one of the most developed rhetorical structures.',
    },
  },
  {
    id: 'i55',
    stage: 'intermediate',
    title: 'Rhetorical Devices: Isti\'arah (Metaphor)',
    objective: 'Identify and analyse complete and incomplete metaphor (isti\'arah) in the Quran.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['10 Quranic metaphor identification', 'Complete vs incomplete metaphor distinction', 'Construct 5 original metaphors'],
    quranBridge: {
      arabic: 'وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ',
      transliteration: "Wakhfid lahumaa janaahadh-dhulli minar-rahmah",
      meaning: 'And lower to them the wing of humility out of mercy.',
      note: 'جَنَاحَ الذُّلِّ (wing of humility) — complete isti\'arah: bird wing as vehicle for humility; one of the most beautiful Quranic metaphors.',
    },
  },
  {
    id: 'i56',
    stage: 'intermediate',
    title: 'Rhetorical Devices: Kinayah (Metonymy)',
    objective: 'Identify kinayah (metonymy and indirect allusion) and its layered meaning in the Quran.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['10 Quranic kinayah identification', 'Literal vs intended meaning distinction', 'Construct 3 kinayah sentences'],
    quranBridge: {
      arabic: 'وَلَا تَجْعَلْ يَدَكَ مَغْلُولَةً إِلَى عُنُقِكَ',
      transliteration: "Wala tajal yadaka maghlulatan ila unuqik",
      meaning: 'And do not make your hand chained to your neck.',
      note: 'Hand chained to neck — kinayah for extreme miserliness; idiomatic meaning more powerful than literal statement.',
    },
  },
  {
    id: 'i57',
    stage: 'intermediate',
    title: 'Rhetorical Devices: Tibaq (Antithesis)',
    objective: 'Identify tibaq (paired opposites used for rhetorical balance) across multiple Quranic surahs.',
    duration: '28 min',
    challengeLevel: 'Advanced',
    drills: ['20 tibaq examples from Quran', 'Construct 5 antithetical pairs', 'How tibaq creates rhetorical balance'],
    quranBridge: {
      arabic: 'لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
      transliteration: "Lillahi maa fis-samawati wama fil-ard",
      meaning: 'To Allah belongs all that is in the heavens and all that is in the earth.',
      note: 'السَّمَاوَات vs الْأَرْض — the greatest tibaq pair in the Quran: heaven and earth as divine possession.',
    },
  },
  {
    id: 'i58',
    stage: 'intermediate',
    title: 'Rhetorical Devices: Muqabala (Parallel Contrast)',
    objective: 'Identify muqabala (extended parallel contrasts of 3+ elements) in the Quran.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['5 muqabala examples from Quran', 'Map the parallel structure visually', 'Construct 2 original muqabala sentences'],
    quranBridge: {
      arabic: 'فَأَمَّا مَنْ أَعْطَى وَاتَّقَى وَصَدَّقَ بِالْحُسْنَى ... وَأَمَّا مَن بَخِلَ وَاسْتَغْنَى',
      transliteration: "Famma man aata wattaqa wasaddaqa bil-husna... wa-amma man bakhila wastaghnaa...",
      meaning: 'As for the one who gives, fears Allah, and believes in the best ... and as for the one who withholds and considers himself self-sufficient...',
      note: 'فَأَمَّا ... وَأَمَّا — the twin-conditional frame of muqabala: parallel character archetypes in precise contrast.',
    },
  },
  {
    id: 'i59',
    stage: 'intermediate',
    title: 'Quranic Rhetorical Questions: All Types',
    objective: 'Analyse all 5 types of Quranic rhetorical questions (takhyeel, tawbikh, taajub, taswiyah, inkaar).',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['20 Quranic rhetorical questions identification by type', 'Why does word order shift in each type?', 'Construct 5 rhetorical questions'],
    quranBridge: {
      arabic: 'أَفَمَن يَخْلُقُ كَمَن لَّا يَخْلُقُ أَفَلَا تَذَكَّرُونَ',
      transliteration: "Afaman yakhluqu kaman la yakhluqu afala tadhakkarun",
      meaning: 'Is He who creates like one who does not create? Will you not be reminded?',
      note: 'أَفَـ (hamzat inkaar: rejection/rebuke question) — the rhetorical hammer of comparison followed by a call to reason.',
    },
  },
  {
    id: 'i60',
    stage: 'intermediate',
    title: 'Intermediate Milestone: Balaghah Review',
    objective: 'Review all studied balaghah devices with identification tests and original construction.',
    duration: '60 min',
    challengeLevel: 'Capstone',
    drills: ['Identify all 8 devices in a 3-page passage', 'Construct one sentence with each device', 'Grade your own balaghah construction'],
    quranBridge: {
      arabic: 'إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
      transliteration: "Inna hadhal-qurana yahdi lil-latee hiya aqwam",
      meaning: 'Indeed this Quran guides to that which is most suitable.',
      note: 'أَقْوَمُ (elative adjective: most upright) — the Quran\'s self-claim of guidance is linguistically the most precisely elegant.',
    },
  },
  {
    id: 'i61',
    stage: 'intermediate',
    title: 'Surah al-Imran: Opening 30 Verses',
    objective: 'Read and analyse al-Imran 1-30 with intermediate-level vocabulary extraction and grammar.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Vocabulary extraction: 30 words', 'Grammar structures: 10 analysis', 'Translate 10 verses independently'],
    quranBridge: {
      arabic: 'الم اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
      transliteration: "Alif-Lam-Mim Allaahu la ilaha illaa huwal-hayyul-qayyum",
      meaning: 'Alif, Lam, Meem. Allah — there is no god except Him, the Ever-Living, the Self-Subsisting.',
      note: 'الْحَيُّ الْقَيُّومُ — two divine names used as predicates: one for eternal life, one for sustaining all existence.',
    },
  },
  {
    id: 'i62',
    stage: 'intermediate',
    title: 'Surah al-Imran: The Muhkam and Mutashabih',
    objective: 'Read al-Imran 7 and master the vocabulary of clear and allegorical Quranic verses.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Muhkam vs mutashabih vocabulary', 'Grammar analysis of verse 7', 'Find examples of each type in 5 surahs'],
    quranBridge: {
      arabic: 'مِنْهُ آيَاتٌ مُّحْكَمَاتٌ هُنَّ أُمُّ الْكِتَابِ وَأُخَرُ مُتَشَابِهَاتٌ',
      transliteration: "Minhu ayatun muhkamatun hunna ummul-kitabi wa-ukharu mutashabihat",
      meaning: 'Among its verses are clear verses — they are the foundation of the Book — and others allegorical.',
      note: 'أُمُّ الْكِتَاب (mother/source of the Book) — metaphoric idafa expressing primacy and foundation.',
    },
  },
  {
    id: 'i63',
    stage: 'intermediate',
    title: 'Surah al-Nisa: Social Justice Grammar Vocabulary',
    objective: 'Read selected verses of Surah an-Nisa with focus on social and legal vocabulary.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Social contract vocabulary (30 words)', 'Legal command/prohibition identification', 'Translate 10 verses independently'],
    quranBridge: {
      arabic: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
      transliteration: "Wa-ahallallaahu l-bay-a waharrama r-riba",
      meaning: 'And Allah has permitted trade and has forbidden interest.',
      note: 'أَحَلَّ (Form IV: He made lawful) vs حَرَّمَ (Form II: He made forbidden) — the grammar of Islamic economics.',
    },
  },
  {
    id: 'i64',
    stage: 'intermediate',
    title: 'Surah al-Maidah: Covenant and Contract Vocabulary',
    objective: 'Read selected verses from Surah al-Maidah on covenants, contracts, and witnessing.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Covenant vocabulary extraction (25 words)', 'Imperative command structures in surah', 'Translate 8 verses independently'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ',
      transliteration: "Ya ayyuhalladhina amanu awfu bil-uqud",
      meaning: 'O believers, fulfil your contracts.',
      note: 'أَوْفُوا (Form IV plural imperative: fulfil!) — the opening command of al-Maidah: Islamic contract law in one verb.',
    },
  },
  {
    id: 'i65',
    stage: 'intermediate',
    title: 'Surah al-Anam: Arguments for Tawhid',
    objective: 'Read selected passages from Surah al-An\'am on monotheism with argumentative vocabulary.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Tawhid argumentation vocabulary', 'Logical structure of 5 divine proofs', 'Translate 8 verses independently'],
    quranBridge: {
      arabic: 'وَهُوَ الَّذِي جَعَلَ لَكُمُ النُّجُومَ لِتَهْتَدُوا بِهَا',
      transliteration: "Wahuwal-ladhee jaala lakumun-nujooma litahtadu biha",
      meaning: 'And it is He who made the stars for you that you might be guided by them.',
      note: 'لِتَهْتَدُوا (lam + subjunctive: so that you are guided) — purpose clause expressing divine intentionality in creation.',
    },
  },
  {
    id: 'i66',
    stage: 'intermediate',
    title: 'Surah al-Araf: Creation, Sin, and Redemption',
    objective: 'Read key passages from Surah al-A\'raf on Adam, Iblis, and divine narrative.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Narrative vocabulary (30 words)', 'Dialogue structure analysis', 'Translate 10 verses independently'],
    quranBridge: {
      arabic: 'قَالَ فَبِمَا أَغْوَيْتَنِي لَأَقْعُدَنَّ لَهُمْ صِرَاطَكَ الْمُسْتَقِيمَ',
      transliteration: "Qaala fabima aghwaytani la-aqudanna lahum siratakaal-mustaqim",
      meaning: 'He said: Because You have put me in error, I will surely sit in wait for them on Your straight path.',
      note: 'لَأَقْعُدَنَّ (oath + reinforced future form) — Iblis takes the divine path as his ambush point: the grammar of Shaytan\'s strategy.',
    },
  },
  {
    id: 'i67',
    stage: 'intermediate',
    title: 'Surah al-Anfal: Leadership and Battle Vocabulary',
    objective: 'Read selected al-Anfal passages with military and community leadership vocabulary.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Battle and leadership vocabulary (25 words)', 'Command structures in the surah', 'Translate 8 verses independently'],
    quranBridge: {
      arabic: 'وَأَعِدُّوا لَهُم مَّا اسْتَطَعْتُم مِّن قُوَّةٍ',
      transliteration: "Wa-a-idduu lahum masta-tatumm min quwwatin",
      meaning: 'And prepare against them whatever forces you are able.',
      note: 'أَعِدُّوا (Form IV plural imperative: prepare!) + مَا اسْتَطَعْتُم (relative masdar: as much as you can) — preparation command with open scope.',
    },
  },
  {
    id: 'i68',
    stage: 'intermediate',
    title: 'Surah at-Tawbah: Repentance and Community',
    objective: 'Read selected at-Tawbah passages with repentance, community, and covenant vocabulary.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Tawbah vocabulary extraction', 'Conditional and prohibition structures', 'Translate 8 verses independently'],
    quranBridge: {
      arabic: 'فَإِن تَابُوا وَأَقَامُوا الصَّلَاةَ وَآتَوُا الزَّكَاةَ فَإِخْوَانُكُمْ فِي الدِّينِ',
      transliteration: "Fain tabu wa-aqamus-salata wa-atawuz-zakata faikhwanukum fid-deen",
      meaning: 'But if they repent, establish prayer, and give zakah, then they are your brothers in religion.',
      note: 'فَإِخْوَانُكُمْ (then they are your brothers) — conditional outcome in nominal sentence: brotherhood conditional on action.',
    },
  },
  {
    id: 'i69',
    stage: 'intermediate',
    title: 'Surah Yunus: Divine Sovereignty and Signs',
    objective: 'Read selected Surah Yunus passages on divine power, signs, and the response of people.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Sovereignty vocabulary (25 words)', 'Signs (ayat) vocabulary list', 'Translate 8 verses independently'],
    quranBridge: {
      arabic: 'قُلِ انظُرُوا مَاذَا فِي السَّمَاوَاتِ وَالْأَرْضِ',
      transliteration: "Qulun-dhuru madha fis-samawati wal-ard",
      meaning: 'Say: Observe what is in the heavens and the earth.',
      note: 'انظُرُوا (Form I plural imperative: look/observe) — the Quran\'s command to empirical observation.',
    },
  },
  {
    id: 'i70',
    stage: 'intermediate',
    title: 'Intermediate Milestone: Surah Reading Assessment',
    objective: 'Complete an unassisted reading and translation of one full Quran page (20 verses).',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['20-verse independent translation', 'Grammar analysis: 15 structures identified', 'Balaghah device identification: 5 devices found'],
    quranBridge: {
      arabic: 'وَمَا أَرْسَلْنَا مِن قَبْلِكَ إِلَّا رِجَالًا نُّوحِي إِلَيْهِمْ',
      transliteration: "Wama arsalna min qablika illa rijalan noohi ilayhim",
      meaning: 'And We did not send before you any but men to whom We revealed.',
      note: 'نُّوحِي (imperfect used for historical present): divine revelation depicted as perpetually active process.',
    },
  },
  {
    id: 'i71',
    stage: 'intermediate',
    title: 'Surah Hud: Prophetic Stories Intensive',
    objective: 'Read key passages from Surah Hud on the stories of Nuh, Hud, Salih, Ibrahim, Lut, Shuaib.',
    duration: '60 min',
    challengeLevel: 'Advanced',
    drills: ['Story sequence vocabulary per prophet', 'Dialogue structure analysis across stories', 'Translate 10 verses independently'],
    quranBridge: {
      arabic: 'إِنَّ فِي ذَلِكَ لَآيَةً لِّمَنْ خَافَ عَذَابَ الْآخِرَةِ',
      transliteration: "Inna fee dhalika la-ayatan liman khaafa adhabal-aakhira",
      meaning: 'Indeed in that is a sign for one who fears the punishment of the Hereafter.',
      note: 'لَآيَةً — lam of emphasis inside inna sentence: a sign made emphatic by layered grammar.',
    },
  },
  {
    id: 'i72',
    stage: 'intermediate',
    title: 'Surah Yusuf: Emotional Vocabulary',
    objective: 'Read all 111 verses of Surah Yusuf with focus on emotional and narrative vocabulary.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['Full surah vocabulary extraction: 50 words', 'Emotional arc vocabulary mapping', 'Translate 15 key verses'],
    quranBridge: {
      arabic: 'نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ',
      transliteration: 'Nahnu naqussu alayka ahsanal-qasas',
      meaning: 'We relate to you the best of stories.',
      note: 'أَحْسَنَ الْقَصَص — elative adjective in idafa with plural: "the best narrative" — the Quran\'s literary self-praise.',
    },
  },
  {
    id: 'i73',
    stage: 'intermediate',
    title: 'Surah Ibrahim: Ingratitude vs Gratitude',
    objective: 'Read Surah Ibrahim with focus on shukr/kufran contrast and prayer vocabulary.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Shukr/kufran vocabulary contrast', "Ibrahim's prayer analysis (verses 35-41)", 'Translate 10 verses'],
    quranBridge: {
      arabic: 'وَإِذْ تَأَذَّنَ رَبُّكُمْ لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
      transliteration: "Wa-idh ta-adhana rabbukum la-in shakartum la-azeedannakum",
      meaning: 'And when your Lord proclaimed: If you are grateful, I will surely increase you.',
      note: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ — conditional oath with emphatic future: the grammar of divine promise.',
    },
  },
  {
    id: 'i74',
    stage: 'intermediate',
    title: 'Surah an-Nahl: Blessings and Ingratitude',
    objective: 'Read key Surah an-Nahl passages on divine blessings and human ingratitude.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Blessings vocabulary extraction (30 words)', 'Simile identification in surah', 'Translate 10 verses independently'],
    quranBridge: {
      arabic: 'وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا',
      transliteration: "Wa-in tauddu ni-matallaahi la tuhsuha",
      meaning: 'And if you should count the favours of Allah, you could not enumerate them.',
      note: 'لَا تُحْصُوهَا (you cannot count them) — the mathematical impossibility of divine gratitude as a vocabulary lesson.',
    },
  },
  {
    id: 'i75',
    stage: 'intermediate',
    title: 'Surah al-Isra: Children of Adam',
    objective: 'Read key al-Isra passages on human dignity, Night Journey, and the 17 commandments.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['17 commandments vocabulary extraction', 'Human dignity phrases', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'وَلَقَدْ كَرَّمْنَا بَنِي آدَمَ',
      transliteration: "Walaqad karramnaa banii adam",
      meaning: 'And We have certainly honoured the children of Adam.',
      note: 'كَرَّمْنَا (Form II: We honoured/ennobled) — the divine ennobling of humanity is Form II for intensive effect.',
    },
  },
  {
    id: 'i76',
    stage: 'intermediate',
    title: 'Surah al-Kahf: All 4 Stories',
    objective: 'Read and analyse all 4 stories of Surah al-Kahf: Sleepers, Gardens, Musa/Khidr, Dhul-Qarnayn.',
    duration: '120 min',
    challengeLevel: 'Capstone',
    drills: ['Story thematic vocabulary per story', 'Grammar: 10 structures per story', 'Full translation: 20 key verses'],
    quranBridge: {
      arabic: 'إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً',
      transliteration: "Idh awal-fityatu ilal-kahfi faqaalu rabbana atina mil-ladunka rahmatan",
      meaning: 'When the youths took refuge in the cave and said: Our Lord, grant us mercy from yourself.',
      note: 'مِن لَّدُنكَ (from Your Presence) — a special Quranic preposition for direct divine nearness.',
    },
  },
  {
    id: 'i77',
    stage: 'intermediate',
    title: 'Surah Maryam: Birth Narratives',
    objective: 'Read Surah Maryam birth stories (Yahya, Isa) with birth vocabulary and divine miracle grammar.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Birth narrative vocabulary (25 words)', 'Divine speech patterns in surah', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'إِنَّمَا أَنَا رَسُولُ رَبِّكِ لِأَهَبَ لَكِ غُلَامًا زَكِيًّا',
      transliteration: "Innama ana rasulu rabbiki li-ahaba laki ghulaman zakiyya",
      meaning: 'I am only the messenger of your Lord to give you a pure boy.',
      note: 'لِأَهَبَ (purpose lam + subjunctive: in order to give) — Jibreel\'s mission expressed in purpose grammar.',
    },
  },
  {
    id: 'i78',
    stage: 'intermediate',
    title: 'Surah Ta-Ha: Musa Story Intensive',
    objective: 'Read all 135 verses of Surah Ta-Ha with comprehensive grammar and vocabulary analysis.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['Musa story vocabulary: 40 words', 'Grammar: dialogue structures', 'Full translation: 20 key moments'],
    quranBridge: {
      arabic: 'فَاخْلَعْ نَعْلَيْكَ إِنَّكَ بِالْوَادِ الْمُقَدَّسِ طُوًى',
      transliteration: "Fakhlaa naalayk innaka bil-wadil-muqaddasi tuwa",
      meaning: 'So remove your sandals; indeed you are in the sacred valley of Tuwa.',
      note: 'اخْلَعْ (Form I imperative of a hollow verb) + dual object نَعْلَيْكَ — the grammar of sacred ground.',
    },
  },
  {
    id: 'i79',
    stage: 'intermediate',
    title: 'Surah al-Anbiya: All Prophets',
    objective: 'Read Surah al-Anbiya\'s passages on all prophets with shared prophetic vocabulary.',
    duration: '60 min',
    challengeLevel: 'Advanced',
    drills: ['Cross-prophetic shared vocabulary', 'Divine protection grammar patterns', 'Translate 12 verses'],
    quranBridge: {
      arabic: 'وَكُلًّا جَعَلْنَا صَالِحِينَ',
      transliteration: "Wakulla jaalna salihin",
      meaning: 'And all of them We made righteous.',
      note: 'كُلًّا — object fronted for emphasis: ALL the prophets made righteous — the grammar of prophetic solidarity.',
    },
  },
  {
    id: 'i80',
    stage: 'intermediate',
    title: 'Intermediate Milestone: Surah Comparative Study',
    objective: 'Compare the vocabulary and grammar patterns of Surah al-Insan and Surah al-Mutaffifin.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['Side-by-side vocabulary analysis', 'Grammar pattern comparison: 10 structures each', 'Write comparative essay in Arabic'],
    quranBridge: {
      arabic: 'إِنَّ الْأَبْرَارَ يَشْرَبُونَ مِن كَأْسٍ كَانَ مِزَاجُهَا كَافُورًا',
      transliteration: "Innal-abraara yashrabuna min kasin kana mizajuha kafura",
      meaning: 'Indeed, the righteous will drink from a cup whose mixture is camphor.',
      note: 'كَانَ مِزَاجُهَا — descriptive use of kana: كَانَ expresses the nature of the mixture, not past tense.',
    },
  },
  {
    id: 'i81',
    stage: 'intermediate',
    title: 'Surah al-Hajj: Pilgrimage Vocabulary Intensive',
    objective: 'Read key al-Hajj passages with pilgrimage, sacrifice, and monotheism vocabulary.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Hajj vocabulary extraction (30 words)', 'Pilgrimage command structures', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا',
      transliteration: "Wa-adhdhin fin-naasi bil-hajji yaatooka rijala",
      meaning: 'And proclaim to the people the pilgrimage; they will come to you on foot.',
      note: 'يَأْتُوكَ (jussive/response form: they will come) — the command to announce brings the divine response.',
    },
  },
  {
    id: 'i82',
    stage: 'intermediate',
    title: 'Surah al-Muminun: Believers\' Virtues',
    objective: 'Read al-Muminun 1-20 with the seven qualities of successful believers.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['7 qualities vocabulary extraction', 'Relative clause patterns', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ',
      transliteration: "Qad aflahal-muminunal-ladhina hum fi salatihim khashiun",
      meaning: 'Certainly the believers have succeeded — those who in their prayer are humbly submissive.',
      note: 'قَدْ أَفْلَحَ — perfective aspect with qad for completion: the believers\' success declared as an accomplished fact.',
    },
  },
  {
    id: 'i83',
    stage: 'intermediate',
    title: 'Surah an-Nur: Social Ethics Vocabulary',
    objective: 'Read key an-Nur passages on modesty, slander, and social trust vocabulary.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Social ethics vocabulary (30 words)', 'Legal prohibition structures', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',
      transliteration: "Allahu nurus-samawati wal-ard",
      meaning: 'Allah is the Light of the heavens and the earth.',
      note: 'نُور (Light) as khabar mubtada — the divine name Light as a predicate defines the entire cosmos.',
    },
  },
  {
    id: 'i84',
    stage: 'intermediate',
    title: 'Surah al-Furqan: Criterion and Creation',
    objective: 'Read al-Furqan with its descriptions of the servants of Rahman and their qualities.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Ibad ar-Rahman vocabulary', 'Relative clause chains', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'وَعِبَادُ الرَّحْمَنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا',
      transliteration: "Wa-ibaadul-rahmaanil-ladhina yamshuna alal-ardi hawna",
      meaning: 'The servants of the Most Merciful are those who walk upon the earth in humility.',
      note: 'هَوْنًا (adverb of manner: humbly/gently) — a single adverb captures the entire character of the walking believer.',
    },
  },
  {
    id: 'i85',
    stage: 'intermediate',
    title: 'Surah ash-Shuara: Prophets\' Arguments',
    objective: 'Read key prophecy confrontation dialogues in Surah ash-Shu\'ara.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Prophetic argument vocabulary', 'Dialogue pattern identification', 'Translate 10 verse dialogues'],
    quranBridge: {
      arabic: 'قَالَ إِنِّي رَسُولُ رَبِّ الْعَالَمِينَ',
      transliteration: "Qaala inni rasulu rabbil-aalamin",
      meaning: 'He said: I am a messenger of the Lord of all worlds.',
      note: 'رَسُولُ رَبِّ الْعَالَمِين — double idafa: the messenger\'s credential stated through chained possession.',
    },
  },
  {
    id: 'i86',
    stage: 'intermediate',
    title: 'Surah an-Naml: Solomon and the Queen of Sheba',
    objective: 'Read the Sulaiman/Saba story in an-Naml with royal court and diplomatic vocabulary.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Royal court vocabulary (30 words)', 'Sulaiman\'s letter in Arabic (verse 29-31)', 'Translate 12 verses'],
    quranBridge: {
      arabic: 'إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      transliteration: "Innahu min Sulaymana wa-innahu bismil-Lahi r-Rahmani r-Rahim",
      meaning: 'Indeed it is from Solomon, and indeed it is: In the name of Allah, the Most Gracious, the Most Merciful.',
      note: 'The only letter quoted in the Quran: its opening is the Bismillah itself — the grammar of royal humility.',
    },
  },
  {
    id: 'i87',
    stage: 'intermediate',
    title: 'Surah al-Qasas: Musa Narrative Full',
    objective: 'Read Surah al-Qasas\'s comprehensive Musa narrative with its unique social vocabulary.',
    duration: '60 min',
    challengeLevel: 'Advanced',
    drills: ['Musa narrative vocabulary (40 words)', 'Scene-by-scene summary in Arabic', 'Translate 12 verses'],
    quranBridge: {
      arabic: 'وَأَوْحَيْنَا إِلَى أُمِّ مُوسَى أَنْ أَرْضِعِيهِ',
      transliteration: "Wa-awhayna ila ummi musa an ardiihi",
      meaning: 'And We inspired the mother of Musa to suckle him.',
      note: 'أَوْحَيْنَا (Form IV: We revealed) used for a mother, not a prophet — divine guidance is broader than prophethood.',
    },
  },
  {
    id: 'i88',
    stage: 'intermediate',
    title: 'Surah al-Ankabut: Spider Web and Trials',
    objective: 'Read key al-Ankabut passages on trials, the spider simile, and prophetic stories.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Trial vocabulary (25 words)', 'Spider simile analysis', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'مَثَلُ الَّذِينَ اتَّخَذُوا مِن دُونِ اللَّهِ أَوْلِيَاءَ كَمَثَلِ الْعَنكَبُوتِ اتَّخَذَتْ بَيْتًا',
      transliteration: "Mathalul-ladhinal-lattakhadu min dunillahi awliyaa-a kamathalil-ankabuti ittakhadat bayta",
      meaning: 'The example of those who take other than Allah as allies is like that of a spider who takes a home.',
      note: 'كَمَثَلِ الْعَنكَبُوت — the most famous simile in the Quran: spider web as metaphor for false security.',
    },
  },
  {
    id: 'i89',
    stage: 'intermediate',
    title: 'Surah ar-Rum: Byzantine Prophecy and Signs',
    objective: 'Read ar-Rum with its prophecy of Byzantine victory and cosmic signs vocabulary.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Prophecy vocabulary (25 words)', 'Signs vocabulary in surah', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'غُلِبَتِ الرُّومُ فِي أَدْنَى الْأَرْضِ وَهُم مِّن بَعْدِ غَلَبِهِمْ سَيَغْلِبُونَ',
      transliteration: "Ghulibatir-Rumu fi adnal-ardi wahum min badi ghalabihim sayaghlibun",
      meaning: 'The Romans have been defeated in the nearer land. But they, after their defeat, will overcome.',
      note: 'غُلِبَت (passive: were defeated) + سَيَغْلِبُونَ (future: will overcome) — a prophecy in perfect grammar.',
    },
  },
  {
    id: 'i90',
    stage: 'intermediate',
    title: 'Intermediate Major Milestone: Independent Quran Page Mastery',
    objective: 'Read and fully annotate one Quran page with grammar, vocabulary, and balaghah notes.',
    duration: '120 min',
    challengeLevel: 'Capstone',
    drills: ['Full page independent annotation', 'Grammar: 20 structures labelled', 'Balaghah: 5 devices identified', 'Vocabulary: 15 new words recorded'],
    quranBridge: {
      arabic: 'إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ كَانَتْ لَهُمْ جَنَّاتُ الْفِرْدَوْسِ نُزُلًا',
      transliteration: "Innal-ladhina amanu waamilusssalihati kanat lahum jannatul-firdawsi nuzula",
      meaning: 'Indeed those who believed and did righteous deeds — the gardens of Paradise will be for them as accommodation.',
      note: 'جَنَّاتُ الْفِرْدَوْس — Firdaws (from Persian via Arabic): the highest level of Paradise as an idafa.',
    },
  },
  {
    id: 'i91',
    stage: 'intermediate',
    title: 'Surah Luqman: Wisdom Vocabulary',
    objective: 'Read Surah Luqman\'s wisdom teachings with practical life-guidance vocabulary.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Luqman\'s advice vocabulary (25 words)', 'Parent-child command structures', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'يَا بُنَيَّ لَا تُشْرِكْ بِاللَّهِ إِنَّ الشِّرْكَ لَظُلْمٌ عَظِيمٌ',
      transliteration: "Ya bunayya la tushrik billahi innas-shirka ladhulmun azim",
      meaning: 'O my son, do not associate partners with Allah. Indeed shirk is a great injustice.',
      note: 'يَا بُنَيَّ (O my dear son) — diminutive term of endearment: Arabic intimacy expressed through diminution.',
    },
  },
  {
    id: 'i92',
    stage: 'intermediate',
    title: 'Surah as-Sajdah: Creation and Resurrection',
    objective: 'Read Surah as-Sajdah with creation vocabulary and the proof of resurrection.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Creation vocabulary', 'Resurrection proof structures', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'الَّذِي أَحْسَنَ كُلَّ شَيْءٍ خَلَقَهُ وَبَدَأَ خَلْقَ الْإِنسَانِ مِن طِينٍ',
      transliteration: "Alladhee ahsana kulla shayin khalaqahu wabada-a khalqal-insani min teen",
      meaning: 'Who perfected everything which He created and began the creation of man from clay.',
      note: 'أَحْسَنَ (Form IV: He perfected) — the creation of everything made perfect: Form IV for excellence.',
    },
  },
  {
    id: 'i93',
    stage: 'intermediate',
    title: 'Surah al-Ahzab: Community and Marriage Vocabulary',
    objective: 'Read key al-Ahzab passages with community, marriage, and hijaab vocabulary.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Community/marriage vocabulary (30 words)', 'Conditional command structures', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'لَّقَدْ كَانَ لَكُمْ فِي رَسُولِ اللَّهِ أُسْوَةٌ حَسَنَةٌ',
      transliteration: "Laqad kana lakum fi rasulillahi uswatun hasana",
      meaning: 'There has certainly been for you in the Messenger of Allah an excellent pattern of conduct.',
      note: 'أُسْوَة حَسَنَة — noun phrase: أُسْوَة (example/model) + حَسَنَة (beautiful/excellent): the Prophet as the Muslim\'s life template.',
    },
  },
  {
    id: 'i94',
    stage: 'intermediate',
    title: 'Surah Saba: Gratitude and Arrogance',
    objective: 'Read Surah Saba on the people of Saba and the vocabulary of gratitude vs arrogance.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Gratitude/arrogance vocabulary', 'Historical narrative structures', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'اعْمَلُوا آلَ دَاوُودَ شُكْرًا وَقَلِيلٌ مِّنْ عِبَادِيَ الشَّكُورُ',
      transliteration: "Imaloo aala dawooda shukra waqalilun min ibaadiyas-shakur",
      meaning: 'Work, O family of David, in gratitude. But few of My servants are grateful.',
      note: 'شُكْرًا (as an adverb of purpose: in/as gratitude) — work commanded with gratitude as its mode: grammar of thankfulness.',
    },
  },
  {
    id: 'i95',
    stage: 'intermediate',
    title: 'Surah Fatir: Attributes of God',
    objective: 'Read Surah Fatir with its dense vocabulary of divine attributes and creation.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Divine attribute vocabulary (30 words)', 'Creation description grammar', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا النَّاسُ أَنتُمُ الْفُقَرَاءُ إِلَى اللَّهِ وَاللَّهُ هُوَ الْغَنِيُّ الْحَمِيدُ',
      transliteration: "Ya ayyuhas-naasu antumul-fuqaraa-u ilallaahi wallaahu huwal-ghaniyal-hamid",
      meaning: 'O people, you are the ones in need of Allah, and Allah — He is the Self-Sufficient, the Praiseworthy.',
      note: 'الْفُقَرَاء (the needy ones, broken plural of فَقِير) vs الْغَنِيّ (the Self-Sufficient) — tibaq at cosmic scale.',
    },
  },
  {
    id: 'i96',
    stage: 'intermediate',
    title: 'Surah Ya-Sin: Tawhid Proof and Resurrection',
    objective: 'Read all 83 verses of Ya-Sin with eschatological and monotheism vocabulary.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['Resurrection vocabulary extraction (30 words)', 'Three divine proofs vocabulary', 'Translate 15 key verses'],
    quranBridge: {
      arabic: 'أَوَلَمْ يَرَ الْإِنسَانُ أَنَّا خَلَقْنَاهُ مِن نُّطْفَةٍ فَإِذَا هُوَ خَصِيمٌ مُّبِينٌ',
      transliteration: "Awa-lam yaral-insanu anna khalaqnahu min nutfatin fa-idha huwa khasiimun mubin",
      meaning: 'Does man not consider that We created him from a mere drop — yet he becomes an open disputer?',
      note: 'فَإِذَا (and suddenly/yet look) — the drama of the argument: creation from drop → arrogant disputer.',
    },
  },
  {
    id: 'i97',
    stage: 'intermediate',
    title: 'Surah as-Saffat: Prophet Stories and Heavenly Host',
    objective: 'Read key as-Saffat passages on the heavenly assembly and prophetic stories.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Heavenly vocabulary (25 words)', 'Prophet story vocabulary', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'وَسَلَامٌ عَلَى الْمُرْسَلِينَ',
      transliteration: "Wasalamun alal-mursalin",
      meaning: 'And peace be upon the messengers.',
      note: 'وَسَلَامٌ (indefinite: peace/honour) — salutation as an indefinite noun retains its comprehensive scope.',
    },
  },
  {
    id: 'i98',
    stage: 'intermediate',
    title: 'Surah Sad: David, Solomon, Job',
    objective: 'Read Surah Sad\'s stories of Dawud, Sulaiman, and Ayyub with their specific vocabulary.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Story-specific vocabulary per prophet', 'Repentance grammar structures', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'وَأَيُّوبَ إِذْ نَادَى رَبَّهُ أَنِّي مَسَّنِيَ الضُّرُّ وَأَنتَ أَرْحَمُ الرَّاحِمِينَ',
      transliteration: "Wa-ayyuba idh nada rabbahu anni massaniyadh-dhurru waanta arhamur-rahimin",
      meaning: 'And Ayyub, when he called to his Lord: Indeed adversity has touched me and You are the Most Merciful.',
      note: 'أَرْحَمُ الرَّاحِمِين — elative of mercy in idafa with the plural of the same root: the most mercy-filled of all the merciful.',
    },
  },
  {
    id: 'i99',
    stage: 'intermediate',
    title: 'Surah az-Zumar: Tawbah and Divine Forgiveness',
    objective: 'Read az-Zumar passages on repentance, guidance, and the scale of divine mercy.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Tawbah vocabulary (25 words)', 'Scale comparison grammar', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَى أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
      transliteration: "Qul ya ibaadiyal-ladhina asrafu ala anfusihim la taqnatu mir-rahmatillah",
      meaning: 'Say: O My servants who have transgressed against themselves, do not despair of the mercy of Allah.',
      note: 'لَا تَقْنَطُوا (prohibition: do not despair) — the most hope-giving prohibition in the Quran, addressed to the worst sinners.',
    },
  },
  {
    id: 'i100',
    stage: 'intermediate',
    title: 'Intermediate Century Milestone: Full Independent Reading',
    objective: 'Complete a full juz reading with vocabulary logging, grammar notes, and summarisation.',
    duration: '180 min',
    challengeLevel: 'Capstone',
    drills: ['One full juz reading', 'Vocabulary log: 50 new words', 'Summary write-up: 200 words in Arabic'],
    quranBridge: {
      arabic: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
      transliteration: "Wanunazzilu minal-qurani ma huwa shifa-un warahmatun lil-muminin",
      meaning: 'And We send down of the Quran that which is healing and mercy for the believers.',
      note: 'شِفَاء وَرَحْمَة — the Quran described as two nouns in apposition: the 100th intermediate lesson earned.',
    },
  },
  {
    id: 'i101',
    stage: 'intermediate',
    title: 'Surah Ghafir: Divine Forgiveness and Arrogance',
    objective: 'Read Ghafir with its vocabulary of forgiveness, arrogance, and divine patience.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Forgiveness vocabulary (25 words)', 'Arrogance vocabulary (20 words)', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'غَافِرِ الذَّنبِ وَقَابِلِ التَّوْبِ شَدِيدِ الْعِقَابِ',
      transliteration: "Ghafirith-dhanbi waqabilit-tawbi shadeedil-iqab",
      meaning: 'Forgiver of sin, acceptor of repentance, severe in punishment.',
      note: 'Three divine attributes in genitive apposition: each an active participle or hyperbolic form as description.',
    },
  },
  {
    id: 'i102',
    stage: 'intermediate',
    title: 'Surah Fussilat: Signs in the Universe',
    objective: 'Read Fussilat passages on cosmic signs and the vocabulary of rejection.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Cosmic signs vocabulary (25 words)', 'Divine signs grammar structures', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'سَنُرِيهِمْ آيَاتِنَا فِي الْآفَاقِ وَفِي أَنفُسِهِمْ',
      transliteration: "Sanureehim ayatina fil-aafaqi wafee anfusihim",
      meaning: 'We will show them Our signs in the horizons and within themselves.',
      note: 'فِي الْآفَاق وَفِي أَنفُسِهِم — external universe and internal self: the two domains of divine signs.',
    },
  },
  {
    id: 'i103',
    stage: 'intermediate',
    title: 'Surah ash-Shura: Community and Consultation',
    objective: 'Read ash-Shura with its vocabulary of shura (consultation), community, and mercy.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Shura vocabulary (20 words)', 'Community obligation grammar', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'وَأَمْرُهُمْ شُورَى بَيْنَهُمْ',
      transliteration: "Wa-amruhum shuura baynahum",
      meaning: 'And their affairs are a matter of consultation among them.',
      note: 'شُورَى (masdar: consultation/shura) — the Islamic democratic principle in a 4-word nominal sentence.',
    },
  },
  {
    id: 'i104',
    stage: 'intermediate',
    title: 'Surah az-Zukhruf: Worldly Ornament vs True Wealth',
    objective: 'Read az-Zukhruf with vocabulary of false adornment vs divine truth.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Ornament/illusion vocabulary (25 words)', 'Contrast structure identification', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'زُخْرُفَ الْقَوْلِ غُرُورًا',
      transliteration: "Zukhruful-qawli ghurura",
      meaning: 'Ornamental speech as delusion.',
      note: 'زُخْرُف (ornament/gilded) + غُرُور (delusion) — the vocabulary of spiritual deception made compound.',
    },
  },
  {
    id: 'i105',
    stage: 'intermediate',
    title: 'Surah ad-Dukhan: The Smoke and Day of Decision',
    objective: 'Read ad-Dukhan with eschatological vocabulary of smoke, day of decision, and warning.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Eschatological vocabulary (25 words)', 'Warning structure grammar', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'فَارْتَقِبْ يَوْمَ تَأْتِي السَّمَاءُ بِدُخَانٍ مُّبِينٍ',
      transliteration: "Fartaqib yawma tatis-samau bidukhaanim mubin",
      meaning: 'Then watch for the day the sky will bring evident smoke.',
      note: 'دُخَان مُّبِين (evident smoke) — one of the 10 major signs of the hour described with grammatical precision.',
    },
  },
  {
    id: 'i106',
    stage: 'intermediate',
    title: 'Surah al-Jathiyah: Arrogance and Signs',
    objective: 'Read al-Jathiyah with vocabulary of cosmic signs and the Day of Kneeling.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Signs vocabulary (25 words)', 'Day of Kneeling grammar', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'وَتَرَى كُلَّ أُمَّةٍ جَاثِيَةً',
      transliteration: "Watara kulla ummatin jathiyatan",
      meaning: 'And you will see every nation kneeling.',
      note: 'جَاثِيَة (active participle of Form I: kneeling/prostrating) — the visual image of Judgment Day in one participial adjective.',
    },
  },
  {
    id: 'i107',
    stage: 'intermediate',
    title: 'Surah al-Ahqaf: The Quran as Witness',
    objective: 'Read al-Ahqaf passages with vocabulary of witness, previous books, and community.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Witness vocabulary (20 words)', 'Previous scripture comparison grammar', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'أَرَأَيْتُمْ مَّا تَدْعُونَ مِن دُونِ اللَّهِ أَرُونِي مَاذَا خَلَقُوا مِنَ الْأَرْضِ',
      transliteration: "Araytum ma tadona min dunillahi aruni madha khalaqoo minal-ard",
      meaning: 'Tell me: what is it that you call upon other than Allah? Show me what have they created of the earth.',
      note: 'أَرُونِي (Form I plural imperative of رَأَى: show me) — the Quran\'s challenge to polytheism uses a perception verb.',
    },
  },
  {
    id: 'i108',
    stage: 'intermediate',
    title: 'Surah Muhammad: Jihad and Reward',
    objective: 'Read Surah Muhammad with its vocabulary of effort, struggle, and divine reward.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Effort/reward vocabulary (25 words)', 'Condition-consequence structures', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'إِن تَنصُرُوا اللَّهَ يَنصُرْكُمْ وَيُثَبِّتْ أَقْدَامَكُمْ',
      transliteration: "In tansurullaaha yansur-kum wayuthabbit aqdaamakum",
      meaning: 'If you support Allah, He will support you and plant your feet firmly.',
      note: 'يُثَبِّت (Form II: make firm, stabilise) — the divine reward expressed in jussive conditional: full commitment guarantees grounding.',
    },
  },
  {
    id: 'i109',
    stage: 'intermediate',
    title: 'Surah al-Fath: Victory Grammar',
    objective: 'Read Surah al-Fath with vocabulary of treaty, victory, and the Ridwan pledge.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Victory vocabulary (25 words)', 'Treaty and pledge grammar', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا',
      transliteration: "Innaa fatahnaa laka fathan mubina",
      meaning: 'Indeed We have given you a clear conquest.',
      note: 'فَتَحْنَا فَتْحًا (cognate accusative: We opened an opening) — the inner meaning of fath as spiritual breakthrough.',
    },
  },
  {
    id: 'i110',
    stage: 'intermediate',
    title: 'Intermediate Milestone: Surah al-Fath Full Analysis',
    objective: 'Complete full independent analysis of all 29 verses of Surah al-Fath.',
    duration: '120 min',
    challengeLevel: 'Capstone',
    drills: ['Full annotation without reference', 'Grammar: 20 structures labelled', 'Historical context vocabulary: 30 words'],
    quranBridge: {
      arabic: 'مُّحَمَّدٌ رَّسُولُ اللَّهِ وَالَّذِينَ مَعَهُ أَشِدَّاءُ عَلَى الْكُفَّارِ رُحَمَاءُ بَيْنَهُمْ',
      transliteration: "Muhammadur-rasulullahi wal-ladhina maahu ashiddau alal-kuffari ruhamau baynahum",
      meaning: 'Muhammad is the Messenger of Allah; and those with him are forceful against the disbelievers, merciful among themselves.',
      note: 'أَشِدَّاء (broken plural of شَدِيد: intense) vs رُحَمَاء (broken plural of رَحِيم) — the believers\' dual character in tibaq.',
    },
  },
  {
    id: 'i111',
    stage: 'intermediate',
    title: 'Surah al-Hujurat: Social Etiquette in Arabic',
    objective: 'Read Surah al-Hujurat with community ethics: backbiting, spying, mockery vocabulary.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Social ethics vocabulary (25 words)', 'Prohibition structures', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اجْتَنِبُوا كَثِيرًا مِّنَ الظَّنِّ إِنَّ بَعْضَ الظَّنِّ إِثْمٌ',
      transliteration: "Ya ayyuhalladhina amanu-jtanibu kathiram minadh-dhanni inna badhadh-dhanni ithm",
      meaning: 'O believers, avoid much suspicion, for indeed some suspicion is sin.',
      note: 'كَثِيرًا مِّنَ (much of — partitive) — the Quran distinguishes: not ALL suspicion is forbidden, but MUCH of it.',
    },
  },
  {
    id: 'i112',
    stage: 'intermediate',
    title: 'Surah Qaf: Proximity of Death and Resurrection',
    objective: 'Read Surah Qaf with its vocabulary of death, resurrection, and the nearness of God.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Death/resurrection vocabulary (25 words)', 'Recording-angel grammar', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ',
      transliteration: "Wanahnu aqrabu ilayhi min hablil-warid",
      meaning: 'And We are nearer to him than his jugular vein.',
      note: 'أَقْرَبُ (elative: nearer) + مِنْ (comparison particle) — divine proximity expressed through the elative degree.',
    },
  },
  {
    id: 'i113',
    stage: 'intermediate',
    title: 'Surah adh-Dhariyat: The Scattering Winds',
    objective: 'Read Surah adh-Dhariyat with cosmic oaths and prophetic stories vocabulary.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Cosmic phenomena vocabulary (20 words)', 'Prophet story vocabulary', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ',
      transliteration: "Wafil-ardi ayatun lil-mooqinin wafi anfusikum afala tubsirun",
      meaning: 'And in the earth are signs for those who are certain — and in yourselves. Will you not see?',
      note: 'لِلْمُوقِنِين (for those certain) — the signs are available for all but visible only to those who have achieved certainty.',
    },
  },
  {
    id: 'i114',
    stage: 'intermediate',
    title: 'Surah at-Tur: The Mountain Oath',
    objective: 'Read Surah at-Tur with its five oaths, Paradise descriptions, and divine company.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Oath vocabulary and grammar', 'Paradise description vocabulary', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'وَالطُّورِ وَكِتَابٍ مَّسْطُورٍ فِي رَقٍّ مَّنشُورٍ',
      transliteration: "Wattouri wakitabim mastoorin fi raqqim manshur",
      meaning: 'By the Mount, and a Book recorded in an unrolled parchment.',
      note: 'مَسْطُور (passive participle: written/lined) + مَنشُور (passive participle: spread open) — the oath takes a divine register as its object.',
    },
  },
  {
    id: 'i115',
    stage: 'intermediate',
    title: 'Surah an-Najm: Revelation and the Prophet\'s Vision',
    objective: 'Read Surah an-Najm with vocabulary of divine revelation and the Prophet\'s night journey.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Revelation vocabulary (25 words)', 'Sidr al-Muntaha vocabulary', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'إِنْ هُوَ إِلَّا وَحْيٌ يُوحَى',
      transliteration: "In huwa illa wahyun yuha",
      meaning: 'It is not but a revelation revealed.',
      note: 'وَحْيٌ يُوحَى — cognate passive: revelation described through its own passive form for complete authenticity.',
    },
  },
  {
    id: 'i116',
    stage: 'intermediate',
    title: 'Surah al-Qamar: The Split Moon',
    objective: 'Read Surah al-Qamar with its repeated refrain and historical community warnings.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Historical warning vocabulary (25 words)', 'Refrain analysis: 4 repetitions', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
      transliteration: "Walaqad yassarnal-qurana lidh-dhikri fahal mim muddakir",
      meaning: 'And We have certainly made the Quran easy to remember. So is there any who will remember?',
      note: 'مُدَّكِر (Form VIII active participle from ذَكَرَ) — one who has taken the remembrance to heart.',
    },
  },
  {
    id: 'i117',
    stage: 'intermediate',
    title: 'Surah ar-Rahman: All 78 Verses',
    objective: 'Read every verse of Surah ar-Rahman with the famous refrain and blessings vocabulary.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['All blessings vocabulary (40 words)', 'Refrain grammatical analysis', 'Translate full surah independently'],
    quranBridge: {
      arabic: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
      transliteration: "Fabi-ayyi alaa-i rabbikuma tukadhdhiban",
      meaning: 'So which of the favors of your Lord will you both deny?',
      note: 'تُكَذِّبَانِ (Form II dual present: you two deny) — the dual address to jinn and humans: a grammatical miracle of inclusion.',
    },
  },
  {
    id: 'i118',
    stage: 'intermediate',
    title: 'Surah al-Waqi\'ah: The Three Groups Grammar',
    objective: 'Read and analyse Surah al-Waqi\'ah\'s three-group division and Paradise/Hell language.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['3 groups vocabulary distinction', 'Waqia vocabulary', 'Translate 12 verses'],
    quranBridge: {
      arabic: 'وَكُنتُمْ أَزْوَاجًا ثَلَاثَةً فَأَصْحَابُ الْمَيْمَنَةِ',
      transliteration: "Wakuntum azwajan thalathatan fa-ashhabul-maymanati",
      meaning: 'And you will be three groups. Then the companions of the right...',
      note: 'أَزْوَاج (pairs/kinds, broken plural of زَوْج) — humanity becomes a plural noun of categories on the Day.',
    },
  },
  {
    id: 'i119',
    stage: 'intermediate',
    title: 'Surah al-Hadid: Light and Hypocrite Grammar',
    objective: 'Read al-Hadid with its light metaphors, hypocrite vocabulary, and charity encouragement.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Light metaphor vocabulary (25 words)', 'Hypocrite vocabulary', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'يَوْمَ يَقُولُ الْمُنَافِقُونَ وَالْمُنَافِقَاتُ لِلَّذِينَ آمَنُوا انظُرُونَا نَقْتَبِسْ مِن نُّورِكُمْ',
      transliteration: "Yawma yaqulul-munafiquna wal-munafiqatu lil-ladhina amanu undhuruna naqtabis min nurikum",
      meaning: 'The day the hypocrites will say to those who believed: Wait for us so that we may borrow from your light.',
      note: 'نَقْتَبِسْ min نُورِكُمْ (we borrow from your light) — the grammar of trying to inherit spiritual merit not earned.',
    },
  },
  {
    id: 'i120',
    stage: 'intermediate',
    title: 'Intermediate Milestone: Surah al-Hadid Complete',
    objective: 'Complete full analysis of Surah al-Hadid (29 verses) without reference material.',
    duration: '120 min',
    challengeLevel: 'Capstone',
    drills: ['Full annotation: all 29 verses', 'Grammar: 20 structures labelled', 'Write reflection in 150 Arabic words'],
    quranBridge: {
      arabic: 'أَلَمْ يَأْنِ لِلَّذِينَ آمَنُوا أَن تَخْشَعَ قُلُوبُهُمْ لِذِكْرِ اللَّهِ',
      transliteration: "Alam yani lil-ladheena amanu an takhshaa quloobuhum lidhikrillah",
      meaning: 'Has the time not come for those who have believed that their hearts should submit to the remembrance of Allah?',
      note: 'أَلَمْ يَأْنِ (has it not arrived/come time?) — the spiritual alarm clock of the Quran in a single defective verb.',
    },
  },
  {
    id: 'i121',
    stage: 'intermediate',
    title: 'Surah al-Mujadila: Social Conflict Vocabulary',
    objective: 'Read al-Mujadila with vocabulary of legal dispute, assembly, and divine knowledge.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Legal dispute vocabulary (20 words)', 'Assembly rules grammar', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا قِيلَ لَكُمْ تَفَسَّحُوا فِي الْمَجَالِسِ فَافْسَحُوا',
      transliteration: "Ya ayyuhalladhina amanu idha qeela lakum tafassahu fil-majaalisi fafsahu",
      meaning: 'O believers, when it is said to you: Make room in the assemblies, make room.',
      note: 'تَفَسَّحُوا (Form V imperative: spread out/make room) — social etiquette as a divine command.',
    },
  },
  {
    id: 'i122',
    stage: 'intermediate',
    title: 'Surah al-Hashr: Lessons from Expulsion',
    objective: 'Read al-Hashr with vocabulary of expulsion, hypocrisy, and the closing divine names.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Expulsion/trial vocabulary (25 words)', 'Divine names analysis (last 3 verses)', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ وَعَلَى اللَّهِ فَلْيَتَوَكَّلِ الْمُؤْمِنُونَ',
      transliteration: "Allahu la ilaha illaa huwa wa-alallahi falyatawakkalil-muminun",
      meaning: 'Allah — there is no god but Him. And upon Allah let the believers rely.',
      note: 'فَلْيَتَوَكَّلِ (lam imperative of Form V: let them rely) — the grammar of divine delegation as a command.',
    },
  },
  {
    id: 'i123',
    stage: 'intermediate',
    title: 'Surah al-Mumtahana: Loyalty and Friendship',
    objective: 'Read al-Mumtahana with vocabulary of loyalty, alliance, and the test of faith.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Loyalty vocabulary (20 words)', 'Conditional alliance structures', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'لَا يَنْهَاكُمُ اللَّهُ عَنِ الَّذِينَ لَمْ يُقَاتِلُوكُمْ فِي الدِّينِ',
      transliteration: "La yanhakumullaahu anil-ladhina lam yuqatilukum fid-deeni",
      meaning: 'Allah does not forbid you from those who did not fight you over religion...',
      note: 'لَا يَنْهَاكُم + عَن — the negative command with a preposition: the Quran\'s nuanced rules of peaceful coexistence.',
    },
  },
  {
    id: 'i124',
    stage: 'intermediate',
    title: 'Surah as-Saff: The Solid Rank',
    objective: 'Read as-Saff with military and da\'wah vocabulary and the grammar of the Quran\'s self-defence.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Military/solidarity vocabulary (20 words)', 'Da\'wah as trade vocabulary', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ يُحِبُّ الَّذِينَ يُقَاتِلُونَ فِي سَبِيلِهِ صَفًّا كَأَنَّهُم بُنيَانٌ مَّرْصُوصٌ',
      transliteration: "Innal-laaha yuhibbul-ladhina yuqatiluna fi sabilihi saffan kaannahum bunyaanum marsus",
      meaning: 'Indeed Allah loves those who fight in His cause in a row as if they are a solid structure.',
      note: 'بُنْيَان مَّرْصُوص (solid/lead-poured structure) — the army as architectural metaphor: active participle describing cemented unity.',
    },
  },
  {
    id: 'i125',
    stage: 'intermediate',
    title: 'Surah al-Jumu\'ah: Friday Imperative',
    objective: 'Read Surah al-Jumu\'ah with jumu\'ah, da\'wa, and business abandonment vocabulary.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['Jumu\'ah vocabulary (20 words)', 'Shopping/business vocabulary', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'فَإِذَا قُضِيَتِ الصَّلَاةُ فَانتَشِرُوا فِي الْأَرْضِ وَابْتَغُوا مِن فَضْلِ اللَّهِ',
      transliteration: "Fa-idha qudiyas-salatu fantashiru fil-ardi wabtagu min fadlillah",
      meaning: 'And when the prayer is concluded, spread through the land and seek of the bounty of Allah.',
      note: 'فَانتَشِرُوا (Form VIII imperative: spread out!) + اِبْتَغُوا (Form VIII imperative: seek!) — halal pursuit of provision as divine command.',
    },
  },
  {
    id: 'i126',
    stage: 'intermediate',
    title: 'Surah al-Munafiqun: Hypocrisy Vocabulary',
    objective: 'Read al-Munafiqun with vocabulary of hypocrisy, false speech, and community harm.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['Hypocrisy vocabulary (20 words)', 'False speech grammar structures', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'وَإِذَا رَأَيْتَهُمْ تُعْجِبُكَ أَجْسَامُهُمْ وَإِن يَقُولُوا تَسْمَعْ لِقَوْلِهِمْ',
      transliteration: "Wa-idha raaytahum tujibu ka ajsaamuhum wa-in yaqulu tasmaa liqawlihim",
      meaning: 'And when you see them, their forms please you; and if they speak, you listen to their speech.',
      note: 'تُعْجِبُ (Form IV: it amazes/pleases) — appearance impresses but content deceives: the grammar of hypocrisy\'s mask.',
    },
  },
  {
    id: 'i127',
    stage: 'intermediate',
    title: 'Surah at-Taghabun: The Mutual Loss and Gain',
    objective: 'Read at-Taghabun with eschatological loss/gain vocabulary and family trial vocabulary.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['Loss/gain vocabulary (20 words)', 'Family trial grammar', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِنَّ مِنْ أَزْوَاجِكُمْ وَأَوْلَادِكُمْ عَدُوًّا لَّكُمْ',
      transliteration: "Ya ayyuhalladhina amanu inna min azwajikum wa-awladikum aduwwan lakum",
      meaning: 'O believers, among your spouses and children are enemies to you, so beware of them.',
      note: 'مِنْ أَزْوَاجِكُمْ (from/among your spouses) — partitive min: not all spouses, but some carry the enemy role.',
    },
  },
  {
    id: 'i128',
    stage: 'intermediate',
    title: 'Surah at-Talaq: Divorce and Trust in Allah',
    objective: 'Read at-Talaq with legal vocabulary of divorce, waiting periods, and divine support.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Divorce law vocabulary (25 words)', 'Conditional legal grammar', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
      transliteration: "Waman yatawakkal alallahi fahuwa hasbuh",
      meaning: 'And whoever relies upon Allah — then He is sufficient for him.',
      note: 'يَتَوَكَّلْ (Form V jussive) — the conditional clause triggers jussive mood in the verb: grammar of total reliance.',
    },
  },
  {
    id: 'i129',
    stage: 'intermediate',
    title: 'Surah at-Tahrim: Repentance and Household',
    objective: 'Read at-Tahrim with household relationship vocabulary and nasr min Allah.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['Household ethics vocabulary (20 words)', 'Tawbah nasuha grammar', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا تُوبُوا إِلَى اللَّهِ تَوْبَةً نَّصُوحًا',
      transliteration: "Ya ayyuhalladhina amanu tubu ilallahi tawbatan nasuha",
      meaning: 'O believers, repent to Allah with sincere repentance.',
      note: 'تَوْبَةً نَّصُوحًا (sincere tawbah) — cognate accusative tawbah + adjective nasuha: repentance that is pure advice to the self.',
    },
  },
  {
    id: 'i130',
    stage: 'intermediate',
    title: 'Intermediate Milestone: Shorter Surahs Mastery Test',
    objective: 'Complete an unassisted translation test for 10 shorter surahs (60-70 verses total).',
    duration: '120 min',
    challengeLevel: 'Capstone',
    drills: ['10 surah translation without help', 'Grammar: 30 structures total', 'Vocabulary: 40 words logged'],
    quranBridge: {
      arabic: 'سُبْحَانَ رَبِّكَ رَبِّ الْعِزَّةِ عَمَّا يَصِفُونَ وَسَلَامٌ عَلَى الْمُرْسَلِينَ',
      transliteration: "Subhana rabbika rabbil-izzati amma yasifun wasalamun alal-mursalin",
      meaning: 'Exalted is your Lord, the Lord of Honour, above what they describe. And peace upon the messengers.',
      note: 'رَبِّ الْعِزَّةِ (Lord of Honour in double idafa) — the milestone verse: glory to the Lord of transcendent honour.',
    },
  },
  {
    id: 'i131',
    stage: 'intermediate',
    title: 'Surah al-Mulk: Full Advanced Analysis',
    objective: 'Complete full advanced analysis of Surah al-Mulk: all grammar, vocabulary, and balaghah.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['Full grammar annotation: 30 structures', 'Balaghah: 10 devices identified', 'Write surah summary in 200 Arabic words'],
    quranBridge: {
      arabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا',
      transliteration: "Alladhee khalaqal-mawta wal-hayaata liyabluwakum ayyukum ahsanu amala",
      meaning: 'Who created death and life to test which of you is best in deed.',
      note: 'أَيُّكُمْ أَحْسَنُ عَمَلًا — indirect question as object of the test: the purpose clause\'s embedded grammar.',
    },
  },
  {
    id: 'i132',
    stage: 'intermediate',
    title: 'Surah al-Qalam: The Pen and Character',
    objective: 'Read Surah al-Qalam with vocabulary of character, moral accusation, and divine protection.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Character vocabulary (25 words)', 'Oath and counter-claim grammar', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'ن وَالْقَلَمِ وَمَا يَسْطُرُونَ',
      transliteration: "Nun. Walqalami wama yasturun.",
      meaning: 'Nun. By the pen and what they write.',
      note: 'يَسْطُرُون (Form I plural: they write/line) — the divine oath by the pen elevates writing to cosmic significance.',
    },
  },
  {
    id: 'i133',
    stage: 'intermediate',
    title: 'Surah al-Haqqah: The Inevitable',
    objective: 'Read Surah al-Haqqah with eschatological vocabulary and the Quran\'s defence of itself.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Eschatological vocabulary (25 words)', 'Self-authentication grammar', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'إِنَّهُ لَقَوْلُ رَسُولٍ كَرِيمٍ وَمَا هُوَ بِقَوْلِ شَاعِرٍ',
      transliteration: "Innahu laqawlu rasulin karimin wama huwa biqawli shaair",
      meaning: 'Indeed it is the word of a noble messenger, and it is not the word of a poet.',
      note: 'لَقَوْل (lam of emphasis inside inna) + the ba of negation (نَفْي): double grammatical affirmation of the Quran\'s source.',
    },
  },
  {
    id: 'i134',
    stage: 'intermediate',
    title: 'Surah al-Ma\'arij: Patience and the Ascending Ways',
    objective: 'Read al-Ma\'arij with patience vocabulary and descriptions of believers vs disbelievers.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Patience vocabulary (20 words)', 'Believers\' exception grammar (illa)', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'إِنَّ الْإِنسَانَ خُلِقَ هَلُوعًا',
      transliteration: "Innal-insana khuliqa halooa",
      meaning: 'Indeed man was created anxious/greedy.',
      note: 'هَلُوع (hyperbolic active participle: extremely anxious/greedy) — the Form فَعُول expresses intensity of character.',
    },
  },
  {
    id: 'i135',
    stage: 'intermediate',
    title: 'Surah Nuh: The Call to a People',
    objective: 'Read Surah Nuh with its vocabulary of da\'wah, rejection, and divine punishment.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Da\'wah vocabulary (20 words)', 'Rejection grammar', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'قَالَ رَبِّ إِنِّي دَعَوْتُ قَوْمِي لَيْلًا وَنَهَارًا',
      transliteration: "Qaala rabbi inni daawtu qawmi laylan wa-nahara",
      meaning: 'He said: My Lord, I called my people night and day.',
      note: 'لَيْلًا وَنَهَارًا (night and day — temporal adverbs) — Nuh\'s tireless da\'wah compressed into two adverbs.',
    },
  },
  {
    id: 'i136',
    stage: 'intermediate',
    title: 'Surah al-Jinn: Jinn Acknowledge the Quran',
    objective: 'Read Surah al-Jinn with its unique vocabulary of jinn experience and tawhid.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Jinn vocabulary (20 words)', 'First-person testimony grammar', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'قُلْ أُوحِيَ إِلَيَّ أَنَّهُ اسْتَمَعَ نَفَرٌ مِّنَ الْجِنِّ',
      transliteration: "Qul oohi ilayya annahu istamaa nafarun minal-jinn",
      meaning: 'Say: It has been revealed to me that a group of jinn listened.',
      note: 'أُوحِيَ إِلَيَّ (it was revealed to me — passive Form IV) + أَنَّ clause: the speech of jinn reported through revelation.',
    },
  },
  {
    id: 'i137',
    stage: 'intermediate',
    title: 'Surah al-Muzammil: Night Prayer Grammar',
    objective: 'Read al-Muzammil with its night prayer vocabulary and Quran recitation instructions.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Night prayer vocabulary (20 words)', 'Command structure analysis', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'قُمِ اللَّيْلَ إِلَّا قَلِيلًا نِّصْفَهُ أَوِ انقُصْ مِنْهُ قَلِيلًا',
      transliteration: "Qumil-layla illa qalilan nisfahoo awiqnus minhu qalila",
      meaning: 'Stand the night except a little — half of it or a little less.',
      note: 'إِلَّا قَلِيلًا (except a little) — exception from a whole with quantified exceptions: the grammar of measured worship.',
    },
  },
  {
    id: 'i138',
    stage: 'intermediate',
    title: 'Surah al-Muddaththir: The Warning Mission',
    objective: 'Read al-Muddaththir with its urgent mission vocabulary and warning grammar.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Warning vocabulary (20 words)', 'Sequential command grammar', 'Translate 8 verses'],
    quranBridge: {
      arabic: 'قُمْ فَأَنذِرْ وَرَبَّكَ فَكَبِّرْ وَثِيَابَكَ فَطَهِّرْ',
      transliteration: "Qum fa-andhir. Warabbaka fakabbir. Wathiyabaka fattahir.",
      meaning: 'Arise and warn! And your Lord glorify! And your garments purify!',
      note: 'قُمْ … فَأَنذِرْ — three imperative commands: each object fronted (mudaththir) before its verb for emphatic focus.',
    },
  },
  {
    id: 'i139',
    stage: 'intermediate',
    title: 'Surah al-Qiyamah Deep Study',
    objective: 'Complete deep analysis of Surah al-Qiyamah: resurrection, soul, and final moments.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Resurrection grammar structures', 'Soul/death vocabulary (25 words)', 'Translate 10 verses'],
    quranBridge: {
      arabic: 'وَالْتَفَّتِ السَّاقُ بِالسَّاقِ إِلَى رَبِّكَ يَوْمَئِذٍ الْمَسَاقُ',
      transliteration: "Waltaffatis-saqu bis-saaqi ila rabbika yawmaydhinil-masaq",
      meaning: 'And the leg is wrapped with the leg — to your Lord that day is the driving.',
      note: 'الْتَفَّت (Form VIII: wrapped together) — the death imagery of legs wrapping is a kinayah for the soul\'s departure.',
    },
  },
  {
    id: 'i140',
    stage: 'intermediate',
    title: 'Intermediate Milestone: Half-Way Assessment',
    objective: 'Complete intermediate half-way assessment: 200-word vocabulary, 30 grammar structures, 2 surah translations.',
    duration: '120 min',
    challengeLevel: 'Capstone',
    drills: ['200-word vocabulary test', '30 grammar structure identification in text', '2 surah complete translation without help'],
    quranBridge: {
      arabic: 'وَمَن يُطِعِ اللَّهَ وَالرَّسُولَ فَأُولَئِكَ مَعَ الَّذِينَ أَنْعَمَ اللَّهُ عَلَيْهِمْ',
      transliteration: "Waman yutii Allaha war-rasoola fa-ulaika maallaadhina an-amallaahu alayhim",
      meaning: 'And whoever obeys Allah and the Messenger — those will be with the ones upon whom Allah has bestowed favour.',
      note: 'مَعَ الَّذِينَ أَنْعَمَ (with those upon whom favour has been given) — the grammar of divine companionship as the highest reward.',
    },
  },
  {
    id: 'i141',
    stage: 'intermediate',
    title: 'Classical Arabic Poetry: Al-Mutanabbi',
    objective: 'Read 10 verses of al-Mutanabbi poetry with vocabulary and metrical analysis.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Poetry vocabulary (25 words)', 'Identify grammatical structures unique to poetry', 'Translate 5 verses'],
    quranBridge: {
      arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
      transliteration: "Waman yattaqillaha yajal lahu makhrajaa wa-yarzuqhu min hayth la yahtasib",
      meaning: 'And whoever fears Allah — He will make for him a way out and provide for him from where he does not expect.',
      note: 'مِنْ حَيْثُ لَا يَحْتَسِب — from where he does not calculate: divine provision from the unexpected direction.',
    },
  },
  {
    id: 'i142',
    stage: 'intermediate',
    title: 'Classical Arabic Poetry: Imam Shafi\'i',
    objective: 'Read 10 famous Imam Shafi\'i verses on knowledge, patience, and travel.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Imam Shafi\'i poetry vocabulary', 'Grammar of poetic structures', 'Translate 5 verses'],
    quranBridge: {
      arabic: 'وَفِي كُلِّ شَيْءٍ لَهُ آيَةٌ تَدُلُّ عَلَى أَنَّهُ وَاحِدٌ',
      transliteration: "Wafi kulli shay-in lahu ayatun tadullu ala annahu wahid",
      meaning: 'And in everything there is a sign for Him that points to His oneness.',
      note: 'تَدُلُّ عَلَى أَنَّ (it points to the fact that) — evidence clause as subject relative: the grammar of natural theology.',
    },
  },
  {
    id: 'i143',
    stage: 'intermediate',
    title: 'Arabic Linguistic Terms: Grammar Vocabulary',
    objective: 'Master 40 classical Arabic grammar terms (fa\'il, mafool, khabar, mubtada, etc.).',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['40 grammar term flashcards', 'Apply terms to 20 Quran sentences', 'Build your own Arabic grammar glossary'],
    quranBridge: {
      arabic: 'الرَّحْمَنُ عَلَى الْعَرْشِ اسْتَوَى',
      transliteration: "Ar-rahmanu alal-arshi stawaa",
      meaning: 'The Most Merciful is above the Throne, established.',
      note: 'مبتدأ (ar-Rahman) + خبر (istawa alal-arsh) — the divine throne verse as the grammar student\'s classic case study.',
    },
  },
  {
    id: 'i144',
    stage: 'intermediate',
    title: 'Quranic Tafsir in Arabic: Ibn Kathir Style',
    objective: 'Read excerpts from Ibn Kathir\'s tafsir in Arabic, extracting classical commentary vocabulary.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Commentary vocabulary (30 words)', 'Identify grammar analysis language in tafsir', 'Write your own short tafsir of one verse'],
    quranBridge: {
      arabic: 'يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ وَلَا يُحِيطُونَ بِهِ عِلْمًا',
      transliteration: "Yaalamu ma bayna aydihim wama khalfahum wala yuhituna bihi ilma",
      meaning: 'He knows what is before them and what will be after them, and they encompass not a thing of His knowledge.',
      note: 'يُحِيطُونَ بِهِ عِلْمًا (they encompass Him in knowledge — cognate accusative) — the grammar of divine epistemic supremacy.',
    },
  },
  {
    id: 'i145',
    stage: 'intermediate',
    title: 'Construct State Deep Dive: Complex Idafa',
    objective: 'Master triple and quadruple idafa chains and understand their semantic implications.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Triple idafa construction drill', 'Parse 10 complex noun chains', 'Find triple idafa examples in Quran'],
    quranBridge: {
      arabic: 'مِن رَّبِّ الْعَالَمِينَ',
      transliteration: "Min rabbil-aalamiin",
      meaning: 'From the Lord of all worlds.',
      note: 'رَبِّ الْعَالَمِينَ — double idafa, fully in genitive: Lord → worlds → both in genitive chain.',
    },
  },
  {
    id: 'i146',
    stage: 'intermediate',
    title: 'The Relative Pronoun System: All Types',
    objective: 'Master all Arabic relative pronouns (الَّذِي، الَّتِي، اللَّذَان، اللَّتَان، الَّذِينَ، اللَّوَاتِي) and their agreement.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['All relative pronoun forms table', 'Agreement rules application', 'Identify all relative clauses in Surah al-Mumin'],
    quranBridge: {
      arabic: 'فَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ لَهُم مَّغْفِرَةٌ',
      transliteration: "Fal-ladhina amanu waamilus-salihati lahum maghfiratum",
      meaning: 'Those who believed and did righteous deeds — for them is forgiveness.',
      note: 'الَّذِينَ (relative pronoun for plural masculine) — the most common relative clause opener in the Quran.',
    },
  },
  {
    id: 'i147',
    stage: 'intermediate',
    title: 'Circumstantial Clause (Hal): Advanced Patterns',
    objective: 'Master hal (circumstantial) clauses: nominal, verbal, and combined forms.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['10 hal clause identification', 'Construct 5 hal sentences', 'Distinguish hal from khabar in 10 examples'],
    quranBridge: {
      arabic: 'وَهُوَ الْحَقُّ مُصَدِّقًا لِّمَا بَيْنَ يَدَيْهِ',
      transliteration: "Wahuwal-haqqu musaddiqan lima bayna yadayh",
      meaning: 'And it is the truth, confirming what was before it.',
      note: 'مُصَدِّقًا (active participle as hal: while confirming) — participial hal clause expressing concurrent action.',
    },
  },
  {
    id: 'i148',
    stage: 'intermediate',
    title: 'Absolute Object (Mafool Mutlaq): Advanced',
    objective: 'Master all uses of mafool mutlaq: confirming, describing, substituting for verb.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['15 mafool mutlaq examples from Quran', 'Three function types identification', 'Construct 5 mafool mutlaq sentences'],
    quranBridge: {
      arabic: 'وَكَلَّمَ اللَّهُ مُوسَى تَكْلِيمًا',
      transliteration: "Wakallallaahu musa taklima",
      meaning: 'And Allah spoke to Musa directly.',
      note: 'تَكْلِيمًا (Form II masdar as mafool mutlaq: truly spoke) — the direct confirmation that Musa\'s speech was a real conversation.',
    },
  },
  {
    id: 'i149',
    stage: 'intermediate',
    title: 'Object of Purpose (Mafool Liajlih)',
    objective: 'Master mafool liajlih (object of reason) and distinguish it from purpose lam and preposition li.',
    duration: '28 min',
    challengeLevel: 'Advanced',
    drills: ['10 mafool liajlih examples from Quran', 'Contrast with purpose lam', 'Construct 5 sentences of reason'],
    quranBridge: {
      arabic: 'وَلَا تَقْتُلُوا أَوْلَادَكُمْ خَشْيَةَ إِمْلَاقٍ',
      transliteration: "Wala taqtulu awladakum khashyata imlaaq",
      meaning: 'And do not kill your children for fear of poverty.',
      note: 'خَشْيَةَ إِمْلَاق (out of fear of poverty) — mafool liajlih: an accusative masdar expressing the reason.',
    },
  },
  {
    id: 'i150',
    stage: 'intermediate',
    title: 'Intermediate Milestone: Advanced Grammar Test',
    objective: 'Complete an advanced grammar test: parse 50 words, identify 20 grammatical structures.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['50-word parsing test', '20 structure identification in passage', 'Error correction: 15 sentences'],
    quranBridge: {
      arabic: 'كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ',
      transliteration: "Kitabun anzalnahu ilayka mubarakun liyaddabbaru ayaatih",
      meaning: 'A blessed Book which We have revealed to you that they might reflect upon its verses.',
      note: 'لِيَدَّبَّرُوا (lam of purpose + Form V subjunctive: so that they deeply reflect) — the purpose of Quranic revelation in grammar.',
    },
  },
  {
    id: 'i151',
    stage: 'intermediate',
    title: 'Specifying Noun (Tamyiz): Types and Uses',
    objective: 'Master tamyiz (specifying noun): sentence tamyiz and word tamyiz with all patterns.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['10 tamyiz identification', 'Word tamyiz vs sentence tamyiz', 'Construct 5 tamyiz sentences'],
    quranBridge: {
      arabic: 'فَفَجَّرْنَا الْأَرْضَ عُيُونًا',
      transliteration: "Fafajjarnal-arda uyuna",
      meaning: 'And We caused the earth to gush as springs.',
      note: 'عُيُونًا (tamyiz specifying the way the earth gushed: as springs) — the specifying noun clarifies the resultant form.',
    },
  },
  {
    id: 'i152',
    stage: 'intermediate',
    title: 'Vocative Construction (Nida): All Patterns',
    objective: 'Master all nida (vocative) patterns: with ya, with mubtada, definite, indefinite, and special forms.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['Nida pattern identification: 15 examples', 'Construct 5 nida sentences', 'Quran: all nida patterns found'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا',
      transliteration: "Ya ayyuhalladhina amanu",
      meaning: 'O you who have believed.',
      note: 'يَا + أَيُّهَا + الَّذِينَ — the compound nida structure unique to the Quran\'s address to believers.',
    },
  },
  {
    id: 'i153',
    stage: 'intermediate',
    title: 'The Five Exceptional Nouns',
    objective: 'Master the five exceptional nouns (أَبٌ، أَخٌ، حَمٌ، فُو، ذُو) and their unique case endings.',
    duration: '25 min',
    challengeLevel: 'Advanced',
    drills: ['5 exceptional nouns declension table', 'Find all 5 in Quran', 'Construct 5 sentences with each'],
    quranBridge: {
      arabic: 'إِذْ قَالَ يُوسُفُ لِأَبِيهِ يَا أَبَتِ',
      transliteration: "Idh qaala yusufu li-abiyhi ya abati",
      meaning: 'When Yusuf said to his father: O my father.',
      note: 'أَبِيهِ (genitive exceptional noun أَب + hi) and يَا أَبَتِ (vocative with ta marbuta: O my dear father).',
    },
  },
  {
    id: 'i154',
    stage: 'intermediate',
    title: 'Diptote Nouns: Rules and Patterns',
    objective: 'Master all diptote noun patterns (mamnu min sarf) and why they resist tanwin and genitive.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['Diptote pattern list (6 patterns)', 'Identify diptotes in 3 surah passages', 'When diptotes gain tanwin: the exceptions'],
    quranBridge: {
      arabic: 'وَفِي مَدْيَنَ وَجَاءَ بِكُمْ مِّنَ الصَّحْرَاءِ',
      transliteration: "Wafi madyana wajaa bikum minas-sahraa",
      meaning: 'And in Madyan, and He brought you from the desert.',
      note: 'مَدْيَن (diptote proper noun — no tanwin, no kasra) — place names as the most common diptote.',
    },
  },
  {
    id: 'i155',
    stage: 'intermediate',
    title: 'Hollow Verbs: Advanced Conjugation',
    objective: 'Master hollow verb conjugation changes in all moods and their Quran occurrence patterns.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Hollow verb conjugation table: jiim, qaama, qiil types', '20 Quranic hollow verb identification', 'Why the middle vowel shifts'],
    quranBridge: {
      arabic: 'قُومُوا لِلَّهِ قَانِتِينَ',
      transliteration: "Qumu lillahi qanitin",
      meaning: 'Stand before Allah in devotion.',
      note: 'قُومُوا (plural imperative of قَامَ: the middle waw shifts when conjugated) — Form I hollow verb imperative.',
    },
  },
  {
    id: 'i156',
    stage: 'intermediate',
    title: 'Defective Verbs: Advanced Conjugation',
    objective: 'Master defective verb endings in all persons, moods, and their unique patterns.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Defective verb conjugation table (raa, kataba types)', '20 Quranic defective verb identification', 'Jussive of defective: losing the final letter'],
    quranBridge: {
      arabic: 'وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ',
      transliteration: "Wattaqullaaha laallakum tuflihun",
      meaning: 'And fear Allah so that you may succeed.',
      note: 'اتَّقُوا — Form VIII defective plural imperative: waw retained in imperative but can drop elsewhere.',
    },
  },
  {
    id: 'i157',
    stage: 'intermediate',
    title: 'Doubled Verbs: Advanced Conjugation',
    objective: 'Master doubled verb conjugation and when gemination applies vs separates.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['Doubled verb conjugation table', '15 Quranic doubled verb identification', 'Gemination rules chart'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ يُحِبُّ الَّذِينَ يُقَاتِلُونَ فِي سَبِيلِهِ',
      transliteration: "Innal-laaha yuhibbul-ladhina yuqatiluna fi sabilihi",
      meaning: 'Indeed Allah loves those who fight in His cause.',
      note: 'يُحِبُّ (Form I doubled: loves - gemination retained) — the doubled final consonant shows divine love in its intensity.',
    },
  },
  {
    id: 'i158',
    stage: 'intermediate',
    title: 'Hamzated Verbs: Advanced Conjugation',
    objective: 'Master hamza-initial, hamza-middle, and hamza-final verb conjugation and spelling.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['3 types of hamzated verb conjugation tables', '20 Quranic hamzated verb identification', 'Spelling of hamzated forms chart'],
    quranBridge: {
      arabic: 'وَسْئَلُوا اللَّهَ مِن فَضْلِهِ',
      transliteration: "Was-alullaaha min fadlih",
      meaning: 'And ask Allah of His bounty.',
      note: 'سَأَلَ (hamza in medial position) → اِسْأَلُوا (imperative) — hamza handling changes the written form significantly.',
    },
  },
  {
    id: 'i159',
    stage: 'intermediate',
    title: 'Verb Patterns Summary: All 10 Forms',
    objective: 'Create a complete mapping of all 10 Arabic verb forms with meanings, patterns, and Quran examples.',
    duration: '60 min',
    challengeLevel: 'Capstone',
    drills: ['Form I-X masdar patterns memorisation', 'Full parsing of 30 Quranic verbs', 'Root → Form → Masdar chart for 10 roots'],
    quranBridge: {
      arabic: 'يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
      transliteration: "Yusabbihu lillahi maafis-samawati wama fil-ard",
      meaning: 'Whatever is in the heavens and the earth exalts Allah.',
      note: 'يُسَبِّحُ (Form II: glorify — intensive) — the grammar of all creation glorifying Allah in one verb.',
    },
  },
  {
    id: 'i160',
    stage: 'intermediate',
    title: 'Intermediate Milestone: Verb Mastery Assessment',
    objective: 'Complete a full verb mastery test: conjugate 3 verbs (Form I-X each), identify 50 parsed verbs.',
    duration: '120 min',
    challengeLevel: 'Capstone',
    drills: ['3 root conjugation drill: all forms', '50-verb identification test from Quran passage', 'Write a paragraph using 10 different verb forms'],
    quranBridge: {
      arabic: 'قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ',
      transliteration: "Qul in kuntum tuhibbunallaha fattabiooni yuhbib-kumullahu",
      meaning: 'Say: If you love Allah, follow me, and Allah will love you.',
      note: 'يُحْبِبْكُم (Form IV doubled jussive as conditional response) — love reciprocated only through following: the grammar of divine love.',
    },
  },
  {
    id: 'i161',
    stage: 'intermediate',
    title: 'Intermediate Quran Reading: Surah al-Imran 100-200',
    objective: 'Read al-Imran verses 100-200 for advanced Quran reading fluency.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['100-verse reading session', 'Vocabulary log: 30 new words', 'Identify 10 grammatical highlight structures'],
    quranBridge: {
      arabic: 'كُنتُمْ خَيْرَ أُمَّةٍ أُخْرِجَتْ لِلنَّاسِ تَأْمُرُونَ بِالْمَعْرُوفِ وَتَنْهَوْنَ عَنِ الْمُنكَرِ',
      transliteration: "Kuntum khayra ummatin ukhrijat lin-naasi taamurun bil-maarufi watanhawna anil-munkar",
      meaning: 'You are the best community raised up for people, commanding right and forbidding wrong.',
      note: 'خَيْرَ أُمَّةٍ (best of communities — elative in idafa) + two participial adjectives: the Islamic mission in grammar.',
    },
  },
  {
    id: 'i162',
    stage: 'intermediate',
    title: 'Quranic Word Families: Root ح-ق-ق',
    objective: 'Build the complete word family of ح-ق-ق (truth/right/reality) — 30+ words.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['ح-ق-ق word family tree', 'Find all forms in Quran (minimum 10)', 'Distinguish haqq (truth) from haqiqa (reality)'],
    quranBridge: {
      arabic: 'وَقُلِ الْحَقُّ مِن رَّبِّكُمْ',
      transliteration: "Waqulil-haqqu mir-rabbikum",
      meaning: 'And say: The truth is from your Lord.',
      note: 'الْحَقُّ (definite: THE truth) — the article makes truth absolute; no definite noun can be truer.',
    },
  },
  {
    id: 'i163',
    stage: 'intermediate',
    title: 'Quranic Word Families: Root ع-ب-د',
    objective: 'Build the complete word family of ع-ب-د (worship/slave) — 25+ words.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['ع-ب-د word family construction', 'Distinguish abd (slave) from ibaadah (worship)', 'Find 10 forms in Quran'],
    quranBridge: {
      arabic: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',
      transliteration: "Wama khalaqtul-jinna wal-insa illa liyaabuduni",
      meaning: 'And I did not create the jinn and mankind except to worship Me.',
      note: 'لِيَعْبُدُونِ (purpose lam + subjunctive + first person suffix without nun al-wiqaya) — the entire purpose of creation in one word.',
    },
  },
  {
    id: 'i164',
    stage: 'intermediate',
    title: 'Quranic Word Families: Root ف-ق-ه',
    objective: 'Build the word family of ف-ق-ه (understanding/fiqh) — 20+ words.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['ف-ق-ه word family construction', 'Fiqh vocabulary specialisation', 'Find 8 forms in Quran'],
    quranBridge: {
      arabic: 'وَإِذَا قُرِئَ الْقُرْآنُ فَاسْتَمِعُوا لَهُ وَأَنصِتُوا لَعَلَّكُمْ تُرْحَمُونَ',
      transliteration: "Wa-idha quria l-quranu fastamiu lahu wa-ansitu laallakum turhamun",
      meaning: 'And when the Quran is recited, listen to it and be silent so you may be shown mercy.',
      note: 'لَعَلَّكُمْ تُرْحَمُونَ (so that you may be shown mercy) — lalla purpose clause + passive present: the grammar of received mercy.',
    },
  },
  {
    id: 'i165',
    stage: 'intermediate',
    title: 'Quranic Word Families: Root ز-ك-و',
    objective: 'Build the word family of ز-ك-و (purification/growth) — 20+ words including zakah.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['ز-ك-و word family construction', 'Zakah vocabulary: religious and botanical uses', 'Find 8 forms in Quran'],
    quranBridge: {
      arabic: 'قَدْ أَفْلَحَ مَن زَكَّاهَا وَقَدْ خَابَ مَن دَسَّاهَا',
      transliteration: "Qad aflaha man zakkaha waqad khaba man dassaha",
      meaning: 'He has succeeded who purifies it, and he has failed who buries it.',
      note: 'زَكَّاهَا (Form II: he purified the soul) vs دَسَّاهَا (Form II: he corrupted it) — the soul\'s two fates in one verse.',
    },
  },
  {
    id: 'i166',
    stage: 'intermediate',
    title: 'Arabic Writing System: Calligraphy and Scripts',
    objective: 'Understand the 6 major Arabic calligraphic scripts and their historical context.',
    duration: '30 min',
    challengeLevel: 'Momentum',
    drills: ['6 script styles identification', 'Naskh vs Nastaliq vs Thuluth distinction', 'Read a sample in Kufi script'],
    quranBridge: {
      arabic: 'وَالْقَلَمِ وَمَا يَسْطُرُونَ',
      transliteration: "Walqalami wama yasturun",
      meaning: 'By the pen and what they inscribe.',
      note: 'يَسْطُرُون (from سَطَرَ: to write in rows) — the root of سُطُور (lines of text) links to the history of Arabic script.',
    },
  },
  {
    id: 'i167',
    stage: 'intermediate',
    title: 'Numbers 1-1000 in Complex Contexts',
    objective: 'Use Arabic number agreement rules for all numbers 1-1000 in complex noun phrases.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Number agreement chart: 1-10, 11-99, 100-1000', 'Construct 10 number phrases', 'Quranic number expressions analysis'],
    quranBridge: {
      arabic: 'أَلْفَ شَهْرٍ',
      transliteration: "Alfa shahr",
      meaning: 'A thousand months.',
      note: 'أَلْف + تمييز (specifying noun in genitive) — numbers above 100 take genitive singular; Laylat al-Qadr is worth 1000 months.',
    },
  },
  {
    id: 'i168',
    stage: 'intermediate',
    title: 'Fractions and Portions in Arabic',
    objective: 'Learn all Arabic fractions and their unique grammatical construction.',
    duration: '28 min',
    challengeLevel: 'Advanced',
    drills: ['Fraction vocabulary flashcards (half, third, etc.)', 'Quranic inheritance law fractions', 'Construct 5 fraction sentences'],
    quranBridge: {
      arabic: 'وَلَكُمْ نِصْفُ مَا تَرَكَ أَزْوَاجُكُمْ',
      transliteration: "Walakum nisfu ma taraka azwajukum",
      meaning: 'And for you is half of what your wives leave.',
      note: 'نِصْف (half) in idafa + relative clause: Islamic inheritance law governed by Quranic fractions.',
    },
  },
  {
    id: 'i169',
    stage: 'intermediate',
    title: 'Ordinal Numbers and Rankings',
    objective: 'Use Arabic ordinal numbers (first, second...) in adjective agreement and ranking.',
    duration: '25 min',
    challengeLevel: 'Advanced',
    drills: ['Ordinal adjective flashcards 1-10', 'Agreement: ordinals agree in gender', 'Construct 5 ranking sentences'],
    quranBridge: {
      arabic: 'أَوَّلِ الْمُسْلِمِينَ',
      transliteration: "Awwalil-muslimin",
      meaning: 'The first of the Muslims.',
      note: 'أَوَّل (ordinal: first) in idafa as genitive — the Prophet ﷺ declaring his first-ness in submission.',
    },
  },
  {
    id: 'i170',
    stage: 'intermediate',
    title: 'Intermediate Milestone: Number and Agreement Review',
    objective: 'Review all number grammar, agreement rules, and fractions with 30-question test.',
    duration: '60 min',
    challengeLevel: 'Capstone',
    drills: ['30-question number grammar test', 'Error correction: 15 number sentences', 'Write inheritance scenario in Arabic'],
    quranBridge: {
      arabic: 'وَآتُوا الْيَتَامَى أَمْوَالَهُمْ وَلَا تَتَبَدَّلُوا الْخَبِيثَ بِالطَّيِّبِ',
      transliteration: "Waaatul-yatama amwalahum wala tatabbadalul-khabetha bit-tayyib",
      meaning: 'And give the orphans their wealth, and do not substitute the defective for the good.',
      note: 'تَتَبَدَّلُوا (Form V: swap/substitute for yourselves) — the protective grammar of orphan rights.',
    },
  },
  {
    id: 'i171',
    stage: 'intermediate',
    title: 'Emphasis Structures: Tawkid Lafzhi and Manawi',
    objective: 'Master Arabic emphasis constructions — repetition emphasis (tawkid lafzhi) and pronoun-reinforced emphasis (tawkid manawi).',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Tawkid manawi words: nafs, ain, kull, jami, kilaa', 'Construct 5 emphasis sentences', 'Find tawkid examples in Quran'],
    quranBridge: {
      arabic: 'فَسَجَدَ الْمَلَائِكَةُ كُلُّهُمْ أَجْمَعُونَ',
      transliteration: "Fasajadal-malaaikatu kulluhum ajmaun",
      meaning: 'And the angels prostrated — all of them together.',
      note: 'كُلُّهُمْ أَجْمَعُونَ (double tawkid manawi: every + collectively) — the angels\' unanimous prostration emphasised twice.',
    },
  },
  {
    id: 'i172',
    stage: 'intermediate',
    title: 'Apposition (Badal) — Four Types',
    objective: 'Master all four types of Arabic apposition (badal): exact, partial, general-from-specific, error correction.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['4 badal type definitions', 'Identify badal in 10 sentences', 'Construct one of each type'],
    quranBridge: {
      arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',
      transliteration: "Ihdinassiratal-mustaqim, siratal-ladhina anamta alayhim",
      meaning: 'Guide us to the straight path — the path of those upon whom You bestowed favor.',
      note: 'صِرَاطَ الَّذِينَ is badal mutabiq (exact apposition) of الصِّرَاطَ الْمُسْتَقِيمَ — al-Fatiha explains itself through badal.',
    },
  },
  {
    id: 'i173',
    stage: 'intermediate',
    title: 'Coordinating Conjunctions (Huruf al-Atf)',
    objective: 'Master all 10 Arabic coordinating conjunctions and their specific semantic differences.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['10 conjunction flashcards (wa, fa, thumma, aw, am, bal, lakin, la, hatta, waw al-hal)', 'Distinguish fa from thumma (immediate vs delayed)', 'Write 5 coordinated sentences'],
    quranBridge: {
      arabic: 'مَنْ عَمِلَ سَيِّئَةً فَلَا يُجْزَى إِلَّا مِثْلَهَا وَمَنْ عَمِلَ صَالِحًا مِّن ذَكَرٍ أَوْ أُنثَى',
      transliteration: "Man amila sayyiatan fala yujza illa mithlaha waman amila salihan min dhakarin aw untha",
      meaning: 'Whoever does evil shall not be repaid except with its like; but whoever does good, male or female...',
      note: 'فَلَا (fa of consequence), وَمَنْ (wa for contrast/addition), أَوْ (inclusive or) — three conjunctions in one verse.',
    },
  },
  {
    id: 'i174',
    stage: 'intermediate',
    title: 'Exception Constructions (Istithna)',
    objective: 'Master all Arabic exception structures: munqati, muttasil, and their grammatical cases.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Istithna case rules: illa, ghayra, siwaa', 'Positive vs negative exception sentences', 'Find 5 Quranic exceptions'],
    quranBridge: {
      arabic: 'إِنَّ الْإِنسَانَ لَفِي خُسْرٍ إِلَّا الَّذِينَ آمَنُوا',
      transliteration: "Innal-insana lafi khusrin illal-ladhina amanu",
      meaning: 'Indeed, mankind is in loss — except those who believed.',
      note: 'إِلَّا الَّذِينَ (exception after implicit negation) — مُستَثنى مرفوع because الَّذِينَ replaces the subject of redemption.',
    },
  },
  {
    id: 'i175',
    stage: 'intermediate',
    title: 'Conditional Sentences: Sharta with Law',
    objective: 'Master law (لَوْ) conditional sentences — unreal past conditions unlike law with jazm.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['Law + past verb constructions', 'Law vs in conditional comparison', 'Construct 5 regret conditionals'],
    quranBridge: {
      arabic: 'وَلَوْ أَنَّهُمْ آمَنُوا وَاتَّقَوْا لَمَثُوبَةٌ مِّنْ عِندِ اللَّهِ خَيْرٌ',
      transliteration: "Walaw annahum amanu wattaqaw lamathuubatun min indillahi khayr",
      meaning: 'And if only they had believed and were pious, a reward from Allah would have been better.',
      note: 'لَوْ + perfect tense (past action) + لَ in apodosis — the counterfactual of what could have been.',
    },
  },
  {
    id: 'i176',
    stage: 'intermediate',
    title: 'Conditional Sentences: Kullama and Lamma',
    objective: 'Master kullama (كُلَّمَا whenever) and lamma (لَمَّا when/once) conditionals.',
    duration: '28 min',
    challengeLevel: 'Advanced',
    drills: ['Kullama vs lamma distinction', 'Construct 3 kullama repetitive sentences', 'Find lamma in Quran stories'],
    quranBridge: {
      arabic: 'كُلَّمَا دَخَلَ عَلَيْهَا زَكَرِيَّا الْمِحْرَابَ وَجَدَ عِندَهَا رِزْقًا',
      transliteration: "Kullama dakhala alayha zakariyyyal-mihraba wajada indaha rizqa",
      meaning: 'Every time Zachariah entered upon her in the sanctuary, he found provisions with her.',
      note: 'كُلَّمَا + past tense (iterative: every single time) — kullama turns single acts into divine patterns.',
    },
  },
  {
    id: 'i177',
    stage: 'intermediate',
    title: 'Purpose Clauses: Lam al-Talil and Companions',
    objective: 'Master purpose constructions using lam al-talil, kay, hatta, and li-anna.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['4 purpose particle constructions', 'Distinguish lam (purpose) from lam (belonging)', 'Write 5 purpose sentences'],
    quranBridge: {
      arabic: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',
      transliteration: "Wama khalaqtul-jinna wal-insa illa liyaabuduni",
      meaning: 'And I did not create the jinn and mankind except to worship Me.',
      note: 'لِيَعْبُدُونِ (lam al-talil + subjunctive) — the entire purpose of creation compressed into one grammatical purpose clause.',
    },
  },
  {
    id: 'i178',
    stage: 'intermediate',
    title: 'Negative Particles: La, Lam, Lan, Laysa',
    objective: 'Master all Arabic negative particles and their tense and mood restrictions.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['4 negative particle chart with tenses', 'Transform 10 affirmatives to negatives', 'Distinguish lan (emphatic future negative) from la'],
    quranBridge: {
      arabic: 'لَن تَنَالُوا الْبِرَّ حَتَّى تُنفِقُوا مِمَّا تُحِبُّونَ',
      transliteration: "Lan tanaul-birra hatta tunfiqu mimma tuhibbun",
      meaning: 'Never will you attain righteousness until you spend from what you love.',
      note: 'لَن (emphatic future negative + subjunctive) — stronger than لا; the grammar of unreachable righteousness without sacrifice.',
    },
  },
  {
    id: 'i179',
    stage: 'intermediate',
    title: 'Direct and Indirect Speech in Arabic',
    objective: 'Express direct (qawl + sentence) and indirect speech (with anna/an) in Arabic.',
    duration: '28 min',
    challengeLevel: 'Advanced',
    drills: ['Direct speech: 5 qala + sentence', 'Indirect speech: 5 qala anna sentences', 'Transform 3 direct to indirect'],
    quranBridge: {
      arabic: 'وَقَالُوا اتَّخَذَ اللَّهُ وَلَدًا',
      transliteration: "Waqalu ittadhallahu walada",
      meaning: 'And they said: Allah has taken a child.',
      note: 'قَالُوا + full sentence (direct speech) — Quran frequently records direct speech to attribute responsibility to speakers.',
    },
  },
  {
    id: 'i180',
    stage: 'intermediate',
    title: 'Intermediate Milestone i180: Syntax Deep Review',
    objective: 'Comprehensive test on tawkid, badal, atf, istithna, conditionals, purposes, negatives.',
    duration: '75 min',
    challengeLevel: 'Capstone',
    drills: ['35-question syntax test', 'Parse a 10-verse passage identifying all structures', 'Write a 5-sentence Arabic paragraph using 3 structures'],
    quranBridge: {
      arabic: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا',
      transliteration: "Walladhina jahadu fina lanahdiyannahum subulana",
      meaning: 'And those who strive for Us — We will surely guide them to Our ways.',
      note: 'لَنَهْدِيَنَّهُمْ (lam of oath + future + nun tawkid) — the grammar of guaranteed divine guidance for strivers.',
    },
  },
  {
    id: 'i181',
    stage: 'intermediate',
    title: 'Seerah Vocabulary: Makkah Period',
    objective: 'Master 40 Arabic vocabulary words from the Makkah period of the Prophet\'s life.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Makkah period vocab flashcards x40', 'Timeline narration: hijra, khadijah, Quraysh', 'Read a paragraph of seerah in Arabic'],
    quranBridge: {
      arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
      transliteration: "Iqra bismi rabbikal-ladhi khalaq",
      meaning: 'Read in the name of your Lord who created.',
      note: 'اقْرَأْ (imperative of قرأ Form I) — the very first word revealed; the beginning of the prophetic mission in Makkah.',
    },
  },
  {
    id: 'i182',
    stage: 'intermediate',
    title: 'Seerah Vocabulary: Madinah Period',
    objective: 'Master 40 Arabic vocabulary words from the Madinah period — battles, treaties, governance.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Madinah period vocab x40', 'Battle names in Arabic', 'Read Madinah charter vocabulary'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا ادْخُلُوا فِي السِّلْمِ كَافَّةً',
      transliteration: "Ya ayyuhal-ladhina amanu udkhulu fis-silmi kaffah",
      meaning: 'O you who believe, enter into peace (Islam) completely.',
      note: 'كَافَّةً (hal: completely/fully — no holding back) — the word for the total Madinah transformation.',
    },
  },
  {
    id: 'i183',
    stage: 'intermediate',
    title: 'Islamic History: Khulafa Rashidun Vocabulary',
    objective: 'Master 35 vocabulary words related to the 4 rightly-guided caliphs and early Islamic history.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Caliphate vocabulary x35', 'Name the 4 caliphs in Arabic', 'Describe Abu Bakr\'s caliphate in 3 Arabic sentences'],
    quranBridge: {
      arabic: 'وَالسَّابِقُونَ الْأَوَّلُونَ مِنَ الْمُهَاجِرِينَ وَالْأَنصَارِ',
      transliteration: "Wassabiqoonal-awwaluna minal-muhajirina wal-ansar",
      meaning: 'The forerunners — the first of the Emigrants and the Helpers.',
      note: 'الْأَوَّلُونَ (ordinal plural: the firsts) — the caliphs are among these forerunners; grammar of honour.',
    },
  },
  {
    id: 'i184',
    stage: 'intermediate',
    title: 'Islamic Jurisprudence Reading: Tahara',
    objective: 'Read and comprehend a standard Arabic fiqh passage on tahara (purification).',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Tahara passage reading: 200 words', 'Legal vocabulary list extraction', 'Summarise the passage in 5 Arabic sentences'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ',
      transliteration: "Innallaha yuhibbut-tawwabeena wayuhibbul-mutatahhireen",
      meaning: 'Indeed, Allah loves those who constantly repent and loves those who purify themselves.',
      note: 'الْمُتَطَهِّرِينَ (Form V active participle plural: those who consistently purify themselves) — purification as ongoing state.',
    },
  },
  {
    id: 'i185',
    stage: 'intermediate',
    title: 'Islamic Jurisprudence Reading: Salah',
    objective: 'Read and comprehend a standard Arabic fiqh passage on salah (prayer) — rulings and descriptions.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Salah fiqh passage reading: 200 words', 'List 10 technical salah terms', 'Compare with prayer descriptions in Quran'],
    quranBridge: {
      arabic: 'حَافِظُوا عَلَى الصَّلَوَاتِ وَالصَّلَاةِ الْوُسْطَى وَقُومُوا لِلَّهِ قَانِتِينَ',
      transliteration: "Hafidhu alaassalawati wassalaatil-wusta waqumu lillahi qaniteen",
      meaning: 'Maintain all prayers, especially the middle prayer, and stand before Allah devoutly obedient.',
      note: 'قَانِتِينَ (hal from قنت: standing in submission) — the grammar of ʿibada embedded in the posture of standing.',
    },
  },
  {
    id: 'i186',
    stage: 'intermediate',
    title: 'Tafsir Reading: Al-Tabari Style',
    objective: 'Read and analyse al-Tabari tafsir style — classical Arabic prose with grammatical commentary.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read 150 words of al-Tabari tafsir', 'Identify 5 grammatical analyses he makes', 'Vocabulary from classical tafsir prose'],
    quranBridge: {
      arabic: 'وَاللَّهُ عَلِيمٌ حَكِيمٌ',
      transliteration: "Wallahu alimun hakeem",
      meaning: 'And Allah is All-Knowing, All-Wise.',
      note: 'عَلِيمٌ حَكِيمٌ (two nominal predicates in tanwin) — al-Tabari frequently explains why these divine names appear together.',
    },
  },
  {
    id: 'i187',
    stage: 'intermediate',
    title: 'Tafsir Reading: Al-Qurtubi Style',
    objective: 'Read and analyse al-Qurtubi tafsir style — fiqh-oriented Quran commentary.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read 150 words of al-Qurtubi passage', 'Identify legal rulings extracted', 'Compare Tabari vs Qurtubi approach in one paragraph'],
    quranBridge: {
      arabic: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ وَارْكَعُوا مَعَ الرَّاكِعِينَ',
      transliteration: "Wa-aqimus-salata wa-aatuz-zakatan warkaoo maaer-raakieen",
      meaning: 'And establish prayer and give zakah and bow with those who bow.',
      note: 'Three imperatives (أَقِيمُوا، آتُوا، ارْكَعُوا) — al-Qurtubi extracts from each imperative a distinct fiqh ruling.',
    },
  },
  {
    id: 'i188',
    stage: 'intermediate',
    title: 'Tafsir Reading: Ibn Ashur Style',
    objective: 'Read Ibn Ashur\'s al-Tahrir wa al-Tanwir style — linguistic and societal Quran commentary.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read 150 words of ibn Ashur passage', 'Identify linguistic and balaghah observations', 'Summarise his unique approach in Arabic'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ',
      transliteration: "Innallaha yamuru bil-adli wal-ihsan",
      meaning: 'Indeed, Allah commands justice and excellence.',
      note: 'الْعَدْلِ وَالْإِحْسَانِ (justice is minimum; ihsan exceeds it) — ibn Ashur explains the progression: do right, then exceed right.',
    },
  },
  {
    id: 'i189',
    stage: 'intermediate',
    title: 'Arabic Composition: Descriptive Writing',
    objective: 'Write a 100-word descriptive Arabic composition about a place you love.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Descriptive adjective vocabulary bank', 'Draft composition outline in Arabic', 'Peer review checklist: 10 grammar points'],
    quranBridge: {
      arabic: 'جَنَّاتٍ تَجْرِي مِن تَحْتِهَا الْأَنْهَارُ',
      transliteration: "Jannatin tajri min tahtihal-anhar",
      meaning: 'Gardens beneath which rivers flow.',
      note: 'جَنَّاتٍ (tanwin: indefinite plural) + jariya (present participle as attribute) — the Quran models descriptive Arabic.',
    },
  },
  {
    id: 'i190',
    stage: 'intermediate',
    title: 'Intermediate Milestone i190: Composition and Reading Review',
    objective: 'Review seerah vocab, fiqh reading, tafsir styles, and composition with 30-question mixed test.',
    duration: '70 min',
    challengeLevel: 'Capstone',
    drills: ['30-question mixed test', 'Read unseen passage (150 words) and summarise', 'Write 3-sentence description of the Kaaba in Arabic'],
    quranBridge: {
      arabic: 'إِنَّ أَوَّلَ بَيْتٍ وُضِعَ لِلنَّاسِ لَلَّذِي بِبَكَّةَ مُبَارَكًا',
      transliteration: "Inna awwala baytin wudia lin-naasi lal-ladhi bi-bakkata mubarakan",
      meaning: 'Indeed, the first house established for mankind was that at Makkah, blessed.',
      note: 'مُبَارَكًا (hal: in a state of blessing) — even the first structure of worship was blessed in its grammar.',
    },
  },
  {
    id: 'i191',
    stage: 'intermediate',
    title: 'Classical Arabic Prose: Ibn Khaldun',
    objective: 'Read and comprehend a passage from Ibn Khaldun\'s Muqaddimah in classical Arabic.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Read 200 words of Muqaddimah', 'Identify sociological vocabulary', 'Parse 5 complex structures in the passage'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّى يُغَيِّرُوا مَا بِأَنفُسِهِمْ',
      transliteration: "Innallaha la yughayyiru ma biqawmin hatta yughayyiru ma bi-anfusihim",
      meaning: 'Indeed, Allah will not change the condition of a people until they change what is in themselves.',
      note: 'يُغَيِّرُ (Form II imperfect) — this verse is the foundational premise of Ibn Khaldun\'s entire theory of social change.',
    },
  },
  {
    id: 'i192',
    stage: 'intermediate',
    title: 'Classical Arabic Prose: Al-Ghazali',
    objective: 'Read and comprehend a passage from Ihya Ulum al-Din by al-Ghazali.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Read 200 words from Ihya', 'Identify spiritual vocabulary', 'Compare al-Ghazali\'s Arabic style to ibn Khaldun\'s'],
    quranBridge: {
      arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      transliteration: "Ala bidhikrillahi tatmainnu l-qulub",
      meaning: 'Verily, in the remembrance of Allah do hearts find rest.',
      note: 'تَطْمَئِنُّ (quadrilateral: ط-م-أ-ن) — al-Ghazali\'s Ihya builds an entire science around this tuma\'ninah (tranquillity).',
    },
  },
  {
    id: 'i193',
    stage: 'intermediate',
    title: 'Classical Arabic Prose: Al-Jahiz',
    objective: 'Read a passage from al-Jahiz\'s al-Bayan wa al-Tabyin — classical prose on Arabic eloquence.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read 150 words from al-Bayan', 'Identify rhetorical observations al-Jahiz makes', 'Vocabulary from classical balaghah prose'],
    quranBridge: {
      arabic: 'وَمَا أَرْسَلْنَا مِن رَّسُولٍ إِلَّا بِلِسَانِ قَوْمِهِ',
      transliteration: "Wama arsalna mir-rasulin illa bilisani qawmih",
      meaning: 'And We did not send any messenger except speaking in the language of his people.',
      note: 'بِلِسَانِ قَوْمِهِ (in the tongue of his people) — al-Jahiz builds his entire theory of bayan from this verse\'s principle.',
    },
  },
  {
    id: 'i194',
    stage: 'intermediate',
    title: 'Quranic Recitation: Makharij al-Huruf',
    objective: 'Study all 17 articulation points (makharij) for Arabic letters and apply to recitation.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['17 makharij classification map', 'Mirror practice: 5 challenging makhraj letters', 'Record self-recitation of al-Fatiha'],
    quranBridge: {
      arabic: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا',
      transliteration: "Warattilil-qurana tartila",
      meaning: 'And recite the Quran with measured rhythmic recitation.',
      note: 'تَرْتِيلًا (mafool mutlaq from رتل) — tartil means making letters clear at their makharij; the grammar commands precision.',
    },
  },
  {
    id: 'i195',
    stage: 'intermediate',
    title: 'Tajweed: Ghunna and Sifaat al-Huruf',
    objective: 'Master all 18 letter characteristics (sifaat) and ghunna nasalisation rules.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['18 sifatt al-huruf chart', 'Ghunna: 2-count nasalisation identification', 'Recite Ayat al-Kursi with full sifaat'],
    quranBridge: {
      arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
      transliteration: "Allahu la ilaha illa huwal-hayyul-qayyum",
      meaning: 'Allah — there is no deity worthy of worship except Him, the Ever-Living, the Sustainer.',
      note: 'الْحَيُّ الْقَيُّومُ (doubled letters with shaddah) — qalqala and sifaat of ل، ح، ق create a unique recitation identity.',
    },
  },
  {
    id: 'i196',
    stage: 'intermediate',
    title: 'Quranic Pauses: Rules of Waqf and Ibtida',
    objective: 'Master all 8 Quranic pause symbols (waqf signs) and correct ibtida starting points.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['8 waqf symbol meanings', 'Practice identifying waqf-lazim and waqf-jaiz', 'Recite a page of Quran with correct pauses'],
    quranBridge: {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      transliteration: "Bismillahir-rahmanir-raheem",
      meaning: 'In the name of Allah, the Most Gracious, the Most Merciful.',
      note: 'الْبَسْمَلَة — waqf tam (complete pause) ends entire bismillah; the start of every surah begins with ibtida hasana.',
    },
  },
  {
    id: 'i197',
    stage: 'intermediate',
    title: 'Arabic Listening: Classical Lecture Comprehension',
    objective: 'Listen to 10 minutes of a classical Arabic Islamic lecture and summarise comprehension.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['10-min classical Arabic lecture listening', 'Summarise in 5 bullet points', 'List 10 new vocabulary from listening'],
    quranBridge: {
      arabic: 'وَمِنَ النَّاسِ مَن يَشْتَرِي لَهْوَ الْحَدِيثِ لِيُضِلَّ',
      transliteration: "Waminan-naasi man yashtari lahwal-hadeethi liyudilla",
      meaning: 'And of the people is one who purchases idle talk to mislead.',
      note: 'لَهْوَ الْحَدِيثِ (idle speech in genitive idafa) vs beneficial speech — choose your listening wisely.',
    },
  },
  {
    id: 'i198',
    stage: 'intermediate',
    title: 'Arabic Speaking: Structured Conversation Practice',
    objective: 'Hold an 8-minute structured Arabic conversation covering 4 topics: self, family, daily life, aspirations.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['4-topic conversation framework', 'Filler phrases in Arabic for thinking time', 'Record and review self-corrections'],
    quranBridge: {
      arabic: 'قَوْلًا سَدِيدًا',
      transliteration: "Qawlan sadida",
      meaning: 'Straight/true speech.',
      note: 'سَدِيد (from سدد: to aim straight) — the Quran calls believers twice to qawlan sadida: for justice and for orphan protection.',
    },
  },
  {
    id: 'i199',
    stage: 'intermediate',
    title: 'Arabic Writing: Analytical Essay',
    objective: 'Write an analytical 150-word Arabic essay on one Islamic theme (sabr, shukr, or tawakkul).',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Essay structure in Arabic (intro, body, conclusion)', 'Thesis sentence construction', 'Transition word vocabulary: moreover, however, therefore'],
    quranBridge: {
      arabic: 'وَاصْبِرْ فَإِنَّ اللَّهَ لَا يُضِيعُ أَجْرَ الْمُحْسِنِينَ',
      transliteration: "Wasbir fa-innallaha la yudieu ajral-muhsineen",
      meaning: 'And be patient, for indeed Allah does not allow the reward of the doers of good to be lost.',
      note: 'فَإِنَّ (fa causative: for the reason that) — the conditional logic of sabr: endure because reward is guaranteed.',
    },
  },
  {
    id: 'i200',
    stage: 'intermediate',
    title: 'Intermediate Milestone i200: Half-Way Celebration',
    objective: 'Comprehensive 40-question celebration test covering all intermediate grammar, vocabulary, and skills.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['40-question comprehensive test', 'Read unseen passage (200 words) and answer 5 questions', 'Write a 100-word response to a Quranic verse in Arabic'],
    quranBridge: {
      arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      transliteration: "Inna maal-usri yusra",
      meaning: 'Indeed, with hardship comes ease.',
      note: 'مَعَ الْعُسْرِ يُسْرًا (the definite hardship vs indefinite ease) — the scholars said one hardship but two eases; celebrate milestone i200!',
    },
  },
  {
    id: 'i201',
    stage: 'intermediate',
    title: 'Quranic Word Families: Root ص-ب-ر',
    objective: 'Build the complete word family of ص-ب-ر (patience/perseverance) — 25+ words.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['ص-ب-ر family tree construction', 'Find all sabr forms in Quran', 'Distinguish ṣabr (active endurance) from taṣabbur (forced patience)'],
    quranBridge: {
      arabic: 'إِنَّمَا يُوَفَّى الصَّابِرُونَ أَجْرَهُم بِغَيْرِ حِسَابٍ',
      transliteration: "Innama yuwaffas-sabiruna ajrahum bighayri hisab",
      meaning: 'Indeed, the patient will be given their reward without account.',
      note: 'يُوَفَّى (Form II passive: to be given in full) + بِغَيْرِ حِسَابٍ (without account) — the grammar of infinite divine generosity.',
    },
  },
  {
    id: 'i202',
    stage: 'intermediate',
    title: 'Quranic Word Families: Root ش-ك-ر',
    objective: 'Build the complete word family of ش-ك-ر (gratitude/thankfulness) — 20+ words.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['ش-ك-ر family tree', 'Shukr vs shakur vs mashkur distinctions', 'Find 8 forms in Quran'],
    quranBridge: {
      arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
      transliteration: "La-in shakartum la-azidannakum",
      meaning: 'If you are grateful, I will surely increase you.',
      note: 'لَئِن (conditional lam + in) + لَأَزِيدَنَّ (lam of oath + future + nun tawkid) — the strongest grammatical guarantee of divine increase.',
    },
  },
  {
    id: 'i203',
    stage: 'intermediate',
    title: 'Quranic Word Families: Root ت-و-ب',
    objective: 'Build the complete word family of ت-و-ب (repentance/return) — 20+ words.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['ت-و-ب family tree', 'Tawbah vs inabah vs awbah nuances', 'Find 10 forms in Quran'],
    quranBridge: {
      arabic: 'وَتُوبُوا إِلَى اللَّهِ جَمِيعًا أَيُّهَا الْمُؤْمِنُونَ لَعَلَّكُمْ تُفْلِحُونَ',
      transliteration: "Watubu ilallahi jamian ayyuhal-muminuna laallakum tuflihun",
      meaning: 'And repent to Allah all together, O believers, so that you may succeed.',
      note: 'جَمِيعًا (hal: all together — no individual exclusion) — repentance is a communal act; grammar of collective return.',
    },
  },
  {
    id: 'i204',
    stage: 'intermediate',
    title: 'Quranic Word Families: Root خ-ش-ع',
    objective: 'Build the word family of خ-ش-ع (humility/awe) — 15+ words used in salah and worship.',
    duration: '28 min',
    challengeLevel: 'Advanced',
    drills: ['خ-ش-ع family construction', 'Khushu in salah — technical meaning', 'Find 5 forms in Quran'],
    quranBridge: {
      arabic: 'قَدْ أَفْلَحَ الْمُؤْمِنُونَ الَّذِينَ هُمْ فِي صَلَاتِهِمْ خَاشِعُونَ',
      transliteration: "Qad aflaha l-muminuna alladhina hum fi salatihim khashy'un",
      meaning: 'Certainly, the believers have succeeded — those who in their prayer are humbly submissive.',
      note: 'خَاشِعُونَ (active participle plural: those in a state of khushoo) — the present continuous grammar of a heart in awe.',
    },
  },
  {
    id: 'i205',
    stage: 'intermediate',
    title: 'Quranic Word Families: Root ذ-ك-ر',
    objective: 'Build the complete word family of ذ-ك-ر (remembrance/mention/male) — 30+ Quranic words.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['ذ-ك-ر family tree (multiple meanings)', 'Distinguish dhikr (remembrance) vs dhikr (mention) by context', 'Find 12 forms in Quran'],
    quranBridge: {
      arabic: 'فَاذْكُرُونِي أَذْكُرْكُمْ',
      transliteration: "Fadhkuruni adhkurkum",
      meaning: 'So remember Me — I will remember you.',
      note: 'اذْكُرُونِي (imperative + first person) → أَذْكُرْكُمْ (jussive response) — the grammar of mutual remembrance between Lord and servant.',
    },
  },
  {
    id: 'i206',
    stage: 'intermediate',
    title: 'Intermediate Quran Review: Juz Amma Deep Study',
    objective: 'Deep grammatical analysis of 10 surahs from Juz Amma: vocabulary, grammar, themes.',
    duration: '70 min',
    challengeLevel: 'Capstone',
    drills: ['Select 10 surahs from Juz Amma', 'Grammar highlight for each surah (1 point each)', 'Translate each surah from memory into English'],
    quranBridge: {
      arabic: 'تَبَارَكَ الَّذِي بِيَدِهِ الْمُلْكُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      transliteration: "Tabarakal-ladhi biyadihil-mulku wahuwa ala kulli shayin qadir",
      meaning: 'Blessed is He in whose hand is dominion, and He is over all things competent.',
      note: 'تَبَارَكَ (Form VI-like: root ب-ر-ك intransitive blessing) — used only for Allah; the grammar of absolute divine exaltation.',
    },
  },
  {
    id: 'i207',
    stage: 'intermediate',
    title: 'Intermediate Quran Review: Juz Tabarak Deep Study',
    objective: 'Deep grammatical analysis of 10 surahs from Juz Tabarak (Juz 29): vocabulary, grammar, themes.',
    duration: '70 min',
    challengeLevel: 'Capstone',
    drills: ['Select 10 surahs from Juz 29', 'Grammar highlight for each surah', 'Write 3 key lessons from this Juz in Arabic'],
    quranBridge: {
      arabic: 'وَالْفَجْرِ وَلَيَالٍ عَشْرٍ',
      transliteration: "Wal-fajri walayalin ashr",
      meaning: 'By the dawn and by ten nights.',
      note: 'عَشْرٍ (tanwin: indefinite — the 10 holy nights of Dhul Hijjah) — the Quran swears by time; pay attention to what commands oath.',
    },
  },
  {
    id: 'i208',
    stage: 'intermediate',
    title: 'Advanced Vocabulary: Abstract Islamic Concepts',
    objective: 'Master 40 abstract Islamic vocabulary words: tawakkul, tawadu, ikhlas, taqwa, zuhd, wara.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['40 abstract concept flashcards', 'Define each word in Arabic (one sentence)', 'Rank by difficulty and create a learning priority list'],
    quranBridge: {
      arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا',
      transliteration: "Waman yattaqillaha yajal lahu makhraja",
      meaning: 'And whoever fears Allah — He will make for him a way out.',
      note: 'يَجْعَل (jussive: apodosis of man conditional) + مَخْرَجًا (indefinite: some/a way out) — the open-ended grammar of divine relief.',
    },
  },
  {
    id: 'i209',
    stage: 'intermediate',
    title: 'Advanced Vocabulary: Social and Ethical Terms',
    objective: 'Master 35 Arabic social and ethical vocabulary words: adalah, shura, ihsan, amanah, sidq.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['35 ethical vocabulary flashcards', 'Define each term in classical Arabic', 'Find each term in Quran or hadith'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ يَأْمُرُكُمْ أَن تُؤَدُّوا الْأَمَانَاتِ إِلَى أَهْلِهَا',
      transliteration: "Innallaha yamurukum an tuaddul-amanati ila ahliha",
      meaning: 'Indeed, Allah commands you to return trusts to their rightful owners.',
      note: 'الْأَمَانَاتِ (plural of amanah: trusts — all forms of trust, financial and moral) — the grammar of plural expands amanah to every domain.',
    },
  },
  {
    id: 'i210',
    stage: 'intermediate',
    title: 'Intermediate Milestone i210: Word Family Review',
    objective: 'Comprehensive review of all word families covered (i201-i209) with 30-question test.',
    duration: '60 min',
    challengeLevel: 'Capstone',
    drills: ['30-question word family test', 'Root identification sprint: 20 words in 5 minutes', 'Write 3 sentences using one word from each family studied'],
    quranBridge: {
      arabic: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',
      transliteration: "Wa-allama adama l-asmaa kullaha",
      meaning: 'And He taught Adam the names of all things.',
      note: 'الْأَسْمَاءَ كُلَّهَا (tawkid: all the names — not some, all) — Arabic mastery means learning divine vocabulary; you are in Adam\'s path.',
    },
  },
  {
    id: 'i211',
    stage: 'intermediate',
    title: 'Surah al-Baqarah: Ayat al-Dayn (Verse of Debt)',
    objective: 'Deep grammatical analysis of 2:282 — the longest verse in the Quran on financial contracts.',
    duration: '60 min',
    challengeLevel: 'Advanced',
    drills: ['Parse the entire verse grammatically', 'List all 10+ rulings in the verse', 'Vocabulary: financial/legal terms from this verse'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا تَدَايَنتُم بِدَيْنٍ إِلَى أَجَلٍ مُّسَمًّى فَاكْتُبُوهُ',
      transliteration: "Ya ayyuhal-ladhina amanu idha tadayantum bidaynin ila ajalin musamman faktubuh",
      meaning: 'O you who believe, when you contract a debt for a specified term, write it down.',
      note: 'تَدَايَنتُم (Form VI: mutual debt between two parties) + فَاكْتُبُوهُ (fa imperative: immediate consequence) — the grammar of financial justice.',
    },
  },
  {
    id: 'i212',
    stage: 'intermediate',
    title: 'Surah al-Baqarah: The Story of the Cow',
    objective: 'Read and analyse the narrative of Bani Israel and the cow (Surah al-Baqarah 67-73).',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Read verses 67-73 with harakat', 'Narrate the story in Arabic from memory', 'Grammatical analysis: interrogatives, dialogue, commands'],
    quranBridge: {
      arabic: 'قَالُوا ادْعُ لَنَا رَبَّكَ يُبَيِّن لَّنَا مَا هِيَ',
      transliteration: "Qalud'u lana rabbaka yubayyin lana ma hiya",
      meaning: 'They said: Call upon your Lord for us that He may make clear to us what it is.',
      note: 'يُبَيِّن (jussive as response to request — jazm bil-talab) — grammar captures the children of Israel\'s repeated hesitation.',
    },
  },
  {
    id: 'i213',
    stage: 'intermediate',
    title: 'Surah al-Imran: Battle of Uhud Lessons',
    objective: 'Study al-Imran 140-175 — the Quran\'s reflection on the Battle of Uhud.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Imran 140-175 with harakat', 'Extract 5 lessons in Arabic sentences', 'Key vocabulary: battle, wound, steadfastness'],
    quranBridge: {
      arabic: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
      transliteration: "Wala tahinu wala tahzanu wa-antumul-aalawna in kuntum mumineen",
      meaning: 'Do not weaken and do not grieve, for you will be superior if you are believers.',
      note: 'وَأَنتُمُ الْأَعْلَوْنَ (circumstantial sentence: while you are the highest) — the Quran lifts hearts through grammar of existing elevation.',
    },
  },
  {
    id: 'i214',
    stage: 'intermediate',
    title: 'Surah an-Nisa: Family Law Vocabulary',
    objective: 'Study an-Nisa 11-12 inheritance verses — reading, vocabulary, legal terminology.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read an-Nisa 11-12 three times', 'Inheritance fraction vocabulary', 'Parse 5 complex legal phrases'],
    quranBridge: {
      arabic: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ',
      transliteration: "Yusikumullahu fi awladikum lidhdhakari mithlu hazzil-unthayayn",
      meaning: 'Allah instructs you concerning your children: for the male the equivalent of the share of two females.',
      note: 'يُوصِيكُمُ (Form IV imperfect: divine instruction in present tense) — the law is living, ongoing; not past tense.',
    },
  },
  {
    id: 'i215',
    stage: 'intermediate',
    title: 'Surah al-Maidah: Food and Covenant Verses',
    objective: 'Study al-Maidah 1-5 — obligations, covenants, permitted foods.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Maidah 1-5 with harakat', 'Food vocabulary extraction', 'Identify all imperatives and prohibitions'],
    quranBridge: {
      arabic: 'أُحِلَّ لَكُمُ الطَّيِّبَاتُ',
      transliteration: "Uhilla lakumut-tayyibat",
      meaning: 'Made lawful for you are the good/pure things.',
      note: 'أُحِلَّ (passive perfect: was made lawful — divine passive) — the agent is Allah, omitted purposefully for reverence.',
    },
  },
  {
    id: 'i216',
    stage: 'intermediate',
    title: 'Surah al-Anfal: Concepts of Victory and Unity',
    objective: 'Study al-Anfal 45-66 — lessons in unity, obedience, and divine support.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Anfal 45-66', 'Extract 5 conditions for divine victory', 'Key vocabulary: obedience, ranks, steadfastness'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا لَقِيتُمْ فِئَةً فَاثْبُتُوا',
      transliteration: "Ya ayyuhal-ladhina amanu idha laqitum fiatan fasthutu",
      meaning: 'O you who believe, when you meet a company (in battle) — stand firm.',
      note: 'فَاثْبُتُوا (fa of consequence + imperative: THEN stand firm) — the conditional grammar of courage.',
    },
  },
  {
    id: 'i217',
    stage: 'intermediate',
    title: 'Surah at-Tawbah: Baraa and Its Grammar',
    objective: 'Study at-Tawbah 1-5 — the declaration of disassociation and its unique opening (no bismillah).',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Read at-Tawbah 1-5 with harakat', 'Why no bismillah? — classical explanations', 'Vocabulary: treaty, term, exception'],
    quranBridge: {
      arabic: 'بَرَاءَةٌ مِّنَ اللَّهِ وَرَسُولِهِ إِلَى الَّذِينَ عَاهَدتُّم',
      transliteration: "Baraatun minallahi wa-rasulihi ilal-ladhina ahadtum",
      meaning: 'A declaration of disassociation from Allah and His Messenger to those with whom you had made a treaty.',
      note: 'بَرَاءَةٌ (indefinite subject with tanwin: a declaration — making the announcement solemn but not named) — grammar of deliberate distance.',
    },
  },
  {
    id: 'i218',
    stage: 'intermediate',
    title: 'Arabic Debate Vocabulary: Arguing Both Sides',
    objective: 'Learn 30 argumentative Arabic phrases for presenting, countering, and concluding debates.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['30 debate phrase flashcards', 'Construct an argument for and against one Islamic social issue', 'Transition phrases: on the other hand, however, therefore'],
    quranBridge: {
      arabic: 'قُلْ هَاتُوا بُرْهَانَكُمْ إِن كُنتُمْ صَادِقِينَ',
      transliteration: "Qul hatu burhanakum in kuntum sadiqeen",
      meaning: 'Say: Produce your proof if you are truthful.',
      note: 'هَاتُوا بُرْهَانَكُمْ (imperative plural: bring/produce) — the Quran models intellectual challenge with one word; debate requires evidence.',
    },
  },
  {
    id: 'i219',
    stage: 'intermediate',
    title: 'Arabic Academic Vocabulary',
    objective: 'Master 40 Arabic academic vocabulary words used in Islamic university settings.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['40 academic vocabulary flashcards', 'University course name vocabulary', 'Write a mock university application in Arabic (5 sentences)'],
    quranBridge: {
      arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
      transliteration: "Waqur rabbi zidni ilma",
      meaning: 'And say: My Lord, increase me in knowledge.',
      note: 'زِدْنِي عِلْمًا (Form IV imperative + tamyiz: increase me in respect to knowledge) — the only command to the Prophet to seek more of anything.',
    },
  },
  {
    id: 'i220',
    stage: 'intermediate',
    title: 'Intermediate Milestone i220: Quran Deep Readings',
    objective: 'Review Quran deep studies (i211-i219) with 35-question test on vocabulary, grammar, and comprehension.',
    duration: '75 min',
    challengeLevel: 'Capstone',
    drills: ['35-question test on deep Quran readings', 'Translate 5 unseen verses from Juz 1-10', 'Write a 100-word reflection on one surah in Arabic'],
    quranBridge: {
      arabic: 'إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
      transliteration: "Inna hadhal-qurana yahdi lillati hiya aqwam",
      meaning: 'Indeed, this Quran guides to that which is most upright.',
      note: 'لِلَّتِي هِيَ أَقْوَمُ (the most correct/upright path — elative without noun: absolute best) — the Quran is its own best guide.',
    },
  },
  {
    id: 'i221',
    stage: 'intermediate',
    title: 'Speech Act Theory in Arabic: Promises and Oaths',
    objective: 'Master Arabic oath structures: wallahi, billahi, tallahi, qasam constructions.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['4 oath particle constructions', 'Quranic oath analysis: by the sun, by the fig, by time', 'Construct 3 oath sentences correctly'],
    quranBridge: {
      arabic: 'وَالتِّينِ وَالزَّيْتُونِ وَطُورِ سِينِينَ',
      transliteration: "Wat-teeni waz-zaytuni waturi siinin",
      meaning: 'By the fig, and the olive, and Mount Sinai.',
      note: 'Waw al-qasam (oath waw) + three sacred symbols — Quranic oath grammar is never arbitrary; the sworn-by items echo the content.',
    },
  },
  {
    id: 'i222',
    stage: 'intermediate',
    title: 'Rhetorical Questions (Istifham Inkari and Taajjubi)',
    objective: 'Master Arabic rhetorical questions: inkari (denying) and taajjubi (expression of wonder).',
    duration: '28 min',
    challengeLevel: 'Advanced',
    drills: ['Inkari vs taajjubi distinction', 'Transform 5 regular questions into rhetorical', 'Find 5 Quranic rhetorical questions'],
    quranBridge: {
      arabic: 'أَلَيْسَ اللَّهُ بِكَافٍ عَبْدَهُ',
      transliteration: "Alaysal-lahu bikafin abdah",
      meaning: 'Is Allah not sufficient for His servant?',
      note: 'أَلَيْسَ + بِ (negative particle shifted to affirmative by rhetorical question) — the grammar of divine sufficiency expressed through question.',
    },
  },
  {
    id: 'i223',
    stage: 'intermediate',
    title: 'Metaphor and Simile in the Quran',
    objective: 'Identify and analyse 10 major Quranic metaphors (istiara) and similes (tashbih).',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['10 major Quranic metaphors', 'Identify wajh al-shabah (point of comparison) for each', 'Explain the emotional impact of 3 metaphors'],
    quranBridge: {
      arabic: 'مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ',
      transliteration: "Mathalu nurihi kamishkatin fiha misbah",
      meaning: 'The parable of His light is like a niche within which is a lamp.',
      note: 'كَمِشْكَاةٍ (kaf al-tashbih: like a niche) — the Light Verse is the Quran\'s most elaborate extended metaphor; every word carries comparison.',
    },
  },
  {
    id: 'i224',
    stage: 'intermediate',
    title: 'Personification and Anthropomorphism in Quran',
    objective: 'Understand how the Quran gives voice to creation — day, night, earth, and mountains.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['5 Quranic personification examples', 'Distinguish tashkhis (personification) from isti\'ara', 'Analyse the effect of personification in 3 verses'],
    quranBridge: {
      arabic: 'يَوْمَئِذٍ تُحَدِّثُ أَخْبَارَهَا',
      transliteration: "Yawmaidhin tuhaddith akhbaraha",
      meaning: 'That day it (the earth) will report its news.',
      note: 'تُحَدِّثُ (Form II imperfect: the earth will actively narrate) — the earth as witness and narrator; grammar gives creation a voice.',
    },
  },
  {
    id: 'i225',
    stage: 'intermediate',
    title: 'Transitional Devices in Arabic Discourse',
    objective: 'Master 20 Arabic discourse markers for connecting ideas in formal and written Arabic.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['20 discourse marker flashcards', 'Categorise: additive, contrastive, causal, conclusive', 'Write a paragraph using 5 discourse markers'],
    quranBridge: {
      arabic: 'فَأَمَّا مَن أَعْطَى وَاتَّقَى وَصَدَّقَ بِالْحُسْنَى فَسَنُيَسِّرُهُ لِلْيُسْرَى',
      transliteration: "Fa-amma man aata wattaqa wasaddaqa bil-husna fasanuyassirahu lilyusra",
      meaning: 'As for one who gives and fears Allah and believes in the best — We will ease his way to ease.',
      note: 'فَأَمَّا ... فَ (amma-fa construction: topic-comment discourse marker) — al-Layl\'s rhetorical bipartition through discourse grammar.',
    },
  },
  {
    id: 'i226',
    stage: 'intermediate',
    title: 'Sentence Information Structure: Topic and Focus',
    objective: 'Understand Arabic topic-comment structure (mubtada-khabar) and how sentence position adds focus.',
    duration: '32 min',
    challengeLevel: 'Advanced',
    drills: ['5 topicalisation exercises', 'Fronting: move element to front for focus in 5 sentences', 'Analyse fronted elements in 5 Quranic verses'],
    quranBridge: {
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      transliteration: "Iyyaka nabudu wa-iyyaka nastain",
      meaning: 'It is You alone we worship and You alone we ask for help.',
      note: 'إِيَّاكَ (object fronted before verb for exclusive focus) — moving the object before the verb in Arabic means: ONLY You, no one else.',
    },
  },
  {
    id: 'i227',
    stage: 'intermediate',
    title: 'Morphological Patterns Review: Awzan Summary',
    objective: 'Review all 15 most common masdar patterns (awzan) and their semantic tendencies.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['15 awzan pattern flashcards', 'Generate 3 words for each pattern', 'Identify pattern from 20 given words'],
    quranBridge: {
      arabic: 'وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ',
      transliteration: "Wassama-a banaynahaa bi-aydin",
      meaning: 'And the heaven — We constructed it with power.',
      note: 'بِأَيْدٍ (bi + masdari meaning: with great power — the plural أَيْد is an intensive masdar form) — power expressed through morphological weight.',
    },
  },
  {
    id: 'i228',
    stage: 'intermediate',
    title: 'Diminutive (Tasghir) in Arabic',
    objective: 'Master Arabic diminutive forms (فُعَيْل / فُعَيْعِل) and their usage for small size, affection, or contempt.',
    duration: '25 min',
    challengeLevel: 'Advanced',
    drills: ['Tasghir pattern construction rules', 'Make 10 words into diminutive form', 'Find diminutive in Quran and hadith'],
    quranBridge: {
      arabic: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ',
      transliteration: "Faman yamal mithqala dharratin khayran yarah",
      meaning: 'And whoever does an atom\'s weight of good will see it.',
      note: 'ذَرَّةٍ (atomically small — the tiniest Arabic unit of measurement) — the grammar of absolute accountability for the smallest deed.',
    },
  },
  {
    id: 'i229',
    stage: 'intermediate',
    title: 'Intensive Forms (Sighah al-Mubalaghah)',
    objective: 'Master Arabic intensive forms (فَعَّال، فَعُول، فَعِيل، فَعِل، مِفْعَال) showing habitual or intense action.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['5 intensive form pattern flashcards', 'Convert 10 verbs to intensive forms', 'Find 10 intensive forms in Quran'],
    quranBridge: {
      arabic: 'وَكَانَ اللَّهُ غَفُورًا رَّحِيمًا',
      transliteration: "Wakana Allahu ghafuran rahima",
      meaning: 'And Allah is ever Forgiving, Merciful.',
      note: 'غَفُورًا (فَعُول intensive: habitually, abundantly forgiving) + رَّحِيمًا (فَعِيل: deeply merciful) — two intensive patterns encoding divine character.',
    },
  },
  {
    id: 'i230',
    stage: 'intermediate',
    title: 'Intermediate Milestone i230: Rhetoric and Morphology',
    objective: 'Review rhetoric (metaphor, simile, oaths), discourse markers, tasghir, and intensive forms.',
    duration: '70 min',
    challengeLevel: 'Capstone',
    drills: ['35-question mixed test', 'Analyse 5 verses for rhetorical devices', 'Construct 5 sentences using intensive and diminutive forms'],
    quranBridge: {
      arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
      transliteration: "Walaqad yassarnal-qurana lidhdhikri fahal min muddakir",
      meaning: 'And We have certainly made the Quran easy to remember — so is there any who will remember?',
      note: 'مُدَّكِرٍ (Form VIII with assimilation: one who takes heed) + فَهَلْ (interrogative of invitation) — the Quran at milestone i230 still asks: are you remembering?',
    },
  },
  {
    id: 'i231',
    stage: 'intermediate',
    title: 'Reading Classical Hadith Commentary',
    objective: 'Read a passage from Ibn Hajar\'s Fath al-Bari (Bukhari commentary) in classical Arabic.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Read 200 words from Fath al-Bari', 'Identify grammatical analysis points', 'Vocabulary: hadith science terminology'],
    quranBridge: {
      arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ',
      transliteration: "Innama l-a'malu bin-niyyat",
      meaning: 'Deeds are by intentions.',
      note: 'إِنَّمَا (restriction particle: ONLY/NOTHING BUT) — ibn Hajar opens Fath al-Bari with extensive grammatical analysis of this restriction.',
    },
  },
  {
    id: 'i232',
    stage: 'intermediate',
    title: 'Reading Classical Hadith Commentary: Nawawi',
    objective: 'Read a passage from al-Nawawi\'s commentary on Sahih Muslim in classical Arabic.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Read 200 words from al-Nawawi commentary', 'Legal rulings from the passage', 'Compare ibn Hajar and al-Nawawi commentary styles'],
    quranBridge: {
      arabic: 'الدِّينُ النَّصِيحَةُ',
      transliteration: "Ad-dinu nasiha",
      meaning: 'The religion is sincere advice.',
      note: 'الدِّينُ النَّصِيحَةُ (equational sentence: subject = predicate) — al-Nawawi\'s commentary unpacks how nasiha is every deed and relationship.',
    },
  },
  {
    id: 'i233',
    stage: 'intermediate',
    title: 'Arabic Passive Voice: Complete Review',
    objective: 'Comprehensive review of passive voice in all verb forms, tenses, and participle types.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Passive voice transformation: 20 sentences', 'Divine passive (majhul for respect) in Quran: 10 examples', 'Naib al-fail grammar: 15 exercises'],
    quranBridge: {
      arabic: 'خُلِقَ الْإِنسَانُ مِنْ عَجَلٍ',
      transliteration: "Khuliqa l-insanu min ajal",
      meaning: 'Man was created of haste.',
      note: 'خُلِقَ (passive perfect: was created — agent omitted; Allah implied) — the divine passive assigns nature to humanity while veiling the Artist.',
    },
  },
  {
    id: 'i234',
    stage: 'intermediate',
    title: 'Verb Doubly-Transitive Constructions',
    objective: 'Master Arabic verbs that take two objects (mafool bihi awwal and thani) without a preposition.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Doubly-transitive verb list: aara, alama, kafaa, mana', 'Identify both objects in 10 Quranic sentences', 'Construct 5 doubly-transitive sentences'],
    quranBridge: {
      arabic: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',
      transliteration: "Wa-allama adama l-asmaa kullaha",
      meaning: 'And He taught Adam all the names.',
      note: 'عَلَّمَ (Form II doubly-transitive: taught [who=Adam][what=the names]) — two objects, no preposition; pure transitive grammar.',
    },
  },
  {
    id: 'i235',
    stage: 'intermediate',
    title: 'Reported Perception and Cognition Verbs',
    objective: 'Master verbs of seeing, thinking, and finding (ra\'a, wajada, hasiba, dhanna) with their mafool bihi constructions.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['5 cognition verb constructions', 'Identify subject/predicate after perception verb', 'Construct 5 sentences with wajada + two objects'],
    quranBridge: {
      arabic: 'وَجَدَكَ ضَالًّا فَهَدَى',
      transliteration: "Wajadaka dallan fahada",
      meaning: 'And He found you lost and guided you.',
      note: 'وَجَدَكَ ضَالًّا (wajada + you as object + lost as second predicate object) — wajada as a doubly-transitive perception verb.',
    },
  },
  {
    id: 'i236',
    stage: 'intermediate',
    title: 'Surah al-Kahf: Ahl al-Kahf Full Analysis',
    objective: 'Deep study of al-Kahf 1-26 — the people of the cave: vocabulary, narrative, and lessons.',
    duration: '60 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Kahf 1-26 with full harakat', 'Timeline narration: cave, dog, sleep, awakening', 'Extract 5 grammar highlights'],
    quranBridge: {
      arabic: 'إِذْ أَوَى الْفِتْيَةُ إِلَى الْكَهْفِ فَقَالُوا رَبَّنَا آتِنَا مِن لَّدُنكَ رَحْمَةً',
      transliteration: "Idh awal-fityatu ilal-kahfi faqalu rabbana atina min ladunka rahma",
      meaning: 'When the youths retreated to the cave and said: Our Lord, grant us from Yourself mercy.',
      note: 'مِن لَّدُنكَ (from directly near You — not just from You but from Your immediate presence) — the grammar of intimate supplication.',
    },
  },
  {
    id: 'i237',
    stage: 'intermediate',
    title: 'Surah al-Kahf: Dhul-Qarnayn Full Analysis',
    objective: 'Deep study of al-Kahf 83-98 — Dhul-Qarnayn\'s travels and Yajuj & Majuj.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Kahf 83-98 with harakat', 'Map Dhul-Qarnayn\'s three journeys', 'Grammar: conditional structures, response clauses'],
    quranBridge: {
      arabic: 'قَالَ مَا مَكَّنِّي فِيهِ رَبِّي خَيْرٌ فَأَعِينُونِي بِقُوَّةٍ',
      transliteration: "Qala ma makkannee feehi rabbi khayrun fa-aeenooni biquwwa",
      meaning: 'He said: That in which my Lord has established me is better; so assist me with strength.',
      note: 'مَا مَكَّنَنِّي فِيهِ (relative clause subject: what my Lord has established me in) — Dhul-Qarnayn refuses payment; grammar of gratitude.',
    },
  },
  {
    id: 'i238',
    stage: 'intermediate',
    title: 'Surah Yusuf: Grammatical Analysis of the Story',
    objective: 'Grammatical deep-dive into Surah Yusuf — the "best of stories" — narrative and discourse analysis.',
    duration: '65 min',
    challengeLevel: 'Advanced',
    drills: ['Read Yusuf 1-20 with harakat', 'Identify 5 discourse shifts in the narrative', 'Dream vocabulary and imagery analysis'],
    quranBridge: {
      arabic: 'نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ',
      transliteration: "Nahnu naqussu alayka ahsanal-qasas",
      meaning: 'We relate to you the best of stories.',
      note: 'أَحْسَنَ الْقَصَصِ (elative in idafa: the best of all stories) — Quran itself titles this surah with superlative grammar.',
    },
  },
  {
    id: 'i239',
    stage: 'intermediate',
    title: 'Surah al-Qasas: Musa and Pharaoh Comparison',
    objective: 'Study al-Qasas 1-43 — Musa\'s birth, calling, and confrontation with Pharaoh.',
    duration: '60 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Qasas 1-43 with harakat', 'Vocabulary: commands, divine protection, oppression', 'Contrast Musa\'s speech and Pharaoh\'s speech grammatically'],
    quranBridge: {
      arabic: 'وَأَوْحَيْنَا إِلَى أُمِّ مُوسَى أَنْ أَرْضِعِيهِ',
      transliteration: "Wa-awhaya ila ummi musa an ardieehi",
      meaning: 'And We inspired to the mother of Musa: nurse him.',
      note: 'أَوْحَيْنَا (Form IV: We revealed/inspired — the verb of divine communication) — even a mother\'s instinct is wahi in Quranic grammar.',
    },
  },
  {
    id: 'i240',
    stage: 'intermediate',
    title: 'Intermediate Milestone i240: Quran Stories and Grammar',
    objective: 'Review Quran story analyses (i236-i239) and all advanced grammar covered since i221.',
    duration: '80 min',
    challengeLevel: 'Capstone',
    drills: ['40-question mixed test', 'Translate unseen passage from Surah Yusuf', 'Write a 100-word summary of al-Kahf stories in Arabic'],
    quranBridge: {
      arabic: 'لَقَدْ كَانَ فِي قَصَصِهِمْ عِبْرَةٌ لِّأُولِي الْأَلْبَابِ',
      transliteration: "Laqad kana fi qasasihim ibratan li-ulil-albab",
      meaning: 'There was certainly in their stories a lesson for those of understanding.',
      note: 'عِبْرَةٌ (indefinite: A lesson — not just any lesson but a specific spiritual lesson) + لِّأُولِي الْأَلْبَابِ (those possessing minds) — Arabic narrates so minds may benefit.',
    },
  },
  {
    id: 'i241',
    stage: 'intermediate',
    title: 'Surah an-Naml: Solomon and the Hoopoe',
    objective: 'Study an-Naml 20-44 — the story of Sulayman, the Hoopoe, and the Queen of Sheba.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Read an-Naml 20-44 with harakat', 'Dialogue vocabulary: speech, reports, diplomacy', 'Identify 5 grammar highlights in the narrative'],
    quranBridge: {
      arabic: 'وَأُوتِيَتْ مِن كُلِّ شَيْءٍ وَلَهَا عَرْشٌ عَظِيمٌ',
      transliteration: "Wa-utiyat min kulli shayin walaha arshun azim",
      meaning: 'She has been given of all things, and she has a great throne.',
      note: 'أُوتِيَتْ (passive perfect feminine: she was given) — the hoopoe\'s report uses passive to emphasise the giver, not the receiver.',
    },
  },
  {
    id: 'i242',
    stage: 'intermediate',
    title: 'Surah al-Ankabut: Tests and Patience',
    objective: 'Study al-Ankabut 1-20 — the theme of divine testing and the spider\'s house metaphor.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Ankabut 1-20 with harakat', 'Spider web metaphor analysis', 'Vocabulary: trial, test, patient endurance'],
    quranBridge: {
      arabic: 'مَثَلُ الَّذِينَ اتَّخَذُوا مِن دُونِ اللَّهِ أَوْلِيَاءَ كَمَثَلِ الْعَنكَبُوتِ',
      transliteration: "Mathalul-ladhina ittakhadhu min dunillahi awliyaa kamathali l-ankabut",
      meaning: 'The example of those who take patrons besides Allah is like the spider.',
      note: 'كَمَثَلِ الْعَنكَبُوتِ (simile: like the spider\'s house) — the Quran\'s most famous structural metaphor — fragility dressed as security.',
    },
  },
  {
    id: 'i243',
    stage: 'intermediate',
    title: 'Surah ar-Rum: Civilisational Rise and Fall',
    objective: 'Study ar-Rum 1-30 — predictions, signs in creation, and human nature.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read ar-Rum 1-30 with harakat', 'Prophecy vocabulary', 'Signs (ayat) in creation — categories and examples'],
    quranBridge: {
      arabic: 'وَمِنْ آيَاتِهِ أَنْ خَلَقَكُم مِّن تُرَابٍ ثُمَّ إِذَا أَنتُم بَشَرٌ تَنتَشِرُونَ',
      transliteration: "Wamin ayatihi an khalaqakum min turabin thumma idha antum basharun tantashirun",
      meaning: 'And of His signs is that He created you from dust — then suddenly you are human beings spreading about.',
      note: 'إِذَا فَجَائِيَّة (sudden or surprise idha — then suddenly!) — the grammar of divine creation surprises with sudden existence.',
    },
  },
  {
    id: 'i244',
    stage: 'intermediate',
    title: 'Surah Luqman: Wisdom of a Father',
    objective: 'Study Luqman 12-19 — the wisdom passages of Luqman to his son.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Read Luqman 12-19 with harakat', 'Advice vocabulary: command, prohibit, explain', 'Analyse Luqman\'s 7 pieces of advice grammatically'],
    quranBridge: {
      arabic: 'يَا بُنَيَّ لَا تُشْرِكْ بِاللَّهِ إِنَّ الشِّرْكَ لَظُلْمٌ عَظِيمٌ',
      transliteration: "Ya bunayya la tushrik billahi inash-shirka ladhulmun azim",
      meaning: 'O my dear son, do not associate partners with Allah. Indeed, shirk is a tremendous wrongdoing.',
      note: 'يَا بُنَيَّ (diminutive of ibn: dear little son — affection through grammar) — the most loving address before the gravest prohibition.',
    },
  },
  {
    id: 'i245',
    stage: 'intermediate',
    title: 'Surah al-Ahzab: Social Conduct and Prophet\'s Household',
    objective: 'Study al-Ahzab 33-60 — Islamic social ethics, hijab, and the Prophet\'s ﷺ household.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Ahzab 33-60 with harakat', 'Vocabulay: honour, social conduct, household', 'Identify 5 commandment structures'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا النَّبِيُّ قُل لِّأَزْوَاجِكَ وَبَنَاتِكَ وَنِسَاءِ الْمُؤْمِنِينَ يُدْنِينَ عَلَيْهِنَّ مِن جَلَابِيبِهِنَّ',
      transliteration: "Ya ayyuhan-nabiyyu qul li-azwajika wabanatika wanisail-mumineena yudnina alayhinna min jalabeebihinn",
      meaning: 'O Prophet, tell your wives, daughters, and believing women to draw their outer garments close to them.',
      note: 'يُدْنِينَ (jussive as indirect command: let them draw close) — the grammar makes this a divine instruction mediated through the Prophet.',
    },
  },
  {
    id: 'i246',
    stage: 'intermediate',
    title: 'Surah al-Hujurat: Community Ethics',
    objective: 'Deep study of al-Hujurat — the Quran\'s complete social ethics chapter.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read all of al-Hujurat with harakat', 'List all 12 prohibitions and commands', 'Grammar: conditional sentences, addresses, prohibitions'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اجْتَنِبُوا كَثِيرًا مِّنَ الظَّنِّ إِنَّ بَعْضَ الظَّنِّ إِثْمٌ',
      transliteration: "Ya ayyuhal-ladhina amanu ijtanibu kathiran minadh-dhanni inna bada dh-dhanni ithmun",
      meaning: 'O you who believe, avoid much suspicion, for some suspicion is sin.',
      note: 'كَثِيرًا (tamyiz/direct object: much of) — the command is not to avoid all suspicion but كَثِيرًا (much of it); moderation in grammar mirrors moderation in life.',
    },
  },
  {
    id: 'i247',
    stage: 'intermediate',
    title: 'Surah al-Hadid: Worldly Life as Metaphor',
    objective: 'Study al-Hadid 20-25 — the garden of life metaphor and the qualities of iron.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Hadid 20-25 with harakat', 'Life metaphor vocabulary: rain, vegetation, withering', 'Grammar: kadhaalik (analogy) constructions'],
    quranBridge: {
      arabic: 'اعْلَمُوا أَنَّمَا الْحَيَاةُ الدُّنْيَا لَعِبٌ وَلَهْوٌ وَزِينَةٌ وَتَفَاخُرٌ بَيْنَكُمْ',
      transliteration: "Iilamu annama l-hayaatu d-dunya laibun walahwun wazinatun watafakhurun baynakum",
      meaning: 'Know that the life of this world is play, amusement, adornment, and boasting among you.',
      note: 'أَنَّمَا (restriction: ONLY is) — five nouns exhausting the dunya\'s essence; grammar lists all worldly pursuits to deflate them.',
    },
  },
  {
    id: 'i248',
    stage: 'intermediate',
    title: 'Surah al-Muzzammil and al-Muddaththir: Prophet\'s Commands',
    objective: 'Comparative study of al-Muzzammil and al-Muddaththir — early revelations commanding the Prophet ﷺ.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Read both surahs with harakat', 'Compare the 5 commands given in each', 'Vocabulary: night prayer, mantle, rising, warning'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الْمُزَّمِّلُ قُمِ اللَّيْلَ إِلَّا قَلِيلًا',
      transliteration: "Ya ayyuhal-muzzammilu qumil-layla illa qalila",
      meaning: 'O you who wraps himself — arise the night except a little.',
      note: 'الْمُزَّمِّلُ (Form V participle: one wrapping himself — intimate address using state, not name) — the Prophet is called by his action at the moment of first calling.',
    },
  },
  {
    id: 'i249',
    stage: 'intermediate',
    title: 'Surah al-Qalam: The Character of the Prophet',
    objective: 'Study al-Qalam — the surah defending the Prophet\'s ﷺ character and praising his khuluq.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Qalam with harakat', 'Vocabulary: character, madness, insanity refutation', 'Grammar: oath + response, conditional emphasis'],
    quranBridge: {
      arabic: 'وَإِنَّكَ لَعَلَى خُلُقٍ عَظِيمٍ',
      transliteration: "Wa-innaka laala khuluqin azim",
      meaning: 'And indeed, you are of a great moral character.',
      note: 'لَعَلَى (lam of oath + ala: truly upon) — being ON character, not merely having it; the grammar of embodied ethics.',
    },
  },
  {
    id: 'i250',
    stage: 'intermediate',
    title: 'Intermediate Milestone i250: Stories and Ethics Review',
    objective: 'Review Quranic story grammar (i241-i249) with 40-question comprehensive test.',
    duration: '80 min',
    challengeLevel: 'Capstone',
    drills: ['40-question comprehensive test', 'Parse 5 complete verses from memory', 'Write a 120-word essay on lessons from Surah al-Qalam in Arabic'],
    quranBridge: {
      arabic: 'وَمَا يَنطِقُ عَنِ الْهَوَى إِنْ هُوَ إِلَّا وَحْيٌ يُوحَى',
      transliteration: "Wama yantiqu anil-hawa in huwa illa wahyun yuha",
      meaning: 'Nor does he speak from desire — it is not but a revelation revealed.',
      note: 'إِنْ هُوَ إِلَّا (restriction: it is nothing but) — grammar absolutely rules out personal desire; the Prophet\'s speech is wahi.',
    },
  },
  {
    id: 'i251',
    stage: 'intermediate',
    title: 'Arabic Proverbs: Classical Amthal',
    objective: 'Learn 20 classical Arabic proverbs (amthal) and understand their grammatical structure.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['20 classical proverbs flashcards', 'Identify the grammatical type of each (imperative, conditional, nominal)', 'Use 5 proverbs in context sentences'],
    quranBridge: {
      arabic: 'وَتِلْكَ الْأَمْثَالُ نَضْرِبُهَا لِلنَّاسِ',
      transliteration: "Watilkal-amthalu nadribuha lin-nas",
      meaning: 'And these parables We present to the people.',
      note: 'نَضْرِبُ (Form I imperfect: We strike/present — idiom: ضَرَبَ مَثَلاً = to give a parable) — Arabic parables are struck like coins.',
    },
  },
  {
    id: 'i252',
    stage: 'intermediate',
    title: 'Idiomatic Arabic Expressions',
    objective: 'Learn 25 idiomatic Arabic expressions that cannot be translated literally.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['25 idiom flashcards', 'Identify the literal vs figurative meaning for each', 'Write 5 sentences using idioms correctly'],
    quranBridge: {
      arabic: 'ضَرَبَ اللَّهُ مَثَلًا',
      transliteration: "Daraballahu mathala",
      meaning: 'Allah has struck a parable.',
      note: 'ضَرَبَ مَثَلاً (idiomatic: to give/strike a parable — not literally strike) — Quranic Arabic uses idioms consistently; know them to understand.',
    },
  },
  {
    id: 'i253',
    stage: 'intermediate',
    title: 'Arabic Synonyms and Near-Synonyms',
    objective: 'Study 20 pairs of Arabic near-synonyms and understand their subtle semantic differences.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['20 synonym pair flashcards', 'Distinguish: khawf/khashya, rahma/ra\'fa, ilm/marifah', 'Find each pair used differently in Quran'],
    quranBridge: {
      arabic: 'وَلَا تَقُولَنَّ لِشَيْءٍ إِنِّي فَاعِلٌ ذَلِكَ غَدًا إِلَّا أَن يَشَاءَ اللَّهُ',
      transliteration: "Wala taqulanna lishayin innee failun dhalika ghadan illa an yashaAllah",
      meaning: 'And never say of anything: I will do that tomorrow, except when followed by: if Allah wills.',
      note: 'إِنِّي فَاعِلٌ (nominal predicate: I am a doer of that) — future intention stated as noun phrase; then qualified with divine will exception.',
    },
  },
  {
    id: 'i254',
    stage: 'intermediate',
    title: 'Arabic Antonyms and Opposition in Quran',
    objective: 'Study 20 classical Arabic antonym pairs and how the Quran uses opposition (tibaq) for effect.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['20 antonym pair flashcards', 'Find 5 Quranic verses using antonym pairs', 'Analyse the rhetorical effect of contrast'],
    quranBridge: {
      arabic: 'وَأَنَّهُ هُوَ أَضْحَكَ وَأَبْكَى وَأَنَّهُ هُوَ أَمَاتَ وَأَحْيَا',
      transliteration: "Wa-annahu huwa adhaka wa-abka wa-annahu huwa amata wa-ahya",
      meaning: 'And that it is He who makes laugh and makes weep; and it is He who causes death and gives life.',
      note: 'أَضْحَكَ/أَبْكَى and أَمَاتَ/أَحْيَا (perfect tibaq: laugh-weep, die-live) — all opposites meet in Allah; grammar of absolute divine power.',
    },
  },
  {
    id: 'i255',
    stage: 'intermediate',
    title: 'Poetry Metre: Bahr al-Tawil and al-Kamil',
    objective: 'Understand the two most common Arabic poetic metres — tawil and kamil — and scan a couplet in each.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Bahr al-Tawil pattern (فَعُولُن مَفَاعِيلُن)', 'Bahr al-Kamil pattern (مُتَفَاعِلُن)', 'Scan 2 classical couplets for metre'],
    quranBridge: {
      arabic: 'وَمَا عَلَّمْنَاهُ الشِّعْرَ وَمَا يَنبَغِي لَهُ',
      transliteration: "Wama allamnahu sh-shira wama yanbaghi lah",
      meaning: 'And We did not teach him poetry, nor is it fitting for him.',
      note: 'الشِّعْرَ (definite: the specific art of poetry) — the Quran is NOT poetry; yet its classical Arabic students must understand poetic metre.',
    },
  },
  {
    id: 'i256',
    stage: 'intermediate',
    title: 'Quranic Rhyme and Sound Patterns',
    objective: 'Analyse the fasila (Quranic rhyme) and sound patterns in 5 surahs.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Fasila patterns in al-Rahman, al-Qamar, al-Shams', 'Identify how sound reinforces meaning in 5 verses', 'Read each surah aloud focusing on rhyme'],
    quranBridge: {
      arabic: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
      transliteration: "Fabiyyi aalai rabbikuma tukadhdhiban",
      meaning: 'So which of the favours of your Lord will you two deny?',
      note: 'تُكَذِّبَانِ (repeated 31 times — same fasila throughout) — the Quran\'s most famous rhetorical repetition; each recurrence deepens the confrontation.',
    },
  },
  {
    id: 'i257',
    stage: 'intermediate',
    title: 'Intermediate Translation: Arabic-to-English',
    objective: 'Translate 5 intermediately complex Arabic passages into English, focusing on precision.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['5 passage translation exercises (50-100 words each)', 'Review: accuracy vs fluency trade-offs', 'Compare translations with published English tafsir'],
    quranBridge: {
      arabic: 'وَلَوْ أَنَّ قُرْآنًا سُيِّرَتْ بِهِ الْجِبَالُ',
      transliteration: "Walaw anna quranan suyyirat bil-jibal",
      meaning: 'And if there were a Quran by which mountains would be moved...',
      note: 'سُيِّرَتْ (Form II passive: set into motion) — conditional hypothetical sentence left incomplete (apodosis implied) for maximum rhetorical effect.',
    },
  },
  {
    id: 'i258',
    stage: 'intermediate',
    title: 'Intermediate Translation: English-to-Arabic',
    objective: 'Translate 5 English sentences about Islamic themes into grammatically accurate Arabic.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['5 English-Arabic translation exercises', 'Choose between nominal and verbal sentence types', 'Peer review checklist: 5 grammar points'],
    quranBridge: {
      arabic: 'وَهُوَ الَّذِي خَلَقَ السَّمَاوَاتِ وَالْأَرْضَ بِالْحَقِّ',
      transliteration: "Wahuwal-ladhi khalaqas-samawati wal-arda bil-haqq",
      meaning: 'And it is He who created the heavens and the earth by truth.',
      note: 'بِالْحَقِّ (in/with truth — hal or mafool bihi: the creation mode itself was truth) — translating hal correctly is the translator\'s art.',
    },
  },
  {
    id: 'i259',
    stage: 'intermediate',
    title: 'Arabic Poetry: Abu al-Atahiyah and Zuhd Poetry',
    objective: 'Read and analyse 3 poems from Abu al-Atahiyah — the master of Arabic zuhd (asceticism) poetry.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['3 Abu al-Atahiyah poem readings', 'Vocabulary: death, worldly life, asceticism', 'Grammar: contrast, address, moralising structures'],
    quranBridge: {
      arabic: 'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ',
      transliteration: "Kullu nafsin dha-iqatul-mawt",
      meaning: 'Every soul will taste death.',
      note: 'ذَائِقَةُ الْمَوْتِ (active participle in idafa: a taster of death) — zuhd poetry and Quranic vocabulary overlap in the grammar of mortality.',
    },
  },
  {
    id: 'i260',
    stage: 'intermediate',
    title: 'Intermediate Milestone i260: Translation and Poetry',
    objective: 'Review translation skills, Arabic proverbs, idioms, synonyms and poetry (i251-i259) with 35-question test.',
    duration: '75 min',
    challengeLevel: 'Capstone',
    drills: ['35-question mixed test', 'Translate an unseen Arabic passage (100 words) into English', 'Write 3 Arabic sentences expressing zuhd theme'],
    quranBridge: {
      arabic: 'إِنَّ الْأَبْرَارَ لَفِي نَعِيمٍ وَإِنَّ الْفُجَّارَ لَفِي جَحِيمٍ',
      transliteration: "Innal-abraara lafi naimin wa-innal-fujjara lafi jaheem",
      meaning: 'Indeed the righteous will be in bliss, and indeed the wicked will be in Hell-fire.',
      note: 'لَفِي (lam of emphasis + fi: truly in) — identical structures for both destinies; grammar shows perfect divine justice through perfect parallelism.',
    },
  },
  {
    id: 'i261',
    stage: 'intermediate',
    title: 'Surah al-Baqarah: Ayat al-Kursi Deep Analysis',
    objective: 'Complete grammatical parsing of Ayat al-Kursi (2:255) — the greatest verse in the Quran.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Parse every word of Ayat al-Kursi', 'Identify all 10 divine attributes mentioned', 'Memorise with grammatical commentary'],
    quranBridge: {
      arabic: 'لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
      transliteration: "La ta-khudhus-sinatun wala nawm",
      meaning: 'Neither drowsiness overtakes Him nor sleep.',
      note: 'سِنَة (lighter drowsiness) before نَوْم (deeper sleep) — even the lightest drowsiness is negated first; grammar builds from minor to major.',
    },
  },
  {
    id: 'i262',
    stage: 'intermediate',
    title: 'Surah al-Fatiha: Complete Grammatical Commentary',
    objective: 'Complete grammatical and rhetorical analysis of every word in Surah al-Fatiha.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Parse every word of al-Fatiha (28 words)', 'Identify every grammatical innovation', 'Write 3 grammatical insights you discovered'],
    quranBridge: {
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: "Al-hamdu lillahi rabbil-alamin",
      meaning: 'All praise is for Allah, Lord of all the worlds.',
      note: 'الْحَمْدُ (definite: ALL praise — not some praise) + لِلَّهِ (lam of belonging: exclusively for) — the grammar of absolute, exclusive gratitude.',
    },
  },
  {
    id: 'i263',
    stage: 'intermediate',
    title: 'Surah al-Ikhlas: Grammatical Theology',
    objective: 'Complete grammatical and theological analysis of Surah al-Ikhlas — worth one-third of the Quran.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Parse every word of al-Ikhlas', 'How does grammar express divine oneness?', 'Compare 4 translations of "Allahu Ahad"'],
    quranBridge: {
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      transliteration: "Qul huwa Allahu Ahad",
      meaning: 'Say: He is Allah, the One.',
      note: 'هُوَ (pronoun subject) + اللَّهُ (predicate/apposition) + أَحَدٌ (second predicate in tanwin: One — not just unique but singularly unique) — grammar of absolute oneness in three words.',
    },
  },
  {
    id: 'i264',
    stage: 'intermediate',
    title: 'Surah al-Falaq and al-Nas: Grammar of Refuge',
    objective: 'Complete grammatical analysis of both refuge surahs — seeking protection through Arabic structure.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Parse al-Falaq word-by-word', 'Parse al-Nas word-by-word', 'Identify the three evils in each and their grammar'],
    quranBridge: {
      arabic: 'قُلْ أَعُوذُ بِرَبِّ النَّاسِ مَلِكِ النَّاسِ إِلَهِ النَّاسِ',
      transliteration: "Qul audhu birabbi n-nasi maliki n-nasi ilahi n-nas",
      meaning: 'Say: I seek refuge in the Lord of mankind, King of mankind, God of mankind.',
      note: 'Three badal (appositions) of رَبّ — each attribute (rabb, malik, ilah) escalates the divine protection being invoked.',
    },
  },
  {
    id: 'i265',
    stage: 'intermediate',
    title: 'The 114 Surahs: Overview and Organisation',
    objective: 'Learn the organisation of the Quran — Makki vs Madani, long to short, arrangement principles.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Makki/Madani classification overview', 'Longest surah to shortest: first 10 and last 10', 'Theme-based surah groupings'],
    quranBridge: {
      arabic: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ',
      transliteration: "Inna nahnu nazzalna dhikra wa-inna lahu lahafizun",
      meaning: 'Indeed, it is We who sent down the Reminder, and indeed, We will be its Guardian.',
      note: 'نَحْنُ (pronoun emphasis: WE — exclusive divine agency) + لَحَافِظُونَ (lam emphasis + active participle) — the Quran\'s order is divinely preserved.',
    },
  },
  {
    id: 'i266',
    stage: 'intermediate',
    title: 'Arabic Grammar: Complete Particle Review',
    objective: 'Comprehensive review of all Arabic particles (huruf): prepositions, conjunctions, negatives, interrogatives.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['60-particle flashcard set', 'Identify particle function in 20 sentences', 'Write 10 sentences using under-used particles'],
    quranBridge: {
      arabic: 'إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ',
      transliteration: "Innama yakhshallaha min ibadihi l-ulama",
      meaning: 'Indeed, the ones who fear Allah from among His servants are those with knowledge.',
      note: 'إِنَّمَا (restriction particle) + مِنْ (partition: from among) — the grammar restricts true divine fear to those with knowledge.',
    },
  },
  {
    id: 'i267',
    stage: 'intermediate',
    title: 'Arabic Grammar: Nouns in All Cases — Comprehensive Drill',
    objective: 'Drill all three Arabic noun cases (nominative, accusative, genitive) in complex sentence types.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['30-sentence case identification drill', 'Case transformation: change case by changing function', 'Parse 5 complete Quranic ayat with all cases marked'],
    quranBridge: {
      arabic: 'مَالِكِ يَوْمِ الدِّينِ',
      transliteration: "Maliki yawmid-din",
      meaning: 'Master of the Day of Recompense.',
      note: 'مَالِكِ (genitive: as adjective of Allah) + يَوْمِ (genitive in idafa) + الدِّينِ (genitive governed by yawm) — three consecutive genitives in al-Fatiha.',
    },
  },
  {
    id: 'i268',
    stage: 'intermediate',
    title: 'Advanced Paragraph Writing in Arabic',
    objective: 'Write a fully connected 5-paragraph Arabic essay on a religious topic with transitions.',
    duration: '65 min',
    challengeLevel: 'Advanced',
    drills: ['5-paragraph essay template', 'Thesis + 3 body paragraphs + conclusion structure', 'Vocabulary: essay transitions and academic phrases'],
    quranBridge: {
      arabic: 'وَذَكِّرْ فَإِنَّ الذِّكْرَى تَنفَعُ الْمُؤْمِنِينَ',
      transliteration: "Wadhakkir fa-inna dhikra tanfaul-mumineen",
      meaning: 'And remind, for indeed reminders benefit the believers.',
      note: 'فَإِنَّ (fa causative: for confirmation) — the purpose of every Arabic lesson, every essay, every reminder is this benefit.',
    },
  },
  {
    id: 'i269',
    stage: 'intermediate',
    title: 'Summarising Classical Texts in Arabic',
    objective: 'Read a 300-word classical Arabic passage and write a 100-word accurate summary.',
    duration: '60 min',
    challengeLevel: 'Advanced',
    drills: ['Reading: 300-word classical passage', 'Summary writing: 100 words max', 'Check: content accuracy + grammatical accuracy'],
    quranBridge: {
      arabic: 'وَلَقَدْ ضَرَبْنَا لِلنَّاسِ فِي هَذَا الْقُرْآنِ مِن كُلِّ مَثَلٍ',
      transliteration: "Walaqad darabna lin-naasi fi hadhal-qurani min kulli mathal",
      meaning: 'And We have certainly presented for the people in this Quran of every example.',
      note: 'مِن كُلِّ مَثَلٍ (partitive: of every type of example) — the Quran contains all categories of wisdom; summarising reflects back its completeness.',
    },
  },
  {
    id: 'i270',
    stage: 'intermediate',
    title: 'Intermediate Milestone i270: Writing and Grammar',
    objective: 'Review advanced writing, grammar particles, and case system with 35-question test.',
    duration: '75 min',
    challengeLevel: 'Capstone',
    drills: ['35-question writing and grammar test', 'Write a 150-word essay on one lesson from the Quran', 'Parse an unseen paragraph completely'],
    quranBridge: {
      arabic: 'الَّذِينَ يَسْتَمِعُونَ الْقَوْلَ فَيَتَّبِعُونَ أَحْسَنَهُ',
      transliteration: "Alladhina yastamioona l-qawla fayattabiuna ahsanah",
      meaning: 'Those who listen to speech and follow the best of it.',
      note: 'فَيَتَّبِعُونَ (fa of consequence + Form VIII: they immediately follow) + أَحْسَنَهُ (superlative: the best of it) — the grammar of intelligent listening.',
    },
  },
  {
    id: 'i271',
    stage: 'intermediate',
    title: 'Quranic Vocabulary: Human Faculties',
    objective: 'Master 30 Arabic words for human faculties: aql, qalb, ruh, nafs, lubb, fuad, sadr, basr, sam.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['30 human faculty vocabulary flashcards', 'Distinguish nuances: fuad vs qalb vs sadr', 'Count how many times each word appears in Quran'],
    quranBridge: {
      arabic: 'أَفَلَمْ يَسِيرُوا فِي الْأَرْضِ فَتَكُونَ لَهُمْ قُلُوبٌ يَعْقِلُونَ بِهَا',
      transliteration: "Afalam yasiru fil-ardi fatakuna lahum qulubun yaqiluna biha",
      meaning: 'Have they not traveled through the land and had hearts by which to reason?',
      note: 'قُلُوبٌ يَعْقِلُونَ بِهَا (hearts by which they reason) — the Quran locates reason (aql) in the heart (qalb); grammar confirms this.',
    },
  },
  {
    id: 'i272',
    stage: 'intermediate',
    title: 'Quranic Vocabulary: Divine Attributes (Asma al-Husna)',
    objective: 'Master all 99 of Allah\'s names — meanings, roots, and grammatical forms.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['99 names flashcards: Arabic + root + meaning', 'Group by grammatical pattern: faal, faul, faeel, faail', 'Memorise 20 names with root analysis'],
    quranBridge: {
      arabic: 'وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَى فَادْعُوهُ بِهَا',
      transliteration: "Walillahi l-asmaul-husna fad-uhu biha",
      meaning: 'And to Allah belong the best names, so invoke Him by them.',
      note: 'فَادْعُوهُ بِهَا (fa of consequence + imperative) — learning the names is not academic; the command is to USE them in dua.',
    },
  },
  {
    id: 'i273',
    stage: 'intermediate',
    title: 'Quranic Vocabulary: Eschatology and Afterlife',
    objective: 'Master 40 Quranic words for Day of Judgment, afterlife, paradise, and hellfire.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['40 eschatology vocabulary flashcards', 'Paradise names in Quran: 7 names', 'Hellfire names: 7 names and their semantic differences'],
    quranBridge: {
      arabic: 'وَإِنَّ الدَّارَ الْآخِرَةَ لَهِيَ الْحَيَوَانُ',
      transliteration: "Wa-innad-daral-akhirata lahiya l-hayawan",
      meaning: 'And indeed, the home of the Hereafter — that is the true life.',
      note: 'الْحَيَوَانُ (the most alive form of life — intensive noun of hayat) — the grammar gives the afterlife maximum vitality vs dunya\'s temporary state.',
    },
  },
  {
    id: 'i274',
    stage: 'intermediate',
    title: 'Quranic Vocabulary: Angels and Their Roles',
    objective: 'Master 25 Arabic words related to angels, their names, roles, and descriptions in the Quran.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['25 angel vocabulary flashcards', 'Named angels: Jibril, Mikail, Israfil, Malik, Ridwan', 'Find an angelic action in the Quran and parse it'],
    quranBridge: {
      arabic: 'نَزَلَ بِهِ الرُّوحُ الْأَمِينُ عَلَى قَلْبِكَ',
      transliteration: "Nazala bihi r-ruhu l-aminu ala qalbik",
      meaning: 'The Trustworthy Spirit (Jibril) brought it down upon your heart.',
      note: 'الرُّوحُ الْأَمِينُ (the trustworthy spirit — definite + adjective) — Jibril named by character not by personal name; grammar honours his role.',
    },
  },
  {
    id: 'i275',
    stage: 'intermediate',
    title: 'Quranic Vocabulary: The Prophets',
    objective: 'Master all 25 prophets named in the Quran — their Arabic names, key stories, and Quranic descriptions.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['25 prophet names and key Quranic events', 'Timeline ordering of prophets', 'Find and parse the call of each prophet (their mission statement)'],
    quranBridge: {
      arabic: 'وَإِسْمَاعِيلَ وَإِدْرِيسَ وَذَا الْكِفْلِ كُلٌّ مِّنَ الصَّابِرِينَ',
      transliteration: "Wa-ismaila wa-idrisa wadhal-kifli kullun minas-sabirin",
      meaning: 'And Ismail, and Idris, and Dhul-Kifl — all were among the steadfast.',
      note: 'كُلٌّ مِّنَ الصَّابِرِينَ (tawkid manawi: each one from the patient) — grammar confirms every prophet shares the same defining quality: sabr.',
    },
  },
  {
    id: 'i276',
    stage: 'intermediate',
    title: 'Arabic Morphology: Broken Plural Revision',
    objective: 'Master the 20 most common broken plural patterns (plural patterns II) for irregular forms.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['20 broken plural pattern flashcards', 'Generate plurals for 20 words', 'Identify pattern from 20 given plurals'],
    quranBridge: {
      arabic: 'وَخُلِقَ الْإِنسَانُ ضَعِيفًا',
      transliteration: "Wakhuliqa l-insanu daifa",
      meaning: 'And man was created weak.',
      note: 'ضَعِيفًا (hal: in a state of weakness — Form II elative pattern فَعِيل) — morphological patterns encode human limitations.',
    },
  },
  {
    id: 'i277',
    stage: 'intermediate',
    title: 'Arabic Morphology: Sound Masculine and Feminine Plurals',
    objective: 'Master formation and usage rules for sound masculine plural (ون/ين) and sound feminine plural (ات).',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['SMP and SFP formation drills', 'Agreement rules for SMP in accusative/genitive (ين)', 'Transform 20 singulars to sound plurals'],
    quranBridge: {
      arabic: 'إِنَّ الْمُسْلِمِينَ وَالْمُسْلِمَاتِ',
      transliteration: "Innal-muslimeena wal-muslimat",
      meaning: 'Indeed, the Muslim men and Muslim women...',
      note: 'الْمُسْلِمِينَ (SMP in accusative/genitive: ين) and الْمُسْلِمَاتِ (SFP in accusative/genitive: ات) — both in accusative after inna.',
    },
  },
  {
    id: 'i278',
    stage: 'intermediate',
    title: 'Arabic Verb Conjugation Sprint: All Forms',
    objective: 'Comprehensive conjugation sprint: conjugate two verbs through all forms, tenses, and persons.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Conjugate نَصَرَ through all forms and tenses', 'Conjugate عَلِمَ through all forms and tenses', 'Time challenge: 40 conjugations in 10 minutes'],
    quranBridge: {
      arabic: 'وَإِن تَعُدُّوا نِعْمَةَ اللَّهِ لَا تُحْصُوهَا',
      transliteration: "Wa-in tauddu nimmatallahi la tuhsuha",
      meaning: 'And if you were to count the favours of Allah, you could not enumerate them.',
      note: 'تَعُدُّوا (Form I jussive: you count — doubled verb with assimilation) — even counting THAT verb is an exercise in morphological precision.',
    },
  },
  {
    id: 'i279',
    stage: 'intermediate',
    title: 'Arabic Verb Forms: Semantic Patterns Review',
    objective: 'Review the semantic contributions of each verb form (I-X) with 3 examples per form.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['10 form semantic trend flashcards', 'Give 3 Quran examples per form', 'Write one sentence using a verb in each Form I-X'],
    quranBridge: {
      arabic: 'يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ وَالْأَرْضِ',
      transliteration: "Yusabbihu lillahi ma fis-samawati wal-ard",
      meaning: 'Whatever is in the heavens and earth exalts Allah.',
      note: 'يُسَبِّحُ (Form II imperfect: glorifies intensively/continuously) — Form II\'s intensive pattern is divinely appropriate for cosmic glorification.',
    },
  },
  {
    id: 'i280',
    stage: 'intermediate',
    title: 'Intermediate Milestone i280: Vocabulary and Morphology',
    objective: 'Review Quranic vocabulary (i271-i279) and morphology with 40-question comprehensive test.',
    duration: '75 min',
    challengeLevel: 'Capstone',
    drills: ['40-question vocabulary and morphology test', 'Identify the root and form of 20 Quranic words', 'Write a 100-word description of paradise in Arabic'],
    quranBridge: {
      arabic: 'فِيهَا مَا تَشْتَهِيهِ الْأَنفُسُ وَتَلَذُّ الْأَعْيُنُ',
      transliteration: "Fiha ma tashtahihi l-anfusu wataladhdhu l-aayon",
      meaning: 'In it is whatever souls desire and what eyes find delight.',
      note: 'مَا تَشْتَهِيهِ (relative clause: whatever they desire) + تَلَذُّ (Form I: to find pleasure/delight) — the vocabulary of paradise requires the richest Arabic.',
    },
  },
  {
    id: 'i281',
    stage: 'intermediate',
    title: 'Reading Unseen Classical Arabic: Level 1',
    objective: 'Read an unseen 150-word classical Arabic passage with full comprehension.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Unseen passage reading (150 words)', 'Answer 5 comprehension questions in Arabic', 'Vocabulary: note 10 new words from passage'],
    quranBridge: {
      arabic: 'وَلَوْ كَانَ مِنْ عِندِ غَيْرِ اللَّهِ لَوَجَدُوا فِيهِ اخْتِلَافًا كَثِيرًا',
      transliteration: "Walaw kana min indi ghayri llahi lawajadu fihi ikhtilafan kathira",
      meaning: 'If it had been from other than Allah, they would have found within it much contradiction.',
      note: 'لَوَجَدُوا (law conditional + perfect) + اخْتِلَافًا كَثِيرًا (much contradiction — indefinite tanwin of vastness) — the Quranic consistency test.',
    },
  },
  {
    id: 'i282',
    stage: 'intermediate',
    title: 'Reading Unseen Classical Arabic: Islamic History',
    objective: 'Read an unseen 150-word passage from a classical Islamic history text.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Unseen history text (150 words)', 'Answer 5 comprehension questions', 'Identify key historical vocabulary'],
    quranBridge: {
      arabic: 'وَتِلْكَ الْأَيَّامُ نُدَاوِلُهَا بَيْنَ النَّاسِ',
      transliteration: "Watilkal-ayyamu nudawiluha baynan-nasa",
      meaning: 'And these days — We rotate them among the people.',
      note: 'نُدَاوِلُ (Form III: reciprocal give-and-take — alternating days) — history is divine rotation; grammar acknowledges divine agency in historical cycles.',
    },
  },
  {
    id: 'i283',
    stage: 'intermediate',
    title: 'Reading Unseen Classical Arabic: Fiqh Text',
    objective: 'Read an unseen 150-word classical fiqh text and extract 5 legal rulings.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Unseen fiqh text (150 words)', 'Extract 5 rulings in Arabic', 'Legal vocabulary expansion: 10 new terms'],
    quranBridge: {
      arabic: 'وَمَنْ أَحْسَنُ دِينًا مِّمَّنْ أَسْلَمَ وَجْهَهُ لِلَّهِ',
      transliteration: "Waman ahsanu dinan mimman aslama wajhahu lillah",
      meaning: 'And who is better in religion than one who submits his face to Allah?',
      note: 'أَسْلَمَ وَجْهَهُ (submitted his face — metaphor: the face represents the whole self) — fiqh flows from this complete self-submission.',
    },
  },
  {
    id: 'i284',
    stage: 'intermediate',
    title: 'Reading Unseen Classical Arabic: Tafsir Text',
    objective: 'Read an unseen 150-word tafsir passage and identify its grammatical analysis points.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Unseen tafsir text (150 words)', 'Identify 5 grammatical insights the author makes', 'Compare to your own reading of the same verse'],
    quranBridge: {
      arabic: 'وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ',
      transliteration: "Wayuallimhumu l-kitaba wal-hikmah",
      meaning: 'And He teaches them the Book and wisdom.',
      note: 'يُعَلِّمُ (Form II doubly-transitive: teaches [who=them][what=the Book]) — tafsir unpacks this: what is hikmah beyond the Book?',
    },
  },
  {
    id: 'i285',
    stage: 'intermediate',
    title: 'Intermediate Arabic: Listening Comprehension Sprint',
    objective: 'Listen to 5 short Arabic audio clips (2 min each) and answer comprehension questions.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['5 x 2-minute Arabic audio clip exercises', 'Answer 3 questions per clip in Arabic', 'Vocabulary from audio: note 5 new words per clip'],
    quranBridge: {
      arabic: 'وَإِذَا تُلِيَتْ عَلَيْهِمْ آيَاتُهُ زَادَتْهُمْ إِيمَانًا',
      transliteration: "Wa-idha tuliyat alayhim ayatuhu zadathum imana",
      meaning: 'And when His verses are recited to them, they increase them in faith.',
      note: 'تُلِيَتْ (passive: recited to them) → زَادَتْهُمْ (subject: verses; object: them + iman tamyiz) — listening to Quran is grammatically productive.',
    },
  },
  {
    id: 'i286',
    stage: 'intermediate',
    title: 'Intermediate Arabic: Oral Presentation',
    objective: 'Prepare and deliver a 5-minute Arabic oral presentation on an Islamic topic of choice.',
    duration: '60 min',
    challengeLevel: 'Advanced',
    drills: ['Choose topic and outline in Arabic', 'Practice delivery: opening, 3 points, conclusion', 'Self-recording and error review'],
    quranBridge: {
      arabic: 'وَقُولُوا لِلنَّاسِ حُسْنًا',
      transliteration: "Waqulu lil-naasi husna",
      meaning: 'And speak to people in a good way.',
      note: 'حُسْنًا (mafool mutlaq/manner: in a good way — the manner of speech, not just good content) — Arabic presentation requires husna at every level.',
    },
  },
  {
    id: 'i287',
    stage: 'intermediate',
    title: 'Arabic Journaling: 30 Days in Review',
    objective: 'Write a 200-word Arabic journal entry reviewing your Arabic learning journey.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Arabic journal entry (200 words)', 'Past tense narrative review', 'Corrective round: 5 grammar self-corrections'],
    quranBridge: {
      arabic: 'وَمَا تُقَدِّمُوا لِأَنفُسِكُم مِّنْ خَيْرٍ تَجِدُوهُ عِندَ اللَّهِ',
      transliteration: "Wama tuqaddimu li-anfusikum min khayrin tajidahu indallah",
      meaning: 'And whatever good you put forward for yourselves — you will find it with Allah.',
      note: 'تُقَدِّمُوا (Form II jussive: you advance/send ahead) — every Arabic lesson journaled is something sent ahead for your own soul.',
    },
  },
  {
    id: 'i288',
    stage: 'intermediate',
    title: 'Arabic Vocabulary: Emotions and States of Heart',
    objective: 'Master 35 Arabic vocabulary words for emotions, spiritual states, and inner conditions.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['35 emotion vocabulary flashcards', 'Distinguish: farh/surur, huzn/ghamm, khawf/khashya', 'Write 5 sentences about emotional states using these words'],
    quranBridge: {
      arabic: 'وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ',
      transliteration: "Wala tahzanu wa-antumul-aaawlon",
      meaning: 'Do not grieve, for you will be superior.',
      note: 'لَا تَحْزَنُوا (prohibitive: do not be in a state of grief — huzn is sustained sadness) — grammar prohibits prolonged grief when Allah\'s promise is present.',
    },
  },
  {
    id: 'i289',
    stage: 'intermediate',
    title: 'Arabic Vocabulary: Natural World and Creation',
    objective: 'Master 40 Arabic vocabulary words for natural phenomena, celestial bodies, and creation.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['40 nature vocabulary flashcards', 'Find 10 natural phenomena mentioned in Quran', 'Read a creation verse and identify all nature vocabulary'],
    quranBridge: {
      arabic: 'إِنَّ فِي خَلْقِ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافِ اللَّيْلِ وَالنَّهَارِ لَآيَاتٍ',
      transliteration: "Inna fi khalqis-samawati wal-ardi wakhtilafillayli wannahari la-ayat",
      meaning: 'Indeed, in the creation of the heavens and the earth, and in the alternation of night and day, are signs.',
      note: 'لَآيَاتٍ (lam of oath + indefinite plural: undeniably SIGNS — the tanwin of magnitude) — creation vocabulary is Quranic vocabulary.',
    },
  },
  {
    id: 'i290',
    stage: 'intermediate',
    title: 'Intermediate Milestone i290: Reading and Writing Sprint',
    objective: 'Review unseen reading, listening, and writing tasks (i281-i289) with comprehensive 40-question test.',
    duration: '80 min',
    challengeLevel: 'Capstone',
    drills: ['40-question comprehensive test', 'Write a 150-word Arabic passage on salah', 'Read unseen 200-word passage and summarise in Arabic'],
    quranBridge: {
      arabic: 'وَاصْبِرْ وَمَا صَبْرُكَ إِلَّا بِاللَّهِ',
      transliteration: "Wasbir wama sabruka illa billah",
      meaning: 'And be patient, and your patience is only through Allah.',
      note: 'وَمَا صَبْرُكَ إِلَّا بِاللَّهِ (restriction: your patience exists only by/through Allah) — even reading Arabic patiently is a divine gift.',
    },
  },
  {
    id: 'i291',
    stage: 'intermediate',
    title: 'Grammar Revision: Sentence Parsing Mastery',
    objective: 'Parse 10 complete complex Quranic verses — identifying every word\'s grammatical function.',
    duration: '65 min',
    challengeLevel: 'Advanced',
    drills: ['Parse 10 complete verses word-by-word', 'Identify every mubtada, khabar, fail, naib fail', 'Note 5 surprising grammatical discoveries'],
    quranBridge: {
      arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
      transliteration: "Waman yatawakkaal alallahi fahuwa hasbuh",
      meaning: 'And whoever relies upon Allah — then He is sufficient for him.',
      note: 'فَهُوَ حَسْبُهُ (fa of response + nominal sentence: then HE is his sufficiency) — the subject huw referring back to conditional person creates grammatical intimacy.',
    },
  },
  {
    id: 'i292',
    stage: 'intermediate',
    title: 'Advanced Reading: Al-Risala of Imam al-Shafi\'i',
    objective: 'Read 200 words from Imam al-Shafi\'i\'s al-Risala — foundational text of Islamic jurisprudence methodology.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Read 200 words from al-Risala', 'Vocabulary: usul al-fiqh technical terms', 'Identify 3 logical argument structures used'],
    quranBridge: {
      arabic: 'وَمَا اخْتَلَفْتُمْ فِيهِ مِن شَيْءٍ فَحُكْمُهُ إِلَى اللَّهِ',
      transliteration: "Wama khtalaftum fihi min shayin fahukmuhu ilallah",
      meaning: 'And in whatever you differ — its ruling belongs to Allah.',
      note: 'فَحُكْمُهُ إِلَى اللَّهِ (nominal sentence with ila expressing attribution) — al-Shafi\'i\'s entire ussul rests on this verse\'s referral to divine ruling.',
    },
  },
  {
    id: 'i293',
    stage: 'intermediate',
    title: 'Arabic Grammar: Construct States and Compounds',
    objective: 'Master multi-level idafa (construct states) — three, four, and five-word genitives.',
    duration: '35 min',
    challengeLevel: 'Advanced',
    drills: ['Triple idafa construction: mukhlis + amal + qalb', 'Parse multi-level idafa in 10 Quranic phrases', 'Construct 5 triple idafa phrases'],
    quranBridge: {
      arabic: 'رَبِّ السَّمَاوَاتِ وَالْأَرْضِ وَمَا بَيْنَهُمَا',
      transliteration: "Rabbis-samawati wal-ardi wama baynahuma",
      meaning: 'Lord of the heavens and the earth and what is between them.',
      note: 'رَبِّ + السَّمَاوَاتِ (triple ownership idafa: Lord of heavens + earth + between) — multi-subject idafa expresses total divine sovereignty.',
    },
  },
  {
    id: 'i294',
    stage: 'intermediate',
    title: 'Arabic Literature: al-Hamasa Anthology',
    objective: 'Read 3 poems from Abu Tammam\'s al-Hamasa anthology — classical Arabic war and wisdom poetry.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['3 al-Hamasa poem readings', 'Vocabulary: honour, courage, leadership', 'Identify balaghah devices in each poem'],
    quranBridge: {
      arabic: 'وَعَسَى أَن تَكْرَهُوا شَيْئًا وَهُوَ خَيْرٌ لَّكُمْ',
      transliteration: "Wasa an takrahu shayan wahuwa khayrun lakum",
      meaning: 'Perhaps you dislike something while it is good for you.',
      note: 'عَسَى (hope verb + an + subjunctive) — Arabic literature often echoes this verse in themes of hidden blessing within hardship.',
    },
  },
  {
    id: 'i295',
    stage: 'intermediate',
    title: 'Surah al-Baqarah: 286 Verses Comprehensive Review',
    objective: 'Final comprehensive review of Surah al-Baqarah — themes, vocabulary, grammatical landmarks.',
    duration: '75 min',
    challengeLevel: 'Capstone',
    drills: ['10 grammatical landmark verses (recite + parse)', 'Major themes of al-Baqarah list in Arabic', 'Summarise al-Baqarah in 10 Arabic sentences'],
    quranBridge: {
      arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
      transliteration: "La yukallifullahu nafsan illa wusaha",
      meaning: 'Allah does not burden a soul beyond that it can bear.',
      note: 'نَفْسًا (indefinite: any soul — universality through tanwin) + وُسْعَهَا (its capacity — possessed by that very soul) — the law of divine justice in grammar.',
    },
  },
  {
    id: 'i296',
    stage: 'intermediate',
    title: 'Surah al-Imran: 200 Verses Comprehensive Review',
    objective: 'Final review of Surah al-Imran — themes, the family of Imran, Battle of Uhud, interfaith dialogue.',
    duration: '65 min',
    challengeLevel: 'Capstone',
    drills: ['10 landmark verses from al-Imran (recite + parse)', 'Major themes list in Arabic', 'Write 10 Arabic sentences comparing al-Baqarah and al-Imran'],
    quranBridge: {
      arabic: 'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ',
      transliteration: "Kullu nafsin dhaiqatu l-mawt",
      meaning: 'Every soul will taste death.',
      note: 'ذَائِقَةُ (active participle in idafa: taster of death) — al-Imran includes this verse as a call to prioritise the afterlife over worldly status.',
    },
  },
  {
    id: 'i297',
    stage: 'intermediate',
    title: 'Arabic Discussion: Contemporary Islamic Issues',
    objective: 'Hold or write a structured Arabic discussion about one contemporary Islamic issue.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Choose topic + prepare 5 argument points in Arabic', 'Academic Arabic vocabulary for ethics discussion', 'Write or speak a 5-minute structured argument'],
    quranBridge: {
      arabic: 'وَأَمْرُهُمْ شُورَى بَيْنَهُمْ',
      transliteration: "Waamruhum shura baynahum",
      meaning: 'And their affair is consultative among them.',
      note: 'شُورَى (masdar of mutual consultation — Form VI) — the Quran models communal decision-making; discussing Islamic issues is shura in action.',
    },
  },
  {
    id: 'i298',
    stage: 'intermediate',
    title: 'Arabic Composition: Personal Narrative',
    objective: 'Write a 200-word personal narrative in Arabic about a spiritually significant moment.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Personal narrative structure in Arabic', 'Tense consistency: past narrative + reflective present', 'Editing round: 5 corrections minimum'],
    quranBridge: {
      arabic: 'وَفِي أَنفُسِكُمْ أَفَلَا تُبْصِرُونَ',
      transliteration: "Wafi anfusikum afala tubsirun",
      meaning: 'And within yourselves — will you not then see?',
      note: 'أَفَلَا تُبْصِرُونَ (interrogative of wonder + prohibition) — the most personal ayah; the narrative begins within you.',
    },
  },
  {
    id: 'i299',
    stage: 'intermediate',
    title: 'Arabic Grammar Self-Assessment: 100 Questions',
    objective: 'Complete a 100-question Arabic grammar self-assessment covering the entire intermediate curriculum.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['100-question grammar self-assessment', 'Score analysis: identify weak areas', 'Create personal grammar revision list from results'],
    quranBridge: {
      arabic: 'فَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ',
      transliteration: "Fasalu ahladh-dhikri in kuntum la tailamun",
      meaning: 'So ask the people of knowledge if you do not know.',
      note: 'فَاسْأَلُوا (fa of consequence + imperative Form I: then ask!) — self-assessment reveals what you do not know; the Quran\'s response is: ask.',
    },
  },
  {
    id: 'i300',
    stage: 'intermediate',
    title: 'Intermediate Milestone i300: Major Grammar Assessment',
    objective: 'Comprehensive 50-question test covering all intermediate grammar topics.',
    duration: '100 min',
    challengeLevel: 'Capstone',
    drills: ['50-question comprehensive grammar test', 'Parse an unseen passage of 10 verses completely', 'Write a 200-word essay on the importance of Arabic for Muslims'],
    quranBridge: {
      arabic: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ',
      transliteration: "Inna anzalnahu quranan arabiyyan laallakum taqilun",
      meaning: 'Indeed, We have sent it down as an Arabic Quran that you might understand.',
      note: 'عَرَبِيًّا (hal: in an Arabic mode — the revealed language is not incidental but purposeful) — milestone i300: your Arabic IS the purpose.',
    },
  },
  {
    id: 'i301',
    stage: 'intermediate',
    title: 'Surah al-Baqarah: Signs and Divine Arguments',
    objective: 'Study al-Baqarah 163-177 — divine signs in creation, key religious obligations, direction change.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Baqarah 163-177 with harakat', 'Identify 3 divine argument structures', 'Vocabulary: qibla, birr, divine unity'],
    quranBridge: {
      arabic: 'وَإِلَهُكُمْ إِلَهٌ وَاحِدٌ لَّا إِلَهَ إِلَّا هُوَ الرَّحْمَنُ الرَّحِيمُ',
      transliteration: "Wa-ilahukum ilahun wahidun la ilaha illa huwar-rahmanur-raheem",
      meaning: 'And your God is one God. There is no deity worthy of worship except Him, the Most Gracious, the Most Merciful.',
      note: 'إِلَهٌ وَاحِدٌ (indefinite + adjective: one deity — not the most powerful, but uniquely one) — tawhid expressed through indefinite grammar.',
    },
  },
  {
    id: 'i302',
    stage: 'intermediate',
    title: 'Surah an-Nisa: Rights and Justice',
    objective: 'Study an-Nisa 127-147 — rights of women, divorce, justice, and hypocrisy.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read an-Nisa 127-147 with harakat', 'Rights vocabulary in Arabic', 'Identify hypocrite characteristics listed (vocabulary and grammar)'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا كُونُوا قَوَّامِينَ بِالْقِسْطِ',
      transliteration: "Ya ayyuhal-ladhina amanu kunu qawwameena bilqist",
      meaning: 'O you who believe, be persistently standing firmly for justice.',
      note: 'قَوَّامِينَ (intensive plural: those who consistently, habitually stand for) — the فَعَّال intensive form demands relentless advocacy for justice.',
    },
  },
  {
    id: 'i303',
    stage: 'intermediate',
    title: 'Surah al-Maidah: People of the Book Dialogues',
    objective: 'Study al-Maidah 44-82 — interfaith dialogue, Ahl al-Kitab, and divine guidance.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Maidah 44-82 with harakat', 'Interfaith vocabulary: Torah, Gospel, witness', 'Identify 3 divine argument structures with Ahl al-Kitab'],
    quranBridge: {
      arabic: 'وَأَنزَلْنَا إِلَيْكَ الْكِتَابَ بِالْحَقِّ مُصَدِّقًا لِّمَا بَيْنَ يَدَيْهِ',
      transliteration: "Wa-anzalna ilayk al-kitaba bil-haqqi musaddiqan lima bayna yadayh",
      meaning: 'And We revealed to you the Book in truth, confirming what came before it.',
      note: 'مُصَدِّقًا (hal: active Form II participle — confirming, while being revealed) — the Quran\'s arrival mode is one of confirmation, not contradiction.',
    },
  },
  {
    id: 'i304',
    stage: 'intermediate',
    title: 'Keys of the Unseen: Five Divine Secrets',
    objective: 'Study and analyse the five keys of the unseen (mafatih al-ghayb) in Quran 31:34.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Read Luqman 34 with harakat', 'Identify the 5 unseen keys grammatically', 'Grammar: inna + relative clauses pattern'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ عِندَهُ عِلْمُ السَّاعَةِ وَيُنَزِّلُ الْغَيْثَ',
      transliteration: "Innallaha indahu ilmus-saati wayunazzilul-ghayth",
      meaning: 'Indeed, Allah has knowledge of the Hour and sends down the rain.',
      note: 'عِندَهُ (proximity of knowledge: with Him specifically) — five divine exclusives, each beginning with restriction; grammar marks divine monopoly on unseen knowledge.',
    },
  },
  {
    id: 'i305',
    stage: 'intermediate',
    title: 'Arabic Morphology: Masdar Types — Complete Revision',
    objective: 'Comprehensive revision of masdar types: explicit, implicit, and mafool mutlaq function.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Masdar type identification: 20 examples', 'Mafool mutlaq variety constructions (10)', 'Generate masdar for 20 verbs across forms I-X'],
    quranBridge: {
      arabic: 'وَكَلَّمَ اللَّهُ مُوسَى تَكْلِيمًا',
      transliteration: "Wakallama Allahu musa taklima",
      meaning: 'And Allah spoke to Musa with direct/real speech.',
      note: 'تَكْلِيمًا (mafool mutlaq of Form II verb: emphasis on the reality and mode of speech) — this mafool mutlaq confirms the speech was literal and direct.',
    },
  },
  {
    id: 'i306',
    stage: 'intermediate',
    title: 'Arabic Syntax: Complex Noun Phrases',
    objective: 'Analyse and construct complex Arabic noun phrases with multiple modifiers (adjective + badal + tawkid).',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Noun phrase analysis: 10 complex examples', 'Build 5 noun phrases with 3+ modifiers', 'Parse all modifiers in al-Fatiha\'s noun phrases'],
    quranBridge: {
      arabic: 'الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',
      transliteration: "Assiratal-mustaqim sirata lladhina anamta alayhim",
      meaning: 'The straight path — the path of those upon whom You bestowed favor.',
      note: 'Two-level noun phrase: الصِّرَاطَ (direct object) + الْمُسْتَقِيمَ (adjective) + صِرَاطَ الَّذِينَ (badal: apposition) — progressive specification.',
    },
  },
  {
    id: 'i307',
    stage: 'intermediate',
    title: 'Arabic Syntax: Embedded Relative Clauses',
    objective: 'Master complex relative clause structures — nested relatives and relative to relative.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['5 nested relative clause examples', 'Identify the antecedent of 10 relative clauses', 'Construct 3 relative-within-relative sentences'],
    quranBridge: {
      arabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا',
      transliteration: "Alladhi khalaqal-mawta wal-hayata liyabluwakum ayyukum ahsanu amala",
      meaning: 'He who created death and life to test you as to which of you is best in deed.',
      note: 'أَيُّكُمْ أَحْسَنُ عَمَلًا (indirect question embedded in purpose clause: which of you is best) — relative + purpose + embedded question: three-level structure.',
    },
  },
  {
    id: 'i308',
    stage: 'intermediate',
    title: 'Rhetorical Analysis: Quran\'s Address to Believers vs Non-Believers',
    objective: 'Compare how the Quran grammatically addresses believers (يَا أَيُّهَا الَّذِينَ آمَنُوا) vs non-believers.',
    duration: '38 min',
    challengeLevel: 'Advanced',
    drills: ['5 believer address examples vs 5 non-believer', 'Tone contrast: commands vs questions vs warnings', 'Grammar: how address mood changes with audience'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ كَفَرُوا لَا تَعْتَذِرُوا الْيَوْمَ',
      transliteration: "Ya ayyuhal-ladhina kafaru la tatadhhiru l-yawm",
      meaning: 'O you who have disbelieved, make no excuses this Day.',
      note: 'Compared to يَا أَيُّهَا الَّذِينَ آمَنُوا — both begin identically but instantly diverge in address tone; grammar locates the listener in eternity.',
    },
  },
  {
    id: 'i309',
    stage: 'intermediate',
    title: 'Intermediate Arabic: Final Skills Synthesis',
    objective: 'Synthesise all intermediate skills: reading, writing, grammar, vocabulary, and Quran in a complete portfolio task.',
    duration: '80 min',
    challengeLevel: 'Capstone',
    drills: ['Read a 200-word passage and parse it', 'Write a 150-word essay on an Islamic theme', 'Oral presentation: 3-minute prepared speech in Arabic'],
    quranBridge: {
      arabic: 'وَمَن يُؤْمِن بِاللَّهِ يَهْدِ قَلْبَهُ',
      transliteration: "Waman yumin billahi yahdi qalbah",
      meaning: 'And whoever believes in Allah — He guides his heart.',
      note: 'يَهْدِ (Form I jussive: defective verb — he guides/will guide) — the synthesis: when your Arabic leads you to BELIEVE, Allah guides the heart that sought.',
    },
  },
  {
    id: 'i310',
    stage: 'intermediate',
    title: 'Intermediate Milestone i310: Advanced Skills Test',
    objective: 'Comprehensive 50-question test covering all advanced intermediate skills (i301-i309).',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['50-question comprehensive test', 'Translation of an unseen 10-verse passage', 'Write a 200-word comparative analysis of two surahs'],
    quranBridge: {
      arabic: 'وَمَا أُوتِيتُم مِّنَ الْعِلْمِ إِلَّا قَلِيلًا',
      transliteration: "Wama utitum minal-ilmi illa qalila",
      meaning: 'And you have not been given of knowledge except a little.',
      note: 'إِلَّا قَلِيلًا (restriction: only a little) — even at milestone i310, remember: the ocean of Arabic is infinite; humility is the key to i311+.',
    },
  },
  {
    id: 'i311',
    stage: 'intermediate',
    title: 'Surah al-Qasas: Moses and Allah\'s Direct Conversation',
    objective: 'Study al-Qasas 28-35 — Musa at the burning bush, divine call, mission assignment.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Qasas 28-35 with harakat', 'Divine dialogue vocabulary', 'Grammar: divine commands in jussive, Musa\'s requests in subjunctive'],
    quranBridge: {
      arabic: 'إِنِّي أَنَا اللَّهُ رَبُّ الْعَالَمِينَ',
      transliteration: "Inni ana Allahu rabbul-alamin",
      meaning: 'Indeed, I am Allah, Lord of the worlds.',
      note: 'إِنِّي أَنَا (double emphasis: inna + ana pronoun) — the grammar of divine self-identification; the most emphatic possible declaration.',
    },
  },
  {
    id: 'i312',
    stage: 'intermediate',
    title: 'Surah Ta-Ha: The Shoes and the Sacred Valley',
    objective: 'Study Ta-Ha 9-36 — the burning bush narrative and Musa\'s conversation with Allah.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read Ta-Ha 9-36 with harakat', 'Compare Ta-Ha vs al-Qasas burning bush accounts', 'Grammar: divine imperative forms used with Musa'],
    quranBridge: {
      arabic: 'فَاخْلَعْ نَعْلَيْكَ إِنَّكَ بِالْوَادِ الْمُقَدَّسِ طُوًى',
      transliteration: "Fakhla naalayika innaka bil-wadil-muqaddasi tuwa",
      meaning: 'So remove your sandals; indeed, you are in the sacred valley of Tuwa.',
      note: 'فَاخْلَعْ (fa of consequence + imperative) — the divine grammar of sacred ground: first a command (remove), then the reason (inna + sacred).',
    },
  },
  {
    id: 'i313',
    stage: 'intermediate',
    title: 'Surah Maryam: The Miraculous Births Narrative',
    objective: 'Study Maryam 1-40 — the miraculous births of Yahya and Isa, and Maryam\'s story.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Read Maryam 1-40 with harakat', 'Compare the two miracle births grammatically', 'Maryam\'s dialogue: analyse her speech acts'],
    quranBridge: {
      arabic: 'قَالَتْ أَنَّى يَكُونُ لِي غُلَامٌ وَلَمْ يَمْسَسْنِي بَشَرٌ',
      transliteration: "Qalat anna yakunu li ghulamun walam yamsasni bashar",
      meaning: 'She said: How can I have a boy when no man has touched me?',
      note: 'أَنَّى (how — interrogative of amazement) + لَمْ يَمْسَسْنِي (lam + jussive perfect: has never touched) — the grammar of the impossible becoming certain.',
    },
  },
  {
    id: 'i314',
    stage: 'intermediate',
    title: 'Surah al-Anbiya: Prophets\' Supplications',
    objective: 'Study al-Anbiya 83-90 — Ayyub, Dhul-Nun, Zachariah: each prophet\'s supplication form.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Anbiya 83-90 with harakat', 'Parse each supplication grammatically', 'What makes each prophet\'s dua unique structurally?'],
    quranBridge: {
      arabic: 'لَّا إِلَهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
      transliteration: "La ilaha illa anta subhanaka inni kuntu minadh-dhalimin",
      meaning: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
      note: 'إِنِّي كُنتُ مِنَ الظَّالِمِينَ (self-incrimination + past tense: I WAS among them) — the grammar of repentance: past tense confession for present release.',
    },
  },
  {
    id: 'i315',
    stage: 'intermediate',
    title: 'Surah al-Kahf: The Two Garden Owners',
    objective: 'Study al-Kahf 32-44 — the parable of the two garden owners, arrogance vs gratitude.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Kahf 32-44 with harakat', 'Contrast the two owners\' speech acts', 'Vocabulary: garden, wealth, pride, loss'],
    quranBridge: {
      arabic: 'وَلَوْلَا إِذْ دَخَلْتَ جَنَّتَكَ قُلْتَ مَا شَاءَ اللَّهُ لَا قُوَّةَ إِلَّا بِاللَّهِ',
      transliteration: "Walawla idh dakhalta jannataka qulta ma shaAllahu la quwwata illa billah",
      meaning: 'Why, when you entered your garden, did you not say: What Allah willed — there is no power except with Allah.',
      note: 'لَوْلَا (reproach particle: why did you not?) — the grammar of missed opportunity; the lesson is in the verb you failed to say.',
    },
  },
  {
    id: 'i316',
    stage: 'intermediate',
    title: 'Surah al-Kahf: The Three Signs of the Hour',
    objective: 'Study al-Kahf 99-110 — trumpet blow, resurrection, books of deeds.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['Read al-Kahf 99-110 with harakat', 'Eschatological vocabulary', 'Grammar: future passive verbs in Day of Judgment descriptions'],
    quranBridge: {
      arabic: 'فَمَن كَانَ يَرْجُو لِقَاءَ رَبِّهِ فَلْيَعْمَلْ عَمَلًا صَالِحًا',
      transliteration: "Faman kana yarjoo liqaa rabbhi falyaamal amalan salihan",
      meaning: 'So whoever hopes for the meeting of his Lord — let him do righteous work.',
      note: 'فَلْيَعْمَلْ عَمَلًا صَالِحًا (fa of consequence + lam of command + mafool mutlaq) — the grammar of hope demands action; passive longing is not enough.',
    },
  },
  {
    id: 'i317',
    stage: 'intermediate',
    title: 'Comprehensive Vocabulary Sprint: 500 Core Words Review',
    objective: 'Review the 500 most common Quranic vocabulary words — recognition and usage test.',
    duration: '70 min',
    challengeLevel: 'Capstone',
    drills: ['500-word timed recognition test (30 min)', 'Production test: give Arabic for 50 concepts', 'Identify 20 words you still need to master'],
    quranBridge: {
      arabic: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا',
      transliteration: "Warattilil-qurana tartila",
      meaning: 'And recite the Quran in measured, rhythmic recitation.',
      note: 'تَرْتِيلًا (mafool mutlaq of emphasis) — 500 words is your musical vocabulary; now the recitation can truly be tartil.',
    },
  },
  {
    id: 'i318',
    stage: 'intermediate',
    title: 'Classical Arabic Story: Kalila wa Dimna',
    objective: 'Read and comprehend a passage from Kalila wa Dimna — the famous Arabic fable collection.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Read 200 words from Kalila wa Dimna', 'Identify moral of the fable in Arabic', 'Grammar highlight: 3 structures used in the story'],
    quranBridge: {
      arabic: 'إِنَّ فِي ذَلِكَ لَعِبْرَةً لِّأُولِي الْأَلْبَابِ',
      transliteration: "Inna fee dhalika laibrata li-ulil-albab",
      meaning: 'Indeed in that is a lesson for those endowed with understanding.',
      note: 'لَعِبْرَةً (lam of emphasis + indefinite lesson) — Kalila wa Dimna and the Quran share a literary tradition: stories that teach.',
    },
  },
  {
    id: 'i319',
    stage: 'intermediate',
    title: 'Reading Classical Arabic: The Maqamat of Al-Hariri',
    objective: 'Read a selection from al-Hariri\'s Maqamat — famous for technical Arabic wordplay and rhymed prose.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Read 150 words from one Maqama', 'Identify rhymed prose (sajah) patterns', 'Extract 5 rare or beautiful vocabulary items'],
    quranBridge: {
      arabic: 'ن وَالْقَلَمِ وَمَا يَسْطُرُونَ',
      transliteration: "Nun walqalami wama yasturun",
      meaning: 'Nun. By the pen and what they inscribe.',
      note: 'يَسْطُرُونَ (from سَطَرَ: to write in lines) — the Maqamat represent the pinnacle of Arabic pen-craft; every lesson here honours the pen\'s oath.',
    },
  },
  {
    id: 'i320',
    stage: 'intermediate',
    title: 'Intermediate Milestone i320: Classical Literature',
    objective: 'Review classical literature readings (i318-i319) and all advanced intermediate skills with 40-question test.',
    duration: '75 min',
    challengeLevel: 'Capstone',
    drills: ['40-question classical literature test', 'Read and summarise an unseen fable in Arabic (100 words)', 'Write a 100-word reflection on one classical text'],
    quranBridge: {
      arabic: 'ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ',
      transliteration: "Dhalikal-kitabu la rayba feeh",
      meaning: 'This is the Book in which there is no doubt.',
      note: 'لَا رَيْبَ فِيهِ (la of total negation: absolutely no doubt in it) — of all books in classical Arabic literature, one has this grammatical guarantee.',
    },
  },
  {
    id: 'i321',
    stage: 'intermediate',
    title: 'Intermediate Arabic: Real World Applications',
    objective: 'Apply Arabic in real contexts: writing a letter, reading a news headline, understanding a khutbah.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Write a formal Arabic letter (100 words)', 'Read 5 Arabic news headlines and explain each in English', 'Listen to or read a Friday khutbah opening in Arabic'],
    quranBridge: {
      arabic: 'أَمَّا بَعْدُ',
      transliteration: "Amma baadu",
      meaning: 'As for what follows / To proceed.',
      note: 'أَمَّا بَعْدُ (the prophetic transition phrase used in every khutbah: the grammar of moving from praise to message) — the most common real-world Arabic transition.',
    },
  },
  {
    id: 'i322',
    stage: 'intermediate',
    title: 'Arabic Media: Islamic News and Journalism',
    objective: 'Read 3 Arabic Islamic news articles and summarise each in Arabic (50 words each).',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['3 Arabic news article readings', 'Write 50-word summaries', 'Journalism vocabulary: report, announce, issue, respond'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِن جَاءَكُمْ فَاسِقٌ بِنَبَإٍ فَتَبَيَّنُوا',
      transliteration: "Ya ayyuhal-ladhina amanu in jaa-akum fasiqun binaba-in fatabayyanu",
      meaning: 'O you who believe, if a wicked person brings a report, investigate.',
      note: 'فَتَبَيَّنُوا (Form V imperative: verify, seek clarity) — Islam\'s media literacy verse; Form V emphasises the effort of investigation.',
    },
  },
  {
    id: 'i323',
    stage: 'intermediate',
    title: 'Arabic Dialect Awareness: Features of Gulf Arabic',
    objective: 'Recognise 20 common differences between Modern Standard Arabic and Gulf dialect (Khaleeji).',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['20 Gulf Arabic feature comparisons', 'Common Gulf vocabulary vs MSA', 'Listen to 3 minutes of Gulf Arabic conversation'],
    quranBridge: {
      arabic: 'وَمِنْ آيَاتِهِ خَلْقُ السَّمَاوَاتِ وَالْأَرْضِ وَاخْتِلَافُ أَلْسِنَتِكُمْ',
      transliteration: "Wamin ayatihi khalqus-samawati wal-ardi wakhtilafu alsinatikum",
      meaning: 'And of His signs is the creation of the heavens and earth and the diversity of your tongues.',
      note: 'اخْتِلَافُ أَلْسِنَتِكُمْ (variety of your tongues/dialects) — Quranic endorsement of linguistic diversity; Arabic dialects are divine signs.',
    },
  },
  {
    id: 'i324',
    stage: 'intermediate',
    title: 'Arabic Dialect Awareness: Features of Egyptian and Levantine',
    objective: 'Recognise 20 common differences between MSA and Egyptian and Levantine dialects.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['20 Egyptian-Levantine feature comparisons', 'Common Egyptian/Levantine vocabulary vs MSA', 'Listen to 3 minutes of Egyptian Arabic conversation'],
    quranBridge: {
      arabic: 'إِنَّا جَعَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ',
      transliteration: "Inna jaalnahoo quranan arabiyyan laallakum taqilun",
      meaning: 'Indeed We have made it an Arabic Quran that you may use reason.',
      note: 'عَرَبِيًّا (the Arabic used in the Quran is Classical MSA) — dialects vary but the Quran\'s Arabic unifies all Arabic speakers.',
    },
  },
  {
    id: 'i325',
    stage: 'intermediate',
    title: 'Introduction to Quranic Sciences: Ilm al-Quran',
    objective: 'Master the vocabulary of Quranic sciences: naskh, asbab al-nuzul, muhkam, mutashabih, and more.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['15 Quranic science vocabulary flashcards', 'Distinguish muhkam from mutashabih', 'Find an asbab al-nuzul example and summarise it in Arabic'],
    quranBridge: {
      arabic: 'مِنْهُ آيَاتٌ مُّحْكَمَاتٌ هُنَّ أُمُّ الْكِتَابِ وَأُخَرُ مُتَشَابِهَاتٌ',
      transliteration: "Minhu ayatun muhkamatun hunna ummul-kitabi wa-ukharu mutashabihat",
      meaning: 'Of it are verses that are precise — they are the foundation of the Book — and others ambiguous.',
      note: 'أُمُّ الْكِتَابِ (mother of the Book — metaphor) + مُتَشَابِهَاتٌ (similar-looking — Form VI participle) — the Quran categorises its own verses grammatically.',
    },
  },
  {
    id: 'i326',
    stage: 'intermediate',
    title: 'Hadith Studies Arabic: Isnad and Matn',
    objective: 'Master the Arabic vocabulary of hadith sciences: isnad, matn, rawi, sahih, hasan, daif.',
    duration: '38 min',
    challengeLevel: 'Advanced',
    drills: ['20 hadith science vocabulary flashcards', 'Identify isnad and matn in a hadith text', 'Read one Bukhari hadith with its isnad in Arabic'],
    quranBridge: {
      arabic: 'وَمَا يَنطِقُ عَنِ الْهَوَى إِنْ هُوَ إِلَّا وَحْيٌ يُوحَى',
      transliteration: "Wama yantiqu anil-hawa in huwa illa wahyun yuha",
      meaning: 'Nor does he speak from desire — it is nothing but a revelation revealed.',
      note: 'وَحْيٌ يُوحَى (mafool absolute + passive: revelation-ly revealed) — hadith science exists because the Prophet\'s speech is wahi; every isnad traces back here.',
    },
  },
  {
    id: 'i327',
    stage: 'intermediate',
    title: 'Islamic Etiquette: Arabic of Manners',
    objective: 'Master 30 Arabic etiquette phrases used in Islamic social life — greetings, gratitude, requests, apologies.',
    duration: '30 min',
    challengeLevel: 'Advanced',
    drills: ['30 etiquette phrase flashcards', 'Role-play 5 social scenarios in Arabic', 'Grammar: request softeners (using la\'alla, min fadlak) in sentences'],
    quranBridge: {
      arabic: 'وَإِذَا حُيِّيتُم بِتَحِيَّةٍ فَحَيُّوا بِأَحْسَنَ مِنْهَا',
      transliteration: "Wa-idha huyyitum bitahiyyatin fahayyiu bi-ahsana minha",
      meaning: 'And when you are greeted with a greeting, greet with better than it or return it.',
      note: 'فَحَيُّوا بِأَحْسَنَ (fa consequence + Form II imperative + elative: respond with BETTER) — the grammar of escalating kindness in social etiquette.',
    },
  },
  {
    id: 'i328',
    stage: 'intermediate',
    title: 'Arabic Poetry: Memorising a Classical Qasida',
    objective: 'Memorise 10 lines from a classical Arabic qasida (from al-Busiri or al-Mutanabbi) with full comprehension.',
    duration: '50 min',
    challengeLevel: 'Advanced',
    drills: ['Choose qasida + read 10 lines with vowels', 'Memorize 10 lines through repetition', 'Explain meaning of each line in Arabic'],
    quranBridge: {
      arabic: 'مُحَمَّدٌ سَيِّدُ الْكَوْنَيْنِ وَالثَّقَلَيْنِ',
      transliteration: "Muhammadun sayyidul-kawnayni wath-thaqalayn",
      meaning: 'Muhammad is the master of the two worlds and the two weighty things.',
      note: 'From Al-Busiri\'s Burda — سَيِّدُ (construct state: master of) + dual الْكَوْنَيْنِ (this world and next) — classical Islamic poetry in perfect Arabic grammar.',
    },
  },
  {
    id: 'i329',
    stage: 'intermediate',
    title: 'Grammar Capstone: Full Sentence Taxonomy',
    objective: 'Classify 30 sentences by type: nominal, verbal, conditional, relative, elliptical, and more.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['30-sentence classification exercise', 'Justify each classification with grammatical evidence', 'Write 3 sentences of each type from scratch'],
    quranBridge: {
      arabic: 'وَاللَّهُ بِمَا تَعْمَلُونَ خَبِيرٌ',
      transliteration: "Wallahu bima taamaloona khabir",
      meaning: 'And Allah is Aware of what you do.',
      note: 'Nominal sentence with fronted predicate bima clause: the subject (Allah) + khabir (nominal predicate) + the relative clause specifier — sentence taxonomy perfected.',
    },
  },
  {
    id: 'i330',
    stage: 'intermediate',
    title: 'Intermediate Milestone i330: Synthesis Assessment',
    objective: 'Comprehensive intermediate synthesis test — 50 questions across all skills.',
    duration: '100 min',
    challengeLevel: 'Capstone',
    drills: ['50-question synthesis test', 'Unseen passage reading + comprehension (250 words)', 'Write a 200-word letter in Arabic to a friend about your Arabic journey'],
    quranBridge: {
      arabic: 'رَبِّ زِدْنِي عِلْمًا',
      transliteration: "Rabbi zidni ilma",
      meaning: 'My Lord, increase me in knowledge.',
      note: 'زِدْنِي عِلْمًا (Form IV imperative + tamyiz: increase me in knowledge) — your intermediate stage is complete; stand at i330 and ask for more.',
    },
  },
  {
    id: 'i331',
    stage: 'intermediate',
    title: 'Independent Quran Study: Self-Directed Surah',
    objective: 'Choose any surah not yet studied in depth, read it independently, and produce a grammatical analysis.',
    duration: '70 min',
    challengeLevel: 'Advanced',
    drills: ['Self-directed surah selection', 'Independent grammatical analysis: 5 highlights', 'Present analysis to a study partner or record as audio'],
    quranBridge: {
      arabic: 'وَقُل رَّبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ',
      transliteration: "Waqur rabbi adkhilni mudkhala sidqin wa-akhryjni mukhraja sidq",
      meaning: 'And say: My Lord, cause me to enter an entrance of truth and to exit an exit of truth.',
      note: 'مُدْخَلَ صِدْقٍ / مُخْرَجَ صِدْقٍ (masdar mimi idafa: truthful entering/exiting) — every Quran study session: enter with honesty, leave with honesty.',
    },
  },
  {
    id: 'i332',
    stage: 'intermediate',
    title: 'Independent Grammar Research: Self-Directed Topic',
    objective: 'Choose one Arabic grammar topic not yet covered, research it in an Arabic grammar book, and present findings.',
    duration: '65 min',
    challengeLevel: 'Advanced',
    drills: ['Select topic from classical grammar book (Ibn Aqil, Alfiyya)', 'Write 150-word explanation of the topic in Arabic', 'Present 5 Quranic examples supporting the rule'],
    quranBridge: {
      arabic: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ',
      transliteration: "Afala yatadabbarun al-quran",
      meaning: 'Do they not reflect upon the Quran?',
      note: 'يَتَدَبَّرُونَ (Form V: to reflect deeply, pursue the back/follow-through of meaning) — independent research is Form V tadabbur in action.',
    },
  },
  {
    id: 'i333',
    stage: 'intermediate',
    title: 'Speed Reading Practice: Classical Arabic',
    objective: 'Complete a timed reading of 300 words of classical Arabic in under 10 minutes with 80% comprehension.',
    duration: '40 min',
    challengeLevel: 'Advanced',
    drills: ['300-word timed reading (10 min target)', 'Post-reading comprehension: 5 questions', 'Note reading pace improvement from lesson i281'],
    quranBridge: {
      arabic: 'وَإِذَا قُرِئَ الْقُرْآنُ فَاسْتَمِعُوا لَهُ وَأَنصِتُوا',
      transliteration: "Wa-idha quria l-quran fastamiu lahu wa-ansitu",
      meaning: 'And when the Quran is recited, listen to it and be silent.',
      note: 'فَاسْتَمِعُوا (Form X imperative: seek to hear — Form X adds intentional seeking) — reading Arabic requires both speed and this Form X quality: intentional attention.',
    },
  },
  {
    id: 'i334',
    stage: 'intermediate',
    title: 'Arabic Grammar Reference: Building Your Own Notes',
    objective: 'Create a personalised Arabic grammar reference — your own 2-page summary of the most important rules.',
    duration: '60 min',
    challengeLevel: 'Advanced',
    drills: ['Choose your top 20 grammar rules', 'Write each rule in Arabic with one Quranic example', 'Review: edit for clarity and accuracy'],
    quranBridge: {
      arabic: 'عَلَّمَ بِالْقَلَمِ عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ',
      transliteration: "Allama bil-qalami allama l-insana ma lam yalam",
      meaning: 'Taught by the pen — taught man what he did not know.',
      note: 'عَلَّمَ (Form II: intensive teaching) + بِالْقَلَمِ (by means of the pen) — writing your own grammar notes is Quranic; the pen is divine instrument.',
    },
  },
  {
    id: 'i335',
    stage: 'intermediate',
    title: 'Arabic in Dua: Composing Your Own Supplications',
    objective: 'Compose 5 original personal duas in Arabic following the structure of Quranic and Prophetic duas.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['Dua structure analysis: address + request + reason', 'Prophetic dua vocabulary and forms', 'Compose 5 original duas correcting grammar yourself'],
    quranBridge: {
      arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
      transliteration: "Rabbana atina fid-dunya hasanatan wafil-akhirati hasanatan",
      meaning: 'Our Lord, give us good in this world and good in the Hereafter.',
      note: 'رَبَّنَا (vocative) + آتِنَا (Form IV imperative give us) + حَسَنَةً (indefinite: some good) — Quranic dua structure: address + request + specification.',
    },
  },
  {
    id: 'i336',
    stage: 'intermediate',
    title: 'Memorising Hadith in Arabic: Arbaeen al-Nawawiyya',
    objective: 'Memorise 5 hadiths from al-Nawawi\'s 40 Hadiths in Arabic with full grammatical understanding.',
    duration: '60 min',
    challengeLevel: 'Advanced',
    drills: ['Select 5 hadiths from Arbaeen', 'Memorise each hadith through repetition', 'Parse 3 structures per hadith grammatically'],
    quranBridge: {
      arabic: 'إِنَّمَا الْأَعْمَالُ بِالنِّيَّاتِ وَإِنَّمَا لِكُلِّ امْرِئٍ مَّا نَوَى',
      transliteration: "Innama l-a'malu binniyyati wa-innama likulli imri-in ma nawa",
      meaning: 'Indeed deeds are by intentions and each person gets what they intended.',
      note: 'إِنَّمَا (restriction particle repeated twice) — Hadith 1 of al-Arbaeen: the grammar of intention restricts every deed\'s value to its purpose.',
    },
  },
  {
    id: 'i337',
    stage: 'intermediate',
    title: 'Arabic Vocabulary Consolidation: Final 200 Words',
    objective: 'Consolidate the 200 most important intermediate-level vocabulary words through spaced repetition.',
    duration: '55 min',
    challengeLevel: 'Advanced',
    drills: ['200-word final vocabulary review flashcards', 'Usage test: construct sentences for 40 words', 'Categorise all 200 by topic'],
    quranBridge: {
      arabic: 'وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا',
      transliteration: "Waman yuta l-hikmata faqad utiya khayran kathira",
      meaning: 'And whoever is given wisdom has truly been given much good.',
      note: 'يُؤْتَ/أُوتِيَ (Form IV passive in conditional) — vocabulary is hikmah; consolidating 200 words is receiving خَيْرًا كَثِيرًا.',
    },
  },
  {
    id: 'i338',
    stage: 'intermediate',
    title: 'Arabic Grammar Consolidation: Final Rules Review',
    objective: 'Final comprehensive review of all intermediate grammar rules through 50 quick-fire exercises.',
    duration: '60 min',
    challengeLevel: 'Capstone',
    drills: ['50 quick-fire grammar exercises', 'Rule identification: name the rule for each sentence', 'Grammar speed round: parse 20 sentences in 20 minutes'],
    quranBridge: {
      arabic: 'وَتَعَاوَنُوا عَلَى الْبِرِّ وَالتَّقْوَى',
      transliteration: "Wataawanu alal-birri wat-taqwa",
      meaning: 'And cooperate in righteousness and piety.',
      note: 'تَعَاوَنُوا (Form VI imperative: mutual, reciprocal cooperation) — grammar cooperation: each rule supports the others; master them together.',
    },
  },
  {
    id: 'i339',
    stage: 'intermediate',
    title: 'Peer Teaching Practice: Teach One Grammar Rule',
    objective: 'Teach one Arabic grammar rule to a partner (or explain to camera) — teaching deepens mastery.',
    duration: '50 min',
    challengeLevel: 'Capstone',
    drills: ['Choose grammar rule and prepare 5-minute lesson', 'Create 3 examples and 3 exercises for your lesson', 'Deliver teaching and reflect on comprehension'],
    quranBridge: {
      arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
      transliteration: "Khayrukum man taallama l-qurana wa-allamah",
      meaning: 'The best of you is whoever learns the Quran and teaches it.',
      note: 'تَعَلَّمَ (Form V: learned for himself) + عَلَّمَهُ (Form II: taught others) — the two-stage journey: receive then transmit; Form V then Form II.',
    },
  },
  {
    id: 'i340',
    stage: 'intermediate',
    title: 'INTERMEDIATE GRADUATION: i340 Completion Certificate',
    objective: 'Final comprehensive intermediate graduation test — 60 questions across all skills and domains.',
    duration: '120 min',
    challengeLevel: 'Capstone',
    drills: ['60-question graduation test', 'Read and parse an unseen 300-word classical passage', 'Write a 250-word essay on your Arabic learning journey in Arabic'],
    quranBridge: {
      arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
      transliteration: "Waqur rabbi zidni ilma",
      meaning: 'And say: My Lord, increase me in knowledge.',
      note: 'The intermediate stage ends where the advanced stage begins — with the same supplication. زِدْنِي عِلْمًا — the student who graduates never stops asking.',
    },
  },
  {
    id: 'a1',
    stage: 'advanced',
    title: 'Root Detective: Morphology Deep Dive',
    objective: 'Extract roots and map semantic families from Quran words.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Root triad extraction', 'Family mapping', 'Meaning field comparison'],
    quranBridge: {
      arabic: 'هُدًى لِّلْمُتَّقِينَ',
      transliteration: 'Hudan lilmuttaqin',
      meaning: 'A guidance for the mindful.',
      note: 'Root-level analysis unlocks nuance without full translation dependency.',
    },
  },
  {
    id: 'a2',
    stage: 'advanced',
    title: 'Balaghah Signals and Emphasis',
    objective: 'Identify emphasis particles, oaths, and rhetorical contrast.',
    duration: '48 min',
    challengeLevel: 'Advanced',
    drills: ['Emphasis marker scan', 'Oath structure map', 'Tone shift tracker'],
    quranBridge: {
      arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      transliteration: 'Inna maal usri yusra',
      meaning: 'Indeed, with hardship comes ease.',
      note: 'Particle إن opens emphasis and emotional force.',
    },
  },
  {
    id: 'a3',
    stage: 'advanced',
    title: 'Thematic Coherence in Long Passages',
    objective: 'Trace thematic architecture across multiple ayat.',
    duration: '50 min',
    challengeLevel: 'Advanced+',
    drills: ['Theme chain mapping', 'Narrative pivots', 'Argument ladder'],
    quranBridge: {
      arabic: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',
      transliteration: 'Allahu nuru as-samawati wal-ard',
      meaning: 'Allah is the Light of the heavens and the earth.',
      note: 'You map metaphor and structure, not only vocabulary.',
    },
  },
  {
    id: 'a4',
    stage: 'advanced',
    title: 'Independent Tadabbur Workflow',
    objective: 'Build your own repeatable Quran reflection and language analysis process.',
    duration: '55 min',
    challengeLevel: 'Capstone',
    drills: ['Personal tadabbur notes', 'Weekly review loop', 'Teach-back explanation'],
    quranBridge: {
      arabic: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ',
      transliteration: 'Afala yatadabbarunal-quran',
      meaning: 'Will they not then reflect on the Quran?',
      note: 'You leave with a lifelong system, not isolated lessons.',
    },
  },
  {
    id: 'a5',
    stage: 'advanced',
    title: 'Weak Verbs I: Mithal (First Radical Waw)',
    objective: 'Identify and conjugate mithal verbs where the first root letter is waw.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Conjugate 8 mithal verbs fully', 'Spot the dropped waw in 15 verb forms', 'Parse mithal verbs in Surah al-Waqia'],
    quranBridge: {
      arabic: 'وَصَلَّى وَتَوَلَّى',
      transliteration: 'Wasalla watawalla',
      meaning: 'And prayed and turned away.',
      note: 'وَصَلَّى features a Form II and Form V weak verb back-to-back — double weak verb challenge.',
    },
  },
  {
    id: 'a6',
    stage: 'advanced',
    title: 'Weak Verbs II: Ajwaf (Hollow Verbs)',
    objective: 'Master hollow verbs with medial waw or ya and their conjugation patterns.',
    duration: '48 min',
    challengeLevel: 'Advanced',
    drills: ['Convert 10 ajwaf roots to all tenses', 'Identify the missing middle radical', 'Parse 5 hollow verbs in context'],
    quranBridge: {
      arabic: 'قَالَ رَبِّ إِنِّي وَهَنَ الْعَظْمُ مِنِّي',
      transliteration: 'Qala rabbi inni wahana al-admu minni',
      meaning: 'He said: My Lord, my bones have become feeble.',
      note: 'وَهَنَ is an ajwaf verb — its hollow structure is felt in its conjugation throughout the Quran.',
    },
  },
  {
    id: 'a7',
    stage: 'advanced',
    title: 'Weak Verbs III: Naqis (Defective Verbs)',
    objective: 'Conjugate defective verbs ending in waw or ya correctly across all forms.',
    duration: '48 min',
    challengeLevel: 'Advanced',
    drills: ['All-tense conjugation for 8 naqis verbs', 'Final radical identification drill', 'Quran defective verb hunt'],
    quranBridge: {
      arabic: 'وَإِذَا تُلِيَتْ عَلَيْهِمْ آيَاتُهُ زَادَتْهُمْ إِيمَانًا',
      transliteration: 'Wa idha tuliyat alayhim ayatuhu zadathum imana',
      meaning: 'And when His verses are recited to them they increase them in faith.',
      note: 'زَاد is an ajwaf verb — one of the most morphologically complex common Quran verbs.',
    },
  },
  {
    id: 'a8',
    stage: 'advanced',
    title: 'Doubled Verbs (Mudaaf)',
    objective: 'Recognize and parse doubled-root verbs where the second and third radicals are the same.',
    duration: '42 min',
    challengeLevel: 'Advanced',
    drills: ['Doubled root identification in 15 verbs', 'Shadda placement rules mastery', 'Parse 6 doubled verbs in passage'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ',
      transliteration: 'Innallaha yuhibbut-tawwabin',
      meaning: 'Indeed Allah loves those who repent.',
      note: 'يُحِبُّ is a doubled verb from ح-ب-ب — the doubled ba is compressed and must not be lost.',
    },
  },
  {
    id: 'a9',
    stage: 'advanced',
    title: 'Hamzated Verbs (Mahmuz)',
    objective: 'Handle hamza in all three root positions across verb forms.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Hamza seat identification', 'Write hamzated verbs in 3 forms', 'Read passage with 10 hamzated verbs'],
    quranBridge: {
      arabic: 'سَأَلَ سَائِلٌ بِعَذَابٍ وَاقِعٍ',
      transliteration: 'Saala sailun biazabin waqii',
      meaning: 'A questioner asked about an inevitable punishment.',
      note: 'سَأَلَ opens Surah al-Maarij — its hamzated form appears differently in different derived words.',
    },
  },
  {
    id: 'a10',
    stage: 'advanced',
    title: 'Passive Voice: Mabni Lil-Majhul',
    objective: 'Form and parse the passive voice for both tenses across regular and weak verbs.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Convert 15 active verbs to passive', 'Extract implied agent from 10 passives', 'Spot 5 passive verbs in Surah al-Fatihah context'],
    quranBridge: {
      arabic: 'خُلِقَ الْإِنسَانُ مِنْ عَجَلٍ',
      transliteration: 'Khuliqa al-insanu min ajal',
      meaning: 'Man was created from haste.',
      note: 'خُلِقَ is the passive of خَلَقَ — the implied agent (Allah) is understood, not stated.',
    },
  },
  {
    id: 'a11',
    stage: 'advanced',
    title: 'Complete Sarf: Morphological Parsing',
    objective: 'Parse any Arabic word form giving root, form number, tense, person, gender, and number.',
    duration: '50 min',
    challengeLevel: 'Advanced+',
    drills: ['Full sarf table completion for 5 verbs', 'Parse 20 words from a surah page', 'Oral parsing practice with a partner'],
    quranBridge: {
      arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
      transliteration: 'Waman yatawakkal alallahi fahuwa hasbuhu',
      meaning: 'And whoever relies on Allah — then He is sufficient for him.',
      note: 'يَتَوَكَّلْ is Form V jussive of و-ك-ل — a complete sarf analysis in one verb.',
    },
  },
  {
    id: 'a12',
    stage: 'advanced',
    title: "Complete I'rab: Syntactic Parsing",
    objective: "Assign full i'rab to every word in a Quranic sentence (position, case, marker).",
    duration: '52 min',
    challengeLevel: 'Advanced+',
    drills: ["Full i'rab worksheet for 10 sentences", 'Identify parsing disputes (ikhtilaf)', "Write i'rab for 5 ayat from Yasin"],
    quranBridge: {
      arabic: 'وَمَا يَعْلَمُ جُنُودَ رَبِّكَ إِلَّا هُوَ',
      transliteration: 'Wama yalamu junuda rabbika illa hu',
      meaning: 'And none knows the soldiers of your Lord except Him.',
      note: "Five distinct i'rab positions in one short verse — an ideal full-parsing exercise.",
    },
  },
  {
    id: 'a13',
    stage: 'advanced',
    title: "Simile and Metaphor: Tashbih and Istiaara",
    objective: "Identify and analyze simile (tashbih) and metaphor (isti'ara) in the Quran.",
    duration: '48 min',
    challengeLevel: 'Advanced',
    drills: ['Tag 10 figures of speech by type', 'Explain the rhetorical effect of 5 metaphors', 'Find 3 extended metaphors in a surah'],
    quranBridge: {
      arabic: 'مَثَلُهُمْ كَمَثَلِ الَّذِي اسْتَوْقَدَ نَارًا',
      transliteration: 'Mathaluhum kamathalilladhi istawqada nara',
      meaning: 'Their example is like one who kindled a fire.',
      note: "This is a full tashbih (simile) — comparing the hypocrite's spiritual state to a fire parable.",
    },
  },
  {
    id: 'a14',
    stage: 'advanced',
    title: 'Saj, Fasila, and Quranic Rhyme',
    objective: 'Analyze the cadence patterns (fasila) at verse ends and their rhetorical function.',
    duration: '46 min',
    challengeLevel: 'Advanced',
    drills: ['Map fasila endings in 3 surahs', 'Compare rhyme patterns across surah types', 'Analyze sound-meaning harmony in 5 ayat'],
    quranBridge: {
      arabic: 'لَيَالٍ عَشْرٍ وَالشَّفْعِ وَالْوَتْرِ',
      transliteration: 'Layalin ashr wash-shafi wal-watr',
      meaning: 'And the ten nights, and the even and the odd.',
      note: 'The fasila endings in Surah al-Fajr cascade in rhythm — a master class in Quranic sound design.',
    },
  },
  {
    id: 'a15',
    stage: 'advanced',
    title: 'Hadhf (Ellipsis) in Quran',
    objective: 'Recognize what has been omitted by the Quran and explain why it is linguistically powerful.',
    duration: '46 min',
    challengeLevel: 'Advanced',
    drills: ['Supply the omitted element in 10 sentences', 'Explain rhetorical impact of 5 hadhfs', 'Compare full vs elliptic forms'],
    quranBridge: {
      arabic: 'وَلَوْ تَرَى إِذِ الظَّالِمُونَ فِي غَمَرَاتِ الْمَوْتِ',
      transliteration: 'Walaw tara idhiz-zalimuna fi ghamaratil mawt',
      meaning: 'And if you could see when the wrongdoers are in the pangs of death.',
      note: 'The apodosis (response clause) is omitted after لَوْ — the silence is intentional and devastating.',
    },
  },
  {
    id: 'a16',
    stage: 'advanced',
    title: 'Repetition (Tikrar) as Emphasis',
    objective: 'Analyze how the Quran uses lexical and structural repetition for rhetorical power.',
    duration: '45 min',
    challengeLevel: 'Advanced',
    drills: ['Map all repetitions in Surah ar-Rahman', 'Categorize: emphatic vs narrative vs pedagogical', 'Write analysis of one repeated phrase'],
    quranBridge: {
      arabic: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
      transliteration: 'Fabi-ayyi alai rabbikuma tukadhiban',
      meaning: 'So which of the favors of your Lord would you deny?',
      note: 'This verse repeats 31 times in Surah ar-Rahman — the most studied case of tikrar in the Quran.',
    },
  },
  {
    id: 'a17',
    stage: 'advanced',
    title: 'Tibaaq: Opposites and Contrasts',
    objective: 'Identify and explain contrasting word pairs (tibaaq) as a balaghah device.',
    duration: '42 min',
    challengeLevel: 'Advanced',
    drills: ['Find 15 tibaaq pairs in Quran', 'Explain why the contrast enhances meaning', 'Map tibaaq in Surah al-Layl'],
    quranBridge: {
      arabic: 'وَاللَّيْلِ إِذَا يَغْشَى وَالنَّهَارِ إِذَا تَجَلَّى',
      transliteration: 'Wallayli idha yaghsha wannahari idha tajalla',
      meaning: 'By the night when it covers and by the day when it shines.',
      note: 'الليل / النهار and يغشى / تجلّى — two tibaaq pairs creating a perfect cosmic contrast.',
    },
  },
  {
    id: 'a18',
    stage: 'advanced',
    title: 'Rhetorical Questions (Istifham Balagi)',
    objective: 'Interpret rhetorical questions that function as statements, rebukes, or invitations.',
    duration: '44 min',
    challengeLevel: 'Advanced',
    drills: ['Convert 10 rhetorical questions to implied statements', 'Tag tone: rebuke/wonder/warning', 'Find 5 rhetorical questions in Surah al-Ghashiya'],
    quranBridge: {
      arabic: 'هَلْ أَتَاكَ حَدِيثُ الْغَاشِيَةِ',
      transliteration: 'Hal ataka hadithul ghashiya',
      meaning: 'Has there reached you the news of the Overwhelming?',
      note: 'هَلْ here is not a real question — it is an invitation to solemn reflection.',
    },
  },
  {
    id: 'a19',
    stage: 'advanced',
    title: 'Ring Composition and Surah Structure',
    objective: 'Map chiastic (ring) structures in Quranic surahs and explain their function.',
    duration: '50 min',
    challengeLevel: 'Advanced+',
    drills: ['Map the ring structure of Surah al-Kahf', 'Identify the central verse', 'Write a structural analysis'],
    quranBridge: {
      arabic: 'مَا أَنزَلْنَا عَلَيْكَ الْقُرْآنَ لِتَشْقَى',
      transliteration: 'Ma anzalna alaykal-qurana litashqa',
      meaning: 'We have not sent down the Quran to you to cause you distress.',
      note: 'This ayah is near the structural center of Surah Ta-Ha — a deliberate compositional choice.',
    },
  },
  {
    id: 'a20',
    stage: 'advanced',
    title: 'Asbaab an-Nuzul: Revelation Contexts',
    objective: 'Study revelation contexts of key ayat and analyze how context shapes interpretation.',
    duration: '48 min',
    challengeLevel: 'Advanced',
    drills: ['Match 10 ayat to their sabab', 'Explain how sabab affects tafseer', 'Research sabab for 3 contested ayat'],
    quranBridge: {
      arabic: 'لَيْسَ لَكَ مِنَ الْأَمْرِ شَيْءٌ',
      transliteration: 'Laysa laka minal-amri shay',
      meaning: 'It is not for you to decide anything.',
      note: 'This ayah was revealed in aftermath of Uhud — knowing the sabab transforms its depth completely.',
    },
  },
  {
    id: 'a21',
    stage: 'advanced',
    title: 'Tafseer Methodology',
    objective: 'Apply the classical tafseer hierarchy: Quran by Quran, by Sunnah, by companions, by language.',
    duration: '52 min',
    challengeLevel: 'Advanced+',
    drills: ['Tafseer hierarchy exercise for 5 words', 'Compare 3 tafseer sources on one verse', 'Write a short tafseer entry'],
    quranBridge: {
      arabic: 'وَتِلْكَ الْأَمْثَالُ نَضْرِبُهَا لِلنَّاسِ وَمَا يَعْقِلُهَا إِلَّا الْعَالِمُونَ',
      transliteration: 'Watilkal-amthalu nadribuhaa linnaasi wama yaqiluha illal-alimun',
      meaning: 'These are the parables We set forth for the people, but none understands them except those of knowledge.',
      note: "The Quran itself speaks about who can grasp its depths — a call to pursue the scholarship you're building.",
    },
  },
  {
    id: 'a22',
    stage: 'advanced',
    title: 'Advanced Reading: Surah Yusuf',
    objective: "Conduct a full linguistic analysis of Surah Yusuf's opening passage.",
    duration: '55 min',
    challengeLevel: 'Advanced+',
    drills: ['Annotated reading of verses 1-20', 'Root extraction for 10 new words', 'Narrative grammar analysis'],
    quranBridge: {
      arabic: 'نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ',
      transliteration: 'Nahnu naqussu alayka ahsanal-qasas',
      meaning: 'We relate to you the best of stories.',
      note: 'أَحْسَنَ الْقَصَصِ — a superlative idafa: a beautiful advanced grammar structure.',
    },
  },
  {
    id: 'a23',
    stage: 'advanced',
    title: 'Advanced Reading: Surah al-Baqarah Passages',
    objective: 'Parse and analyze 20 longer ayat from Surah al-Baqarah covering theology and law.',
    duration: '55 min',
    challengeLevel: 'Advanced+',
    drills: ["Full i'rab of 5 complex sentences", 'Thematic passage comparison', 'Vocabulary depth: 20 theological terms'],
    quranBridge: {
      arabic: 'إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ وَأَقَامُوا الصَّلَاةَ وَآتَوُا الزَّكَاةَ لَهُمْ أَجْرُهُمْ',
      transliteration: 'Innal-ladhina amanu wa amilas-salihati wa aqamas-salata wa atawuz-zakata lahum ajruhum',
      meaning: 'Those who believe, do righteous deeds, establish prayer, and give zakah — for them their reward.',
      note: 'Four stacked relative clauses before the predicate — this is the advanced grammar density of al-Baqarah.',
    },
  },
  {
    id: 'a24',
    stage: 'advanced',
    title: 'Hadith Arabic: Register and Style',
    objective: 'Identify how Hadith Arabic differs from Quranic Arabic in style, vocabulary, and grammar.',
    duration: '48 min',
    challengeLevel: 'Advanced',
    drills: ['Compare 5 hadith with parallel Quran ayat', 'Identify 10 hadith-specific vocabulary items', 'Parse 3 hadith matn passages'],
    quranBridge: {
      arabic: 'وَمَا آتَاكُمُ الرَّسُولُ فَخُذُوهُ وَمَا نَهَاكُمْ عَنْهُ فَانتَهُوا',
      transliteration: 'Wama ataakumur-rasulu fakhudhuhuu wama nahakum anhu fantahu',
      meaning: 'What the Messenger gives you, take it; what he forbids you, abstain.',
      note: 'The Quran commands following the Prophet — studying hadith Arabic completes the sacred text tradition.',
    },
  },
  {
    id: 'a25',
    stage: 'advanced',
    title: 'Fiqh and Legal Text Vocabulary',
    objective: 'Build a 50-word Islamic legal vocabulary for reading fiqh texts.',
    duration: '48 min',
    challengeLevel: 'Advanced',
    drills: ['Legal term definition matching', 'Classify: ibadah / muamalat / uqubat', 'Read a simple fatwa passage'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَوْفُوا بِالْعُقُودِ',
      transliteration: 'Ya ayyuhalladhina amanu awfu bil-uqud',
      meaning: 'O you who believe, fulfill contracts.',
      note: "عُقُود (contracts) is a key fiqh term — the Quran's legal language is the foundation of Islamic law.",
    },
  },
  {
    id: 'a26',
    stage: 'advanced',
    title: 'Advanced Reading: Surah al-Kahf',
    objective: 'Conduct full linguistic and thematic analysis of all four episodes of Surah al-Kahf.',
    duration: '60 min',
    challengeLevel: 'Advanced+',
    drills: ['Map 4 narrative episodes', "Grammar analysis for each episode's theme ayah", 'Comparative thematic essay outline'],
    quranBridge: {
      arabic: 'إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ كَانَتْ لَهُمْ جَنَّاتُ الْفِرْدَوْسِ نُزُلًا',
      transliteration: 'Innal-ladhina amanu wa amilas-salihati kanat lahum jannatul firdawsi nuzula',
      meaning: 'For those who believed and did righteous deeds, the Gardens of Paradise will be a lodging.',
      note: "This verse closes the fourth episode and unifies al-Kahf's theme — a capstone for the entire surah.",
    },
  },
  {
    id: 'a27',
    stage: 'advanced',
    title: 'Kinaya: Metonymy and Allusion',
    objective: 'Identify kinaya (indirect allusion) and explain what the Quran intends beyond the literal.',
    duration: '46 min',
    challengeLevel: 'Advanced',
    drills: ['Identify kinaya in 10 ayat', 'Explain literal vs intended meaning', 'Compare tafseer commentary on 3 kinaya passages'],
    quranBridge: {
      arabic: 'نِسَاؤُكُمْ حَرْثٌ لَّكُمْ',
      transliteration: 'Nisaaukum harthun lakum',
      meaning: 'Your wives are a tillage for you.',
      note: 'حَرْث (tillage) is a kinaya — a vivid indirect expression carrying deep meaning.',
    },
  },
  {
    id: 'a28',
    stage: 'advanced',
    title: 'Classical Arabic Prose and Poetry',
    objective: 'Read pre-Islamic and early Islamic Arabic texts to understand Quranic classical context.',
    duration: '52 min',
    challengeLevel: 'Advanced+',
    drills: ['Read a Muallaqat passage with commentary', 'Identify classical vocabulary in Quran', 'Compare rhetorical styles'],
    quranBridge: {
      arabic: 'وَإِنَّهُ لَتَنزِيلُ رَبِّ الْعَالَمِينَ نَزَلَ بِهِ الرُّوحُ الْأَمِينُ',
      transliteration: 'Wainnahu latanzilu rabbil-alamin nazala bihir ruhul-amin',
      meaning: 'And indeed the Quran is the revelation of the Lord of the worlds, brought down by the Trustworthy Spirit.',
      note: "The Quran was revealed in the Arabic of its time — understanding classical poetry sharpens sensitivity to its style.",
    },
  },
  {
    id: 'a29',
    stage: 'advanced',
    title: 'Advanced Surah Analysis: An-Nahl',
    objective: "Analyze Surah an-Nahl's recurring arguments and rhetorical architecture.",
    duration: '55 min',
    challengeLevel: 'Advanced+',
    drills: ['Map five argument units', 'Identify recurring vocabulary (15 words)', 'Write a half-page rhetorical analysis'],
    quranBridge: {
      arabic: 'وَأَوْحَى رَبُّكَ إِلَى النَّحْلِ أَنِ اتَّخِذِي مِنَ الْجِبَالِ بُيُوتًا',
      transliteration: 'Wa awha rabbuka ilan-nahl anit-takhidhi minal-jibali buyuta',
      meaning: 'And your Lord inspired the bee: take for yourself among the mountains, houses.',
      note: 'أَوْحَى + إِلَى + أَنِ اتَّخِذِي — a divine command construction unique to this surah.',
    },
  },
  {
    id: 'a30',
    stage: 'advanced',
    title: 'Advanced Capstone: Full Tadabbur Project',
    objective: 'Choose any surah and produce a complete independent language and reflection analysis.',
    duration: '90 min',
    challengeLevel: 'Capstone',
    drills: ['Independent surah selection and study plan', "Full written analysis with i'rab samples", 'Presentation to peers or mentor'],
    quranBridge: {
      arabic: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَى قُلُوبٍ أَقْفَالُهَا',
      transliteration: 'Afala yatadabbarunal-qurana am ala qulubin aqfaluha',
      meaning: 'Will they not reflect upon the Quran, or are there locks upon their hearts?',
      note: 'The ultimate challenge: you have the keys. This capstone project is your proof.',
    },
  },
  {
    id: 'a31',
    stage: 'advanced',
    title: 'Advanced Quranic Analysis: Surah al-Baqarah Macro-Structure',
    objective: 'Analyse the macro-structure of al-Baqarah — its major themes, ring composition, and pivot verses.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Map thematic sections of al-Baqarah (286 verses)', 'Identify ring structure (first vs last 5 verses)', 'Find the pivot verse and justify grammatically'],
    quranBridge: {
      arabic: 'تِلْكَ حُدُودُ اللَّهِ فَلَا تَعْتَدُوهَا',
      transliteration: "Tilka hududullahi fala taatadoha",
      meaning: 'These are the limits set by Allah, so do not transgress them.',
      note: 'تِلْكَ (distal demonstrative: those limits — far, grand) — al-Baqarah\'s macro-structure IS those limits; every thematic block is a hudood of Allah.',
    },
  },
  {
    id: 'a32',
    stage: 'advanced',
    title: 'Advanced Tafsir Technique: Tabari\'s Methodology',
    objective: 'Master al-Tabari\'s tafsir methodology: chains of transmission, multiple opinions, and linguistic analysis.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Read one full Tabari entry on an ayah', 'Identify: each rawi, opinion comparison, Tabari\'s final preference', 'Write a mini-tafsir entry in Tabari\'s style (150 words)'],
    quranBridge: {
      arabic: 'إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
      transliteration: "Inna hadhal-qurana yahdi lillati hiya aqwam",
      meaning: 'Indeed this Quran guides to that which is most upright.',
      note: 'أَقْوَمُ (elative of Form IV root ق-و-م: most upright/correct) — Tabari\'s tafsir seeks the أَقْوَمُ interpretation: the most upright scholarly reading.',
    },
  },
  {
    id: 'a33',
    stage: 'advanced',
    title: 'Advanced Morphology: Form VIII and X Extended',
    objective: 'Master the semantic patterns and applications of Form VIII (افتعل) and Form X (استفعل) thoroughly.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Form VIII semantic pattern: reflexive-reciprocal (30 examples)', 'Form X semantic pattern: seeking/deeming (30 examples)', 'Generate Form VIII and X from 20 root families'],
    quranBridge: {
      arabic: 'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ',
      transliteration: "Wastainu bis-sabri was-salah",
      meaning: 'And seek help through patience and prayer.',
      note: 'اسْتَعِينُوا (Form X imperative: seek to obtain help for yourselves) — the seeking quality of Form X: not just to help, but to actively seek out help.',
    },
  },
  {
    id: 'a34',
    stage: 'advanced',
    title: 'Advanced Morphology: Quadriliteral Roots',
    objective: 'Study quadriliteral (4-letter root) verbs and nouns in Arabic — a rare but important category.',
    duration: '45 min',
    challengeLevel: 'Expert',
    drills: ['10 quadriliteral verb examples', 'Quadriliteral verb forms (I and II)', 'Identify any quadriliterals in the Quran'],
    quranBridge: {
      arabic: 'فَإِذَا تَطَهَّرْنَ فَأْتُوهُنَّ مِنْ حَيْثُ أَمَرَكُمُ اللَّهُ',
      transliteration: "Fa-idha tatahharna fa-tuhannas min haythu amarakumullah",
      meaning: 'And when they have purified themselves, come to them from where Allah has commanded you.',
      note: 'تَطَهَّرْنَ (Form V: to purify themselves — not tri-literal in origin here; Form V from طهر) — Arabic morphology is varied and structured.',
    },
  },
  {
    id: 'a35',
    stage: 'advanced',
    title: 'Advanced Syntax: Arabic Discourse Analysis',
    objective: 'Apply discourse analysis tools to an Arabic text — cohesion, coherence, and topic structure.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Identify cohesive devices in a 20-sentence passage', 'Map topic progression and comment flow', 'Compare two passages for discourse quality'],
    quranBridge: {
      arabic: 'أَلَمْ تَرَ كَيْفَ فَعَلَ رَبُّكَ بِأَصْحَابِ الْفِيلِ',
      transliteration: "Alam tara kayfa faala rabbuka bi-ashabil-fil",
      meaning: 'Have you not seen how your Lord dealt with the companions of the elephant?',
      note: 'أَلَمْ تَرَ (rhetorical question as discourse opener) + كَيْفَ (manner question embedded) — the Quran\'s discourse analysed: every surah is a masterclass in Arabic text structure.',
    },
  },
  {
    id: 'a36',
    stage: 'advanced',
    title: 'Quran Deep Dive: Surah al-Anfal — Battle Discourse',
    objective: 'Study al-Anfal\'s legal and moral framework — spoils of war, command obedience, strategic trust.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Anfal 1-40 with harakat', 'Battle vocabulary in Arabic', 'Grammar: 5 imperative commands issued to believers'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا إِذَا لَقِيتُمْ فِئَةً فَاثْبُتُوا',
      transliteration: "Ya ayyuhal-ladhina amanu idha laqitum fiatan fathubutu",
      meaning: 'O you who believe, when you encounter a company, stand firm.',
      note: 'فَاثْبُتُوا (consequential command fa + Form I imperative: stand firm!) — al-Anfal\'s grammar is military command language; believers are grammatically addressed as an army.',
    },
  },
  {
    id: 'a37',
    stage: 'advanced',
    title: 'Quran Deep Dive: Surah at-Tawbah — No Bismillah',
    objective: 'Study the unique opener of at-Tawbah, its historical context, and the classical explanations for missing Bismillah.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read at-Tawbah 1-30 with harakat', '3 scholarly explanations for missing Bismillah', 'Grammar of disavowal: bara\'a constructions'],
    quranBridge: {
      arabic: 'بَرَاءَةٌ مِّنَ اللَّهِ وَرَسُولِهِ إِلَى الَّذِينَ عَاهَدتُّم',
      transliteration: "Bara-atun minallahi warasulihi ilal-ladhina ahadtum",
      meaning: 'A declaration of disassociation from Allah and His Messenger to those with whom you had a treaty.',
      note: 'بَرَاءَةٌ (indefinite masdar: an act of disassociation) + مِنَ (source) — the unique surah opens without Bismillah because it announces removal of mercy rather than its presence.',
    },
  },
  {
    id: 'a38',
    stage: 'advanced',
    title: 'Classical Grammar Texts: Reading Ibn Aqil on the Alfiyya',
    objective: 'Read and understand a selection from Ibn Aqil\'s commentary on Ibn Malik\'s Alfiyya (1000-verse grammar poem).',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Read 10 verses from the Alfiyya with Ibn Aqil commentary', 'Extract the grammar rule illustrated', 'Explain the rule in your own words with a Quranic example'],
    quranBridge: {
      arabic: 'كَلَامُنَا لَفْظٌ مُفِيدٌ كَاسْتَقِمْ',
      transliteration: "Kalamuna lafdhun mufidun kas-taqim",
      meaning: 'Our speech [Arabic] is a useful expression, such as: be upright!',
      note: 'The opening verse of the Alfiyya — كَلَامُنَا لَفْظٌ مُفِيدٌ: speech is useful expression — the entire Arabic grammatical tradition begins with purpose.',
    },
  },
  {
    id: 'a39',
    stage: 'advanced',
    title: 'Advanced Rhetoric: The Science of Al-Maani (Meanings)',
    objective: 'Study ilm al-maani — the rhetorical science of sentence meaning, word order significance, and functional grammar.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['5 examples of topic fronting for emphasis', '5 examples of comment-deletion for effect', 'Write 5 sentences demonstrating maani principles'],
    quranBridge: {
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      transliteration: "Iyyaka nabudu wa-iyyaka nastain",
      meaning: 'You alone we worship and You alone we ask for help.',
      note: 'إِيَّاكَ (direct object fronted before verb: restriction to You) — ilm al-maani explains why إِيَّاكَ نَعْبُدُ means ONLY you, grammatically.',
    },
  },
  {
    id: 'a40',
    stage: 'advanced',
    title: 'Advanced Rhetoric: Al-Bayan (Figurative Expression)',
    objective: 'Study ilm al-bayan — metaphor (isti\'ara), simile (tashbih), and metonymy (kinaya) in depth.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['10 Quranic isti\'ara examples with analysis', '10 Quranic tashbih examples', '5 Quranic kinaya examples'],
    quranBridge: {
      arabic: 'وَاخْفِضْ لَهُمَا جَنَاحَ الذُّلِّ مِنَ الرَّحْمَةِ',
      transliteration: "Wakhfid lahuma janaha dhdhul-li minar-rahma",
      meaning: 'And lower to them the wing of humility out of mercy.',
      note: 'جَنَاحَ الذُّلِّ (wing of humility — isti\'ara: metaphor of humble bird bowing wing) — al-bayan at its most beautiful: abstract humility gains feathers.',
    },
  },
  {
    id: 'a41',
    stage: 'advanced',
    title: 'Advanced Rhetoric: Al-Badi (Ornamentation)',
    objective: 'Study ilm al-badi — jinas (homonymy), muqabala (contrast), and iltifat (sudden address shift).',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['10 Quranic jinas examples', '10 muqabala contrast examples', '5 iltifat address-shift examples'],
    quranBridge: {
      arabic: 'وَجَزَاءُ سَيِّئَةٍ سَيِّئَةٌ مِّثْلُهَا',
      transliteration: "Wajazau sayyiatin sayyiatun mithlaha",
      meaning: 'And the recompense of an evil deed is an evil deed like it.',
      note: 'سَيِّئَةٍ...سَيِّئَةٌ (jinas: same word with different case endings — muqabala) — al-badi in the Quran: justice expressed through perfect word-mirror.',
    },
  },
  {
    id: 'a42',
    stage: 'advanced',
    title: 'Advanced Reading Sprint: Al-Risala of al-Shafi\'i',
    objective: 'Read 500 words of al-Shafi\'i\'s al-Risala (the founding text of Islamic legal theory) and parse it.',
    duration: '75 min',
    challengeLevel: 'Expert',
    drills: ['Read 500 words of al-Risala', '5 technical legal terms parsed grammatically', 'Identify al-Shafi\'i\'s argument structure in 150 words'],
    quranBridge: {
      arabic: 'وَمَا كَانَ لِمُؤْمِنٍ وَلَا مُؤْمِنَةٍ إِذَا قَضَى اللَّهُ وَرَسُولُهُ أَمْرًا أَن يَكُونَ لَهُمُ الْخِيَرَةُ',
      transliteration: "Wama kana li-muminin wala muminatin idha qadallahu warasuluhu amran an yakuna lahumul-khiyara",
      meaning: 'It is not for a believing man or woman, when Allah and His Messenger have decided, to have any choice.',
      note: 'أَن يَكُونَ (subjunctive after لَهُمُ الْخِيَرَةُ: that there should be for them choice) — al-Shafi\'i\'s entire legal framework began from understanding this verse\'s grammar.',
    },
  },
  {
    id: 'a43',
    stage: 'advanced',
    title: 'Surah al-Nahl: Signs, Bees, and Divine Beneficence',
    objective: 'Study al-Nahl 65-100 — divine signs in creation, the bee, and divine commands as linguistic structures.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Nahl 65-100 with harakat', 'Sign vocabulary: honey, rivers, mountains, livestock', 'Grammar: divine active verb patterns in creation descriptions'],
    quranBridge: {
      arabic: 'وَأَوْحَى رَبُّكَ إِلَى النَّحْلِ أَنِ اتَّخِذِي مِنَ الْجِبَالِ بُيُوتًا',
      transliteration: "Wa-awha rabbuka ilan-nahli anittakhidhi minal-jibali buyuta",
      meaning: 'And your Lord inspired the bee to take in the mountains as homes.',
      note: 'أَوْحَى...إِلَى النَّحْلِ (divine wahi to a bee: same verb as Quranic revelation) — the grammar of divine inspiration encompasses prophets and bees.',
    },
  },
  {
    id: 'a44',
    stage: 'advanced',
    title: 'Surah al-Isra: Night Journey and Legal Code',
    objective: 'Study al-Isra 23-39 — the 17 moral commandments forming the Quranic moral code.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Isra 23-39 listing all 17 commands', 'Classify each command: positive or negative, target audience', 'Grammar: prohibition negatives with لَا and وَلَا'],
    quranBridge: {
      arabic: 'وَقَضَى رَبُّكَ أَلَّا تَعْبُدُوا إِلَّا إِيَّاهُ وَبِالْوَالِدَيْنِ إِحْسَانًا',
      transliteration: "Waqada rabbuka alla taabudu illa iyyahu wabil-walidayni ihsana",
      meaning: 'And your Lord has decreed that you not worship except Him, and to parents, good treatment.',
      note: 'قَضَى (decided, decreed — strong verb) + إِحْسَانًا (accusative of specification: good treatment precisely) — the most comprehensive ethical code begins with God then parents.',
    },
  },
  {
    id: 'a45',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Pragmatics — Speech Acts',
    objective: 'Apply Austin-Searle speech act theory to Arabic — locution, illocution, perlocution in Quranic context.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['5 Quranic speech acts: classify as directive, assertive, etc.', 'Identify the perlocutionary force of 5 commands', 'Write 5 Arabic sentences with distinct illocutionary force'],
    quranBridge: {
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ',
      transliteration: "Qul huwallahu ahad",
      meaning: 'Say: He is Allah, the One.',
      note: 'قُلْ (directive speech act: illocution = command to speak) + هُوَ اللَّهُ أَحَدٌ (assertive: declarative speech act) — al-Ikhlas has two stacked speech acts in four letters.',
    },
  },
  {
    id: 'a46',
    stage: 'advanced',
    title: 'Advanced Vocabulary: Antonyms in Classical Arabic',
    objective: 'Master 50 classical Arabic antonym pairs — including those used in Quranic moral discourse.',
    duration: '40 min',
    challengeLevel: 'Expert',
    drills: ['50 antonym pair flashcards', 'Construct 10 sentences using tibaq (antithesis) technique', 'Find 5 Quranic verses pairing antonyms'],
    quranBridge: {
      arabic: 'فَأَمَّا مَن أَعْطَى وَاتَّقَى... وَأَمَّا مَن بَخِلَ وَاسْتَغْنَى',
      transliteration: "Fa-amma man ataa wattaqa... wa-amma man bakhila wastaghhna",
      meaning: 'As for one who gives and fears Allah... as for one who withholds and considers himself self-sufficient.',
      note: 'أَعْطَى vs بَخِلَ + اتَّقَى vs اسْتَغْنَى (double antonyms in perfect parallel) — al-Layl\'s tibaq: the Quran uses antonym pair grammar to describe all humanity.',
    },
  },
  {
    id: 'a47',
    stage: 'advanced',
    title: 'Advanced Vocabulary: Synonyms and Nuance in Sacred Text',
    objective: 'Study 30 Arabic near-synonym pairs and the precise theological/grammatical differences between them.',
    duration: '45 min',
    challengeLevel: 'Expert',
    drills: ['30 synonym pairs: what is the exact difference?', 'When does the Quran use خَوْف vs خَشْيَة? رَحْمَة vs مَغْفِرَة?', 'Write 10 sentences showing you understand one key difference'],
    quranBridge: {
      arabic: 'إِنَّمَا يَخْشَى اللَّهَ مِنْ عِبَادِهِ الْعُلَمَاءُ',
      transliteration: "Innama yakhshAllaha min ibadihi l-ulama",
      meaning: 'Indeed, it is only those with knowledge among His servants who truly fear Allah.',
      note: 'يَخْشَى (not يَخَافُ: khashya = awe-fear from ma\'rifa, khawf = fear from ignorance) — synonym precision: the Quran chooses خَشْيَة for the ulama because it carries knowledge-based awe.',
    },
  },
  {
    id: 'a48',
    stage: 'advanced',
    title: 'Advanced Arabic Writing: Argumentative Essay',
    objective: 'Write a 300-word Arabic argumentative essay with clear thesis, supporting arguments, and counter-argument.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Essay plan: thesis + 3 arguments + counter + conclusion', 'Write 300-word Arabic essay', 'Self-edit for grammar accuracy and rhetorical impact'],
    quranBridge: {
      arabic: 'ادْعُ إِلَى سَبِيلِ رَبِّكَ بِالْحِكْمَةِ وَالْمَوْعِظَةِ الْحَسَنَةِ وَجَادِلْهُم بِالَّتِي هِيَ أَحْسَنُ',
      transliteration: "Uduu ila sabili rabbika bil-hikmati wal-mauidhatil-hasanati wajadilhum billati hiya ahsan",
      meaning: 'Invite to the way of your Lord with wisdom and good instruction, and argue with them in the best manner.',
      note: 'بِالَّتِي هِيَ أَحْسَنُ (by that which is the best/most excellent) — the Quran prescribes a methodology for argumentation: write your essay in this spirit.',
    },
  },
  {
    id: 'a49',
    stage: 'advanced',
    title: 'Advanced Arabic Listening: Al-Jazeera Documentary',
    objective: 'Watch a 15-20 minute Al-Jazeera Arabic documentary and write a 150-word summary in Arabic.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Watch documentary in standard Arabic (once without subtitles)', 'Identify 10 key vocabulary items', 'Write 150-word summary in Arabic'],
    quranBridge: {
      arabic: 'وَكَذَلِكَ أَعْثَرْنَا عَلَيْهِمْ لِيَعْلَمُوا أَنَّ وَعْدَ اللَّهِ حَقٌّ',
      transliteration: "Wakadhalika a'tharna alayhim liyalamu anna wadallahi haqq",
      meaning: 'And thus We caused them to be found so they would know that the promise of Allah is true.',
      note: 'لِيَعْلَمُوا (lam of purpose + subjunctive: so that they may know) — every documentary is a divine يَعْلَمُوا moment: listen, and learn through discovery.',
    },
  },
  {
    id: 'a50',
    stage: 'advanced',
    title: 'Advanced Milestone a50: First Advanced Sprint Complete',
    objective: 'Consolidation test for a31–a49: morphology, rhetoric, syntax, reading, and Quranic analysis.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['50-question comprehensive test (a31-a49)', 'Unseen Quran passage: full parsing (15 verses)', 'Write a 200-word rhetorical analysis of one Quranic passage'],
    quranBridge: {
      arabic: 'وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا',
      transliteration: "Wa-in tauddu niamata Allahi la tuhsuha",
      meaning: 'And if you should count the favors of Allah, you could not enumerate them.',
      note: 'لَا تُحْصُوهَا (inability clause: you cannot count them) — fifty advanced lessons: every insight is a niama; the list is innumerable.',
    },
  },
  {
    id: 'a51',
    stage: 'advanced',
    title: 'Quran Linguistic Analysis: The Seven Ahruf',
    objective: 'Understand the concept of the seven ahruf, qira\'at variants, and their linguistic significance.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['3 examples of qira\'at variants (Hafs vs Warsh)', 'Linguistic significance of each variant', 'Grammar: how different qira\'at change meaning or emphasis'],
    quranBridge: {
      arabic: 'إِنَّ هَذَا الْقُرْآنَ أُنزِلَ عَلَى سَبْعَةِ أَحْرُفٍ',
      transliteration: "Inna hadhal-qurana unzila ala sabati ahruf",
      meaning: 'Indeed this Quran was revealed in seven ahruf.',
      note: 'أَحْرُف (plural of حَرْف: letter/mode) — the flexibility within the divine text is itself a mercy; variant readings demonstrate Arabic\'s semantic richness.',
    },
  },
  {
    id: 'a52',
    stage: 'advanced',
    title: 'Classical Arabic Poetry: Pre-Islamic Odes (Muallaqat)',
    objective: 'Read and analyse a selection from one of the Seven Muallaqat — the masterpieces of pre-Islamic Arabic poetry.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 20 lines from a Muallaqat (Imru\' al-Qays or Labid)', 'Metre identification and arudi analysis', 'Find 5 vocabulary items that appear in classical Islamic literature'],
    quranBridge: {
      arabic: 'وَالشُّعَرَاءُ يَتَّبِعُهُمُ الْغَاوُونَ',
      transliteration: "Wash-shuara yattabiuhum al-ghawun",
      meaning: 'And the poets — the errant follow them.',
      note: 'يَتَّبِعُهُمُ الْغَاوُونَ (those who go astray follow them) — the Quran\'s awareness of poetry\'s power is itself evidence of how important mastering classical Arabic poetry is.',
    },
  },
  {
    id: 'a53',
    stage: 'advanced',
    title: 'Advanced Verb Patterns: Denominative Verbs',
    objective: 'Study denominative verbs (verbs derived from nouns) — a productive morphological category in Arabic.',
    duration: '40 min',
    challengeLevel: 'Expert',
    drills: ['15 denominative verb examples', 'How Form II and IV create denominatives from nouns', 'Generate 5 denominal verbs from religious nouns (صلى from صلاة, etc.)'],
    quranBridge: {
      arabic: 'وَصَلِّ عَلَيْهِمْ إِنَّ صَلَاتَكَ سَكَنٌ لَّهُمْ',
      transliteration: "Wasalli alayhim inna salataka sakanun lahum",
      meaning: 'And invoke blessings upon them. Indeed your blessing is a comfort for them.',
      note: 'وَصَلِّ (Form II from صَلَاة: to send blessings — a canonical denominative verb) — Arabic morphology is recursive: nouns birth verbs that birth new meanings.',
    },
  },
  {
    id: 'a54',
    stage: 'advanced',
    title: 'Syntax Mastery: Government Theory (Amil-Mamul)',
    objective: 'Master the classical Arabic government theory — every inflected word is governed by an amil.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Identify amil for 20 words including hidden agents', 'Government chain exercise: 10 sentences', 'Apply amil theory to an al-Fatiha full parse'],
    quranBridge: {
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: "Al-hamdu lillahi rabbil-alamin",
      meaning: 'All praise is to Allah, Lord of the worlds.',
      note: 'رَبِّ (genitive — governed by الله\'s jarara) + الْعَالَمِينَ (governed by رَبِّ) — the amil chain: each word governs the next in al-Fatiha\'s perfect grammar.',
    },
  },
  {
    id: 'a55',
    stage: 'advanced',
    title: 'Quran Deep Dive: Al-Zumar — Layers of Warning and Hope',
    objective: 'Study al-Zumar 1-50 — the alternating structure of warning and hope, comparing groups in Paradise and Hell.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Zumar 1-50 with harakat', 'Map the warning/hope alternation pattern', 'Grammar: future conditionals (man/fa) in the judgment sections'],
    quranBridge: {
      arabic: 'قُلْ يَا عِبَادِيَ الَّذِينَ أَسْرَفُوا عَلَى أَنفُسِهِمْ لَا تَقْنَطُوا مِن رَّحْمَةِ اللَّهِ',
      transliteration: "Qul ya ibadiyalladhina asrafu ala anfusihim la taqnatu min rahmatillah",
      meaning: 'Say: O My servants who have transgressed against themselves — do not despair of the mercy of Allah.',
      note: 'لَا تَقْنَطُوا (lam prohibition + Form IV jussive: do not despair!) — the most hope-giving verse in the Quran, grammatically structured as direct divine call.',
    },
  },
  {
    id: 'a56',
    stage: 'advanced',
    title: 'Quran Deep Dive: Al-Ghafir (Mumin) — The Believing Man\'s Speech',
    objective: 'Study al-Ghafir 28-45 — the believing man of Pharaoh\'s court and his remarkable speeches.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Ghafir 28-45 with harakat', 'Analyse the believing man\'s three speeches grammatically', 'Identify persuasion techniques: logical, emotional, Quranic'],
    quranBridge: {
      arabic: 'وَقَالَ رَجُلٌ مُّؤْمِنٌ مِّنْ آلِ فِرْعَوْنَ يَكْتُمُ إِيمَانَهُ',
      transliteration: "Waqala rajulun mu'minun min ali firauna yaktumu imanahu",
      meaning: 'And a believing man from the family of Pharaoh who concealed his faith said.',
      note: 'يَكْتُمُ إِيمَانَهُ (hal clause: while concealing his faith) — the grammar of strategic concealment; his courage eventually overcomes his caution.',
    },
  },
  {
    id: 'a57',
    stage: 'advanced',
    title: 'Advanced Arabic Composition: The Classical Maqama Form',
    objective: 'Write a short 100-word Arabic composition in rhymed prose (saj\'a) following the maqama style.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Study rhymed prose mechanics: end rhyme, syntactic parallelism', 'Write a 100-word saj\'a piece on an Islamic theme', 'Self-edit: ensure no forced rhyme, natural flow'],
    quranBridge: {
      arabic: 'وَالنَّجْمِ إِذَا هَوَى مَا ضَلَّ صَاحِبُكُمْ وَمَا غَوَى',
      transliteration: "Wan-najmi idha hawa ma dalla sahibukum wama ghawa",
      meaning: 'By the star when it descends — your companion has not erred, nor has he strayed.',
      note: 'هَوَى / غَوَى (rhymed pair: both end in alif maqsura) — the Quran\'s saj\'a is not ornament but meaning-carrying; rhyme IS the argument.',
    },
  },
  {
    id: 'a58',
    stage: 'advanced',
    title: 'Advanced Syntax: Arabic Clause Embedding Depth',
    objective: 'Analyse and generate Arabic sentences with 3+ levels of clause embedding.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Parse 5 Quranic sentences with 3+ embedding levels', 'Diagram sentence trees for each', 'Generate 3 sentences of your own with 3-level embedding'],
    quranBridge: {
      arabic: 'وَزَعَمَ الَّذِينَ كَفَرُوا أَن لَّن يُبْعَثُوا',
      transliteration: "Wazaama l-ladhina kafaru an lan yubathu",
      meaning: 'Those who disbelieve claim that they will never be resurrected.',
      note: 'زَعَمَ + أَن + لَّن يُبْعَثُوا (3-level: main clause + complementiser + subjunctive denial) — embedding is the grammar of complex thought.',
    },
  },
  {
    id: 'a59',
    stage: 'advanced',
    title: 'Quran and Classical Science: Vocabulary of Natural Phenomena',
    objective: 'Study 40 Classical Arabic / Quranic terms describing natural phenomena (astronomy, meteorology, geology).',
    duration: '40 min',
    challengeLevel: 'Expert',
    drills: ['40 natural science vocabulary flashcards', 'Classify by domain: sky, earth, water', 'Find Quranic verse containing each term'],
    quranBridge: {
      arabic: 'أَوَلَمْ يَرَ الَّذِينَ كَفَرُوا أَنَّ السَّمَاوَاتِ وَالْأَرْضَ كَانَتَا رَتْقًا فَفَتَقْنَاهُمَا',
      transliteration: "Awa-lam yara lladhina kafaru annas-samawati wal-arda kanataa ratqan fafataqnahuma",
      meaning: 'Do not those who disbelieve see that the heavens and earth were joined, then We split them apart?',
      note: 'رَتْقًا (a sealed/joined whole) + فَفَتَقْنَاهُمَا (We split them both — dual object) — the cosmological vocabulary of the Quran maps onto modern astronomy.',
    },
  },
  {
    id: 'a60',
    stage: 'advanced',
    title: 'Advanced Arabic: Translation Theory and Practice',
    objective: 'Translate a 150-word classical Arabic text into English with commentary on translation choices.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Select 150-word classical text', 'Produce two translations: literal and free', 'Comment on 5 translation challenges and your solutions'],
    quranBridge: {
      arabic: 'وَلَوْ كَانَ مِنْ عِندِ غَيْرِ اللَّهِ لَوَجَدُوا فِيهِ اخْتِلَافًا كَثِيرًا',
      transliteration: "Walaw kana min indi ghayri Allahi lawajadu fihi ikhtilafan kathira",
      meaning: 'Had it been from other than Allah, they would have found in it many contradictions.',
      note: 'لَوَجَدُوا (counterfactual apodosis: they WOULD have found) — translation: the Arabic conditional shows certainty of the counterexample\'s impossibility.',
    },
  },
  {
    id: 'a61',
    stage: 'advanced',
    title: 'Advanced Milestone a61-a80 Sprint Begins: Grammar Depth',
    objective: 'Begin the second advanced block — focus on deep grammar, complex syntax, and classical text reading.',
    duration: '30 min',
    challengeLevel: 'Expert',
    drills: ['Review all grammar mastered a1-a60', 'Set 3 specific goals for a61-a80', 'Create a personalised grammar error list to fix'],
    quranBridge: {
      arabic: 'وَفَوْقَ كُلِّ ذِي عِلْمٍ عَلِيمٌ',
      transliteration: "Wafawqa kulli dhi ilmin alim",
      meaning: 'And above every possessor of knowledge is one more knowing.',
      note: 'فَوْقَ كُلِّ (above every — hierarchical structure of knowledge) — after 60 advanced lessons, the reminder: above every learner, there is an alim.',
    },
  },
  {
    id: 'a62',
    stage: 'advanced',
    title: 'Surah al-Furqan: The Criterion — Arguments Against Shirk',
    objective: 'Study al-Furqan 1-30 — the divine criterion, arguments against polytheism, and Prophet\'s mission.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Furqan 1-30 with harakat', 'List all mushrikeen objections grammatically', 'Divine refutations: what grammatical form does Allah use?'],
    quranBridge: {
      arabic: 'تَبَارَكَ الَّذِي نَزَّلَ الْفُرْقَانَ عَلَى عَبْدِهِ لِيَكُونَ لِلْعَالَمِينَ نَذِيرًا',
      transliteration: "Tabaraka lladhi nazzalal-furqana ala abdihi liyakuna lil-alamina nadhira",
      meaning: 'Blessed is He who sent down the Criterion upon His servant to be a warner to all worlds.',
      note: 'تَبَارَكَ (Form VI: to be blessed in a sustained, mutual sense — magnificently blessed) — the surah\'s first word declares divine transcendence through a superlative verbal form.',
    },
  },
  {
    id: 'a63',
    stage: 'advanced',
    title: 'Advanced Reading: Ibn Battuta\'s Travel Writing',
    objective: 'Read 250 words of Ibn Battuta\'s Rihla (Travel) and analyse its classical Arabic narrative style.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read 250 words of Rihla', 'Note geographical vocabulary', 'Grammar analysis: how does Ibn Battuta narrate past events?'],
    quranBridge: {
      arabic: 'أَوَلَمْ يَسِيرُوا فِي الْأَرْضِ فَيَنظُرُوا كَيْفَ كَانَ عَاقِبَةُ الَّذِينَ مِن قَبْلِهِمْ',
      transliteration: "Awa-lam yasiru fil-ardi fayandhhuru kayfa kana aqibatulladhina min qablihim",
      meaning: 'Have they not traveled through the land and observed how was the consequence of those before them?',
      note: 'يَسِيرُوا (travel — same root as سَيَّارَة: car) — Ibn Battuta fulfilled this Quranic command more than any person in history.',
    },
  },
  {
    id: 'a64',
    stage: 'advanced',
    title: 'Advanced Grammar: Particles Catalogue',
    objective: 'Master a comprehensive catalogue of Arabic particles — their meanings, usages, and grammatical effects.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Particles catalogue: 50 particles, each with usage example', 'Ambiguous particle exercise: 10 particles with two possible readings', 'Parse all haroof in Ayat al-Kursi'],
    quranBridge: {
      arabic: 'أَلَا إِنَّ أَوْلِيَاءَ اللَّهِ لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ',
      transliteration: "Ala inna awliya-allahi la khawfun alayhim wala hum yahzanun",
      meaning: 'Verily, the allies of Allah — there is no fear upon them nor shall they grieve.',
      note: 'أَلَا (alerting particle: attention!) + إِنَّ (emphasis) + لَا خَوْفٌ (total negation with nominative) — five particles in 6 words: a particles catalogue in action.',
    },
  },
  {
    id: 'a65',
    stage: 'advanced',
    title: 'Advanced Grammar: Accusative Functions Complete Survey',
    objective: 'Survey all major accusative (nasb) functions in Arabic — mafool bih, mafool fih, mafool maah, hal, tamyiz, and exceptive.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['20 examples for each major nasb function', 'Identify all nasb functions in Surah ar-Rahman', 'Generate 5 sentences using 4+ different nasb functions'],
    quranBridge: {
      arabic: 'خَلَقَ الْإِنسَانَ مِن صَلْصَالٍ كَالْفَخَّارِ',
      transliteration: "Khalaqal-insana min salsalin kal-fakhkhar",
      meaning: 'He created man from clay like pottery.',
      note: 'الْإِنسَانَ (mafool bih: direct object) + مِن صَلْصَالٍ (prepositional) + كَالْفَخَّارِ (kaf comparison) — accusative knowledge maps the full structure of creation sentences.',
    },
  },
  {
    id: 'a66',
    stage: 'advanced',
    title: 'Advanced Rhetoric: The Power of Quranic Interrogatives',
    objective: 'Study how rhetorical questions in the Quran perform eight distinct functions beyond information-seeking.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['8 rhetorical question functions: 3 examples each (24 total)', 'أَفَلَا تَعْقِلُونَ vs أَفَلَا تَتَفَكَّرُونَ — what\'s the difference?', 'Write 5 original Arabic rhetorical questions'],
    quranBridge: {
      arabic: 'أَفَمَن يَخْلُقُ كَمَن لَّا يَخْلُقُ أَفَلَا تَذَكَّرُونَ',
      transliteration: "Afaman yakhluqu kaman la yakhluqu afala tadhakkarun",
      meaning: 'Is He who creates like one who does not create? Will you not be reminded?',
      note: 'أَفَمَن (interrogative + fa — double question force) + أَفَلَا (second interrogative with negative: why don\'t you—?) — Quranic interrogatives escalate to force remembrance.',
    },
  },
  {
    id: 'a67',
    stage: 'advanced',
    title: 'Quran Deep Dive: Al-Waqi\'a — Three Categories of Humanity',
    objective: 'Study al-Waqi\'a 1-56 — the three groups on Judgment Day: companions of the right, left, and forerunners.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Waqi\'a 1-56 with harakat', 'Map three groups with their descriptions', 'Grammar: comparison structures among three groups'],
    quranBridge: {
      arabic: 'فَأَصْحَابُ الْمَيْمَنَةِ مَا أَصْحَابُ الْمَيْمَنَةِ',
      transliteration: "Fa-ashabul-maymana ma ashabul-maymana",
      meaning: 'Then the companions of the right — what are the companions of the right?',
      note: 'مَا أَصْحَابُ الْمَيْمَنَةِ (rhetorical exclamation: what ARE the companions of the right!) — the repetition is a grammar of awe; the question cannot be answered by language.',
    },
  },
  {
    id: 'a68',
    stage: 'advanced',
    title: 'Surah al-Mulk: The Dominion — Existential Questions',
    objective: 'Study al-Mulk fully — 30 verses on divine ownership, trial, and the invitation to ponder death and creation.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Mulk fully (30 verses)', 'Six creation signs: identify each and its grammatical setup', 'Vocabulary: mulk, khalq, qabr, nar, janna from this surah'],
    quranBridge: {
      arabic: 'الَّذِي خَلَقَ الْمَوْتَ وَالْحَيَاةَ لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا',
      transliteration: "Alladhi khalaqal-mawta wal-hayata liyabluwakum ayyukum ahsanu amala",
      meaning: 'Who created death and life to test you which of you is best in deed.',
      note: 'خَلَقَ الْمَوْتَ (created death — death before life in the order listed) — grammatical attention to order: death comes first in this verse because that is where consciousness begins.',
    },
  },
  {
    id: 'a69',
    stage: 'advanced',
    title: 'Advanced Arabic: Reading al-Muqaddima of Ibn Khaldun',
    objective: 'Read 400 words of Ibn Khaldun\'s Muqaddima — his theory of social organisation and civilisational rise and fall.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Read 400 words of al-Muqaddima', 'Social science vocabulary in classical Arabic', 'Identify Ibn Khaldun\'s main argument thesis in Arabic'],
    quranBridge: {
      arabic: 'وَتِلْكَ الْأَيَّامُ نُدَاوِلُهَا بَيْنَ النَّاسِ',
      transliteration: "Watilkal-ayyamu nudawiluha baynan-nas",
      meaning: 'And these days — We alternate them among the people.',
      note: 'نُدَاوِلُهَا (Form III: to rotate/alternate) — Ibn Khaldun\'s entire asabiyya cycle theory is contained in this Quranic grammar: الْأَيَّامُ circulate.',
    },
  },
  {
    id: 'a70',
    stage: 'advanced',
    title: 'Advanced Arabic: Linguistic Inimitability of the Quran (Ijaz)',
    objective: 'Study five classical scholars\' arguments for Quranic linguistic inimitability from grammatical and rhetorical perspectives.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['5 classical scholars\' ijaz theories (al-Jurjani, al-Baqillani, al-Khattabi, Rummani, al-Zarkashi)', 'Apply one specific linguistic argument to al-Baqarah 2a', 'Write 150 words explaining your most persuasive ijaz argument'],
    quranBridge: {
      arabic: 'قُل لَّئِنِ اجْتَمَعَتِ الْإِنسُ وَالْجِنُّ عَلَى أَن يَأْتُوا بِمِثْلِ هَذَا الْقُرْآنِ',
      transliteration: "Qul la-in ijtamaatil-insu wal-jinnu ala an yatu bimithli hadhal-quran",
      meaning: 'Say: if mankind and jinn gathered to produce the like of this Quran.',
      note: 'لَّئِنِ (emphatic conditional lam + in) — the most confident challenge in the history of literature; its grammar is as inimitable as its content.',
    },
  },
  {
    id: 'a71',
    stage: 'advanced',
    title: 'Advanced Grammar: الفعل المعتل — Defective Verbs Master Class',
    objective: 'Master all types of weak/defective verbs: assimilated (مثال), hollow (أجوف), and defective (ناقص) across all forms.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Conjugate 3 مثال, 3 أجوف, 3 ناقص verbs across all tenses', 'Identify defective verb type in 30 Quranic verbs', 'Transform 10 sound verbs into their weak equivalents'],
    quranBridge: {
      arabic: 'يَهْدِي مَن يَشَاءُ إِلَى صِرَاطٍ مُّسْتَقِيمٍ',
      transliteration: "Yahdi man yasha-u ila siratin mustaqueem",
      meaning: 'He guides whom He wills to a straight path.',
      note: 'يَهْدِي (Form I ناقص verb: hollow alif dropped in jussive) + يَشَاءُ (ناقص verb: hamza ending) — two defective verbs in one phrase: mastering them unlocks Quranic parsing.',
    },
  },
  {
    id: 'a72',
    stage: 'advanced',
    title: 'Advanced Grammar: Doubly-Weak Verbs',
    objective: 'Study verbs with two weak letters (laqiya, haya, waqiya) — the most morphologically complex Arabic verbs.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['10 doubly-weak verb examples', 'Conjugate لَقِيَ and وَقَى across all passive and active forms', 'Find doubly-weak verbs in the Quran (5 examples)'],
    quranBridge: {
      arabic: 'وَيَتَّقِهِ وَأُولَئِكَ هُمُ الْفَائِزُونَ',
      transliteration: "Wayattaqihi wa-ula-ika humul-fa-izun",
      meaning: 'And whoever fears Him — those are the successful.',
      note: 'يَتَّقِهِ (Form VIII from و-ق-ي — doubly weak: first letter waw, last letter ya) — the doubly-weak verb of taqwa is the most grammatically complex verb of the highest concept.',
    },
  },
  {
    id: 'a73',
    stage: 'advanced',
    title: 'Surah al-Insan (al-Dahr): The Human Story',
    objective: 'Study al-Insan 1-22 — human creation from nothing, trial, and the rewards of the righteous.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Insan 1-22 with harakat', 'Timeline of human creation in the surah', 'Paradise vocabulary in this surah'],
    quranBridge: {
      arabic: 'هَلْ أَتَى عَلَى الْإِنسَانِ حِينٌ مِّنَ الدَّهْرِ لَمْ يَكُن شَيْئًا مَّذْكُورًا',
      transliteration: "Hal ata alal-insani hinun minad-dahri lam yakun shay-an madhkura",
      meaning: 'Has there not come upon man a period of time when he was not a thing mentioned?',
      note: 'لَمْ يَكُن شَيْئًا مَّذْكُورًا (negative + noun: not a mentioned thing) — the surah begins with rhetorical annihilation of human pride: you were nothing worth mentioning.',
    },
  },
  {
    id: 'a74',
    stage: 'advanced',
    title: 'Islamic Philosophy Vocabulary in Arabic',
    objective: 'Master 40 key Arabic terms from Islamic philosophy: existence/wujud, essence/mahiyya, intellect/aql, soul/nafs.',
    duration: '45 min',
    challengeLevel: 'Expert',
    drills: ['40 Islamic philosophy vocabulary flashcards', 'Compare philosophical use vs Quranic use of aql/nafs', 'Write 5 sentences using philosophical vocabulary correctly'],
    quranBridge: {
      arabic: 'أَفَلَمْ يَسِيرُوا فِي الْأَرْضِ فَتَكُونَ لَهُمْ قُلُوبٌ يَعْقِلُونَ بِهَا',
      transliteration: "Afalam yasiru fil-ardi fatakuna lahum qulubun yaqiluna biha",
      meaning: 'Have they not traveled through the land so they would have hearts by which to reason?',
      note: 'يَعْقِلُونَ بِهَا (Form I reason by means of them) — the Quran locates aql in the qalb, not the brain: philosophy must grapple with this anatomical claim.',
    },
  },
  {
    id: 'a75',
    stage: 'advanced',
    title: 'Advanced Listening: Quranic Recitation Styles and Recognition',
    objective: 'Identify and appreciate the 10 canonical Quranic recitation styles (qira\'at) through listening.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Listen to 3 different qira\'at of al-Fatiha', 'Identify phonological differences', 'Vocabulary of qira\'at science: rawi, tariq, wajh'],
    quranBridge: {
      arabic: 'وَرَتِّلِ الْقُرْآنَ تَرْتِيلًا',
      transliteration: "Warattilil-qurana tartila",
      meaning: 'And recite the Quran with measured recitation.',
      note: 'تَرْتِيلًا (mafool mutlaq: fully/thoroughly recite) — every qira\'a is a legitimate tarteel; the 10 recitations are 10 ways of fulfilling this command.',
    },
  },
  {
    id: 'a76',
    stage: 'advanced',
    title: 'Classical Grammar: Sibawayh\'s al-Kitab',
    objective: 'Read a selection from Sibawayh\'s al-Kitab — the foundational text of Arabic grammar (2nd cent. AH).',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 150 words of Sibawayh\'s al-Kitab', 'Identify the grammar topic he is discussing', 'Compare his formulation to modern grammar book treatment'],
    quranBridge: {
      arabic: 'إِنَّ هَذَا الْقُرْآنَ يَهْدِي',
      transliteration: "Inna hada l-qurana yahdi",
      meaning: 'Indeed this Quran guides.',
      note: 'Sibawayh\'s grammar emerged from protecting Quranic recitation — every rule in al-Kitab serves this ending: يَهْدِي.',
    },
  },
  {
    id: 'a77',
    stage: 'advanced',
    title: 'Surah al-Mulk Complete Parsing',
    objective: 'Perform a complete grammatical parse of all 30 verses of Surah al-Mulk.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['Parse every word in al-Mulk (all 30 verses)', 'Identify every verb\'s conjugation pattern', 'Note 3 unusual or advanced grammatical structures'],
    quranBridge: {
      arabic: 'وَإِلَيْهِ النُّشُورُ',
      transliteration: "Wa-ilayhin-nushur",
      meaning: 'And to Him is the resurrection.',
      note: 'Closing verse: وَإِلَيْهِ (fronted prepositional phrase + restriction) + النُّشُورُ (masdar: the act of resurrection) — al-Mulk ends as it begins: with divine sovereignty grammar.',
    },
  },
  {
    id: 'a78',
    stage: 'advanced',
    title: 'Advanced Grammar: Case Syncretism and Ambiguity',
    objective: 'Study grammatical ambiguity in Arabic — cases where case endings are identical, creating interpretive choices.',
    duration: '45 min',
    challengeLevel: 'Expert',
    drills: ['10 case syncretism examples in Arabic', 'How does vowelisation clarify or disambiguate?', 'Find 3 Quranic verses where case ambiguity creates multiple valid readings'],
    quranBridge: {
      arabic: 'لَا يَمَسُّهُ إِلَّا الْمُطَهَّرُونَ',
      transliteration: "La yamassuhu illal-mutahharun",
      meaning: 'None shall touch it except the purified.',
      note: 'الْمُطَهَّرُونَ (passive participle, pl. masc: the purified ones — by Allah) — grammatical precision reveals theological depth: Allah purifies; they do not purify themselves.',
    },
  },
  {
    id: 'a79',
    stage: 'advanced',
    title: 'Advanced Reading: Ihya Ulum al-Din (al-Ghazali)',
    objective: 'Read 400 words from al-Ghazali\'s Ihya Ulum al-Din — the masterpiece of Islamic spirituality.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Read 400 words from Book of Knowledge section', 'Spiritual vocabulary: nafs, ruh, qalb, aqil, ilm', 'Grammar highlight: 3 complex sentence structures al-Ghazali uses'],
    quranBridge: {
      arabic: 'وَنَفْسٍ وَمَا سَوَّاهَا فَأَلْهَمَهَا فُجُورَهَا وَتَقْوَاهَا',
      transliteration: "Wanafsin wama sawwaha fa-alhamaha fujuraha wataqwaha",
      meaning: 'By the soul and He who proportioned it, and inspired it [with tendency toward] its wickedness and righteousness.',
      note: 'فَأَلْهَمَهَا (Form IV: inspired into it — ilhami form) + الفُجُور والتَّقْوَى (both planted simultaneously) — al-Ghazali spent his life explaining this verse\'s implications.',
    },
  },
  {
    id: 'a80',
    stage: 'advanced',
    title: 'Advanced Milestone a80: Sprint Assessment',
    objective: 'Comprehensive test for advanced lessons a51-a79.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['60-question test covering a51-a79', 'Parse a full unseen Quranic page (20 verses)', 'Write 250-word rhetorical analysis of any surah opening'],
    quranBridge: {
      arabic: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
      transliteration: "Yarfaillahu lladhina amanu minkum walladhina utal-ilma darajat",
      meaning: 'Allah will raise those who believe among you and those who were given knowledge by degrees.',
      note: 'دَرَجَاتٍ (accusative of specification: by degrees — indefinite to show openness of ascension) — a80 is another degree ascended.',
    },
  },
  {
    id: 'a81',
    stage: 'advanced',
    title: 'Advanced Quranic Reading: Surah al-Furqan 46-77',
    objective: 'Study al-Furqan 46-77 — the characteristics of the servants of the Most Merciful (ibad al-rahman).',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Furqan 63-77 (ibad al-rahman passage)', 'Identify 14 characteristics of ibad al-rahman', 'Grammar: how are the characteristics expressed? Form, tense, voice'],
    quranBridge: {
      arabic: 'وَعِبَادُ الرَّحْمَنِ الَّذِينَ يَمْشُونَ عَلَى الْأَرْضِ هَوْنًا',
      transliteration: "Wa-ibadur-rahmani lladhina yamshuna alal-ardi hawna",
      meaning: 'And the servants of the Most Merciful are those who walk upon the earth with humility.',
      note: 'هَوْنًا (hal: gently, softly — manner adverb) — the first characteristic: not speed, not power, but هَوْن. The grammar of humility is an adverb of manner.',
    },
  },
  {
    id: 'a82',
    stage: 'advanced',
    title: 'Classical Logic in Arabic: Ibn Rushd and Aristotle',
    objective: 'Study classical Arabic philosophical and logical vocabulary derived from Aristotelian logic (mantiq).',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['30 mantiq vocabulary flashcards', 'Syllogism construction in Arabic: qayas', 'Translate one simple philosophical argument from Arabic to English'],
    quranBridge: {
      arabic: 'أَفَلَا يَعْقِلُونَ',
      transliteration: "Afala yaqilun",
      meaning: 'Will they not reason?',
      note: 'يَعْقِلُونَ (Form I: to reason/use the aql) — Arabic philosophical tradition (falsafa) built its vocabulary on this Quranic verb: reasoning is worship.',
    },
  },
  {
    id: 'a83',
    stage: 'advanced',
    title: 'Advanced Grammar: The Genitive Case — Jarr Comprehensive Review',
    objective: 'Comprehensive review of all genitive constructions: single prepositions, complex prepositions, idafa chains.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['30 preposition examples: each with unique function', 'Complex idafa chains: 5 examples parsed', 'All genitive functions surveyed in al-Baqarah 255 (Ayat al-Kursi)'],
    quranBridge: {
      arabic: 'لَهُ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
      transliteration: "Lahu ma fis-samawati wama fil-ard",
      meaning: 'To Him belongs what is in the heavens and what is in the earth.',
      note: 'لَهُ (lam of possession genitive) + فِي السَّمَاوَاتِ (fi + plural genitive) + فِي الْأَرْضِ (fi + definite singular genitive) — three genitive constructions in one magnificent verse.',
    },
  },
  {
    id: 'a84',
    stage: 'advanced',
    title: 'Surah al-Rahman: The Mercy Surah — A Complete Linguistic Study',
    objective: 'Complete linguistic analysis of al-Rahman — its refrain, bicolon structure, dual forms, and rhetorical power.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Read all 78 verses of al-Rahman with harakat', 'Count all dual forms (31 of them)', 'Analyse the refrain فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ: rhetorical function'],
    quranBridge: {
      arabic: 'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
      transliteration: "Fabi-ayyi alai rabbikuma tukadhdhiban",
      meaning: 'So which of the favors of your Lord will you deny?',
      note: 'تُكَذِّبَانِ (dual Form II: you two deny) — the refrain addresses humans and jinn simultaneously. The dual grammar is theologically precise.',
    },
  },
  {
    id: 'a85',
    stage: 'advanced',
    title: 'Advanced Arabic Writing: Scholarly Article Introduction',
    objective: 'Write the introduction (200 words) of a mock Arabic scholarly article on an Islamic topic.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Study academic Arabic article structure', 'Choose topic and write 200-word muqaddima', 'Use proper academic discourse markers in Arabic'],
    quranBridge: {
      arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
      transliteration: "Iqra bismi rabbika lladhi khalaq",
      meaning: 'Read in the name of your Lord who created.',
      note: 'اقْرَأْ (the first divine command: read/study) — every scholarly article written in Arabic is a response to iqra; writing IS worship.',
    },
  },
  {
    id: 'a86',
    stage: 'advanced',
    title: 'Surah Sad: The Messengers\' Trials',
    objective: 'Study Surah Sad 17-50 — the trials of Dawud, Solomon, Ayyub, and chain of prophets.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read Surah Sad 17-50 with harakat', 'Each prophet\'s trial vocabulary', 'Grammar: divine speech acts to each prophet'],
    quranBridge: {
      arabic: 'وَاذْكُرْ عَبْدَنَا أَيُّوبَ إِذْ نَادَى رَبَّهُ أَنِّي مَسَّنِيَ الضُّرُّ',
      transliteration: "Wadhkur abdana ayyuba idh nada rabbahu anni massaniy-adhdhurr",
      meaning: 'And remember Our servant Ayyub when he called to his Lord: Adversity has touched me.',
      note: 'أَنِّي مَسَّنِيَ الضُّرُّ (subject postponed: harm has touched me — not I have been harmed) — Ayyub\'s grammar is profound: he says harm touched him, not that he is harmed.',
    },
  },
  {
    id: 'a87',
    stage: 'advanced',
    title: 'Advanced Morphology: Diminutive Forms (Tasghir) in Classical Texts',
    objective: 'Study diminutive forms in depth — functions beyond size reduction: affection, minimisation, contempt.',
    duration: '40 min',
    challengeLevel: 'Expert',
    drills: ['20 tasghir examples with their pragmatic functions', 'Form the tasghir for 15 common nouns', 'Identify one example of emotive tasghir in classical poetry'],
    quranBridge: {
      arabic: 'وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا',
      transliteration: "Wala tamshi fil-ardi maraha",
      meaning: 'And do not walk upon the earth exultantly.',
      note: 'مَرَحًا (mafool mutlaq / hal: exultantly) — Tasghir of arrogance could be: مُرَيْحًا (little bounce) — the diminutive punctures pride; even a small arrogance is prohibited.',
    },
  },
  {
    id: 'a88',
    stage: 'advanced',
    title: 'Advanced Syntax: Arabic Information Structure',
    objective: 'Study Arabic information structure — topic, focus, given-new, and their grammatical expressions.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['10 topic-comment sentences: analyse given-new', 'Focus constructions: إِنَّمَا, fronting, emphasis particles', 'How does information structure interact with word order?'],
    quranBridge: {
      arabic: 'إِنَّمَا الْمُؤْمِنُونَ الَّذِينَ آمَنُوا بِاللَّهِ وَرَسُولِهِ',
      transliteration: "Innamal-mu-minunalladhina amanu billahi warasulihi",
      meaning: 'The believers are only those who believe in Allah and His Messenger.',
      note: 'إِنَّمَا (restriction particle: focus marker — only) — Arabic\'s strongest focus device restricts the entire concept of believer to a specific information content.',
    },
  },
  {
    id: 'a89',
    stage: 'advanced',
    title: 'Quran Deep Dive: Al-Maidah 48 — The Divine Referee',
    objective: 'Deep grammatical and theological analysis of al-Maidah 48 — the most important inter-faith verse.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Full parse of al-Maidah 48 (every word)', 'Theological implication of each grammatical choice', 'Write a 150-word analysis of this verse'],
    quranBridge: {
      arabic: 'لِكُلٍّ جَعَلْنَا مِنكُمْ شِرْعَةً وَمِنْهَاجًا',
      transliteration: "Likullin jaalna minkum shiratan waminhaja",
      meaning: 'For each of you We have made a law and a clear way.',
      note: 'لِكُلٍّ (for each one — lam purpose + tanwin of generality) + شِرْعَةً وَمِنْهَاجًا (two nouns: law and open road) — divine diversity is architecturally programmed into the grammar.',
    },
  },
  {
    id: 'a90',
    stage: 'advanced',
    title: 'Quran Deep Dive: Surah al-Hashr — Siege of Bani Nadir',
    objective: 'Study al-Hashr 1-20 — historical account, lessons in obedience, and the celebrated closing verses of divine attributes.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Hashr 1-20 with harakat', 'Historical vocabulary', 'Parse the closing glorification verses (al-Hashr 23-24) fully'],
    quranBridge: {
      arabic: 'هُوَ اللَّهُ الَّذِي لَا إِلَهَ إِلَّا هُوَ الْمَلِكُ الْقُدُّوسُ السَّلَامُ',
      transliteration: "Huwallahu lladhi la ilaha illa huwul-malikul-quddusus-salam",
      meaning: 'He is Allah, there is no deity except Him: the Sovereign, the Holy, the Source of Peace.',
      note: 'هُوَ اللَّهُ (predicate equation: He = Allah) followed by 12 divine names in magnificent apposition — parsing these divine names is a grammar of theology.',
    },
  },
  {
    id: 'a91',
    stage: 'advanced',
    title: 'Advanced Arabic: Oral Debate Preparation',
    objective: 'Prepare and deliver a 5-minute Arabic oral debate on the topic: "Technology is beneficial to Islamic learning."',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Prepare pro and con arguments in Arabic', 'Debate vocabulary: oppose, support, argue, conclude', 'Practice: record and self-evaluate for 5 minutes'],
    quranBridge: {
      arabic: 'وَجَادِلْهُم بِالَّتِي هِيَ أَحْسَنُ',
      transliteration: "Wajadilhum billati hiya ahsan",
      meaning: 'And debate them in the manner that is best.',
      note: 'بِالَّتِي هِيَ أَحْسَنُ (by that which is the best/most excellent) — Arabic debate: بِالَّتِي هِيَ أَحْسَنُ is both instruction and grammar standard.',
    },
  },
  {
    id: 'a92',
    stage: 'advanced',
    title: 'Advanced Grammar: Verb System — Mastering Binyanim (Forms I-X) Complete Review',
    objective: 'Complete review of all 10 verb stems — meaning patterns, passive forms, masdar forms, and common examples.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Forms I-X: 5 Quranic examples each (50 total)', 'For each form: state the semantic rule', 'Generate verb form paradigm for root ك-ت-ب across all 10 forms'],
    quranBridge: {
      arabic: 'عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ',
      transliteration: "Allama l-insana ma lam yalam",
      meaning: 'He taught man what he did not know.',
      note: 'عَلَّمَ (Form II: intensive teach — the causative of عَلِمَ Form I) — the entire edifice of human knowledge rests on this Form II causative; masters teach.',
    },
  },
  {
    id: 'a93',
    stage: 'advanced',
    title: 'Classical Arabic: Poetry of al-Mutanabbi',
    objective: 'Read and analyse 20 lines from al-Mutanabbi — the greatest Arabic poet — for grammar and rhetoric.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 20 lines from al-Mutanabbi\'s diwan', 'Identify 5 rhetorical devices', 'Grammar analysis: 3 complex structures in the selected lines'],
    quranBridge: {
      arabic: 'وَلَمَّا قَضَيْنَا إِلَيْهِ ذَلِكَ الْأَمْرَ',
      transliteration: "Walamma qadayna ilayhi dhalikal-amr",
      meaning: 'And when we had decreed that matter to him.',
      note: 'لَمَّا (when — temporal particle triggering past perfect) — al-Mutanabbi was so skilled because he perfected temporal expressions; grammar is the poet\'s most powerful tool.',
    },
  },
  {
    id: 'a94',
    stage: 'advanced',
    title: 'Quran Structural Study: Meccan vs Madinan Surahs',
    objective: 'Identify 10 key linguistic and structural differences between Meccan and Madinan surahs.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['10 Meccan-Madinan linguistic differences with examples', 'Apply criteria to classify a surah by features (without knowing the answer)', 'Discuss: why do language and structure change with audience?'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا النَّاسُ اعْبُدُوا رَبَّكُمُ',
      transliteration: "Ya ayyuhan-nasu ubudu rabbakum",
      meaning: 'O mankind, worship your Lord.',
      note: 'يَا أَيُّهَا النَّاسُ (Meccan address to all humanity) vs يَا أَيُّهَا الَّذِينَ آمَنُوا (Madinan address to believers) — the vocative particle reveals the surah\'s geography.',
    },
  },
  {
    id: 'a95',
    stage: 'advanced',
    title: 'Advanced Grammar: Complete Case System Revision',
    objective: 'Comprehensive revision of all Arabic case endings: the three cases, diptotes, broken plurals, and dual/sound plural systems.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Diptote exercise: 20 words given — mark the cases', 'Sound masculine plural case declension drill', 'Assign cases to every noun in al-Baqarah 1-5'],
    quranBridge: {
      arabic: 'هُدًى لِّلْمُتَّقِينَ',
      transliteration: "Hudan lil-muttaqin",
      meaning: 'A guidance for the God-fearing.',
      note: 'هُدًى (indefinite accusative/nominative — tanwin with alif on defective noun) + لِّلْمُتَّقِينَ (lam + definite sound masculine plural genitive) — two case systems in two words.',
    },
  },
  {
    id: 'a96',
    stage: 'advanced',
    title: 'Translation Masterclass: Quran English Versions Comparison',
    objective: 'Compare 4 English Quran translations of 10 verses — evaluate accuracy, elegance, and grammatical fidelity.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Select 10 verses with translation challenges', 'Read Pickthall, Yusuf Ali, Sahih International, and Abdel Haleem', 'Write your own optimal translation for 3 verses with commentary'],
    quranBridge: {
      arabic: 'وَلَا الضَّالِّينَ',
      transliteration: "Wala adh-dhallin",
      meaning: 'Nor those who are astray.',
      note: 'الضَّالِّينَ (the strayers — doubled lam of shaddah + sound masculine plural) — the most translated Arabic clause in history; each version reveals a translator\'s theological lens.',
    },
  },
  {
    id: 'a97',
    stage: 'advanced',
    title: 'Quran and History: Arabic of Seerah Texts',
    objective: 'Read 400 words of classical Seerah text (Ibn Hisham or al-Waqidi) and analyse vocabulary and style.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 400 words of Ibn Hisham\'s Seerah', 'Seerah historical vocabulary', 'Compare seerah Arabic style to Quranic Arabic — what is different?'],
    quranBridge: {
      arabic: 'وَمَا أَرْسَلْنَاكَ إِلَّا رَحْمَةً لِّلْعَالَمِينَ',
      transliteration: "Wama arsalnaka illa rahmatan lil-alamin",
      meaning: 'And We have not sent you except as a mercy to the worlds.',
      note: 'إِلَّا رَحْمَةً (restriction + accusative hal/tamyiz: as nothing but mercy) — every page of seerah text is exegesis on this grammar: what does رَحْمَةً look like in life?',
    },
  },
  {
    id: 'a98',
    stage: 'advanced',
    title: 'Advanced Arabic: Discussing the Quran Academically',
    objective: 'Develop vocabulary and style to discuss Quranic analysis academically in Arabic.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Academic discourse vocabulary for discussing Quran', 'Construct 5 academic analysis sentences', 'Write a 150-word academic paragraph on one Quranic theme'],
    quranBridge: {
      arabic: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ وَلَوْ كَانَ مِنْ عِندِ غَيْرِ اللَّهِ',
      transliteration: "Afala yatadabbarunalqurana walaw kana min indi ghayri Allah",
      meaning: 'Will they not reflect on the Quran? Had it been from other than Allah.',
      note: 'يَتَدَبَّرُونَ (Form V: thorough, pursuing reflection) — academic Quranic analysis IS tadabbur institutionalised.',
    },
  },
  {
    id: 'a99',
    stage: 'advanced',
    title: 'Advanced Arabic: Reading Fatwas and Legal Opinions',
    objective: 'Read and parse a classical Arabic fatwa — understand its structure, legal vocabulary, and argumentation.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read a classical fatwa (100 words)', 'Legal vocabulary: wajib, mandub, mubah, makruh, haram', 'Identify: question stated, evidence deployed, conclusion'],
    quranBridge: {
      arabic: 'وَمَا كَانَ لِمُؤْمِنٍ وَلَا مُؤْمِنَةٍ إِذَا قَضَى اللَّهُ وَرَسُولُهُ أَمْرًا',
      transliteration: "Wama kana li-muminin wala muminatin idha qadallahu warasuluhu amra",
      meaning: 'It is not for a believing man or woman, when Allah and His Messenger have decided a matter.',
      note: 'إِذَا قَضَى اللَّهُ وَرَسُولُهُ (temporal: when Allah and His Messenger decide) — every fatwa is an attempt to faithfully implement this divine decree in a new context.',
    },
  },
  {
    id: 'a100',
    stage: 'advanced',
    title: 'Advanced Milestone a100: CENTURY ACHIEVEMENT',
    objective: 'Comprehensive 100-question test celebrating 100 advanced lessons completed.',
    duration: '120 min',
    challengeLevel: 'Expert',
    drills: ['100-question comprehensive test: all domains', 'Full parsing of an unseen 30-verse surah', 'Write a 300-word essay: "My journey through advanced Arabic"'],
    quranBridge: {
      arabic: 'وَمَن يُحَاجَّ فِيهِ مِن بَعْدِ مَا جَاءَكَ مِنَ الْعِلْمِ',
      transliteration: "Waman yuhajja fihi min badi ma ja-aka minal-ilm",
      meaning: 'Whoever argues with you about it after what has come to you of knowledge.',
      note: 'مِنَ الْعِلْمِ (partitive min: of knowledge — implying more knowledge remains) — 100 advanced lessons: still only a portion of the ocean. The min of humility.',
    },
  },
  {
    id: 'a101',
    stage: 'advanced',
    title: 'Advanced Quranic Grammar: Particle إِذْ and إِذَا Contrast',
    objective: 'Master the distinct uses of إِذْ (past temporal) and إِذَا (future conditional/temporal).',
    duration: '45 min',
    challengeLevel: 'Expert',
    drills: ['20 إِذْ examples with past temporal analysis', '20 إِذَا examples with conditional/future analysis', 'Find 5 verses where both appear in close proximity'],
    quranBridge: {
      arabic: 'وَإِذْ قَالَ رَبُّكَ لِلْمَلَائِكَةِ إِنِّي جَاعِلٌ فِي الْأَرْضِ خَلِيفَةً',
      transliteration: "Wa-idh qala rabbuka lil-malaikati inni jailun fil-ardi khalifa",
      meaning: 'And when your Lord said to the angels: I am placing a successor on earth.',
      note: 'إِذْ قَالَ (past temporal: when He said — before time, in divine knowledge) — إِذْ carries the weight of pre-eternal divine decision made manifest in time.',
    },
  },
  {
    id: 'a102',
    stage: 'advanced',
    title: 'Surah al-Ra\'d: Thunder, Knowledge, and Heart Contentment',
    objective: 'Study al-Ra\'d 28-30 — the contentment of the heart through remembrance, and the thunder\'s glorification.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Ra\'d 1-30 with harakat', 'Vocabulary of natural signs (thunder, rain, rivers)', 'Grammar: conditional and present tense alternation in this surah'],
    quranBridge: {
      arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      transliteration: "Ala bidhikrillahi tatma-innul-qulub",
      meaning: 'Verily, in the remembrance of Allah hearts find rest.',
      note: 'أَلَا (alerting particle: listen!) + تَطْمَئِنُّ (Form IV quadriliteral: to be completely at rest) — the most comforting grammatical structure in Arabic.',
    },
  },
  {
    id: 'a103',
    stage: 'advanced',
    title: 'Advanced Grammar: Sentence Polarity and Negation Systems',
    objective: 'Master all Arabic negation tools: لَا, لَيْسَ, لَمْ, لَنْ, لَمَّا, مَا, and their different scopes.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['6 negation tools: 10 examples each (60 total)', 'Negation scope: sentence vs constituent negation', 'Transform 20 positive sentences with appropriate negative particle'],
    quranBridge: {
      arabic: 'لَن تَرَانِي وَلَكِنِ انظُرْ إِلَى الْجَبَلِ',
      transliteration: "Lan tarani walakinindhhur ilal-jabal",
      meaning: 'You will never see Me, but look toward the mountain.',
      note: 'لَن (future strong negation: will absolutely never) — the grammar of divine impossibility; لَن is the most absolute negation tool in Arabic.',
    },
  },
  {
    id: 'a104',
    stage: 'advanced',
    title: 'Advanced Arabic: The Language of Islamic Creed (Aqida)',
    objective: 'Study the specialised vocabulary and grammatical structures used in classical aqida texts.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['30 aqida vocabulary flashcards (al-Tahawiyya source)', 'Parse 5 technical aqida definitions', 'Write an Islamic belief statement in grammatically correct Arabic'],
    quranBridge: {
      arabic: 'لَيْسَ كَمِثْلِهِ شَيْءٌ وَهُوَ السَّمِيعُ الْبَصِيرُ',
      transliteration: "Laysa kamithlihi shay-un wahuas-samiulbasir",
      meaning: 'There is nothing like unto Him, and He is the All-Hearing, All-Seeing.',
      note: 'لَيْسَ كَمِثْلِهِ (not like His like — double negation of likeness: even to compare to His like is negated) — classical aqida built its language of tanzih on this verse.',
    },
  },
  {
    id: 'a105',
    stage: 'advanced',
    title: 'Surah Yusuf: The Best of Stories (Complete Analysis)',
    objective: 'Complete literary and grammatical analysis of Surah Yusuf — narrative arc, character voices, and divine providence.',
    duration: '75 min',
    challengeLevel: 'Expert',
    drills: ['Read all 111 verses of Yusuf with harakat', 'Identify 5 narrative turning points', 'Grammar of dream interpretation: how does Yusuf explain dreams?'],
    quranBridge: {
      arabic: 'نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ',
      transliteration: "Nahnu naqussu alayka ahsanal-qasas",
      meaning: 'We relate to you the best of stories.',
      note: 'نَحْنُ (first person plural — divine majestic We) + أَحْسَنَ الْقَصَصِ (elative + idafa: best of all stories) — divine testimony that this story is the literary masterpiece.',
    },
  },
  {
    id: 'a106',
    stage: 'advanced',
    title: 'Advanced Morphology: Pattern Stacking in Quranic Arabic',
    objective: 'Study verses where multiple morphological patterns appear in close sequence for maximum effect.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Find 5 Quranic verses with 3+ verb forms', 'Analyse how pattern stacking creates meaning intensity', 'Write 5 sentences using 3 different forms of the same root'],
    quranBridge: {
      arabic: 'فَاصْفَحِ الصَّفْحَ الْجَمِيلَ',
      transliteration: "Fasfahi s-safha l-jamil",
      meaning: 'So forgive with gracious forgiveness.',
      note: 'فَاصْفَحِ (fa + imperative) + الصَّفْحَ الْجَمِيلَ (mafool mutlaq + adjective: beautiful-style forgiveness) — pattern stacking: verb + masdar + adjective = the poetry of forgiveness.',
    },
  },
  {
    id: 'a107',
    stage: 'advanced',
    title: 'Quran Science: Naskh and Mansukh (Abrogation)',
    objective: 'Study classical Arabic arguments for and against abrogation, and key naskh vocabulary.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['15 abrogation vocabulary flashcards', 'Classic naskh examples (qibla, alcohol prohibition stages)', 'Read classical Arabic text on naskh (100 words)'],
    quranBridge: {
      arabic: 'مَا نَنسَخْ مِنْ آيَةٍ أَوْ نُنسِهَا نَأْتِ بِخَيْرٍ مِّنْهَا أَوْ مِثْلِهَا',
      transliteration: "Ma nansakh min ayatin aw nunsiha na-ti bikhayrin minha aw mithliha",
      meaning: 'We do not abrogate a verse or cause it to be forgotten except We bring forth one better than it or similar to it.',
      note: 'نَنسَخْ (Form I jussive: abrogate — from root ن-س-خ: to copy then cancel) + نُنسِهَا (Form IV: cause to be forgotten) — naskh vocabulary originates here.',
    },
  },
  {
    id: 'a108',
    stage: 'advanced',
    title: 'Advanced Arabic: Legal Maxims (Qawa\'id Fiqhiyya)',
    objective: 'Memorise and parse 10 classical Arabic legal maxims and understand their grammatical structure.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['10 Qawaid Fiqhiyya flashcards with Arabic text', 'Parse each maxim grammatically', 'Apply one maxim to a new case and write the ruling in Arabic'],
    quranBridge: {
      arabic: 'يُرِيدُ اللَّهُ بِكُمُ الْيُسْرَ وَلَا يُرِيدُ بِكُمُ الْعُسْرَ',
      transliteration: "Yuridu Allahu bikumul-yusra wala yuridu bikumul-usr",
      meaning: 'Allah intends for you ease and does not intend for you hardship.',
      note: 'اَلْيُسْرَ (definite: the ease — universal ease!) — the maxim الْمَشَقَّةُ تَجْلِبُ التَّيْسِيرَ (hardship brings ease) is grammatically encoded here.',
    },
  },
  {
    id: 'a109',
    stage: 'advanced',
    title: 'Advanced Reading: Surah Fussilat — Tafsir Style',
    objective: 'Read and interpret Surah Fussilat 30-46 using tafsir methodology — connecting grammar to aqida.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read Fussilat 30-46 with harakat', 'Angels\' speech to the dying believer — parse fully', 'Grammar of divine response to shirk'],
    quranBridge: {
      arabic: 'إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا تَتَنَزَّلُ عَلَيْهِمُ الْمَلَائِكَةُ',
      transliteration: "Innal-ladhina qalu rabbunallahu thumma staqamu tatanazzalu alayhimul-malaika",
      meaning: 'Those who say our Lord is Allah, then remain steadfast — the angels descend upon them.',
      note: 'ثُمَّ اسْتَقَامُوا (then Form X: they stood upright — seeking to maintain uprightness) — the sequence: verbal declaration + Form X stability = the angels come.',
    },
  },
  {
    id: 'a110',
    stage: 'advanced',
    title: 'Advanced Arabic Milestone a110: Second Century Begins',
    objective: 'Assessment covering advanced lessons a81-a109.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['60-question test covering a81-a109', 'Unseen passage: a classical text of 300 words', 'Oral component: 3-minute Arabic speech from prepared notes'],
    quranBridge: {
      arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا',
      transliteration: "Inna maal-usri yusra",
      meaning: 'Indeed with hardship comes ease.',
      note: 'مَعَ الْعُسْرِ يُسْرًا (with the hardship ease — definite hardship + indefinite ease: this difficulty has an ease) — at a110: this difficulty is producing your ease.',
    },
  },
  {
    id: 'a111',
    stage: 'advanced',
    title: 'Advanced Grammar: Verb Valency Patterns',
    objective: 'Study how Arabic verbs select their arguments — transitive, ditransitive, and intransitive patterns.',
    duration: '48 min',
    challengeLevel: 'Expert',
    drills: ['Verb valency catalogue: 30 verbs with argument structures', 'Transitivity tests in Arabic', 'Find 5 Quranic verbs that take two objects'],
    quranBridge: {
      arabic: 'وَأَعْطَيْنَا كُلَّ شَيْءٍ خَلَقَهُ هُدَاهُ',
      transliteration: "Wa-a'tayna kulla shay-in khalaqahu hudahu",
      meaning: 'And We gave to each thing it created its guidance.',
      note: 'أَعْطَى (Form IV ditransitive: give X to Y — two objects: كُلَّ شَيْءٍ + هُدَاهُ) — Form IV is often ditransitive; divine giving always has two arguments.',
    },
  },
  {
    id: 'a112',
    stage: 'advanced',
    title: 'Surah al-Nisa: Complete Inheritance System',
    objective: 'Study and parse al-Nisa 11-12 and 176 — the mathematics of Islamic inheritance in Quranic Arabic.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Nisa 11-12 with harakat', 'Fractions in Arabic: half, quarter, eighth, two-thirds, third', 'Grammar: conditional stacking in inheritance law'],
    quranBridge: {
      arabic: 'يُوصِيكُمُ اللَّهُ فِي أَوْلَادِكُمْ لِلذَّكَرِ مِثْلُ حَظِّ الْأُنثَيَيْنِ',
      transliteration: "Yusikumullahu fi awladikum liddh-dhakari mithlu hadhdhi l-unththayayn",
      meaning: 'Allah commands you concerning your children: for the male the like of the share of two females.',
      note: 'مِثْلُ حَظِّ الْأُنثَيَيْنِ (like the fortune of the two females — idafa + dual) — Islamic inheritance law is encoded in precise mathematical Arabic grammar.',
    },
  },
  {
    id: 'a113',
    stage: 'advanced',
    title: 'Advanced Arabic Etymology: Roots and Semitic Family',
    objective: 'Explore the Semitic root system — comparing Arabic roots to Hebrew and Aramaic cognates.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['10 Arabic-Hebrew cognate pairs with semantic comparison', 'Root s-l-m in Arabic vs Hebrew (shalom)', 'Root q-d-sh in Arabic (qiddush/qadis) — sacred meaning across languages'],
    quranBridge: {
      arabic: 'قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَن تَشَاءُ',
      transliteration: "Qulil-lahumma malikal-mulki tu-til-mulka man tasha",
      meaning: 'Say: O Allah, Owner of Sovereignty — You give sovereignty to whom You will.',
      note: 'مَالِكَ الْمُلْكِ (cognate root m-l-k in all Semitic languages: king, kingdom, rule) — the Arabic Quran speaks a language whose roots echo through all Abrahamic Scripture.',
    },
  },
  {
    id: 'a114',
    stage: 'advanced',
    title: 'Surah al-Nisa: Women\'s Rights, Marriage, Divorce Vocabulary',
    objective: 'Study the comprehensive vocabulary of family law in Quranic Arabic — marriage, divorce, and rights.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['30 family law vocabulary flashcards from al-Nisa', 'Grammar of consent: how does the Quran grammatically encode consent?', 'Parse al-Nisa 19-20 fully'],
    quranBridge: {
      arabic: 'وَعَاشِرُوهُنَّ بِالْمَعْرُوفِ',
      transliteration: "Wa-ashiruhunna bilmaaruf",
      meaning: 'And live with them in kindness.',
      note: 'وَعَاشِرُوهُنَّ (Form III imperative: mutual/shared life-living with them) + بِالْمَعْرُوفِ (instrument: by the known good) — Form III encodes mutuality in the very grammar of marriage.',
    },
  },
  {
    id: 'a115',
    stage: 'advanced',
    title: 'Advanced Syntax: Arabic Topic-Comment Structure',
    objective: 'Master the Arabic topic-comment (mubtada-khabar) structure with advanced examples — predicative chains, cleft sentences.',
    duration: '52 min',
    challengeLevel: 'Expert',
    drills: ['20 topic-comment examples with fronted topics', 'Cleft sentence construction: it is X who does Y', 'How does mubtada-khabar interact with emphasis particles?'],
    quranBridge: {
      arabic: 'وَإِلَهُكُمْ إِلَهٌ وَاحِدٌ',
      transliteration: "Wa-ilahukum ilahun wahid",
      meaning: 'And your God is one God.',
      note: 'وَإِلَهُكُمْ (topic: your God ← mubtada) + إِلَهٌ وَاحِدٌ (comment: one God ← khabar) — the declaration of tawhid has the simplest topic-comment in Arabic grammar.',
    },
  },
  {
    id: 'a116',
    stage: 'advanced',
    title: 'Advanced Arabic Reading: Tafsir al-Jalalayn',
    objective: 'Read and understand a selection from Tafsir al-Jalalayn — the concise classical tafsir.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Choose 10 consecutive verses and read Jalalayn\'s commentary', 'Identify grammatical explanations al-Jalalayn provides', 'Summarise one complete entry in your own words'],
    quranBridge: {
      arabic: 'كُلُّ نَفْسٍ ذَائِقَةُ الْمَوْتِ',
      transliteration: "Kullu nafsin dha-iqatul-mawt",
      meaning: 'Every soul will taste death.',
      note: 'ذَائِقَةُ الْمَوْتِ (active participle construct state: taster of death) — al-Jalalayn\'s commentary on this grammar is one of the most important explanations in tafsir history.',
    },
  },
  {
    id: 'a117',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Colour and Defect Adjectives',
    objective: 'Master colour adjectives (Form أَفْعَل/فَعْلاء) and defect/trait patterns in Arabic.',
    duration: '40 min',
    challengeLevel: 'Expert',
    drills: ['10 colour adjectives with masculine/feminine forms', 'Colour adjectives in the Quran (7 examples)', 'Defect adjectives (أَعْمَى, أَصَمَّ): grammar pattern'],
    quranBridge: {
      arabic: 'بِقَلْبٍ سَلِيمٍ',
      transliteration: "Biqalbin salim",
      meaning: 'With a sound heart.',
      note: 'سَلِيمٍ (passive participial adjective: sound/whole — from Form I root س-ل-م) — the ultimate Quran adjective; Ibrahim is described only by this adjective at his meeting with Allah.',
    },
  },
  {
    id: 'a118',
    stage: 'advanced',
    title: 'Critical Reading: Five Classical Arguments on Free Will in Arabic',
    objective: 'Read classical Arabic arguments on free will (ikhtiyar vs jabr) from al-Maturidi and al-Ash\'ari traditions.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 200 words from each tradition (total 400)', 'Parse 5 key theological sentences', 'Vocabulary: kasb, jabr, qudra, mashia, irada'],
    quranBridge: {
      arabic: 'وَمَا تَشَاءُونَ إِلَّا أَن يَشَاءَ اللَّهُ رَبُّ الْعَالَمِينَ',
      transliteration: "Wama tashauna illa an yyasha Allahu rabbul-alamin",
      meaning: 'And you do not will except that Allah — Lord of the Worlds — wills.',
      note: 'إِلَّا أَن يَشَاءَ (restriction: unless that He wills) — the grammar of free will in the Quran: human will exists grammatically but is nested inside divine will.',
    },
  },
  {
    id: 'a119',
    stage: 'advanced',
    title: 'Surah al-Hujurat: Islamic Ethical Grammar',
    objective: 'Study al-Hujurat 1-13 — the social ethics surah — analysing each command grammatically.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Hujurat fully (18 verses)', 'List all imperative commands — what, to whom, why?', 'Grammar count: how many second-person plural commands?'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا النَّاسُ إِنَّا خَلَقْنَاكُم مِّن ذَكَرٍ وَأُنثَى',
      transliteration: "Ya ayyuhan-nasu inna khalaqnakum min dhakarin wauntha",
      meaning: 'O mankind, We have created you from male and female.',
      note: 'مِّن ذَكَرٍ وَأُنثَى (from male and female — min of origin + tanwin of indefiniteness) — not from a land, tribe, or race: the grammar of universal human origin.',
    },
  },
  {
    id: 'a120',
    stage: 'advanced',
    title: 'Advanced Milestone a120: Full Assessment',
    objective: 'Comprehensive assessment for advanced lessons a101-a119.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['70-question test covering a101-a119', 'Unseen Quran passage: parse 25 verses with explanation', 'Write a 250-word classical Arabic essay on the importance of Arabic'],
    quranBridge: {
      arabic: 'وَمَنْ أَظْلَمُ مِمَّن مَّنَعَ مَسَاجِدَ اللَّهِ أَن يُذْكَرَ فِيهَا اسْمُهُ',
      transliteration: "Waman adhlamu mimman manaa masajidallahi an yudhkara fiha ismuhu",
      meaning: 'And who is more unjust than one who prevents the mosques of Allah from His name being mentioned therein.',
      note: 'مَنْ أَظْلَمُ... (rhetorical elative question: who is more unjust? — no answer needed) — a120 questions asked of yourself: do you use grammar to remember Allah\'s name?',
    },
  },
  {
    id: 'a121',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Minimizers and Maximizers',
    objective: 'Study Arabic degree words — total negation (أَبَدًا, كُلُّ, قَطُّ) and maximisers (جَمِيعًا, كَافَّةً).',
    duration: '42 min',
    challengeLevel: 'Expert',
    drills: ['20 minimiser/maximiser examples', 'Difference between قَطُّ (past never) vs أَبَدًا (future never)', '5 Quranic verses using maximisers with analysis'],
    quranBridge: {
      arabic: 'وَللَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ وَكَانَ اللَّهُ بِكُلِّ شَيْءٍ مُّحِيطًا',
      transliteration: "Walillahi ma fis-samawati wama fil-ardi wakana Allahu bikulli shay-in muhita",
      meaning: 'To Allah belongs what is in the heavens and what is on earth, and Allah is Encompassing all things.',
      note: 'بِكُلِّ شَيْءٍ مُّحِيطًا (maximiser: encompassing EVERY thing — kullu = universal maximiser) — divine syntax: kullu + indefinite = absolute universal coverage.',
    },
  },
  {
    id: 'a122',
    stage: 'advanced',
    title: 'Advanced Arabic: Poetry Composition — Wazn Tawil',
    objective: 'Write an original 4-line Arabic poem in bahru tawil (the longest classical metre).',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Review tawil metre: فَعُولُنْ مَفَاعِيلُنْ pattern', 'Read 5 lines in tawil from classical poetry', 'Draft and self-edit a 4-line poem in tawil'],
    quranBridge: {
      arabic: 'وَالشِّعْرُ مَا حَسُنَ لَفْظُهُ وَدَقَّ مَعْنَاهُ',
      transliteration: "Wasshiru ma hasuna lafzhuhu wadhaqqa maanah",
      meaning: 'Poetry is that which has beautiful expression and subtle meaning.',
      note: 'من كلام ابن المقفع — From Ibn al-Muqaffa: Arabic poetry demands both: حُسْن اللَّفْظ (beautiful form) and دِقَّة الْمَعْنَى (precise meaning).',
    },
  },
  {
    id: 'a123',
    stage: 'advanced',
    title: 'Surah al-Ahzab: Community, Marriage, Prophet\'s Household',
    objective: 'Study al-Ahzab 35-58 — commands to women and men of faith, prayer on the Prophet, and social ethics.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Ahzab 35-58 with harakat', 'Gender-balanced vocabulary: al-Ahzab 35\'s parallel structure', 'Grammar of al-Ahzab 56: divine salawat and human command to salawat'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ وَمَلَائِكَتَهُ يُصَلُّونَ عَلَى النَّبِيِّ',
      transliteration: "Innallaha wamalaikatahu yusalluna alan-nabi",
      meaning: 'Indeed, Allah and His angels bless the Prophet.',
      note: 'يُصَلُّونَ (Form II plural: they send blessings) — Allah and His angels in continuous present tense blessing; grammatically, this has no past and no future — it is eternal present.',
    },
  },
  {
    id: 'a124',
    stage: 'advanced',
    title: 'Advanced Arabic: Discussing Islamic Jurisprudence (Fiqh)',
    objective: 'Develop vocabulary and grammatical competency for discussing Islamic legal rulings in Arabic.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['50 fiqh vocabulary flashcards', 'Construct 5 legal opinion statements in Arabic', 'Read a contemporary Arabic fatwa (100 words)'],
    quranBridge: {
      arabic: 'وَمَا اخْتَلَفْتُمْ فِيهِ مِن شَيْءٍ فَحُكْمُهُ إِلَى اللَّهِ',
      transliteration: "Wama ikhtalaftum fihi min shay-in fahukmuhu ilallah",
      meaning: 'And in whatever you differ — its ruling is to Allah.',
      note: 'فَحُكْمُهُ إِلَى اللَّهِ (fa of consequence + mubtada-khabar: its ruling belongs to Allah) — fiqh\'s ultimate principle in perfect Arabic grammar.',
    },
  },
  {
    id: 'a125',
    stage: 'advanced',
    title: 'Advanced Grammar: Form Parallelism in Sacred Texts',
    objective: 'Study how Classical Arabic uses grammatical parallelism as a rhetorical and pedagogical device.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['10 Quranic parallel structures analysed', 'Parallel construction: noun-noun, verb-verb, clause-clause', 'Write 3 original Arabic parallel sentences on Islamic themes'],
    quranBridge: {
      arabic: 'مَن جَاءَ بِالْحَسَنَةِ فَلَهُ عَشْرُ أَمْثَالِهَا وَمَن جَاءَ بِالسَّيِّئَةِ فَلَا يُجْزَى إِلَّا مِثْلَهَا',
      transliteration: "Man jaa bilhasanati falahu ashru amthaliha waman jaa bis-sayyiati fala yujza illa mithlaha",
      meaning: 'Whoever comes with a good deed — for him is tenfold the like. Whoever comes with an evil deed — he is recompensed only the like thereof.',
      note: 'Perfect grammatical parallelism: man + jaa + bi + fa + recompense — the Quranic math of justice expressed through parallel conditional structure.',
    },
  },
  {
    id: 'a126',
    stage: 'advanced',
    title: 'Advanced Arabic: Newspaper and Contemporary Classical',
    objective: 'Read two contemporary Arabic newspaper articles (standard Arabic) and translate key paragraphs.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read 2 contemporary Arabic news articles', 'Vocabulary: 20 contemporary Arabic media terms', 'Translate one key paragraph and analyse translation choices'],
    quranBridge: {
      arabic: 'وَلَتَجِدَنَّهُمْ أَحْرَصَ النَّاسِ عَلَى حَيَاةٍ',
      transliteration: "Walatajidannahum ahrasan-nasi ala haya",
      meaning: 'And you will surely find them the most greedy of people for life.',
      note: 'أَحْرَصَ النَّاسِ (elative + idafa: most greedy of all people) — contemporary Arabic journalism inherits the Quranic observation: some people are very eager for dunya.',
    },
  },
  {
    id: 'a127',
    stage: 'advanced',
    title: 'Advanced Greek-Origin Words in Classical Arabic',
    objective: 'Study 20 Greek-origin terms in Arabic philosophy/science (falsafa, mantiq, kimiya, handasa...).',
    duration: '38 min',
    challengeLevel: 'Expert',
    drills: ['20 Greek-Arabic loanword flashcards', 'How were Greek words Arabicised? (nativisation patterns)', 'Find how these terms appear in classical Arabic texts'],
    quranBridge: {
      arabic: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',
      transliteration: "Wa-allama adama l-asma-a kullaha",
      meaning: 'And He taught Adam the names of all things.',
      note: 'الْأَسْمَاءَ كُلَّهَا (the names — all of them: kulluha as direct tawkid) — Arabic\'s borrowing from Greek is consistent with Adam\'s lesson: all names belong to knowledge.',
    },
  },
  {
    id: 'a128',
    stage: 'advanced',
    title: 'Advanced Arabic: Sufi Vocabulary and Mystical Texts',
    objective: 'Study 30 classical Arabic Sufi vocabulary items: fana, baqa, kashf, tajalli, wajd, hal, maqam.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['30 Sufi vocabulary flashcards', 'Read 150 words from Ibn Arabi\'s Fusus al-Hikam', 'Grammar analysis: how does mystical Arabic differ from legal Arabic?'],
    quranBridge: {
      arabic: 'وَهُوَ مَعَكُمْ أَيْنَ مَا كُنتُمْ',
      transliteration: "Wahuwa maakum ayna ma kuntum",
      meaning: 'And He is with you wherever you are.',
      note: 'مَعَكُمْ (with you — maa of companionship) + أَيْنَ مَا كُنتُمْ (wherever + conditional past: wherever you were/are) — the Sufi tradition began from this grammar of divine presence.',
    },
  },
  {
    id: 'a129',
    stage: 'advanced',
    title: 'Advanced Arabic: Letter Writing and Formal Correspondence',
    objective: 'Write a formal Arabic letter (150 words) using classical epistolary conventions.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Classical letter structure: basmala, address, body, closing', 'Study 3 examples of classical Muslim letter-writing', 'Write and self-edit a 150-word formal letter'],
    quranBridge: {
      arabic: 'إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      transliteration: "Innahu min Sulayma wa-innahu bismillahir-rahmanir-rahim",
      meaning: 'It is from Solomon, and it reads: In the name of Allah, the Most Gracious, the Most Merciful.',
      note: 'إِنَّهُ مِن سُلَيْمَانَ (indeed it is from Solomon — inna + source) — the world\'s first Quranic letter began with basmala; formal Arabic correspondence follows prophetic precedent.',
    },
  },
  {
    id: 'a130',
    stage: 'advanced',
    title: 'Advanced Milestone a130: Comprehensive Assessment',
    objective: 'Full assessment of advanced lessons a121-a129.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['60-question skills test', 'Unseen classical text: read and summarise 300 words', 'Write a 250-word formal Arabic analysis of an ayah'],
    quranBridge: {
      arabic: 'اللَّهُ نُورُ السَّمَاوَاتِ وَالْأَرْضِ',
      transliteration: "Allahu nurus-samawati wal-ard",
      meaning: 'Allah is the Light of the heavens and the earth.',
      note: 'اللَّهُ نُورُ (predicate equation: Allah = Light — no verb needed; the equation IS the claim) — a130 reached: the light equation illuminates your progress.',
    },
  },
  {
    id: 'a131',
    stage: 'advanced',
    title: 'Advanced Quranic Analysis: Surah al-Nur — Light Verse',
    objective: 'Full analysis of Ayat al-Nur (24:35) — the most complex single verse in Arabic literature.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Full parse of al-Nur 35 (every morpheme)', '5 different tafsir opinions: summarise in Arabic', 'Write a 200-word literary analysis of this verse'],
    quranBridge: {
      arabic: 'مَثَلُ نُورِهِ كَمِشْكَاةٍ فِيهَا مِصْبَاحٌ',
      transliteration: "Mathalu nuwrihi kamishkatin fiha misbah",
      meaning: 'The example of His light is like a niche in which there is a lamp.',
      note: 'مَثَلُ نُورِهِ كَمِشْكَاةٍ (simile: His light is like — then the metaphor extends over 7 layers) — al-Nur 35 is a seven-storey metaphor; each layer is a grammar lesson.',
    },
  },
  {
    id: 'a132',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Classifiers and Measure Words',
    objective: 'Study Arabic measure constructions — units of weight, time, distance, and their grammatical integration.',
    duration: '42 min',
    challengeLevel: 'Expert',
    drills: ['15 unit/measure constructions in Arabic', 'Quran weight references: مِثْقَالُ ذَرَّةٍ', 'Grammar: how do Arabic numbers interact with units?'],
    quranBridge: {
      arabic: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ',
      transliteration: "Faman yamall mithqala dhharratin khayran yarah",
      meaning: 'Whoever does an atom\'s weight of good will see it.',
      note: 'مِثْقَالَ ذَرَّةٍ (measure construct: weight of an atom — the ultimate minimal measurement) — Arabic has a grammar sensitive enough to quantify divine accountability down to the atom.',
    },
  },
  {
    id: 'a133',
    stage: 'advanced',
    title: 'Advanced Arabic: Al-Quran and the Oral Tradition',
    objective: 'Study how the Quran\'s oral and written tradition interplay with Arabic grammar — reading, tajweed, and spelling.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Rasm al-mushaf: Uthmani spelling vs phonetic spelling discrepancies', '5 examples of qira\'at affecting meaning', 'Grammar of mushaf: why is the Quran not vowelised by default?'],
    quranBridge: {
      arabic: 'إِنَّا نَحْنُ نَزَّلْنَا الذِّكْرَ وَإِنَّا لَهُ لَحَافِظُونَ',
      transliteration: "Inna nahnu nazzalna dh-dhikra wa-inna lahu lahafizun",
      meaning: 'Indeed, We have revealed the Reminder, and indeed We will be its guardian.',
      note: 'لَحَافِظُونَ (lam of emphasis + active plural participle: We are guardians absolutely) — the Quran\'s preservation is linguistically guaranteed by perfect grammar.',
    },
  },
  {
    id: 'a134',
    stage: 'advanced',
    title: 'Classical Arabic Grammar Tradition: The Basra vs Kufa Schools',
    objective: 'Study the classical Basran and Kufan grammar schools — their methodological differences on key points.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['5 disputed grammar points between Basrans and Kufans', 'Basran basis: analogy (qiyas) vs Kufan flexibility', 'Which school does modern Arabic grammar follow?'],
    quranBridge: {
      arabic: 'لِيَجْزِيَ اللَّهُ كُلَّ نَفْسٍ مَّا كَسَبَتْ',
      transliteration: "Liyajziyallahu kulla nafsin ma kasabat",
      meaning: 'That Allah may recompense every soul for what it earned.',
      note: 'كَسَبَتْ (Form I: she earned — different from اكْتَسَبَتْ Form VIII: she strived to earn) — Basrans and Kufans debated such distinctions; both schools serve the Quran.',
    },
  },
  {
    id: 'a135',
    stage: 'advanced',
    title: 'Surah al-Rum: Civilisations Rise and Fall',
    objective: 'Complete study of al-Rum — Byzantine defeat and rise, divine signs, resurrection proofs.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Rum 1-60 with harakat', 'Civilisation vocabulary', 'Grammar: past tense vs future in divine prediction (al-Rum 2-4)'],
    quranBridge: {
      arabic: 'غُلِبَتِ الرُّومُ فِي أَدْنَى الْأَرْضِ وَهُم مِّن بَعْدِ غَلَبِهِمْ سَيَغْلِبُونَ',
      transliteration: "Ghulibatir-ruumu fi adnal-ardi wahum min badi ghalabihim sayaghhlibbun",
      meaning: 'The Romans have been defeated in the nearest land — but after their defeat, they will overcome.',
      note: 'غُلِبَتِ (passive past: they were defeated) + سَيَغْلِبُونَ (sa future: they WILL overcome) — the grammar of divine prediction: past passive yields to future active.',
    },
  },
  {
    id: 'a136',
    stage: 'advanced',
    title: 'Advanced Reading: al-Muhasibi\'s al-Wasaya',
    objective: 'Read 400 words from al-Muhasibi\'s spiritual letter on self-examination and piety.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 400 words of al-Wasaya', 'Soul examination vocabulary: raqaba, muhasaba, nafs', 'Identify al-Muhasibi\'s style: how does he use conditional sentences?'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَلْتَنظُرْ نَفْسٌ مَّا قَدَّمَتْ لِغَدٍ',
      transliteration: "Ya ayyuhal-ladhina amanu ttaqullaha waltandhur nafsun ma qaddamat lighad",
      meaning: 'O you who believe, fear Allah. And let every soul look to what it has sent forth for tomorrow.',
      note: 'وَلْتَنظُرْ نَفْسٌ (lam of command + indefinite: let a soul examine) — al-Muhasibi built his entire spiritual method on this command: muhasaba is grammatically commanded.',
    },
  },
  {
    id: 'a137',
    stage: 'advanced',
    title: 'Quran Deep Dive: Surah al-Fath — Victory Grammar',
    objective: 'Study al-Fath 1-29 — the Treaty of Hudaybiyya, divine victory, and the grammar of divine promise.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Fath 1-29 with harakat', 'Victory vocabulary', 'Grammar of divine promise: 5 future tense guarantees in this surah'],
    quranBridge: {
      arabic: 'إِنَّا فَتَحْنَا لَكَ فَتْحًا مُّبِينًا',
      transliteration: "Inna fatahna laka fathan mubina",
      meaning: 'Indeed We have given you a clear victory.',
      note: 'فَتَحْنَا (past tense: We have opened/given victory) + فَتْحًا مُّبِينًا (mafool mutlaq: a clear-kind of victory) — divine past tense announcing future event: the grammar of certain prophecy.',
    },
  },
  {
    id: 'a138',
    stage: 'advanced',
    title: 'Advanced Grammar: الاشتغال — Preoccupied Verb Construction',
    objective: 'Master the Arabic construction of ishtighaal — where a verb is occupied by a pronoun before reaching the noun.',
    duration: '48 min',
    challengeLevel: 'Expert',
    drills: ['10 ishtighaal construction examples', 'Rules of preference between nasb and rafa in ishtighaal', 'Find 3 ishtighaal examples in the Quran'],
    quranBridge: {
      arabic: 'وَالسَّمَاءَ بَنَيْنَاهَا بِأَيْدٍ',
      transliteration: "Was-samaa banaynaha bi-aydin",
      meaning: 'And the sky — We built it with strength.',
      note: 'وَالسَّمَاءَ (fronted object) + بَنَيْنَاهَا (verb occupied by pronoun -ha referring back to sky) — ishtighaal construction: the verb\'s pronoun announces the subject before the verb catches up.',
    },
  },
  {
    id: 'a139',
    stage: 'advanced',
    title: 'Surah al-Muminun: The Journey of the Soul',
    objective: 'Study al-Muminun 1-22 — the successful believers\' description, and 51-100 — the creation cycle and blameworthy nations.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Muminun 1-22 and 51-100 with harakat', 'Soul journey: embryology, death, barzakh vocabulary', 'Grammar: how does the surah move between creation and accountability?'],
    quranBridge: {
      arabic: 'ثُمَّ أَنشَأْنَاهُ خَلْقًا آخَرَ فَتَبَارَكَ اللَّهُ أَحْسَنُ الْخَالِقِينَ',
      transliteration: "Thumma anshanahu khalqan akhara fatabaraka Allahu ahsanul-khaliqin",
      meaning: 'Then We developed him into another creation. So blessed is Allah, the best of creators.',
      note: 'فَتَبَارَكَ (fa of result: therefore God is blessed) — Imam al-Nawawi said this verse caused him to exclaim aloud during recitation; the grammar of creation demands this response.',
    },
  },
  {
    id: 'a140',
    stage: 'advanced',
    title: 'Advanced Arabic: Seerah Literature — Letters of the Prophet',
    objective: 'Read the Arabic texts of the Prophet\'s letters to kings (Khosrow, Heraclius, Muqawqis).',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read 3 prophetic letters in Arabic', 'Compare diplomatic vocabulary and tone', 'Grammar: how does the Prophet begin and close each letter?'],
    quranBridge: {
      arabic: 'فَإِن تَوَلَّوْا فَإِنَّ اللَّهَ عَلِيمٌ بِالْمُفْسِدِينَ',
      transliteration: "Fain tawallaww fa-innallaha alimun bilmufsideen",
      meaning: 'If they turn away — then indeed Allah is Knowing of the corrupters.',
      note: 'فَإِن تَوَلَّوْا (conditional: if they turn away — Form V of turning) + فَإِنَّ (fa of result + inna) — these were the exact words in the Prophet\'s letters to rulers.',
    },
  },
  {
    id: 'a141',
    stage: 'advanced',
    title: 'Advanced Arabic: Discussing Spiritual States and Stations',
    objective: 'Develop Arabic vocabulary for discussing al-maqamat wal-ahwal — Sufi stations and states in classical texts.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['40 Sufi station/state vocabulary flashcards', 'Compare Qushayri\'s Risala on tawba, zuhd, wara, tawakkul', 'Write a 100-word description of tawakkul in Arabic'],
    quranBridge: {
      arabic: 'وَعَلَى اللَّهِ فَتَوَكَّلُوا إِن كُنتُم مُّؤْمِنِينَ',
      transliteration: "Wa-alallahi fatawakkalu in kuntum mu'minin",
      meaning: 'And upon Allah rely if you are believers.',
      note: 'فَتَوَكَّلُوا (Form V imperative: to delegate absolutely, entrust) — Form V tawakkul: not passive resignation but active, intentional entrusting to Allah.',
    },
  },
  {
    id: 'a142',
    stage: 'advanced',
    title: 'Advanced Arabic Grammar: Pausal Forms (Waqf)',
    objective: 'Master the rules for pausal forms in Arabic recitation — how words change at the stop.',
    duration: '45 min',
    challengeLevel: 'Expert',
    drills: ['20 pausal form transformations: tanwin drops, ta marbuta becomes ha', 'Pausal vs continuation reading differences in 10 words', 'Read 10 verses applying correct waqf rules'],
    quranBridge: {
      arabic: 'وَلَا تَقُولَنَّ لِشَيْءٍ إِنِّي فَاعِلٌ ذَلِكَ غَدًا إِلَّا أَن يَشَاءَ اللَّهُ',
      transliteration: "Wala taqulanna li-shay-in inni failun dhalika ghadan illa an yashaa Allah",
      meaning: 'And never say of anything: I will do that tomorrow, unless Allah wills.',
      note: 'إِلَّا أَن يَشَاءَ اللَّهُ (restriction with subjunctive: unless that Allah wills) — the grammar of insha\'Allah: grammatically, all future plans are exception-clauses.',
    },
  },
  {
    id: 'a143',
    stage: 'advanced',
    title: 'Advanced Quran: Surah Ibrahim — Gratitude and Ingratitude',
    objective: 'Study Ibrahim 7-52 — the grammar of gratitude, ingratitude, Ibrahim\'s prayer, and the parable of good/evil word.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read Ibrahim 7-52 with harakat', 'Gratitude vocabulary: shukr, ni\'ma, kufran', 'Grammar of the tree parable (Ibrahim 24-27): metaphor analysis'],
    quranBridge: {
      arabic: 'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ وَلَئِن كَفَرْتُمْ إِنَّ عَذَابِي لَشَدِيدٌ',
      transliteration: "La-in shakartum la-azidannakum wala-in kafartum inna ataabi lashadid",
      meaning: 'If you are grateful, I will surely increase you. But if you are ungrateful, My punishment is severe.',
      note: 'لَئِن (oath + conditional) + لَأَزِيدَنَّكُمْ (lam of oath + future emphatic: I WILL surely increase) — divine promise with double-oath grammar; the gratitude equation is linguistically guaranteed.',
    },
  },
  {
    id: 'a144',
    stage: 'advanced',
    title: 'Advanced Arabic: Reading al-Jahiz\'s al-Bayan',
    objective: 'Read 350 words from al-Jahiz\'s al-Bayan wal-Tabyin — the masterpiece of classical Arabic prose.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 350 words of al-Jahiz\'s text', 'Humour and wit in classical Arabic — identify 2 examples', 'Grammar analysis: 3 complex structures al-Jahiz employs'],
    quranBridge: {
      arabic: 'وَمِنَ النَّاسِ مَن يَشْتَرِي لَهْوَ الْحَدِيثِ',
      transliteration: "Waminan-nasi man yashtari lahwal-hadith",
      meaning: 'And of the people is he who buys the amusement of speech.',
      note: 'لَهْوَ الْحَدِيثِ (speech as distraction/entertainment — construct state) — al-Jahiz wrote entertainment literature; his genius was making knowledge entertaining without making it lahw.',
    },
  },
  {
    id: 'a145',
    stage: 'advanced',
    title: 'Advanced Grammar: Al-Zajjaj\'s Analysis of Quranic Grammar',
    objective: 'Study al-Zajjaj\'s approach to Quranic grammatical analysis — his methodology and key insights.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read 200 words of al-Zajjaj\'s I\'rab al-Quran', 'Al-Zajjaj\'s methodology: identify 3 features', 'Apply his analytical approach to one verse of your choice'],
    quranBridge: {
      arabic: 'وَالَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ أُولَئِكَ أَصْحَابُ الْجَنَّةِ',
      transliteration: "Walladhina amanu waamilus-salihati ulaika ashabul-janna",
      meaning: 'And those who believe and do righteous deeds — they are the companions of Paradise.',
      note: 'أُولَئِكَ (demonstrative: those — pointing to a class of people just described) + أَصْحَابُ الْجَنَّةِ (predicate noun phrase) — a nominative sentence about Paradise\'s inhabitants.',
    },
  },
  {
    id: 'a146',
    stage: 'advanced',
    title: 'Advanced Arabic Morphology: Masdar Mimi and Masdar Sinai',
    objective: 'Study masdar mimi (مَفْعَل pattern), masdar sinai (مَصْدَر صِنَاعِي -iyya suffix), and their advanced uses.',
    duration: '45 min',
    challengeLevel: 'Expert',
    drills: ['20 masdar mimi examples', '15 masdar sinai examples (islamiyya, arabiyya, qawmiyya)', 'How are artificial masdars created for abstract concepts?'],
    quranBridge: {
      arabic: 'وَيُرِيدُ اللَّهُ أَن يَتُوبَ عَلَيْكُمْ',
      transliteration: "Wayuridullahu an yatuuba alaykum",
      meaning: 'And Allah wants to accept repentance from you.',
      note: 'يَتُوبَ (Form I subjunctive from tawba) — tawba (genuine masdar) → tawbiyya would be masdar sinai. Learning to distinguish the authentic from the artificial.',
    },
  },
  {
    id: 'a147',
    stage: 'advanced',
    title: 'Quran Social Justice: Vocabulary of the Oppressed',
    objective: 'Study 40 Quranic vocabulary items related to social justice: mustadafin, zulm, adl, qist, haqq, baghiy.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['40 social justice vocabulary flashcards', 'Grammar of oppression in Quran: how are oppressors addressed?', 'Contrast: al-Qarun story vs the mustadafin narrative'],
    quranBridge: {
      arabic: 'وَلَا تَحْسَبَنَّ اللَّهَ غَافِلًا عَمَّا يَعْمَلُ الظَّالِمُونَ',
      transliteration: "Wala tahsabanallaha ghafilan amma yamalu dhdhalimun",
      meaning: 'And do not think Allah is unaware of what the oppressors do.',
      note: 'لَا تَحْسَبَنَّ (lam prohibition + Form I emphatic: don\'t ever think!) + غَافِلًا (hal: in a state of heedlessness) — divine witnessing grammar: Allah is never grammatically ghaafil.',
    },
  },
  {
    id: 'a148',
    stage: 'advanced',
    title: 'Advanced Syntax: Fronting and Focus in Arabic',
    objective: 'Master the full spectrum of fronting operations in Arabic — wa-qalab, taqdam, nominal fronting.',
    duration: '52 min',
    challengeLevel: 'Expert',
    drills: ['20 fronting examples with reason analysis', 'How does fronting change information focus?', 'Transformation exercise: front different constituents in 5 sentences'],
    quranBridge: {
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      transliteration: "Iyyaka nabudu wa-iyyaka nastain",
      meaning: 'You alone we worship and You alone we seek help from.',
      note: 'إِيَّاكَ (fronted direct object: YOU — before the verb) — this is the most famous and theologically loaded fronting in Arabic: worship is restricted to You by word order.',
    },
  },
  {
    id: 'a149',
    stage: 'advanced',
    title: 'Advanced Reading: Ibn Qayyim al-Jawziyya — Madarij al-Salikin',
    objective: 'Read 400 words from Ibn Qayyim\'s Madarij al-Salikin — stages of the spiritual journey.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 400 words on the station of tawba', 'Vocabulary: inaba, awba, tawba — distinctions', 'Grammar highlight: Ibn Qayyim\'s complex conditional sentences'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ يُحِبُّ التَّوَّابِينَ وَيُحِبُّ الْمُتَطَهِّرِينَ',
      transliteration: "Innallaha yuhibbut-tawwabina wayuhibbul-mutatahhirin",
      meaning: 'Indeed Allah loves those who constantly repent and loves those who purify themselves.',
      note: 'التَّوَّابِينَ (Form II intensive pattern: those who intensively, repeatedly repent) — Ibn Qayyim\'s entire Madarij is a commentary on who these tawwabeen are grammatically.',
    },
  },
  {
    id: 'a150',
    stage: 'advanced',
    title: 'Advanced Milestone a150: Mid-Advanced Assessment',
    objective: 'Midpoint assessment of all advanced lessons a131-a149.',
    duration: '100 min',
    challengeLevel: 'Expert',
    drills: ['75-question midpoint assessment', 'Unseen passage: 400-word classical text reading + summary', 'Write a 300-word argumentative essay on an Islamic topic in Arabic'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
      transliteration: "Innallaha maas-sabirin",
      meaning: 'Indeed Allah is with the patient ones.',
      note: 'مَعَ الصَّابِرِينَ (with the patient ones — active participle plural) — 150 advanced lessons required patient study; divine company is the grammar reward.',
    },
  },
  {
    id: 'a151',
    stage: 'advanced',
    title: 'Surah al-Jinn: Non-Human Listeners of the Quran',
    objective: 'Study Surah al-Jinn — the first jinn community to hear the Quran, their response, and linguistic form.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Jinn 1-28 with harakat', 'Jinn\'s speech acts: what do they say and how?', 'Direct discourse grammar in this surah'],
    quranBridge: {
      arabic: 'إِنَّا سَمِعْنَا قُرْآنًا عَجَبًا يَهْدِي إِلَى الرُّشْدِ فَآمَنَّا بِهِ',
      transliteration: "Inna samiinaa quranan ajaba yahdi ilar-rushdi fa-amanna bih",
      meaning: 'Indeed we heard a wondrous Quran guiding to righteousness, and we believed in it.',
      note: 'قُرْآنًا عَجَبًا (indefinite: a wondrous Quran!) — jinn respond to an indefinite Quran encounter with immediate faith; the grammar of awe leads to iman.',
    },
  },
  {
    id: 'a152',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Nominal Adjective Phrases',
    objective: 'Master complex Arabic adjective phrases — stacked adjectives, participial phrases, relative adjectives.',
    duration: '48 min',
    challengeLevel: 'Expert',
    drills: ['Adjective phrase analysis: 25 examples', 'Participial modifiers vs relative clause modifiers: 10 contrast pairs', 'Parse all noun phrases in al-Baqarah 285'],
    quranBridge: {
      arabic: 'رَسُولٌ مِّن رَّبِّكُمْ يَتْلُو عَلَيْكُمْ آيَاتِ اللَّهِ مُطَهَّرَةً',
      transliteration: "Rasulun min rabbikum yatlu alaykum ayatallahi mutahhara",
      meaning: 'A Messenger from your Lord reciting to you the purified verses of Allah.',
      note: 'رَسُولٌ (head noun) + مِّن رَّبِّكُمْ (PP modifier) + يَتْلُو... (participial/verbal relative) + مُطَهَّرَةً (adjective of آيَاتِ) — a four-layer noun phrase.',
    },
  },
  {
    id: 'a153',
    stage: 'advanced',
    title: 'Advanced Reading: Classical Arabic Geography — Al-Bakri and Al-Idrisi',
    objective: 'Read 300 words from classical Arabic geographic texts and study their vocabulary.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Read 300 words from al-Idrisi\'s geographic text', 'Geographic vocabulary in Arabic', 'Grammar: descriptions and comparisons of places'],
    quranBridge: {
      arabic: 'وَفِي الْأَرْضِ آيَاتٌ لِّلْمُوقِنِينَ',
      transliteration: "Wa fil-ardi ayatun lilmuqinin",
      meaning: 'And in the earth are signs for those who are certain.',
      note: 'آيَاتٌ لِّلْمُوقِنِينَ (indefinite: signs — their number uncounted — for the certain-hearted) — classical Arabic geography is the science of reading these signs.',
    },
  },
  {
    id: 'a154',
    stage: 'advanced',
    title: 'Advanced Arabic Grammar: The Five Special Nouns (Al-Asma\' al-Khamsa)',
    objective: 'Master the five irregular nouns: ab, akh, ham, fu, dhu — their unique case system with letters.',
    duration: '42 min',
    challengeLevel: 'Expert',
    drills: ['5 nouns in all three cases (15 conjugations)', 'Find 5 Quranic examples of each noun', 'Grammar rules for when they use letter vs normal case endings'],
    quranBridge: {
      arabic: 'وَأَبُوهُمَا كَانَ صَالِحًا',
      transliteration: "Wa-abuhuma kana salihan",
      meaning: 'And their father had been righteous.',
      note: 'أَبُوهُمَا (one of the five special nouns: father — nominative uses waw: أَبُو) — Khidr explains the wall to Musa; father\'s righteousness extends to children. Grammar of generational mercy.',
    },
  },
  {
    id: 'a155',
    stage: 'advanced',
    title: 'Quran Ecology: Natural World Vocabulary',
    objective: 'Study 50 Quranic vocabulary items for the natural world — water, plants, animals, elements.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['50 natural world vocabulary flashcards from the Quran', 'Classify by category: water (10), plants (10), animals (10), elements (10)', 'Find the verses containing each item'],
    quranBridge: {
      arabic: 'وَالسَّمَاءَ رَفَعَهَا وَوَضَعَ الْمِيزَانَ',
      transliteration: "Was-samaa rafaaha wawadaal-mizan",
      meaning: 'And the heaven He raised and imposed the balance.',
      note: 'الْمِيزَانَ (the scale/balance — definite: THE cosmic balance) — al-Rahman\'s ecology lesson: divine balance permeates nature; vocabulary lets you read the signs.',
    },
  },
  {
    id: 'a156',
    stage: 'advanced',
    title: 'Advanced Arabic: Responding to Islamic Misconceptions',
    objective: 'Develop Arabic vocabulary and argumentation skills to address common misconceptions about Islam.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['5 common Islamic misconceptions: prepare Arabic responses', 'Persuasion vocabulary: clarify, explain, evidence, conclude', 'Write a 200-word Arabic response to one misconception'],
    quranBridge: {
      arabic: 'قُلْ هَذِهِ سَبِيلِي أَدْعُو إِلَى اللَّهِ عَلَى بَصِيرَةٍ',
      transliteration: "Qul hadhihi sabili aduu ilallahi ala basira",
      meaning: 'Say: This is my way; I invite to Allah with clear insight.',
      note: 'عَلَى بَصِيرَةٍ (on the basis of clear insight — basira: visual clarity of heart) — responding to misconceptions requires بَصِيرَة: not emotion, but clear inner vision.',
    },
  },
  {
    id: 'a157',
    stage: 'advanced',
    title: 'Advanced Arabic Grammar: Quranic Hapax Legomena',
    objective: 'Study words appearing only once in the Quran (hapax legomena) — their unique grammar and meaning.',
    duration: '45 min',
    challengeLevel: 'Expert',
    drills: ['10 hapax legomena in the Quran with analysis', 'Why does uniqueness matter linguistically?', 'Grammar analysis of each hapax legomenon'],
    quranBridge: {
      arabic: 'وَابْتَغُواْ إِلَيهِ الْوَسِيلَةَ',
      transliteration: "Wabtaghu ilayhi l-wasila",
      meaning: 'And seek the means of approach to Him.',
      note: 'الْوَسِيلَةَ (unique use of wasila as a religious term: means of approach to Allah) — some Quranic words appear once and carry an entire theology; their uniqueness is their power.',
    },
  },
  {
    id: 'a158',
    stage: 'advanced',
    title: 'Surah al-Qiyama: The Inner Self',
    objective: 'Study al-Qiyama 1-40 — the resurrection, the self-reproaching soul (nafs lawwama), and the face of Allah.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Qiyama 1-40 with harakat', 'Grammar of accusation: nafs lawwama', 'Vocabulary: Day of Resurrection scenario (15 words)'],
    quranBridge: {
      arabic: 'وَلَا أُقْسِمُ بِالنَّفْسِ اللَّوَّامَةِ',
      transliteration: "Wala uqsimu bin-nafsil-lawwama",
      meaning: 'And I swear by the self-reproaching soul.',
      note: 'اللَّوَّامَةِ (Form II intensive participial: intensely blaming — the conscience that never stops accusing) — an oath BY the self-reproaching conscience: grammar elevates inner accountability.',
    },
  },
  {
    id: 'a159',
    stage: 'advanced',
    title: 'Advanced Arabic: Analysing Friday Khutbah Text',
    objective: 'Read, parse, and evaluate the language of a classical Arabic Friday khutbah.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read a full classical Arabic khutbah (300 words)', 'Identify all grammar structures used', 'Evaluate: persuasive impact vs grammatical sophistication'],
    quranBridge: {
      arabic: 'فَاسْتَقِيمُوا إِلَيْهِ وَاسْتَغْفِرُوهُ',
      transliteration: "Fastaqimu ilayhi wastaghhfiruh",
      meaning: 'So be upright toward Him and seek His forgiveness.',
      note: 'فَاسْتَقِيمُوا (fa consequence + Form X imperative: seek uprightness) — every khutbah culminates in this dual command; grammar of directive-type closing.',
    },
  },
  {
    id: 'a160',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Wh-Movement and Questions',
    objective: 'Master all Arabic interrogative types — single questions, embedded questions, rhetorical, and indirect.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['All question words: 5 examples each', 'Embedded question sentences (ifada clauses)', 'Transform 10 statements into each type of question'],
    quranBridge: {
      arabic: 'مَنْ أَحْسَنُ مِنَ اللَّهِ صِبْغَةً',
      transliteration: "Man ahsanu minallahi sibgha",
      meaning: 'And who is better than Allah in providing colour/character?',
      note: 'مَنْ (who — rhetorical question: the answer is obvious) + أَحْسَنُ (elative comparative: who is more excellent?) — Quranic wh-movement with rhetorical force.',
    },
  },
  {
    id: 'a161',
    stage: 'advanced',
    title: 'Surah al-Baqarah: The Cow Story — Full Analysis',
    objective: 'Complete analysis of the cow story (al-Baqarah 67-74) — dialogue, command, resistance, and submission.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Baqarah 67-74 with harakat', 'Track the 5-step dialogue: command → question → answer → question → answer', 'Grammar: how does the Israelites\' resistance show in grammar?'],
    quranBridge: {
      arabic: 'قَالُوا ادْعُ لَنَا رَبَّكَ يُبَيِّن لَّنَا مَا لَوْنُهَا',
      transliteration: "Qalu uduu lana rabbaka yubayyin lana ma lawnuha",
      meaning: 'They said: Call upon your Lord to make clear what its colour is.',
      note: 'مَا لَوْنُهَا (embedded question: what is its colour — indefinite question in indirect speech) — the Israelites delay by asking unnecessary questions; their grammar reveals their reluctance.',
    },
  },
  {
    id: 'a162',
    stage: 'advanced',
    title: 'Advanced Arabic: Contemporary Islamic Scholarship Writing',
    objective: 'Study the Arabic writing style of contemporary Islamic scholars (al-Qaradawi, Ibn Baz, al-Uthaymeen).',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read 200 words from a contemporary fatwa', 'Compare contemporary scholarly style to classical', 'Note 5 modern grammar usages vs classical preferences'],
    quranBridge: {
      arabic: 'وَمَا أَرْسَلْنَا مِن قَبْلِكَ إِلَّا رِجَالًا نُّوحِي إِلَيْهِمْ',
      transliteration: "Wama arsalna min qablika illa rijalan nuhi ilayhim",
      meaning: 'And We did not send before you except men to whom We revealed.',
      note: 'إِلَّا رِجَالًا نُّوحِي إِلَيْهِمْ (restriction + relative clause: only men to whom We inspired) — contemporary scholars extend this prophetic chain with their writing.',
    },
  },
  {
    id: 'a163',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Verbal Aspect — Completive vs Inceptive',
    objective: 'Study the aspectual dimension of Arabic tense — completed action (māḍī) vs initiated/ongoing action.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['20 aspectual contrast examples', 'Context-dependent aspect interpretation of 10 verses', 'How does كَانَ modify aspect when combined with muḍāriʿ?'],
    quranBridge: {
      arabic: 'وَكَانَ اللَّهُ سَمِيعًا عَلِيمًا',
      transliteration: "Wakana Allahu samian alima",
      meaning: 'And Allah is ever All-Hearing, All-Knowing.',
      note: 'كَانَ (past linking verb) + اسم فاعل (divine names) — despite past tense kana, divine attributes are timeless; kana with divine-names indicates permanent present state.',
    },
  },
  {
    id: 'a164',
    stage: 'advanced',
    title: 'Advanced Arabic: Surah al-Hajj — The Fifth Pillar',
    objective: 'Study al-Hajj 26-37 — Ibrahim\'s call to Hajj, rites of Hajj, and animals of sacrifice.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Hajj 26-37 with harakat', 'Hajj vocabulary: tawaf, sa\'i, wuquf, qurbani', 'Grammar of divine command to Ibrahim: how many imperatives?'],
    quranBridge: {
      arabic: 'وَأَذِّن فِي النَّاسِ بِالْحَجِّ يَأْتُوكَ رِجَالًا وَعَلَى كُلِّ ضَامِرٍ',
      transliteration: "Wa-adhdhin fin-nasi bil-hajji ya-tuka rijalan waala kulli dhaamir",
      meaning: 'And proclaim to the people the Hajj; they will come to you on foot and on every lean camel.',
      note: 'أَذِّن (Form II imperative: proclaim loudly! — the call that echoed across time) — one divine command to Ibrahim generates all of history\'s hajj caravans.',
    },
  },
  {
    id: 'a165',
    stage: 'advanced',
    title: 'Advanced Milestone a165: Assessment',
    objective: 'Assessment covering advanced lessons a151-a164.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['60-question test', 'Read 350-word unseen passage and summarise in Arabic (100 words)', 'Write a 200-word analysis of one Quranic verse\'s grammar'],
    quranBridge: {
      arabic: 'إِنَّ مَعَ الْعُسْرِ يُسْرًا فَإِذَا فَرَغْتَ فَانصَبْ',
      transliteration: "Inna maal-usri yusra fa-idha faraghta fansab",
      meaning: 'Indeed with difficulty is ease. So when you are free, strive.',
      note: 'فَإِذَا فَرَغْتَ فَانصَبْ (when you finish + then strive) — assessment completed; strive immediately for the next task.',
    },
  },
  {
    id: 'a166',
    stage: 'advanced',
    title: 'Classical Arabic: The Art of Muwashshah Poetry',
    objective: 'Study muwashshah — the Andalusian strophic poetry form — its structure, metre, and kharja.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read a complete muwashshah', 'Identify matla, bayt, smt, qufl, and kharja', 'Grammar: how does Arabic strophic poetry handle rhyme schemes?'],
    quranBridge: {
      arabic: 'وَلَقَدْ آتَيْنَا دَاوُودَ وَسُلَيْمَانَ عِلْمًا',
      transliteration: "Walaqad atayna dawuda wasulaymana ilma",
      meaning: 'And We certainly gave David and Solomon knowledge.',
      note: 'عِلْمًا (indefinite: a kind of knowledge — not all knowledge, but specific divine gift) — Andulasian muwashshah is the echo of the knowledge given to prophets in al-Andalus.',
    },
  },
  {
    id: 'a167',
    stage: 'advanced',
    title: 'Advanced Grammar: Noun-Verb Agreement in Arabic',
    objective: 'Master the full agreement system in Arabic — gender, number, definition, and case agreement patterns.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Agreement exercise for broken plurals (treated as singular feminine)', 'Non-human plural as feminine singular: 10 examples', 'Subject-verb agreement in verbs preceding vs following their subjects'],
    quranBridge: {
      arabic: 'قَالَتِ الْأَعْرَابُ آمَنَّا',
      transliteration: "Qaalatil-aarabu amanna",
      meaning: 'The bedouins say: We have believed.',
      note: 'قَالَتِ الْأَعْرَابُ (verb + feminine — subject is plural masculine: bedouins) — قرينة: Arabic treats plural masculine (non-human would be singular feminine; human plural can take feminine verb when pre-posed).',
    },
  },
  {
    id: 'a168',
    stage: 'advanced',
    title: 'Surah al-Talaq: Detail, Precision, and Divine Compassion',
    objective: 'Study al-Talaq — the divorce surah — every verb and noun in its precise legal and compassionate framework.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Talaq 1-12 with harakat', 'Divorce terminology: idda, raj\'a, nafaqa, taqwa', 'Grammar: how many divine commands? How many divine promises?'],
    quranBridge: {
      arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
      transliteration: "Waman yattaqillaha yajal lahu makhrajaa wayarzuqhu min haythu la yahtasib",
      meaning: 'And whoever fears Allah — He will make for him a way out and provide for him from where he does not expect.',
      note: 'مِنْ حَيْثُ لَا يَحْتَسِبُ (from where he does not calculate) — the grammar of divine provision: it comes from the unexpected; human arithmetic is insufficient for divine rizq.',
    },
  },
  {
    id: 'a169',
    stage: 'advanced',
    title: 'Advanced Arabic: The Language of Tasawwuf Texts',
    objective: 'Study the specialised language of Sufi masters — al-Qushayri\'s Risala on spiritual states and stations.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read 250 words from al-Qushayri\'s Risala', '20 Sufi technical term definitions in Arabic', 'Grammar: how does mystical Arabic use abstraction differently?'],
    quranBridge: {
      arabic: 'هُوَ الَّذِي يُصَلِّي عَلَيْكُمْ وَمَلَائِكَتُهُ لِيُخْرِجَكُم مِّنَ الظُّلُمَاتِ إِلَى النُّورِ',
      transliteration: "Huwallladhi yusalli alaykum wamalaikatuhu liyukhrijkum minadh-dhulumati ilan-nur",
      meaning: 'It is He who confers blessings upon you, and His angels, to bring you out from darknesses into the light.',
      note: 'مِّنَ الظُّلُمَاتِ إِلَى النُّورِ (from plural darknesses → singular light) — Sufi grammar: darkness is multiple (sin, ignorance, ego), light is one.',
    },
  },
  {
    id: 'a170',
    stage: 'advanced',
    title: 'Advanced Milestone a170: Penultimate Sprint',
    objective: 'Assessment covering advanced lessons a166-a169 and full cumulative review.',
    duration: '100 min',
    challengeLevel: 'Expert',
    drills: ['80-question cumulative test', 'Unseen classical passage: 450 words — full analysis', 'Write 300-word essay on Arabic as a sacred language'],
    quranBridge: {
      arabic: 'وَآتَيْنَاهُ مِن كُلِّ شَيْءٍ سَبَبًا',
      transliteration: "Wa-ataynahu min kulli shay-in sababa",
      meaning: 'And We gave him from all things a means.',
      note: 'سَبَبًا (a means — indefinite: some access to every domain) — 170 advanced lessons: you have been given at least سَبَبًا into every domain of advanced Arabic.',
    },
  },
  {
    id: 'a171',
    stage: 'advanced',
    title: 'Surah al-Mumin (Ghafir): The Names of Allah',
    objective: 'Study al-Mumin 60-85 — the divine attributes, divine argument, and dua methodology.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Mumin 60-85 with harakat', 'Divine names appearing in this surah', 'Grammar: divine argumentation pattern — how does Allah prove His existence through nature?'],
    quranBridge: {
      arabic: 'وَقَالَ رَبُّكُمُ ادْعُونِي أَسْتَجِبْ لَكُمْ',
      transliteration: "Waqala rabbukumud-uni astajib lakum",
      meaning: 'And your Lord said: Call upon Me; I will respond to you.',
      note: 'ادْعُونِي (Form I imperative + 1st person suffix: call Me!) + أَسْتَجِبْ (jussive of response: I will answer) — the grammar of guaranteed dua: divine conditional with no condition on our part but asking.',
    },
  },
  {
    id: 'a172',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Root Families — Full Semantic Mapping',
    objective: 'For 10 root families, map ALL derivatives: nouns, verbs, adjectives, and their semantic range.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Root ع-ل-م: map all 50+ derivatives', 'Root ق-و-م: map all derivatives across forms', 'Root ك-ت-ب: map each derivative and find Quranic examples'],
    quranBridge: {
      arabic: 'وَمَا يَعْلَمُ جُنُودَ رَبِّكَ إِلَّا هُوَ',
      transliteration: "Wama yalamu junuda rabbika illa huw",
      meaning: 'And none knows the soldiers of your Lord except Him.',
      note: 'يَعْلَمُ (Form I: to know) — from ع-ل-م: عَلِمَ, عَالِمٌ, عَلِيمٌ, مَعْلُومٌ, عِلْمٌ, مَعْلَمٌ, عَلَّمَ, تَعَلَّمَ... — one root, limitless derivatives, each unlocking the Quran.',
    },
  },
  {
    id: 'a173',
    stage: 'advanced',
    title: 'Advanced Reading: Imam al-Nawawi\'s Riyadh al-Salihin',
    objective: 'Read 400 words from Riyadh al-Salihin — al-Nawawi\'s hadith collection on righteous character.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 400 words: chapter on truthfulness', 'Identify 3 hadith texts and their isnad in the reading', 'Grammar: al-Nawawi\'s chapter titles — analyse grammatical structure'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اتَّقُوا اللَّهَ وَكُونُوا مَعَ الصَّادِقِينَ',
      transliteration: "Ya ayyuhal-ladhina amanu tattaqullaha wakunu maaas-sadiqin",
      meaning: 'O you who believe, fear Allah and be with the truthful.',
      note: 'كُونُوا مَعَ الصَّادِقِينَ (Form I plural imperative: be with) — al-Nawawi opened Riyadh al-Salihin with this verse; the grammar of good company.',
    },
  },
  {
    id: 'a174',
    stage: 'advanced',
    title: 'Advanced Arabic: Comparative Study of Two Surahs',
    objective: 'Write a 300-word Arabic comparative analysis of two thematically related surahs.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Choose theme pair (e.g. al-Duha + al-Inshirah)', 'Map common vocabulary, structures, and themes', 'Write comparative analysis: 300 words in Arabic'],
    quranBridge: {
      arabic: 'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَى',
      transliteration: "Walasawfa yutika rabbuka fatarda",
      meaning: 'And your Lord will give you, and you will be satisfied.',
      note: 'وَلَسَوْفَ (lam of oath + sawfa future: He WILL give you — absolute guarantee) — al-Duha and al-Inshirah together form a grammar of divine comfort; compare them to understand the structure.',
    },
  },
  {
    id: 'a175',
    stage: 'advanced',
    title: 'Surah al-Shu\'ara: The Prophet\'s Grief and Divine Comfort',
    objective: 'Study al-Shu\'ara 1-10 and the narrative of Islamic prophets — how each prophet receives divine comfort.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Shu\'ara 1-10 with harakat', 'Prophetic grief vocabulary', 'Grammar: divine comfort verb patterns'],
    quranBridge: {
      arabic: 'لَعَلَّكَ بَاخِعٌ نَّفْسَكَ أَلَّا يَكُونُوا مُؤْمِنِينَ',
      transliteration: "Laallaka bakhiun nafsaka alla yakunu mu'minin",
      meaning: 'Perhaps you would kill yourself with grief because they will not believe.',
      note: 'بَاخِعٌ نَّفْسَكَ (active participle of destruction + ownself: consuming yourself) — the grammar of prophetic grief: the active participle describes what disbelief does to the Messenger.',
    },
  },
  {
    id: 'a176',
    stage: 'advanced',
    title: 'Advanced Arabic: Grammar of Hope and Fear in Quran',
    objective: 'Study how the Quran grammatically balances hope (رَجَاء/خَوْف) — the grammar of tawazun between both.',
    duration: '52 min',
    challengeLevel: 'Expert',
    drills: ['10 hope-grammar Quranic verses', '10 fear-grammar Quranic verses', 'What grammatical forms uniquely express each emotion?'],
    quranBridge: {
      arabic: 'وَيَدْعُونَنَا رَغَبًا وَرَهَبًا وَكَانُوا لَنَا خَاشِعِينَ',
      transliteration: "Wayadunana raghaban warahaban wakanu lana khashiin",
      meaning: 'They used to call upon Us with hope and fear, and they were humble before Us.',
      note: 'رَغَبًا وَرَهَبًا (accusatival pair: in hope AND fear — both simultaneously) — divine balance: the grammar requires both be present in the dua construction.',
    },
  },
  {
    id: 'a177',
    stage: 'advanced',
    title: 'Advanced Grammar: Particle لَوْ and لَوْلَا in Depth',
    objective: 'Master the two particles لَوْ (counterfactual) and لَوْلَا (wish/reproach/prevention) with all their usages.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['20 لَوْ examples: unreal past conditions', '20 لَوْلَا examples: wish, reproach, prevention types', 'How does لَوْلَا transform sentence meaning?'],
    quranBridge: {
      arabic: 'وَلَوْلَا فَضْلُ اللَّهِ عَلَيْكُمْ وَرَحْمَتُهُ مَا زَكَى مِنكُم مِّنْ أَحَدٍ أَبَدًا',
      transliteration: "Walawla fadhlullahi alaykum warahmatuhu ma zaka minkum min ahadin abada",
      meaning: 'And if not for the favour of Allah upon you and His mercy, not one of you would have been purified forever.',
      note: 'وَلَوْلَا (if it were not for: prevention clause) + مَا زَكَى...أَبَدًا (negation clause with abadan: never ever) — لَوْلَا of prevention reveals divine grace by showing its necessity.',
    },
  },
  {
    id: 'a178',
    stage: 'advanced',
    title: 'Surah al-Shura: Consultation and Community',
    objective: 'Study al-Shura 36-53 — divine revelation process, community consultation (shura), and cosmic scale.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Shura 36-53 with harakat', 'Revelation vocabulary: awha, tanzil, kitab', 'Grammar: how is divine communication described differently for prophets vs others?'],
    quranBridge: {
      arabic: 'وَأَمْرُهُمْ شُورَى بَيْنَهُمْ',
      transliteration: "Wa-amruhum shura baynahum",
      meaning: 'And their affairs are conducted by mutual consultation among themselves.',
      note: 'شُورَى (verbal noun: the act of mutual consultation — idiomatic noun as subject complement) — the grammar of Islamic governance: shura as definer of community authority.',
    },
  },
  {
    id: 'a179',
    stage: 'advanced',
    title: 'Advanced Arabic: Distinguishing Classical from Modern Vocabulary',
    objective: 'Study 40 vocabulary words where classical Quranic meaning differs from modern Arabic meaning.',
    duration: '45 min',
    challengeLevel: 'Expert',
    drills: ['40 semantic shift vocabulary flashcards', 'How has Arabic vocabulary changed over 1400 years?', 'Misreadings caused by applying modern meaning to classical text'],
    quranBridge: {
      arabic: 'إِنَّ الَّذِينَ آمَنُوا وَعَمِلُوا الصَّالِحَاتِ كَانَتْ لَهُمْ جَنَّاتُ الْفِرْدَوْسِ نُزُلًا',
      transliteration: "Inalladhina amanu waamilu s-salihati kanat lahum jannatul-firdawsi nuzula",
      meaning: 'Those who believe and do righteous deeds — for them will be the gardens of al-Firdaws as a host-reception.',
      note: 'نُزُلًا (host reception — classical: what is served to an honored guest; modern: hotel) — 14 centuries of semantic shift; reading the Quran requires classical meaning sensitivity.',
    },
  },
  {
    id: 'a180',
    stage: 'advanced',
    title: 'Advanced Milestone a180: Comprehensive Review',
    objective: 'Assessment covering the entire advanced track a171-a179.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['70-question comprehensive test', 'Unseen text: 400-word Islamic scholarly Arabic — translate and comment', 'Write a 250-word analysis of any root family\'s semantic range'],
    quranBridge: {
      arabic: 'مَّن ذَا الَّذِي يَشْفَعُ عِندَهُ إِلَّا بِإِذْنِهِ',
      transliteration: "Man dhalladhi yashfau indahu illa bi-idhnih",
      meaning: 'Who is it that can intercede with Him except by His permission?',
      note: 'مَن ذَا الَّذِي (rhetorical double-layered question: who IS the one who?) — a180 lesson: even grammar intercedes with Allah\'s permission; every lesson requires divine allowance.',
    },
  },
  {
    id: 'a181',
    stage: 'advanced',
    title: 'Surah al-Baqarah: Verse of the Throne (Deep Linguistic Analysis)',
    objective: 'Return to Ayat al-Kursi with advanced tools — analyse every clause, particle, and divine attribute grammar.',
    duration: '75 min',
    challengeLevel: 'Expert',
    drills: ['Full parse of 2:255 with all 10 divine statements', 'Identify each grammatical structure: nominal, verbal, relative', 'Write 250-word rhetorical analysis of Ayat al-Kursi'],
    quranBridge: {
      arabic: 'لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
      transliteration: "La ta-khudhuhu sinatun wala nawm",
      meaning: 'Neither drowsiness overtakes Him nor sleep.',
      note: 'سِنَةٌ (lighter sleep — drowsiness) before نَوْمٌ (deep sleep): the order is semantically precise; even the lighter form of diminished awareness is denied to Allah.',
    },
  },
  {
    id: 'a182',
    stage: 'advanced',
    title: 'Advanced Arabic: al-Quran\'s Address to Prophet Muhammad',
    objective: 'Study the 5 forms of divine address to the Prophet — يَا أَيُّهَا النَّبِيُّ, يَا أَيُّهَا الرَّسُولُ, وَمَا، قُلْ, and more.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['5 forms of divine address to the Prophet: 5 examples each', 'When does Allah use نَبِيُّ vs رَسُولُ?', 'Grammar of taltuf (divine gentleness) in address forms'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الرَّسُولُ بَلِّغْ مَا أُنزِلَ إِلَيْكَ مِن رَّبِّكَ',
      transliteration: "Ya ayyuhar-rasulu balligh ma unzila ilayka min rabbik",
      meaning: 'O Messenger, convey what was revealed to you from your Lord.',
      note: 'يَا أَيُّهَا الرَّسُولُ (addressing by function not by name) + بَلِّغْ (Form II intensive imperative: transmit completely) — the grammar of prophetic mission.',
    },
  },
  {
    id: 'a183',
    stage: 'advanced',
    title: 'Classical Grammar: Ibn Hisham\'s Mughni al-Labib',
    objective: 'Read a selection from Ibn Hisham\'s Mughni al-Labib — the most comprehensive Arabic particle reference.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read Ibn Hisham\'s entry on particle أَن (all its uses)', 'Identify how many distinct uses Ibn Hisham catalogues for one particle', 'Test yourself: match 10 أَن examples to their usage category'],
    quranBridge: {
      arabic: 'أَن تَقُومُوا لِلَّهِ مَثْنَى وَفُرَادَى',
      transliteration: "An taqumu lillahi mathna wafurada",
      meaning: 'That you stand for Allah, individually and in pairs.',
      note: 'أَن تَقُومُوا (an + subjunctive: that you stand — an here is for content of command) — Ibn Hisham\'s Mughni catalogues 14+ uses of أَن; mastering them unlocks Quranic syntax.',
    },
  },
  {
    id: 'a184',
    stage: 'advanced',
    title: 'Advanced Arabic: The Language of Islamic History (Tarikh)',
    objective: 'Study the specialised vocabulary of classical Islamic history writing — its style, vocabulary, and patterns.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['30 historical writing vocabulary flashcards', 'Read 250 words from al-Tabari\'s Tarikh', 'How does historical Arabic prose differ from Quranic Arabic?'],
    quranBridge: {
      arabic: 'قَدْ خَلَتْ مِن قَبْلِكُمْ سُنَنٌ فَسِيرُوا فِي الْأَرْضِ',
      transliteration: "Qad khalat min qablikum sunanun fasiru fil-ard",
      meaning: 'Patterns of conduct have already passed before you, so travel through the earth.',
      note: 'سُنَنٌ (plural of sunna: patterns/ways) + خَلَتْ (passed — Form I perfect) — Islamic history writing is the science of recording these sunan; al-Tabari obeyed this command.',
    },
  },
  {
    id: 'a185',
    stage: 'advanced',
    title: 'Advanced Grammar: Prepositional Phrase Functions',
    objective: 'Master the full range of prepositional phrase functions in Arabic — adverbial, adjectival, predicative.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['20 PP as adverbial modifier examples', '20 PP as adjectival modifier examples', '10 PP as predicate (predicative PP)'],
    quranBridge: {
      arabic: 'وَلِلَّهِ الْمَشْرِقُ وَالْمَغْرِبُ فَأَيْنَمَا تُوَلُّوا فَثَمَّ وَجْهُ اللَّهِ',
      transliteration: "Walillahi l-mashriqu wal-maghribu fa-aynamaa tuwalluu fathamma wajhullah",
      meaning: 'To Allah belongs the east and the west. So wherever you turn, there is the face of Allah.',
      note: 'فَثَمَّ وَجْهُ اللَّهِ (there is the face of Allah — locative PP as predicate) — the grammar of divine omnipresence: wherever = the PP, wajhullah = the predicate.',
    },
  },
  {
    id: 'a186',
    stage: 'advanced',
    title: 'Surah Maryam: Arabic Stylistics',
    objective: 'Advanced stylistic analysis of Surah Maryam — its sound patterns, rhyme, and narrative voice.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Read Maryam 1-98 and track the rhyme scheme', 'Sound analysis: identify nasal sounds (ن, م) and long vowels in the surah', 'How does the sound pattern reinforce the meaning?'],
    quranBridge: {
      arabic: 'يَا يَحْيَى خُذِ الْكِتَابَ بِقُوَّةٍ',
      transliteration: "Ya Yahya khudh-il-kitaba biquwwa",
      meaning: 'O Yahya, take the Scripture with strength.',
      note: 'بِقُوَّةٍ (with strength — indefinite instrument) — Maryam\'s name and Yahya\'s name both rhyme with the surah\'s long-a ending pattern; the sound system harmonises with the meaning.',
    },
  },
  {
    id: 'a187',
    stage: 'advanced',
    title: 'Advanced Arabic Grammar: Elative Comparatives in Quranic Discourse',
    objective: 'Study elative/comparative forms (أَفْعَل pattern) across the full range of their Quranic usage.',
    duration: '52 min',
    challengeLevel: 'Expert',
    drills: ['30 Quranic elative examples with context analysis', 'Superlative vs comparative functions of أَفْعَل', 'Generate elative forms for 20 common Quranic adjectives'],
    quranBridge: {
      arabic: 'اللَّهُ أَكْبَرُ',
      transliteration: "Allahu akbar",
      meaning: 'Allah is Greater / Allah is the Greatest.',
      note: 'أَكْبَرُ (elative: greater — comparative or superlative?) — Allahu akbar grammatically has two readings; both are true; the ambiguity is intentional gift of Arabic.',
    },
  },
  {
    id: 'a188',
    stage: 'advanced',
    title: 'Advanced Arabic: Oral Recitation and Mnemonic Techniques',
    objective: 'Apply advanced mnemonic techniques to memorise 20 complex Arabic grammar rules and 50 vocabulary items.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['20 grammar rules: create memory devices', '50 vocabulary items: create visual or auditory mnemonics', 'Test recall after 24 hours: revisit and check'],
    quranBridge: {
      arabic: 'سَنُقْرِئُكَ فَلَا تَنسَى',
      transliteration: "Sanaqriuka fala tansa",
      meaning: 'We will make you recite, and you will not forget.',
      note: 'سَنُقْرِئُكَ (Form IV: We will cause you to recite) + فَلَا تَنسَى (so you will not forget) — divine memory support: for us, the grammar mnemonics play this role.',
    },
  },
  {
    id: 'a189',
    stage: 'advanced',
    title: 'Surah al-Baqarah: Verses of Fasting',
    objective: 'Study al-Baqarah 183-187 — the fasting verses, their layered commands, permissions, and spiritual purposes.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Baqarah 183-187 with harakat', 'Map each command: obligation, exception, permission, goal', 'Grammar: كُتِبَ (passive: was prescribed) — why passive?'],
    quranBridge: {
      arabic: 'كُتِبَ عَلَيْكُمُ الصِّيَامُ كَمَا كُتِبَ عَلَى الَّذِينَ مِن قَبْلِكُمْ',
      transliteration: "Kutiba alaykum as-siyamu kama kutiba ala lladhina min qablikum",
      meaning: 'Fasting has been prescribed for you as it was prescribed for those before you.',
      note: 'كُتِبَ (passive: prescribed — the Agent of prescription is left implicit, known to be Allah) — the passive construction of divine obligation: the command needs no named Subject; Allah is assumed.',
    },
  },
  {
    id: 'a190',
    stage: 'advanced',
    title: 'Advanced Milestone a190: Advanced Penultimate Check',
    objective: 'Assessment for advanced lessons a181-a189.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['70-question test', 'Unseen passage: 500 words — read, summarise (150 words in Arabic), and parse 20 words', 'Write a 300-word classical Arabic khutba outline'],
    quranBridge: {
      arabic: 'وَلَا تَيْأَسُوا مِن رَّوْحِ اللَّهِ',
      transliteration: "Wala tay-asu min rawhi Allahi",
      meaning: 'And do not despair of Allah\'s mercy.',
      note: 'مِن رَّوْحِ اللَّهِ (from the spirit/mercy of Allah — rawh: aliveness of hope) — 190 lessons in: do not despair; 140 more are full of divine rawh.',
    },
  },
  {
    id: 'a191',
    stage: 'advanced',
    title: 'Advanced Arabic: Discussing Science and Islam',
    objective: 'Develop Arabic vocabulary for discussing the relationship between Islamic scholarship and modern science.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['30 science-in-Islam vocabulary flashcards', 'Read 200 words of Arabic on this topic', 'Write a 150-word Arabic position statement on Islam and science'],
    quranBridge: {
      arabic: 'وَسَخَّرَ لَكُم مَّا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ جَمِيعًا مِّنْهُ',
      transliteration: "Wasakhkhara lakum ma fis-samawati wama fil-ardi jamian minhu",
      meaning: 'And He has subjected to you whatever is in the heavens and whatever is on earth — all from Him.',
      note: 'جَمِيعًا مِّنْهُ (all together — totality adverb — from Him) — science is the subjugation of the cosmos which Allah made for humanity; its study is stewardship.',
    },
  },
  {
    id: 'a192',
    stage: 'advanced',
    title: 'Surah al-Baqarah: Complete Parsing Exercise',
    objective: 'Parse every single word of al-Baqarah 1-7 (the opening) — full morphological and syntactic analysis.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Parse al-Baqarah 1-7 word by word (70+ words)', 'Identify every grammatical structure type', 'Write one insight per verse: what grammar teaches about meaning'],
    quranBridge: {
      arabic: 'ذَلِكَ الْكِتَابُ لَا رَيْبَ فِيهِ هُدًى لِّلْمُتَّقِينَ',
      transliteration: "Dhalikal-kitabu la rayba fihi hudan lil-muttaqin",
      meaning: 'This is the Book — no doubt in it — a guidance for the God-fearing.',
      note: 'ذَلِكَ (distal demonstrative: THAT book — pointing to an exalted, distant object) + لَا رَيْبَ فِيهِ (absolute negation: not a trace of doubt) — al-Baqarah 2: first statement about the Quran is grammatically absolute.',
    },
  },
  {
    id: 'a193',
    stage: 'advanced',
    title: 'Advanced Arabic: al-Quran on Family',
    objective: 'Study the complete Quranic vocabulary and grammar of family relationships.',
    duration: '52 min',
    challengeLevel: 'Expert',
    drills: ['30 family vocabulary flashcards from the Quran', 'Grammar: how does the Quran balance rights between family members?', 'Parse al-Baqarah 228 on marital rights'],
    quranBridge: {
      arabic: 'وَلَهُنَّ مِثْلُ الَّذِي عَلَيْهِنَّ بِالْمَعْرُوفِ',
      transliteration: "Walahunna mithlu lladhi alayhinna bilmaaruf",
      meaning: 'And for them is similar to what is expected of them, according to what is right.',
      note: 'مِثْلُ الَّذِي (equivalent to that which — perfect equality of rights formula) — one sentence establishes gender equality in rights through mirror grammar.',
    },
  },
  {
    id: 'a194',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Derivational Network',
    objective: 'Study the complete derivational network of Arabic — how words are derived from roots through stem patterns.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Derivational chain exercise for 5 roots: noun → verb → adjective → masdar → active participle → passive participle', 'Identify what is "borrowed" between the five levels', 'Test the derivational network on 10 Quranic words'],
    quranBridge: {
      arabic: 'وَاللَّهُ خَلَقَكُمْ وَمَا تَعْمَلُونَ',
      transliteration: "Wallahu khalaqakum wama tamalun",
      meaning: 'Allah created you and what you do.',
      note: 'خَلَقَكُمْ (Form I: He created you) — خَلَقَ creates خَالِقٌ, مَخْلُوقٌ, خَلْقٌ, مَخْلَقٌ, خَلَّقَ... The derivational network of creation vocabulary.',
    },
  },
  {
    id: 'a195',
    stage: 'advanced',
    title: 'Surah al-Kahf: The Four Stories and Their Lesson',
    objective: 'Read al-Kahf in full (110 verses) and identify the four stories\' structural parallel and central lesson.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Kahf 1-110 with harakat (at pace)', 'Identify the four stories: transitions and connecting themes', 'Central lesson connecting all four: state in one Arabic sentence'],
    quranBridge: {
      arabic: 'إِنَّا جَعَلْنَا مَا عَلَى الْأَرْضِ زِينَةً لَّهَا لِنَبْلُوَهُمْ أَيُّهُمْ أَحْسَنُ عَمَلًا',
      transliteration: "Inna jaalna ma alal-ardi zinatan laha linabluwahum ayyuhum ahsanu amala",
      meaning: 'We made what is on earth ornament for it to test them as to which of them is best in deed.',
      note: 'زِينَةً لَّهَا لِنَبْلُوَهُمْ (it is ornament FOR a purpose — purpose clause with lam) — every story in al-Kahf tests this: who sees the dunya as ornament vs goal?',
    },
  },
  {
    id: 'a196',
    stage: 'advanced',
    title: 'Advanced Arabic: Comparing Four Major Tafsirs',
    objective: 'Read the same verse in four tafsir works and compare: al-Tabari, Ibn Kathir, al-Razi, al-Qurtubi.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Choose one verse; read 4 tafsirs\' entries', 'What is unique in each tafsir\'s methodology?', 'Write 200 words comparing the four on one specific grammar point'],
    quranBridge: {
      arabic: 'وَاللَّهُ يَهْدِي مَن يَشَاءُ إِلَى صِرَاطٍ مُّسْتَقِيمٍ',
      transliteration: "Wallahu yahdi man yasha-u ila siratin mustaquim",
      meaning: 'And Allah guides whom He wills to a straight path.',
      note: 'إِلَى صِرَاطٍ مُّسْتَقِيمٍ (toward an upright path — indefinite: any straight path, not a specific one?) — four tafsirs may give four different readings of this indefinite noun.',
    },
  },
  {
    id: 'a197',
    stage: 'advanced',
    title: 'Advanced Arabic: Writing a Research Abstract',
    objective: 'Write a 150-word Arabic academic abstract for a mock research paper on an Islamic topic.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Study Arabic research abstract structure', 'Draft 150-word abstract: topic, methodology, findings, conclusion', 'Peer review format: exchange and comment on grammar'],
    quranBridge: {
      arabic: 'وَعَلَّمَهُ مِن لَّدُنكَ عِلْمًا',
      transliteration: "Wa-allamahu min ladunka ilma",
      meaning: 'And You have taught him knowledge from Yourself.',
      note: 'مِن لَّدُنكَ (from directly with you — la-dun: intimate spatial proximity) — academic Arabic writing: the knowledge you write should ultimately trace back to مِن لَّدُنه.',
    },
  },
  {
    id: 'a198',
    stage: 'advanced',
    title: 'Advanced Grammar: The Semantics of Arabic Prepositions',
    objective: 'Study the full semantic range of the 5 major Arabic prepositions — ب, ف, ل, من, إلى, في, على, عن.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Each preposition: 5 distinct meanings (40 total)', 'How does context disambiguate preposition meaning?', 'Parse all prepositions in al-Fatiha with meaning'],
    quranBridge: {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      transliteration: "Bismillahir-rahmanir-rahim",
      meaning: 'In the name of Allah, the Most Gracious, the Most Merciful.',
      note: 'بِ (with/in/by the name) — the first preposition of the Quran carries 3+ possible meanings in this one use: in, by means of, with the assistance of. Arabic begins with a preposition.',
    },
  },
  {
    id: 'a199',
    stage: 'advanced',
    title: 'Quran Deep Dive: Surah al-Mumtahana — Testing Loyalty',
    objective: 'Study al-Mumtahana — testing, loyalty to Allah, treatment of Muslim women from enemy lands.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Mumtahana 1-13 with harakat', 'Bayah (oath of allegiance) vocabulary', 'Grammar: conditional structures of testing and approval'],
    quranBridge: {
      arabic: 'لَا يَنْهَاكُمُ اللَّهُ عَنِ الَّذِينَ لَمْ يُقَاتِلُوكُمْ فِي الدِّينِ',
      transliteration: "La yanhaakumullahu anilladhina lam yuqatilukum fid-din",
      meaning: 'Allah does not forbid you from those who did not fight you in religion.',
      note: 'لَا يَنْهَاكُمُ (present tense negative: Allah is NOT forbidding you — active divine permission) — Quranic grammar of inter-faith kindness: the present tense permission is ongoing.',
    },
  },
  {
    id: 'a200',
    stage: 'advanced',
    title: 'Advanced Milestone a200: Double Century Achievement',
    objective: 'Comprehensive 100-question test celebrating 200 advanced lessons completed.',
    duration: '120 min',
    challengeLevel: 'Expert',
    drills: ['100-question celebration test', 'Full surah parse: choose any surah 20-40 verses', 'Write a 350-word Arabic essay: "Arabic is the language of the heart"'],
    quranBridge: {
      arabic: 'وَالَّذِينَ جَاهَدُوا فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا',
      transliteration: "Walladhina jahadu fina lanahdiyannahum subulana",
      meaning: 'And those who strive for Our cause — We will surely guide them to Our ways.',
      note: 'جَاهَدُوا فِينَا (they strived for Us — seeking Us as the لِ-purpose) — 200 advanced lessons of struggle: the divine guarantee of guidance has been activated.',
    },
  },
  {
    id: 'a201',
    stage: 'advanced',
    title: 'Surah Sad: David\'s Submission and Divine Forgiveness',
    objective: 'Study Surah Sad 21-35 — David\'s trial, his prostration of repentance, and divine forgiveness.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read Surah Sad 21-35 with harakat', 'Divine forgiveness vocabulary', 'Grammar: prostration command — how does the Quran describe David\'s sujud?'],
    quranBridge: {
      arabic: 'فَاسْتَغْفَرَ رَبَّهُ وَخَرَّ رَاكِعًا وَأَنَابَ',
      transliteration: "Fastaghhfara rabbahu wakharra rakian wa-anab",
      meaning: 'So he sought forgiveness of his Lord and fell down bowing and repented.',
      note: 'وَخَرَّ رَاكِعًا (fell down bowing — hal: in a state of bowing) — David\'s three-action repentance: seek forgiveness, physically bow, return to Allah. Grammar of complete tawbah.',
    },
  },
  {
    id: 'a202',
    stage: 'advanced',
    title: 'Advanced Arabic: News Commentary Draft',
    objective: 'Write a 200-word Arabic commentary on a current Islamic world event, using formal news Arabic.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['News Arabic vocabulary: event, response, significance', 'Write 200-word formal Arabic commentary', 'Edit for grammar and formal register'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّى يُغَيِّرُوا مَا بِأَنفُسِهِمْ',
      transliteration: "Innallaha la yughayyiru ma biqawmin hatta yughayyiru ma bi-anfusihim",
      meaning: 'Indeed, Allah will not change the condition of a people until they change what is within themselves.',
      note: 'حَتَّى يُغَيِّرُوا (until they change — Form II of change: transformative, not minor adjustment) — news commentary must track external change against this internal-change standard.',
    },
  },
  {
    id: 'a203',
    stage: 'advanced',
    title: 'Advanced Grammar: Nominal vs Verbal Clause Selection',
    objective: 'Study when Arabic speakers choose nominal vs verbal clause — pragmatic and semantic factors.',
    duration: '48 min',
    challengeLevel: 'Expert',
    drills: ['20 nominal clause examples + reason for choice', '20 verbal clause examples + reason', 'Convert verbal to nominal and vice versa: what changes in meaning?'],
    quranBridge: {
      arabic: 'وَاللَّهُ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
      transliteration: "Wallahu ala kulli shay-in qadir",
      meaning: 'And Allah has power over all things.',
      note: 'اللَّهُ قَدِيرٌ (nominal clause: permanent attribute) vs يَقْدِرُ (verbal: acts of power) — nominals in Arabic assert permanent truth; verbals describe specific occurrences.',
    },
  },
  {
    id: 'a204',
    stage: 'advanced',
    title: 'Classical Arabic: Poetry of Abu Nuwas',
    objective: 'Read and analyse the classical poetry of Abu Nuwas — his linguistic brilliance and moral controversies.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Read 15 lines of Abu Nuwas\'s zuhdiyat (ascetic poetry)', 'Identify grammar structures: verb-heavy vs noun-heavy', 'Contrast with Quran\'s own poetic register'],
    quranBridge: {
      arabic: 'تَبَارَكَ اسْمُ رَبِّكَ ذِي الْجَلَالِ وَالْإِكْرَامِ',
      transliteration: "Tabarakas-mu rabbika dhil-jalali wal-ikram",
      meaning: 'Blessed is the name of your Lord, Owner of Majesty and Honor.',
      note: 'ذِي الْجَلَالِ وَالْإِكْرَامِ (genitive of description: possessor of majesty and generosity) — Arabic poetry always humbles itself before this majesty, even Abu Nuwas in his best moments.',
    },
  },
  {
    id: 'a205',
    stage: 'advanced',
    title: 'Surah al-Dukhaan: The Smoke and Judgment Day',
    objective: 'Study al-Dukhaan in full — Pharaoh\'s destruction, Judgment Day scenarios, and the smoke sign.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Dukhaan 1-59 with harakat', 'Judgment Day vocabulary from this surah', 'Grammar: irony in the style of addressing disbelievers'],
    quranBridge: {
      arabic: 'فَارْتَقِبْ يَوْمَ تَأْتِي السَّمَاءُ بِدُخَانٍ مُّبِينٍ',
      transliteration: "Fartaqib yawma ta-tis-sama-u bidukhânin mubin",
      meaning: 'Then watch for the day when the sky will bring a visible smoke.',
      note: 'فَارْتَقِبْ (Form VIII imperative: watch intently, be on alert) + بِدُخَانٍ مُّبِينٍ (with a clear visible smoke) — Form VIII watching: deeply, purposefully watching for signs.',
    },
  },
  {
    id: 'a206',
    stage: 'advanced',
    title: 'Advanced Arabic: Verb Form Analysis in the Quran',
    objective: 'Comprehensive study of which verb forms dominate in which contexts in the Quran.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Survey: which verb forms appear most in stories vs commands vs arguments?', '50 Quranic verbs — identify form and context', 'Why does al-Baqarah legal section use passive voice so heavily?'],
    quranBridge: {
      arabic: 'وَأَقِيمُوا الصَّلَاةَ وَآتُوا الزَّكَاةَ',
      transliteration: "Wa-aqimus-salata wa-atu az-zakat",
      meaning: 'And establish prayer and give zakah.',
      note: 'أَقِيمُوا (Form IV imperative: establish firmly — not just pray) + آتُوا (Form IV: bring/give) — Form IV commands: not just doing but intensified, purposeful establishment.',
    },
  },
  {
    id: 'a207',
    stage: 'advanced',
    title: 'Advanced Arabic: Speaking About the Hereafter',
    objective: 'Develop fluency in discussing eschatology in Arabic — Judgment Day, Paradise, Hell, intercession.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['50 eschatology vocabulary flashcards', '5 Arabic descriptions of Paradise and Hell', 'Oral: describe Judgment Day in 2 minutes of Arabic speech'],
    quranBridge: {
      arabic: 'يَوْمَ لَا يَنفَعُ مَالٌ وَلَا بَنُونَ إِلَّا مَنْ أَتَى اللَّهَ بِقَلْبٍ سَلِيمٍ',
      transliteration: "Yawma la yanfau malun wala banuna illa man ata Allaha biqalbin salim",
      meaning: 'The day when wealth and children will not avail — except one who comes to Allah with a sound heart.',
      note: 'بِقَلْبٍ سَلِيمٍ (with a sound heart — instrument of approach to Allah) — the grammar of salvation: only one instrument works on Judgment Day.',
    },
  },
  {
    id: 'a208',
    stage: 'advanced',
    title: 'Classical Arabic Rhetoric: al-Abd al-Qahir al-Jurjani',
    objective: 'Study al-Jurjani\'s Asrar al-Balagha — the secrets of eloquence — his theory of linguistic meaning.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 250 words of Asrar al-Balagha', 'Al-Jurjani\'s system: what makes speech meaningful vs merely grammatical?', 'Write 150 words applying al-Jurjani\'s insights to one Quranic verse'],
    quranBridge: {
      arabic: 'وَإِنَّهُ لَتَنزِيلُ رَبِّ الْعَالَمِينَ نَزَلَ بِهِ الرُّوحُ الْأَمِينُ',
      transliteration: "Wa-innahu latanzilu rabbil-alamin nazala bil-ruhul-amin",
      meaning: 'And indeed it is the revelation of the Lord of the worlds, descended with the Trustworthy Spirit.',
      note: 'لَتَنزِيلُ (lam of emphasis + masdar as predicate) — al-Jurjani would say: the lam and masdar together are not grammatical decoration but meaning intensifiers.',
    },
  },
  {
    id: 'a209',
    stage: 'advanced',
    title: 'Advanced Arabic: Islamic Ethics — al-Ghazali\'s Eight Vices',
    objective: 'Study al-Ghazali\'s vocabulary of spiritual diseases in Arabic: riya, kibr, hasad, bukhul, and others.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['8 vice vocabulary flashcards with Arabic definition', 'Grammar of advice against vices: how does al-Ghazali warn?', 'Write a 150-word spiritual advice in Arabic using this vocabulary'],
    quranBridge: {
      arabic: 'وَلَا تَمْشِ فِي الْأَرْضِ مَرَحًا إِنَّكَ لَن تَخْرِقَ الْأَرْضَ وَلَن تَبْلُغَ الْجِبَالَ طُولًا',
      transliteration: "Wala tamshi fil-ardi marahan innaka lan takhriqa l-arda walan tablughal-jibala tula",
      meaning: 'And do not walk upon the earth exultantly. For you will never break through the earth nor will you reach the mountains in height.',
      note: 'لَن تَخْرِقَ...وَلَن تَبْلُغَ (dual absolute negation with lan: emphasis of impossibility) — arrogance is comic in Arabic grammar: the Quran refutes kibr with physics.',
    },
  },
  {
    id: 'a210',
    stage: 'advanced',
    title: 'Advanced Milestone a210: Triple Assessment',
    objective: 'Assessment for a201-a209.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['70-question skills test', 'Oral examination: 5-minute Arabic speech on a classical Arabic text', 'Write 300-word Arabic essay on your scholarly Arabic journey'],
    quranBridge: {
      arabic: 'فَإِذَا فَرَغْتَ فَانصَبْ وَإِلَى رَبِّكَ فَارْغَبْ',
      transliteration: "Fa-idha faraghta fansab wa-ila rabbika farghab",
      meaning: 'So when you have finished a task, strive for another, and to your Lord direct your desire.',
      note: 'فَإِذَا فَرَغْتَ فَانصَبْ (when free, strive — asyndeton: no rest between completion and next effort) — a210: assessment done; فَانصَبْ immediately.',
    },
  },
  {
    id: 'a211',
    stage: 'advanced',
    title: 'Surah Luqman: Wisdom and Parenting',
    objective: 'Study Luqman 12-19 — the wisdom of Luqman, his parenting advice, and the grammar of continuous exhortation.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read Luqman 12-19 with harakat', 'Parenting and wisdom vocabulary', 'Grammar: Luqman\'s advice style — وَإِذْ قَالَ لُقْمَانُ لِابْنِهِ (embedded narrative)'],
    quranBridge: {
      arabic: 'يَا بُنَيَّ لَا تُشْرِكْ بِاللَّهِ إِنَّ الشِّرْكَ لَظُلْمٌ عَظِيمٌ',
      transliteration: "Ya bunayya la tushrik billahi innash-shirka ladhulmun azim",
      meaning: 'O my dear son, do not associate anything with Allah. Indeed, associating is a great wrong.',
      note: 'يَا بُنَيَّ (diminutive of ibn: dear little son — affection + diminutive morphology) — Arabic parenting grammar: the diminutive softens the warning; the lam of emphasis then delivers its weight.',
    },
  },
  {
    id: 'a212',
    stage: 'advanced',
    title: 'Advanced Arabic: Mastering Quranic Vocabulary Frequency',
    objective: 'Study the 100 most frequent Quranic words — after learning these, you know 50% of all Quranic words by token count.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['100 most frequent Quranic words flashcards', 'How many of these 100 do you know perfectly?', 'Focus on 10 you don\'t know and memorise them'],
    quranBridge: {
      arabic: 'اللَّهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
      transliteration: "Allahu la ilaha illa huwal-hayul-qayyum",
      meaning: 'Allah — there is no deity except Him, the Ever-Living, the Sustainer of all existence.',
      note: 'الْحَيُّ الْقَيُّومُ (two most powerful of 99 names — scholars say) — الْحَيُّ from ح-ي-ي (life), الْقَيُّومُ from ق-و-م (standing/maintaining) — both among top 100 most frequent Quranic root families.',
    },
  },
  {
    id: 'a213',
    stage: 'advanced',
    title: 'Advanced Arabic: The Particle إِنَّ and Its Usage',
    objective: 'Deep study of إِنَّ — emphasis particle — its full range of meanings and grammatical effects.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['30 إِنَّ examples: what precise emphasis does it add?', 'كَأَنَّ, لَعَلَّ, لَيْتَ, لَكِنَّ, أَنَّ — all sisters of إِنَّ', 'Grammar: what does إِنَّ do to the subject case?'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ مَعَ الصَّابِرِينَ',
      transliteration: "Innallaha maas-sabirin",
      meaning: 'Indeed, Allah is with the patient.',
      note: 'إِنَّ (emphatic particle: switches subject to accusative) — the grammar of divine support: the emphasis particle guarantees the clause is a reassurance more than information.',
    },
  },
  {
    id: 'a214',
    stage: 'advanced',
    title: 'Surah al-Nahl: The Bee and Arabic Natural Vocabulary',
    objective: 'Study al-Nahl (The Bee) 65-79: natural phenomena vocabulary and the argument from nature (dalil fitri).',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Nahl 65-79 with harakat', 'Natural phenomena vocabulary from this passage', 'Grammar: divine instruction to the bee — awhaa ila an-nahl'],
    quranBridge: {
      arabic: 'وَأَوْحَى رَبُّكَ إِلَى النَّحْلِ أَنِ اتَّخِذِي مِنَ الْجِبَالِ بُيُوتًا',
      transliteration: "Wa-awha rabbuka ilan-nahli anittakhidhi minal-jibali buyuta",
      meaning: 'And your Lord inspired the bee: take abodes among the mountains.',
      note: 'أَوْحَى (Form IV: inspired — to the bee!) — instinct in Arabic is divine inspiration; the grammar grants the bee feminine singular imperative commands from Allah.',
    },
  },
  {
    id: 'a215',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Intonation and Prosody',
    objective: 'Study how Arabic pausal forms (waqf), emphasis, and intonation affect meaning in oral recitation.',
    duration: '48 min',
    challengeLevel: 'Expert',
    drills: ['10 حَ-شَ-رَ tajweed principles affecting grammar', '5 verses where waqf changes meaning', 'Practice reading with and without pausal forms'],
    quranBridge: {
      arabic: 'قَالَ رَبِّ إِنِّي وَهَنَ الْعَظْمُ مِنِّي وَاشْتَعَلَ الرَّأْسُ شَيْبًا',
      transliteration: "Qala rabbi inni wahnal-azmu minni wash-taalr-rasu shayba",
      meaning: 'He said: My Lord, indeed my bones have weakened and my head has been lit with grey hair.',
      note: 'وَاشْتَعَلَ الرَّأْسُ شَيْبًا (Form VIII: the head blazed with white hair — tamyiz/accusative of specification) — one of the most linguistically praised metaphors in Arabic; Zakariyya\'s age described as fire.',
    },
  },
  {
    id: 'a216',
    stage: 'advanced',
    title: 'Surah al-Ahqaf: The Dunes and the Jinn',
    objective: 'Study al-Ahqaf — the end of the Hawamim series — jinn listening to the Quran, gratitude to parents.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Ahqaf 1-35 with harakat', 'Jinn vocabulary and description', 'Grammar: the jinn\'s speech in the Quran (reported speech structures)'],
    quranBridge: {
      arabic: 'إِنَّا سَمِعْنَا قُرْآنًا عَجَبًا يَهْدِي إِلَى الرُّشْدِ فَآمَنَّا بِهِ',
      transliteration: "Inna sami-na qur-anan ajaban yahdi ila r-rushdi fa-amanna bih",
      meaning: 'Indeed, we have heard a wondrous Quran that guides to right conduct, so we have believed in it.',
      note: 'قُرْآنًا عَجَبًا (a wondrous Quran — adjective after indefinite noun: appositive) — the jinn\'s Arabic testimony: عَجَبًا is the grammar of first encounter with the Quran.',
    },
  },
  {
    id: 'a217',
    stage: 'advanced',
    title: 'Advanced Arabic: Formal Public Speaking Preparation',
    objective: 'Prepare and deliver a 5-minute formal Arabic speech on an Islamic topic.',
    duration: '75 min',
    challengeLevel: 'Expert',
    drills: ['Structure a 5-minute speech: intro, 3 points, conclusion', 'Arabic public oratory style: opening formulas, transition phrases, closing duas', 'Deliver 5-minute speech without notes'],
    quranBridge: {
      arabic: 'الرَّحْمَنُ عَلَّمَ الْقُرْآنَ خَلَقَ الْإِنسَانَ عَلَّمَهُ الْبَيَانَ',
      transliteration: "Ar-rahmanu allamal-qu-rana khalaql-insana allamahul-bayan",
      meaning: 'The Most Merciful taught the Quran, created man, and taught him eloquence.',
      note: 'عَلَّمَهُ الْبَيَانَ (taught him eloquent speech — Form II: intensive teaching of communication) — divine teaching of arabic speech (bayan) is the same divine act as teaching the Quran.',
    },
  },
  {
    id: 'a218',
    stage: 'advanced',
    title: 'Surah al-Zukhruf: Golden Ornaments and Arrogance',
    objective: 'Study al-Zukhruf — worldly ornaments, arrogance of Pharaoh, Ibrahim\'s rejection of his people\'s idolatry.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Zukhruf 1-55 with harakat', 'Arrogance vocabulary from the Quran', 'Grammar: Pharaoh\'s self-glorification — أَلَيْسَ لِي مُلْكُ مِصْرَ'],
    quranBridge: {
      arabic: 'أَلَيْسَ لِي مُلْكُ مِصْرَ وَهَذِهِ الْأَنْهَارُ تَجْرِي مِن تَحْتِي',
      transliteration: "A-laysa li mulku Misra wahâdhihil-anharu tajri min tahti",
      meaning: 'Is not the kingdom of Egypt mine, with these rivers flowing beneath me?',
      note: 'أَلَيْسَ (negative interrogative: Is it not so? — seeking affirmation) — Pharaoh\'s rhetorical grammar: he uses a negative question to force admissions of his own greatness.',
    },
  },
  {
    id: 'a219',
    stage: 'advanced',
    title: 'Advanced Arabic: Classical Arabic Grammar Commentary (Sharh)',
    objective: 'Read a classical sharh (commentary) on an Alfiyya verse — study the commentary genre.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read Ibn Aqil\'s sharh on one verse of Ibn Malik\'s Alfiyya', 'How does a sharh work? Its structure and purpose', 'Write a 100-word mini sharh on one Arabic grammar rule'],
    quranBridge: {
      arabic: 'كِتَابٌ أَنزَلْنَاهُ إِلَيْكَ مُبَارَكٌ لِّيَدَّبَّرُوا آيَاتِهِ',
      transliteration: "Kitabun anzalnahu ilayka mubarakun liyadabbaru ayatih",
      meaning: 'A Book We have sent down to you, blessed, so that they may ponder its verses.',
      note: 'لِّيَدَّبَّرُوا (Form V subjunctive: so that they pon-der deeply — Form V intensifies the pondering) — sharh is the grammar of يَدَّبَّرُوا: commentary is pondering in writing.',
    },
  },
  {
    id: 'a220',
    stage: 'advanced',
    title: 'Advanced Milestone a220: Midway Mastery Check',
    objective: 'Comprehensive assessment for a211-a219.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['70-question grammar and vocabulary test', 'Oral component: discuss any advanced Arabic text for 5 minutes', 'Problem-solving: correct 20 errors in a classical Arabic paragraph'],
    quranBridge: {
      arabic: 'وَنَزَّلْنَا عَلَيْكَ الْكِتَابَ تِبْيَانًا لِّكُلِّ شَيْءٍ',
      transliteration: "Wanazzalna alaykal-kitaba tibyanal-likulli shay",
      meaning: 'And We have revealed to you the Book as a clarification of all things.',
      note: 'تِبْيَانًا لِّكُلِّ شَيْءٍ (a clarification for every matter — purpose-noun + genitive) — a220: 220 advanced lessons are تِبْيَانًا for Arabic; every lesson clarified one thing.',
    },
  },
  {
    id: 'a221',
    stage: 'advanced',
    title: 'Quran and Nature: Arabic Cosmological Vocabulary',
    objective: 'Study all Quranic vocabulary related to creation, cosmos, and natural phenomena.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['50 cosmological vocabulary flashcards', 'Parse al-Baqarah 29 (creation sequence) with full analysis', 'Write a 150-word Arabic paragraph on Quranic cosmology'],
    quranBridge: {
      arabic: 'هُوَ الَّذِي خَلَقَ لَكُم مَّا فِي الْأَرْضِ جَمِيعًا ثُمَّ اسْتَوَى إِلَى السَّمَاءِ فَسَوَّاهُنَّ سَبْعَ سَمَاوَاتٍ',
      transliteration: "Huwalladhi khalaqa lakum ma fil-ardi jamian thummastawa ilas-sama-i fasawwahunna saba samawat",
      meaning: 'He is who created for you all that is on earth, then turned to the heaven and formed them as seven heavens.',
      note: 'جَمِيعًا (all together — totality adverb) + ثُمَّ (then for sequence with interval) + فَسَوَّاهُنَّ (Form II: perfectly levelled them) — creation vocabulary: the three stages of cosmic formation.',
    },
  },
  {
    id: 'a222',
    stage: 'advanced',
    title: 'Advanced Arabic: Reading Ibn Taymiyya\'s Arabic',
    objective: 'Read 300 words of Ibn Taymiyya\'s fatwa prose — his direct, forceful Arabic style.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 300 words of Ibn Taymiyya\'s Majmu al-Fatawa', 'Describe Ibn Taymiyya\'s stylistic features', 'Grammar: how does Ibn Taymiyya use emphasis particles?'],
    quranBridge: {
      arabic: 'وَلَا تَتَّبِعُوا السُّبُلَ فَتَفَرَّقَ بِكُمْ عَن سَبِيلِهِ',
      transliteration: "Wala tattabi-us-subula fatafarraqa bikum an sabilih",
      meaning: 'And do not follow the various other paths, for they will separate you from His way.',
      note: 'السُّبُلَ (the paths — plural, definite: the many ways that deviate) vs سَبِيلِهِ (His way — singular, possessive: the one path) — Ibn Taymiyya\'s grammar: plural deviation vs singular truth.',
    },
  },
  {
    id: 'a223',
    stage: 'advanced',
    title: 'Advanced Arabic: Perfect Tense (Madi) Functions in Quran',
    objective: 'Study all distinct functions of the Arabic perfect tense (madi) in Quranic usage.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Madi as completed past', 'Madi as prophetic perfect (future guaranteed)', 'Madi in conditional sentences', 'Madi in divine declarations'],
    quranBridge: {
      arabic: 'أَتَى أَمْرُ اللَّهِ فَلَا تَسْتَعْجِلُوهُ',
      transliteration: "Ata amrullahi fala tasta-jiluh",
      meaning: 'Allah\'s decree has come, so do not hasten it.',
      note: 'أَتَى (perfect as prophetic perfect: has come — the future is treated as past because it is certain) — the Arabic perfect for certain future events: grammar of divine inevitability.',
    },
  },
  {
    id: 'a224',
    stage: 'advanced',
    title: 'Classical Arabic Literature: al-Jahiz\'s al-Hayawan',
    objective: 'Read 250 words from al-Jahiz\'s al-Hayawan — the first encyclopaedia of animals in Arabic.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read 250 words of al-Hayawan entry', 'Al-Jahiz\'s vocabulary and satirical style', 'Animals in the Quran vs al-Jahiz\'s scientific treatment'],
    quranBridge: {
      arabic: 'وَمَا مِن دَابَّةٍ فِي الْأَرْضِ وَلَا طَائِرٍ يَطِيرُ بِجَنَاحَيْهِ إِلَّا أُمَمٌ أَمْثَالُكُمْ',
      transliteration: "Wama min dabbatin fil-ardi wala ta-irin yatiru bijanahayhi illa umamun amthalukum",
      meaning: 'There is no creature moving on earth nor a bird flying with two wings except that they are communities like you.',
      note: 'أُمَمٌ أَمْثَالُكُمْ (communities like you — predicate similarity noun) — al-Jahiz\'s al-Hayawan begins from the Quran\'s elevation of animals to our status.',
    },
  },
  {
    id: 'a225',
    stage: 'advanced',
    title: 'Surah al-Jathiya: Humbling Before Truth',
    objective: 'Study al-Jathiya 12-37 — the proofs from creation, the fate of those who mock truth.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Jathiya 12-37 with harakat', 'Proof vocabulary from this surah', 'Grammar: repetition of أَفَلَا تَتَفَكَّرُونَ structure in this surah'],
    quranBridge: {
      arabic: 'وَسَخَّرَ لَكُمُ اللَّيْلَ وَالنَّهَارَ وَالشَّمْسَ وَالْقَمَرَ',
      transliteration: "Wasakhkhara lakumul-layla wannahara wash-shamsa walqamar",
      meaning: 'And He subjected for you the night and the day and the sun and the moon.',
      note: 'سَخَّرَ (Form II: specially subjected — intensive causative) — the Form II marks that Allah did not merely create these; He specifically subjected (taskhir) them for human benefit.',
    },
  },
  {
    id: 'a226',
    stage: 'advanced',
    title: 'Advanced Arabic: Masnawi Persian — Arabic Influence on Persian',
    objective: 'Study the Arabic loanwords and Quranic quotations woven into classical Persian poetry (Rumi).',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['20 Arabic loanwords in Rumi\'s Masnawi with original Arabic', 'Quranic allusions in Persian literature', 'How has Arabic shaped the vocabulary of Persian, Turkish, Urdu?'],
    quranBridge: {
      arabic: 'وَلِلَّهِ الْأَسْمَاءُ الْحُسْنَى فَادْعُوهُ بِهَا',
      transliteration: "Walillahil-asmaul-husna fad-uhu biha",
      meaning: 'And to Allah belong the most beautiful names, so call upon Him by them.',
      note: 'الْأَسْمَاءُ الْحُسْنَى (the most beautiful names — feminine plural superlative) — Arabic divine names radiated into every Muslim language; Rumi\'s Persian swims in them.',
    },
  },
  {
    id: 'a227',
    stage: 'advanced',
    title: 'Advanced Arabic: Complete Verb-Form Mastery Test',
    objective: 'Test yourself: from root, generate all 10 major verb forms (I-X) with meanings and all participles.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['10 roots × 10 verb forms = 100 derived verbs', 'Meanings and usage for each form generated', 'Identify which forms don\'t actually exist for each root'],
    quranBridge: {
      arabic: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ',
      transliteration: "Waman yatawakkal alallahi fahuwa hasbuh",
      meaning: 'And whoever relies upon Allah — He is sufficient for him.',
      note: 'يَتَوَكَّلْ (Form V: to rely completely — masdar: tawakkul; Form V adds reciprocal/intensive reliance meaning) — from root و-ك-ل: wakeel, tawkeel, tawakkul, tawakkal.',
    },
  },
  {
    id: 'a228',
    stage: 'advanced',
    title: 'Surah al-Qaf: Cosmic Warning',
    objective: 'Study Surah Qaf in full — cosmic scale, Judgment Day, self-witnessing, and the whispering of nafs.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Qaf 1-45 with harakat', 'Nafs vocabulary: whispering, accountability, inner self', 'Grammar: the structure of وَجَاءَتْ repeated sequence'],
    quranBridge: {
      arabic: 'وَلَقَدْ خَلَقْنَا الْإِنسَانَ وَنَعْلَمُ مَا تُوَسْوِسُ بِهِ نَفْسُهُ وَنَحْنُ أَقْرَبُ إِلَيْهِ مِنْ حَبْلِ الْوَرِيدِ',
      transliteration: "Walaqad khalaqnal-insana wa-nalamu ma tuwaswisu bihi nafsuhu wanahnu aqrabu ilayhi min hablil-warid",
      meaning: 'We created man and know what his soul whispers to him. We are closer to him than his jugular vein.',
      note: 'تُوَسْوِسُ (Form II: whispers continuously — the Form II reduplication mimics the sound of whisper) + مِنْ حَبْلِ الْوَرِيدِ (than the jugular vein) — closeness stated through anatomical comparison.',
    },
  },
  {
    id: 'a229',
    stage: 'advanced',
    title: 'Advanced Arabic: Legal Reasoning in Classical Islamic Texts',
    objective: 'Study the linguistic markers of legal reasoning in classical fiqh: qiyas, ijma, dalil, hujja.',
    duration: '62 min',
    challengeLevel: 'Expert',
    drills: ['20 legal reasoning vocabulary flashcards', 'Read 200 words of legal Arabic from any fiqh source', 'Grammar: conditional sentences in fiqh (إِنْ/إِذَا conditions)'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا أَطِيعُوا اللَّهَ وَأَطِيعُوا الرَّسُولَ وَأُولِي الْأَمْرِ مِنكُمْ',
      transliteration: "Ya ayyuhalladhina amanu atiu Allaha wa-ati-ur-rasula wa-ulil-amri minkum",
      meaning: 'O you who believe, obey Allah and obey the Messenger and those in authority among you.',
      note: 'أُولِي الْأَمْرِ (possessors of authority — genitive: أُولِي pattern for "those who possess") — fiqh legal structure derives from this verse: three levels of authority grammar.',
    },
  },
  {
    id: 'a230',
    stage: 'advanced',
    title: 'Advanced Milestone a230: Landmark Comprehensive Review',
    objective: 'Assessment for a221-a229 — approaching final quarter.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['75-question test', 'Unseen classical Arabic passage 500 words — full analysis', 'Write a full scholarly Arabic paragraph: thesis, evidence, conclusion'],
    quranBridge: {
      arabic: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ أَمْ عَلَى قُلُوبٍ أَقْفَالُهَا',
      transliteration: "Afala yatadabbarunal-qur-ana am ala qulubun aqfaluha",
      meaning: 'Do they not then ponder the Quran, or are there locks upon their hearts?',
      note: 'أَقْفَالُهَا (their locks — genitive: the locks belonging to those hearts) — a230 of 330: 100 lessons of advanced Arabic remain; the locks are off; تَدَبُّر is now possible.',
    },
  },
  {
    id: 'a231',
    stage: 'advanced',
    title: 'Surah al-Dhariyat: The Scattering Winds',
    objective: 'Study al-Dhariyat 1-60 — the oaths on cosmic forces, the stories of Ibrahim and Lut, the nature of provision.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Dhariyat 1-60 with harakat', 'Cosmic forces vocabulary', 'Grammar: qasam (oath) construction in Arabic — الذَّارِيَاتِ ذَرْوًا'],
    quranBridge: {
      arabic: 'وَمَا خَلَقْتُ الْجِنَّ وَالْإِنسَ إِلَّا لِيَعْبُدُونِ',
      transliteration: "Wama khalaqtul-jinna wal-insa illa liyabudun",
      meaning: 'And I did not create the jinn and mankind except to worship Me.',
      note: 'إِلَّا لِيَعْبُدُونِ (except for worship of Me — purpose clause) — the most comprehensive statement of purpose in the Quran; the lam of purpose locks the entire creation to one goal.',
    },
  },
  {
    id: 'a232',
    stage: 'advanced',
    title: 'Advanced Arabic Grammar: Sentence Embedding Depth',
    objective: 'Study how deeply Arabic sentences can be embedded — relative clauses inside relative clauses.',
    duration: '52 min',
    challengeLevel: 'Expert',
    drills: ['Construct a triple-embedded Arabic sentence', 'Identify embedding levels in 5 Quranic examples', 'When does deep embedding become unwieldy?'],
    quranBridge: {
      arabic: 'وَالَّذِي جَاءَ بِالصِّدْقِ وَصَدَّقَ بِهِ أُولَئِكَ هُمُ الْمُتَّقُونَ',
      transliteration: "Walladhi ja-a bis-sidqi wasaddaqa bihi ula-ika humul-muttaqun",
      meaning: 'And the one who comes with truth and believes in it — those are the God-fearing.',
      note: 'وَالَّذِي (relative pronoun leading embedded clause) → وَصَدَّقَ بِهِ (second relative clause embedded within first) — two levels of relative embedding then the predicate clause: a three-tier sentence.',
    },
  },
  {
    id: 'a233',
    stage: 'advanced',
    title: 'Classical Arabic: Ibn Battuta\'s Travels (Advanced)',
    objective: 'Read 300 words of Ibn Battuta\'s Rihla — his Arabic travel prose style and geographic vocabulary.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read 300 words of Ibn Battuta\'s Rihla', 'Travel and geography vocabulary: directional, temporal, place-name grammar', 'Grammar: Ibn Battuta\'s use of "I" vs impersonal narration'],
    quranBridge: {
      arabic: 'فَسِيرُوا فِي الْأَرْضِ فَانظُرُوا كَيْفَ كَانَ عَاقِبَةُ الْمُكَذِّبِينَ',
      transliteration: "Fasiru fil-ardi fandhuru kayfa kana aqibatul-mukadhdhibin",
      meaning: 'Travel through the land and observe how was the end of those who denied.',
      note: 'فَسِيرُوا...فَانظُرُوا (travel then observe — sequential imperatives) — Ibn Battuta obeyed these two imperatives more than any other scholar: his rihla is 29 years of Quranic compliance.',
    },
  },
  {
    id: 'a234',
    stage: 'advanced',
    title: 'Advanced Arabic: Arabic Mathematical and Scientific Terms',
    objective: 'Study the Arabic origin of mathematical and scientific terminology in European languages.',
    duration: '48 min',
    challengeLevel: 'Expert',
    drills: ['20 Arabic-origin math/scientific terms (algebra, algorithm, zenith...)', 'Original Arabic meaning vs English usage', 'The Islamic Golden Age contribution to global vocabulary'],
    quranBridge: {
      arabic: 'وَالشَّمْسَ وَالْقَمَرَ حُسْبَانًا',
      transliteration: "Wash-shamsa wal-qamara husbana",
      meaning: 'And He made the sun and moon for calculation.',
      note: 'حُسْبَانًا (for calculation — masdar as purpose noun) — from ح-س-ب: Arabic gave the world al-hisab (arithmetic), al-jabr (algebra), calculus via medieval Arabic; the Quran commands حُسْبَانًا.',
    },
  },
  {
    id: 'a235',
    stage: 'advanced',
    title: 'Surah al-Tur: The Mountain Oath',
    objective: 'Study al-Tur in full — the oaths on sacred locations, Judgment Day realities, Paradise description.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Tur 1-49 with harakat', 'Paradise description vocabulary from al-Tur', 'Grammar: oath structure in this surah — 6 oaths before the apodosis'],
    quranBridge: {
      arabic: 'إِنَّ عَذَابَ رَبِّكَ لَوَاقِعٌ مَّا لَهُ مِن دَافِعٍ',
      transliteration: "Inna adhaba rabbika lawaqiun ma lahu min daf",
      meaning: 'Indeed, the punishment of your Lord will occur — there is no one to repel it.',
      note: 'لَوَاقِعٌ (lam of oath + active participle: SURELY coming) + مَّا لَهُ مِن دَافِعٍ (no repeller exists for it) — the grammar of divine inevitability: active participle + absolute negation.',
    },
  },
  {
    id: 'a236',
    stage: 'advanced',
    title: 'Advanced Arabic: Formal Letter Writing for Islamic Institutions',
    objective: 'Study and practise the exact format of formal Arabic letters to Islamic organisations, scholars, or officials.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Formal letter template: 6 fixed elements', 'Write to an Islamic organisation requesting advice on a project', 'Grammar: honorifics and their correct grammatical placement'],
    quranBridge: {
      arabic: 'إِنَّهُ مِن سُلَيْمَانَ وَإِنَّهُ بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      transliteration: "Innahu min Sulaymana wa-innahu bismillahir-rahmanir-rahim",
      meaning: 'Indeed it is from Solomon, and indeed it is: In the name of Allah, the Most Gracious, the Most Merciful.',
      note: 'مِن سُلَيْمَانَ (from Solomon — letter opening formula) — the first formal letter template in the Quran; Sulayman\'s letter to Balqis is the model of Islamic correspondence grammar.',
    },
  },
  {
    id: 'a237',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Hyperbolic Structures',
    objective: 'Study the Arabic grammatical tools for hyperbole (mubalagha): noun patterns فَعَّال, فَعُول, مِفْعَال.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['20 mubalagha patterns with examples (عَلَّام, غَفُور, صَبُور...)', 'Quran\'s use of mubalagha to describe Allah vs people', 'Grammar: صِيَغُ الْمُبَالَغَة (patterns of exaggeration)'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ غَفُورٌ رَّحِيمٌ',
      transliteration: "Innallaha ghafurun rahim",
      meaning: 'Indeed, Allah is Most Forgiving, Most Merciful.',
      note: 'غَفُورٌ (mubalagha فَعُول: Most Forgiving — beyond فَاغِر) + رَحِيمٌ (mubalagha فَعِيل: Most Merciful) — not just forgiving and merciful; the grammar insists on their extremity.',
    },
  },
  {
    id: 'a238',
    stage: 'advanced',
    title: 'Advanced Arabic: Quran on Knowledge and Ignorance',
    objective: 'Study the complete Quranic vocabulary and grammar surrounding knowledge (ilm) and ignorance (jahl).',
    duration: '52 min',
    challengeLevel: 'Expert',
    drills: ['ilm vocabulary family: 15 derivatives', 'jahl vocabulary family: 10 derivatives', 'Quran\'s contrast grammar: how are ilm and jahl grammatically opposed?'],
    quranBridge: {
      arabic: 'قُلْ هَلْ يَسْتَوِي الَّذِينَ يَعْلَمُونَ وَالَّذِينَ لَا يَعْلَمُونَ',
      transliteration: "Qul hal yastawi lladhina yalamuna walladhina la yalamun",
      meaning: 'Say: Are those who know equal to those who do not know?',
      note: 'هَلْ يَسْتَوِي (Form X interrogative: do they reach equality?) — Form X of equality: the rhetorical question whose grammar makes the answer obvious.',
    },
  },
  {
    id: 'a239',
    stage: 'advanced',
    title: 'Surah al-Najm: The Near Approach',
    objective: 'Study al-Najm 1-62 — the beginning of revelation, the Prophet\'s near approach, the intercession issue.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Najm 1-62 with harakat', 'Divine encounter vocabulary', 'Grammar: مَا ضَلَّ صَاحِبُكُمْ (negative perfect denying accusations)'],
    quranBridge: {
      arabic: 'ثُمَّ دَنَا فَتَدَلَّى فَكَانَ قَابَ قَوْسَيْنِ أَوْ أَدْنَى',
      transliteration: "Thumma dana fatadalla fakana qaba qawsayni aw adna",
      meaning: 'Then he drew near and descended until he was two bow-lengths away or nearer.',
      note: 'فَتَدَلَّى (Form V: descended, hung close) + قَابَ قَوْسَيْنِ (distance of two bows — dual measure noun) — the grammar of nearness: Arabic had to stretch dual metaphor to describe proximity unmeasured.',
    },
  },
  {
    id: 'a240',
    stage: 'advanced',
    title: 'Advanced Milestone a240: Pre-Final Review',
    objective: 'Comprehensive assessment for a231-a239.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['80-question comprehensive test', 'Write a 400-word classical Arabic essay: comparing two prophetic stories', 'Oral: 7-minute Arabic speech on a topic of your choice'],
    quranBridge: {
      arabic: 'وَمَا يَعْلَمُ جُنُودَ رَبِّكَ إِلَّا هُوَ وَمَا هِيَ إِلَّا ذِكْرَى لِلْبَشَرِ',
      transliteration: "Wama yalamu junuda rabbika illa huw wama hiya illa dhikra lil-bashar",
      meaning: 'None knows the forces of your Lord except Him, and this is only a reminder for mankind.',
      note: 'ذِكْرَى لِلْبَشَرِ (a reminder for mankind — purpose noun) — after 240 advanced lessons: these lessons are ذِكْرَى; not new knowledge but remembrance of what Arabic already gave us.',
    },
  },
  {
    id: 'a241',
    stage: 'advanced',
    title: 'Advanced Arabic: Imam al-Shafi\'i\'s Arabic Poetry',
    objective: 'Read and analyse the famous Arabic poems of Imam al-Shafi\'i — his grammatical precision in verse.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Read 20 lines of al-Shafi\'i\'s poetry with analysis', 'Al-Shafi\'i\'s favourite meters and their effect', 'Grammar: how does al-Shafi\'i achieve precision in tight metrical form?'],
    quranBridge: {
      arabic: 'أَلَمْ تَرَ كَيْفَ ضَرَبَ اللَّهُ مَثَلًا كَلِمَةً طَيِّبَةً كَشَجَرَةٍ طَيِّبَةٍ',
      transliteration: "Alam tara kayfa darabAllahu mathalan kalimatan tayyibatan kashajarin tayyiba",
      meaning: 'Do you not see how Allah presents an example: a good word is like a good tree.',
      note: 'ضَرَبَ اللَّهُ مَثَلًا (Allah struck a parable — ضَرَبَ المثل is the Arabic idiom for giving an example) — al-Shafi\'i\'s poetry itself is like this: a good word rooted in good meaning.',
    },
  },
  {
    id: 'a242',
    stage: 'advanced',
    title: 'Advanced Arabic: Grammar of Gratitude in the Quran',
    objective: 'Study all grammatical forms expressing gratitude: hamdalah, shukr, and the structures that accompany them.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['20 gratitude structures in the Quran', 'What grammatical form most often follows شَكَرَ?', 'Grammar: الْحَمْدُ لِلَّهِ — parse this completely'],
    quranBridge: {
      arabic: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
      transliteration: "Alhamdu lillahi rabbil-alamin",
      meaning: 'All praise is to Allah, Lord of the worlds.',
      note: 'الْحَمْدُ (definite masdar as subject: ALL praise — not just "praise is...") + لِلَّهِ (lam of possession: belongs to Allah) — the grammar of الحمد: the definite article quantifies all praise to one Owner.',
    },
  },
  {
    id: 'a243',
    stage: 'advanced',
    title: 'Surah al-Qamar: The Moon-Splitting',
    objective: 'Study al-Qamar in full — the moon splitting, the people of Nuh, Ad, Thamud, and the repeated refrain.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Qamar 1-55 with harakat', 'Identify the repeated refrain and its grammar', 'Grammar: فَهَلْ مِن مُّدَّكِرٍ — why Form VIII + interrogative?'],
    quranBridge: {
      arabic: 'وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍ',
      transliteration: "Walaqad yassarnal-qur-ana lidhdhikri fahal min muddakir",
      meaning: 'And We have certainly made the Quran easy for remembrance, so is there any who will remember?',
      note: 'يَسَّرْنَا (Form II: made easy — intensive facilitation) + فَهَلْ مِن مُّدَّكِرٍ (so is there a minuscule one who will take heed — مِن للتبعيض) — the Quran\'s easiness plus the interrogative challenge; four times in this surah.',
    },
  },
  {
    id: 'a244',
    stage: 'advanced',
    title: 'Advanced Arabic: The Language of Duas from the Quran',
    objective: 'Study 50 Quranic duas — their grammatical structure, politeness forms, and dua vocabulary.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['50 Quranic duas with grammatical annotation', 'Grammar of dua: imperatives, jussive, subjunctive in dua context', 'Write a personal dua in Arabic using Quranic grammar'],
    quranBridge: {
      arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
      transliteration: "Rabbana atina fid-dunya hasanatan wafil-akhirati hasanatan waqina adhaban-nar",
      meaning: 'Our Lord, give us good in this world and good in the Hereafter and protect us from the punishment of the Fire.',
      note: 'رَبَّنَا (our Lord — vocative with ism/masdar) + آتِنَا (Form IV: give us specifically) + حَسَنَةً (good — deliberately vague: any and all good) — the most comprehensive dua; its grammatical breadth is intentional.',
    },
  },
  {
    id: 'a245',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Style and Register',
    objective: 'Study how Arabic varies by register: Quranic, classical literary, modern standard, dialectal.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Same sentence in 4 registers: Quranic, classical, MSA, Egyptian dialect', '10 words that differ completely across registers', 'Which register should be used for which purpose?'],
    quranBridge: {
      arabic: 'إِنَّ هَذَا الْقُرْآنَ يَهْدِي لِلَّتِي هِيَ أَقْوَمُ',
      transliteration: "Inna hadhal-qur-ana yahdi lil-lati hiya aqwam",
      meaning: 'Indeed, this Quran guides to that which is most upright.',
      note: 'لِلَّتِي هِيَ أَقْوَمُ (to that which is most upright — relative pronoun + elative: the straightest path) — the Quran\'s register is uniquely itself; no human dialect can replicate it.',
    },
  },
  {
    id: 'a246',
    stage: 'advanced',
    title: 'Advanced Arabic: Imam Ali\'s Nahj al-Balagha',
    objective: 'Read 250 words of Nahj al-Balagha — study the linguistic features of Imam Ali\'s Arabic prose.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Read 250 words of Nahj al-Balagha: a sermon excerpt', 'Identify rhetorical structures: repetition, parallelism, contrast', 'Grammar: Ali\'s use of conditional structures in warnings'],
    quranBridge: {
      arabic: 'وَاتَّقُوا اللَّهَ وَاعْلَمُوا أَنَّكُمْ إِلَيْهِ تُحْشَرُونَ',
      transliteration: "Wattaqullaha wa-alamu annakum ilayhi tuhsharun",
      meaning: 'And fear Allah, and know that to Him you will be gathered.',
      note: 'تُحْشَرُونَ (Form I passive future: you will be gathered — plural) — Ali\'s Nahj al-Balagha repeatedly echoes Quranic passive constructions to create the same gravitational weight.',
    },
  },
  {
    id: 'a247',
    stage: 'advanced',
    title: 'Surah al-Mudathir: The Wrapped One',
    objective: 'Study al-Mudathir — early Makkan revelation, the warning to Walid ibn al-Mughira, and saqar description.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Mudathir 1-56 with harakat', 'Description of Saqar vocabulary', 'Grammar: future denial using لَا أُقْسِمُ + qasam construction'],
    quranBridge: {
      arabic: 'قُمْ فَأَنذِرْ وَرَبَّكَ فَكَبِّرْ وَثِيَابَكَ فَطَهِّرْ',
      transliteration: "Qum fa-andhir warabbaka fakabbir wathiyabaka fatah-hir",
      meaning: 'Arise and warn, and your Lord — magnify Him, and your garments — purify them.',
      note: 'وَرَبَّكَ فَكَبِّرْ (fronting of object for emphasis: YOUR LORD — magnify HIM) — the fronting grammar creates strong emphasis: these commands are in priority order.',
    },
  },
  {
    id: 'a248',
    stage: 'advanced',
    title: 'Advanced Arabic: Understanding Classical Arabic Dictionaries',
    objective: 'Study how to use classical Arabic dictionaries: Lisan al-Arab, al-Qamus al-Muhit, and others.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Look up 5 words in Lisan al-Arab: understand the root structure', 'How do classical dictionaries organise entries? (root vs alphabetical)', 'What additional information does Lisan al-Arab provide beyond definition?'],
    quranBridge: {
      arabic: 'وَعَلَّمَ آدَمَ الْأَسْمَاءَ كُلَّهَا',
      transliteration: "Wa-allama Adama l-asma-a kullaha",
      meaning: 'And He taught Adam the names of all things.',
      note: 'الْأَسْمَاءَ كُلَّهَا (all the names — totality adjective reinforcing the definite noun) — lexicography is the science of preserving what Allah taught Adam; each dictionary entry is sacred trust.',
    },
  },
  {
    id: 'a249',
    stage: 'advanced',
    title: 'Advanced Arabic: Meditative Reading of Juz Amma',
    objective: 'Read Juz Amma (Surahs 78-114) in one sitting with mindfulness of every grammatical structure.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['Read entire Juz Amma slowly with harakat', 'Note 20 grammatical features you encounter', 'Emotional response tracking: which grammatical structure moved you most?'],
    quranBridge: {
      arabic: 'عَمَّ يَتَسَاءَلُونَ عَنِ النَّبَإِ الْعَظِيمِ',
      transliteration: "Amma yatasa-alun anil-naba-il-azim",
      meaning: 'About what are they asking? About the great news.',
      note: 'عَمَّ (عَنْ + مَا = about what — contraction) — Juz Amma opens with a question; its grammar begins with interrogation; a profound reading ends with certainty.',
    },
  },
  {
    id: 'a250',
    stage: 'advanced',
    title: 'Advanced Milestone a250: Three-Quarter Achievement',
    objective: 'Comprehensive assessment at the 250-lesson mark — 75% of advanced curriculum complete.',
    duration: '120 min',
    challengeLevel: 'Expert',
    drills: ['100-question comprehensive test covering all advanced topics', 'Write a 500-word Arabic essay on linguistics and Quran', 'Oral examination: 10-minute discussion on advanced Arabic grammar'],
    quranBridge: {
      arabic: 'وَقُل رَّبِّ زِدْنِي عِلْمًا',
      transliteration: "Waqul rabbi zidni ilma",
      meaning: 'And say: My Lord, increase me in knowledge.',
      note: 'زِدْنِي (Form I imperative with 1st person suffix: add to me) + عِلْمًا (knowledge — indefinite: any increase) — the only command in the Quran to ask for more of something; 250 lessons obeyed this command.',
    },
  },
  {
    id: 'a251',
    stage: 'advanced',
    title: 'Surah al-Hadid: Iron and Light',
    objective: 'Study al-Hadid — iron sent down from heaven, divine light, the parable of dead land and living rain.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Hadid 1-29 with harakat', 'Light/darkness vocabulary from this surah', 'Grammar: the 5 divine tasbihat surahs — what opening phrase unites them?'],
    quranBridge: {
      arabic: 'هُوَ الْأَوَّلُ وَالْآخِرُ وَالظَّاهِرُ وَالْبَاطِنُ وَهُوَ بِكُلِّ شَيْءٍ عَلِيمٌ',
      transliteration: "Huwal-awwalu wal-akhiru wazzahiru wal-batinu wahuwa bikulli shay-in alim",
      meaning: 'He is the First and the Last, the Apparent and the Hidden. And He is of all things, Knowing.',
      note: 'الْأَوَّلُ وَالْآخِرُ وَالظَّاهِرُ وَالْبَاطِنُ (four paired opposites: First/Last + Manifest/Hidden) — four divine attributes grammatically linked in two antonym pairs; Arabic grammar mirrors divine paradox.',
    },
  },
  {
    id: 'a252',
    stage: 'advanced',
    title: 'Advanced Arabic: Reading Academic Arabic Journals',
    objective: 'Read an article abstract from an Arabic academic journal and identify its linguistic features.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read 300 words from an academic Arabic abstract', 'Identify academic Arabic conventions: hedging, citation, argumentation', 'Grammar: passive voice dominance in academic Arabic'],
    quranBridge: {
      arabic: 'وَآتَاكُم مِّن كُلِّ مَا سَأَلْتُمُوهُ وَإِن تَعُدُّوا نِعْمَتَ اللَّهِ لَا تُحْصُوهَا',
      transliteration: "Wa-atakum min kulli ma sa-altumuh wa-in taddu nimataAllahi la tuhsuha",
      meaning: 'And He gave you of all that you asked of Him. And if you count Allah\'s blessings, you could not enumerate them.',
      note: 'لَا تُحْصُوهَا (Form IV negative: you cannot count it up — to summarise/enumerate) — academic writing is an attempt to count; the Quran says some gifts exceed enumeration.',
    },
  },
  {
    id: 'a253',
    stage: 'advanced',
    title: 'Advanced Grammar: Broken Plurals — Final Mastery',
    objective: 'Complete mastery of all broken plural patterns in Arabic — the 32 major patterns with examples.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['32 broken plural patterns: أَفْعَال, فُعُول, فِعَل, etc.', 'Predict broken plural for 30 singulars', 'Which patterns are most common in the Quran?'],
    quranBridge: {
      arabic: 'قُلِ اللَّهُمَّ مَالِكَ الْمُلْكِ تُؤْتِي الْمُلْكَ مَن تَشَاءُ',
      transliteration: "Qulil-lahumma malikal-mulki tu-til-mulka man tasha",
      meaning: 'Say: O Allah, Owner of all sovereignty, You give sovereignty to whom You will.',
      note: 'مُلُوكٌ (kings in other verses) pl. of مَلِكٌ — فُعُول pattern; but مَالِكٌ plural مُلَّاكٌ/مَالِكُونَ — different patterns for different words; broken plurals resist mechanical prediction.',
    },
  },
  {
    id: 'a254',
    stage: 'advanced',
    title: 'Advanced Arabic: Arabic as Prayer Language',
    objective: 'Study how Arabic functions as the sacred language of salah — its phonological and psychological dimensions.',
    duration: '52 min',
    challengeLevel: 'Expert',
    drills: ['Study 10 linguistic features of Fatiha as salah', 'Phonological analysis: sounds that ease prostration and standing', 'Grammar: does Arabic prayer have different grammar from prose Arabic?'],
    quranBridge: {
      arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
      transliteration: "Iyyaka nabudu wa-iyyaka nastain",
      meaning: 'You alone we worship, and You alone we ask for help.',
      note: 'إِيَّاكَ (fronted object: YOU — absolute emphasis through fronting) — in English "we worship You"; in Arabic "YOU we worship" — fronting transforms prayer grammar into devotion grammar.',
    },
  },
  {
    id: 'a255',
    stage: 'advanced',
    title: 'Surah al-Mujadila: The Disputing Woman',
    objective: 'Study al-Mujadila — the woman who argued with the Prophet (pbuh), zihar rulings, and divine eavesdropping.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Mujadila 1-22 with harakat', 'Zihar vocabulary and ruling', 'Grammar: Allah hears the complaint — divine active participle يَسْمَعُ'],
    quranBridge: {
      arabic: 'قَدْ سَمِعَ اللَّهُ قَوْلَ الَّتِي تُجَادِلُكَ فِي زَوْجِهَا',
      transliteration: "Qad samiallahu qawlal-lati tujadiluka fi zawjiha",
      meaning: 'Certainly Allah has heard the statement of her who argues with you about her husband.',
      note: 'قَدْ سَمِعَ (qad + perfect: has definitely heard — certainty particle) — divine hearing as immediate divine response: qad emphasises that the hearing already happened and matters.',
    },
  },
  {
    id: 'a256',
    stage: 'advanced',
    title: 'Advanced Arabic: History of Arabic Script',
    objective: 'Study the history of Arabic script — from Nabataean to modern print — and its grammatical implications.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['History of Arabic script: 5 developmental stages', 'How did the addition of dots (nuqat) affect Quranic reading?', 'Grammar: early Quran manuscripts without harakat — how were they read?'],
    quranBridge: {
      arabic: 'الَّذِي عَلَّمَ بِالْقَلَمِ عَلَّمَ الْإِنسَانَ مَا لَمْ يَعْلَمْ',
      transliteration: "Alladhi allama bilqalami allama l-insana ma lam yalam",
      meaning: 'Who taught by the pen — He taught man what he did not know.',
      note: 'بِالْقَلَمِ (by the pen — instrumental ب) — Arabic script history IS the history of the pen; الْقَلَم was the first tool of divine teaching.',
    },
  },
  {
    id: 'a257',
    stage: 'advanced',
    title: 'Advanced Grammar: Classical Arabic Metre (Aruz) — Basics',
    objective: 'Introduction to classical Arabic prosody — al-Khalil ibn Ahmad\'s 16 metres and how to scan a verse.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Learn al-Khalil\'s scanning system: sabab, watad, fasila', 'Scan 5 verses of classical poetry in al-tawil metre', 'Why can\'t the Quran be poetry? Grammar of i\'jaz vs poetry'],
    quranBridge: {
      arabic: 'وَمَا عَلَّمْنَاهُ الشِّعْرَ وَمَا يَنبَغِي لَهُ',
      transliteration: "Wama allamnahush-shi-ra wama yanbaghi lah",
      meaning: 'And We did not teach him poetry, nor is it fitting for him.',
      note: 'وَمَا يَنبَغِي لَهُ (nor is it fitting for him — impersonal predicate) — the Quran denies metre by design; the Prophet wasn\'t given poetic meter precisely to distinguish the Quran\'s unique mode.',
    },
  },
  {
    id: 'a258',
    stage: 'advanced',
    title: 'Surah al-Hashr: The Exile and Divine Names',
    objective: 'Study al-Hashr — the exile of Banu Nadhir, the division of fay, and the closing divine name sequence.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Hashr 1-24 with harakat', 'The 20 divine names in 59:22-24', 'Grammar: the uniqueness declaration — هُوَ اللَّهُ الَّذِي لَا إِلَهَ إِلَّا هُو'],
    quranBridge: {
      arabic: 'هُوَ اللَّهُ الْخَالِقُ الْبَارِئُ الْمُصَوِّرُ لَهُ الْأَسْمَاءُ الْحُسْنَى',
      transliteration: "Huwa Allahul-khaliqu l-bari-ul-musawwiru lahul-asmaul-husna",
      meaning: 'He is Allah, the Creator, the Originator, the Fashioner. To Him belong the most beautiful names.',
      note: 'الْخَالِقُ (one who creates from nothing) الْبَارِئُ (originator — creates with distinction) الْمُصَوِّرُ (fashioner — gives form): three stages of creation grammar, three distinct divine acts.',
    },
  },
  {
    id: 'a259',
    stage: 'advanced',
    title: 'Advanced Arabic: Quran Translation Theory',
    objective: 'Study the theory and problems of translating the Quran — what is always lost and what can be preserved.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['5 scholarly views on Quran translation', 'Identify 10 Quranic phrases with no satisfactory English equivalent', 'Translate al-Baqarah 2:255 — compare your version with 3 published translations'],
    quranBridge: {
      arabic: 'إِنَّا أَنزَلْنَاهُ قُرْآنًا عَرَبِيًّا لَّعَلَّكُمْ تَعْقِلُونَ',
      transliteration: "Inna anzalnahu qur-anan arabiyyan laallakum taqilun",
      meaning: 'Indeed, We sent it down as an Arabic Quran so that you might understand.',
      note: 'قُرْآنًا عَرَبِيًّا (as an Arabic Quran — two adjectival predicates) + لَّعَلَّكُمْ تَعْقِلُونَ (so that you might reason) — the Arabic language of the Quran is not incidental but purposefully necessary for تَعَقُّل.',
    },
  },
  {
    id: 'a260',
    stage: 'advanced',
    title: 'Advanced Milestone a260: Final 70 Countdown',
    objective: 'Comprehensive assessment for a251-a259.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['80-question comprehensive test', 'Unseen 400-word passage: commentary and grammar analysis', 'Write 250-word Arabic commentary on a Quranic verse'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الَّذِينَ آمَنُوا اصْبِرُوا وَصَابِرُوا وَرَابِطُوا وَاتَّقُوا اللَّهَ لَعَلَّكُمْ تُفْلِحُونَ',
      transliteration: "Ya ayyuhalladhina amanu sbiru wasabiru warabitu wattaqullaha laallakum tuflihun",
      meaning: 'O you who believe, persevere and excel in patience and stand firm and fear Allah that you may succeed.',
      note: 'اصْبِرُوا (persevere: individual) وَصَابِرُوا (Form III: out-persevere others — communal patience) وَرَابِطُوا (Form III: fortify your position) — three levels of patience: private, competitive, structural.',
    },
  },
  {
    id: 'a261',
    stage: 'advanced',
    title: 'Surah al-Munafiqun: The Hypocrites',
    objective: 'Study al-Munafiqun in full — the linguistic portrait of hypocrisy, sealed hearts, and the warning.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Munafiqun 1-11 with harakat', 'Hypocrisy vocabulary in the Quran', 'Grammar: يَقُولُون...وَلَيْسَتْ قُلُوبُهُمْ (say vs hearts — contrast structure)'],
    quranBridge: {
      arabic: 'إِذَا جَاءَكَ الْمُنَافِقُونَ قَالُوا نَشْهَدُ إِنَّكَ لَرَسُولُ اللَّهِ',
      transliteration: "Idha ja-akal-munafiquna qalu nashhadu innaka larasulullah",
      meaning: 'When the hypocrites come to you, they say: We testify that you are the Messenger of Allah.',
      note: 'نَشْهَدُ إِنَّكَ لَرَسُولُ اللَّهِ (we testify that you are THE Messenger — strong witness grammar with lam of emphasis) — yet the Quran calls them liars: the grammar of words is faithful; the speakers are not.',
    },
  },
  {
    id: 'a262',
    stage: 'advanced',
    title: 'Advanced Arabic: Poetry of Spiritual Longing — Ibn Arabi',
    objective: 'Study selected Arabic verses from Ibn Arabi\'s Tarjuman al-Ashwaq — spiritual love poetry.',
    duration: '62 min',
    challengeLevel: 'Expert',
    drills: ['Read 15 lines of Tarjuman al-Ashwaq', 'Identify Ibn Arabi\'s vocabulary of spiritual longing', 'Grammar: ambiguity in mystical Arabic — deliberate polysemy'],
    quranBridge: {
      arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
      transliteration: "Fainna maal-usri yusra",
      meaning: 'For indeed with hardship will be ease.',
      note: 'مَعَ الْعُسْرِ يُسْرًا (with the hardship: ease — simultaneously alongside) — Ibn Arabi\'s mystical grammar reads this as: the hardship itself contains the ease inside it.',
    },
  },
  {
    id: 'a263',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Connectors and Discourse Structure',
    objective: 'Master all major Arabic discourse connectors: ثُمَّ, فَ, وَ, لَكِنَّ, بَل, حَتَّى, إِذْ, and their distinct roles.',
    duration: '52 min',
    challengeLevel: 'Expert',
    drills: ['8 connectors × 5 examples each = 40 examples', 'Replace one connector in a sentence and explain the meaning shift', 'Why does Quran prefer وَ as the most common connector?'],
    quranBridge: {
      arabic: 'فَسُبْحَانَ اللَّهِ حِينَ تُمْسُونَ وَحِينَ تُصْبِحُونَ',
      transliteration: "Fasubhanallahi hina tumsuna wahina tusbihun",
      meaning: 'So exalt Allah when you reach the evening and when you reach the morning.',
      note: 'فَسُبْحَانَ (fa- as sequential consequence connector: THEREFORE praise) — the fa- here connects discovery of divine acts (of creation) to the natural human response of tasbih.',
    },
  },
  {
    id: 'a264',
    stage: 'advanced',
    title: 'Surah al-Talaq: Divorce Rulings in Detail',
    objective: 'Study al-Talaq in full — legal precision Arabic, iddah rulings, and divine promise of tawakkul provision.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Talaq 1-12 with harakat', 'Legal precision vocabulary: iddah, rujaa, fasq', 'Grammar: conditional sentences in legal rulings — إِنْ...فَ'],
    quranBridge: {
      arabic: 'وَمَن يَتَّقِ اللَّهَ يَجْعَل لَّهُ مَخْرَجًا وَيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
      transliteration: "Waman yattaqillaha yajal lahu makhrajaw wayarzuqhu min haythu la yahtasib",
      meaning: 'And whoever fears Allah — He will make for him a way out, and will provide for him from where he does not expect.',
      note: 'مِنْ حَيْثُ لَا يَحْتَسِبُ (from where he does not calculate — Form VIII: to reckon, count upon) — divine provision comes precisely from the uncounted direction; the grammar of miraculous sustenance.',
    },
  },
  {
    id: 'a265',
    stage: 'advanced',
    title: 'Advanced Arabic: Medical Vocabulary from Classical Arabic',
    objective: 'Study 30 classical Arabic medical terms from Ibn Sina\'s al-Qanun — and their Quranic connections.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['30 classical Arabic medical terms flashcards', 'Ibn Sina\'s terms that became European medical vocabulary', 'Quran and health vocabulary overlap'],
    quranBridge: {
      arabic: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
      transliteration: "Wa-idha maridtu fahuwa yashfin",
      meaning: 'And when I am ill, it is He who cures me.',
      note: 'يَشْفِينِ (Form I: cures me — iambically from ش-ف-ي: shifa = healing) — Ibn Sina built a medical canon; Ibrahim said فَهُوَ يَشْفِين; Arabic medicine and prayer share the same root-family.',
    },
  },
  {
    id: 'a266',
    stage: 'advanced',
    title: 'Advanced Grammar: Arabic Diacritics (Harakat) in Classical Texts',
    objective: 'Study the role of tashkil (diacritics) in disambiguating meaning — when removing them changes interpretation.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['10 examples where different harakat = different meaning', 'Classical Arabic texts without harakat: how did scholars read them?', 'Grammar: the case-ending system and how harakat encode it'],
    quranBridge: {
      arabic: 'وَلَا يَحْزُنكَ قَوْلُهُمْ',
      transliteration: "Wala yahzunka qawluhum",
      meaning: 'Do not let their speech grieve you.',
      note: 'يَحْزُنكَ (يَحْزُن vs يُحْزِن — same letters, different Form!) — Form I يَحْزُن (he becomes sad) vs Form IV يُحْزِن (causes sadness) — harakat on the ya- determines whether Allah comforts or commands.',
    },
  },
  {
    id: 'a267',
    stage: 'advanced',
    title: 'Surah al-Tahreem: Purification and the Example Women',
    objective: 'Study al-Tahreem — the Prophet\'s oath, Maryam and Asiya as models, and purification grammar.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Tahreem 1-12 with harakat', 'Women of Quran vocabulary: Maryam, Asiya, wife of Nuh', 'Grammar: protection command — قُوا أَنفُسَكُمْ وَأَهْلِيكُمْ نَارًا'],
    quranBridge: {
      arabic: 'وَضَرَبَ اللَّهُ مَثَلًا لِّلَّذِينَ آمَنُوا امْرَأَتَ فِرْعَوْنَ',
      transliteration: "Wadaraballahu mathalan lilladhina amanu imra-ata firaun",
      meaning: 'And Allah presents an example for those who believe: the wife of Pharaoh.',
      note: 'ضَرَبَ اللَّهُ مَثَلًا (Allah coined an example — ضَرَبَ المَثَل idiom) — Asiya, wife of Pharaoh, chosen as the ultimate model for believers: grammar says believers = people like HER.',
    },
  },
  {
    id: 'a268',
    stage: 'advanced',
    title: 'Advanced Arabic: Classical Grammar — al-Muqaddima al-Ajurrumiyya',
    objective: 'Return to al-Ajurrumiyya and re-read it through advanced eyes — appreciate its systematic genius.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Re-read all sections of al-Ajurrumiyya', 'Identify what al-Ajurrumiyya omits (that you now know)', 'Write a 200-word assessment of al-Ajurrumiyya as a work'],
    quranBridge: {
      arabic: 'وَمِن كُلِّ شَيْءٍ خَلَقْنَا زَوْجَيْنِ لَعَلَّكُمْ تَذَكَّرُونَ',
      transliteration: "Wamin kulli shay-in khalaqna zawjayni laallakum tadhakkarun",
      meaning: 'And of everything We created pairs, so that you might reflect.',
      note: 'زَوْجَيْنِ (dual: two of a pair — the dual as cosmic pattern) — al-Ajurrumiyya teaches the الرفع والنصب والجر والجزم: the two-pair system. Reading it again after advanced study: تَذَكَّرُونَ.',
    },
  },
  {
    id: 'a269',
    stage: 'advanced',
    title: 'Advanced Arabic: Reading Modern Arabic Novels',
    objective: 'Read an excerpt from a modern Arabic novel — study contemporary literary Arabic.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read 300 words from Naguib Mahfouz\'s Arabic (e.g., Awlad Haretna)', 'How does modern literary Arabic differ from classical?', 'Grammar features unique to modern Arabic fiction'],
    quranBridge: {
      arabic: 'وَلَقَدْ صَرَّفْنَا فِي هَذَا الْقُرْآنِ لِلنَّاسِ مِن كُلِّ مَثَلٍ',
      transliteration: "Walaqad sarrafna fi hadhal-qur-ani lin-nasi min kulli mathal",
      meaning: 'And We have indeed diversified in this Quran for the people every kind of example.',
      note: 'صَرَّفْنَا (Form II: we diversified/varied — intensive: many forms of one thing) — the Quran uses مَثَل in every narrative form; modern Arabic novelists inherit this storytelling mandate.',
    },
  },
  {
    id: 'a270',
    stage: 'advanced',
    title: 'Advanced Milestone a270: The Final Sprint Begins',
    objective: 'Assessment at a261-a269 — 60 lessons remaining.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['80-question test', 'Full parse: selected 100 words from a classical Arabic text', 'Write 300-word Arabic essay: the legacy of Arabic in the world'],
    quranBridge: {
      arabic: 'فَاسْتَبِقُوا الْخَيْرَاتِ',
      transliteration: "Fastabiqul-khayraat",
      meaning: 'So race toward good deeds.',
      note: 'فَاسْتَبِقُوا (Form VIII imperative plural: race/compete toward — intensive racing to reach good) — a270: 60 lessons remain; فَاسْتَبِقُوا to the finish.',
    },
  },
  {
    id: 'a271',
    stage: 'advanced',
    title: 'Advanced Arabic: Surah Yusuf — Full Linguistic Commentary',
    objective: 'Write a linguistic commentary on one chapter (10 verses) of Surah Yusuf, covering all literary devices.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Choose 10 verses of Surah Yusuf', 'Identify all literary devices: tashbih, isti\'ara, kinaya, etc.', 'Write full 350-word Arabic linguistic commentary'],
    quranBridge: {
      arabic: 'نَحْنُ نَقُصُّ عَلَيْكَ أَحْسَنَ الْقَصَصِ',
      transliteration: "Nahnu naqussu alayka ahsanal-qasas",
      meaning: 'We narrate to you the best of stories.',
      note: 'أَحْسَنَ الْقَصَصِ (the best of stories — elative + genitive construction) — the Quran self-describes as superior narrative; linguistic commentary on Yusuf is the vindication of this claim.',
    },
  },
  {
    id: 'a272',
    stage: 'advanced',
    title: 'Advanced Arabic: Commands in the Quran — A Complete Survey',
    objective: 'Survey all major command types in the Quran — imperatives, subjunctives, jussives — and their purposes.',
    duration: '58 min',
    challengeLevel: 'Expert',
    drills: ['100 Quranic commands classified by form and purpose', 'What is the most common command verb in the Quran?', 'Grammar: distinction between command to Prophet vs command to believers vs command to humanity'],
    quranBridge: {
      arabic: 'قُلْ',
      transliteration: "Qul",
      meaning: 'Say.',
      note: 'قُلْ (Form I jussive as command: Say! — 332 times in the Quran) — the most frequent command in the entire Quran; the grammar of the prophetic office begins and ends with one word.',
    },
  },
  {
    id: 'a273',
    stage: 'advanced',
    title: 'Advanced Arabic: The Grammar of Divine Names (Asma al-Husna)',
    objective: 'Study the complete grammatical analysis of the 99 divine names — their morphological patterns.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['99 divine names: morphological pattern for each', 'Categorise by pattern: فَعِيل, فَعَّال, مُفْعِل, etc.', 'Which pattern is most frequent? What does this tell us about Arabic theology?'],
    quranBridge: {
      arabic: 'الرَّحْمَنُ الرَّحِيمُ',
      transliteration: "Ar-rahmanu r-rahim",
      meaning: 'The Most Gracious, the Most Merciful.',
      note: 'الرَّحْمَنُ (فَعْلَان pattern: extreme intensity, non-comparative) + الرَّحِيمُ (فَعِيل: permanent quality) — two patterns for mercy: Rahman for overwhelming cosmic mercy; Rahim for ongoing personal mercy.',
    },
  },
  {
    id: 'a274',
    stage: 'advanced',
    title: 'Surah al-Qiyama: The Full Parse',
    objective: 'Parse every word in Surah al-Qiyama (40 verses, ~180 words) — complete morphological analysis.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['Parse every word: yawma al-qiyama 1-40', 'Identify every unusual grammar feature in this surah', 'Write 10 analytical observations on the language of this surah'],
    quranBridge: {
      arabic: 'أَحْسِبُ الْإِنسَانُ أَن لَّن نَّجْمَعَ عِظَامَهُ',
      transliteration: "A-yahsabul-insanu an lan najmaa izamah",
      meaning: 'Does man think that We will not assemble his bones?',
      note: 'أَحْسِبُ...أَن لَّن (does he calculate...that never-will-we) — double negation emphasis: the human calculation against resurrection is answered by divine capability grammar.',
    },
  },
  {
    id: 'a275',
    stage: 'advanced',
    title: 'Advanced Arabic: The Language of Ibn Khaldun\'s al-Muqaddima',
    objective: 'Return to Ibn Khaldun with advanced eyes and read 400 words of his Muqaddima — sociological Arabic prose.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Read 400 words of al-Muqaddima: chapter on asabiyya', 'Ibn Khaldun\'s technical vocabulary: asabiyya, umran, badawa', 'Grammar: his use of causative constructions for sociological laws'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ لَا يُغَيِّرُ مَا بِقَوْمٍ حَتَّى يُغَيِّرُوا مَا بِأَنفُسِهِمْ',
      transliteration: "Innallaha la yughayyiru ma biqawmin hatta yughayyiru ma bi-anfusihim",
      meaning: 'Allah does not change the condition of a people until they change what is within themselves.',
      note: 'مَا بِأَنفُسِهِمْ (what is within themselves — what is internal to the group) — Ibn Khaldun\'s entire al-Muqaddima is a 600-page commentary on this one verse.',
    },
  },
  {
    id: 'a276',
    stage: 'advanced',
    title: 'Advanced Arabic: 500 Advanced Vocabulary Final Sprint',
    objective: 'Active recall of 500 high-frequency classical Arabic words — complete this before final exam.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['Set 1: 200 words rapid recall', 'Set 2: 200 words in context sentences', 'Set 3: 100 words production — use each in Arabic sentence'],
    quranBridge: {
      arabic: 'وَلَكِن تَعْمَى الْقُلُوبُ الَّتِي فِي الصُّدُورِ',
      transliteration: "Walakin tamyal-qulubu llati fis-sudur",
      meaning: 'But it is the hearts that are in the chests that go blind.',
      note: 'تَعْمَى الْقُلُوبُ (hearts go blind — impersonal causative) — vocabulary blindness is قَلْب blindness: when you cannot see the word, you cannot see the meaning of what Allah said.',
    },
  },
  {
    id: 'a277',
    stage: 'advanced',
    title: 'Surah al-Inshiqaq: The Sky Cracks',
    objective: 'Study al-Inshiqaq in full — the sky splitting, the stages of human development, the two groups\' final fate.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Inshiqaq 1-25 with harakat', 'Human journey vocabulary in this surah', 'Grammar: كَادِحٌ (active participle of struggle: striving) + كَدْحًا (cognate accusative)'],
    quranBridge: {
      arabic: 'يَا أَيُّهَا الْإِنسَانُ إِنَّكَ كَادِحٌ إِلَى رَبِّكَ كَدْحًا فَمُلَاقِيهِ',
      transliteration: "Ya ayyuhal-insanu innaka kadihun ila rabbika kadhan famulaqi",
      meaning: 'O man, indeed you are laboring toward your Lord with exertion and will meet Him.',
      note: 'كَادِحٌ كَدْحًا (cognate accusative: striving the greatest struggle — infinitive absolute) + فَمُلَاقِيهِ (active participle of meeting) — Arabic grammar compresses the entire human journey in 10 words.',
    },
  },
  {
    id: 'a278',
    stage: 'advanced',
    title: 'Advanced Arabic: Quran and Environmental Ethics',
    objective: 'Study the Quranic vocabulary and grammar for environmental stewardship (khilafa and fasad).',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['20 environmental vocabulary flashcards from the Quran', 'Grammar of khilafa: what does it mean to be Allah\'s deputy?', 'Write 150-word Arabic argument for Islamic environmental ethics'],
    quranBridge: {
      arabic: 'ظَهَرَ الْفَسَادُ فِي الْبَرِّ وَالْبَحْرِ بِمَا كَسَبَتْ أَيْدِي النَّاسِ',
      transliteration: "Zahara l-fasadu fil-barri walahri bima kasabat aydin-nas",
      meaning: 'Corruption has appeared throughout the land and sea by reason of what the hands of people have earned.',
      note: 'بِمَا كَسَبَتْ أَيْدِي النَّاسِ (because of what hands earned — causal بِ with relative clause) — environmental grammar: human hands as the active agent of fasad; accountability is grammatically personal.',
    },
  },
  {
    id: 'a279',
    stage: 'advanced',
    title: 'Advanced Arabic: Oral Examination Preparation',
    objective: 'Prepare for an advanced oral Arabic examination — fluent discussion of Quran, grammar, and Islamic topics.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Simulate 15-minute oral examination', 'Topics: grammar rule explanation, unseen text discussion, Arabic composition', 'Error correction: identify and correct 15 spoken grammar errors'],
    quranBridge: {
      arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي أَمْرِي وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي يَفْقَهُوا قَوْلِي',
      transliteration: "Rabbish rah li sadri wayassir li amri wahlul uqdatan min lisani yafqahu qawli",
      meaning: 'My Lord, expand for me my chest, ease for me my task, and untie the knot from my tongue that they may understand my speech.',
      note: 'وَاحْلُلْ عُقْدَةً مِّن لِّسَانِي (untie a knot from my tongue — partial untying!) + يَفْقَهُوا (jussive of result: so they understand) — Musa\'s prayer before speaking; the حَلّ is partial, the فَقَهَ is the goal.',
    },
  },
  {
    id: 'a280',
    stage: 'advanced',
    title: 'Advanced Milestone a280: Penultimate Comprehensive Review',
    objective: 'Assessment for a271-a279 — 50 lessons to the end.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['85-question comprehensive test', 'Translate 300-word classical Arabic passage to English', 'Write 400-word Arabic essay: "What I learned from 280 advanced lessons"'],
    quranBridge: {
      arabic: 'وَتَزَوَّدُوا فَإِنَّ خَيْرَ الزَّادِ التَّقْوَى',
      transliteration: "Watazawwadu fa-inna khayra z-zadi t-taqwa",
      meaning: 'And take provisions — for indeed the best provision is God-consciousness.',
      note: 'تَزَوَّدُوا (Form V: provision yourselves thoroughly — intensive self-provisioning) — 280 advanced lessons ARE زَاد for the Arabic journey; the best of which is love of the Quran.',
    },
  },
  {
    id: 'a281',
    stage: 'advanced',
    title: 'Advanced Arabic: Grammatical Revision — The Complete Noun System',
    objective: 'Final comprehensive revision of the complete Arabic noun system from indefinite to declined plurals.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Full noun system chart: all types, all cases, all states', 'Produce 50 Arabic nouns in all raf/nasb/jarr forms', 'Test: 30 nouns — give full case analysis for each'],
    quranBridge: {
      arabic: 'وَمَا مِن دَابَّةٍ إِلَّا هُوَ آخِذٌ بِنَاصِيَتِهَا',
      transliteration: "Wama min dabbatin illa huwa akhidhun binasiyatiha",
      meaning: 'And there is no creature but that He holds its forelock.',
      note: 'بِنَاصِيَتِهَا (by its forelock — genitive with ب + feminine possessive suffix) — a single Arabic noun with prefix, root, case ending, and suffix; the noun system in miniature.',
    },
  },
  {
    id: 'a282',
    stage: 'advanced',
    title: 'Advanced Arabic: Grammatical Revision — The Complete Verb System',
    objective: 'Final comprehensive revision of the complete Arabic verb system from Form I through X.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Full verb system chart: all 10 forms, all tenses, all moods', 'Conjugate 5 roots across all persons, numbers, and genders', 'Test: identify form, mood, and person for 50 Quranic verbs'],
    quranBridge: {
      arabic: 'يُسَبِّحُ لِلَّهِ مَا فِي السَّمَاوَاتِ وَمَا فِي الْأَرْضِ',
      transliteration: "Yusabbihu lillahi ma fis-samawati wama fil-ard",
      meaning: 'All that is in the heavens and earth exalts Allah.',
      note: 'يُسَبِّحُ (Form II present: glorifies continuously — every letter of this tasbih verb is Form II structure) — the verbal system is itself an act of tasbih; 282 lessons of verb study is this worship.',
    },
  },
  {
    id: 'a283',
    stage: 'advanced',
    title: 'Surah al-Ghashiya: The Overwhelming',
    objective: 'Study al-Ghashiya — eschatological vocabulary, judgment scene, divine creation argument.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Ghashiya 1-26 with harakat', 'Judgment Day sensory vocabulary in this surah', 'Grammar: أَفَلَا يَنظُرُونَ (do they not look — negative interrogative of cognitive demand)'],
    quranBridge: {
      arabic: 'أَفَلَا يَنظُرُونَ إِلَى الْإِبِلِ كَيْفَ خُلِقَتْ',
      transliteration: "Afala yandhuruna ilal-ibili kayfa khuliqat",
      meaning: 'Do they not look at the camels — how they were created?',
      note: 'كَيْفَ خُلِقَتْ (how was it created — indirect question embedded after direct question) — the Quran uses Arabic camels as the first point of theological argument: embedded interrogative leading to tawhid.',
    },
  },
  {
    id: 'a284',
    stage: 'advanced',
    title: 'Advanced Arabic: Grammar of Divine Judgment Declarations',
    objective: 'Study the full range of Quranic declarations about divine judgment — their grammatical patterns.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['20 divine judgment declaration examples', 'Grammar: how does Arabic express finality and irreversibility?', 'Why does Arabic use perfective past tense for future judgment events?'],
    quranBridge: {
      arabic: 'وَقُضِيَ الْأَمْرُ وَاسْتَوَتْ عَلَى الْجُودِيِّ',
      transliteration: "Waqudiya l-amru wastawa ala l-judiyy",
      meaning: 'And the matter was decided, and it came to rest upon al-Judi.',
      note: 'قُضِيَ الْأَمْرُ (passive perfect: the matter was decided — divinely, finally, irrevocably) — the passive removes the agent and places the full focus on the finality of the decree.',
    },
  },
  {
    id: 'a285',
    stage: 'advanced',
    title: 'Advanced Arabic: Surah al-Fajr — Complete Analysis',
    objective: 'Write a complete 400-word Arabic language analysis of Surah al-Fajr.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Fajr 1-30 with harakat', 'Identify every literary device in the surah', 'Write 400-word comprehensive Arabic analysis'],
    quranBridge: {
      arabic: 'يَا أَيَّتُهَا النَّفْسُ الْمُطْمَئِنَّةُ ارْجِعِي إِلَى رَبِّكِ رَاضِيَةً مَّرْضِيَّةً',
      transliteration: "Ya ayyatuhan-nafsul-mutmainnatu rjii ila rabbiki radhiyatan mardiyya",
      meaning: 'O tranquil soul, return to your Lord well-pleased and pleasing.',
      note: 'رَاضِيَةً مَّرْضِيَّةً (pleased and pleasing — double hal: two simultaneous states) — the nafس is both agent (pleased with Allah) and object (pleased by Allah): mutual grammatical pleasure.',
    },
  },
  {
    id: 'a286',
    stage: 'advanced',
    title: 'Advanced Arabic: Teaching Arabic Grammar to Others',
    objective: 'Prepare and deliver a 10-minute lesson on one Arabic grammar topic of your choice.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Prepare 10-minute grammar lesson: topic, examples, exercises, assessment', 'Deliver the lesson to a study partner or record it', 'Reflect: what made explanation difficult? What clarified?'],
    quranBridge: {
      arabic: 'خَيْرُكُمْ مَّن تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
      transliteration: "Khayrukum man taallama l-qur-ana wa-allamah",
      meaning: 'The best of you is one who learns the Quran and teaches it.',
      note: 'تَعَلَّمَ (Form V: learned for himself — reflexive process) + عَلَّمَهُ (Form II: taught others — transitive impact) — the grammar of Islamic excellence: both learning AND teaching are required.',
    },
  },
  {
    id: 'a287',
    stage: 'advanced',
    title: 'Surah al-Lail: Two Paths',
    objective: 'Study Surah al-Lail — two human types, two divine paths, the grammar of polar opposites.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Lail 1-21 with harakat', 'Binary opposites vocabulary in this surah', 'Grammar: فَأَمَّا...وَأَمَّا (as for...as for — distributive connector)'],
    quranBridge: {
      arabic: 'فَأَمَّا مَنْ أَعْطَى وَاتَّقَى وَصَدَّقَ بِالْحُسْنَى فَسَنُيَسِّرُهُ لِلْيُسْرَى',
      transliteration: "Fa-amma man aata wattaqa wasaddaqa bil-husna fasanuyasiruhu lil-yusra",
      meaning: 'As for him who gives and fears Allah and believes in the best — We will ease him toward ease.',
      note: 'فَأَمَّا...فَسَنُيَسِّرُهُ (as for...we will ease him — conditional distributive structure) + لِلْيُسْرَى (toward ease — definite superlative) — the grammar of divine reciprocity.',
    },
  },
  {
    id: 'a288',
    stage: 'advanced',
    title: 'Advanced Arabic: Complete Vocabulary Assessment — 1000 Words',
    objective: 'Final comprehensive vocabulary test: recall and produce 1000 advanced Arabic words in context.',
    duration: '120 min',
    challengeLevel: 'Expert',
    drills: ['500-word active recall round 1', '500-word active recall round 2', 'Context sentences: use 50 random words from the 1000 in correct Arabic sentences'],
    quranBridge: {
      arabic: 'وَمَن يُؤْتَ الْحِكْمَةَ فَقَدْ أُوتِيَ خَيْرًا كَثِيرًا',
      transliteration: "Waman yu-tal-hikmata faqad utiya khayran kathira",
      meaning: 'And whoever is given wisdom has certainly been given much good.',
      note: 'أُوتِيَ (passive: was given — divine passive) + خَيْرًا كَثِيرًا (great good — indefinite richness) — vocabulary IS wisdom; 1000 words is كَثِيرًا good given to the student.',
    },
  },
  {
    id: 'a289',
    stage: 'advanced',
    title: 'Surah al-Balad: The City',
    objective: 'Study Surah al-Balad in full — the oath on Makkah, the mountain pass of aqaba, and the two paths.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Balad 1-20 with harakat', 'The aqaba vocabulary: slavery, orphan, poor', 'Grammar: لَا أُقْسِمُ بِهَذَا الْبَلَدِ (the difficult oath negation)'],
    quranBridge: {
      arabic: 'وَمَا أَدْرَاكَ مَا الْعَقَبَةُ فَكُّ رَقَبَةٍ أَوْ إِطْعَامٌ فِي يَوْمٍ ذِي مَسْغَبَةٍ',
      transliteration: "Wama adraka mal-aqabah. fakku raqabatin aw it-amun fi yawmin dhi masghabah",
      meaning: 'And what can make you know what the steep pass is? It is the freeing of a slave or feeding in a day of severe hunger.',
      note: 'وَمَا أَدْرَاكَ (what can know you — bewilderment interrogative) + فَكُّ رَقَبَةٍ (masdar as definition: freeing of a neck) — the aqaba IS these acts; the grammar makes definition through action.',
    },
  },
  {
    id: 'a290',
    stage: 'advanced',
    title: 'Advanced Milestone a290: Final 40 Countdown',
    objective: 'Comprehensive assessment for a281-a289.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['90-question comprehensive test', 'Oral component: 10-minute advanced Arabic discussion', 'Write a 500-word Arabic research paragraph with citations'],
    quranBridge: {
      arabic: 'وَسَارِعُوا إِلَى مَغْفِرَةٍ مِّن رَّبِّكُمْ وَجَنَّةٍ عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ',
      transliteration: "Wasariu ila maghfiratin min rabbikum wajannatin ardhus-samawatu wal-ard",
      meaning: 'And hasten toward forgiveness from your Lord and a garden whose width spans the heavens and the earth.',
      note: 'عَرْضُهَا السَّمَاوَاتُ وَالْأَرْضُ (its width is the heavens and earth — nominal predicate measuring Paradise) — 290 advanced lessons: هَرْوِل to the finish of what the heavens-wide garden awaits.',
    },
  },
  {
    id: 'a291',
    stage: 'advanced',
    title: 'Advanced Arabic: Final Grammar — The Construct Chain (Idafa) Mastery',
    objective: 'Final comprehensive mastery of the Arabic idafa construct — simple, extended, and interrupted idafas.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['40 idafa chains — full case analysis', 'Interrupted idafa: 15 examples', 'Quran: find 20 extended idafas (3+ elements) and parse them fully'],
    quranBridge: {
      arabic: 'بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ',
      transliteration: "Bismillahir-rahmanir-rahim",
      meaning: 'In the name of Allah, the Most Gracious, the Most Merciful.',
      note: 'بِسْمِ اللَّهِ (two-element idafa: name [of] Allah) — the Quran begins with a perfect idafa; every Quranic action begins here.',
    },
  },
  {
    id: 'a292',
    stage: 'advanced',
    title: 'Advanced Arabic: Surah al-Baqarah Comprehensive Review',
    objective: 'Map all sections of al-Baqarah — its macro-structure, legal sections, stories, and theological arguments.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Map al-Baqarah 1-286 into thematic sections', 'Count: stories, commands, theological arguments, prayer directions', 'Grammar: how does al-Baqarah transition between topics grammatically?'],
    quranBridge: {
      arabic: 'شَهْرُ رَمَضَانَ الَّذِي أُنزِلَ فِيهِ الْقُرْآنُ هُدًى لِّلنَّاسِ',
      transliteration: "Shahru ramadanal-ladhi unzila fihil-qur-anu hudan lin-nas",
      meaning: 'The month of Ramadan is that in which the Quran was revealed as guidance for mankind.',
      note: 'هُدًى لِّلنَّاسِ (guidance for people — purpose noun in predicate position) — 292 lessons of this huda.',
    },
  },
  {
    id: 'a293',
    stage: 'advanced',
    title: 'Advanced Arabic: Al-Quran\'s Emotional Grammar',
    objective: 'Study how the Quran uses grammar to produce emotional effects — fear, hope, wonder, and comfort.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['10 fear-producing grammatical structures', '10 hope-producing grammatical structures', '10 wonder-producing grammatical structures'],
    quranBridge: {
      arabic: 'وَمَا أُبَرِّئُ نَفْسِي إِنَّ النَّفْسَ لَأَمَّارَةٌ بِالسُّوءِ',
      transliteration: "Wama ubarri-u nafsi innannafs la-ammarat bis-su",
      meaning: 'And I do not acquit myself — indeed the soul is a persistent enjoiner of evil.',
      note: 'لَأَمَّارَةٌ (mubalagha: INTENSELY commanding — فَعَّالَة: excessive commanding) — the soul\'s constant nagging described by the most intense Arabic pattern.',
    },
  },
  {
    id: 'a294',
    stage: 'advanced',
    title: 'Surah al-Shams: The Sun and the Soul',
    objective: 'Detailed analysis of Surah al-Shams — 11 oaths, the soul\'s two paths, and Thamud\'s fate.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Shams 1-15 with harakat', 'Count and categorise all oaths — 11 qasam structures', 'Grammar: فَأَلْهَمَهَا فُجُورَهَا وَتَقْوَاهَا structure'],
    quranBridge: {
      arabic: 'وَنَفْسٍ وَمَا سَوَّاهَا فَأَلْهَمَهَا فُجُورَهَا وَتَقْوَاهَا',
      transliteration: "Wanafsin wama sawwaha fa-alhamaha fujuraha wataqwaha",
      meaning: 'And the soul and He who proportioned it, then inspired it with its wickedness and its righteousness.',
      note: 'فَأَلْهَمَهَا (Form IV: inspired into her — divine inspiration directly into the soul) + فُجُورَهَا وَتَقْوَاهَا (her wickedness AND her righteousness — both together) — knowledge of both paths is divine gift.',
    },
  },
  {
    id: 'a295',
    stage: 'advanced',
    title: 'Advanced Arabic: Peer Translation Review',
    objective: 'Review and critique 3 published translations of the same Quranic passage — demonstrate superior linguistic knowledge.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Choose al-Fatiha translations by 3 different translators', 'Annotate each translation: what is gained and lost', 'Write a 200-word Arabic critique of the best translation'],
    quranBridge: {
      arabic: 'الصِّرَاطَ الْمُسْتَقِيمَ صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',
      transliteration: "As-siratal-mustaqim siratal-ladhina anamta alayhim",
      meaning: 'The straight path — the path of those You have blessed.',
      note: 'صِرَاطَ الَّذِينَ (path of those who — بدل: epexegetic apposition specifying which straight path) — every translator must decide: is this the same path or a defining second mention?',
    },
  },
  {
    id: 'a296',
    stage: 'advanced',
    title: 'Advanced Arabic: The Complete System of Arabic Particles',
    objective: 'Final comprehensive review of all Arabic particles: harakat particles, prepositions, connectors, and modals.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['All 7 nawasikh: effect on following sentence', 'All major prepositions: 5+ meanings each', 'All connectors: discourse function'],
    quranBridge: {
      arabic: 'أَلَا إِنَّ أَوْلِيَاءَ اللَّهِ لَا خَوْفٌ عَلَيْهِمْ وَلَا هُمْ يَحْزَنُونَ',
      transliteration: "Ala inna awliya-allahi la khawfun alayhim wala hum yahzanun",
      meaning: 'Unquestionably, the allies of Allah — no fear will there be concerning them, nor will they grieve.',
      note: 'أَلَا (attention particle) + إِنَّ (emphasis) + لَا خَوْفٌ (absolute negation) — four particles in one verse each performing distinct grammatical work.',
    },
  },
  {
    id: 'a297',
    stage: 'advanced',
    title: 'Surah al-Tin: The Fig and the Human Design',
    objective: 'Study Surah al-Tin — the 4 oaths, the elevation of man (ahsani taqwim), and the lower lowest.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Tin 1-8 with harakat', 'Anatomy and human excellence vocabulary', 'Grammar: أَحْسَنِ تَقْوِيمٍ (best proportion — elative in idafa)'],
    quranBridge: {
      arabic: 'لَقَدْ خَلَقْنَا الْإِنسَانَ فِي أَحْسَنِ تَقْوِيمٍ',
      transliteration: "Laqad khalaqnal-insana fi ahsani taqwim",
      meaning: 'We have indeed created man in the best proportion.',
      note: 'فِي أَحْسَنِ تَقْوِيمٍ (in the best proportion — locative of state) — Arabic grammar places man within perfection.',
    },
  },
  {
    id: 'a298',
    stage: 'advanced',
    title: 'Advanced Arabic: Writing a Khutba Draft',
    objective: 'Write a complete 400-word Friday khutba in classical Arabic following the traditional structure.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Traditional khutba structure: tahmid, salawat, waqfah, two khutbas', 'Write 400-word complete Arabic khutba draft on a chosen Islamic topic', 'Review for classical grammar adherence and rhetorical quality'],
    quranBridge: {
      arabic: 'إِنَّ اللَّهَ يَأْمُرُ بِالْعَدْلِ وَالْإِحْسَانِ وَإِيتَاءِ ذِي الْقُرْبَى',
      transliteration: "Innallaha yamuru bil-adli wal-ihsani wa-ita-i dhil-qurba",
      meaning: 'Indeed, Allah orders justice and good conduct and giving to relatives.',
      note: 'بِالْعَدْلِ وَالْإِحْسَانِ (three divine commands in ascending order) — the traditional Jumuah khutba closes with this verse; 298 lessons: we are ready to speak it.',
    },
  },
  {
    id: 'a299',
    stage: 'advanced',
    title: 'Advanced Arabic: Grammar of the Night Prayer Verses',
    objective: 'Study all Quranic verses describing night prayer (tahajjud, qiyam al-layl) — their grammatical depth.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['10 night prayer verses: grammar analysis', 'Why does the Quran prefer present tense for worship verbs?', 'Write a 150-word Arabic reflection on the tahajjud verses'],
    quranBridge: {
      arabic: 'وَمِنَ اللَّيْلِ فَتَهَجَّدْ بِهِ نَافِلَةً لَّكَ',
      transliteration: "Waminal-layli fatahajjad bihi nafilatan lak",
      meaning: 'And during part of the night, wake for prayer as an additional worship for you.',
      note: 'فَتَهَجَّدْ (Form V: forced wakefulness into devotion — tahajjud is the Form V of staying awake) + نَافِلَةً لَّكَ (additional for you) — the grammar of voluntary night prayer.',
    },
  },
  {
    id: 'a300',
    stage: 'advanced',
    title: 'Advanced Milestone a300: Triple Century Achievement',
    objective: 'Major comprehensive assessment at 300 advanced lessons — a monumental achievement.',
    duration: '120 min',
    challengeLevel: 'Expert',
    drills: ['100-question cumulative test', 'Full Quran surah analysis: read a complete surah, write 500-word Arabic commentary', 'Oral examination: 15-minute discussion on advanced Arabic linguistics'],
    quranBridge: {
      arabic: 'إِنَّ الَّذِينَ قَالُوا رَبُّنَا اللَّهُ ثُمَّ اسْتَقَامُوا تَتَنَزَّلُ عَلَيْهِمُ الْمَلَائِكَةُ',
      transliteration: "Innal-ladhina qalu rabbuna Allahu thummastaqamu tatanazzalu alayhimul-malaika",
      meaning: 'Indeed those who say "Our Lord is Allah" and then remain steadfast — the angels descend upon them.',
      note: 'ثُمَّ اسْتَقَامُوا (then they stayed straight — Form X of straightness) — 300 lessons: not just saying "I studied Arabic" but ثُمَّ اسْتِقَامَة: continuing day after day.',
    },
  },
  {
    id: 'a301',
    stage: 'advanced',
    title: 'Surah al-Alaq: The First Revelation',
    objective: 'Complete deep-structure analysis of Surah al-Alaq — the first revelation, its grammar, and its cosmos-reversing meaning.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Alaq 1-19 with harakat', 'First 5 verses: complete grammatical analysis of each word', 'كَلَّا its use throughout this surah'],
    quranBridge: {
      arabic: 'اقْرَأْ بِاسْمِ رَبِّكَ الَّذِي خَلَقَ',
      transliteration: "Iqra bismi rabbikallazi khalaq",
      meaning: 'Read in the name of your Lord who created.',
      note: 'اقْرَأْ (Form I imperative: Read! — the first word of revelation) + بِاسْمِ رَبِّكَ (in the name of your Lord — the manner of reading) — Arabic begins with an imperative command rather than mere statement.',
    },
  },
  {
    id: 'a302',
    stage: 'advanced',
    title: 'Advanced Arabic: Semantic Analysis of the First Word of Revelation',
    objective: 'Deep semantic and historical analysis of the first word of revelation: اقْرَأْ.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Root ق-ر-أ: all derivatives (qara\'a, qira\'a, quran...)', 'Historical context: what reading meant in 7th-century Arabia', '10 different scholarly interpretations of the first command'],
    quranBridge: {
      arabic: 'اقْرَأْ وَرَبُّكَ الْأَكْرَمُ الَّذِي عَلَّمَ بِالْقَلَمِ',
      transliteration: "Iqra warabbuka l-akramu alladhi allama bilqalam",
      meaning: 'Read, and your Lord is the Most Generous — who taught by the pen.',
      note: 'الْأَكْرَمُ (elative superlative: the Most Generous) — the Most Generous Lord commands reading: generosity and education are linguistically unified.',
    },
  },
  {
    id: 'a303',
    stage: 'advanced',
    title: 'Advanced Arabic: Polysemy in Quranic Vocabulary',
    objective: 'Study 20 Quranic words with multiple meanings — how context selects meaning across the Quran.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['20 polysemous words: 3 meanings each with Quranic examples', 'What principles help disambiguate polysemous Quranic vocabulary?', 'How do Tafsir scholars handle ambiguous vocabulary?'],
    quranBridge: {
      arabic: 'وَلَا تَقْرَبُوا الزِّنَى إِنَّهُ كَانَ فَاحِشَةً وَسَاءَ سَبِيلًا',
      transliteration: "Wala taqrabu z-zina innahu kana fahishatan wasa-a sabila",
      meaning: 'And do not approach unlawful intercourse. Indeed it is an immorality and an evil way.',
      note: 'لَا تَقْرَبُوا (do not approach — not do not DO) — the Quran prohibits approach, not just act; broader semantic field than English.',
    },
  },
  {
    id: 'a304',
    stage: 'advanced',
    title: 'Surah al-Kawthar: The Shortest Surah — Fullest Meaning',
    objective: 'Deep analysis of Surah al-Kawthar — 10 words, infinite meaning, complete grammatical density.',
    duration: '50 min',
    challengeLevel: 'Expert',
    drills: ['Parse every word of al-Kawthar (10 words)', '10 scholarly interpretations of الْكَوْثَر', 'Grammar: فَصَلِّ لِرَبِّكَ وَانْحَرْ — command pair analysis'],
    quranBridge: {
      arabic: 'إِنَّا أَعْطَيْنَاكَ الْكَوْثَرَ فَصَلِّ لِرَبِّكَ وَانْحَرْ إِنَّ شَانِئَكَ هُوَ الْأَبْتَرُ',
      transliteration: "Inna aataynaka l-kawthar fasalli lirabbika wanhar inna shani-aka huwal-abtar",
      meaning: 'Indeed We have given you the abundance. So pray to your Lord and sacrifice. Indeed your enemy is the one cut off.',
      note: 'الْكَوْثَرَ (al-kawthar: the much/the river of abundance — definite: THE abundance) — 3 verses, 10 Arabic words; the most linguistically efficient prophecy in human speech.',
    },
  },
  {
    id: 'a305',
    stage: 'advanced',
    title: 'Advanced Arabic: Grammar of Divine Love',
    objective: 'Study every Quranic expression of divine love — يُحِبُّ, وَدَّ, and their grammatical structures.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['All يُحِبُّ اللَّهُ verses: who does Allah love?', 'All لَا يُحِبُّ verses: who does Allah not love?', 'Grammar: مَحَبَّة vs مَوَدَّة — two words for love, two meanings'],
    quranBridge: {
      arabic: 'قُلْ إِن كُنتُمْ تُحِبُّونَ اللَّهَ فَاتَّبِعُونِي يُحْبِبْكُمُ اللَّهُ',
      transliteration: "Qul in kuntum tuhibbunallaha fattabiuni yuhbibkumullah",
      meaning: 'Say: If you love Allah, then follow me — Allah will love you.',
      note: 'يُحْبِبْكُمُ اللَّهُ (Form IV jussive: Allah will love you — conditional result) — the grammar of divine love: achievable consequence of following.',
    },
  },
  {
    id: 'a306',
    stage: 'advanced',
    title: 'Advanced Arabic: Surah al-Naba Complete Analysis',
    objective: 'Write a complete 450-word Arabic analysis of Surah al-Naba — narrative, grammar, and meaning.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Read al-Naba 1-40 with harakat', 'Identify 10 grammatical structures unique or notable in this surah', 'Write 450-word full Arabic analysis'],
    quranBridge: {
      arabic: 'إِنَّ يَوْمَ الْفَصْلِ كَانَ مِيقَاتًا',
      transliteration: "Inna yawmal-fasli kana miqata",
      meaning: 'Indeed, the Day of Judgment is an appointed time.',
      note: 'مِيقَاتًا (appointed time — a time set from the beginning of existence) — from و-ق-ت: the miqat of Makkah shares the root of the miqat of the Last Day.',
    },
  },
  {
    id: 'a307',
    stage: 'advanced',
    title: 'Advanced Arabic: Studying Under a Scholar',
    objective: 'Reflect on how to continue Arabic studies under Islamic scholars — the classical ijaza tradition.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Study the classical ijaza system', 'Famous chains of Islamic transmission: understand their structure', 'Write a personal plan for continuing Arabic study with scholars'],
    quranBridge: {
      arabic: 'فَاسْأَلُوا أَهْلَ الذِّكْرِ إِن كُنتُمْ لَا تَعْلَمُونَ',
      transliteration: "Fas-alu ahladh-dhikri in kuntum la talamun",
      meaning: 'Ask the people of knowledge if you do not know.',
      note: 'أَهْلَ الذِّكْرِ (people of the reminder — experts in Quran and knowledge) — the ijaza chain is the grammar of أَهْلَ الذِّكْرِ across 14 centuries.',
    },
  },
  {
    id: 'a308',
    stage: 'advanced',
    title: 'Advanced Arabic: Surah Yusuf Final Scene Analysis',
    objective: 'Study Yusuf 93-111 — the conclusion of the story, the reunion, the takwil dream fulfilled.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['Read Yusuf 93-111 with harakat', 'Dream fulfillment vocabulary: ta\'wil, ru\'ya', 'Grammar: يَا أَبَتِ (vocative with ta marbuta — intimate address)'],
    quranBridge: {
      arabic: 'يَا أَبَتِ هَذَا تَأْوِيلُ رُؤْيَايَ مِن قَبْلُ قَدْ جَعَلَهَا رَبِّي حَقًّا',
      transliteration: "Ya abati hadha ta-wilu ru-yaya min qablu qad jaalaharabbi haqqa",
      meaning: 'O my father, this is the interpretation of my dream of before — my Lord has made it true.',
      note: 'مِن قَبْلُ (from before — adverbial without following genitive) + قَدْ جَعَلَهَا (qad emphasising certainty of fulfillment) — the ta\'wil retroactively validates the ru\'ya.',
    },
  },
  {
    id: 'a309',
    stage: 'advanced',
    title: 'Advanced Arabic: Sufi Poetry and Arabic Theological Terms',
    objective: 'Study Arabic words in classical Persian Sufi poetry and the theological concepts they carry across languages.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['20 Arabic theological terms found in Rumi\'s Masnawi', 'How does Arabic morphological depth enrich Persian expression?', 'Write an Arabic verse in response to a Sufi stanza'],
    quranBridge: {
      arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      transliteration: "Ala bidhikrillahi tatmainnul-qulub",
      meaning: 'Unquestionably, by the remembrance of Allah hearts become assured.',
      note: 'تَطْمَئِنُّ (Form IX of t-m-a-n-n: settle into peacefulness) — Form IX in Arabic appears for internal color and state changes; the grammar of stillness is a Form IX verb.',
    },
  },
  {
    id: 'a310',
    stage: 'advanced',
    title: 'Advanced Milestone a310: Approaching the End',
    objective: 'Assessment for a301-a309.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['90-question final assessment', 'Write a 400-word Arabic paragraph using at least 20 grammatical structures', 'Oral: grammatical analysis of any 10 Quranic verses of your choice'],
    quranBridge: {
      arabic: 'وَلَا تَهِنُوا وَلَا تَحْزَنُوا وَأَنتُمُ الْأَعْلَوْنَ إِن كُنتُم مُّؤْمِنِينَ',
      transliteration: "Wala tahinu wala tahzanu wa-antumul-alawna in kuntum mu-minin",
      meaning: 'And do not weaken and do not grieve and you will be superior if you are believers.',
      note: 'وَأَنتُمُ الْأَعْلَوْنَ (nominal clause: you ARE the highest) — 310 lessons in, do not weaken; you ARE already in the highest among Arabic students.',
    },
  },
  {
    id: 'a311',
    stage: 'advanced',
    title: 'Advanced Arabic: Final Grammar Exam Preparation',
    objective: 'Full exam preparation review: every grammar topic, every structure type.',
    duration: '120 min',
    challengeLevel: 'Expert',
    drills: ['Review checklist: 50 grammar topics — mark confident/needs review', 'For each needs-review topic: complete 10-minute drill', 'Mock exam: 60-question grammar test'],
    quranBridge: {
      arabic: 'وَأَن لَّوِ اسْتَقَامُوا عَلَى الطَّرِيقَةِ لَأَسْقَيْنَاهُم مَّاءً غَدَقًا',
      transliteration: "Wa-an lawiistaqamu ala t-tariqa la-asqaynahum maan ghadaqa",
      meaning: 'And that if they had remained straight on the path, We would have given them water in abundance.',
      note: 'لَوِ اسْتَقَامُوا...لَأَسْقَيْنَاهُمْ (counterfactual condition: divine abundance comes with استقامة) — grammar exam: the مَاءً غَدَقًا of mastery comes with steadfastness.',
    },
  },
  {
    id: 'a312',
    stage: 'advanced',
    title: 'Advanced Arabic: Final Vocabulary Exam Preparation',
    objective: 'Complete vocabulary review — master 2000 advanced Arabic words.',
    duration: '120 min',
    challengeLevel: 'Expert',
    drills: ['1000-word vocabulary rapid recall (pass rate: 90%)', '500-word collocations and expressions', '500-word root-family derivation: given root, produce derivatives'],
    quranBridge: {
      arabic: 'وَقُرْآنًا فَرَقْنَاهُ لِتَقْرَأَهُ عَلَى النَّاسِ عَلَى مُكْثٍ وَنَزَّلْنَاهُ تَنزِيلًا',
      transliteration: "Waquran faraqnahu litaqra-ahu alan-nasi ala mukhthin wanazzalnahu tanzila",
      meaning: 'And it is a Quran We have separated — for you to recite to the people over a prolonged period.',
      note: 'عَلَى مُكْثٍ (over a measured interval — gradual, not all at once) — Quranic vocabulary came gradually; we learned Arabic vocabulary gradually; the method is the message.',
    },
  },
  {
    id: 'a313',
    stage: 'advanced',
    title: 'Surah al-Ikhlas: Advanced Theological Grammar',
    objective: 'Deep theological-grammatical analysis of Surah al-Ikhlas — the deepest possible study of 4 verses.',
    duration: '65 min',
    challengeLevel: 'Expert',
    drills: ['Parse every word: 15 words, 10+ grammatical structures', '15 scholarly explanations of هُوَ from tafsir works', 'Why does the surah end with negation structure كُفُوًا أَحَدٌ?'],
    quranBridge: {
      arabic: 'قُلْ هُوَ اللَّهُ أَحَدٌ اللَّهُ الصَّمَدُ لَمْ يَلِدْ وَلَمْ يُولَدْ وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',
      transliteration: "Qul huwa Allahu ahad. Allahus-samad. Lam yalid walam yulad. Walam yakun lahu kufuwan ahad.",
      meaning: 'Say: He is Allah, One. Allah, the Eternal Refuge. He neither begot nor was born. And there is none equal to Him.',
      note: 'كُفُوًا أَحَدٌ (equal-one — fronted predicate: literally "equal is not one") — the fronting targets the type of comparison; grammar refutes shirk structurally.',
    },
  },
  {
    id: 'a314',
    stage: 'advanced',
    title: 'Advanced Arabic: Your Islamic Library in Arabic',
    objective: 'Build a personal reading list — 20 classical Arabic books you commit to reading in the coming years.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['20 classical books: list with author, topic, difficulty level', 'Set a reading schedule: 1 page per day = how many books in 5 years?', 'Begin: read the first page of your first chosen book'],
    quranBridge: {
      arabic: 'اتْلُ مَا أُوحِيَ إِلَيْكَ مِنَ الْكِتَابِ',
      transliteration: "Utlu ma uhiya ilayka minal-kitab",
      meaning: 'Recite what has been revealed to you of the Book.',
      note: 'اتْلُ (Form I: recite/read — continuous present command) — your Arabic library list is the grammar of this lifelong command.',
    },
  },
  {
    id: 'a315',
    stage: 'advanced',
    title: 'Advanced Arabic: Surah al-Fatiha as the Key to the Quran',
    objective: 'Final advanced analysis of al-Fatiha — every word, every clause, every theological implication.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Parse al-Fatiha word by word: give 3 levels of analysis for each', 'Write a 500-word Arabic essay on al-Fatiha as the opening statement', 'Recite al-Fatiha and narrate its full grammatical story aloud'],
    quranBridge: {
      arabic: 'وَلَقَدْ آتَيْنَاكَ سَبْعًا مِّنَ الْمَثَانِي وَالْقُرْآنَ الْعَظِيمَ',
      transliteration: "Walaqad ataynaka sabam minal-mathani walquranal-azim",
      meaning: 'And We have certainly given you seven of the often-repeated verses and the great Quran.',
      note: 'سَبْعًا مِّنَ الْمَثَانِي (seven of the repeatedly recited — al-Fatiha\'s title) — al-Fatiha is the Quran within the Quran; studying it is studying all of the Quran.',
    },
  },
  {
    id: 'a316',
    stage: 'advanced',
    title: 'Advanced Arabic: Comprehensive Grammar Write-Up',
    objective: 'Write a personal 500-word Arabic grammar reference document covering the 20 most important rules you learned.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Select your 20 most important grammar rules', 'Write in Arabic: each rule clearly stated with 2 examples', 'Review: is your written Arabic now native-level in clarity?'],
    quranBridge: {
      arabic: 'وَمَن يَخْرُجْ مِن بَيْتِهِ مُهَاجِرًا إِلَى اللَّهِ وَرَسُولِهِ ثُمَّ يُدْرِكْهُ الْمَوْتُ فَقَدْ وَقَعَ أَجْرُهُ عَلَى اللَّهِ',
      transliteration: "Waman yakhruj min baytihi muhajiran ilallahi warasulihi thumma yudrikhu l-mawtu faqad waqaa ajruhu alallah",
      meaning: 'And whoever leaves his home as an emigrant to Allah and His Messenger and then death overtakes him — his reward has already fallen upon Allah.',
      note: 'فَقَدْ وَقَعَ أَجْرُهُ عَلَى اللَّهِ (his reward has fallen upon Allah — prophetic perfect: already guaranteed) — writing your grammar reference: even the journey to document what you know is rewarded.',
    },
  },
  {
    id: 'a317',
    stage: 'advanced',
    title: 'Advanced Arabic: Review of the Entire Curriculum',
    objective: 'Complete review of all stages: Alphabet → Beginner → Intermediate → Advanced. See how far you have come.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['Return to Lesson al1: parse with advanced eyes', 'Return to Lesson b1: parse with advanced eyes', 'Compare what you see now vs what you saw at the beginning'],
    quranBridge: {
      arabic: 'رَبَّنَا وَابْعَثْ فِيهِمْ رَسُولًا مِّنْهُمْ يَتْلُو عَلَيْهِمْ آيَاتِكَ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ',
      transliteration: "Rabbana wab-ath fihim rasulan minhum yatlu alayhim ayatika wayuallimuhumul-kitaba wal-hikma",
      meaning: 'Our Lord, send among them a messenger who will recite to them your verses and teach them the Book and wisdom.',
      note: 'يَتْلُو...وَيُعَلِّمُهُمُ (recites...and teaches — dual parallel participles) — Ibrahim\'s prayer was answered; the prophet taught Arabic; you followed the chain.',
    },
  },
  {
    id: 'a318',
    stage: 'advanced',
    title: 'Advanced Arabic: Language Journal — Reflection',
    objective: 'Write a 500-word Arabic reflection on your Arabic language journey — progress, struggles, breakthroughs.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Write 500-word Arabic personal narrative of your learning journey', 'Identify 5 specific grammatical breakthroughs you had', 'Write a personal Arabic dua for mastery of the language'],
    quranBridge: {
      arabic: 'وَكَذَلِكَ أَوْحَيْنَا إِلَيْكَ رُوحًا مِّنْ أَمْرِنَا مَا كُنتَ تَدْرِي مَا الْكِتَابُ وَلَا الْإِيمَانُ',
      transliteration: "Wakadhhalika awhayna ilayka ruhan min amrina ma kunta tadri mal-kitaba wala l-iman",
      meaning: 'And thus We have revealed to you a spirit from Our command — you did not know what the Book was or what faith was.',
      note: 'مَا كُنتَ تَدْرِي (you did not know) — before this curriculum, every student began مَا كُنتَ تَدْرِي; now, with 318 lessons, you know.',
    },
  },
  {
    id: 'a319',
    stage: 'advanced',
    title: 'Advanced Arabic: Teaching Arabic — Full Lesson Plan',
    objective: 'Write a complete lesson plan for teaching an Arabic grammar lesson to beginners.',
    duration: '75 min',
    challengeLevel: 'Expert',
    drills: ['Full lesson plan: objective, vocabulary, grammar, exercises, assessment', 'Write 5 practice exercises for students', 'Teaching Arabic teaches you: what gaps did planning reveal?'],
    quranBridge: {
      arabic: 'وَإِذْ أَخَذَ اللَّهُ مِيثَاقَ الَّذِينَ أُوتُوا الْكِتَابَ لَتُبَيِّنُنَّهُ لِلنَّاسِ وَلَا تَكْتُمُونَهُ',
      transliteration: "Wa-idh akhadha Allahu mithaqa lladhina utu l-kitaab latubayyin-nahu lin-nasi wala tuktimunah",
      meaning: 'And when Allah took the covenant of those given the Book: Make it clear to the people and do not conceal it.',
      note: 'لَتُبَيِّنُنَّهُ (lam of oath + Form II: you SHALL make it clear) + لَا تَكْتُمُونَهُ (do not conceal it) — teaching Arabic is a divine covenant for those who received it.',
    },
  },
  {
    id: 'a320',
    stage: 'advanced',
    title: 'Advanced Milestone a320: Penultimate Milestone',
    objective: 'Assessment for a311-a319.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['90-question comprehensive test', 'Oral final rehearsal: 15-minute advanced Arabic discussion', '10 lessons remaining: set your goals for each final lesson'],
    quranBridge: {
      arabic: 'وَعَجِلْتُ إِلَيْكَ رَبِّ لِتَرْضَى',
      transliteration: "Wa-ajiltu ilayka rabbi litarda",
      meaning: 'And I hastened to You, my Lord, that You might be pleased.',
      note: 'عَجِلْتُ إِلَيْكَ (I hastened toward you) + لِتَرْضَى (so that you be pleased) — a320: 10 lessons remain; عَجِلْتُ toward completion.',
    },
  },
  {
    id: 'a321',
    stage: 'advanced',
    title: 'Advanced Arabic: The 5 Pillars in Grammar',
    objective: 'Parse the Quranic verses commanding each of the 5 pillars — a complete grammar of Islamic practice.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['5 pillars: 1 surah verse each + complete grammatical analysis', 'Shahadah structure, salah command, sawm passive, zakat command, hajj command', 'Identify common grammar features of divine obligation commands'],
    quranBridge: {
      arabic: 'وَلِلَّهِ عَلَى النَّاسِ حِجُّ الْبَيْتِ مَنِ اسْتَطَاعَ إِلَيْهِ سَبِيلًا',
      transliteration: "Walillahi alan-nasi hijjul-bayti manistata-a ilayhi sabila",
      meaning: 'And pilgrimage to the House is a duty to Allah for those who are able to make the journey.',
      note: 'لِلَّهِ عَلَى النَّاسِ (for Allah upon the people — obligation stated through two prepositional phrases) — the most precise obligation grammar.',
    },
  },
  {
    id: 'a322',
    stage: 'advanced',
    title: 'Advanced Arabic: The Language of Islamic Finance',
    objective: 'Study 30 Islamic finance vocabulary terms in Arabic — from riba to musharaka.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['30 Islamic finance vocabulary flashcards', 'Al-Baqarah 275-280: Quranic grammar of prohibited and permitted transactions', 'Grammar: divine prohibition structure in finance verses'],
    quranBridge: {
      arabic: 'وَأَحَلَّ اللَّهُ الْبَيْعَ وَحَرَّمَ الرِّبَا',
      transliteration: "Wa-ahallallahu l-bay-a waharrama r-riba",
      meaning: 'Allah has permitted trade and forbidden interest.',
      note: 'أَحَلَّ (Form IV: permitted — declared halal) + حَرَّمَ (Form II: forbade — declared haram) — Form IV vs Form II: permission and prohibition use different morphological intensities.',
    },
  },
  {
    id: 'a323',
    stage: 'advanced',
    title: 'Advanced Arabic: Surah al-Zilzal and al-Adiyat Combined',
    objective: 'Study the back-to-back surahs al-Zilzal and al-Adiyat — contrasting grammatical styles.',
    duration: '55 min',
    challengeLevel: 'Expert',
    drills: ['Parse al-Zilzal 1-8 (earthquake grammar)', 'Parse al-Adiyat 1-11 (oath + running horse grammar)', 'Contrast: al-Zilzal names explicit, al-Adiyat uses pronoun chains — why?'],
    quranBridge: {
      arabic: 'فَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ خَيْرًا يَرَهُ وَمَن يَعْمَلْ مِثْقَالَ ذَرَّةٍ شَرًّا يَرَهُ',
      transliteration: "Faman yamal mithqala dharra-tin khayran yarah. Waman yamal mithqala dharra-tin sharran yarah.",
      meaning: 'So whoever does an atom\'s weight of good will see it, and whoever does an atom\'s weight of evil will see it.',
      note: 'مِثْقَالَ ذَرَّةٍ (weight of an atom — accusative measure) — the grammar of divine accountability operates at the sub-atomic level.',
    },
  },
  {
    id: 'a324',
    stage: 'advanced',
    title: 'Advanced Arabic: The Language of Prayer (Dua) Composition',
    objective: 'Compose 3 original duas in classical Arabic — following Quranic grammar and etiquette.',
    duration: '70 min',
    challengeLevel: 'Expert',
    drills: ['Review 30 Quranic dua structures as models', 'Write 3 original duas: personal, family, and community need', 'Review for classical grammar and dua etiquette'],
    quranBridge: {
      arabic: 'رَبِّ أَوْزِعْنِي أَنْ أَشْكُرَ نِعْمَتَكَ الَّتِي أَنْعَمْتَ عَلَيَّ وَعَلَى وَالِدَيَّ',
      transliteration: "Rabbi awzini an ashkura niamataka llati anamta alayya waala walidayya",
      meaning: 'My Lord, inspire me to be grateful for Your favor which You have bestowed upon me and upon my parents.',
      note: 'أَوْزِعْنِي (Form IV: inspire within me to be inclined — divine motivational planting) — the grammar of gratitude dua: asking Allah to plant thankfulness inside you.',
    },
  },
  {
    id: 'a325',
    stage: 'advanced',
    title: 'Advanced Milestone a325: Five Lessons to Go',
    objective: 'Assessment at the a321-a324 range — nearly there.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['90-question test', 'Review: what are the 5 Arabic grammar points you still find hardest?', 'Focus drill: 30 minutes intensive practice on your hardest points'],
    quranBridge: {
      arabic: 'فَإِذَا عَزَمْتَ فَتَوَكَّلْ عَلَى اللَّهِ',
      transliteration: "Fa-idha azamta fatawakkal alallah",
      meaning: 'And when you have decided, then rely upon Allah.',
      note: 'عَزَمْتَ (Form I: you made a firm resolve) + فَتَوَكَّلْ (Form V: then hand it over completely in trust) — 5 lessons: عَزَمْتَ; now تَوَكَّلْ.',
    },
  },
  {
    id: 'a326',
    stage: 'advanced',
    title: 'Advanced Arabic: Reading the Quran with New Eyes',
    objective: 'Read any 5 surahs you have not studied in depth and observe what you now notice grammatically.',
    duration: '80 min',
    challengeLevel: 'Expert',
    drills: ['Read 5 surahs you chose: mark every grammar feature you recognise', 'List the 10 most interesting grammar features you discovered', 'Write a 200-word reflection: what Arabic gave you in this reading'],
    quranBridge: {
      arabic: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ وَلَوْ كَانَ مِنْ عِندِ غَيْرِ اللَّهِ لَوَجَدُوا فِيهِ اخْتِلَافًا كَثِيرًا',
      transliteration: "Afala yatadabbarunal-qur-ana walaw kana min indi ghayri Allahi lawajadu fihi ikhtilafan kathira",
      meaning: 'Will they not ponder the Quran? Had it been from other than Allah, they would have found in it much inconsistency.',
      note: 'اخْتِلَافًا كَثِيرًا (much inconsistency — indefinite: any and much) — 326 advanced lessons of Arabic now allow independent verification of this claim.',
    },
  },
  {
    id: 'a327',
    stage: 'advanced',
    title: 'Advanced Arabic: Islamic Scholarship Today',
    objective: 'Discuss in Arabic the state of contemporary Arabic scholarship — its centres, its challenges, its future.',
    duration: '60 min',
    challengeLevel: 'Expert',
    drills: ['5 major contemporary Islamic scholarship centres', 'Write 200-word Arabic paragraph on challenges facing Arabic scholarship today', 'Grammar: formal academic Arabic for institutional discussion'],
    quranBridge: {
      arabic: 'يَرْفَعِ اللَّهُ الَّذِينَ آمَنُوا مِنكُمْ وَالَّذِينَ أُوتُوا الْعِلْمَ دَرَجَاتٍ',
      transliteration: "Yarfaallahu lladhina amanu minkum walladhina uto l-ilma darajat",
      meaning: 'Allah raises those who have believed among you and those given knowledge by many degrees.',
      note: 'دَرَجَاتٍ (degrees — accusative of result: raised BY degrees) — belief + knowledge together determine divine elevation; this curriculum gave both.',
    },
  },
  {
    id: 'a328',
    stage: 'advanced',
    title: 'Advanced Arabic: Your Personal Quranic Vocabulary Bank',
    objective: 'Compile a personal Quranic vocabulary bank of 500 words with roots, meanings, and usage examples.',
    duration: '90 min',
    challengeLevel: 'Expert',
    drills: ['Compile 500-word personal vocabulary bank', 'Each entry: root, Form, meaning, 1 Quranic example', 'Review: what vocabulary themes matter most to you personally?'],
    quranBridge: {
      arabic: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
      transliteration: "Wanunazzilu minal-qur-ani ma huwa shifa-un warahmatun lil-mu-minin",
      meaning: 'And We send down of the Quran that which is a healing and a mercy for the believers.',
      note: 'شِفَاءٌ وَرَحْمَةٌ (healing and mercy — pair of predicates: the Quran IS both simultaneously) — your vocabulary bank is a pharmacy of divine words.',
    },
  },
  {
    id: 'a329',
    stage: 'advanced',
    title: 'Advanced Arabic: The Final Review — All Stages Combined',
    objective: 'Final comprehensive review of all 329 advanced lessons and all prior stages.',
    duration: '120 min',
    challengeLevel: 'Expert',
    drills: ['Complete an Arabic text beginning to end: 500 words unseen', 'Identify: morphology, syntax, pragmatics, rhetoric in the text', 'Present: 10-minute oral analysis of your chosen text'],
    quranBridge: {
      arabic: 'إِنَّ هَذَا لَفِي الصُّحُفِ الْأُولَى صُحُفِ إِبْرَاهِيمَ وَمُوسَى',
      transliteration: "Inna hadha lafi s-suhufi l-ula. Suhufi Ibrahima waMusa.",
      meaning: 'Indeed, this is in the former scriptures — the scriptures of Ibrahim and Musa.',
      note: 'لَفِي الصُّحُفِ الْأُولَى (lam of oath: truly IN the first scriptures) — all Arabic knowledge links to صُحُف; your 329 lessons are in direct continuity.',
    },
  },
  {
    id: 'a330',
    stage: 'advanced',
    title: 'ADVANCED GRADUATION — 330 Lessons: Arabic Is Now Your Language',
    objective: 'Celebrate 330 advanced lessons and the complete Arabic Learning Hub curriculum. You are now an advanced Arabic student capable of independent scholarship.',
    duration: '120 min',
    challengeLevel: 'Expert',
    drills: [
      'Write a 600-word graduation essay in Arabic: "What Arabic has opened for me"',
      'Recite al-Fatiha then parse it completely from memory',
      'Choose one Arabic book from your library list and read the opening 3 pages — alone, without help',
      'Write your next 5-year Arabic learning goals in Arabic',
    ],
    quranBridge: {
      arabic: 'وَقُل رَّبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ وَاجْعَل لِّي مِن لَّدُنكَ سُلْطَانًا نَّصِيرًا',
      transliteration: "Waqul rabbi adkhilni mudkhala sidqin wa-akhrijni mukhraja sidqin wajal li min ladunka sultanan nasira",
      meaning: 'And say: My Lord, cause me to enter a truthful entry and to exit a truthful exit and grant me from Yourself a supporting authority.',
      note: 'مُدْخَلَ صِدْقٍ وَمُخْرَجَ صِدْقٍ (entry of truth + exit of truth — مَفْعَل masdars) — ARABIC GRADUATION: you entered with intention; you exit with authority. The مِن لَّدُنه سُلْطَان is now yours.',
    },
  },
];

const QUIZZES: Record<GameId, { title: string; icon: typeof Gamepad2; questions: QuizQuestion[] }> = {
  letters: {
    title: 'Script Sprint',
    icon: Gamepad2,
    questions: [
      {
        id: 'l1',
        prompt: 'Which letter makes a deep throaty "kh" sound?',
        context: 'Focus on articulation point from upper throat.',
        options: ['ح', 'خ', 'ه', 'غ'],
        answer: 'خ',
        explanation: 'خ is pronounced with a stronger fricative sound than ح.',
      },
      {
        id: 'l2',
        prompt: 'Choose the correct letter for the heavy "q" sound.',
        context: 'This sound comes from the back of the tongue.',
        options: ['ك', 'ق', 'ج', 'غ'],
        answer: 'ق',
        explanation: 'ق is the deep qaf sound, different from ك (kaf).',
      },
      {
        id: 'l3',
        prompt: 'Which letter is "ayn"?',
        context: 'A unique Arabic consonant not found in English.',
        options: ['ء', 'ع', 'أ', 'غ'],
        answer: 'ع',
        explanation: 'ع is the iconic ayn sound and appears often in Quranic vocabulary.',
      },
      {
        id: 'l4',
        prompt: 'Find the letter that sounds like an emphatic "s".',
        context: 'Heavier than regular س.',
        options: ['س', 'ص', 'ز', 'ث'],
        answer: 'ص',
        explanation: 'ص is the emphatic sad and has a full, heavy resonance.',
      },
    ],
  },
  vocab: {
    title: 'Word Hunter',
    icon: Target,
    questions: [
      {
        id: 'v1',
        prompt: 'What does رحمة (rahmah) mean?',
        context: 'A key Quranic concept.',
        options: ['Mercy', 'Power', 'Promise', 'Journey'],
        answer: 'Mercy',
        explanation: 'Rahmah means mercy, compassion, and gentle care.',
      },
      {
        id: 'v2',
        prompt: 'What does نور (nur) mean?',
        context: 'Often used in spiritual contexts.',
        options: ['Path', 'Light', 'Book', 'Truthfulness'],
        answer: 'Light',
        explanation: 'Nur means light, both physical and spiritual.',
      },
      {
        id: 'v3',
        prompt: 'What does كتاب (kitab) mean?',
        context: 'Appears frequently in the Quran.',
        options: ['Book', 'Heart', 'Prayer', 'Knowledge'],
        answer: 'Book',
        explanation: 'Kitab means book, writing, or scripture depending on context.',
      },
      {
        id: 'v4',
        prompt: 'What does صبر (sabr) mean?',
        context: 'Foundational character term.',
        options: ['Patience', 'Victory', 'Fear', 'Repentance'],
        answer: 'Patience',
        explanation: 'Sabr is patience, perseverance, and steadfastness.',
      },
    ],
  },
  grammar: {
    title: 'Grammar Arena',
    icon: Swords,
    questions: [
      {
        id: 'g1',
        prompt: 'In نعبد (nabudu), the prefix "na" indicates:',
        context: 'Verb prefix clue.',
        options: ['I', 'You', 'We', 'They'],
        answer: 'We',
        explanation: 'The prefix ن often marks first-person plural in present tense.',
      },
      {
        id: 'g2',
        prompt: 'What is the function of لا in لا ريب فيه?',
        context: 'Negation pattern.',
        options: ['Question marker', 'Negation', 'Emphasis', 'Condition'],
        answer: 'Negation',
        explanation: 'لا negates the noun phrase to mean "no doubt".',
      },
      {
        id: 'g3',
        prompt: 'In رب العالمين, this is an example of:',
        context: 'Phrase structure.',
        options: ['Idafa structure', 'Verb phrase', 'Question form', 'Oath form'],
        answer: 'Idafa structure',
        explanation: 'It is a possessive/genitive construction: Lord of the worlds.',
      },
      {
        id: 'g4',
        prompt: 'What does the particle إن often add?',
        context: 'Discourse effect.',
        options: ['Doubt', 'Emphasis', 'Past tense', 'Command'],
        answer: 'Emphasis',
        explanation: 'إن commonly adds certainty and emphasis.',
      },
    ],
  },
};

const ROOT_TRACKS: RootTrack[] = [
  {
    root: 'ر-ح-م',
    title: 'Mercy Constellation',
    concept: 'Mercy, compassion, and divine care',
    quranContext: 'Seen in الرحمان, الرحيم, and رحمة',
    words: [
      { word: 'الرَّحْمٰن', transliteration: 'ar-Rahman', meaning: 'The Entirely Merciful' },
      { word: 'رَحْمَة', transliteration: 'rahmah', meaning: 'Mercy' },
      { word: 'رَحِيم', transliteration: 'rahim', meaning: 'Especially Merciful' },
    ],
  },
  {
    root: 'ع-ل-م',
    title: 'Knowledge Network',
    concept: 'Knowledge, signs, and understanding',
    quranContext: 'Appears in علم, عليم, and تعليم themes',
    words: [
      { word: 'عِلْم', transliteration: 'ilm', meaning: 'Knowledge' },
      { word: 'عَلِيم', transliteration: 'alim', meaning: 'All-Knowing' },
      { word: 'يَعْلَمُ', transliteration: 'yalamu', meaning: 'He knows' },
    ],
  },
  {
    root: 'ه-د-ي',
    title: 'Guidance Pathway',
    concept: 'Guidance, direction, and upright path',
    quranContext: 'Frequent in hidayah and path imagery',
    words: [
      { word: 'هُدًى', transliteration: 'hudan', meaning: 'Guidance' },
      { word: 'اهْدِنَا', transliteration: 'ihdina', meaning: 'Guide us' },
      { word: 'مُهْتَدٍ', transliteration: 'muhtadin', meaning: 'One guided' },
    ],
  },
];

const DAILY_CHALLENGES = [
  'Read 8 ayat slowly and highlight words you already know.',
  'Memorize 5 new Quran words and use each in a simple Arabic phrase.',
  'Play one game round and score at least 75%.',
  'Practice one difficult sound family: ع / ح / خ for 7 minutes.',
  'Pick one root and map three related words from memory.',
  'Read Surah al-Asr and identify all grammatical particles.',
  'Teach one Arabic word to someone today for retention.',
];

const KIDS_AVATARS: KidsAvatar[] = [
  {
    id: 'falcon',
    name: 'Falcon Friend',
    emoji: '🦅',
    superpower: 'Spot hidden Arabic letters fast',
    color: 'from-sky-500 to-cyan-500',
  },
  {
    id: 'lion',
    name: 'Brave Lion',
    emoji: '🦁',
    superpower: 'Roars through tough sounds like ع and خ',
    color: 'from-amber-500 to-orange-500',
  },
  {
    id: 'dolphin',
    name: 'Wave Dolphin',
    emoji: '🐬',
    superpower: 'Glides through words with smooth reading',
    color: 'from-indigo-500 to-violet-500',
  },
  {
    id: 'fox',
    name: 'Smart Fox',
    emoji: '🦊',
    superpower: 'Finds root patterns and word families',
    color: 'from-rose-500 to-pink-500',
  },
];

const KIDS_QUESTS: KidsQuest[] = [
  {
    id: 'quest-1',
    title: 'Letter Scout',
    mission: 'Find and read 5 Arabic letters correctly.',
    rewardXp: 20,
    sticker: '🔤',
  },
  {
    id: 'quest-2',
    title: 'Word Explorer',
    mission: 'Memorize 3 Quran words and say their meanings.',
    rewardXp: 25,
    sticker: '🗺️',
  },
  {
    id: 'quest-3',
    title: 'Sound Hero',
    mission: 'Practice difficult sounds for 4 minutes.',
    rewardXp: 30,
    sticker: '🎤',
  },
  {
    id: 'quest-4',
    title: 'Ayah Reader',
    mission: 'Read one short ayah with calm pacing.',
    rewardXp: 30,
    sticker: '📖',
  },
];

const KIDS_CHALLENGES: KidsChallenge[] = [
  {
    id: 'kc1',
    prompt: 'Pick the letter that sounds like deep "kh".',
    helper: 'Look for the letter with a dot above and throat sound.',
    options: ['ح', 'خ', 'ه', 'ع'],
    answer: 'خ',
  },
  {
    id: 'kc2',
    prompt: 'Which word means "book"?',
    helper: 'You see this word often in learning contexts.',
    options: ['نُور', 'كِتَاب', 'صَبْر', 'رَحْمَة'],
    answer: 'كِتَاب',
  },
  {
    id: 'kc3',
    prompt: 'Choose the letter called "ayn".',
    helper: 'It is a unique Arabic sound from the throat.',
    options: ['غ', 'ء', 'ع', 'ق'],
    answer: 'ع',
  },
  {
    id: 'kc4',
    prompt: 'What does "صَبْر" mean?',
    helper: 'A beautiful Quran value about staying steady.',
    options: ['Patience', 'Light', 'Book', 'Truth'],
    answer: 'Patience',
  },
  {
    id: 'kc5',
    prompt: 'Pick the emphatic "s" letter.',
    helper: 'This one sounds heavier than س.',
    options: ['س', 'ز', 'ص', 'ث'],
    answer: 'ص',
  },
];

const KIDS_TREASURE_REWARDS: KidsTreasureReward[] = [
  { id: 'tr1', title: 'Golden Letter Card', emoji: '🏅', xp: 12, sparkles: 4 },
  { id: 'tr2', title: 'Quran Word Gem', emoji: '💎', xp: 18, sparkles: 6 },
  { id: 'tr3', title: 'Fluency Rocket', emoji: '🚀', xp: 22, sparkles: 7 },
  { id: 'tr4', title: 'Confidence Crown', emoji: '👑', xp: 28, sparkles: 8 },
];

const ADVENTURE_STORY_STEPS = [
  { id: 's1', title: 'Village Gate', requirement: 'Choose your adventure buddy.' },
  { id: 's2', title: 'Letter Forest', requirement: 'Complete 2 quests.' },
  { id: 's3', title: 'Word River', requirement: 'Claim your first treasure chest.' },
  { id: 's4', title: 'Sound Mountain', requirement: 'Score 4/5 in Balloon Pop.' },
  { id: 's5', title: 'Star Castle', requirement: 'Defeat the Guardian Boss challenge.' },
];

const ADVENTURE_FLOATING_ICONS = ['✨', '🌟', '🎈', '🎉', '🪄', '🧩'];

const DIALOGUE_PRACTICE = [
  {
    title: 'Masjid Arrival',
    lines: [
      { ar: 'السَّلَامُ عَلَيْكُمْ', tr: 'As-salamu alaykum', en: 'Peace be upon you' },
      { ar: 'وَعَلَيْكُمُ السَّلَامُ', tr: 'Wa alaykum as-salam', en: 'And peace be upon you' },
      { ar: 'كَيْفَ حَالُكَ؟', tr: 'Kayfa haluk?', en: 'How are you?' },
      { ar: 'أَنَا بِخَيْرٍ، الْحَمْدُ لِلَّهِ', tr: 'Ana bikhayr, alhamdulillah', en: 'I am well, praise be to Allah' },
    ],
  },
  {
    title: 'Quran Circle',
    lines: [
      { ar: 'هَلْ نَبْدَأُ الدَّرْسَ؟', tr: 'Hal nabdau ad-dars?', en: 'Shall we begin the lesson?' },
      { ar: 'نَعَمْ، هَيَّا نَبْدَأْ', tr: 'Naam, hayya nabda', en: 'Yes, let us begin' },
      { ar: 'مَا مَعْنَى هٰذِهِ الْآيَةِ؟', tr: 'Ma mana hadhihi al-ayah?', en: 'What is the meaning of this verse?' },
      { ar: 'مَعْنَاهَا عَظِيمٌ جِدًّا', tr: 'Manaha azimun jiddan', en: 'Its meaning is very profound' },
    ],
  },
  {
    title: 'Study Accountability',
    lines: [
      { ar: 'كَمْ كَلِمَةً حَفِظْتَ الْيَوْمَ؟', tr: 'Kam kalimatan hafizta al-yawm?', en: 'How many words did you memorize today?' },
      { ar: 'حَفِظْتُ خَمْسَ كَلِمَاتٍ', tr: 'Hafiztu khamsa kalimatin', en: 'I memorized five words' },
      { ar: 'مُمْتَازٌ، اِسْتَمِرَّ', tr: 'Mumtaz, istamir', en: 'Excellent, keep going' },
      { ar: 'جَزَاكَ اللّٰهُ خَيْرًا', tr: 'Jazakallahu khayran', en: 'May Allah reward you with goodness' },
    ],
  },
];

const PRONUNCIATION_PHRASES = [
  {
    id: 'pp1',
    label: 'Warmup Phrase',
    arabic: 'بِسْمِ اللهِ الرَّحْمٰنِ الرَّحِيمِ',
    transliteration: 'Bismillahir-rahmanir-rahim',
  },
  {
    id: 'pp2',
    label: 'Worship Focus',
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    transliteration: 'Iyyaka nabudu wa iyyaka nastain',
  },
  {
    id: 'pp3',
    label: 'Guidance Focus',
    arabic: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',
    transliteration: 'Ihdinas-siratal-mustaqim',
  },
  {
    id: 'pp4',
    label: 'Tadabbur Focus',
    arabic: 'أَفَلَا يَتَدَبَّرُونَ الْقُرْآنَ',
    transliteration: 'Afala yatadabbarunal-quran',
  },
];

const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  {
    id: 'p1',
    skill: 'Alphabet Recognition',
    prompt: 'How comfortable are you identifying Arabic letters quickly?',
    options: [
      { id: 'a', label: 'I still mix many letters and need slow practice.', points: 1 },
      { id: 'b', label: 'I know most letters but still hesitate sometimes.', points: 2 },
      { id: 'c', label: 'I can identify letters confidently and quickly.', points: 3 },
    ],
  },
  {
    id: 'p2',
    skill: 'Reading Fluency',
    prompt: 'When reading Quranic text, how often do you stop on basic words?',
    options: [
      { id: 'a', label: 'Very often. I still decode letter-by-letter.', points: 1 },
      { id: 'b', label: 'Sometimes. I can read but not yet smoothly.', points: 2 },
      { id: 'c', label: 'Rarely. I read short ayat with steady flow.', points: 3 },
    ],
  },
  {
    id: 'p3',
    skill: 'Vocabulary',
    prompt: 'How many common Quran words can you usually recognize without translation?',
    options: [
      { id: 'a', label: 'Very few, maybe under 20.', points: 1 },
      { id: 'b', label: 'A fair amount, around 20 to 80.', points: 2 },
      { id: 'c', label: 'Many, usually above 80 words.', points: 3 },
    ],
  },
  {
    id: 'p4',
    skill: 'Grammar Awareness',
    prompt: 'Can you usually spot simple pronouns or verb clues in an ayah?',
    options: [
      { id: 'a', label: 'Not yet, I need full explanation each time.', points: 1 },
      { id: 'b', label: 'Sometimes, if the structure is familiar.', points: 2 },
      { id: 'c', label: 'Yes, I can often identify them on my own.', points: 3 },
    ],
  },
  {
    id: 'p5',
    skill: 'Root Pattern Sense',
    prompt: 'How comfortable are you with identifying Arabic roots (like ر-ح-م)?',
    options: [
      { id: 'a', label: 'I have not practiced roots yet.', points: 1 },
      { id: 'b', label: 'I understand the idea and can identify some.', points: 2 },
      { id: 'c', label: 'I regularly identify roots across verses.', points: 3 },
    ],
  },
  {
    id: 'p6',
    skill: 'Comprehension Confidence',
    prompt: 'Without translation, how much of a short surah can you usually follow?',
    options: [
      { id: 'a', label: 'Only isolated words.', points: 1 },
      { id: 'b', label: 'Main ideas in parts of the surah.', points: 2 },
      { id: 'c', label: 'Most of the flow and message.', points: 3 },
    ],
  },
  {
    id: 'p7',
    skill: 'Pronunciation and Tajwid Readiness',
    prompt: 'How consistent is your Arabic pronunciation practice each week?',
    options: [
      { id: 'a', label: 'Inconsistent, I am just starting routine practice.', points: 1 },
      { id: 'b', label: 'Somewhat consistent, 2 to 3 days per week.', points: 2 },
      { id: 'c', label: 'Consistent, 4+ days per week.', points: 3 },
    ],
  },
  {
    id: 'p8',
    skill: 'Independent Study',
    prompt: 'Can you self-study one ayah by checking words, roots, and structure?',
    options: [
      { id: 'a', label: 'Not yet, I need guided help for each step.', points: 1 },
      { id: 'b', label: 'Partly, but I still need support for deeper analysis.', points: 2 },
      { id: 'c', label: 'Yes, I can run a full self-study routine.', points: 3 },
    ],
  },
];

const WEEKLY_SPRINTS: SprintWeek[] = [
  { week: 1, title: 'Sound Bootcamp', target: 'Master letter sounds and makharij basics.', output: 'Read short words without pausing.' },
  { week: 2, title: 'Vowel Velocity', target: 'Fathah, kasrah, dammah automatic recall.', output: 'Smoothly read short ayat segments.' },
  { week: 3, title: 'Word Power I', target: 'Memorize 35 high-frequency Quran words.', output: 'Recognize key words in al-Fatihah and al-Ikhlas.' },
  { week: 4, title: 'Grammar Sparks', target: 'Detect pronouns and simple verb clues.', output: 'Identify who is speaking in selected ayat.' },
  { week: 5, title: 'Word Power II', target: 'Add another 35 frequent words.', output: 'Understand larger chunks without translation.' },
  { week: 6, title: 'Root Discovery', target: 'Extract and map 3 core roots.', output: 'Track families like ر-ح-م and ه-د-ي.' },
  { week: 7, title: 'Reading Endurance', target: 'Longer recitation with understanding markers.', output: 'Read one full short surah with confidence.' },
  { week: 8, title: 'Comprehension Weave', target: 'Follow ayah-to-ayah thematic flow.', output: 'Summarize one short surah in your own words.' },
  { week: 9, title: 'Balaghah Signals', target: 'Notice emphasis and contrast structures.', output: 'Highlight rhetorical markers in chosen ayat.' },
  { week: 10, title: 'Independent Tadabbur', target: 'Run your own verse analysis workflow.', output: 'Weekly personal reflection notebook.' },
];

const defaultProgress: LearnerProgress = {
  completedLessons: [],
  xp: 0,
  streak: 0,
  gamesWon: 0,
  placementCompleted: false,
  lastActiveDate: null,
};

function getTodayIso() {
  return new Date().toISOString().slice(0, 10);
}

function getYesterdayIso() {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  return date.toISOString().slice(0, 10);
}

function withActivityUpdate(progress: LearnerProgress): LearnerProgress {
  const today = getTodayIso();
  if (progress.lastActiveDate === today) return progress;

  const nextStreak = progress.lastActiveDate === getYesterdayIso() ? progress.streak + 1 : 1;

  return {
    ...progress,
    streak: nextStreak,
    lastActiveDate: today,
  };
}

function getLevelFromXp(xp: number) {
  if (xp < 350) return { level: 'Seed Learner', nextTarget: 350 };
  if (xp < 900) return { level: 'Sentence Builder', nextTarget: 900 };
  return { level: 'Quran Language Explorer', nextTarget: 1300 };
}

function mergeProgress(local: LearnerProgress, remote: RemoteArabicProgress): LearnerProgress {
  const mergedLessons = Array.from(new Set([...local.completedLessons, ...remote.completedLessons]));

  const latestDate = [local.lastActiveDate, remote.lastActiveDate]
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) ?? null;

  return {
    completedLessons: mergedLessons,
    xp: Math.max(local.xp, remote.xp),
    streak: Math.max(local.streak, remote.streak),
    gamesWon: Math.max(local.gamesWon, remote.gamesWon),
    placementCompleted: local.placementCompleted || remote.placementCompleted,
    lastActiveDate: latestDate,
  };
}

export default function ArabicLearningPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<HubTabId>('path');
  const [activeStage, setActiveStage] = useState<StageId>('alphabet');
  const [lessonsPage, setLessonsPage] = useState(0);
  const [activeGame, setActiveGame] = useState<GameId>('letters');
  const [activeRootIndex, setActiveRootIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [roundScore, setRoundScore] = useState(0);
  const [roundComplete, setRoundComplete] = useState(false);
  const [rewardClaimed, setRewardClaimed] = useState(false);
  const [selectedAvatarId, setSelectedAvatarId] = useState(KIDS_AVATARS[0].id);
  const [claimedQuestIds, setClaimedQuestIds] = useState<string[]>([]);
  const [kidChallengeIndex, setKidChallengeIndex] = useState(0);
  const [kidSelectedOption, setKidSelectedOption] = useState<string | null>(null);
  const [kidScore, setKidScore] = useState(0);
  const [kidRoundComplete, setKidRoundComplete] = useState(false);
  const [kidRewardClaimed, setKidRewardClaimed] = useState(false);
  const [adventureSparkles, setAdventureSparkles] = useState(0);
  const [lastTreasureClaimDate, setLastTreasureClaimDate] = useState<string | null>(null);
  const [latestTreasureNote, setLatestTreasureNote] = useState<string | null>(null);
  const [bossCompleted, setBossCompleted] = useState(false);
  const [rewardBurst, setRewardBurst] = useState<{ icon: string; label: string } | null>(null);
  const [placementAnswers, setPlacementAnswers] = useState<Record<string, string>>({});
  const [placementSubmitted, setPlacementSubmitted] = useState(false);
  const [placementScore, setPlacementScore] = useState<number | null>(null);
  const [placementResult, setPlacementResult] = useState<StageId | null>(null);
  const [dailyMinutes, setDailyMinutes] = useState(25);
  const [daysPerWeek, setDaysPerWeek] = useState(5);
  const [journalEntry, setJournalEntry] = useState('');
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');
  const [syncError, setSyncError] = useState<string | null>(null);
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [canCreateAssignments, setCanCreateAssignments] = useState(false);
  const [schoolInfo, setSchoolInfo] = useState<SchoolSummary | null>(null);
  const [classOptions, setClassOptions] = useState<SchoolClassOption[]>([]);
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    focusArea: '',
    notes: '',
    dueDate: '',
    targetClassId: '',
    recommendedMinutes: 25,
    daysPerWeek: 5,
  });
  const [isLoadingAssignments, setIsLoadingAssignments] = useState(false);
  const [assignmentActionError, setAssignmentActionError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [selectedPhraseId, setSelectedPhraseId] = useState(PRONUNCIATION_PHRASES[0].id);
  const [audioClips, setAudioClips] = useState<Array<{ id: string; url: string; createdAt: string; durationMs: number }>>([]);
  const [audioError, setAudioError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordingStreamRef = useRef<MediaStream | null>(null);
  const recordingChunksRef = useRef<Blob[]>([]);
  const recordingStartedAtRef = useRef<number | null>(null);
  const audioClipUrlsRef = useRef<string[]>([]);
  const hasHydratedRemoteProgressRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rewardBurstTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [progress, setProgress] = useState<LearnerProgress>(defaultProgress);

  const todayMission = useMemo(() => {
    const dayCode = Number(getTodayIso().replace(/-/g, ''));
    return DAILY_CHALLENGES[dayCode % DAILY_CHALLENGES.length];
  }, []);

  const lessonsForStage = useMemo(
    () => LESSONS.filter((lesson) => lesson.stage === activeStage),
    [activeStage]
  );

  const totalLessonPages = Math.ceil(lessonsForStage.length / LESSONS_PER_PAGE);

  const paginatedLessons = useMemo(
    () => lessonsForStage.slice(lessonsPage * LESSONS_PER_PAGE, (lessonsPage + 1) * LESSONS_PER_PAGE),
    [lessonsForStage, lessonsPage]
  );

  // Reset to page 0 whenever the stage changes
  useEffect(() => { setLessonsPage(0); }, [activeStage]);

  const totalLessons = LESSONS.length;
  const completedCount = progress.completedLessons.length;
  const completionPercent = Math.round((completedCount / totalLessons) * 100);
  const remainingLessons = Math.max(0, totalLessons - completedCount);
  const levelInfo = getLevelFromXp(progress.xp);
  const xpProgress = Math.min(
    100,
    Math.round((progress.xp / levelInfo.nextTarget) * 100)
  );

  const placementAnsweredCount = Object.keys(placementAnswers).length;
  const placementProgressPercent = Math.round(
    (placementAnsweredCount / PLACEMENT_QUESTIONS.length) * 100
  );

  const weeklyHours = Number(((dailyMinutes * daysPerWeek) / 60).toFixed(1));
  const recommendedLessonsPerWeek = Math.max(1, Math.round((dailyMinutes * daysPerWeek) / 38));
  const estimatedWeeksToFinish = Math.max(1, Math.ceil(remainingLessons / recommendedLessonsPerWeek));

  const stageDoneFlags = useMemo(() => {
    const beginnerDone = LESSONS.filter((lesson) => lesson.stage === 'beginner').every((lesson) =>
      progress.completedLessons.includes(lesson.id)
    );
    const intermediateDone = LESSONS.filter((lesson) => lesson.stage === 'intermediate').every((lesson) =>
      progress.completedLessons.includes(lesson.id)
    );
    const advancedDone = LESSONS.filter((lesson) => lesson.stage === 'advanced').every((lesson) =>
      progress.completedLessons.includes(lesson.id)
    );

    return { beginnerDone, intermediateDone, advancedDone };
  }, [progress.completedLessons]);

  const milestoneBadges = useMemo(() => {
    return [
      {
        id: 'first-step',
        title: 'First Step',
        desc: 'Complete your first lesson.',
        unlocked: completedCount >= 1,
      },
      {
        id: 'placement-ready',
        title: 'Placement Ready',
        desc: 'Finish adaptive placement challenge.',
        unlocked: progress.placementCompleted,
      },
      {
        id: 'game-runner',
        title: 'Game Runner',
        desc: 'Win 5 game rounds.',
        unlocked: progress.gamesWon >= 5,
      },
      {
        id: 'streak-keeper',
        title: 'Streak Keeper',
        desc: 'Maintain a 7-day streak.',
        unlocked: progress.streak >= 7,
      },
      {
        id: 'foundation-complete',
        title: 'Foundation Complete',
        desc: 'Complete all beginner lessons.',
        unlocked: stageDoneFlags.beginnerDone,
      },
      {
        id: 'sentence-builder',
        title: 'Sentence Builder',
        desc: 'Complete all intermediate lessons.',
        unlocked: stageDoneFlags.intermediateDone,
      },
      {
        id: 'quran-explorer',
        title: 'Quran Explorer',
        desc: 'Reach 900 XP.',
        unlocked: progress.xp >= 900,
      },
      {
        id: 'master-track',
        title: 'Master Track',
        desc: 'Complete all Arabic hub lessons.',
        unlocked: completedCount >= totalLessons,
      },
    ];
  }, [
    completedCount,
    progress.gamesWon,
    progress.placementCompleted,
    progress.streak,
    progress.xp,
    stageDoneFlags.beginnerDone,
    stageDoneFlags.intermediateDone,
    totalLessons,
  ]);

  const quiz = QUIZZES[activeGame];
  const currentQuestion = quiz.questions[questionIndex];
  const roundPercent = Math.round((questionIndex / quiz.questions.length) * 100);
  const selectedAvatar = KIDS_AVATARS.find((avatar) => avatar.id === selectedAvatarId) ?? KIDS_AVATARS[0];
  const kidChallenge = KIDS_CHALLENGES[kidChallengeIndex];
  const kidRoundPercent = Math.round((kidChallengeIndex / KIDS_CHALLENGES.length) * 100);
  const collectedStickers = claimedQuestIds.length;
  const questCompletionPercent = Math.round((collectedStickers / KIDS_QUESTS.length) * 100);
  const canOpenTreasure = lastTreasureClaimDate !== getTodayIso();
  const adventureRankScore = progress.xp + adventureSparkles * 5 + collectedStickers * 15;
  const adventureRank =
    adventureRankScore < 250
      ? 'Little Explorer'
      : adventureRankScore < 600
        ? 'Brave Pathfinder'
        : adventureRankScore < 950
          ? 'Language Champion'
          : 'Quran Star Hero';
  const adventureMood =
    bossCompleted
      ? 'Legend mode unlocked'
      : collectedStickers >= 3
        ? 'On fire and leveling up'
        : 'Warmup mode for new learners';
  const bossUnlocked = collectedStickers === KIDS_QUESTS.length && kidScore >= 4;
  const storyUnlockCount = [
    true,
    collectedStickers >= 2,
    Boolean(lastTreasureClaimDate),
    kidScore >= 4,
    bossCompleted,
  ].filter(Boolean).length;
  const selectedPhrase = PRONUNCIATION_PHRASES.find((item) => item.id === selectedPhraseId) ?? PRONUNCIATION_PHRASES[0];
  const isTeacherOrPrincipal = schoolInfo?.role === 'TEACHER' || schoolInfo?.role === 'PRINCIPAL';
  const canManageAssignments = canCreateAssignments || isTeacherOrPrincipal || user?.role === 'ADMIN';
  const incomingAssignments = assignments.filter((item) => item.createdById !== user?.id);
  const createdAssignments = assignments.filter((item) => item.createdById === user?.id);
  const unlockedBadgeCount = milestoneBadges.filter((badge) => badge.unlocked).length;
  const avgClipDuration = audioClips.length
    ? Math.round(audioClips.reduce((sum, clip) => sum + clip.durationMs, 0) / audioClips.length)
    : 0;
  const pronunciationScore = Math.min(
    100,
    Math.round((Math.min(audioClips.length, 6) / 6) * 45 + (Math.min(avgClipDuration, 15000) / 15000) * 55)
  );

  useEffect(() => {
    document.title = 'Arabic Learning Hub | Deenify';
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const tab = new URLSearchParams(window.location.search).get('tab');
    if (!tab) return;

    const validTabs: HubTabId[] = ['path', 'adventure', 'games', 'bridge', 'speaking', 'revision', 'placement', 'planner', 'typing'];
    if (validTabs.includes(tab as HubTabId)) {
      setActiveTab(tab as HubTabId);
    }
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as LearnerProgress;
      setProgress({
        completedLessons: Array.isArray(parsed.completedLessons)
          ? parsed.completedLessons
          : [],
        xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
        streak: typeof parsed.streak === 'number' ? parsed.streak : 0,
        gamesWon: typeof parsed.gamesWon === 'number' ? parsed.gamesWon : 0,
        placementCompleted: typeof parsed.placementCompleted === 'boolean' ? parsed.placementCompleted : false,
        lastActiveDate:
          typeof parsed.lastActiveDate === 'string' ? parsed.lastActiveDate : null,
      });
    } catch {
      setProgress(defaultProgress);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { dailyMinutes?: number; daysPerWeek?: number };
      if (typeof parsed.dailyMinutes === 'number') {
        setDailyMinutes(Math.min(90, Math.max(10, parsed.dailyMinutes)));
      }
      if (typeof parsed.daysPerWeek === 'number') {
        setDaysPerWeek(Math.min(7, Math.max(2, parsed.daysPerWeek)));
      }
    } catch {
      // Ignore malformed local settings and keep defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ dailyMinutes, daysPerWeek })
    );
  }, [dailyMinutes, daysPerWeek]);

  useEffect(() => {
    const savedJournal = localStorage.getItem(JOURNAL_STORAGE_KEY);
    if (savedJournal) setJournalEntry(savedJournal);
  }, []);

  useEffect(() => {
    localStorage.setItem(JOURNAL_STORAGE_KEY, journalEntry);
  }, [journalEntry]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(ADVENTURE_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        selectedAvatarId?: string;
        claimedQuestIds?: string[];
        adventureSparkles?: number;
        lastTreasureClaimDate?: string | null;
        bossCompleted?: boolean;
      };

      if (typeof parsed.selectedAvatarId === 'string' && KIDS_AVATARS.some((avatar) => avatar.id === parsed.selectedAvatarId)) {
        setSelectedAvatarId(parsed.selectedAvatarId);
      }

      if (Array.isArray(parsed.claimedQuestIds)) {
        setClaimedQuestIds(parsed.claimedQuestIds.filter((id) => typeof id === 'string'));
      }

      if (typeof parsed.adventureSparkles === 'number') {
        setAdventureSparkles(Math.max(0, Math.floor(parsed.adventureSparkles)));
      }

      if (typeof parsed.lastTreasureClaimDate === 'string' || parsed.lastTreasureClaimDate === null) {
        setLastTreasureClaimDate(parsed.lastTreasureClaimDate ?? null);
      }

      if (typeof parsed.bossCompleted === 'boolean') {
        setBossCompleted(parsed.bossCompleted);
      }
    } catch {
      // Ignore malformed adventure mode settings and keep defaults.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      ADVENTURE_STORAGE_KEY,
      JSON.stringify({
        selectedAvatarId,
        claimedQuestIds,
        adventureSparkles,
        lastTreasureClaimDate,
        bossCompleted,
      })
    );
  }, [selectedAvatarId, claimedQuestIds, adventureSparkles, lastTreasureClaimDate, bossCompleted]);

  useEffect(() => {
    if (!user?.id || hasHydratedRemoteProgressRef.current) return;

    let cancelled = false;

    async function hydrateRemoteProgress() {
      try {
        const response = await fetch('/api/arabic-learning/progress', { cache: 'no-store' });
        if (!response.ok) return;

        const data = await response.json();
        const remote = data?.progress as RemoteArabicProgress | undefined;
        if (!remote || cancelled) return;

        setProgress((prev) => mergeProgress(prev, remote));
        if (typeof remote.dailyMinutes === 'number') {
          setDailyMinutes(Math.min(90, Math.max(10, remote.dailyMinutes)));
        }
        if (typeof remote.daysPerWeek === 'number') {
          setDaysPerWeek(Math.min(7, Math.max(2, remote.daysPerWeek)));
        }
        if (typeof remote.journalEntry === 'string' && remote.journalEntry.trim()) {
          setJournalEntry((prev) => (prev.trim() ? prev : remote.journalEntry));
        }
        hasHydratedRemoteProgressRef.current = true;
      } catch {
        // Keep local progress if remote hydration fails.
      }
    }

    hydrateRemoteProgress();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || !hasHydratedRemoteProgressRef.current) return;

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    syncTimeoutRef.current = setTimeout(async () => {
      try {
        setSyncStatus('syncing');
        setSyncError(null);

        const payload = {
          completedLessons: progress.completedLessons,
          xp: progress.xp,
          streak: progress.streak,
          gamesWon: progress.gamesWon,
          placementCompleted: progress.placementCompleted,
          lastActiveDate: progress.lastActiveDate,
          dailyMinutes,
          daysPerWeek,
          journalEntry,
        };

        const response = await fetch('/api/arabic-learning/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => ({ error: 'Sync failed.' }));
          throw new Error(data.error || 'Sync failed.');
        }

        setSyncStatus('synced');
      } catch (error) {
        setSyncStatus('error');
        setSyncError(error instanceof Error ? error.message : 'Sync failed.');
      }
    }, 700);

    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [
    user?.id,
    progress.completedLessons,
    progress.gamesWon,
    progress.lastActiveDate,
    progress.placementCompleted,
    progress.streak,
    progress.xp,
    dailyMinutes,
    daysPerWeek,
    journalEntry,
  ]);

  async function loadAssignments() {
    if (!user?.id) return;

    setIsLoadingAssignments(true);
    setAssignmentActionError(null);

    try {
      const response = await fetch('/api/arabic-learning/assignments', { cache: 'no-store' });
      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to load assignments.' }));
        throw new Error(data.error || 'Failed to load assignments.');
      }

      const data = await response.json();
      setAssignments(Array.isArray(data.assignments) ? data.assignments : []);
      setCanCreateAssignments(Boolean(data.canCreateAssignments));
    } catch (error) {
      setAssignmentActionError(error instanceof Error ? error.message : 'Failed to load assignments.');
    } finally {
      setIsLoadingAssignments(false);
    }
  }

  useEffect(() => {
    if (!user?.id) return;

    let cancelled = false;

    async function hydrateSchoolContext() {
      try {
        const schoolResponse = await fetch('/api/madresah/my-school', { cache: 'no-store' });
        if (!schoolResponse.ok) return;
        const schoolData = await schoolResponse.json();
        if (cancelled || !schoolData?.madresahId) return;

        const role = schoolData.role as SchoolSummary['role'];
        setSchoolInfo({ madresahId: schoolData.madresahId, name: schoolData.name, role });

        const classesResponse = await fetch(`/api/madresah/${schoolData.madresahId}/classes`, { cache: 'no-store' });
        if (!classesResponse.ok) return;
        const classesData = await classesResponse.json();
        if (cancelled) return;

        const classes = Array.isArray(classesData.classes)
          ? classesData.classes.map((item: { id: string; name: string }) => ({ id: item.id, name: item.name }))
          : [];
        setClassOptions(classes);

        if (classes.length > 0) {
          setAssignmentForm((prev) => ({
            ...prev,
            targetClassId: prev.targetClassId || classes[0].id,
          }));
        }
      } catch {
        // School context is optional for non-madresah users.
      }
    }

    hydrateSchoolContext();
    loadAssignments();

    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    audioClipUrlsRef.current = audioClips.map((clip) => clip.url);
  }, [audioClips]);

  useEffect(() => {
    return () => {
      if (recordingStreamRef.current) {
        recordingStreamRef.current.getTracks().forEach((track) => track.stop());
      }

      audioClipUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));

      if (rewardBurstTimeoutRef.current) {
        clearTimeout(rewardBurstTimeoutRef.current);
      }
    };
  }, []);

  const triggerRewardBurst = (icon: string, label: string) => {
    setRewardBurst({ icon, label });
    if (rewardBurstTimeoutRef.current) {
      clearTimeout(rewardBurstTimeoutRef.current);
    }

    rewardBurstTimeoutRef.current = setTimeout(() => {
      setRewardBurst(null);
    }, 1800);
  };

  const submitAssignment = async () => {
    if (!assignmentForm.title.trim() || !assignmentForm.targetClassId) {
      setAssignmentActionError('Please enter a title and choose a class.');
      return;
    }

    setAssignmentActionError(null);

    try {
      const response = await fetch('/api/arabic-learning/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: assignmentForm.title,
          focusArea: assignmentForm.focusArea,
          notes: assignmentForm.notes,
          dueDate: assignmentForm.dueDate || null,
          targetClassId: assignmentForm.targetClassId,
          recommendedMinutes: assignmentForm.recommendedMinutes,
          daysPerWeek: assignmentForm.daysPerWeek,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to create assignment.' }));
        throw new Error(data.error || 'Failed to create assignment.');
      }

      setAssignmentForm((prev) => ({
        ...prev,
        title: '',
        focusArea: '',
        notes: '',
        dueDate: '',
      }));

      await loadAssignments();
    } catch (error) {
      setAssignmentActionError(error instanceof Error ? error.message : 'Failed to create assignment.');
    }
  };

  const markAssignmentCompletion = async (assignmentId: string, isCompleted: boolean) => {
    setAssignmentActionError(null);

    try {
      const response = await fetch(`/api/arabic-learning/assignments/${assignmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ error: 'Failed to update assignment.' }));
        throw new Error(data.error || 'Failed to update assignment.');
      }

      await loadAssignments();
    } catch (error) {
      setAssignmentActionError(error instanceof Error ? error.message : 'Failed to update assignment.');
    }
  };

  const startRecording = async () => {
    if (isRecording) return;

    try {
      setAudioError(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      recordingStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      recordingChunksRef.current = [];
      recordingStartedAtRef.current = Date.now();

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          recordingChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = () => {
        const durationMs = recordingStartedAtRef.current ? Date.now() - recordingStartedAtRef.current : 0;
        const blob = new Blob(recordingChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);

        setAudioClips((prev) => [
          {
            id: `${Date.now()}`,
            url,
            createdAt: new Date().toISOString(),
            durationMs,
          },
          ...prev,
        ]);

        stream.getTracks().forEach((track) => track.stop());
        recordingStreamRef.current = null;
        mediaRecorderRef.current = null;
        recordingStartedAtRef.current = null;
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch {
      setAudioError('Microphone access is required for pronunciation drills.');
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || !isRecording) return;
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  const removeClip = (clipId: string) => {
    setAudioClips((prev) => {
      const clip = prev.find((item) => item.id === clipId);
      if (clip) URL.revokeObjectURL(clip.url);
      return prev.filter((item) => item.id !== clipId);
    });
  };

  const markLessonComplete = (lessonId: string) => {
    setProgress((prev) => {
      if (prev.completedLessons.includes(lessonId)) return prev;
      const next: LearnerProgress = {
        ...prev,
        completedLessons: [...prev.completedLessons, lessonId],
        xp: prev.xp + 35,
      };
      return withActivityUpdate(next);
    });
  };

  const selectGame = (gameId: GameId) => {
    setActiveGame(gameId);
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setRoundScore(0);
    setRoundComplete(false);
    setRewardClaimed(false);
  };

  const submitAnswer = (option: string) => {
    if (selectedAnswer || roundComplete) return;

    setSelectedAnswer(option);
    if (option === currentQuestion.answer) {
      setRoundScore((value) => value + 1);
    }
  };

  const moveNext = () => {
    if (!selectedAnswer) return;

    if (questionIndex >= quiz.questions.length - 1) {
      setRoundComplete(true);
      return;
    }

    setQuestionIndex((value) => value + 1);
    setSelectedAnswer(null);
  };

  const claimRoundReward = () => {
    if (rewardClaimed || !roundComplete) return;

    const percentage = Math.round((roundScore / quiz.questions.length) * 100);
    const earnedXp =
      20 +
      roundScore * 8 +
      (percentage >= 75 ? 14 : 0) +
      (roundScore === quiz.questions.length ? 20 : 0);

    setProgress((prev) => withActivityUpdate({
      ...prev,
      xp: prev.xp + earnedXp,
      gamesWon: prev.gamesWon + 1,
    }));

    setRewardClaimed(true);
  };

  const restartRound = () => {
    setQuestionIndex(0);
    setSelectedAnswer(null);
    setRoundScore(0);
    setRoundComplete(false);
    setRewardClaimed(false);
  };

  const claimKidsQuest = (quest: KidsQuest) => {
    if (claimedQuestIds.includes(quest.id)) return;

    setClaimedQuestIds((prev) => [...prev, quest.id]);
    setAdventureSparkles((prev) => prev + 2);
    triggerRewardBurst(quest.sticker, `+${quest.rewardXp} XP and +2 sparkles`);
    setProgress((prev) => withActivityUpdate({
      ...prev,
      xp: prev.xp + quest.rewardXp,
    }));
  };

  const chooseKidOption = (option: string) => {
    if (kidSelectedOption || kidRoundComplete) return;

    setKidSelectedOption(option);
    if (option === kidChallenge.answer) {
      setKidScore((prev) => prev + 1);
    }
  };

  const nextKidChallenge = () => {
    if (!kidSelectedOption) return;

    if (kidChallengeIndex >= KIDS_CHALLENGES.length - 1) {
      setKidRoundComplete(true);
      return;
    }

    setKidChallengeIndex((prev) => prev + 1);
    setKidSelectedOption(null);
  };

  const restartKidRound = () => {
    setKidChallengeIndex(0);
    setKidSelectedOption(null);
    setKidScore(0);
    setKidRoundComplete(false);
    setKidRewardClaimed(false);
  };

  const claimKidRoundReward = () => {
    if (!kidRoundComplete || kidRewardClaimed) return;

    const earnedXp = 15 + kidScore * 6 + (kidScore === KIDS_CHALLENGES.length ? 10 : 0);
    const earnedSparkles = kidScore >= 4 ? 5 : 3;
    triggerRewardBurst('⭐', `+${earnedXp} XP and +${earnedSparkles} sparkles`);
    setProgress((prev) => withActivityUpdate({
      ...prev,
      xp: prev.xp + earnedXp,
      gamesWon: prev.gamesWon + 1,
    }));
    setAdventureSparkles((prev) => prev + earnedSparkles);
    setKidRewardClaimed(true);
  };

  const openTreasureChest = () => {
    if (!canOpenTreasure) return;

    const dayCode = Number(getTodayIso().replace(/-/g, ''));
    const reward = KIDS_TREASURE_REWARDS[dayCode % KIDS_TREASURE_REWARDS.length];
    setLastTreasureClaimDate(getTodayIso());
    setLatestTreasureNote(`${reward.emoji} ${reward.title}: +${reward.xp} XP and +${reward.sparkles} sparkles.`);
    setAdventureSparkles((prev) => prev + reward.sparkles);
    triggerRewardBurst(reward.emoji, `Treasure opened: +${reward.xp} XP, +${reward.sparkles} sparkles`);
    setProgress((prev) => withActivityUpdate({
      ...prev,
      xp: prev.xp + reward.xp,
    }));
  };

  const completeBossChallenge = () => {
    if (!bossUnlocked || bossCompleted) return;

    setBossCompleted(true);
    setAdventureSparkles((prev) => prev + 10);
    triggerRewardBurst('🏆', 'Guardian defeated: +40 XP and +10 sparkles');
    setProgress((prev) => withActivityUpdate({
      ...prev,
      xp: prev.xp + 40,
      gamesWon: prev.gamesWon + 1,
    }));
  };

  const setPlacementAnswer = (questionId: string, optionId: string) => {
    setPlacementAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const submitPlacement = () => {
    if (placementAnsweredCount < PLACEMENT_QUESTIONS.length) return;

    const totalPoints = PLACEMENT_QUESTIONS.reduce((sum, question) => {
      const selected = placementAnswers[question.id];
      const option = question.options.find((item) => item.id === selected);
      return sum + (option?.points ?? 0);
    }, 0);

    const result: StageId =
      totalPoints <= 6 ? 'alphabet' : totalPoints <= 11 ? 'beginner' : totalPoints <= 18 ? 'intermediate' : 'advanced';

    setPlacementScore(totalPoints);
    setPlacementResult(result);
    setPlacementSubmitted(true);

    setProgress((prev) => {
      if (prev.placementCompleted) return prev;
      return withActivityUpdate({
        ...prev,
        xp: prev.xp + 60,
        placementCompleted: true,
      });
    });
  };

  const applyPlacementTrack = () => {
    if (!placementResult) return;
    setActiveStage(placementResult);
    setActiveTab('path');
  };

  const stageCompletion = (stage: StageId) => {
    const stageLessons = LESSONS.filter((item) => item.stage === stage);
    const done = stageLessons.filter((item) =>
      progress.completedLessons.includes(item.id)
    ).length;

    return {
      done,
      total: stageLessons.length,
      percent: Math.round((done / stageLessons.length) * 100),
    };
  };

  const rootTrack = ROOT_TRACKS[activeRootIndex];

  return (
    <div className="w-full max-w-6xl mx-auto px-3 py-3 sm:px-4 md:px-8 space-y-4">
      {/* ── Hero Banner ── */}
      <section className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-emerald-300/40 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700" />
        <div className="absolute -top-14 -right-10 h-48 w-48 rounded-full bg-amber-300/25 blur-2xl" />
        <div className="absolute top-10 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-4 right-8 text-5xl text-white/10 arabic-text hidden sm:block" dir="rtl">
          تَدَبُّر
        </div>

        <div className="relative z-10 p-4 sm:p-6 md:p-9 text-white space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
                Arabic Learning Hub
              </h1>
              <p className="text-xs sm:text-sm text-emerald-50/90 max-w-xl hidden sm:block">
                A full learning path from beginner basics to advanced Quran comprehension — lessons, games, and root-pattern exploration.
              </p>
            </div>
            <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm text-xs shrink-0 mt-0.5">
              <Sparkles className="mr-1 h-3 w-3" />
              <span className="hidden sm:inline">New: </span>Mastery Track
            </Badge>
          </div>

          {/* Stats row — 4 cols always, compact on mobile */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Done', value: `${completedCount}/${totalLessons}`, icon: <BookOpen className="h-5 w-5 text-emerald-200" /> },
              { label: 'Streak', value: `${progress.streak}d`, icon: <Flame className="h-5 w-5 text-orange-200" /> },
              { label: 'XP', value: progress.xp, icon: <Star className="h-5 w-5 text-amber-200" /> },
              { label: 'Wins', value: progress.gamesWon, icon: <Trophy className="h-5 w-5 text-yellow-200" /> },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl bg-white/10 border border-white/10 p-2 sm:p-3 text-center">
                <div className="flex justify-center mb-1">{stat.icon}</div>
                <p className="text-sm sm:text-xl font-bold tabular-nums leading-none">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-emerald-100 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-white/15 bg-black/10 p-3 backdrop-blur-sm">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="font-semibold text-sm">Today&apos;s Mission</p>
              <Badge className="bg-amber-400/20 text-amber-100 border-amber-200/30 text-xs">Daily</Badge>
            </div>
            <p className="text-xs sm:text-sm text-emerald-50 leading-relaxed">{todayMission}</p>
          </div>
        </div>
      </section>

      {/* ── Rank + Completion strip ── */}
      <section className="grid gap-3 sm:grid-cols-2">
        <Card className="border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-4 w-4 text-amber-500 shrink-0" />
              <p className="font-semibold text-sm">Rank: {levelInfo.level}</p>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">{progress.xp} / {levelInfo.nextTarget} XP</span>
            </div>
            <Progress value={xpProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <p className="font-semibold text-sm">Overall Progress</p>
              <span className="ml-auto text-xs text-muted-foreground">{completionPercent}%</span>
              {user?.id && (
                <span className={cn(
                  'text-xs rounded-full px-2 py-0.5 border',
                  syncStatus === 'synced' && 'border-emerald-200 bg-emerald-50 text-emerald-700',
                  syncStatus === 'syncing' && 'border-blue-200 bg-blue-50 text-blue-700 animate-pulse',
                  syncStatus === 'error' && 'border-red-200 bg-red-50 text-red-700',
                  syncStatus === 'idle' && 'border-border bg-muted/40 text-muted-foreground'
                )}>
                  {syncStatus === 'synced' ? '☁ Synced' : syncStatus === 'syncing' ? '⟳ Saving' : syncStatus === 'error' ? '✕ Offline' : '☁ Local'}
                </span>
              )}
            </div>
            <Progress value={completionPercent} className="h-2" />
          </CardContent>
        </Card>
      </section>

      <Tabs value={activeTab} onValueChange={(value) => { setActiveTab(value as HubTabId); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="space-y-4">
        {/* ── Mobile-first scrollable tab strip ── */}
        <div className="relative">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 pb-1 snap-x snap-mandatory">
            {([
              { id: 'path',      label: 'Pathway',   emoji: '🗺️' },
              { id: 'typing',    label: 'Typing',     emoji: '⌨️' },
              { id: 'games',     label: 'Games',      emoji: '🎮' },
              { id: 'adventure', label: 'Kids',       emoji: '⭐' },
              { id: 'placement', label: 'Placement',  emoji: '📍' },
              { id: 'bridge',    label: 'Bridge',     emoji: '☪️' },
              { id: 'speaking',  label: 'Speaking',   emoji: '🎙️' },
              { id: 'revision',  label: 'Revision',   emoji: '📚' },
              { id: 'planner',   label: 'Planner',    emoji: '📅' },
            ] as { id: HubTabId; label: string; emoji: string }[]).map((tab) => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm whitespace-nowrap snap-start transition-all shrink-0 border',
                  activeTab === tab.id
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white text-muted-foreground border-border hover:border-emerald-300 hover:text-emerald-700'
                )}
              >
                <span className="text-base leading-none">{tab.emoji}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
          {/* fade gradient hinting scroll */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-1 w-8 bg-gradient-to-l from-white/80 to-transparent sm:hidden" />
        </div>

        <TabsContent value="path" className="space-y-4">
          <Card>
            <CardHeader className="pb-3 pt-4 px-4">
              <CardTitle className="flex items-center gap-2 text-base">
                <Languages className="h-4 w-4 text-emerald-600" />
                Class Roadmap
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6 space-y-4">
              {/* Stage selector — horizontal scroll on mobile */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 pb-1">
                {(['alphabet', 'beginner', 'intermediate', 'advanced'] as StageId[]).map((stage) => {
                  const meta = STAGE_META[stage];
                  const summary = stageCompletion(stage);

                  return (
                    <button
                      key={stage}
                      onClick={() => setActiveStage(stage)}
                      className={cn(
                        'rounded-2xl border px-3 py-2.5 text-left transition-all shrink-0 min-w-[9rem] sm:flex-1',
                        activeStage === stage
                          ? 'border-emerald-500 bg-emerald-50 shadow-sm'
                          : 'border-border bg-white hover:border-emerald-300'
                      )}
                    >
                      <p className="font-semibold text-xs leading-snug">{meta.title}</p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{meta.xpBand}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{summary.done}/{summary.total}</Badge>
                      </div>
                      <Progress value={summary.percent} className="h-1 mt-1.5" />
                    </button>
                  );
                })}
              </div>

              <div className="rounded-2xl border bg-muted/20 p-3 sm:p-4">
                <div className={cn('rounded-xl p-3 text-white bg-gradient-to-r', STAGE_META[activeStage].color)}>
                  <p className="text-[10px] uppercase tracking-widest text-white/80">Current Stage</p>
                  <h3 className="mt-0.5 text-lg font-bold">{STAGE_META[activeStage].title}</h3>
                  <p className="text-xs text-white/90">{STAGE_META[activeStage].subtitle}</p>
                </div>

                <div className="mt-3 grid gap-3 lg:grid-cols-2">
                  {paginatedLessons.map((lesson) => {
                    const done = progress.completedLessons.includes(lesson.id);

                    return (
                      <Card key={lesson.id} className={cn('border transition-all', done && 'border-emerald-300 bg-emerald-50/40')}>
                        <CardHeader className="pb-2 pt-3 px-3 sm:px-6">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <CardTitle className="text-sm sm:text-base leading-snug">{lesson.title}</CardTitle>
                              <CardDescription className="mt-0.5 text-xs leading-snug">{lesson.objective}</CardDescription>
                            </div>
                            <Badge variant={done ? 'default' : 'secondary'} className="shrink-0 text-[10px]">
                              {done ? '✓ Done' : lesson.challengeLevel}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-2.5 px-3 sm:px-6 pb-3">
                          <p className="text-[11px] text-muted-foreground">⏱ {lesson.duration}</p>

                          <div className="rounded-lg bg-muted/40 p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground mb-1 font-semibold">Drills</p>
                            <ul className="space-y-0.5 text-xs">
                              {lesson.drills.map((drill) => (
                                <li key={drill} className="flex items-start gap-1.5">
                                  <span className="text-emerald-600 mt-px shrink-0">•</span>
                                  <span>{drill}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-2.5">
                            <p className="text-[10px] uppercase tracking-wide text-amber-700 mb-1.5 font-semibold">Quran Bridge</p>
                            <p className="arabic-text text-[1.25rem] leading-[1.9rem] text-amber-900" dir="rtl">
                              {lesson.quranBridge.arabic}
                            </p>
                            <p className="mt-1 text-[10px] text-amber-800 italic">{lesson.quranBridge.transliteration}</p>
                            <p className="mt-0.5 text-xs text-amber-900">{lesson.quranBridge.meaning}</p>
                            <p className="mt-1 text-[10px] text-amber-700 leading-relaxed">{lesson.quranBridge.note}</p>
                          </div>

                          <Button
                            onClick={() => markLessonComplete(lesson.id)}
                            variant={done ? 'outline' : 'default'}
                            size="sm"
                            className={cn('w-full h-10 text-sm font-semibold', !done && 'bg-emerald-600 hover:bg-emerald-700')}
                          >
                            <CheckCircle2 className="mr-1.5 h-4 w-4" />
                            {done ? 'Completed ✓' : 'Mark Complete (+35 XP)'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Pagination — compact mobile-friendly */}
                {totalLessonPages > 1 && (
                  <div className="flex items-center justify-between gap-2 pt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 text-xs"
                      onClick={() => { setLessonsPage((p) => Math.max(0, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={lessonsPage === 0}
                    >
                      ← Prev
                    </Button>
                    <span className="text-xs text-center text-muted-foreground">
                      <span className="font-semibold text-foreground">{lessonsPage + 1}</span> / {totalLessonPages}
                      <span className="hidden sm:inline ml-1 text-muted-foreground">({lessonsPage * LESSONS_PER_PAGE + 1}–{Math.min((lessonsPage + 1) * LESSONS_PER_PAGE, lessonsForStage.length)} of {lessonsForStage.length})</span>
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 px-3 text-xs"
                      onClick={() => { setLessonsPage((p) => Math.min(totalLessonPages - 1, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={lessonsPage >= totalLessonPages - 1}
                    >
                      Next →
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="typing" className="space-y-5">
          <ArabicTypingGame />
        </TabsContent>

        <TabsContent value="adventure" className="space-y-5">
          <Card className="relative overflow-hidden border-rose-200">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100" />
            <div className="absolute -top-10 -left-6 h-36 w-36 rounded-full bg-rose-300/25 blur-2xl" />
            <div className="absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-sky-300/30 blur-2xl" />

            <div className="pointer-events-none absolute inset-x-0 top-2 z-20 flex justify-center">
              {rewardBurst && (
                <div className="animate-pulse rounded-full border border-rose-300 bg-white/95 px-4 py-2 shadow-lg">
                  <p className="text-sm font-semibold text-rose-900">
                    {rewardBurst.icon} {rewardBurst.label}
                  </p>
                </div>
              )}
            </div>

            <CardHeader className="relative z-10 pb-2">
              <CardTitle className="flex items-center gap-2 text-rose-900">
                <Sparkles className="h-5 w-5 text-rose-600" />
                Adventure Playground for Kids and Newbies
              </CardTitle>
              <CardDescription className="text-rose-900/75">
                A playful mode with tiny missions, friendly avatars, and quick Arabic wins. Great for first-timers.
              </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 space-y-4">
              <div className="pointer-events-none absolute right-3 top-3 hidden sm:flex gap-2">
                {ADVENTURE_FLOATING_ICONS.map((icon, index) => (
                  <span
                    key={`${icon}-${index}`}
                    className="text-lg"
                    style={{
                      animation: `adventureFloat ${2 + index * 0.2}s ease-in-out ${index * 0.12}s infinite`,
                    }}
                  >
                    {icon}
                  </span>
                ))}
              </div>

              <div
                className={cn('rounded-2xl bg-gradient-to-r p-4 text-white shadow-md', selectedAvatar.color)}
                style={{ animation: 'adventurePop 420ms ease both' }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-white/80">Adventure Buddy</p>
                    <p className="mt-1 text-xl font-extrabold">{selectedAvatar.emoji} {selectedAvatar.name}</p>
                    <p className="text-sm text-white/90">{selectedAvatar.superpower}</p>
                  </div>
                  <div className="rounded-xl bg-black/15 px-3 py-2 text-center">
                    <p className="text-xs text-white/80">Sticker Pack</p>
                    <p className="text-lg font-bold">{collectedStickers}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs font-medium text-white/90">
                  Mood: {adventureMood}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" style={{ animation: 'adventurePop 520ms ease both' }}>
                <div className="rounded-xl border border-rose-200 bg-white px-3 py-2">
                  <p className="text-xs text-muted-foreground">Adventure Rank</p>
                  <p className="font-bold text-rose-900">{adventureRank}</p>
                </div>
                <div className="rounded-xl border border-amber-200 bg-white px-3 py-2">
                  <p className="text-xs text-muted-foreground">Quest Progress</p>
                  <p className="font-bold text-amber-900">{questCompletionPercent}%</p>
                </div>
                <div className="rounded-xl border border-sky-200 bg-white px-3 py-2">
                  <p className="text-xs text-muted-foreground">Sparkles</p>
                  <p className="font-bold text-sky-900">{adventureSparkles}</p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2">
                  <p className="text-xs text-muted-foreground">Story Steps</p>
                  <p className="font-bold text-emerald-900">{storyUnlockCount}/{ADVENTURE_STORY_STEPS.length}</p>
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4" style={{ animation: 'adventurePop 620ms ease both' }}>
                {KIDS_AVATARS.map((avatar) => (
                  <button
                    key={avatar.id}
                    onClick={() => setSelectedAvatarId(avatar.id)}
                    className={cn(
                      'rounded-2xl border bg-white px-3 py-3 text-left transition-all',
                      selectedAvatarId === avatar.id
                        ? 'border-rose-400 ring-2 ring-rose-200'
                        : 'border-rose-100 hover:border-rose-300'
                    )}
                  >
                    <p className="text-2xl">{avatar.emoji}</p>
                    <p className="mt-1 font-semibold text-sm text-rose-900">{avatar.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">{avatar.superpower}</p>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 lg:grid-cols-2" style={{ animation: 'adventurePop 720ms ease both' }}>
                <Card className="border-amber-200 bg-white/90">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-amber-900">Quest Board</CardTitle>
                    <CardDescription>Complete simple missions and collect XP + stickers.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {KIDS_QUESTS.map((quest) => {
                      const claimed = claimedQuestIds.includes(quest.id);

                      return (
                        <div key={quest.id} className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold text-sm text-amber-900">
                              {quest.sticker} {quest.title}
                            </p>
                            <Badge variant={claimed ? 'default' : 'secondary'}>
                              {claimed ? 'Done' : `+${quest.rewardXp} XP`}
                            </Badge>
                          </div>
                          <p className="text-sm text-amber-900/80 mt-1">{quest.mission}</p>
                          <Button
                            onClick={() => claimKidsQuest(quest)}
                            disabled={claimed}
                            variant={claimed ? 'outline' : 'default'}
                            className="h-8 px-3 text-xs mt-2"
                          >
                            {claimed ? 'Claimed' : 'Claim Reward'}
                          </Button>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>

                <Card className="border-sky-200 bg-white/90">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-sky-900">Letter Balloon Pop</CardTitle>
                    <CardDescription>
                      Tap the correct answer for each fun micro-question.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Round {Math.min(kidChallengeIndex + 1, KIDS_CHALLENGES.length)} / {KIDS_CHALLENGES.length}</span>
                        <span>Score: {kidScore}</span>
                      </div>
                      <Progress value={kidRoundComplete ? 100 : kidRoundPercent} className="h-2" />
                    </div>

                    {!kidRoundComplete && (
                      <>
                        <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3">
                          <p className="font-semibold text-sky-900">{kidChallenge.prompt}</p>
                          <p className="text-xs text-sky-800 mt-1">Hint: {kidChallenge.helper}</p>
                        </div>

                        <div className="grid gap-2 sm:grid-cols-2">
                          {kidChallenge.options.map((option) => {
                            const isSelected = kidSelectedOption === option;
                            const isCorrect = kidSelectedOption && option === kidChallenge.answer;
                            const isWrong = isSelected && option !== kidChallenge.answer;

                            return (
                              <button
                                key={option}
                                onClick={() => chooseKidOption(option)}
                                className={cn(
                                  'rounded-xl border px-3 py-2.5 text-left transition-all bg-white',
                                  !kidSelectedOption && 'hover:border-sky-300 hover:bg-sky-50/50',
                                  isCorrect && 'border-emerald-400 bg-emerald-50',
                                  isWrong && 'border-red-300 bg-red-50'
                                )}
                              >
                                <span className={cn(
                                  'font-medium',
                                  option.length <= 3 && 'arabic-text text-[1.3rem] leading-[1.9rem]'
                                )}>
                                  {option}
                                </span>
                              </button>
                            );
                          })}
                        </div>

                        <Button onClick={nextKidChallenge} disabled={!kidSelectedOption} className="w-full">
                          {kidChallengeIndex === KIDS_CHALLENGES.length - 1 ? 'Finish Adventure Round' : 'Next Balloon'}
                        </Button>
                      </>
                    )}

                    {kidRoundComplete && (
                      <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-3 space-y-2">
                        <p className="font-semibold text-sky-900">
                          Great job! You scored {kidScore}/{KIDS_CHALLENGES.length}.
                        </p>
                        {kidScore === KIDS_CHALLENGES.length && (
                          <p className="text-xs text-emerald-700">Perfect round bonus unlocked: +10 XP.</p>
                        )}
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button onClick={restartKidRound} variant="outline" className="sm:flex-1">
                            Play Again
                          </Button>
                          <Button onClick={claimKidRoundReward} disabled={kidRewardClaimed} className="sm:flex-1">
                            {kidRewardClaimed ? 'Reward Claimed' : 'Claim Star Reward'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 lg:grid-cols-2" style={{ animation: 'adventurePop 820ms ease both' }}>
                <Card className="border-violet-200 bg-white/90">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-violet-900">Daily Treasure Chest</CardTitle>
                    <CardDescription>
                      Open once per day for surprise rewards and sparkles.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-3">
                      <p className="text-sm text-violet-900">
                        {canOpenTreasure
                          ? 'Your chest is ready today. Tap to open.'
                          : 'Today\'s chest is already opened. Come back tomorrow for a new reward.'}
                      </p>
                      {latestTreasureNote && (
                        <p className="text-xs text-violet-800 mt-1">Latest reward: {latestTreasureNote}</p>
                      )}
                    </div>
                    <Button onClick={openTreasureChest} disabled={!canOpenTreasure} className="w-full">
                      {canOpenTreasure ? 'Open Treasure Chest' : 'Chest Opened Today'}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-emerald-200 bg-white/90">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-emerald-900">Story Map</CardTitle>
                    <CardDescription>
                      Unlock each location as you complete your beginner adventure.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {ADVENTURE_STORY_STEPS.map((step, index) => {
                      const unlocked =
                        index === 0 ||
                        (index === 1 && collectedStickers >= 2) ||
                        (index === 2 && Boolean(lastTreasureClaimDate)) ||
                        (index === 3 && kidScore >= 4) ||
                        (index === 4 && bossCompleted);

                      return (
                        <div
                          key={step.id}
                          className={cn(
                            'rounded-lg border px-3 py-2',
                            unlocked
                              ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                              : 'border-border bg-muted/20 text-muted-foreground'
                          )}
                        >
                          <p className="text-sm font-semibold">{step.title}</p>
                          <p className="text-xs mt-0.5">{step.requirement}</p>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </div>

              <Card className="border-fuchsia-200 bg-white/90" style={{ animation: 'adventurePop 920ms ease both' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base text-fuchsia-900">Boss Challenge: Guardian of Letters</CardTitle>
                  <CardDescription>
                    Unlock this by completing all quests and scoring at least 4/5 in Balloon Pop.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="rounded-xl border border-fuchsia-200 bg-fuchsia-50/60 p-3 text-sm text-fuchsia-900">
                    {bossCompleted
                      ? 'Boss defeated. You earned +40 XP and +10 sparkles.'
                      : bossUnlocked
                        ? 'Boss unlocked. Tap the button to claim your hero victory rewards.'
                        : 'Keep going: finish all quests and reach 4 correct answers in Balloon Pop.'}
                  </div>
                  <Button onClick={completeBossChallenge} disabled={!bossUnlocked || bossCompleted} className="w-full">
                    {bossCompleted ? 'Boss Defeated' : bossUnlocked ? 'Defeat Guardian Boss' : 'Boss Locked'}
                  </Button>
                </CardContent>
              </Card>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4" style={{ animation: 'adventurePop 1s ease both' }}>
                <p className="font-semibold text-emerald-900">Starter Routine for New Learners</p>
                <div className="mt-2 grid gap-2 md:grid-cols-3 text-sm text-emerald-800">
                  <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2">1. Pick one avatar and one quest</div>
                  <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2">2. Do one balloon challenge round</div>
                  <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2">3. Finish one beginner lesson in Pathway</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gamepad2 className="h-5 w-5 text-indigo-600" />
                Games Lab
              </CardTitle>
              <CardDescription>
                Play short challenge rounds to lock in vocabulary, script recognition, and grammar reflexes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                {(['letters', 'vocab', 'grammar'] as GameId[]).map((gameId) => {
                  const game = QUIZZES[gameId];
                  const Icon = game.icon;

                  return (
                    <button
                      key={gameId}
                      onClick={() => selectGame(gameId)}
                      className={cn(
                        'rounded-2xl border p-3 text-left transition',
                        activeGame === gameId
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-primary/40'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <p className="font-semibold text-sm">{game.title}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {game.questions.length} question sprint
                      </p>
                    </button>
                  );
                })}
              </div>

              <Card className="border-2 border-dashed border-indigo-200 bg-indigo-50/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{quiz.title}</CardTitle>
                  <CardDescription>{currentQuestion.context}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Question {Math.min(questionIndex + 1, quiz.questions.length)} / {quiz.questions.length}</span>
                      <span>Score: {roundScore}</span>
                    </div>
                    <Progress value={roundComplete ? 100 : roundPercent} className="h-2" />
                  </div>

                  {!roundComplete && (
                    <>
                      <p className="font-semibold text-base">{currentQuestion.prompt}</p>

                      <div className="grid gap-2 sm:grid-cols-2">
                        {currentQuestion.options.map((option) => {
                          const isSelected = selectedAnswer === option;
                          const isCorrect = selectedAnswer && option === currentQuestion.answer;
                          const isWrongSelection = isSelected && option !== currentQuestion.answer;

                          return (
                            <button
                              key={option}
                              onClick={() => submitAnswer(option)}
                              className={cn(
                                'rounded-xl border px-3 py-2.5 text-left transition-all',
                                !selectedAnswer && 'hover:border-primary/50 hover:bg-primary/5',
                                isCorrect && 'border-emerald-500 bg-emerald-50',
                                isWrongSelection && 'border-red-400 bg-red-50',
                                selectedAnswer && !isSelected && !isCorrect && 'opacity-75'
                              )}
                            >
                              <span className={cn(
                                'font-medium',
                                option.length <= 2 && 'arabic-text text-[1.4rem] leading-[2rem]'
                              )}>
                                {option}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {selectedAnswer && (
                        <div className={cn(
                          'rounded-xl p-3 text-sm',
                          selectedAnswer === currentQuestion.answer
                            ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border border-red-200 text-red-800'
                        )}>
                          <p className="font-semibold">
                            {selectedAnswer === currentQuestion.answer ? 'Correct!' : 'Not quite yet.'}
                          </p>
                          <p className="mt-1">{currentQuestion.explanation}</p>
                        </div>
                      )}

                      <Button onClick={moveNext} disabled={!selectedAnswer} className="w-full">
                        {questionIndex === quiz.questions.length - 1 ? 'Finish Round' : 'Next Question'}
                      </Button>
                    </>
                  )}

                  {roundComplete && (
                    <div className="space-y-3 rounded-2xl border border-indigo-200 bg-white p-4">
                      <p className="text-lg font-bold">Round Complete</p>
                      <p className="text-sm text-muted-foreground">
                        You scored {roundScore}/{quiz.questions.length} ({Math.round((roundScore / quiz.questions.length) * 100)}%).
                      </p>
                      {roundScore === quiz.questions.length && (
                        <p className="text-sm text-emerald-700 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                          Perfect round bonus unlocked: +20 XP.
                        </p>
                      )}

                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button onClick={restartRound} variant="outline" className="flex-1">
                          Play Again
                        </Button>
                        <Button onClick={claimRoundReward} disabled={rewardClaimed} className="flex-1">
                          {rewardClaimed ? 'XP Claimed' : 'Claim XP Reward'}
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bridge" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-cyan-600" />
                Quran Root Bridge
              </CardTitle>
              <CardDescription>
                Learn by roots. When one root clicks, dozens of Quran words become easier instantly.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[280px,1fr]">
              <div className="space-y-2">
                {ROOT_TRACKS.map((track, index) => (
                  <button
                    key={track.root}
                    onClick={() => setActiveRootIndex(index)}
                    className={cn(
                      'w-full rounded-xl border p-3 text-left transition',
                      activeRootIndex === index
                        ? 'border-cyan-500 bg-cyan-50'
                        : 'hover:border-cyan-300'
                    )}
                  >
                    <p className="arabic-text text-[1.2rem] leading-[1.9rem] text-cyan-900" dir="rtl">{track.root}</p>
                    <p className="text-sm font-semibold mt-1">{track.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{track.concept}</p>
                  </button>
                ))}
              </div>

              <Card className="border-cyan-100">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>{rootTrack.title}</span>
                    <Badge variant="secondary">Root: {rootTrack.root}</Badge>
                  </CardTitle>
                  <CardDescription>{rootTrack.quranContext}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {rootTrack.words.map((word) => (
                    <div key={word.word} className="rounded-xl border bg-muted/20 p-3">
                      <p className="arabic-text text-[1.45rem] leading-[2.1rem]" dir="rtl">{word.word}</p>
                      <p className="text-sm font-medium">{word.transliteration}</p>
                      <p className="text-sm text-muted-foreground">{word.meaning}</p>
                    </div>
                  ))}

                  <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-3 text-sm text-cyan-900">
                    <p className="font-semibold">Practice challenge</p>
                    <p className="mt-1">
                      Open one page in the Quran reader and detect this root in at least two words.
                      Add them to your notebook and compare shades of meaning.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="speaking" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic2 className="h-5 w-5 text-rose-600" />
                Speaking Studio
              </CardTitle>
              <CardDescription>
                Practice practical Arabic conversation patterns that reinforce Quran vocabulary and grammar.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 lg:grid-cols-3">
                {DIALOGUE_PRACTICE.map((dialogue) => (
                  <Card key={dialogue.title} className="border-rose-100">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">{dialogue.title}</CardTitle>
                      <CardDescription>Read aloud 3 rounds: slow, normal, expressive.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {dialogue.lines.map((line) => (
                        <div key={line.ar} className="rounded-xl bg-muted/30 p-3">
                          <p className="arabic-text text-[1.3rem] leading-[2rem]" dir="rtl">{line.ar}</p>
                          <p className="text-xs text-muted-foreground mt-1">{line.tr}</p>
                          <p className="text-sm mt-1">{line.en}</p>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="border-rose-200 bg-rose-50/40">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Pronunciation Lab</CardTitle>
                  <CardDescription>
                    Record your voice, compare attempts, and build steady Arabic articulation confidence.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                    {PRONUNCIATION_PHRASES.map((phrase) => (
                      <button
                        key={phrase.id}
                        onClick={() => setSelectedPhraseId(phrase.id)}
                        className={cn(
                          'rounded-xl border px-3 py-2 text-left transition',
                          selectedPhraseId === phrase.id
                            ? 'border-rose-400 bg-rose-100 text-rose-900'
                            : 'hover:border-rose-300 hover:bg-rose-50'
                        )}
                      >
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">{phrase.label}</p>
                        <p className="arabic-text text-[1.15rem] leading-[1.8rem] mt-1" dir="rtl">{phrase.arabic}</p>
                      </button>
                    ))}
                  </div>

                  <div className="rounded-xl border border-rose-200 bg-white p-3">
                    <p className="arabic-text text-[1.45rem] leading-[2.2rem] text-rose-900" dir="rtl">{selectedPhrase.arabic}</p>
                    <p className="text-xs text-rose-800 mt-1">{selectedPhrase.transliteration}</p>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button onClick={startRecording} disabled={isRecording} className="sm:flex-1">
                      Start Recording
                    </Button>
                    <Button onClick={stopRecording} disabled={!isRecording} variant="outline" className="sm:flex-1">
                      Stop Recording
                    </Button>
                  </div>

                  {audioError && (
                    <p className="text-sm text-red-700 rounded-lg border border-red-200 bg-red-50 px-3 py-2">
                      {audioError}
                    </p>
                  )}

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="rounded-xl border bg-white p-3">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Practice Stats</p>
                      <p className="mt-1 text-sm">Attempts: <strong>{audioClips.length}</strong></p>
                      <p className="text-sm">Average clip: <strong>{Math.round(avgClipDuration / 1000)}s</strong></p>
                      <p className="text-sm">Consistency score: <strong>{pronunciationScore}%</strong></p>
                      <Progress value={pronunciationScore} className="h-1.5 mt-2" />
                    </div>

                    <div className="rounded-xl border bg-white p-3 space-y-2 max-h-44 overflow-y-auto">
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">Recent Recordings</p>
                      {audioClips.length === 0 && (
                        <p className="text-sm text-muted-foreground">No recordings yet. Record your first pronunciation attempt.</p>
                      )}
                      {audioClips.map((clip) => (
                        <div key={clip.id} className="rounded-lg border bg-muted/20 p-2">
                          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground mb-1">
                            <span>{new Date(clip.createdAt).toLocaleTimeString()}</span>
                            <span>{Math.max(1, Math.round(clip.durationMs / 1000))}s</span>
                          </div>
                          <audio controls className="w-full h-8">
                            <source src={clip.url} type="audio/webm" />
                          </audio>
                          <Button
                            onClick={() => removeClip(clip.id)}
                            variant="ghost"
                            className="h-7 px-2 text-xs mt-1"
                          >
                            Delete clip
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-4">
                <p className="font-semibold text-rose-900">Pronunciation Ladder</p>
                <ul className="mt-2 space-y-1 text-sm text-rose-800">
                  <li>1. Warm up with ح / خ / ع for 2 minutes each.</li>
                  <li>2. Record one short ayah and replay to self-check rhythm.</li>
                  <li>3. Repeat with tajwid awareness and slower breath control.</li>
                  <li>4. End with one dua in Arabic without looking at transliteration.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revision" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-emerald-700" />
                Revision Engine
              </CardTitle>
              <CardDescription>
                Use this spaced system to move Arabic from short-term memory into long-term Quran fluency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {[
                  { day: 'Day 1', task: 'Learn new lesson + 5 words', tag: 'Acquire' },
                  { day: 'Day 2', task: 'Quick recall without hints', tag: 'Recall' },
                  { day: 'Day 4', task: 'Apply words in ayah context', tag: 'Apply' },
                  { day: 'Day 7', task: 'Teach-back and summarize', tag: 'Master' },
                ].map((item) => (
                  <div key={item.day} className="rounded-2xl border bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{item.day}</p>
                    <p className="font-semibold mt-1">{item.task}</p>
                    <Badge variant="secondary" className="mt-3">{item.tag}</Badge>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                <p className="font-semibold text-emerald-900">Weekly Mastery Checklist</p>
                <div className="mt-3 grid gap-2 md:grid-cols-2">
                  {[
                    'Complete at least 2 lessons',
                    'Play one full game in each category',
                    'Extract one Quran root family',
                    'Read one short surah with word-level awareness',
                    'Journal 3 new insights from your study',
                    'Review one old lesson to prevent forgetting',
                  ].map((item) => (
                    <label key={item} className="flex items-center gap-2 rounded-xl border border-emerald-200/70 bg-white px-3 py-2 text-sm text-emerald-900">
                      <input type="checkbox" className="h-4 w-4 rounded border-emerald-400" />
                      <span>{item}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="placement" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-700" />
                Adaptive Placement Challenge
              </CardTitle>
              <CardDescription>
                Answer these quick diagnostic prompts and get your best-fit starting track automatically.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-4">
                <div className="flex items-center justify-between gap-2 text-sm">
                  <span className="font-medium text-blue-900">Progress</span>
                  <span className="text-blue-800">{placementAnsweredCount}/{PLACEMENT_QUESTIONS.length} answered</span>
                </div>
                <Progress value={placementProgressPercent} className="h-2 mt-2" />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {PLACEMENT_QUESTIONS.map((question) => {
                  const selected = placementAnswers[question.id];

                  return (
                    <Card key={question.id} className="border-blue-100">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{question.skill}</CardTitle>
                        <CardDescription>{question.prompt}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        {question.options.map((option) => {
                          const isChosen = selected === option.id;

                          return (
                            <button
                              key={option.id}
                              onClick={() => setPlacementAnswer(question.id, option.id)}
                              className={cn(
                                'w-full rounded-xl border px-3 py-2 text-left text-sm transition',
                                isChosen
                                  ? 'border-blue-500 bg-blue-50 text-blue-900'
                                  : 'hover:border-blue-300 hover:bg-blue-50/40'
                              )}
                            >
                              {option.label}
                            </button>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  onClick={submitPlacement}
                  disabled={placementAnsweredCount < PLACEMENT_QUESTIONS.length}
                  className="sm:flex-1"
                >
                  Evaluate My Level
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPlacementAnswers({});
                    setPlacementSubmitted(false);
                    setPlacementScore(null);
                    setPlacementResult(null);
                  }}
                  className="sm:flex-1"
                >
                  Reset Responses
                </Button>
              </div>

              {placementSubmitted && placementResult && placementScore !== null && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold text-emerald-900">Recommended Track: {STAGE_META[placementResult].title}</p>
                    <Badge variant="secondary">Score: {placementScore}/24</Badge>
                  </div>
                  <p className="text-sm text-emerald-800">
                    We calibrated your starting level based on fluency, grammar comfort, and independent-study readiness.
                    You can still switch tracks anytime.
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button onClick={applyPlacementTrack} className="sm:flex-1">
                      Apply This Track
                    </Button>
                    <Button onClick={() => setActiveTab('path')} variant="outline" className="sm:flex-1">
                      Open Lesson Roadmap
                    </Button>
                  </div>
                  {!progress.placementCompleted && (
                    <p className="text-xs text-emerald-700">First completion reward: +60 XP.</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="planner" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-purple-700" />
                Personal Study Planner
              </CardTitle>
              <CardDescription>
                Set your weekly schedule and get an intelligent plan to finish the Arabic track consistently.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <Card className="border-purple-100">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">Weekly Inputs</CardTitle>
                    <CardDescription>Adjust based on your real routine so this plan stays sustainable.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <label htmlFor="daily-minutes" className="font-medium">Minutes per day</label>
                        <span className="text-muted-foreground">{dailyMinutes} min</span>
                      </div>
                      <input
                        id="daily-minutes"
                        type="range"
                        min={10}
                        max={90}
                        step={5}
                        value={dailyMinutes}
                        onChange={(event) => setDailyMinutes(Number(event.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <label htmlFor="days-per-week" className="font-medium">Days per week</label>
                        <span className="text-muted-foreground">{daysPerWeek} day{daysPerWeek === 1 ? '' : 's'}</span>
                      </div>
                      <input
                        id="days-per-week"
                        type="range"
                        min={2}
                        max={7}
                        step={1}
                        value={daysPerWeek}
                        onChange={(event) => setDaysPerWeek(Number(event.target.value))}
                        className="w-full accent-primary"
                      />
                    </div>

                    <p className="text-xs text-muted-foreground">
                      These settings are auto-saved on your device.
                    </p>
                  </CardContent>
                </Card>

                <Card className="border-emerald-200 bg-emerald-50/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-emerald-900">Generated Plan Snapshot</CardTitle>
                    <CardDescription className="text-emerald-800">Personalized based on your current pace.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2 flex items-center justify-between">
                      <span>Weekly study time</span>
                      <span className="font-semibold">{weeklyHours} hr/week</span>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2 flex items-center justify-between">
                      <span>Recommended lessons/week</span>
                      <span className="font-semibold">{recommendedLessonsPerWeek}</span>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2 flex items-center justify-between">
                      <span>Remaining lessons</span>
                      <span className="font-semibold">{remainingLessons}</span>
                    </div>
                    <div className="rounded-xl border border-emerald-200 bg-white px-3 py-2 flex items-center justify-between">
                      <span>Estimated finish time</span>
                      <span className="font-semibold">~{estimatedWeeksToFinish} week{estimatedWeeksToFinish === 1 ? '' : 's'}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="border-indigo-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Class Mission Board</CardTitle>
                  <CardDescription>
                    Teachers can assign weekly Arabic missions to classes. Students can mark missions complete.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!user?.id && (
                    <p className="text-sm text-muted-foreground">Sign in to load assignments and class mission tracking.</p>
                  )}

                  {user?.id && (
                    <>
                      {assignmentActionError && (
                        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          {assignmentActionError}
                        </p>
                      )}

                      {canManageAssignments && classOptions.length > 0 && (
                        <div className="rounded-xl border bg-muted/20 p-3 space-y-3">
                          <p className="font-semibold text-sm">Create Weekly Mission</p>
                          <div className="grid gap-3 md:grid-cols-2">
                            <input
                              value={assignmentForm.title}
                              onChange={(event) =>
                                setAssignmentForm((prev) => ({ ...prev, title: event.target.value }))
                              }
                              placeholder="Mission title (e.g., Week 3 Root Drill)"
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                            />
                            <select
                              value={assignmentForm.targetClassId}
                              onChange={(event) =>
                                setAssignmentForm((prev) => ({ ...prev, targetClassId: event.target.value }))
                              }
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                            >
                              {classOptions.map((option) => (
                                <option key={option.id} value={option.id}>{option.name}</option>
                              ))}
                            </select>
                            <input
                              value={assignmentForm.focusArea}
                              onChange={(event) =>
                                setAssignmentForm((prev) => ({ ...prev, focusArea: event.target.value }))
                              }
                              placeholder="Focus area (letters, roots, grammar...)"
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                            />
                            <input
                              type="date"
                              value={assignmentForm.dueDate}
                              onChange={(event) =>
                                setAssignmentForm((prev) => ({ ...prev, dueDate: event.target.value }))
                              }
                              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                            />
                          </div>

                          <textarea
                            value={assignmentForm.notes}
                            onChange={(event) =>
                              setAssignmentForm((prev) => ({ ...prev, notes: event.target.value }))
                            }
                            rows={3}
                            placeholder="Instruction notes for the class..."
                            className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
                          />

                          <div className="grid gap-3 md:grid-cols-2">
                            <div className="space-y-1">
                              <label htmlFor="mission-minutes" className="text-xs text-muted-foreground">Recommended daily minutes</label>
                              <input
                                id="mission-minutes"
                                type="range"
                                min={10}
                                max={90}
                                step={5}
                                value={assignmentForm.recommendedMinutes}
                                onChange={(event) =>
                                  setAssignmentForm((prev) => ({ ...prev, recommendedMinutes: Number(event.target.value) }))
                                }
                                className="w-full accent-primary"
                              />
                              <p className="text-xs">{assignmentForm.recommendedMinutes} min/day</p>
                            </div>
                            <div className="space-y-1">
                              <label htmlFor="mission-days" className="text-xs text-muted-foreground">Days per week</label>
                              <input
                                id="mission-days"
                                type="range"
                                min={2}
                                max={7}
                                step={1}
                                value={assignmentForm.daysPerWeek}
                                onChange={(event) =>
                                  setAssignmentForm((prev) => ({ ...prev, daysPerWeek: Number(event.target.value) }))
                                }
                                className="w-full accent-primary"
                              />
                              <p className="text-xs">{assignmentForm.daysPerWeek} days/week</p>
                            </div>
                          </div>

                          <Button onClick={submitAssignment} className="w-full">
                            Publish Mission
                          </Button>
                        </div>
                      )}

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="rounded-xl border bg-white p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">Incoming Missions</p>
                            <Badge variant="secondary">{incomingAssignments.length}</Badge>
                          </div>
                          {isLoadingAssignments && (
                            <p className="text-sm text-muted-foreground">Loading assignments...</p>
                          )}
                          {!isLoadingAssignments && incomingAssignments.length === 0 && (
                            <p className="text-sm text-muted-foreground">No active missions yet.</p>
                          )}
                          {incomingAssignments.slice(0, 6).map((assignment) => (
                            <div key={assignment.id} className="rounded-lg border bg-muted/20 p-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-sm">{assignment.title}</p>
                                <Badge variant={assignment.isCompleted ? 'default' : 'outline'}>
                                  {assignment.isCompleted ? 'Done' : 'Open'}
                                </Badge>
                              </div>
                              {assignment.targetClass?.name && (
                                <p className="text-xs text-muted-foreground mt-1">Class: {assignment.targetClass.name}</p>
                              )}
                              {assignment.focusArea && (
                                <p className="text-xs text-indigo-700 mt-1">Focus: {assignment.focusArea}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {assignment.recommendedMinutes} min/day · {assignment.daysPerWeek} days/week
                              </p>
                              {assignment.dueDate && (
                                <p className="text-xs text-muted-foreground">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                              )}
                              <Button
                                onClick={() => markAssignmentCompletion(assignment.id, !assignment.isCompleted)}
                                variant="outline"
                                className="h-7 px-2 text-xs mt-2"
                              >
                                {assignment.isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                              </Button>
                            </div>
                          ))}
                        </div>

                        <div className="rounded-xl border bg-white p-3 space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="font-semibold text-sm">Created Missions</p>
                            <Badge variant="secondary">{createdAssignments.length}</Badge>
                          </div>
                          {!isLoadingAssignments && createdAssignments.length === 0 && (
                            <p className="text-sm text-muted-foreground">No missions created yet.</p>
                          )}
                          {createdAssignments.slice(0, 8).map((assignment) => (
                            <div key={assignment.id} className="rounded-lg border bg-muted/20 p-2.5">
                              <div className="flex items-center justify-between gap-2">
                                <p className="font-semibold text-sm">{assignment.title}</p>
                                <Badge variant={assignment.isCompleted ? 'default' : 'outline'}>
                                  {assignment.isCompleted ? 'Completed' : 'Active'}
                                </Badge>
                              </div>
                              {assignment.targetClass?.name && (
                                <p className="text-xs text-muted-foreground mt-1">Target class: {assignment.targetClass.name}</p>
                              )}
                              <p className="text-xs text-muted-foreground mt-1">
                                {assignment.recommendedMinutes} min/day · {assignment.daysPerWeek} days/week
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="border-amber-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">10-Week Sprint Blueprint</CardTitle>
                  <CardDescription>Follow this sequence to scale from basics to independent Quran analysis.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    {WEEKLY_SPRINTS.map((sprint) => (
                      <div key={sprint.week} className="rounded-2xl border bg-muted/20 p-3">
                        <p className="text-xs uppercase tracking-wide text-muted-foreground">Week {sprint.week}</p>
                        <p className="font-semibold mt-1">{sprint.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">{sprint.target}</p>
                        <p className="mt-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1">
                          Output: {sprint.output}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-sky-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Achievement Wall</CardTitle>
                  <CardDescription>
                    {unlockedBadgeCount}/{milestoneBadges.length} milestones unlocked.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2 md:grid-cols-2">
                    {milestoneBadges.map((badge) => (
                      <div
                        key={badge.id}
                        className={cn(
                          'rounded-xl border px-3 py-2.5',
                          badge.unlocked
                            ? 'border-sky-300 bg-sky-50 text-sky-900'
                            : 'border-border bg-muted/20 text-muted-foreground'
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm">{badge.title}</p>
                          <Badge variant={badge.unlocked ? 'default' : 'secondary'}>
                            {badge.unlocked ? 'Unlocked' : 'Locked'}
                          </Badge>
                        </div>
                        <p className="text-xs mt-1">{badge.desc}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-rose-100">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Reflection Journal</CardTitle>
                  <CardDescription>Capture what you understood today so retention grows faster.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <textarea
                    value={journalEntry}
                    onChange={(event) => setJournalEntry(event.target.value)}
                    rows={6}
                    placeholder="Write your notes: new words learned, roots discovered, and one Quran insight..."
                    className="w-full rounded-xl border border-input bg-background p-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground">
                    Auto-saved. {journalEntry.trim().length} character{journalEntry.trim().length === 1 ? '' : 's'}.
                  </p>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx>{`
        @keyframes adventurePop {
          0% {
            opacity: 0;
            transform: translateY(10px) scale(0.98);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes adventureFloat {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-6px) rotate(4deg);
          }
        }
      `}</style>
    </div>
  );
}
