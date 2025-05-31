import axios from "axios";

// Configuration
const ORCHESTRATOR_BASE_URL =
  import.meta.env.VITE_ORCHESTRATOR_URL || "http://localhost:8080";

const api = axios.create({
  baseURL: ORCHESTRATOR_BASE_URL,
  timeout: 30000, // 30 seconds timeout for workflow operations
  headers: {
    "Content-Type": "application/json",
  },
});

// Types
export interface AgentPricing {
  model: string;
  amount: number;
  currency: string;
  unit: string;
}

export interface AgentRating {
  score: number;
  reviews: number;
  lastUpdated: string;
}

export interface AgentPerformance {
  avgResponseTime: number;
  uptime: number;
  successRate: number;
}

export interface Agent {
  name: string;
  url: string;
  description: string;
  vendor?: string;
  category?: string;
  tags?: string[];
  pricing?: AgentPricing;
  rating?: AgentRating;
  performance?: AgentPerformance;
  wallet?: string;
  previewURI?: string;
}

export interface WorkflowStep {
  stepId: string;
  agentName: string;
  agentUrl: string;
  description: string;
  inputMapping: Record<string, string>;
  outputMapping?: Record<string, string>;
}

export interface WorkflowDefinition {
  workflowId: string;
  name: string;
  description: string;
  userIntent: string;
  steps: WorkflowStep[];
  executionMode: "sequential" | "parallel" | "conditional";
  estimatedDuration: number;
  createdAt: number;
}

export interface StepResult {
  stepId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt?: number;
  completedAt?: number;
  input?: any;
  output?: any;
  error?: string;
}

export interface WorkflowExecution {
  executionId: string;
  workflowId: string;
  status: "pending" | "running" | "completed" | "failed";
  startedAt: number;
  completedAt?: number;
  input: any;
  output?: any;
  stepResults: StepResult[];
  error?: string;
}

export interface UserIntent {
  description: string;
  context?: Record<string, any>;
  preferences?: Record<string, any>;
}

// API Functions
export const orchestratorAPI = {
  // Health check
  async getHealth(): Promise<{ status: string; agents: Agent[] }> {
    const response = await api.get("/health");
    return response.data;
  },

  // Agent discovery
  async getAgents(): Promise<{ agents: Agent[]; count: number }> {
    const response = await api.get("/agents");
    return response.data;
  },

  // Workflow management
  async createWorkflow(
    userIntent: UserIntent
  ): Promise<{ workflow: WorkflowDefinition }> {
    const response = await api.post("/workflows/create", userIntent);
    return response.data;
  },

  async executeWorkflow(
    workflowId: string,
    input: any
  ): Promise<{ execution: WorkflowExecution }> {
    const response = await api.post("/workflows/execute", {
      workflowId,
      input,
    });
    return response.data;
  },

  async getWorkflow(
    workflowId: string
  ): Promise<{ workflow: WorkflowDefinition }> {
    const response = await api.get(`/workflows/${workflowId}`);
    return response.data;
  },

  async getExecution(
    executionId: string
  ): Promise<{ execution: WorkflowExecution }> {
    const response = await api.get(`/executions/${executionId}`);
    return response.data;
  },

  async listWorkflows(): Promise<{
    workflows: WorkflowDefinition[];
    count: number;
  }> {
    const response = await api.get("/workflows");
    return response.data;
  },

  async listExecutions(): Promise<{
    executions: WorkflowExecution[];
    count: number;
  }> {
    const response = await api.get("/executions");
    return response.data;
  },

  // Polling for execution status
  async pollExecution(
    executionId: string,
    onUpdate: (execution: WorkflowExecution) => void
  ): Promise<WorkflowExecution> {
    const poll = async (): Promise<WorkflowExecution> => {
      const { execution } = await this.getExecution(executionId);
      onUpdate(execution);

      if (execution.status === "running" || execution.status === "pending") {
        // Continue polling every 2 seconds
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return poll();
      }

      return execution;
    };

    return poll();
  },

  // Create and execute workflow in one call
  async createAndExecuteWorkflow(
    userIntent: UserIntent,
    input: any,
    onWorkflowCreated?: (workflow: WorkflowDefinition) => void,
    onExecutionUpdate?: (execution: WorkflowExecution) => void
  ): Promise<{ workflow: WorkflowDefinition; execution: WorkflowExecution }> {
    // Create workflow
    const { workflow } = await this.createWorkflow(userIntent);
    onWorkflowCreated?.(workflow);

    // Execute workflow
    const { execution } = await this.executeWorkflow(
      workflow.workflowId,
      input
    );

    // Poll for completion if callback provided
    if (onExecutionUpdate) {
      const finalExecution = await this.pollExecution(
        execution.executionId,
        onExecutionUpdate
      );
      return { workflow, execution: finalExecution };
    }

    return { workflow, execution };
  },
};

// Error handling wrapper
export const withErrorHandling = <T extends any[], R>(
  fn: (...args: T) => Promise<R>
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error: any) {
      console.error("Orchestrator API Error:", error);

      if (error.response) {
        // Server responded with error status
        throw new Error(
          error.response.data?.error ||
            error.response.data?.details ||
            "Server error"
        );
      } else if (error.request) {
        // Request was made but no response received
        throw new Error(
          "Unable to connect to orchestrator. Please ensure it is running."
        );
      } else {
        // Something else happened
        throw new Error(error.message || "Unknown error occurred");
      }
    }
  };
};

// Wrapped API with error handling
export const safeOrchestratorAPI = {
  getHealth: withErrorHandling(orchestratorAPI.getHealth),
  getAgents: withErrorHandling(orchestratorAPI.getAgents),
  createWorkflow: withErrorHandling(orchestratorAPI.createWorkflow),
  executeWorkflow: withErrorHandling(orchestratorAPI.executeWorkflow),
  getWorkflow: withErrorHandling(orchestratorAPI.getWorkflow),
  getExecution: withErrorHandling(orchestratorAPI.getExecution),
  listWorkflows: withErrorHandling(orchestratorAPI.listWorkflows),
  listExecutions: withErrorHandling(orchestratorAPI.listExecutions),
  pollExecution: withErrorHandling(orchestratorAPI.pollExecution),
  createAndExecuteWorkflow: withErrorHandling(
    orchestratorAPI.createAndExecuteWorkflow
  ),
};

export default safeOrchestratorAPI;
