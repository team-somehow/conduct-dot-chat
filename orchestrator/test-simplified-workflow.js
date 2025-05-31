#!/usr/bin/env node

/**
 * Test script for the simplified workflow API
 *
 * This demonstrates the new simplified endpoints:
 * - POST /workflows/create (only requires prompt)
 * - POST /workflows/execute (only requires workflowId)
 */

const fetch = require("node-fetch");

const ORCHESTRATOR_URL = "http://localhost:8080";

async function testSimplifiedWorkflow() {
  console.log("🧪 Testing Simplified Workflow API\n");

  try {
    // Test 1: Create workflow with just a prompt
    console.log("📝 Step 1: Creating workflow with simple prompt...");
    const createResponse = await fetch(`${ORCHESTRATOR_URL}/workflows/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt:
          "Create a personalized greeting for Alice and generate a beautiful sunset image",
      }),
    });

    if (!createResponse.ok) {
      throw new Error(
        `Create failed: ${createResponse.status} ${createResponse.statusText}`
      );
    }

    const createResult = await createResponse.json();
    console.log("✅ Workflow created successfully!");
    console.log(`   Workflow ID: ${createResult.workflow.workflowId}`);
    console.log(`   Name: ${createResult.workflow.name}`);
    console.log(`   Steps: ${createResult.workflow.steps.length}`);
    console.log(
      `   Steps: ${createResult.workflow.steps
        .map((s) => s.agentName)
        .join(" → ")}\n`
    );

    // Test 2: Execute workflow with just workflowId
    console.log("🚀 Step 2: Executing workflow...");
    const executeResponse = await fetch(
      `${ORCHESTRATOR_URL}/workflows/execute`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: createResult.workflow.workflowId,
        }),
      }
    );

    if (!executeResponse.ok) {
      throw new Error(
        `Execute failed: ${executeResponse.status} ${executeResponse.statusText}`
      );
    }

    const executeResult = await executeResponse.json();
    console.log("✅ Workflow execution started!");
    console.log(`   Execution ID: ${executeResult.execution.executionId}`);
    console.log(`   Status: ${executeResult.execution.status}`);
    console.log(`   Input: ${JSON.stringify(executeResult.execution.input)}\n`);

    // Test 3: Monitor execution status
    console.log("👀 Step 3: Monitoring execution...");
    let execution = executeResult.execution;
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max

    while (execution.status === "running" || execution.status === "pending") {
      if (attempts >= maxAttempts) {
        console.log("⏰ Timeout waiting for execution to complete");
        break;
      }

      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;

      const statusResponse = await fetch(
        `${ORCHESTRATOR_URL}/executions/${execution.executionId}`
      );
      if (statusResponse.ok) {
        const statusResult = await statusResponse.json();
        execution = statusResult.execution;
        console.log(`   Status: ${execution.status} (${attempts}s)`);
      }
    }

    // Test 4: Show final results
    console.log("\n📊 Final Results:");
    console.log(`   Status: ${execution.status}`);
    if (execution.status === "completed") {
      console.log("✅ Workflow completed successfully!");
      console.log(
        `   Duration: ${execution.completedAt - execution.startedAt}ms`
      );

      if (execution.stepResults) {
        console.log("\n📋 Step Results:");
        execution.stepResults.forEach((step, index) => {
          console.log(`   Step ${index + 1}: ${step.status}`);
          if (step.output) {
            const output =
              typeof step.output === "string"
                ? step.output
                : JSON.stringify(step.output, null, 2);
            console.log(
              `   Output: ${output.substring(0, 100)}${
                output.length > 100 ? "..." : ""
              }`
            );
          }
        });
      }

      if (execution.output) {
        console.log("\n🎯 Final Output:");
        console.log(JSON.stringify(execution.output, null, 2));
      }
    } else if (execution.status === "failed") {
      console.log("❌ Workflow failed!");
      console.log(`   Error: ${execution.error}`);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

async function testMultiplePrompts() {
  console.log("\n🔄 Testing Multiple Different Prompts\n");

  const prompts = [
    "Generate a greeting for Bob in Spanish",
    "Create an image of a cyberpunk cityscape",
    "Make a personalized hello message and generate a landscape photo",
    "Create an NFT collection called 'Digital Dreams' with AI-generated artwork",
  ];

  for (let i = 0; i < prompts.length; i++) {
    const prompt = prompts[i];
    console.log(`\n📝 Test ${i + 1}: "${prompt}"`);

    try {
      const response = await fetch(`${ORCHESTRATOR_URL}/workflows/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`   ✅ Created: ${result.workflow.workflowId}`);
        console.log(
          `   Steps: ${result.workflow.steps
            .map((s) => s.agentName)
            .join(" → ")}`
        );
      } else {
        console.log(`   ❌ Failed: ${response.status}`);
      }
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
    }
  }
}

// Main execution
async function main() {
  console.log("🚀 MAHA Orchestrator - Simplified API Test\n");

  // Check if orchestrator is running
  try {
    const healthResponse = await fetch(`${ORCHESTRATOR_URL}/health`);
    if (!healthResponse.ok) {
      throw new Error("Orchestrator not responding");
    }
    console.log("✅ Orchestrator is running\n");
  } catch (error) {
    console.error(
      "❌ Cannot connect to orchestrator. Make sure it's running on port 8080"
    );
    process.exit(1);
  }

  await testSimplifiedWorkflow();
  await testMultiplePrompts();

  console.log("\n🎉 All tests completed!");
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testSimplifiedWorkflow, testMultiplePrompts };
