import express, { Request, Response } from "express";

const app = express();
const port = process.env.PORT || 7029;

app.use(express.json());

// Agent metadata - static information for MAHA protocol
const AGENT_META = {
  name: "Hello World Agent",
  description: "A simple greeting agent that personalizes hello messages",
  wallet: "0xAafc05f526199376998D2F16e6c275f8019cc72f", // Replace with actual wallet
  vendor: "MAHA Labs",
  category: "Text",
  tags: ["text", "greeting", "personalization", "multilingual"],
  pricing: {
    model: "per_request",
    amount: 0.05,
    currency: "USD",
    unit: "request",
  },
  rating: {
    score: 4.8,
    reviews: 1247,
    lastUpdated: "2024-01-15T00:00:00Z",
  },
  performance: {
    avgResponseTime: 120,
    uptime: 99.9,
    successRate: 99.8,
  },
  inputSchema: {
    type: "object",
    properties: {
      name: {
        type: "string",
        maxLength: 100,
        description: "Name to greet",
      },
      language: {
        type: "string",
        enum: ["english", "spanish", "french", "german"],
        default: "english",
        description: "Language for the greeting",
      },
    },
    required: ["name"],
  },
  outputSchema: {
    type: "object",
    properties: {
      greeting: {
        type: "string",
        description: "The personalized greeting message",
      },
      language: {
        type: "string",
        description: "Language used for the greeting",
      },
      timestamp: {
        type: "string",
        format: "date-time",
        description: "When the greeting was generated",
      },
    },
    required: ["greeting", "language", "timestamp"],
  },
  previewURI: "ipfs://QmHelloAgentPreview123",
};

// GET /meta - Return agent metadata (MAHA contract requirement)
app.get("/meta", (req: Request, res: Response) => {
  res.json(AGENT_META);
});

// POST /run - Execute the agent logic (MAHA contract requirement)
app.post("/run", async (req: Request, res: Response) => {
  try {
    const { name, language = "english" } = req.body;

    // Validate input
    if (!name || typeof name !== "string") {
      return res.status(400).json({
        error: "Invalid input: name is required and must be a string",
      });
    }

    if (name.length > 100) {
      return res.status(400).json({
        error: "Invalid input: name must be 100 characters or less",
      });
    }

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 50));

    // Generate greeting based on language
    let greeting;
    switch (language) {
      case "spanish":
        greeting = `¡Hola, ${name}! ¿Cómo estás?`;
        break;
      case "french":
        greeting = `Bonjour, ${name}! Comment allez-vous?`;
        break;
      case "german":
        greeting = `Hallo, ${name}! Wie geht es Ihnen?`;
        break;
      case "english":
      default:
        greeting = `Hello, ${name}! How are you doing today?`;
    }

    // Return result matching output schema
    const result = {
      greeting,
      language,
      timestamp: new Date().toISOString(),
    };

    console.log(`Generated greeting for ${name} in ${language}: ${greeting}`);
    res.json(result);
  } catch (error: any) {
    console.error("Processing error:", error);
    res.status(500).json({
      error: "Internal processing error",
      details: error.message,
    });
  }
});

// Health check endpoint (optional but recommended)
app.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Legacy endpoint for backward compatibility
app.get("/", (req: Request, res: Response) => {
  res.json({
    message: "Hello World Agent - MAHA Protocol Compatible",
    endpoints: {
      meta: "/meta",
      run: "/run (POST)",
      health: "/health",
    },
  });
});

// Start server
app.listen(port, () => {
  console.log(`🤖 Hello World Agent running on port ${port}`);
  console.log(`📋 Metadata: http://localhost:${port}/meta`);
  console.log(`🏃 Execute: POST http://localhost:${port}/run`);
  console.log(`❤️  Health: http://localhost:${port}/health`);
  console.log(`🌍 Legacy: http://localhost:${port}/`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 Shutting down gracefully...");
  process.exit(0);
});
