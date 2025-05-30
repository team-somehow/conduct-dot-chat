import { parseEther, keccak256, toBytes } from "viem";
import { HttpAgent, loadAgent, runAgent } from "./agents.http";
import { write } from "./Contract";

export interface JobConfig {
  jobId: `0x${string}`;
  totalBudget: bigint;
  jobData: any;
  agents: HttpAgent[];
}

export interface TaskResult {
  agentWallet: `0x${string}`;
  payment: bigint;
  result: string;
  rating: number;
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

  // Create a new job on-chain
  async createJob(
    user: `0x${string}`,
    jobData: any,
    totalBudget: bigint
  ): Promise<`0x${string}`> {
    const jobId = keccak256(
      toBytes(user + Date.now().toString())
    ) as `0x${string}`;

    await write(
      "taskHub",
      "createJob",
      [jobId, JSON.stringify(jobData)],
      totalBudget
    );

    return jobId;
  }

  // Execute a single agent task
  async executeTask<TIn, TOut>(
    agent: HttpAgent,
    input: TIn,
    jobId: `0x${string}`,
    payment: bigint
  ): Promise<TOut> {
    try {
      const result = await runAgent<TIn, TOut>(agent, input);

      // Pay the agent on-chain
      await write("taskHub", "payAgent", [
        jobId,
        agent.wallet,
        payment,
        JSON.stringify(result),
      ]);

      return result;
    } catch (error) {
      console.error(`Task execution failed for ${agent.name}:`, error);
      throw error;
    }
  }

  // Execute multiple agents in sequence
  async executeSequentialTasks(
    jobId: `0x${string}`,
    tasks: Array<{
      agent: HttpAgent;
      input: any;
      payment: bigint;
    }>
  ): Promise<any[]> {
    const results: any[] = [];

    for (const task of tasks) {
      const result = await this.executeTask(
        task.agent,
        task.input,
        jobId,
        task.payment
      );
      results.push(result);
    }

    return results;
  }

  // Execute multiple agents in parallel
  async executeParallelTasks(
    jobId: `0x${string}`,
    tasks: Array<{
      agent: HttpAgent;
      input: any;
      payment: bigint;
    }>
  ): Promise<any[]> {
    const promises = tasks.map((task) =>
      this.executeTask(task.agent, task.input, jobId, task.payment)
    );

    return await Promise.all(promises);
  }

  // Pay orchestrator fee
  async payOrchestrator(jobId: `0x${string}`, fee: bigint): Promise<void> {
    await write("taskHub", "payOrchestrator", [jobId, fee]);
  }

  // Complete job with ratings
  async completeJob(
    jobId: `0x${string}`,
    agentWallets: `0x${string}`[],
    ratings: number[]
  ): Promise<void> {
    await write("taskHub", "completeJob", [jobId, agentWallets, ratings]);
  }

  // Full job execution pipeline
  async runJob(config: JobConfig): Promise<{
    jobId: `0x${string}`;
    results: any[];
  }> {
    const { jobId, agents, jobData } = config;

    console.log(`🚀 Starting job ${jobId}`);

    // Example: Sequential execution (can be customized)
    const results: any[] = [];
    let currentInput = jobData;

    for (let i = 0; i < agents.length; i++) {
      const agent = agents[i];
      const payment = parseEther("0.01"); // Customize payment logic

      console.log(
        `📋 Executing task ${i + 1}/${agents.length} with ${agent.name}`
      );

      const result = await this.executeTask(
        agent,
        currentInput,
        jobId,
        payment
      );

      results.push(result);
      currentInput = result; // Chain outputs
    }

    // Pay orchestrator fee
    await this.payOrchestrator(jobId, parseEther("0.005"));

    // Rate all agents (5 stars for demo)
    const ratings = new Array(agents.length).fill(5);
    await this.completeJob(
      jobId,
      agents.map((a) => a.wallet),
      ratings
    );

    console.log(`✅ Job ${jobId} completed successfully`);

    return { jobId, results };
  }
}
