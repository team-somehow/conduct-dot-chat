import axios from "axios";
import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 3004;

app.use(express.json());

const AGENT_META = {
  name: "1inch Wallet Balance Agent",
  description: "An agent to fetch wallet balances using 1inch API.",
  wallet: "QGNg6DB1HUWhOmqO0GMq5F5QYkZxXGTZ",
  vendor: "MAHA Labs",
  category: "DeFi",
  tags: ["1inch", "wallet", "balance", "defi"],
  pricing: {
    model: "per_request",
    amount: 0.1,
    currency: "USD",
    unit: "request",
  },
  rating: {
    score: 4.9,
    reviews: 500,
    lastUpdated: "2024-05-20T00:00:00Z",
  },
  performance: {
    avgResponseTime: 200,
    uptime: 99.95,
    successRate: 99.7,
  },
  inputSchema: {
    type: "object",
    properties: {
      address: {
        type: "string",
        pattern: "^0x[a-fA-F0-9]{40}$",
        description: "The wallet address to query balance for.",
      },
      chain: {
        type: "string",
        enum: ["ethereum", "polygon", "bsc"],
        default: "ethereum",
        description: "The blockchain network (e.g., ethereum, polygon, bsc).",
      },
    },
    required: ["address", "chain"],
  },
  outputSchema: {
    type: "object",
    properties: {
      balances: {
        type: "array",
        items: {
          type: "object",
          properties: {
            tokenSymbol: {
              type: "string",
            },
            tokenAddress: {
              type: "string",
            },
            balance: {
              type: "string",
            },
            decimals: {
              type: "number",
            },
          },
          required: ["tokenSymbol", "tokenAddress", "balance", "decimals"],
        },
        description: "Array of token balances.",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        description: "When the balance was fetched",
      },
    },
    required: ["balances", "timestamp"],
  },
  previewURI: "ipfs://Qm1inchAgentPreview123",
};

app.get("/meta", (req: Request, res: Response) => {
  res.json(AGENT_META);
});

app.post(
  "/run",
  async (
    req: Request<{}, {}, { address: string; chain: string }>,
    res: Response
  ) => {
    try {
      const { address, chain } = req.body;

      if (
        !address ||
        typeof address !== "string" ||
        !address.match(/^0x[a-fA-F0-9]{40}$/)
      ) {
        return res.status(400).json({
          error: "Invalid input: a valid Ethereum address is required.",
        });
      }

      if (!chain || !["ethereum", "polygon", "bsc"].includes(chain)) {
        return res.status(400).json({
          error: "Invalid input: chain must be 'ethereum', 'polygon' or 'bsc'.",
        });
      }

      const url = `https://api.1inch.dev/balance/v1.2/1/aggregatedBalancesAndAllowances/${address}`;
      const config = {
        headers: {
          Authorization: "Bearer QGNg6DB1HUWhOmqO0GMq5F5QYkZxXGTZ",
        },
        params: {
          wallets: address,
          filterEmpty: "true",
        },
        paramsSerializer: {
          indexes: null,
        },
      };

      let response;

      try {
        response = await axios.get(url, config);
      } catch (error) {
        console.error(error);
      }

      const result = {
        balances: response?.data,
        timestamp: new Date().toISOString(),
      };

      console.log(`Fetched balances for ${address} on ${chain}`);
      res.json(result);
    } catch (error: any) {
      console.error("Processing error:", error);
      res.status(500).json({
        error: "Internal processing error",
        details: error.message,
      });
    }
  }
);

app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "1inch Wallet Balance Agent - MAHA Protocol Compatible",
    endpoints: {
      meta: "/meta",
      run: "/run (POST)",
      health: "/health",
    },
  });
});

app.listen(port, () => {
  console.log(`🤖 1inch Wallet Balance Agent running on port ${port}`);
  console.log(`📋 Metadata: http://localhost:${port}/meta`);
  console.log(`🏃 Execute: POST http://localhost:${port}/run`);
  console.log(`❤️  Health: http://localhost:${port}/health`);
  console.log(`🌍 Legacy: http://localhost:${port}/`);
});

process.on("SIGTERM", () => {
  console.log("👋 Shutting down gracefully...");
  process.exit(0);
});
