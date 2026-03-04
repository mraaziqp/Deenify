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

// GET /api/groups/[groupId] — full group detail with members, campaigns, khatm juz
export async function GET(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupId } = await params;

  const group = await prisma.group.findUnique({
    where: { id: groupId },
    include: {
      admin: { select: { id: true, email: true, username: true, displayName: true } },
      members: {
        include: { user: { select: { id: true, email: true, username: true, displayName: true } } },
        orderBy: { joinedAt: 'asc' },
      },
      campaigns: {
        include: {
          khatmJuz: {
            include: { claimedByUser: { select: { id: true, email: true, username: true, displayName: true } } },
            orderBy: { juzNumber: 'asc' },
          },
          dhikrContributions: {
            include: { user: { select: { id: true, email: true, username: true, displayName: true } } },
            orderBy: { createdAt: 'desc' },
            take: 50,
          },
        },
        orderBy: { id: 'desc' },
      },
    },
  });

  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

  // Only members can view
  const isMember = group.members.some((m) => m.userId === userId);
  if (!isMember) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  return NextResponse.json({ group });
}

// DELETE /api/groups/[groupId] — admin can delete group
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupId } = await params;
  const group = await prisma.group.findUnique({ where: { id: groupId } });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (group.adminId !== userId) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  await prisma.group.delete({ where: { id: groupId } });
  return NextResponse.json({ ok: true });
}
