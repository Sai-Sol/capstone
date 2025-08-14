import { NextRequest, NextResponse } from 'next/server';

// Comprehensive technology knowledge base
const TECH_KNOWLEDGE_BASE = {
  "quantum computing": {
    content: `Quantum computing leverages quantum mechanical phenomena like superposition and entanglement to process information exponentially faster than classical computers for specific problems.

**Core Principles:**
• **Qubits**: Quantum bits that can exist in superposition of |0⟩ and |1⟩ states
• **Superposition**: Enables parallel computation across multiple states
• **Entanglement**: Creates correlations between qubits for complex algorithms
• **Quantum Gates**: Operations that manipulate qubit states (Hadamard, CNOT, Pauli)

**Key Algorithms:**
• **Shor's Algorithm**: Exponential speedup for integer factorization
• **Grover's Algorithm**: Quadratic speedup for database search
• **VQE**: Variational Quantum Eigensolver for chemistry simulations
• **QAOA**: Quantum Approximate Optimization Algorithm

**Current Hardware:**
• **Google Willow**: 105 qubits with breakthrough error correction
• **IBM Condor**: 1,121 qubits for large-scale computations
• **Amazon Braket**: Multi-provider access with 256+ qubits

**Applications:**
• Cryptography and cybersecurity
• Drug discovery and molecular modeling
• Financial optimization and risk analysis
• Machine learning acceleration`,
    confidence: 98,
    sources: ["IBM Quantum", "Google AI Quantum", "Nature Physics"]
  },

  "blockchain development": {
    content: `Blockchain development involves creating decentralized applications and smart contracts on distributed ledger networks.

**Smart Contract Languages:**
• **Solidity**: Primary language for Ethereum and EVM-compatible chains
• **Vyper**: Python-like alternative with enhanced security
• **Rust**: Used for Solana, Polkadot, and high-performance chains

**Development Frameworks:**
• **Hardhat**: Comprehensive Ethereum development environment
• **Foundry**: Fast, portable toolkit written in Rust
• **Truffle**: Mature framework with extensive ecosystem

**Web3 Integration:**
• **ethers.js**: Modern, lightweight Ethereum library
• **web3.js**: Original Ethereum JavaScript API
• **wagmi**: React hooks for Ethereum with TypeScript

**Security Best Practices:**
• Use OpenZeppelin contracts for standard implementations
• Implement proper access controls and role-based permissions
• Follow Checks-Effects-Interactions pattern
• Conduct thorough testing and formal verification`,
    confidence: 96,
    sources: ["Ethereum Foundation", "OpenZeppelin", "ConsenSys"]
  },

  "quantumchain platform": {
    content: `QuantumChain is a revolutionary blockchain-based quantum computing platform that ensures tamper-proof quantum computations.

**Core Features:**
• **Immutable Logging**: All quantum jobs are permanently recorded on blockchain
• **Multi-Provider Access**: Connect to Google Willow, IBM Condor, Amazon Braket
• **Smart Contract Integration**: QuantumJobLogger contract on MegaETH testnet
• **Real-time Monitoring**: Live job status and blockchain confirmations

**How It Works:**
1. **Submit Job**: Choose quantum provider and submit computation
2. **Blockchain Logging**: Job metadata is logged on MegaETH blockchain
3. **Quantum Execution**: Algorithm runs on selected quantum processor
4. **Verification**: Results are cryptographically verified and immutable

**Security Benefits:**
• Tamper-proof quantum computation records
• Independent verification through blockchain
• Decentralized trust without central authority
• Complete audit trail of all operations

**Getting Started:**
1. Connect your MetaMask wallet to MegaETH testnet
2. Submit your first quantum algorithm
3. Monitor execution and verify results on blockchain`,
    confidence: 99,
    sources: ["QuantumChain Documentation", "MegaETH Network"]
  }
};

// Technology keywords for filtering
const TECH_KEYWORDS = [
  'quantum', 'qubit', 'superposition', 'entanglement', 'blockchain', 'smart contract',
  'quantumchain', 'megaeth', 'ethereum', 'solidity', 'algorithm', 'computing',
  'cryptography', 'security', 'verification', 'immutable', 'decentralized'
];

function isTechRelated(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return TECH_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}

function findRelevantKnowledge(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Check for QuantumChain specific queries
  if (lowerQuery.includes("quantumchain") || lowerQuery.includes("platform") || lowerQuery.includes("how to")) {
    return TECH_KNOWLEDGE_BASE["quantumchain platform"].content;
  }
  
  // Check for quantum computing queries
  if (lowerQuery.includes("quantum") || lowerQuery.includes("qubit") || lowerQuery.includes("algorithm")) {
    return TECH_KNOWLEDGE_BASE["quantum computing"].content;
  }
  
  // Check for blockchain queries
  if (lowerQuery.includes("blockchain") || lowerQuery.includes("smart contract") || lowerQuery.includes("ethereum")) {
    return TECH_KNOWLEDGE_BASE["blockchain development"].content;
  }

  // Specific feature explanations
  if (lowerQuery.includes("submit") || lowerQuery.includes("job")) {
    return `**Submitting Quantum Jobs on QuantumChain**

To submit a quantum job:

1. **Connect Wallet**: Use MetaMask to connect to MegaETH testnet
2. **Choose Provider**: Select from Google Willow, IBM Condor, or Amazon Braket
3. **Enter Algorithm**: Describe your quantum algorithm or provide QASM code
4. **Set Priority**: Choose execution priority (low, medium, high)
5. **Submit**: Confirm blockchain transaction to log job

**Example Algorithms:**
• Bell State: "Create entangled Bell state using Hadamard and CNOT gates"
• Grover's Search: "Search database using Grover's quantum algorithm"
• Superposition: "Create equal superposition across all qubits"

Your job will be executed on the selected quantum processor and results logged immutably on the blockchain.`;
  }

  if (lowerQuery.includes("contract") || lowerQuery.includes("address")) {
    return `**QuantumJobLogger Smart Contract**

**Contract Address**: 0xd1471126F18d76be253625CcA75e16a0F1C5B3e2
**Network**: MegaETH Testnet
**Explorer**: https://www.megaexplorer.xyz

**Functions:**
• **logJob()**: Records quantum job metadata on blockchain
• **getAllJobs()**: Retrieves all logged quantum jobs

**Security Features:**
• Immutable job logging
• Cryptographic verification
• Tamper-proof audit trail
• Decentralized verification

The contract ensures all quantum computations are permanently recorded and verifiable.`;
  }

  // Default comprehensive response
  return `**QuantumChain Platform Overview**

QuantumChain solves the critical security problem of traditional quantum computing platforms by using blockchain technology for immutable logging.

**Key Features:**
• Execute quantum algorithms on real processors (Google Willow, IBM Condor, Amazon Braket)
• Immutable blockchain logging on MegaETH testnet
• Tamper-proof verification system
• Real-time job monitoring and status updates

**How to Get Started:**
1. Connect your MetaMask wallet
2. Submit a quantum algorithm (try "Bell state creation")
3. Monitor execution and verify results on blockchain

**Available Quantum Providers:**
• Google Willow: 105 qubits with error correction
• IBM Condor: 1,121 qubits for large-scale computations
• Amazon Braket: Multi-provider quantum cloud access

What specific aspect would you like to explore further?`;
}

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    if (message.length > 5000) {
      return NextResponse.json(
        { error: 'Message too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Check if query is tech-related
    if (!isTechRelated(message)) {
      return NextResponse.json({
        response: "I'm a specialized AI assistant focused on QuantumChain, quantum computing, and blockchain technology. I can help you with:\n\n• Quantum computing concepts and algorithms\n• QuantumChain platform features and usage\n• Blockchain technology and smart contracts\n• Quantum job submission and verification\n• MegaETH testnet integration\n\nPlease ask me a question related to these topics, and I'll provide detailed guidance.",
        confidence: 100,
        sources: ["QuantumChain AI Assistant"],
        timestamp: Date.now()
      });
    }

    // Find relevant knowledge
    const relevantContent = findRelevantKnowledge(message);
    
    return NextResponse.json({ 
      response: relevantContent,
      confidence: 95,
      sources: ["QuantumChain Knowledge Base", "Technical Documentation"],
      timestamp: Date.now(),
      messageLength: message.length
    });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process your request. Please try again.',
        timestamp: Date.now(),
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}