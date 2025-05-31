import { ethers } from "hardhat";
import { AAVE_CONFIG } from "../../constants";
import IERC20Artifact from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

async function testDeposit() {
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

  const ERC20TokenContract = new ethers.Contract(
    AAVE_CONFIG[11155111].token,
    IERC20Artifact.abi,
    wallet
  );

  // 1. Approve the contract to spend tokens
  const approveTx = await ERC20TokenContract.approve(
    aaveInvestorAddress,
    ethers.parseEther("1")
  );
  await approveTx.wait();

  // 2. Call deposit on the contract
  const depositTx = await aaveInvestor.deposit(ethers.parseEther("1"));
  await depositTx.wait();

  console.log(
    "Deposit successful from wallet ",
    wallet.address,
    " tx hash: ",
    depositTx.hash
  );
}

testDeposit();
