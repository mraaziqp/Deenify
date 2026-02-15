import { NextResponse } from 'next/server';
import { islamicFacts } from '@/lib/islamic-facts';

export async function GET() {
  return NextResponse.json({ facts: islamicFacts });
}
