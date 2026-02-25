
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const duasPath = path.join(__dirname, '../src/data/duas.json');
const duas = JSON.parse(fs.readFileSync(duasPath, 'utf-8'));

const prisma = new PrismaClient();

async function main() {
  for (const dua of duas) {
    await prisma.dua.create({
      data: {
        title: dua.title,
        arabic: dua.arabic,
        transliteration: dua.transliteration,
        translation: dua.translation,
        tags: dua.tags,
      },
    });
  }
  console.log('Duas seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
