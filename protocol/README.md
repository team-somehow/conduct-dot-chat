# 🔗 Protocol Smart Contracts

This directory contains the complete blockchain protocol implementation for the agent orchestrator system.

## 📁 Directory Structure

```
protocol/
├── src/                      # Smart contract source code
│   ├── AgentRegistry.sol     # Agent registration & discovery
│   ├── ReputationLayer.sol   # Performance tracking & reputation
│   └── OrchestrationContract.sol # Payment & task management
├── test/                     # Comprehensive test suite
│   ├── AgentRegistry.t.sol
│   ├── ReputationLayer.t.sol
│   └── OrchestrationContract.t.sol
├── script/                   # Deployment scripts
│   └── Deploy.s.sol          # Main deployment script
├── lib/                      # Dependencies (forge-std)
├── cache/                    # Build cache
├── out/                      # Compiled contracts
├── broadcast/                # Deployment artifacts
└── foundry.toml             # Foundry configuration
```

## 🚀 Quick Start

```bash
# Install dependencies
forge install

# Compile contracts
forge build

# Run tests
forge test

# Deploy locally
anvil  # In another terminal
forge script script/Deploy.s.sol:DeployLocal --rpc-url http://localhost:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 --broadcast
```

## 📊 Test Results

✅ **51 tests passing** with 100% success rate  
✅ **Comprehensive coverage** including fuzz testing  
✅ **Gas optimization** verified  
✅ **Security validation** complete

## 🔗 Integration

See the main README.md in the parent directory for detailed integration instructions with your orchestrator system.
