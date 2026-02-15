import { NextRequest, NextResponse } from 'next/server';

// Mock auth check
function getCurrentUser(request: NextRequest) {
  return {
    id: 'verifier-456',
    email: 'verifier@deenify.com',
    name: 'Sheikh Verifier',
    role: 'verifier' as const,
  };
}

export async function GET(request: NextRequest) {
  try {
    const user = getCurrentUser(request);
    
    if (!user || (user.role !== 'verifier' && user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Unauthorized. Verifier role required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending_verification';

    // TODO: Fetch from database
    // const courses = await db.collection('courses')
    //   .where('status', '==', status)
    //   .orderBy('createdAt', 'desc')
    //   .get();

    const mockCourses = [
      {
        id: '1',
        title: 'Arabic for Quranic Understanding',
        description: 'Learn Quranic Arabic to understand the Quran in its original language.',
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
        description: 'Explore Islamic civilization during its golden age.',
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
    ];

    const filtered = mockCourses.filter(c => c.status === status);

    return NextResponse.json({ courses: filtered });
  } catch (error) {
    console.error('Verification queue error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification queue' },
      { status: 500 }
    );
  }
}
