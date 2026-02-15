# Deenify API Documentation

Complete API reference for the Deenify Islamic learning platform.

## Table of Contents
- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Library](#library-endpoints)
  - [Courses](#course-endpoints)
  - [Verification](#verification-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)

---

## Authentication

All API routes (except `/api/library` GET) require authentication.

### Current Implementation (Development)
- Mock authentication in `src/lib/auth-context.tsx`
- User object stored in context
- Role-based access control

### Production Implementation (To-Do)
```typescript
// Using NextAuth.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

### Roles
- `student` - Basic access, can enroll in courses
- `teacher` - Can submit courses, manage teaching content
- `verifier` - Can approve/reject course submissions
- `admin` - Full system access

---

## Endpoints

### Library Endpoints

#### GET `/api/library`
Get all courses and reflections for the library page.

**Authentication:** Not required (public endpoint)

**Query Parameters:**
- `category` (optional): Filter by category (aqeedah, fiqh, hadith, etc.)
- `type` (optional): Filter by type (free, specialized, reflection)

**Response:**
```typescript
{
  freeCourses: Course[];
  specializedCourses: Course[];
  reflections: Reflection[];
}
```

**Example:**
```bash
GET /api/library
GET /api/library?category=fiqh
GET /api/library?type=free
```

**Success Response (200):**
```json
{
  "freeCourses": [
    {
      "id": "course-1",
      "title": "Introduction to Islam",
      "description": "A comprehensive introduction...",
      "thumbnail": "/images/intro-islam.jpg",
      "instructor": "Sheikh Ahmed",
      "duration": "4 weeks",
      "category": "aqeedah",
      "difficulty": "beginner",
      "price": 0,
      "enrollmentCount": 1234,
      "rating": 4.8,
      "status": "approved",
      "lessonsCount": 12,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "specializedCourses": [...],
  "reflections": [...]
}
```

---

### Course Endpoints

#### POST `/api/courses/submit`
Submit a new course for verification (teachers only).

**Authentication:** Required (teacher role)

**Request Body:**
```typescript
{
  title: string;           // Required, max 200 chars
  description: string;     // Required, max 2000 chars
  category: CourseCategory; // Required
  difficulty: 'beginner' | 'intermediate' | 'advanced'; // Required
  duration: string;        // e.g., "4 weeks"
  lessons: number;         // Number of lessons
  price: number;           // 0 for free, >0 for paid
  thumbnail?: string;      // Optional image URL
  videoUrl?: string;       // Optional preview video
}
```

**Example:**
```bash
POST /api/courses/submit
Content-Type: application/json

{
  "title": "Advanced Fiqh Studies",
  "description": "Deep dive into Islamic jurisprudence...",
  "category": "fiqh",
  "difficulty": "advanced",
  "duration": "8 weeks",
  "lessons": 24,
  "price": 49.99,
  "thumbnail": "https://example.com/image.jpg"
}
```

**Success Response (201):**
```json
{
  "id": "course-123",
  "status": "pending_verification",
  "message": "Course submitted successfully",
  "submittedAt": "2024-01-15T12:00:00.000Z"
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not authorized (not a teacher)
- `400` - Invalid request body
```json
{
  "error": "Missing required fields: title, description, category"
}
```

---

#### GET `/api/courses/submit`
Get all courses submitted by the authenticated teacher.

**Authentication:** Required (teacher role)

**Query Parameters:**
- `status` (optional): Filter by status (pending_verification, approved, rejected)

**Example:**
```bash
GET /api/courses/submit
GET /api/courses/submit?status=pending_verification
```

**Success Response (200):**
```json
{
  "courses": [
    {
      "id": "course-123",
      "title": "Advanced Fiqh Studies",
      "status": "pending_verification",
      "submittedAt": "2024-01-15T12:00:00.000Z",
      "verificationFeedback": null
    }
  ]
}
```

---

### Verification Endpoints

#### GET `/api/verification/queue`
Get all courses pending verification (verifiers and admins only).

**Authentication:** Required (verifier or admin role)

**Query Parameters:**
- `status` (optional): approved | rejected | pending_verification
- `category` (optional): Filter by course category

**Example:**
```bash
GET /api/verification/queue
GET /api/verification/queue?status=pending_verification
GET /api/verification/queue?status=approved&category=hadith
```

**Success Response (200):**
```json
{
  "courses": [
    {
      "id": "course-123",
      "title": "Advanced Fiqh Studies",
      "description": "Deep dive...",
      "instructor": "Sheikh Ahmed",
      "instructorId": "teacher-456",
      "category": "fiqh",
      "difficulty": "advanced",
      "duration": "8 weeks",
      "price": 49.99,
      "status": "pending_verification",
      "submittedAt": "2024-01-15T12:00:00.000Z",
      "lessonsCount": 24
    }
  ],
  "total": 5,
  "pending": 3,
  "approved": 1,
  "rejected": 1
}
```

---

#### POST `/api/verification/[courseId]`
Approve or reject a course submission (verifiers and admins only).

**Authentication:** Required (verifier or admin role)

**URL Parameters:**
- `courseId` - The ID of the course to review

**Request Body:**
```typescript
{
  action: 'approve' | 'reject'; // Required
  feedback?: string;            // Required for rejection, optional for approval
}
```

**Example:**
```bash
POST /api/verification/course-123
Content-Type: application/json

{
  "action": "approve",
  "feedback": "Excellent course content, well structured."
}
```

**Success Response (200):**
```json
{
  "message": "Course approved successfully",
  "courseId": "course-123",
  "status": "approved",
  "verifiedBy": "verifier-789",
  "verifiedAt": "2024-01-20T10:30:00.000Z"
}
```

**Rejection Example:**
```bash
POST /api/verification/course-123
Content-Type: application/json

{
  "action": "reject",
  "feedback": "Please provide more authentic sources and citations for the hadith mentioned in lessons 5 and 12."
}
```

**Success Response (200):**
```json
{
  "message": "Course rejected",
  "courseId": "course-123",
  "status": "rejected",
  "feedback": "Please provide more authentic sources...",
  "verifiedBy": "verifier-789",
  "verifiedAt": "2024-01-20T10:30:00.000Z"
}
```

**Error Responses:**
- `401` - Not authenticated
- `403` - Not authorized (not a verifier/admin)
- `400` - Invalid action or missing feedback for rejection
- `404` - Course not found
```json
{
  "error": "Feedback is required when rejecting a course"
}
```

---

## Data Models

### Course
```typescript
interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  instructor: string;
  instructorId: string;
  duration: string;
  category: CourseCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  price: number;
  enrollmentCount: number;
  rating: number;
  status: 'draft' | 'pending_verification' | 'approved' | 'rejected' | 'archived';
  lessonsCount: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  verificationFeedback?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}
```

### CourseCategory
```typescript
type CourseCategory = 
  | 'aqeedah'       // Islamic Creed
  | 'fiqh'          // Islamic Jurisprudence
  | 'hadith'        // Prophetic Traditions
  | 'tafsir'        // Quran Interpretation
  | 'seerah'        // Biography of Prophet
  | 'tajweed'       // Quran Recitation
  | 'arabic'        // Arabic Language
  | 'duas'          // Supplications
  | 'adab'          // Islamic Manners
  | 'history'       // Islamic History
  | 'contemporary'; // Contemporary Issues
```

### Reflection
```typescript
interface Reflection {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  thumbnail?: string;
  tags: string[];
}
```

### User
```typescript
interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'verifier' | 'admin';
  profileImage?: string;
  bio?: string;
  joinedAt: string;
  stats: {
    coursesCompleted: number;
    coursesEnrolled: number;
    currentStreak: number;
    totalDaysActive: number;
    dhikrCount: number;
    achievementsUnlocked: number;
  };
}
```

---

## Error Handling

### Standard Error Response Format
```typescript
{
  error: string;        // Error message
  code?: string;        // Error code (optional)
  details?: any;        // Additional error details (optional)
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created successfully
- `400` - Bad request (invalid input)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (authenticated but not authorized)
- `404` - Resource not found
- `422` - Unprocessable entity (validation error)
- `500` - Internal server error

### Common Error Codes
```typescript
const ERROR_CODES = {
  // Authentication
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_ROLE: 'INVALID_ROLE',
  
  // Business Logic
  COURSE_NOT_FOUND: 'COURSE_NOT_FOUND',
  ALREADY_ENROLLED: 'ALREADY_ENROLLED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  VERIFICATION_REQUIRED: 'VERIFICATION_REQUIRED',
  
  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
};
```

---

## Rate Limiting (To Implement)

Recommended rate limits:
- Public endpoints: 100 requests/minute
- Authenticated endpoints: 300 requests/minute
- Course submission: 10 requests/hour per user
- Verification actions: 50 requests/hour per verifier

---

## Webhooks (To Implement)

### Course Status Change
Notify teacher when course status changes:
```json
{
  "event": "course.status_changed",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "data": {
    "courseId": "course-123",
    "previousStatus": "pending_verification",
    "newStatus": "approved",
    "feedback": "Excellent content"
  }
}
```

---

## Testing

### Development Testing
```bash
# Test as student
curl http://localhost:3001/api/library

# Test as teacher (requires auth)
curl -X POST http://localhost:3001/api/courses/submit \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Course","description":"Test","category":"fiqh","difficulty":"beginner","duration":"1 week","lessons":5,"price":0}'

# Test as verifier
curl http://localhost:3001/api/verification/queue
```

### Production Testing
Use API testing tools:
- Postman
- Insomnia
- Thunder Client (VS Code extension)

---

## Migration from Mock to Real Database

1. Install database client:
```bash
npm install firebase-admin
# or
npm install @supabase/supabase-js
```

2. Update API routes to use database queries instead of mock data

3. Example conversion:
```typescript
// BEFORE (Mock)
const courses = mockCourses.filter(c => c.status === 'approved');

// AFTER (Firestore)
const snapshot = await db.collection('courses')
  .where('status', '==', 'approved')
  .get();
const courses = snapshot.docs.map(doc => doc.data());
```

See [DATABASE_SETUP.md](DATABASE_SETUP.md) for complete migration guide.

---

## Support

For API questions or issues:
1. Check error response for details
2. Review TypeScript types in `src/lib/database-types.ts`
3. See implementation examples in API route files
4. Consult [DATABASE_SETUP.md](DATABASE_SETUP.md)

---

**Last Updated:** January 2024  
**API Version:** 1.0.0  
**Base URL:** `http://localhost:3001/api` (development)
