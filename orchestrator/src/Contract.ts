import {
  createWalletClient,
  createPublicClient,
  http,
  parseAbi,
  Abi,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { mainnet, sepolia } from "viem/chains";
import { config } from "./config";

// Contract ABIs (simplified for demo)
const agentStoreAbiStrings = [
  "function upsert(string name, string description, string inputSchema, string previewURI) external payable",
  "function getAgent(address wallet) external view returns (string, string, string, string)",
] as const;

const taskHubAbiStrings = [
  "function createJob(bytes32 jobId, string jobData) external payable",
  "function payAgent(bytes32 jobId, address agent, uint256 amount, string result) external",
  "function payOrchestrator(bytes32 jobId, uint256 amount) external",
  "function completeJob(bytes32 jobId, address[] agents, uint8[] ratings) external",
] as const;

const AGENT_STORE_ABI = parseAbi(agentStoreAbiStrings);
const TASK_HUB_ABI = parseAbi(taskHubAbiStrings);

// Setup clients
const account = privateKeyToAccount(config.ORCH_PRIV_KEY as `0x${string}`);

const publicClient = createPublicClient({
  chain: sepolia, // Change to mainnet for production
  transport: http(config.RPC_URL),
});

const walletClient = createWalletClient({
  account,
  chain: sepolia, // Change to mainnet for production
  transport: http(config.RPC_URL),
});

// Generic write function with proper typing
export async function write(
  contractName: "agentStore" | "taskHub",
  functionName: string,
  args: any[],
  value?: bigint
) {
  const address =
    contractName === "agentStore"
      ? config.AGENT_STORE_ADDRESS
      : config.TASK_HUB_ADDRESS;

  if (contractName === "agentStore") {
    if (functionName === "upsert") {
      const { request } = await publicClient.simulateContract({
        address,
        abi: AGENT_STORE_ABI,
        functionName: "upsert",
        args: args as [string, string, string, string],
        value,
        account,
      });

      const hash = await walletClient.writeContract(request);
      return await publicClient.waitForTransactionReceipt({ hash });
    }
  } else {
    // taskHub
    if (functionName === "createJob") {
      const { request } = await publicClient.simulateContract({
        address,
        abi: TASK_HUB_ABI,
        functionName: "createJob",
        args: args as [`0x${string}`, string],
        value,
        account,
      });

      const hash = await walletClient.writeContract(request);
      return await publicClient.waitForTransactionReceipt({ hash });
    } else if (functionName === "payAgent") {
      const { request } = await publicClient.simulateContract({
        address,
        abi: TASK_HUB_ABI,
        functionName: "payAgent",
        args: args as [`0x${string}`, `0x${string}`, bigint, string],
        account,
      });

      const hash = await walletClient.writeContract(request);
      return await publicClient.waitForTransactionReceipt({ hash });
    } else if (functionName === "payOrchestrator") {
      const { request } = await publicClient.simulateContract({
        address,
        abi: TASK_HUB_ABI,
        functionName: "payOrchestrator",
        args: args as [`0x${string}`, bigint],
        account,
      });

      const hash = await walletClient.writeContract(request);
      return await publicClient.waitForTransactionReceipt({ hash });
    } else if (functionName === "completeJob") {
      const { request } = await publicClient.simulateContract({
        address,
        abi: TASK_HUB_ABI,
        functionName: "completeJob",
        args: args as [`0x${string}`, `0x${string}`[], number[]],
        account,
      });

      const hash = await walletClient.writeContract(request);
      return await publicClient.waitForTransactionReceipt({ hash });
    }
  }

  throw new Error(`Unknown function: ${contractName}.${functionName}`);
}

// Generic read function with proper typing
export async function read(
  contractName: "agentStore" | "taskHub",
  functionName: string,
  args: any[] = []
) {
  const address =
    contractName === "agentStore"
      ? config.AGENT_STORE_ADDRESS
      : config.TASK_HUB_ADDRESS;

  if (contractName === "agentStore") {
    if (functionName === "getAgent") {
      return await publicClient.readContract({
        address,
        abi: AGENT_STORE_ABI,
        functionName: "getAgent",
        args: args as [`0x${string}`],
      });
    }
  }

  throw new Error(`Unknown function: ${contractName}.${functionName}`);
}

// Utility functions for common operations
export async function upsertAgent(
  name: string,
  description: string,
  inputSchema: string,
  previewURI: string,
  value?: bigint
) {
  return write(
    "agentStore",
    "upsert",
    [name, description, inputSchema, previewURI],
    value
  );
}

export async function createJob(
  jobId: `0x${string}`,
  jobData: string,
  value: bigint
) {
  return write("taskHub", "createJob", [jobId, jobData], value);
}

export async function payAgent(
  jobId: `0x${string}`,
  agentWallet: `0x${string}`,
  amount: bigint,
  result: string
) {
  return write("taskHub", "payAgent", [jobId, agentWallet, amount, result]);
}

export async function payOrchestrator(jobId: `0x${string}`, amount: bigint) {
  return write("taskHub", "payOrchestrator", [jobId, amount]);
}

export async function completeJob(
  jobId: `0x${string}`,
  agentWallets: `0x${string}`[],
  ratings: number[]
) {
  return write("taskHub", "completeJob", [jobId, agentWallets, ratings]);
}

export async function getAgent(wallet: `0x${string}`) {
  return read("agentStore", "getAgent", [wallet]);
}
