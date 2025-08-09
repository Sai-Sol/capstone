"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Send, 
  User, 
  Brain, 
  MessageSquare,
  Lightbulb,
  Code,
  Atom,
  Shield,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Database,
  Globe,
  Smartphone,
  Monitor,
  Cloud,
  Lock,
  BarChart3,
  Settings,
  Search,
  Download,
  Zap
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

export default function AdvancedAIAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your advanced AI assistant specialized in technology. I can help you with quantum computing, blockchain development, AI/ML, cybersecurity, cloud computing, and all technical topics. Click on any topic below or ask me anything!",
      timestamp: Date.now(),
      category: 'greeting',
      confidence: 100
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [showQuickTopics, setShowQuickTopics] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    { 
      label: "Quantum Computing", 
      query: "Explain quantum computing principles, algorithms, and current hardware", 
      icon: Atom, 
      category: "quantum",
      description: "Qubits, superposition, quantum algorithms"
    },
    { 
      label: "Blockchain Development", 
      query: "How do I develop smart contracts and DApps with Solidity?", 
      icon: Code, 
      category: "blockchain",
      description: "Smart contracts, Web3, DeFi protocols"
    },
    { 
      label: "AI & Machine Learning", 
      query: "What are the latest trends in AI and machine learning?", 
      icon: Brain, 
      category: "ai",
      description: "Neural networks, LLMs, deep learning"
    },
    { 
      label: "Cloud Architecture", 
      query: "Design scalable cloud infrastructure and microservices", 
      icon: Cloud, 
      category: "cloud",
      description: "AWS, Azure, GCP, containers"
    },
    { 
      label: "Cybersecurity", 
      query: "Best practices for application security and threat prevention", 
      icon: Shield, 
      category: "security",
      description: "Security, encryption, vulnerability assessment"
    },
    { 
      label: "Web Development", 
      query: "Modern web development with React, Next.js, and TypeScript", 
      icon: Monitor, 
      category: "web",
      description: "Frontend, backend, full-stack development"
    },
    { 
      label: "DevOps & Infrastructure", 
      query: "DevOps best practices, CI/CD, and infrastructure automation", 
      icon: Settings, 
      category: "devops",
      description: "Docker, Kubernetes, automation"
    },
    { 
      label: "Database Design", 
      query: "Database architecture, optimization, and design patterns", 
      icon: Database, 
      category: "database",
      description: "SQL, NoSQL, performance tuning"
    }
  ];

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setSearchHistory(prev => [inputValue, ...prev.slice(0, 9)]);
    const currentInput = inputValue;
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: Date.now(),
        confidence: data.confidence || 90,
        sources: data.sources || ["AI Knowledge Base"]
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error('AI API error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I encountered an error processing your request. Please ensure your question is technology-related and try again.",
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        variant: "destructive",
        title: "AI Error",
        description: "Failed to get AI response. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setInputValue(query);
    setShowQuickTopics(false);
    setTimeout(() => handleSendMessage(), 100);
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: "Chat cleared! I'm ready to help you with any technology-related questions. Click on any topic below or ask me anything!",
      timestamp: Date.now(),
      category: 'greeting',
      confidence: 100
    }]);
    setShowQuickTopics(true);
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
    a.download = `quantum-ai-chat-${Date.now()}.json`;
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
          Quantum AI Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Your expert AI companion for quantum computing, blockchain, and advanced technology
        </p>
        <div className="flex items-center justify-center gap-6 mt-6">
          <Badge variant="outline" className="text-blue-400 border-blue-400/50 px-4 py-2">
            <Sparkles className="mr-2 h-4 w-4" />
            RAG-Enhanced
          </Badge>
          <Badge variant="outline" className="text-green-400 border-green-400/50 px-4 py-2">
            <Shield className="mr-2 h-4 w-4" />
            Tech Specialized
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-400/50 px-4 py-2">
            <Zap className="mr-2 h-4 w-4" />
            Context-Aware
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
                    <CardTitle className="text-2xl font-headline">Quantum AI Assistant</CardTitle>
                    <CardDescription className="text-base">
                      RAG-enhanced AI specialized in quantum computing and technology
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
                  {isLoading && (
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
                        placeholder="Ask about quantum computing, blockchain, AI, programming..."
                        className="quantum-input pl-10 h-12 text-base"
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        disabled={isLoading}
                      />
                    </div>
                    <Button 
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
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
          {/* Quick Topics - Always Visible */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Technology Topics
              </CardTitle>
              <CardDescription>Click any topic to get expert guidance</CardDescription>
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
                  <SelectItem value="web">Web Development</SelectItem>
                  <SelectItem value="devops">DevOps</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredActions.map((action, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Button
                      variant="outline"
                      className="w-full justify-start h-auto p-4 text-left hover:bg-primary/10 hover:border-primary/40 transition-all duration-300 group"
                      onClick={() => handleQuickAction(action.query)}
                      disabled={isLoading}
                    >
                      <div className="flex items-start gap-3 w-full">
                        <action.icon className="h-5 w-5 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
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

          {/* Advanced Features */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Real-time responses</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Context-aware conversations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span>Technical expertise</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                <span>Code examples & solutions</span>
              </div>
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
                  I specialize exclusively in technology topics including programming, quantum computing, 
                  blockchain, AI/ML, cybersecurity, cloud computing, and software development. 
                  This focus ensures the highest quality technical assistance.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Session Stats */}
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
                <Badge variant="outline" className="text-primary border-primary/50">
                  {messages.length}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Response:</span>
                <Badge variant="outline" className="text-green-400 border-green-400/50">
                  &lt; 2s
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tech Focus:</span>
                <Badge variant="outline" className="text-green-400 border-green-400/50">
                  100%
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Confidence:</span>
                <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                  95%+
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}