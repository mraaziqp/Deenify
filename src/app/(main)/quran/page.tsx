'use client';
export const dynamic = "force-dynamic";

import { useState, useRef, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause, Bookmark, Volume2, BookOpen, Search, Loader2, CheckCircle2 } from 'lucide-react';
import { allSurahs, type Surah } from '@/lib/quran-data';
// TODO: Implement DB-based progress management
import toast from 'react-hot-toast';

// Use the complete 114 Surah list
const surahs: Surah[] = allSurahs;

// Highlighted surahs to show initially (featured ones)
const highlightedSurahs = [1, 2, 18, 36, 55, 56, 67, 112]; // Surah numbers

interface Reciter {
  name: string;
  country: string;
  style: string;
  slug: string; // For API endpoint
}

const reciters: Reciter[] = [
  { name: 'Abdur-Rahman as-Sudais', country: 'Saudi Arabia', style: 'Tajweed with emotion', slug: 'ar.abdurrahmaansudais' },
  { name: 'Mishary Rashid al-Afasy', country: 'Kuwait', style: 'Clear and beautiful', slug: 'ar.alafasy' },
  { name: 'Saad al-Ghamidi', country: 'Saudi Arabia', style: 'Powerful and moving', slug: 'ar.saadalghamadi' },
  { name: 'Muhammad Ayyoub', country: 'Saudi Arabia', style: 'Slow and meditative', slug: 'ar.muhammadayyoub' },
  { name: 'Hani ar-Rifai', country: 'Syria', style: 'Smooth and melodious', slug: 'ar.hanirifai' },
];

const translationOptions = [
  { id: 'en.sahih', label: 'Sahih International', language: 'English' },
  { id: 'en.yusufali', label: 'Yusuf Ali', language: 'English' },
  { id: 'en.pickthall', label: 'Pickthall', language: 'English' },
  { id: 'en.asad', label: 'Muhammad Asad', language: 'English' },
  { id: 'en.qarai', label: 'Qarai', language: 'English' },
  { id: 'en.ahmedali', label: 'Ahmed Ali', language: 'English' },
  { id: 'en.maududi', label: 'Abul Ala Maududi', language: 'English' },
  { id: 'en.hilali', label: 'Hilali & Khan', language: 'English' },
  { id: 'en.itani', label: 'Talal Itani', language: 'English' },
  { id: 'en.wahiduddin', label: 'Wahiduddin Khan', language: 'English' },
  { id: 'ur.jalandhry', label: 'Jalandhry', language: 'Urdu' },
  { id: 'ur.maududi', label: 'Maududi', language: 'Urdu' },
  { id: 'fr.hamidullah', label: 'Hamidullah', language: 'French' },
  { id: 'tr.diyanet', label: 'Diyanet', language: 'Turkish' },
  { id: 'es.cortes', label: 'Cortes', language: 'Spanish' },
  { id: 'id.indonesian', label: 'Indonesian', language: 'Indonesian' },
];

const transliterationEdition = 'en.transliteration';
const translationLanguages = Array.from(
  new Set(translationOptions.map((option) => option.language))
);
const translationLabelById = translationOptions.reduce<Record<string, string>>((acc, option) => {
  acc[option.id] = option.label;
  return acc;
}, {});

const TOTAL_QURAN_PAGES = 604;
const TOTAL_QURAN_VERSES = 6236;
const READER_PROGRESS_KEY = 'quranReadingProgress';
const READER_SETTINGS_KEY = 'quranReaderSettings';

type QuranReaderAyah = {
  numberInSurah: number;
  text: string;
  page: number;
  surahNumber?: number;
  surahName?: string;
  translationText?: string;
  compareTranslationText?: string;
  transliterationText?: string;
};

type QuranReaderMeta = {
  number: number;
  name: string;
  englishName: string;
};

type QuranReadingProgress = {
  completedVerses: Record<string, number>;
  lastSurah: number;
};

type QuranReaderSettings = {
  readerMode: 'surah' | 'page';
  readerPage: number;
  pendingPage: string;
  showTranslation: boolean;
  translationOnly: boolean;
  showTransliteration: boolean;
  selectedLanguage: string;
  selectedTranslation: string;
  compareTranslations: boolean;
  compareLanguage: string;
  compareTranslation: string;
};

const getDefaultReadingProgress = (): QuranReadingProgress => ({
  completedVerses: {},
  lastSurah: 1,
});

const loadReadingProgress = (): QuranReadingProgress => {
  if (typeof window === 'undefined') return getDefaultReadingProgress();
  const stored = localStorage.getItem(READER_PROGRESS_KEY);
  if (!stored) return getDefaultReadingProgress();
  try {
    const parsed = JSON.parse(stored) as QuranReadingProgress;
    return {
      completedVerses: parsed.completedVerses || {},
      lastSurah: parsed.lastSurah || 1,
    };
  } catch {
    return getDefaultReadingProgress();
  }
};

const saveReadingProgress = (progress: QuranReadingProgress) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(READER_PROGRESS_KEY, JSON.stringify(progress));
};

const getDefaultReaderSettings = (): QuranReaderSettings => ({
  readerMode: 'surah',
  readerPage: 1,
  pendingPage: '1',
  showTranslation: false,
  translationOnly: false,
  showTransliteration: false,
  selectedLanguage: translationLanguages[0] ?? 'English',
  selectedTranslation: translationOptions[0].id,
  compareTranslations: false,
  compareLanguage: translationLanguages[0] ?? 'English',
  compareTranslation: translationOptions[1]?.id ?? translationOptions[0].id,
});

const loadReaderSettings = (): QuranReaderSettings => {
  if (typeof window === 'undefined') return getDefaultReaderSettings();
  const stored = localStorage.getItem(READER_SETTINGS_KEY);
  if (!stored) return getDefaultReaderSettings();
  try {
    const parsed = JSON.parse(stored) as QuranReaderSettings;
    return {
      ...getDefaultReaderSettings(),
      ...parsed,
    };
  } catch {
    return getDefaultReaderSettings();
  }
};

const saveReaderSettings = (settings: QuranReaderSettings) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(READER_SETTINGS_KEY, JSON.stringify(settings));
};

export default function QuranPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('surahs');
  const [savedSurahs, setSavedSurahs] = useState<number[]>([]);
  const [playingSurah, setPlayingSurah] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReciter, setSelectedReciter] = useState<Reciter>(reciters[1]); // Default to Al-Afasy
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [readerSurah, setReaderSurah] = useState(1);
  const [readerMode, setReaderMode] = useState<'surah' | 'page'>('surah');
  const [readerPage, setReaderPage] = useState(1);
  const [pendingPage, setPendingPage] = useState('1');
  const [showTranslation, setShowTranslation] = useState(false);
  const [translationOnly, setTranslationOnly] = useState(false);
  const [showTransliteration, setShowTransliteration] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState(translationLanguages[0] ?? 'English');
  const [selectedTranslation, setSelectedTranslation] = useState(translationOptions[0].id);
  const [compareTranslations, setCompareTranslations] = useState(false);
  const [compareLanguage, setCompareLanguage] = useState(translationLanguages[0] ?? 'English');
  const [compareTranslation, setCompareTranslation] = useState(translationOptions[1]?.id ?? translationOptions[0].id);
  const [readerAyahs, setReaderAyahs] = useState<QuranReaderAyah[]>([]);
  const [readerMeta, setReaderMeta] = useState<QuranReaderMeta | null>(null);
  const [readerLoading, setReaderLoading] = useState(false);
  const [readerError, setReaderError] = useState<string | null>(null);
  const [readingProgress, setReadingProgress] = useState<QuranReadingProgress>(getDefaultReadingProgress());
  const [readingProgressLoaded, setReadingProgressLoaded] = useState(false);
  const [readerSettingsLoaded, setReaderSettingsLoaded] = useState(false);

  // Get audio URL for a surah (using selected recitation from Islamic.Network CDN)
  const getAudioUrl = (surahNumber: number): string => {
    // Pad the number if needed (e.g., 1 -> 001)
    const paddedNumber = surahNumber.toString().padStart(3, '0');
    return `https://cdn.islamic.network/quran/audio/128/${selectedReciter.slug}/${paddedNumber}.mp3`;
  };

  // Play/Pause audio handler
  const toggleAudio = async (surahNumber: number) => {
    // If same surah is playing, pause it
    if (playingSurah === surahNumber && audioRef.current) {
      audioRef.current.pause();
      setPlayingSurah(null);
      return;
    }

    // Stop any currently playing audio
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    // Start playing new audio
    setIsLoading(true);
    const audio = new Audio(getAudioUrl(surahNumber));
    audioRef.current = audio;

    audio.addEventListener('loadeddata', () => {
      setIsLoading(false);
      setPlayingSurah(surahNumber);
    });

    audio.addEventListener('ended', () => {
      setPlayingSurah(null);
    });

    audio.addEventListener('error', () => {
      setIsLoading(false);
      setPlayingSurah(null);
      alert('Failed to load audio. Please try again.');
    });

    try {
      await audio.play();
    } catch (error) {
      console.error('Audio playback error:', error);
      setIsLoading(false);
      setPlayingSurah(null);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const progress = loadReadingProgress();
    setReadingProgress(progress);
    setReaderSurah(progress.lastSurah || 1);
    setReadingProgressLoaded(true);
  }, []);

  useEffect(() => {
    const settings = loadReaderSettings();
    setReaderMode(settings.readerMode);
    setReaderPage(settings.readerPage);
    setPendingPage(settings.pendingPage);
    setShowTranslation(settings.showTranslation);
    setTranslationOnly(settings.translationOnly);
    setShowTransliteration(settings.showTransliteration);
    setSelectedLanguage(settings.selectedLanguage);
    setSelectedTranslation(settings.selectedTranslation);
    setCompareTranslations(settings.compareTranslations);
    setCompareLanguage(settings.compareLanguage);
    setCompareTranslation(settings.compareTranslation);
    setReaderSettingsLoaded(true);
  }, []);

  useEffect(() => {
    if (!readingProgressLoaded) return;
    saveReadingProgress(readingProgress);

    const pagesRead = new Set(Object.values(readingProgress.completedVerses)).size;
    // TODO: Update progress via API (quranPagesRead)
    window.dispatchEvent(new Event('progressUpdated'));
  }, [readingProgress, readingProgressLoaded]);

  useEffect(() => {
    if (!readerSettingsLoaded) return;
    saveReaderSettings({
      readerMode,
      readerPage,
      pendingPage,
      showTranslation,
      translationOnly,
      showTransliteration,
      selectedLanguage,
      selectedTranslation,
      compareTranslations,
      compareLanguage,
      compareTranslation,
    });
  }, [
    compareLanguage,
    compareTranslation,
    compareTranslations,
    pendingPage,
    readerMode,
    readerPage,
    readerSettingsLoaded,
    selectedLanguage,
    selectedTranslation,
    showTranslation,
    translationOnly,
    showTransliteration,
  ]);

  const translationsForLanguage = useMemo(
    () => translationOptions.filter((option) => option.language === selectedLanguage),
    [selectedLanguage]
  );

  const compareTranslationsForLanguage = useMemo(() => {
    return translationOptions.filter((option) => {
      if (option.language !== compareLanguage) return false;
      if (compareLanguage === selectedLanguage && option.id === selectedTranslation) return false;
      return true;
    });
  }, [compareLanguage, selectedLanguage, selectedTranslation]);

  useEffect(() => {
    if (!translationsForLanguage.length) return;
    if (!translationsForLanguage.some((option) => option.id === selectedTranslation)) {
      setSelectedTranslation(translationsForLanguage[0].id);
    }
  }, [translationsForLanguage, selectedTranslation]);

  useEffect(() => {
    if (!compareTranslationsForLanguage.length) return;
    if (!compareTranslationsForLanguage.some((option) => option.id === compareTranslation)) {
      setCompareTranslation(compareTranslationsForLanguage[0].id);
    }
  }, [compareTranslation, compareTranslationsForLanguage]);

  useEffect(() => {
    const fetchSurah = async () => {
      setReaderLoading(true);
      setReaderError(null);
      try {
        if (readerMode === 'surah') {
          const [arabicResponse, translationResponse, transliterationResponse] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/surah/${readerSurah}/quran-uthmani`),
            showTranslation
              ? fetch(`https://api.alquran.cloud/v1/surah/${readerSurah}/${selectedTranslation}`)
              : Promise.resolve(null),
            showTransliteration
              ? fetch(`https://api.alquran.cloud/v1/surah/${readerSurah}/${transliterationEdition}`)
              : Promise.resolve(null),
          ]);

          const compareResponse = showTranslation && compareTranslations
            ? await fetch(`https://api.alquran.cloud/v1/surah/${readerSurah}/${compareTranslation}`)
            : null;

          if (
            !arabicResponse.ok
            || (showTranslation && !translationResponse?.ok)
            || (showTransliteration && !transliterationResponse?.ok)
            || (showTranslation && compareTranslations && !compareResponse?.ok)
          ) {
            throw new Error('Failed to load surah.');
          }

          const arabicResult = await arabicResponse.json();
          const translationResult = showTranslation && translationResponse ? await translationResponse.json() : null;
          const transliterationResult = showTransliteration && transliterationResponse ? await transliterationResponse.json() : null;
          const compareResult = showTranslation && compareTranslations && compareResponse ? await compareResponse.json() : null;

          const arabicData = arabicResult?.data;
          const translationData = translationResult?.data;
          const transliterationData = transliterationResult?.data;
          const compareData = compareResult?.data;
          const arabicAyahs = Array.isArray(arabicData?.ayahs) ? arabicData.ayahs : [];
          const translationAyahs = Array.isArray(translationData?.ayahs) ? translationData.ayahs : [];
          const transliterationAyahs = Array.isArray(transliterationData?.ayahs) ? transliterationData.ayahs : [];
          const compareAyahs = Array.isArray(compareData?.ayahs) ? compareData.ayahs : [];

          const translations = new Map<number, string>();
          translationAyahs.forEach((ayah: { numberInSurah: number; text: string }) => {
            translations.set(ayah.numberInSurah, ayah.text);
          });

          const transliterations = new Map<number, string>();
          transliterationAyahs.forEach((ayah: { numberInSurah: number; text: string }) => {
            transliterations.set(ayah.numberInSurah, ayah.text);
          });

          const compareTranslationsMap = new Map<number, string>();
          compareAyahs.forEach((ayah: { numberInSurah: number; text: string }) => {
            compareTranslationsMap.set(ayah.numberInSurah, ayah.text);
          });

          const mergedAyahs = arabicAyahs.map((ayah: QuranReaderAyah) => ({
            ...ayah,
            translationText: translations.get(ayah.numberInSurah) || '',
            compareTranslationText: compareTranslationsMap.get(ayah.numberInSurah) || '',
            transliterationText: transliterations.get(ayah.numberInSurah) || '',
          }));

          setReaderAyahs(mergedAyahs);
          setReaderMeta({
            number: arabicData?.number || readerSurah,
            name: arabicData?.name || '',
            englishName: arabicData?.englishName || '',
          });
        } else {
          const safePage = Math.min(Math.max(readerPage, 1), TOTAL_QURAN_PAGES);
          const [arabicResponse, translationResponse, transliterationResponse] = await Promise.all([
            fetch(`https://api.alquran.cloud/v1/page/${safePage}/quran-uthmani`),
            showTranslation
              ? fetch(`https://api.alquran.cloud/v1/page/${safePage}/${selectedTranslation}`)
              : Promise.resolve(null),
            showTransliteration
              ? fetch(`https://api.alquran.cloud/v1/page/${safePage}/${transliterationEdition}`)
              : Promise.resolve(null),
          ]);

          const compareResponse = showTranslation && compareTranslations
            ? await fetch(`https://api.alquran.cloud/v1/page/${safePage}/${compareTranslation}`)
            : null;

          if (
            !arabicResponse.ok
            || (showTranslation && !translationResponse?.ok)
            || (showTransliteration && !transliterationResponse?.ok)
            || (showTranslation && compareTranslations && !compareResponse?.ok)
          ) {
            throw new Error('Failed to load page.');
          }

          const arabicResult = await arabicResponse.json();
          const translationResult = showTranslation && translationResponse ? await translationResponse.json() : null;
          const transliterationResult = showTransliteration && transliterationResponse ? await transliterationResponse.json() : null;
          const compareResult = showTranslation && compareTranslations && compareResponse ? await compareResponse.json() : null;

          const arabicData = arabicResult?.data;
          const translationData = translationResult?.data;
          const transliterationData = transliterationResult?.data;
          const compareData = compareResult?.data;
          const arabicAyahs = Array.isArray(arabicData?.ayahs) ? arabicData.ayahs : [];
          const translationAyahs = Array.isArray(translationData?.ayahs) ? translationData.ayahs : [];
          const transliterationAyahs = Array.isArray(transliterationData?.ayahs) ? transliterationData.ayahs : [];
          const compareAyahs = Array.isArray(compareData?.ayahs) ? compareData.ayahs : [];

          const translations = new Map<string, string>();
          translationAyahs.forEach((ayah: { numberInSurah: number; text: string; surah?: { number: number } }) => {
            const key = `${ayah.surah?.number || 0}:${ayah.numberInSurah}`;
            translations.set(key, ayah.text);
          });

          const transliterations = new Map<string, string>();
          transliterationAyahs.forEach((ayah: { numberInSurah: number; text: string; surah?: { number: number } }) => {
            const key = `${ayah.surah?.number || 0}:${ayah.numberInSurah}`;
            transliterations.set(key, ayah.text);
          });

          const compareTranslationsMap = new Map<string, string>();
          compareAyahs.forEach((ayah: { numberInSurah: number; text: string; surah?: { number: number } }) => {
            const key = `${ayah.surah?.number || 0}:${ayah.numberInSurah}`;
            compareTranslationsMap.set(key, ayah.text);
          });

          const mergedAyahs = arabicAyahs.map((ayah: QuranReaderAyah & { surah?: { number: number; englishName: string } }) => {
            const key = `${ayah.surah?.number || 0}:${ayah.numberInSurah}`;
            return {
              ...ayah,
              surahNumber: ayah.surah?.number,
              surahName: ayah.surah?.englishName,
              translationText: translations.get(key) || '',
              compareTranslationText: compareTranslationsMap.get(key) || '',
              transliterationText: transliterations.get(key) || '',
            };
          });

          setReaderAyahs(mergedAyahs);
          setReaderMeta({
            number: safePage,
            name: `Page ${safePage}`,
            englishName: `Page ${safePage}`,
          });
        }
      } catch (error) {
        console.error('Failed to load surah:', error);
        setReaderError(readerMode === 'surah' ? 'Unable to load this surah. Please try again.' : 'Unable to load this page. Please try again.');
      } finally {
        setReaderLoading(false);
      }
    };

    void fetchSurah();
  }, [
    compareTranslation,
    compareTranslations,
    readerMode,
    readerSurah,
    readerPage,
    selectedTranslation,
    showTranslation,
    showTransliteration,
  ]);

  const filteredSurahs = surahs.filter(surah =>
    surah.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    surah.arabicName.includes(searchTerm) ||
    surah.meaning.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleSave = (surahNumber: number) => {
    setSavedSurahs(prev =>
      prev.includes(surahNumber)
        ? prev.filter(n => n !== surahNumber)
        : [...prev, surahNumber]
    );
  };

  const handleReaderSurahChange = (value: string) => {
    const nextSurah = Number(value);
    if (!Number.isFinite(nextSurah)) return;
    setReaderSurah(nextSurah);
    setReadingProgress(prev => ({
      ...prev,
      lastSurah: nextSurah,
    }));
  };

  const handleReaderModeChange = (value: string) => {
    if (value !== 'surah' && value !== 'page') return;
    setReaderMode(value);
  };

  const handlePageInputChange = (value: string) => {
    const sanitized = value.replace(/[^0-9]/g, '');
    setPendingPage(sanitized);
  };

  const handlePageJump = () => {
    if (!pendingPage) return;
    const nextPage = Math.min(Math.max(Number(pendingPage), 1), TOTAL_QURAN_PAGES);
    setReaderPage(nextPage);
    setPendingPage(nextPage.toString());
  };

  const handleToggleVerse = (verseId: string, page: number, checked: boolean) => {
    setReadingProgress(prev => {
      const next = {
        ...prev,
        completedVerses: { ...prev.completedVerses },
      };

      if (checked) {
        next.completedVerses[verseId] = page;
      } else {
        delete next.completedVerses[verseId];
      }

      return next;
    });
  };

  const completedVerseCount = useMemo(
    () => Object.keys(readingProgress.completedVerses).length,
    [readingProgress.completedVerses]
  );
  const completedPagesCount = useMemo(
    () => new Set(Object.values(readingProgress.completedVerses)).size,
    [readingProgress.completedVerses]
  );
  const pageProgressPercent = Math.round((completedPagesCount / TOTAL_QURAN_PAGES) * 100);

  const selectReciter = (reciter: Reciter) => {
    // Stop any playing audio when changing reciter
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingSurah(null);
    setSelectedReciter(reciter);
    toast.success(`Reciter changed to ${reciter.name}`);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quran & Recitations</h1>
        <p className="text-muted-foreground">
          Read, listen, and learn from the word of Allah
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Chapters</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">114</div>
            <p className="text-xs text-muted-foreground">Complete Quran</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Verses</CardTitle>
            <Volume2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6,236</div>
            <p className="text-xs text-muted-foreground">Words of guidance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Chapters</CardTitle>
            <Bookmark className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{savedSurahs.length}</div>
            <p className="text-xs text-muted-foreground">Your favorites</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="surahs">
            <BookOpen className="h-4 w-4 mr-2" />
            Surahs
          </TabsTrigger>
          <TabsTrigger value="reader">
            <BookOpen className="h-4 w-4 mr-2" />
            Reader
          </TabsTrigger>
          <TabsTrigger value="reciters">
            <Volume2 className="h-4 w-4 mr-2" />
            Reciters
          </TabsTrigger>
          <TabsTrigger value="reading">
            <Search className="h-4 w-4 mr-2" />
            Reading Guide
          </TabsTrigger>
        </TabsList>

        {/* Surahs Tab */}
        <TabsContent value="surahs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Surahs</CardTitle>
              <CardDescription>Find chapters by name, meaning, or verse count</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search surahs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4">
            {filteredSurahs.map((surah) => (
              <Card key={surah.number} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-4 flex-1">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-teal-400 to-blue-600 text-white font-bold text-lg flex-shrink-0">
                        {surah.number}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-lg">{surah.name}</h3>
                          <span className="text-2xl font-bold text-teal-600">{surah.arabicName}</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{surah.meaning}</p>
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline">{surah.verses} verses</Badge>
                          <Badge
                            variant="secondary"
                            className={surah.revelation === 'Meccan' ? 'bg-amber-100' : 'bg-green-100'}
                          >
                            {surah.revelation}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{surah.description}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant={playingSurah === surah.number ? "secondary" : "default"}
                        className={playingSurah === surah.number ? "" : "bg-teal-600 hover:bg-teal-700"}
                        onClick={() => toggleAudio(surah.number)}
                        disabled={isLoading}
                      >
                        {isLoading && playingSurah === surah.number ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : playingSurah === surah.number ? (
                          <Pause className="h-4 w-4 mr-2" />
                        ) : (
                          <Play className="h-4 w-4 mr-2" />
                        )}
                        {playingSurah === surah.number ? 'Pause' : 'Listen'}
                      </Button>
                      <Button
                        size="sm"
                        variant={savedSurahs.includes(surah.number) ? 'default' : 'outline'}
                        onClick={() => toggleSave(surah.number)}
                      >
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reciters Tab */}
        <TabsContent value="reciters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Select Your Preferred Reciter</CardTitle>
              <CardDescription>
                Choose a reciter to listen to Quran recitations. Currently selected: {selectedReciter.name}
              </CardDescription>
            </CardHeader>
          </Card>
          
          <div className="grid gap-4">
            {reciters.map((reciter, idx) => (
              <Card 
                key={idx} 
                className={`hover:shadow-md transition-all ${
                  selectedReciter.slug === reciter.slug ? 'ring-2 ring-teal-600 bg-teal-50/50' : ''
                }`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {selectedReciter.slug === reciter.slug && (
                        <CheckCircle2 className="h-5 w-5 text-teal-600" />
                      )}
                      <div>
                        <h3 className="font-semibold text-lg">{reciter.name}</h3>
                        <p className="text-sm text-muted-foreground">{reciter.country}</p>
                        <Badge variant="outline" className="mt-2">
                          {reciter.style}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      className={selectedReciter.slug === reciter.slug ? '' : 'bg-teal-600 hover:bg-teal-700'}
                      variant={selectedReciter.slug === reciter.slug ? 'secondary' : 'default'}
                      onClick={() => selectReciter(reciter)}
                    >
                      {selectedReciter.slug === reciter.slug ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        <>
                          <Volume2 className="h-4 w-4 mr-2" />
                          Select
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reader Tab */}
        <TabsContent value="reader" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Virtual Quran Reader</CardTitle>
              <CardDescription>
                Read ayahs and track the pages and verses you complete.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <p className="text-sm font-semibold">Choose a Surah</p>
                    <div className="space-y-2">
                      <Label className="text-xs text-muted-foreground">Reading mode</Label>
                      <Select value={readerMode} onValueChange={handleReaderModeChange}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reading mode" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="surah">Surah</SelectItem>
                          <SelectItem value="page">Page</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {readerMode === 'surah' ? (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Choose a surah</Label>
                        <Select value={readerSurah.toString()} onValueChange={handleReaderSurahChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select surah" />
                          </SelectTrigger>
                          <SelectContent>
                            {surahs.map((surah) => (
                              <SelectItem key={surah.number} value={surah.number.toString()}>
                                {surah.number}. {surah.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">
                          Current: {readerMeta?.englishName || 'Loading...'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Jump to page</Label>
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            min={1}
                            max={TOTAL_QURAN_PAGES}
                            value={pendingPage}
                            onChange={(event) => handlePageInputChange(event.target.value)}
                          />
                          <Button variant="secondary" onClick={handlePageJump}>
                            Go
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Page {readerPage} of {TOTAL_QURAN_PAGES}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      <Switch checked={showTranslation} onCheckedChange={setShowTranslation} />
                      <Label className="text-xs text-muted-foreground">Show translation</Label>
                    </div>

                    {showTranslation && (
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Language</Label>
                        <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            {translationLanguages.map((language) => (
                              <SelectItem key={language} value={language}>
                                {language}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Label className="text-xs text-muted-foreground">Translation</Label>
                        <Select value={selectedTranslation} onValueChange={setSelectedTranslation}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select translation" />
                          </SelectTrigger>
                          <SelectContent>
                            {translationsForLanguage.map((translation) => (
                              <SelectItem key={translation.id} value={translation.id}>
                                {translation.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <div className="flex items-center gap-2 pt-1">
                          <Switch checked={translationOnly} onCheckedChange={setTranslationOnly} />
                          <Label className="text-xs text-muted-foreground">Translation-only view</Label>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <Switch checked={compareTranslations} onCheckedChange={setCompareTranslations} />
                          <Label className="text-xs text-muted-foreground">Compare translations</Label>
                        </div>

                        {compareTranslations && (
                          <div className="space-y-2">
                            <Label className="text-xs text-muted-foreground">Compare language</Label>
                            <Select value={compareLanguage} onValueChange={setCompareLanguage}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                              </SelectTrigger>
                              <SelectContent>
                                {translationLanguages.map((language) => (
                                  <SelectItem key={language} value={language}>
                                    {language}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Label className="text-xs text-muted-foreground">Compare with</Label>
                            <Select value={compareTranslation} onValueChange={setCompareTranslation}>
                              <SelectTrigger>
                                <SelectValue placeholder="Select translation" />
                              </SelectTrigger>
                              <SelectContent>
                                {compareTranslationsForLanguage.map((translation) => (
                                  <SelectItem key={translation.id} value={translation.id}>
                                    {translation.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Switch checked={showTransliteration} onCheckedChange={setShowTransliteration} />
                      <Label className="text-xs text-muted-foreground">Show transliteration</Label>
                    </div>
                </div>

                <Card className="border-teal-200 bg-teal-50/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-teal-700">
                        {completedPagesCount}
                      </div>
                      <p className="text-sm text-muted-foreground">Pages completed</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {completedVerseCount}
                      </div>
                      <p className="text-sm text-muted-foreground">Verses completed</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Page progress</span>
                  <span className="font-semibold">{pageProgressPercent}%</span>
                </div>
                <Progress value={pageProgressPercent} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {completedPagesCount} of {TOTAL_QURAN_PAGES} pages • {completedVerseCount} of {TOTAL_QURAN_VERSES} verses
                </p>
              </div>

              <div className="rounded-lg border bg-background">
                <div className="border-b px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold">
                        {readerMeta?.englishName || 'Loading'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {readerMeta?.name || ''}
                      </p>
                    </div>
                    {readerLoading && (
                      <Badge variant="secondary">Loading...</Badge>
                    )}
                  </div>
                </div>

                <ScrollArea className="h-[520px]">
                  <div className="space-y-4 p-4">
                    {readerError && (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        {readerError}
                      </div>
                    )}

                    {!readerError && readerAyahs.length === 0 && !readerLoading && (
                      <div className="text-sm text-muted-foreground">No verses available.</div>
                    )}

                    {readerAyahs.map((ayah) => {
                      const surahNumber = ayah.surahNumber || readerSurah;
                      const verseId = `${surahNumber}:${ayah.numberInSurah}`;
                      const isCompleted = Boolean(readingProgress.completedVerses[verseId]);
                      return (
                        <div key={verseId} className="flex gap-3 border-b pb-4">
                          <Checkbox
                            checked={isCompleted}
                            onCheckedChange={(checked) =>
                              handleToggleVerse(verseId, ayah.page, checked === true)
                            }
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-xs text-muted-foreground">
                                {readerMode === 'page' && ayah.surahName
                                  ? `${ayah.surahName} ${ayah.numberInSurah}`
                                  : `Ayah ${ayah.numberInSurah}`} • Page {ayah.page}
                              </p>
                              {isCompleted && <Badge variant="secondary">Completed</Badge>}
                            </div>
                            {!translationOnly && (
                              <p className="text-right text-xl leading-loose">{ayah.text}</p>
                            )}
                            {!translationOnly && showTransliteration && ayah.transliterationText && (
                              <p className="mt-2 text-sm italic text-muted-foreground">
                                {ayah.transliterationText}
                              </p>
                            )}
                            {showTranslation && ayah.translationText && (
                              <div className={`mt-2 grid gap-3 ${compareTranslations ? 'md:grid-cols-2' : ''}`}>
                                <div>
                                  <p className="text-xs font-semibold text-muted-foreground">
                                    {translationLabelById[selectedTranslation] || 'Translation'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {ayah.translationText}
                                  </p>
                                </div>
                                {compareTranslations && ayah.compareTranslationText && (
                                  <div>
                                    <p className="text-xs font-semibold text-muted-foreground">
                                      {translationLabelById[compareTranslation] || 'Translation'}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                      {ayah.compareTranslationText}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reading Guide Tab */}
        <TabsContent value="reading" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>How to Read the Quran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="border-l-4 border-teal-600 pl-4">
                  <h4 className="font-semibold mb-1">Start with the Foundation</h4>
                  <p className="text-sm text-muted-foreground">
                    Begin with Surah Al-Fatiha (Chapter 1) and short surahs like Al-Ikhlas and Al-Nas to build familiarity with the Quran.
                  </p>
                </div>

                <div className="border-l-4 border-blue-600 pl-4">
                  <h4 className="font-semibold mb-1">Learn Tajweed</h4>
                  <p className="text-sm text-muted-foreground">
                    Tajweed is the science of reciting the Quran correctly with proper pronunciation and intonation. Listen to experienced reciters.
                  </p>
                </div>

                <div className="border-l-4 border-purple-600 pl-4">
                  <h4 className="font-semibold mb-1">Understand the Meaning</h4>
                  <p className="text-sm text-muted-foreground">
                    Study tafsir (interpretation) to understand the deeper meaning and context of the verses.
                  </p>
                </div>

                <div className="border-l-4 border-green-600 pl-4">
                  <h4 className="font-semibold mb-1">Reflect and Contemplate</h4>
                  <p className="text-sm text-muted-foreground">
                    The Quran is meant to be reflected upon. Ponder over the verses and apply them to your life.
                  </p>
                </div>

                <div className="border-l-4 border-orange-600 pl-4">
                  <h4 className="font-semibold mb-1">Regular Recitation</h4>
                  <p className="text-sm text-muted-foreground">
                    Establish a daily routine of reading the Quran. Even a few verses daily will bring spiritual benefit.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-teal-50 to-blue-50 border-teal-200">
            <CardHeader>
              <CardTitle>Virtues of Reading the Quran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                "The best among you are those who learn the Quran and teach it." - Hadith (Sahih Al-Bukhari)
              </p>
              <p>
                Each letter of the Quran brings ten rewards from Allah. The Quran is an intercessor for us on the Day of Judgment.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
