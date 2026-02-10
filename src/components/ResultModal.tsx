import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { motion } from 'motion/react';
import { Card } from '../App';
import { Sparkles } from 'lucide-react';

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: Card[];
}

export function ResultModal({ isOpen, onClose, results }: ResultModalProps) {
  const totalCards = results.reduce((sum, card) => sum + card.count, 0);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl bg-gray-950 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-400" />
              <span>抽卡结果</span>
              <Sparkles className="w-6 h-6 text-yellow-400" />
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="py-6">
          <div className="text-center mb-6">
            <p className="text-gray-400">
              恭喜获得 <span className="text-purple-400">{totalCards}</span> 张卡牌
            </p>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
            {results.map((card, index) => (
              <motion.div
                key={card.type}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.1, type: 'spring' }}
                className="relative"
              >
                <div className={`bg-gradient-to-br ${card.type === 'red_packet'
                  ? 'from-red-500/20 to-orange-500/20 border-red-500/50'
                  : 'from-gray-800 to-gray-900 border-gray-700'
                  } rounded-xl p-4 border`}>
                  {/* Card Image */}
                  <div className="aspect-[3/4] flex items-center justify-center text-lg mb-2 bg-gradient-to-br from-gray-900/50 to-gray-950/50 rounded-lg">
                    <span className="text-gray-400">{card.name}</span>
                  </div>

                  {/* Card Info */}
                  <div className="text-center space-y-1">
                    <div className="text-xs">{card.name}</div>
                    <div className="text-xs text-gray-400">x {card.count}</div>
                  </div>

                  {/* Count Badge */}
                  <div className={`absolute top-2 right-2 w-6 h-6 ${card.type === 'red_packet' ? 'bg-red-600' : 'bg-purple-600'
                    } rounded-full flex items-center justify-center text-xs shadow-lg`}>
                    {card.count}
                  </div>

                  {/* Red Packet Special Effect */}
                  {card.type === 'red_packet' && (
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-xl blur-xl -z-10 animate-pulse" />
                  )}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Special Messages */}
          {results.some(r => r.type === 'red_packet') && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/50 rounded-lg p-4 mb-4 text-center"
            >
              <p className="text-red-400">恭喜！您抽中了红包卡！即将获得红包奖励！</p>
            </motion.div>
          )}

          {/* Close Button */}
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            确定
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}