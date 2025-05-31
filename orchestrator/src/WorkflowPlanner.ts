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
3. Design input/output mappings to chain agents together effectively
4. Consider if agents should run sequentially (one after another) or in parallel
5. Create meaningful step descriptions

RESPONSE FORMAT (JSON only):
{
  "reasoning": "Brief explanation of your workflow design decisions",
  "executionMode": "sequential" | "parallel" | "conditional",
  "steps": [
    {
      "stepId": "step_1",
      "agentName": "exact agent name from available agents",
      "description": "what this step accomplishes",
      "inputMapping": {
        "agentInputField": "sourceVariable or userInput field"
      },
      "outputMapping": {
        "agentOutputField": "workflowVariableName"
      }
    }
  ]
}

EXAMPLES OF GOOD INPUT/OUTPUT MAPPINGS:
- For first step: "inputMapping": {"name": "userName"} maps user's "name" field to agent's "name" input
- For chained steps: "inputMapping": {"prompt": "generatedGreeting"} uses output from previous step
- For output: "outputMapping": {"greeting": "personalizedMessage"} saves agent's "greeting" output as "personalizedMessage"

IMPORTANT:
- Only use agents that are actually available in the list above
- Ensure input mappings reference valid fields from user input or previous step outputs
- Make sure output mappings capture useful data for subsequent steps
- If user wants greeting + image, run greeting first, then use greeting text as image prompt
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
