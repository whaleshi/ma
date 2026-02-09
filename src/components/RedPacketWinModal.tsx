import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy } from 'lucide-react';
import redPacketImg from 'figma:asset/d19a2f3c21c67ce076c2a24d0e2058e33ea5a8a2.png';

interface RedPacketWinModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: string;
  isLoading?: boolean;
  isClaiming?: boolean;
  canClaim?: boolean;
  onClaim: () => void;
}

export function RedPacketWinModal({
  isOpen,
  onClose,
  amount,
  isLoading = false,
  isClaiming = false,
  canClaim = true,
  onClaim,
}: RedPacketWinModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 50 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="relative z-10 w-full max-w-sm bg-gradient-to-b from-[#d92323] to-[#8b0000] rounded-3xl p-1 shadow-2xl overflow-hidden"
          >
            <div className="bg-[#fff9f0] rounded-[22px] overflow-hidden relative">
              {/* Close Button */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors z-20"
              >
                <X size={20} className="text-[#8b0000]/70" />
              </button>

              {/* Header / Background */}
              <div className="h-32 bg-gradient-to-b from-[#ffaa00]/20 to-transparent flex items-center justify-center pt-8">
                 <div className="absolute top-0 inset-x-0 h-px bg-white/50"></div>
              </div>

              <div className="px-6 pb-8 flex flex-col items-center -mt-16 relative z-10">
                {/* Image */}
                <div className="w-32 h-32 relative mb-4">
                   <div className="absolute inset-0 bg-[#ffd700] rounded-full blur-2xl opacity-40 animate-pulse"></div>
                   <img src={redPacketImg} alt="Red Packet" className="w-full h-full object-contain drop-shadow-2xl relative z-10" />
                </div>

                <h2 className="text-2xl font-black text-[#8b0000] mb-2 tracking-wide text-center">
                  恭喜你获得<br/>红包大奖
                </h2>

                <div className="bg-[#fff4d6] border border-[#fae6b1] rounded-2xl p-6 w-full mb-6 text-center shadow-inner">
                  <div className="text-[#8b0000]/60 text-xs font-bold mb-1 tracking-widest uppercase">
                    红包金额
                  </div>
                  <div className="text-4xl font-black text-[#ff000e] flex items-center justify-center gap-2">
                    <span className="text-xl mt-1">BNB</span>
                    <span>{isLoading ? '--' : amount}</span>
                  </div>
                </div>

                <button 
                  onClick={onClaim}
                  disabled={isLoading || isClaiming || !canClaim}
                  className="w-full bg-gradient-to-r from-[#ff000e] to-[#c4000b] hover:from-[#ff1a27] hover:to-[#d6000c] text-[#fff9f0] text-lg font-bold py-4 rounded-xl shadow-[0_4px_14px_rgba(255,0,14,0.4)] active:scale-95 transition-all relative overflow-hidden group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shine pointer-events-none" />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <Trophy size={20} />
                    {isLoading ? '加载中...' : isClaiming ? '领取中...' : canClaim ? '立即领取' : '已领取'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>

          {/* Confetti */}
          <div className="absolute inset-0 pointer-events-none z-[111]">
             {/* We can add confetti logic here if needed, or rely on App level confetti */}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
