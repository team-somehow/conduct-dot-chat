// Simple test script to verify mock logic without TypeScript imports
console.log('🧪 Testing Enhanced Mocks for Specific Flows\n');

// Mock the generateMockWorkflow function logic
function generateMockWorkflow(prompt) {
  const workflowId = `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const promptLower = prompt.toLowerCase();
  let steps = [];
  let name = "AI Workflow";
  
  // LINK to Hedera investment flow
  if (promptLower.includes('link') && promptLower.includes('hedera') && promptLower.includes('invest')) {
    name = "LINK to Hedera Investment Workflow";
    steps = [
      { agentName: "1inch Balance Checker", description: "Check current LINK token balance" },
      { agentName: "LINK Token Bridge", description: "Bridge LINK tokens to Hedera" },
      { agentName: "Hedera Investment Manager", description: "Invest in Hedera DeFi" },
      { agentName: "Hedera Token Service", description: "Set up staking rewards" }
    ];
  }
  // LINK tokens in Aave investment flow
  else if (promptLower.includes('link') && promptLower.includes('aave') && promptLower.includes('invest')) {
    name = "LINK Tokens Aave Investment Workflow";
    steps = [
      { agentName: "LINK Token Manager", description: "Check LINK balance" },
      { agentName: "Aave Protocol Manager", description: "Supply LINK to Aave" },
      { agentName: "DeFi Yield Optimizer", description: "Optimize yield strategy" },
      { agentName: "Aave Protocol Manager", description: "Set up auto-compounding" }
    ];
  }
  // Naruto NFT collection flow
  else if (promptLower.includes('naruto') && (promptLower.includes('nft') || promptLower.includes('collection'))) {
    name = "Naruto NFT Collection Workflow";
    steps = [
      { agentName: "DALL-E 3 Image Generator", description: "Generate Naruto artwork" },
      { agentName: "NFT Metadata Creator", description: "Create Naruto NFT metadata" },
      { agentName: "NFT Deployer Agent", description: "Deploy Naruto NFT contract" }
    ];
  }
  
  return { workflowId, name, steps };
}

// Mock response functions
function getLinkBridgeResponse(input) {
  return {
    bridgeTransactionHash: `0x${Math.random().toString(16).substr(2, 64)}`,
    sourceChain: input.sourceChain || "ethereum",
    targetChain: input.targetChain || "hedera",
    token: "LINK",
    amount: input.amount || "100",
    status: "initiated",
    estimatedTime: "5-10 minutes"
  };
}

function getHederaInvestmentResponse(input) {
  return {
    transactionHash: `0.0.${Math.floor(Math.random() * 999999) + 100000}`,
    action: "invest",
    token: input.token || "LINK",
    amount: input.amount || "100",
    strategy: input.strategy || "liquidity_pool",
    expectedApy: "8.5%"
  };
}

function getImageGeneratorResponse(input) {
  const prompt = (input.prompt || "").toLowerCase();
  if (prompt.includes('naruto')) {
    return {
      imageUrl: "/images/naruto1.png",
      prompt: input.prompt,
      style: "anime art",
      theme: "naruto",
      character: "Naruto Uzumaki"
    };
  }
  return {
    imageUrl: "https://via.placeholder.com/1024x1024/FF5484/FFFFFF?text=AI+Generated",
    prompt: input.prompt,
    style: "digital art"
  };
}

function getAaveProtocolManagerResponse(input) {
  return {
    transactionHash: `0.0.${Math.floor(Math.random() * 999999) + 100000}`,
    action: input.action || "supply",
    token: input.token || "LINK",
    amount: input.amount || "1000",
    pool: input.pool || "aave_v3"
  };
}

function getLinkTokenManagerResponse(input) {
  return {
    transactionHash: `0.0.${Math.floor(Math.random() * 999999) + 100000}`,
    action: input.action || "balance_check",
    token: input.token || "LINK",
    balance: "2500.00"
  };
}

function getDeFiYieldOptimizerResponse(input) {
  return {
    transactionHash: `0.0.${Math.floor(Math.random() * 999999) + 100000}`,
    action: "optimize",
    protocol: input.protocol || "aave",
    token: input.token || "LINK",
    strategy: input.strategy || "supply_optimization",
    optimizedApy: "12.3%"
  };
}

// Test functions
async function testMocks() {
  // Test 1: LINK to Hedera Investment Flow
  console.log('1️⃣ Testing "invest my link token to hedera" flow:');
  try {
    const linkWorkflow = generateMockWorkflow("invest my link token to hedera");
    console.log('✅ Workflow created:', linkWorkflow.name);
    console.log('📋 Steps:', linkWorkflow.steps.map(s => s.agentName).join(' → '));
    
    const bridgeResponse = getLinkBridgeResponse({
      amount: "500",
      sourceChain: "ethereum",
      targetChain: "hedera"
    });
    console.log('🌉 Bridge Response:', {
      token: bridgeResponse.token,
      amount: bridgeResponse.amount,
      status: bridgeResponse.status,
      targetChain: bridgeResponse.targetChain
    });
    
    const investResponse = getHederaInvestmentResponse({
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
    const narutoWorkflow = generateMockWorkflow("naruto based nft collection");
    console.log('✅ Naruto NFT Workflow created:', narutoWorkflow.name);
    console.log('📋 Steps:', narutoWorkflow.steps.map(s => s.agentName).join(' → '));
    
    const imageResponse = getImageGeneratorResponse({
      prompt: "naruto character artwork",
      style: "anime"
    });
    console.log('🎨 Image Generator Response:', {
      imageUrl: imageResponse.imageUrl,
      theme: imageResponse.theme,
      character: imageResponse.character
    });
    
  } catch (error) {
    console.error('❌ Error testing Naruto NFT flow:', error);
  }

  console.log('\n=== Testing Aave Investment Flow ===');
  
  try {
    const aaveWorkflow = generateMockWorkflow("invest my link tokens in Aave");
    console.log('✅ Aave Investment Workflow created:', aaveWorkflow.name);
    console.log('📋 Steps:', aaveWorkflow.steps.map(s => s.agentName).join(' → '));
    
    const linkManagerResponse = getLinkTokenManagerResponse({
      action: "balance_check",
      token: "LINK",
      address: "0x123...abc"
    });
    console.log('🔗 LINK Token Manager Response:', {
      action: linkManagerResponse.action,
      token: linkManagerResponse.token,
      balance: linkManagerResponse.balance
    });
    
    const aaveProtocolResponse = getAaveProtocolManagerResponse({
      action: "supply",
      token: "LINK",
      amount: "1000",
      pool: "aave_v3"
    });
    console.log('🏦 Aave Protocol Manager Response:', {
      action: aaveProtocolResponse.action,
      token: aaveProtocolResponse.token,
      amount: aaveProtocolResponse.amount,
      pool: aaveProtocolResponse.pool
    });
    
    const yieldOptimizerResponse = getDeFiYieldOptimizerResponse({
      protocol: "aave",
      token: "LINK",
      strategy: "supply_optimization"
    });
    console.log('📈 DeFi Yield Optimizer Response:', {
      action: yieldOptimizerResponse.action,
      protocol: yieldOptimizerResponse.protocol,
      optimizedApy: yieldOptimizerResponse.optimizedApy
    });
    
  } catch (error) {
    console.error('❌ Error testing Aave investment flow:', error);
  }

  console.log('\n✨ Mock testing completed successfully!');
}

// Run the test
testMocks().catch(console.error); 