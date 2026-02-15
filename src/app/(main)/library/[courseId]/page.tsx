'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  ArrowLeft, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  PlayCircle,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { loadProgress, saveProgress } from '@/lib/achievements';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  content: string;
  completed: boolean;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  duration: string;
  price?: number;
  enrolled: boolean;
  modules: Module[];
  overview: string;
  learningOutcomes: string[];
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.courseId as string;
  
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  useEffect(() => {
    if (!course || !course.enrolled || currentLesson) return;
    const firstLesson = course.modules[0]?.lessons[0];
    if (firstLesson) {
      setCurrentLesson(firstLesson);
    }
  }, [course, currentLesson]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      
      // Check localStorage for existing progress
      const savedProgress = localStorage.getItem(`course_${courseId}`);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};

      // Fetch course from API
      const res = await fetch('/api/library');
      const data = await res.json();
      
      const allCourses = [...data.freeCourses, ...data.specializedCourses];
      const foundCourse = allCourses.find((c: any) => c.id === courseId);
      
      if (!foundCourse) {
        toast.error('Course not found');
        router.push('/library');
        return;
      }

      // Generate course modules and lessons
      const modules = generateModules(foundCourse, progress);
      
      const detailedCourse: CourseDetail = {
        ...foundCourse,
        modules,
        overview: generateOverview(foundCourse),
        learningOutcomes: generateLearningOutcomes(foundCourse),
      };

      setCourse(detailedCourse);
      setLoading(false);
    } catch (error) {
      console.error('Error loading course:', error);
      toast.error('Failed to load course');
      setLoading(false);
    }
  };

  const generateModules = (course: any, progress: any): Module[] => {
    const lessonCount = course.lessons || 10;
    const modulesCount = Math.ceil(lessonCount / 3);
    
    return Array.from({ length: modulesCount }, (_, moduleIdx) => {
      const lessonsInModule = Math.min(3, lessonCount - (moduleIdx * 3));
      
      return {
        id: `module_${moduleIdx + 1}`,
        title: `Module ${moduleIdx + 1}: ${getModuleTitle(course.category, moduleIdx)}`,
        description: getModuleDescription(course.category, moduleIdx),
        lessons: Array.from({ length: lessonsInModule }, (_, lessonIdx) => {
          const lessonId = `lesson_${moduleIdx}_${lessonIdx}`;
          return {
            id: lessonId,
            title: `Lesson ${moduleIdx * 3 + lessonIdx + 1}: ${getLessonTitle(course.category, moduleIdx, lessonIdx)}`,
            duration: `${Math.floor(Math.random() * 20) + 10} min`,
            content: getLessonContent(course.category, moduleIdx, lessonIdx),
            completed: progress[lessonId] || false,
          };
        }),
      };
    });
  };

  const getModuleTitle = (category: string, index: number): string => {
    const titles: Record<string, string[]> = {
      'Basics': ['Fundamentals', 'Core Practices', 'Application'],
      'Quran': ['Understanding', 'Recitation', 'Reflection'],
      'History': ['Early Period', 'Golden Age', 'Modern Era'],
      'Finance': ['Principles', 'Practical Application', 'Advanced Topics'],
      'Fiqh': ['Foundations', 'Detailed Rulings', 'Contemporary Issues'],
      'Language': ['Grammar Basics', 'Vocabulary', 'Advanced Structure'],
    };
    
    const categoryTitles = titles[category] || ['Introduction', 'Intermediate', 'Advanced'];
    return categoryTitles[index] || `Topic ${index + 1}`;
  };

  const getModuleDescription = (category: string, index: number): string => {
    return `Build your understanding progressively with practical lessons and real-world examples.`;
  };

  const getLessonTitle = (category: string, moduleIdx: number, lessonIdx: number): string => {
    const titles: Record<string, Record<number, string[]>> = {
      'Basics': {
        0: ['The Five Pillars', 'Shahada Explained', 'Faith in Action'],
        1: ['Prayer Times', 'Wudu Step-by-Step', 'Understanding Salah'],
        2: ['Daily Practice', 'Common Questions', 'Staying Consistent'],
      },
      'Quran': {
        0: ['Structure of the Quran', 'Revelation Context', 'Themes & Messages'],
        1: ['Tajweed Rules', 'Makharij Letters', 'Practice Exercises'],
        2: ['Tafsir Methodology', 'Reflecting on Verses', 'Implementing Lessons'],
      },
    };
    
    return titles[category]?.[moduleIdx]?.[lessonIdx] || `Key Concept ${lessonIdx + 1}`;
  };

  const getLessonContent = (category: string, moduleIdx: number, lessonIdx: number): string => {
    const content = `
# Welcome to this Lesson

In this lesson, we'll explore important concepts in **${category}**.

## Key Points:

1. **Understanding the Basics**: We begin with foundational knowledge that every Muslim should know.

2. **Practical Application**: Learn how to apply these teachings in your daily life.

3. **Deep Reflection**: Take time to reflect on the wisdom and guidance.

## Important Note

Remember that seeking knowledge is a lifelong journey. The Prophet Muhammad ﷺ said:

> "Seeking knowledge is an obligation upon every Muslim." — Ibn Majah

## Exercise

Reflect on how you can implement what you've learned today in your life.

---

*Continue to the next lesson to build upon this foundation.*
    `.trim();
    
    return content;
  };

  const generateOverview = (course: any): string => {
    return `This comprehensive course covers essential aspects of ${course.category} in Islam. Through ${course.lessons} carefully structured lessons, you'll gain practical knowledge and spiritual understanding. Perfect for ${course.difficulty.toLowerCase()} level students who want to deepen their Islamic knowledge.`;
  };

  const generateLearningOutcomes = (course: any): string[] => {
    const outcomes: Record<string, string[]> = {
      'Basics': [
        'Understand the five pillars of Islam',
        'Learn proper worship practices',
        'Develop strong Islamic character',
        'Apply Islamic teachings daily',
      ],
      'Quran': [
        'Read Quran with proper tajweed',
        'Understand tafsir methodology',
        'Memorize key verses',
        'Apply Quranic guidance',
      ],
      'History': [
        'Learn about key historical events',
        'Understand Islamic civilization',
        'Draw lessons from the past',
        'Connect history to present',
      ],
      'Finance': [
        'Understand halal and haram income',
        'Learn Islamic investment principles',
        'Avoid interest (riba)',
        'Manage wealth islamically',
      ],
      'Fiqh': [
        'Understand Islamic jurisprudence',
        'Learn detailed rulings',
        'Navigate contemporary issues',
        'Make informed decisions',
      ],
      'Language': [
        'Learn Arabic grammar',
        'Build Quranic vocabulary',
        'Understand sentence structure',
        'Read classical texts',
      ],
    };
    
    return outcomes[course.category] || [
      'Gain comprehensive knowledge',
      'Apply practical skills',
      'Deepen spiritual understanding',
      'Connect with authentic sources',
    ];
  };

  const markLessonComplete = (lessonId: string) => {
    if (!course) return;
    
    // Update state
    const updatedModules = course.modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson =>
        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
      ),
    }));
    
    setCourse({ ...course, modules: updatedModules });
    
    // Save to localStorage
    const progress = JSON.parse(localStorage.getItem(`course_${courseId}`) || '{}');
    progress[lessonId] = true;
    localStorage.setItem(`course_${courseId}`, JSON.stringify(progress));

    const totalLessons = updatedModules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = updatedModules.reduce(
      (sum, m) => sum + m.lessons.filter(l => l.completed).length,
      0
    );

    if (totalLessons > 0 && completedLessons >= totalLessons) {
      const completedCourses = JSON.parse(localStorage.getItem('completed_courses') || '[]');
      if (!completedCourses.includes(courseId)) {
        completedCourses.push(courseId);
        localStorage.setItem('completed_courses', JSON.stringify(completedCourses));
        const progressData = loadProgress();
        progressData.coursesCompleted = completedCourses.length;
        saveProgress(progressData);
        toast.success('Course completed! Allahumma barik.');
        return;
      }
    }

    toast.success('Lesson completed!');
  };

  const enrollCourse = () => {
    if (!course) return;
    
    // Check if it's a paid course
    if ((course.price || 0) > 0) {
      toast.error('Payment integration coming soon! This is a demo.');
      return;
    }
    
    // Mark as enrolled
    const enrolled = JSON.parse(localStorage.getItem('enrolled_courses') || '[]');
    if (!enrolled.includes(courseId)) {
      enrolled.push(courseId);
      localStorage.setItem('enrolled_courses', JSON.stringify(enrolled));
    }
    
    setCourse({ ...course, enrolled: true });
    toast.success('Successfully enrolled! Start learning now.');
  };

  const getTotalProgress = (): number => {
    if (!course) return 0;
    
    const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
    const completedLessons = course.modules.reduce(
      (sum, m) => sum + m.lessons.filter(l => l.completed).length,
      0
    );
    
    return totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-64 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-200 rounded" />
          <div className="h-96 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container mx-auto max-w-6xl py-12">
        <Card>
          <CardContent className="py-12 text-center">
            <p>Course not found</p>
            <Button onClick={() => router.push('/library')} className="mt-4">
              Back to Library
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const progress = getTotalProgress();

  return (
    <div className="container mx-auto max-w-6xl">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.push('/library')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Library
      </Button>

      {/* Course Header */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{course.difficulty}</Badge>
                <Badge variant="outline">{course.category}</Badge>
                {(course.price || 0) > 0 && (
                  <Badge variant="secondary">R{course.price}</Badge>
                )}
              </div>
              <CardTitle className="text-3xl mb-2">{course.title}</CardTitle>
              <CardDescription className="text-lg">{course.description}</CardDescription>
              
              <div className="flex items-center gap-6 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {course.duration}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>
        
        {course.enrolled && progress > 0 && (
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Progress</span>
                <span className="font-semibold text-primary">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Course Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="lessons">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <TabsContent value="lessons" className="space-y-4">
              {!course.enrolled ? (
                <Card>
                  <CardContent className="py-12 text-center space-y-4">
                    <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Enroll to Access Lessons</h3>
                      <p className="text-muted-foreground mb-4">
                        {(course.price || 0) > 0 
                          ? `This course costs R${course.price}. Enroll now to start learning.`
                          : 'This course is completely free! Enroll now to start learning.'
                        }
                      </p>
                      <Button onClick={enrollCourse} size="lg">
                        {(course.price || 0) > 0 ? `Enroll for R${course.price}` : 'Enroll for Free'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Accordion
                  type="single"
                  collapsible
                  className="space-y-4"
                  defaultValue={course.modules[0]?.id}
                >
                  {course.modules.map((module, moduleIdx) => (
                    <AccordionItem key={module.id} value={module.id}>
                      <Card>
                        <AccordionTrigger className="px-6 py-4 hover:no-underline">
                          <div className="flex items-center gap-3 text-left">
                            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary font-semibold flex-shrink-0">
                              {moduleIdx + 1}
                            </div>
                            <div>
                              <h3 className="font-semibold">{module.title}</h3>
                              <p className="text-sm text-muted-foreground">{module.description}</p>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="px-6 pb-4 space-y-2">
                            {module.lessons.map((lesson) => (
                              <Card
                                key={lesson.id}
                                role="button"
                                tabIndex={0}
                                className={`cursor-pointer transition-all hover:shadow-md ${
                                  currentLesson?.id === lesson.id ? 'ring-2 ring-primary' : ''
                                }`}
                                onClick={() => setCurrentLesson(lesson)}
                                onKeyDown={(event) => {
                                  if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    setCurrentLesson(lesson);
                                  }
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                      {lesson.completed ? (
                                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                                      ) : (
                                        <PlayCircle className="h-5 w-5 text-muted-foreground" />
                                      )}
                                      <div>
                                        <p className="font-medium">{lesson.title}</p>
                                        <p className="text-sm text-muted-foreground">{lesson.duration}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={(event) => {
                                          event.stopPropagation();
                                          setCurrentLesson(lesson);
                                        }}
                                      >
                                        Open
                                      </Button>
                                      {!lesson.completed && (
                                        <Button
                                          size="sm"
                                          onClick={(event) => {
                                            event.stopPropagation();
                                            markLessonComplete(lesson.id);
                                          }}
                                        >
                                          Mark Complete
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </AccordionContent>
                      </Card>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </TabsContent>

            <TabsContent value="about" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Course Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{course.overview}</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {course.learningOutcomes.map((outcome, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Lesson Viewer */}
        <div className="md:col-span-1">
          {currentLesson && course.enrolled ? (
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-lg">Current Lesson</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">{currentLesson.title}</h3>
                  <Badge variant="outline">{currentLesson.duration}</Badge>
                </div>
                
                <div className="prose prose-sm max-w-none">
                  <div
                    className="text-sm text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html: currentLesson.content.replace(/\n/g, '<br />'),
                    }}
                  />
                </div>

                {!currentLesson.completed && (
                  <Button
                    className="w-full"
                    onClick={() => markLessonComplete(currentLesson.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Mark Complete
                  </Button>
                )}
                {currentLesson.completed && (
                  <div className="flex items-center gap-2 text-green-600 justify-center">
                    <CheckCircle2 className="h-5 w-5" />
                    <span className="font-medium">Completed</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : course.enrolled ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Select a lesson to start learning
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Ready to Start?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enroll in this course to access all lessons and start your learning journey.
                </p>
                <Button onClick={enrollCourse} className="w-full">
                  {(course.price || 0) > 0 ? `Enroll for R${course.price}` : 'Enroll for Free'}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
