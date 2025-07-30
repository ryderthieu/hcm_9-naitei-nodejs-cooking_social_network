import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();

  if (!user) {
    console.error('There is no users in DB. Create a user first.');
    process.exit(1);
  }

  const recipe = await prisma.recipe.upsert({
    where: { id: 999 },
    update: {},
    create: {
      id: 999,
      title: 'Test Recipe',
      authorId: user.id,
      description: 'This is a dummy recipe for testing post',
      time: 30,
    },
  });

  console.log('Created recipe:', recipe);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
