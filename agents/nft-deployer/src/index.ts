import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { deployNFT } from "../scripts/deploy";
import { mintNFT } from "../scripts/mint";
import { ethers } from "hardhat";
import { Log } from "ethers";

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());

// Chain explorer URLs mapping
const CHAIN_EXPLORERS: { [chainId: number]: string } = {
  1: "https://etherscan.io",      // Ethereum Mainnet
  5: "https://goerli.etherscan.io", // Goerli Testnet
  137: "https://polygonscan.com",  // Polygon Mainnet
  80001: "https://mumbai.polygonscan.com", // Mumbai Testnet
  42161: "https://arbiscan.io",    // Arbitrum One
  421613: "https://goerli.arbiscan.io", // Arbitrum Goerli
  10: "https://optimistic.etherscan.io", // Optimism
  420: "https://goerli-optimism.etherscan.io", // Optimism Goerli
  56: "https://bscscan.com",       // BSC
  97: "https://testnet.bscscan.com", // BSC Testnet
  43114: "https://snowtrace.io",   // Avalanche
  43113: "https://testnet.snowtrace.io", // Avalanche Testnet
};

// Agent metadata - static information for MAHA protocol
const AGENT_META = {
  name: "NFT Deployer Agent",
  description:
    "Deploy and mint NFTs with custom metadata, collection names, and recipient addresses",
  wallet: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e", // Replace with actual wallet
  inputSchema: {
    type: "object",
    properties: {
      imageUrl: {
        type: "string",
        format: "uri",
        description: "URL of the image to be used for the NFT",
      },
      collectionName: {
        type: "string",
        maxLength: 100,
        description: "Name of the NFT collection",
      },
      recipientAddress: {
        type: "string",
        pattern: "^0x[a-fA-F0-9]{40}$",
        description: "Ethereum address of the NFT recipient",
      },
      tokenName: {
        type: "string",
        maxLength: 100,
        description: "Name of the individual NFT token",
        default: "Thank You NFT",
      },
      description: {
        type: "string",
        maxLength: 500,
        description: "Description of the NFT",
        default: "A special NFT to commemorate your participation",
      },
      attributes: {
        type: "array",
        items: {
          type: "object",
          properties: {
            trait_type: { type: "string" },
            value: { type: "string" },
          },
        },
        description: "Optional attributes for the NFT",
        default: [],
      },
    },
    required: ["imageUrl", "collectionName", "recipientAddress"],
  },
  outputSchema: {
    type: "object",
    properties: {
      transactionHash: {
        type: "string",
        description: "Transaction hash of the NFT mint",
      },
      tokenId: {
        type: "string",
        description: "ID of the minted token",
      },
      contractAddress: {
        type: "string",
        description: "Address of the NFT contract",
      },
      recipientAddress: {
        type: "string",
        description: "Address that received the NFT",
      },
      collectionName: {
        type: "string",
        description: "Name of the collection",
      },
      tokenName: {
        type: "string",
        description: "Name of the token",
      },
      metadataUri: {
        type: "string",
        description: "URI of the token metadata",
      },
      explorerUrl: {
        type: "string",
        description: "Block explorer URL for the transaction",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        description: "When the NFT was minted",
      },
    },
    required: [
      "transactionHash",
      "tokenId",
      "contractAddress",
      "recipientAddress",
      "collectionName",
      "tokenName",
      "metadataUri",
      "explorerUrl",
      "timestamp",
    ],
  },
  previewURI: "ipfs://QmNFTDeployerAgentPreview123",
};

// GET /meta - Return agent metadata (MAHA contract requirement)
app.get("/meta", (req: Request, res: Response) => {
  res.json(AGENT_META);
});

// POST /run - Execute the agent logic (MAHA contract requirement)
app.post("/run", async (req: Request, res: Response) => {
  try {
    const {
      name,
      symbol,
      mints,
      chainId,
    } = req.body;

    // Validate required inputs
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        error: "Invalid input: name is required and must be a string",
      });
    }

    if (!symbol || typeof symbol !== "string") {
      return res.status(400).json({
        error: "Invalid input: symbol is required and must be a string",
      });
    }

    if (!chainId || typeof chainId !== "number") {
      return res.status(400).json({
        error: "Invalid input: chainId is required and must be a number",
      });
    }

    if (!CHAIN_EXPLORERS[chainId]) {
      return res.status(400).json({
        error: `Invalid input: chainId ${chainId} is not supported`,
      });
    }

    if (!mints || !Array.isArray(mints) || mints.length === 0) {
      return res.status(400).json({
        error: "Invalid input: mints must be a non-empty array",
      });
    }

    // Validate each mint entry
    for (const mint of mints) {
      if (!mint.to || typeof mint.to !== "string") {
        return res.status(400).json({
          error: "Invalid input: each mint must have a 'to' address",
        });
      }
      if (!mint.tokenURI || typeof mint.tokenURI !== "string") {
        return res.status(400).json({
          error: "Invalid input: each mint must have a 'tokenURI'",
        });
      }
      // Validate Ethereum address format
      const addressRegex = /^0x[a-fA-F0-9]{40}$/;
      if (!addressRegex.test(mint.to)) {
        return res.status(400).json({
          error: `Invalid input: ${mint.to} is not a valid Ethereum address`,
        });
      }
    }

    console.log(`🎨 Deploying NFT contract: ${name} (${symbol}) on chain ${chainId}`);
    
    // Deploy NFT contract
    const nftContract = await deployNFT(name, symbol);
    const contractAddress = await nftContract.getAddress();
    
    console.log(`📋 Contract deployed to: ${contractAddress}`);
    console.log(`🎯 Minting ${mints.length} NFTs...`);

    // Mint NFTs
    const results = [];
    for (const mint of mints) {
      console.log(`Minting to ${mint.to} with URI ${mint.tokenURI}`);
      const txHash = await mintNFT(nftContract, mint.to, mint.tokenURI);
      
      if (!txHash) {
        throw new Error(`Failed to mint NFT to ${mint.to}`);
      }

      // Get transaction details
      const tx = await ethers.provider.getTransaction(txHash);
      if (!tx) {
        throw new Error("Failed to get transaction details");
      }
      
      const receipt = await tx.wait();
      if (!receipt) {
        throw new Error("Failed to get transaction receipt");
      }
      
      // Get token ID from event logs
      const event = receipt.logs.find(log => {
        try {
          const parsedLog = log as unknown as { fragment?: { name: string } };
          return parsedLog.fragment?.name === 'Transfer';
        } catch {
          return false;
        }
      });
      
      const tokenId = event ? (event as unknown as { args: [string, string, string] }).args[2].toString() : '0';

      results.push({
        transactionHash: txHash,
        tokenId: tokenId,
        contractAddress: contractAddress,
        recipientAddress: mint.to,
        tokenURI: mint.tokenURI,
        explorerUrl: `${CHAIN_EXPLORERS[chainId]}/tx/${txHash}`,
        timestamp: new Date().toISOString(),
      });
    }

    console.log(`✅ Successfully minted ${results.length} NFTs!`);

    res.json({
      contractAddress,
      name,
      symbol,
      chainId,
      mints: results
    });
  } catch (error: any) {
    console.error("NFT deployment error:", error);
    res.status(500).json({
      error: "NFT deployment failed",
      details: error.message,
    });
  }
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "NFT Deployer Agent",
    blockchain: "Ethereum (Demo Mode)",
  });
});

// Legacy endpoint for backward compatibility
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "NFT Deployer Agent - MAHA Protocol Compatible",
    endpoints: {
      meta: "/meta",
      run: "/run (POST)",
      health: "/health",
    },
    capabilities: [
      "NFT Collection Creation",
      "Token Minting",
      "Metadata Management",
      "Multi-chain Support (Demo)",
    ],
  });
});

// Start server
app.listen(port, () => {
  console.log(`🚀 NFT Deployer Agent running on port ${port}`);
  console.log(`📋 Metadata: http://localhost:${port}/meta`);
  console.log(`🎨 Deploy NFT: POST http://localhost:${port}/run`);
  console.log(`❤️  Health: http://localhost:${port}/health`);
  console.log(`🌍 Info: http://localhost:${port}/`);
  console.log(`\n🎯 Ready to deploy NFTs!`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 Shutting down NFT Deployer Agent gracefully...");
  process.exit(0);
});
