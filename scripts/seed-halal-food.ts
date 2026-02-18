import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.halalFoodItem.createMany({
    data: [
      {
        name: 'Chicken (Certified)',
        description: 'Chicken meat certified halal by SANHA.',
        category: 'Meat',
        isHalal: true,
        source: 'https://sanha.co.za',
        imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=facearea&w=256&q=80',
      },
      {
        name: 'Beef (Certified)',
        description: 'Beef certified halal by MJC.',
        category: 'Meat',
        isHalal: true,
        source: 'https://mjc.org.za',
        imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb23847ef2c?auto=format&fit=facearea&w=256&q=80',
      },
      {
        name: 'Pork',
        description: 'Pork is not halal.',
        category: 'Meat',
        isHalal: false,
        source: '',
        imageUrl: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=facearea&w=256&q=80',
      },
      {
        name: 'Coca-Cola',
        description: 'Soft drink, generally considered halal.',
        category: 'Beverage',
        isHalal: true,
        source: 'https://www.coca-cola.com/za/en',
        imageUrl: 'https://images.unsplash.com/photo-1510626176961-4b57d4fbad04?auto=format&fit=facearea&w=256&q=80',
      },
      {
        name: 'Wine',
        description: 'Alcoholic beverages are not halal.',
        category: 'Beverage',
        isHalal: false,
        source: '',
        imageUrl: 'https://images.unsplash.com/photo-1514361892635-cebbf7dd0fa5?auto=format&fit=facearea&w=256&q=80',
      },
    ],
    skipDuplicates: true,
  });
  console.log('Seeded halal food items!');
}

main().finally(() => prisma.$disconnect());
