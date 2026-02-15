'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Bookmark, Volume2, BookOpen, Search } from 'lucide-react';

interface Surah {
  number: number;
  name: string;
  arabicName: string;
  meaning: string;
  verses: number;
  revelation: 'Meccan' | 'Madinan';
  description: string;
}

const surahs: Surah[] = [
  {
    number: 1,
    name: 'Al-Fatiha',
    arabicName: 'الفاتحة',
    meaning: 'The Opening',
    verses: 7,
    revelation: 'Meccan',
    description: 'The opening chapter of the Quran, recited in every prayer',
  },
  {
    number: 2,
    name: 'Al-Baqarah',
    arabicName: 'البقرة',
    meaning: 'The Cow',
    verses: 286,
    revelation: 'Madinan',
    description: 'The longest chapter, containing guidance on various aspects of Islamic life',
  },
  {
    number: 3,
    name: 'Al-Imran',
    arabicName: 'آل عمران',
    meaning: 'The Family of Imran',
    verses: 200,
    revelation: 'Madinan',
    description: 'Discusses the family of Imran and the story of Maryam',
  },
  {
    number: 4,
    name: 'An-Nisa',
    arabicName: 'النساء',
    meaning: 'The Women',
    verses: 176,
    revelation: 'Madinan',
    description: 'Addresses womens rights and family matters',
  },
  {
    number: 5,
    name: 'Al-Maidah',
    arabicName: 'المائدة',
    meaning: 'The Table',
    verses: 120,
    revelation: 'Madinan',
    description: 'Discusses halal food, contracts, and judicial matters',
  },
  {
    number: 36,
    name: 'Ya-Sin',
    arabicName: 'يس',
    meaning: 'Ya Sin',
    verses: 83,
    revelation: 'Meccan',
    description: 'The heart of the Quran, often recited for the deceased',
  },
  {
    number: 55,
    name: 'Ar-Rahman',
    arabicName: 'الرحمن',
    meaning: 'The Most Merciful',
    verses: 78,
    revelation: 'Meccan',
    description: 'Describes Allahs blessings and attributes of mercy',
  },
  {
    number: 56,
    name: 'Al-Waqi\'ah',
    arabicName: 'الواقعة',
    meaning: 'The Inevitable Hour',
    verses: 96,
    revelation: 'Meccan',
    description: 'Discusses the Day of Judgment and the afterlife',
  },
  {
    number: 67,
    name: 'Al-Mulk',
    arabicName: 'الملك',
    meaning: 'The Dominion',
    verses: 30,
    revelation: 'Meccan',
    description: 'Emphasizes Allahs power and majesty',
  },
  {
    number: 112,
    name: 'Al-Ikhlas',
    arabicName: 'الإخلاص',
    meaning: 'The Sincerity',
    verses: 4,
    revelation: 'Meccan',
    description: 'Affirms the oneness of Allah (Tawheed)',
  },
];

interface Reciter {
  name: string;
  country: string;
  style: string;
}

const reciters: Reciter[] = [
  { name: 'Abdur-Rahman as-Sudais', country: 'Saudi Arabia', style: 'Tajweed with emotion' },
  { name: 'Mishary Rashid al-Afasy', country: 'Kuwait', style: 'Clear and beautiful' },
  { name: 'Saad al-Ghamidi', country: 'Saudi Arabia', style: 'Powerful and moving' },
  { name: 'Muhammad Ayyoub', country: 'Saudi Arabia', style: 'Slow and meditative' },
  { name: 'Hani ar-Rifai', country: 'Syria', style: 'Smooth and melodious' },
];

export default function QuranPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('surahs');
  const [savedSurahs, setSavedSurahs] = useState<number[]>([]);

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
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="surahs">
            <BookOpen className="h-4 w-4 mr-2" />
            Surahs
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
                        variant="default"
                        className="bg-teal-600 hover:bg-teal-700"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Listen
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
          <div className="grid gap-4">
            {reciters.map((reciter, idx) => (
              <Card key={idx} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{reciter.name}</h3>
                      <p className="text-sm text-muted-foreground">{reciter.country}</p>
                      <Badge variant="outline" className="mt-2">
                        {reciter.style}
                      </Badge>
                    </div>
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      <Volume2 className="h-4 w-4 mr-2" />
                      Listen
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
