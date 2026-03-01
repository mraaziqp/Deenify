import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import fs from 'fs';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const filePath = path.join(process.cwd(), 'src', 'data', 'hisnul_muslim.json');
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    const chapters = data.English ?? [];
    res.status(200).json(chapters);
  } catch (error) {
    console.error('Hisnul Muslim read error:', error);
    res.status(500).json({ error: 'Failed to fetch Hisnul Muslim data.' });
  }
}
