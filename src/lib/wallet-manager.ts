// Advanced wallet management system
import { blockchain, Transaction } from './blockchain-core';
import { smartContracts } from './smart-contracts';

export interface WalletAccount {
  address: string;
  privateKey: string;
  publicKey: string;
  balance: number;
  nonce: number;
  createdAt: number;
  label?: string;
}

export interface TransactionHistory {
  transaction: Transaction;
  blockNumber: number;
  confirmations: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
}

export class WalletManager {
  private accounts: Map<string, WalletAccount> = new Map();
  private transactionHistory: Map<string, TransactionHistory[]> = new Map();

  constructor() {
    this.initializeDemoAccounts();
  }

  private initializeDemoAccounts(): void {
    const demoAccounts = [
      {
        address: '0x1234567890123456789012345678901234567890',
        label: 'Main Account',
        balance: 100
      },
      {
        address: '0x2345678901234567890123456789012345678901',
        label: 'Trading Account',
        balance: 50
      },
      {
        address: '0x3456789012345678901234567890123456789012',
        label: 'Savings Account',
        balance: 200
      }
    ];

    demoAccounts.forEach(demo => {
      const account = this.createAccount(demo.label);
      account.address = demo.address;
      account.balance = demo.balance;
      this.accounts.set(demo.address, account);
    });
  }

  createAccount(label?: string): WalletAccount {
    const keyPair = this.generateKeyPair();
    const address = this.deriveAddress(keyPair.publicKey);
    
    const account: WalletAccount = {
      address,
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
      balance: 0,
      nonce: 0,
      createdAt: Date.now(),
      label
    };

    this.accounts.set(address, account);
    this.transactionHistory.set(address, []);
    
    return account;
  }

  private generateKeyPair(): { privateKey: string; publicKey: string } {
    // Simplified key generation (use proper cryptographic libraries in production)
    const privateKey = Array.from({ length: 64 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    
    const publicKey = Array.from({ length: 128 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');

    return { privateKey, publicKey };
  }

  private deriveAddress(publicKey: string): string {
    const crypto = require('crypto');
    const hash = crypto.createHash('sha256').update(publicKey).digest('hex');
    return '0x' + hash.slice(-40);
  }

  getAccount(address: string): WalletAccount | undefined {
    return this.accounts.get(address);
  }

  getAllAccounts(): WalletAccount[] {
    return Array.from(this.accounts.values());
  }

  updateBalance(address: string): number {
    const account = this.accounts.get(address);
    if (!account) {
      return 0;
    }

    const balance = blockchain.getAccountBalance(address);
    account.balance = balance;
    this.accounts.set(address, account);
    
    return balance;
  }

  async sendTransaction(
    from: string,
    to: string,
    amount: number,
    data?: string
  ): Promise<Transaction> {
    const account = this.accounts.get(from);
    if (!account) {
      throw new Error('Account not found');
    }

    if (account.balance < amount) {
      throw new Error('Insufficient balance');
    }

    const transaction = blockchain.createTransaction(from, to, amount, account.privateKey);
    if (data) {
      transaction.data = data;
    }

    const success = blockchain.addTransaction(transaction);
    if (!success) {
      throw new Error('Transaction validation failed');
    }

    // Update transaction history
    const history = this.transactionHistory.get(from) || [];
    history.push({
      transaction,
      blockNumber: blockchain.getLatestBlock().index + 1,
      confirmations: 0,
      status: 'pending'
    });
    this.transactionHistory.set(from, history);

    // Update nonce
    account.nonce++;
    this.accounts.set(from, account);

    return transaction;
  }

  async callContract(
    contractAddress: string,
    method: string,
    params: any[],
    caller: string,
    value: number = 0,
    gasLimit: number = 100000
  ): Promise<any> {
    const account = this.accounts.get(caller);
    if (!account) {
      throw new Error('Caller account not found');
    }

    const call = {
      contractAddress,
      method,
      params,
      caller,
      value,
      gasLimit
    };

    return await smartContracts.executeContract(call);
  }

  getTransactionHistory(address: string): TransactionHistory[] {
    return this.transactionHistory.get(address) || [];
  }

  updateTransactionStatus(txHash: string, status: 'confirmed' | 'failed'): void {
    for (const [address, history] of this.transactionHistory.entries()) {
      const txIndex = history.findIndex(h => h.transaction.id === txHash);
      if (txIndex !== -1) {
        history[txIndex].status = status;
        if (status === 'confirmed') {
          history[txIndex].confirmations = 1;
        }
        this.transactionHistory.set(address, history);
        break;
      }
    }
  }

  // Portfolio management
  getPortfolioValue(address: string): { totalValue: number; breakdown: any } {
    const account = this.accounts.get(address);
    if (!account) {
      return { totalValue: 0, breakdown: {} };
    }

    const ethBalance = account.balance;
    const contractBalances = this.getContractBalances(address);
    
    const breakdown = {
      ETH: ethBalance,
      contracts: contractBalances,
      staking: this.getStakingBalance(address),
      rewards: this.getRewardsBalance(address)
    };

    const totalValue = Object.values(breakdown).reduce((sum: number, value: any) => {
      if (typeof value === 'number') return sum + value;
      if (typeof value === 'object') {
        return sum + Object.values(value).reduce((s: number, v: any) => s + (typeof v === 'number' ? v : 0), 0);
      }
      return sum;
    }, 0);

    return { totalValue, breakdown };
  }

  private getContractBalances(address: string): Record<string, number> {
    const balances: Record<string, number> = {};
    
    for (const contract of smartContracts.getAllContracts()) {
      try {
        const balance = smartContracts.getContractBalance(contract.address);
        if (balance > 0) {
          balances[contract.address] = balance;
        }
      } catch (error) {
        console.error(`Failed to get balance for contract ${contract.address}:`, error);
      }
    }
    
    return balances;
  }

  private getStakingBalance(address: string): number {
    // Mock staking balance
    return Math.random() * 10;
  }

  private getRewardsBalance(address: string): number {
    // Mock rewards balance
    return Math.random() * 5;
  }

  // Transaction fee estimation
  estimateTransactionFee(to: string, amount: number, data?: string): number {
    let gasEstimate = 21000; // Base transaction gas
    
    if (data) {
      gasEstimate += data.length * 16; // Data cost
    }
    
    // Check if destination is a contract
    if (smartContracts.getContract(to)) {
      gasEstimate += 50000; // Contract interaction cost
    }
    
    return (gasEstimate * this.gasPrice) / 1e9; // Convert to ETH
  }

  // Security features
  signMessage(message: string, privateKey: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(message + privateKey).digest('hex');
  }

  verifySignature(message: string, signature: string, publicKey: string): boolean {
    // Simplified signature verification
    const expectedSignature = this.signMessage(message, 'derived-private-key');
    return signature === expectedSignature;
  }

  // Backup and recovery
  exportWallet(address: string): string {
    const account = this.accounts.get(address);
    if (!account) {
      throw new Error('Account not found');
    }

    const walletData = {
      address: account.address,
      privateKey: account.privateKey,
      publicKey: account.publicKey,
      label: account.label,
      createdAt: account.createdAt
    };

    return JSON.stringify(walletData);
  }

  importWallet(walletData: string, label?: string): WalletAccount {
    const data = JSON.parse(walletData);
    
    const account: WalletAccount = {
      address: data.address,
      privateKey: data.privateKey,
      publicKey: data.publicKey,
      balance: blockchain.getAccountBalance(data.address),
      nonce: blockchain.getAccountBalance(data.address), // Simplified nonce calculation
      createdAt: data.createdAt || Date.now(),
      label: label || data.label
    };

    this.accounts.set(account.address, account);
    this.transactionHistory.set(account.address, []);
    
    return account;
  }

  // Analytics
  getWalletAnalytics(address: string) {
    const history = this.getTransactionHistory(address);
    const account = this.accounts.get(address);
    
    if (!account) {
      return null;
    }

    const totalSent = history
      .filter(h => h.transaction.from === address)
      .reduce((sum, h) => sum + h.transaction.amount, 0);
    
    const totalReceived = history
      .filter(h => h.transaction.to === address)
      .reduce((sum, h) => sum + h.transaction.amount, 0);
    
    const totalFees = history
      .filter(h => h.transaction.from === address)
      .reduce((sum, h) => sum + h.transaction.fee, 0);

    return {
      address,
      balance: account.balance,
      totalTransactions: history.length,
      totalSent,
      totalReceived,
      totalFees,
      netFlow: totalReceived - totalSent,
      averageTransactionValue: history.length > 0 ? (totalSent + totalReceived) / history.length : 0,
      firstTransaction: history.length > 0 ? history[history.length - 1].transaction.timestamp : null,
      lastTransaction: history.length > 0 ? history[0].transaction.timestamp : null
    };
  }
}

export const walletManager = new WalletManager();