import { ethers } from "hardhat";

export async function mintNFT(nft: any, to: string, tokenURI: string) {
  try {
    //   const [deployer] = await ethers.getSigners();
    const nftContract = await ethers.getContractAt("NFT", nft.address);
    const tx = await nftContract.mint(to, tokenURI);

    return tx.hash;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function mintBatchNFT(nft: any, targets: [string, string][]) {
  const results = await Promise.allSettled(
    targets.map(async (target) => {
      await mintNFT(nft, target[0], target[1]);
    })
  );
  return results.map((result) => result.status === "fulfilled");
}
