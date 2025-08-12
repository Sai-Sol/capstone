// REMOVED: Grok AI Assistant component
// RESTORED: MegaETH Testnet Quantum Assistant

"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Send, 
  User, 
  Brain, 
  MessageSquare,
  Lightbulb,
  Atom,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  Download,
  Trash2,
  Search,
  Clock,
  Star,
  HelpCircle,
  Zap,
  Target,
  TrendingUp,
  Globe,
  Shield,
  Activity
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
  isError?: boolean;
  network?: string;
  explorer?: string;
}

interface QuickAction {
  label: string;
  query: string;
  icon: any;
  category: string;
  description: string;
}

export default function MegaETHQuantumAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "🚀 Welcome to the MegaETH Testnet Quantum Assistant! I'm here to help you understand your quantum computing results and blockchain integration.\n\n🔬 **What I Can Help With:**\n• Quantum algorithm analysis and optimization\n• MegaETH testnet transaction verification\n• Circuit fidelity improvement suggestions\n• Blockchain-quantum integration insights\n\n⚛️ **MegaETH Network Status:**\n• Network: MegaETH Testnet (Chain ID: 9000)\n• Explorer: https://www.megaexplorer.xyz\n• RPC: https://testnet.megaeth.io\n• Status: ✅ Operational\n\nExecute a quantum algorithm to get detailed analysis, or ask me about quantum computing concepts!",
      timestamp: Date.now(),
      network: "MegaETH Testnet",
      explorer: "https://www.megaexplorer.xyz"
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // RESTORED: MegaETH testnet focused quick actions
  const quickActions: QuickAction[] = [
    { 
      label: "Bell State Analysis", 
      query: "Analyze my Bell state quantum results and explain the entanglement", 
      icon: Atom, 
      category: "quantum",
      description: "Understand quantum entanglement results"
    },
    { 
      label: "Grover's Algorithm", 
      query: "Explain my Grover's search algorithm results and optimization", 
      icon: Search, 
      category: "quantum",
      description: "Quantum search algorithm analysis"
    },
    { 
      label: "Circuit Optimization", 
      query: "How can I improve my quantum circuit fidelity and reduce errors?", 
      icon: Target, 
      category: "optimization",
      description: "Improve quantum circuit performance"
    },
    { 
      label: "MegaETH Integration", 
      query: "Explain how MegaETH testnet secures my quantum computations", 
      icon: Shield, 
      category: "blockchain",
      description: "Blockchain security for quantum computing"
    },
    { 
      label: "Quantum Teleportation", 
      query: "Analyze my quantum teleportation protocol results", 
      icon: Zap, 
      category: "quantum",
      description: "Quantum information transfer analysis"
    },
    { 
      label: "Network Status", 
      query: "What's the current status of MegaETH testnet and quantum providers?", 
      icon: Globe, 
      category: "network",
      description: "Check MegaETH testnet status"
    },
    { 
      label: "Transaction Verification", 
      query: "How do I verify my quantum job transactions on MegaETH Explorer?", 
      icon: Activity, 
      category: "blockchain",
      description: "Verify blockchain transactions"
    },
    { 
      label: "Quantum Concepts", 
      query: "Explain fundamental quantum computing concepts and principles", 
      icon: Brain, 
      category: "education",
      description: "Learn quantum computing basics"
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
      // RESTORED: Use MegaETH quantum analysis instead of Grok API
      const response = await fetch('/api/grok-ai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentInput,
          context: {
            network: "MegaETH Testnet",
            explorer: "https://www.megaexplorer.xyz"
          }
        }),
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
        network: data.network,
        explorer: data.explorer
      };

      setMessages(prev => [...prev, botResponse]);

      toast({
        title: "Analysis Complete",
        description: "MegaETH quantum analysis provided!"
      });

    } catch (error: any) {
      console.error('MegaETH Analysis error:', error);
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `⚠️ MegaETH analysis temporarily unavailable. The quantum analysis system is experiencing issues.\n\n🔧 **Manual Analysis Options:**\n• Check quantum results against expected patterns\n• Verify fidelity levels (>90% is good)\n• Use MegaETH Explorer for transaction verification\n• Compare with theoretical algorithm predictions\n\n🌐 **MegaETH Testnet Status:**\n• Network: Operational\n• Explorer: https://www.megaexplorer.xyz\n• RPC: https://testnet.megaeth.io`,
        timestamp: Date.now(),
        isError: true,
        network: "MegaETH Testnet"
      };

      setMessages(prev => [...prev, errorResponse]);
      
      toast({
        variant: "destructive",
        title: "Analysis Service Error",
        description: "MegaETH analysis temporarily unavailable"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (query: string) => {
    setInputValue(query);
    setTimeout(() => handleSendMessage(), 100);
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: "🔄 Chat cleared! I'm ready to help you with MegaETH testnet quantum analysis and blockchain integration. What would you like to explore?",
      timestamp: Date.now(),
      network: "MegaETH Testnet"
    }]);
    
    toast({
      title: "Chat Cleared",
      description: "Ready for new MegaETH quantum analysis"
    });
  };

  const exportChat = () => {
    const chatData = {
      messages: messages,
      timestamp: new Date().toISOString(),
      totalMessages: messages.length,
      network: "MegaETH Testnet",
      platform: "QuantumChain"
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `megaeth-quantum-analysis-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Analysis Exported",
      description: "MegaETH quantum analysis exported successfully"
    });
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
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50" />
            <div className="relative bg-gradient-to-r from-primary via-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
              <Atom className="h-12 w-12 text-white quantum-pulse" />
            </div>
          </div>
        </div>
        <h1 className="text-5xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 neon-text">
          MegaETH Quantum Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Advanced quantum computing analysis powered by MegaETH testnet blockchain integration
        </p>
        <div className="flex items-center justify-center gap-6 mt-6">
          <Badge variant="outline" className="text-blue-400 border-blue-400/50 px-4 py-2">
            <Globe className="mr-2 h-4 w-4" />
            MegaETH Testnet
          </Badge>
          <Badge variant="outline" className="text-green-400 border-green-400/50 px-4 py-2">
            <Shield className="mr-2 h-4 w-4" />
            Blockchain Secured
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-400/50 px-4 py-2">
            <Atom className="mr-2 h-4 w-4" />
            Quantum Ready
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
                    <CardTitle className="text-2xl font-headline">MegaETH Quantum Assistant</CardTitle>
                    <CardDescription className="text-base">
                      Quantum analysis powered by MegaETH testnet blockchain
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                    <Activity className="mr-1 h-3 w-3" />
                    MegaETH Online
                  </Badge>
                  <Button variant="outline" size="sm" onClick={exportChat}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearChat}>
                    <Trash2 className="mr-2 h-4 w-4" />
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
                            : message.isError
                              ? 'bg-gradient-to-r from-red-500/10 to-red-600/5 border border-red-500/20 rounded-2xl rounded-bl-md'
                              : 'bg-gradient-to-r from-muted/60 to-muted/40 border border-primary/10 rounded-2xl rounded-bl-md'
                        } p-5 shadow-lg`}>
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.content}
                          </div>
                          
                          {/* Message metadata for bot responses */}
                          {message.type === 'bot' && !message.isError && (
                            <div className="flex items-center justify-between mt-4 pt-3 border-t border-primary/10">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">
                                  <Globe className="mr-1 h-3 w-3" />
                                  {message.network || "MegaETH Testnet"}
                                </Badge>
                                {message.explorer && (
                                  <Button variant="ghost" size="sm" asChild>
                                    <a href={message.explorer} target="_blank" rel="noopener noreferrer">
                                      <span className="text-xs">Explorer</span>
                                    </a>
                                  </Button>
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
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-sm text-muted-foreground">Analyzing on MegaETH...</span>
                          <Atom className="h-4 w-4 text-primary animate-pulse" />
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
                          {search.length > 25 ? `${search.slice(0, 25)}...` : search}
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
                        placeholder="Ask about quantum results, MegaETH integration, or quantum concepts..."
                        className="quantum-input pl-10 h-12 text-base"
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        disabled={isLoading}
                        maxLength={2000}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {inputValue.length}/2000
                      </div>
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
          {/* Quick Actions */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Quantum Analysis Topics
              </CardTitle>
              <CardDescription>Click any topic for MegaETH-powered analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {quickActions.map((action, index) => (
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

          {/* MegaETH Network Status */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                MegaETH Network
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Testnet operational</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Sub-second finality</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span>Quantum job logging</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                <span>Immutable verification</span>
              </div>
            </CardContent>
          </Card>

          {/* Session Stats */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
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
                <span className="text-muted-foreground">Network:</span>
                <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                  MegaETH
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Analysis:</span>
                <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                  Quantum
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant="outline" className="text-green-400 border-green-400/50">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse" />
                  Online
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* MegaETH Integration Info */}
          <Card className="quantum-card border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <Shield className="h-5 w-5" />
                Blockchain Integration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                  <span>All quantum jobs are immutably logged on MegaETH testnet</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                  <span>Transactions verified on blockchain explorer</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                  <span>Tamper-proof quantum computation records</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                  <span>Real-time network status and gas optimization</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}