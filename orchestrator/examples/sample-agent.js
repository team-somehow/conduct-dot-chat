// examples/sample-agent.js
// Example implementation of a compliant MAHA agent

const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Agent metadata - static information
const AGENT_META = {
  name: "Sample Text Processor",
  description: "A simple text processing agent that converts text to uppercase",
  wallet: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e", // Replace with actual wallet
  inputSchema: {
    type: "object",
    properties: {
      text: {
        type: "string",
        maxLength: 1000,
        description: "Text to process",
      },
      operation: {
        type: "string",
        enum: ["uppercase", "lowercase", "reverse"],
        default: "uppercase",
        description: "Operation to perform",
      },
    },
    required: ["text"],
  },
  outputSchema: {
    type: "object",
    properties: {
      processedText: {
        type: "string",
        description: "The processed text result",
      },
      operation: {
        type: "string",
        description: "The operation that was performed",
      },
      originalLength: {
        type: "number",
        description: "Length of original text",
      },
    },
    required: ["processedText", "operation", "originalLength"],
  },
  previewURI: "ipfs://QmSamplePreviewHash123",
};

// GET /meta - Return agent metadata
app.get("/meta", (req, res) => {
  res.json(AGENT_META);
});

// POST /run - Execute the agent logic
app.post("/run", async (req, res) => {
  try {
    const { text, operation = "uppercase" } = req.body;

    // Validate input (basic validation - in production use AJV)
    if (!text || typeof text !== "string") {
      return res.status(400).json({
        error: "Invalid input: text is required and must be a string",
      });
    }

    if (text.length > 1000) {
      return res.status(400).json({
        error: "Invalid input: text must be 1000 characters or less",
      });
    }

    // Simulate some processing time
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Perform the operation
    let processedText;
    switch (operation) {
      case "uppercase":
        processedText = text.toUpperCase();
        break;
      case "lowercase":
        processedText = text.toLowerCase();
        break;
      case "reverse":
        processedText = text.split("").reverse().join("");
        break;
      default:
        processedText = text.toUpperCase();
    }

    // Return result matching output schema
    const result = {
      processedText,
      operation,
      originalLength: text.length,
    };

    console.log(`Processed: "${text}" -> "${processedText}" (${operation})`);
    res.json(result);
  } catch (error) {
    console.error("Processing error:", error);
    res.status(500).json({
      error: "Internal processing error",
      details: error.message,
    });
  }
});

// Health check endpoint (optional but recommended)
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Start server
app.listen(port, () => {
  console.log(`🤖 Sample agent running on port ${port}`);
  console.log(`📋 Metadata: http://localhost:${port}/meta`);
  console.log(`🏃 Execute: POST http://localhost:${port}/run`);
  console.log(`❤️  Health: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("👋 Shutting down gracefully...");
  process.exit(0);
});

/* 
Usage:
1. npm install express
2. node sample-agent.js
3. Test with curl:

# Get metadata
curl http://localhost:3000/meta

# Run agent
curl -X POST http://localhost:3000/run \
  -H "Content-Type: application/json" \
  -d '{"text": "hello world", "operation": "uppercase"}'

# Health check
curl http://localhost:3000/health
*/
