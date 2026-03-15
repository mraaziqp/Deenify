import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getUserId(req: NextRequest): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    return decoded.id;
  } catch {
    return null;
  }
}

// POST /api/madresah/[madresahId]/classes/[classId]/enroll
// Teacher/Principal enrolls a student by email or username
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId, classId } = await params;

  const member = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  if (!member || !['PRINCIPAL', 'TEACHER'].includes(member.role)) {
    return NextResponse.json({ error: 'Only principals and teachers can enroll students' }, { status: 403 });
  }

  const { emailOrUsername } = await req.json();
  if (!emailOrUsername) return NextResponse.json({ error: 'emailOrUsername is required' }, { status: 400 });

  const target = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: emailOrUsername, mode: 'insensitive' } },
        { username: { equals: emailOrUsername, mode: 'insensitive' } },
      ],
    },
  });

  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  // Ensure they're at least a member of the school
  const schoolMember = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId: target.id, madresahId } },
  });
  if (!schoolMember) {
    // Auto-add as student member of the school
    await prisma.madresahMember.create({
      data: { userId: target.id, madresahId, role: 'STUDENT' },
    });
  }

  const existing = await prisma.classEnrollment.findUnique({
    where: { classId_userId: { classId, userId: target.id } },
  });
  if (existing) return NextResponse.json({ error: 'Student already enrolled in this class' }, { status: 409 });

  const enrollment = await prisma.classEnrollment.create({
    data: { classId, userId: target.id },
    include: { user: { select: { id: true, email: true, username: true, displayName: true } } },
  });

  return NextResponse.json({ enrollment }, { status: 201 });
}

// DELETE /api/madresah/[madresahId]/classes/[classId]/enroll — remove student
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId, classId } = await params;

  const member = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  if (!member || !['PRINCIPAL', 'TEACHER'].includes(member.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { studentId } = await req.json();
  await prisma.classEnrollment.deleteMany({
    where: { classId, userId: studentId },
  });

  return NextResponse.json({ ok: true });
}
