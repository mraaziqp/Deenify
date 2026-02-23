import { prisma } from '../src/lib/prisma';

async function main() {
  const email = 'mraaziqp@gmail.com';
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error('User not found:', email);
    process.exit(1);
  }
  await prisma.user.update({ where: { email }, data: { role: 'admin' } });
  console.log('User role updated to admin:', email);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});