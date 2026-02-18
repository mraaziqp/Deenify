'use client';
export const dynamic = "force-dynamic";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Check, ChevronRight, Clock, Award } from 'lucide-react';
import { courses, type Course, type CourseModule } from '@/lib/courses-data';

export default function CoursesPage() {
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [selectedModule, setSelectedModule] = useState<CourseModule | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());

  const handleMarkComplete = (moduleId: string) => {
    setCompletedModules(prev => {
      const newSet = new Set(prev);
      newSet.add(moduleId);
      return newSet;
    });

    // In production: Update users/{uid}/progress/{courseId}
    // For now, just show visual feedback
    const courseProgress = selectedCourse
      ? (completedModules.size / selectedCourse.modules.length) * 100
      : 0;

    if (courseProgress === 100) {
      // Course completed! Show celebration
      alert('🎉 Masha\'Allah! You\'ve completed this course!');
    }
  };

  const getCourseProgress = (course: Course): number => {
    const completedCount = course.modules.filter(m => completedModules.has(m.id)).length;
    return (completedCount / course.modules.length) * 100;
  };

  // Course Library View
  if (!selectedCourse) {
    return (
      <div className="container mx-auto max-w-6xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Islamic Courses</h1>
          <p className="text-muted-foreground">
            Learn at your own pace with our text-based reading tracks
          </p>
        </div>

        <div className="grid gap-6">
          {courses.map((course) => {
            const progress = getCourseProgress(course);
            const isCompleted = progress === 100;

            return (
              <Card
                key={course.id}
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedCourse(course)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <CardTitle className="text-2xl">{course.title}</CardTitle>
                        {isCompleted && (
                          <Badge className="bg-green-500">
                            <Check className="h-3 w-3 mr-1" />
                            Completed
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-base">
                        {course.description}
                      </CardDescription>
                    </div>
                    <Button variant="ghost" size="icon">
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="capitalize">
                      {course.level}
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <Clock className="h-3 w-3" />
                      {course.estimatedMinutes} min
                    </Badge>
                    <Badge variant="secondary" className="gap-1">
                      <BookOpen className="h-3 w-3" />
                      {course.modules.length} modules
                    </Badge>
                  </div>

                  {progress > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-semibold">{progress.toFixed(0)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Learning Tips */}
        <Card className="mt-6 bg-gradient-to-r from-blue-50 to-teal-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-lg">Learning Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p>• Set aside dedicated time each day for learning</p>
            <p>• Take notes and reflect on what you've learned</p>
            <p>• Apply the knowledge in your daily life</p>
            <p>• Review completed modules regularly</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Module Reading View
  if (selectedModule) {
    const moduleIndex = selectedCourse.modules.findIndex(m => m.id === selectedModule.id);
    const isCompleted = completedModules.has(selectedModule.id);
    const nextModule = selectedCourse.modules[moduleIndex + 1];

    return (
      <div className="container mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => setSelectedModule(null)}
            className="mb-2"
          >
            ← Back to {selectedCourse.title}
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>{selectedCourse.title}</span>
            <ChevronRight className="h-4 w-4" />
            <span>{selectedModule.title}</span>
          </div>
        </div>

        {/* Module Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl mb-2">{selectedModule.title}</CardTitle>
                <Badge variant="outline">
                  Module {moduleIndex + 1} of {selectedCourse.modules.length}
                </Badge>
              </div>
              {isCompleted && (
                <Badge className="bg-green-500">
                  <Check className="h-4 w-4 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="prose prose-lg max-w-none">
            {selectedModule.content.map((paragraph, idx) => (
              <p key={idx} className="mb-4 leading-relaxed text-base">
                {paragraph}
              </p>
            ))}

            {/* Key Points */}
            <div className="mt-8 p-6 bg-primary/5 rounded-lg border border-primary/20">
              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Key Takeaways
              </h3>
              <ul className="space-y-2">
                {selectedModule.keyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Footer */}
        <div className="mt-6 flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={() => {
              const prevModule = selectedCourse.modules[moduleIndex - 1];
              if (prevModule) setSelectedModule(prevModule);
            }}
            disabled={moduleIndex === 0}
          >
            ← Previous Module
          </Button>

          <div className="flex gap-2">
            {!isCompleted && (
              <Button
                onClick={() => handleMarkComplete(selectedModule.id)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Check className="h-4 w-4 mr-2" />
                Mark as Complete
              </Button>
            )}

            {nextModule ? (
              <Button onClick={() => setSelectedModule(nextModule)}>
                Next Module
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedModule(null);
                  setSelectedCourse(null);
                }}
              >
                Return to Courses
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Module Selection View
  return (
    <div className="container mx-auto max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => setSelectedCourse(null)}
          className="mb-2"
        >
          ← Back to All Courses
        </Button>
        <h1 className="text-3xl font-bold">{selectedCourse.title}</h1>
        <p className="text-muted-foreground mt-1">{selectedCourse.description}</p>
      </div>

      {/* Course Progress */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Your Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedModules.size} of {selectedCourse.modules.length} modules completed
              </span>
            </div>
            <Progress
              value={getCourseProgress(selectedCourse)}
              className="h-3"
            />
          </div>
        </CardContent>
      </Card>

      {/* Module List */}
      <div className="space-y-4">
        {selectedCourse.modules.map((module, idx) => {
          const isCompleted = completedModules.has(module.id);

          return (
            <Card
              key={module.id}
              className={`hover:shadow-md transition-all cursor-pointer ${
                isCompleted ? 'border-green-500/50 bg-green-50/50' : ''
              }`}
              onClick={() => setSelectedModule(module)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <div
                        className={`flex items-center justify-center h-8 w-8 rounded-full font-bold text-sm ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-primary/10 text-primary'
                        }`}
                      >
                        {isCompleted ? <Check className="h-5 w-5" /> : idx + 1}
                      </div>
                      <CardTitle className="text-lg">{module.title}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground ml-11">
                      {module.keyPoints.length} key points • {module.content.length} sections
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
