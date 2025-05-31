# 🔗 Orchestrator Protocol Smart Contracts

A comprehensive blockchain protocol for managing AI agent registrations, payments, and reputation in your orchestrator system.

## 📋 Overview

This protocol consists of three main smart contracts that enable decentralized coordination between orchestrators and AI agents:

1. **AgentRegistry**: Manages agent registration and discovery
2. **ReputationLayer**: Tracks agent performance and ratings
3. **OrchestrationContract**: Handles payments, task execution, and dispute resolution

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│   AgentRegistry │    │  ReputationLayer │    │ OrchestrationContract│
│                 │    │                  │    │                     │
│ • Registration  │    │ • Task Results   │    │ • Task Creation     │
│ • Discovery     │    │ • Ratings        │    │ • Payment Escrow    │
│ • Agent Status  │    │ • Score Calc     │    │ • Dispute Resolution│
└─────────────────┘    └──────────────────┘    └─────────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────▼──────────────┐
                    │      Your Orchestrator     │
                    │                            │
                    │ • Workflow Planning        │
                    │ • Agent Selection          │
                    │ • Task Execution           │
                    │ • Payment Management       │
                    └────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites

- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- Solidity ^0.8.19

### Installation

1. **Navigate to the protocol directory:**

```bash
cd protocol
```

2. **Install Foundry dependencies:**

```bash
forge install foundry-rs/forge-std
```

3. **Compile contracts:**

```bash
forge build
```

4. **Run tests:**

```bash
forge test
```

### Deployment

#### Local Development

```bash
# Start local blockchain (from any directory)
anvil

# Navigate to protocol directory and deploy contracts with test data
cd protocol
forge script script/Deploy.s.sol:DeployLocal --rpc-url http://localhost:8545 --private-key <your-private-key> --broadcast
```

#### Testnet/Mainnet

```bash
# Set environment variables
export PRIVATE_KEY=<your-private-key>
export RPC_URL=<network-rpc-url>

# Navigate to protocol directory and deploy
cd protocol
forge script script/Deploy.s.sol:Deploy --rpc-url $RPC_URL --private-key $PRIVATE_KEY --broadcast --verify
```

## 📖 Contract Documentation

### AgentRegistry

Manages the registration and discovery of AI agents.

#### Key Functions:

- `registerAgent()`: Register a new agent
- `getActiveAgents()`: Get all active agents
- `getAgentsByType()`: Filter agents by type (HTTP/MCP)
- `updateAgent()`: Update agent information
- `deactivateAgent()`: Temporarily disable an agent

#### Example Usage:

```solidity
// Register an HTTP agent
registry.registerAgent(
    0x123..., // agent wallet
    "http://localhost:3001", // endpoint
    "ipfs://QmHash...", // metadata
    1 ether, // cost per task
    AgentRegistry.AgentType.HTTP
);
```

### ReputationLayer

Tracks agent performance and calculates reputation scores.

#### Key Functions:

- `recordTaskCompletion()`: Record task success/failure
- `rateAgent()`: Rate an agent (1-5 stars)
- `getReputationData()`: Get comprehensive reputation info
- `getTopAgents()`: Get highest-rated agents

#### Reputation Scoring:

- **Success Rate**: 40% weight (0-4000 points)
- **User Ratings**: 40% weight (0-4000 points)
- **Response Time**: 20% weight (0-2000 points)
- **Total Score**: 0-10000 (10000 = perfect)

### OrchestrationContract

Handles task creation, payments, and dispute resolution.

#### Task Lifecycle:

1. **PENDING** → Agent can accept the task
2. **EXECUTING** → Agent is working on the task
3. **COMPLETED** → Agent submitted results, payment released
4. **FAILED** → Task failed, payment refunded
5. **DISPUTED** → Orchestrator disputed results
6. **CANCELLED** → Task cancelled before execution

#### Key Functions:

- `createTask()`: Create and fund a new task
- `acceptTask()`: Agent accepts a task
- `submitTaskResult()`: Agent submits completion
- `disputeTask()`: Orchestrator disputes results
- `withdrawBalance()`: Agent withdraws earnings

## 🔌 Integration with Your Orchestrator

### 1. Agent Discovery Integration

Replace your current discovery mechanism:

```typescript
// Current: orchestrator/src/JobRunner.ts
async discoverAgents(): Promise<Agent[]> {
  // Query blockchain registry instead of HTTP endpoints
  const activeAgents = await this.agentRegistry.getActiveAgents();

  return activeAgents.map(agent => ({
    name: agent.agentUrl.split('/').pop(),
    description: `Agent at ${agent.agentUrl}`,
    url: agent.agentUrl,
    type: agent.agentType === 0 ? "http" : "mcp",
    wallet: agent.wallet,
    costPerTask: agent.baseCostPerTask,
    // ... other fields
  }));
}
```

### 2. Payment Integration

Add blockchain payment to task execution:

```typescript
// orchestrator/src/JobRunner.ts
async executeAgentTask<TIn, TOut>(
  agentUrl: string,
  input: TIn
): Promise<TOut> {
  // 1. Get agent from registry
  const agent = await this.agentRegistry.getAgentByUrl(agentUrl);

  // 2. Create blockchain task with payment
  const taskId = await this.orchestrationContract.createTask(
    agent.wallet,
    keccak256(JSON.stringify(input)),
    Date.now() + 3600000, // 1 hour deadline
    { value: agent.baseCostPerTask }
  );

  // 3. Execute task off-chain
  const result = await this.executeOffChain(agentUrl, input);

  // 4. Submit result on-chain
  await this.orchestrationContract.submitTaskResult(
    taskId,
    keccak256(JSON.stringify(result))
  );

  return result;
}
```

### 3. Reputation Integration

Update reputation after task completion:

```typescript
// The OrchestrationContract automatically updates reputation
// when submitTaskResult() or markTaskFailed() is called
```

## 🧪 Testing

### Run All Tests

```bash
forge test -vvv
```

### Run Specific Test Contract

```bash
forge test --match-contract AgentRegistryTest -vvv
```

### Run Fuzz Tests

```bash
forge test --fuzz-runs 10000
```

### Test Coverage

```bash
forge coverage
```

## 📊 Example Workflow

1. **Agent Registration**:

```bash
cast send $AGENT_REGISTRY "registerAgent(address,string,string,uint256,uint8)" \
  0x123... "http://localhost:3001" "ipfs://QmHash" 1000000000000000000 0
```

2. **Create Task**:

```bash
cast send $ORCHESTRATION_CONTRACT "createTask(address,bytes32,uint256)" \
  --value 0.5ether 0x123... 0xabc... 1640995200
```

3. **Agent Accepts & Completes**:

```bash
cast send $ORCHESTRATION_CONTRACT "acceptTask(bytes32)" $TASK_ID
cast send $ORCHESTRATION_CONTRACT "submitTaskResult(bytes32,bytes32)" $TASK_ID 0xdef...
```

4. **Agent Withdraws Payment**:

```bash
cast send $ORCHESTRATION_CONTRACT "withdrawBalance()"
```

## 🔒 Security Features

- **Access Control**: Only authorized orchestrators can update reputation
- **Payment Escrow**: Funds held in contract until task completion
- **Dispute Resolution**: Neutral arbitrators can resolve conflicts
- **Agent Verification**: Only registered, active agents can receive tasks
- **Deadline Enforcement**: Automatic task failure after deadline

## 🛠️ Development

### Project Structure

```
├── src/
│   ├── AgentRegistry.sol           # Agent registration & discovery
│   ├── ReputationLayer.sol         # Performance tracking
│   └── OrchestrationContract.sol   # Task & payment management
├── test/
│   ├── AgentRegistry.t.sol         # Registry tests
│   ├── ReputationLayer.t.sol       # Reputation tests
│   └── OrchestrationContract.t.sol # Orchestration tests
├── script/
│   └── Deploy.s.sol                # Deployment scripts
└── foundry.toml                    # Foundry configuration
```

### Contract Addresses (after deployment)

```
AgentRegistry: 0x...
ReputationLayer: 0x...
OrchestrationContract: 0x...
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Write tests for new functionality
4. Ensure all tests pass
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For integration questions or issues:

- Create an issue in this repository
- Check the test files for usage examples
- Review the contract documentation above

---

**Ready to decentralize your AI agent orchestration!** 🚀
