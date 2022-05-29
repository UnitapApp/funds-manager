import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";
import { deployManager } from "../scripts/deployHelpers";
import { ERC20, Manager } from "../typechain";
import { increaseTime } from "./timeUtils";

let week = 86400 * 7;
let tenTokens = ethers.utils.parseEther("10");
let fiveTokens = ethers.utils.parseEther("5");

describe("Manager", async () => {
  let manager: Manager;
  let token: ERC20;

  let period: BigNumber = BigNumber.from(week);
  let periodicMaxCap: BigNumber = tenTokens;

  let tokenPeriod: BigNumber = BigNumber.from(week);
  let tokenPeriodicMaxCap: BigNumber = fiveTokens;

  let admin: SignerWithAddress;
  let unitap: SignerWithAddress;
  let user: SignerWithAddress;
  let emergencyUser: SignerWithAddress;

  before(async () => {
    [admin, unitap, user, emergencyUser] = await ethers.getSigners();
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

    let tokenFactory = await ethers.getContractFactory("TestToken");
    token = await tokenFactory.deploy();
    await token.deployed();
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
  it("should allow unitap to withdraw funds in the next period", async () => {
    await increaseTime(period.toNumber());
    await manager.connect(unitap).withdraw(periodicMaxCap, user.address);
  });
  it("it should not allow non-admin role to emergency withdraw", async () => {
    let withdraw = manager
      .connect(user)
      .withdraw(fiveTokens, emergencyUser.address);

    await expect(withdraw).to.be.reverted;
  });
  it("should withdraw funds if admin role", async () => {
    let beforeBalance = await emergencyUser.getBalance();
    let amount = ethers.utils.parseEther("5");
    await manager.connect(admin).withdraw(amount, emergencyUser.address);
    let afterBalance = await emergencyUser.getBalance();
    expect(afterBalance.sub(beforeBalance)).eq(amount);
  });
  it("should get erc20 period and max periodic cap", async () => {
    let tokenPeriod = await manager.erc20Periods(token.address);
    let tokenPeriodicMaxCap = await manager.erc20PeriodicMaxCap(token.address);
    let tokenWithrdrawals = await manager.erc20Withdrawals(token.address);
    expect(tokenPeriod).eq(0);
    expect(tokenWithrdrawals).eq(0);
    expect(tokenPeriodicMaxCap).eq(0);
  });
  it("should not allow non-unitap user to withdraw", async () => {
    let withdraw = manager
      .connect(user)
      .withdrawErc20(token.address, BigNumber.from(100), user.address);
    await expect(withdraw).to.be.reverted;
  });
  it("should not allow non-admin user to set erc20 params", async () => {
    let setParams = manager
      .connect(user)
      .setErc20Params(token.address, tokenPeriod, tokenPeriodicMaxCap);
    await expect(setParams).to.be.reverted;
  });
  it("should allow admin to set erc20 params", async () => {
    await manager.setErc20Params(
      token.address,
      tokenPeriod,
      tokenPeriodicMaxCap
    );
    let tokenPeriod_ = await manager.erc20Periods(token.address);
    let tokenPeriodicMaxCap_ = await manager.erc20PeriodicMaxCap(token.address);

    expect(tokenPeriod).eq(tokenPeriod_);
    expect(tokenPeriodicMaxCap).eq(tokenPeriodicMaxCap_);
  });
});
