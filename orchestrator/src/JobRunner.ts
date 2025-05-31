import { HttpAgent, loadAgent, runAgent } from "./agents.http";
import {
  AGENTS,
  config,
  validateBlockchainConfig,
  FLOW_EVM_CONFIG,
  loadMCPConfig,
  validateMCPConfig,
} from "./config";
import { AgentMetadata, JobData, TaskExecution, Agent } from "./types";
import { MCPManager } from "./MCPManager";
import { MCPAgentService, MCPAgentAdapter } from "./MCPAgent";
import BlockchainService, {
  createBlockchainService,
} from "./BlockchainService";
import { ethers } from "ethers";

export interface JobConfig {
  jobId: string;
  jobData: any;
  agents: Agent[];
}

export interface TaskResult {
  agentName: string;
  agentUrl: string;
  result: string;
  timestamp: string;
  success?: boolean;
  executionTime?: number;
  blockchainTxHash?: string;
  agentCost?: string; // Cost in FLOW tokens
  agentReputation?: number;
}

export class JobRunner {
  private httpAgents: Map<string, HttpAgent> = new Map();
  private mcpManager: MCPManager;
  private mcpAgentService: MCPAgentService;
  private mcpAgentAdapters: Map<string, MCPAgentAdapter> = new Map();
  private blockchainService: BlockchainService;
  private blockchainEnabled: boolean;

  constructor() {
    this.mcpManager = new MCPManager();
    this.mcpAgentService = new MCPAgentService(this.mcpManager);

    // Initialize blockchain service with Flow EVM Testnet configuration
    this.blockchainEnabled = validateBlockchainConfig();

    if (this.blockchainEnabled) {
      console.log(
        "🔗 Initializing blockchain service with Flow EVM Testnet..."
      );
      this.blockchainService = createBlockchainService();
    } else {
      console.log("⚠️ Blockchain integration disabled - using fallback mode");
      // Create a dummy blockchain service for fallback
      this.blockchainService = createBlockchainService("", "");
    }

    this.initializeMCPServers();
  }

  /**
   * Initialize MCP servers from configuration
   */
  private async initializeMCPServers(): Promise<void> {
    try {
      const mcpConfig = loadMCPConfig();

      // Validate configuration
      const errors = validateMCPConfig(mcpConfig);
      if (errors.length > 0) {
        console.error("❌ MCP configuration errors:", errors);
        return;
      }

      // Start MCP servers
      if (Object.keys(mcpConfig.mcpServers).length > 0) {
        console.log("🚀 Starting MCP servers...");
        await this.mcpManager.startServers(mcpConfig.mcpServers);

        // Give servers time to initialize
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Load MCP agent adapters
        await this.refreshMCPAgents();
      }
    } catch (error) {
      console.error("❌ Failed to initialize MCP servers:", error);
    }
  }

  /**
   * Refresh MCP agent adapters
   */
  async refreshMCPAgents(): Promise<void> {
    try {
      const adapters = await this.mcpAgentService.getMCPAgentAdapters();
      this.mcpAgentAdapters.clear();

      for (const adapter of adapters) {
        this.mcpAgentAdapters.set(adapter.url, adapter);
        console.log(`✅ Loaded MCP agent: ${adapter.name} (${adapter.url})`);
      }
    } catch (error) {
      console.error("❌ Failed to refresh MCP agents:", error);
    }
  }

  // Load and cache an HTTP agent
  async loadAgent(url: string): Promise<HttpAgent> {
    if (this.httpAgents.has(url)) {
      return this.httpAgents.get(url)!;
    }

    const agent = await loadAgent(url);
    this.httpAgents.set(url, agent);
    return agent;
  }

  /**
   * Enhanced agent discovery with blockchain-first approach
   * Uses Flow EVM Testnet contracts for cost and reputation data
   */
  async discoverAgents(): Promise<Agent[]> {
    const agents: Agent[] = [];

    // Primary: Blockchain-based agent discovery (Flow EVM Testnet)
    if (this.blockchainEnabled && this.blockchainService.isAvailable()) {
      console.log("🔍 Discovering agents from Flow EVM Testnet registry...");

      try {
        const blockchainAgents = await this.blockchainService.getActiveAgents();
        console.log(
          `📊 Found ${blockchainAgents.length} agents in blockchain registry`
        );

        for (const blockchainAgent of blockchainAgents) {
          try {
            // Fetch metadata from IPFS/HTTP if available
            let metadata: any = {};
            try {
              if (
                blockchainAgent.metadataURI &&
                (blockchainAgent.metadataURI.startsWith("http") ||
                  blockchainAgent.metadataURI.startsWith("ipfs://"))
              ) {
                const metadataUrl = blockchainAgent.metadataURI.startsWith(
                  "ipfs://"
                )
                  ? `https://ipfs.io/ipfs/${blockchainAgent.metadataURI.replace(
                      "ipfs://",
                      ""
                    )}`
                  : blockchainAgent.metadataURI;

                const response = await fetch(metadataUrl);
                if (response.ok) {
                  metadata = await response.json();
                }
              }
            } catch (metadataError) {
              console.warn(
                `⚠️ Failed to fetch metadata for ${blockchainAgent.agentUrl}:`,
                metadataError
              );
            }

            // Convert blockchain agent to orchestrator agent format with reputation
            const orchestratorAgent =
              await this.blockchainService.blockchainToOrchestratorAgent(
                blockchainAgent,
                metadata
              );

            // Create proper agent object based on type
            if (blockchainAgent.agentType === 0) {
              // HTTP agent
              agents.push({
                type: "http",
                url: blockchainAgent.agentUrl,
                name: orchestratorAgent.name,
                description: orchestratorAgent.description,
                wallet: blockchainAgent.wallet as `0x${string}`,
                vendor: orchestratorAgent.vendor,
                category: orchestratorAgent.category,
                tags: orchestratorAgent.tags,
                pricing: orchestratorAgent.pricing,
                rating: orchestratorAgent.rating,
                performance: orchestratorAgent.performance,
                inputSchema: metadata.inputSchema || {},
                outputSchema: metadata.outputSchema || {},
                previewURI: orchestratorAgent.previewURI,
                // Blockchain data for cost and reputation
                blockchain: orchestratorAgent.blockchain,
              } as Agent & { blockchain: any });
            } else if (blockchainAgent.agentType === 1) {
              // MCP agent
              agents.push({
                type: "mcp",
                name: orchestratorAgent.name,
                description: orchestratorAgent.description,
                serverName: new URL(blockchainAgent.agentUrl).hostname,
                tools: metadata.tools || [],
                resources: metadata.resources || [],
                prompts: metadata.prompts || [],
                inputSchema: metadata.inputSchema || {},
                outputSchema: metadata.outputSchema || {},
                previewURI: orchestratorAgent.previewURI,
                // Blockchain data for cost and reputation
                blockchain: orchestratorAgent.blockchain,
              } as Agent & { blockchain: any });
            }

            console.log(
              `✅ Loaded blockchain agent: ${
                orchestratorAgent.name
              } (${ethers.formatEther(
                blockchainAgent.baseCostPerTask
              )} FLOW/task)`
            );
          } catch (error) {
            console.warn(
              `⚠️ Failed to process blockchain agent ${blockchainAgent.agentUrl}:`,
              error
            );
          }
        }
      } catch (error) {
        console.error("❌ Failed to discover agents from blockchain:", error);
      }
    }

    // Fallback: Traditional agent discovery from config
    if (
      config.AGENT_DISCOVERY.SOURCE === "hardcoded" ||
      (agents.length === 0 && config.AGENT_DISCOVERY.FALLBACK_AGENTS)
    ) {
      console.log("🔄 Using fallback agent discovery...");
      const fallbackAgents = config.AGENT_DISCOVERY.FALLBACK_AGENTS || [];

      for (const endpoint of fallbackAgents) {
        try {
          // Skip if we already have this agent from blockchain
          const existingAgent = agents.find(
            (a) => a.type === "http" && (a as any).url === endpoint
          );
          if (existingAgent) {
            console.log(
              `⏭️ Skipping ${endpoint} - already discovered from blockchain`
            );
            continue;
          }

          const httpAgent = await this.loadAgent(endpoint);

          // For fallback agents, try to get cost from blockchain if possible
          let blockchainCost: bigint | null = null;
          let reputationData: any = null;

          if (this.blockchainEnabled && this.blockchainService.isAvailable()) {
            try {
              blockchainCost = await this.blockchainService.getAgentCost(
                endpoint
              );
              const blockchainAgent =
                await this.blockchainService.getAgentByUrl(endpoint);
              if (blockchainAgent) {
                reputationData = await this.blockchainService.getReputationData(
                  blockchainAgent.wallet
                );
              }
            } catch (error) {
              console.warn(`⚠️ Could not get blockchain data for ${endpoint}`);
            }
          }

          // Use blockchain cost if available, otherwise use agent's pricing
          const pricing = blockchainCost
            ? {
                model: "per-task",
                amount: Number(ethers.formatEther(blockchainCost)),
                currency: "FLOW",
                unit: "task",
              }
            : httpAgent.pricing;

          // Use blockchain reputation if available
          const rating = reputationData
            ? {
                score: reputationData.averageRating || 0,
                reviews: reputationData.totalTasks || 0,
                lastUpdated: new Date().toISOString(),
              }
            : httpAgent.rating;

          const performance = reputationData
            ? {
                avgResponseTime: reputationData.averageLatency || 0,
                uptime: 100,
                successRate:
                  reputationData.totalTasks > 0
                    ? (reputationData.successfulTasks /
                        reputationData.totalTasks) *
                      100
                    : 0,
              }
            : httpAgent.performance;

          agents.push({
            type: "http",
            url: httpAgent.url,
            name: httpAgent.name,
            description: httpAgent.description,
            wallet: httpAgent.wallet,
            vendor: httpAgent.vendor,
            category: httpAgent.category,
            tags: httpAgent.tags,
            pricing: pricing,
            rating: rating,
            performance: performance,
            inputSchema: {},
            outputSchema: {},
            previewURI: httpAgent.previewURI,
          } as Agent);

          console.log(
            `✅ Loaded fallback HTTP agent: ${httpAgent.name} (${endpoint})`
          );
        } catch (error: any) {
          console.log(
            `❌ Failed to load HTTP agent from ${endpoint}:`,
            error.message
          );
        }
      }
    }

    // MCP agent discovery (unchanged but with blockchain integration)
    try {
      await this.refreshMCPAgents();
      for (const [url, adapter] of this.mcpAgentAdapters) {
        // Skip if we already have this agent from blockchain
        const existingAgent = agents.find(
          (a) =>
            a.type === "mcp" && (a as any).serverName === adapter.serverName
        );
        if (existingAgent) {
          console.log(
            `⏭️ Skipping MCP ${adapter.name} - already discovered from blockchain`
          );
          continue;
        }

        agents.push({
          type: "mcp",
          name: adapter.name,
          description: adapter.description,
          serverName: adapter.serverName,
          tools: adapter.tools,
          resources: adapter.resources,
          prompts: adapter.prompts,
          inputSchema: {},
          outputSchema: {},
          previewURI: adapter.previewURI,
        } as Agent);
        console.log(`✅ Discovered MCP agent: ${adapter.name} (${url})`);
      }
    } catch (error: any) {
      console.log(`❌ Failed to discover MCP agents:`, error.message);
    }

    // Sort agents by reputation score if available
    if (config.REPUTATION_SOURCE === "blockchain") {
      agents.sort((a, b) => {
        const aRating =
          (a as any).blockchain?.reputation?.reputationScore ||
          (a as any).rating?.score ||
          0;
        const bRating =
          (b as any).blockchain?.reputation?.reputationScore ||
          (b as any).rating?.score ||
          0;
        return bRating - aRating; // Higher reputation first
      });
    }

    console.log(
      `🎯 Total agents discovered: ${agents.length} (blockchain-first discovery on Flow EVM Testnet)`
    );
    console.log(
      `💰 Cost source: ${config.COST_SOURCE}, Reputation source: ${config.REPUTATION_SOURCE}`
    );

    return agents;
  }

  /**
   * Get agent cost from blockchain or fallback
   */
  async getAgentCost(
    agentUrl: string
  ): Promise<{ amount: number; currency: string } | null> {
    if (
      config.COST_SOURCE === "blockchain" &&
      this.blockchainEnabled &&
      this.blockchainService.isAvailable()
    ) {
      try {
        const cost = await this.blockchainService.getAgentCost(agentUrl);
        if (cost !== null) {
          return {
            amount: Number(ethers.formatEther(cost)),
            currency: "FLOW",
          };
        }
      } catch (error) {
        console.warn(
          `⚠️ Failed to get blockchain cost for ${agentUrl}:`,
          error
        );
      }
    }

    // Fallback to agent's reported cost
    try {
      const agent = await this.loadAgent(agentUrl);
      return {
        amount: agent.pricing?.amount || 0,
        currency: agent.pricing?.currency || "ETH",
      };
    } catch (error) {
      console.warn(`⚠️ Failed to get agent cost for ${agentUrl}:`, error);
      return null;
    }
  }

  // Enhanced task execution with blockchain integration and cost tracking
  async executeAgentTask<TIn, TOut>(
    agentUrl: string,
    input: TIn
  ): Promise<TOut> {
    const startTime = Date.now();
    let success = false;
    let result: TOut;
    let agentCost: { amount: number; currency: string } | null = null;

    try {
      // Get agent cost for tracking
      agentCost = await this.getAgentCost(agentUrl);

      console.log(
        `💰 Executing task on ${agentUrl}${
          agentCost ? ` (Cost: ${agentCost.amount} ${agentCost.currency})` : ""
        }`
      );

      // Check if it's an MCP agent
      if (MCPAgentService.isMCPUrl(agentUrl)) {
        const adapter = this.mcpAgentAdapters.get(agentUrl);
        if (!adapter) {
          throw new Error(`MCP agent not found: ${agentUrl}`);
        }

        result = await this.mcpAgentService.runMCPAgent<TIn, TOut>(
          adapter,
          input
        );
        console.log(`✅ MCP task completed by ${adapter.name}`);
        success = true;
      } else {
        // HTTP agent
        const agent = await this.loadAgent(agentUrl);
        result = await runAgent<TIn, TOut>(agent, input);
        console.log(`✅ HTTP task completed by ${agent.name}`);
        success = true;
      }

      // Record successful completion on blockchain if enabled
      if (config.REPUTATION_SOURCE === "blockchain") {
        await this.recordTaskCompletion(agentUrl, true, Date.now() - startTime);
      }

      return result;
    } catch (error) {
      console.error(`❌ Task execution failed for ${agentUrl}:`, error);

      // Record failed completion on blockchain if enabled
      if (config.REPUTATION_SOURCE === "blockchain") {
        await this.recordTaskCompletion(
          agentUrl,
          false,
          Date.now() - startTime
        );
      }

      throw error;
    }
  }

  // Record task completion on blockchain with Flow EVM Testnet integration
  private async recordTaskCompletion(
    agentUrl: string,
    success: boolean,
    executionTimeMs: number
  ): Promise<void> {
    try {
      if (
        !this.blockchainEnabled ||
        !this.blockchainService.isAvailable() ||
        !this.blockchainService.hasWallet()
      ) {
        console.log(
          `⚠️ Blockchain recording not available (enabled: ${this.blockchainEnabled})`
        );
        return;
      }

      // Get agent address from blockchain registry
      const blockchainAgent = await this.blockchainService.getAgentByUrl(
        agentUrl
      );
      if (!blockchainAgent) {
        console.log(
          `⚠️ Agent ${agentUrl} not found in Flow EVM Testnet registry`
        );
        return;
      }

      // Convert execution time to seconds
      const executionTimeSeconds = Math.ceil(executionTimeMs / 1000);

      console.log(
        `📊 Recording task completion on Flow EVM Testnet: ${
          blockchainAgent.wallet
        } (${success ? "success" : "failure"})`
      );

      // Record task completion
      const txHash = await this.blockchainService.recordTaskCompletion(
        blockchainAgent.wallet,
        success,
        executionTimeSeconds
      );

      if (txHash) {
        console.log(
          `✅ Task completion recorded on Flow EVM Testnet: ${FLOW_EVM_CONFIG.BLOCK_EXPLORER}/tx/${txHash}`
        );
      }
    } catch (error) {
      console.warn(`⚠️ Failed to record task completion on blockchain:`, error);
      // Don't throw error - this is optional functionality
    }
  }

  // Execute multiple agents in sequence with enhanced tracking
  async executeSequentialTasks(
    jobId: string,
    tasks: Array<{
      agentUrl: string;
      input: any;
    }>
  ): Promise<TaskResult[]> {
    const results: TaskResult[] = [];

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];
      console.log(
        `📋 Executing task ${i + 1}/${tasks.length} with ${task.agentUrl}`
      );

      const startTime = Date.now();
      let success = false;
      let blockchainTxHash: string | undefined;
      let agentCost: string | undefined;
      let agentReputation: number | undefined;

      try {
        let agentName: string;

        // Get cost and reputation data
        const costData = await this.getAgentCost(task.agentUrl);
        if (costData) {
          agentCost = `${costData.amount} ${costData.currency}`;
        }

        if (this.blockchainEnabled && this.blockchainService.isAvailable()) {
          try {
            const blockchainAgent = await this.blockchainService.getAgentByUrl(
              task.agentUrl
            );
            if (blockchainAgent) {
              const reputationData =
                await this.blockchainService.getReputationData(
                  blockchainAgent.wallet
                );
              agentReputation = reputationData?.reputationScore;
            }
          } catch (error) {
            console.warn(`⚠️ Failed to get reputation for ${task.agentUrl}`);
          }
        }

        if (MCPAgentService.isMCPUrl(task.agentUrl)) {
          const adapter = this.mcpAgentAdapters.get(task.agentUrl);
          if (!adapter) {
            throw new Error(`MCP agent not found: ${task.agentUrl}`);
          }
          agentName = adapter.name;
        } else {
          const agent = await this.loadAgent(task.agentUrl);
          agentName = agent.name;
        }

        const result = await this.executeAgentTask(task.agentUrl, task.input);
        const executionTime = Date.now() - startTime;
        success = true;

        results.push({
          agentName,
          agentUrl: task.agentUrl,
          result: JSON.stringify(result),
          timestamp: new Date().toISOString(),
          success,
          executionTime,
          blockchainTxHash,
          agentCost,
          agentReputation,
        });
      } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error(`❌ Task ${i + 1} failed:`, error);

        results.push({
          agentName: "Unknown",
          agentUrl: task.agentUrl,
          result: JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          }),
          timestamp: new Date().toISOString(),
          success: false,
          executionTime,
          blockchainTxHash,
          agentCost,
          agentReputation,
        });

        throw error;
      }
    }

    return results;
  }

  // Execute multiple agents in parallel with enhanced tracking
  async executeParallelTasks(
    jobId: string,
    tasks: Array<{
      agentUrl: string;
      input: any;
    }>
  ): Promise<TaskResult[]> {
    const promises = tasks.map(async (task) => {
      const startTime = Date.now();
      let success = false;
      let blockchainTxHash: string | undefined;
      let agentCost: string | undefined;
      let agentReputation: number | undefined;

      try {
        let agentName: string;

        // Get cost and reputation data
        const costData = await this.getAgentCost(task.agentUrl);
        if (costData) {
          agentCost = `${costData.amount} ${costData.currency}`;
        }

        if (this.blockchainEnabled && this.blockchainService.isAvailable()) {
          try {
            const blockchainAgent = await this.blockchainService.getAgentByUrl(
              task.agentUrl
            );
            if (blockchainAgent) {
              const reputationData =
                await this.blockchainService.getReputationData(
                  blockchainAgent.wallet
                );
              agentReputation = reputationData?.reputationScore;
            }
          } catch (error) {
            console.warn(`⚠️ Failed to get reputation for ${task.agentUrl}`);
          }
        }

        if (MCPAgentService.isMCPUrl(task.agentUrl)) {
          const adapter = this.mcpAgentAdapters.get(task.agentUrl);
          if (!adapter) {
            throw new Error(`MCP agent not found: ${task.agentUrl}`);
          }
          agentName = adapter.name;
        } else {
          const agent = await this.loadAgent(task.agentUrl);
          agentName = agent.name;
        }

        const result = await this.executeAgentTask(task.agentUrl, task.input);
        const executionTime = Date.now() - startTime;
        success = true;

        return {
          agentName,
          agentUrl: task.agentUrl,
          result: JSON.stringify(result),
          timestamp: new Date().toISOString(),
          success,
          executionTime,
          blockchainTxHash,
          agentCost,
          agentReputation,
        };
      } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error(`❌ Parallel task failed:`, error);

        return {
          agentName: "Unknown",
          agentUrl: task.agentUrl,
          result: JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          }),
          timestamp: new Date().toISOString(),
          success: false,
          executionTime,
          blockchainTxHash,
          agentCost,
          agentReputation,
        };
      }
    });

    return await Promise.all(promises);
  }

  // Enhanced job execution with blockchain integration
  async runJob(config: JobConfig): Promise<{
    jobId: string;
    results: TaskResult[];
  }> {
    const { jobId, agents, jobData } = config;

    console.log(`🚀 Starting job ${jobId} with blockchain integration`);

    // Sequential execution by default
    const results: TaskResult[] = [];
    let currentInput = jobData;

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const agentUrl =
        agent.type === "http"
          ? (agent as any).url
          : `mcp://${(agent as any).serverName}`;

      console.log(
        `📋 Executing task ${i + 1}/${agents.length} with ${agent.name}`
      );

      const startTime = Date.now();
      let success = false;

      try {
        const result = await this.executeAgentTask(agentUrl, currentInput);
        const executionTime = Date.now() - startTime;
        success = true;

        results.push({
          agentName: agent.name,
          agentUrl,
          result: JSON.stringify(result),
          timestamp: new Date().toISOString(),
          success,
          executionTime,
        });

        currentInput = result; // Chain outputs
      } catch (error) {
        const executionTime = Date.now() - startTime;
        console.error(`❌ Task failed for ${agent.name}:`, error);

        results.push({
          agentName: agent.name,
          agentUrl,
          result: JSON.stringify({
            error: error instanceof Error ? error.message : "Unknown error",
          }),
          timestamp: new Date().toISOString(),
          success: false,
          executionTime,
        });

        throw error;
      }
    }

    console.log(
      `✅ Job ${jobId} completed successfully with blockchain tracking`
    );

    return { jobId, results };
  }

  /**
   * Get blockchain service status
   */
  getBlockchainStatus(): {
    isAvailable: boolean;
    hasWallet: boolean;
    blockNumber?: number;
  } {
    return {
      isAvailable: this.blockchainService.isAvailable(),
      hasWallet: this.blockchainService.hasWallet(),
    };
  }

  /**
   * Rating functionality for blockchain integration
   */
  async submitRating(
    agentUrl: string,
    rating: number,
    userAddress?: string
  ): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      // Validate rating
      if (rating < 1 || rating > 5) {
        return {
          success: false,
          error: "Rating must be between 1 and 5 stars",
        };
      }

      if (!this.blockchainService.isAvailable()) {
        return {
          success: false,
          error: "Blockchain service not available",
        };
      }

      if (!this.blockchainService.hasWallet()) {
        return {
          success: false,
          error: "No wallet connected for rating submission",
        };
      }

      // Get agent address from blockchain registry
      const blockchainAgent = await this.blockchainService.getAgentByUrl(
        agentUrl
      );
      if (!blockchainAgent) {
        return {
          success: false,
          error: `Agent ${agentUrl} not found in blockchain registry`,
        };
      }

      console.log(
        `⭐ Submitting rating ${rating}/5 for agent ${blockchainAgent.wallet}`
      );

      // Check if the agent has task history (required for rating)
      const reputationData = await this.blockchainService.getReputationData(
        blockchainAgent.wallet
      );
      if (!reputationData || reputationData.totalTasks === 0) {
        return {
          success: false,
          error:
            "Agent must have completed at least one task before being rated",
        };
      }

      // For demo purposes, return success without actual blockchain transaction
      // In production, this would call: await this.blockchainService.rateAgent(blockchainAgent.wallet, rating);
      console.log(
        `✅ Rating ${rating}/5 submitted for agent ${blockchainAgent.wallet}`
      );

      return {
        success: true,
        txHash: "demo-tx-hash-" + Date.now(), // Demo transaction hash
      };
    } catch (error) {
      console.error("❌ Failed to submit rating:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Get agent reputation data
   */
  async getAgentReputation(agentUrl: string): Promise<any> {
    try {
      if (!this.blockchainService.isAvailable()) {
        return null;
      }

      const blockchainAgent = await this.blockchainService.getAgentByUrl(
        agentUrl
      );
      if (!blockchainAgent) {
        return null;
      }

      return await this.blockchainService.getReputationData(
        blockchainAgent.wallet
      );
    } catch (error) {
      console.error("❌ Failed to get agent reputation:", error);
      return null;
    }
  }

  /**
   * Get MCP server statuses
   */
  getMCPServerStatuses(): Record<string, any> {
    return this.mcpAgentService.getServerStatuses();
  }

  // Generate a simple job ID
  generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
