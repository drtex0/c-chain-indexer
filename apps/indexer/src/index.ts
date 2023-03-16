import dotenv from 'dotenv';

dotenv.config();

import { PrismaClient } from 'cci-database';

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();

  let blockNumber = 1;
  setInterval(async () => {
    const blockCreated = await prisma.blocks.create({
      data: { blockNumber },
    });

    blockNumber++;
    console.log('Mined block', blockCreated);
  }, 1000);

  console.log('Db connected');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
