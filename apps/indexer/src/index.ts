import Web3 from "web3";
import dotenv from "dotenv";

dotenv.config();

const web3 = new Web3(process.env.RPC_ENDPOINT_URL!);

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.$connect();
  const create = await prisma.blocks.create({
    data: { blockNumber: 1 },
  });

  const lastBock = await web3.eth.getBlockNumber(); // 27352865
  console.log("Db connected");
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
