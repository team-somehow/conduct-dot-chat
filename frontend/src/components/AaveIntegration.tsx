import { abi } from "@/abis/AaveInvestor.json";
import { useNotification } from "@blockscout/app-sdk";
import { useDynamicContext } from "@dynamic-labs/sdk-react-core";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpFromLine,
  Check,
  Wallet,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { parseUnits } from "viem";
import { sepolia } from "viem/chains";
import { useAccount, useConfig, useSwitchChain, useWriteContract } from "wagmi";
import { readContract, waitForTransactionReceipt } from "@wagmi/core";
import { atom } from "jotai";

export const transactionHashAtom = atom<string>("");

// ERC20 ABI for approve function
const ERC20_ABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
      {
        name: "_spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
];

interface AaveIntegrationProps {
  onTransactionStart?: () => void;
  onTransactionComplete?: (txHash: string) => void;
}

const AaveIntegration: React.FC<AaveIntegrationProps> = ({
  onTransactionStart,
  onTransactionComplete,
}) => {
  const config = useConfig();
  const { setShowAuthFlow } = useDynamicContext();
  const { address, isConnected, chain } = useAccount();
  const { switchChain } = useSwitchChain();
  const { writeContractAsync } = useWriteContract();
  const { openTxToast } = useNotification();

  const [amount, setAmount] = useState("0.00000001");
  const [storageWarning, setStorageWarning] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedTxHash, setCompletedTxHash] = useState<string>("");

  const setTransactionHash = useSetAtom(transactionHashAtom);

  // Check storage availability on component mount
  useEffect(() => {
    checkStorageAvailability();
  }, []);

  const checkStorageAvailability = () => {
    try {
      const testKey = "storage_test";
      const testValue = "test";
      localStorage.setItem(testKey, testValue);
      localStorage.removeItem(testKey);
      setStorageWarning(false);
    } catch (error) {
      console.warn("Storage availability check failed:", error);
      setStorageWarning(true);
    }
  };

  const clearStorageSpace = () => {
    try {
      // Clear potentially large items
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.includes("dynamic_") ||
            key.includes("wagmi") ||
            key.includes("walletconnect") ||
            key.includes("cache"))
        ) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove ${key}:`, e);
        }
      });

      setStorageWarning(false);
      return true;
    } catch (error) {
      console.error("Failed to clear storage space:", error);
      return false;
    }
  };

  const handleConnect = () => {
    // Check storage before attempting connection
    if (storageWarning) {
      const cleared = clearStorageSpace();
      if (!cleared) {
        alert(
          'Browser storage is full. Please clear your browser data manually:\n\n1. Open DevTools (F12)\n2. Go to Application tab\n3. Click "Clear storage"\n4. Refresh the page'
        );
        return;
      }
    }

    try {
      setShowAuthFlow(true);
    } catch (error) {
      console.error("Connection error:", error);

      // Check if it's a storage quota error
      if (error instanceof Error && error.name === "QuotaExceededError") {
        setStorageWarning(true);
        const cleared = clearStorageSpace();

        if (cleared) {
          // Try again after clearing
          setTimeout(() => {
            try {
              setShowAuthFlow(true);
            } catch (retryError) {
              console.error("Retry failed:", retryError);
              alert(
                "Storage issue persists. Please clear browser data manually."
              );
            }
          }, 100);
        } else {
          alert(
            "Browser storage is full. Please clear your browser data and try again."
          );
        }
      } else {
        alert("Failed to connect wallet. Please try again.");
      }
    }
  };

  const handleDeposit = async () => {
    if (!address || !isConnected) {
      handleConnect();
      return;
    }

    try {
      if (chain?.id !== sepolia.id) {
        switchChain({
          chainId: sepolia.id,
        });
        return;
      }

      console.log("Address & amount & chain:", address, amount, chain?.name);
      onTransactionStart?.();

      // Step 1: Approve LINK tokens
      console.log("Step 1: Approving LINK token...");

      // Check allowance
      const allowance: bigint = (await readContract(config, {
        address: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5",
        abi: ERC20_ABI,
        functionName: "allowance",
        args: [address, "0x20E9e291716580f5248C94F232C91d1D14923cC8"],
        chainId: sepolia.id,
      })) as bigint;

      console.log("Allowance:", allowance);

      if (allowance < parseUnits(amount, 18)) {
        const approvalHash = await writeContractAsync({
          address: "0xf8Fb3713D459D7C1018BD0A49D19b4C44290EBE5", // LINK token
          abi: ERC20_ABI,
          functionName: "approve",
          account: address,
          args: [
            "0x20E9e291716580f5248C94F232C91d1D14923cC8",
            parseUnits(amount, 18),
          ],
          chain: sepolia,
        });

        console.log("Approval transaction sent:", approvalHash);
        openTxToast(sepolia.id.toString(), approvalHash);

        // // Wait for approval transaction to be mined
        alert(
          "Approval transaction sent. Please wait for it to be confirmed before the deposit..."
        );

        setTransactionHash(approvalHash);

        // Wait for approval transaction
        await waitForTransactionReceipt(config, {
          hash: approvalHash,
          chainId: sepolia.id,
        });
      }

      // Step 2: Deposit LINK tokens to Aave
      console.log("Step 2: Depositing LINK tokens to Aave...");
      const depositHash = await writeContractAsync({
        address: "0x20E9e291716580f5248C94F232C91d1D14923cC8", // Aave Investor contract
        abi,
        functionName: "deposit",
        account: address,
        args: [parseUnits(amount, 18)],
        chain: sepolia,
      });

      console.log("Deposit transaction sent:", depositHash);
      if (depositHash) {
        openTxToast(sepolia.id.toString(), depositHash);
      }

      setTransactionHash(depositHash);
      
      // Wait for deposit transaction to be confirmed
      await waitForTransactionReceipt(config, {
        hash: depositHash,
        chainId: sepolia.id,
      });

      console.log("Deposit transaction confirmed:", depositHash);
      
      // Store the real transaction hash and show success
      setCompletedTxHash(depositHash);
      onTransactionComplete?.(depositHash);
      setShowSuccess(true);

    } catch (error) {
      console.error("Transaction error:", error);

      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          alert("Transaction was rejected by user.");
        } else if (error.message.includes("insufficient funds")) {
          alert("Insufficient funds for transaction.");
        } else if (error.message.includes("allowance")) {
          alert(
            "Token allowance error. Please try again and ensure the approval transaction is confirmed first."
          );
        } else {
          alert(`Transaction failed: ${error.message}`);
        }
      } else {
        alert("Transaction failed. Please check your wallet and try again.");
      }
      return;
    }
  };

  const handleWithdraw = async () => {
    if (!address || !isConnected) {
      handleConnect();
      return;
    }

    try {
      onTransactionStart?.();

      const hash = await writeContractAsync({
        address: "0x20E9e291716580f5248C94F232C91d1D14923cC8",
        abi,
        functionName: "withdrawAll",
        account: address,
        args: [],
        chain: sepolia,
      });

      console.log("Withdraw transaction sent:", hash);
      if (hash) {
        openTxToast(sepolia.id.toString(), hash);
      }

      // Wait for withdraw transaction to be confirmed
      await waitForTransactionReceipt(config, {
        hash: hash,
        chainId: sepolia.id,
      });

      console.log("Withdraw transaction confirmed:", hash);
      
      // Store the real transaction hash and show success
      setCompletedTxHash(hash);
      onTransactionComplete?.(hash);
      setShowSuccess(true);

    } catch (error) {
      console.error("Withdraw transaction error:", error);

      if (error instanceof Error) {
        if (error.message.includes("User rejected")) {
          alert("Transaction was rejected by user.");
        } else if (error.message.includes("insufficient funds")) {
          alert("Insufficient funds for transaction.");
        } else {
          alert(`Transaction failed: ${error.message}`);
        }
      } else {
        alert("Transaction failed. Please check your wallet and try again.");
      }
      return;
    }
  };

  const resetComponent = () => {
    setShowSuccess(false);
    setCompletedTxHash("");
  };

  // Success state - big green block
  if (showSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-[#13C27B] border-4 border-black shadow-neo p-12 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3, ease: "easeOut" }}
          className="flex flex-col items-center justify-center gap-6"
        >
          {/* Big white tick */}
          <div className="w-24 h-24 bg-white border-4 border-black rounded-full flex items-center justify-center">
            <Check className="h-12 w-12 text-[#13C27B] stroke-[4]" />
          </div>

          {/* Transaction Done text */}
          <h2 className="text-4xl font-black uppercase text-white tracking-wider">
            Transaction Done
          </h2>

          {/* Reset button */}
          <button
            onClick={resetComponent}
            className="mt-4 bg-white text-[#13C27B] font-black uppercase text-sm px-8 py-3 border-4 border-black shadow-neo hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-150"
          >
            Make Another Transaction
          </button>
        </motion.div>
      </motion.div>
    );
  }

  // Normal component state
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="bg-gradient-to-br from-[#FF5484] to-[#FF3366] border-4 border-black shadow-neo p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white border-2 border-black p-2">
            <img
              src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMTYiIGN5PSIxNiIgcj0iMTYiIGZpbGw9IiNCNkUzRkYiLz4KPHBhdGggZD0iTTE2IDZMMjIgMThIMTBMMTYgNloiIGZpbGw9IndoaXRlIi8+CjxwYXRoIGQ9Ik0xMCAyMkgyMkwyMCAyNkgxMkwxMCAyMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo="
              alt="Aave"
              className="h-6 w-6"
            />
          </div>
          <div>
            <h3 className="text-xl font-black uppercase text-white">
              Aave Integration
            </h3>
            <p className="text-white/80 font-bold text-sm">
              Deposit & Withdraw on Sepolia
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-[#7C82FF] border-2 border-black px-3 py-2">
          <img
            src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDI0QzE4LjYyNzQgMjQgMjQgMTguNjI3NCAyNCAxMkMyNCA1LjM3MjU4IDE4LjYyNzQgMCAxMiAwQzUuMzcyNTggMCAwIDUuMzcyNTggMCAxMkMwIDE4LjYyNzQgNS4zNzI1OCAyNCAxMiAyNFoiIGZpbGw9IiM2MjdFRUEiLz4KPHBhdGggZD0iTTEyLjM3MzIgM1Y5LjY1MjhMMTguMzY5NiAxMi4yMTc2TDEyLjM3MzIgM1oiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNjAyIi8+CjxwYXRoIGQ9Ik0xMi4zNzMgM0w2LjM3NjQ2IDEyLjIxNzZMMTIuMzczIDkuNjUyOFYzWiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyLjM3MzIgMTYuNDc2OFYyMC45OTc2TDE4LjM3MjggMTMuMjE2TDEyLjM3MzIgMTYuNDc2OFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuNjAyIi8+CjxwYXRoIGQ9Ik0xMi4zNzMgMjAuOTk3NlYxNi40NzY0TDYuMzc2NDYgMTMuMjE2TDEyLjM3MyAyMC45OTc2WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTEyLjM3MzIgMTUuNDc4NEwxOC4zNjk2IDEyLjIxNzZMMTIuMzczMiA5LjY1NDNWMTUuNDc4NFoiIGZpbGw9IndoaXRlIiBmaWxsLW9wYWNpdHk9IjAuMiIvPgo8cGF0aCBkPSJNNi4zNzY0NiAxMi4yMTc2TDEyLjM3MyAxNS40Nzg0VjkuNjU0M0w2LjM3NjQ2IDEyLjIxNzZaIiBmaWxsPSJ3aGl0ZSIgZmlsbC1vcGFjaXR5PSIwLjYwMiIvPgo8L3N2Zz4K"
            alt="Ethereum"
            className="h-4 w-4"
          />
          <span className="text-white font-black text-xs uppercase">
            Sepolia
          </span>
        </div>
      </div>

      {/* Amount Input */}
      <div className="mb-6">
        <label className="block text-white font-black text-sm uppercase mb-2">
          Amount (LINK)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          min="0.001"
          step="0.001"
          className="w-full p-3 border-2 border-black font-mono text-lg bg-white text-black"
          placeholder="0.01"
          disabled={!isConnected}
        />
      </div>

      {/* Storage Warning */}
      {storageWarning && (
        <div className="mb-6 bg-red-400 border-2 border-black p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-black" />
            <span className="font-black text-sm uppercase text-black">
              Storage Full
            </span>
          </div>
          <p className="text-sm font-medium mb-3 text-black">
            Browser storage is full. This may prevent wallet connection.
          </p>
          <button
            onClick={() => {
              const cleared = clearStorageSpace();
              if (cleared) {
                checkStorageAvailability();
              }
            }}
            className="bg-white text-black font-black text-xs uppercase px-3 py-2 border-2 border-black hover:bg-gray-100 transition-colors"
          >
            Clear Storage
          </button>
        </div>
      )}

      {/* Connection Status */}
      {isConnected && (
        <div className="mb-6 bg-green-400 border-2 border-black p-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-600 border border-black"></div>
            <span className="font-black text-sm uppercase text-black">
              Wallet Connected
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {!isConnected ? (
          <>
            {/* Grayed out Deposit button when not connected */}
            <button
              disabled
              className="btn-brutalist inline-flex items-center justify-center gap-3 bg-gray-400 text-black font-black uppercase text-sm px-6 py-4 border-4 border-black shadow-neo opacity-50 cursor-not-allowed md:col-span-2"
            >
              <ArrowUpFromLine className="h-5 w-5" />
              <span>Deposit</span>
            </button>

            {/* Connect Wallet button */}
            <button
              onClick={handleConnect}
              className="btn-brutalist inline-flex items-center justify-center gap-3 bg-[#7C82FF] text-white font-black uppercase text-sm px-6 py-4 border-4 border-black shadow-neo transition-all duration-150"
            >
              <Wallet className="h-5 w-5" />
              <span>Connect Wallet</span>
            </button>

            {/* Grayed out Withdraw button when not connected */}
            <button
              disabled
              className="btn-brutalist inline-flex items-center justify-center gap-3 bg-gray-400 text-black font-black uppercase text-sm px-6 py-4 border-4 border-black shadow-neo opacity-50 cursor-not-allowed"
            >
              <ArrowDownToLine className="h-5 w-5" />
              <span>Withdraw</span>
            </button>
          </>
        ) : (
          <>
            {/* Active Deposit button when connected */}
            <button
              onClick={handleDeposit}
              className="btn-brutalist inline-flex items-center justify-center gap-3 bg-[#13C27B] text-white font-black uppercase text-sm px-6 py-4 border-4 border-black shadow-neo transition-all duration-150 md:col-span-2"
            >
              <ArrowUpFromLine className="h-5 w-5" />
              <span>Deposit</span>
            </button>

            {/* Active Withdraw button when connected */}
            <button
              onClick={handleWithdraw}
              className="btn-brutalist inline-flex items-center justify-center gap-3 bg-[#FF9500] text-white font-black uppercase text-sm px-6 py-4 border-4 border-black shadow-neo transition-all duration-150"
            >
              <ArrowDownToLine className="h-5 w-5" />
              <span>Withdraw</span>
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default AaveIntegration;
