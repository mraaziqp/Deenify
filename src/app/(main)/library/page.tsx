'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  AlertCircle
} from "lucide-react";

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
      <div className="flex items-center gap-3 mb-6">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Content Library</h1>
          <p className="text-muted-foreground">
            Explore real classes, daily reflections, and opportunities to teach
          </p>
        </div>
      </div>

      <Tabs defaultValue="courses" className="space-y-6">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
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
                  <Button variant="outline" className="w-full">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Read Tafsir
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
