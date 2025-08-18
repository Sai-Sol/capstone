"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface EnhancedProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  animated?: boolean;
  color?: "primary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  striped?: boolean;
}

export default function EnhancedProgress({
  value,
  max = 100,
  className,
  showPercentage = false,
  animated = true,
  color = "primary",
  size = "md",
  striped = false
}: EnhancedProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  
  const colorClasses = {
    primary: "bg-primary",
    success: "bg-green-500",
    warning: "bg-yellow-500",
    error: "bg-red-500"
  };
  
  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };
  
  const backgroundColorClasses = {
    primary: "bg-primary/20",
    success: "bg-green-500/20",
    warning: "bg-yellow-500/20",
    error: "bg-red-500/20"
  };

  return (
    <div className={cn("relative w-full overflow-hidden rounded-full", backgroundColorClasses[color], sizeClasses[size], className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ 
          duration: animated ? 0.8 : 0,
          ease: "easeOut"
        }}
        className={cn(
          "h-full rounded-full transition-all duration-300",
          colorClasses[color],
          striped && "bg-gradient-to-r from-current via-transparent to-current bg-[length:20px_20px] animate-pulse"
        )}
      />
      
      {showPercentage && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-medium text-white mix-blend-difference">
            {percentage.toFixed(0)}%
          </span>
        </div>
      )}
    </div>
  );
}