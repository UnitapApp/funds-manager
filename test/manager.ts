import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { deployManager } from "../scripts/deployHelpers";
import { Manager } from "../typechain";

let week = 86400 * 7;
let tenTokens = ethers.utils.parseEther("10");

describe("Manager", async () => {
  let manager: Manager;
  let period: BigNumber = BigNumber.from(week);
  let periodicMaxCap: BigNumber = tenTokens;
  let admin: SignerWithAddress;
  let unitap: SignerWithAddress;
  let user: SignerWithAddress;

  before(async () => {
    [admin, unitap, user] = await ethers.getSigners();
    manager = await deployManager(
      BigNumber.from(86400), // one day
      ethers.utils.parseEther("1"), // one token;
      admin.address,
      unitap.address
    );

    // deposit some funds to manager contract
    await admin.sendTransaction({
      value: ethers.utils.parseEther("50"),
      to: manager.address,
    });
  });
  it("initial params should be correct", async () => {
    let period_ = await manager.period();
    let periodicMaxCap_ = await manager.periodicMaxCap();
    expect(BigNumber.from(86400)).eq(period_);
    expect(ethers.utils.parseEther("1")).eq(periodicMaxCap_);
  });
  it("should not allow non-admin user to change params", async () => {
    let change = manager
      .connect(unitap)
      .setParams(period.add(10), periodicMaxCap.add(200));
    await expect(change).to.be.reverted;
  });
  it("should allow admin to change params", async () => {
    await manager.setParams(period, periodicMaxCap);
    let period_ = await manager.period();
    let periodicMaxCap_ = await manager.periodicMaxCap();
    expect(period).eq(period_);
    expect(periodicMaxCap).eq(periodicMaxCap_);
  });
  it("should not allow non-unitap roles to withdraw funds", async () => {
    let withdraw = manager
      .connect(user)
      .withdraw(ethers.utils.parseEther("1"), user.address);
    await expect(withdraw).to.be.reverted;
  });
  it("should allow unitap to withdraw funds if less than max cap", async () => {
    let amount = ethers.utils.parseEther("1");
    let userBalanceBefore = await user.getBalance();
    await manager.connect(unitap).withdraw(amount, user.address);
    let userBalanceAfter = await user.getBalance();
    expect(userBalanceAfter.sub(userBalanceBefore)).eq(amount);
  });
  it("should not allow unitap to withdraw more than periodicMaxCap in each period", async () => {
    let withdraw = manager
      .connect(unitap)
      .withdraw(periodicMaxCap, user.address);
    await expect(withdraw).to.be.revertedWith(
      "Manager: PERIODIC_MAX_CAP_EXCEEDED"
    );
  });
});
