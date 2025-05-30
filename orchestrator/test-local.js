// test-local.js
// Simple test script to verify the orchestrator works with mock agents

const { loadAgent, runAgent } = require("./dist/agents.http");

// Mock agent server for testing
const express = require("express");
const app = express();
app.use(express.json());

const MOCK_AGENT_META = {
  name: "Test Agent",
  description: "A test agent for verification",
  wallet: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
  inputSchema: {
    type: "object",
    properties: {
      text: { type: "string" },
    },
    required: ["text"],
  },
  outputSchema: {
    type: "object",
    properties: {
      result: { type: "string" },
    },
    required: ["result"],
  },
  previewURI: "ipfs://test",
};

app.get("/meta", (req, res) => res.json(MOCK_AGENT_META));
app.post("/run", (req, res) => {
  const { text } = req.body;
  res.json({ result: `Processed: ${text}` });
});

// Start mock server
const server = app.listen(3001, async () => {
  console.log("🧪 Mock agent server running on port 3001");

  try {
    // Test agent loading
    console.log("📋 Testing agent loading...");
    const agent = await loadAgent("http://localhost:3001");
    console.log("✅ Agent loaded:", agent.name);

    // Test agent execution
    console.log("🏃 Testing agent execution...");
    const result = await runAgent(agent, { text: "hello world" });
    console.log("✅ Agent executed:", result);

    console.log("🎉 All tests passed!");
  } catch (error) {
    console.error("❌ Test failed:", error);
  } finally {
    server.close();
    process.exit(0);
  }
});

// Handle errors
process.on("unhandledRejection", (error) => {
  console.error("❌ Unhandled rejection:", error);
  server.close();
  process.exit(1);
});
