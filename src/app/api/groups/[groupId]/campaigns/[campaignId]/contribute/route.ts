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

// POST — add a dhikr contribution to a campaign
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ groupId: string; campaignId: string }> },
) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { groupId, campaignId } = await params;

  // Verify member
  const member = await prisma.groupMember.findFirst({ where: { groupId, userId } });
  if (!member) return NextResponse.json({ error: 'Not a member' }, { status: 403 });

  const { count } = await req.json();
  const n = Number(count);
  if (!n || n < 1) return NextResponse.json({ error: 'count must be >= 1' }, { status: 400 });

  const [contribution, campaign] = await prisma.$transaction([
    prisma.dhikrContribution.create({ data: { campaignId, userId, count: n } }),
    prisma.campaign.update({
      where: { id: campaignId },
      data: { currentCount: { increment: n } },
    }),
  ]);

  return NextResponse.json({ contribution, updatedCount: campaign.currentCount });
}
