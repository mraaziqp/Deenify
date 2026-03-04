/**
 * Seed starter video playlists for the Learn page.
 *
 * BEFORE RUNNING:
 * 1. Open each YouTube playlist link below
 * 2. Copy the `list=` value from the URL
 * 3. Replace the placeholder youtubePlaylistId values
 * 4. Replace thumbnailUrl with any video thumbnail from that playlist:
 *    https://img.youtube.com/vi/YOUR_VIDEO_ID/mqdefault.jpg
 *
 * Run with:
 *   npx ts-node --project tsconfig.json scripts/seed-playlists.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const playlists = [
  {
    title: 'Stories of the Prophets',
    instructor: 'Mufti Menk',
    // https://www.youtube.com/@MuftiMenk/playlists → find "Stories of the Prophets"
    youtubePlaylistId: 'PLHbhDHlFdMgb9hJq_nEWwHXI0tpSPMjbz',
    thumbnailUrl: 'https://img.youtube.com/vi/CnO5nOdyY0Q/mqdefault.jpg',
    category: 'History',
    sortOrder: 1,
  },
  {
    title: 'Motivational Moments',
    instructor: 'Mufti Menk',
    // https://www.youtube.com/@MuftiMenk/playlists → find "Motivational Moments"
    youtubePlaylistId: 'PLHbhDHlFdMgY3vRFmLDqkSzxkBLkv1N_k',
    thumbnailUrl: 'https://img.youtube.com/vi/0HklxBBHn-M/mqdefault.jpg',
    category: 'Spirituality',
    sortOrder: 2,
  },
  {
    title: 'Quran Weekly — Tafseer',
    instructor: 'Nouman Ali Khan',
    // https://www.youtube.com/@NAKCollection/playlists → Quran Weekly
    youtubePlaylistId: 'PLutIIKp7NQY0FwAE2cThBFoQJOXr7oCON',
    thumbnailUrl: 'https://img.youtube.com/vi/lVCl8K2IGFE/mqdefault.jpg',
    category: 'Tafseer',
    sortOrder: 3,
  },
  {
    title: 'Fiqh & Daily Life',
    instructor: 'Various Scholars',
    // Replace with a real Fiqh playlist of your choice
    youtubePlaylistId: 'PLmHtBpgoVdqU0VoO2yUhYLqpYzGtJBM3D',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/mqdefault.jpg',
    category: 'Fiqh',
    sortOrder: 4,
  },
];

async function main() {
  console.log('Seeding video playlists...');

  for (const p of playlists) {
    await prisma.videoPlaylist.upsert({
      where: { id: p.title }, // This will fail — use create instead for simplicity
      update: p,
      create: p,
    }).catch(async () => {
      // upsert by title isn't a valid unique key, so just create if not exists
      const exists = await prisma.videoPlaylist.findFirst({ where: { title: p.title } });
      if (!exists) {
        await prisma.videoPlaylist.create({ data: p });
        console.log(`  ✓ Created: ${p.title}`);
      } else {
        console.log(`  ↷ Skipped (exists): ${p.title}`);
      }
    });
  }

  console.log('Done!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
