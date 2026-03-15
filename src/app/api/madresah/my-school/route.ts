import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

function getUserId(req: NextRequest): string | null {
  const cookieStore = req.cookies;
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string };
    return payload.id;
  } catch {
    return null;
  }
}

// GET /api/madresah/my-school
// Returns the primary madresah for the authenticated user (first PRINCIPAL or TEACHER role, else first membership).
// Used after login for smart redirect to school dashboard.
export async function GET(req: NextRequest) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Check if user is admin of any madresah first
  const adminMadresah = await prisma.madresah.findFirst({
    where: { adminId: userId },
    select: { id: true, name: true },
  });
  if (adminMadresah) {
    return NextResponse.json({ madresahId: adminMadresah.id, name: adminMadresah.name, role: 'PRINCIPAL' });
  }

  // Then check membership (PRINCIPAL or TEACHER first)
  const staffMembership = await prisma.madresahMember.findFirst({
    where: { userId, role: { in: ['PRINCIPAL', 'TEACHER'] } },
    include: { madresah: { select: { id: true, name: true } } },
    orderBy: { joinedAt: 'asc' },
  });
  if (staffMembership) {
    return NextResponse.json({
      madresahId: staffMembership.madresahId,
      name: staffMembership.madresah.name,
      role: staffMembership.role,
    });
  }

  // Then any membership (student, parent)
  const anyMembership = await prisma.madresahMember.findFirst({
    where: { userId },
    include: { madresah: { select: { id: true, name: true } } },
    orderBy: { joinedAt: 'asc' },
  });
  if (anyMembership) {
    return NextResponse.json({
      madresahId: anyMembership.madresahId,
      name: anyMembership.madresah.name,
      role: anyMembership.role,
    });
  }

  return NextResponse.json({ madresahId: null });
}
