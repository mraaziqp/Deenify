import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  let userId: string;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string };
    userId = decoded.id;
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { inviteCode } = await req.json();
  if (!inviteCode) return NextResponse.json({ error: 'Invite code required' }, { status: 400 });

  const group = await prisma.group.findUnique({
    where: { inviteCode: inviteCode.toUpperCase() },
    include: { members: true },
  });
  if (!group) return NextResponse.json({ error: 'Invalid invite code' }, { status: 404 });

  const already = group.members.find((m) => m.userId === userId);
  if (already) return NextResponse.json({ groupId: group.id, alreadyMember: true });

  await prisma.groupMember.create({ data: { groupId: group.id, userId, role: 'MEMBER' } });
  return NextResponse.json({ groupId: group.id }, { status: 201 });
}
