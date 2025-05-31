import { ethers } from "hardhat";

async function testWithdraw() {
  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY || "",
    ethers.provider
  );

  // Deploy address of AaveInvestor (not the pool)
  const aaveInvestorAddress = (
    await import("../deployments/aave-investor_11155111.json")
  ).address;

  const aaveInvestor = await ethers.getContractAt(
    "AaveInvestor",
    aaveInvestorAddress,
    wallet
  );

  console.log("Withdrawing token...");
  // Call withdraw on the contract
  const withdrawTx = await aaveInvestor.withdrawAll();
  await withdrawTx.wait();

  console.log(
    "Withdraw successful from wallet ",
    wallet.address,
    " tx hash: ",
    withdrawTx.hash
  );
}

testWithdraw();
