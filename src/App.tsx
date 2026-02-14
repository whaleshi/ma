import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Header } from './components/Header';
import { PrizePool } from './components/PrizePool';
import { CardGrid } from './components/CardGrid';
import { GameActions } from './components/GameActions';
import { InviteSection } from './components/InviteSection';
import { RulesSection } from './components/RulesSection';
import { DrawFooter } from './components/DrawFooter';
import { DrawModal } from './components/DrawModal';
import { SynthesisModal } from './components/SynthesisModal';
import { HistoryModal } from './components/HistoryModal';
import { WinnerHistoryModal } from './components/WinnerHistoryModal';
import { RewardsModal } from './components/RewardsModal';
import { RedPacketWinModal } from './components/RedPacketWinModal';
import { WelcomeBonusModal } from './components/WelcomeBonusModal';
import { GoodLuckSynthesisModal } from './components/GoodLuckSynthesisModal';
import { MobileMenu } from './components/MobileMenu';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import { copyToClipboard } from './utils/clipboard';
import { logger } from './utils/logger';
import { playRedPacketSound, initAudio } from './utils/soundEffects';
import { decodeTokenId } from './utils/decodeTokenId';
import { useAccount } from "wagmi";
import { formatEther } from 'viem';
import { useBalance } from "wagmi";
import supremeImg from 'figma:asset/6651fc0c90390d131f74b014994be51852a71a59.png';
import redPacketImg from 'figma:asset/d19a2f3c21c67ce076c2a24d0e2058e33ea5a8a2.png';
import luckImg from 'figma:asset/876972c509561235a14234ebaeb8a04d4c2f28ae.png';
import wealthImg from 'figma:asset/3e8ed8b84fe45c8898c2deea5cd3d6495bd61c69.png';
import careerImg from 'figma:asset/3c55e552361dae32ba73beaddae94fa841d4caaa.png';
import loveImg from 'figma:asset/3e75ed55595146a6ff7fa1a65e6413528470f471.png';
import { useReferral } from './contexts/ReferralContext';
import {
  parseNftAwardedFromReceipt,
  useClaimLuckyReward,
  useCurrentRound,
  useEarnedFreeDrawsFromReferral,
  usePayLottery,
  useClaimLottery,
  useCheckPendingLottery,
  useCommonToRareRatio,
  useEntryFee,
  useFreeDraws,
  useComposeRare,
  useComposeLegend,
  useLegendTokenIdsByRound,
  useLegendTokenIdsByRounds,
  useLuckyTokenIds,
  useLuckyRewardInfos,
  useLegendRewardInfos,
  useReferralInfo,
  useUserNftBalances,
  useUserNftTokenIds,
  BLOCKS_LIMIT,
  CLAIM_TIMEOUT_SECONDS,
} from "./hooks/useLotteryContract";

// Add global styles for animations
const GlobalStyles = () => (
  <style>{`
    @keyframes shine {
      0% { transform: translateX(-150%) skewX(-15deg); }
      50% { transform: translateX(150%) skewX(-15deg); }
      100% { transform: translateX(150%) skewX(-15deg); }
    }
    .animate-shine {
      animation: shine 3s infinite;
      will-change: transform;
    }
    @keyframes shimmer {
      0% { background-position: 0% 50%; }
      100% { background-position: 200% 50%; }
    }
    .animate-shimmer {
      background-size: 200% auto;
      animation: shimmer 4s linear infinite;
      will-change: background-position;
    }
    @keyframes particle {
      0%, 100% { transform: translateY(0) scale(1); opacity: 0.6; }
      50% { transform: translateY(-6px) scale(1.1); opacity: 1; }
    }
    @keyframes spinY {
      0% { transform: rotateY(0deg); }
      100% { transform: rotateY(360deg); }
    }
    body {
      font-family: 'MiSans', system-ui, -apple-system, sans-serif !important;
      -webkit-tap-highlight-color: transparent;
      overscroll-behavior-y: none; /* Prevent bounce effect */
    }
    /* Optimization for mobile scrolling */
    .touch-manipulation {
      touch-action: manipulation;
    }
  `}</style>
);

import { Copy, Sparkles } from 'lucide-react';

// Mock types
export type CardType = 'love' | 'career' | 'luck' | 'wealth' | 'red_packet' | 'supreme';

export interface Card {
  type: CardType;
  name: string;
  count: number;
}

export default function App() {
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({ address });
  const { getReferralCode, clearReferralCode } = useReferral();
  const previousConnectedRef = useRef(false);
  const contractAddress = "Horse发生 CA Coming Soon";
  const { data: entryFee } = useEntryFee();
  const { data: chainFreeDraws, refetch: refetchFreeDraws } = useFreeDraws(address, 5000);
  const { data: earnedFreeDraws, refetch: refetchEarnedFreeDraws } = useEarnedFreeDrawsFromReferral(address, 5000);
  const { data: referralInviter, refetch: refetchReferralInfo } = useReferralInfo(address, 5000);
  const { data: commonToRareRatio } = useCommonToRareRatio();
  const { payLottery } = usePayLottery();
  const { claimLottery } = useClaimLottery();
  const { checkStatus: checkPendingLottery, refetch: refetchCommitment } = useCheckPendingLottery(address);
  const { composeRare } = useComposeRare();
  const { composeLegend } = useComposeLegend();
  const { balances, refetch: refetchBalances } = useUserNftBalances(address, 5000);
  const { data: userTokenIds, refetch: refetchUserTokenIds } = useUserNftTokenIds(address, 5000);
  const { data: luckyTokenIds, refetch: refetchLuckyTokenIds } = useLuckyTokenIds(5000);
  const { rewards: luckyRewards, refetch: refetchLuckyRewards } = useLuckyRewardInfos(
    Array.isArray(luckyTokenIds) ? luckyTokenIds : [],
    5000
  );
  const { data: currentRound } = useCurrentRound(5000);
  const legendRounds = useMemo(() => {
    if (typeof currentRound !== "bigint") {
      return [];
    }
    const total = Number(currentRound);
    if (!Number.isFinite(total) || total < 0) {
      return [];
    }
    return Array.from({ length: total + 1 }, (_, i) => BigInt(i));
  }, [currentRound]);
  const { allTokenIds: legendTokenIds, refetch: refetchLegendTokenIds } = useLegendTokenIdsByRounds(
    legendRounds,
    5000
  );
  const { rewards: legendRewards, refetch: refetchLegendRewards } = useLegendRewardInfos(legendTokenIds, 5000);
  const { claimLuckyReward } = useClaimLuckyReward();

  // Game State
  const [cards, setCards] = useState<Card[]>([
    { type: 'supreme', name: '至尊马', count: 0 },
    { type: 'red_packet', name: '红包马', count: 0 },
    { type: 'luck', name: '好运马', count: 0 },
    { type: 'career', name: '事业马', count: 0 },
    { type: 'love', name: '爱情马', count: 0 },
    { type: 'wealth', name: '发财马', count: 0 },
  ]);

  const [prizePool] = useState({
    redPacket: 0,
    super: 0,
  });

  // Modal State
  const [isDrawModalOpen, setIsDrawModalOpen] = useState(false);
  const [drawResults, setDrawResults] = useState<CardType[]>([]);
  const [isSynthesisModalOpen, setIsSynthesisModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isWinnerHistoryModalOpen, setIsWinnerHistoryModalOpen] = useState(false);
  const [isRewardsModalOpen, setIsRewardsModalOpen] = useState(false);
  const [isRedPacketWinModalOpen, setIsRedPacketWinModalOpen] = useState(false);
  const [pendingRedPacketTokenIds, setPendingRedPacketTokenIds] = useState<bigint[]>([]);
  const [isRedPacketClaiming, setIsRedPacketClaiming] = useState(false);
  const [isWelcomeBonusModalOpen, setIsWelcomeBonusModalOpen] = useState(false);
  const [isGoodLuckSynthesisModalOpen, setIsGoodLuckSynthesisModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDrawLoading, setIsDrawLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<'paying' | 'claiming' | null>(null);
  const hasMountedRef = useRef(false);
  const hasShownWelcomeRef = useRef(false);
  const connectedThisSessionRef = useRef(false);
  const baseFreeDraws = typeof chainFreeDraws === "bigint" ? Number(chainFreeDraws) : 0;
  const referralFreeDraws = typeof earnedFreeDraws === "bigint" ? Number(earnedFreeDraws) : 0;
  const totalFreeDraws = baseFreeDraws + referralFreeDraws;
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
    const map = ['₀', '₁', '₂', '₃', '₄', '₅', '₆', '₇', '₈', '₉'];
    const subscript = String(zeroCount)
      .split('')
      .map((digit) => map[Number(digit)] ?? digit)
      .join('');
    return `0.0${subscript}${rest}`;
  };
  const entryFeeDisplay = useMemo(() => {
    return typeof entryFee === "bigint" ? formatEther(entryFee) : '--';
  }, [entryFee]);
  const tenFeeDisplay = useMemo(() => {
    return typeof entryFee === "bigint" ? formatEther(entryFee * 10n) : '--';
  }, [entryFee]);
  const pendingRedPacketRewards = useMemo(() => {
    if (pendingRedPacketTokenIds.length === 0) {
      return [];
    }
    const map = new Map(luckyRewards.map((item) => [item.tokenId.toString(), item]));
    return pendingRedPacketTokenIds
      .map((tokenId) => {
        const reward = map.get(tokenId.toString());
        if (!reward) {
          return null;
        }
        return {
          tokenId,
          rewardAmount: reward.rewardAmount,
          claimed: reward.claimed,
        };
      })
      .filter(
        (item): item is { tokenId: bigint; rewardAmount: bigint; claimed: boolean } => item !== null
      );
  }, [pendingRedPacketTokenIds, luckyRewards]);
  const pendingRedPacketTotalWei = useMemo(() => {
    return pendingRedPacketRewards.reduce((sum, item) => sum + item.rewardAmount, 0n);
  }, [pendingRedPacketRewards]);
  const redPacketDisplayAmount = useMemo(() => {
    return formatSmall(formatEther(pendingRedPacketTotalWei));
  }, [pendingRedPacketTotalWei]);
  const isRedPacketRewardLoading =
    pendingRedPacketTokenIds.length > 0 && pendingRedPacketRewards.length < pendingRedPacketTokenIds.length;
  const canClaimRedPacket = pendingRedPacketRewards.some((item) => !item.claimed);

  useEffect(() => {
    const handleScroll = () => {
      // Debounce or simple check
      if (window.scrollY > 10 && !isScrolled) {
        setIsScrolled(true);
      } else if (window.scrollY <= 10 && isScrolled) {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isScrolled]);

  useEffect(() => {
    const sources = [supremeImg, redPacketImg, luckImg, wealthImg, careerImg, loveImg];
    sources.forEach((src) => {
      const img = new Image();
      img.src = src;
      if (typeof img.decode === 'function') {
        img.decode().catch(() => undefined);
      }
    });
  }, []);

  useEffect(() => {
    const balanceValues = balances && balances.length > 0
      ? balances.map((value) => Number(value))
      : [0, 0, 0, 0];
    const [careerCount, loveCount, wealthCount, luckCount] = balanceValues;
    const addr = address?.toLowerCase() ?? '';
    const redPacketCount = luckyRewards.filter(
      (item) => item.owner?.toLowerCase() === addr && !item.claimed
    ).length;
    const supremeCount = legendRewards.filter(
      (item) => item.owner?.toLowerCase() === addr && !item.claimed
    ).length;
    setCards([
      { type: 'supreme', name: '至尊马', count: supremeCount },
      { type: 'red_packet', name: '红包马', count: redPacketCount },
      { type: 'luck', name: '好运马', count: luckCount ?? 0 },
      { type: 'career', name: '事业马', count: careerCount ?? 0 },
      { type: 'love', name: '爱情马', count: loveCount ?? 0 },
      { type: 'wealth', name: '发财马', count: wealthCount ?? 0 },
    ]);
  }, [balances, address, luckyRewards, legendRewards]);

  const formatDecoded = (tokenId: bigint) => {
    const decoded = decodeTokenId(tokenId);
    return {
      tokenId: tokenId.toString(),
      version: decoded.version.toString(),
      domain: decoded.domain.toString(),
      category: decoded.category.toString(),
      subType: decoded.subType.toString(),
      rarity: decoded.rarity.toString(),
      index: decoded.index.toString(),
    };
  };

  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      previousConnectedRef.current = isConnected;
      return;
    }
    if (isConnected && !previousConnectedRef.current) {
      toast.success("钱包连接成功");
      connectedThisSessionRef.current = true;
    }
    if (!isConnected) {
      connectedThisSessionRef.current = false;
      hasShownWelcomeRef.current = false;
    }
    previousConnectedRef.current = isConnected;
  }, [isConnected, totalFreeDraws]);

  useEffect(() => {
    if (hasShownWelcomeRef.current) {
      return;
    }
    if (connectedThisSessionRef.current && totalFreeDraws > 0) {
      hasShownWelcomeRef.current = true;
      setIsWelcomeBonusModalOpen(true);
    }
  }, [totalFreeDraws]);

  const handleDraw = async (times: number, cost: number) => {
    initAudio(); // Initialize audio context on user interaction
    if (!isConnected || !address) {
      toast.error("连接钱包后继续");
      return;
    }
    if (!entryFee) {
      toast.error("合约费用加载中，请稍后重试");
      return;
    }

    setIsDrawLoading(true);

    // 先检查是否有待领取的抽奖
    try {
      const pendingStatus = await checkPendingLottery();

      // 如果有待领取且未过期，先领取
      if (pendingStatus && pendingStatus.blockNumber > 0n && pendingStatus.canClaim) {
        setLoadingStatus('claiming');
        const claimReceipt = await claimLottery(address);
        logger.log('Auto claim previous lottery receipt', claimReceipt);

        refetchFreeDraws();
        refetchEarnedFreeDraws();
        refetchBalances();
        refetchUserTokenIds();
        refetchLuckyTokenIds();
        refetchLegendTokenIds();
        refetchLuckyRewards();
        refetchLegendRewards();
        refetchCommitment();

        const awarded = parseNftAwardedFromReceipt(claimReceipt, address);
        const redPacketTokenIds = awarded.filter((item) => item.nftType === 5).map((item) => item.tokenId);
        setPendingRedPacketTokenIds(redPacketTokenIds);
        const newResults: any = awarded
          .map((item) => {
            switch (item.nftType) {
              case 1:
                return "career";
              case 2:
                return "love";
              case 3:
                return "wealth";
              case 4:
                return "luck";
              case 5:
                return "red_packet";
              default:
                return null;
            }
          })
          .filter((item): item is any => item !== null);

        if (newResults.length > 0) {
          setDrawResults(newResults);
          setIsDrawModalOpen(true);
        }

        setIsDrawLoading(false);
        setLoadingStatus(null);
        return; // 领取完成后直接返回，不继续新抽奖
      }
    } catch (error) {
      console.error("Check or claim pending lottery failed:", error);
      // 检查或领取失败，继续新抽奖
    }

    const shouldUseFree = times === 1 && cost === 0;

    if (shouldUseFree && totalFreeDraws <= 0) {
      toast.error("暂无免费次数");
      setIsDrawLoading(false);
      return;
    }
    if (!shouldUseFree && cost === 0) {
      toast.error("仅支持单抽使用免费次数");
      setIsDrawLoading(false);
      return;
    }
    if (!shouldUseFree && totalFreeDraws > 0) {
      toast.error("请先用完免费次数再进行付费抽卡");
      setIsDrawLoading(false);
      return;
    }

    // 检查余额是否足够（仅付费抽奖需要检查）
    if (!shouldUseFree) {
      const requiredAmount = times === 10 ? entryFee * 10n : entryFee;
      const userBalance = balance?.value ?? 0n;

      if (userBalance < requiredAmount) {
        toast.error("余额不足，请充值后再试");
        setIsDrawLoading(false);
        return;
      }
    }

    setLoadingStatus('paying');
    try {
      const value = times === 10 ? entryFee as any * 10n : shouldUseFree ? 0n : entryFee;
      const zeroAddress = "0x0000000000000000000000000000000000000000";
      const referral = getReferralCode();
      const inviterOnChain = referralInviter && referralInviter !== zeroAddress ? referralInviter : null;
      const shouldUseReferral = !inviterOnChain && referral;
      const inviter = shouldUseReferral ? referral!.inviter : zeroAddress;
      const signature = (shouldUseReferral ? referral!.signature : '0x') as `0x${string}`;
      const params = {
        times,
        value: value.toString(),
        inviter,
        signature,
        address,
        inviterOnChain,
        usedReferral: !!shouldUseReferral,
      };
      logger.log('payLottery params', params);

      // 第一步：支付抽奖费用
      const payReceipt = await payLottery(value as any, inviter as `0x${string}`, signature, address);
      logger.log('payLottery receipt', payReceipt);

      toast.success("支付成功，正在领取抽奖结果...");
      setLoadingStatus('claiming');

      refetchCommitment();

      const referralState = await refetchReferralInfo();
      const inviterBound = referralState.data && referralState.data !== zeroAddress;
      if (inviterBound) {
        clearReferralCode();
        const url = new URL(window.location.href);
        url.searchParams.delete('inviter');
        url.searchParams.delete('signature');
        window.history.replaceState({}, '', url.toString());
      } else if (shouldUseReferral) {
        clearReferralCode();
      }

      // 等待一小段时间让区块确认
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 第二步：自动领取抽奖结果
      try {
        const claimReceipt = await claimLottery(address);
        logger.log('claimLottery receipt', claimReceipt);

        refetchFreeDraws();
        refetchEarnedFreeDraws();
        refetchBalances();
        refetchUserTokenIds();
        refetchLuckyTokenIds();
        refetchLegendTokenIds();
        refetchLuckyRewards();
        refetchLegendRewards();
        refetchCommitment();

        const awarded = parseNftAwardedFromReceipt(claimReceipt, address);
        const redPacketTokenIds = awarded.filter((item) => item.nftType === 5).map((item) => item.tokenId);
        setPendingRedPacketTokenIds(redPacketTokenIds);
        const newResults: any = awarded
          .map((item) => {
            switch (item.nftType) {
              case 1:
                return "career";
              case 2:
                return "love";
              case 3:
                return "wealth";
              case 4:
                return "luck";
              case 5:
                return "red_packet";
              default:
                return null;
            }
          })
          .filter((item): item is any => item !== null);

        if (newResults.length === 0) {
          toast.error("未读取到抽卡结果，请稍后重试");
          return;
        }

        setDrawResults(newResults);
        setIsDrawModalOpen(true);
        setLoadingStatus(null);
      } catch (claimError) {
        console.error("自动领取失败:", claimError);
        // 领取失败，提示用户下次点击抽奖会自动领取
        toast.info("支付成功！请再次点击抽奖按钮领取结果");
        setLoadingStatus(null);
      }
    } catch (error) {
      console.error(error);
      toast.error("交易失败或已取消");
      setLoadingStatus(null);
      return;
    } finally {
      setIsDrawLoading(false);
    }
  };

  const handleClaimRedPacketRewards = async () => {
    if (!address) {
      toast.error("连接钱包后继续");
      return;
    }
    if (pendingRedPacketRewards.length === 0) {
      toast.error("暂无红包奖励");
      return;
    }
    const claimable = pendingRedPacketRewards.filter((item) => !item.claimed);
    if (claimable.length === 0) {
      toast.error("奖励已领取");
      return;
    }
    setIsRedPacketClaiming(true);
    setIsDrawLoading(true);
    try {
      for (const item of claimable) {
        await claimLuckyReward(item.tokenId, address);
      }
      toast.success("红包奖励领取成功");
      refetchLuckyRewards();
      refetchLuckyTokenIds();
      setIsRedPacketWinModalOpen(false);
      setPendingRedPacketTokenIds([]);
    } catch (error) {
      console.error(error);
      toast.error("领取失败或已取消");
    } finally {
      setIsRedPacketClaiming(false);
      setIsDrawLoading(false);
    }
  };

  const handleSynthesize = () => {
    if (!isConnected) {
      toast.error("连接钱包后继续");
      return;
    }
    const hasEnough = cards.some((card) => card.type === "luck" && card.count > 0)
      && cards.some((card) => card.type === "career" && card.count > 0)
      && cards.some((card) => card.type === "love" && card.count > 0)
      && cards.some((card) => card.type === "wealth" && card.count > 0);

    if (!hasEnough) {
      toast.error("卡片不足，无法合成");
      return;
    }
    setIsDrawLoading(true);
    composeLegend()
      .then(() => {
        refetchBalances();
        refetchUserTokenIds();
        refetchLuckyTokenIds();
        refetchLegendTokenIds();
        setIsSynthesisModalOpen(true);
      })
      .catch((error) => {
        console.error(error);
        toast.error("交易失败或已取消");
      })
      .finally(() => {
        setIsDrawLoading(false);
      });
  };

  const commonToRareRequired = typeof commonToRareRatio === "bigint" ? Number(commonToRareRatio) : 3;
  const canSynthesizeGoodLuck = cards.some((card) => card.type === "career" && card.count >= commonToRareRequired)
    && cards.some((card) => card.type === "love" && card.count >= commonToRareRequired)
    && cards.some((card) => card.type === "wealth" && card.count >= commonToRareRequired);

  const handleSynthesizeGoodLuck = () => {
    if (!isConnected) {
      toast.error("连接钱包后继续");
      return;
    }
    if (!canSynthesizeGoodLuck) {
      toast.error("卡片不足，无法合成");
      return;
    }
    setIsDrawLoading(true);
    composeRare()
      .then(() => {
        refetchBalances();
        refetchUserTokenIds();
        refetchLuckyTokenIds();
        refetchLegendTokenIds();
        setIsGoodLuckSynthesisModalOpen(true);
      })
      .catch((error) => {
        console.error(error);
        toast.error("交易失败或已取消");
      })
      .finally(() => {
        setIsDrawLoading(false);
      });
  };

  return (
    <div className="min-h-screen w-full pb-32 md:pb-0 overflow-x-hidden text-[#fff9f0] relative">
      <GlobalStyles />
      {isDrawLoading && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-[#FAE6B1]/30 bg-gradient-to-b from-[#5c0000] to-[#2a0a0a] px-6 py-6 text-center shadow-2xl">
            <div className="pointer-events-none absolute top-[-20%] left-[-20%] h-[60%] w-[140%] rounded-full bg-[#FAE6B1]/10 blur-[60px]" />
            <div className="pointer-events-none absolute bottom-[-20%] right-[-20%] h-[60%] w-[140%] rounded-full bg-[#ff0000]/10 blur-[60px]" />
            <div className="mx-auto mb-5 h-20 w-20 rounded-full bg-gradient-to-br from-[#FAE6B1] to-[#C6A66D] p-[2px] shadow-[0_0_30px_rgba(250,230,177,0.3)] animate-[bounce_3s_infinite]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#5c0000] relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-45 animate-[shine_2s_infinite]" />
                <Sparkles className="h-10 w-10 text-[#FAE6B1]" />
              </div>
            </div>
            <div className="text-[#FAE6B1] text-lg font-black">
              {loadingStatus === 'paying' ? '等待钱包确认' : loadingStatus === 'claiming' ? '正在领取结果' : '等待钱包确认'}
            </div>
            <div className="mt-2 text-sm font-medium text-[#fff9f0]/80">
              {loadingStatus === 'paying' ? '请在钱包中确认交易' : loadingStatus === 'claiming' ? '请稍候，正在为您领取抽奖结果' : '交易提交后会自动更新'}
            </div>
          </div>
        </div>
      )}
      <Toaster
        position="top-center"
        theme="dark"
        toastOptions={{
          duration: 2000,
          style: {
            background: '#2a0a0a', // Solid background for better performance
            border: '1px solid rgba(250, 230, 177, 0.2)',
            color: '#FAE6B1',
            borderRadius: '16px',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          },
          className: 'class-toaster',
          classNames: {
            success: 'toast-success',
            error: 'toast-error',
            icon: 'toast-icon',
          },
        }}
      />

      {/* Global Background Layer - Highly Optimized for Mobile */}
      <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-[#8a0000]">
        {/* Static Gradient Fallback for Mobile */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#cf1414] to-[#8a0000]" />

        {/* Subtle Noise Texture - Low Opacity */}
        <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] mix-blend-overlay"></div>

        {/* Heavy Animations - DESKTOP ONLY */}
        <div className="hidden md:block absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-gradient-to-tr from-transparent via-white/5 to-transparent rotate-12 animate-[sheen_8s_ease-in-out_infinite] will-change-transform translate-z-0 pointer-events-none" />

        {/* Ambient Glows - DESKTOP ONLY or VERY SIMPLE on Mobile */}
        <div className="hidden md:block absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-[#ff4d4d]/10 to-transparent mix-blend-overlay pointer-events-none translate-z-0" />
        <div className="hidden md:block absolute bottom-0 right-0 w-[600px] h-[600px] bg-[#660000]/40 rounded-full blur-[120px] mix-blend-multiply pointer-events-none translate-z-0" />
      </div>

      <div className="relative z-10">
        {/* Fixed Header - Removed Blur on Mobile */}
        <div
          className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 will-change-transform ${isScrolled
            ? 'bg-[#8b0000] shadow-lg md:bg-[#8b0000]/80 md:backdrop-blur-xl border-b border-[#FAE6B1]/10'
            : 'bg-transparent border-b border-transparent'
            }`}
        >
          <div className="max-w-md md:max-w-7xl mx-auto">
            <Header
              onOpenHistory={() => setIsHistoryModalOpen(true)}
              onOpenRewards={() => setIsRewardsModalOpen(true)}
              onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            />
          </div>
        </div>

        <div className="max-w-md md:max-w-7xl mx-auto px-4 pt-28 pb-12">
          <div className="text-center pt-6 pb-8 md:pt-16 md:pb-16">
            {/* Removed animate-shimmer on mobile */}
            <h1 className="text-4xl md:text-7xl font-black tracking-wider whitespace-nowrap will-change-transform flex items-center justify-center gap-1 md:gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAE6B1] via-[#ffffff] to-[#FAE6B1] md:bg-[linear-gradient(90deg,#FAE6B1_0%,#C6A66D_40%,#ffffff_50%,#C6A66D_60%,#FAE6B1_100%)] md:animate-shimmer drop-shadow-[0_2px_10px_rgba(198,166,109,0.3)]">
                集
              </span>
              <span
                className="inline-flex items-center justify-center"
                style={{
                  width: 'clamp(48px, 10vw, 160px)',
                  height: 'clamp(48px, 10vw, 160px)',
                  animation: 'spinY 6s linear infinite',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
              >
                <img src={supremeImg} alt="至尊马" className="h-full w-full object-contain drop-shadow-[0_2px_14px_rgba(198,166,109,0.4)]" />
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAE6B1] via-[#ffffff] to-[#FAE6B1] md:bg-[linear-gradient(90deg,#FAE6B1_0%,#C6A66D_40%,#ffffff_50%,#C6A66D_60%,#FAE6B1_100%)] md:animate-shimmer drop-shadow-[0_2px_10px_rgba(198,166,109,0.3)]">
                卡 · 赢奖池
              </span>
            </h1>
            <div className="mt-4 md:mt-6 flex items-center justify-center gap-2">
              <div
                // onClick={async () => {
                //   const success = await copyToClipboard(contractAddress);
                //   if (success) {
                //     toast.success("复制成功");
                //   } else {
                //     toast.error("复制失败，请手动复制");
                //   }
                // }}
                className="flex items-center gap-2 bg-[#FAE6B1]/10 hover:bg-[#FAE6B1]/20 px-4 py-2 md:px-5 md:py-2.5 rounded-full cursor-pointer transition-colors border border-[#FAE6B1]/20 group active:scale-95 touch-manipulation"
              >
                <span className="text-[#FAE6B1] text-xs md:text-lg font-bold tracking-widest group-hover:text-[#fff] transition-colors max-w-[150px] md:max-w-none">
                  {contractAddress}
                </span>
                {/* <Copy size={14} className="text-[#FAE6B1] group-hover:text-[#fff] transition-colors md:w-4 md:h-4" /> */}
              </div>
            </div>
          </div>

          <div className="md:grid md:grid-cols-2 md:gap-12 items-start max-w-5xl mx-auto">

            {/* Left Column: Info & Stats */}
            <div className="space-y-8">
              <PrizePool
                redPacketPool={prizePool.redPacket}
                superPool={prizePool.super}
                onOpenWinnerHistory={() => setIsWinnerHistoryModalOpen(true)}
              />
              <div className="hidden md:block space-y-8">
                <InviteSection />
                <RulesSection />
              </div>
            </div>

            {/* Right Column: Game Board */}
            <div className="mt-6 md:mt-0 space-y-6">
              {/* Removed backdrop-blur-3xl on mobile, used solid semi-transparent bg */}
              <div className="bg-[#8b0000]/40 md:bg-white/5 md:backdrop-blur-3xl rounded-2xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.3)] border border-white/20 relative overflow-hidden transform-gpu">

                <div className="flex justify-between items-center mb-4 md:mb-6 relative z-10">
                  <h2 className="text-[#fff9f0] text-xl md:text-3xl font-black tracking-wide">我的马卡</h2>
                  <div className="px-3 py-1 md:px-4 md:py-1.5 bg-gradient-to-r from-[#FAE6B1] to-[#C6A66D] rounded-full text-[10px] md:text-sm font-bold text-[#8b0000] shadow-lg whitespace-nowrap">
                    合成至尊马瓜分超级大奖
                  </div>
                </div>

                <CardGrid
                  cards={cards}
                  onOpenRewards={() => setIsRewardsModalOpen(true)}
                  onTransferSuccess={() => {
                    refetchBalances();
                    refetchUserTokenIds();
                    refetchLuckyTokenIds();
                    refetchLegendTokenIds();
                    refetchLuckyRewards();
                    refetchLegendRewards();
                  }}
                  ownedTokenIds={Array.isArray(userTokenIds) ? userTokenIds : []}
                  luckyTokenIds={Array.isArray(luckyTokenIds) ? luckyTokenIds : []}
                  legendTokenIds={Array.isArray(legendTokenIds) ? legendTokenIds : []}
                  luckyRewards={luckyRewards}
                  legendRewards={legendRewards}
                />

                <GameActions
                  onFreeDraw={() => {
                    if (!isConnected) {
                      toast.error("连接钱包后继续");
                      return;
                    }
                    handleDraw(1, 0);
                  }}
                  onSynthesize={handleSynthesize}
                  freeDraws={totalFreeDraws}
                  canSynthesize={cards.some((card) => card.type === "luck" && card.count > 0)
                    && cards.some((card) => card.type === "career" && card.count > 0)
                    && cards.some((card) => card.type === "love" && card.count > 0)
                    && cards.some((card) => card.type === "wealth" && card.count > 0)}
                />

                {/* Good Luck Synthesis Section */}
                <div className="mt-6 mx-2 p-4 rounded-xl border border-[#FAE6B1]/30 bg-black/20 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="text-[#FAE6B1] text-sm md:text-base font-bold text-center md:text-left">
                    {commonToRareRequired} 张事业马 + {commonToRareRequired} 张爱情马 + {commonToRareRequired} 张发财马 = 1 张好运马
                  </div>
                  <button
                    onClick={handleSynthesizeGoodLuck}
                    disabled={!canSynthesizeGoodLuck}
                    className={`px-6 py-2 rounded-full font-black text-sm shadow-lg transition-all whitespace-nowrap min-w-[100px] touch-manipulation bg-gradient-to-r from-[#FAE6B1] to-[#C6A66D] text-[#8b0000] ${canSynthesizeGoodLuck
                      ? "hover:brightness-110 active:scale-95"
                      : "opacity-60 cursor-not-allowed active:scale-100"
                      }`}
                  >
                    立即合成
                  </button>
                </div>

                {/* Desktop: Draw Buttons inside the card container */}
                <div className="hidden md:block mt-4 pt-4 border-t border-white/10">
                  <DrawFooter
                    onDraw={handleDraw}
                    canPaidDraw={totalFreeDraws === 0}
                    singleCost={entryFeeDisplay}
                    tenCost={tenFeeDisplay}
                  />
                </div>
              </div>
            </div>

            {/* Mobile Only: Rules & Invite below game on mobile */}
            <div className="md:hidden space-y-6 mt-6">
              <InviteSection />
              <RulesSection />
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="md:hidden">
        <DrawFooter
          onDraw={handleDraw}
          canPaidDraw={totalFreeDraws === 0}
          singleCost={entryFeeDisplay}
          tenCost={tenFeeDisplay}
        />
      </div>

      {/* Modals */}
      <DrawModal
        isOpen={isDrawModalOpen}
        onClose={() => {
          setIsDrawModalOpen(false);
          if (pendingRedPacketTokenIds.length > 0) {
            setTimeout(() => {
              playRedPacketSound();
              setIsRedPacketWinModalOpen(true);
            }, 500);
          }
        }}
        results={drawResults}
      />

      <RedPacketWinModal
        isOpen={isRedPacketWinModalOpen}
        onClose={() => {
          setIsRedPacketWinModalOpen(false);
          setPendingRedPacketTokenIds([]);
        }}
        amount={redPacketDisplayAmount}
        isLoading={isRedPacketRewardLoading}
        isClaiming={isRedPacketClaiming}
        canClaim={canClaimRedPacket}
        onClaim={handleClaimRedPacketRewards}
      />

      <SynthesisModal
        isOpen={isSynthesisModalOpen}
        onClose={() => setIsSynthesisModalOpen(false)}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      <WinnerHistoryModal
        isOpen={isWinnerHistoryModalOpen}
        onClose={() => setIsWinnerHistoryModalOpen(false)}
      />

      <RewardsModal
        isOpen={isRewardsModalOpen}
        onClose={() => setIsRewardsModalOpen(false)}
      />

      <WelcomeBonusModal
        isOpen={isWelcomeBonusModalOpen}
        onClose={() => setIsWelcomeBonusModalOpen(false)}
        onDraw={() => handleDraw(1, 0)}
        freeDraws={totalFreeDraws}
      />

      <GoodLuckSynthesisModal
        isOpen={isGoodLuckSynthesisModalOpen}
        onClose={() => setIsGoodLuckSynthesisModalOpen(false)}
      />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        isWalletConnected={isConnected}
      />
    </div>
  );
}
