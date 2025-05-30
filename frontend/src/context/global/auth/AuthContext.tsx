import { auth, googleProvider } from "@/config/firebase";
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { DynamicContextProvider } from "@dynamic-labs/sdk-react-core";
import { DynamicWagmiConnector } from "@dynamic-labs/wagmi-connector";
import { onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import {
  createContext,
  JSX,
  PropsWithChildren,
  useEffect,
  useState,
} from "react";
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
interface User {}
interface ContextValueType {
  user: User | null;
  authLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<ContextValueType>(
  {} as ContextValueType
);

export const AuthProvider = (
  props: PropsWithChildren<unknown>
): JSX.Element => {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<void> => {
    setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Signed in with Google:", result.user);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setAuthLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      console.log("User signed out");
      // optional delay to avoid flicker on login page
      setTimeout(() => {
        window.location.href = "/login";
      }, 2000);
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, authLoading, signInWithGoogle, logout }}
    >
      <DynamicContextProvider
        settings={{
          environmentId: "98669622-de8f-4b3b-8aaf-e61ec95f5e23",
          walletConnectors: [EthereumWalletConnectors],
        }}
      >
        <WagmiProvider config={config}>
          <DynamicWagmiConnector>{props.children}</DynamicWagmiConnector>
        </WagmiProvider>
      </DynamicContextProvider>
    </AuthContext.Provider>
  );
};

export const AuthConsumer = AuthContext.Consumer;
