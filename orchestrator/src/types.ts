// src/types.ts
// Common types and interfaces for the MAHA orchestrator

export interface AgentMetadata {
  name: string;
  description: string;
  wallet: `0x${string}`;
  inputSchema: any; // JSON Schema
  outputSchema: any; // JSON Schema
  previewURI: string;
}

export interface JobData {
  prompt?: string;
  [key: string]: any;
}

export interface TaskExecution {
  agentUrl: string;
  agentWallet: `0x${string}`;
  input: any;
  output: any;
  payment: bigint;
  timestamp: number;
  success: boolean;
  error?: string;
}

export interface JobExecution {
  jobId: `0x${string}`;
  user: `0x${string}`;
  totalBudget: bigint;
  jobData: JobData;
  tasks: TaskExecution[];
  orchestratorFee: bigint;
  status: "created" | "running" | "completed" | "failed";
  createdAt: number;
  completedAt?: number;
}

export interface AgentHealth {
  url: string;
  name: string;
  status: "healthy" | "unhealthy" | "unknown";
  responseTime?: number;
  lastChecked: number;
  error?: string;
}

export interface OrchestratorConfig {
  rpcUrl: string;
  privateKey: `0x${string}`;
  agentStoreAddress: `0x${string}`;
  taskHubAddress: `0x${string}`;
  agentEndpoints: string[];
  defaultTimeout: number;
  maxRetries: number;
}

export interface PaymentDistribution {
  agentPayments: Array<{
    wallet: `0x${string}`;
    amount: bigint;
  }>;
  orchestratorFee: bigint;
  totalPaid: bigint;
  remaining: bigint;
}
