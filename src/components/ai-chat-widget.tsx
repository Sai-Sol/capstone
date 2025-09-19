"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Brain, 
  MessageSquare, 
  X, 
  Send, 
  Minimize2,
  Maximize2,
  Sparkles,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AIChatWidgetProps {
  isOpen: boolean;
  onToggle: () => void;
  initialMessage?: string;
}

export default function AIChatWidget({ isOpen, onToggle, initialMessage }: AIChatWidgetProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Array<{
    id: string;
    type: 'user' | 'ai';
    content: string;
    timestamp: number;
  }>>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (initialMessage && isOpen) {
      sendMessage(initialMessage);
    }
  }, [initialMessage, isOpen]);

  const sendMessage = async (messageText?: string) => {
    const text = messageText || inputMessage.trim();
    if (!text || isLoading) return;

    const userMessage = {
      id: `user_${Date.now()}`,
      type: 'user' as const,
      content: text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      if (!response.ok) {
        throw new Error('AI service unavailable');
      }

      const aiResponse = await response.json();
      
      const aiMessage = {
        id: `ai_${Date.now()}`,
        type: 'ai' as const,
        content: aiResponse.answer,
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (error: any) {
      const errorMessage = {
        id: `error_${Date.now()}`,
        type: 'ai' as const,
        content: "🤖 I'm temporarily unavailable. Please try the main AI Assistant page for full functionality!",
        timestamp: Date.now()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="fixed bottom-6 right-6 z-50"
      >
        <Button
          onClick={onToggle}
          className="quantum-button rounded-full w-14 h-14 shadow-2xl"
        >
          <Brain className="h-6 w-6" />
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      className="fixed bottom-6 right-6 z-50 w-96"
    >
      <Card className="quantum-card shadow-2xl border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Brain className="h-5 w-5 text-primary" />
              SpikingBrain AI
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="sm" onClick={onToggle}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-400 border-green-400/50">
              <Sparkles className="mr-1 h-3 w-3" />
              Online
            </Badge>
            <span className="text-xs text-muted-foreground">Quantum Computing Specialist</span>
          </div>
        </CardHeader>

        <AnimatePresence>
          {!isMinimized && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <CardContent className="space-y-4">
                {/* Messages */}
                <div className="h-64 overflow-y-auto space-y-3 p-2">
                  {messages.length === 0 && (
                    <div className="text-center text-muted-foreground text-sm">
                      <Brain className="h-8 w-8 mx-auto mb-2 text-primary" />
                      Ask me about quantum computing!
                    </div>
                  )}
                  
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {message.type === 'ai' && (
                        <div className="p-1 bg-primary/20 rounded-lg">
                          <Brain className="h-4 w-4 text-primary" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] p-3 rounded-lg text-sm ${
                        message.type === 'user' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted/50 border border-primary/20'
                      }`}>
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs opacity-60 mt-1">
                          {new Date(message.timestamp).toLocaleTimeString()}
                        </div>
                      </div>

                      {message.type === 'user' && (
                        <div className="p-1 bg-blue-500/20 rounded-lg">
                          <MessageSquare className="h-4 w-4 text-blue-400" />
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex gap-2">
                      <div className="p-1 bg-primary/20 rounded-lg">
                        <Brain className="h-4 w-4 text-primary animate-pulse" />
                      </div>
                      <div className="bg-muted/50 border border-primary/20 p-3 rounded-lg">
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span className="text-xs">Thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Ask about quantum computing..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    className="quantum-input text-sm"
                    disabled={isLoading}
                  />
                  <Button 
                    onClick={() => sendMessage()} 
                    disabled={!inputMessage.trim() || isLoading}
                    size="sm"
                    className="quantum-button"
                  >
                    <Send className="h-3 w-3" />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendMessage('Explain quantum superposition')}
                    className="text-xs"
                  >
                    Superposition
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendMessage('How do Bell states work?')}
                    className="text-xs"
                  >
                    Bell States
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => sendMessage('Compare quantum providers')}
                    className="text-xs"
                  >
                    Providers
                  </Button>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}