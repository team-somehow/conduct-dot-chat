// Chain explorer URLs mapping
export const CHAIN_EXPLORERS: { [chainId: number]: string } = {
  545: "https://evm-testnet.flowscan.io", // Flow EVM Testnet (correct explorer)
  747: "https://www.flowscan.io", // Flow EVM Mainnet
  11155111: "https://sepolia.etherscan.io", // Sepolia Testnet
};

// Helper to map chainId to Hardhat network name
export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 545:
      return "flowEvmTestnet";
    case 747:
      return "flowEvmMainnet";
    case 1337:
      return "hardhat";
    case 11155111:
      return "sepolia";
    default:
      throw new Error(`Unsupported chainId: ${chainId}`);
  }
}

// Chain configuration for Hardhat and other uses
export const CHAIN_CONFIG: {
  [network: string]: {
    chainId: number;
    url: string;
  };
} = {
  hardhat: {
    chainId: 1337,
    url: "http://127.0.0.1:8545", // Default Hardhat local node
  },
  flowEvmTestnet: {
    chainId: 545,
    url: "https://testnet.evm.nodes.onflow.org",
  },
  flowEvmMainnet: {
    chainId: 747,
    url: "https://mainnet.evm.nodes.onflow.org",
  },
  sepolia: {
    chainId: 11155111,
    url: "https://eth-sepolia.public.blastapi.io",
  },
}; 