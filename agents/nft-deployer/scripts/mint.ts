// ethers will be passed in
import { NFT } from "../typechain-types";

export async function mintNFT(nft: NFT, to: string, metadataUrl: string, ethers: any) {
  try {
    const nftContract = await ethers.getContractAt("NFT", nft.target);
    console.log("🔑 Minting NFT to:", to, "with metadataUrl:", metadataUrl, "on contract:", nft.target);
    const tx = await nftContract.mint(to, metadataUrl);
    return tx.hash;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function mintBatchNFT(nft: any, targets: [string, string][], ethers: any) {
  const results = await Promise.allSettled(
    targets.map(async (target) => {
      await mintNFT(nft, target[0], target[1], ethers);
    })
  );
  return results.map((result) => result.status === "fulfilled");
}
