import { ethers } from "ethers";
import fs from "fs";
import path from "path";

// Contract addresses (these would be loaded from environment variables in production)
const CONTRACT_ADDRESSES = {
  AgentRegistry:
    process.env.AGENT_REGISTRY_ADDRESS ||
    "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  ReputationLayer:
    process.env.REPUTATION_LAYER_ADDRESS ||
    "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  OrchestrationContract:
    process.env.ORCHESTRATION_CONTRACT_ADDRESS ||
    "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
};

// Load ABIs from the protocol directory
function loadABI(contractName: string): any {
  try {
    const abiPath = path.join(
      __dirname,
      "../../protocol/out",
      `${contractName}.sol`,
      `${contractName}.json`
    );
    if (fs.existsSync(abiPath)) {
      const abiFile = JSON.parse(fs.readFileSync(abiPath, "utf8"));
      return abiFile.abi;
    } else {
      console.warn(`❌ ABI file not found for ${contractName} at ${abiPath}`);
      return [];
    }
  } catch (error) {
    console.error(`❌ Error loading ABI for ${contractName}:`, error);
    return [];
  }
}

export interface BlockchainAgent {
  wallet: string;
  agentUrl: string;
  metadataURI: string;
  baseCostPerTask: bigint;
  agentType: number;
  isActive: boolean;
  registeredAt: number;
  agentOwner: string;
}

export interface BlockchainTask {
  taskId: string;
  orchestrator: string;
  agent: string;
  payment: bigint;
  inputHash: string;
  outputHash: string;
  deadline: number;
  status: number;
  createdAt: number;
  executionTime: number;
}

export class BlockchainService {
  private provider: ethers.Provider | null = null;
  private wallet: ethers.Wallet | null = null;
  private agentRegistry: ethers.Contract | null = null;
  private reputationLayer: ethers.Contract | null = null;
  private orchestrationContract: ethers.Contract | null = null;
  private isInitialized = false;

  constructor(
    private rpcUrl: string = process.env.RPC_URL || "http://localhost:8545",
    private privateKey?: string
  ) {
    this.initialize().catch((error) => {
      console.error("❌ Failed to initialize blockchain service:", error);
    });
  }

  private async initialize(): Promise<void> {
    try {
      // Initialize provider
      this.provider = new ethers.JsonRpcProvider(this.rpcUrl);

      // Initialize wallet if private key is provided
      if (this.privateKey) {
        this.wallet = new ethers.Wallet(this.privateKey, this.provider);
      }

      // Load contract ABIs
      const agentRegistryABI = loadABI("AgentRegistry");
      const reputationLayerABI = loadABI("ReputationLayer");
      const orchestrationContractABI = loadABI("OrchestrationContract");

      // Initialize contracts
      const signer = this.wallet || this.provider;

      this.agentRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.AgentRegistry,
        agentRegistryABI,
        signer
      );

      this.reputationLayer = new ethers.Contract(
        CONTRACT_ADDRESSES.ReputationLayer,
        reputationLayerABI,
        signer
      );

      this.orchestrationContract = new ethers.Contract(
        CONTRACT_ADDRESSES.OrchestrationContract,
        orchestrationContractABI,
        signer
      );

      this.isInitialized = true;
      console.log("✅ Blockchain service initialized");
      console.log(`📍 RPC URL: ${this.rpcUrl}`);
      console.log(`🔑 Wallet: ${this.wallet ? "Connected" : "Not connected"}`);
    } catch (error) {
      console.error("❌ Failed to initialize blockchain service:", error);
      // Don't throw here - allow graceful fallbacks
    }
  }

  /**
   * Agent Registry Methods
   */

  async getActiveAgents(): Promise<BlockchainAgent[]> {
    try {
      if (!this.isInitialized || !this.agentRegistry) {
        throw new Error("Blockchain service not initialized");
      }

      console.log("🔍 Fetching active agents from blockchain...");
      const agents = await this.agentRegistry.getActiveAgents();

      const processedAgents = agents.map((agent: any) => ({
        wallet: agent.wallet,
        agentUrl: agent.agentUrl,
        metadataURI: agent.metadataURI,
        baseCostPerTask: agent.baseCostPerTask,
        agentType: Number(agent.agentType),
        isActive: agent.isActive,
        registeredAt: Number(agent.registeredAt),
        agentOwner: agent.agentOwner,
      }));

      console.log(
        `✅ Found ${processedAgents.length} active agents on blockchain`
      );
      return processedAgents;
    } catch (error) {
      console.error("❌ Failed to get active agents from blockchain:", error);
      return []; // Return empty array as fallback
    }
  }

  async getAgentByUrl(url: string): Promise<BlockchainAgent | null> {
    try {
      if (!this.isInitialized || !this.agentRegistry) {
        throw new Error("Blockchain service not initialized");
      }

      const agent = await this.agentRegistry.getAgentByUrl(url);
      return {
        wallet: agent.wallet,
        agentUrl: agent.agentUrl,
        metadataURI: agent.metadataURI,
        baseCostPerTask: agent.baseCostPerTask,
        agentType: Number(agent.agentType),
        isActive: agent.isActive,
        registeredAt: Number(agent.registeredAt),
        agentOwner: agent.agentOwner,
      };
    } catch (error) {
      console.warn(`⚠️ Agent not found on blockchain for URL: ${url}`);
      return null;
    }
  }

  /**
   * Reputation Layer Methods
   */

  async recordTaskCompletion(
    agentAddress: string,
    success: boolean,
    latency: number
  ): Promise<string | null> {
    try {
      if (!this.wallet || !this.reputationLayer) {
        console.warn(
          "⚠️ No wallet connected, cannot record task completion on blockchain"
        );
        return null;
      }

      console.log(
        `📊 Recording task completion for ${agentAddress}: success=${success}, latency=${latency}s`
      );

      const tx = await this.reputationLayer.recordTaskCompletion(
        agentAddress,
        success,
        latency
      );

      await tx.wait();
      console.log("✅ Task completion recorded on blockchain");
      return tx.hash;
    } catch (error) {
      console.error("❌ Failed to record task completion:", error);
      return null;
    }
  }

  async getReputationData(agentAddress: string): Promise<any> {
    try {
      if (!this.isInitialized || !this.reputationLayer) {
        throw new Error("Blockchain service not initialized");
      }

      const data = await this.reputationLayer.getReputationData(agentAddress);
      return {
        totalTasks: Number(data.totalTasks),
        successfulTasks: Number(data.successfulTasks),
        averageLatency: Number(data.averageLatency),
        averageRating: Number(data.averageRating) / 100, // Convert from basis points
        reputationScore: Number(data.reputationScore),
      };
    } catch (error) {
      console.error(
        `❌ Failed to get reputation data for ${agentAddress}:`,
        error
      );
      return null;
    }
  }

  async getTopAgents(
    count: number = 10
  ): Promise<{ agents: string[]; scores: number[] }> {
    try {
      if (!this.isInitialized || !this.reputationLayer) {
        throw new Error("Blockchain service not initialized");
      }

      const result = await this.reputationLayer.getTopAgents(count);
      return {
        agents: result.topAgents,
        scores: result.scores.map((score: any) => Number(score)),
      };
    } catch (error) {
      console.error("❌ Failed to get top agents:", error);
      return { agents: [], scores: [] };
    }
  }

  /**
   * Orchestration Contract Methods
   */

  async createTask(
    agentAddress: string,
    inputHash: string,
    deadline: number,
    paymentAmount: bigint
  ): Promise<string | null> {
    try {
      if (!this.wallet || !this.orchestrationContract) {
        console.warn(
          "⚠️ No wallet connected, cannot create task on blockchain"
        );
        return null;
      }

      console.log(
        `💰 Creating blockchain task for ${agentAddress} with payment ${ethers.formatEther(
          paymentAmount
        )} ETH`
      );

      const tx = await this.orchestrationContract.createTask(
        agentAddress,
        inputHash,
        deadline,
        { value: paymentAmount }
      );

      await tx.wait();
      console.log("✅ Task created on blockchain");
      return tx.hash;
    } catch (error) {
      console.error("❌ Failed to create task:", error);
      return null;
    }
  }

  async submitTaskResult(
    taskId: string,
    outputHash: string
  ): Promise<string | null> {
    try {
      if (!this.wallet || !this.orchestrationContract) {
        console.warn("⚠️ No wallet connected, cannot submit task result");
        return null;
      }

      console.log(`📤 Submitting task result for ${taskId}`);

      const tx = await this.orchestrationContract.submitTaskResult(
        taskId,
        outputHash
      );
      await tx.wait();

      console.log("✅ Task result submitted on blockchain");
      return tx.hash;
    } catch (error) {
      console.error("❌ Failed to submit task result:", error);
      return null;
    }
  }

  /**
   * Utility Methods
   */

  isAvailable(): boolean {
    return this.isInitialized;
  }

  hasWallet(): boolean {
    return this.wallet !== null;
  }

  async getBlockNumber(): Promise<number> {
    try {
      if (!this.provider) {
        throw new Error("Provider not initialized");
      }
      return await this.provider.getBlockNumber();
    } catch (error) {
      console.error("❌ Failed to get block number:", error);
      return 0;
    }
  }

  /**
   * Integration Helper Methods
   */

  // Convert blockchain agent to orchestrator agent format
  blockchainToOrchestratorAgent(
    blockchainAgent: BlockchainAgent,
    metadata?: any
  ): any {
    return {
      name: metadata?.name || `Agent ${blockchainAgent.wallet.slice(0, 8)}`,
      url: blockchainAgent.agentUrl,
      description: metadata?.description || "Blockchain-registered agent",
      wallet: blockchainAgent.wallet as `0x${string}`,
      vendor: metadata?.vendor,
      category: metadata?.category,
      tags: metadata?.tags || [],
      pricing: {
        model: "per-task",
        amount: Number(ethers.formatEther(blockchainAgent.baseCostPerTask)),
        currency: "ETH",
        unit: "task",
      },
      rating: {
        score: 0, // Will be populated from reputation data
        reviews: 0,
        lastUpdated: new Date().toISOString(),
      },
      performance: {
        avgResponseTime: 0, // Will be populated from reputation data
        uptime: blockchainAgent.isActive ? 100 : 0,
        successRate: 0, // Will be populated from reputation data
      },
      previewURI: metadata?.previewURI || blockchainAgent.metadataURI,
    };
  }

  // Generate task hash for blockchain
  generateTaskHash(input: any): string {
    const inputString =
      typeof input === "string" ? input : JSON.stringify(input);
    return ethers.keccak256(ethers.toUtf8Bytes(inputString));
  }

  // Generate deadline timestamp (current time + hours)
  generateDeadline(hoursFromNow: number = 1): number {
    return Math.floor(Date.now() / 1000) + hoursFromNow * 3600;
  }
}

// Factory function to create blockchain service
export function createBlockchainService(
  rpcUrl?: string,
  privateKey?: string
): BlockchainService {
  return new BlockchainService(rpcUrl, privateKey);
}

export default BlockchainService;
