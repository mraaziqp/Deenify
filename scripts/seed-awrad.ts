import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create a sample book
  const book = await prisma.awradBook.create({
    data: {
      title: 'The Khulasah',
      author: 'Compiled by Habib Umar bin Hafiz',
      coverImageUrl: '',
      chapters: {
        create: [
          {
            title: 'The last part of the night',
            audioUrl: '',
            order: 1,
            lines: {
              create: [
                {
                  arabicText: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ',
                  transliteration: 'Alhamdu lillahil-ladhi ahyana ba\'da ma amatana wa ilayhin-nushur',
                  translation: 'All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection.',
                  order: 1,
                },
                {
                  arabicText: 'لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ...',
                  transliteration: 'La ilaha illallahu wahdahu la sharika lah...',
                  translation: 'None has the right to be worshipped but Allah alone, Who has no partner...',
                  order: 2,
                },
              ],
            },
          },
        ],
      },
    },
    include: { chapters: { include: { lines: true } } },
  });
  console.log('Seeded book:', book.title);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
