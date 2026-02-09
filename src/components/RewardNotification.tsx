import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles } from 'lucide-react';
import { Button } from './ui/button';

interface RewardNotificationProps {
  show: boolean;
  type: 'redpacket' | 'ultimate' | null;
  amount: number;
  onClose: () => void;
}

export function RewardNotification({ show, type, amount, onClose }: RewardNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!type) return null;

  const config = type === 'redpacket' 
    ? {
        title: '恭喜中奖！',
        subtitle: '红包池奖励',
        gradient: 'from-red-500 to-orange-500',
        bgGradient: 'from-red-900/90 to-orange-900/90',
      }
    : {
        title: '终极大奖！',
        subtitle: '终极奖池分红',
        gradient: 'from-purple-500 to-blue-500',
        bgGradient: 'from-purple-900/90 to-blue-900/90',
      };

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Notification Card */}
          <div className="fixed inset-0 flex items-center justify-center z-[101] pointer-events-none">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="pointer-events-auto relative"
            >
              {/* Main Card */}
              <div className={`relative bg-gradient-to-br ${config.bgGradient} backdrop-blur-xl border-2 border-white/20 rounded-3xl p-8 shadow-2xl max-w-md w-full mx-4`}>
                {/* Close Button */}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-white/80 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </Button>

                {/* Icon */}
                <div className="text-center mb-6">
                  <h2 className="text-3xl mb-2">{config.title}</h2>
                  <p className="text-white/80 text-sm">{config.subtitle}</p>
                </div>

                {/* Amount Display */}
                <div className="bg-black/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
                  <div className="text-center">
                    <div className="text-sm text-white/60 mb-2">您获得</div>
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.3, type: 'spring' }}
                      className="text-5xl mb-2"
                    >
                      {amount.toFixed(2)}
                    </motion.div>
                    <div className="text-xl text-white/80">USDT</div>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="flex items-center justify-center gap-2 text-white/60 text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>奖励已自动发放到您的钱包</span>
                  <Sparkles className="w-4 h-4" />
                </div>

                {/* Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-3xl blur-3xl -z-10 opacity-50`} />
              </div>

              {/* Confetti Effect */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(30)].map((_, i) => (
                  <motion.div
                    key={i}
                    className={`absolute w-3 h-3 bg-gradient-to-br ${config.gradient} rounded-full`}
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      x: (Math.random() - 0.5) * 400,
                      y: (Math.random() - 0.5) * 400,
                      opacity: [0, 1, 0],
                    }}
                    transition={{
                      duration: 1.5,
                      delay: i * 0.02,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}