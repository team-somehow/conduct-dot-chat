#!/usr/bin/env node

/**
 * Test script for the thank you NFT workflow
 *
 * Tests the main use case: "Can you send a thank you nft to [address] for attending eth global prague"
 */

const fetch = require("node-fetch");

const ORCHESTRATOR_URL = "http://localhost:8080";

async function testThankYouNFT() {
  console.log("🎉 Testing Thank You NFT Workflow\n");

  try {
    // Test: Create and execute thank you NFT workflow
    console.log("📝 Creating thank you NFT workflow...");
    const createResponse = await fetch(`${ORCHESTRATOR_URL}/workflows/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt:
          // "Create an nft collection with the theme Somehow and send it to the address 0x742d35Cc6634C0532925a3b8D4C9db96590b5c8e",
          "Create an NFT collection with the theme 'A beautiful sunset over a serene lake' and send it to the address 0x09fAF606dC609687792847662B0Af4E4C4F4995B. Do 1 mint.",
        // "Invest 10 LINK in aave",
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
      `   Pipeline: ${createResult.workflow.steps
        .map((s) => s.agentName)
        .join(" → ")}\n`
    );

    // Execute the workflow
    console.log("🚀 Executing workflow...");
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
    console.log("✅ Workflow execution completed!");
    console.log(`   Execution ID: ${executeResult.execution.executionId}`);
    console.log(`   Status: ${executeResult.execution.status}`);

    if (executeResult.execution.status === "completed") {
      console.log(
        `   Duration: ${Math.round(
          (executeResult.execution.completedAt -
            executeResult.execution.startedAt) /
            1000
        )}s\n`
      );
    }

    // Test separate summary generation endpoint
    console.log("🤖 Testing separate summary generation...");
    const summaryResponse = await fetch(
      `${ORCHESTRATOR_URL}/workflows/generate-summary`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workflowId: createResult.workflow.workflowId,
          executionId: executeResult.execution.executionId,
        }),
      }
    );

    if (!summaryResponse.ok) {
      console.warn(
        `⚠️ Summary generation failed: ${summaryResponse.status} ${summaryResponse.statusText}`
      );
      const errorText = await summaryResponse.text();
      console.warn(`   Error details: ${errorText}`);
    } else {
      const summaryResult = await summaryResponse.json();
      console.log("✅ Summary generated successfully!\n");

      // Show the natural language summary
      console.log("📋 Generated Summary:");
      console.log("=".repeat(80));
      console.log(summaryResult.summary);
      console.log("=".repeat(80));
    }

    // Also show the execution result summary if it was included
    if (executeResult.summary) {
      console.log("\n📋 Execution Response Summary:");
      console.log("=".repeat(50));
      console.log(executeResult.summary);
      console.log("=".repeat(50));
    }

    // Show raw execution data for debugging
    console.log("\n🔍 Raw Execution Data:");
    console.log("Execution Status:", executeResult.execution.status);
    console.log(
      "Step Results Count:",
      executeResult.execution.stepResults?.length || 0
    );
    if (executeResult.execution.stepResults) {
      executeResult.execution.stepResults.forEach((stepResult, index) => {
        console.log(`  Step ${index + 1}:`, {
          status: stepResult.status,
          hasOutput: !!stepResult.output,
          hasError: !!stepResult.error,
          agentName: stepResult.agentName || "Unknown",
        });
      });
    }

    if (executeResult.execution.status === "failed") {
      console.log("❌ Workflow failed!");
      console.log(`   Error: ${executeResult.execution.error}`);
    }
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  console.log("🚀 MAHA Orchestrator - Thank You NFT Test\n");

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

  await testThankYouNFT();

  console.log("\n🎉 Thank you NFT test completed!");
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { testThankYouNFT };
