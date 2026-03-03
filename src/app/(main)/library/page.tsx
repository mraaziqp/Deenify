'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PDFReader } from "@/components/ui/pdf-reader";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  GraduationCap,
  PlayCircle,
  CheckCircle2,
  Lock,
  ShieldCheck,
  UserPlus,
  Wallet,
  AlertCircle,
  HeartHandshake
} from "lucide-react";
type Dua = {
  id: string;
  title: string;
  arabic: string;
  transliteration: string;
  translation: string;
  tags: string[];
};

type Course = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration?: string;
  lessons?: number;
  progressPercent?: number;
  enrolled?: boolean;
  rating?: number;
  students?: number;
  price?: number; // 0 or undefined means free
  status?: 'approved' | 'pending_verification' | 'rejected';
};

type Reflection = {
  id: string;
  title: string;
  ayah: string;
  reference: string;
  theme: string;
};

type LibraryResponse = {
  freeCourses: Course[];
  specializedCourses: Course[];
  reflections: Reflection[];
};

export default function LibraryPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [duas, setDuas] = useState<Dua[]>([]);
  const [duasLoading, setDuasLoading] = useState(false);
  const [duasError, setDuasError] = useState<string | null>(null);
  const [duaCategory, setDuaCategory] = useState<string>('All');
  const [duaSearch, setDuaSearch] = useState('');

  useEffect(() => {
    setDuasLoading(true);
    setDuasError(null);
    fetch('/api/duas')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load duas');
        return res.json();
      })
      .then(setDuas)
      .catch(e => setDuasError(e.message || 'Unable to load duas'))
      .finally(() => setDuasLoading(false));
  }, []);

    const [pdfBooks, setPdfBooks] = useState<any[]>([]);
    const [selectedPDF, setSelectedPDF] = useState<any | null>(null);
    const [pdfLoading, setPdfLoading] = useState(false);
    const [pdfError, setPdfError] = useState<string | null>(null);

    useEffect(() => {
      // Fetch PDF books
      const loadPDFBooks = async () => {
        setPdfLoading(true);
        setPdfError(null);
        try {
          const res = await fetch("/api/pdf-book-list");
          if (!res.ok) throw new Error("Failed to load PDF books");
          const books = await res.json();
          setPdfBooks(books);
        } catch (err: any) {
          setPdfError(err.message || "Unable to load PDF books");
          setPdfBooks([]);
        } finally {
          setPdfLoading(false);
        }
      };
      loadPDFBooks();
    }, []);
  const [data, setData] = useState<LibraryResponse>({ freeCourses: [], specializedCourses: [], reflections: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const endpoint = process.env.NEXT_PUBLIC_LIBRARY_API ?? '/api/library';
        const res = await fetch(endpoint, { signal: controller.signal });
        if (!res.ok) {
          throw new Error(`Failed to load library data (${res.status})`);
        }
        const json = await res.json();
        setData({
          freeCourses: json.freeCourses ?? [],
          specializedCourses: json.specializedCourses ?? [],
          reflections: json.reflections ?? [],
        });
      } catch (err: unknown) {
        if ((err as Error).name === 'AbortError') return;
        setError((err as Error).message ?? 'Unable to load courses');
        setData({ freeCourses: [], specializedCourses: [], reflections: [] });
      } finally {
        setLoading(false);
      }
    };

    void load();
    return () => controller.abort();
  }, []);

  const filteredFree = useMemo(() => {
    const list = data.freeCourses.filter((course) => (course.price ?? 0) <= 0);
    return selectedCategory === 'all'
      ? list
      : list.filter((c) => c.category?.toLowerCase() === selectedCategory);
  }, [data.freeCourses, selectedCategory]);

  const filteredSpecialized = useMemo(() => {
    const list = data.specializedCourses.filter((course) => (course.price ?? 0) > 0);
    return selectedCategory === 'all'
      ? list
      : list.filter((c) => c.category?.toLowerCase() === selectedCategory);
  }, [data.specializedCourses, selectedCategory]);

  const categories = useMemo(() => {
    const allCats = [...data.freeCourses, ...data.specializedCourses]
      .map((c) => c.category?.toLowerCase())
      .filter(Boolean) as string[];
    return ['all', ...Array.from(new Set(allCats))];
  }, [data.freeCourses, data.specializedCourses]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner": return "bg-green-500/10 text-green-700 dark:text-green-400";
      case "Intermediate": return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
      case "Advanced": return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
      default: return "bg-gray-500/10 text-gray-700";
    }
  };

  const emptyState = (
    <Card className="border-dashed">
      <CardContent className="p-6 text-center space-y-2">
        <AlertCircle className="h-6 w-6 mx-auto text-muted-foreground" />
        <p className="font-semibold">No classes available yet</p>
        <p className="text-sm text-muted-foreground">
          Connect your backend source to load real courses (set NEXT_PUBLIC_LIBRARY_API or implement /api/library).
        </p>
      </CardContent>
    </Card>
  );

  const renderCourseCard = (course: Course) => {
    const progressPercent = course.progressPercent ?? 0;
    const isPending = course.status === 'pending_verification';
    const isLocked = course.status === 'rejected';
    const priceLabel = (course.price ?? 0) <= 0 ? 'Free' : `$${course.price?.toFixed(0)}`;

    return (
      <Card 
        key={course.id} 
        className={`transition-all duration-300 hover:shadow-lg ${
          isLocked ? 'opacity-60' : 'hover:scale-105'
        }`}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge className={getDifficultyColor(course.difficulty)}>
              {course.difficulty || '—'}
            </Badge>
            {isPending && (
              <Badge variant="secondary" className="gap-1">
                <ShieldCheck className="h-4 w-4" />
                Awaiting Verifier
              </Badge>
            )}
            {isLocked && (
              <Lock className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {course.duration ?? 'Flexible'}
            </span>
            <span className="flex items-center gap-1">
              <PlayCircle className="h-4 w-4" />
              {course.lessons ?? 0} lessons
            </span>
          </div>

          {progressPercent > 0 && course.enrolled && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-semibold text-primary">{progressPercent}%</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline">{priceLabel}</Badge>
            {course.enrolled && <Badge variant="secondary">Enrolled</Badge>}
          </div>

          <Button 
            className="w-full" 
            variant={course.enrolled ? "default" : "outline"}
            onClick={() => router.push(`/library/${course.id}`)}
            disabled={isLocked || isPending}
          >
            {isLocked ? (
              <>
                <Lock className="h-4 w-4 mr-2" />
                Locked
              </>
            ) : isPending ? (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Pending Verification
              </>
            ) : course.enrolled ? (
              <>
                <PlayCircle className="h-4 w-4 mr-2" />
                Continue Learning
              </>
            ) : (
              "Enroll Now"
            )}
          </Button>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl mb-6" style={{background:'linear-gradient(135deg,#1e1b4b 0%,#3730a3 50%,#1e40af 100%)',minHeight:'150px'}}>
        <div className="absolute" style={{top:'-20px',right:'-20px',width:'180px',height:'180px',background:'radial-gradient(circle,rgba(251,191,36,0.12) 0%,transparent 70%)',pointerEvents:'none'}} />
        <div className="absolute" style={{bottom:'-10px',left:'40px',width:'120px',height:'120px',background:'radial-gradient(circle,rgba(165,180,252,0.12) 0%,transparent 70%)',pointerEvents:'none'}} />
        <div className="absolute select-none" style={{top:'10px',right:'16px',color:'rgba(251,191,36,0.2)',fontSize:'3.5rem',lineHeight:1}}>✦</div>
        <div className="absolute select-none" style={{bottom:'6px',left:'14px',color:'rgba(251,191,36,0.12)',fontSize:'2rem',lineHeight:1}}>✦</div>
        <div className="relative z-10 px-8 py-7">
          <div className="flex items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full" style={{background:'rgba(251,191,36,0.2)',color:'#fbbf24',border:'1px solid rgba(251,191,36,0.3)'}}>
              📚 المكتبة الإسلامية
            </span>
          </div>
          <h1 className="text-white font-bold text-2xl md:text-3xl mb-1">Islamic Content Library</h1>
          <p className="text-indigo-200 text-sm">Courses, reflections, reading material & dua library</p>
        </div>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full max-w-xl grid-cols-5">
          <TabsTrigger value="courses" className="gap-2">
            <GraduationCap className="h-4 w-4" />
            Free Classes
          </TabsTrigger>
          <TabsTrigger value="specialized" className="gap-2">
            <Wallet className="h-4 w-4" />
            Specialized Classes
          </TabsTrigger>
          <TabsTrigger value="reflections" className="gap-2">
            <Sparkles className="h-4 w-4" />
            Reflections
          </TabsTrigger>
          <TabsTrigger value="reading" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Reading Material
          </TabsTrigger>
          <TabsTrigger value="duas" className="gap-2">
            <HeartHandshake className="h-4 w-4" />
            Dua Library
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Filter by Category</CardTitle>
              <CardDescription>Defaults to all main free classes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="capitalize"
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {loading && (
            <Card>
              <CardContent className="p-6 text-muted-foreground">Loading classes…</CardContent>
            </Card>
          )}
          {error && (
            <Card className="border-destructive/40">
              <CardContent className="p-6 text-destructive">
                {error}
              </CardContent>
            </Card>
          )}

          {!loading && filteredFree.length === 0 && !error && emptyState}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredFree.map(renderCourseCard)}
          </div>
        </TabsContent>

        <TabsContent value="specialized" className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-primary" />
                Specialized & Paid Classes
              </CardTitle>
              <CardDescription>
                All submissions must be verified by your designated verifier before publishing.
              </CardDescription>
            </CardHeader>
          </Card>

          {loading && (
            <Card>
              <CardContent className="p-6 text-muted-foreground">Loading specialized classes…</CardContent>
            </Card>
          )}
          {error && (
            <Card className="border-destructive/40">
              <CardContent className="p-6 text-destructive">
                {error}
              </CardContent>
            </Card>
          )}
          {!loading && filteredSpecialized.length === 0 && !error && emptyState}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredSpecialized.map(renderCourseCard)}
          </div>

          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" />
                Teach on Deenify
              </CardTitle>
              <CardDescription>
                Submit a specialized course or offer private classes. Verification is required before publishing.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button variant="default" asChild>
                <Link href="/teacher">Submit course for review</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/teacher">Offer 1:1 teaching</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reflections" className="space-y-6">
          <Card className="bg-gradient-to-br from-primary/5 to-accent/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                Daily Quranic Reflections
              </CardTitle>
              <CardDescription>
                Contemplate these verses throughout your day
              </CardDescription>
            </CardHeader>
          </Card>

          {loading && (
            <Card>
              <CardContent className="p-6 text-muted-foreground">Loading reflections…</CardContent>
            </Card>
          )}
          {error && (
            <Card className="border-destructive/40">
              <CardContent className="p-6 text-destructive">
                {error}
              </CardContent>
            </Card>
          )}
          {!loading && data.reflections.length === 0 && !error && emptyState}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {data.reflections.map((reflection) => (
              <Card 
                key={reflection.id}
                className="transition-all duration-300 hover:shadow-lg hover:scale-105 border-l-4 border-l-primary"
              >
                <CardHeader>
                  <Badge variant="secondary" className="w-fit mb-2">
                    {reflection.theme}
                  </Badge>
                  <CardTitle className="text-lg">{reflection.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <blockquote className="border-l-2 border-primary pl-4 italic text-muted-foreground">
                    "{reflection.ayah}"
                  </blockquote>
                  <p className="text-sm font-semibold text-primary text-right">
                    {reflection.reference}
                  </p>
                  {(() => {
                    const match = reflection.reference?.match(/Quran\s+(\d+):(\d+)/i);
                    const tafsirUrl = match
                      ? `https://quran.com/${match[1]}/${match[2]}`
                      : `https://quran.com/`;
                    return (
                      <Button variant="outline" className="w-full" asChild>
                        <a href={tafsirUrl} target="_blank" rel="noopener noreferrer">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Read Tafsir
                        </a>
                      </Button>
                    );
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>

        </TabsContent>

        <TabsContent value="reading" className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Reading Material
              </CardTitle>
              <CardDescription>
                Explore uploaded Islamic books and PDFs. Click a book to read.
              </CardDescription>
            </CardHeader>
          </Card>
          {pdfLoading && (
            <Card>
              <CardContent className="p-6 text-muted-foreground">Loading books…</CardContent>
            </Card>
          )}
          {pdfError && (
            <Card className="border-destructive/40">
              <CardContent className="p-6 text-destructive">{pdfError}</CardContent>
            </Card>
          )}
          {!pdfLoading && pdfBooks.length === 0 && !pdfError && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">No reading material available yet.</CardContent>
            </Card>
          )}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {pdfBooks.map((book) => (
              <Card key={book.id} className="hover:shadow-lg hover:scale-105 transition-all">
                <CardHeader>
                  <CardTitle>{book.title}</CardTitle>
                  <CardDescription>{book.author}</CardDescription>
                  {book.category && (
                    <Badge variant="secondary" className="w-fit mt-1">{book.category}</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{book.description}</p>
                  <Button variant="outline" className="w-full" onClick={() => setSelectedPDF(book)}>
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Book
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          {selectedPDF && (
            <div className="mt-8">
              <PDFReader
                url={selectedPDF.url ?? `/api/pdf-book?id=${selectedPDF.id}`}
                title={selectedPDF.title}
              />
              <Button className="mt-4" variant="secondary" onClick={() => setSelectedPDF(null)}>
                Close Reader
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="duas" className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HeartHandshake className="h-5 w-5 text-primary" />
                Dua Library
              </CardTitle>
              <CardDescription>
                Authentic Islamic supplications for every occasion.
              </CardDescription>
            </CardHeader>
          </Card>
          {duasLoading && (
            <Card>
              <CardContent className="p-6 text-muted-foreground">Loading duas…</CardContent>
            </Card>
          )}
          {duasError && (
            <Card className="border-destructive/40">
              <CardContent className="p-6 text-destructive">{duasError}</CardContent>
            </Card>
          )}
          {!duasLoading && !duasError && duas.length > 0 && (() => {
            // Collect all unique tags for category pills
            const allTags = Array.from(
              new Set(duas.flatMap((d) => d.tags))
            ).sort();
            const filteredDuas = duas.filter((d) => {
              const matchCat = duaCategory === 'All' || d.tags.includes(duaCategory);
              const matchSearch =
                !duaSearch ||
                d.title.toLowerCase().includes(duaSearch.toLowerCase()) ||
                d.translation.toLowerCase().includes(duaSearch.toLowerCase()) ||
                d.transliteration.toLowerCase().includes(duaSearch.toLowerCase());
              return matchCat && matchSearch;
            });
            return (
              <>
                {/* Search bar */}
                <div className="flex gap-3 items-center">
                  <input
                    type="text"
                    placeholder="Search duas…"
                    value={duaSearch}
                    onChange={(e) => setDuaSearch(e.target.value)}
                    className="flex-1 h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                  />
                </div>
                {/* Category pills */}
                <div className="flex flex-wrap gap-2">
                  {['All', ...allTags].map((tag) => (
                    <button
                      key={tag}
                      onClick={() => setDuaCategory(tag)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-colors border ${
                        duaCategory === tag
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:bg-accent'
                      }`}
                    >
                      {tag}
                      {tag !== 'All' && (
                        <span className="ml-1 text-xs opacity-70">
                          ({duas.filter((d) => d.tags.includes(tag)).length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {filteredDuas.length === 0 && (
                  <Card className="border-dashed">
                    <CardContent className="p-6 text-center text-muted-foreground">
                      No duas match your search.
                    </CardContent>
                  </Card>
                )}
                <div className="grid gap-4 md:grid-cols-2">
                  {filteredDuas.map((dua) => (
                    <Card key={dua.id} className="hover:shadow-lg transition-all flex flex-col">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base leading-snug">{dua.title}</CardTitle>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {dua.tags.map((tag) => (
                            <button
                              key={tag}
                              onClick={() => { setDuaCategory(tag); setDuaSearch(''); }}
                              className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 flex-1">
                        <div
                          className="text-2xl text-right leading-loose text-primary p-3 bg-primary/5 rounded-lg select-all"
                          dir="rtl"
                        >
                          {dua.arabic}
                        </div>
                        <p className="text-sm italic text-muted-foreground">{dua.transliteration}</p>
                        <p className="text-sm">{dua.translation}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </>
            );
          })()}
          {!duasLoading && duas.length === 0 && !duasError && (
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">No duas available yet.</CardContent>
            </Card>
          )}
        </TabsContent>

      </Tabs>
    </div>
  );
}
