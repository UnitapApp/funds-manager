import { network, ethers } from "hardhat";
async function getCurrentTimeStamp(): Promise<number> {
  const blockNumBefore = await ethers.provider.getBlockNumber();
  const blockBefore = await ethers.provider.getBlock(blockNumBefore);
  return blockBefore.timestamp;
}
async function increaseTime(increaseAmount: number) {
  let before = await getCurrentTimeStamp();
  await network.provider.send("evm_mine", [before + increaseAmount]);
}

export { getCurrentTimeStamp, increaseTime };
