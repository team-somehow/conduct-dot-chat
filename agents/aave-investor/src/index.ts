import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { CHAIN_EXPLORERS, getNetworkName, AAVE_CONFIG } from "../../constants";

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(express.json());

// Agent metadata - static information for MAHA protocol
const AGENT_META = {
  name: "Aave Investor Agent",
  description:
    "Deposit or withdraw tokens into Aave V3 via a simple API. Supports deposit and withdraw actions for a user.",
  wallet: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e", // Replace with actual agent wallet if needed
  inputSchema: {
    type: "object",
    properties: {
      action: {
        type: "string",
        enum: ["deposit", "withdraw"],
        description: "Action to perform: deposit or withdraw",
      },
      chainId: {
        type: "number",
        description: "Chain ID where the contract is deployed",
        enum: [11155111], // Only Sepolia supported in config
      },
      userAddress: {
        type: "string",
        pattern: "^0x[a-fA-F0-9]{40}$",
        description: "Ethereum address of the user performing the action",
      },
      amount: {
        type: "number",
        description: "Amount of tokens to deposit (required for deposit)",
        minimum: 0.00000001,
      },
    },
    required: ["action", "chainId", "userAddress"],
    allOf: [
      {
        if: { properties: { action: { const: "deposit" } } },
        then: { required: ["amount"] },
      },
    ],
  },
  outputSchema: {
    type: "object",
    properties: {
      action: { type: "string", enum: ["deposit", "withdraw"] },
      transactionHash: { type: "string", description: "Transaction hash" },
      userAddress: { type: "string", description: "User address" },
      amount: { type: "string", description: "Amount deposited/withdrawn" },
      contractAddress: { type: "string", description: "AaveInvestor contract address" },
      explorerUrl: { type: "string", description: "Block explorer URL for the transaction" },
      timestamp: { type: "string", format: "date-time", description: "When the action was performed" },
    },
    required: ["action", "transactionHash", "userAddress", "amount", "contractAddress", "explorerUrl", "timestamp"],
  },
  previewURI: "ipfs://QmAaveInvestorAgentPreview123",
};

// GET /meta - Return agent metadata (MAHA contract requirement)
app.get("/meta", (req: Request, res: Response) => {
  res.json(AGENT_META);
});

// POST /run - Execute the agent logic (MAHA contract requirement)
app.post("/run", async (req: Request, res: Response) => {
  try {
    const { action, chainId, userAddress, amount } = req.body;
    // Validate input
    if (!action || !["deposit", "withdraw"].includes(action)) {
      return res.status(400).json({ error: "Invalid input: action must be 'deposit' or 'withdraw'" });
    }
    if (!chainId || typeof chainId !== "number" || !CHAIN_EXPLORERS[chainId]) {
      return res.status(400).json({ error: `Invalid input: chainId ${chainId} is not supported` });
    }
    if (!userAddress || typeof userAddress !== "string" || !/^0x[a-fA-F0-9]{40}$/.test(userAddress)) {
      return res.status(400).json({ error: `Invalid input: userAddress is not a valid Ethereum address` });
    }
    if (action === "deposit" && (typeof amount !== "number" || amount <= 0)) {
      return res.status(400).json({ error: "Invalid input: amount must be a positive number for deposit" });
    }

    // Set Hardhat network
    const networkName = getNetworkName(chainId);
    process.env.HARDHAT_NETWORK = networkName;
    const { ethers } = require("hardhat");

    // Load deployed contract address
    const deployment = require(`../deployments/aave-investor_${chainId}.json`);
    const contractAddress = deployment.address;
    const contract = await ethers.getContractAt("AaveInvestor", contractAddress);

    // Prepare signer (simulate as userAddress, for demo use first signer)
    // In real use, you'd use a relayer or have user sign tx client-side
    const [signer] = await ethers.getSigners();
    // Optionally: const signer = await ethers.getSigner(userAddress);

    let tx, txReceipt, txHash, resultAmount;
    if (action === "deposit") {
      // Approve token transfer first
      const tokenAddress = AAVE_CONFIG[chainId].token;
      const token = await ethers.getContractAt("IERC20", tokenAddress);
      const decimals = 18; // For LINK on Sepolia, adjust if needed
      const parsedAmount = ethers.parseUnits(amount.toString(), decimals);
      await token.approve(contractAddress, parsedAmount);
      tx = await contract.deposit(parsedAmount);
      txReceipt = await tx.wait();
      txHash = tx.hash;
      resultAmount = amount.toString();
    } else if (action === "withdraw") {
      tx = await contract.withdrawAll();
      txReceipt = await tx.wait();
      txHash = tx.hash;
      // Get withdrawn amount from event logs if possible
      const event = txReceipt.logs.find((log: any) => log.fragment && log.fragment.name === "Withdraw");
      resultAmount = event ? event.args[1].toString() : "0";
    }

    res.json({
      action,
      transactionHash: txHash,
      userAddress,
      amount: resultAmount,
      contractAddress,
      explorerUrl: `${CHAIN_EXPLORERS[chainId]}/tx/${txHash}`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("AaveInvestor agent error:", error);
    res.status(500).json({ error: "AaveInvestor action failed", details: error.message });
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
  console.log(`🚀 Aave Investor Agent running on port ${port}`);
  console.log(`📋 Metadata: http://localhost:${port}/meta`);
  console.log(`🎨 Deposit or withdraw: POST http://localhost:${port}/run`);
  console.log(`❤️  Health: http://localhost:${port}/health`);
  console.log(`🌍 Info: http://localhost:${port}/`);
  console.log(`\n🎯 Ready to deposit or withdraw!`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 Shutting down NFT Deployer Agent gracefully...");
  process.exit(0);
});
