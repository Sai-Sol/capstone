import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Project-related keywords for filtering
const PROJECT_KEYWORDS = [
  'quantum', 'blockchain', 'quantumchain', 'megaeth', 'smart contract',
  'qasm', 'qubit', 'bell state', 'entanglement', 'superposition',
  'grover', 'shor', 'algorithm', 'circuit', 'gate', 'measurement',
  'decoherence', 'teleportation', 'cryptography', 'ethereum',
  'metamask', 'wallet', 'transaction', 'gas', 'mining', 'dapp',
  'web3', 'defi', 'nft', 'token', 'solidity', 'provider',
  'google willow', 'ibm condor', 'amazon braket', 'computing',
  'tamper-proof', 'immutable', 'verification', 'logging'
];

function isProjectRelated(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return PROJECT_KEYWORDS.some(keyword => 
    lowerQuery.includes(keyword.toLowerCase())
  );
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

    // Check if the query is project-related
    if (!isProjectRelated(message)) {
      return NextResponse.json({
        response: "I can only answer questions related to the QuantumChain project, quantum computing, blockchain technology, and our platform features. Please ask me something about quantum algorithms, blockchain integration, smart contracts, or our supported quantum providers (Google Willow, IBM Condor, Amazon Braket)."
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Enhanced system prompt with project context
    const systemPrompt = `You are an AI assistant specialized in the QuantumChain project - a blockchain-based quantum computing platform. 

    Key project details:
    - QuantumChain combines quantum computing with blockchain for tamper-proof quantum job logging
    - Supports Google Willow (105 qubits), IBM Condor (1121 qubits), and Amazon Braket (256 qubits)
    - Uses MegaETH L2 blockchain for immutable logging with contract address 0xd1471126F18d76be253625CcA75e16a0F1C5B3e2
    - Features include quantum job submission, QASM programming, blockchain verification, gas optimization
    - Built with Next.js, TypeScript, Tailwind CSS, Ethers.js, and MetaMask integration
    - Provides real-time monitoring, priority processing, and cross-chain bridging
    - Includes DeFi features like staking, yield farming, and token swapping

    Answer questions about:
    - Quantum computing concepts (qubits, gates, algorithms, circuits)
    - Blockchain technology and smart contracts
    - QuantumChain platform features and usage
    - Supported quantum providers and their capabilities
    - QASM programming and quantum algorithms
    - Platform security and verification methods

    Keep responses informative, technical when appropriate, and focused on the project context.`;

    const fullPrompt = `${systemPrompt}\n\nUser question: ${message}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });

  } catch (error) {
    console.error('Gemini API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}