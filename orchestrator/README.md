# MAHA HTTP Orchestrator

A drop-in replacement for file-based AI agent orchestration that treats every AI agent as a REST microservice. The on-chain flow (stake → escrow → slice → rate) stays exactly the same; only the TypeScript orchestrator changes.

## Architecture

### Agent HTTP Contract

Every agent exposes two JSON endpoints:

| Verb | Path    | Body                      | Response                                                                                                                          | Note                                                  |
| ---- | ------- | ------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| GET  | `/meta` | –                         | `{ "name": "...", "description": "...", "wallet": "0x…", "inputSchema": {...}, "outputSchema": {...}, "previewURI": "ipfs://…" }` | Static data for on-chain AgentStore.upsert            |
| POST | `/run`  | JSON matching inputSchema | JSON matching outputSchema                                                                                                        | Long-running agents should stream or queue internally |

The agent's on-chain wallet must be the same address that posted the stake bond.

## Quick Start

### 1. Installation

```bash
cd orchestrator
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

Required environment variables:

- `RPC_URL`: Ethereum RPC endpoint
- `ORCH_PRIV_KEY`: Orchestrator private key
- `AGENT_STORE_ADDRESS`: Deployed AgentStore contract address
- `TASK_HUB_ADDRESS`: Deployed TaskHub contract address

### 3. Configure Agent Endpoints

Edit `src/config.ts` to add your agent endpoints:

```typescript
export const AGENT_ENDPOINTS = [
  "https://dalle3.my-agent.net",
  "https://watermarker.ai",
  "https://your-custom-agent.com",
];
```

### 4. Run the Orchestrator

```bash
# Development mode
npm run dev

# Build and run
npm run build
npm start

# Available commands:
npm run dev sync      # Sync agents with on-chain registry
npm run dev demo      # Run basic demo job
npm run dev advanced  # Run advanced demo with JobRunner
npm run dev health    # Check agent health
```

## Project Structure

```
orchestrator/
├─ src/
│  ├─ agents.http.ts   # HTTP agent discovery & execution
│  ├─ JobRunner.ts     # Job orchestration logic
│  ├─ Contract.ts      # Blockchain interaction (viem)
│  ├─ config.ts       # Configuration & endpoints
│  └─ server.ts       # Main CLI application
├─ package.json
├─ tsconfig.json
├─ .env.example
└─ README.md
```

## Core Components

### HttpAgent Interface

```typescript
interface HttpAgent {
  url: string; // base URL
  name: string;
  description: string;
  wallet: `0x${string}`; // on-chain key
  inputValidate: ValidateFunction;
  outputValidate: ValidateFunction;
  previewURI: string;
}
```

### Agent Discovery

```typescript
import { loadAgent } from "./agents.http";

const agent = await loadAgent("https://my-agent.com");
// Automatically fetches /meta, compiles JSON schemas
```

### Job Execution

```typescript
import { runAgent } from "./agents.http";

const result = await runAgent(agent, {
  prompt: "cyberpunk corgi astronaut",
});
// Validates input/output against schemas
```

### JobRunner Class

The `JobRunner` provides high-level orchestration:

```typescript
const jobRunner = new JobRunner();

// Load agents
const dalle = await jobRunner.loadAgent("https://dalle3.my-agent.net");
const watermarker = await jobRunner.loadAgent("https://watermarker.ai");

// Create and run job
const jobId = await jobRunner.createJob(
  userAddress,
  { prompt: "futuristic city" },
  parseEther("0.1")
);

const result = await jobRunner.runJob({
  jobId,
  totalBudget: parseEther("0.1"),
  jobData: { prompt: "futuristic city" },
  agents: [dalle, watermarker],
});
```

## Agent Implementation Example

Here's how to implement a compliant agent:

### Agent Metadata (`GET /meta`)

```json
{
  "name": "DALL-E 3 Generator",
  "description": "AI image generation using DALL-E 3",
  "wallet": "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
  "inputSchema": {
    "type": "object",
    "properties": {
      "prompt": { "type": "string", "maxLength": 1000 }
    },
    "required": ["prompt"]
  },
  "outputSchema": {
    "type": "object",
    "properties": {
      "imageUrl": { "type": "string", "format": "uri" },
      "prompt": { "type": "string" }
    },
    "required": ["imageUrl", "prompt"]
  },
  "previewURI": "ipfs://QmYourPreviewHash"
}
```

### Agent Execution (`POST /run`)

```javascript
app.post("/run", async (req, res) => {
  const { prompt } = req.body;

  // Your AI logic here
  const imageUrl = await generateImage(prompt);

  res.json({
    imageUrl,
    prompt,
  });
});
```

## Deployment

### Agent Deployment

Deploy your agents to any platform that supports HTTPS:

- Vercel
- Fly.io
- Railway
- AWS Lambda
- Google Cloud Functions

### Orchestrator Deployment

```bash
# Build
npm run build

# Deploy to your preferred platform
# Make sure to set environment variables
```

## Benefits

✅ **No file I/O** – agents just need HTTPS servers  
✅ **Schema-safe** – each call validated by AJV in/out  
✅ **Hot-swappable** – add/remove endpoints by editing config  
✅ **Still modular** – on-chain reputation, stake, escrow unchanged  
✅ **Hackathon-friendly** – quick deployment on free platforms

## Error Handling

The orchestrator includes comprehensive error handling:

- **Network failures**: Automatic retries and fallbacks
- **Schema validation**: Input/output validation with clear error messages
- **Blockchain errors**: Transaction failure handling and gas estimation
- **Agent timeouts**: Configurable timeout handling

## Monitoring

Built-in health checks and monitoring:

```bash
npm run dev health  # Check all agent endpoints
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see LICENSE file for details
