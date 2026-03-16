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

type StageId = 'beginner' | 'intermediate' | 'advanced';
type GameId = 'letters' | 'vocab' | 'grammar';
type HubTabId = 'path' | 'adventure' | 'games' | 'bridge' | 'speaking' | 'revision' | 'placement' | 'planner';

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

const STAGE_META: Record<
  StageId,
  {
    title: string;
    subtitle: string;
    color: string;
    xpBand: string;
  }
> = {
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
  const [activeStage, setActiveStage] = useState<StageId>('beginner');
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
  const [progress, setProgress] = useState<LearnerProgress>(defaultProgress);

  const todayMission = useMemo(() => {
    const dayCode = Number(getTodayIso().replace(/-/g, ''));
    return DAILY_CHALLENGES[dayCode % DAILY_CHALLENGES.length];
  }, []);

  const lessonsForStage = useMemo(
    () => LESSONS.filter((lesson) => lesson.stage === activeStage),
    [activeStage]
  );

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

    const validTabs: HubTabId[] = ['path', 'adventure', 'games', 'bridge', 'speaking', 'revision', 'placement', 'planner'];
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
    };
  }, []);

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
    setProgress((prev) => withActivityUpdate({
      ...prev,
      xp: prev.xp + reward.xp,
    }));
  };

  const completeBossChallenge = () => {
    if (!bossUnlocked || bossCompleted) return;

    setBossCompleted(true);
    setAdventureSparkles((prev) => prev + 10);
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
      totalPoints <= 11 ? 'beginner' : totalPoints <= 18 ? 'intermediate' : 'advanced';

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
    <div className="container mx-auto max-w-6xl px-3 py-4 sm:px-4 md:px-8 space-y-6">
      <section className="relative overflow-hidden rounded-3xl border border-emerald-300/40 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-700" />
        <div className="absolute -top-14 -right-10 h-48 w-48 rounded-full bg-amber-300/25 blur-2xl" />
        <div className="absolute top-10 left-1/3 h-32 w-32 rounded-full bg-white/10 blur-xl" />
        <div className="absolute bottom-4 right-8 text-6xl text-white/10 arabic-text" dir="rtl">
          تَدَبُّر
        </div>

        <div className="relative z-10 p-5 sm:p-7 md:p-9 text-white space-y-5">
          <Badge className="bg-white/15 text-white border-white/20 backdrop-blur-sm">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            New: Quran Arabic Mastery Track
          </Badge>

          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Arabic Learning Hub
            </h1>
            <p className="max-w-3xl text-sm sm:text-base text-emerald-50/95">
              A full learning path that starts from beginner basics and grows into advanced Quran comprehension.
              Build your skills through structured lessons, fun games, and root-pattern exploration so you can
              understand more directly while reading Quran.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-white/10 border-white/15 text-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-100">Lessons Done</p>
                  <p className="text-2xl font-bold tabular-nums">{completedCount}/{totalLessons}</p>
                </div>
                <BookOpen className="h-7 w-7 text-emerald-100" />
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/15 text-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-100">Current Streak</p>
                  <p className="text-2xl font-bold tabular-nums">{progress.streak} day{progress.streak === 1 ? '' : 's'}</p>
                </div>
                <Flame className="h-7 w-7 text-orange-200" />
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/15 text-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-100">Total XP</p>
                  <p className="text-2xl font-bold tabular-nums">{progress.xp}</p>
                </div>
                <Star className="h-7 w-7 text-amber-200" />
              </CardContent>
            </Card>
            <Card className="bg-white/10 border-white/15 text-white">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-emerald-100">Game Wins</p>
                  <p className="text-2xl font-bold tabular-nums">{progress.gamesWon}</p>
                </div>
                <Trophy className="h-7 w-7 text-yellow-200" />
              </CardContent>
            </Card>
          </div>

          <div className="rounded-2xl border border-white/15 bg-black/10 p-4 backdrop-blur-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <p className="font-semibold">Today&apos;s Mission</p>
              <Badge className="bg-amber-400/20 text-amber-100 border-amber-200/30">Daily Practice</Badge>
            </div>
            <p className="text-sm text-emerald-50">{todayMission}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 border-emerald-100">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Mastery Rank: {levelInfo.level}
            </CardTitle>
            <CardDescription>
              Progress to the next rank by finishing lessons and completing game rounds.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Progress value={xpProgress} className="h-2" />
            <div className="text-xs text-muted-foreground flex justify-between">
              <span>{progress.xp} XP earned</span>
              <span>Next checkpoint: {levelInfo.nextTarget} XP</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-emerald-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Overall Completion</CardTitle>
            <CardDescription>Complete all lessons to finish the full track.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Progress value={completionPercent} className="h-2" />
            <p className="text-sm text-muted-foreground">{completionPercent}% complete</p>
            {user?.id && (
              <div
                className={cn(
                  'rounded-lg border px-3 py-2 text-xs',
                  syncStatus === 'synced' && 'border-emerald-200 bg-emerald-50 text-emerald-800',
                  syncStatus === 'syncing' && 'border-blue-200 bg-blue-50 text-blue-800',
                  syncStatus === 'error' && 'border-red-200 bg-red-50 text-red-800',
                  syncStatus === 'idle' && 'border-border bg-muted/40 text-muted-foreground'
                )}
              >
                {syncStatus === 'synced' && 'Cloud sync active: your Arabic progress is saved across devices.'}
                {syncStatus === 'syncing' && 'Syncing your latest Arabic progress...'}
                {syncStatus === 'error' && `Sync issue: ${syncError || 'Unable to reach server right now.'}`}
                {syncStatus === 'idle' && 'Sign in and continue learning to enable progress sync.'}
              </div>
            )}
            <Button asChild variant="outline" className="w-full">
              <Link href="/quran">Apply Learning in Quran Reader</Link>
            </Button>
          </CardContent>
        </Card>
      </section>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as HubTabId)} className="space-y-5">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-8 h-auto gap-1">
          <TabsTrigger value="path">Pathway</TabsTrigger>
          <TabsTrigger value="adventure">Kids Adventure</TabsTrigger>
          <TabsTrigger value="placement">Placement</TabsTrigger>
          <TabsTrigger value="games">Games Lab</TabsTrigger>
          <TabsTrigger value="bridge">Quran Bridge</TabsTrigger>
          <TabsTrigger value="speaking">Speaking Studio</TabsTrigger>
          <TabsTrigger value="revision">Revision</TabsTrigger>
          <TabsTrigger value="planner">Planner</TabsTrigger>
        </TabsList>

        <TabsContent value="path" className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Languages className="h-5 w-5 text-emerald-600" />
                Class Roadmap
              </CardTitle>
              <CardDescription>
                Learn in stages: beginner to advanced, with every lesson tied directly to Quran understanding.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2 sm:grid-cols-3">
                {(['beginner', 'intermediate', 'advanced'] as StageId[]).map((stage) => {
                  const meta = STAGE_META[stage];
                  const summary = stageCompletion(stage);

                  return (
                    <button
                      key={stage}
                      onClick={() => setActiveStage(stage)}
                      className={cn(
                        'rounded-2xl border px-4 py-3 text-left transition-all',
                        activeStage === stage
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-border hover:border-primary/40'
                      )}
                    >
                      <p className="font-semibold text-sm">{meta.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{meta.subtitle}</p>
                      <div className="mt-3 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{meta.xpBand}</span>
                        <Badge variant="secondary">{summary.done}/{summary.total}</Badge>
                      </div>
                      <Progress value={summary.percent} className="h-1.5 mt-2" />
                    </button>
                  );
                })}
              </div>

              <div className="rounded-3xl border bg-muted/20 p-4 sm:p-5">
                <div className={cn('rounded-2xl p-4 text-white bg-gradient-to-r', STAGE_META[activeStage].color)}>
                  <p className="text-xs uppercase tracking-[0.18em] text-white/80">Current Stage</p>
                  <h3 className="mt-1 text-xl font-bold">{STAGE_META[activeStage].title}</h3>
                  <p className="text-sm text-white/90 mt-1">{STAGE_META[activeStage].subtitle}</p>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {lessonsForStage.map((lesson) => {
                    const done = progress.completedLessons.includes(lesson.id);

                    return (
                      <Card key={lesson.id} className={cn('border transition-all', done && 'border-emerald-300 bg-emerald-50/50')}>
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <CardTitle className="text-lg leading-tight">{lesson.title}</CardTitle>
                              <CardDescription className="mt-1">{lesson.objective}</CardDescription>
                            </div>
                            <Badge variant={done ? 'default' : 'secondary'}>
                              {done ? 'Completed' : lesson.challengeLevel}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-xs text-muted-foreground">Session length: {lesson.duration}</p>

                          <div className="rounded-xl bg-muted/40 p-3">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Drills</p>
                            <ul className="space-y-1 text-sm">
                              {lesson.drills.map((drill) => (
                                <li key={drill} className="flex items-start gap-2">
                                  <span className="text-emerald-600">•</span>
                                  <span>{drill}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-3">
                            <p className="text-xs uppercase tracking-wide text-amber-700 mb-2">Quran Bridge</p>
                            <p className="arabic-text text-[1.35rem] leading-[2.1rem] text-amber-900" dir="rtl">
                              {lesson.quranBridge.arabic}
                            </p>
                            <p className="mt-1 text-xs text-amber-800">{lesson.quranBridge.transliteration}</p>
                            <p className="mt-1 text-sm text-amber-900">{lesson.quranBridge.meaning}</p>
                            <p className="mt-2 text-xs text-amber-700">{lesson.quranBridge.note}</p>
                          </div>

                          <Button
                            onClick={() => markLessonComplete(lesson.id)}
                            variant={done ? 'outline' : 'default'}
                            className="w-full"
                          >
                            <CheckCircle2 className="mr-2 h-4 w-4" />
                            {done ? 'Lesson Completed' : 'Mark Lesson Complete (+35 XP)'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adventure" className="space-y-5">
          <Card className="relative overflow-hidden border-rose-200">
            <div className="absolute inset-0 bg-gradient-to-br from-rose-100 via-amber-50 to-sky-100" />
            <div className="absolute -top-10 -left-6 h-36 w-36 rounded-full bg-rose-300/25 blur-2xl" />
            <div className="absolute -bottom-10 -right-8 h-40 w-40 rounded-full bg-sky-300/30 blur-2xl" />

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
              <div className={cn('rounded-2xl bg-gradient-to-r p-4 text-white shadow-md', selectedAvatar.color)}>
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
              </div>

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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

              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
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

              <div className="grid gap-4 lg:grid-cols-2">
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

              <div className="grid gap-4 lg:grid-cols-2">
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

              <Card className="border-fuchsia-200 bg-white/90">
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

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
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
    </div>
  );
}
