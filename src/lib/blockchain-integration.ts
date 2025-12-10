// Simplified blockchain integration focused on quantum job logging
import { Contract } from "ethers";
import { CONTRACT_ADDRESS } from "./constants";
import { quantumJobLoggerABI } from "./contracts";

export interface QuantumJob {
  id: string;
  user: string;
  jobType: string;
  description: string;
  txHash: string;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
}

export class BlockchainIntegration {
  private jobs: Map<string, QuantumJob> = new Map();
  private readonly MAX_RETRIES = 5;
  private readonly INITIAL_RETRY_DELAY = 1000;
  private readonly MAX_RETRY_DELAY = 30000;

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isRateLimitError(error: any): boolean {
    if (error.code === -32603 || error.code === 'UNKNOWN_ERROR') {
      const message = error.message || '';
      return message.includes('rate limited') || message.includes('rate limit');
    }
    return false;
  }

  private async logJobWithRetry(
    contract: Contract,
    jobType: string,
    jobDescription: string,
    attempt: number = 1
  ): Promise<any> {
    try {
      return await contract.logJob(jobType, jobDescription);
    } catch (error: any) {
      if (this.isRateLimitError(error) && attempt < this.MAX_RETRIES) {
        const delayMs = Math.min(
          this.INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1),
          this.MAX_RETRY_DELAY
        );
        console.log(`Rate limited. Retrying in ${delayMs}ms (attempt ${attempt}/${this.MAX_RETRIES})`);
        await this.sleep(delayMs);
        return this.logJobWithRetry(contract, jobType, jobDescription, attempt + 1);
      }
      throw error;
    }
  }

  async logQuantumJob(
    provider: any,
    signer: any,
    jobType: string,
    description: string
  ): Promise<{ txHash: string; jobId: string }> {
    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, signer);

      const jobMetadata = {
        type: jobType,
        description,
        timestamp: Date.now(),
      };

      const jobDescription = JSON.stringify(jobMetadata);
      const tx = await this.logJobWithRetry(contract, jobType, jobDescription);

      const jobId = `job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const userAddress = await signer.getAddress();

      const job: QuantumJob = {
        id: jobId,
        user: userAddress,
        jobType,
        description,
        txHash: tx.hash,
        timestamp: Date.now(),
        status: 'pending'
      };

      this.jobs.set(jobId, job);

      // Wait for confirmation with timeout
      const confirmationPromise = tx.wait();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Transaction confirmation timeout')), 60000)
      );

      try {
        await Promise.race([confirmationPromise, timeoutPromise]);
        job.status = 'confirmed';
      } catch (error) {
        console.warn('Transaction confirmation timed out, marking as pending');
        job.status = 'pending';
      }

      this.jobs.set(jobId, job);

      return { txHash: tx.hash, jobId };
    } catch (error: any) {
      console.error('Failed to log quantum job:', error);
      throw error;
    }
  }

  async getJobHistory(provider: any, userAddress?: string): Promise<QuantumJob[]> {
    try {
      const contract = new Contract(CONTRACT_ADDRESS, quantumJobLoggerABI, provider);
      const filter = contract.filters.JobLogged();
      const currentBlock = await provider.getBlockNumber();
      const fromBlock = Math.max(0, currentBlock - 1000);

      const logs = await contract.queryFilter(filter, fromBlock, 'latest');
      
      const jobs = logs.map((log: any) => {
        let metadata;
        try {
          metadata = JSON.parse(log.args.ipfsHash);
        } catch {
          metadata = { description: log.args.ipfsHash };
        }

        return {
          id: `job_${log.transactionHash.slice(2, 10)}`,
          user: log.args.user,
          jobType: log.args.jobType,
          description: metadata.description || log.args.ipfsHash,
          txHash: log.transactionHash,
          timestamp: Number(log.args.timeSubmitted) * 1000,
          status: 'confirmed' as const
        };
      }).reverse();

      // Filter by user if specified
      if (userAddress) {
        return jobs.filter(job => job.user.toLowerCase() === userAddress.toLowerCase());
      }

      return jobs;
    } catch (error) {
      console.error('Failed to fetch job history:', error);
      return [];
    }
  }

  getJob(jobId: string): QuantumJob | undefined {
    return this.jobs.get(jobId);
  }

  getAllJobs(): QuantumJob[] {
    return Array.from(this.jobs.values());
  }
}

export const blockchainIntegration = new BlockchainIntegration();