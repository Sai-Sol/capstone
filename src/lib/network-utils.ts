// MegaETH Testnet Utilities
// Utility functions for MegaETH-specific operations

import { baseConfig } from './base-config';
import { BrowserProvider } from 'ethers';

export class NetworkUtils {

  /**
   * Check if the current network is correct
   */
  static async isConnectedToCorrectNetwork(provider: BrowserProvider): Promise<boolean> {
    try {
      const network = await provider.getNetwork();
      return Number(network.chainId) === baseConfig.chainId;
    } catch (error) {
      console.error('Failed to check network:', error);
      return false;
    }
  }

  /**
   * Get optimized gas settings for MegaETH
   */
  static getOptimizedGasSettings(priority: 'slow' | 'standard' | 'fast' = 'standard') {
    const gasPrice = 2000000000; // 2 gwei default

    return {
      gasPrice,
      maxFeePerGas: gasPrice * 2,
      maxPriorityFeePerGas: Math.floor(gasPrice * 0.1),
    };
  }

  /**
   * Format transaction for display
   */
  static formatTransaction(tx: any) {
    return {
      hash: tx.hash,
      from: tx.from,
      to: tx.to,
      value: tx.value,
      gasUsed: tx.gasUsed?.toString() || '0',
      gasPrice: tx.gasPrice?.toString() || '0',
      blockNumber: tx.blockNumber,
      timestamp: tx.timestamp || Date.now(),
      status: tx.status === 1 ? 'success' : 'failed',
      explorerUrl: `${baseConfig.blockExplorerUrls[0]}/tx/${tx.hash}`
    };
  }

  /**
   * Get network status
   */
  static async getNetworkStatus(): Promise<{
    isOnline: boolean;
    blockNumber: number;
    gasPrice: string;
    networkLoad: string;
  }> {
    try {
      // In a real implementation, this would call Base status API
      return {
        isOnline: true,
        blockNumber: Math.floor(Date.now() / 2000), // Mock block number based on 2s block time
        gasPrice: '2.0 gwei',
        networkLoad: 'Low'
      };
    } catch (error) {
      return {
        isOnline: false,
        blockNumber: 0,
        gasPrice: '0 gwei',
        networkLoad: 'Unknown'
      };
    }
  }

  /**
   * Validate address format
   */
  static isValidAddress(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }

  /**
   * Get faucet URL for testnet ETH
   */
  static getFaucetUrl(address?: string): string {
    const baseUrl = 'https://bridge.base.org/deposit';
    return address ? `${baseUrl}?address=${address}` : baseUrl;
  }

  /**
   * Generate explorer URLs
   */
  static getExplorerUrls(hash: string, type: 'tx' | 'address' | 'block' = 'tx') {
    const baseUrl = baseConfig.blockExplorerUrls[0];
    return {
      primary: `${baseUrl}/${type}/${hash}`,
      backup: `${baseConfig.blockExplorerUrls[1] || baseUrl}/${type}/${hash}`
    };
  }

  /**
   * Check network health
   */
  static async checkNetworkHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    blockTime: number;
    tps: number;
  }> {
    const startTime = performance.now();

    try {
      // Mock health check - in real implementation, ping Base RPC
      await new Promise(resolve => setTimeout(resolve, 50)); // Simulate network call

      const latency = performance.now() - startTime;

      return {
        status: latency < 100 ? 'healthy' : latency < 500 ? 'degraded' : 'down',
        latency,
        blockTime: 2,
        tps: 15
      };
    } catch (error) {
      return {
        status: 'down',
        latency: -1,
        blockTime: 0,
        tps: 0
      };
    }
  }

  /**
   * Get recommended gas price based on network conditions
   */
  static async getRecommendedGasPrice(provider: BrowserProvider): Promise<{
    slow: string;
    standard: string;
    fast: string;
  }> {
    try {
      const feeData = await provider.getFeeData();
      const baseGasPrice = Number(feeData.gasPrice || 0n) / 1e9; // Convert to gwei

      return {
        slow: (baseGasPrice * 0.8).toFixed(2),
        standard: baseGasPrice.toFixed(2),
        fast: (baseGasPrice * 1.5).toFixed(2)
      };
    } catch (error) {
      // Fallback to default Base gas prices
      return {
        slow: '1.0',
        standard: '2.0',
        fast: '5.0'
      };
    }
  }
}

// Export singleton instance
export const networkUtils = new NetworkUtils();