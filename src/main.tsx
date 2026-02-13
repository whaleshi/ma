
import "@rainbow-me/rainbowkit/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { getDefaultConfig, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { binanceWallet, metaMaskWallet, okxWallet } from "@rainbow-me/rainbowkit/wallets";
import { createRoot } from "react-dom/client";
import { WagmiProvider } from "wagmi";
import App from "./App";
import "./index.css";
import { ReferralProvider } from "./contexts/ReferralContext";
import { CURRENT_CHAIN } from "./config/network";
import supremeImg from 'figma:asset/6651fc0c90390d131f74b014994be51852a71a59.png';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

if (!projectId) {
  throw new Error("Missing VITE_WALLETCONNECT_PROJECT_ID in environment.");
}

const config = getDefaultConfig({
  appName: "Horse 发生",
  projectId,
  chains: [CURRENT_CHAIN],
  wallets: [
    {
      groupName: "推荐钱包",
      wallets: [metaMaskWallet, okxWallet, binanceWallet],
    },
  ],
  ssr: false,
});

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <WagmiProvider config={config}>
    <QueryClientProvider client={queryClient}>
      <RainbowKitProvider
        theme={lightTheme({
          accentColor: "#C6A66D",
          accentColorForeground: "#5c0000",
        })}
      >
        <ReferralProvider>
          {/* <App /> */}
          <div style={{width: '100vw', height: '100vh'}} className="flex items-center justify-center">
            <h1 className="text-4xl md:text-7xl font-black tracking-wider whitespace-nowrap will-change-transform flex items-center justify-center gap-1 md:gap-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAE6B1] via-[#ffffff] to-[#FAE6B1] md:bg-[linear-gradient(90deg,#FAE6B1_0%,#C6A66D_40%,#ffffff_50%,#C6A66D_60%,#FAE6B1_100%)] md:animate-shimmer drop-shadow-[0_2px_10px_rgba(198,166,109,0.3)]">
                集
              </span>
              <span
                className="inline-flex items-center justify-center"
                style={{
                  width: 'clamp(48px, 10vw, 160px)',
                  height: 'clamp(48px, 10vw, 160px)',
                  animation: 'spinY 6s linear infinite',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
              >
                <img src={supremeImg} alt="至尊马" className="h-full w-full object-contain drop-shadow-[0_2px_14px_rgba(198,166,109,0.4)]" />
              </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAE6B1] via-[#ffffff] to-[#FAE6B1] md:bg-[linear-gradient(90deg,#FAE6B1_0%,#C6A66D_40%,#ffffff_50%,#C6A66D_60%,#FAE6B1_100%)] md:animate-shimmer drop-shadow-[0_2px_10px_rgba(198,166,109,0.3)]">
                卡 · 赢奖池
              </span>
            </h1>
          </div>
        </ReferralProvider>
      </RainbowKitProvider>
    </QueryClientProvider>
  </WagmiProvider>
);

