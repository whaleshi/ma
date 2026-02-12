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
    LOTTERY: "0x83aC1bf552595F5C7441663e2D7E3114ae001712",
    REFERRAL: "0xC7C6638640308F1E20206e25928ad4d31382a7A3",
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
