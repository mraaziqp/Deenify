'use client';
export const dynamic = "force-dynamic";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle,
  AlertTriangle,
  Clock,
  BookOpen,
  User,
  DollarSign,
  FileText
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CourseReview = {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  teacherName: string;
  teacherEmail: string;
  submittedAt: string;
  duration?: string;
  lessons?: number;
  price?: number;
  videoUrl?: string;
  status: 'pending_verification' | 'approved' | 'rejected';
};

export default function VerifierDashboardPage() {
  const { toast } = useToast();
  const [selectedCourse, setSelectedCourse] = useState<CourseReview | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock courses pending review - replace with API call
  const [courses, setCourses] = useState<CourseReview[]>([
    {
      id: '1',
      title: 'Arabic for Quranic Understanding',
      description: 'Learn Quranic Arabic to understand the Quran in its original language. This comprehensive course covers grammar, vocabulary, and practical applications.',
      category: 'Language',
      difficulty: 'Intermediate',
      teacherName: 'Sheikh Ahmed Al-Mansoor',
      teacherEmail: 'ahmed@example.com',
      submittedAt: '2026-01-20T10:30:00Z',
      duration: '12 weeks',
      lessons: 50,
      price: 79,
      status: 'pending_verification',
    },
    {
      id: '2',
      title: 'Islamic History: The Golden Age',
      description: 'Explore the contributions of Islamic civilization during its golden age, including science, philosophy, and art.',
      category: 'History',
      difficulty: 'Intermediate',
      teacherName: 'Dr. Fatima Hassan',
      teacherEmail: 'fatima@example.com',
      submittedAt: '2026-01-22T14:15:00Z',
      duration: '6 weeks',
      lessons: 24,
      price: 49,
      status: 'pending_verification',
    },
    {
      id: '3',
      title: 'Advanced Tajweed Mastery',
      description: 'Master the art of Quranic recitation with advanced Tajweed rules and practical application.',
      category: 'Quran',
      difficulty: 'Advanced',
      teacherName: 'Qari Ibrahim Yusuf',
      teacherEmail: 'ibrahim@example.com',
      submittedAt: '2026-01-23T09:00:00Z',
      duration: '8 weeks',
      lessons: 32,
      price: 99,
      status: 'pending_verification',
    },
  ]);

  const pendingCourses = courses.filter(c => c.status === 'pending_verification');
  const approvedCourses = courses.filter(c => c.status === 'approved');
  const rejectedCourses = courses.filter(c => c.status === 'rejected');

  const handleReview = (course: CourseReview) => {
    setSelectedCourse(course);
    setFeedback('');
    setReviewDialogOpen(true);
  };

  const handleApprove = async () => {
    if (!selectedCourse) return;
    
    setIsProcessing(true);
    try {
      // TODO: Implement actual API call
      // await fetch(`/api/courses/${selectedCourse.id}/approve`, {
      //   method: 'POST',
      //   body: JSON.stringify({ feedback }),
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      setCourses(courses.map(c => 
        c.id === selectedCourse.id ? { ...c, status: 'approved' as const } : c
      ));

      toast({
        title: "Course approved",
        description: `"${selectedCourse.title}" is now published.`,
      });

      setReviewDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Approval failed",
        description: "Please try again later.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedCourse || !feedback.trim()) {
      toast({
        variant: "destructive",
        title: "Feedback required",
        description: "Please provide feedback for the rejection.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // TODO: Implement actual API call
      // await fetch(`/api/courses/${selectedCourse.id}/reject`, {
      //   method: 'POST',
      //   body: JSON.stringify({ feedback }),
      // });

      await new Promise(resolve => setTimeout(resolve, 1000));

      setCourses(courses.map(c => 
        c.id === selectedCourse.id ? { ...c, status: 'rejected' as const } : c
      ));

      toast({
        title: "Course rejected",
        description: "Teacher has been notified with your feedback.",
      });

      setReviewDialogOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Rejection failed",
        description: "Please try again later.",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const CourseCard = ({ course }: { course: CourseReview }) => (
    <Card className="hover:shadow-lg transition-all">
      <CardHeader>
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary">{course.category}</Badge>
          <Badge variant="outline">{course.difficulty}</Badge>
        </div>
        <CardTitle className="text-lg">{course.title}</CardTitle>
        <CardDescription className="line-clamp-2">
          {course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User className="h-4 w-4" />
            <span className="truncate">{course.teacherName}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{course.duration || 'Flexible'}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{course.lessons || 0} lessons</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>${course.price || 0}</span>
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          Submitted {new Date(course.submittedAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>

        {course.status === 'pending_verification' && (
          <Button
            onClick={() => handleReview(course)}
            className="w-full"
            variant="default"
          >
            <ShieldCheck className="h-4 w-4 mr-2" />
            Review Course
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="flex items-center gap-3 mb-6">
        <ShieldCheck className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Verifier Dashboard</h1>
          <p className="text-muted-foreground">
            Review and approve courses before publication
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-500/10 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingCourses.length}</p>
                <p className="text-sm text-muted-foreground">Pending Review</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{approvedCourses.length}</p>
                <p className="text-sm text-muted-foreground">Approved</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <XCircle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{rejectedCourses.length}</p>
                <p className="text-sm text-muted-foreground">Rejected</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Tabs */}
      <Tabs defaultValue="pending" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pending" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Pending ({pendingCourses.length})
          </TabsTrigger>
          <TabsTrigger value="approved" className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Approved ({approvedCourses.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="gap-2">
            <XCircle className="h-4 w-4" />
            Rejected ({rejectedCourses.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No courses pending review
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {pendingCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved">
          {approvedCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No approved courses yet
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {approvedCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected">
          {rejectedCourses.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                No rejected courses
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rejectedCourses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedCourse?.title}</DialogTitle>
            <DialogDescription>
              Review this course submission before approving or rejecting
            </DialogDescription>
          </DialogHeader>

          {selectedCourse && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Course Details</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Category:</strong> {selectedCourse.category}</p>
                  <p><strong>Difficulty:</strong> {selectedCourse.difficulty}</p>
                  <p><strong>Duration:</strong> {selectedCourse.duration || 'Not specified'}</p>
                  <p><strong>Lessons:</strong> {selectedCourse.lessons || 'Not specified'}</p>
                  <p><strong>Price:</strong> ${selectedCourse.price || 0}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Description</h4>
                <p className="text-sm text-muted-foreground">{selectedCourse.description}</p>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Teacher Information</h4>
                <div className="space-y-1 text-sm">
                  <p><strong>Name:</strong> {selectedCourse.teacherName}</p>
                  <p><strong>Email:</strong> {selectedCourse.teacherEmail}</p>
                </div>
              </div>

              <div>
                <Label htmlFor="feedback">Feedback (Required for rejection)</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Provide feedback to the teacher..."
                  rows={4}
                  className="mt-1"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              variant="default"
              onClick={handleApprove}
              disabled={isProcessing}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve & Publish
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
