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
    // You may need to map DB fields to the expected progress object
    return NextResponse.json({ progress: dbUser });
  } catch {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
