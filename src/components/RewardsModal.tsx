import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Wallet, Trophy, History } from 'lucide-react';
import { toast } from 'sonner';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import {
  useClaimLegendReward,
  useClaimLuckyReward,
  useCurrentRound,
  useLegendRewardInfos,
  useLegendTokenIdsByRound,
  useLegendTokenIdsByRounds,
  useLuckyRewardInfos,
  useLuckyTokenIds,
  useRevenue3,
  useUserTotalRewardsClaimed,
} from '../hooks/useLotteryContract';

interface RewardsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type RewardType = 'red_packet' | 'grand_prize';

interface Reward {
  id: string;
  type: RewardType;
  amount: string;
  rewardAmountWei: bigint;
  date: string;
  status: 'pending' | 'claimed';
}

export function RewardsModal({ isOpen, onClose }: RewardsModalProps) {
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  const { address } = useAccount();
  const { data: luckyTokenIds } = useLuckyTokenIds(5000);
  const { rewards, refetch } = useLuckyRewardInfos(Array.isArray(luckyTokenIds) ? luckyTokenIds : [], 5000);
  const { data: totalRewardsClaimed } = useUserTotalRewardsClaimed(address, 5000);
  const { data: currentRound } = useCurrentRound(5000);
  const { data: revenue3 } = useRevenue3(5000);
  const { data: currentRoundLegendTokenIds } = useLegendTokenIdsByRound(
    typeof currentRound === 'bigint' ? currentRound : undefined,
    5000
  );
  const currentLegendIds = useMemo(() => {
    return Array.isArray(currentRoundLegendTokenIds) ? currentRoundLegendTokenIds : [];
  }, [currentRoundLegendTokenIds]);
  const rounds = useMemo(() => {
    if (typeof currentRound !== 'bigint') {
      return [];
    }
    const total = Number(currentRound);
    if (!Number.isFinite(total) || total < 0) {
      return [];
    }
    return Array.from({ length: total + 1 }, (_, i) => BigInt(i));
  }, [currentRound]);
  const { allTokenIds: legendTokenIds, refetch: refetchLegendTokenIds } = useLegendTokenIdsByRounds(rounds, 5000);
  const { rewards: legendRewards, refetch: refetchLegendRewards } = useLegendRewardInfos(legendTokenIds, 5000);
  const { claimLuckyReward } = useClaimLuckyReward();
  const { claimLegendReward } = useClaimLegendReward();
  const [claimingTokenId, setClaimingTokenId] = useState<bigint | null>(null);
  const ownedRewards = useMemo(() => {
    const addr = address?.toLowerCase();
    if (!addr) {
      return [];
    }
    return rewards.filter((item) => item.owner?.toLowerCase() === addr);
  }, [rewards, address]);
  const ownedLegendRewards = useMemo(() => {
    const addr = address?.toLowerCase();
    if (!addr) {
      return [];
    }
    return legendRewards.filter((item) => item.owner?.toLowerCase() === addr);
  }, [legendRewards, address]);
  const legendEstimateMap = useMemo(() => {
    const map = new Map<string, bigint>();
    if (typeof revenue3 !== 'bigint') {
      return map;
    }
    if (currentLegendIds.length === 0) {
      return map;
    }
    const total = revenue3;
    const len = BigInt(currentLegendIds.length);
    if (len === 0n) {
      return map;
    }
    const firstReward = (total * 10n) / 100n + total / len;
    const othersReward = (total * 90n) / 100n / len;
    currentLegendIds.forEach((id, index) => {
      map.set(id.toString(), index === 0 ? firstReward : othersReward);
    });
    return map;
  }, [revenue3, currentLegendIds]);
  const formattedRewards = useMemo<Reward[]>(() => {
    const lucky = ownedRewards.map((item) => ({
      id: item.tokenId.toString(),
      type: 'red_packet',
      amount: formatEther(item.rewardAmount),
      rewardAmountWei: item.rewardAmount,
      date: '--',
      status: item.claimed ? 'claimed' : 'pending',
    }));
    const legend = ownedLegendRewards.map((item) => {
      const estimated = item.rewardAmount === 0n ? legendEstimateMap.get(item.tokenId.toString()) : undefined;
      const displayAmount = typeof estimated === 'bigint' ? estimated : item.rewardAmount;
      return {
        id: item.tokenId.toString(),
        type: 'grand_prize',
        amount: formatEther(displayAmount),
        rewardAmountWei: item.rewardAmount,
        date: '--',
        status: item.claimed ? 'claimed' : 'pending',
      };
    });
    return [...lucky, ...legend];
  }, [ownedRewards, ownedLegendRewards, legendEstimateMap]);

  useEffect(() => {
    if (rewards.length === 0) {
      return;
    }
    console.log('luckyRewards details', rewards.map((item) => ({
      tokenId: item.tokenId.toString(),
      claimed: item.claimed,
      rewardAmount: item.rewardAmount.toString(),
    })));
  }, [rewards]);

  useEffect(() => {
    if (rounds.length === 0) {
      return;
    }
    console.log('legend rounds', rounds.map((r) => r.toString()));
    console.log('legend tokenIds', legendTokenIds.map((id) => id.toString()));
    console.log('legend rewards', legendRewards.map((item) => ({
      tokenId: item.tokenId.toString(),
      owner: item.owner,
      claimed: item.claimed,
      rewardAmount: item.rewardAmount.toString(),
    })));
  }, [rounds, legendTokenIds, legendRewards]);

  useEffect(() => {
    if (formattedRewards.length === 0) {
      return;
    }
    console.log('formatted rewards list', formattedRewards);
  }, [formattedRewards]);

  const pendingRewards = formattedRewards.filter(r => r.status === 'pending');
  const historyRewards = formattedRewards.filter(r => r.status === 'claimed');

  // Calculate cumulative claimed amount
  const totalClaimedWei = typeof totalRewardsClaimed === 'bigint' ? totalRewardsClaimed : 0n;
  const toSubscript = (value: number) => {
    const map = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return String(value)
      .split('')
      .map((digit) => map[Number(digit)] ?? digit)
      .join('');
  };
  const formatSmall = (value: string) => {
    if (!value.startsWith('0.')) {
      return value;
    }
    const decimals = value.slice(2);
    if (!decimals || /^0+$/.test(decimals)) {
      return '0';
    }
    const match = decimals.match(/^(0+)([1-9].*)$/);
    if (!match) {
      return value;
    }
    const zeroCount = match[1].length;
    const rest = match[2].slice(0, 3);
    if (zeroCount <= 1) {
      return value;
    }
    return `0.0${toSubscript(zeroCount)}${rest}`;
  };
  const totalClaimedDisplay = formatSmall(formatEther(totalClaimedWei));

  const handleClaim = async (tokenId: string, amount: string, type: RewardType) => {
    if (!address) {
      toast.error('请先连接钱包');
      return;
    }
    try {
      const tokenIdBigInt = BigInt(tokenId);
      setClaimingTokenId(tokenIdBigInt);
      if (type === 'grand_prize') {
        await claimLegendReward(tokenIdBigInt);
      } else {
        await claimLuckyReward(tokenIdBigInt);
      }
      toast.success(`成功领取 ${amount} BNB`);
      refetch();
      refetchLegendTokenIds();
      refetchLegendRewards();
    } catch (error) {
      console.error(error);
      toast.error('领取失败或已取消');
    } finally {
      setClaimingTokenId(null);
    }
  };

  const getRewardLabel = (type: RewardType) => {
    return type === 'grand_prize' ? '超级大奖' : '红包奖励';
  };

  const getRewardIcon = (type: RewardType) => {
    return type === 'grand_prize' ? <Trophy size={18} /> : <Gift size={18} />;
  };

  const getRewardColor = (type: RewardType) => {
    return type === 'grand_prize'
      ? 'bg-gradient-to-br from-[#ffd700] to-[#fdb931] text-[#8b0000]'
      : 'bg-gradient-to-br from-[#ff9a9e] to-[#fad0c4] text-[#d92323]';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-[#fff9f0] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="relative p-6 pb-4 bg-gradient-to-b from-[#ffecd2]/50 to-transparent shrink-0">
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-20"
              >
                <X size={20} className="text-[#8b0000]/70" />
              </button>

              <h3 className="text-[#8b0000] text-2xl font-black tracking-wide flex items-center gap-2">
                <Wallet className="text-[#ff000e]" size={24} />
                我的奖励
              </h3>
            </div>

            {/* Total Claimed Card (Always Visible - Modified as requested) */}
            <div className="px-6 pb-2 shrink-0">
              <div className="bg-gradient-to-br from-[#ff000e] to-[#c4000b] rounded-2xl p-6 shadow-lg relative overflow-hidden group">
                {/* Background Pattern */}
                <div className="absolute -right-4 -top-4 text-white/10 rotate-12 transform scale-150">
                  <Trophy size={120} />
                </div>

                <div className="relative z-10 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white/80 text-sm font-bold tracking-widest uppercase">累计已领取奖励</span>

                  </div>

                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black tracking-tight">{totalClaimedDisplay}</span>
                    <span className="text-lg font-bold opacity-90">BNB</span>
                  </div>

                  {/* Button Removed as requested */}
                </div>
              </div>
            </div>

            {/* Content Tabs */}
            <div className="px-6 mt-6 flex gap-6 border-b border-[#8b0000]/10 shrink-0">
              <button
                onClick={() => setActiveTab('pending')}
                className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === 'pending' ? 'text-[#d92323]' : 'text-[#8b0000]/40 hover:text-[#8b0000]/60'
                  }`}
              >
                待领取 ({pendingRewards.length})
                {activeTab === 'pending' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d92323] rounded-full" />
                )}
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`pb-3 text-sm font-bold relative transition-colors ${activeTab === 'history' ? 'text-[#d92323]' : 'text-[#8b0000]/40 hover:text-[#8b0000]/60'
                  }`}
              >
                奖励记录
                {activeTab === 'history' && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#d92323] rounded-full" />
                )}
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3 min-h-[200px]">
              {activeTab === 'pending' && pendingRewards.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-[#8b0000]/40 gap-2">
                  <Gift size={48} className="opacity-20" />
                  <span className="text-sm font-bold">暂无待领取奖励</span>
                </div>
              )}

              {activeTab === 'history' && historyRewards.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-[#8b0000]/40 gap-2">
                  <History size={48} className="opacity-20" />
                  <span className="text-sm font-bold">暂无奖励记录</span>
                </div>
              )}

              {(activeTab === 'pending' ? pendingRewards : historyRewards).map((reward) => (
                <motion.div
                  key={reward.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-[#FAE6B1]/50 rounded-xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shadow-inner ${getRewardColor(reward.type)}`}>
                      {getRewardIcon(reward.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[#2d0a0a] font-bold text-base">
                          {getRewardLabel(reward.type)}
                        </span>
                      </div>
                      <div className="text-[#d92323] font-black text-base mt-1">+{formatSmall(reward.amount)} BNB</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {reward.status === 'pending' && (
                      <button
                        onClick={() => handleClaim(reward.id, reward.amount, reward.type)}
                        disabled={
                          claimingTokenId === BigInt(reward.id) ||
                          (reward.type === 'grand_prize' && reward.rewardAmountWei === 0n)
                        }
                        className="bg-[#ff000e] text-white text-xs font-bold py-2 px-4 rounded-lg shadow-md hover:bg-[#d6000c] active:scale-95 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {reward.type === 'grand_prize' && reward.rewardAmountWei === 0n
                          ? '暂无奖励'
                          : claimingTokenId === BigInt(reward.id)
                            ? '处理中...'
                            : '领取'}
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
