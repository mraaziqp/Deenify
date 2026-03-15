import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
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

// POST /api/madresah/[madresahId]/bulk-enroll
// Body: { students: [{ email, displayName, username?, password? }] }
// Creates User accounts if not existing, then enrolls them in the madresah.
// Caller must be PRINCIPAL or admin.
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ madresahId: string }> }
) {
  const userId = getUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { madresahId } = await params;

  // Only admin/PRINCIPAL can bulk enroll
  const madresah = await prisma.madresah.findUnique({ where: { id: madresahId } });
  if (!madresah) return NextResponse.json({ error: 'School not found' }, { status: 404 });

  const membership = await prisma.madresahMember.findUnique({
    where: { userId_madresahId: { userId, madresahId } },
  });
  const isAdmin = madresah.adminId === userId;
  const canEnroll = isAdmin || membership?.role === 'PRINCIPAL' || membership?.role === 'TEACHER';
  if (!canEnroll) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { students } = await req.json() as {
    students: { email: string; displayName: string; username?: string; password?: string }[];
  };

  if (!Array.isArray(students) || students.length === 0) {
    return NextResponse.json({ error: 'No student data provided' }, { status: 400 });
  }
  if (students.length > 200) {
    return NextResponse.json({ error: 'Maximum 200 students per import' }, { status: 400 });
  }

  const results: { email: string; status: 'created' | 'existing' | 'error'; error?: string }[] = [];

  for (const s of students) {
    if (!s.email || !s.email.includes('@')) {
      results.push({ email: s.email || '', status: 'error', error: 'Invalid email' });
      continue;
    }
    try {
      let user = await prisma.user.findUnique({ where: { email: s.email } });
      let enrolled = false;
      if (!user) {
        const defaultPassword = s.password || Math.random().toString(36).slice(-8);
        const hashed = await bcrypt.hash(defaultPassword, 10);
        user = await prisma.user.create({
          data: {
            email: s.email,
            displayName: s.displayName || s.email.split('@')[0],
            username: s.username || undefined,
            password: hashed,
            emailVerified: true,
          },
        });
        enrolled = false;
      }
      // Enroll in madresah if not already
      await prisma.madresahMember.upsert({
        where: { userId_madresahId: { userId: user.id, madresahId } },
        create: { userId: user.id, madresahId, role: 'STUDENT' },
        update: {},
      });
      results.push({ email: s.email, status: enrolled ? 'existing' : 'created' });
    } catch (err: any) {
      results.push({ email: s.email, status: 'error', error: err.message });
    }
  }

  const created = results.filter(r => r.status === 'created').length;
  const existing = results.filter(r => r.status === 'existing').length;
  const errors = results.filter(r => r.status === 'error').length;

  return NextResponse.json({ results, summary: { created, existing, errors } });
}
