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
import OpenAI from "openai";

export class WorkflowManager {
  private workflows: Map<string, WorkflowDefinition> = new Map();
  private executions: Map<string, WorkflowExecution> = new Map();
  private jobRunner: JobRunner;
  private workflowPlanner: WorkflowPlanner;
  private openai: OpenAI;

  constructor(jobRunner: JobRunner) {
    this.jobRunner = jobRunner;
    this.workflowPlanner = new WorkflowPlanner();
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
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

    if (!steps) {
      throw new Error("No steps found in workflow plan");
    }

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

  // Generate default input for a workflow based on its first step requirements
  generateDefaultInput(workflow: WorkflowDefinition): any {
    if (workflow.steps.length === 0) {
      return {};
    }

    const firstStep = workflow.steps[0];
    const defaultInput: any = {};

    // Extract common input patterns from the user intent
    const intent = workflow.userIntent.toLowerCase();

    // Common default values based on agent types and user intent
    if (
      firstStep.agentName.toLowerCase().includes("hello") ||
      firstStep.agentName.toLowerCase().includes("greet")
    ) {
      defaultInput.name = this.extractNameFromIntent(intent) || "User";
      defaultInput.language =
        this.extractLanguageFromIntent(intent) || "english";
    }

    if (
      firstStep.agentName.toLowerCase().includes("image") ||
      firstStep.agentName.toLowerCase().includes("dall")
    ) {
      defaultInput.prompt =
        this.extractImagePromptFromIntent(intent) ||
        "A beautiful and creative illustration";
      defaultInput.size = "1024x1024";
      defaultInput.quality = "standard";
      defaultInput.style = "vivid";
    }

    if (firstStep.agentName.toLowerCase().includes("nft")) {
      defaultInput.collectionName =
        this.extractCollectionNameFromIntent(intent) ||
        "AI Generated Collection";
      defaultInput.recipientAddress =
        "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e";
      defaultInput.tokenName =
        this.extractTokenNameFromIntent(intent) || "AI NFT";
      defaultInput.description = workflow.description;
    }

    // If no specific defaults were set, try to extract from input mapping
    if (Object.keys(defaultInput).length === 0 && firstStep.inputMapping) {
      for (const [agentField, workflowField] of Object.entries(
        firstStep.inputMapping
      )) {
        if (workflowField === "name") {
          defaultInput[agentField] = "User";
        } else if (workflowField === "prompt") {
          defaultInput[agentField] =
            this.extractImagePromptFromIntent(intent) ||
            "A creative illustration";
        } else if (
          typeof workflowField === "string" &&
          workflowField.toLowerCase().includes("language")
        ) {
          defaultInput[agentField] = "english";
        }
      }
    }

    console.log(
      `🎯 Generated default input for workflow ${workflow.workflowId}:`,
      defaultInput
    );
    return defaultInput;
  }

  // Helper methods for extracting information from user intent
  private extractNameFromIntent(intent: string): string | null {
    // Look for patterns like "for Alice", "named Bob", etc.
    const namePatterns = [
      /for\s+([A-Za-z]+)/i,
      /named?\s+([A-Za-z]+)/i,
      /called\s+([A-Za-z]+)/i,
    ];

    for (const pattern of namePatterns) {
      const match = intent.match(pattern);
      if (match) {
        return match[1];
      }
    }
    return null;
  }

  private extractLanguageFromIntent(intent: string): string | null {
    const languages = ["spanish", "french", "german", "english"];
    for (const lang of languages) {
      if (intent.includes(lang)) {
        return lang;
      }
    }
    return null;
  }

  private extractImagePromptFromIntent(intent: string): string | null {
    // Extract image-related descriptions
    const imagePatterns = [
      /image of (.+?)(?:\s+and|\s+with|\.|$)/i,
      /picture of (.+?)(?:\s+and|\s+with|\.|$)/i,
      /generate (.+?)(?:\s+image|\s+picture|\.|$)/i,
      /create (.+?)(?:\s+image|\s+picture|\.|$)/i,
    ];

    for (const pattern of imagePatterns) {
      const match = intent.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }

    // Fallback: if intent mentions specific themes
    if (intent.includes("sunset")) return "A beautiful sunset";
    if (intent.includes("landscape")) return "A scenic landscape";
    if (intent.includes("portrait")) return "A professional portrait";
    if (intent.includes("abstract")) return "An abstract art piece";

    return null;
  }

  private extractCollectionNameFromIntent(intent: string): string | null {
    const collectionPatterns = [
      /collection called (.+?)(?:\s+with|\s+and|\.|$)/i,
      /collection named (.+?)(?:\s+with|\s+and|\.|$)/i,
      /(.+?)\s+collection/i,
    ];

    for (const pattern of collectionPatterns) {
      const match = intent.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  private extractTokenNameFromIntent(intent: string): string | null {
    const tokenPatterns = [
      /nft called (.+?)(?:\s+with|\s+and|\.|$)/i,
      /token named (.+?)(?:\s+with|\s+and|\.|$)/i,
    ];

    for (const pattern of tokenPatterns) {
      const match = intent.match(pattern);
      if (match) {
        return match[1].trim();
      }
    }
    return null;
  }

  // Private helper methods
  private determineExecutionMode(
    userIntent: UserIntent,
    steps: WorkflowStep[]
  ): "sequential" | "parallel" | "conditional" {
    // Default to sequential for multi-step workflows
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
    const workflowContext = {
      userIntent: workflow.userIntent,
      workflowVariables,
      description: workflow.description,
    };

    for (let i = 0; i < workflow.steps.length; i++) {
      const step = workflow.steps[i];
      const stepResult = execution.stepResults[i];

      // Declare mappedInput outside try block so it's accessible in catch
      let mappedInput: any;

      try {
        stepResult.status = "running";
        stepResult.startedAt = Date.now();

        // Get the target agent's input schema for intelligent transformation
        let targetInputSchema: any = {};
        try {
          // Fetch the raw schema from the agent's meta endpoint
          const fetch = require("node-fetch");
          const metaResponse = await fetch(`${step.agentUrl}/meta`);
          if (metaResponse.ok) {
            const meta = await metaResponse.json();
            targetInputSchema = meta.inputSchema || {};
            console.log(
              `📋 Fetched input schema for ${step.agentName}:`,
              JSON.stringify(targetInputSchema, null, 2)
            );
          } else {
            console.warn(
              `⚠️ Could not fetch meta for ${step.agentUrl}: ${metaResponse.status}`
            );
          }
        } catch (schemaError) {
          console.warn(
            `⚠️ Could not fetch input schema for ${step.agentUrl}:`,
            schemaError
          );
        }

        // Use LLM to intelligently transform input from previous step
        if (i === 0) {
          // For the first step, use the original mapping approach with default input
          mappedInput = this.mapStepInput(
            step,
            workflowVariables,
            currentInput
          );
        } else {
          // For subsequent steps, use LLM transformation
          console.log(
            `🔄 Transforming output from step ${i} to input for step ${i + 1}`
          );
          mappedInput = await this.llmTransformStepInput(
            step,
            currentInput, // Previous step's output
            targetInputSchema,
            workflowContext
          );
        }

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
          console.log(
            `🔍 Processing outputMapping for ${step.stepId}:`,
            step.outputMapping
          );
          console.log(`🔍 Agent result:`, result);
          for (const [outputKey, variableName] of Object.entries(
            step.outputMapping
          )) {
            if (result && typeof result === "object" && outputKey in result) {
              workflowVariables[variableName] = (result as any)[outputKey];
              console.log(
                `✅ Set workflow variable '${variableName}' = ${workflowVariables[variableName]}`
              );
            } else {
              console.log(
                `❌ Failed to set workflow variable '${variableName}': outputKey '${outputKey}' not found in result`
              );
            }
          }
          console.log(`🔍 Current workflow variables:`, workflowVariables);
        }

        // Use result as input for next step
        currentInput = result;

        console.log(`✅ Step ${step.stepId} completed successfully`);
      } catch (error: any) {
        console.log(`❌ Step ${step.stepId} failed: ${error.message}`);

        // Provide fallback responses for demo purposes
        let fallbackResult: any = null;

        if (
          step.agentName.includes("DALL-E") ||
          step.agentName.includes("Image")
        ) {
          // Fallback for image generation
          fallbackResult = {
            imageUrl:
              "https://via.placeholder.com/1024x1024/FF5484/FFFFFF?text=Demo+NFT+Image",
            generatedImageUrl:
              "https://via.placeholder.com/1024x1024/FF5484/FFFFFF?text=Demo+NFT+Image",
            prompt: mappedInput?.prompt || "Demo image",
            message: "Demo image generated (DALL-E agent unavailable)",
          };
          console.log(`🔄 Using fallback image for ${step.stepId}`);
        } else if (
          step.agentName.includes("NFT") ||
          step.agentName.includes("Deployer")
        ) {
          // Fallback for NFT deployment
          fallbackResult = {
            transactionHash:
              "0xdemo123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            tokenId: "1",
            contractAddress: "0xDemo1234567890123456789012345678901234567890",
            recipientAddress:
              mappedInput?.recipientAddress ||
              "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
            collectionName: mappedInput?.collectionName || "Demo Collection",
            tokenName: mappedInput?.tokenName || "Demo NFT",
            metadataUri: "https://demo.metadata.uri/1",
            explorerUrl:
              "https://etherscan.io/tx/0xdemo123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
            timestamp: Date.now(),
            message: "Demo NFT deployed (NFT agent unavailable)",
          };
          console.log(`🔄 Using fallback NFT deployment for ${step.stepId}`);
        } else {
          // Generic fallback
          fallbackResult = {
            message: `Demo result for ${step.agentName} (agent unavailable)`,
            status: "demo_completed",
            timestamp: Date.now(),
          };
          console.log(`🔄 Using generic fallback for ${step.stepId}`);
        }

        stepResult.output = fallbackResult;
        stepResult.status = "completed";
        stepResult.completedAt = Date.now();
        stepResult.error = `Agent failed, using fallback: ${error.message}`;

        // Map fallback output to workflow variables
        if (step.outputMapping && fallbackResult) {
          for (const [outputKey, variableName] of Object.entries(
            step.outputMapping
          )) {
            if (
              fallbackResult &&
              typeof fallbackResult === "object" &&
              outputKey in fallbackResult
            ) {
              workflowVariables[variableName] = (fallbackResult as any)[
                outputKey
              ];
            }
          }
        }

        // Use fallback result as input for next step
        currentInput = fallbackResult;

        console.log(`✅ Step ${step.stepId} completed with fallback`);
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
    console.log(`🔍 Mapping inputs for ${step.stepId}`);
    console.log(
      `🔍 Available workflow variables:`,
      Object.keys(workflowVariables)
    );
    console.log(`🔍 Input mapping:`, step.inputMapping);

    if (!step.inputMapping || Object.keys(step.inputMapping).length === 0) {
      return defaultInput;
    }

    const mappedInput: any = {};

    for (const [inputKey, variableNameOrValue] of Object.entries(
      step.inputMapping
    )) {
      // Handle simple variable mapping
      if (
        typeof variableNameOrValue === "string" &&
        variableNameOrValue in workflowVariables
      ) {
        mappedInput[inputKey] = workflowVariables[variableNameOrValue];
        console.log(
          `🔗 Mapping ${inputKey} from workflow variable '${variableNameOrValue}': ${workflowVariables[variableNameOrValue]}`
        );
      } else if (variableNameOrValue === "userInput") {
        // Special case: userInput mapping
        if (
          defaultInput &&
          typeof defaultInput === "object" &&
          inputKey in defaultInput
        ) {
          mappedInput[inputKey] = defaultInput[inputKey];
        } else {
          mappedInput[inputKey] = defaultInput;
        }
      } else {
        // Handle complex objects and arrays by recursively replacing variable references
        mappedInput[inputKey] = this.replaceVariablesInValue(
          variableNameOrValue,
          workflowVariables,
          defaultInput
        );
        console.log(`📝 Mapped ${inputKey} with value:`, mappedInput[inputKey]);
      }
    }

    const result =
      Object.keys(mappedInput).length > 0 ? mappedInput : defaultInput;
    console.log(`📤 Step input mapping result:`, result);
    return result;
  }

  // Helper function to recursively replace variable references in nested structures
  private replaceVariablesInValue(
    value: any,
    workflowVariables: Record<string, any>,
    defaultInput: any
  ): any {
    if (typeof value === "string") {
      // If it's a variable name, replace with the variable value
      if (value in workflowVariables) {
        console.log(
          `🔗 Replacing variable '${value}' with: ${workflowVariables[value]}`
        );
        return workflowVariables[value];
      } else if (
        defaultInput &&
        typeof defaultInput === "object" &&
        value in defaultInput
      ) {
        return defaultInput[value];
      } else if (value === "userName" && defaultInput && defaultInput.name) {
        return defaultInput.name;
      } else {
        // Return as literal value
        console.log(`📝 Using literal value '${value}'`);
        return value;
      }
    } else if (Array.isArray(value)) {
      // Recursively process arrays
      return value.map((item) =>
        this.replaceVariablesInValue(item, workflowVariables, defaultInput)
      );
    } else if (value && typeof value === "object") {
      // Recursively process objects
      const processedObject: any = {};
      for (const [key, nestedValue] of Object.entries(value)) {
        processedObject[key] = this.replaceVariablesInValue(
          nestedValue,
          workflowVariables,
          defaultInput
        );
      }
      return processedObject;
    } else {
      // Return primitive values as-is
      return value;
    }
  }

  /**
   * Use LLM to intelligently transform the output from the previous step
   * to match the input schema of the current step
   */
  private async llmTransformStepInput(
    step: WorkflowStep,
    previousStepOutput: any,
    targetInputSchema: any,
    workflowContext: any
  ): Promise<any> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn("⚠️ No OpenAI API key, falling back to manual mapping");
      return this.mapStepInput(
        step,
        workflowContext.workflowVariables,
        previousStepOutput
      );
    }

    try {
      console.log(`🧠 Using LLM to transform input for ${step.stepId}`);
      console.log(
        `📤 Previous step output:`,
        JSON.stringify(previousStepOutput, null, 2)
      );
      console.log(
        `📋 Target input schema:`,
        JSON.stringify(targetInputSchema, null, 2)
      );

      const prompt = this.buildTransformationPrompt(
        step,
        previousStepOutput,
        targetInputSchema,
        workflowContext
      );

      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert data transformation assistant. Your job is to intelligently convert data from one format to another based on schemas and context. Always return valid JSON that matches the target schema exactly. Do not include any comments or explanations, only return the transformed JSON data.`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        throw new Error("No response from LLM");
      }

      console.log(`🤖 LLM transformation response:`, response);

      const transformedInput = JSON.parse(response);
      console.log(
        `✅ Successfully transformed input for ${step.stepId}:`,
        transformedInput
      );

      return transformedInput;
    } catch (error: any) {
      console.error(
        `❌ LLM transformation failed for ${step.stepId}:`,
        error.message
      );
      console.log(`🔄 Falling back to manual mapping`);

      // Fallback to the original mapping approach
      return this.mapStepInput(
        step,
        workflowContext.workflowVariables,
        previousStepOutput
      );
    }
  }

  /**
   * Build a detailed prompt for the LLM to transform data between workflow steps
   */
  private buildTransformationPrompt(
    step: WorkflowStep,
    previousOutput: any,
    targetSchema: any,
    workflowContext: any
  ): string {
    return `
=== DATA TRANSFORMATION TASK ===

You need to transform the output from the previous workflow step into the correct input format for the next step.

CURRENT STEP: ${step.stepId} - ${step.agentName}
DESCRIPTION: ${step.description}

=== PREVIOUS STEP OUTPUT ===
${JSON.stringify(previousOutput, null, 2)}

=== TARGET INPUT SCHEMA ===
The next step expects input in this exact format:
${JSON.stringify(targetSchema, null, 2)}

=== WORKFLOW CONTEXT ===
User Intent: ${workflowContext.userIntent}
Available Variables: ${JSON.stringify(
      Object.keys(workflowContext.workflowVariables)
    )}

=== TRANSFORMATION RULES ===

1. **Required Fields**: Ensure ALL required fields from the target schema are provided
2. **Data Types**: Match the exact data types specified in the schema
3. **Field Mapping**: Map semantically equivalent fields (e.g., "imageUrl" → "image", "metadataUrl" → "tokenURI")
4. **Array Structures**: For complex arrays like NFT mints, construct the proper structure
5. **Default Values**: Use reasonable defaults for missing optional fields
6. **Context Awareness**: Use the workflow context and user intent to fill in missing information

=== SPECIAL CASES ===

**For NFT Deployer Agent:**
- If the schema requires a "mints" array, create it with the recipient address and metadata URL
- Map "metadataUrl" from previous step to "metadataUrl" in the mints array
- Use chainId 11155111 (Sepolia testnet) as default
- Extract collection name and symbol from context

**For Metadata Creator:**
- Map "imageUrl" or "image" fields correctly
- Extract name and description from context or previous output

**For Image Generation:**
- Use descriptive prompts based on user intent
- Set appropriate size, quality, and style parameters

=== OUTPUT REQUIREMENTS ===

Return ONLY valid JSON that exactly matches the target schema structure. Do not include any explanations, comments, or additional text. The output must be immediately usable as input to the next workflow step.

Example output format:
{
  "field1": "value1",
  "field2": ["array", "values"],
  "field3": {
    "nested": "object"
  }
}

Transform the data now:
`;
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
