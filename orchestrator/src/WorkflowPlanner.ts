import OpenAI from "openai";
import fetch from "node-fetch";
import { WorkflowStep, UserIntent } from "./types";
import { HttpAgent } from "./agents.http";

interface AgentWithSchema {
  name: string;
  description: string;
  url: string;
  inputSchema: any;
  outputSchema: any;
  category?: string;
  tags?: string[];
}

export class WorkflowPlanner {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Main entrypoint: fetches all agent schemas, then asks the LLM to plan a workflow.
   */
  async planWorkflow(
    userIntent: UserIntent,
    availableAgents: HttpAgent[]
  ): Promise<WorkflowStep[]> {
    console.log(`🧠 Planning workflow for: "${userIntent.description}"`);
    console.log(`📊 Available agents: ${availableAgents.length}`);
    console.log(
      `📋 Agent list:`,
      availableAgents.map((a) => `${a.name} (${a.url})`)
    );

    // 1) Fetch schemas for every agent via their /meta route
    const agentsWithSchemas = await this.getAgentSchemas(availableAgents);
    console.log(`📦 Fetched schemas for ${agentsWithSchemas.length} agents`);
    console.log(
      `📝 Agents with valid schemas:`,
      agentsWithSchemas.map(
        (a) =>
          `${a.name} (${
            Object.keys(a.inputSchema?.properties || {}).length
          } inputs, ${
            Object.keys(a.outputSchema?.properties || {}).length
          } outputs)`
      )
    );

    // 2) Ask the LLM to generate a JSON workflow plan using all schemas + user intent
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY not found in environment");
      throw new Error("OpenAI API key not found in environment.");
    }

    try {
      const steps = await this.llmPlanWorkflow(userIntent, agentsWithSchemas);
      console.log(`✅ LLM planned ${steps.length} workflow steps`);
      return steps;
    } catch (err) {
      console.error("❌ LLM planning failed:", err);
      return [];
    }
  }

  /**
   * Fetch /meta from each agent and collect its name, description, inputSchema, outputSchema, etc.
   */
  private async getAgentSchemas(
    agents: HttpAgent[]
  ): Promise<AgentWithSchema[]> {
    const agentSchemas = await Promise.all(
      agents.map(async (agent) => {
        try {
          const resp = await fetch(`${agent.url}/meta`);
          const meta = await resp.json();

          return {
            name: meta.name,
            description: meta.description,
            url: agent.url,
            inputSchema: meta.inputSchema || {},
            outputSchema: meta.outputSchema || {},
            category: meta.category,
            tags: meta.tags || [],
          } as AgentWithSchema;
        } catch (error) {
          console.warn(`⚠️ Failed to fetch schema for ${agent.name}:`, error);
          return {
            name: agent.name,
            description: agent.description,
            url: agent.url,
            inputSchema: {},
            outputSchema: {},
          } as AgentWithSchema;
        }
      })
    );

    return agentSchemas;
  }

  /**
   * Build a single prompt that contains:
   *  - The user's intent/description.
   *  - A JSON dump of every available agent's name, description, inputSchema, outputSchema, tags, etc.
   *  - Clear instructions to return EXACTLY valid JSON listing the steps (with stepId, agentName, inputMapping, outputMapping).
   */
  private buildLLMPlanningPrompt(
    userIntent: UserIntent,
    agents: AgentWithSchema[]
  ): string {
    // 1) USER REQUEST
    const userBlock = `=== USER REQUEST ===
"${userIntent.description}"

Preferences (if any): ${JSON.stringify(userIntent.preferences || {}, null, 2)}
`;

    // 2) AGENT SCHEMAS
    const agentBlocks = agents
      .map((agent, idx) => {
        return `
--- AGENT ${idx + 1} ---
Name: ${agent.name}
Description: ${agent.description}
URL: ${agent.url}
Category: ${agent.category || "N/A"}
Tags: ${agent.tags?.join(", ") || "N/A"}

INPUT SCHEMA:
${JSON.stringify(agent.inputSchema, null, 2)}

OUTPUT SCHEMA:
${JSON.stringify(agent.outputSchema, null, 2)}
`;
      })
      .join("");

    // 3) INSTRUCTIONS
    const instructions = `
You are a powerful AI workflow planner. Based on the USER REQUEST and the EXACT AGENT SCHEMAS provided, produce a valid JSON workflow. 

--- RESPONSE FORMAT REQUIREMENTS ---
• Return ONLY valid JSON (no extra commentary outside of JSON).
• Use this exact structure:

{
  "reasoning": "detailed explanation of why you chose these agents and how you're mapping inputs→outputs",
  "executionMode": "sequential" | "parallel",
  "steps": [
    {
      "stepId": "step_1",
      "agentName": "Exact name of agent (match the 'Name' above)",
      "description": "clear description of what this step accomplishes",
      "inputMapping": {
        "fieldNameInSchema": "sourceValue_or_variable"
      },
      "outputMapping": {
        "fieldNameInSchema": "descriptive_variable_name"
      }
    }
    // ... more steps
  ]
}

--- KEY POINTS ---
1. ONLY use field names that exist in each agent's inputSchema.properties.
2. Ensure ALL required fields (inputSchema.required) are provided via:
   • Direct values from user intent (e.g. if user said "name: Alice", map to that).
   • Or outputs from previous steps (variable names).
   • Or reasonable defaults (if schema has default or enum). 
3. For each step's outputMapping, assign a variable name like "<agentname>_<outputField>".
4. Default workflow to "sequential" UNLESS you identify independent agents that can run in parallel.
5. Explain your reasoning in the "reasoning" field, but do NOT include any additional keys beyond the JSON structure above.

Begin now.
`;

    return `${userBlock}${agentBlocks}${instructions}`;
  }

  /**
   * Calls OpenAI's chat completion endpoint with the constructed prompt,
   * then parses the returned JSON into WorkflowStep[].
   */
  private async llmPlanWorkflow(
    userIntent: UserIntent,
    agents: AgentWithSchema[]
  ): Promise<WorkflowStep[]> {
    console.log(`🤖 Calling LLM with ${agents.length} agent schemas...`);
    const prompt = this.buildLLMPlanningPrompt(userIntent, agents);
    console.log(`📝 Prompt length: ${prompt.length} characters`);

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an expert AI workflow planner that strictly outputs valid JSON according to instructions.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.0,
      max_tokens: 3000,
    });

    const raw = completion.choices[0]?.message?.content;
    console.log(`🤖 LLM response length: ${raw?.length || 0} characters`);
    console.log(`🤖 LLM response preview: ${raw?.substring(0, 200)}...`);

    if (!raw) {
      throw new Error("No response from LLM");
    }

    let parsed: any;
    try {
      parsed = JSON.parse(raw);
      console.log(`✅ Successfully parsed LLM JSON response`);
      console.log(`📋 Response structure:`, Object.keys(parsed));
    } catch (err) {
      console.error("❌ Failed to parse LLM response as JSON:", raw);
      throw err;
    }

    if (!parsed.steps || !Array.isArray(parsed.steps)) {
      console.error("❌ Invalid workflow JSON: missing 'steps' array");
      console.error("❌ Parsed object:", parsed);
      throw new Error("Invalid workflow JSON: missing 'steps' array");
    }

    console.log(`📋 LLM planned ${parsed.steps.length} steps`);
    parsed.steps.forEach((step: any, idx: number) => {
      console.log(
        `   Step ${idx + 1}: ${step.agentName} - ${step.description}`
      );
    });

    // Convert each step into our internal WorkflowStep type (with agentUrl looked up by name)
    const steps: WorkflowStep[] = parsed.steps.map((step: any, idx: number) => {
      // Find the agent to retrieve its URL
      const agentInfo = agents.find((a) => a.name === step.agentName);
      if (!agentInfo) {
        console.error(
          `❌ Agent "${step.agentName}" not found among fetched schemas.`
        );
        console.error(
          `❌ Available agents:`,
          agents.map((a) => a.name)
        );
        throw new Error(
          `Agent "${step.agentName}" not found among fetched schemas.`
        );
      }

      return {
        stepId: step.stepId || `step_${idx + 1}`,
        agentName: agentInfo.name,
        agentUrl: agentInfo.url,
        description: step.description || `Execute ${agentInfo.name}`,
        inputMapping: step.inputMapping || {},
        outputMapping: step.outputMapping || {},
      } as WorkflowStep;
    });

    console.log(`✅ Converted to ${steps.length} WorkflowStep objects`);
    return steps;
  }
}
