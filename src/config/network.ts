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
    LOTTERY: "0xd76d236967ed5C432e5baBC2588aFFE2e0C38768",
    REFERRAL: "0x2E5Afd022Ba38Eb2357b42E3cc0d11c4e4177dD1",
  },
  mainnet: {
    LOTTERY: "0x0000000000000000000000000000000000000000", // TODO: Replace with actual mainnet address
    REFERRAL: "0x0000000000000000000000000000000000000000", // TODO: Replace with actual mainnet address
  },
} as const;

export const CURRENT_ADDRESSES = CONTRACT_ADDRESSES[NETWORK_ENV];

// Helper to check if we're on mainnet
export const isMainnet = () => NETWORK_ENV === "mainnet";
export const isTestnet = () => NETWORK_ENV === "testnet";
