import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

function fixAudioUrl(url?: string): string | undefined {
  if (!url) return undefined;
  return url.replace(/^http:/, 'https:');
}

async function main() {
  const prisma = new PrismaClient();
  // Fix for __dirname in ESM
  // Fix for Windows path in ESM
  let __filename = new URL(import.meta.url).pathname;
  if (process.platform === 'win32' && __filename.startsWith('/')) {
    __filename = __filename.slice(1);
  }
  __filename = decodeURIComponent(__filename);
  const __dirname = path.dirname(__filename);
  // Accept filename argument for efficient seeding
  const args = process.argv.slice(2);
  const dataFile = args[0] || '../src/data/hisnul_muslim.json';
  const filePath = path.resolve(__dirname, dataFile);
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);
  const chapters = data.English;

  // Create the Hisnul Muslim book
  const book = await prisma.awradBook.upsert({
    where: { title: 'Hisnul Muslim' },
    update: {},
    create: {
      title: 'Hisnul Muslim',
      author: "Sa'id bin Ali bin Wahf Al-Qahtani",
      coverImageUrl: '',
    },
  });

  for (const [i, chapter] of chapters.entries()) {
    const chapterRec = await prisma.awradChapter.create({
      data: {
        bookId: book.id,
        title: chapter.TITLE,
        audioUrl: fixAudioUrl(chapter.AUDIO_URL),
        order: i + 1,
        lines: {
          create: chapter.TEXT.map((dua: any, j: number) => ({
            arabicText: dua.ARABIC_TEXT || dua.Text || '',
            transliteration: dua.LANGUAGE_ARABIC_TRANSLATED_TEXT || '',
            translation: dua.TRANSLATED_TEXT || '',
            order: j + 1,
            audioUrl: fixAudioUrl(dua.AUDIO),
          })),
        },
      },
    });
    console.log('Seeded chapter:', chapterRec.title);
  }

  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
