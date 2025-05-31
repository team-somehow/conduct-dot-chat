import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import { CHAIN_CONFIG } from "../constants";
import dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  networks: {
    hardhat: {
      chainId: CHAIN_CONFIG.hardhat.chainId,
    },
    flowEvmTestnet: {
      url: CHAIN_CONFIG.flowEvmTestnet.url,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: CHAIN_CONFIG.flowEvmTestnet.chainId,
    },
    flowEvmMainnet: {
      url: CHAIN_CONFIG.flowEvmMainnet.url,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: CHAIN_CONFIG.flowEvmMainnet.chainId,
    },
    sepolia: {
      url: CHAIN_CONFIG.sepolia.url,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: CHAIN_CONFIG.sepolia.chainId,
    },
  },
};

export default config;
