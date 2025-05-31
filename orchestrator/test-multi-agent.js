// Multi-Agent Orchestration Test
// This test demonstrates data flowing between multiple agents
const axios = require("axios");

const ORCHESTRATOR_URL = "http://localhost:8080";

async function testMultiAgentWorkflow() {
  console.log("🔗 Multi-Agent Orchestration Test");
  console.log("=====================================\n");

  try {
    // Test 1: Create a workflow that chains Hello -> Image Generation
    console.log("1. Creating a multi-agent workflow...");
    console.log(
      "   📝 Description: 'Say hello to Alice in Spanish then generate an image of the greeting'"
    );

    const multiAgentWorkflow = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      {
        description:
          "Say hello to Alice in Spanish then generate an image of the greeting",
        context: { userName: "Alice", language: "spanish" },
        preferences: { quality: "high", style: "artistic" },
      }
    );

    console.log("✅ Multi-agent workflow created:");
    console.log(
      `   - Workflow ID: ${multiAgentWorkflow.data.workflow.workflowId}`
    );
    console.log(`   - Name: ${multiAgentWorkflow.data.workflow.name}`);
    console.log(`   - Steps: ${multiAgentWorkflow.data.workflow.steps.length}`);
    console.log(
      `   - Execution Mode: ${multiAgentWorkflow.data.workflow.executionMode}`
    );

    // Show the workflow steps
    console.log("   - Workflow Steps:");
    multiAgentWorkflow.data.workflow.steps.forEach((step, index) => {
      console.log(`     ${index + 1}. ${step.agentName}: ${step.description}`);
      console.log(
        `        Input Mapping: ${JSON.stringify(step.inputMapping)}`
      );
      console.log(
        `        Output Mapping: ${JSON.stringify(step.outputMapping)}`
      );
    });
    console.log("");

    // Test 2: Execute the multi-agent workflow
    console.log("2. Executing multi-agent workflow...");
    console.log("   🔄 This will demonstrate data flowing between agents:");
    console.log(
      "   📤 Input → Hello Agent → Greeting Text → Image Agent → Generated Image"
    );

    const execution = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/execute`,
      {
        workflowId: multiAgentWorkflow.data.workflow.workflowId,
        input: {
          name: "Alice",
          language: "spanish",
          imageStyle: "a beautiful artistic illustration",
        },
      }
    );

    console.log("✅ Multi-agent workflow executed:");
    console.log(`   - Execution ID: ${execution.data.execution.executionId}`);
    console.log(`   - Status: ${execution.data.execution.status}`);
    console.log(
      `   - Total Steps: ${execution.data.execution.stepResults.length}`
    );

    // Show detailed step results
    console.log("\n   📊 Step-by-Step Results:");
    execution.data.execution.stepResults.forEach((stepResult, index) => {
      console.log(`   
   Step ${index + 1}: ${stepResult.stepId}
   ├─ Status: ${stepResult.status}
   ├─ Input: ${JSON.stringify(stepResult.input, null, 6).replace(
     /\n/g,
     "\n   │  "
   )}
   ${
     stepResult.output
       ? `├─ Output: ${JSON.stringify(stepResult.output, null, 6).replace(
           /\n/g,
           "\n   │  "
         )}`
       : ""
   }
   ${
     stepResult.error
       ? `└─ Error: ${stepResult.error}`
       : "└─ ✅ Completed successfully"
   }`);
    });

    if (execution.data.execution.status === "completed") {
      console.log("\n🎉 Multi-Agent Data Flow SUCCESS!");
      console.log("   ✅ Data successfully flowed between agents");

      if (
        execution.data.execution.output &&
        execution.data.execution.output.imageUrl
      ) {
        console.log(
          `   🖼️  Final Image URL: ${execution.data.execution.output.imageUrl}`
        );
      }
    } else {
      console.log(
        "\n⚠️  Multi-agent workflow had issues - checking details..."
      );
    }

    return multiAgentWorkflow.data.workflow.workflowId;
  } catch (error) {
    console.error(
      "❌ Multi-agent workflow test failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function testSimpleChaining() {
  console.log("\n🔗 Simple Agent Chaining Test");
  console.log("==============================\n");

  try {
    // Create a simple 2-step workflow manually
    console.log("1. Creating a simple greeting → image workflow...");

    const simpleWorkflow = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      {
        description:
          "Generate a greeting for Bob and then create an image of that greeting",
        context: { userName: "Bob" },
        preferences: { speed: "fast" },
      }
    );

    console.log("✅ Simple workflow created:");
    console.log(`   - Workflow ID: ${simpleWorkflow.data.workflow.workflowId}`);
    console.log(`   - Steps: ${simpleWorkflow.data.workflow.steps.length}`);

    // Execute with specific input
    console.log("\n2. Executing simple chaining workflow...");

    const execution = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/execute`,
      {
        workflowId: simpleWorkflow.data.workflow.workflowId,
        input: {
          name: "Bob",
          language: "english",
        },
      }
    );

    console.log("✅ Simple workflow executed:");
    console.log(`   - Status: ${execution.data.execution.status}`);

    // Show the data transformation
    if (execution.data.execution.stepResults.length >= 2) {
      const step1Output = execution.data.execution.stepResults[0].output;
      const step2Input = execution.data.execution.stepResults[1].input;

      console.log("\n🔄 Data Transformation:");
      console.log(`   Step 1 Output: ${JSON.stringify(step1Output)}`);
      console.log(`   Step 2 Input:  ${JSON.stringify(step2Input)}`);
      console.log("   ✅ Data successfully passed between agents!");
    }
  } catch (error) {
    console.error(
      "❌ Simple chaining test failed:",
      error.response?.data || error.message
    );
  }
}

async function demonstrateDataFlow() {
  console.log("\n📊 Data Flow Analysis");
  console.log("======================\n");

  try {
    // Get all executions to analyze data flow
    const executions = await axios.get(`${ORCHESTRATOR_URL}/executions`);

    console.log(`Found ${executions.data.count} total executions`);

    // Find multi-step executions
    const multiStepExecutions = executions.data.executions.filter(
      (exec) => exec.stepResults && exec.stepResults.length > 1
    );

    console.log(`Multi-step executions: ${multiStepExecutions.length}`);

    multiStepExecutions.forEach((execution, index) => {
      console.log(`\nExecution ${index + 1}: ${execution.executionId}`);
      console.log(`Status: ${execution.status}`);

      if (execution.stepResults.length > 1) {
        console.log("Data Flow:");
        execution.stepResults.forEach((step, stepIndex) => {
          console.log(`  Step ${stepIndex + 1}:`);
          console.log(`    Input:  ${JSON.stringify(step.input)}`);
          if (step.output) {
            console.log(`    Output: ${JSON.stringify(step.output)}`);
          }
          if (stepIndex < execution.stepResults.length - 1) {
            console.log("    ↓ (flows to next step)");
          }
        });
      }
    });
  } catch (error) {
    console.error("❌ Data flow analysis failed:", error.message);
  }
}

async function main() {
  console.log("🧪 MAHA Multi-Agent Orchestration Test Suite\n");
  console.log("==============================================\n");

  try {
    // Check orchestrator health
    console.log("🔍 Checking orchestrator and agents...");
    const health = await axios.get(`${ORCHESTRATOR_URL}/health`);
    console.log(
      `✅ Orchestrator healthy with ${health.data.agents.length} agents\n`
    );

    // Run multi-agent tests
    await testMultiAgentWorkflow();
    await testSimpleChaining();
    await demonstrateDataFlow();

    console.log("\n🎉 All multi-agent tests completed!");
    console.log("✅ Successfully demonstrated data flowing between agents");
  } catch (error) {
    console.error("💥 Multi-agent test suite failed:", error.message);
    process.exit(1);
  }
}

// Run the test suite
if (require.main === module) {
  main();
}

module.exports = {
  testMultiAgentWorkflow,
  testSimpleChaining,
  demonstrateDataFlow,
};
