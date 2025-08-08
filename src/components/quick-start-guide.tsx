"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useWallet } from "@/hooks/use-wallet";
import { useAuth } from "@/hooks/use-auth";
import { 
  Wallet, 
  Terminal, 
  CheckCircle, 
  ArrowRight, 
  Zap,
  X,
  Lightbulb
} from "lucide-react";

export default function QuickStartGuide() {
  const { isConnected } = useWallet();
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      id: 1,
      title: "Connect Wallet",
      description: "Connect your MetaMask wallet to access the quantum network",
      completed: isConnected,
      action: "Connect in top-right corner",
      icon: Wallet
    },
    {
      id: 2,
      title: "Submit Quantum Job",
      description: "Create your first quantum computation",
      completed: false, // This would be checked against actual job submissions
      action: "Go to Quantum Lab",
      icon: Terminal
    },
    {
      id: 3,
      title: "Explore Features",
      description: "Discover blockchain tools and AI assistant",
      completed: false,
      action: "Visit Blockchain Hub",
      icon: Zap
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progress = (completedSteps / steps.length) * 100;

  if (!isVisible || completedSteps === steps.length) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-8"
      >
        <Card className="quantum-card border-primary/30 bg-gradient-to-r from-primary/5 to-purple-500/5">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/20 rounded-lg">
                  <Lightbulb className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">Quick Start Guide</CardTitle>
                  <CardDescription>Get started with QuantumChain in 3 steps</CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsVisible(false)}
                className="h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Progress</span>
                <span className="text-primary font-medium">{completedSteps}/{steps.length} completed</span>
              </div>
              <div className="w-full bg-muted/30 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="space-y-3">
              {steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-center gap-4 p-3 rounded-lg border transition-all ${
                    step.completed 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-muted/20 border-primary/10 hover:bg-muted/30'
                  }`}
                >
                  <div className={`p-2 rounded-full ${
                    step.completed ? 'bg-green-500/20' : 'bg-primary/20'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-4 w-4 text-green-400" />
                    ) : (
                      <step.icon className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{step.title}</h4>
                      {step.completed && (
                        <Badge variant="outline" className="text-green-400 border-green-400/50 text-xs">
                          Complete
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{step.description}</p>
                    {!step.completed && (
                      <p className="text-xs text-primary mt-1">{step.action}</p>
                    )}
                  </div>
                  
                  {!step.completed && (
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}