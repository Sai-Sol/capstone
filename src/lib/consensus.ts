// Consensus mechanism implementation
import { Block, Transaction, blockchain } from './blockchain-core';

export interface Validator {
  address: string;
  stake: number;
  reputation: number;
  isActive: boolean;
  lastValidation: number;
}

export class ConsensusEngine {
  private validators: Map<string, Validator> = new Map();
  private consensusType: 'pow' | 'pos' | 'hybrid' = 'hybrid';
  private minimumStake: number = 32; // ETH
  private slashingPenalty: number = 0.1; // 10%

  constructor() {
    this.initializeValidators();
  }

  private initializeValidators(): void {
    const mockValidators: Validator[] = [
      {
        address: '0x1234567890123456789012345678901234567890',
        stake: 100,
        reputation: 95,
        isActive: true,
        lastValidation: Date.now()
      },
      {
        address: '0x2345678901234567890123456789012345678901',
        stake: 75,
        reputation: 88,
        isActive: true,
        lastValidation: Date.now()
      },
      {
        address: '0x3456789012345678901234567890123456789012',
        stake: 50,
        reputation: 92,
        isActive: true,
        lastValidation: Date.now()
      }
    ];

    mockValidators.forEach(validator => 
      this.validators.set(validator.address, validator)
    );
  }

  async validateBlock(block: Block): Promise<boolean> {
    try {
      // Basic block validation
      if (!this.validateBlockStructure(block)) {
        return false;
      }

      // Consensus-specific validation
      switch (this.consensusType) {
        case 'pow':
          return this.validateProofOfWork(block);
        case 'pos':
          return this.validateProofOfStake(block);
        case 'hybrid':
          return this.validateHybridConsensus(block);
        default:
          return false;
      }
    } catch (error) {
      console.error('Block validation error:', error);
      return false;
    }
  }

  private validateBlockStructure(block: Block): boolean {
    // Validate basic block structure
    if (!block.hash || !block.previousHash || block.index < 0) {
      return false;
    }

    // Validate timestamp
    const now = Date.now();
    if (block.timestamp > now + 60000 || block.timestamp < now - 3600000) {
      return false;
    }

    // Validate transactions
    for (const tx of block.transactions) {
      if (!this.validateTransaction(tx)) {
        return false;
      }
    }

    return true;
  }

  private validateTransaction(transaction: Transaction): boolean {
    // Validate transaction structure
    if (!transaction.id || !transaction.from || !transaction.to) {
      return false;
    }

    if (transaction.amount <= 0 || transaction.fee < 0) {
      return false;
    }

    // Validate signature (simplified)
    if (!transaction.signature || transaction.signature.length !== 64) {
      return false;
    }

    return true;
  }

  private validateProofOfWork(block: Block): boolean {
    const hash = blockchain.calculateHash(block);
    const difficulty = block.difficulty;
    return hash.startsWith('0'.repeat(difficulty));
  }

  private validateProofOfStake(block: Block): boolean {
    const validator = this.validators.get(block.miner);
    if (!validator || !validator.isActive) {
      return false;
    }

    if (validator.stake < this.minimumStake) {
      return false;
    }

    // Validate selection probability based on stake
    const totalStake = this.getTotalStake();
    const selectionProbability = validator.stake / totalStake;
    
    // Simplified validation - in real implementation, use VRF
    return selectionProbability > 0.1;
  }

  private validateHybridConsensus(block: Block): boolean {
    // Combine PoW and PoS validation
    const powValid = this.validateProofOfWork(block);
    const posValid = this.validateProofOfStake(block);
    
    // Require both for maximum security
    return powValid && posValid;
  }

  selectValidator(): string | null {
    const activeValidators = Array.from(this.validators.values())
      .filter(v => v.isActive && v.stake >= this.minimumStake);

    if (activeValidators.length === 0) {
      return null;
    }

    // Weighted random selection based on stake
    const totalStake = activeValidators.reduce((sum, v) => sum + v.stake, 0);
    let random = Math.random() * totalStake;

    for (const validator of activeValidators) {
      random -= validator.stake;
      if (random <= 0) {
        return validator.address;
      }
    }

    return activeValidators[0].address;
  }

  addValidator(address: string, stake: number): boolean {
    if (stake < this.minimumStake) {
      return false;
    }

    const validator: Validator = {
      address,
      stake,
      reputation: 100,
      isActive: true,
      lastValidation: Date.now()
    };

    this.validators.set(address, validator);
    return true;
  }

  slashValidator(address: string, reason: string): boolean {
    const validator = this.validators.get(address);
    if (!validator) {
      return false;
    }

    const penalty = validator.stake * this.slashingPenalty;
    validator.stake -= penalty;
    validator.reputation = Math.max(0, validator.reputation - 10);

    if (validator.stake < this.minimumStake) {
      validator.isActive = false;
    }

    this.validators.set(address, validator);
    console.log(`Validator ${address} slashed: ${penalty} ETH for ${reason}`);
    
    return true;
  }

  private getTotalStake(): number {
    return Array.from(this.validators.values())
      .filter(v => v.isActive)
      .reduce((sum, v) => sum + v.stake, 0);
  }

  getValidators(): Validator[] {
    return Array.from(this.validators.values());
  }

  getConsensusStats() {
    const activeValidators = this.getValidators().filter(v => v.isActive);
    const totalStake = this.getTotalStake();

    return {
      consensusType: this.consensusType,
      totalValidators: this.validators.size,
      activeValidators: activeValidators.length,
      totalStake,
      minimumStake: this.minimumStake,
      averageReputation: activeValidators.length > 0 
        ? activeValidators.reduce((sum, v) => sum + v.reputation, 0) / activeValidators.length 
        : 0,
      lastBlockTime: blockchain.getLatestBlock().timestamp
    };
  }
}

export const consensus = new ConsensusEngine();