import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'changeme';

export async function GET(req: NextRequest) {
  const cookieStore = cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return NextResponse.json({ user: null });
  try {
    const user = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null });
  }
}
