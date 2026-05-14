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

// GET /api/admin/partnerships — list all partnership inquiries
export async function GET(req: NextRequest) {
  const user = await getAdminUser(req);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { searchParams } = req.nextUrl;
  const status = searchParams.get('status') ?? '';

  const where: Record<string, unknown> = {};
  if (status && ['PENDING', 'REVIEWING', 'ACTIVE', 'DECLINED'].includes(status)) {
    where.status = status;
  }

  const partnerships = await prisma.partnership.findMany({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ partnerships });
}

// POST /api/admin/partnerships — create a new partnership inquiry (public or admin)
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyName, contactName, email, phone, website, message, proposedRate } = body;

  if (!companyName || !contactName || !email || !message) {
    return NextResponse.json({ error: 'companyName, contactName, email, and message are required' }, { status: 400 });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
  }

  const partnership = await prisma.partnership.create({
    data: {
      companyName,
      contactName,
      email,
      phone: phone || null,
      website: website || null,
      message,
      proposedRate: proposedRate ? parseFloat(proposedRate) : null,
    },
  });

  return NextResponse.json({ partnership }, { status: 201 });
}

// PATCH /api/admin/partnerships?id=xxx — update status or notes
export async function PATCH(req: NextRequest) {
  const user = await getAdminUser(req);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  const body = await req.json();
  const allowedStatuses = ['PENDING', 'REVIEWING', 'ACTIVE', 'DECLINED'];
  if (body.status && !allowedStatuses.includes(body.status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
  }

  const updated = await prisma.partnership.update({
    where: { id },
    data: {
      ...(body.status && { status: body.status }),
      ...(body.notes !== undefined && { notes: body.notes }),
    },
  });

  return NextResponse.json({ partnership: updated });
}

// DELETE /api/admin/partnerships?id=xxx
export async function DELETE(req: NextRequest) {
  const user = await getAdminUser(req);
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

  await prisma.partnership.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
