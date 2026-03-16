import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';
const prismaAny = prisma as any;

type JwtPayload = { id: string; role?: string };

async function getUserId(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    return decoded.id;
  } catch {
    return null;
  }
}

function toDateOnlyString(value: Date | null): string | null {
  if (!value) return null;
  return value.toISOString().slice(0, 10);
}

function parseDateOnly(value: string | null | undefined): Date | null {
  if (!value) return null;
  const asDate = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(asDate.getTime())) return null;
  return asDate;
}

export async function GET(_req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let progress: any = null;
  try {
    progress = await prismaAny.arabicLearningProgress.findUnique({
      where: { userId },
    });
  } catch {
    return NextResponse.json({
      progress: {
        completedLessons: [],
        xp: 0,
        streak: 0,
        gamesWon: 0,
        placementCompleted: false,
        lastActiveDate: null,
        dailyMinutes: 25,
        daysPerWeek: 5,
        journalEntry: '',
      },
      dbSyncAvailable: false,
    });
  }

  if (!progress) {
    return NextResponse.json({
      progress: {
        completedLessons: [],
        xp: 0,
        streak: 0,
        gamesWon: 0,
        placementCompleted: false,
        lastActiveDate: null,
        dailyMinutes: 25,
        daysPerWeek: 5,
        journalEntry: '',
      },
    });
  }

  return NextResponse.json({
    progress: {
      completedLessons: progress.completedLessons,
      xp: progress.xp,
      streak: progress.streak,
      gamesWon: progress.gamesWon,
      placementCompleted: progress.placementCompleted,
      lastActiveDate: toDateOnlyString(progress.lastActiveDate),
      dailyMinutes: progress.dailyMinutes,
      daysPerWeek: progress.daysPerWeek,
      journalEntry: progress.journalEntry ?? '',
      updatedAt: progress.updatedAt,
    },
  });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();

  const completedLessons = Array.isArray(body.completedLessons)
    ? body.completedLessons.filter((item: unknown) => typeof item === 'string')
    : [];

  const xp = typeof body.xp === 'number' ? Math.max(0, Math.floor(body.xp)) : 0;
  const streak = typeof body.streak === 'number' ? Math.max(0, Math.floor(body.streak)) : 0;
  const gamesWon = typeof body.gamesWon === 'number' ? Math.max(0, Math.floor(body.gamesWon)) : 0;
  const placementCompleted = Boolean(body.placementCompleted);
  const lastActiveDate = parseDateOnly(body.lastActiveDate);
  const dailyMinutes =
    typeof body.dailyMinutes === 'number'
      ? Math.min(90, Math.max(10, Math.floor(body.dailyMinutes)))
      : 25;
  const daysPerWeek =
    typeof body.daysPerWeek === 'number'
      ? Math.min(7, Math.max(2, Math.floor(body.daysPerWeek)))
      : 5;
  const journalEntry = typeof body.journalEntry === 'string' ? body.journalEntry.slice(0, 8000) : '';

  let saved: any;
  try {
    saved = await prismaAny.arabicLearningProgress.upsert({
      where: { userId },
      update: {
        completedLessons,
        xp,
        streak,
        gamesWon,
        placementCompleted,
        lastActiveDate,
        dailyMinutes,
        daysPerWeek,
        journalEntry,
      },
      create: {
        userId,
        completedLessons,
        xp,
        streak,
        gamesWon,
        placementCompleted,
        lastActiveDate,
        dailyMinutes,
        daysPerWeek,
        journalEntry,
      },
    });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Arabic progress table is not ready yet. Run migrations first.' },
      { status: 503 }
    );
  }

  return NextResponse.json({
    success: true,
    progress: {
      completedLessons: saved.completedLessons,
      xp: saved.xp,
      streak: saved.streak,
      gamesWon: saved.gamesWon,
      placementCompleted: saved.placementCompleted,
      lastActiveDate: toDateOnlyString(saved.lastActiveDate),
      dailyMinutes: saved.dailyMinutes,
      daysPerWeek: saved.daysPerWeek,
      journalEntry: saved.journalEntry ?? '',
      updatedAt: saved.updatedAt,
    },
  });
}
