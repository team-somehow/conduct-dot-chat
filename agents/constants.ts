// Chain explorer URLs mapping
export const CHAIN_EXPLORERS: { [chainId: number]: string } = {
  545: "https://evm-testnet.flowscan.io", // Flow EVM Testnet (correct explorer)
  747: "https://www.flowscan.io", // Flow EVM Mainnet
  11155111: "https://sepolia.etherscan.io", // Sepolia Testnet
  296: "hashscan.io/testnet/dashboard", // Hedera Testnet
};

// Helper to map chainId to Hardhat network name
export function getNetworkName(chainId: number): string {
  switch (chainId) {
    case 296:
      return "hederaTestnet";
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
  hederaTestnet: {
    chainId: 296,
    url: "testnet.hashio.io/api",
  },
};

export const AAVE_CONFIG: {
  [chainId: number]: {
    pool: string;
    token: string;
  };
} = {
  11155111: {
    pool: "0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951", // Aave V3 Pool Sepolia
    token: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5", // LINK Token Sepolia
  },
};
