"use client";

import { motion } from "framer-motion";
import { Atom, Loader2, Brain } from "lucide-react";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  quantum?: boolean;
  ai?: boolean;
}

export default function LoadingSpinner({ 
  size = "md", 
  text = "Loading...", 
  quantum = false,
  ai = false
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8", 
    lg: "h-12 w-12"
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg"
  };

  if (ai) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-pink-500 rounded-2xl blur-xl opacity-50" />
          <div className="relative bg-gradient-to-r from-primary via-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
            <Brain className={`${sizeClasses[size]} text-white quantum-pulse`} />
          </div>
        </div>
        <p className={`${textSizes[size]} text-muted-foreground`}>{text}</p>
      </motion.div>
    );
  }
  if (quantum) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative">
          <div className="absolute inset-0 bg-primary/20 rounded-2xl blur-xl" />
          <div className="relative bg-gradient-to-br from-primary via-purple-500 to-pink-500 p-4 rounded-2xl shadow-2xl">
            <Atom className={`${sizeClasses[size]} text-white quantum-pulse`} />
          </div>
        </div>
        <p className={`${textSizes[size]} text-muted-foreground`}>{text}</p>
      </motion.div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
      <p className={`${textSizes[size]} text-muted-foreground`}>{text}</p>
    </div>
  );
}