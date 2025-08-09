import { NextRequest, NextResponse } from 'next/server';

// Comprehensive technology knowledge base with embeddings simulation
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
• **Move**: Facebook's language for Aptos and Sui blockchains

**Development Frameworks:**
• **Hardhat**: Comprehensive Ethereum development environment
• **Foundry**: Fast, portable toolkit written in Rust
• **Truffle**: Mature framework with extensive ecosystem
• **Anchor**: Solana program development framework

**Web3 Integration:**
• **ethers.js**: Modern, lightweight Ethereum library
• **web3.js**: Original Ethereum JavaScript API
• **wagmi**: React hooks for Ethereum with TypeScript
• **RainbowKit**: Beautiful wallet connection components

**Security Best Practices:**
• Use OpenZeppelin contracts for standard implementations
• Implement proper access controls and role-based permissions
• Follow Checks-Effects-Interactions pattern
• Conduct thorough testing and formal verification`,
    confidence: 96,
    sources: ["Ethereum Foundation", "OpenZeppelin", "ConsenSys"]
  },

  "artificial intelligence": {
    content: `Artificial Intelligence encompasses machine learning, deep learning, and cognitive computing systems.

**Machine Learning Types:**
• **Supervised Learning**: Classification and regression with labeled data
• **Unsupervised Learning**: Clustering and pattern discovery
• **Reinforcement Learning**: Agent-based learning through rewards
• **Self-Supervised Learning**: Learning from unlabeled data

**Deep Learning Architectures:**
• **Transformers**: Attention mechanism for NLP (GPT, BERT, Claude)
• **CNNs**: Convolutional networks for computer vision
• **RNNs/LSTMs**: Sequential data and time series analysis
• **GANs**: Generative Adversarial Networks for content creation

**Modern AI Frameworks:**
• **PyTorch**: Dynamic computation graphs, research-friendly
• **TensorFlow**: Production-ready with extensive ecosystem
• **JAX**: High-performance ML research with XLA
• **Hugging Face**: Pre-trained models and transformers

**Large Language Models:**
• **GPT-4**: Multimodal capabilities and reasoning
• **Claude**: Constitutional AI with safety measures
• **LLaMA**: Meta's efficient language model family
• **Gemini**: Google's multimodal AI system`,
    confidence: 94,
    sources: ["OpenAI", "Anthropic", "Google DeepMind"]
  }
};

// Technology keywords for filtering
const TECH_KEYWORDS = [
  'programming', 'software', 'development', 'code', 'algorithm', 'quantum',
  'blockchain', 'cryptocurrency', 'ai', 'machine learning', 'neural network',
  'javascript', 'python', 'react', 'node', 'typescript', 'solidity',
  'cloud', 'aws', 'azure', 'docker', 'kubernetes', 'database', 'api',
  'security', 'encryption', 'web3', 'smart contract', 'defi', 'nft'
];

function isTechRelated(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return TECH_KEYWORDS.some(keyword => lowerQuery.includes(keyword));
}

function findRelevantKnowledge(query: string): string {
  const lowerQuery = query.toLowerCase();
  
  // Check for specific topics in knowledge base
  for (const [topic, data] of Object.entries(TECH_KNOWLEDGE_BASE)) {
    if (lowerQuery.includes(topic.replace(/ /g, '')) || 
        topic.split(' ').some(word => lowerQuery.includes(word))) {
      return data.content;
    }
  }
  
  // Specific technology responses
  if (lowerQuery.includes("react") || lowerQuery.includes("jsx")) {
    return `React is a JavaScript library for building user interfaces with component-based architecture:

**Core Concepts:**
• **Components**: Reusable UI building blocks
• **JSX**: JavaScript syntax extension for HTML-like code
• **Hooks**: useState, useEffect, useContext for state management
• **Virtual DOM**: Efficient rendering through reconciliation
• **Props**: Data passing between components

**Best Practices:**
• Use functional components with hooks
• Implement proper error boundaries
• Optimize with React.memo and useMemo
• Follow single responsibility principle
• Use TypeScript for type safety`;
  }
  
  if (lowerQuery.includes("python")) {
    return `Python is a versatile, high-level programming language:

**Key Features:**
• **Readable Syntax**: Clean, intuitive code structure
• **Extensive Libraries**: NumPy, Pandas, TensorFlow, Django
• **Cross-Platform**: Runs on Windows, macOS, Linux
• **Interpreted**: No compilation step required

**Popular Frameworks:**
• **Web**: Django, FastAPI, Flask
• **Data Science**: Jupyter, Pandas, Matplotlib
• **AI/ML**: TensorFlow, PyTorch, Scikit-learn
• **Automation**: Selenium, Beautiful Soup`;
  }

  if (lowerQuery.includes("javascript") || lowerQuery.includes("js")) {
    return `JavaScript is the language of the web and modern development:

**Core Features:**
• **Dynamic Typing**: Flexible variable types
• **Event-Driven**: Perfect for interactive applications
• **Asynchronous**: Promises, async/await for non-blocking code
• **Prototype-Based**: Object-oriented programming model

**Modern JavaScript (ES6+):**
• **Arrow Functions**: Concise function syntax
• **Destructuring**: Extract values from arrays/objects
• **Modules**: Import/export for code organization
• **Template Literals**: String interpolation with backticks

**Popular Frameworks & Libraries:**
• **Frontend**: React, Vue.js, Angular, Svelte
• **Backend**: Node.js, Express.js, Nest.js
• **Mobile**: React Native, Ionic
• **Desktop**: Electron, Tauri`;
  }

  if (lowerQuery.includes("typescript") || lowerQuery.includes("ts")) {
    return `TypeScript is JavaScript with static type definitions:

**Key Benefits:**
• **Type Safety**: Catch errors at compile time
• **Better IDE Support**: Enhanced autocomplete and refactoring
• **Large Codebase Management**: Easier to maintain complex projects
• **Modern JavaScript Features**: Latest ECMAScript support

**Type System:**
• **Basic Types**: string, number, boolean, array
• **Interfaces**: Define object shapes and contracts
• **Generics**: Reusable components with type parameters
• **Union Types**: Variables that can be multiple types

**Best Practices:**
• Use strict mode for better type checking
• Define interfaces for API responses
• Leverage utility types (Partial, Pick, Omit)
• Use type guards for runtime type checking`;
  }

  if (lowerQuery.includes("docker") || lowerQuery.includes("container")) {
    return `Docker revolutionizes application deployment through containerization:

**Core Concepts:**
• **Images**: Read-only templates for creating containers
• **Containers**: Lightweight, portable runtime environments
• **Dockerfile**: Instructions for building custom images
• **Volumes**: Persistent data storage for containers

**Key Commands:**
• **docker build**: Create images from Dockerfile
• **docker run**: Start containers from images
• **docker-compose**: Multi-container application orchestration
• **docker push/pull**: Share images via registries

**Best Practices:**
• Use multi-stage builds for smaller images
• Implement proper layer caching
• Use .dockerignore to exclude unnecessary files
• Run containers as non-root users for security`;
  }

  // Default tech response
  return `I can provide detailed guidance on this technology topic. Could you be more specific about:

• Implementation details and best practices
• Architecture and design patterns  
• Performance optimization techniques
• Security considerations
• Tool recommendations and comparisons
• Learning resources and roadmaps

The more specific your question, the more targeted my response will be.`;
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

    // Check if query is tech-related
    if (!isTechRelated(message)) {
      return NextResponse.json({
        response: "I'm a specialized AI assistant focused exclusively on technology topics. I can help you with:\n\n• Programming and software development\n• Quantum computing and algorithms\n• Blockchain and cryptocurrency\n• AI and machine learning\n• Cloud computing and DevOps\n• Cybersecurity and system architecture\n• Web and mobile development\n• Database design and optimization\n\nPlease ask me a technology-related question, and I'll provide detailed, expert-level guidance.",
        confidence: 100,
        sources: ["AI Assistant Guidelines"]
      });
    }

    // Use RAG-like approach with knowledge base
    const relevantContent = findRelevantKnowledge(message);
    
    return NextResponse.json({ 
      response: relevantContent,
      confidence: 95,
      sources: ["QuantumChain Knowledge Base", "Technical Documentation"]
    });

  } catch (error) {
    console.error('AI API error:', error);
    return NextResponse.json(
      { error: 'Failed to process your request. Please try again.' },
      { status: 500 }
    );
  }
}