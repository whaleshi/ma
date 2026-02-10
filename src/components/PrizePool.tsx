import React from 'react';
import { Crown, Trophy } from 'lucide-react';
import { formatEther } from 'viem';
import {
  useCurrentRound,
  useLegendRewardInfos,
  useLegendTokenIdsByRound,
  useLuckyRewardInfos,
  useLuckyTokenIds,
  useRevenue2,
  useRevenue3,
} from '../hooks/useLotteryContract';

interface PrizePoolProps {
  redPacketPool: number;
  superPool: number;
  onOpenWinnerHistory: () => void;
}

export function PrizePool({ redPacketPool, superPool, onOpenWinnerHistory }: PrizePoolProps) {
  const { data: revenue2 } = useRevenue2(5000);
  const { data: revenue3 } = useRevenue3(5000);
  const redPacketDisplay = revenue2 ? formatEther(revenue2 as bigint) : redPacketPool.toFixed(6);
  const superDisplay = revenue3 ? formatEther(revenue3 as bigint) : superPool.toFixed(6);
  const { data: currentRound } = useCurrentRound(5000);
  const { data: luckyTokenIds } = useLuckyTokenIds(5000);
  const { data: legendTokenIds } = useLegendTokenIdsByRound(
    typeof currentRound === 'bigint' ? currentRound : undefined,
    5000
  );
  const { rewards: luckyRewards } = useLuckyRewardInfos(Array.isArray(luckyTokenIds) ? luckyTokenIds : [], 5000);
  const { rewards: legendRewards } = useLegendRewardInfos(Array.isArray(legendTokenIds) ? legendTokenIds : [], 5000);
  const zeroAddress = '0x0000000000000000000000000000000000000000';
  const lastLucky = [...luckyRewards].reverse().find((item) => item.owner && item.owner !== zeroAddress);
  const hasLegend = legendRewards.some((item) => item.owner && item.owner !== zeroAddress);
  const hasWinnerData = luckyRewards.length > 0 || legendRewards.length > 0;
  const roundNumber = typeof currentRound === 'bigint' ? Number(currentRound) + 1 : null;

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

  const lastWinner = lastLucky
    ? {
      address: `${lastLucky.owner!.slice(0, 6)}...${lastLucky.owner!.slice(-4)}`,
      amount: formatSmall(formatEther(lastLucky.rewardAmount)),
    }
    : {
      address: '--',
      amount: '0',
    };
  const marqueeText = !hasWinnerData
    ? '参与活动，抽取红包马与至尊马大奖'
    : `${lastWinner.address} 获得 ${lastWinner.amount} BNB 红包奖励` +
      (hasLegend ? '' : '。暂无人合成至尊马');

  // Mock winner history (replaced by chain data above)

  return (
    <div className="w-full">
      <div className="flex flex-row justify-between gap-3 md:gap-5 mb-5 md:mb-6">
        {/* Red Packet Pool */}
        <div className="flex-1 bg-gradient-to-br from-[#ff2e3b] to-[#c4000b] rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_20px_rgba(196,0,11,0.25)] group border border-white/10">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
          {/* Shine animation */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/10 to-transparent rotate-12 animate-[sheen_4s_linear_infinite] pointer-events-none" />

          <div className="text-[#ffd0d0] text-[10px] md:text-xs font-bold mb-1 tracking-widest uppercase opacity-80 whitespace-nowrap">红包奖池</div>
          <div className="text-white text-2xl md:text-3xl font-black mb-1.5 md:mb-2 drop-shadow-md tracking-tight text-center">{formatSmall(redPacketDisplay)} BNB</div>
          <div className="text-white/90 text-[10px] font-bold bg-black/20 px-2 py-0.5 md:px-3 md:py-1 rounded-full backdrop-blur-sm border border-white/10 whitespace-nowrap scale-90 md:scale-100 origin-center">下一个红包马独享</div>
        </div>

        {/* Super Prize Pool */}
        <div className="flex-1 bg-gradient-to-br from-[#FAE6B1] to-[#C6A66D] rounded-xl md:rounded-2xl p-4 md:p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-[0_8px_20px_rgba(198,166,109,0.25)] group border border-white/40">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.08] mix-blend-overlay"></div>
          {/* Shine animation */}
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-12 animate-[sheen_4s_linear_infinite] delay-1000 pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-[1px] bg-white/60"></div>

          <div className="text-[#5c0000] text-[10px] md:text-xs font-bold mb-1 tracking-widest uppercase opacity-70 whitespace-nowrap">超级大奖</div>
          <div className="text-[#5c0000] text-2xl md:text-3xl font-black mb-1.5 md:mb-2 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)] tracking-tight text-center">{formatSmall(superDisplay)} BNB</div>
          <div className="text-[#5c0000] text-[10px] font-bold bg-white/20 px-2 py-0.5 md:px-3 md:py-1 rounded-full backdrop-blur-sm border border-white/20 whitespace-nowrap scale-90 md:scale-100 origin-center">2 月 17 日 20:00 开奖</div>
        </div>
      </div>

      <div className="space-y-3">
        {/* Last Round Winner Display */}
        <div className="bg-black/30 backdrop-blur-md rounded-xl md:rounded-2xl py-2 px-3 md:px-4 flex items-center justify-between gap-2 border border-white/5 shadow-sm overflow-hidden">
          <style>{`
             @keyframes marquee {
               0% { transform: translateX(0); }
               100% { transform: translateX(-50%); }
             }
           `}</style>
          <div className="flex-1 flex items-center gap-2 overflow-hidden min-w-0">
            <Trophy size={14} className="text-[#FAE6B1] opacity-80 shrink-0" />
            <div className="flex-1 overflow-hidden relative h-5">
              <div className="absolute top-0 left-0 h-full flex items-center whitespace-nowrap animate-[marquee_10s_linear_infinite]">
                <span className="text-white/60 text-xs md:text-sm font-medium tracking-wide flex items-center mr-8">
                  {marqueeText}
                </span>
                <span className="text-white/60 text-xs md:text-sm font-medium tracking-wide flex items-center mr-8">
                  {marqueeText}
                </span>
              </div>
            </div>
          </div>

          <div className="h-4 w-[1px] bg-white/10 shrink-0 mx-1"></div>

          <button
            onClick={onOpenWinnerHistory}
            className="shrink-0 text-[#FAE6B1] text-xs underline decoration-1 underline-offset-2 hover:text-white transition-colors cursor-pointer whitespace-nowrap"
          >
            查看记录
          </button>
        </div>

        {/* Supreme Prize Info */}
        <div className="bg-[#FAE6B1]/10 backdrop-blur-md rounded-xl md:rounded-2xl py-2 px-4 flex items-center justify-center gap-2 border border-[#FAE6B1]/20 shadow-[0_0_15px_rgba(250,230,177,0.1)]">
          <Crown size={14} className="text-[#FAE6B1]" />
          <span className="text-white/60 text-xs md:text-sm font-medium tracking-wide text-center">
            首个合成 <span className="text-[#FAE6B1] font-black mx-0.5">至尊马</span> 的用户获得 <span className="text-[#FAE6B1] font-black mx-0.5">10%</span> 超级大奖
          </span>
        </div>
      </div>
    </div>
  );
}
