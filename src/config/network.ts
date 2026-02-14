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
    LOTTERY: "0x5fA031afe78a62fcdAE36392cf761803e65858e2", // TODO: Replace with actual mainnet address
    REFERRAL: "0xd3c997f8b9F4eafBACdb8105E24A2BA660585816", // TODO: Replace with actual mainnet address
  },
} as const;

export const CURRENT_ADDRESSES = CONTRACT_ADDRESSES[NETWORK_ENV];

// Helper to check if we're on mainnet
export const isMainnet = () => NETWORK_ENV === "mainnet";
export const isTestnet = () => NETWORK_ENV === "testnet";
