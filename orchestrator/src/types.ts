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

// Workflow-related types
export interface WorkflowStep {
  stepId: string;
  agentUrl: string;
  agentName: string;
  description: string;
  inputMapping?: Record<string, string>; // Maps workflow variables to agent inputs
  outputMapping?: Record<string, string>; // Maps agent outputs to workflow variables
  condition?: string; // Optional condition for conditional execution
}

export interface WorkflowDefinition {
  workflowId: string;
  name: string;
  description: string;
  userIntent: string;
  steps: WorkflowStep[];
  executionMode: "sequential" | "parallel" | "conditional";
  estimatedDuration?: number;
  createdAt: number;
  variables?: Record<string, any>; // Workflow-level variables
}

export interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  startedAt: number;
  completedAt?: number;
  input: any;
  output?: any;
  stepResults: Array<{
    stepId: string;
    status: "pending" | "running" | "completed" | "failed" | "skipped";
    input?: any;
    output?: any;
    error?: string;
    startedAt?: number;
    completedAt?: number;
  }>;
  error?: string;
}

export interface UserIntent {
  description: string;
  context?: Record<string, any>;
  preferences?: {
    speed?: "fast" | "balanced" | "thorough";
    quality?: "standard" | "high";
    cost?: "low" | "medium" | "high";
  };
}
