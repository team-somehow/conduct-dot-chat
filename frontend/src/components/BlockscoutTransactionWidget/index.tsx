import type { TransactionResponse } from "@/hooks/useBlockscoutTransaction";
import useBlockscoutTransaction from "@/hooks/useBlockscoutTransaction";
import { useEffect, useState } from "react";

type Props = {
};

const BlockscoutTransactionWidget = ({  }: Props) => {
  const { fetchTransactionDetails } = useBlockscoutTransaction();
  const [transaction, setTransaction] = useState<TransactionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [txHash] = useAtom(transactionHashAtom);

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!txHash) {
        setError("No transaction hash provided");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);
      setTransaction(null);

      try {
        console.log("Fetching transaction details for:", txHash);
        const data = await fetchTransactionDetails(txHash);
        
        if (data) {
          setTransaction(data);
          console.log("Transaction data loaded successfully:", data);
        } else {
          setError("Transaction not found or failed to load");
        }
      } catch (error) {
        console.error("Error fetching transaction details:", error);
        setError(error instanceof Error ? error.message : "Failed to load transaction");
      } finally {
        setIsLoading(false);
      }
    };

    fetchTransaction();
  }, [txHash]);

  if (isLoading) {
    return (
      <div className="bg-white border-4 border-black shadow-neo p-6">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 border-4 border-black border-t-[#FF5484] animate-spin"></div>
          <span className="font-bold text-black">Loading Transaction Details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white border-4 border-black shadow-neo p-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">❌</span>
            <h2 className="text-xl font-black uppercase tracking-tight text-black">
              Transaction Error
            </h2>
          </div>
          <p className="font-bold text-red-600">{error}</p>
          <div className="bg-gray-100 border-2 border-black p-3">
            <p className="text-xs font-bold text-black/70 uppercase tracking-wide">
              Transaction Hash
            </p>
            <p className="font-mono text-sm text-black break-all">{txHash}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="bg-white border-4 border-black shadow-neo p-6">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🔍</span>
            <h2 className="text-xl font-black uppercase tracking-tight text-black">
              Transaction Not Found
            </h2>
          </div>
          <p className="font-bold text-black/70">Unable to locate this transaction</p>
          <div className="bg-gray-100 border-2 border-black p-3">
            <p className="text-xs font-bold text-black/70 uppercase tracking-wide">
              Transaction Hash
            </p>
            <p className="font-mono text-sm text-black break-all">{txHash}</p>
          </div>
        </div>
      </div>
    );
  }

  const valueEth = Number(transaction.value) / 1e18;
  const burntFeeEth = Number(transaction.transaction_burnt_fee) / 1e18;
  const status = transaction.result === "success" ? "✅ Success" : "❌ Failed";
  const sender = transaction.from.ens_domain_name || transaction.from.hash;

  return (
    <div className="bg-white border-4 border-black shadow-neo space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#FF5484] to-[#7C82FF] border-b-4 border-black p-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">🔗</span>
          <h2 className="text-xl font-black uppercase tracking-tight text-white">
            Transaction Details
          </h2>
          <div className={`px-3 py-1 border-2 border-white font-black text-sm ${
            transaction.result === "success" 
              ? "bg-[#13C27B] text-black" 
              : "bg-red-500 text-white"
          }`}>
            {status}
          </div>
        </div>
      </div>

      {/* Transaction Details */}
      <div className="p-4 space-y-4">
        {/* Transaction Hash */}
        <div className="bg-[#FFFDEE] border-4 border-black shadow-neo p-4">
          <p className="text-xs font-bold text-black/70 uppercase tracking-wide mb-2">
            Transaction Hash
          </p>
          <a
            href={`https://eth-sepolia.blockscout.com/tx/${transaction.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[#7C82FF] hover:text-[#FF5484] font-bold underline break-all transition-colors"
          >
            {transaction.hash}
          </a>
        </div>

        {/* From Address */}
        <div className="bg-[#FFFDEE] border-4 border-black shadow-neo p-4">
          <p className="text-xs font-bold text-black/70 uppercase tracking-wide mb-2">
            From Address
          </p>
          <a
            href={`https://eth-sepolia.blockscout.com/address/${transaction.from.hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[#7C82FF] hover:text-[#FF5484] font-bold underline break-all transition-colors"
          >
            {sender}
          </a>
        </div>

        {/* Value Transfer */}
        <div className="bg-[#FFFDEE] border-4 border-black shadow-neo p-4">
          <p className="text-xs font-bold text-black/70 uppercase tracking-wide mb-2">
            Value Transferred
          </p>
          <div className="flex items-center space-x-2">
            <span className="font-black text-lg text-black">{valueEth.toFixed(5)} ETH</span>
          </div>
        </div>

        {/* Additional Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#FEEF5D] border-4 border-black shadow-neo p-3 text-center">
            <p className="text-xs font-bold text-black/70 uppercase tracking-wide">
              Gas Burnt
            </p>
            <p className="font-black text-sm text-black">{burntFeeEth.toFixed(6)} ETH</p>
          </div>
          <div className="bg-[#FEEF5D] border-4 border-black shadow-neo p-3 text-center">
            <p className="text-xs font-bold text-black/70 uppercase tracking-wide">
              Confirmations
            </p>
            <p className="font-black text-sm text-black">{transaction.confirmations}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockscoutTransactionWidget;
