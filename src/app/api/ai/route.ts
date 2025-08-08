import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Technology-related keywords for filtering
const TECH_KEYWORDS = [
  // Programming & Development
  'programming', 'software', 'development', 'code', 'coding', 'algorithm', 'data structure',
  'javascript', 'typescript', 'python', 'java', 'c++', 'rust', 'go', 'swift', 'kotlin',
  'react', 'vue', 'angular', 'node', 'express', 'django', 'flask', 'spring', 'laravel',
  
  // Web & Mobile
  'web', 'frontend', 'backend', 'fullstack', 'html', 'css', 'responsive', 'mobile',
  'app', 'application', 'ui', 'ux', 'design', 'framework', 'library', 'api', 'rest',
  'graphql', 'websocket', 'pwa', 'spa', 'ssr', 'ssg', 'jamstack',
  
  // Database & Storage
  'database', 'sql', 'nosql', 'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch',
  'orm', 'query', 'index', 'schema', 'migration', 'backup', 'replication',
  
  // Cloud & Infrastructure
  'cloud', 'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'container', 'microservices',
  'serverless', 'lambda', 'devops', 'ci/cd', 'deployment', 'infrastructure', 'scaling',
  'load balancer', 'cdn', 'vpc', 'ec2', 's3', 'rds',
  
  // AI & Machine Learning
  'ai', 'artificial intelligence', 'machine learning', 'ml', 'deep learning', 'neural network',
  'tensorflow', 'pytorch', 'scikit-learn', 'nlp', 'computer vision', 'reinforcement learning',
  'transformer', 'gpt', 'bert', 'llm', 'model', 'training', 'inference',
  
  // Blockchain & Crypto
  'blockchain', 'cryptocurrency', 'bitcoin', 'ethereum', 'smart contract', 'solidity',
  'web3', 'defi', 'nft', 'token', 'wallet', 'metamask', 'gas', 'mining', 'consensus',
  'proof of stake', 'proof of work', 'layer 2', 'rollup',
  
  // Security
  'security', 'cybersecurity', 'encryption', 'authentication', 'authorization', 'oauth',
  'jwt', 'ssl', 'tls', 'firewall', 'vulnerability', 'penetration testing', 'owasp',
  'xss', 'sql injection', 'csrf', 'https',
  
  // Quantum Computing
  'quantum', 'qubit', 'superposition', 'entanglement', 'quantum computing', 'qasm',
  'quantum algorithm', 'shor', 'grover', 'quantum gate', 'quantum circuit',
  
  // General Tech
  'technology', 'tech', 'computer', 'computing', 'system', 'architecture', 'performance',
  'optimization', 'testing', 'debugging', 'version control', 'git', 'github', 'open source',
  'agile', 'scrum', 'methodology', 'best practices', 'design patterns'
];

function isTechRelated(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  return TECH_KEYWORDS.some(keyword => 
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

    // Check if the query is tech-related
    if (!isTechRelated(message)) {
      return NextResponse.json({
        response: "I'm a specialized AI assistant focused exclusively on technology topics. I can help you with:\n\n• Programming and software development\n• AI and machine learning\n• Blockchain and cryptocurrency\n• Cloud computing and DevOps\n• Cybersecurity and system architecture\n• Web and mobile development\n• Database design and optimization\n• Quantum computing\n\nPlease ask me a technology-related question, and I'll provide detailed, expert-level guidance."
      });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Enhanced system prompt for technology focus
    const systemPrompt = `You are an advanced AI assistant specialized exclusively in technology topics. You are an expert in:

    **Core Technology Areas:**
    • Programming languages (JavaScript, Python, Java, C++, Rust, Go, Swift, Kotlin, etc.)
    • Web development (React, Vue, Angular, Node.js, Django, Spring Boot, etc.)
    • Mobile development (React Native, Flutter, iOS, Android)
    • Database technologies (SQL, NoSQL, graph databases, time-series)
    • Cloud computing (AWS, Azure, GCP, serverless, containers)
    • DevOps and CI/CD (Docker, Kubernetes, Jenkins, GitHub Actions)
    • Cybersecurity (encryption, authentication, penetration testing, OWASP)
    • AI and Machine Learning (TensorFlow, PyTorch, neural networks, NLP, computer vision)
    • Blockchain and cryptocurrency (Ethereum, smart contracts, DeFi, Web3)
    • Quantum computing (qubits, quantum algorithms, quantum gates, QASM)
    • System architecture and design patterns
    • Performance optimization and scalability
    • Software testing and quality assurance

    **Response Guidelines:**
    • Provide detailed, technical explanations with practical examples
    • Include code snippets when relevant
    • Mention best practices and common pitfalls
    • Suggest tools, frameworks, and resources
    • Explain complex concepts in an accessible way
    • Focus on current industry standards and emerging trends
    • Include performance and security considerations
    • Provide step-by-step guidance when appropriate

    **Restrictions:**
    • ONLY answer technology-related questions
    • Do NOT discuss non-technical topics (politics, entertainment, personal advice, etc.)
    • If asked about non-tech topics, politely redirect to technology subjects
    • Maintain focus on practical, actionable technical guidance

    You are knowledgeable about the latest developments in technology and can provide expert-level guidance on any technical topic.`;

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