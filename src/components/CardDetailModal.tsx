import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../App';
import { X, Send, Share2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { useAccount, useConfig, useWriteContract } from 'wagmi';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { useNftContractAddress } from '../hooks/useLotteryContract';
import erc1155Abi from '../constant/ERC1155.abi.json';

interface CardDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card;
  imageSrc: string;
  onOpenRewards: () => void;
  onTransferSuccess: () => void;
  ownedTokenIds: bigint[];
  luckyTokenIds: bigint[];
  legendTokenIds: bigint[];
  luckyRewards: {
    claimed: any; tokenId: bigint; owner?: string
  }[];
  legendRewards: {
    claimed: any; tokenId: bigint; owner?: string
  }[];
}

export function CardDetailModal({
  isOpen,
  onClose,
  card,
  imageSrc,
  onOpenRewards,
  onTransferSuccess,
  ownedTokenIds,
  luckyTokenIds,
  legendTokenIds,
  luckyRewards,
  legendRewards,
}: CardDetailModalProps) {
  const [isGiftMode, setIsGiftMode] = useState(false);
  const [giftAddress, setGiftAddress] = useState('');
  const [mounted, setMounted] = useState(false);
  const [isTransferring, setIsTransferring] = useState(false);
  const [selectedTokenId, setSelectedTokenId] = useState<string>('');
  const { address } = useAccount();
  const wagmiConfig = useConfig();
  const chain = wagmiConfig.chains?.[0];
  const { data: nftContract } = useNftContractAddress();
  const { writeContractAsync } = useWriteContract();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset state when opening/closing
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setIsGiftMode(false);
        setGiftAddress('');
        setSelectedTokenId('');
      }, 300);
    }
  }, [isOpen]);

  const transferableTokenIds = useMemo(() => {
    const tokenIdMap: Record<string, bigint> = {
      career: 1n,
      love: 2n,
      wealth: 3n,
      luck: 4n,
    };
    const fixed = tokenIdMap[card.type];
    if (fixed) {
      return [fixed];
    }
    const addr = address?.toLowerCase() ?? '';
    if (card.type === 'red_packet') {
      const ids = luckyRewards
        .filter((item) => item.owner?.toLowerCase() === addr && !item.claimed)
        .map((item) => item.tokenId.toString());
      return Array.from(new Set(ids)).map((id) => BigInt(id));
    }
    if (card.type === 'supreme') {
      const ids = legendRewards
        .filter((item) => item.owner?.toLowerCase() === addr && !item.claimed)
        .map((item) => item.tokenId.toString());
      return Array.from(new Set(ids)).map((id) => BigInt(id));
    }
    return [];
  }, [card.type, address, luckyRewards, legendRewards]);
  const canClaimRedPacket = useMemo(() => {
    if (card.type !== 'red_packet') {
      return false;
    }
    const addr = address?.toLowerCase() ?? '';
    return luckyRewards.some((item) => item.owner?.toLowerCase() === addr && !item.claimed);
  }, [card.type, address, luckyRewards]);
  const canClaimSupreme = useMemo(() => {
    if (card.type !== 'supreme') {
      return false;
    }
    const addr = address?.toLowerCase() ?? '';
    return legendRewards.some((item) => item.owner?.toLowerCase() === addr && !item.claimed);
  }, [card.type, address, legendRewards]);

  useEffect(() => {
    if (!isOpen || !isGiftMode) {
      return;
    }
    if (transferableTokenIds.length === 1) {
      setSelectedTokenId(transferableTokenIds[0].toString());
    }
  }, [isOpen, isGiftMode, transferableTokenIds]);

  const handleGift = () => {
    if (!giftAddress.trim()) {
      toast.error("请输入对方钱包地址");
      return;
    }
    if (!address) {
      toast.error("请先连接钱包");
      return;
    }
    if (!nftContract) {
      toast.error("合约地址加载中");
      return;
    }
    if (transferableTokenIds.length > 1 && !selectedTokenId) {
      toast.error("请选择要赠送的 Token ID");
      return;
    }
    const tokenId = selectedTokenId ? BigInt(selectedTokenId) : undefined;
    if (!tokenId) {
      toast.error("该卡暂不支持赠送");
      return;
    }
    if (isTransferring) {
      return;
    }
    setIsTransferring(true);
    (async () => {
      try {
        const hash = await writeContractAsync({
          address: nftContract as `0x${string}`,
          abi: erc1155Abi,
          functionName: 'safeTransferFrom',
          args: [address, giftAddress as `0x${string}`, tokenId, 1n, '0x'],
          account: address as `0x${string}`,
          chain,
        });
        await waitForTransactionReceipt(wagmiConfig, { hash });
        toast.success(`成功赠送 ${card.name} 给 ${giftAddress.substring(0, 6)}...${giftAddress.substring(giftAddress.length - 4)}`);
        onTransferSuccess();
        onClose();
      } catch (error) {
        console.error(error);
        toast.error("赠送失败或已取消");
      } finally {
        setIsTransferring(false);
      }
    })();
  };

  // const handleRequest = () => {
  //   const typeMap: Record<string, string> = {
  //     career: 'career',
  //     love: 'love',
  //     wealth: 'wealth',
  //     luck: 'luck',
  //     red_packet: 'red',
  //     supreme: 'supreme',
  //   };
  //   const shareType = typeMap[card.type] ?? 'default';
  //   const shareUrl = `${window.location.origin}/api/share?type=${shareType}`;
  //   const text = `Horse 发生 求一张${card.name}，一起冲大奖！${shareUrl}`;
  //   const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  //   window.open(url, '_blank');
  // };

  // const { address } = useAccount();

  const handleRequest = () => {
    // 1. 类型映射（用于后端 API 分享链接）
    const typeMap: Record<string, string> = {
      supreme: 'supreme',
      red_packet: 'red',
      luck: 'luck',
      career: 'career',
      love: 'love',
      wealth: 'wealth',
    };

    // 2. 祝福语映射
    const blessingMap: Record<string, string> = {
      supreme: "愿你自带主场，所到之处皆是舞台 🪩",
      red_packet: "愿你今年红包不断，惊喜常在 🫢",
      luck: "愿好运像四叶草一样，悄悄但精准地落在你身上 🍀",
      career: "愿你职场一路开挂，升维不止升职 🤵",
      love: "愿你遇见双向奔赴，心动不止一次 💓",
      wealth: "愿你财路清晰、进账稳定、越赚越从容 💰",
    };

    const shareType = typeMap[card.type] ?? 'default';
    const blessing = blessingMap[card.type] ?? "一起冲大奖！";
    const shareUrl = `${window.location.origin}/api/share?type=${shareType}`;
    
    // 3. 组装推文文案 (严格遵守你提供的格式)
    // 使用 \n\n 保持段落间距
    const text = `2026 我在 @GoodhorseBNB 集马卡赢奖励 🏆

  求一张「${card.name}」${blessing}

  我的钱包 👉 ${address || '尚未连接钱包'}
  ${shareUrl}`;

    // 4. Twitter 分享链接编码
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    
    window.open(twitterUrl, '_blank');
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
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
            className="relative z-10 w-full max-w-sm bg-[#fff9f0] rounded-2xl p-6 shadow-2xl overflow-hidden"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#ffaa00]/10 to-transparent pointer-events-none"></div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-20"
            >
              <X size={20} className="text-[#8b0000]/70" />
            </button>

            <div className="flex flex-col items-center relative z-10">
              {/* Card Image */}
              <motion.div
                initial={{ scale: 0.8, rotate: -5 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-48 mb-6 drop-shadow-2xl relative"
              >
                <div className="relative">
                  <img
                    src={imageSrc}
                    alt={card.name}
                    className="w-full h-auto relative z-10"
                    loading="eager"
                    decoding="sync"
                  />
                </div>
              </motion.div>

              <h3 className="text-2xl font-black text-[#8b0000] mb-6">{card.name}</h3>

              {/* Action Buttons Area */}
              <div className="w-full space-y-3">
                <AnimatePresence mode="wait">
                  {isGiftMode ? (
                    <motion.div
                      key="gift-input"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="w-full space-y-3"
                    >
                      {transferableTokenIds.length > 1 && (
                        <div className="relative">
                          <select
                            value={selectedTokenId}
                            onChange={(e) => setSelectedTokenId(e.target.value)}
                            className="w-full bg-white border border-[#FAE6B1] rounded-xl py-3 px-4 text-[#8b0000] focus:outline-none focus:ring-2 focus:ring-[#ff000e]/20 transition-all text-sm appearance-none [&::-ms-expand]:hidden"
                            style={{ WebkitAppearance: 'none', MozAppearance: 'none', backgroundImage: 'none' }}
                          >
                            <option value="" disabled>
                              选择要赠送的 Token ID
                            </option>
                            {transferableTokenIds.map((id) => (
                              <option key={id.toString()} value={id.toString()}>
                                {id.toString()}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                      <div className="relative">
                        <input
                          type="text"
                          value={giftAddress}
                          onChange={(e) => setGiftAddress(e.target.value)}
                          placeholder="输入对方钱包地址 (0x...)"
                          className="w-full bg-white border border-[#FAE6B1] rounded-xl py-3 px-4 pl-4 pr-10 text-[#8b0000] placeholder:text-[#8b0000]/30 focus:outline-none focus:ring-2 focus:ring-[#ff000e]/20 transition-all text-sm"
                          autoFocus
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setIsGiftMode(false)}
                          className="flex-1 py-3 rounded-xl font-bold bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
                        >
                          取消
                        </button>
                        <button
                          onClick={handleGift}
                          disabled={isTransferring}
                          className="flex-[2] py-3 rounded-xl font-bold bg-gradient-to-r from-[#ff000e] to-[#c4000b] text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <span>{isTransferring ? '处理中...' : '确认赠送'}</span>
                          <ArrowRight size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ) : card.type === 'red_packet' ? (
                    <motion.div
                      key="claim-btn"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 w-full"
                    >
                      <button
                        onClick={() => {
                          if (!canClaimRedPacket) {
                            return;
                          }
                          onClose();
                          onOpenRewards();
                        }}
                        disabled={!canClaimRedPacket}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${canClaimRedPacket
                          ? 'bg-gradient-to-r from-[#ff000e] to-[#c4000b] text-white shadow-lg shadow-red-500/20'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <span>领取奖励</span>
                      </button>
                      <button
                        onClick={() => {
                          if (card.count > 0) {
                            setIsGiftMode(true);
                          } else {
                            handleRequest();
                          }
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${card.count > 0
                          ? 'bg-[#FAE6B1] text-[#8b0000] border border-[#d6c08d] shadow-sm hover:bg-[#ffeec7]'
                          : 'bg-[#FAE6B1] text-[#8b0000] border border-[#d6c08d] shadow-sm hover:bg-[#ffeec7]'
                          }`}
                      >
                        {card.count > 0 ? <Send size={18} /> : <Share2 size={18} />}
                        <span>{card.count > 0 ? '赠送卡片' : '找人索要'}</span>
                      </button>
                    </motion.div>
                  ) : card.type === 'supreme' ? (
                    <motion.div
                      key="supreme-actions"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3 w-full"
                    >
                      <button
                        onClick={() => {
                          if (!canClaimSupreme) {
                            return;
                          }
                          onClose();
                          onOpenRewards();
                        }}
                        disabled={!canClaimSupreme}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${canClaimSupreme
                          ? 'bg-gradient-to-r from-[#ff000e] to-[#c4000b] text-white shadow-lg shadow-red-500/20'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          }`}
                      >
                        <span>领取奖励</span>
                      </button>
                      <button
                        onClick={() => {
                          if (card.count > 0) {
                            setIsGiftMode(true);
                          } else {
                            handleRequest();
                          }
                        }}
                        className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#FAE6B1] text-[#8b0000] border border-[#d6c08d] flex items-center justify-center gap-2 shadow-sm hover:bg-[#ffeec7] transition-all active:scale-95"
                      >
                        {card.count > 0 ? <Send size={18} /> : <Share2 size={18} />}
                        <span>{card.count > 0 ? '赠送卡片' : '找人索要'}</span>
                      </button>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="buttons"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-3"
                    >
                      {/* Gift Button */}
                      <button
                        onClick={() => {
                          if (card.count > 0) {
                            setIsGiftMode(true);
                          } else {
                            handleRequest();
                          }
                        }}
                        className={`flex-1 py-3 px-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 ${card.count > 0
                          ? 'bg-gradient-to-r from-[#ff000e] to-[#c4000b] text-white shadow-lg shadow-red-500/20'
                          : 'bg-[#FAE6B1] text-[#8b0000] border border-[#d6c08d] shadow-sm hover:bg-[#ffeec7]'
                          }`}
                      >
                        {card.count > 0 ? <Send size={18} /> : <Share2 size={18} />}
                        <span>{card.count > 0 ? '赠送卡片' : '找人索要'}</span>
                      </button>

                      {/* Request Button */}
                      {card.count > 0 ? (
                        <button
                          onClick={handleRequest}
                          className="flex-1 py-3 px-4 rounded-xl font-bold bg-[#FAE6B1] text-[#8b0000] border border-[#d6c08d] flex items-center justify-center gap-2 shadow-sm hover:bg-[#ffeec7] transition-all active:scale-95"
                        >
                          <Share2 size={18} />
                          <span>找人索要</span>
                        </button>
                      ) : null}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
