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
        response: "I'm a specialized AI assistant focused exclusively on technology topics. I can help you with programming, software development, AI/ML, blockchain, cybersecurity, cloud computing, and all tech-related subjects. Please ask me a technology-related question."
  Bot, 
  Send, 
  User, 
  Atom, 
  Zap, 
    // Enhanced system prompt for technology focus
    const systemPrompt = `You are an AI assistant specialized in technology topics. You provide expert guidance on programming, software development, AI/ML, blockchain, cybersecurity, cloud computing, and related technical subjects. Keep responses informative and technically accurate.`;
  Code,
  icon: any;
  category: string;
}

export default function AIAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "Hello! I'm your QuantumChain AI assistant. I can help you with questions about quantum computing, blockchain technology, and our platform features. What would you like to know?",
      timestamp: Date.now(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    { label: "Programming Fundamentals", query: "Explain modern programming best practices and design patterns", icon: Code, category: "programming" },
    { label: "AI & Machine Learning", query: "What are the latest trends in AI and machine learning?", icon: Brain, category: "ai" },
    { label: "Cloud Architecture", query: "How do I design scalable cloud infrastructure?", icon: Cloud, category: "cloud" },
    { label: "Cybersecurity", query: "What are the essential cybersecurity practices for applications?", icon: Shield, category: "security" },
    { label: "Database Design", query: "Database optimization and design patterns", icon: Database, category: "database" },
    { label: "DevOps Practices", query: "Modern DevOps and CI/CD best practices", icon: Settings, category: "devops" }
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
      };

      setMessages(prev => [...prev, botResponse]);

    } catch (error) {
      console.error('AI API error:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: Date.now(),
        isError: true
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
    setTimeout(() => handleSendMessage(), 100);
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'bot',
      content: "Chat cleared! I'm ready to help you with QuantumChain and quantum computing questions. What would you like to know?",
      timestamp: Date.now(),
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
          QuantumChain AI Assistant
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Your intelligent guide to quantum computing, blockchain technology, and QuantumChain platform features
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
                    <CardTitle className="text-xl">QuantumChain AI</CardTitle>
                    <CardDescription>Powered by Google Gemini</CardDescription>
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
                            : message.isError
                              ? 'bg-red-500/10 border border-red-500/20'
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

                  {/* Loading Indicator */}
                  {isLoading && (
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
                    placeholder="Ask me about QuantumChain, quantum computing, or blockchain..."
                    className="quantum-input flex-1"
                    onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!inputValue.trim() || isLoading}
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
              <CardDescription>Popular QuantumChain topics</CardDescription>
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
                    disabled={isLoading}
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
                    Quantum Computing
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                    <Shield className="mr-1 h-3 w-3" />
                    Blockchain Security
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                    <Code className="mr-1 h-3 w-3" />
                    Platform Features
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-yellow-400 border-yellow-400/50">
                    <Cpu className="mr-1 h-3 w-3" />
                    Quantum Providers
                  </Badge>
                </div>
              </div>

              <Alert className="border-primary/20 bg-primary/5">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  This AI assistant is specialized for QuantumChain and only answers questions related to 
                  quantum computing, blockchain technology, and our platform features.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}