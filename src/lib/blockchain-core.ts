// Core blockchain implementation
import { createHash } from 'crypto';

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  fee: number;
  timestamp: number;
  signature: string;
  nonce: number;
  data?: string;
}

export interface Block {
  index: number;
  timestamp: number;
  transactions: Transaction[];
  previousHash: string;
  hash: string;
  nonce: number;
  merkleRoot: string;
  difficulty: number;
  miner: string;
  reward: number;
}

export interface PeerNode {
  id: string;
  address: string;
  port: number;
  lastSeen: number;
  version: string;
  status: 'active' | 'inactive' | 'syncing';
}

export class BlockchainCore {
  private chain: Block[] = [];
  private pendingTransactions: Transaction[] = [];
  private peers: Map<string, PeerNode> = new Map();
  private difficulty: number = 4;
  private miningReward: number = 10;
  private targetBlockTime: number = 10000; // 10 seconds

  constructor() {
    this.createGenesisBlock();
    this.initializePeerNetwork();
  }

  private createGenesisBlock(): void {
    const genesisBlock: Block = {
      index: 0,
      timestamp: Date.now(),
      transactions: [],
      previousHash: '0',
      hash: '',
      nonce: 0,
      merkleRoot: '',
      difficulty: this.difficulty,
      miner: 'genesis',
      reward: 0
    };

    genesisBlock.merkleRoot = this.calculateMerkleRoot(genesisBlock.transactions);
    genesisBlock.hash = this.calculateHash(genesisBlock);
    this.chain.push(genesisBlock);
  }

  private initializePeerNetwork(): void {
    // Initialize with some mock peers for demonstration
    const mockPeers: PeerNode[] = [
      {
        id: 'peer-1',
        address: '192.168.1.100',
        port: 8333,
        lastSeen: Date.now(),
        version: '1.0.0',
        status: 'active'
      },
      {
        id: 'peer-2',
        address: '192.168.1.101',
        port: 8333,
        lastSeen: Date.now(),
        version: '1.0.0',
        status: 'active'
      },
      {
        id: 'peer-3',
        address: '192.168.1.102',
        port: 8333,
        lastSeen: Date.now() - 30000,
        version: '1.0.0',
        status: 'syncing'
      }
    ];

    mockPeers.forEach(peer => this.peers.set(peer.id, peer));
  }

  calculateHash(block: Block): string {
    const blockData = `${block.index}${block.timestamp}${JSON.stringify(block.transactions)}${block.previousHash}${block.nonce}${block.merkleRoot}`;
    return createHash('sha256').update(blockData).digest('hex');
  }

  calculateMerkleRoot(transactions: Transaction[]): string {
    if (transactions.length === 0) {
      return createHash('sha256').update('').digest('hex');
    }

    let hashes = transactions.map(tx => 
      createHash('sha256').update(JSON.stringify(tx)).digest('hex')
    );

    while (hashes.length > 1) {
      const newHashes: string[] = [];
      for (let i = 0; i < hashes.length; i += 2) {
        const left = hashes[i];
        const right = hashes[i + 1] || left;
        const combined = createHash('sha256').update(left + right).digest('hex');
        newHashes.push(combined);
      }
      hashes = newHashes;
    }

    return hashes[0];
  }

  createTransaction(from: string, to: string, amount: number, privateKey?: string): Transaction {
    const transaction: Transaction = {
      id: this.generateTransactionId(),
      from,
      to,
      amount,
      fee: this.calculateTransactionFee(amount),
      timestamp: Date.now(),
      signature: '',
      nonce: this.getAccountNonce(from),
      data: ''
    };

    // Simulate digital signature
    transaction.signature = this.signTransaction(transaction, privateKey || 'mock-private-key');
    
    return transaction;
  }

  private generateTransactionId(): string {
    return `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateTransactionFee(amount: number): number {
    // Base fee + percentage of transaction amount
    const baseFee = 0.001;
    const percentageFee = amount * 0.001;
    return Math.max(baseFee, percentageFee);
  }

  private getAccountNonce(address: string): number {
    // Count transactions from this address
    let nonce = 0;
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.from === address) {
          nonce++;
        }
      }
    }
    return nonce;
  }

  private signTransaction(transaction: Transaction, privateKey: string): string {
    const txData = `${transaction.from}${transaction.to}${transaction.amount}${transaction.fee}${transaction.timestamp}${transaction.nonce}`;
    return createHash('sha256').update(txData + privateKey).digest('hex');
  }

  addTransaction(transaction: Transaction): boolean {
    if (!this.validateTransaction(transaction)) {
      return false;
    }

    this.pendingTransactions.push(transaction);
    this.broadcastTransaction(transaction);
    return true;
  }

  private validateTransaction(transaction: Transaction): boolean {
    // Validate transaction structure
    if (!transaction.from || !transaction.to || transaction.amount <= 0) {
      return false;
    }

    // Validate signature
    const expectedSignature = this.signTransaction(transaction, 'mock-private-key');
    if (transaction.signature !== expectedSignature) {
      return false;
    }

    // Check balance (simplified - in real implementation, calculate from UTXO)
    const balance = this.getAccountBalance(transaction.from);
    if (balance < transaction.amount + transaction.fee) {
      return false;
    }

    return true;
  }

  getAccountBalance(address: string): number {
    let balance = 0;
    
    for (const block of this.chain) {
      for (const tx of block.transactions) {
        if (tx.to === address) {
          balance += tx.amount;
        }
        if (tx.from === address) {
          balance -= (tx.amount + tx.fee);
        }
      }
      
      // Add mining rewards
      if (block.miner === address) {
        balance += block.reward;
      }
    }

    return balance;
  }

  mineBlock(minerAddress: string): Block | null {
    if (this.pendingTransactions.length === 0) {
      return null;
    }

    const previousBlock = this.getLatestBlock();
    const newBlock: Block = {
      index: previousBlock.index + 1,
      timestamp: Date.now(),
      transactions: [...this.pendingTransactions],
      previousHash: previousBlock.hash,
      hash: '',
      nonce: 0,
      merkleRoot: '',
      difficulty: this.difficulty,
      miner: minerAddress,
      reward: this.miningReward
    };

    newBlock.merkleRoot = this.calculateMerkleRoot(newBlock.transactions);
    
    // Proof of Work mining
    const startTime = Date.now();
    while (!this.isValidHash(newBlock.hash)) {
      newBlock.nonce++;
      newBlock.hash = this.calculateHash(newBlock);
      
      // Prevent infinite loop in demo
      if (Date.now() - startTime > 5000) {
        break;
      }
    }

    if (this.isValidBlock(newBlock)) {
      this.chain.push(newBlock);
      this.pendingTransactions = [];
      this.adjustDifficulty();
      this.broadcastBlock(newBlock);
      return newBlock;
    }

    return null;
  }

  private isValidHash(hash: string): boolean {
    return hash.startsWith('0'.repeat(this.difficulty));
  }

  private isValidBlock(block: Block): boolean {
    // Validate block structure
    if (block.index !== this.getLatestBlock().index + 1) {
      return false;
    }

    if (block.previousHash !== this.getLatestBlock().hash) {
      return false;
    }

    // Validate hash
    const calculatedHash = this.calculateHash(block);
    if (block.hash !== calculatedHash) {
      return false;
    }

    // Validate merkle root
    const calculatedMerkleRoot = this.calculateMerkleRoot(block.transactions);
    if (block.merkleRoot !== calculatedMerkleRoot) {
      return false;
    }

    // Validate all transactions
    for (const tx of block.transactions) {
      if (!this.validateTransaction(tx)) {
        return false;
      }
    }

    return true;
  }

  private adjustDifficulty(): void {
    if (this.chain.length < 2) return;

    const latestBlock = this.getLatestBlock();
    const previousBlock = this.chain[this.chain.length - 2];
    const timeDiff = latestBlock.timestamp - previousBlock.timestamp;

    if (timeDiff < this.targetBlockTime / 2) {
      this.difficulty++;
    } else if (timeDiff > this.targetBlockTime * 2) {
      this.difficulty = Math.max(1, this.difficulty - 1);
    }
  }

  validateChain(): boolean {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!this.isValidBlock(currentBlock)) {
        return false;
      }

      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  getLatestBlock(): Block {
    return this.chain[this.chain.length - 1];
  }

  getChain(): Block[] {
    return [...this.chain];
  }

  getPendingTransactions(): Transaction[] {
    return [...this.pendingTransactions];
  }

  getNetworkStats() {
    const totalTransactions = this.chain.reduce((sum, block) => sum + block.transactions.length, 0);
    const averageBlockTime = this.chain.length > 1 
      ? (this.getLatestBlock().timestamp - this.chain[1].timestamp) / (this.chain.length - 1)
      : 0;

    return {
      blockHeight: this.chain.length - 1,
      totalTransactions,
      pendingTransactions: this.pendingTransactions.length,
      difficulty: this.difficulty,
      averageBlockTime: Math.round(averageBlockTime / 1000), // in seconds
      networkHashRate: this.calculateNetworkHashRate(),
      activePeers: Array.from(this.peers.values()).filter(p => p.status === 'active').length,
      totalPeers: this.peers.size
    };
  }

  private calculateNetworkHashRate(): string {
    // Simplified hash rate calculation
    const hashRate = Math.pow(2, this.difficulty) / (this.targetBlockTime / 1000);
    if (hashRate > 1e12) {
      return `${(hashRate / 1e12).toFixed(2)} TH/s`;
    } else if (hashRate > 1e9) {
      return `${(hashRate / 1e9).toFixed(2)} GH/s`;
    } else if (hashRate > 1e6) {
      return `${(hashRate / 1e6).toFixed(2)} MH/s`;
    }
    return `${(hashRate / 1e3).toFixed(2)} KH/s`;
  }

  // Peer-to-peer network methods
  addPeer(peer: PeerNode): void {
    this.peers.set(peer.id, peer);
  }

  removePeer(peerId: string): void {
    this.peers.delete(peerId);
  }

  getPeers(): PeerNode[] {
    return Array.from(this.peers.values());
  }

  private broadcastTransaction(transaction: Transaction): void {
    // Simulate broadcasting to peers
    console.log(`Broadcasting transaction ${transaction.id} to ${this.peers.size} peers`);
  }

  private broadcastBlock(block: Block): void {
    // Simulate broadcasting to peers
    console.log(`Broadcasting block ${block.index} to ${this.peers.size} peers`);
  }

  syncWithPeer(peerId: string): Promise<boolean> {
    return new Promise((resolve) => {
      const peer = this.peers.get(peerId);
      if (!peer) {
        resolve(false);
        return;
      }

      // Simulate sync process
      setTimeout(() => {
        peer.status = 'active';
        peer.lastSeen = Date.now();
        this.peers.set(peerId, peer);
        resolve(true);
      }, 1000);
    });
  }

  // Smart contract functionality
  deployContract(code: string, deployer: string): string {
    const contractAddress = `0x${createHash('sha256').update(code + deployer + Date.now()).digest('hex').slice(0, 40)}`;
    
    const deployTransaction = this.createTransaction(
      deployer,
      contractAddress,
      0,
      'mock-private-key'
    );
    deployTransaction.data = code;

    this.addTransaction(deployTransaction);
    return contractAddress;
  }

  executeContract(contractAddress: string, method: string, params: any[], caller: string): any {
    // Simplified contract execution
    console.log(`Executing contract ${contractAddress}.${method}(${JSON.stringify(params)}) by ${caller}`);
    
    // Create contract execution transaction
    const executionTx = this.createTransaction(
      caller,
      contractAddress,
      0,
      'mock-private-key'
    );
    executionTx.data = JSON.stringify({ method, params });

    this.addTransaction(executionTx);
    
    return {
      success: true,
      result: `Contract ${method} executed successfully`,
      gasUsed: 21000 + method.length * 100
    };
  }
}

// Global blockchain instance
export const blockchain = new BlockchainCore();