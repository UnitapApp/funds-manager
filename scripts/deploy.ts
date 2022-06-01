import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

async function deploy() {
  let admin: SignerWithAddress;
  [admin] = await ethers.getSigners();
  let factory = await ethers.getContractFactory("Manager");
  console.log("Deploying manager...");
  let manager = await factory.deploy(
    BigNumber.from(86400), // one day
    ethers.utils.parseEther("1"), // 1 ether
    admin.address,
    admin.address
  );
  console.log("Manager Deployed at ", manager.address);
}

deploy()
  .then(() => process.exit())
  .catch(console.log);
