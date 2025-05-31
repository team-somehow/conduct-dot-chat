import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy("Test NFT", "TEST-NFT", deployer.address);

  await nft.waitForDeployment();

  console.log("NFT contract deployed to:", await nft.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  }); 