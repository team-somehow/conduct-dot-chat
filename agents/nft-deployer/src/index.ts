import express, { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

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

// Helper function to generate dummy transaction data
function generateDummyNFTData(input: any) {
  const tokenId = Math.floor(Math.random() * 10000).toString();
  const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  const contractAddress = `0x${Math.random().toString(16).substr(2, 40)}`;

  return {
    transactionHash: txHash,
    tokenId: tokenId,
    contractAddress: contractAddress,
    recipientAddress: input.recipientAddress,
    collectionName: input.collectionName,
    tokenName: input.tokenName || "Thank You NFT",
    metadataUri: `ipfs://Qm${Math.random().toString(36).substr(2, 44)}`,
    explorerUrl: `https://etherscan.io/tx/${txHash}`,
    timestamp: new Date().toISOString(),
  };
}

// POST /run - Execute the agent logic (MAHA contract requirement)
app.post("/run", async (req: Request, res: Response) => {
  try {
    const {
      imageUrl,
      collectionName,
      recipientAddress,
      tokenName = "Thank You NFT",
      description = "A special NFT to commemorate your participation",
      attributes = [],
    } = req.body;

    // Validate required inputs
    if (!imageUrl || typeof imageUrl !== "string") {
      return res.status(400).json({
        error: "Invalid input: imageUrl is required and must be a string",
      });
    }

    if (!collectionName || typeof collectionName !== "string") {
      return res.status(400).json({
        error: "Invalid input: collectionName is required and must be a string",
      });
    }

    if (!recipientAddress || typeof recipientAddress !== "string") {
      return res.status(400).json({
        error:
          "Invalid input: recipientAddress is required and must be a string",
      });
    }

    // Validate Ethereum address format
    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    if (!addressRegex.test(recipientAddress)) {
      return res.status(400).json({
        error:
          "Invalid input: recipientAddress must be a valid Ethereum address",
      });
    }

    // Validate URL format
    try {
      new URL(imageUrl);
    } catch {
      return res.status(400).json({
        error: "Invalid input: imageUrl must be a valid URL",
      });
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log(`🎨 Minting NFT for collection: ${collectionName}`);
    console.log(`📸 Image URL: ${imageUrl}`);
    console.log(`👤 Recipient: ${recipientAddress}`);
    console.log(`🏷️  Token Name: ${tokenName}`);

    // Generate dummy NFT deployment data
    const nftResult = generateDummyNFTData({
      imageUrl,
      collectionName,
      recipientAddress,
      tokenName,
      description,
      attributes,
    });

    console.log(`✅ NFT minted successfully!`);
    console.log(`📄 Transaction: ${nftResult.transactionHash}`);
    console.log(`🆔 Token ID: ${nftResult.tokenId}`);
    console.log(`📋 Contract: ${nftResult.contractAddress}`);

    res.json(nftResult);
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
