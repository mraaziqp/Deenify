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

async function canAccessClassAssignment(classId: string, userId: string) {
  const [isEnrolled, isTeacher, isPrincipalMember] = await Promise.all([
    prisma.classEnrollment.findFirst({ where: { classId, userId }, select: { id: true } }),
    prisma.madresahClass.findFirst({ where: { id: classId, teacherId: userId }, select: { id: true } }),
    prisma.madresahClass.findFirst({
      where: {
        id: classId,
        madresah: {
          members: {
            some: {
              userId,
              role: 'PRINCIPAL',
            },
          },
        },
      },
      select: { id: true },
    }),
  ]);

  return Boolean(isEnrolled || isTeacher || isPrincipalMember);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ assignmentId: string }> }
) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { assignmentId } = await params;

  let assignment: any;
  try {
    assignment = await prismaAny.arabicLearningAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        createdBy: { select: { id: true, role: true } },
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Arabic assignment table is not ready yet. Run migrations first.' },
      { status: 503 }
    );
  }

  if (!assignment) {
    return NextResponse.json({ error: 'Assignment not found.' }, { status: 404 });
  }

  const authUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true },
  });

  if (!authUser) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const isCompleted = Boolean(body.isCompleted);

  const isCreator = assignment.createdById === userId;
  const isTargetUser = assignment.targetUserId === userId;
  const isPlatformAdmin = authUser.role === 'ADMIN';

  let hasClassAccess = false;
  if (assignment.targetClassId) {
    hasClassAccess = await canAccessClassAssignment(assignment.targetClassId, userId);
  }

  if (!isCreator && !isTargetUser && !isPlatformAdmin && !hasClassAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let updated: any;
  try {
    updated = await prismaAny.arabicLearningAssignment.update({
      where: { id: assignmentId },
      data: {
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
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

  return NextResponse.json({ assignment: updated });
}
