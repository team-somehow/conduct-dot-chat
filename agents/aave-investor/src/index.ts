import dotenv from "dotenv";
import express, { Request, Response } from "express";
import { AAVE_CONFIG } from "../../constants";

dotenv.config();

const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());

// Agent metadata - static information for MAHA protocol
const AGENT_META = {
  name: "Aave Investor Agent",
  description:
    "Accepts an amount for Aave investment and returns the amount, chainId, and contract address.",
  inputSchema: {
    type: "object",
    properties: {
      amount: {
        type: "number",
        description: "Amount of LINK tokens to deposit in Aave",
        minimum: 0.00000001,
      },
    },
    required: ["amount"],
  },
  outputSchema: {
    type: "object",
    properties: {
      amount: { type: "number", description: "Amount invested" },
      chainId: { type: "number", description: "Chain ID (Sepolia)" },
      contractAddress: {
        type: "string",
        description: "Aave Pool contract address",
      },
    },
    required: ["amount", "chainId", "contractAddress"],
  },
  previewURI: "ipfs://QmAaveInvestorAgentPreview123",
};

// POST /run - Minimal endpoint for Aave investment
app.post("/run", (req: Request, res: Response) => {
  const { amount } = req.body;
  if (typeof amount !== "number" || amount <= 0) {
    return res
      .status(400)
      .json({ error: "Invalid input: amount must be a positive number" });
  }
  // Only Sepolia supported
  const chainId = 11155111;
  const contractAddress = AAVE_CONFIG[chainId].pool;
  res.json({
    amount,
    chainId,
    contractAddress,
  });
});

// GET /meta - Return agent metadata
app.get("/meta", (req: Request, res: Response) => {
  res.json(AGENT_META);
});

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    service: "Aave Investor Agent",
  });
});

// Legacy endpoint for backward compatibility
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Aave Investor Agent - MAHA Protocol Compatible",
    endpoints: {
      meta: "/meta",
      run: "/run (POST)",
      health: "/health",
    },
    capabilities: [
      "Aave Investment",
      "Minimal Input/Output",
      "MAHA Protocol Metadata",
    ],
  });
});

app.listen(port, () => {
  console.log(`🚀 Minimal Aave Investor Agent running on port ${port}`);
});
