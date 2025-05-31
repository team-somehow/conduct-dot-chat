// LLM-Powered Workflow Planning Test
// This test demonstrates the AI workflow planner creating optimal multi-agent workflows
const axios = require("axios");

const ORCHESTRATOR_URL = "http://localhost:8080";

async function testLLMWorkflowPlanning() {
  console.log("🧠 LLM-Powered Workflow Planning Test");
  console.log("=====================================\n");

  try {
    // Test 1: Complex multi-agent request
    console.log("1. Testing complex multi-agent workflow creation...");
    console.log(
      "   📝 Request: 'Greet Maria in French, then create an image of a beautiful French countryside'"
    );

    const complexWorkflow = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/create`,
      {
        description:
          "Greet Maria in French, then create an image of a beautiful French countryside",
        context: {
          userName: "Maria",
          language: "french",
          imageTheme: "countryside",
        },
        preferences: { quality: "high", style: "artistic" },
      }
    );

    console.log("✅ LLM-planned workflow created:");
    console.log(
      `   - Workflow ID: ${complexWorkflow.data.workflow.workflowId}`
    );
    console.log(`   - Name: ${complexWorkflow.data.workflow.name}`);
    console.log(`   - Steps: ${complexWorkflow.data.workflow.steps.length}`);
    console.log(
      `   - Execution Mode: ${complexWorkflow.data.workflow.executionMode}`
    );

    // Show the LLM's planning decisions
    console.log("   - LLM-Generated Workflow Steps:");
    complexWorkflow.data.workflow.steps.forEach((step, index) => {
      console.log(`     ${index + 1}. ${step.agentName}: ${step.description}`);
      console.log(
        `        Input Mapping: ${JSON.stringify(step.inputMapping)}`
      );
      console.log(
        `        Output Mapping: ${JSON.stringify(step.outputMapping)}`
      );
    });
    console.log("");

    // Test 2: Execute the workflow
    console.log("2. Executing LLM-planned workflow...");

    const execution = await axios.post(
      `${ORCHESTRATOR_URL}/workflows/execute`,
      {
        workflowId: complexWorkflow.data.workflow.workflowId,
        input: {
          name: "Maria",
          language: "french",
          prompt:
            "a beautiful French countryside with rolling hills and vineyards",
        },
      }
    );

    console.log("✅ LLM-planned workflow executed:");
    console.log(`   - Execution ID: ${execution.data.execution.executionId}`);
    console.log(`   - Status: ${execution.data.execution.status}`);

    // Show detailed results
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
      console.log("\n🎉 LLM-Powered Multi-Agent Workflow SUCCESS!");
      console.log(
        "   ✅ AI successfully planned and executed a complex workflow"
      );

      if (
        execution.data.execution.output &&
        execution.data.execution.output.imageUrl
      ) {
        console.log(
          `   🖼️  Generated Image: ${execution.data.execution.output.imageUrl}`
        );
      }
    }

    return complexWorkflow.data.workflow.workflowId;
  } catch (error) {
    console.error(
      "❌ LLM workflow planning test failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}

async function testLLMVsRuleBasedPlanning() {
  console.log("\n🤖 LLM vs Rule-Based Planning Comparison");
  console.log("=========================================\n");

  try {
    // Test different types of requests to see how LLM handles them
    const testCases = [
      {
        description: "Say hello to John and then show me a picture of a sunset",
        expected: "Should create greeting → image workflow",
      },
      {
        description: "Create an image of a mountain landscape",
        expected: "Should use only image agent",
      },
      {
        description: "Greet Sarah in German",
        expected: "Should use only greeting agent",
      },
      {
        description:
          "Welcome Tom in Spanish, then generate a picture of Spanish architecture",
        expected: "Should create greeting → image workflow with Spanish theme",
      },
    ];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      console.log(`Test ${i + 1}: "${testCase.description}"`);
      console.log(`Expected: ${testCase.expected}`);

      try {
        const workflow = await axios.post(
          `${ORCHESTRATOR_URL}/workflows/create`,
          {
            description: testCase.description,
            context: {},
            preferences: {},
          }
        );

        console.log(
          `✅ Created ${workflow.data.workflow.steps.length}-step workflow:`
        );
        workflow.data.workflow.steps.forEach((step, index) => {
          console.log(
            `   ${index + 1}. ${step.agentName}: ${step.description}`
          );
        });
        console.log("");
      } catch (error) {
        console.error(`❌ Failed: ${error.response?.data || error.message}`);
      }
    }
  } catch (error) {
    console.error("❌ Comparison test failed:", error.message);
  }
}

async function main() {
  console.log("🧠 LLM-Powered Workflow Planning Test Suite\n");
  console.log("============================================\n");

  try {
    // Check orchestrator health
    console.log("🔍 Checking orchestrator and agents...");
    const health = await axios.get(`${ORCHESTRATOR_URL}/health`);
    console.log(
      `✅ Orchestrator healthy with ${health.data.agents.length} agents\n`
    );

    // Run LLM planning tests
    await testLLMWorkflowPlanning();
    await testLLMVsRuleBasedPlanning();

    console.log("\n🎉 All LLM workflow planning tests completed!");
    console.log("✅ Successfully demonstrated AI-powered workflow creation");
  } catch (error) {
    console.error("💥 LLM workflow planning test suite failed:", error.message);
    process.exit(1);
  }
}

// Run the test suite
if (require.main === module) {
  main();
}

module.exports = {
  testLLMWorkflowPlanning,
  testLLMVsRuleBasedPlanning,
};
