import { BrowserProvider, Contract, JsonRpcSigner, parseUnits } from "ethers";

export interface BlockscoutTransactionData {
  status: string;
  result: Array<{
    blockNumber: string;
    timeStamp: string;
    hash: string;
    from: string;
    to: string;
    value: string;
    gasUsed: string;
    input: string;
  }>;
  message?: string;
}

export interface JobCountUpdate {
  previousCount: number;
  currentCount: number;
  transactionHash: string;
  timestamp: number;
  success: boolean;
  error?: string;
}

const BLOCKSCOUT_API_BASE = "https://megaeth-testnet-v2.blockscout.com/api/v2";
const CONTRACT_ADDRESS = "0xd1471126F18d76be253625CcA75e16a0F1C5B3e2";
const POLLING_INTERVAL = 60000;

const QUANTUM_JOB_LOGGER_ABI = [
  {
    type: "function",
    name: "getJobCount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view"
  },
  {
    type: "function",
    name: "setJobCount",
    inputs: [{ name: "count", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable"
  },
  {
    type: "function",
    name: "jobCount",
    inputs: [],
    outputs: [{ type: "uint256" }],
    stateMutability: "view"
  }
];

export class BlockscoutMonitor {
  private static lastKnownCount: number = 0;
  private static lastUpdateTime: number = 0;

  static async fetchTransactionCount(address: string): Promise<number> {
    try {
      const url = `${BLOCKSCOUT_API_BASE}/addresses/${address}`;

      console.log(`[Blockscout] Fetching transaction count for ${address}`);

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(`Blockscout API error: ${response.statusText}`);
      }

      const data = await response.json();

      const txCount = parseInt(data.transactions_count || "0", 10);

      console.log(`[Blockscout] Transaction count: ${txCount}`);

      return txCount;
    } catch (error) {
      console.error("[Blockscout] Failed to fetch transaction count:", error);
      throw error;
    }
  }

  static async getContractJobCount(provider: BrowserProvider): Promise<number> {
    try {
      console.log(`[Contract] Fetching current job count from contract`);

      const contract = new Contract(
        CONTRACT_ADDRESS,
        QUANTUM_JOB_LOGGER_ABI,
        provider
      );

      const count = await contract.jobCount?.() || await contract.getJobCount?.() || 0n;
      const jobCount = Number(count);

      console.log(`[Contract] Current job count: ${jobCount}`);

      return jobCount;
    } catch (error) {
      console.error("[Contract] Failed to fetch job count:", error);
      throw error;
    }
  }

  static async updateContractJobCount(
    provider: BrowserProvider,
    signer: JsonRpcSigner,
    newCount: number
  ): Promise<JobCountUpdate> {
    const startTime = Date.now();

    try {
      console.log(`[Contract] Attempting to update job count to ${newCount}`);

      const currentCount = await this.getContractJobCount(provider);

      if (currentCount === newCount) {
        console.log(`[Contract] Job count already matches (${newCount}), skipping update`);
        return {
          previousCount: currentCount,
          currentCount: newCount,
          transactionHash: "",
          timestamp: Date.now(),
          success: true
        };
      }

      const contract = new Contract(
        CONTRACT_ADDRESS,
        QUANTUM_JOB_LOGGER_ABI,
        signer
      );

      const gasEstimate = await provider.estimateGas({
        to: CONTRACT_ADDRESS,
        data: contract.interface?.encodeFunctionData("setJobCount", [newCount])
      }).catch(() => 100000n);

      const tx = await contract.setJobCount?.(newCount) ||
        await contract.updateJobCount?.(newCount);

      if (!tx) {
        throw new Error("Transaction creation failed");
      }

      console.log(`[Contract] Transaction sent: ${tx.hash}`);

      const receipt = await tx.wait(1);

      console.log(`[Contract] Transaction confirmed: ${receipt?.hash}`);

      return {
        previousCount: currentCount,
        currentCount: newCount,
        transactionHash: receipt?.hash || tx.hash,
        timestamp: Date.now(),
        success: true
      };
    } catch (error: any) {
      console.error("[Contract] Update failed:", error);

      return {
        previousCount: this.lastKnownCount,
        currentCount: newCount,
        transactionHash: "",
        timestamp: Date.now(),
        success: false,
        error: error.message || "Unknown error"
      };
    }
  }

  static async monitorAndUpdate(
    provider: BrowserProvider,
    signer: JsonRpcSigner,
    onUpdate?: (update: JobCountUpdate) => void
  ): Promise<void> {
    const now = Date.now();

    if (now - this.lastUpdateTime < POLLING_INTERVAL) {
      console.log(`[Monitor] Skipping check - last update was ${now - this.lastUpdateTime}ms ago`);
      return;
    }

    try {
      const transactionCount = await this.fetchTransactionCount(CONTRACT_ADDRESS);

      if (transactionCount !== this.lastKnownCount) {
        console.log(`[Monitor] Job count changed: ${this.lastKnownCount} -> ${transactionCount}`);

        const update = await this.updateContractJobCount(provider, signer, transactionCount);

        this.lastKnownCount = transactionCount;
        this.lastUpdateTime = Date.now();

        if (onUpdate) {
          onUpdate(update);
        }
      } else {
        console.log(`[Monitor] No change in job count (${transactionCount})`);
      }
    } catch (error) {
      console.error("[Monitor] Monitoring failed:", error);
    }
  }

  static startAutoPolling(
    provider: BrowserProvider,
    signer: JsonRpcSigner,
    onUpdate?: (update: JobCountUpdate) => void,
    interval: number = POLLING_INTERVAL
  ): NodeJS.Timer {
    console.log(`[Monitor] Starting auto-polling with interval: ${interval}ms`);

    const timer = setInterval(async () => {
      try {
        await this.monitorAndUpdate(provider, signer, onUpdate);
      } catch (error) {
        console.error("[Monitor] Auto-polling error:", error);
      }
    }, interval);

    return timer;
  }

  static stopAutoPolling(timer: NodeJS.Timer): void {
    console.log("[Monitor] Stopping auto-polling");
    clearInterval(timer);
  }

  static getLastKnownCount(): number {
    return this.lastKnownCount;
  }

  static setLastKnownCount(count: number): void {
    this.lastKnownCount = count;
  }
}
