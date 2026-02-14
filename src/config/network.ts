import { bsc, bscTestnet } from "wagmi/chains";
import { parseEther } from "viem";

export type NetworkEnvironment = "testnet" | "mainnet";

// Get network from environment variable, default to testnet for development
const getNetworkEnv = (): NetworkEnvironment => {
  const env = import.meta.env.VITE_NETWORK as string | undefined;
  if (env === "mainnet") {
    return "mainnet";
  }
  return "testnet";
};

export const NETWORK_ENV = getNetworkEnv();

// Chain configuration
export const CHAIN_CONFIG = {
  testnet: bscTestnet,
  mainnet: bsc,
} as const;

export const CURRENT_CHAIN = CHAIN_CONFIG[NETWORK_ENV];


// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  testnet: {
    LOTTERY: "0xddB9d29891E9e09Be4148EFbA6F93747Ca17a134",
    REFERRAL: "0x11fC1B931Aa90e954BB256A2319d0397bb57D1b7",
  },
  mainnet: {
    LOTTERY: "0xc6E26b98Ea4002D848f033048Bc3b3EC7e80a95d", // TODO: Replace with actual mainnet address
    REFERRAL: "0x8973489C3dc3522306fE76473495D59C0716B0eE", // TODO: Replace with actual mainnet address
  },
} as const;

export const CURRENT_ADDRESSES = CONTRACT_ADDRESSES[NETWORK_ENV];

// Helper to check if we're on mainnet
export const isMainnet = () => NETWORK_ENV === "mainnet";
export const isTestnet = () => NETWORK_ENV === "testnet";
