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
  Briefcase,
  FileText,
  Users,
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
  TrendingUp
} from "lucide-react";

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: number;
  isError?: boolean;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

interface QuickAction {
  label: string;
  query: string;
  icon: any;
  category: string;
  description: string;
}

export default function GrokAIAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'bot',
      content: "👋 Hello! I'm your AI assistant powered by Grok. I'm here to help you with:\n\n🎯 **Career & Job Search**\n• Resume writing and optimization\n• Interview preparation and tips\n• Job search strategies\n• Career path guidance\n\n💼 **Professional Development**\n• Skill development recommendations\n• Industry insights and trends\n• Networking strategies\n• Salary negotiation advice\n\n🤝 **General Support**\n• Answer questions on any topic\n• Provide research and information\n• Help with problem-solving\n• Offer guidance and recommendations\n\nWhat can I help you with today?",
      timestamp: Date.now(),
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [totalTokensUsed, setTotalTokensUsed] = useState(0);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const quickActions: QuickAction[] = [
    { 
      label: "Resume Review", 
      query: "Can you help me improve my resume? What are the key elements of a strong resume in 2025?", 
      icon: FileText, 
      category: "career",
      description: "Get expert resume writing advice"
    },
    { 
      label: "Interview Prep", 
      query: "I have a job interview coming up. Can you help me prepare with common questions and best practices?", 
      icon: Users, 
      category: "career",
      description: "Prepare for your next interview"
    },
    { 
      label: "Job Search Strategy", 
      query: "What's the most effective job search strategy in today's market? How can I stand out to employers?", 
      icon: Target, 
      category: "career",
      description: "Optimize your job search approach"
    },
    { 
      label: "Career Path Guidance", 
      query: "I'm considering a career change. How do I evaluate different career paths and make the right decision?", 
      icon: TrendingUp, 
      category: "career",
      description: "Explore career opportunities"
    },
    { 
      label: "Skill Development", 
      query: "What skills should I focus on developing to advance my career in the current job market?", 
      icon: Brain, 
      category: "development",
      description: "Identify key skills to learn"
    },
    { 
      label: "Salary Negotiation", 
      query: "How do I negotiate salary effectively? What research should I do and what strategies work best?", 
      icon: Briefcase, 
      category: "career",
      description: "Master salary negotiation"
    },
    { 
      label: "Industry Insights", 
      query: "What are the current trends and opportunities in the tech industry? Which areas are growing fastest?", 
      icon: Lightbulb, 
      category: "insights",
      description: "Stay updated on industry trends"
    },
    { 
      label: "General Question", 
      query: "I have a question about...", 
      icon: HelpCircle, 
      category: "general",
      description: "Ask anything you need help with"
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
      // Prepare conversation context (last 10 messages)
      const conversationContext = messages.slice(-10).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      const response = await fetch('/api/grok', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: currentInput,
          conversation: conversationContext
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP ${response.status}`);
      }

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: data.response,
        timestamp: Date.now(),
        usage: data.usage
      };

      setMessages(prev => [...prev, botResponse]);

      // Update token usage
      if (data.usage) {
        setTotalTokensUsed(prev => prev + data.usage.total_tokens);
      }

      // Success feedback
      toast({
        title: "Response Generated",
        description: "Grok AI has provided a helpful response!"
      });

    } catch (error: any) {
      console.error('Grok AI error:', error);
      
      let errorMessage = "I'm experiencing technical difficulties. Please try again.";
      
      if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
        errorMessage = "I'm receiving too many requests. Please wait a moment before trying again.";
      } else if (error.message.includes('authentication')) {
        errorMessage = "There's an authentication issue with the AI service. Please contact support.";
      } else if (error.message.includes('network')) {
        errorMessage = "Network connection issue. Please check your internet and try again.";
      }
      
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: `⚠️ ${errorMessage}\n\nYou can try:\n• Rephrasing your question\n• Waiting a moment and trying again\n• Checking your internet connection`,
        timestamp: Date.now(),
        isError: true
      };

      setMessages(prev => [...prev, errorResponse]);
      
      toast({
        variant: "destructive",
        title: "AI Service Error",
        description: errorMessage
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
      content: "🔄 Chat cleared! I'm ready to help you with career guidance, job search assistance, or any questions you have. What would you like to explore?",
      timestamp: Date.now(),
    }]);
    setTotalTokensUsed(0);
    
    toast({
      title: "Chat Cleared",
      description: "Conversation history has been reset."
    });
  };

  const exportChat = () => {
    const chatData = {
      messages: messages,
      timestamp: new Date().toISOString(),
      totalMessages: messages.length,
      totalTokensUsed: totalTokensUsed
    };
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `grok-ai-chat-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Chat Exported",
      description: "Your conversation has been exported successfully."
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
              <Brain className="h-12 w-12 text-white quantum-pulse" />
            </div>
          </div>
        </div>
        <h1 className="text-5xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4 neon-text">
          Grok AI Assistant
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
          Your intelligent career companion powered by Grok AI - get expert guidance on job search, career development, and professional growth
        </p>
        <div className="flex items-center justify-center gap-6 mt-6">
          <Badge variant="outline" className="text-blue-400 border-blue-400/50 px-4 py-2">
            <Sparkles className="mr-2 h-4 w-4" />
            Powered by Grok
          </Badge>
          <Badge variant="outline" className="text-green-400 border-green-400/50 px-4 py-2">
            <Zap className="mr-2 h-4 w-4" />
            Real-time Responses
          </Badge>
          <Badge variant="outline" className="text-purple-400 border-purple-400/50 px-4 py-2">
            <Target className="mr-2 h-4 w-4" />
            Career Focused
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
                    <CardTitle className="text-2xl font-headline">Grok AI Assistant</CardTitle>
                    <CardDescription className="text-base">
                      Career guidance and professional development support
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-green-400 border-green-400/50">
                    <Clock className="mr-1 h-3 w-3" />
                    {totalTokensUsed.toLocaleString()} tokens
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
                                  <Brain className="mr-1 h-3 w-3" />
                                  Grok AI
                                </Badge>
                                {message.usage && (
                                  <Badge variant="outline" className="text-xs">
                                    {message.usage.total_tokens} tokens
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
                        <div className="flex items-center gap-3">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                          <span className="text-sm text-muted-foreground">Grok is thinking...</span>
                          <Brain className="h-4 w-4 text-primary animate-pulse" />
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
                        placeholder="Ask about career advice, job search, interview prep, or anything else..."
                        className="quantum-input pl-10 h-12 text-base"
                        onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                        disabled={isLoading}
                        maxLength={4000}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {inputValue.length}/4000
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
                Quick Start Topics
              </CardTitle>
              <CardDescription>Click any topic to get expert guidance</CardDescription>
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

          {/* AI Features */}
          <Card className="quantum-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Grok AI Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Real-time responses</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                <span>Career expertise</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
                <span>Contextual conversations</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-pink-400 rounded-full animate-pulse" />
                <span>Professional guidance</span>
              </div>
            </CardContent>
          </Card>

          {/* Usage Stats */}
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
                <span className="text-muted-foreground">Tokens Used:</span>
                <Badge variant="outline" className="text-blue-400 border-blue-400/50">
                  {totalTokensUsed.toLocaleString()}
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">AI Model:</span>
                <Badge variant="outline" className="text-purple-400 border-purple-400/50">
                  Grok Beta
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

          {/* Help & Tips */}
          <Card className="quantum-card border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-400">
                <HelpCircle className="h-5 w-5" />
                Tips for Better Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                  <span>Be specific about your career goals and current situation</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                  <span>Ask follow-up questions to dive deeper into topics</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                  <span>Share context about your industry or experience level</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 shrink-0" />
                  <span>Use the quick topics to get started with common questions</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}