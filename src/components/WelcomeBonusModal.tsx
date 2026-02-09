import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface WelcomeBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDraw: () => void;
  freeDraws: number;
}

export function WelcomeBonusModal({ isOpen, onClose, onDraw, freeDraws }: WelcomeBonusModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#5c0000] to-[#2a0a0a] rounded-3xl border border-[#FAE6B1]/30 p-6 shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden text-center">
        
        {/* Background Effects */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
           <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[60%] bg-[#FAE6B1]/10 blur-[60px] rounded-full" />
           <div className="absolute bottom-[-20%] right-[-20%] w-[140%] h-[60%] bg-[#ff0000]/10 blur-[60px] rounded-full" />
        </div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white transition-colors z-20"
        >
          <X size={20} />
        </button>

        <div className="relative z-10 pt-4 pb-2 flex flex-col items-center">
          
          {/* Icon/Graphic */}
          <div className="w-20 h-20 mb-6 rounded-full bg-gradient-to-br from-[#FAE6B1] to-[#C6A66D] p-[2px] shadow-[0_0_30px_rgba(250,230,177,0.3)] animate-[bounce_3s_infinite]">
            <div className="w-full h-full rounded-full bg-[#5c0000] flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-45 animate-[shine_2s_infinite]" />
               <Sparkles className="w-10 h-10 text-[#FAE6B1]" />
            </div>
          </div>

          <h3 className="text-[#FAE6B1] text-xl font-bold mb-2">钱包连接成功</h3>
          
          <div className="text-[#fff9f0]/80 text-sm mb-6">
            <p>获得新手福利</p>
            <div className="flex items-baseline justify-center gap-2 mt-2">
                <span className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-[#fff] to-[#FAE6B1] drop-shadow-lg">{freeDraws}</span>
                <span className="text-lg font-medium text-[#FAE6B1]">次免费抽卡机会</span>
            </div>
          </div>

          <button
            onClick={() => {
                onDraw();
                onClose();
            }}
            className="w-full py-3.5 bg-gradient-to-r from-[#FAE6B1] to-[#C6A66D] hover:from-[#fff] hover:to-[#FAE6B1] text-[#5c0000] font-black rounded-xl text-lg shadow-[0_4px_20px_rgba(250,230,177,0.3)] hover:shadow-[0_6px_25px_rgba(250,230,177,0.5)] transform hover:-translate-y-0.5 active:scale-95 transition-all duration-200 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12" />
            <span className="relative z-10 flex items-center justify-center gap-2">
               立即抽卡
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
