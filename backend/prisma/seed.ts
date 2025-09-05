import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('changeme', 10);

  await prisma.user.upsert({
    where: { username: 'john' },
    update: {},
    create: {
      username: 'john',
      email: 'john@example.com',
      password,
    },
  });
}

main()
  .catch((error) => {
    console.error('Seeding error', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
