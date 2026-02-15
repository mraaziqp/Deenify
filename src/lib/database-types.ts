// Database schema types for Deenify
// Use these with your database ORM (Prisma, Drizzle, etc.) or Firestore

export type UserRole = 'student' | 'teacher' | 'verifier' | 'admin';

export type CourseStatus = 'draft' | 'pending_verification' | 'approved' | 'rejected';

export type CourseCategory = 
  | 'basics' 
  | 'quran' 
  | 'finance' 
  | 'history' 
  | 'fiqh' 
  | 'language'
  | 'other';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

// User model
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  madhab?: string;
  joinedAt: Date;
  lastActiveAt: Date;
  // Stats
  currentStreak: number;
  longestStreak: number;
  totalDaysActive: number;
  dhikrCount: number;
  coursesCompleted: number;
}

// Course model
export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: DifficultyLevel;
  
  // Teacher info
  teacherId: string;
  teacherName: string;
  teacherEmail: string;
  
  // Course details
  duration?: string; // e.g., "4 weeks"
  lessons?: number;
  price: number; // 0 for free
  videoUrl?: string;
  thumbnailUrl?: string;
  
  // Status & verification
  status: CourseStatus;
  verifierId?: string;
  verifiedAt?: Date;
  rejectionFeedback?: string;
  
  // Stats
  rating?: number;
  totalRatings?: number;
  enrolledStudents: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

// Course enrollment
export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  enrolledAt: Date;
  progressPercent: number;
  completedLessons: number;
  lastAccessedAt: Date;
  completedAt?: Date;
}

// Lesson model
export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description?: string;
  order: number;
  videoUrl?: string;
  content?: string; // Markdown or HTML
  duration?: number; // in minutes
  resources?: LessonResource[];
}

export interface LessonResource {
  type: 'pdf' | 'video' | 'audio' | 'link';
  title: string;
  url: string;
}

// Daily reflection
export interface Reflection {
  id: string;
  title: string;
  ayah: string;
  reference: string; // e.g., "Quran 2:153"
  theme: string;
  tafsir?: string;
  date: Date;
  createdBy: string;
}

// Verification request
export interface VerificationRequest {
  id: string;
  courseId: string;
  submittedBy: string;
  submittedAt: Date;
  reviewedBy?: string;
  reviewedAt?: Date;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
}

// Teaching session (1:1 or group classes)
export interface TeachingSession {
  id: string;
  teacherId: string;
  title: string;
  description: string;
  type: '1on1' | 'group' | 'workshop';
  maxStudents?: number;
  price: number;
  duration: number; // in minutes
  scheduledAt?: Date;
  status: 'open' | 'full' | 'completed' | 'cancelled';
  enrolledStudents: string[]; // User IDs
  meetingLink?: string;
}

// Dhikr tracking
export interface DhikrEntry {
  id: string;
  userId: string;
  count: number;
  type?: string; // e.g., "SubhanAllah", "Alhamdulillah"
  date: Date;
}

// Quran Khatm circle
export interface KhatmCircle {
  id: string;
  name: string;
  createdBy: string;
  targetDate?: Date;
  status: 'active' | 'completed';
  participants: string[]; // User IDs
  juzProgress: JuzProgress[];
  createdAt: Date;
}

export interface JuzProgress {
  juzNumber: number; // 1-30
  claimedBy?: string; // User ID
  claimedAt?: Date;
  completedAt?: Date;
  status: 'open' | 'claimed' | 'completed';
}

// Achievement/Badge system
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'learning' | 'community' | 'worship' | 'milestone';
  requirement: {
    type: 'streak' | 'courses' | 'dhikr' | 'khatm' | 'custom';
    target: number;
  };
}

export interface UserAchievement {
  userId: string;
  achievementId: string;
  unlockedAt: Date;
}

// API Response types
export interface LibraryResponse {
  freeCourses: Course[];
  specializedCourses: Course[];
  reflections: Reflection[];
}

export interface CourseSubmissionRequest {
  title: string;
  description: string;
  category: CourseCategory;
  difficulty: DifficultyLevel;
  duration?: string;
  lessons?: number;
  price: number;
  videoUrl?: string;
}

export interface VerificationReviewRequest {
  courseId: string;
  action: 'approve' | 'reject';
  feedback?: string;
}
