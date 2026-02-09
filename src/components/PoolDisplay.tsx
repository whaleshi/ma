import React from 'react';
import { Clock, Sparkles } from 'lucide-react';

interface PoolDisplayProps {
  title: string;
  amount: number;
  hint: string;
  type: 'redpacket' | 'ultimate';
  countdown?: string;
  lastWinner?: {
    address: string;
    amount: number;
  };
}

export function PoolDisplay({ title, amount, hint, type, countdown, lastWinner }: PoolDisplayProps) {
  const gradientClass = type === 'redpacket'
    ? 'from-red-900/30 to-orange-900/30 border-red-500/30'
    : 'from-purple-900/30 to-blue-900/30 border-purple-500/30';

  const iconBgClass = type === 'redpacket'
    ? 'from-red-500 to-orange-500'
    : 'from-purple-500 to-blue-500';

  return (
    <div className={`bg-gradient-to-br ${gradientClass} rounded-2xl p-6 border backdrop-blur-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="mb-1">{title}</h3>
          <p className="text-xs text-gray-400">{hint}</p>
        </div>
        <div className={`w-10 h-10 bg-gradient-to-br ${iconBgClass} rounded-lg flex items-center justify-center`}>
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-3xl">
          {amount.toFixed(2)} <span className="text-xl text-gray-400">USDT</span>
        </div>

        {lastWinner && (
          <div className="bg-black/20 rounded-lg px-3 py-2 text-xs">
            <div className="flex items-center justify-between text-gray-400">
              <span>上一轮获奖</span>
              <span className="text-yellow-400">{lastWinner.amount.toFixed(2)} USDT</span>
            </div>
            <div className="mt-1 text-gray-500">
              {lastWinner.address}
            </div>
          </div>
        )}

        {countdown && (
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Clock className="w-4 h-4" />
            <span>{countdown}</span>
          </div>
        )}

        {type === 'ultimate' && (
          <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 rounded-lg px-3 py-2">
            <Sparkles className="w-4 h-4" />
            <span>首位获得神马卡用户将额外获得10%奖池</span>
          </div>
        )}
      </div>
    </div>
  );
}