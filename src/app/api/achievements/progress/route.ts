import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  try {
    const user = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    // Fetch user progress from the database (replace with your actual fields)
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        dhikrCount: true,
        currentStreak: true,
        totalDaysActive: true,
        coursesCompleted: true,
        // Add other fields as needed
      },
    });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    // Map DB fields to the expected UserProgress shape
    const progress = {
      dhikrCount: dbUser.dhikrCount ?? 0,
      dhikrStreak: dbUser.currentStreak ?? 0,
      quranPagesRead: 0, // Not tracked yet
      coursesCompleted: dbUser.coursesCompleted ?? 0,
      khatmJuzCompleted: 0, // Not tracked yet
      daysActive: dbUser.totalDaysActive ?? 0,
      lastActiveDate: '', // Not tracked yet
    };
    return NextResponse.json({ progress });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
