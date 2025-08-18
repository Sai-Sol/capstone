"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, AlertTriangle, Info, X, ExternalLink, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";

interface EnhancedToastProps {
  id: string;
  title: string;
  description?: string;
  type?: "success" | "error" | "info" | "warning" | "loading";
  duration?: number;
  onClose?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
  progress?: number;
  persistent?: boolean;
  severity?: "low" | "medium" | "high" | "critical";
}

export default function EnhancedToast({
  id,
  title,
  description,
  type = "info",
  duration = 5000,
  onClose,
  action,
  progress,
  persistent = false,
  severity = "medium"
}: EnhancedToastProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (persistent || type === "loading") return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 100) {
          setIsVisible(false);
          setTimeout(() => onClose?.(), 300);
          return 0;
        }
        return prev - 100;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration, onClose, persistent, type]);

  const icons = {
    success: CheckCircle,
    error: AlertTriangle,
    warning: AlertTriangle,
    info: Info,
    loading: RefreshCw
  };

  const colors = {
    success: "border-green-500/30 bg-green-500/10 text-green-400",
    error: "border-red-500/30 bg-red-500/10 text-red-400",
    warning: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
    info: "border-blue-500/30 bg-blue-500/10 text-blue-400",
    loading: "border-purple-500/30 bg-purple-500/10 text-purple-400"
  };

  const severityColors = {
    low: "border-l-blue-400",
    medium: "border-l-yellow-400",
    high: "border-l-orange-400",
    critical: "border-l-red-400"
  };

  const Icon = icons[type];
  const progressPercentage = persistent ? 100 : (timeLeft / duration) * 100;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 300, scale: 0.8 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 300, scale: 0.8 }}
      className={`p-4 rounded-xl border-2 backdrop-blur-sm shadow-2xl border-l-4 ${colors[type]} ${severityColors[severity]} min-w-[350px] max-w-[450px]`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-lg bg-current/20">
          <Icon className={`h-5 w-5 ${type === 'loading' ? 'animate-spin' : ''}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            {severity !== "medium" && (
              <Badge variant="outline" className={`text-xs ${severityColors[severity].replace('border-l-', 'border-').replace('400', '400/50 text-')}400`}>
                {severity.toUpperCase()}
              </Badge>
            )}
          </div>
          
          {description && (
            <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{description}</p>
          )}
          
          {/* Progress indicator for loading or progress-based toasts */}
          {(type === "loading" || typeof progress === "number") && (
            <div className="space-y-1 mb-3">
              <Progress 
                value={typeof progress === "number" ? progress : progressPercentage} 
                className="h-1" 
              />
              {typeof progress === "number" && (
                <div className="text-xs text-muted-foreground">
                  {progress.toFixed(0)}% complete
                </div>
              )}
            </div>
          )}
          
          {action && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 h-7 text-xs hover:bg-current/10"
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          
          {/* Auto-dismiss progress bar */}
          {!persistent && type !== "loading" && (
            <div className="mt-3">
              <div className="h-1 bg-current/20 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "100%" }}
                  animate={{ width: "0%" }}
                  transition={{ duration: duration / 1000, ease: "linear" }}
                  className="h-full bg-current/60 rounded-full"
                />
              </div>
            </div>
          )}
        </div>
        
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-60 hover:opacity-100 hover:bg-current/10"
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose(), 300);
            }}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}