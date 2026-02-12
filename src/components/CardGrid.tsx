import React, { useState } from 'react';
import { Card } from '../App';
import { CardDetailModal } from './CardDetailModal';
import supremeImg from 'figma:asset/6651fc0c90390d131f74b014994be51852a71a59.png';
import redPacketImg from 'figma:asset/d19a2f3c21c67ce076c2a24d0e2058e33ea5a8a2.png';
import luckImg from 'figma:asset/876972c509561235a14234ebaeb8a04d4c2f28ae.png';
import wealthImg from 'figma:asset/3e8ed8b84fe45c8898c2deea5cd3d6495bd61c69.png';
import careerImg from 'figma:asset/3c55e552361dae32ba73beaddae94fa841d4caaa.png';
import loveImg from 'figma:asset/3e75ed55595146a6ff7fa1a65e6413528470f471.png';

interface CardGridProps {
  cards: Card[];
  onOpenRewards: () => void;
  onTransferSuccess: () => void;
  ownedTokenIds: bigint[];
  luckyTokenIds: bigint[];
  legendTokenIds: bigint[];
  luckyRewards: { tokenId: bigint; owner?: string, claimed: any }[];
  legendRewards: { tokenId: bigint; owner?: string, claimed: any }[];
}

const cardImages: Record<string, string> = {
  supreme: supremeImg,
  red_packet: redPacketImg,
  luck: luckImg,
  wealth: wealthImg,
  career: careerImg,
  love: loveImg,
};

export function CardGrid({
  cards,
  onOpenRewards,
  onTransferSuccess,
  ownedTokenIds,
  luckyTokenIds,
  legendTokenIds,
  luckyRewards,
  legendRewards,
}: CardGridProps) {
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);

  const getCard = (type: string) => cards.find(c => c.type === type);

  const renderCard = (type: string, bgColor: string, borderColor: string, textColor: string) => {
    const card = getCard(type);
    if (!card) return null;

    const imageSrc = cardImages[type];
    const isOwned = card.count > 0;

    const content = imageSrc ? (
      <div className="relative w-full aspect-[3/4] isolation-auto">
        <img
          src={imageSrc}
          alt={card.name}
          loading="eager"
          decoding="async"
          // 核心修复：添加 transform-gpu，明确指定 grayscale 0 和 100，避免 iOS 渲染歧义
          className={`w-full h-full object-contain drop-shadow-md transition-all duration-300 transform-gpu ${
            !isOwned 
              ? 'grayscale opacity-60 brightness-[0.8]' 
              : 'grayscale-0 opacity-100'
          }`}
          // 兜底 inline style 应对某些顽固的旧版 iOS WebKit
          style={{ WebkitFilter: !isOwned ? 'grayscale(100%)' : 'grayscale(0%)' }}
        />
      </div>
    ) : (
      <div className={`
        w-full aspect-[3/4] rounded-xl border-4 
        flex items-center justify-center shadow-sm
        ${bgColor} ${borderColor}
        ${!isOwned ? 'grayscale opacity-60' : ''}
      `}>
        <div className={`text-xl font-black leading-tight text-center ${textColor}`}>
          {card.name.split('').map((char, i) => (
            <div key={i}>{char}</div>
          ))}
        </div>
      </div>
    );

    return (
      <div
        onClick={() => setSelectedCard(card)}
        className="relative group cursor-pointer transition-transform active:scale-95 touch-manipulation isolate"
      >
        {isOwned && (
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_30px_rgba(250,230,177,0.3)] pointer-events-none" />
        )}

        <div className="relative">
          {content}
        </div>

        {isOwned && (
          <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-br from-[#ff000e] to-[#c4000b] text-[#ffe8a4] text-[10px] md:text-xs font-black w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center border border-[#ffe8a4] shadow-lg z-20">
            {card.count}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2 md:gap-4 px-1 md:px-2">
        {renderCard('supreme', 'bg-[#ff000e]', 'border-[#ff3653]', 'text-[#ffe8a4]')}
        {renderCard('red_packet', 'bg-[#ffe9a3]', 'border-[#ffdc97]', 'text-[#ff9752]')}
        {renderCard('luck', 'bg-[#ffe9a3]', 'border-[#ffdc97]', 'text-[#ff9752]')}
        {renderCard('career', 'bg-[#ffe9a3]', 'border-[#ffdc97]', 'text-[#ff9752]')}
        {renderCard('love', 'bg-[#ffe9a3]', 'border-[#ffdc97]', 'text-[#ff9752]')}
        {renderCard('wealth', 'bg-[#ffe9a3]', 'border-[#ffdc97]', 'text-[#ff9752]')}
      </div>

      <CardDetailModal
        isOpen={!!selectedCard}
        onClose={() => setSelectedCard(null)}
        card={selectedCard || { type: 'luck', name: '', count: 0 }}
        imageSrc={selectedCard ? cardImages[selectedCard.type] : ''}
        onOpenRewards={onOpenRewards}
        onTransferSuccess={onTransferSuccess}
        ownedTokenIds={ownedTokenIds}
        luckyTokenIds={luckyTokenIds}
        legendTokenIds={legendTokenIds}
        luckyRewards={luckyRewards}
        legendRewards={legendRewards}
      />
    </>
  );
}