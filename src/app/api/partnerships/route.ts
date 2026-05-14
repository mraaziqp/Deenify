import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// POST /api/partnerships — public endpoint for partnership inquiries
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { companyName, contactName, email, phone, website, message, proposedRate } = body;

  if (!companyName || !contactName || !email || !message) {
    return NextResponse.json({ error: 'companyName, contactName, email, and message are required' }, { status: 400 });
  }

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

  return NextResponse.json({ partnership, message: 'Inquiry submitted successfully' }, { status: 201 });
}
