import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

async function getUser(req: NextRequest): Promise<{ id: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as { id: string; role: string };
  } catch {
    return null;
  }
}

// GET /api/banners — returns active banners (public), or all banners for admin
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adminView = searchParams.get('admin') === 'true';

  const user = adminView ? await getUser(req) : null;
  const isAdmin = user?.role === 'ADMIN';

  const banners = await prisma.sponsoredBanner.findMany({
    where: adminView && isAdmin ? {} : { isActive: true },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ banners });
}

// POST /api/banners — admin creates a banner
export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { businessName, imageUrl, targetUrl } = await req.json();
  if (!businessName || !imageUrl) {
    return NextResponse.json({ error: 'businessName and imageUrl are required' }, { status: 400 });
  }

  const banner = await prisma.sponsoredBanner.create({
    data: { businessName, imageUrl, targetUrl: targetUrl || null },
  });

  return NextResponse.json({ banner }, { status: 201 });
}

// PATCH /api/banners?id=xxx — increment views/clicks, or toggle isActive (admin)
export async function PATCH(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const body = await req.json();

  // Public: increment views or clicks
  if (body.action === 'view') {
    await prisma.sponsoredBanner.update({ where: { id }, data: { views: { increment: 1 } } });
    return NextResponse.json({ success: true });
  }
  if (body.action === 'click') {
    await prisma.sponsoredBanner.update({ where: { id }, data: { clicks: { increment: 1 } } });
    return NextResponse.json({ success: true });
  }

  // Admin: toggle isActive or update fields
  const user = await getUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const updated = await prisma.sponsoredBanner.update({
    where: { id },
    data: {
      ...(body.isActive !== undefined && { isActive: body.isActive }),
      ...(body.businessName && { businessName: body.businessName }),
      ...(body.imageUrl && { imageUrl: body.imageUrl }),
      ...(body.targetUrl !== undefined && { targetUrl: body.targetUrl }),
    },
  });

  return NextResponse.json({ banner: updated });
}

// DELETE /api/banners?id=xxx — admin deletes a banner
export async function DELETE(req: NextRequest) {
  const user = await getUser(req);
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await prisma.sponsoredBanner.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
