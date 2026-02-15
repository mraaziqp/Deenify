import { NextRequest, NextResponse } from 'next/server';
import type { CourseSubmissionRequest } from '@/lib/database-types';

// Mock auth middleware - replace with real auth check
function getCurrentUser(request: NextRequest) {
  // TODO: Get user from session/cookie
  // Example: const session = await getServerSession();
  // return session?.user;
  
  return {
    id: 'teacher-123',
    email: 'teacher@deenify.com',
    name: 'Abdullah Teacher',
    role: 'teacher' as const,
  };
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request);
    
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Teacher role required.' },
        { status: 403 }
      );
    }

    const body: CourseSubmissionRequest = await request.json();

    // Validation
    if (!body.title || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields: title, description, category' },
        { status: 400 }
      );
    }

    if (body.price < 0) {
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 400 }
      );
    }

    // TODO: Save to database
    // Example with Firestore:
    // const courseRef = await db.collection('courses').add({
    //   ...body,
    //   teacherId: user.id,
    //   teacherName: user.name,
    //   teacherEmail: user.email,
    //   status: 'pending_verification',
    //   enrolledStudents: 0,
    //   createdAt: new Date(),
    //   updatedAt: new Date(),
    // });

    const newCourse = {
      id: `course-${Date.now()}`,
      ...body,
      teacherId: user.id,
      teacherName: user.name,
      teacherEmail: user.email,
      status: 'pending_verification' as const,
      enrolledStudents: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // TODO: Notify verifiers
    // await sendVerificationNotification(newCourse);

    return NextResponse.json({
      success: true,
      course: newCourse,
      message: 'Course submitted for verification',
    });
  } catch (error) {
    console.error('Course submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit course' },
      { status: 500 }
    );
  }
}

// Get courses by teacher
export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request);
    
    if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }

    // TODO: Fetch from database
    // const courses = await db.collection('courses')
    //   .where('teacherId', '==', user.id)
    //   .orderBy('createdAt', 'desc')
    //   .get();

    const mockCourses = [
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
    ];

    return NextResponse.json({ courses: mockCourses });
  } catch (error) {
    console.error('Fetch courses error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
