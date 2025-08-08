"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Send, 
  User, 
  Atom, 
  Zap, 
  MessageSquare,
  Lightbulb,
  Code,
  BookOpen,
  Cpu,
  Shield,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Brain,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Cloud,
  Lock,
  TrendingUp,
  BarChart3,
  Settings,
  Search,
  Star,
  Filter,
  Download,
  Share
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
  category?: string;
  confidence?: number;
  sources?: string[];
}

interface QuickAction {
  label: string;
  query: string;
  icon: any;
  category: string;
  description: string;
}

interface AICapability {
  name: string;
  description: string;
  icon: any;
  examples: string[];
}

export default function AdvancedAIAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your advanced AI assistant specialized in technology. I can help you with programming, software development, AI/ML, blockchain, cybersecurity, cloud computing, and all tech-related topics. I don't discuss non-technical subjects. What would you like to explore?",
      timestamp: Date.now(),
      category: 'greeting',
      confidence: 100
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    { 
      label: "Quantum Basics", 
      query: "Explain quantum computing principles and applications", 
      icon: Atom, 
      category: "quantum",
      description: "Qubits, superposition, quantum algorithms"
    },
    { 
      label: "Blockchain Dev", 
      query: "How do I develop smart contracts and DApps?", 
      icon: Code, 
      category: "blockchain",
      description: "Smart contracts, Web3, DApps"
    },
    { 
      label: "AI & Machine Learning", 
      query: "What are the latest trends in AI and machine learning?", 
      icon: Brain, 
      category: "ai",
      description: "Neural networks, deep learning, AI"
    },
    { 
      label: "Cloud Architecture", 
      query: "Design scalable cloud infrastructure", 
      icon: Cloud, 
      category: "cloud",
      description: "AWS, Azure, GCP, microservices"
    },
    { 
      label: "Cybersecurity", 
      query: "Best practices for application security", 
      icon: Shield, 
      category: "security",
      description: "Security, encryption, threat prevention"
    },
    { 
      label: "Mobile Development", 
      query: "Modern mobile app development strategies", 
      icon: Smartphone, 
      category: "mobile",
      description: "React Native, Flutter, native apps"
    },
    { 
      label: "Database Design", 
      query: "Database optimization and design patterns", 
      icon: Database, 
      category: "database",
      description: "SQL, NoSQL, performance optimization"
    },
    { 
      label: "DevOps & CI/CD", 
      query: "DevOps best practices and automation", 
      icon: Settings, 
      category: "devops",
      description: "Docker, Kubernetes, CI/CD pipelines"
    }
  ];

  const aiCapabilities: AICapability[] = [
    {
      name: "Programming Languages",
      description: "Expert guidance in 20+ programming languages",
      icon: Code,
      examples: ["JavaScript/TypeScript", "Python", "Rust", "Go", "Java", "C++"]
    },
    {
      name: "Frameworks & Libraries",
      description: "Deep knowledge of modern development frameworks",
      icon: Zap,
      examples: ["React/Next.js", "Node.js", "Django", "Spring Boot", "TensorFlow"]
    },
    {
      name: "System Architecture",
      description: "Design scalable and robust system architectures",
      icon: Monitor,
      examples: ["Microservices", "Event-driven", "Serverless", "Distributed systems"]
    },
    {
      name: "Data Science & Analytics",
      description: "Advanced data analysis and machine learning techniques",
      icon: BarChart3,
      examples: ["Data pipelines", "ML models", "Statistical analysis", "Big data"]
    }
  ];

  // Comprehensive tech knowledge base
  const techResponses: Record<string, { content: string; confidence: number; sources: string[] }> = {
    "quantum computing": {
      content: `Quantum computing leverages quantum mechanical phenomena to process information in fundamentally new ways:

**Core Principles:**
• **Qubits**: Unlike classical bits (0 or 1), qubits can exist in superposition of both states
• **Superposition**: Enables parallel computation across multiple states simultaneously
• **Entanglement**: Creates correlations between qubits that persist regardless of distance
• **Quantum Interference**: Amplifies correct answers and cancels incorrect ones

**Key Algorithms:**
• **Shor's Algorithm**: Exponential speedup for integer factorization (breaks RSA encryption)
• **Grover's Algorithm**: Quadratic speedup for unstructured search problems
• **VQE**: Variational Quantum Eigensolver for chemistry and optimization
• **QAOA**: Quantum Approximate Optimization Algorithm for combinatorial problems

**Current Hardware:**
• **Superconducting**: IBM, Google (Willow chip with error correction breakthrough)
• **Trapped Ion**: IonQ, Honeywell (high fidelity, slower gates)
• **Photonic**: Xanadu, PsiQuantum (room temperature operation)
• **Neutral Atom**: QuEra, Pasqal (programmable connectivity)

**Applications:**
• Cryptography and security
• Drug discovery and molecular simulation
• Financial modeling and risk analysis
• Optimization problems in logistics
• Machine learning acceleration`,
      confidence: 95,
      sources: ["IBM Quantum", "Google AI", "Nature Physics"]
    },

    "blockchain development": {
      content: `Modern blockchain development encompasses multiple layers and technologies:

**Smart Contract Development:**
• **Solidity**: Primary language for Ethereum smart contracts
• **Vyper**: Python-like alternative with enhanced security features
• **Rust**: Used for Solana, Polkadot, and other high-performance chains
• **Move**: Facebook's Diem language, now used by Aptos and Sui

**Development Frameworks:**
• **Hardhat**: Comprehensive Ethereum development environment with testing
• **Foundry**: Fast, portable toolkit written in Rust
• **Truffle**: Mature framework with extensive plugin ecosystem
• **Anchor**: Framework for Solana program development

**Frontend Integration:**
• **ethers.js**: Modern, lightweight Ethereum library
• **web3.js**: Original Ethereum JavaScript API
• **wagmi**: React hooks for Ethereum with TypeScript support
• **RainbowKit**: Beautiful wallet connection components

**Security Best Practices:**
• Use OpenZeppelin contracts for standard implementations
• Implement proper access controls and role-based permissions
• Follow Checks-Effects-Interactions pattern
• Conduct thorough testing and formal verification
• Regular security audits and bug bounty programs

**Layer 2 Solutions:**
• **Optimistic Rollups**: Arbitrum, Optimism (7-day withdrawal period)
• **ZK Rollups**: zkSync, StarkNet, Polygon zkEVM (instant finality)
• **State Channels**: Lightning Network concept for Ethereum
• **Sidechains**: Polygon PoS, Gnosis Chain

**DeFi Protocols:**
• **AMMs**: Uniswap V3 concentrated liquidity, Curve stable swaps
• **Lending**: Aave flash loans, Compound governance tokens
• **Derivatives**: dYdX perpetuals, Synthetix synthetic assets
• **Yield Farming**: Convex, Yearn vaults, Beefy Finance`,
      confidence: 98,
      sources: ["Ethereum Foundation", "ConsenSys", "OpenZeppelin"]
    },

    "artificial intelligence": {
      content: `AI and Machine Learning represent the cutting edge of computational intelligence:

**Machine Learning Paradigms:**
• **Supervised Learning**: Classification and regression with labeled data
• **Unsupervised Learning**: Clustering, dimensionality reduction, anomaly detection
• **Reinforcement Learning**: Agent-based learning through rewards and penalties
• **Self-Supervised Learning**: Learning representations from unlabeled data

**Deep Learning Architectures:**
• **Transformers**: Attention mechanism revolutionizing NLP (GPT, BERT, T5)
• **Convolutional Neural Networks**: Computer vision and image processing
• **Recurrent Neural Networks**: Sequential data and time series analysis
• **Graph Neural Networks**: Learning on graph-structured data

**Modern AI Frameworks:**
• **PyTorch**: Dynamic computation graphs, research-friendly
• **TensorFlow**: Production-ready, extensive ecosystem
• **JAX**: High-performance ML research with XLA compilation
• **Hugging Face**: Pre-trained models and transformers library

**Large Language Models:**
• **GPT-4**: Multimodal capabilities, reasoning, and code generation
• **Claude**: Constitutional AI with enhanced safety measures
• **LLaMA**: Meta's efficient large language model family
• **PaLM**: Google's Pathways Language Model with emergent abilities

**AI Applications:**
• **Computer Vision**: Object detection, image segmentation, facial recognition
• **Natural Language Processing**: Translation, summarization, sentiment analysis
• **Robotics**: Autonomous navigation, manipulation, human-robot interaction
• **Healthcare**: Drug discovery, medical imaging, personalized treatment
• **Finance**: Algorithmic trading, fraud detection, risk assessment

**Emerging Trends:**
• **Multimodal AI**: Vision-language models, audio-visual understanding
• **Federated Learning**: Privacy-preserving distributed training
• **Neural Architecture Search**: Automated model design
• **Explainable AI**: Interpretable and transparent AI systems`,
      confidence: 96,
      sources: ["OpenAI", "Google DeepMind", "Stanford AI Lab"]
    },

    "cloud computing": {
      content: `Cloud computing provides scalable, on-demand computing resources:

**Service Models:**
• **IaaS**: Infrastructure as a Service (EC2, Compute Engine, Azure VMs)
• **PaaS**: Platform as a Service (App Engine, Heroku, Azure App Service)
• **SaaS**: Software as a Service (Office 365, Salesforce, Google Workspace)
• **FaaS**: Function as a Service (Lambda, Cloud Functions, Azure Functions)

**Major Cloud Providers:**
• **AWS**: Market leader with 200+ services, strong enterprise focus
• **Microsoft Azure**: Hybrid cloud strength, enterprise integration
• **Google Cloud**: AI/ML leadership, data analytics capabilities
• **Alibaba Cloud**: Asia-Pacific dominance, competitive pricing

**Container Orchestration:**
• **Kubernetes**: Industry standard for container orchestration
• **Docker Swarm**: Simpler alternative for smaller deployments
• **Amazon ECS**: AWS-native container service
• **Google GKE**: Managed Kubernetes with autopilot mode

**Serverless Architecture:**
• **Event-driven**: Functions triggered by events (HTTP, database changes)
• **Auto-scaling**: Automatic scaling based on demand
• **Pay-per-use**: Cost optimization through usage-based pricing
• **Cold starts**: Latency considerations for infrequently used functions

**Cloud-Native Patterns:**
• **Microservices**: Decomposed applications with independent deployment
• **API Gateway**: Centralized API management and security
• **Service Mesh**: Inter-service communication and observability
• **Circuit Breaker**: Fault tolerance and graceful degradation

**Security & Compliance:**
• **Identity and Access Management**: Role-based access control
• **Encryption**: Data at rest and in transit protection
• **Compliance**: SOC 2, HIPAA, GDPR, PCI DSS certifications
• **Zero Trust**: Never trust, always verify security model`,
      confidence: 94,
      sources: ["AWS Documentation", "Google Cloud", "Microsoft Azure"]
    },

    "cybersecurity": {
      content: `Cybersecurity encompasses protecting digital assets and systems from threats:

**Security Fundamentals:**
• **CIA Triad**: Confidentiality, Integrity, Availability
• **Defense in Depth**: Multiple layers of security controls
• **Zero Trust**: Never trust, always verify approach
• **Principle of Least Privilege**: Minimal access rights for users/systems

**Common Attack Vectors:**
• **Social Engineering**: Phishing, pretexting, baiting attacks
• **Malware**: Viruses, ransomware, trojans, rootkits
• **Network Attacks**: DDoS, man-in-the-middle, packet sniffing
• **Web Application**: SQL injection, XSS, CSRF, authentication bypass

**Security Technologies:**
• **Encryption**: AES-256, RSA, ECC for data protection
• **PKI**: Public Key Infrastructure for digital certificates
• **VPN**: Virtual Private Networks for secure remote access
• **SIEM**: Security Information and Event Management systems

**Application Security:**
• **OWASP Top 10**: Most critical web application security risks
• **Secure Coding**: Input validation, output encoding, error handling
• **Static Analysis**: Code scanning for vulnerabilities (SonarQube, Checkmarx)
• **Dynamic Testing**: Runtime security testing (DAST, IAST)

**Network Security:**
• **Firewalls**: Next-generation firewalls with deep packet inspection
• **IDS/IPS**: Intrusion Detection and Prevention Systems
• **Network Segmentation**: Micro-segmentation and VLANs
• **DNS Security**: DNS filtering and threat intelligence

**Incident Response:**
• **Preparation**: Incident response plan and team training
• **Detection**: Monitoring and alerting systems
• **Containment**: Isolating affected systems
• **Recovery**: System restoration and lessons learned

**Compliance Frameworks:**
• **ISO 27001**: International security management standard
• **NIST**: Cybersecurity Framework for risk management
• **SOC 2**: Service Organization Control for service providers
• **GDPR**: Data protection regulation compliance`,
      confidence: 97,
      sources: ["NIST", "OWASP", "SANS Institute"]
    },

    "software architecture": {
      content: `Software architecture defines the high-level structure and design of software systems:

**Architectural Patterns:**
• **Monolithic**: Single deployable unit, simple but limited scalability
• **Microservices**: Distributed services with independent deployment
• **Service-Oriented Architecture (SOA)**: Enterprise service integration
• **Event-Driven**: Asynchronous communication through events

**Design Principles:**
• **SOLID**: Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion
• **DRY**: Don't Repeat Yourself - eliminate code duplication
• **KISS**: Keep It Simple, Stupid - favor simplicity over complexity
• **YAGNI**: You Aren't Gonna Need It - avoid premature optimization

**Scalability Patterns:**
• **Horizontal Scaling**: Adding more servers to handle increased load
• **Vertical Scaling**: Increasing server capacity (CPU, RAM)
• **Load Balancing**: Distributing traffic across multiple servers
• **Caching**: Redis, Memcached for performance optimization

**Data Management:**
• **CQRS**: Command Query Responsibility Segregation
• **Event Sourcing**: Storing state changes as events
• **Database Sharding**: Horizontal partitioning of data
• **Polyglot Persistence**: Using different databases for different needs

**Communication Patterns:**
• **REST APIs**: Stateless, resource-based web services
• **GraphQL**: Query language for APIs with flexible data fetching
• **gRPC**: High-performance RPC framework with Protocol Buffers
• **Message Queues**: Asynchronous communication (RabbitMQ, Apache Kafka)

**Quality Attributes:**
• **Performance**: Response time, throughput, resource utilization
• **Reliability**: Fault tolerance, error handling, graceful degradation
• **Security**: Authentication, authorization, data protection
• **Maintainability**: Code quality, documentation, testability
• **Scalability**: Ability to handle increased load and growth`,
      confidence: 93,
      sources: ["Martin Fowler", "Clean Architecture", "System Design Primer"]
    },

    "web development": {
      content: `Modern web development encompasses frontend, backend, and full-stack technologies:

**Frontend Technologies:**
• **React**: Component-based library with virtual DOM and hooks
• **Vue.js**: Progressive framework with excellent developer experience
• **Angular**: Full-featured framework with TypeScript by default
• **Svelte**: Compile-time optimized framework with minimal runtime

**Backend Technologies:**
• **Node.js**: JavaScript runtime for server-side development
• **Python**: Django, FastAPI, Flask for rapid development
• **Java**: Spring Boot for enterprise applications
• **Go**: High-performance concurrent applications
• **Rust**: Memory-safe systems programming

**Full-Stack Frameworks:**
• **Next.js**: React framework with SSR, SSG, and API routes
• **Nuxt.js**: Vue.js framework with universal applications
• **SvelteKit**: Full-stack Svelte framework
• **Remix**: Web standards-focused React framework

**Database Technologies:**
• **Relational**: PostgreSQL, MySQL, SQLite for structured data
• **NoSQL**: MongoDB, DynamoDB, Cassandra for flexible schemas
• **Graph**: Neo4j, Amazon Neptune for relationship-heavy data
• **Time-series**: InfluxDB, TimescaleDB for metrics and monitoring

**Development Tools:**
• **Version Control**: Git with GitHub, GitLab, or Bitbucket
• **Package Managers**: npm, yarn, pnpm for dependency management
• **Build Tools**: Webpack, Vite, Rollup for bundling and optimization
• **Testing**: Jest, Cypress, Playwright for automated testing

**Performance Optimization:**
• **Code Splitting**: Lazy loading and dynamic imports
• **Caching**: Browser caching, CDN, service workers
• **Image Optimization**: WebP, AVIF, responsive images
• **Bundle Analysis**: Webpack Bundle Analyzer, source map explorer

**Security Considerations:**
• **HTTPS**: SSL/TLS encryption for data in transit
• **Content Security Policy**: XSS protection through CSP headers
• **Authentication**: JWT, OAuth 2.0, OpenID Connect
• **Input Validation**: Sanitization and validation of user inputs`,
      confidence: 95,
      sources: ["MDN Web Docs", "Web.dev", "Frontend Masters"]
    },

    "mobile development": {
      content: `Mobile development strategies for iOS and Android platforms:

**Cross-Platform Frameworks:**
• **React Native**: JavaScript-based with native performance
• **Flutter**: Dart language with custom rendering engine
• **Xamarin**: C# development for Microsoft ecosystem
• **Ionic**: Web technologies with native capabilities

**Native Development:**
• **iOS**: Swift/Objective-C with Xcode IDE
• **Android**: Kotlin/Java with Android Studio
• **Platform-specific**: Access to all native APIs and features
• **Performance**: Optimal performance for resource-intensive apps

**Architecture Patterns:**
• **MVVM**: Model-View-ViewModel for data binding
• **MVP**: Model-View-Presenter for testable code
• **Clean Architecture**: Dependency inversion and separation of concerns
• **Redux/MobX**: State management for complex applications

**Performance Optimization:**
• **Lazy Loading**: Load content as needed to reduce initial load time
• **Image Optimization**: Compress and cache images efficiently
• **Memory Management**: Proper cleanup and garbage collection
• **Network Optimization**: Minimize API calls and data transfer

**Testing Strategies:**
• **Unit Testing**: Test individual components and functions
• **Integration Testing**: Test component interactions
• **UI Testing**: Automated user interface testing
• **Device Testing**: Test on various devices and screen sizes

**Deployment & Distribution:**
• **App Store Optimization**: Keywords, screenshots, descriptions
• **CI/CD Pipelines**: Automated building, testing, and deployment
• **Beta Testing**: TestFlight (iOS), Google Play Console (Android)
• **Analytics**: User behavior tracking and crash reporting`,
      confidence: 92,
      sources: ["Apple Developer", "Android Developers", "React Native Docs"]
    },

    "devops": {
      content: `DevOps practices bridge development and operations for faster, reliable software delivery:

**Core Principles:**
• **Collaboration**: Breaking down silos between dev and ops teams
• **Automation**: Reducing manual processes and human error
• **Continuous Integration**: Frequent code integration and testing
• **Continuous Deployment**: Automated deployment to production

**CI/CD Pipeline:**
• **Source Control**: Git-based workflows with feature branches
• **Build Automation**: Compile, test, and package applications
• **Testing**: Unit, integration, and end-to-end automated tests
• **Deployment**: Blue-green, canary, and rolling deployments

**Containerization:**
• **Docker**: Lightweight, portable application containers
• **Container Registries**: Docker Hub, Amazon ECR, Google GCR
• **Multi-stage Builds**: Optimized container images
• **Security Scanning**: Vulnerability assessment for container images

**Orchestration:**
• **Kubernetes**: Container orchestration with auto-scaling
• **Docker Swarm**: Simpler alternative for smaller deployments
• **Service Mesh**: Istio, Linkerd for microservices communication
• **Helm**: Package manager for Kubernetes applications

**Infrastructure as Code:**
• **Terraform**: Multi-cloud infrastructure provisioning
• **AWS CloudFormation**: AWS-native infrastructure templates
• **Ansible**: Configuration management and automation
• **Pulumi**: Infrastructure as code using familiar programming languages

**Monitoring & Observability:**
• **Metrics**: Prometheus, Grafana for system monitoring
• **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
• **Tracing**: Jaeger, Zipkin for distributed tracing
• **APM**: Application Performance Monitoring (New Relic, Datadog)

**Security Integration:**
• **DevSecOps**: Security integrated throughout the pipeline
• **Static Analysis**: Code security scanning (SonarQube, Checkmarx)
• **Dependency Scanning**: Vulnerability assessment for libraries
• **Runtime Protection**: WAF, RASP for production security`,
      confidence: 94,
      sources: ["DevOps Institute", "CNCF", "Docker Documentation"]
    }
  };

  const generateResponse = (query: string): { content: string; confidence: number; sources: string[] } => {
    const lowerQuery = query.toLowerCase();
    
    // Check if query is tech-related
    const techKeywords = [
      'programming', 'software', 'development', 'code', 'algorithm', 'database',
      'web', 'mobile', 'app', 'api', 'framework', 'library', 'javascript', 'python',
      'react', 'node', 'cloud', 'aws', 'azure', 'docker', 'kubernetes', 'devops',
      'security', 'encryption', 'blockchain', 'cryptocurrency', 'ai', 'machine learning',
      'neural network', 'quantum', 'computer', 'technology', 'tech', 'system',
      'architecture', 'microservices', 'database', 'sql', 'nosql', 'frontend',
      'backend', 'fullstack', 'html', 'css', 'typescript', 'java', 'c++', 'rust',
      'go', 'php', 'ruby', 'swift', 'kotlin', 'dart', 'flutter', 'android', 'ios'
    ];

    const isTechRelated = techKeywords.some(keyword => lowerQuery.includes(keyword));
    
    if (!isTechRelated) {
      return {
        content: "I'm a specialized AI assistant focused exclusively on technology topics. I can help you with:\n\n• Programming and software development\n• AI and machine learning\n• Blockchain and cryptocurrency\n• Cloud computing and DevOps\n• Cybersecurity and system architecture\n• Web and mobile development\n• Database design and optimization\n• Quantum computing\n\nPlease ask me a technology-related question, and I'll provide detailed, expert-level guidance.",
        confidence: 100,
        sources: ["AI Assistant Guidelines"]
      };
    }

    // Check for specific tech topics
    for (const [key, response] of Object.entries(techResponses)) {
      if (lowerQuery.includes(key.replace(/ /g, '')) || 
          lowerQuery.includes(key) ||
          key.split(' ').some(word => lowerQuery.includes(word))) {
        return response;
      }
    }
    
    // Specific technology responses
    if (lowerQuery.includes("react") || lowerQuery.includes("jsx")) {
      return {
        content: "React is a JavaScript library for building user interfaces with a component-based architecture. Key concepts include:\n\n• **Components**: Reusable UI building blocks\n• **JSX**: JavaScript syntax extension for writing HTML-like code\n• **Hooks**: useState, useEffect, useContext for state management\n• **Virtual DOM**: Efficient rendering through reconciliation\n• **Props**: Data passing between components\n• **State**: Component-level data management\n\nBest practices: Use functional components, implement proper error boundaries, optimize with React.memo and useMemo, and follow the single responsibility principle.",
        confidence: 96,
        sources: ["React Documentation", "React Team"]
      };
    }
    
    if (lowerQuery.includes("python")) {
      return {
        content: "Python is a versatile, high-level programming language known for its readability and extensive ecosystem:\n\n• **Web Development**: Django, FastAPI, Flask frameworks\n• **Data Science**: NumPy, Pandas, Matplotlib, Scikit-learn\n• **AI/ML**: TensorFlow, PyTorch, Keras for deep learning\n• **Automation**: Selenium, Beautiful Soup for web scraping\n• **DevOps**: Ansible, Fabric for infrastructure automation\n\nPython's philosophy emphasizes code readability and simplicity, making it ideal for rapid prototyping and production applications.",
        confidence: 95,
        sources: ["Python.org", "Python Enhancement Proposals"]
      };
    }

    if (lowerQuery.includes("kubernetes") || lowerQuery.includes("k8s")) {
      return {
        content: "Kubernetes is an open-source container orchestration platform that automates deployment, scaling, and management:\n\n• **Pods**: Smallest deployable units containing one or more containers\n• **Services**: Stable network endpoints for pod communication\n• **Deployments**: Declarative updates for pods and replica sets\n• **ConfigMaps/Secrets**: Configuration and sensitive data management\n• **Ingress**: HTTP/HTTPS routing to services\n• **Namespaces**: Virtual clusters for resource isolation\n\nKey benefits include auto-scaling, self-healing, rolling updates, and multi-cloud portability.",
        confidence: 94,
        sources: ["Kubernetes Documentation", "CNCF"]
      };
    }

    // Default tech response
    return {
      content: "I can provide detailed guidance on this technology topic. Could you be more specific about what aspect you'd like to explore? For example:\n\n• Implementation details and best practices\n• Architecture and design patterns\n• Performance optimization techniques\n• Security considerations\n• Tool recommendations and comparisons\n• Learning resources and roadmaps\n\nThe more specific your question, the more targeted and valuable my response will be.",
      confidence: 85,
      sources: ["General Tech Knowledge"]
    };
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setSearchHistory(prev => [inputValue, ...prev.slice(0, 9)]); // Keep last 10 searches
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const response = generateResponse(inputValue);
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: response.content,
        timestamp: Date.now(),
        category: 'response',
        confidence: response.confidence,
        sources: response.sources
      };

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const handleQuickAction = (query: string) => {
    setInputValue(query);
    setTimeout(() => handleSendMessage(), 100);
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: "Chat cleared! I'm ready to help you with any technology-related questions. What would you like to explore?",
      timestamp: Date.now(),
      category: 'greeting',
      confidence: 100
    }]);
  };

  const exportChat = () => {
    const chatData = {
      messages: messages,
      timestamp: new Date().toISOString(),
      totalMessages: messages.length
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tech-ai-chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Chat Exported",
      description: "Your conversation has been exported as JSON."
    });
  };

  const filteredActions = selectedCategory === "all" 
    ? quickActions 
    : quickActions.filter(action => action.category === selectedCategory);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-gradient-to-r from-primary via-purple-500 to-pink-500 p-4 rounded-2xl">
              <Brain className="h-12 w-12 text-white quantum-pulse" />
            </div>
          </div>
        </div>
        <h1 className="text-5xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 neon-text">
          Advanced AI Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Your expert AI companion for technology, programming, and software development
        </p>
        <div className="flex items-center justify-center gap-6 mt-6">
          <Badge variant="outline" className="text-blue-400 border-blue-400/50 px-4 py-2">
            <Sparkles className="mr-2 h-4 w-4" />
            GPT-4 Powered
          </Badge>
          <Badge variant="outline" className="text-green-400 border-green-400/50 px-4 py-2">
            <Shield className="mr-2 h-4 w-4" />
            Tech Specialized
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-400/50 px-4 py-2">
            <Zap className="mr-2 h-4 w-4" />
            Real-time
          </Badge>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Main Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="quantum-card h-[700px] flex flex-col shadow-2xl">
            <CardHeader className="pb-4 border-b border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-xl">
                    <Bot className="h-8 w-8 text-primary quantum-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-headline">Tech AI Assistant</CardTitle>
                    <CardDescription className="text-base">
                      Specialized in programming, AI, blockchain, and all technology domains
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={exportChat}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearChat}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Clear
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                <div className="space-y-6 py-6">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-4 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.type === 'bot' && (
                          <div className="p-3 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full shrink-0">
                            <Bot className="h-5 w-5 text-primary" />
                          </div>
                        )}
                        
                        <div className={`max-w-[85%] ${
                          message.type === 'user' 
                            ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground ml-auto rounded-2xl rounded-br-md' 
                            : 'bg-gradient-to-r from-muted/60 to-muted/40 border border-primary/10 rounded-2xl rounded-bl-md'
                        } p-5 shadow-lg`}>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                          
                          {/* Message metadata for bot responses */}
                          {message.type === 'bot' && message.confidence && (
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-primary/10">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  {message.confidence}% confidence
                                </Badge>
                                {message.sources && message.sources.length > 0 && (
                                  <Badge variant="outline" className="text-xs">
                                    {message.sources.length} sources
                                  </Badge>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(message.timestamp).toLocaleTimeString()}
                              </div>
                            </div>
                          )}
                          
                          {message.type === 'user' && (
                            <div className="text-xs opacity-70 mt-3 text-right">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          )}
                        </div>

                        {message.type === 'user' && (
                          <div className="p-3 bg-muted/50 rounded-full shrink-0">
                            <User className="h-5 w-5" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Enhanced Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4"
                    >
                      <div className="p-3 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <div className="bg-gradient-to-r from-muted/60 to-muted/40 border border-primary/10 p-5 rounded-2xl rounded-bl-md">
                        <div className="flex items-center gap-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-sm text-muted-foreground">AI is analyzing your query...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Enhanced Input Area */}
              <div className="p-6 border-t border-primary/20 bg-gradient-to-r from-background/50 to-muted/20">
                <div className="space-y-4">
                  {/* Search History */}
                  {searchHistory.length > 0 && (
                    <div className="flex items-center gap-2 overflow-x-auto pb-2">
                      <span className="text-xs text-muted-foreground shrink-0">Recent:</span>
                      {searchHistory.slice(0, 3).map((search, index) => (
                        <Button
                          key={index}
                          variant="ghost"
                          size="sm"
                          className="text-xs shrink-0 h-6"
                          onClick={() => setInputValue(search)}
                        >
                          {search.length > 20 ? `${search.slice(0, 20)}...` : search}
                        </Button>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask me about programming, AI, blockchain, cloud computing..."
                        className="quantum-input pl-10 h-12 text-base"
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        disabled={isTyping}
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isTyping}
                      className="quantum-button h-12 px-6"
                    >
                      <Send className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions with Categories */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Quick Topics
              </CardTitle>
              <CardDescription>Explore technology domains</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="quantum-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="quantum">Quantum Computing</SelectItem>
                  <SelectItem value="blockchain">Blockchain</SelectItem>
                  <SelectItem value="ai">AI & ML</SelectItem>
                  <SelectItem value="cloud">Cloud Computing</SelectItem>
                  <SelectItem value="security">Cybersecurity</SelectItem>
                  <SelectItem value="mobile">Mobile Dev</SelectItem>
                  <SelectItem value="database">Databases</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {filteredActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto p-4 text-left hover:bg-primary/5 hover:border-primary/30 transition-all duration-300"
                      onClick={() => handleQuickAction(action.query)}
                      disabled={isTyping}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <action.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">{action.label}</div>
                          <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                            {action.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" />
                AI Capabilities
              </CardTitle>
              <CardDescription>What I can help you with</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {aiCapabilities.map((capability, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 rounded-xl bg-gradient-to-r from-muted/20 to-muted/10 border border-primary/10"
                >
                  <div className="flex items-start gap-3">
                    <capability.icon className="h-5 w-5 text-primary mt-1" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm mb-1">{capability.name}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{capability.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {capability.examples.slice(0, 3).map((example, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {example}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* Tech Focus Notice */}
          <Card className="quantum-card border-amber-500/20 bg-amber-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-400">
                <AlertTriangle className="h-5 w-5" />
                Tech-Only Assistant
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="border-amber-500/20 bg-amber-500/5">
                <Sparkles className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  I'm exclusively focused on technology topics. I provide expert guidance on programming, 
                  software development, AI/ML, blockchain, cybersecurity, and related technical subjects. 
                  I don't discuss non-technical topics to ensure the highest quality tech assistance.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Performance Stats */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Session Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Messages:</span>
                <span className="font-mono">{messages.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Response:</span>
                <span className="font-mono">1.2s</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tech Focus:</span>
                <Badge variant="outline" className="text-green-400 border-green-400/50">
                  100%
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}