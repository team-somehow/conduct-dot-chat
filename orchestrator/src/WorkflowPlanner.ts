import OpenAI from "openai";
import fetch from "node-fetch";
import { WorkflowStep, UserIntent } from "./types";
import { HttpAgent } from "./agents.http";

export class WorkflowPlanner {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async planWorkflow(
    userIntent: UserIntent,
    availableAgents: HttpAgent[]
  ): Promise<WorkflowStep[]> {
    if (!process.env.OPENAI_API_KEY) {
      console.warn(
        "⚠️  OpenAI API key not configured, falling back to rule-based planning"
      );
      return this.fallbackPlanning(userIntent, availableAgents);
    }

    try {
      // We need to get the raw schemas from the agents
      const agentDescriptions = await Promise.all(
        availableAgents.map(async (agent) => {
          // Fetch the raw metadata to get schemas
          const metaResponse = await fetch(`${agent.url}/meta`);
          const meta = await metaResponse.json();

          return {
            name: agent.name,
            description: agent.description,
            url: agent.url,
            inputSchema: meta.inputSchema,
            outputSchema: meta.outputSchema,
          };
        })
      );

      const prompt = this.buildPlanningPrompt(userIntent, agentDescriptions);

      const response = await this.openai.chat.completions.create({
        model: "gpt-4.1", // DO NOT CHANGE THIS MODEL
        messages: [
          {
            role: "system",
            content:
              "You are an expert AI workflow planner. Your job is to analyze user requests and create optimal multi-agent workflows using available agents. Always respond with valid JSON.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.1,
        max_tokens: 2000,
      });

      const planText = response.choices[0]?.message?.content;
      if (!planText) {
        throw new Error("No response from LLM");
      }

      const workflowPlan = JSON.parse(planText);
      return this.convertPlanToSteps(workflowPlan, availableAgents);
    } catch (error) {
      console.error("❌ LLM workflow planning failed:", error);
      console.log("🔄 Falling back to rule-based planning");
      return this.fallbackPlanning(userIntent, availableAgents);
    }
  }

  private buildPlanningPrompt(userIntent: UserIntent, agents: any[]): string {
    return `
TASK: Create an optimal workflow plan for the following user request.

USER REQUEST: "${userIntent.description}"

CONTEXT: ${JSON.stringify(userIntent.context || {})}
PREFERENCES: ${JSON.stringify(userIntent.preferences || {})}

AVAILABLE AGENTS:
${agents
  .map(
    (agent, i) => `
${i + 1}. ${agent.name}
   Description: ${agent.description}
   Input Schema: ${JSON.stringify(agent.inputSchema, null, 2)}
   Output Schema: ${JSON.stringify(agent.outputSchema, null, 2)}
   URL: ${agent.url}
`
  )
  .join("\n")}

INSTRUCTIONS:
1. Analyze the user request to understand what they want to accomplish
2. Determine which agents are needed and in what order
3. For multi-agent workflows, use "sequential" execution mode to enable data flow between agents
4. Design simple input/output mappings that reference actual user input fields or previous step outputs
5. Create meaningful step descriptions

EXECUTION MODE RULES:
- Use "sequential" for workflows where one agent's output feeds into the next agent's input
- Use "parallel" only when agents can run independently without dependencies
- Use "conditional" for if/then logic workflows

INPUT MAPPING RULES:
- For first step: map directly from user input fields (e.g., "name": "name")
- For subsequent steps: map from previous step outputs (e.g., "prompt": "generatedGreeting")
- Keep mappings simple - avoid complex expressions or concatenations
- Use empty object {} to pass through all user input

OUTPUT MAPPING RULES:
- Map agent outputs to workflow variables for use in subsequent steps
- Use descriptive variable names (e.g., "greeting": "personalizedGreeting")

RESPONSE FORMAT (JSON only):
{
  "reasoning": "Brief explanation of your workflow design decisions",
  "executionMode": "sequential",
  "steps": [
    {
      "stepId": "step_1",
      "agentName": "exact agent name from available agents",
      "description": "what this step accomplishes",
      "inputMapping": {
        "agentInputField": "userInputField"
      },
      "outputMapping": {
        "agentOutputField": "workflowVariableName"
      }
    }
  ]
}

EXAMPLES FOR MULTI-AGENT NFT WORKFLOW:
Step 1 (Greeting): inputMapping: {"name": "name", "language": "language"}, outputMapping: {"greeting": "personalizedGreeting"}
Step 2 (Image): inputMapping: {"prompt": "imageTheme"}, outputMapping: {"imageUrl": "generatedImageUrl"}  
Step 3 (NFT): inputMapping: {"imageUrl": "generatedImageUrl", "collectionName": "collectionName", "recipientAddress": "recipientAddress"}, outputMapping: {"nftDetails": "finalNFT"}

IMPORTANT:
- Always use "sequential" for multi-agent workflows
- Only use agents that are actually available in the list above
- Keep input mappings simple - reference user input fields or previous outputs directly
- Respond with ONLY the JSON object, no additional text
`;
  }

  private convertPlanToSteps(
    plan: any,
    availableAgents: HttpAgent[]
  ): WorkflowStep[] {
    if (!plan.steps || !Array.isArray(plan.steps)) {
      throw new Error("Invalid workflow plan: missing or invalid steps");
    }

    return plan.steps.map((step: any, index: number) => {
      const agent = availableAgents.find((a) => a.name === step.agentName);
      if (!agent) {
        throw new Error(
          `Agent "${step.agentName}" not found in available agents`
        );
      }

      return {
        stepId: step.stepId || `step_${index + 1}`,
        agentUrl: agent.url,
        agentName: agent.name,
        description: step.description || `Execute ${agent.name}`,
        inputMapping: step.inputMapping || {},
        outputMapping: step.outputMapping || {},
      };
    });
  }

  private fallbackPlanning(
    userIntent: UserIntent,
    availableAgents: HttpAgent[]
  ): WorkflowStep[] {
    const intent = userIntent.description.toLowerCase();
    const steps: WorkflowStep[] = [];

    // Simple rule-based fallback
    const needsGreeting = intent.includes("hello") || intent.includes("greet");
    const needsImage =
      intent.includes("image") ||
      intent.includes("picture") ||
      intent.includes("generate");

    const greetingAgent = availableAgents.find(
      (a) =>
        a.name.toLowerCase().includes("hello") ||
        a.name.toLowerCase().includes("greet")
    );

    const imageAgent = availableAgents.find(
      (a) =>
        a.name.toLowerCase().includes("image") ||
        a.name.toLowerCase().includes("dall")
    );

    if (needsGreeting && needsImage && greetingAgent && imageAgent) {
      // Multi-agent: greeting first, then image
      steps.push({
        stepId: "step_1",
        agentUrl: greetingAgent.url,
        agentName: greetingAgent.name,
        description: "Generate personalized greeting",
        inputMapping: { name: "userName" },
        outputMapping: { greeting: "generatedGreeting" },
      });

      steps.push({
        stepId: "step_2",
        agentUrl: imageAgent.url,
        agentName: imageAgent.name,
        description: "Generate image based on greeting",
        inputMapping: { prompt: "generatedGreeting" },
        outputMapping: { imageUrl: "finalImage" },
      });
    } else if (needsImage && imageAgent) {
      steps.push({
        stepId: "step_1",
        agentUrl: imageAgent.url,
        agentName: imageAgent.name,
        description: "Generate image",
        inputMapping: {},
        outputMapping: { imageUrl: "generatedImage" },
      });
    } else if (needsGreeting && greetingAgent) {
      steps.push({
        stepId: "step_1",
        agentUrl: greetingAgent.url,
        agentName: greetingAgent.name,
        description: "Generate greeting",
        inputMapping: { name: "userName" },
        outputMapping: { greeting: "personalizedGreeting" },
      });
    } else if (availableAgents.length > 0) {
      // Use first available agent
      const agent = availableAgents[0];
      steps.push({
        stepId: "step_1",
        agentUrl: agent.url,
        agentName: agent.name,
        description: "Process request",
        inputMapping: {},
        outputMapping: {},
      });
    }

    return steps;
  }
}
