import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  const duas = await prisma.dua.findMany();
  return NextResponse.json(duas);
}
