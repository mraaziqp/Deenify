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

// POST — mark a juz as completed
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string; campaignId: string; juzNumber: string }> },
) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupId, campaignId, juzNumber } = await params;
  const juzNum = parseInt(juzNumber, 10);

  const member = await prisma.groupMember.findFirst({ where: { groupId, userId } });
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const juz = await prisma.khatmJuz.findFirst({ where: { campaignId, juzNumber: juzNum } });
  if (!juz) return NextResponse.json({ error: 'Juz not found' }, { status: 404 });
  if (juz.status === 'COMPLETED') return NextResponse.json({ error: 'Already completed' }, { status: 409 });
  if (juz.claimedByUserId !== userId) return NextResponse.json({ error: 'You did not claim this juz' }, { status: 403 });

  const [updatedJuz, updatedCampaign] = await prisma.$transaction([
    prisma.khatmJuz.update({
      where: { id: juz.id },
      data: { status: 'COMPLETED', completedAt: new Date() },
      include: { claimedByUser: { select: { id: true, email: true, username: true, displayName: true } } },
    }),
    prisma.campaign.update({
      where: { id: campaignId },
      data: { currentCount: { increment: 1 } },
    }),
  ]);

  return NextResponse.json({ juz: updatedJuz, campaignCount: updatedCampaign.currentCount });
}
