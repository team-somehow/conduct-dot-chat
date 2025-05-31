// src/server.ts  (CLI demo)
import express, { Request, Response } from "express";
import { JobRunner } from "./JobRunner";
import { WorkflowManager } from "./WorkflowManager";
import { loadAgent } from "./agents.http";
import { AGENTS, config } from "./config";
import { UserIntent } from "./types";

const app = express();
app.use(express.json());

const jobRunner = new JobRunner();
const workflowManager = new WorkflowManager(jobRunner);

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
        vendor: agent.vendor,
        category: agent.category,
        tags: agent.tags,
        pricing: agent.pricing,
        rating: agent.rating,
        performance: agent.performance,
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
        vendor: agent.vendor,
        category: agent.category,
        tags: agent.tags,
        pricing: agent.pricing,
        rating: agent.rating,
        performance: agent.performance,
        wallet: agent.wallet,
        previewURI: agent.previewURI,
      })),
      count: agents.length,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to discover agents",
      details: error.message,
    });
  }
});

// Create workflow based on user intent
app.post("/workflows/create", async (req: Request, res: Response) => {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({
        error: "Missing required field: prompt (string)",
      });
    }

    console.log(`🔍 Creating workflow for prompt: "${prompt}"`);

    // Create a simplified UserIntent from the prompt
    const userIntent: UserIntent = {
      description: prompt,
      context: {
        source: "api",
        timestamp: new Date().toISOString(),
      },
      preferences: {
        speed: "balanced",
        quality: "standard",
        cost: "medium",
      },
    };

    const workflow = await workflowManager.createWorkflow(userIntent);

    res.json({
      success: true,
      workflow: {
        workflowId: workflow.workflowId,
        name: workflow.name,
        description: workflow.description,
        userIntent: workflow.userIntent,
        steps: workflow.steps,
        executionMode: workflow.executionMode,
        estimatedDuration: workflow.estimatedDuration,
        createdAt: workflow.createdAt,
      },
      message: `Workflow created with ${workflow.steps.length} steps`,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Workflow creation failed:", error);
    res.status(500).json({
      error: "Workflow creation failed",
      details: error.message,
    });
  }
});

// Execute a workflow
app.post("/workflows/execute", async (req: Request, res: Response) => {
  try {
    const { workflowId } = req.body;

    if (!workflowId) {
      return res.status(400).json({
        error: "Missing required field: workflowId",
      });
    }

    console.log(`🚀 Executing workflow: ${workflowId}`);

    // Get the workflow to determine what input it needs
    const workflow = workflowManager.getWorkflow(workflowId);
    if (!workflow) {
      return res.status(404).json({
        error: "Workflow not found",
      });
    }

    // Generate default input based on the workflow's first step requirements
    const defaultInput = workflowManager.generateDefaultInput(workflow);

    const execution = await workflowManager.executeWorkflow(
      workflowId,
      defaultInput
    );

    res.json({
      success: true,
      execution: {
        executionId: execution.executionId,
        workflowId: execution.workflowId,
        status: execution.status,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        input: execution.input,
        output: execution.output,
        stepResults: execution.stepResults,
        error: execution.error,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Workflow execution failed:", error);
    res.status(500).json({
      error: "Workflow execution failed",
      details: error.message,
    });
  }
});

// Get workflow by ID
app.get("/workflows/:workflowId", (req: Request, res: Response) => {
  try {
    const { workflowId } = req.params;
    const workflow = workflowManager.getWorkflow(workflowId);

    if (!workflow) {
      return res.status(404).json({
        error: "Workflow not found",
      });
    }

    res.json({
      success: true,
      workflow,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to retrieve workflow",
      details: error.message,
    });
  }
});

// Get execution by ID
app.get("/executions/:executionId", (req: Request, res: Response) => {
  try {
    const { executionId } = req.params;
    const execution = workflowManager.getExecution(executionId);

    if (!execution) {
      return res.status(404).json({
        error: "Execution not found",
      });
    }

    res.json({
      success: true,
      execution,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to retrieve execution",
      details: error.message,
    });
  }
});

// List all workflows
app.get("/workflows", (req: Request, res: Response) => {
  try {
    const workflows = workflowManager.listWorkflows();
    res.json({
      success: true,
      workflows,
      count: workflows.length,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to list workflows",
      details: error.message,
    });
  }
});

// List all executions
app.get("/executions", (req: Request, res: Response) => {
  try {
    const executions = workflowManager.listExecutions();
    res.json({
      success: true,
      executions,
      count: executions.length,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to list executions",
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
      for (const endpoint of AGENTS) {
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
    console.log(
      `🔧 Create Workflow: POST http://localhost:${port}/workflows/create`
    );
    console.log(
      `🚀 Execute Workflow: POST http://localhost:${port}/workflows/execute`
    );
    console.log(`📋 List Workflows: GET http://localhost:${port}/workflows`);
    console.log(`📊 List Executions: GET http://localhost:${port}/executions`);
  });
}
