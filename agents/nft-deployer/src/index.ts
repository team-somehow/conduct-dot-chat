import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { CHAIN_EXPLORERS, getNetworkName } from "../../constants";

dotenv.config();

const app = express();
const port = process.env.PORT || 7031;

app.use(express.json());

// Agent metadata - static information for MAHA protocol
const AGENT_META = {
  name: "NFT Deployer Agent",
  description:
    "Deploy and mint NFTs with custom metadata, collection names, and recipient addresses",
  wallet: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e", // Replace with actual wallet
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        maxLength: 100,
        description: "Name of the NFT collection",
      },
      symbol: {
        type: "string",
        maxLength: 20,
        description: "Symbol of the NFT collection",
      },
      chainId: {
        type: "number",
        description: "Chain ID where the NFT will be deployed",
        enum: [545, 747, 11155111],
      },
      mints: {
        type: "array",
        items: {
          type: "object",
          properties: {
            to: {
              type: "string",
              pattern: "^0x[a-fA-F0-9]{40}$",
              description: "Ethereum address of the NFT recipient",
            },
            metadataUrl: {
              type: "string",
              description:
                "Metadata URL (e.g., HTTPS, HTTP) for the NFT to mint. The metadata URL should be a valid URL that points to the NFT metadata JSON file coming from the NFT Metadata Creator Agent.",
            },
          },
          required: ["to", "metadataUrl"],
        },
        description:
          "Array of NFTs to mint with their recipients and metadata URLs",
        minItems: 1,
      },
    },
    required: ["name", "symbol", "chainId", "mints"],
  },
  outputSchema: {
    type: "object",
    properties: {
      contractAddress: {
        type: "string",
        description: "Address of the deployed NFT contract",
      },
      name: {
        type: "string",
        description: "Name of the NFT collection",
      },
      symbol: {
        type: "string",
        description: "Symbol of the NFT collection",
      },
      chainId: {
        type: "number",
        description: "Chain ID where the NFT was deployed",
      },
      mints: {
        type: "array",
        items: {
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
            tokenURI: {
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
            "tokenURI",
            "explorerUrl",
            "timestamp",
          ],
        },
      },
    },
    required: ["contractAddress", "name", "symbol", "chainId", "mints"],
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
    const { name, symbol, mints, chainId } = req.body;

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
      if (!mint.metadataUrl || typeof mint.metadataUrl !== "string") {
        return res.status(400).json({
          error:
            "Invalid input: each mint must have a 'metadataUrl' (the NFT metadata URL)",
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

    // Set the Hardhat network programmatically before importing ethers
    const networkName = getNetworkName(chainId);
    process.env.HARDHAT_NETWORK = networkName;
    // Dynamically import ethers from hardhat after setting the network
    const { ethers } = require("hardhat");
    // Pass ethers to deploy/mint scripts
    const { deployNFT } = require("../scripts/deploy");
    const { mintNFT } = require("../scripts/mint");

    console.log(
      `🎨 Deploying NFT contract: ${name} (${symbol}) on chain ${chainId}`
    );

    // Deploy NFT contract
    const nftContract = await deployNFT(name, symbol, ethers);
    const contractAddress = await nftContract.getAddress();

    console.log(`📋 Contract deployed to: ${contractAddress}`);
    console.log(`🎯 Minting ${mints.length} NFTs...`);

    // Mint NFTs
    const results = [];
    for (const mint of mints) {
      try {
        console.log(
          `Minting to ${mint.to} with metadataUrl (NFT metadata): ${mint.metadataUrl}`
        );
        const txHash = await mintNFT(
          nftContract,
          mint.to,
          mint.metadataUrl,
          ethers
        );

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
        const event = receipt.logs.find((log: any) => {
          try {
            const parsedLog = log as unknown as { fragment?: { name: string } };
            return parsedLog.fragment?.name === "Transfer";
          } catch {
            return false;
          }
        });

        const tokenId = event
          ? (
              event as unknown as { args: [string, string, string] }
            ).args[2].toString()
          : "0";

        results.push({
          transactionHash: txHash,
          tokenId: tokenId,
          contractAddress: contractAddress,
          recipientAddress: mint.to,
          tokenURI: mint.metadataUrl,
          explorerUrl: `${CHAIN_EXPLORERS[chainId]}/tx/${txHash}`,
          timestamp: new Date().toISOString(),
        });
      } catch (mintError: any) {
        console.error(`Error minting NFT to ${mint.to}:`, mintError);
        results.push({
          transactionHash: null,
          tokenId: null,
          contractAddress: contractAddress,
          recipientAddress: mint.to,
          tokenURI: mint.metadataUrl,
          explorerUrl: null,
          timestamp: new Date().toISOString(),
          error: mintError?.message || "Unknown error during minting",
        });
      }
    }

    if (
      results.filter((result: any) => result.transactionHash !== null).length >
      0
    ) {
      console.log(`✅ Successfully minted ${results.length} NFTs!`);
    } else {
      console.log(`❌ Failed to mint any NFTs`);
    }

    res.json({
      contractAddress,
      name,
      symbol,
      chainId,
      mints: results,
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
