// Test script for workflow functionality
const axios = require("axios");

const ORCHESTRATOR_URL = "http://localhost:8080";

async function testWorkflowCreation() {
  console.log("🔧 Testing Workflow Creation...\n");

  try {
    // Test 1: Create a greeting workflow
    console.log("1. Creating a greeting workflow...");
    const greetingWorkflow = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      {
        description: "Say hello to John in Spanish",
        context: { userName: "John" },
        preferences: { speed: "fast", quality: "standard" },
      }
    );

    console.log("✅ Greeting workflow created:");
    console.log(
      `   - Workflow ID: ${greetingWorkflow.data.workflow.workflowId}`
    );
    console.log(`   - Name: ${greetingWorkflow.data.workflow.name}`);
    console.log(`   - Steps: ${greetingWorkflow.data.workflow.steps.length}`);
    console.log(
      `   - Execution Mode: ${greetingWorkflow.data.workflow.executionMode}`
    );
    console.log("");

    // Test 2: Create an image generation workflow
    console.log("2. Creating an image generation workflow...");
    const imageWorkflow = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      {
        description: "Generate an image of a sunset over mountains",
        context: { imageType: "landscape" },
        preferences: { quality: "high" },
      }
    );

    console.log("✅ Image workflow created:");
    console.log(`   - Workflow ID: ${imageWorkflow.data.workflow.workflowId}`);
    console.log(`   - Name: ${imageWorkflow.data.workflow.name}`);
    console.log(`   - Steps: ${imageWorkflow.data.workflow.steps.length}`);
    console.log(
      `   - Execution Mode: ${imageWorkflow.data.workflow.executionMode}`
    );
    console.log("");

    // Test 3: Create a combined workflow
    console.log("3. Creating a combined workflow...");
    const combinedWorkflow = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      {
        description: "Say hello to Alice and then generate an image of a cat",
        context: { userName: "Alice", imageSubject: "cat" },
        preferences: { speed: "balanced" },
      }
    );

    console.log("✅ Combined workflow created:");
    console.log(
      `   - Workflow ID: ${combinedWorkflow.data.workflow.workflowId}`
    );
    console.log(`   - Name: ${combinedWorkflow.data.workflow.name}`);
    console.log(`   - Steps: ${combinedWorkflow.data.workflow.steps.length}`);
    console.log(
      `   - Execution Mode: ${combinedWorkflow.data.workflow.executionMode}`
    );
    console.log("");

    return {
      greetingWorkflowId: greetingWorkflow.data.workflow.workflowId,
      imageWorkflowId: imageWorkflow.data.workflow.workflowId,
      combinedWorkflowId: combinedWorkflow.data.workflow.workflowId,
    };
  } catch (error) {
    console.error(
      "❌ Workflow creation failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function testWorkflowExecution(workflowIds) {
  console.log("🚀 Testing Workflow Execution...\n");

  try {
    // Test 1: Execute greeting workflow
    console.log("1. Executing greeting workflow...");
    const greetingExecution = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/execute`,
      {
        workflowId: workflowIds.greetingWorkflowId,
        input: { name: "John", language: "spanish" },
      }
    );

    console.log("✅ Greeting workflow executed:");
    console.log(
      `   - Execution ID: ${greetingExecution.data.execution.executionId}`
    );
    console.log(`   - Status: ${greetingExecution.data.execution.status}`);
    console.log(
      `   - Output: ${JSON.stringify(
        greetingExecution.data.execution.output,
        null,
        2
      )}`
    );
    console.log("");

    // Test 2: Execute image workflow (if OpenAI key is available)
    console.log("2. Executing image workflow...");
    try {
      const imageExecution = await axios.post(
        `${ORCHESTRATOR_URL}/workflows/execute`,
        {
          workflowId: workflowIds.imageWorkflowId,
          input: { prompt: "A beautiful sunset over snow-capped mountains" },
        }
      );

      console.log("✅ Image workflow executed:");
      console.log(
        `   - Execution ID: ${imageExecution.data.execution.executionId}`
      );
      console.log(`   - Status: ${imageExecution.data.execution.status}`);
      if (imageExecution.data.execution.output) {
        console.log(
          `   - Image URL: ${
            imageExecution.data.execution.output.imageUrl || "Generated"
          }`
        );
      }
    } catch (error) {
      console.log("⚠️  Image workflow failed (likely missing OpenAI API key)");
      console.log(
        `   - Error: ${error.response?.data?.details || error.message}`
      );
    }
    console.log("");

    // Test 3: List all workflows
    console.log("3. Listing all workflows...");
    const workflowsList = await axios.get(`${ORCHESTRATOR_URL}/workflows`);
    console.log(`✅ Found ${workflowsList.data.count} workflows:`);
    workflowsList.data.workflows.forEach((workflow, index) => {
      console.log(`   ${index + 1}. ${workflow.name} (${workflow.workflowId})`);
    });
    console.log("");

    // Test 4: List all executions
    console.log("4. Listing all executions...");
    const executionsList = await axios.get(`${ORCHESTRATOR_URL}/executions`);
    console.log(`✅ Found ${executionsList.data.count} executions:`);
    executionsList.data.executions.forEach((execution, index) => {
      console.log(
        `   ${index + 1}. ${execution.executionId} - Status: ${
          execution.status
        }`
      );
    });
  } catch (error) {
    console.error(
      "❌ Workflow execution failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function main() {
  console.log("🧪 MAHA Orchestrator Workflow Test Suite\n");
  console.log("========================================\n");

  try {
    // Check if orchestrator is running
    console.log("🔍 Checking orchestrator health...");
    const health = await axios.get(`${ORCHESTRATOR_URL}/health`);
    console.log(
      `✅ Orchestrator is healthy with ${health.data.agents.length} agents\n`
    );

    // Test workflow creation
    const workflowIds = await testWorkflowCreation();

    // Test workflow execution
    await testWorkflowExecution(workflowIds);

    console.log("🎉 All tests completed successfully!");
  } catch (error) {
    console.error("💥 Test suite failed:", error.message);
    process.exit(1);
  }
}

// Run the test suite
if (require.main === module) {
  main();
}

module.exports = { testWorkflowCreation, testWorkflowExecution };
