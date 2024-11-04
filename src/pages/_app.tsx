import "@/styles/globals.css";
import "@rainbow-me/rainbowkit/styles.css";
import { RainbowKitProvider, darkTheme, connectorsForWallets } from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  walletConnectWallet,
  rabbyWallet,
  zerionWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { createConfig, http, WagmiProvider } from "wagmi";
import { sei } from "wagmi/chains";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import type { AppProps } from "next/app";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";

// Configure wallet connectors
const connectors = connectorsForWallets(
  [
    {
      groupName: "Recommended",
      wallets: [
        metaMaskWallet,
        rabbyWallet,
        zerionWallet,
      ],
    },
    {
      groupName: "Other",
      wallets: [walletConnectWallet],
    },
  ],
  {
    appName: "Sei Example dApp",
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "1337420",
  }
);

// Create wagmi config
const config = createConfig({
  chains: [sei],
  connectors,
  transports: {
    [sei.id]: http(),
  },
});

// Create React Query client
const queryClient = new QueryClient();

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={darkTheme()}>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
            <Component {...pageProps} />
            <Toaster />
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}