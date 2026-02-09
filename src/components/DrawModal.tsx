import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CardType } from '../App';
import { X } from 'lucide-react';
import { playSpinSound, playWinSound } from '../utils/soundEffects';
import supremeImg from 'figma:asset/6651fc0c90390d131f74b014994be51852a71a59.png';
import redPacketImg from 'figma:asset/d19a2f3c21c67ce076c2a24d0e2058e33ea5a8a2.png';
import luckImg from 'figma:asset/876972c509561235a14234ebaeb8a04d4c2f28ae.png';
import wealthImg from 'figma:asset/3e8ed8b84fe45c8898c2deea5cd3d6495bd61c69.png';
import careerImg from 'figma:asset/3c55e552361dae32ba73beaddae94fa841d4caaa.png';
import loveImg from 'figma:asset/3e75ed55595146a6ff7fa1a65e6413528470f471.png';

interface DrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  results: CardType[];
}

const cardImages: Record<string, string> = {
  supreme: supremeImg,
  red_packet: redPacketImg,
  luck: luckImg,
  wealth: wealthImg,
  career: careerImg,
  love: loveImg,
};

const cardColors: Record<string, { bg: string, text: string, border: string }> = {
  supreme: { bg: '#ff000e', text: '#ffe8a4', border: '#ff3653' },
  red_packet: { bg: '#ffe9a3', text: '#ff9752', border: '#ffdc97' },
  luck: { bg: '#ffe9a3', text: '#ff9752', border: '#ffdc97' },
  career: { bg: '#ffe9a3', text: '#ff9752', border: '#ffdc97' },
  love: { bg: '#ffe9a3', text: '#ff9752', border: '#ffdc97' },
  wealth: { bg: '#ffe9a3', text: '#ff9752', border: '#ffdc97' },
};

const cardNames: Record<string, string> = {
  supreme: '至尊马',
  red_packet: '红包马',
  luck: '好运马',
  career: '事业马',
  love: '爱情马',
  wealth: '发财马',
};

const spinCards: CardType[] = ['love', 'career', 'luck', 'wealth', 'red_packet'];

export function DrawModal({ isOpen, onClose, results }: DrawModalProps) {
  const [stage, setStage] = useState<'opening' | 'revealed'>('opening');
  const [spinIndex, setSpinIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setStage('opening');
      // Extend time for the spin animation
      const timer = setTimeout(() => {
        setStage('revealed');
        playWinSound();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Spin effect
  useEffect(() => {
    if (isOpen && stage === 'opening') {
      const interval = setInterval(() => {
        setSpinIndex(prev => (prev + 1) % spinCards.length);
        playSpinSound();
      }, 80); // Fast spin
      return () => clearInterval(interval);
    }
  }, [isOpen, stage]);

  const uniqueResults = React.useMemo(() => {
    const counts: Record<string, number> = {};
    results.forEach(type => {
      counts[type] = (counts[type] || 0) + 1;
    });
    return Object.entries(counts).map(([type, count]) => ({
      type: type as CardType,
      count
    }));
  }, [results]);

  const currentSpinCard = spinCards[spinIndex];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={stage === 'revealed' ? onClose : undefined}
          />
          
          <div className="relative z-10 w-full max-w-sm pointer-events-none">
            {stage === 'opening' ? (
              <motion.div 
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.1, 1], opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="flex flex-col items-center justify-center relative"
              >
                <div className="relative">
                  {results.length > 1 && (
                    <>
                      <motion.div 
                        initial={{ rotate: 0, x: 0 }}
                        animate={{ rotate: -15, x: -30 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-0 left-0 w-40 h-52 bg-[#8b0000] rounded-2xl border-2 border-[#ffdd93]/30 shadow-lg blur-[1px]" 
                      />
                      <motion.div 
                        initial={{ rotate: 0, x: 0 }}
                        animate={{ rotate: 15, x: 30 }}
                        transition={{ duration: 0.5 }}
                        className="absolute top-0 left-0 w-40 h-52 bg-[#8b0000] rounded-2xl border-2 border-[#ffdd93]/30 shadow-lg blur-[1px]" 
                      />
                    </>
                  )}
                  
                  {/* Spinning Card */}
                  <div className="w-40 h-auto flex items-center justify-center relative z-10">
                     <motion.img
                        src={cardImages[currentSpinCard]}
                        alt="spinning"
                        className="w-full h-full object-cover drop-shadow-2xl"
                        initial={false}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                     />
                  </div>
                </div>
                
                <div className="mt-8 text-white text-2xl font-black tracking-widest animate-bounce drop-shadow-md">
                  抽卡中
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#fff9f0] rounded-2xl p-6 text-center shadow-2xl pointer-events-auto border border-white/50 relative overflow-hidden"
              >
                {/* Background Pattern */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-[#ffaa00]/10 to-transparent"></div>
                
                <h3 className="text-[#8b0000] text-3xl font-black mb-6 relative z-10 tracking-wide">恭喜获得</h3>
                
                <div className={`${uniqueResults.length === 1 ? 'flex justify-center' : 'grid grid-cols-3'} gap-4 mb-8 max-h-[60vh] overflow-y-auto p-2 relative z-10`}>
                  {uniqueResults.map(({ type, count }, idx) => {
                    const style = cardColors[type] || cardColors.luck;
                    const imageSrc = cardImages[type];
                    
                    if (imageSrc) {
                      return (
                        <motion.div 
                          key={type}
                          initial={{ scale: 0, rotate: -180 }}
                          animate={{ scale: 1, rotate: 0 }}
                          transition={{ delay: idx * 0.1, type: "spring", stiffness: 200, damping: 20 }}
                          className={`${uniqueResults.length === 1 ? 'w-48' : 'w-full'}`}
                        >
                          <div className="relative group">
                            <div className="absolute inset-0 bg-[#ffd700] blur-xl opacity-0 group-hover:opacity-40 transition-opacity rounded-full"></div>
                            <img src={imageSrc} alt={cardNames[type]} className="w-full h-auto drop-shadow-xl relative z-10" />
                            
                            {count > 1 && (
                              <div className="absolute -top-2 -right-2 z-20 w-8 h-8 rounded-full bg-[#ff000e] border-2 border-[#ffdd93] flex items-center justify-center shadow-lg animate-in zoom-in duration-300">
                                <span className="text-[#ffdd93] font-black text-xs">x{count}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      );
                    }

                    return (
                      <motion.div 
                        key={type}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: idx * 0.1, type: "spring" }}
                        className={`aspect-[3/4] ${uniqueResults.length === 1 ? 'w-48' : 'w-full'} rounded-2xl border-2 flex items-center justify-center shadow-lg relative group overflow-hidden`}
                        style={{ backgroundColor: style.bg, borderColor: style.border }}
                      >
                         <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-50"></div>
                         <span 
                           className="text-xl font-black writing-vertical-rl text-center relative z-10"
                           style={{ color: style.text, writingMode: 'vertical-rl' }}
                         >
                           {cardNames[type]}
                         </span>
                         {count > 1 && (
                            <div className="absolute top-2 right-2 z-20 w-6 h-6 rounded-full bg-[#ff000e] border border-[#ffdd93] flex items-center justify-center shadow-md">
                              <span className="text-[#ffdd93] font-black text-[10px]">x{count}</span>
                            </div>
                         )}
                      </motion.div>
                    );
                  })}
                </div>

                <button 
                  onClick={onClose}
                  className="w-full bg-gradient-to-r from-[#ff000e] to-[#c4000b] hover:from-[#ff1a27] hover:to-[#d6000c] text-[#fff9f0] text-xl font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-all relative z-10 overflow-hidden group"
                >
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine pointer-events-none" />
                  收下奖励
                </button>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
