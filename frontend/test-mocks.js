// Test script to verify the new mocks work correctly
import { orchestratorAPI } from './src/api/orchestrator.ts';

async function testMocks() {
  console.log('🧪 Testing Enhanced Mocks for Specific Flows\n');

  // Test 1: LINK to Hedera Investment Flow
  console.log('1️⃣ Testing "invest my link token to hedera" flow:');
  try {
    const linkWorkflow = await orchestratorAPI.createWorkflow("invest my link token to hedera");
    console.log('✅ Workflow created:', linkWorkflow.workflow.name);
    console.log('📋 Steps:', linkWorkflow.workflow.steps.map(s => s.agentName).join(' → '));
    
    // Test LINK Bridge Agent
    const bridgeResponse = orchestratorAPI.getLinkBridgeResponse({
      amount: "500",
      sourceChain: "ethereum",
      targetChain: "hedera"
    });
    console.log('🌉 Bridge Response:', {
      token: bridgeResponse.token,
      amount: bridgeResponse.amount,
      status: bridgeResponse.status,
      targetAddress: bridgeResponse.targetAddress
    });
    
    // Test Hedera Investment Manager
    const investResponse = orchestratorAPI.getHederaInvestmentResponse({
      token: "LINK",
      amount: "500",
      strategy: "liquidity_pool"
    });
    console.log('💰 Investment Response:', {
      action: investResponse.action,
      token: investResponse.token,
      amount: investResponse.amount,
      expectedApy: investResponse.expectedApy
    });
    
  } catch (error) {
    console.error('❌ Error in LINK flow:', error);
  }

  console.log('\n' + '='.repeat(50) + '\n');

  // Test 2: Naruto NFT Collection Flow
  console.log('2️⃣ Testing "naruto based nft collection" flow:');
  try {
    // Test Naruto NFT workflow creation
    const narutoWorkflow = await orchestratorAPI.generateMockWorkflow("naruto based nft collection");
    console.log('✅ Naruto NFT Workflow created:', narutoWorkflow.name);
    console.log('📋 Steps:', narutoWorkflow.steps.map(s => s.agentName).join(' → '));
    
    // Test Image Generator response
    const imageResponse = await orchestratorAPI.getHardcodedResponse(
      'http://localhost:3007/generate',
      { prompt: "naruto character artwork", style: "anime" }
    );
    console.log('🎨 Image Generator Response:', imageResponse);
    
    // Test Hedera Token Service response
    const tokenResponse = await orchestratorAPI.getHardcodedResponse(
      'http://localhost:3011/create',
      { action: "create", name: "Naruto Collection", symbol: "NARUTO" }
    );
    console.log('🪙 Token Service Response:', tokenResponse);
    
    // Test NFT Deployer response
    const nftResponse = await orchestratorAPI.getHardcodedResponse(
      'http://localhost:3005/deploy',
      { name: "Naruto Collection", symbol: "NARUTO", imageUrl: "https://example.com/naruto.png" }
    );
    console.log('🚀 NFT Deployer Response:', nftResponse);
    
  } catch (error) {
    console.error('❌ Error testing Naruto NFT flow:', error);
  }

  console.log('\n=== Testing Aave Investment Flow ===');
  
  try {
    // Test Aave investment workflow creation
    const aaveWorkflow = await orchestratorAPI.generateMockWorkflow("invest my link tokens in Aave");
    console.log('✅ Aave Investment Workflow created:', aaveWorkflow.name);
    console.log('📋 Steps:', aaveWorkflow.steps.map(s => s.agentName).join(' → '));
    
    // Test LINK Token Manager response
    const linkManagerResponse = await orchestratorAPI.getHardcodedResponse(
      'http://localhost:3013/balance',
      { action: "balance_check", token: "LINK", address: "0x123...abc" }
    );
    console.log('🔗 LINK Token Manager Response:', linkManagerResponse);
    
    // Test Aave Protocol Manager response
    const aaveProtocolResponse = await orchestratorAPI.getHardcodedResponse(
      'http://localhost:3012/supply',
      { action: "supply", token: "LINK", amount: "1000", pool: "aave_v3" }
    );
    console.log('🏦 Aave Protocol Manager Response:', aaveProtocolResponse);
    
    // Test DeFi Yield Optimizer response
    const yieldOptimizerResponse = await orchestratorAPI.getHardcodedResponse(
      'http://localhost:3014/optimize',
      { protocol: "aave", token: "LINK", strategy: "supply_optimization" }
    );
    console.log('📈 DeFi Yield Optimizer Response:', yieldOptimizerResponse);
    
  } catch (error) {
    console.error('❌ Error testing Aave investment flow:', error);
  }

  console.log('\n✨ Mock testing completed!');
}

// Run the test
testMocks().catch(console.error); 