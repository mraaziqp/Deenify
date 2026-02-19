import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const items = await prisma.halalFoodItem.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const item = await prisma.halalFoodItem.create({ data });
  return NextResponse.json(item);
}
