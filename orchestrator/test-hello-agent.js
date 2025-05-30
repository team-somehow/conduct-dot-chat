// Test script to demonstrate orchestrator + hello agent integration
const { loadAgent, runAgent } = require("./dist/agents.http");

async function testHelloAgent() {
  console.log("🚀 Testing Hello Agent integration with Orchestrator...\n");

  try {
    // Test 1: Load the hello agent
    console.log("📡 Loading Hello Agent...");
    const agent = await loadAgent("http://localhost:3000");
    console.log(`✅ Loaded: ${agent.name}`);
    console.log(`   Description: ${agent.description}`);
    console.log(`   Wallet: ${agent.wallet}`);
    console.log();

    // Test 2: Execute task with Hello Agent
    console.log("🎯 Executing task with Hello Agent...");
    const taskData = {
      name: "Bob",
      language: "french",
    };

    console.log("📋 Input:", JSON.stringify(taskData, null, 2));

    const result = await runAgent(agent, taskData);

    console.log("✅ Task executed successfully!");
    console.log("📋 Result:", JSON.stringify(result, null, 2));

    // Test 3: Test with different language
    console.log("\n🎯 Testing with Spanish...");
    const spanishTask = {
      name: "Maria",
      language: "spanish",
    };

    const spanishResult = await runAgent(agent, spanishTask);
    console.log("✅ Spanish greeting:", spanishResult.greeting);
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }

  console.log("\n🎉 Integration test complete!");
}

testHelloAgent().catch(console.error);
