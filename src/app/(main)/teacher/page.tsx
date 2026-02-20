'use client';
export const dynamic = "force-dynamic";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  GraduationCap, 
  Upload, 
  DollarSign, 
  Clock,
  BookOpen,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type CourseStatus = 'draft' | 'pending_verification' | 'approved' | 'rejected';

type SubmittedCourse = {
  id: string;
  title: string;
  status: CourseStatus;
  submittedAt: string;
  feedback?: string;
};

export default function TeacherPortalPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Beginner',
    duration: '',
    lessons: '',
    price: '',
    videoUrl: '',
  });

  // Mock submitted courses - replace with API call
  const [submittedCourses] = useState<SubmittedCourse[]>([
    {
      id: '1',
      title: 'Arabic for Quranic Understanding',
      status: 'pending_verification',
      submittedAt: '2026-01-20',
    },
    {
      id: '2',
      title: 'Islamic History Essentials',
      status: 'approved',
      submittedAt: '2026-01-15',
    },
    {
      id: '3',
      title: 'Advanced Tajweed',
      status: 'rejected',
      submittedAt: '2026-01-10',
      feedback: 'Please provide more detailed sources for the rulings mentioned.',
    },
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // TODO: Implement actual API call
      // const response = await fetch('/api/courses/submit', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(formData),
      // });

      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call

      toast({
        title: "Course submitted for verification",
        description: "Your course will be reviewed by our verifier team shortly.",
      });

      // Reset form
      setFormData({
        title: '',
        description: '',
        category: '',
        difficulty: 'Beginner',
        duration: '',
        lessons: '',
        price: '',
        videoUrl: '',
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Submission failed",
        description: "Please try again later.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: CourseStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="default" className="gap-1"><CheckCircle2 className="h-3 w-3" />Approved</Badge>;
      case 'pending_verification':
        return <Badge variant="secondary" className="gap-1"><ShieldCheck className="h-3 w-3" />Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive" className="gap-1"><AlertCircle className="h-3 w-3" />Rejected</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex items-center gap-3 mb-6">
        <GraduationCap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Teacher Portal</h1>
          <p className="text-muted-foreground">
            Create and manage your Islamic courses
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Course Submission Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Submit New Course</CardTitle>
              <CardDescription>
                All courses must be verified before publication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Course Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Quranic Arabic for Beginners"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what students will learn..."
                    rows={4}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basics">Basics</SelectItem>
                        <SelectItem value="quran">Quran</SelectItem>
                        <SelectItem value="finance">Finance</SelectItem>
                        <SelectItem value="history">History</SelectItem>
                        <SelectItem value="fiqh">Fiqh</SelectItem>
                        <SelectItem value="language">Language</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="difficulty">Difficulty Level *</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Beginner">Beginner</SelectItem>
                        <SelectItem value="Intermediate">Intermediate</SelectItem>
                        <SelectItem value="Advanced">Advanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="duration">Duration</Label>
                    <Input
                      id="duration"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="e.g., 4 weeks"
                    />
                  </div>

                  <div>
                    <Label htmlFor="lessons">Number of Lessons</Label>
                    <Input
                      id="lessons"
                      type="number"
                      value={formData.lessons}
                      onChange={(e) => setFormData({ ...formData, lessons: e.target.value })}
                      placeholder="e.g., 20"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="price">Price (USD) *</Label>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="0 for free, or enter amount"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Set to 0 for free courses, or enter a price for specialized content
                  </p>
                </div>

                <div>
                  <Label htmlFor="videoUrl">Intro Video URL (Optional)</Label>
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4 text-muted-foreground" />
                    <Input
                      id="videoUrl"
                      value={formData.videoUrl}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Submit for Verification
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Submitted Courses & Info */}
        <div className="space-y-6">
          {/* Guidelines */}
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-lg">Submission Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p>Content must be based on Quran and authentic Hadith</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p>Include proper citations and sources</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p>Clear learning objectives for each lesson</p>
              </div>
              <div className="flex gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                <p>Verification typically takes 3-5 business days</p>
              </div>
            </CardContent>
          </Card>

          {/* Your Submissions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Your Submissions</CardTitle>
              <CardDescription>Recent course submissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {submittedCourses.map((course) => (
                <div
                  key={course.id}
                  className="p-3 border rounded-lg space-y-2"
                >
                  <div className="flex items-start justify-between">
                    <h4 className="font-semibold text-sm line-clamp-1">{course.title}</h4>
                    {getStatusBadge(course.status)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Submitted {typeof window !== 'undefined' ? new Date(course.submittedAt).toLocaleDateString() : ''}
                  </p>
                  {course.feedback && (
                    <div className="p-2 bg-muted rounded text-xs">
                      <strong>Feedback:</strong> {course.feedback}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
