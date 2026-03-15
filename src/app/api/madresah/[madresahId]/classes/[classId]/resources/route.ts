import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function getUserId(req: NextRequest): string | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

async function checkClassAccess(userId: string, classId: string) {
  const cls = await prisma.madresahClass.findUnique({
    where: { id: classId },
    include: { madresah: true },
  });
  if (!cls) return null;
  const membership = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId: cls.madresahId } },
  });
  const isAdmin = cls.madresah.adminId === userId;
  return { cls, membership, isAdmin };
}

// GET /api/madresah/[madresahId]/classes/[classId]/resources
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { classId } = await params;

  const access = await checkClassAccess(userId, classId);
  if (!access) return NextResponse.json({ error: 'Class not found' }, { status: 404 });
  if (!access.membership && !access.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const resources = await prisma.classResource.findMany({
    where: { classId },
    include: { author: { select: { id: true, displayName: true, email: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json(resources);
}

// POST /api/madresah/[madresahId]/classes/[classId]/resources
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { classId } = await params;

  const access = await checkClassAccess(userId, classId);
  if (!access) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

  const canPost =
    access.isAdmin ||
    access.membership?.role === 'PRINCIPAL' ||
    access.membership?.role === 'TEACHER' ||
    access.cls.teacherId === userId;
  if (!canPost) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { title, description, fileUrl, fileType, subjectName } = await req.json();
  if (!title?.trim()) {
    return NextResponse.json({ error: 'Title required' }, { status: 400 });
  }

  const resource = await prisma.classResource.create({
    data: {
      classId,
      authorId: userId,
      title: title.trim(),
      description: description?.trim() || null,
      fileUrl: fileUrl?.trim() || null,
      fileType: fileType?.trim() || null,
      subjectName: subjectName?.trim() || null,
    },
    include: { author: { select: { id: true, displayName: true, email: true } } },
  });

  return NextResponse.json(resource, { status: 201 });
}

// DELETE — remove a resource
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { classId } = await params;

  const access = await checkClassAccess(userId, classId);
  if (!access) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

  const canDelete =
    access.isAdmin ||
    access.membership?.role === 'PRINCIPAL' ||
    access.membership?.role === 'TEACHER';
  if (!canDelete) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: 'Resource id required' }, { status: 400 });

  await prisma.classResource.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
