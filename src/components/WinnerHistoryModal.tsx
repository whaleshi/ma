import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Crown } from 'lucide-react';
import { formatEther } from 'viem';
import { useCurrentRound, useLegendRewardInfos, useLegendTokenIdsByRound, useLuckyRewardInfos, useLuckyTokenIds, useRevenue3 } from '../hooks/useLotteryContract';

interface WinnerHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WinnerHistoryModal({ isOpen, onClose }: WinnerHistoryModalProps) {
  const { data: currentRound } = useCurrentRound(5000);
  const { data: revenue3 } = useRevenue3(5000);
  const { data: luckyTokenIds } = useLuckyTokenIds(5000);
  const { data: legendTokenIds } = useLegendTokenIdsByRound(
    typeof currentRound === 'bigint' ? currentRound : undefined,
    5000
  );
  const { rewards: luckyRewards } = useLuckyRewardInfos(Array.isArray(luckyTokenIds) ? luckyTokenIds : [], 5000);
  const { rewards: legendRewards } = useLegendRewardInfos(Array.isArray(legendTokenIds) ? legendTokenIds : [], 5000);
  const roundDisplay = typeof currentRound === 'bigint' ? String(Number(currentRound) + 1) : '--';
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const toSubscript = (value: number) => {
    const map = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    return String(value)
      .split('')
      .map((digit) => map[Number(digit)] ?? digit)
      .join('');
  };

  const formatSmall = (value: string) => {
    if (!value || !value.startsWith('0.')) {
      return value;
    }

    const decimals = value.slice(2);
    // 如果全是 0，直接返回 0
    if (!decimals || /^0+$/.test(decimals)) {
      return '0';
    }

    const match = decimals.match(/^(0+)([1-9].*)$/);
    if (!match) {
      // 这种通常是 0.526 这种没有前导 0 的情况
      return `0.${decimals.slice(0, 4)}`;
    }

    const zeroCount = match[1].length;
    const rest = match[2];

    // 场景 1：0.05269... 这种 zeroCount 为 1 的情况
    // 或者是 0.5269... 这种 zeroCount 为 0 的情况
    if (zeroCount <= 2) {
      // 直接展示 0. 后面四位
      return `0.${decimals.slice(0, 4)}`;
    }

    // 场景 2：极小值，如 0.0000526... 这种 zeroCount >= 3 的情况
    // 展示为 0.0{下标} + 后面 3 位有效数字
    const subscriptRest = rest.slice(0, 3);
    return `0.0${toSubscript(zeroCount)}${subscriptRest}`;
  };
  const legendEstimateMap = useMemo(() => {
    const map = new Map<string, bigint>();
    if (typeof revenue3 !== 'bigint') {
      return map;
    }
    const ids = Array.isArray(legendTokenIds) ? legendTokenIds : [];
    if (ids.length === 0) {
      return map;
    }
    const total = revenue3;
    const len = BigInt(ids.length);
    if (len === 0n) {
      return map;
    }
    const firstReward = (total * 10n) / 100n + (total - (total * 10n) / 100n) * 8n / 10n / len;
    const othersReward = (total * 90n) / 100n * 8n / 10n / len;
    ids.forEach((id, index) => {
      map.set(id.toString(), index === 0 ? firstReward : othersReward);
    });
    return map;
  }, [revenue3, legendTokenIds]);

  const winners = useMemo(() => {
    const list: { id: string; type: 'lucky' | 'legend'; address: string; amount: string; rewardAmountWei?: any; round: string }[] = [];
    luckyRewards.forEach((item) => {
      if (item.owner && item.owner !== zeroAddress) {
        list.push({
          id: `lucky-${item.tokenId.toString()}`,
          type: 'lucky',
          address: item.owner,
          amount: formatSmall(formatEther(item.rewardAmount)),
          round: roundDisplay,
        });
      }
    });
    legendRewards.forEach((item) => {
      if (item.owner && item.owner !== zeroAddress) {
        const estimated = item.rewardAmount === 0n ? legendEstimateMap.get(item.tokenId.toString()) : undefined;
        const displayAmount = typeof estimated === 'bigint' ? estimated : item.rewardAmount;
        list.push({
          id: `legend-${item.tokenId.toString()}`,
          type: 'legend',
          address: item.owner,
          amount: formatSmall(formatEther(displayAmount)),
          rewardAmountWei: item.rewardAmount,
          round: roundDisplay,
        });
      }
    });
    return list.slice().reverse().slice(0, 20);
  }, [luckyRewards, legendRewards, roundDisplay, legendEstimateMap]);

  const legendWinners = winners.filter((item) => item.type === 'legend');

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
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative z-10 w-full max-w-sm bg-[#fff9f0] rounded-2xl overflow-hidden shadow-2xl h-[70vh] flex flex-col border border-white/50"
          >
             <div className="p-5 border-b border-[#ffe4c4] flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-20">
               <div className="flex items-center gap-2">
                 <Trophy className="text-[#c4000b]" size={20} />
                 <h3 className="text-[#8b0000] text-xl font-black tracking-wide">获奖记录</h3>
               </div>
               <button onClick={onClose} className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors">
                 <X size={20} className="text-[#8b0000]" />
               </button>
             </div>

             <div className="flex-1 overflow-y-auto p-4 space-y-3">
               {legendWinners.length === 0 && (
                 <div className="bg-gradient-to-r from-[#FAE6B1] to-[#C6A66D] rounded-xl p-4 shadow-md border border-[#fff]/50 relative overflow-hidden group">
                    <div className="absolute -top-2 -right-2 opacity-10 pointer-events-none rotate-12 group-hover:rotate-0 transition-transform duration-700">
                      <Crown size={80} className="text-[#5c0000]" />
                    </div>
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 rounded-full bg-[#5c0000] flex items-center justify-center shrink-0 border-2 border-[#FAE6B1] shadow-sm">
                        <Crown size={18} className="text-[#FAE6B1]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[#5c0000] text-[10px] font-bold mb-0.5 uppercase tracking-wider opacity-80">至尊大奖</div>
                        <div className="text-[#2a0a0a] text-sm font-black leading-tight">
                          暂无人合成至尊马
                        </div>
                      </div>
                    </div>
                 </div>
               )}

               {winners.map(winner => (
                 <div key={winner.id} className="bg-white border border-[#ffe4c4] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-[#8b0000]/70 tracking-wide bg-[#8b0000]/5 px-2 py-0.5 rounded-full">
                        {winner.type === 'legend' ? '至尊马' : '红包马'}
                      </span>
                    </div>
                   
                   <div className="flex justify-between items-end">
                      <div className="flex flex-col">
                        <span className="text-[10px] text-gray-500 mb-0.5">获奖地址</span>
                        <span className="text-[#333] font-bold font-mono text-sm">
                          {winner.address.slice(0, 6)}...{winner.address.slice(-4)}
                        </span>
                      </div>
                      
                      <div className="flex flex-col items-end">
                        <span className="text-[10px] text-gray-500 mb-0.5">
                          {winner.type === 'legend' && winner.rewardAmountWei === 0n ? '预计获得' : '获得奖励'}
                        </span>
                        <span className="text-[#c4000b] font-black text-lg tracking-tight">
                          {winner.amount} BNB
                        </span>
                      </div>
                   </div>
                 </div>
               ))}
               
               <div className="text-center text-xs text-gray-400 py-6 font-medium">
                 仅展示最近 20 条获奖记录
               </div>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
