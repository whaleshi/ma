import React, { useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { useUserActionRecords } from '../hooks/useLotteryContract';
import { logger } from '../utils/logger';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const { address } = useAccount();
  const { data } = useUserActionRecords(address, 5000);

  useEffect(() => {
    if (!Array.isArray(data)) {
      return;
    }
    const normalized = data.map((item) => ({
      actionType: Number(item.actionType),
      costAmount: typeof item.costAmount === 'bigint' ? item.costAmount.toString() : String(item.costAmount),
      nftTypes: Array.isArray(item.nftTypes) ? item.nftTypes.map((t) => Number(t)) : [],
      rewardAmount: typeof item.rewardAmount === 'bigint' ? item.rewardAmount.toString() : String(item.rewardAmount),
      timestamp: typeof item.timestamp === 'bigint' ? item.timestamp.toString() : String(item.timestamp),
    }));
    logger.log('user action records', normalized);
  }, [data]);

  const history = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }
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
      const subscriptMap = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
      const subscript = String(zeroCount)
        .split('')
        .map((digit) => subscriptMap[Number(digit)] ?? digit)
        .join('');
      return `0.0${subscript}${rest}`;
    };
    const nftNameMap: Record<number, string> = {
      0: '至尊马',
      1: '事业马',
      2: '爱情马',
      3: '发财马',
      4: '好运马',
      5: '红包马',
    };
    return data.slice().reverse().map((item, index) => {
      const actionType = Number(item.actionType);
      const isFreeDraw = actionType === 0;
      const isSingleDraw = actionType === 1;
      const isTenDraw = actionType === 2;
      const isSynthesis = actionType === 3;
      const isClaimLucky = actionType === 4;
      const isClaimLegend = actionType === 5;
      const costAmount = typeof item.costAmount === 'bigint' ? item.costAmount : 0n;
      const rewardAmount = typeof item.rewardAmount === 'bigint' ? item.rewardAmount : 0n;
      const time = typeof item.timestamp === 'bigint'
        ? new Date(Number(item.timestamp) * 1000).toLocaleString('zh-CN', { hour12: false })
        : '--';
      const counts: Record<string, number> = {};
      const nftTypes = Array.isArray(item.nftTypes) ? item.nftTypes : [];
      nftTypes.forEach((type) => {
        const name = nftNameMap[Number(type)] ?? `NFT-${type}`;
        counts[name] = (counts[name] ?? 0) + 1;
      });
      const resultParts = Object.entries(counts).map(([name, count]) => `${name} ${count} 张`);
      if (rewardAmount > 0n) {
        resultParts.push(`红包奖励 ${formatSmall(formatEther(rewardAmount))} BNB`);
      }
      const result = resultParts.length > 0 ? resultParts.join('；') : '—';

      let desc = '未知操作';
      if (isFreeDraw) {
        desc = '使用免费次数抽卡';
      } else if (isSingleDraw) {
        desc = `消耗 ${formatSmall(formatEther(costAmount))} BNB 抽卡`;
      } else if (isTenDraw) {
        desc = `消耗 ${formatSmall(formatEther(costAmount))} BNB 抽卡 10 次`;
      } else if (isSynthesis) {
        desc = '合成卡';
      } else if (isClaimLucky) {
        desc = '领取红包奖励';
      } else if (isClaimLegend) {
        desc = '领取传说大奖';
      }

      return {
        id: index + 1,
        type: isFreeDraw || isSingleDraw || isTenDraw ? 'draw' : isClaimLucky || isClaimLegend ? 'claim' : 'synth',
        desc,
        time,
        result,
      };
    });
  }, [data]);

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
              <h3 className="text-[#8b0000] text-xl font-black tracking-wide">我的记录</h3>
              <button onClick={onClose} className="p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors">
                <X size={20} className="text-[#8b0000]" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {history.map(item => (
                <div key={item.id} className="bg-white border border-[#ffe4c4] rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <span
                      className={`text-[10px] font-black px-2 py-1 rounded-lg tracking-wide ${item.type === 'draw'
                          ? 'bg-[#ff000e]/10 text-[#ff000e]'
                        : item.type === 'claim'
                          ? ''
                            : 'bg-[#ffd700]/20 text-[#b88a00]'
                        }`}
                      style={item.type === 'claim' ? { backgroundColor: '#16a34a', color: '#ffffff' } : undefined}
                    >
                      {item.type === 'draw' ? '抽卡' : item.type === 'claim' ? '领取' : '合成'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-medium">{item.time}</span>
                  </div>
                  <div className="text-[#333] text-sm font-bold mb-1.5">{item.desc}</div>
                  <div className="text-[#8b0000] text-xs font-medium bg-[#8b0000]/5 p-2 rounded-lg leading-relaxed">
                    获得: <span className="font-bold">{item.result}</span>
                  </div>
                </div>
              ))}

              <div className="text-center text-xs text-gray-400 py-6 font-medium">
                仅展示最近 30 天记录
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
