import { ethers } from "ethers";
import AgentRegistryABI from "../abis/AgentRegistry.json";
import ReputationLayerABI from "../abis/ReputationLayer.json";
import OrchestrationContractABI from "../abis/OrchestrationContract.json";

// Contract addresses (these would be updated after deployment)
const CONTRACT_ADDRESSES = {
  AgentRegistry: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  ReputationLayer: "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
  OrchestrationContract: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
};

// Fallback RPC URL for local development
const FALLBACK_RPC_URL = "http://localhost:8545";

export interface AgentData {
  wallet: string;
  agentUrl: string;
  metadataURI: string;
  baseCostPerTask: string;
  agentType: number;
  isActive: boolean;
  registeredAt: string;
  agentOwner: string;
}

export interface ReputationData {
  totalTasks: number;
  successfulTasks: number;
  averageLatency: number;
  averageRating: number;
  reputationScore: number;
}

export interface TaskData {
  orchestrator: string;
  agent: string;
  payment: string;
  inputHash: string;
  outputHash: string;
  deadline: string;
  status: number;
  createdAt: string;
  executionTime: string;
}

export class BlockchainService {
  private provider: ethers.Provider | null = null;
  private signer: ethers.Signer | null = null;
  private agentRegistry: ethers.Contract | null = null;
  private reputationLayer: ethers.Contract | null = null;
  private orchestrationContract: ethers.Contract | null = null;
  private isInitialized = false;

  constructor() {
    this.initialize().catch(console.error);
  }

  private async initialize(): Promise<void> {
    try {
      // Try to get provider from window.ethereum (MetaMask, etc.)
      if (typeof window !== "undefined" && window.ethereum) {
        this.provider = new ethers.BrowserProvider(window.ethereum);
        // @ts-ignore
        this.signer = await this.provider.getSigner();
      } else {
        // Fallback to JSON-RPC provider for local development
        console.warn("No Web3 provider found, using fallback RPC");
        this.provider = new ethers.JsonRpcProvider(FALLBACK_RPC_URL);
      }

      // Initialize contracts
      this.agentRegistry = new ethers.Contract(
        CONTRACT_ADDRESSES.AgentRegistry,
        AgentRegistryABI.abi,
        this.signer || this.provider
      );

      this.reputationLayer = new ethers.Contract(
        CONTRACT_ADDRESSES.ReputationLayer,
        ReputationLayerABI.abi,
        this.signer || this.provider
      );

      this.orchestrationContract = new ethers.Contract(
        CONTRACT_ADDRESSES.OrchestrationContract,
        OrchestrationContractABI.abi,
        this.signer || this.provider
      );

      this.isInitialized = true;
      console.log("✅ Blockchain service initialized");
    } catch (error) {
      console.error("❌ Failed to initialize blockchain service:", error);
      // Don't throw here - we want graceful fallbacks
    }
  }

  /**
   * Agent Registry Methods
   */

  async getActiveAgents(): Promise<AgentData[]> {
    try {
      if (!this.isInitialized || !this.agentRegistry) {
        throw new Error("Blockchain service not initialized");
      }

      const agents = await this.agentRegistry.getActiveAgents();
      return agents.map((agent: any) => ({
        wallet: agent.wallet,
        agentUrl: agent.agentUrl,
        metadataURI: agent.metadataURI,
        baseCostPerTask: ethers.formatEther(agent.baseCostPerTask),
        agentType: agent.agentType,
        isActive: agent.isActive,
        registeredAt: new Date(Number(agent.registeredAt) * 1000).toISOString(),
        agentOwner: agent.agentOwner,
      }));
    } catch (error) {
      console.error("❌ Failed to get active agents from blockchain:", error);
      return []; // Return empty array as fallback
    }
  }

  async getAgentByUrl(url: string): Promise<AgentData | null> {
    try {
      if (!this.isInitialized || !this.agentRegistry) {
        throw new Error("Blockchain service not initialized");
      }

      const agent = await this.agentRegistry.getAgentByUrl(url);
      return {
        wallet: agent.wallet,
        agentUrl: agent.agentUrl,
        metadataURI: agent.metadataURI,
        baseCostPerTask: ethers.formatEther(agent.baseCostPerTask),
        agentType: agent.agentType,
        isActive: agent.isActive,
        registeredAt: new Date(Number(agent.registeredAt) * 1000).toISOString(),
        agentOwner: agent.agentOwner,
      };
    } catch (error) {
      console.error(`❌ Failed to get agent by URL ${url}:`, error);
      return null;
    }
  }

  async registerAgent(
    agentWallet: string,
    agentUrl: string,
    metadataURI: string,
    baseCostPerTask: string,
    agentType: number
  ): Promise<string | null> {
    try {
      if (!this.signer || !this.agentRegistry) {
        throw new Error("No signer available or contract not initialized");
      }

      const tx = await this.agentRegistry.registerAgent(
        agentWallet,
        agentUrl,
        metadataURI,
        ethers.parseEther(baseCostPerTask),
        agentType
      );

      await tx.wait();
      console.log("✅ Agent registered successfully");
      return tx.hash;
    } catch (error) {
      console.error("❌ Failed to register agent:", error);
      return null;
    }
  }

  /**
   * Reputation Layer Methods
   */

  async getReputationData(
    agentAddress: string
  ): Promise<ReputationData | null> {
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

  async rateAgent(
    agentAddress: string,
    rating: number
  ): Promise<string | null> {
    try {
      if (!this.signer || !this.reputationLayer) {
        throw new Error("No signer available or contract not initialized");
      }

      if (rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }

      const tx = await this.reputationLayer.rateAgent(agentAddress, rating);
      await tx.wait();

      console.log(`✅ Agent ${agentAddress} rated ${rating} stars`);
      return tx.hash;
    } catch (error) {
      console.error(`❌ Failed to rate agent ${agentAddress}:`, error);
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
    paymentAmount: string
  ): Promise<string | null> {
    try {
      if (!this.signer || !this.orchestrationContract) {
        throw new Error("No signer available or contract not initialized");
      }

      const tx = await this.orchestrationContract.createTask(
        agentAddress,
        inputHash,
        deadline,
        { value: ethers.parseEther(paymentAmount) }
      );

      await tx.wait();
      console.log("✅ Task created successfully");
      return tx.hash;
    } catch (error) {
      console.error("❌ Failed to create task:", error);
      return null;
    }
  }

  async getTask(taskId: string): Promise<TaskData | null> {
    try {
      if (!this.isInitialized || !this.orchestrationContract) {
        throw new Error("Blockchain service not initialized");
      }

      const task = await this.orchestrationContract.getTask(taskId);
      return {
        orchestrator: task.orchestrator,
        agent: task.agent,
        payment: ethers.formatEther(task.payment),
        inputHash: task.inputHash,
        outputHash: task.outputHash,
        deadline: new Date(Number(task.deadline) * 1000).toISOString(),
        status: Number(task.status),
        createdAt: new Date(Number(task.createdAt) * 1000).toISOString(),
        executionTime: Number(task.executionTime).toString(),
      };
    } catch (error) {
      console.error(`❌ Failed to get task ${taskId}:`, error);
      return null;
    }
  }

  /**
   * Utility Methods
   */

  async connectWallet(): Promise<boolean> {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        await window.ethereum.request({ method: "eth_requestAccounts" });
        await this.initialize(); // Re-initialize with connected wallet
        return true;
      }
      return false;
    } catch (error) {
      console.error("❌ Failed to connect wallet:", error);
      return false;
    }
  }

  async getConnectedAddress(): Promise<string | null> {
    try {
      if (this.signer) {
        return await this.signer.getAddress();
      }
      return null;
    } catch (error) {
      console.error("❌ Failed to get connected address:", error);
      return null;
    }
  }

  isConnected(): boolean {
    return this.signer !== null;
  }

  hasBlockchainConnection(): boolean {
    return this.isInitialized;
  }
}

// Singleton instance
export const blockchainService = new BlockchainService();

// Helper function to get agent metadata from IPFS
export async function getAgentMetadata(metadataURI: string): Promise<any> {
  try {
    if (metadataURI.startsWith("ipfs://")) {
      // Convert IPFS URI to HTTP gateway URL
      const ipfsHash = metadataURI.replace("ipfs://", "");
      const gatewayUrl = `https://ipfs.io/ipfs/${ipfsHash}`;

      const response = await fetch(gatewayUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }

      return await response.json();
    } else if (metadataURI.startsWith("http")) {
      const response = await fetch(metadataURI);
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }

      return await response.json();
    } else {
      // Assume it's already JSON data
      return JSON.parse(metadataURI);
    }
  } catch (error) {
    console.error(
      `❌ Failed to get agent metadata from ${metadataURI}:`,
      error
    );
    return null;
  }
}

export default blockchainService;
