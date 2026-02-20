import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const progress = await req.json();
    // Expect progress to include userId and stats
    const { userId, currentStreak, totalDaysActive, dhikrCount, coursesCompleted } = progress;
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Missing userId.' }, { status: 400 });
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        currentStreak,
        totalDaysActive,
        dhikrCount,
        coursesCompleted,
      },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to save progress.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
