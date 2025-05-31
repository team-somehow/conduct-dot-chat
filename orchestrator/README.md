# MAHA Orchestrator

A simplified multi-agent orchestration system that creates and executes AI workflows from natural language prompts.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key (for workflow planning)
- Running MAHA agents (Hello World, DALL-E 3, NFT Deployer)

### Installation

```bash
npm install
```

### Configuration

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
# Edit .env with your OpenAI API key
```

### Start the Orchestrator

```bash
npm run build
npm start
```

The orchestrator will start on `http://localhost:8080`

## 📡 Simplified API

### Create Workflow

Create a workflow from a natural language prompt.

```bash
POST /workflows/create
Content-Type: application/json

{
  "prompt": "Create a personalized greeting for Alice and generate a sunset image"
}
```

**Response:**

```json
{
  "success": true,
  "workflow": {
    "workflowId": "workflow_1234567890_abc123",
    "name": "Create A Greeting Workflow",
    "description": "Workflow for: Create a personalized greeting for Alice and generate a sunset image",
    "userIntent": "Create a personalized greeting for Alice and generate a sunset image",
    "steps": [
      {
        "stepId": "step_1",
        "agentUrl": "http://localhost:3001",
        "agentName": "Hello World Agent",
        "description": "Generate a personalized greeting message.",
        "inputMapping": { "name": "name", "language": "language" },
        "outputMapping": { "greeting": "personalizedGreeting" }
      },
      {
        "stepId": "step_2",
        "agentUrl": "http://localhost:3002",
        "agentName": "DALL-E 3 Image Generator",
        "description": "Generate a sunset image.",
        "inputMapping": { "prompt": "A beautiful sunset" },
        "outputMapping": { "imageUrl": "generatedImageUrl" }
      }
    ],
    "executionMode": "sequential",
    "estimatedDuration": 10000,
    "createdAt": 1234567890123
  },
  "message": "Workflow created with 2 steps"
}
```

### Execute Workflow

Execute a workflow using only its ID. The orchestrator automatically generates appropriate input.

```bash
POST /workflows/execute
Content-Type: application/json

{
  "workflowId": "workflow_1234567890_abc123"
}
```

**Response:**

```json
{
  "success": true,
  "execution": {
    "executionId": "exec_1234567890_xyz789",
    "workflowId": "workflow_1234567890_abc123",
    "status": "completed",
    "startedAt": 1234567890123,
    "completedAt": 1234567890456,
    "input": {
      "name": "Alice",
      "language": "english"
    },
    "output": {
      "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
      "prompt": "A beautiful sunset",
      "size": "1024x1024"
    },
    "stepResults": [
      {
        "stepId": "step_1",
        "status": "completed",
        "input": { "name": "Alice", "language": "english" },
        "output": {
          "greeting": "Hello, Alice! How are you doing today?",
          "language": "english",
          "timestamp": "2024-01-01T00:00:00.000Z"
        }
      },
      {
        "stepId": "step_2",
        "status": "completed",
        "input": { "prompt": "A beautiful sunset" },
        "output": {
          "imageUrl": "https://oaidalleapiprodscus.blob.core.windows.net/...",
          "prompt": "A beautiful sunset",
          "size": "1024x1024",
          "quality": "standard",
          "style": "vivid"
        }
      }
    ]
  }
}
```

### Other Endpoints

- `GET /health` - Health check with agent status
- `GET /agents` - List all discovered agents
- `GET /workflows` - List all created workflows
- `GET /workflows/:workflowId` - Get specific workflow
- `GET /executions` - List all executions
- `GET /executions/:executionId` - Get specific execution

## 🧪 Testing

### Test All Agents

```bash
node test-agents.js
```

### Test Simplified Workflow API

```bash
node test-simplified-workflow.js
```

### Test Individual Agent

```bash
node test-hello-agent.js
```

## 🏗️ Architecture

### Workflow Creation Process

1. **Prompt Analysis**: LLM analyzes the natural language prompt
2. **Agent Selection**: Determines which agents are needed
3. **Step Planning**: Creates sequential workflow steps
4. **Input/Output Mapping**: Maps data flow between agents

### Workflow Execution Process

1. **Input Generation**: Automatically generates appropriate input from the prompt
2. **Sequential Execution**: Runs agents in order, passing outputs to next step
3. **Result Aggregation**: Combines all step results into final output

### Smart Input Generation

The orchestrator automatically extracts information from prompts:

- **Names**: "for Alice" → `name: "Alice"`
- **Languages**: "in Spanish" → `language: "spanish"`
- **Image descriptions**: "sunset image" → `prompt: "A beautiful sunset"`
- **Collections**: "collection called Dreams" → `collectionName: "Dreams"`

## 🔧 Configuration

### Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=8080
NODE_ENV=development
```

### Agent Endpoints

Configure in `src/config.ts`:

```typescript
export const AGENTS = [
  "http://localhost:3001", // Hello World Agent
  "http://localhost:3002", // DALL-E 3 Image Generator
  "http://localhost:3003", // NFT Deployer Agent
];
```

## 📝 Example Prompts

The orchestrator can handle various types of requests:

- **Simple Greeting**: `"Generate a greeting for Bob"`
- **Multi-step**: `"Create a personalized hello and generate an image"`
- **Specific Instructions**: `"Make a Spanish greeting for Maria and create a landscape photo"`
- **NFT Creation**: `"Create an NFT collection called 'Digital Dreams' with AI artwork"`

## 🚨 Error Handling

The API returns structured error responses:

```json
{
  "error": "Workflow creation failed",
  "details": "Agent not available: http://localhost:3001"
}
```

## 🔍 Monitoring

- Check `/health` for system status
- Monitor execution status via `/executions/:executionId`
- View all workflows and executions via list endpoints

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
