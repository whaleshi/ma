import { useMemo } from "react";
import { decodeEventLog, type Address } from "viem";
import { simulateContract, waitForTransactionReceipt, getBlockNumber } from "wagmi/actions";
import { useConfig, useReadContract, useReadContracts, useWriteContract } from "wagmi";
import { CONTRACTS } from "../constant/contracts";

// Common/rare cards use fixed token IDs 1-4; gold/red packet IDs are unique.
const tokenIds = [1n, 2n, 3n, 4n] as const;

// 每个区块大约2秒，256个区块约512秒（8.5分钟）
// 为了保守估计，我们使用120秒作为提示时间
export const BLOCKS_LIMIT = 256n;
export const ESTIMATED_SECONDS_PER_BLOCK = 2;
export const CLAIM_TIMEOUT_SECONDS = 120;

export function useEntryFee() {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "ENTRY_FEE",
    });
}

export function useCommonToRareRatio() {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "commonToRareRatio",
    });
}

export function useTotalRevenue(refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "totalRevenue",
        query: refetchIntervalMs > 0 ? { refetchInterval: refetchIntervalMs } : undefined,
    });
}

export function useRevenue2(refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "revenue2",
        query: refetchIntervalMs > 0 ? { refetchInterval: refetchIntervalMs } : undefined,
    });
}

export function useRevenue3(refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "revenue3",
        query: refetchIntervalMs > 0 ? { refetchInterval: refetchIntervalMs } : undefined,
    });
}

export function useFreeDraws(address?: Address, refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "getUserFreeDrawsRemaining",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });
}

export function useCurrentRound(refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "currentRound",
        query: refetchIntervalMs > 0 ? { refetchInterval: refetchIntervalMs } : undefined,
    });
}

export function useLuckyTokenIds(refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "getLuckyTokenIds",
        query: refetchIntervalMs > 0 ? { refetchInterval: refetchIntervalMs } : undefined,
    });
}

export function useLegendTokenIdsByRound(round?: bigint, refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "getLegendTokenIdsByRound",
        args: typeof round === "bigint" ? [round] : undefined,
        query: {
            enabled: typeof round === "bigint",
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });
}

export function useNftContractAddress() {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "nftContract",
    });
}

export function useUserNftBalances(address?: Address, refetchIntervalMs = 0) {
    const { data: nftContract } = useNftContractAddress();
    const contracts = useMemo(() => {
        if (!address || !nftContract) {
            return [];
        }
        return tokenIds.map((id) => ({
            address: nftContract as Address,
            abi: [
                {
                    inputs: [
                        { internalType: "address", name: "account", type: "address" },
                        { internalType: "uint256", name: "id", type: "uint256" },
                    ],
                    name: "balanceOf",
                    outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
                    stateMutability: "view",
                    type: "function",
                },
            ],
            functionName: "balanceOf",
            args: [address, id],
        }));
    }, [address, nftContract]);

    const { data, refetch } = useReadContracts({
        contracts: contracts as any[],
        query: {
            enabled: contracts.length > 0,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });

    const balances = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }
        return data.map((item) => (typeof item?.result === "bigint" ? item.result : 0n));
    }, [data]);

    return {
        nftContract,
        balances,
        refetch,
    };
}

export function useUserNftTokenIds(address?: Address, refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "getUserNFTs",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });
}

export function useUserCommitment(address?: Address, refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "userCommitments",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });
}

export function useCheckPendingLottery(address?: Address) {
    const wagmiConfig = useConfig();
    const { data: commitment, refetch } = useUserCommitment(address, 3000);

    const checkStatus = async () => {
        if (!commitment) return null;

        const commitmentData = commitment as any;
        const blockNumber = typeof commitmentData?.blockNumber === "bigint"
            ? commitmentData.blockNumber
            : typeof commitmentData?.[0] === "bigint"
            ? commitmentData[0]
            : 0n;
        const amount = typeof commitmentData?.amount === "bigint"
            ? commitmentData.amount
            : typeof commitmentData?.[1] === "bigint"
            ? commitmentData[1]
            : 0n;
        const isFree = typeof commitmentData?.isFree === "boolean"
            ? commitmentData.isFree
            : typeof commitmentData?.[2] === "boolean"
            ? commitmentData[2]
            : false;

        if (blockNumber === 0n) {
            return null;
        }

        const currentBlock = await getBlockNumber(wagmiConfig);
        const blockDiff = currentBlock - blockNumber;

        return {
            blockNumber,
            amount,
            isFree,
            currentBlock,
            blockDiff,
            canClaim: blockDiff <= 256n,
            isExpired: blockDiff > 256n,
            blocksRemaining: blockDiff <= 256n ? 256n - blockDiff : 0n,
        };
    };

    return { commitment, checkStatus, refetch };
}

export function usePayLottery() {
    const wagmiConfig = useConfig();
    const { writeContractAsync } = useWriteContract();

    return {
        payLottery: async (value: bigint, inviter: Address, signature: `0x${string}`, account: Address) => {
            const simulation = await simulateContract(wagmiConfig, {
                address: CONTRACTS.LOTTERY.address,
                abi: CONTRACTS.LOTTERY.abi,
                functionName: "payLottery",
                args: [inviter, signature],
                value,
                account,
            });
            const estimatedGas = simulation.request.gas;
            const gas = estimatedGas ? (estimatedGas * 12n) / 10n : undefined;
            const hash = await writeContractAsync({
                ...simulation.request,
                gas,
            });
            return waitForTransactionReceipt(wagmiConfig, { hash });
        },
    };
}

export function useClaimLottery() {
    const wagmiConfig = useConfig();
    const { writeContractAsync } = useWriteContract();

    return {
        claimLottery: async (account?: Address) => {
            const simulation = await simulateContract(wagmiConfig, {
                address: CONTRACTS.LOTTERY.address,
                abi: CONTRACTS.LOTTERY.abi,
                functionName: "enterLottery",
                account,
            });
            const estimatedGas = simulation.request.gas;
            const gas = estimatedGas ? (estimatedGas * 12n) / 10n : undefined;
            const hash = await writeContractAsync({
                ...simulation.request,
                gas,
            });
            return waitForTransactionReceipt(wagmiConfig, { hash });
        },
    };
}

export function useComposeLegend() {
    const wagmiConfig = useConfig();
    const { writeContractAsync } = useWriteContract();

    return {
        composeLegend: async () => {
            const simulation = await simulateContract(wagmiConfig, {
                address: CONTRACTS.LOTTERY.address,
                abi: CONTRACTS.LOTTERY.abi,
                functionName: "composeLegend",
            });
            const hash = await writeContractAsync({
                ...simulation.request,
            });
            return waitForTransactionReceipt(wagmiConfig, { hash });
        },
    };
}

export function useComposeRare() {
    const wagmiConfig = useConfig();
    const { writeContractAsync } = useWriteContract();

    return {
        composeRare: async () => {
            const simulation = await simulateContract(wagmiConfig, {
                address: CONTRACTS.LOTTERY.address,
                abi: CONTRACTS.LOTTERY.abi,
                functionName: "composeRare",
            });
            const hash = await writeContractAsync({
                ...simulation.request,
            });
            return waitForTransactionReceipt(wagmiConfig, { hash });
        },
    };
}

export function useClaimLuckyReward() {
    const wagmiConfig = useConfig();
    const { writeContractAsync } = useWriteContract();

    return {
        claimLuckyReward: async (tokenId: bigint, account?: Address) => {
            const simulation = await simulateContract(wagmiConfig, {
                address: CONTRACTS.LOTTERY.address,
                abi: CONTRACTS.LOTTERY.abi,
                functionName: "claimLuckyReward",
                args: [tokenId],
                account,
            });
            const hash = await writeContractAsync({
                ...simulation.request,
            });
            return waitForTransactionReceipt(wagmiConfig, { hash });
        },
    };
}

export function useClaimLegendReward() {
    const wagmiConfig = useConfig();
    const { writeContractAsync } = useWriteContract();

    return {
        claimLegendReward: async (tokenId: bigint, account?: Address) => {
            const simulation = await simulateContract(wagmiConfig, {
                address: CONTRACTS.LOTTERY.address,
                abi: CONTRACTS.LOTTERY.abi,
                functionName: "claimLegendReward",
                args: [tokenId],
                account,
            });
            const hash = await writeContractAsync({
                ...simulation.request,
            });
            return waitForTransactionReceipt(wagmiConfig, { hash });
        },
    };
}

export function useLuckyRewardInfo(tokenId?: bigint) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "luckyRewards",
        args: typeof tokenId === "bigint" ? [tokenId] : undefined,
        query: { enabled: typeof tokenId === "bigint" },
    });
}

export function useLuckyRewardInfos(tokenIds?: bigint[], refetchIntervalMs = 0) {
    const contracts = useMemo(() => {
        if (!tokenIds || tokenIds.length === 0) {
            return [];
        }
        return tokenIds.map((tokenId) => ({
            address: CONTRACTS.LOTTERY.address,
            abi: CONTRACTS.LOTTERY.abi,
            functionName: "luckyRewards",
            args: [tokenId],
        }));
    }, [tokenIds]);

    const { data, refetch } = useReadContracts({
        contracts: contracts as any[],
        query: {
            enabled: contracts.length > 0,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });
    const rewards = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }
        return data.map((item, index) => {
            const rawResult = (item as any)?.result ?? item;
            const claimed = typeof rawResult?.claimed === "boolean" ? rawResult.claimed : Boolean(rawResult?.[0]);
            const rewardAmount =
                typeof rawResult?.rewardAmount === "bigint"
                    ? rawResult.rewardAmount
                    : typeof rawResult?.[1] === "bigint"
                      ? rawResult[1]
                      : 0n;
            const owner =
                typeof rawResult?.owner === "string"
                    ? rawResult.owner
                    : typeof rawResult?.[2] === "string"
                      ? rawResult[2]
                      : undefined;
            return {
                tokenId: tokenIds?.[index] ?? 0n,
                claimed,
                rewardAmount,
                owner,
            };
        });
    }, [data, tokenIds]);

    return { rewards, refetch };
}

export function useLegendRewardInfos(tokenIds?: bigint[], refetchIntervalMs = 0) {
    const contracts = useMemo(() => {
        if (!tokenIds || tokenIds.length === 0) {
            return [];
        }
        return tokenIds.map((tokenId) => ({
            address: CONTRACTS.LOTTERY.address,
            abi: CONTRACTS.LOTTERY.abi,
            functionName: "legendRewards",
            args: [tokenId],
        }));
    }, [tokenIds]);

    const { data, refetch } = useReadContracts({
        contracts: contracts as any[],
        query: {
            enabled: contracts.length > 0,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });
    const rewards = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }
        return data.map((item, index) => {
            const rawResult = (item as any)?.result ?? item;
            const claimed = typeof rawResult?.claimed === "boolean" ? rawResult.claimed : Boolean(rawResult?.[0]);
            const rewardAmount =
                typeof rawResult?.rewardAmount === "bigint"
                    ? rawResult.rewardAmount
                    : typeof rawResult?.[1] === "bigint"
                      ? rawResult[1]
                      : 0n;
            const round =
                typeof rawResult?.round === "bigint" ? rawResult.round : typeof rawResult?.[2] === "bigint" ? rawResult[2] : 0n;
            const owner =
                typeof rawResult?.owner === "string"
                    ? rawResult.owner
                    : typeof rawResult?.[3] === "string"
                      ? rawResult[3]
                      : undefined;
            return {
                tokenId: tokenIds?.[index] ?? 0n,
                claimed,
                rewardAmount,
                round,
                owner,
            };
        });
    }, [data, tokenIds]);

    return { rewards, refetch };
}

export function useLegendTokenIdsByRounds(rounds?: bigint[], refetchIntervalMs = 0) {
    const contracts = useMemo(() => {
        if (!rounds || rounds.length === 0) {
            return [];
        }
        return rounds.map((round) => ({
            address: CONTRACTS.LOTTERY.address,
            abi: CONTRACTS.LOTTERY.abi,
            functionName: "getLegendTokenIdsByRound",
            args: [round],
        }));
    }, [rounds]);

    const { data, refetch } = useReadContracts({
        contracts: contracts as any[],
        query: {
            enabled: contracts.length > 0,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });

    const tokenIdsByRound = useMemo(() => {
        if (!data || data.length === 0) {
            return [];
        }
        return data.map((item) => {
            const raw = (item as any)?.result ?? item;
            return Array.isArray(raw) ? raw : [];
        });
    }, [data]);

    const allTokenIds = useMemo(() => tokenIdsByRound.flat(), [tokenIdsByRound]);

    return { tokenIdsByRound, allTokenIds, refetch };
}

export function parseNftAwardedFromReceipt(
    receipt: { logs?: { data: `0x${string}`; topics: `0x${string}`[] }[] },
    address: Address,
) {
    const results: { tokenId: bigint; nftType: number }[] = [];
    const logs = receipt.logs ?? [];
    logs.forEach((log) => {
        try {
            const decoded = decodeEventLog({
                abi: CONTRACTS.LOTTERY.abi,
                data: log.data,
                topics: log.topics as any,
            });
            if (decoded.eventName !== "NFTAwarded") {
                return;
            }
            const args = decoded.args as any;
            if (args.user?.toLowerCase() !== address.toLowerCase()) {
                return;
            }
            results.push({ tokenId: args.tokenId, nftType: Number(args.nftType) });
        } catch {
            return;
        }
    });
    return results;
}

const nftTypeMap = {
    1: "好运马",
    2: "事业马",
    3: "爱情马",
    4: "发财马",
    5: "红包马",
} as const;

export function useNftAwardedResults() {
    return {
        parseReceipt: (receipt: { logs: { data: `0x${string}`; topics: `0x${string}`[] }[] }, address: Address) => {
            const awarded = parseNftAwardedFromReceipt(receipt, address);
            return awarded
                .map((item) => nftTypeMap[item.nftType as keyof typeof nftTypeMap])
                .filter((name): name is (typeof nftTypeMap)[keyof typeof nftTypeMap] => !!name);
        },
        nftTypeMap,
    };
}

export function useDirectReferralCount(address?: Address) {
    return useReadContract({
        address: CONTRACTS.REFERRAL.address,
        abi: CONTRACTS.REFERRAL.abi,
        functionName: "directReferralCount",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });
}

export function useInviterDrawStats(address?: Address, refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.REFERRAL.address,
        abi: CONTRACTS.REFERRAL.abi,
        functionName: "getInviterDrawStats",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });
}

export function useReferralInfo(address?: Address, refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.REFERRAL.address,
        abi: CONTRACTS.REFERRAL.abi,
        functionName: "getReferralInfo",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });
}

export function useEarnedFreeDrawsFromReferral(address?: Address, refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "getEarnedFreeDrawsFromReferral",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });
}

export function useUserActionRecords(address?: Address, refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "getUserActionRecords",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });
}

export function useUserTotalRewardsClaimed(address?: Address, refetchIntervalMs = 0) {
    return useReadContract({
        address: CONTRACTS.LOTTERY.address,
        abi: CONTRACTS.LOTTERY.abi,
        functionName: "userTotalRewardsClaimed",
        args: address ? [address] : undefined,
        query: {
            enabled: !!address,
            refetchInterval: refetchIntervalMs > 0 ? refetchIntervalMs : undefined,
        },
    });
}
