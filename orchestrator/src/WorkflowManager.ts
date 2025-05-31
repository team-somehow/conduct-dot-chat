import {
  WorkflowDefinition,
  WorkflowExecution,
  WorkflowStep,
  UserIntent,
  AgentMetadata,
} from "./types";
import { JobRunner } from "./JobRunner";
import { WorkflowPlanner } from "./WorkflowPlanner";
import { loadAgent } from "./agents.http";
import { AGENTS } from "./config";

export class WorkflowManager {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private jobRunner: JobRunner;
  private workflowPlanner: WorkflowPlanner;

  constructor(jobRunner: JobRunner) {
    this.jobRunner = jobRunner;
    this.workflowPlanner = new WorkflowPlanner();
  }

  // Analyze user intent and create a workflow
  async createWorkflow(userIntent: UserIntent): Promise<WorkflowDefinition> {
    const workflowId = this.generateWorkflowId();

    // Get available agents
    const availableAgents = await this.jobRunner.discoverAgents();

    console.log(
      `🤖 Planning workflow with ${availableAgents.length} available agents`
    );
    console.log(`📝 User request: "${userIntent.description}"`);

    // Use LLM-powered workflow planner
    const steps = await this.workflowPlanner.planWorkflow(
      userIntent,
      availableAgents
    );

    const workflow: WorkflowDefinition = {
      workflowId,
      name: this.generateWorkflowName(userIntent.description),
      description: `Workflow for: ${userIntent.description}`,
      userIntent: userIntent.description,
      steps,
      executionMode: this.determineExecutionMode(userIntent, steps),
      estimatedDuration: this.estimateDuration(steps),
      createdAt: Date.now(),
      variables: {},
    };

    // Store the workflow
    this.workflows.set(workflowId, workflow);

    console.log(`✅ Created workflow ${workflowId} with ${steps.length} steps`);
    console.log(
      `🔗 Workflow steps:`,
      steps.map((s) => `${s.agentName}: ${s.description}`)
    );
    return workflow;
  }

  // Execute a workflow
  async executeWorkflow(
    workflowId: string,
    input: any
  ): Promise<WorkflowExecution> {
    const workflow = this.workflows.get(workflowId);
    if (!workflow) {
      throw new Error(`Workflow ${workflowId} not found`);
    }

    const executionId = this.generateExecutionId();

    const execution: WorkflowExecution = {
      executionId,
      workflowId,
      status: "pending",
      startedAt: Date.now(),
      input,
      stepResults: workflow.steps.map((step) => ({
        stepId: step.stepId,
        status: "pending",
      })),
    };

    // Store the execution
    this.executions.set(executionId, execution);

    try {
      execution.status = "running";

      if (workflow.executionMode === "sequential") {
        await this.executeSequentialWorkflow(execution, workflow, input);
      } else if (workflow.executionMode === "parallel") {
        await this.executeParallelWorkflow(execution, workflow, input);
      } else {
        await this.executeConditionalWorkflow(execution, workflow, input);
      }

      execution.status = "completed";
      execution.completedAt = Date.now();
    } catch (error: any) {
      execution.status = "failed";
      execution.error = error.message;
      execution.completedAt = Date.now();
      console.error(`❌ Workflow execution failed:`, error);
    }

    return execution;
  }

  // Get workflow by ID
  getWorkflow(workflowId: string): WorkflowDefinition | undefined {
    return this.workflows.get(workflowId);
  }

  // Get execution by ID
  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  // List all workflows
  listWorkflows(): WorkflowDefinition[] {
    return Array.from(this.workflows.values());
  }

  // List all executions
  listExecutions(): WorkflowExecution[] {
    return Array.from(this.executions.values());
  }

  // Private helper methods
  private async analyzeIntentAndCreateSteps(
    userIntent: UserIntent,
    availableAgents: any[]
  ): Promise<WorkflowStep[]> {
    const intent = userIntent.description.toLowerCase();
    const steps: WorkflowStep[] = [];

    // Check for multi-agent workflows (hello + image)
    const needsGreeting =
      intent.includes("hello") ||
      intent.includes("greet") ||
      intent.includes("welcome");
    const needsImage =
      intent.includes("image") ||
      intent.includes("picture") ||
      intent.includes("generate") ||
      intent.includes("create");
    const isChained =
      intent.includes("then") ||
      intent.includes("and then") ||
      (needsGreeting && needsImage);

    // Find available agents
    const greetingAgent = availableAgents.find(
      (agent) =>
        agent.name.toLowerCase().includes("hello") ||
        agent.name.toLowerCase().includes("greet")
    );

    const imageAgent = availableAgents.find(
      (agent) =>
        agent.name.toLowerCase().includes("image") ||
        agent.name.toLowerCase().includes("dall") ||
        agent.description.toLowerCase().includes("image")
    );

    // Create multi-agent workflow if both agents are needed
    if (isChained && greetingAgent && imageAgent) {
      console.log("🔗 Creating multi-agent workflow: Greeting → Image");

      // Step 1: Generate greeting FIRST
      steps.push({
        stepId: "step_1",
        agentUrl: greetingAgent.url,
        agentName: greetingAgent.name,
        description: "Generate personalized greeting",
        inputMapping: { name: "userName" },
        outputMapping: { greeting: "generatedGreeting" },
      });

      // Step 2: Generate image based on greeting SECOND
      steps.push({
        stepId: "step_2",
        agentUrl: imageAgent.url,
        agentName: imageAgent.name,
        description: "Generate image based on greeting text",
        inputMapping: { prompt: "generatedGreeting" }, // Use greeting as prompt
        outputMapping: { imageUrl: "finalImage" },
      });
    }
    // Single agent workflows
    else if (needsImage && imageAgent && !needsGreeting) {
      steps.push({
        stepId: "step_1",
        agentUrl: imageAgent.url,
        agentName: imageAgent.name,
        description: "Generate image based on user prompt",
        inputMapping: {},
        outputMapping: { imageUrl: "generatedImage" },
      });
    } else if (needsGreeting && greetingAgent && !needsImage) {
      steps.push({
        stepId: "step_1",
        agentUrl: greetingAgent.url,
        agentName: greetingAgent.name,
        description: "Generate personalized greeting",
        inputMapping: { name: "userName" },
        outputMapping: { greeting: "personalizedGreeting" },
      });
    }
    // Fallback: use the first available agent
    else if (steps.length === 0 && availableAgents.length > 0) {
      const fallbackAgent = availableAgents[0];
      steps.push({
        stepId: "step_1",
        agentUrl: fallbackAgent.url,
        agentName: fallbackAgent.name,
        description: "Process user request with available agent",
        inputMapping: {},
        outputMapping: {},
      });
    }

    return steps;
  }

  private determineExecutionMode(
    userIntent: UserIntent,
    steps: WorkflowStep[]
  ): "sequential" | "parallel" | "conditional" {
    const intent = userIntent.description.toLowerCase();

    if (
      intent.includes("then") ||
      intent.includes("after") ||
      intent.includes("followed by")
    ) {
      return "sequential";
    } else if (intent.includes("and") && steps.length > 1) {
      return "parallel";
    } else if (
      intent.includes("if") ||
      intent.includes("when") ||
      intent.includes("depending")
    ) {
      return "conditional";
    }

    return steps.length > 1 ? "sequential" : "sequential";
  }

  private estimateDuration(steps: WorkflowStep[]): number {
    // Simple estimation: 5 seconds per step
    return steps.length * 5000;
  }

  private async executeSequentialWorkflow(
    execution: WorkflowExecution,
    workflow: WorkflowDefinition,
    input: any
  ): Promise<void> {
    let currentInput = input;
    const workflowVariables: Record<string, any> = { userInput: input };

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const stepResult = execution.stepResults[i];

      try {
        stepResult.status = "running";
        stepResult.startedAt = Date.now();

        // Map input based on step configuration
        const mappedInput = this.mapStepInput(
          step,
          workflowVariables,
          currentInput
        );
        stepResult.input = mappedInput;

        // Execute the step
        const result = await this.jobRunner.executeAgentTask(
          step.agentUrl,
          mappedInput
        );

        stepResult.output = result;
        stepResult.status = "completed";
        stepResult.completedAt = Date.now();

        // Map output to workflow variables
        if (step.outputMapping) {
          for (const [outputKey, variableName] of Object.entries(
            step.outputMapping
          )) {
            if (result && typeof result === "object" && outputKey in result) {
              workflowVariables[variableName] = (result as any)[outputKey];
            }
          }
        }

        // Use result as input for next step
        currentInput = result;

        console.log(`✅ Step ${step.stepId} completed successfully`);
      } catch (error: any) {
        stepResult.status = "failed";
        stepResult.error = error.message;
        stepResult.completedAt = Date.now();
        throw error;
      }
    }

    execution.output = currentInput;
  }

  private async executeParallelWorkflow(
    execution: WorkflowExecution,
    workflow: WorkflowDefinition,
    input: any
  ): Promise<void> {
    const workflowVariables: Record<string, any> = { userInput: input };

    const stepPromises = workflow.steps.map(async (step, index) => {
      const stepResult = execution.stepResults[index];

      try {
        stepResult.status = "running";
        stepResult.startedAt = Date.now();

        const mappedInput = this.mapStepInput(step, workflowVariables, input);
        stepResult.input = mappedInput;

        const result = await this.jobRunner.executeAgentTask(
          step.agentUrl,
          mappedInput
        );

        stepResult.output = result;
        stepResult.status = "completed";
        stepResult.completedAt = Date.now();

        return result;
      } catch (error: any) {
        stepResult.status = "failed";
        stepResult.error = error.message;
        stepResult.completedAt = Date.now();
        throw error;
      }
    });

    const results = await Promise.all(stepPromises);
    execution.output = results;
  }

  private async executeConditionalWorkflow(
    execution: WorkflowExecution,
    workflow: WorkflowDefinition,
    input: any
  ): Promise<void> {
    // For now, treat conditional as sequential
    // In production, this would evaluate conditions
    await this.executeSequentialWorkflow(execution, workflow, input);
  }

  private mapStepInput(
    step: WorkflowStep,
    workflowVariables: Record<string, any>,
    defaultInput: any
  ): any {
    if (!step.inputMapping || Object.keys(step.inputMapping).length === 0) {
      return defaultInput;
    }

    const mappedInput: any = {};

    for (const [inputKey, variableName] of Object.entries(step.inputMapping)) {
      if (variableName in workflowVariables) {
        // Use value from workflow variables (from previous steps)
        mappedInput[inputKey] = workflowVariables[variableName];
        console.log(
          `🔗 Mapping ${inputKey} from workflow variable '${variableName}': ${workflowVariables[variableName]}`
        );
      } else if (variableName === "userInput") {
        // Special case: if we're mapping from "userInput" and the input has the same key,
        // extract that specific value instead of the whole object
        if (
          defaultInput &&
          typeof defaultInput === "object" &&
          inputKey in defaultInput
        ) {
          mappedInput[inputKey] = defaultInput[inputKey];
        } else {
          // Otherwise use the entire input
          mappedInput[inputKey] = defaultInput;
        }
      } else {
        // Check if the variable name exists as a key in defaultInput
        if (
          defaultInput &&
          typeof defaultInput === "object" &&
          variableName in defaultInput
        ) {
          mappedInput[inputKey] = defaultInput[variableName];
        } else {
          // Try to extract from user input context
          if (
            variableName === "userName" &&
            defaultInput &&
            defaultInput.name
          ) {
            mappedInput[inputKey] = defaultInput.name;
          } else {
            console.warn(
              `⚠️  Could not find variable '${variableName}' for input key '${inputKey}'`
            );
          }
        }
      }
    }

    const result =
      Object.keys(mappedInput).length > 0 ? mappedInput : defaultInput;
    console.log(`📤 Step input mapping result:`, result);
    return result;
  }

  private generateWorkflowId(): string {
    return `workflow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateExecutionId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateWorkflowName(description: string): string {
    // Simple name generation from description
    const words = description.split(" ").slice(0, 3);
    return (
      words
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ") + " Workflow"
    );
  }
}
