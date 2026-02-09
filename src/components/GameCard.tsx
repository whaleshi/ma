import React from 'react';
import { Card as CardType } from '../App';

interface GameCardProps {
  card: CardType;
  isSelected: boolean;
  onClick: () => void;
  isSpecial?: boolean;
}

export function GameCard({ card, isSelected, onClick, isSpecial = false }: GameCardProps) {
  const baseClass = isSpecial
    ? 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50'
    : 'from-gray-800 to-gray-900 border-gray-700';

  const selectedClass = isSelected
    ? 'ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-950 scale-105'
    : 'hover:scale-105';

  return (
    <button
      onClick={onClick}
      className={`relative bg-gradient-to-br ${baseClass} rounded-xl p-4 border transition-all duration-300 ${selectedClass} group`}
    >
      {/* Card Image */}
      <div className="aspect-[3/4] flex items-center justify-center text-4xl mb-3 bg-gradient-to-br from-gray-900/50 to-gray-950/50 rounded-lg">
        <span className="text-gray-400">{card.name}</span>
      </div>

      {/* Card Name */}
      <div className="text-center space-y-1">
        <h4 className="text-sm">{card.name}</h4>
        <div className="text-xs text-gray-400">
          x {card.count}
        </div>
      </div>

      {/* Special Card Glow Effect */}
      {isSpecial && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl blur-xl -z-10 group-hover:blur-2xl transition-all duration-300" />
      )}

      {/* Count Badge */}
      {card.count > 0 && (
        <div className={`absolute top-2 right-2 w-6 h-6 ${isSpecial ? 'bg-gradient-to-br from-yellow-500 to-orange-500' : 'bg-purple-600'} rounded-full flex items-center justify-center text-xs shadow-lg`}>
          {card.count}
        </div>
      )}

      {/* Out of Stock Overlay */}
      {card.count === 0 && (
        <div className="absolute inset-0 bg-gray-950/80 rounded-xl flex items-center justify-center backdrop-blur-sm">
          <span className="text-gray-500 text-sm">未拥有</span>
        </div>
      )}
    </button>
  );
}