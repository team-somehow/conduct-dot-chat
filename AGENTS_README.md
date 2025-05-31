# MAHA Protocol - Agent Management

This directory contains the MAHA Protocol agent management system with automated startup scripts.

## Quick Start

### Start All Agents

```bash
./start-agents.sh start
```

### Check Agent Status

```bash
./start-agents.sh status
```

### Stop All Agents

```bash
./start-agents.sh stop
```

## Available Agents

| Agent                 | Port | Description                     | Endpoints                  |
| --------------------- | ---- | ------------------------------- | -------------------------- |
| 🤖 **Hello Agent**    | 3001 | Multi-language greeting service | `/meta`, `/run`, `/health` |
| 🎨 **ImageGen Agent** | 3002 | DALL-E 3 image generation       | `/meta`, `/run`, `/health` |
| 🚀 **NFT Deployer**   | 3003 | NFT deployment and minting      | `/meta`, `/run`, `/health` |

## Script Commands

### `./start-agents.sh start`

- Starts all agents in background processes
- Automatically installs dependencies if needed
- Creates log files in `logs/` directory
- Waits for each agent to be ready before continuing
- Shows final status of all agents

### `./start-agents.sh stop`

- Gracefully stops all running agents
- Cleans up PID files
- Shows final status

### `./start-agents.sh restart`

- Stops all agents, waits 2 seconds, then starts them again

### `./start-agents.sh status`

- Shows current status of all agents
- Displays ports and URLs for running agents
- Color-coded output (Green = Running, Red = Stopped)

### `./start-agents.sh logs [agent]`

- Without agent name: Shows available log files
- With agent name: Tails the log file for that agent
- Example: `./start-agents.sh logs hello`

## Log Files

All agent logs are stored in the `logs/` directory:

- `logs/hello.log` - Hello Agent logs
- `logs/imagegen.log` - ImageGen Agent logs
- `logs/nft-deployer.log` - NFT Deployer Agent logs

PID files are also stored here for process management.

## Individual Agent Management

If you need to start agents individually:

### Hello Agent

```bash
cd agents/hello
npm run dev  # Runs on port 3001
```

### ImageGen Agent

```bash
cd agents/imagegen
npm start    # Runs on port 3002
```

### NFT Deployer Agent

```bash
cd agents/nft-deployer
npm run dev  # Runs on port 3003
```

## Testing Agents

Once started, you can test each agent:

### Hello Agent

```bash
# Check metadata
curl http://localhost:3001/meta

# Generate greeting
curl -X POST http://localhost:3001/run \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "language": "english"}'
```

### ImageGen Agent

```bash
# Check metadata
curl http://localhost:3002/meta

# Generate image
curl -X POST http://localhost:3002/run \
  -H "Content-Type: application/json" \
  -d '{"prompt": "a beautiful sunset", "size": "1024x1024"}'
```

### NFT Deployer Agent

```bash
# Check metadata
curl http://localhost:3003/meta

# Deploy NFT collection
curl -X POST http://localhost:3003/run \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Collection",
    "symbol": "MAHA",
    "chainId": 5,
    "mints": [{"to": "0x742d35Cc6634C0532925a3b8D4c9db96590b5c8e", "tokenURI": "https://example.com/token1"}]
  }'
```

## Environment Variables

Make sure to set up the required environment variables:

### For ImageGen Agent

```bash
# In agents/imagegen/.env
OPENAI_API_KEY=your_openai_api_key_here
```

### For NFT Deployer Agent

```bash
# In agents/nft-deployer/.env
PRIVATE_KEY=your_ethereum_private_key_here
INFURA_API_KEY=your_infura_api_key_here  # Optional
```

## Troubleshooting

### Port Already in Use

If you get "port already in use" errors:

```bash
# Find what's using the port
lsof -i :3001  # Replace 3001 with the problematic port

# Kill the process
kill -9 <PID>

# Or use the stop command
./start-agents.sh stop
```

### Dependencies Not Installed

```bash
# Install dependencies for all agents
cd agents/hello && npm install
cd ../imagegen && npm install
cd ../nft-deployer && npm install
```

### View Live Logs

```bash
# Watch all logs in real-time
./start-agents.sh logs hello     # Hello agent logs
./start-agents.sh logs imagegen  # ImageGen agent logs
./start-agents.sh logs nft-deployer  # NFT Deployer logs
```

### Check Agent Health

```bash
curl http://localhost:3001/health  # Hello Agent
curl http://localhost:3002/health  # ImageGen Agent
curl http://localhost:3003/health  # NFT Deployer Agent
```

## Integration with Orchestrator

These agents work with the MAHA Orchestrator system. To start the orchestrator:

```bash
cd orchestrator
npm run dev  # Starts orchestrator on port 3000
```

The orchestrator will automatically discover and use these agents for workflow planning and execution.
