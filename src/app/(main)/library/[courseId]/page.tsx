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
// TODO: Implement DB-based progress management

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
  const courseId = params?.courseId as string | undefined;
  if (!courseId) {
    // Optionally, handle missing courseId (redirect, show error, etc.)
    return <div>Course ID not found.</div>;
  }
  
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
      
      // Check localStorage for existing progress and enrollment
      const savedProgress = localStorage.getItem(`course_${courseId}`);
      const progress = savedProgress ? JSON.parse(savedProgress) : {};
      const enrolledIds: string[] = JSON.parse(localStorage.getItem('enrolled_courses') || '[]');

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

      // Merge enrollment from localStorage so it persists across page visits
      const isEnrolled = foundCourse.enrolled || enrolledIds.includes(courseId);

      // Generate course modules and lessons
      const modules = generateModules(foundCourse, progress);
      
      const detailedCourse: CourseDetail = {
        ...foundCourse,
        enrolled: isEnrolled,
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
            duration: `${10 + ((moduleIdx * 3 + lessonIdx + 1) * 7) % 20} min`,
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
    // Text-based lesson content for each topic
    if (category === 'Basics') {
      if (moduleIdx === 0 && lessonIdx === 0) {
        return `# The Five Pillars of Islam\n\nThe Five Pillars are the foundation of a Muslim's faith and practice.\n\n1. **Shahada (Testimony of Faith):** Declaring there is no god but Allah, and Muhammad is His Messenger.\n2. **Salah (Prayer):** Performing the five daily prayers.\n3. **Zakat (Charity):** Giving to those in need and supporting the community.\n4. **Sawm (Fasting):** Fasting during the month of Ramadan.\n5. **Hajj (Pilgrimage):** Performing pilgrimage to Mecca if able.\n\nReflect on how each pillar strengthens your faith and daily life.`;
      }
      if (moduleIdx === 0 && lessonIdx === 1) {
        return `# Shahada Explained\n\nThe Shahada is the declaration of faith: 'Ashhadu an la ilaha illa Allah, wa ashhadu anna Muhammadan rasul Allah.'\n\n- **Meaning:** Bearing witness that there is no deity but Allah, and Muhammad is His Messenger.\n- **Significance:** It is the entry into Islam and the core of belief.\n\nTake a moment to reflect on the meaning of the Shahada in your life.`;
      }
      if (moduleIdx === 0 && lessonIdx === 2) {
        return `# Faith in Action\n\nIman (faith) is not just belief in the heart, but is shown through actions.\n\n- **Sincerity:** Every action should be for Allah alone.\n- **Consistency:** Practice your faith daily, not just occasionally.\n- **Good Character:** The Prophet ﷺ said, 'The best among you are those who have the best manners and character.' (Bukhari)\n\nThink of ways you can put your faith into action today.`;
      }
      // Add more text-based lessons for other modules/lessons as needed
    }
    // Fallback for other categories
    return `This lesson covers important concepts in ${category}. Please read the provided materials and reflect on how you can apply them in your life.`;
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

  const addActivity = (message: string, type: 'lesson' | 'course') => {
    const activity = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      message,
      type,
      timestamp: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem('activityLog') || '[]');
    const updated = [activity, ...(Array.isArray(existing) ? existing : [])].slice(0, 20);
    localStorage.setItem('activityLog', JSON.stringify(updated));
  };

  const markLessonComplete = (lessonId: string) => {
    if (!course) return;

    const updatedModules = course.modules.map(module => ({
      ...module,
      lessons: module.lessons.map(lesson =>
        lesson.id === lessonId ? { ...lesson, completed: true } : lesson
      ),
    }));

    setCourse({ ...course, modules: updatedModules });

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
        // TODO: Update progress via API (coursesCompleted)
        addActivity(`Completed course: ${course.title}`, 'course');
        window.dispatchEvent(new Event('progressUpdated'));
        toast.success('Course completed!');
        return;
      }
    }

    addActivity(`Completed lesson: ${course.title}`, 'lesson');
    window.dispatchEvent(new Event('progressUpdated'));
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
                
                <div className="prose prose-sm max-w-none text-sm text-muted-foreground space-y-1">
                  {currentLesson.content.split('\n').map((line, i) => {
                    if (line.startsWith('# ')) return <h3 key={i} className="font-bold text-foreground text-base mt-3 mb-1">{line.slice(2)}</h3>;
                    if (line.startsWith('## ')) return <h4 key={i} className="font-semibold text-foreground mb-1">{line.slice(3)}</h4>;
                    if (/^\d+\.\s/.test(line)) return (
                      <p key={i} className="ml-3">• {line.replace(/^\d+\.\s/, '').replace(/\*\*(.+?)\*\*/g, '$1')}</p>
                    );
                    if (line.startsWith('- ')) return (
                      <p key={i} className="ml-3">• {line.slice(2).replace(/\*\*(.+?)\*\*/g, '$1')}</p>
                    );
                    if (line.trim() === '') return <br key={i} />;
                    const formatted = line.split(/\*\*(.+?)\*\*/g).map((part, j) =>
                      j % 2 === 1 ? <strong key={j} className="text-foreground">{part}</strong> : part
                    );
                    return <p key={i}>{formatted}</p>;
                  })}
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
