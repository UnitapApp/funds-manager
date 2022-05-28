import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { Manager } from "../typechain";

async function deployManager(
  period: BigNumber,
  periodicMaxCap: BigNumber,
  admin: string,
  unitap: string
): Promise<Manager> {
  let Factory = await ethers.getContractFactory("Manager");
  let manager = await Factory.deploy(period, periodicMaxCap, admin, unitap);
  await manager.deployed();
  return manager;
}

export { deployManager };
