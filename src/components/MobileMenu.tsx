import React from 'react';
import { X, History } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import imgTelegram from "figma:asset/f8f3a7fbd30e24e34e16d2d4f0cd39abfea587c9.png";
import imgTwitter from "figma:asset/281ec299e35f4966f2b13d898280febb32908e92.png";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHistory: () => void;
  isWalletConnected: boolean;
}

export function MobileMenu({ isOpen, onClose, onOpenHistory, isWalletConnected }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] animate-in fade-in duration-200"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-[280px] bg-[#1a0505] border-l border-[#FAE6B1]/20 z-[1000] shadow-[0_0_50px_rgba(0,0,0,0.5)] p-6 animate-in slide-in-from-right duration-300 flex flex-col">
        <div className="flex justify-between items-center mb-8 border-b border-[#FAE6B1]/10 pb-6">
          <span className="text-xl font-black text-[#FAE6B1] tracking-wide">Horse 发生</span>
          <button 
            onClick={onClose}
            className="p-2 bg-white/5 rounded-full hover:bg-white/10 text-[#FAE6B1] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          {isWalletConnected && (
            <>
              <button 
                onClick={() => {
                  onOpenHistory();
                  onClose();
                }}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-[#FAE6B1]/20 to-transparent rounded-2xl border border-[#FAE6B1]/20 hover:from-[#FAE6B1]/30 transition-all group shadow-sm"
              >
                <div className="w-10 h-10 rounded-xl bg-[#FAE6B1] flex items-center justify-center text-[#5c0000] group-hover:scale-110 transition-transform shadow-inner">
                  <History size={20} />
                </div>
                <span className="text-[#FAE6B1] font-black text-lg tracking-wide">历史记录</span>
              </button>

              <div className="h-[1px] bg-gradient-to-r from-transparent via-[#FAE6B1]/20 to-transparent my-4" />
            </>
          )}

          <a href="https://t.me/GoodhorseFun" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-[#FAE6B1]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ImageWithFallback src={imgTelegram} alt="Telegram" className="w-5 h-5 object-contain filter brightness-0 invert" />
            </div>
            <span className="text-[#fff9f0] font-bold text-lg">Telegram</span>
          </a>

          <a href="https://x.com/GoodhorseFun" target="_blank" rel="noopener noreferrer" className="w-full flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-[#FAE6B1]/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ImageWithFallback src={imgTwitter} alt="Twitter" className="w-5 h-5 object-contain filter brightness-0 invert" />
            </div>
            <span className="text-[#fff9f0] font-bold text-lg">X (Twitter)</span>
          </a>
        </div>

        <div className="mt-auto pt-6 border-t border-[#FAE6B1]/10 text-center">
           <p className="text-[#FAE6B1]/40 text-xs font-medium">© 2026 Horse 发生</p>
        </div>
      </div>
    </>
  );
}
