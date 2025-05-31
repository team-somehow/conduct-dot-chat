# MAHA Orchestrator

A simplified multi-agent orchestration system that creates and executes AI workflows from natural language prompts. **Now with Model Context Protocol (MCP) support!**

## ✨ New: MCP Integration

The orchestrator now supports **Model Context Protocol (MCP) servers** alongside traditional HTTP agents. Simply provide an MCP-compliant JSON configuration and everything works automatically:

```json
{
  "mcpServers": {
    "akave": {
      "command": "npx",
      "args": ["-y", "akave-mcp-js"],
      "env": {
        "AKAVE_ACCESS_KEY_ID": "your_access_key",
        "AKAVE_SECRET_ACCESS_KEY": "your_secret_key",
        "AKAVE_ENDPOINT_URL": "https://o3-rc1.akave.xyz"
      }
    }
  }
}
```

See [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) for complete documentation.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- OpenAI API key (for workflow planning)
- Running MAHA agents (Hello World, DALL-E 3, NFT Deployer) or MCP servers

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

**For MCP servers**, create an `mcp.json` file:

```bash
# Create MCP configuration
echo '{
  "mcpServers": {
    "akave": {
      "command": "npx",
      "args": ["-y", "akave-mcp-js"],
      "env": {
        "AKAVE_ACCESS_KEY_ID": "your_key",
        "AKAVE_SECRET_ACCESS_KEY": "your_secret",
        "AKAVE_ENDPOINT_URL": "https://o3-rc1.akave.xyz"
      }
    }
  }
}' > mcp.json
```

### Start the Orchestrator

```bash
npm run build
npm start
```

The orchestrator will start on `http://localhost:8080` and automatically discover both HTTP agents and MCP servers.

## 📡 API Endpoints

### Core Workflow API

#### Create Workflow

Create a workflow from a natural language prompt (works with both HTTP agents and MCP servers).

```bash
POST /workflows/create
Content-Type: application/json

{
  "prompt": "Store a file using Akave and generate a sunset image"
}
```

#### Execute Workflow

Execute a workflow using only its ID.

```bash
POST /workflows/execute
Content-Type: application/json

{
  "workflowId": "workflow_1234567890_abc123"
}
```

### Agent Discovery

#### List All Agents

```bash
GET /agents
```

Returns both HTTP and MCP agents:

```json
{
  "agents": [
    {
      "type": "http",
      "name": "Hello World Agent",
      "url": "http://localhost:3001"
    },
    {
      "type": "mcp",
      "name": "akave",
      "serverName": "akave",
      "tools": ["store_file", "get_file"],
      "resources": []
    }
  ]
}
```

### MCP-Specific Endpoints

#### Get MCP Server Status

```bash
GET /mcp/servers
```

#### Refresh MCP Agents

```bash
POST /mcp/refresh
```

#### Get Sample MCP Configuration

```bash
GET /mcp/config/sample
```

### Other Endpoints

- `GET /health` - Health check with both HTTP and MCP agent status
- `GET /workflows` - List all created workflows
- `GET /workflows/:workflowId` - Get specific workflow
- `GET /executions` - List all executions
- `GET /executions/:executionId` - Get specific execution

## 🧪 Testing

### Test All Agents (HTTP + MCP)

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

### Unified Agent System

The orchestrator now supports two types of agents:

1. **HTTP Agents**: Traditional REST API endpoints
2. **MCP Servers**: Model Context Protocol compliant servers

Both agent types are treated uniformly in the workflow system.

### MCP Integration Flow

1. **Configuration Loading**: Automatically loads MCP config from `mcp.json` or environment
2. **Server Management**: Spawns and manages MCP server processes
3. **Agent Discovery**: Discovers tools, resources, and prompts from MCP servers
4. **Workflow Integration**: MCP servers appear as regular agents in workflows
5. **Execution**: Seamless execution of both HTTP and MCP agents

### Workflow Creation Process

1. **Prompt Analysis**: LLM analyzes the natural language prompt
2. **Agent Selection**: Determines which agents (HTTP/MCP) are needed
3. **Step Planning**: Creates sequential workflow steps
4. **Input/Output Mapping**: Maps data flow between agents

### Workflow Execution Process

1. **Input Generation**: Automatically generates appropriate input from the prompt
2. **Sequential Execution**: Runs agents in order, passing outputs to next step
3. **Result Aggregation**: Combines all step results into final output

## 🔧 Configuration

### Environment Variables

```bash
OPENAI_API_KEY=your_openai_api_key_here
PORT=8080
NODE_ENV=development

# Optional: MCP configuration as JSON string
MCP_CONFIG={"mcpServers":{"akave":{"command":"npx","args":["-y","akave-mcp-js"]}}}
```

### HTTP Agent Endpoints

Configure in `src/config.ts`:

```typescript
export const AGENTS = [
  "http://localhost:3001", // Hello World Agent
  "http://localhost:3002", // DALL-E 3 Image Generator
  "http://localhost:3003", // NFT Deployer Agent
];
```

### MCP Server Configuration

Create `mcp.json` file or set `MCP_CONFIG` environment variable. See [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) for details.

## 📝 Example Prompts

The orchestrator can handle various types of requests with both HTTP and MCP agents:

- **Simple Greeting**: `"Generate a greeting for Bob"`
- **File Operations**: `"Store 'Hello World' in a file using Akave"`
- **Multi-step Workflows**: `"Create a personalized hello, save it to Akave, and generate an image"`
- **GitHub Integration**: `"Read a file and create a GitHub issue about it"`
- **NFT Creation**: `"Create an NFT collection called 'Digital Dreams' with AI artwork"`

## 🔍 MCP Server Examples

### Popular MCP Servers

- **Akave Storage**: `akave-mcp-js`
- **GitHub**: `@modelcontextprotocol/server-github`
- **File System**: `@modelcontextprotocol/server-filesystem`
- **Web Fetch**: `@modelcontextprotocol/server-fetch`
- **SQLite**: `@modelcontextprotocol/server-sqlite`

### Configuration Examples

See [MCP_INTEGRATION.md](./MCP_INTEGRATION.md) for complete configuration examples and setup instructions.

## 🚨 Error Handling

The API returns structured error responses for both HTTP and MCP agents:

```json
{
  "error": "Workflow creation failed",
  "details": "MCP server not available: akave"
}
```

## 🔍 Monitoring

- Check `/health` for system status (includes MCP server status)
- Monitor execution status via `/executions/:executionId`
- View MCP server status via `/mcp/servers`
- Use `/mcp/refresh` to refresh MCP agent capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
