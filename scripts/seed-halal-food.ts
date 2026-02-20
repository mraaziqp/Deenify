import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const items = [
  {
    name: 'Chicken (Halaal Certified)',
    description: 'Chicken from certified Halaal suppliers in Cape Town.',
    category: 'Meat',
    isHalal: true,
    source: 'https://sanha.org.za/',
    imageUrl: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Beef (Halaal Certified)',
    description: 'Beef from certified Halaal butchers and abattoirs.',
    category: 'Meat',
    isHalal: true,
    source: 'https://sanha.org.za/',
    imageUrl: 'https://images.unsplash.com/photo-1556740772-1a741367b93e?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Pork',
    description: 'Pork and all pork products are not Halaal.',
    category: 'Meat',
    isHalal: false,
    source: 'https://sanha.org.za/',
    imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb011b1a5b1?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Fish',
    description: 'All fish and seafood are generally considered Halaal.',
    category: 'Seafood',
    isHalal: true,
    source: 'https://sanha.org.za/',
    imageUrl: 'https://images.unsplash.com/photo-1502741126161-68b3b7ee7a90?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Alcohol',
    description: 'Alcohol and all intoxicants are not Halaal.',
    category: 'Beverages',
    isHalal: false,
    source: 'https://sanha.org.za/',
    imageUrl: 'https://images.unsplash.com/photo-1464983953574-0892a7167e67?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Bread',
    description: 'Bread is Halaal unless it contains non-Halaal additives.',
    category: 'Bakery',
    isHalal: true,
    source: 'https://sanha.org.za/',
    imageUrl: 'https://images.unsplash.com/photo-1511689660974-5b7b3c7c7c2c?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Gelatine',
    description: 'Gelatine is only Halaal if sourced from Halaal animals.',
    category: 'Additives',
    isHalal: false,
    source: 'https://sanha.org.za/',
    imageUrl: 'https://images.unsplash.com/photo-1519864600265-abb011b1a5b1?auto=format&fit=crop&w=400&q=80'
  },
  {
    name: 'Coca-Cola',
    description: 'Coca-Cola beverages are generally considered halal unless containing alcohol.',
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
  }
];

async function main() {
  await prisma.halalFoodItem.deleteMany();
  for (const item of items) {
    await prisma.halalFoodItem.create({ data: item });
  }
  console.log('Halal food items seeded successfully.');
}

main().finally(() => prisma.$disconnect());
