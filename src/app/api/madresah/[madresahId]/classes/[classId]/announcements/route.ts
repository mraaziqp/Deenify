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

// GET /api/madresah/[madresahId]/classes/[classId]/announcements
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

  const announcements = await prisma.classAnnouncement.findMany({
    where: { classId },
    include: { author: { select: { id: true, displayName: true, email: true } } },
    orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json(announcements);
}

// POST /api/madresah/[madresahId]/classes/[classId]/announcements
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

  const { title, content, isPinned } = await req.json();
  if (!title?.trim() || !content?.trim()) {
    return NextResponse.json({ error: 'Title and content required' }, { status: 400 });
  }

  const announcement = await prisma.classAnnouncement.create({
    data: { classId, authorId: userId, title: title.trim(), content: content.trim(), isPinned: !!isPinned },
    include: { author: { select: { id: true, displayName: true, email: true } } },
  });

  return NextResponse.json(announcement, { status: 201 });
}

// PATCH — toggle pin or delete
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { classId } = await params;

  const access = await checkClassAccess(userId, classId);
  if (!access) return NextResponse.json({ error: 'Class not found' }, { status: 404 });

  const canEdit =
    access.isAdmin ||
    access.membership?.role === 'PRINCIPAL' ||
    access.membership?.role === 'TEACHER' ||
    access.cls.teacherId === userId;
  if (!canEdit) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { id, isPinned, delete: doDelete } = await req.json();
  if (!id) return NextResponse.json({ error: 'Announcement id required' }, { status: 400 });

  if (doDelete) {
    await prisma.classAnnouncement.delete({ where: { id } });
    return NextResponse.json({ deleted: true });
  }

  const updated = await prisma.classAnnouncement.update({
    where: { id },
    data: { isPinned: !!isPinned },
  });
  return NextResponse.json(updated);
}
