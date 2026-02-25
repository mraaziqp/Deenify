import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const chapters = await prisma.awradChapter.findMany({
      include: {
        book: true,
      },
      where: {
        book: {
          title: 'Hisnul Muslim',
        },
      },
      orderBy: {
        id: 'asc',
      },
    });
    // Format for dashboard UI
    const formatted = chapters.map(ch => ({
      TITLE: ch.title,
      TEXT: ch.text ? JSON.parse(ch.text) : [],
    }));
    res.status(200).json(formatted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Hisnul Muslim dataset.' });
  }
}
