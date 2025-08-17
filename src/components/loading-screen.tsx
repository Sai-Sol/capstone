"use client";

import { motion } from "framer-motion";
import { Atom, Loader2 } from "lucide-react";

interface LoadingScreenProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
}

export default function LoadingScreen({ 
  message = "Loading...", 
  showProgress = false, 
  progress = 0 
}: LoadingScreenProps) {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-6 rounded-2xl shadow-2xl">
            <Atom className="h-16 w-16 text-white quantum-pulse mx-auto" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold font-headline bg-gradient-to-r from-primary via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          QuantumChain
        </h1>
        
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">{message}</p>
        </div>

        {showProgress && (
          <div className="w-64 mx-auto">
            <div className="h-2 bg-muted/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
                className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full"
              />
            </div>
            <p className="text-sm text-muted-foreground mt-2">{progress}% complete</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}