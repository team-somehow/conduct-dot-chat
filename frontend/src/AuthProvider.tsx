import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { http } from "viem";
import { hederaTestnet, polygonAmoy } from "viem/chains";
import { createConfig, WagmiProvider } from "wagmi";

const config = createConfig({
  chains: [polygonAmoy, hederaTestnet],
  multiInjectedProviderDiscovery: false,
  transports: {
    [polygonAmoy.id]: http(),
    [hederaTestnet.id]: http(),
  },
});

const queryClient = new QueryClient();

export default function App() {
  return (
    <DynamicContextProvider
      settings={{
        environmentId: "98669622-de8f-4b3b-8aaf-e61ec95f5e23",
        walletConnectors: [EthereumWalletConnectors],
      }}
    >
      <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
          <DynamicWagmiConnector>
            <DynamicWidget />
          </DynamicWagmiConnector>
        </QueryClientProvider>
      </WagmiProvider>
    </DynamicContextProvider>
  );
}
