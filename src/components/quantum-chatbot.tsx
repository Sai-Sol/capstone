"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  RefreshCw
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
  category?: string;
}

interface QuickAction {
  label: string;
  query: string;
  icon: any;
  category: string;
}

export default function QuantumChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your Quantum Computing AI assistant. I can help you with quantum algorithms, circuit design, QuantumChain platform features, and blockchain integration. What would you like to know?",
      timestamp: Date.now(),
      category: 'greeting'
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    { label: "Explain Bell States", query: "What are Bell states in quantum computing?", icon: Atom, category: "theory" },
    { label: "QASM Tutorial", query: "How do I write QASM code?", icon: Code, category: "programming" },
    { label: "Quantum Algorithms", query: "What are the most important quantum algorithms?", icon: Lightbulb, category: "algorithms" },
    { label: "Platform Features", query: "What can I do with QuantumChain?", icon: Zap, category: "platform" },
    { label: "Blockchain Security", query: "How does blockchain secure quantum computations?", icon: Shield, category: "security" },
    { label: "Getting Started", query: "How do I submit my first quantum job?", icon: BookOpen, category: "tutorial" }
  ];

  // Quantum computing knowledge base
  const quantumResponses: Record<string, string> = {
    "bell states": "Bell states are maximally entangled quantum states of two qubits. The four Bell states are |Φ⁺⟩, |Φ⁻⟩, |Ψ⁺⟩, and |Ψ⁻⟩. They're fundamental in quantum teleportation, quantum cryptography, and demonstrating quantum entanglement. In QuantumChain, you can create Bell states using Hadamard and CNOT gates.",
    
    "qasm": "QASM (Quantum Assembly Language) is a low-level language for describing quantum circuits. Here's a basic Bell state example:\n\n```\nOPENQASM 2.0;\ninclude \"qelib1.inc\";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0],q[1];\nmeasure q -> c;\n```\n\nThis creates a Hadamard gate on qubit 0, then a CNOT gate between qubits 0 and 1.",
    
    "quantum algorithms": "Key quantum algorithms include:\n\n• **Shor's Algorithm**: Factors large integers exponentially faster than classical computers\n• **Grover's Algorithm**: Searches unsorted databases quadratically faster\n• **VQE**: Variational Quantum Eigensolver for chemistry simulations\n• **QAOA**: Quantum Approximate Optimization Algorithm\n• **Quantum Fourier Transform**: Used in many quantum algorithms\n\nAll of these can be implemented on QuantumChain's supported quantum computers.",
    
    "quantumchain": "QuantumChain is a revolutionary platform that combines quantum computing with blockchain security. Key features:\n\n• **Multi-Provider Access**: Google Willow, IBM Condor, Amazon Braket\n• **Blockchain Logging**: Immutable record of all quantum computations\n• **Tamper-Proof Results**: Cryptographic verification of quantum job outputs\n• **Real-time Monitoring**: Track your quantum jobs with sub-millisecond latency\n• **Gas Optimization**: Efficient blockchain transactions for quantum operations",
    
    "blockchain security": "QuantumChain uses blockchain to solve quantum computing's trust problem:\n\n1. **Immutable Logging**: Every quantum job is recorded on MegaETH blockchain\n2. **Cryptographic Hashing**: Results are SHA-256 hashed for integrity\n3. **Tamper Detection**: Any modification to results is immediately detectable\n4. **Independent Verification**: Users can verify computations through blockchain records\n5. **Audit Trail**: Complete history of all quantum operations with timestamps",
    
    "getting started": "To submit your first quantum job on QuantumChain:\n\n1. **Connect Wallet**: Use MetaMask with MegaETH Testnet\n2. **Choose Provider**: Select from Google Willow, IBM Condor, or Amazon Braket\n3. **Write Algorithm**: Use natural language or QASM code\n4. **Set Priority**: Choose execution priority (low/medium/high)\n5. **Submit Job**: Confirm blockchain transaction\n6. **Monitor Results**: Track progress in real-time\n7. **Verify on Blockchain**: Check immutable record on MegaExplorer",
    
    "superposition": "Superposition is a fundamental quantum principle where qubits exist in multiple states simultaneously until measured. Unlike classical bits (0 or 1), qubits can be in a combination of |0⟩ and |1⟩ states. This enables quantum parallelism and is created using gates like Hadamard. In QuantumChain, superposition is essential for algorithms like Grover's search.",
    
    "entanglement": "Quantum entanglement creates correlations between qubits that persist regardless of distance. When qubits are entangled, measuring one instantly affects the other. This 'spooky action at a distance' enables quantum teleportation, cryptography, and enhanced computational power. QuantumChain's Bell state circuits demonstrate entanglement perfectly.",
    
    "quantum gates": "Quantum gates are the building blocks of quantum circuits:\n\n• **Pauli Gates (X, Y, Z)**: Single-qubit rotations\n• **Hadamard (H)**: Creates superposition\n• **CNOT**: Two-qubit entangling gate\n• **Phase Gates (S, T)**: Add quantum phases\n• **Rotation Gates (RX, RY, RZ)**: Arbitrary rotations\n\nQuantumChain supports all standard gates across different quantum providers.",
    
    "quantum error correction": "Quantum Error Correction (QEC) protects quantum information from decoherence and noise. Key concepts:\n\n• **Logical Qubits**: Encoded using multiple physical qubits\n• **Syndrome Detection**: Identifies errors without destroying quantum states\n• **Surface Codes**: Most promising QEC approach\n• **Threshold Theorem**: Error rates below threshold enable fault-tolerant computing\n\nGoogle's Willow chip on QuantumChain demonstrates breakthrough QEC capabilities."
  };

  const generateResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    // Check for specific quantum computing topics
    for (const [key, response] of Object.entries(quantumResponses)) {
      if (lowerQuery.includes(key)) {
        return response;
      }
    }
    
    // General quantum computing responses
    if (lowerQuery.includes("quantum") && lowerQuery.includes("computer")) {
      return "Quantum computers use quantum mechanical phenomena like superposition and entanglement to process information. Unlike classical computers that use bits (0 or 1), quantum computers use qubits that can exist in multiple states simultaneously. This enables exponential speedups for certain problems like cryptography, optimization, and simulation.";
    }
    
    if (lowerQuery.includes("qubit")) {
      return "A qubit (quantum bit) is the basic unit of quantum information. Unlike classical bits, qubits can exist in superposition of |0⟩ and |1⟩ states. They can also be entangled with other qubits, creating powerful quantum correlations. QuantumChain provides access to systems with hundreds to thousands of qubits.";
    }
    
    if (lowerQuery.includes("decoherence")) {
      return "Decoherence is the loss of quantum properties due to environmental interference. It's the main challenge in quantum computing, causing qubits to lose their quantum states. Modern quantum computers use error correction and operate at extremely low temperatures to minimize decoherence. QuantumChain's providers use advanced techniques to maintain quantum coherence.";
    }
    
    if (lowerQuery.includes("circuit")) {
      return "Quantum circuits are sequences of quantum gates applied to qubits. They're the quantum equivalent of classical logic circuits. In QuantumChain, you can design circuits using QASM code or natural language descriptions. The platform automatically optimizes circuits for the target quantum hardware.";
    }
    
    if (lowerQuery.includes("measurement")) {
      return "Quantum measurement collapses a qubit's superposition into a definite classical state (0 or 1). The measurement outcome is probabilistic, determined by the qubit's quantum amplitudes. In QuantumChain, measurement results are automatically logged on the blockchain for verification and analysis.";
    }
    
    if (lowerQuery.includes("provider") || lowerQuery.includes("hardware")) {
      return "QuantumChain supports three major quantum computing providers:\n\n• **Google Willow**: 105 qubits with breakthrough error correction\n• **IBM Condor**: 1,121 qubits for large-scale computations\n• **Amazon Braket**: 256 qubits with multi-provider access\n\nEach provider offers unique advantages for different quantum algorithms and applications.";
    }
    
    if (lowerQuery.includes("gas") || lowerQuery.includes("fee")) {
      return "QuantumChain uses blockchain gas fees to secure quantum computations on MegaETH. Gas costs depend on:\n\n• Job complexity and execution time\n• Priority level (low/medium/high)\n• Network congestion\n• Provider selection\n\nThe platform includes gas optimization tools to minimize transaction costs while ensuring fast, secure quantum job processing.";
    }
    
    // Default response for non-quantum topics
    return "I specialize in quantum computing and QuantumChain platform questions. I can help with quantum algorithms, circuit design, QASM programming, blockchain integration, and platform features. Could you ask me something related to quantum computing or our platform?";
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
    setInputValue("");
    setIsTyping(true);

    // Simulate AI thinking time
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: generateResponse(inputValue),
        timestamp: Date.now(),
        category: 'response'
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
      content: "Chat cleared! I'm ready to help you with quantum computing questions. What would you like to know?",
      timestamp: Date.now(),
      category: 'greeting'
    }]);
  };

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
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Quantum AI Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your intelligent guide to quantum computing, algorithms, and QuantumChain platform features
        </p>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Chat Interface */}
        <div className="lg:col-span-3">
          <Card className="quantum-card h-[600px] flex flex-col">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-xl">
                    <Bot className="h-6 w-6 text-primary quantum-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Quantum AI</CardTitle>
                    <CardDescription>Specialized in quantum computing & blockchain</CardDescription>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={clearChat}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Clear
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0">
              {/* Messages */}
              <ScrollArea className="flex-1 px-6" ref={scrollAreaRef}>
                <div className="space-y-4 pb-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.type === 'bot' && (
                          <div className="p-2 bg-primary/20 rounded-full shrink-0">
                            <Bot className="h-4 w-4 text-primary" />
                          </div>
                        )}
                        
                        <div className={`max-w-[80%] p-4 rounded-2xl ${
                          message.type === 'user' 
                            ? 'bg-primary text-primary-foreground ml-auto' 
                            : 'bg-muted/50 border border-primary/10'
                        }`}>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                          <div className="text-xs opacity-60 mt-2">
                            {new Date(message.timestamp).toLocaleTimeString()}
                          </div>
                        </div>

                        {message.type === 'user' && (
                          <div className="p-2 bg-muted/50 rounded-full shrink-0">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Typing Indicator */}
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-3"
                    >
                      <div className="p-2 bg-primary/20 rounded-full">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="bg-muted/50 border border-primary/10 p-4 rounded-2xl">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                          <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              </ScrollArea>

              {/* Input Area */}
              <div className="p-6 border-t border-primary/20">
                <div className="flex gap-3">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask me about quantum computing, algorithms, or QuantumChain..."
                    className="quantum-input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isTyping}
                    className="quantum-button"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Info */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Quick Questions
              </CardTitle>
              <CardDescription>Popular quantum computing topics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {quickActions.map((action, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="outline"
                    className="w-full justify-start h-auto p-3 text-left"
                    onClick={() => handleQuickAction(action.query)}
                  >
                    <action.icon className="mr-3 h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">{action.label}</span>
                  </Button>
                </motion.div>
              ))}
            </CardContent>
          </Card>

          {/* AI Capabilities */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                    <Atom className="mr-1 h-3 w-3" />
                    Quantum Theory
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                    <Code className="mr-1 h-3 w-3" />
                    QASM Programming
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                    <Cpu className="mr-1 h-3 w-3" />
                    Algorithm Design
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                    <Shield className="mr-1 h-3 w-3" />
                    Blockchain Security
                  </Badge>
                </div>
              </div>

              <Alert className="border-primary/20 bg-primary/5">
                <Bot className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  I'm specialized in quantum computing and only answer questions related to quantum algorithms, 
                  circuit design, and QuantumChain platform features.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}