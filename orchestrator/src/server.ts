// src/server.ts  (CLI demo)
import express, { Request, Response } from "express";
import { JobRunner } from "./JobRunner";
import { loadAgent } from "./agents.http";
import { AGENT_ENDPOINTS, config } from "./config";

const app = express();
app.use(express.json());

const jobRunner = new JobRunner();

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
  try {
    const agents = await jobRunner.discoverAgents();
    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      agents: agents.map((agent) => ({
        name: agent.name,
        url: agent.url,
        description: agent.description,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Discover available agents
app.get("/agents", async (req: Request, res: Response) => {
  try {
    const agents = await jobRunner.discoverAgents();
    res.json({
      agents: agents.map((agent) => ({
        name: agent.name,
        url: agent.url,
        description: agent.description,
        wallet: agent.wallet,
        previewURI: agent.previewURI,
      })),
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to discover agents",
      details: error.message,
    });
  }
});

// Execute a single agent task
app.post("/execute", async (req: Request, res: Response) => {
  try {
    const { agentUrl, input } = req.body;

    if (!agentUrl || !input) {
      return res.status(400).json({
        error: "Missing required fields: agentUrl, input",
      });
    }

    const result = await jobRunner.executeAgentTask(agentUrl, input);

    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Task execution failed",
      details: error.message,
    });
  }
});

// Execute a job with multiple agents
app.post("/jobs", async (req: Request, res: Response) => {
  try {
    const { jobData, agentUrls, mode = "sequential" } = req.body;

    if (!jobData || !agentUrls || !Array.isArray(agentUrls)) {
      return res.status(400).json({
        error: "Missing required fields: jobData, agentUrls (array)",
      });
    }

    const jobId = jobRunner.generateJobId();

    if (mode === "parallel") {
      const tasks = agentUrls.map((url: string) => ({
        agentUrl: url,
        input: jobData,
      }));

      const results = await jobRunner.executeParallelTasks(jobId, tasks);

      res.json({
        jobId,
        mode: "parallel",
        results,
        timestamp: new Date().toISOString(),
      });
    } else {
      // Sequential mode
      const tasks = agentUrls.map((url: string) => ({
        agentUrl: url,
        input: jobData,
      }));

      const results = await jobRunner.executeSequentialTasks(jobId, tasks);

      res.json({
        jobId,
        mode: "sequential",
        results,
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error: any) {
    res.status(500).json({
      error: "Job execution failed",
      details: error.message,
    });
  }
});

// Get agent metadata
app.get("/agents/:agentUrl/meta", async (req: Request, res: Response) => {
  try {
    const agentUrl = decodeURIComponent(req.params.agentUrl);
    const agent = await loadAgent(agentUrl);

    res.json({
      name: agent.name,
      description: agent.description,
      url: agent.url,
      wallet: agent.wallet,
      previewURI: agent.previewURI,
    });
  } catch (error: any) {
    res.status(404).json({
      error: "Agent not found or unreachable",
      details: error.message,
    });
  }
});

// CLI mode for health checks
if (process.argv[2] === "health") {
  console.log("🏥 Running health check on all agents...");

  (async () => {
    try {
      for (const endpoint of AGENT_ENDPOINTS) {
        try {
          const agent = await loadAgent(endpoint);
          console.log(`✅ ${agent.name} (${endpoint}) - healthy`);
        } catch (error: any) {
          console.log(`❌ ${endpoint} - unhealthy: ${error.message}`);
        }
      }
    } catch (error: any) {
      console.error("Health check failed:", error.message);
      process.exit(1);
    }
  })();
} else {
  // Start HTTP server
  const port = config.PORT;
  app.listen(port, () => {
    console.log(`🚀 MAHA Orchestrator running on port ${port}`);
    console.log(`📋 Health: http://localhost:${port}/health`);
    console.log(`🤖 Agents: http://localhost:${port}/agents`);
    console.log(`⚡ Execute: POST http://localhost:${port}/execute`);
    console.log(`🔄 Jobs: POST http://localhost:${port}/jobs`);
  });
}
