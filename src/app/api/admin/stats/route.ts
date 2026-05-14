import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getAdminUser(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: string };
    if (decoded.role !== 'ADMIN') return null;
    return decoded;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const user = await getAdminUser(req);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    adminCount,
    scholarCount,
    recentSignups7d,
    recentSignups30d,
    totalGroups,
    totalBanners,
    activeBanners,
    totalDhikr,
    totalPartnerships,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'SCHOLAR' } }),
    prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.group.count(),
    prisma.sponsoredBanner.count(),
    prisma.sponsoredBanner.count({ where: { isActive: true } }),
    prisma.user.aggregate({ _sum: { dhikrCount: true } }),
    prisma.partnership.count().catch(() => 0),
  ]);

  return NextResponse.json({
    totalUsers,
    usersByRole: {
      user: totalUsers - adminCount - scholarCount,
      admin: adminCount,
      scholar: scholarCount,
    },
    recentSignups7d,
    recentSignups30d,
    totalGroups,
    totalBanners,
    activeBanners,
    totalDhikrCount: totalDhikr._sum.dhikrCount ?? 0,
    totalPartnerships,
  });
}
