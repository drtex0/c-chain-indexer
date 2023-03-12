import Web3 from "web3";
import { throttleAll } from "promise-throttle-all";
import dotenv from "dotenv";

dotenv.config();

const web3 = new Web3(process.env.RPC_ENDPOINT_URL!);

let restoredBlocks = 0;

const getLatestSavedBlock = () => Promise.resolve(17352900);

const subscribeToNewBlocks = (lastMinedBlock: number) => {
  setInterval(() => {
    web3.eth
      .getBlockNumber()
      .then(async (latestBlockNumber) => {
        if (lastMinedBlock !== latestBlockNumber) {
          console.log(
            `Latest block number: ${latestBlockNumber} and blocks restored are ${restoredBlocks}`
          );
        }
        lastMinedBlock = latestBlockNumber;
      })
      .catch((error) => {
        console.error(`Error retrieving latest block number: ${error}`);
      });
  }, 100);
};

const getBlockInfo = async (block: number) => {
  const infos = await web3.eth.getBlock(block);

  restoredBlocks += 1;
};

(async () => {
  const lastSavedBlock = await getLatestSavedBlock(); // 2752800
  const lastBock = await web3.eth.getBlockNumber(); // 27352865

  subscribeToNewBlocks(lastBock);

  // retrieve last block infos
  const tasks = [];

  for (let i = lastSavedBlock; i < lastBock; i++) {
    tasks.push(() => getBlockInfo(i));
  }

  await throttleAll(50, tasks);
})().catch((err) => {
  console.error(err);
});
