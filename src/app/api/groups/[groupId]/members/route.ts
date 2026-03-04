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

// POST /api/groups/[groupId]/members — admin adds a member by email or username
export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupId } = await params;
  const group = await prisma.group.findUnique({ where: { id: groupId }, include: { members: true } });
  if (!group) return NextResponse.json({ error: 'Group not found' }, { status: 404 });

  // Only admins can add members directly; any member can share invite code
  const me = group.members.find((m) => m.userId === userId);
  if (!me) return NextResponse.json({ error: 'Not a member' }, { status: 403 });
  if (me.role !== 'ADMIN') return NextResponse.json({ error: 'Only admins can add members directly' }, { status: 403 });

  const { emailOrUsername } = await req.json();
  if (!emailOrUsername) return NextResponse.json({ error: 'emailOrUsername required' }, { status: 400 });

  const target = await prisma.user.findFirst({
    where: {
      OR: [
        { email: { equals: emailOrUsername, mode: 'insensitive' } },
        { username: { equals: emailOrUsername, mode: 'insensitive' } },
      ],
    },
  });

  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const existing = group.members.find((m) => m.userId === target.id);
  if (existing) return NextResponse.json({ error: 'User is already a member' }, { status: 409 });

  const member = await prisma.groupMember.create({
    data: { groupId, userId: target.id, role: 'MEMBER' },
    include: { user: { select: { id: true, email: true, username: true, displayName: true } } },
  });

  return NextResponse.json({ member }, { status: 201 });
}

// DELETE /api/groups/[groupId]/members - admin removes a member (body: { memberId })
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupId } = await params;
  const group = await prisma.group.findUnique({ where: { id: groupId }, include: { members: true } });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const me = group.members.find((m) => m.userId === userId);
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { memberId } = await req.json();
  await prisma.groupMember.delete({ where: { id: memberId } });
  return NextResponse.json({ ok: true });
}
