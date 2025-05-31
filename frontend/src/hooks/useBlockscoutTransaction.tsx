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
    // Validate transaction hash format
    if (!txHash || typeof txHash !== 'string') {
      throw new Error('Invalid transaction hash provided');
    }

    // Basic validation for Ethereum transaction hash format (0x followed by 64 hex characters)
    const txHashRegex = /^0x[a-fA-F0-9]{64}$/;
    if (!txHashRegex.test(txHash)) {
      throw new Error('Invalid transaction hash format. Expected 0x followed by 64 hex characters.');
    }

    const url = `https://eth-sepolia.blockscout.com/api/v2/transactions/${txHash}`;
    console.log('Fetching transaction from URL:', url);

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          accept: "application/json",
        },
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Transaction not found: ${txHash}`);
        } else if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.');
        } else if (response.status >= 500) {
          throw new Error('Blockscout server error. Please try again later.');
        } else {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
      }

      const data: TransactionResponse = await response.json();
      console.log('Raw transaction data:', data);

      // Validate that we received the expected data structure
      if (!data || typeof data !== 'object') {
        throw new Error('Invalid response format from Blockscout API');
      }

      if (!data.hash) {
        throw new Error('Transaction data missing required hash field');
      }

      console.log("Transaction Hash:", data.hash);
      console.log(
        "Sender ENS or Hash:",
        data.from?.ens_domain_name || data.from?.hash
      );
      console.log("Value (ETH):", Number(data.value) / 1e18);
      console.log("Transaction result:", data.result);

      return data;
    } catch (error) {
      console.error("Error fetching transaction:", error);
      
      // Re-throw the error so the component can handle it
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Unknown error occurred while fetching transaction');
      }
    }
  }

  return {
    fetchTransactionDetails,
  };
};
export default useBlockscoutTransaction;
