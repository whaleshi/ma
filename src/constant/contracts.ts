import factoryAbi from "./Factory.abi.json";
import referralAbi from "./Referral.abi.json";
import { CONTRACT_ADDRESS, REFERRAL_CONTRACT } from "./address";

export const CONTRACTS = {
    LOTTERY: {
        address: CONTRACT_ADDRESS,
        abi: factoryAbi,
    },
    REFERRAL: {
        address: REFERRAL_CONTRACT,
        abi: referralAbi,
    },
} as const;
