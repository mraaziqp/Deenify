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

// GET /api/madresah/[madresahId]/classes/[classId] — full class detail
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string; classId: string }> }
) {
  const userId = await getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId, classId } = await params;

  const member = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  if (!member) return NextResponse.json({ error: 'Not a member of this school' }, { status: 403 });

  const cls = await prisma.madresahClass.findUnique({
    where: { id: classId },
    include: {
      teacher: { select: { id: true, email: true, username: true, displayName: true } },
      subjects: true,
      students: {
        include: { user: { select: { id: true, email: true, username: true, displayName: true } } },
        orderBy: { enrolledAt: 'asc' },
      },
      homework: {
        include: {
          subject: true,
          _count: { select: { submissions: true } },
        },
        orderBy: { dueDate: 'asc' },
      },
    },
  });

  if (!cls || cls.madresahId !== madresahId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ class: cls, myRole: member.role });
}
