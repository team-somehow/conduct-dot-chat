// src/server.ts  (CLI demo)
import express, { Request, Response } from "express";
import { JobRunner } from "./JobRunner";
import { WorkflowManager } from "./WorkflowManager";
import { loadAgent, runAgent } from "./agents.http";
import {
  AGENTS,
  config,
  createSampleMCPConfig,
  loadMCPConfig,
  validateMCPConfig,
} from "./config";
import { UserIntent } from "./types";
import { MCPManager } from "./MCPManager";
import { MCPAgentService, MCPAgentAdapter } from "./MCPAgent";
import { workflowManager } from "./workflowManagerSingleton";
// import BlockchainService, {
//   createBlockchainService,
// } from "./BlockchainService";
// import { ethers } from "ethers";

const app = express();

// Add CORS middleware
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());

// Helper function to generate natural language summary using GPT-4.1-mini
async function generateExecutionSummary(
  execution: any,
  workflow: any
): Promise<string> {
  try {
    const duration = execution.completedAt
      ? Math.round((execution.completedAt - execution.startedAt) / 1000)
      : 0;

    // Prepare the data for GPT-4.1-mini - only use actual execution data
    const summaryData = {
      userRequest: workflow.userIntent,
      workflowName: workflow.name,
      status: execution.status,
      duration: duration,
      executionId: execution.executionId,
      startedAt: new Date(execution.startedAt).toISOString(),
      completedAt: execution.completedAt
        ? new Date(execution.completedAt).toISOString()
        : null,
      steps: workflow.steps.map((step: any, index: number) => {
        const stepResult = execution.stepResults?.[index];
        return {
          stepNumber: index + 1,
          agentName: step.agentName,
          agentUrl: step.agentUrl,
          description: step.description,
          input: stepResult?.input || step.inputMapping || null,
          status: stepResult?.status || "unknown",
          output: stepResult?.output || null,
          error: stepResult?.error || null,
          startedAt: stepResult?.startedAt
            ? new Date(stepResult.startedAt).toISOString()
            : null,
          completedAt: stepResult?.completedAt
            ? new Date(stepResult.completedAt).toISOString()
            : null,
        };
      }),
      finalOutput: execution.output,
      error: execution.error,
      // Include all raw step results for transparency
      rawStepResults: execution.stepResults || [],
    };

    // Call GPT-4.1-mini to generate the summary
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a precise workflow execution reporter. Your job is to create accurate summaries based STRICTLY on the actual data provided.

CRITICAL RULES:
1. NEVER invent, assume, or hallucinate any information not present in the data
2. Only report on what actually happened according to the execution results
3. If an agent failed, report the actual error message
4. If an agent succeeded, report only the actual output data provided
5. Do not make assumptions about blockchain transactions, NFTs, or images unless the actual data contains specific details
6. Do not add encouraging language or assume success if the data shows failures

Structure your response as:
1. Brief summary of the user's request
2. Step-by-step breakdown of what each agent actually did (based on real outputs)
3. Final result showing only actual data returned
4. Any errors that occurred

Use markdown format. Be factual and precise. Use the actual agent names and outputs provided.

For NFT workflows: Only mention transaction hashes, addresses, or token IDs if they are present in the actual agent outputs.
For image generation: Only mention image URLs if they are present in the actual agent outputs.
For any workflow: If an agent failed, clearly state it failed and include the actual error message.`,
          },
          {
            role: "user",
            content: `Create a factual summary for this workflow execution. Use ONLY the data provided below. Do not invent or assume any information:

${JSON.stringify(summaryData, null, 2)}

Report exactly what happened based on the execution data above.`,
          },
        ],
        max_tokens: 1500,
        temperature: 0.1, // Lower temperature for more factual output
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const generatedSummary = (result as any).choices[0]?.message?.content;

    if (!generatedSummary) {
      throw new Error("No summary generated from OpenAI");
    }

    // Add footer with execution metadata
    const finalSummary =
      generatedSummary +
      `\n\n---\n**Execution Metadata:**\n` +
      `- Execution ID: \`${execution.executionId}\`\n` +
      `- Duration: ${duration} seconds\n` +
      `- Steps: ${workflow.steps.length}\n` +
      `- Status: ${execution.status}\n` +
      `\n*Generated by MAHA Orchestrator at ${new Date().toISOString()}*\n`;

    return finalSummary;
  } catch (error: any) {
    console.error("Failed to generate AI summary:", error.message);

    // Enhanced fallback to show actual step results
    const duration = execution.completedAt
      ? Math.round((execution.completedAt - execution.startedAt) / 1000)
      : 0;

    let fallbackSummary = `# Workflow Execution Report\n\n`;
    fallbackSummary += `**Request**: ${workflow.userIntent}\n\n`;
    fallbackSummary += `**Status**: ${
      execution.status === "completed"
        ? "✅ Successfully Completed"
        : execution.status === "failed"
        ? "❌ Failed"
        : "⏳ In Progress"
    }\n`;
    fallbackSummary += `**Duration**: ${duration} seconds\n`;
    fallbackSummary += `**Execution ID**: \`${execution.executionId}\`\n\n`;

    // Show actual step results
    if (execution.stepResults && execution.stepResults.length > 0) {
      fallbackSummary += `## Step Results\n\n`;
      execution.stepResults.forEach((stepResult: any, index: number) => {
        const step = workflow.steps[index];
        fallbackSummary += `### Step ${index + 1}: ${
          step?.agentName || "Unknown Agent"
        }\n`;
        fallbackSummary += `- **Status**: ${stepResult.status}\n`;
        if (stepResult.status === "completed" && stepResult.output) {
          fallbackSummary += `- **Output**: \`${JSON.stringify(
            stepResult.output
          ).substring(0, 200)}...\`\n`;
        }
        if (stepResult.error) {
          fallbackSummary += `- **Error**: ${stepResult.error}\n`;
        }
        fallbackSummary += `\n`;
      });
    }

    if (execution.status === "completed" && execution.output) {
      fallbackSummary += `## Final Result\n\n`;
      fallbackSummary += `\`\`\`json\n${JSON.stringify(
        execution.output,
        null,
        2
      )}\n\`\`\`\n`;
    } else if (execution.status === "failed") {
      fallbackSummary += `## Error\n\n`;
      fallbackSummary += `❌ The workflow failed: ${execution.error}\n`;
    }

    fallbackSummary += `\n---\n*Generated by MAHA Orchestrator (fallback mode) at ${new Date().toISOString()}*\n`;

    return fallbackSummary;
  }
}

// Health check endpoint
app.get("/health", async (req: Request, res: Response) => {
  try {
    const agents = await workflowManager.jobRunner.discoverAgents();
    const mcpServerStatuses = workflowManager.jobRunner.getMCPServerStatuses();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      agents: agents.map((agent) => {
        const baseInfo = {
          name: agent.name,
          description: agent.description,
          type: agent.type,
          previewURI: agent.previewURI,
        };

        if (agent.type === "http") {
          return {
            ...baseInfo,
            url: (agent as any).url,
            vendor: (agent as any).vendor,
            category: (agent as any).category,
            tags: (agent as any).tags,
            pricing: (agent as any).pricing,
            rating: (agent as any).rating,
            performance: (agent as any).performance,
          };
        } else {
          return {
            ...baseInfo,
            serverName: (agent as any).serverName,
            tools: (agent as any).tools?.length || 0,
            resources: (agent as any).resources?.length || 0,
            prompts: (agent as any).prompts?.length || 0,
          };
        }
      }),
      mcpServers: mcpServerStatuses,
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
    const agents = await workflowManager.jobRunner.discoverAgents();
    res.json({
      agents: agents.map((agent) => {
        const baseInfo = {
          name: agent.name,
          description: agent.description,
          type: agent.type,
          previewURI: agent.previewURI,
        };

        if (agent.type === "http") {
          return {
            ...baseInfo,
            url: (agent as any).url,
            vendor: (agent as any).vendor,
            category: (agent as any).category,
            tags: (agent as any).tags,
            pricing: (agent as any).pricing,
            rating: (agent as any).rating,
            performance: (agent as any).performance,
            wallet: (agent as any).wallet,
          };
        } else {
          return {
            ...baseInfo,
            serverName: (agent as any).serverName,
            tools: (agent as any).tools,
            resources: (agent as any).resources,
            prompts: (agent as any).prompts,
          };
        }
      }),
      count: agents.length,
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to discover agents",
      details: error.message,
    });
  }
});

// MCP-specific endpoints

// Get MCP server statuses
app.get("/mcp/servers", (req: Request, res: Response) => {
  try {
    const statuses = workflowManager.jobRunner.getMCPServerStatuses();
    res.json({
      success: true,
      servers: statuses,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to get MCP server statuses",
      details: error.message,
    });
  }
});

// Refresh MCP agents
app.post("/mcp/refresh", async (req: Request, res: Response) => {
  try {
    await workflowManager.jobRunner.refreshMCPAgents();
    const agents = await workflowManager.jobRunner.discoverAgents();
    const mcpAgents = agents.filter((agent) => agent.type === "mcp");

    res.json({
      success: true,
      message: "MCP agents refreshed successfully",
      mcpAgents: mcpAgents.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to refresh MCP agents",
      details: error.message,
    });
  }
});

// Get sample MCP configuration
app.get("/mcp/config/sample", (req: Request, res: Response) => {
  try {
    const sampleConfig = createSampleMCPConfig();
    res.json({
      success: true,
      sampleConfig: JSON.parse(sampleConfig),
      configString: sampleConfig,
      instructions: {
        message:
          "Save this configuration as 'mcp.json' in your project root or orchestrator directory",
        envVars:
          "Replace placeholder values with your actual API keys and secrets",
        locations: [
          "./mcp.json",
          "./orchestrator/mcp.json",
          "Set MCP_CONFIG environment variable with JSON string",
        ],
      },
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to generate sample MCP configuration",
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

    // Generate natural language summary
    const summary = await generateExecutionSummary(execution, workflow);

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
      summary: summary,
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

// List all executions (debugging endpoint)
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

    const result = await workflowManager.jobRunner.executeAgentTask(agentUrl, input);

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

    const jobId = workflowManager.jobRunner.generateJobId();

    if (mode === "parallel") {
      const tasks = agentUrls.map((url: string) => ({
        agentUrl: url,
        input: jobData,
      }));

      const results = await workflowManager.jobRunner.executeParallelTasks(jobId, tasks);

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

      const results = await workflowManager.jobRunner.executeSequentialTasks(jobId, tasks);

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

// Generate AI summary for workflow execution
app.post("/workflows/generate-summary", async (req: Request, res: Response) => {
  try {
    const { workflowId, executionId } = req.body;

    if (!workflowId) {
      return res.status(400).json({
        error: "Missing required field: workflowId",
      });
    }

    if (!executionId) {
      return res.status(400).json({
        error: "Missing required field: executionId",
      });
    }

    console.log(
      `🤖 Generating AI summary for workflow: ${workflowId}, execution: ${executionId}`
    );

    // Always fetch data from in-memory storage to ensure consistency
    const workflowData = workflowManager.getWorkflow(workflowId);
    if (!workflowData) {
      return res.status(404).json({
        error: `Workflow not found: ${workflowId}`,
      });
    }

    const executionData = workflowManager.getExecution(executionId);
    if (!executionData) {
      return res.status(404).json({
        error: `Execution not found: ${executionId}`,
      });
    }

    // Verify the execution belongs to the workflow
    if (executionData.workflowId !== workflowId) {
      return res.status(400).json({
        error: `Execution ${executionId} does not belong to workflow ${workflowId}`,
      });
    }

    const summary = await generateExecutionSummary(executionData, workflowData);

    res.json({
      success: true,
      summary: summary,
      workflowId: workflowId,
      executionId: executionId,
      generatedAt: Date.now(),
      dataSource: "in-memory",
    });
  } catch (error: any) {
    console.error("Summary generation failed:", error);
    res.status(500).json({
      error: "Summary generation failed",
      details: error.message,
    });
  }
});

// ========== BLOCKCHAIN & RATING ENDPOINTS ==========

// Get blockchain service status
app.get("/blockchain/status", (req: Request, res: Response) => {
  try {
    // Simple blockchain status check without relying on JobRunner methods
    const rpcUrl = process.env.RPC_URL || "http://localhost:8545";
    const hasPrivateKey = !!process.env.ORCHESTRATOR_PRIVATE_KEY;

    res.json({
      success: true,
      blockchain: {
        isAvailable: true, // We'll assume it's available for now
        hasWallet: hasPrivateKey,
        rpcUrl: rpcUrl,
        contracts: {
          agentRegistry:
            process.env.AGENT_REGISTRY_ADDRESS ||
            "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          reputationLayer:
            process.env.REPUTATION_LAYER_ADDRESS ||
            "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
          orchestrationContract:
            process.env.ORCHESTRATION_CONTRACT_ADDRESS ||
            "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
        },
        features: {
          agentDiscovery: true,
          reputationTracking: hasPrivateKey,
          paymentProcessing: hasPrivateKey,
        },
      },
      message: "Blockchain service endpoints available",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to get blockchain status",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Simple rating submission endpoint
app.post("/agents/rate", (req: Request, res: Response) => {
  try {
    const { agentUrl, rating, userAddress } = req.body;

    if (!agentUrl || !rating) {
      return res.status(400).json({
        error: "Missing required fields: agentUrl, rating",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        error: "Rating must be between 1 and 5 stars",
      });
    }

    // For demo purposes, return success without actual blockchain transaction
    console.log(`⭐ Rating ${rating}/5 submitted for agent ${agentUrl}`);

    res.json({
      success: true,
      message: `Rating ${rating}/5 submitted successfully`,
      agentUrl,
      rating,
      userAddress: userAddress || "demo-user",
      txHash: "demo-tx-hash-" + Date.now(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to submit rating",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Get agent reputation endpoint
app.get("/agents/:agentUrl/reputation", (req: Request, res: Response) => {
  try {
    const { agentUrl } = req.params;

    // Return demo reputation data
    res.json({
      success: true,
      agentUrl: decodeURIComponent(agentUrl),
      reputation: {
        totalTasks: 10,
        successfulTasks: 9,
        successRate: 90,
        averageLatency: 500,
        averageRating: 4.5,
        reputationScore: 85,
      },
      source: "demo",
      message: "Demo reputation data",
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    res.status(500).json({
      error: "Failed to get agent reputation",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// Submit feedback with multiple ratings (enhanced endpoint)
app.post("/feedback/submit", async (req: Request, res: Response) => {
  try {
    const {
      executionId,
      workflowId,
      modelRatings,
      overallFeedback,
      userAddress,
    } = req.body;

    if (!executionId && !workflowId) {
      return res.status(400).json({
        error: "Missing required field: executionId or workflowId",
      });
    }

    if (!modelRatings || typeof modelRatings !== "object") {
      return res.status(400).json({
        error:
          "Missing required field: modelRatings (object with agentUrl: rating mappings)",
      });
    }

    console.log(
      `📝 Processing feedback submission for execution: ${
        executionId || workflowId
      }`
    );
    console.log(`🎯 Model ratings:`, modelRatings);

    const results = [];
    const errors = [];

    // Submit ratings for each agent using blockchain service
    for (const [agentIdentifier, rating] of Object.entries(modelRatings)) {
      try {
        let agentUrl = agentIdentifier;

        if (typeof rating === "number" && rating >= 1 && rating <= 5) {
          console.log(
            `⭐ Submitting rating ${rating}/5 for agent ${agentUrl} to blockchain...`
          );

          // Try to get agent's blockchain address from the agent URL
          let agentAddress: string | null = null;

          try {
            // First, try to get the agent from blockchain by URL
            const blockchainAgent = await workflowManager.jobRunner
              .getBlockchainService()
              ?.getAgentByUrl(agentUrl);
            if (blockchainAgent) {
              agentAddress = blockchainAgent.wallet;
            } else {
              // If not found by URL, try to extract address from URL or use a mapping
              // For demo purposes, we'll generate a demo address
              agentAddress = `0x${agentUrl.slice(-40).padStart(40, "0")}`;
            }
          } catch (error) {
            console.warn(
              `⚠️ Could not get blockchain address for ${agentUrl}, using fallback`
            );
            agentAddress = `0x${agentUrl.slice(-40).padStart(40, "0")}`;
          }

          // Submit rating to blockchain
          let txHash: string | null = null;
          let success = false;
          let errorMessage: string | null = null;

          try {
            const blockchainService = workflowManager.jobRunner.getBlockchainService();
            if (blockchainService && blockchainService.isAvailable()) {
              txHash = await blockchainService.rateAgent(agentAddress, rating);
              success = !!txHash;

              if (success) {
                console.log(
                  `✅ Rating submitted to blockchain with tx: ${txHash}`
                );
              } else {
                errorMessage = "Blockchain transaction failed";
                console.warn(`⚠️ Blockchain rating failed for ${agentUrl}`);
              }
            } else {
              // Fallback to demo mode if blockchain is not available
              console.warn(
                `⚠️ Blockchain service not available, using demo mode`
              );
              success = true;
              txHash =
                "demo-tx-hash-" +
                Date.now() +
                "-" +
                Math.random().toString(36).substr(2, 5);
            }
          } catch (error: any) {
            console.error(`❌ Error submitting rating to blockchain:`, error);
            errorMessage = error.message;

            // Fallback to demo mode on error
            success = true;
            txHash =
              "demo-tx-hash-" +
              Date.now() +
              "-" +
              Math.random().toString(36).substr(2, 5);
          }

          results.push({
            agentUrl,
            agentIdentifier,
            agentAddress,
            rating,
            success,
            txHash,
            error: errorMessage,
          });
        } else {
          errors.push(`${agentIdentifier}: Invalid rating value (${rating})`);
        }
      } catch (error: any) {
        errors.push(`${agentIdentifier}: ${error.message}`);
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const totalRatings = Object.keys(modelRatings).length;
    const blockchainCount = results.filter(
      (r) => r.success && r.txHash && !r.txHash.startsWith("demo-")
    ).length;

    const mode = blockchainCount > 0 ? "blockchain" : "demo";
    const message =
      blockchainCount > 0
        ? `Submitted ${blockchainCount}/${totalRatings} ratings to blockchain successfully`
        : `Submitted ${successCount}/${totalRatings} ratings successfully (demo mode)`;

    res.json({
      success: successCount > 0,
      message,
      results,
      errors: errors.length > 0 ? errors : undefined,
      feedback: {
        executionId,
        workflowId,
        overallFeedback,
        ratingsSubmitted: successCount,
        totalRatings,
        blockchainSubmissions: blockchainCount,
      },
      mode,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Feedback submission error:", error);
    res.status(500).json({
      error: "Failed to submit feedback",
      details: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});

// ========== END BLOCKCHAIN & RATING ENDPOINTS ==========

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
