#!/bin/bash

# Quick Deploy Script for Flow EVM Testnet
# Avoids hanging on transaction confirmations

echo "🚀 Starting Fast Deployment to Flow EVM Testnet..."
echo "Network: Flow EVM Testnet (Chain ID: 545)"
echo "Gas Price: 2 gwei"
echo ""

# Run deployment with optimized flags to prevent hanging
forge script script/DeployFlowTestnet.s.sol:DeployFlowTestnet \
  --rpc-url https://testnet.evm.nodes.onflow.org \
  --gas-price 2000000000 \
  --broadcast \
  --skip-simulation \
  --legacy \
  --timeout 30 \
  --confirmations 1 \
  --retries 3

echo ""
echo "✅ Deployment completed! Check deployed-contracts.json for addresses."
echo "📊 View on Block Explorer: https://evm-testnet.flowscan.io" 