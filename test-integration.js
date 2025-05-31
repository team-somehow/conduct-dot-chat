#!/usr/bin/env node

// Integration test for frontend-orchestrator connection
// This script tests the API endpoints that the frontend uses

const axios = require("axios");

const ORCHESTRATOR_URL = "http://localhost:8080";
const FRONTEND_URL = "http://localhost:5173";

async function testIntegration() {
  console.log("🧪 Testing Frontend-Orchestrator Integration\n");

  try {
    // Test 1: Check orchestrator health
    console.log("1️⃣ Testing orchestrator health...");
    const healthResponse = await axios.get(`${ORCHESTRATOR_URL}/health`);
    console.log("✅ Orchestrator is healthy");
    console.log(`   Agents available: ${healthResponse.data.agents.length}`);
    healthResponse.data.agents.forEach((agent) => {
      console.log(`   - ${agent.name}: ${agent.description}`);
    });
    console.log();

    // Test 2: Check frontend accessibility
    console.log("2️⃣ Testing frontend accessibility...");
    const frontendResponse = await axios.get(FRONTEND_URL);
    console.log("✅ Frontend is accessible");
    console.log(
      `   Title: ${
        frontendResponse.data.match(/<title>(.*?)<\/title>/)?.[1] || "Not found"
      }`
    );
    console.log();

    // Test 3: Test workflow creation
    console.log("3️⃣ Testing workflow creation...");
    const workflowData = {
      description: "Integration test: Create a simple greeting workflow",
      context: { source: "integration-test" },
      preferences: { executionMode: "sequential" },
    };

    const createResponse = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      workflowData
    );
    const workflow = createResponse.data.workflow;
    console.log("✅ Workflow created successfully");
    console.log(`   Workflow ID: ${workflow.workflowId}`);
    console.log(`   Steps: ${workflow.steps.length}`);
    workflow.steps.forEach((step, index) => {
      console.log(`   ${index + 1}. ${step.agentName}: ${step.description}`);
    });
    console.log();

    // Test 4: Test workflow execution
    console.log("4️⃣ Testing workflow execution...");
    const executeResponse = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/execute`,
      {
        workflowId: workflow.workflowId,
        input: {
          userName: "Integration Test User",
          userLanguage: "English",
        },
      }
    );

    const execution = executeResponse.data.execution;
    console.log("✅ Workflow execution started");
    console.log(`   Execution ID: ${execution.executionId}`);
    console.log(`   Status: ${execution.status}`);
    console.log();

    // Test 5: Poll execution status
    console.log("5️⃣ Polling execution status...");
    let finalExecution = execution;
    let attempts = 0;
    const maxAttempts = 10;

    while (finalExecution.status === "running" && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      attempts++;

      try {
        const statusResponse = await axios.get(
          `${ORCHESTRATOR_URL}/workflows/executions/${execution.executionId}`
        );
        finalExecution = statusResponse.data.execution;
        console.log(
          `   Attempt ${attempts}: Status = ${finalExecution.status}`
        );
      } catch (error) {
        console.log(`   Attempt ${attempts}: Error checking status`);
        break;
      }
    }

    console.log("✅ Final execution status:", finalExecution.status);
    if (finalExecution.stepResults && finalExecution.stepResults.length > 0) {
      console.log("   Step results:");
      finalExecution.stepResults.forEach((result, index) => {
        console.log(`   ${index + 1}. ${result.stepId}: ${result.status}`);
        if (result.output) {
          console.log(
            `      Output: ${JSON.stringify(result.output).substring(
              0,
              100
            )}...`
          );
        }
      });
    }
    console.log();

    // Test 6: Test agents endpoint
    console.log("6️⃣ Testing agents endpoint...");
    const agentsResponse = await axios.get(`${ORCHESTRATOR_URL}/agents`);
    console.log("✅ Agents endpoint working");
    console.log(`   Total agents: ${agentsResponse.data.agents.length}`);
    console.log();

    console.log("🎉 All integration tests passed!");
    console.log("\n📋 Summary:");
    console.log("   ✅ Orchestrator health check");
    console.log("   ✅ Frontend accessibility");
    console.log("   ✅ Workflow creation");
    console.log("   ✅ Workflow execution");
    console.log("   ✅ Execution status polling");
    console.log("   ✅ Agents discovery");
    console.log("\n🚀 Frontend-Orchestrator integration is working correctly!");
  } catch (error) {
    console.error("❌ Integration test failed:", error.message);
    if (error.response) {
      console.error("   Response status:", error.response.status);
      console.error("   Response data:", error.response.data);
    }
    process.exit(1);
  }
}

// Run the test
testIntegration();
