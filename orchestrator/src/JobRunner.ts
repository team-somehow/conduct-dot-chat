import { HttpAgent, loadAgent, runAgent } from "./agents.http";
import { AGENT_ENDPOINTS } from "./config";

export interface JobConfig {
  jobId: string;
  jobData: any;
  agents: HttpAgent[];
}

export interface TaskResult {
  agentName: string;
  agentUrl: string;
  result: string;
  timestamp: string;
}

export class JobRunner {
  private agents: Map<string, HttpAgent> = new Map();

  constructor() {}

  // Load and cache an agent
  async loadAgent(url: string): Promise<HttpAgent> {
    if (this.agents.has(url)) {
      return this.agents.get(url)!;
    }

    const agent = await loadAgent(url);
    this.agents.set(url, agent);
    return agent;
  }

  // Discover all available agents
  async discoverAgents(): Promise<HttpAgent[]> {
    const agents: HttpAgent[] = [];

    for (const endpoint of AGENT_ENDPOINTS) {
      try {
        const agent = await this.loadAgent(endpoint);
        agents.push(agent);
        console.log(`✅ Discovered agent: ${agent.name} (${endpoint})`);
      } catch (error: any) {
        console.log(`❌ Failed to load agent from ${endpoint}:`, error.message);
      }
    }

    return agents;
  }

  // Execute a single agent task
  async executeAgentTask<TIn, TOut>(
    agentUrl: string,
    input: TIn
  ): Promise<TOut> {
    try {
      const agent = await this.loadAgent(agentUrl);
      const result = await runAgent<TIn, TOut>(agent, input);

      console.log(`✅ Task completed by ${agent.name}`);
      return result;
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
        const agent = await this.loadAgent(task.agentUrl);
        const result = await runAgent(agent, task.input);

        results.push({
          agentName: agent.name,
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
        const agent = await this.loadAgent(task.agentUrl);
        const result = await runAgent(agent, task.input);

        return {
          agentName: agent.name,
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

  // Full job execution pipeline (HTTP-only)
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

      console.log(
        `📋 Executing task ${i + 1}/${agents.length} with ${agent.name}`
      );

      try {
        const result = await runAgent(agent, currentInput);

        results.push({
          agentName: agent.name,
          agentUrl: agent.url,
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

  // Generate a simple job ID
  generateJobId(): string {
    return `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
