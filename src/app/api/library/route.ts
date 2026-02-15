import { NextResponse } from 'next/server';

// TODO: Replace with real database queries
// This is a placeholder that returns structured data matching the frontend types
export async function GET() {
  try {
    // In production, query your database (Firestore, Supabase, etc.)
    // Example: const courses = await db.collection('courses').where('status', '==', 'approved').get();
    
    const freeCourses = [
      {
        id: '1',
        title: 'Introduction to Islam',
        description: 'Perfect for beginners. Learn the five pillars and fundamental beliefs.',
        category: 'Basics',
        difficulty: 'Beginner',
        duration: '2 weeks',
        lessons: 12,
        progressPercent: 0,
        enrolled: false,
        rating: 4.9,
        students: 15420,
        price: 0,
        status: 'approved',
      },
      {
        id: '2',
        title: 'Perfecting Your Salah',
        description: 'Master the prayer with detailed guidance on every movement and recitation.',
        category: 'Basics',
        difficulty: 'Beginner',
        duration: '1 week',
        lessons: 8,
        progressPercent: 38,
        enrolled: true,
        rating: 4.8,
        students: 12350,
        price: 0,
        status: 'approved',
      },
      {
        id: '3',
        title: 'Understanding the Quran',
        description: 'Learn Tafsir basics and understand the meanings behind the verses.',
        category: 'Quran',
        difficulty: 'Intermediate',
        duration: '4 weeks',
        lessons: 20,
        progressPercent: 0,
        enrolled: false,
        rating: 4.9,
        students: 8920,
        price: 0,
        status: 'approved',
      },
      {
        id: '4',
        title: 'The Life of Prophet Muhammad ﷺ',
        description: 'Detailed journey through the Seerah of our beloved Prophet.',
        category: 'History',
        difficulty: 'Beginner',
        duration: '6 weeks',
        lessons: 30,
        progressPercent: 0,
        enrolled: false,
        rating: 5.0,
        students: 18760,
        price: 0,
        status: 'approved',
      },
    ];

    const specializedCourses = [
      {
        id: '5',
        title: 'Islamic Finance Fundamentals',
        description: 'Introduction to halal income, Riba, and Islamic economic principles.',
        category: 'Finance',
        difficulty: 'Intermediate',
        duration: '3 weeks',
        lessons: 15,
        progressPercent: 0,
        enrolled: false,
        rating: 4.7,
        students: 6540,
        price: 49,
        status: 'approved',
      },
      {
        id: '6',
        title: 'Advanced Fiqh Studies',
        description: 'Deep dive into Islamic jurisprudence and scholarly opinions.',
        category: 'Fiqh',
        difficulty: 'Advanced',
        duration: '8 weeks',
        lessons: 40,
        progressPercent: 0,
        enrolled: false,
        rating: 4.8,
        students: 2340,
        price: 99,
        status: 'approved',
      },
      {
        id: '7',
        title: 'Arabic for Quranic Understanding',
        description: 'Learn Quranic Arabic to understand the Quran in its original language.',
        category: 'Language',
        difficulty: 'Intermediate',
        duration: '12 weeks',
        lessons: 50,
        progressPercent: 0,
        enrolled: false,
        rating: 4.9,
        students: 4120,
        price: 79,
        status: 'pending_verification',
      },
    ];

    const reflections = [
      {
        id: 'r1',
        title: 'Patience in Hardship',
        ayah: 'Indeed, Allah is with the patient.',
        reference: 'Quran 2:153',
        theme: 'Patience',
      },
      {
        id: 'r2',
        title: 'The Power of Gratitude',
        ayah: 'If you are grateful, I will surely increase you [in favor].',
        reference: 'Quran 14:7',
        theme: 'Gratitude',
      },
      {
        id: 'r3',
        title: 'Trust in Allah\'s Plan',
        ayah: 'And it may be that you dislike a thing which is good for you.',
        reference: 'Quran 2:216',
        theme: 'Trust',
      },
    ];

    return NextResponse.json({
      freeCourses,
      specializedCourses,
      reflections,
    });
  } catch (error) {
    console.error('Library API error:', error);
    return NextResponse.json(
      { error: 'Failed to load library data' },
      { status: 500 }
    );
  }
}
