import { ethers, network } from "hardhat";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { AAVE_CONFIG } from "../../constants";
import path from "path";
import IERC20Artifact from "../artifacts/@openzeppelin/contracts/token/ERC20/IERC20.sol/IERC20.json";

// This I will have to deploy on Sepolia on my own,
// it won't be deployed dynamically by orchestrator
export async function deployAaveInvestor() {
  // const [deployer] = await ethers.getSigners();

  const chainId = network.config.chainId || 11155111;

  if (!AAVE_CONFIG[Number(chainId)]) {
    throw new Error(`AAVE_CONFIG not found for chainId: ${chainId}`);
  }

  const AaveInvestor = await ethers.getContractFactory("AaveInvestor");
  const aaveInvestor = await AaveInvestor.deploy(
    AAVE_CONFIG[Number(chainId)].pool,
    AAVE_CONFIG[Number(chainId)].token
  );
  await aaveInvestor.waitForDeployment();

  console.log("AaveInvestor contract deployed to:", aaveInvestor.target);

  const deployResult = {
    chainId: Number(chainId),
    networkName: network.name.toLowerCase(),
    address: await aaveInvestor.getAddress(),
  };

  // Ensure the deployments directory exists
  const deploymentsDir = path.resolve(__dirname, "../deployments");
  if (!existsSync(deploymentsDir)) {
    mkdirSync(deploymentsDir);
  }

  writeFileSync(
    `${deploymentsDir}/aave-investor_${deployResult.chainId}.json`,
    JSON.stringify(deployResult, null, 2)
  );

  return deployResult;
}

// Deploy on Aave LINK market
deployAaveInvestor();
