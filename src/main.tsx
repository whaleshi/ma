
  import "@rainbow-me/rainbowkit/styles.css";
  import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
  import { getDefaultConfig, lightTheme, RainbowKitProvider } from "@rainbow-me/rainbowkit";
  import { binanceWallet, metaMaskWallet, okxWallet } from "@rainbow-me/rainbowkit/wallets";
  import { createRoot } from "react-dom/client";
  import { WagmiProvider } from "wagmi";
  import { bscTestnet } from "wagmi/chains";
  import App from "./App.tsx";
  import "./index.css";
  import { ReferralProvider } from "./contexts/ReferralContext";

  const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID;

  if (!projectId) {
    throw new Error("Missing VITE_WALLETCONNECT_PROJECT_ID in environment.");
  }

  const config = getDefaultConfig({
    appName: "Horse 发生",
    projectId,
    chains: [bscTestnet],
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
            <App />
          </ReferralProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
  
