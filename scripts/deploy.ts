import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import hre from "hardhat";

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

async function deploy() {
  let admin: SignerWithAddress;
  [admin] = await ethers.getSigners();
  // let factory = await ethers.getContractFactory("Manager");
  // console.log("Deploying manager...");
  let args = [
    BigNumber.from(86400), // one day
    ethers.utils.parseEther("1"), // 1 ether
    admin.address,
    admin.address,
  ];
  // //@ts-ignore
  // let manager = await factory.deploy(...args);
  // await sleep(10000);

  await hre.run("verify:verify", {
    address: "0x0E32D9b2423c0a9D4Ba789d6f55807EE2220B4Fc",
    constructorArguments: args,
  });

  // console.log("Manager Deployed at ", manager.address);
}

deploy()
  .then(() => process.exit())
  .catch(console.log);
