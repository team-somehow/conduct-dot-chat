import type { TransactionResponse } from "@/hooks/useBlockscoutTransaction";
import useBlockscoutTransaction from "@/hooks/useBlockscoutTransaction";
import { useEffect, useState } from "react";

type Props = {
  txHash: string;
};

const BlockscoutTransactionWidget = ({ txHash }: Props) => {
  const { fetchTransactionDetails } = useBlockscoutTransaction();
  const [transaction, setTransaction] = useState<TransactionResponse | null>(
    null
  );

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const data = await fetchTransactionDetails(txHash);
        setTransaction(data);
      } catch (error) {
        console.error("Error fetching transaction details:", error);
      }
    };

    fetchTransaction();
  }, [fetchTransactionDetails, txHash]);

  if (!transaction) {
    return <div className="text-gray-600">Loading transaction...</div>;
  }

  const valueEth = Number(transaction.value) / 1e18;
  const burntFeeEth = Number(transaction.transaction_burnt_fee) / 1e18;
  const status = transaction.result === "success" ? "✅ Success" : "❌ Failed";
  const sender = transaction.from.ens_domain_name || transaction.from.hash;

  return (
    <div className="p-4 bg-white rounded-xl shadow-md text-gray-900 space-y-2">
      <h2 className="text-xl font-bold">Transaction Summary</h2>

      <p>
        <strong>Status:</strong> {status}
      </p>

      <p>
        <strong>Transaction Hash:</strong>{" "}
        <a
          href={`https://eth.blockscout.com/tx/${transaction.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {transaction.hash}
        </a>
      </p>

      <p>
        <strong>From:</strong>{" "}
        <a
          href={`https://eth.blockscout.com/address/${transaction.from.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {sender}
        </a>
      </p>

      <p>
        <strong>Transfer:</strong> {valueEth.toFixed(5)} ETH to{" "}
        <a
          href={`https://eth.blockscout.com/address/${transaction.from.hash}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
        >
          {transaction.from.hash}
        </a>
      </p>

      {/* <p>
        <strong>Burnt Fee:</strong> {burntFeeEth.toFixed(6)} ETH
      </p>

      <p>
        <strong>Gas Limit:</strong> {transaction.max_fee_per_gas} wei
      </p>

      <p>
        <strong>Confirmations:</strong> {transaction.confirmations}
      </p> */}
    </div>
  );
};

export default BlockscoutTransactionWidget;
