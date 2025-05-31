// ethers will be passed in

// async function main() {
//   const [deployer] = await ethers.getSigners();
//   console.log("Deploying contracts with the account:", deployer.address);

//   const NFT = await ethers.getContractFactory("NFT");
//   const nft = await NFT.deploy("Test NFT", "TEST-NFT", deployer.address);

//   await nft.waitForDeployment();

//   console.log("NFT contract deployed to:", await nft.getAddress());
// }

export async function deployNFT(name: string, symbol: string, ethers: any) {
  const [deployer] = await ethers.getSigners();
  
  const NFT = await ethers.getContractFactory("NFT");
  const nft = await NFT.deploy(name, symbol, deployer.address);
  await nft.waitForDeployment();

  console.log("NFT contract deployed to:", await nft.getAddress());

  return nft;
}

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
