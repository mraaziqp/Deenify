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

// POST /api/groups/[groupId]/campaigns — create a campaign (admin only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ groupId: string }> }) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupId } = await params;
  const group = await prisma.group.findUnique({ where: { id: groupId }, include: { members: true } });
  if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const me = group.members.find((m) => m.userId === userId);
  if (!me || me.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { type, title, targetCount } = await req.json();
  if (!type || !title || !targetCount) return NextResponse.json({ error: 'type, title, targetCount required' }, { status: 400 });

  const campaign = await prisma.campaign.create({
    data: { groupId, type, title, targetCount: Number(targetCount) },
  });

  // If KHATM, seed 30 juz
  if (type === 'KHATM') {
    await prisma.khatmJuz.createMany({
      data: Array.from({ length: 30 }, (_, i) => ({
        campaignId: campaign.id,
        juzNumber: i + 1,
        status: 'OPEN',
      })),
    });
  }

  return NextResponse.json({ campaign }, { status: 201 });
}
