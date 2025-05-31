import { HttpAgent, loadAgent, runAgent } from "./agents.http";
import { AGENTS, loadMCPConfig, validateMCPConfig } from "./config";
import { AgentMetadata, JobData, TaskExecution, Agent } from "./types";
import { MCPManager } from "./MCPManager";
import { MCPAgentService, MCPAgentAdapter } from "./MCPAgent";

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
}

export class JobRunner {
  private httpAgents: Map<string, HttpAgent> = new Map();
  private mcpManager: MCPManager;
  private mcpAgentService: MCPAgentService;
  private mcpAgentAdapters: Map<string, MCPAgentAdapter> = new Map();

  constructor() {
    this.mcpManager = new MCPManager();
    this.mcpAgentService = new MCPAgentService(this.mcpManager);
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

  // Discover all available agents (both HTTP and MCP)
  async discoverAgents(): Promise<Agent[]> {
    const agents: Agent[] = [];

    // Discover HTTP agents
    for (const endpoint of AGENTS) {
      try {
        const httpAgent = await this.loadAgent(endpoint);
        agents.push({
          type: "http",
          url: httpAgent.url,
          name: httpAgent.name,
          description: httpAgent.description,
          wallet: httpAgent.wallet,
          vendor: httpAgent.vendor,
          category: httpAgent.category,
          tags: httpAgent.tags,
          pricing: httpAgent.pricing,
          rating: httpAgent.rating,
          performance: httpAgent.performance,
          inputSchema: {}, // Will be filled by validation function
          outputSchema: {},
          previewURI: httpAgent.previewURI,
        } as Agent);
        console.log(
          `✅ Discovered HTTP agent: ${httpAgent.name} (${endpoint})`
        );
      } catch (error: any) {
        console.log(
          `❌ Failed to load HTTP agent from ${endpoint}:`,
          error.message
        );
      }
    }

    // Discover MCP agents
    try {
      await this.refreshMCPAgents();
      for (const [url, adapter] of this.mcpAgentAdapters) {
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

    return agents;
  }

  // Execute a single agent task (supports both HTTP and MCP)
  async executeAgentTask<TIn, TOut>(
    agentUrl: string,
    input: TIn
  ): Promise<TOut> {
    try {
      // Check if it's an MCP agent
      if (MCPAgentService.isMCPUrl(agentUrl)) {
        const adapter = this.mcpAgentAdapters.get(agentUrl);
        if (!adapter) {
          throw new Error(`MCP agent not found: ${agentUrl}`);
        }

        const result = await this.mcpAgentService.runMCPAgent<TIn, TOut>(
          adapter,
          input
        );
        console.log(`✅ MCP task completed by ${adapter.name}`);
        return result;
      } else {
        // HTTP agent
        const agent = await this.loadAgent(agentUrl);
        const result = await runAgent<TIn, TOut>(agent, input);
        console.log(`✅ HTTP task completed by ${agent.name}`);
        return result;
      }
    } catch (error) {
      console.error(`❌ Task execution failed for ${agentUrl}:`, error);
      throw error;
    }
  }

  // Execute multiple agents in sequence
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

      try {
        let agentName: string;

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

        results.push({
          agentName,
          agentUrl: task.agentUrl,
          result: JSON.stringify(result),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error(`❌ Task ${i + 1} failed:`, error);
        throw error;
      }
    }

    return results;
  }

  // Execute multiple agents in parallel
  async executeParallelTasks(
    jobId: string,
    tasks: Array<{
      agentUrl: string;
      input: any;
    }>
  ): Promise<TaskResult[]> {
    const promises = tasks.map(async (task) => {
      try {
        let agentName: string;

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

        return {
          agentName,
          agentUrl: task.agentUrl,
          result: JSON.stringify(result),
          timestamp: new Date().toISOString(),
        };
      } catch (error) {
        console.error(`❌ Parallel task failed for ${task.agentUrl}:`, error);
        throw error;
      }
    });

    return await Promise.all(promises);
  }

  // Full job execution pipeline (supports both HTTP and MCP)
  async runJob(config: JobConfig): Promise<{
    jobId: string;
    results: TaskResult[];
  }> {
    const { jobId, agents, jobData } = config;

    console.log(`🚀 Starting job ${jobId}`);

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

      try {
        const result = await this.executeAgentTask(agentUrl, currentInput);

        results.push({
          agentName: agent.name,
          agentUrl,
          result: JSON.stringify(result),
          timestamp: new Date().toISOString(),
        });

        currentInput = result; // Chain outputs
      } catch (error) {
        console.error(`❌ Task failed for ${agent.name}:`, error);
        throw error;
      }
    }

    console.log(`✅ Job ${jobId} completed successfully`);

    return { jobId, results };
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
