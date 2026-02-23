import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session?.user || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { title, description, prepTime, imageUrl, ingredients, instructions } = await req.json();
  if (!title || !description || !prepTime || !imageUrl || !ingredients || !instructions) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const recipe = await prisma.recipe.create({
    data: { title, description, prepTime, imageUrl, ingredients, instructions },
  });
  return NextResponse.json(recipe);
}
