import React from 'react';

interface GameActionsProps {
  onFreeDraw: () => void;
  onSynthesize: () => void;
  freeDraws: number;
  canSynthesize: boolean;
}

export function GameActions({ onFreeDraw, onSynthesize, freeDraws, canSynthesize }: GameActionsProps) {
  const canFreeDraw = freeDraws > 0;

  return (
    <div className="flex justify-between gap-4 mt-8 px-2">
      {/* Free Draw Button */}
      <button 
        onClick={onFreeDraw}
        disabled={!canFreeDraw}
        className={`group relative flex-1 bg-gradient-to-b from-[#ff2e3b] to-[#c4000b] hover:from-[#ff4d58] hover:to-[#d6000c] active:scale-95 rounded-2xl h-[56px] flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(196,0,11,0.3)] transition-all overflow-hidden border border-white/20 ${
          canFreeDraw ? "" : "opacity-60 cursor-not-allowed active:scale-100"
        }`}
      >
        {/* Shine Effect */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine pointer-events-none z-10" />
        
        <span className="text-[#fff9f0] text-lg font-black drop-shadow-sm relative z-30 group-hover:scale-105 transition-transform tracking-wide leading-none mb-0.5">免费抽卡</span>
        <span className="text-white/80 text-[10px] font-bold relative z-30 bg-black/10 px-2 py-0.5 rounded-full leading-tight backdrop-blur-sm">剩余 {freeDraws} 次</span>
      </button>

      {/* Synthesize Button */}
      <button 
        onClick={onSynthesize}
        disabled={!canSynthesize}
        className={`group relative flex-1 rounded-2xl h-[56px] flex items-center justify-center shadow-[0_8px_20px_rgba(198,166,109,0.3)] transition-all overflow-hidden border border-white/40 active:scale-95 bg-gradient-to-b from-[#FAE6B1] to-[#C6A66D] text-[#5c0000] ${
          canSynthesize
            ? "hover:from-[#fdf1cd] hover:to-[#dcb97a]"
            : "opacity-60 cursor-not-allowed active:scale-100"
        }`}
      >
        {/* Shine Effect (Gold variant) */}
        <div className={`absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full animate-shine pointer-events-none z-10 ${canSynthesize ? "" : "opacity-20"}`} />

        <span className={`text-lg font-black relative z-20 group-hover:scale-105 transition-transform tracking-wide ${canSynthesize ? "drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]" : ""}`}>
          合成至尊马
        </span>
      </button>
    </div>
  );
}
