type TransactionTag = {
  meta: Record<string, any>;
  name: string;
  ordinal: number;
  slug: string;
  tagType: string;
};

type AddressMetadata = {
  tags: TransactionTag[];
};

type AddressInfo = {
  ens_domain_name: string | null;
  hash: string;
  implementations: any[];
  is_contract: boolean;
  is_scam: boolean;
  is_verified: boolean;
  metadata: AddressMetadata;
};

export type TransactionResponse = {
  priority_fee: string;
  raw_input: string;
  result: string;
  hash: string;
  max_fee_per_gas: string;
  revert_reason: string | null;
  confirmation_duration: [number, number];
  transaction_burnt_fee: string;
  type: number;
  token_transfers_overflow: boolean;
  confirmations: number;
  position: number;
  max_priority_fee_per_gas: string;
  transaction_tag: string | null;
  created_contract: string | null;
  value: string;
  from: AddressInfo;
};

const useBlockscoutTransaction = () => {
  async function fetchTransactionDetails(
    txHash: string
  ): Promise<TransactionResponse | null> {
    const url = `https://eth.blockscout.com/api/v2/transactions/${txHash}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data: TransactionResponse = await response.json();

      console.log("Transaction Hash:", data.hash);
      console.log(
        "Sender ENS or Hash:",
        data.from.ens_domain_name || data.from.hash
      );
      console.log("Value (ETH):", Number(data.value) / 1e18);

      return data;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      return null;
    }
  }

  return {
    fetchTransactionDetails,
  };
};
export default useBlockscoutTransaction;
