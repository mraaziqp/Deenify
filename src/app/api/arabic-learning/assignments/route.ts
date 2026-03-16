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

async function getAuthContext(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, email: true, displayName: true, username: true },
  });

  if (!user) return null;

  const staffMemberships = await prisma.madresahMember.findMany({
    where: {
      userId,
      role: { in: ['PRINCIPAL', 'TEACHER'] },
    },
    select: {
      madresahId: true,
      role: true,
    },
  });

  const staffMadresahIds = [...new Set(staffMemberships.map((m) => m.madresahId))];
  const isPlatformAdmin = user.role === 'ADMIN';

  return {
    user,
    isPlatformAdmin,
    staffMadresahIds,
    staffMemberships,
  };
}

function parseOptionalDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed;
}

export async function GET(_req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const authContext = await getAuthContext(userId);
  if (!authContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const [enrollments, taughtClasses] = await Promise.all([
    prisma.classEnrollment.findMany({
      where: { userId },
      select: { classId: true },
    }),
    prisma.madresahClass.findMany({
      where: { teacherId: userId },
      select: { id: true },
    }),
  ]);

  const relevantClassIds = [...new Set([
    ...enrollments.map((item) => item.classId),
    ...taughtClasses.map((item) => item.id),
  ])];

  const orFilters: Array<Record<string, unknown>> = [
    { createdById: userId },
    { targetUserId: userId },
  ];

  if (relevantClassIds.length > 0) {
    orFilters.push({ targetClassId: { in: relevantClassIds } });
  }

  let assignments: any[] = [];
  try {
    assignments = await prismaAny.arabicLearningAssignment.findMany({
      where: { OR: orFilters },
      include: {
        createdBy: { select: { id: true, email: true, displayName: true, username: true } },
        targetUser: { select: { id: true, email: true, displayName: true, username: true } },
        targetClass: { select: { id: true, name: true, madresahId: true } },
      },
      orderBy: [{ isCompleted: 'asc' }, { dueDate: 'asc' }, { createdAt: 'desc' }],
    });
  } catch {
    return NextResponse.json({
      assignments: [],
      canCreateAssignments: authContext.isPlatformAdmin || authContext.staffMadresahIds.length > 0,
      staffMadresahIds: authContext.staffMadresahIds,
      dbSyncAvailable: false,
    });
  }

  return NextResponse.json({
    assignments,
    canCreateAssignments: authContext.isPlatformAdmin || authContext.staffMadresahIds.length > 0,
    staffMadresahIds: authContext.staffMadresahIds,
  });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const authContext = await getAuthContext(userId);
  if (!authContext) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const canCreate = authContext.isPlatformAdmin || authContext.staffMadresahIds.length > 0;
  if (!canCreate) {
    return NextResponse.json({ error: 'Only teachers, principals, or admins can create assignments.' }, { status: 403 });
  }

  const body = await req.json();
  const title = typeof body.title === 'string' ? body.title.trim() : '';
  const focusArea = typeof body.focusArea === 'string' ? body.focusArea.trim() : null;
  const notes = typeof body.notes === 'string' ? body.notes.trim() : null;
  const targetClassId = typeof body.targetClassId === 'string' && body.targetClassId ? body.targetClassId : null;
  const targetUserId = typeof body.targetUserId === 'string' && body.targetUserId ? body.targetUserId : null;
  const dueDate = parseOptionalDate(body.dueDate);
  const recommendedMinutes =
    typeof body.recommendedMinutes === 'number'
      ? Math.min(90, Math.max(10, Math.floor(body.recommendedMinutes)))
      : 25;
  const daysPerWeek =
    typeof body.daysPerWeek === 'number'
      ? Math.min(7, Math.max(2, Math.floor(body.daysPerWeek)))
      : 5;

  if (!title) {
    return NextResponse.json({ error: 'Title is required.' }, { status: 400 });
  }

  if (!targetClassId && !targetUserId) {
    return NextResponse.json({ error: 'Please choose a class or a specific user.' }, { status: 400 });
  }

  if (targetClassId) {
    const targetClass = await prisma.madresahClass.findUnique({
      where: { id: targetClassId },
      select: { id: true, madresahId: true },
    });

    if (!targetClass) {
      return NextResponse.json({ error: 'Target class not found.' }, { status: 404 });
    }

    if (!authContext.isPlatformAdmin && !authContext.staffMadresahIds.includes(targetClass.madresahId)) {
      return NextResponse.json({ error: 'You do not have permission to assign this class.' }, { status: 403 });
    }
  }

  if (targetUserId) {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: { id: true },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found.' }, { status: 404 });
    }

    if (!authContext.isPlatformAdmin) {
      const sharedMembership = await prisma.madresahMember.findFirst({
        where: {
          userId: targetUserId,
          madresahId: { in: authContext.staffMadresahIds },
        },
        select: { id: true },
      });

      if (!sharedMembership) {
        return NextResponse.json({ error: 'You can only assign users in your school(s).' }, { status: 403 });
      }
    }
  }

  let assignment: any;
  try {
    assignment = await prismaAny.arabicLearningAssignment.create({
      data: {
        createdById: userId,
        targetClassId,
        targetUserId,
        title,
        focusArea,
        notes,
        dueDate,
        recommendedMinutes,
        daysPerWeek,
      },
      include: {
        createdBy: { select: { id: true, email: true, displayName: true, username: true } },
        targetUser: { select: { id: true, email: true, displayName: true, username: true } },
        targetClass: { select: { id: true, name: true, madresahId: true } },
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Arabic assignment table is not ready yet. Run migrations first.' },
      { status: 503 }
    );
  }

  return NextResponse.json({ assignment }, { status: 201 });
}
