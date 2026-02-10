import React from 'react';

interface DrawFooterProps {
  onDraw: (times: number, cost: number) => void;
  canPaidDraw: boolean;
  singleCost?: string;
  tenCost?: string;
}

export function DrawFooter({ onDraw, canPaidDraw, singleCost = '--', tenCost = '--' }: DrawFooterProps) {
  return (
    <div className="fixed bottom-0 left-0 w-full z-50 px-4 pb-8 pt-6 bg-gradient-to-t from-[#5c0000] via-[#8b0000]/90 to-transparent md:static md:bg-none md:p-0 md:mt-4">
       <div className="max-w-md mx-auto flex gap-4 md:max-w-full">
          <button 
            onClick={() => onDraw(1, 1)}
            disabled={!canPaidDraw}
            className={`group relative flex-1 rounded-2xl h-[56px] flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(139,0,0,0.3)] transition-all overflow-hidden border border-white/10 active:translate-y-1 bg-gradient-to-b from-[#ff2e3b] to-[#c4000b] ${
              canPaidDraw
                ? "hover:from-[#ff4d58] hover:to-[#d6000c]"
                : "opacity-60 cursor-not-allowed active:translate-y-0"
            }`}
          >
             <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30"></div>
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shine pointer-events-none" />
             <span className="text-[#fff9f0] text-lg font-black relative z-10 group-hover:scale-105 transition-transform tracking-wide leading-none mb-0.5">抽 1 次</span>
             <span className="text-white/80 text-[10px] font-bold relative z-10 bg-black/10 px-2 py-0.5 rounded-full leading-tight backdrop-blur-sm">{singleCost} BNB</span>
          </button>

          <button 
            onClick={() => onDraw(10, 10)}
            disabled={!canPaidDraw}
            className={`group relative flex-1 rounded-2xl h-[56px] flex flex-col items-center justify-center shadow-[0_8px_20px_rgba(198,166,109,0.3)] transition-all overflow-hidden border border-white/20 active:translate-y-1 bg-gradient-to-b from-[#FAE6B1] to-[#C6A66D] text-[#5c0000] ${
              canPaidDraw
                ? "hover:from-[#fdf1cd] hover:to-[#dcb97a]"
                : "opacity-60 cursor-not-allowed active:translate-y-0"
            }`}
          >
             <div className="absolute top-0 left-0 w-full h-[1px] bg-white/60"></div>
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shine pointer-events-none" />
             <span className="text-[#5c0000] text-lg font-black relative z-10 group-hover:scale-105 transition-transform tracking-wide leading-none mb-0.5 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">抽 10 次</span>
             <span className="text-[#5c0000]/80 text-[10px] font-bold relative z-10 bg-white/20 px-2 py-0.5 rounded-full leading-tight">{tenCost} BNB</span>
          </button>
       </div>
    </div>
  );
}
