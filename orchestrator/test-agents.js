#!/usr/bin/env node

/**
 * Test script for individual agents
 * Verifies that all agents are responding correctly
 */

const fetch = require("node-fetch");

const AGENTS = [
  "http://localhost:3001", // Hello World Agent
  "http://localhost:3002", // DALL-E 3 Image Generator
  "http://localhost:3003", // NFT Deployer Agent
];

async function testAgent(agentUrl) {
  console.log(`\n🤖 Testing agent: ${agentUrl}`);

  try {
    // Test 1: Health check
    const healthResponse = await fetch(`${agentUrl}/health`);
    if (healthResponse.ok) {
      console.log("   ✅ Health check passed");
    } else {
      console.log("   ❌ Health check failed");
      return false;
    }

    // Test 2: Metadata
    const metaResponse = await fetch(`${agentUrl}/meta`);
    if (metaResponse.ok) {
      const meta = await metaResponse.json();
      console.log(`   ✅ Metadata: ${meta.name}`);
      console.log(`   📝 Description: ${meta.description}`);
    } else {
      console.log("   ❌ Metadata fetch failed");
      return false;
    }

    // Test 3: Basic functionality test
    let testInput = {};
    if (agentUrl.includes("3001")) {
      // Hello World Agent
      testInput = { name: "TestUser", language: "english" };
    } else if (agentUrl.includes("3002")) {
      // DALL-E 3 Image Generator
      testInput = { prompt: "A simple test image" };
    } else if (agentUrl.includes("3003")) {
      // NFT Deployer Agent
      testInput = {
        imageUrl: "https://example.com/test.png",
        collectionName: "Test Collection",
        recipientAddress: "0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
      };
    }

    if (Object.keys(testInput).length > 0) {
      const runResponse = await fetch(`${agentUrl}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(testInput),
      });

      if (runResponse.ok) {
        const result = await runResponse.json();
        console.log("   ✅ Execution test passed");
        console.log(
          `   📤 Result: ${JSON.stringify(result).substring(0, 100)}...`
        );
      } else {
        console.log("   ❌ Execution test failed");
        const error = await runResponse.text();
        console.log(`   Error: ${error.substring(0, 100)}...`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Agent test failed: ${error.message}`);
    return false;
  }
}

async function testOrchestrator() {
  console.log("\n🎯 Testing Orchestrator");

  try {
    // Test agent discovery
    const agentsResponse = await fetch("http://localhost:8080/agents");
    if (agentsResponse.ok) {
      const agentsResult = await agentsResponse.json();
      console.log(`   ✅ Agent discovery: ${agentsResult.count} agents found`);
      agentsResult.agents.forEach((agent) => {
        console.log(`   🤖 ${agent.name} (${agent.url})`);
      });
    } else {
      console.log("   ❌ Agent discovery failed");
      return false;
    }

    return true;
  } catch (error) {
    console.log(`   ❌ Orchestrator test failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log("🧪 MAHA Agent Test Suite\n");

  let allPassed = true;

  // Test individual agents
  for (const agentUrl of AGENTS) {
    const passed = await testAgent(agentUrl);
    if (!passed) {
      allPassed = false;
    }
  }

  // Test orchestrator
  const orchestratorPassed = await testOrchestrator();
  if (!orchestratorPassed) {
    allPassed = false;
  }

  console.log("\n" + "=".repeat(50));
  if (allPassed) {
    console.log("🎉 All tests passed! System is ready.");
  } else {
    console.log("❌ Some tests failed. Check the output above.");
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testAgent, testOrchestrator };
