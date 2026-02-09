import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { playSynthesisSound } from '../utils/soundEffects';
import supremeImg from 'figma:asset/6651fc0c90390d131f74b014994be51852a71a59.png';
import luckImg from 'figma:asset/876972c509561235a14234ebaeb8a04d4c2f28ae.png';
import wealthImg from 'figma:asset/3e8ed8b84fe45c8898c2deea5cd3d6495bd61c69.png';
import careerImg from 'figma:asset/3c55e552361dae32ba73beaddae94fa841d4caaa.png';
import loveImg from 'figma:asset/3e75ed55595146a6ff7fa1a65e6413528470f471.png';

interface SynthesisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SynthesisModal({ isOpen, onClose }: SynthesisModalProps) {
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowResult(false);
      playSynthesisSound();
      // 动画总时长控制：1.8秒后切换到结果展示
      const timer = setTimeout(() => {
        setShowResult(true);
      }, 1800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const cards = [
    { img: loveImg, rotate: -15, x: -80, y: -80 },
    { img: careerImg, rotate: 15, x: 80, y: -80 },
    { img: luckImg, rotate: -15, x: -80, y: 80 },
    { img: wealthImg, rotate: 15, x: 80, y: 80 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-xl"
            onClick={showResult ? onClose : undefined}
          />
          
          <div className="relative z-10 w-full max-w-sm h-[500px] flex items-center justify-center">
            
            {/* Merging Animation Layer */}
            {/* 始终渲染，通过 opacity 控制显隐，避免 DOM 卸载造成的卡顿 */}
            <motion.div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              animate={{ opacity: showResult ? 0 : 1 }}
              transition={{ duration: 0.4, delay: showResult ? 0.05 : 0 }}
            >
               {/* Central Energy Core */}
               <motion.div
                 initial={{ scale: 0, opacity: 0 }}
                 animate={{ 
                   scale: [0.5, 1.2, 0], 
                   opacity: [0, 0.8, 0]
                 }}
                 transition={{ duration: 1.8, times: [0, 0.6, 1], ease: "easeInOut" }}
                 className="absolute w-40 h-40 rounded-full bg-[#ff000e] blur-3xl z-0"
               />
               
               {/* Flying Cards */}
               {cards.map((card, index) => (
                 <motion.div
                   key={index}
                   initial={{ 
                     x: card.x * 3, 
                     y: card.y * 3, 
                     opacity: 0, 
                     scale: 0.5,
                     rotate: card.rotate 
                   }}
                   animate={{
                     x: 0,
                     y: 0,
                     opacity: [0, 1, 1, 0],
                     scale: [1, 1, 0.1],
                     rotate: [card.rotate, card.rotate, 360]
                   }}
                   transition={{ 
                     duration: 1.6,
                     times: [0, 0.2, 0.8, 1],
                     ease: "anticipate"
                   }}
                   className="absolute w-20 h-28 z-10"
                 >
                   <img src={card.img} className="w-full h-full object-cover drop-shadow-xl" alt="" />
                 </motion.div>
               ))}
            </motion.div>

            {/* Result Layer */}
            <motion.div 
              className="w-full relative z-20"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ 
                scale: showResult ? 1 : 0.8, 
                opacity: showResult ? 1 : 0 
              }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 25,
                delay: 0 
              }}
            >
              {/* Only render content if result should be shown (or is transitioning) to save resources initially */}
              <div className="bg-gradient-to-b from-[#ff000e] to-[#8b0000] p-1 rounded-2xl shadow-[0_0_60px_rgba(255,46,59,0.4)]">
                <div className="bg-[#fff9f0] rounded-xl p-6 text-center overflow-hidden relative border border-white/20">
                    
                    {/* Background Rays - Simple CSS Animation */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200%] h-[200%] bg-[conic-gradient(from_0deg,transparent_0deg,#ffd700_20deg,transparent_40deg,transparent_360deg)] animate-[spin_10s_linear_infinite] opacity-20 pointer-events-none"></div>

                    <div className="relative z-10">
                      <h3 className="text-[#8b0000] text-3xl font-black mb-2 drop-shadow-sm tracking-wide">
                        合成成功！
                      </h3>
                      <p className="text-[#8b0000]/70 text-sm mb-8 font-bold">
                        恭喜获得至尊大奖资格
                      </p>

                      <div className="flex justify-center mb-10">
                        <motion.div 
                          initial={{ scale: 0.5 }}
                          animate={{ scale: showResult ? 1 : 0.5 }}
                          transition={{ type: "spring", bounce: 0.5 }}
                          className="w-48 relative shadow-2xl"
                        >
                            <img src={supremeImg} alt="至尊马" className="w-full h-auto drop-shadow-lg" />
                        </motion.div>
                      </div>

                      <button 
                        onClick={onClose}
                        className="w-full bg-gradient-to-r from-[#ff000e] to-[#c4000b] text-[#fff9f0] text-lg font-black py-4 rounded-2xl shadow-lg active:scale-95 transition-all relative overflow-hidden group"
                      >
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-shine pointer-events-none" />
                        收入囊中
                      </button>
                    </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
