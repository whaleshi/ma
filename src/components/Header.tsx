import React, { useState, useEffect, useRef } from 'react';
import imgTelegram from "figma:asset/f8f3a7fbd30e24e34e16d2d4f0cd39abfea587c9.png";
import imgTwitter from "figma:asset/281ec299e35f4966f2b13d898280febb32908e92.png";
import logoImg from "figma:asset/40ece236ac37c3db3839ddfae9a410bea00177cf.png";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { toast } from "sonner";
import { useAccount, useDisconnect } from "wagmi";
import { ChevronDown, Gift, LogOut, History, Menu } from 'lucide-react';

interface HeaderProps {
  onOpenHistory: () => void;
  onOpenRewards: () => void;
  onOpenMobileMenu: () => void;
}

export function Header({ onOpenHistory, onOpenRewards, onOpenMobileMenu }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const walletAddress = address ?? null;
  const shortAddress = walletAddress ? `${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}` : "";

  return (
    <div className="flex justify-between items-center px-4 py-4 relative z-20">
      <div className="flex items-center gap-3">
        <div className="w-[42px] h-[42px] md:w-[46px] md:h-[46px] flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 shadow-inner backdrop-blur-sm overflow-hidden">
          <img src={logoImg} alt="Horse 发生" className="w-full h-full object-cover" />
        </div>
        <span className={`text-transparent bg-clip-text bg-gradient-to-r from-[#FAE6B1] to-[#fff] font-black text-xl md:text-2xl drop-shadow-sm tracking-wide ${isConnected ? 'hidden md:block' : ''}`}>Horse 发生</span>
      </div>

      <div className="flex items-center gap-3">
        {/* Desktop Social Icons & History */}
        <div className="hidden md:flex items-center gap-3">
          <div className="flex gap-2">
            <a href="https://t.me/GoodhorseBNB" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-2xl bg-black/20 flex items-center justify-center hover:bg-black/30 transition-all border border-white/10 hover:border-[#FAE6B1]/50 shadow-lg backdrop-blur-md group active:scale-95">
              <div className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity">
                <ImageWithFallback src={imgTelegram} alt="Telegram" className="w-full h-full object-contain filter brightness-0 invert" />
              </div>
            </a>
            <a href="https://x.com/GoodhorseBNB" target="_blank" rel="noopener noreferrer" className="w-11 h-11 rounded-2xl bg-black/20 flex items-center justify-center hover:bg-black/30 transition-all border border-white/10 hover:border-[#FAE6B1]/50 shadow-lg backdrop-blur-md group active:scale-95">
              <div className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity">
                <ImageWithFallback src={imgTwitter} alt="Twitter" className="w-full h-full object-contain filter brightness-0 invert" />
              </div>
            </a>
          </div>

          {isConnected && (
            <button
              onClick={onOpenHistory}
              className="w-11 h-11 rounded-2xl bg-black/20 flex items-center justify-center hover:bg-black/30 transition-all border border-white/10 hover:border-[#FAE6B1]/50 text-[#FAE6B1] shadow-lg backdrop-blur-md active:scale-95 group"
              title="历史记录"
            >
              <History size={20} className="opacity-80 group-hover:opacity-100" />
            </button>
          )}
        </div>

        {/* Wallet Connect Button & Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <ConnectButton.Custom>
            {({ account, chain, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;
              const displayName = account?.displayName ?? shortAddress;

              return (
                <>
                  <button
                    onClick={() => {
                      if (connected) {
                        setIsDropdownOpen((prev) => !prev);
                        return;
                      }
                      setIsDropdownOpen(false);
                      openConnectModal();
                    }}
                    disabled={!ready}
                    className="group relative bg-gradient-to-b from-[#FAE6B1] to-[#C6A66D] hover:from-[#fdf1cd] hover:to-[#dcb97a] text-[#5c0000] text-sm md:text-base font-black px-4 md:px-6 py-2.5 rounded-2xl border border-white/20 shadow-[0_0_20px_rgba(198,166,109,0.2)] transition-all active:scale-95 overflow-hidden flex items-center gap-2 disabled:cursor-not-allowed"
                  >
                    <div className="absolute top-0 left-0 w-full h-[1px] bg-white/60"></div>
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-shine pointer-events-none" />
                    <span className="relative z-10 drop-shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                      {connected ? displayName : '连接钱包'}
                    </span>
                    {connected && (
                      <ChevronDown size={16} className={`relative z-10 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    )}
                  </button>

                  {/* Wallet Dropdown Menu */}
                  {isDropdownOpen && connected && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-[#2a0a0a] border border-[#FAE6B1]/20 rounded-xl shadow-2xl backdrop-blur-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-1">
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            onOpenRewards();
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-[#fff9f0] hover:bg-white/10 rounded-lg transition-colors text-sm font-bold group"
                        >
                          <Gift size={16} className="text-[#FAE6B1] group-hover:scale-110 transition-transform" />
                          我的奖励
                        </button>
                        <div className="h-[1px] bg-white/5 my-1 mx-2" />
                        <button
                          onClick={() => {
                            setIsDropdownOpen(false);
                            disconnect();
                            toast.success("钱包已断开连接");
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 text-[#ff4d4d] hover:bg-[#ff4d4d]/10 rounded-lg transition-colors text-sm font-bold group"
                        >
                          <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                          断开连接
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            }}
          </ConnectButton.Custom>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={onOpenMobileMenu}
          className="md:hidden w-11 h-11 rounded-2xl bg-black/20 flex items-center justify-center hover:bg-black/30 transition-all border border-white/10 text-[#FAE6B1] shadow-lg backdrop-blur-md active:scale-95"
        >
          <Menu size={24} />
        </button>
      </div>
    </div>
  );
}
