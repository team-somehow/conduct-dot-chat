import {
  NotificationProvider,
  TransactionPopupProvider,
} from "@blockscout/app-sdk";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { hederaTestnet, polygonAmoy } from "viem/chains";
import { createConfig, http, WagmiProvider } from "wagmi";
import { router } from "./app/router";
import { ThemeProvider } from "./context/global/theme/ThemeContext";

const config = createConfig({
  chains: [polygonAmoy, hederaTestnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [polygonAmoy.id]: http(),
    [hederaTestnet.id]: http(),
  },
});

// TODO(App):
// 1. Add global error boundary
// 2. Implement theme provider
// 3. Add loading states
// 4. Create global toast notifications
// 5. Add authentication provider
// END TODO

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <DynamicContextProvider
        settings={{
          environmentId: "98669622-de8f-4b3b-8aaf-e61ec95f5e23",
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        <WagmiProvider config={config}>
          <DynamicWagmiConnector>
            <NotificationProvider>
              <TransactionPopupProvider>
                <ThemeProvider>
                  <RouterProvider router={router} />
                  <Toaster position="bottom-right" richColors closeButton />
                </ThemeProvider>
              </TransactionPopupProvider>
            </NotificationProvider>
          </DynamicWagmiConnector>
        </WagmiProvider>
      </DynamicContextProvider>
    </QueryClientProvider>
  );
};

export default App;
